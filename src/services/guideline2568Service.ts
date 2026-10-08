// Supabase Guideline 2568 Clinical Data Types
export interface SymptomGroup {
  id: number;
  group_name: string;
}

export interface Disease {
  id: number;
  group_id: number;
  disease_name: string;
}

export interface RecommendedHerb {
  id: number;
  disease_id: number;
  herb_name: string;
  dosage_and_instruction: string;
  safe_duration: string;
  contraindications: string[];
  drug_interactions: string[];
  organ_precautions: {
    liver?: string;
    kidney?: string;
    [key: string]: string | undefined;
  };
  taste_profile: string;
}

const SUPABASE_URL = 'https://vwueyfmqutuajcgstdrd.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'sb_publishable_6n21DWSLbyB59eTSJE60KQ_2w8lQRBM';

const headers = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
};

export async function fetchSymptomGroups(): Promise<SymptomGroup[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/symptom_groups?select=*&order=id.asc`, { headers });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from symptom_groups');
    }
    return data;
  } catch (err) {
    console.error('Failed to fetch symptom_groups from Supabase:', err);
    throw err;
  }
}

export async function fetchDiseasesByGroup(groupId: number): Promise<Disease[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/diseases?group_id=eq.${groupId}&select=*&order=id.asc`, { headers });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from diseases');
    }
    // Deduplicate disease names if any duplicate exists
    const seen = new Set<string>();
    return data.filter(d => {
      if (seen.has(d.disease_name)) return false;
      seen.add(d.disease_name);
      return true;
    });
  } catch (err) {
    console.error('Failed to fetch diseases from Supabase:', err);
    throw err;
  }
}

export async function fetchRecommendedHerbs(diseaseId: number): Promise<RecommendedHerb[]> {
  try {
    // Also fetch if there is duplicate disease_id with same name
    const res = await fetch(`${SUPABASE_URL}/recommended_herbs?disease_id=eq.${diseaseId}&select=*&order=id.asc`, { headers });
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format from recommended_herbs');
    }
    return data;
  } catch (err) {
    console.error('Failed to fetch recommended_herbs from Supabase:', err);
    throw err;
  }
}
