// Service for fetching Herbal Comparisons from Supabase

const SUPABASE_URL = 'https://vwueyfmqutuajcgstdrd.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'sb_publishable_6n21DWSLbyB59eTSJE60KQ_2w8lQRBM';

export interface OrganToxicity {
  liver_toxicity: string;
  kidney_toxicity: string;
}

export interface HerbalComparisonRecord {
  id: number;
  indication: string;
  conventional_drug: string;
  herbal_drug: string;
  dosage_and_administration: string;
  restricted_populations: string[];
  organ_toxicity: OrganToxicity;
  drug_interactions: string[];
  adverse_effects: string[];
}

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
};

export async function fetchHerbalComparisons(): Promise<HerbalComparisonRecord[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/herbal_comparisons?select=*&order=id.asc`, { headers });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from herbal_comparisons');
    }
    if (data.length >= 1000) {
      console.warn(`[DataHygiene] herbal_comparisons query returned ${data.length} rows, hitting the default 1000-row ceiling.`);
    }
    return data;
  } catch (err) {
    console.error('Failed to fetch herbal_comparisons from Supabase:', err);
    throw err;
  }
}
