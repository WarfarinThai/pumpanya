// Service for fetching Element Concept and Element Profiles from Supabase

const SUPABASE_URL = 'https://vwueyfmqutuajcgstdrd.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'sb_publishable_6n21DWSLbyB59eTSJE60KQ_2w8lQRBM';

export interface ElementConceptType {
  type_name: string;
  determination_method: string;
}

export interface ElementConceptRecord {
  section_key: string;
  title: string;
  description: string;
  element_types: ElementConceptType[];
}

export interface ElementProfileRecord {
  element_id: 'earth' | 'water' | 'wind' | 'fire';
  element_name_th: string;
  element_name_en: string;
  birth_months: {
    solar: string[];
    thai_lunar: string[];
  };
  physical_and_personality_traits: string;
  health_vulnerability: string;
  recommended_tastes: string[];
  recommended_vegetables_fruits: string[];
  recommended_beverages: string[];
}

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
};

export async function fetchElementConcepts(): Promise<ElementConceptRecord[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/element_concepts?select=*`, { headers });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from element_concepts');
    }
    if (data.length >= 1000) {
      console.warn(`[DataHygiene] element_concepts query returned ${data.length} rows, hitting the default 1000-row ceiling.`);
    }
    return data;
  } catch (err) {
    console.error('Failed to fetch element_concepts from Supabase:', err);
    throw err;
  }
}

export async function fetchElementProfiles(): Promise<ElementProfileRecord[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/element_profiles?select=*`, { headers });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from element_profiles');
    }
    if (data.length >= 1000) {
      console.warn(`[DataHygiene] element_profiles query returned ${data.length} rows, hitting the default 1000-row ceiling.`);
    }
    return data;
  } catch (err) {
    console.error('Failed to fetch element_profiles from Supabase:', err);
    throw err;
  }
}

export function getProfileByElement(profiles: ElementProfileRecord[], element: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ'): ElementProfileRecord | undefined {
  const map: Record<'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ', string> = {
    'ดิน': 'earth',
    'น้ำ': 'water',
    'ลม': 'wind',
    'ไฟ': 'fire'
  };
  const targetId = map[element];
  return profiles.find(p => p.element_id === targetId);
}
