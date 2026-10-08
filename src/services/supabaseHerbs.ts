// Supabase Herbs Integration Service - Pure TTMT Direct Connection with Clinical Intelligence
// Database: herbs_database_1 (สมุนไพรเดี่ยว), herbs_database_2 (สมุนไพรตำรับยา)
// Source: บัญชีข้อมูลยาและรหัสยามาตรฐานไทยสำหรับยาแผนไทย Traditional Thai Medicines Terminology (TTMT) สำนักพัฒนามาตรฐานระบบข้อมูลสุขภาพไทย

const SUPABASE_URL = 'https://vwueyfmqutuajcgstdrd.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'sb_publishable_6n21DWSLbyB59eTSJE60KQ_2w8lQRBM';

export interface HerbItemRecord {
  number?: number | string;
  name: string;
  indication?: string;
  streng?: string;
  formula?: string;
  manufactoring?: string;
  reg?: string;
  date?: string;
  weight?: string;
  TTMTID?: string | number;
  matchedKeywords?: string[];
}

export interface MatchedHerbsResult {
  singleHerbs: HerbItemRecord[];
  recipeHerbs: HerbItemRecord[];
  matchedKeywordsList: string[];
  totalMatched: number;
}

// Set of external preparations that should not be used for internal systemic complaints
const EXTERNAL_FORMS = new Set([
  'เจล', 'ครีม', 'ขี้ผึ้ง', 'โลชั่น', 'ยาประคบ', 'ยาเข้าน้ำมัน', 'ทิงเจอร์'
]);

// Clean string from corrupt unicode replacement characters (e.g. \uFFFD showing as )
export function cleanText(str: string): string {
  if (!str) return '';
  return str
    .replace(/\uFFFD/g, '') // remove unicode replacement character
    .replace(/[\x00-\x1F\x7F]/g, '') // remove invisible control characters
    .trim();
}

// Clean and normalize formula strings
export function cleanFormula(raw: string): string {
  let f = cleanText(raw);
  // Restore corrupt truncated Thai formula names caused by legacy encoding conversions
  if (f === 'ยาช') return 'ยาชง';
  if (f === 'ยาแ') return 'ยาแคปซูล';
  if (f === 'ยาผ') return 'ยาผง';
  return f;
}

// 1. Extract strictly specific symptom words from the user's current symptoms
export function extractSymptomKeywords(symptoms: string[], element: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ'): string[] {
  const combined = (symptoms || []).join(' ');
  const keywordsSet = new Set<string>();

  // Known clinical symptom keywords in Thai traditional medicine
  const knownSymptoms = [
    'ท้องอืด', 'ท้องเฟ้อ', 'แน่นท้อง', 'แน่น', 'จุกเสียด', 'คลื่นไส้', 'อาเจียน', 'วิงเวียน', 'ผายลม',
    'ไข้', 'ตัวร้อน', 'ร้อนใน', 'เจ็บคอ', 'กระหายน้ำ',
    'ไอ', 'เสมหะ', 'หวัด', 'คัดจมูก', 'น้ำมูก', 'ชุ่มคอ',
    'ท้องผูก', 'เมื่อยล้า', 'อ่อนเพลีย', 'ปวดเมื่อย'
  ];

  for (const s of knownSymptoms) {
    if (combined.includes(s)) {
      keywordsSet.add(s);
    }
  }

  // Also extract any words of length >= 2 from symptoms
  const rawWords = combined
    .replace(/[(),.\/]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 2 && !['กำเริบ', 'หย่อน', 'พิการ', 'ธาตุ', 'อาการ', 'ปัจจุบัน', 'เสียสมดุล', 'พบ', 'มี', 'โรค'].includes(w));

  for (const w of rawWords) {
    keywordsSet.add(w);
  }

  // Fallback to primary symptom if no symptom keyword matched
  if (keywordsSet.size === 0) {
    if (element === 'ลม') keywordsSet.add('ท้องอืด');
    else if (element === 'ไฟ') keywordsSet.add('ไข้');
    else if (element === 'น้ำ') keywordsSet.add('เสมหะ');
    else keywordsSet.add('ท้องผูก');
  }

  return Array.from(keywordsSet);
}

