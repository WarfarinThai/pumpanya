export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  isUnknown?: boolean;
  notes?: string;
  categoryId?: string;
}

export interface TraditionalObservations {
  heatLevel?: 'cold' | 'normal' | 'hot' | 'unknown';
  windType?: 'after-meal' | 'empty-stomach' | 'rare' | 'unknown';
  bowelHabit?: string;
  sleepQuality?: string;
}

export interface HealthProfile {
  birthMonth?: string; // e.g. 'เมษายน' (ธาตุไฟ)
  birthElement?: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ';
  currentElementState?: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ';
  ageRange: string; // 'under-20' | '20-39' | '40-59' | '60-69' | '70-above'
  gender: 'male' | 'female' | 'unspecified';
  weight: number;
  isPregnant: boolean;
  hasLiverDisease?: boolean;
  hasKidneyDisease?: boolean;
  chronicConditions: string[];
  medications: Medication[];
  drugCategoryIds?: string[];
  allergies?: 'none' | 'has-allergy' | 'unknown';
  allergyDetails?: string;
  currentSymptoms: string[]; // e.g. 'bloating'
  traditional: TraditionalObservations;
}

export interface Herb {
  id: string;
  name: string;
  botanicalName: string;
  purpose: string;
  category: string;
  description: string;
  image?: string;
}

export interface DrugInteractionItem {
  drugName: string;
  severity: 'safe' | 'info' | 'cautionary' | 'warning' | 'alert';
  severityText: string;
  mechanism: string;
  recommendation: string;
}

export interface DimensionAnalysis {
  status: 'match' | 'warning' | 'error' | 'info' | 'unknown';
  statusText: string;
  title: string;
  content: string;
}

export interface SimulationResult {
  herbId: string;
  herbName: string;
  botanicalName: string;
  purpose: string;
  safetyScore: number; // 0-100
  safetyLevel: 'safe' | 'cautionary' | 'warning' | 'alert';
  safetyLevelText: string;
  summary: string;
  completenessIndex: number; // e.g. 80
  completenessText: string;
  dimensions: {
    symptomFit: DimensionAnalysis;
    chronicConditions: DimensionAnalysis;
    interactions: {
      items: DrugInteractionItem[];
      summary: string;
    };
    specialPopulations: DimensionAnalysis;
    dataCompleteness: DimensionAnalysis;
  };
  recommendedQuestions: string[];
}

export interface SavedSimulation {
  id: string;
  timestamp: string;
  profile: HealthProfile;
  herb: Herb;
  result: SimulationResult;
}
