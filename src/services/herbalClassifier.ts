import { ThaiHerbalSafetyRecord, isValidText } from './supabaseHerbalSafety';

export type HerbalRecordType = 'formula' | 'single' | 'unclassified';

export interface HerbalClassification {
  type: HerbalRecordType;
  /** Primary label in Thai: 'ตำรับยาแผนโบราณ' | 'สมุนไพรเดี่ยว' | 'ไม่ระบุประเภท' */
  label: string;
  /** Compact label for tabs and filter chips: 'ตำรับ' | 'สมุนไพรเดี่ยว' | 'ไม่ระบุประเภท' */
  shortLabel: string;
  /** Contextual title for the monograph definition block */
  sectionTitle: string;
  /** Neutral fallback message when definition text is missing */
  emptyDefinitionText: string;
  /** Icon name for Google Material Symbols */
  icon: string;
  /** Tailwind badge styling */
  badgeClass: string;
}

/**
 * Shared conservative classifier for Thai Herbal Safety records.
 * Returns exactly three conceptual outcomes: 'formula', 'single', and 'unclassified'.
 *
 * Uses existing source-backed fields only:
 * - 'formula': Explicit formula evidence (starts with 'ยา'/'พิกัด', contains 'ตำรับ', or definition has 'ประกอบด้วย'/'ในผงยา'/'ในสูตรยา'/'ส่วนประกอบ').
 * - 'single': Confirmed botanical single-herb evidence (not a formula, and definition specifies botanical family 'วงศ์' or verified plant part & botanical binomial).
 * - 'unclassified': Ambiguous, chemical, mineral, coordinate, or records lacking confident single-herb/formula evidence.
 */
export function classifyHerbalRecord(record: ThaiHerbalSafetyRecord): HerbalClassification {
  const name = (record.monograph_th || '').trim();
  const def = (record.definition || '').trim();

  // 1. Check for formula evidence
  // A name beginning with 'ยาง...' may describe a botanical/material record, not a preparation.
  // Do not classify it as a formula from the broad 'ยา' prefix alone.
  const isFormula =
    (name.startsWith('ยา') && !name.startsWith('ยาง')) ||
    name.startsWith('พิกัด') ||
    name.includes('ตำรับ') ||
    def.includes('ประกอบด้วย') ||
    def.includes('ในผงยา') ||
    def.includes('ในสูตรยา') ||
    def.includes('ส่วนประกอบ');

  if (isFormula) {
    return {
      type: 'formula',
      label: 'ตำรับยาแผนโบราณ',
      shortLabel: 'ตำรับ',
      sectionTitle: 'ส่วนประกอบและตัวยาในตำรับ (Formulation Composition)',
      emptyDefinitionText: 'ไม่มีข้อมูลส่วนประกอบระบุไว้ในเล่มอ้างอิงนี้',
      icon: 'format_list_bulleted',
      badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-200'
    };
  }

  // 2. Check for single-herb evidence (must have positive botanical taxon / part evidence)
  const hasBotanicalFamily = /วงศ์\s*[:：]?\s*[A-Z][A-Za-z-]*aceae\b/.test(def);
  const hasBotanicalBinomial = /\b[A-Z][a-z]{2,}\s+[a-z][a-z-]{2,}\b/.test(def);
  const hasExplicitPlantPart =
    /(?:ผล|ดอก|ใบ|ราก|เปลือก|เหง้า|หัว|ต้น|เนื้อไม้|แก่น|ยาง|เมล็ด|ทั้งต้น|ส่วนเหนือดิน|น้ำยาง|เถา|กิ่ง)(?=(?:ของ|จาก|ที่ใช้|ที่นำมาใช้|สด|แห้ง|ซึ่ง|เป็น|ใน|\s|$))/.test(def);

  // A plant-part word or an author abbreviation alone is insufficient.
  // Require a named botanical family or both a binomial and an explicit plant part.
  const hasBotanicalEvidence =
    isValidText(def) &&
    (hasBotanicalFamily || (hasBotanicalBinomial && hasExplicitPlantPart));

  if (hasBotanicalEvidence) {
    return {
      type: 'single',
      label: 'สมุนไพรเดี่ยว',
      shortLabel: 'สมุนไพรเดี่ยว',
      sectionTitle: 'คำจำกัดความและส่วนที่ใช้ทางเภสัชกรรม (Botanical / Pharmaceutical Part)',
      emptyDefinitionText: 'ไม่มีข้อมูลคำจำกัดความหรือส่วนที่ใช้ทางเภสัชกรรมระบุไว้ในเล่มอ้างอิงนี้',
      icon: 'eco',
      badgeClass: 'bg-neutral-100 text-neutral-800 border-neutral-300'
    };
  }

  // 3. Conservative fallback: unclassified (e.g. minerals like ดินประสิว, ดีเกลือ, สารส้ม, synthetics, or ambiguous entries)
  return {
    type: 'unclassified',
    label: 'ไม่ระบุประเภท',
    shortLabel: 'ไม่ระบุประเภท',
    sectionTitle: 'คำจำกัดความและข้อมูลทางเภสัชกรรม (Pharmaceutical Definition & Details)',
    emptyDefinitionText: 'ไม่มีข้อมูลคำจำกัดความระบุไว้ในเล่มอ้างอิงนี้',
    icon: 'science',
    badgeClass: 'bg-neutral-100 text-neutral-600 border-neutral-200'
  };
}