// 2. Clinical Evaluation Filter: Evaluates whether an herb item is clinically suitable for the symptom
function evaluateClinicalSuitability(
  name: string,
  rawFormula: string,
  rawIndication: string,
  symptomKeywords: string[],
  element: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ'
): { suitable: boolean; matchedKeywords: string[]; cleanFormulas: string[] } {
  const cleanName = cleanText(name);
  const ind = cleanText(rawIndication);
  
  // Extract and clean all sub-formulas
  const formulaTokens = rawFormula
    ? rawFormula.split(/[\/,]+/).map(f => cleanFormula(f)).filter(Boolean)
    : [];
  const uniqueFormulas = Array.from(new Set(formulaTokens));
  const isOnlyExternal = uniqueFormulas.length > 0 && uniqueFormulas.every(f => EXTERNAL_FORMS.has(f));

  // A. Internal vs External route rule:
  // If user has internal symptoms (respiratory, GI, fever, constipation), reject herbs that ONLY have external topical formulas
  const isInternalSymptom = symptomKeywords.some(k =>
    ['ท้องอืด', 'ท้องเฟ้อ', 'แน่นท้อง', 'แน่น', 'จุกเสียด', 'ไข้', 'ตัวร้อน', 'ร้อนใน', 'ไอ', 'เสมหะ', 'หวัด', 'น้ำมูก', 'ท้องผูก'].includes(k)
  );
  if (isInternalSymptom && isOnlyExternal) {
    // E.g. Chili cream/gel for cold, or Plai cream for stomach gas -> REJECT
    return { suitable: false, matchedKeywords: [], cleanFormulas: [] };
  }

  // B. Sputum / Mucus anatomical context rule (ศอเสมหะ vs อุระเสมหะ vs คูถเสมหะ):
  // If the symptom relates to respiratory phlegm/cough, reject medicines targeting bowel mucus (คูถเสมหะ) or hemorrhoids (ริดสีดวง)
  const isRespiratorySymptom = symptomKeywords.some(k => ['ไอ', 'เสมหะ', 'หวัด', 'น้ำมูก'].includes(k));
  if (isRespiratorySymptom) {
    const isHemorrhoidOrColonMucus = ind.includes('คูถเสมหะ') || ind.includes('ริดสีดวง') || cleanName.includes('ริดสีดวง');
    if (isHemorrhoidOrColonMucus) {
      // Allow only if it genuinely contains respiratory keywords (ศอเสมหะ, อุระเสมหะ, ไอ, แก้ไอ, ขับเสมหะ, คอ)
      const hasGenuineRespiratoryIndication = ['ศอเสมหะ', 'อุระเสมหะ', 'ไอ', 'แก้ไอ', 'ขับเสมหะ', 'เจ็บคอ'].some(r => ind.includes(r));
      if (!hasGenuineRespiratoryIndication) {
        return { suitable: false, matchedKeywords: [], cleanFormulas: [] };
      }
    }
  }

  // C. Match specific keywords
  const matched: string[] = [];
  for (const kw of symptomKeywords) {
    if (kw === 'เสมหะ') {
      if (ind.includes('ศอเสมหะ')) {
        matched.push('ศอเสมหะ (เสมหะในคอ)');
      } else if (ind.includes('อุระเสมหะ')) {
        matched.push('อุระเสมหะ (เสมหะในทรวงอก)');
      } else if (ind.includes('เสมหะ') && !ind.includes('คูถเสมหะ')) {
        matched.push('เสมหะ');
      }
    } else if (kw === 'หวัด') {
      if ((ind.includes('หวัด') || ind.includes('คัดจมูก')) && !isOnlyExternal) {
        matched.push('หวัด');
      }
    } else if (ind.includes(kw)) {
      matched.push(kw);
    }
  }

  if (matched.length === 0) {
    return { suitable: false, matchedKeywords: [], cleanFormulas: [] };
  }

  return {
    suitable: true,
    matchedKeywords: Array.from(new Set(matched)),
    cleanFormulas: uniqueFormulas
  };
}

