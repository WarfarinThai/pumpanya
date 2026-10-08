// Service for fetching and processing Thai Herbal Safety data (294 Monographs) from Supabase

const SUPABASE_URL = 'https://vwueyfmqutuajcgstdrd.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'sb_publishable_6n21DWSLbyB59eTSJE60KQ_2w8lQRBM';

export interface MaximumContinuousUse {
  duration?: string;
  reason?: string;
}

export interface MaternalSafety {
  status?: string;
  detail?: string;
}

export interface OrganConditionDetail {
  hepatitis?: string;
  chronic_renal_failure?: string;
  other?: string | string[];
}

export interface ThaiHerbalSafetyRecord {
  id: number;
  display_index?: number;
  monograph_order?: number;
  monograph_th: string;
  english_title?: string;
  definition?: string;
  maximum_continuous_use?: MaximumContinuousUse;
  pregnancy?: MaternalSafety;
  lactation?: MaternalSafety;
  contraindications?: OrganConditionDetail;
  precautions?: OrganConditionDetail;
  drug_interactions?: string | string[];
  thai_medicine_taste?: string[] | string;
  source_pdf_pages?: number[] | { page?: string };
  created_at?: string;
}

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  Range: '0-999'
};

// Helpers for clinical extraction
export function isValidText(val: any): boolean {
  if (!val) return false;
  if (typeof val === 'string') {
    const s = val.trim();
    return s !== '' && s !== 'ไม่มีข้อมูล' && s !== '-' && s !== 'None';
  }
  if (Array.isArray(val)) {
    return val.length > 0 && val.some(x => isValidText(x));
  }
  if (typeof val === 'object') {
    return Object.values(val).some(x => isValidText(x));
  }
  return false;
}

export function normalizeTextField(val: any): string {
  if (!val) return 'ไม่มีข้อมูล';
  if (typeof val === 'string') {
    return isValidText(val) ? val.trim() : 'ไม่มีข้อมูล';
  }
  if (Array.isArray(val)) {
    const validItems = Array.from(
      new Set(
        val
          .map(v => (typeof v === 'string' ? v.trim() : String(v || '').trim()))
          .filter(v => isValidText(v))
      )
    );
    return validItems.length > 0 ? validItems.join(' • ') : 'ไม่มีข้อมูล';
  }
  return 'ไม่มีข้อมูล';
}

export function parseStringOrArray(val: string | string[] | undefined): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return Array.from(
      new Set(
        val
          .map(v => (typeof v === 'string' ? v.trim() : String(v || '').trim()))
          .filter(v => isValidText(v))
      )
    );
  }
  if (typeof val === 'string' && isValidText(val)) return [val.trim()];
  return [];
}

export function parseTasteList(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val
      .map(v => (typeof v === 'string' ? v.trim() : String(v || '').trim()))
      .filter(v => isValidText(v))
      .map(v => v.replace(/^รส\s*/, '').trim())
      .filter(v => isValidText(v));
  }
  if (typeof val === 'string') {
    if (!isValidText(val)) return [];
    // Can be comma/slash separated string or single taste word
    return val
      .split(/[,，、/]/)
      .map(s => s.trim())
      .filter(s => isValidText(s))
      .map(s => s.replace(/^รส\s*/, '').trim())
      .filter(s => isValidText(s));
  }
  return [];
}

export function normalizeHerbalRecord(r: any): ThaiHerbalSafetyRecord {
  if (!r || typeof r !== 'object') return r;
  return {
    ...r,
    english_title: isValidText(r.english_title) ? String(r.english_title).trim() : '',
    definition: isValidText(r.definition) ? String(r.definition).trim() : '',
    maximum_continuous_use: {
      duration: normalizeTextField(r.maximum_continuous_use?.duration),
      reason: normalizeTextField(r.maximum_continuous_use?.reason),
    },
    pregnancy: {
      status: normalizeTextField(r.pregnancy?.status),
      detail: normalizeTextField(r.pregnancy?.detail),
    },
    lactation: {
      status: normalizeTextField(r.lactation?.status),
      detail: normalizeTextField(r.lactation?.detail),
    },
    contraindications: {
      hepatitis: normalizeTextField(r.contraindications?.hepatitis),
      chronic_renal_failure: normalizeTextField(r.contraindications?.chronic_renal_failure),
      other: parseStringOrArray(r.contraindications?.other),
    },
    precautions: {
      hepatitis: normalizeTextField(r.precautions?.hepatitis),
      chronic_renal_failure: normalizeTextField(r.precautions?.chronic_renal_failure),
      other: parseStringOrArray(r.precautions?.other),
    },
    drug_interactions: parseStringOrArray(r.drug_interactions),
    thai_medicine_taste: parseTasteList(r.thai_medicine_taste),
  };
}

export function deduplicateHerbalRecords(records: ThaiHerbalSafetyRecord[]): ThaiHerbalSafetyRecord[] {
  const seen = new Map<string, ThaiHerbalSafetyRecord>();
  for (const r of records) {
    if (!r || !r.monograph_th) continue;
    const key = r.monograph_th.trim();
    if (!seen.has(key)) {
      seen.set(key, r);
    }
  }
  return Array.from(seen.values()).map((rec, index) => ({
    ...rec,
    display_index: index + 1,
  }));
}

export function formatSourcePdfPages(
  pages?: number[] | { page?: string } | string | number | null
): string | null {
  if (pages === null || pages === undefined) return null;

  if (Array.isArray(pages)) {
    const validNums = pages
      .map(p => (typeof p === 'number' ? p : Number(String(p).trim())))
      .filter(n => !Number.isNaN(n) && n > 0);
    if (validNums.length === 0) return null;
    if (validNums.length === 2) {
      return validNums[0] === validNums[1]
        ? `${validNums[0]}`
        : `${validNums[0]}–${validNums[1]}`;
    }
    return Array.from(new Set(validNums)).join(', ');
  }

  if (typeof pages === 'object' && 'page' in pages) {
    const raw = pages.page;
    if (raw === null || raw === undefined) return null;
    const str = String(raw).trim();
    return isValidText(str) ? str : null;
  }

  if (typeof pages === 'number') {
    return pages > 0 ? String(pages) : null;
  }

  if (typeof pages === 'string') {
    const str = pages.trim();
    return isValidText(str) ? str : null;
  }

  return null;
}

export function formatRecordDate(dateStr?: string | null): string | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (!trimmed) return null;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export async function fetchHerbalSafetyRecords(): Promise<ThaiHerbalSafetyRecord[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/thai_herbal_safety?select=*&order=id.asc`, { headers });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from thai_herbal_safety');
    }
    if (data.length >= 1000) {
      console.warn(
        `[DataHygiene] thai_herbal_safety query returned ${data.length} rows, hitting the Range 0-999 ceiling (1000).`
      );
    }
    return deduplicateHerbalRecords(data.map(normalizeHerbalRecord));
  } catch (err) {
    console.error('Failed to fetch thai_herbal_safety from Supabase:', err);
    throw err;
  }
}