// 3. Group herbs by clean herb name and merge all unique formulas into a single " / " separated string
function groupHerbsByName(
  items: HerbItemRecord[],
  symptomKeywords: string[],
  element: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ'
): HerbItemRecord[] {
  const byName = new Map<string, { item: HerbItemRecord; formulas: Set<string>; matchedKeywords: Set<string> }>();

  for (const item of items) {
    const cleanName = cleanText(item.name);
    if (!cleanName) continue;
    const rawFormula = cleanText(item.formula || '');
    const cleanIndication = cleanText(item.indication || '');

    const evaluation = evaluateClinicalSuitability(
      cleanName,
      rawFormula,
      cleanIndication,
      symptomKeywords,
      element
    );

    if (!evaluation.suitable) continue;

    const key = cleanName.toLowerCase();

    if (byName.has(key)) {
      const existing = byName.get(key)!;
      // Merge unique formulas
      evaluation.cleanFormulas.forEach(f => existing.formulas.add(f));
      // Merge matched keywords
      evaluation.matchedKeywords.forEach(k => existing.matchedKeywords.add(k));
      // Keep the most descriptive / longer indication text
      if (cleanIndication.length > (existing.item.indication || '').length) {
        existing.item.indication = cleanIndication;
      }
    } else {
      const formulas = new Set<string>(evaluation.cleanFormulas);
      const matchedSet = new Set<string>(evaluation.matchedKeywords);

      byName.set(key, {
        item: {
          ...item,
          name: cleanName,
          indication: cleanIndication || 'ไม่มีระบุข้อบ่งใช้'
        },
        formulas,
        matchedKeywords: matchedSet
      });
    }
  }

  return Array.from(byName.values()).map(({ item, formulas, matchedKeywords }) => ({
    ...item,
    formula: formulas.size > 0 ? Array.from(formulas).sort().join(' / ') : 'ไม่ระบุรูปแบบ',
    matchedKeywords: Array.from(matchedKeywords)
  }));
}

// 4. Main fetch function - Strict Symptom-to-Indication Matching with Clinical Intelligence
export async function fetchMatchedHerbs(
  element: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ',
  symptoms: string[]
): Promise<MatchedHerbsResult> {
  const symptomKeywords = extractSymptomKeywords(symptoms, element);

  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
  };

  let singleHerbs: HerbItemRecord[] = [];
  let recipeHerbs: HerbItemRecord[] = [];

  // Build PostgREST OR filter matching any of the active symptom keywords
  const filterTerms = symptomKeywords.slice(0, 8).map(k => `indication.ilike.*${encodeURIComponent(k)}*`).join(',');

  try {
    // 1. Fetch Single Herbs (herbs_database_1) & 2. Fetch Recipe Herbs (herbs_database_2)
    const singleUrl = `${SUPABASE_URL}/herbs_database_1?select=number,name,formula,indication&or=(${filterTerms})&limit=1000`;
    const recipeUrl = `${SUPABASE_URL}/herbs_database_2?select=number,name,formula,indication&or=(${filterTerms})&limit=1000`;

    const [resSingle, resRecipe] = await Promise.all([
      fetch(singleUrl, { headers }),
      fetch(recipeUrl, { headers })
    ]);

    if (!resSingle.ok) {
      throw new Error(`HTTP error ${resSingle.status} from herbs_database_1`);
    }
    if (!resRecipe.ok) {
      throw new Error(`HTTP error ${resRecipe.status} from herbs_database_2`);
    }

    const [singleData, recipeData] = await Promise.all([
      resSingle.json(),
      resRecipe.json()
    ]);

    if (Array.isArray(singleData)) {
      if (singleData.length >= 1000) {
        console.warn('[DataHygiene] herbs_database_1 query reached limit=1000 ceiling.');
      }
      singleHerbs = groupHerbsByName(singleData, symptomKeywords, element);
    }
    if (Array.isArray(recipeData)) {
      if (recipeData.length >= 1000) {
        console.warn('[DataHygiene] herbs_database_2 query reached limit=1000 ceiling.');
      }
      recipeHerbs = groupHerbsByName(recipeData, symptomKeywords, element);
    }
  } catch (err) {
    console.error('Supabase herbs_database query error:', err);
    throw err;
  }

  return {
    singleHerbs,
    recipeHerbs,
    matchedKeywordsList: symptomKeywords,
    totalMatched: singleHerbs.length + recipeHerbs.length
  };
}
