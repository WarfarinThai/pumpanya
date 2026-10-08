import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import WelcomeGate from './components/WelcomeGate';
import MainDashboard from './components/MainDashboard';
import { HealthProfile } from './types';

// Safe empty/unknown initial profile for new users or corrupt profile state (NO clinical demo data)
export const DEFAULT_SAFE_PROFILE: HealthProfile = {
  birthMonth: undefined,
  birthElement: undefined,
  currentElementState: undefined,
  ageRange: '',
  gender: 'unspecified',
  weight: 0,
  isPregnant: false,
  hasLiverDisease: undefined,
  hasKidneyDisease: undefined,
  chronicConditions: [],
  drugCategoryIds: undefined,
  medications: [],
  allergies: undefined,
  allergyDetails: undefined,
  currentSymptoms: [],
  traditional: {
    heatLevel: 'unknown',
    windType: 'unknown',
    bowelHabit: undefined,
    sleepQuality: undefined
  }
};

export function parseStoredProfile(raw: string | null): {
  profile: HealthProfile;
  isCorrupt: boolean;
} {
  if (raw === null) {
    return { profile: DEFAULT_SAFE_PROFILE, isCorrupt: false };
  }
  if (!raw.trim()) {
    return { profile: DEFAULT_SAFE_PROFILE, isCorrupt: true };
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { profile: DEFAULT_SAFE_PROFILE, isCorrupt: true };
    }

    if (
      ('medications' in parsed && !Array.isArray(parsed.medications)) ||
      ('chronicConditions' in parsed && !Array.isArray(parsed.chronicConditions)) ||
      ('currentSymptoms' in parsed && !Array.isArray(parsed.currentSymptoms)) ||
      ('drugCategoryIds' in parsed && parsed.drugCategoryIds !== undefined && !Array.isArray(parsed.drugCategoryIds))
    ) {
      return { profile: DEFAULT_SAFE_PROFILE, isCorrupt: true };
    }

    const validProfile: HealthProfile = {
      ...DEFAULT_SAFE_PROFILE,
      ...parsed,
      chronicConditions: Array.isArray(parsed.chronicConditions) ? parsed.chronicConditions : [],
      medications: Array.isArray(parsed.medications) ? parsed.medications : [],
      currentSymptoms: Array.isArray(parsed.currentSymptoms) ? parsed.currentSymptoms : [],
      traditional:
        parsed.traditional && typeof parsed.traditional === 'object' && !Array.isArray(parsed.traditional)
          ? {
              ...DEFAULT_SAFE_PROFILE.traditional,
              ...parsed.traditional
            }
          : DEFAULT_SAFE_PROFILE.traditional
    };
    return { profile: validProfile, isCorrupt: false };
  } catch (e) {
    console.error('Failed to parse profile', e);
    return { profile: DEFAULT_SAFE_PROFILE, isCorrupt: true };
  }
}

export default function App() {
  const [hasAcceptedGate, setHasAcceptedGate] = useState<boolean>(false);
  const [profile, setProfile] = useState<HealthProfile>(DEFAULT_SAFE_PROFILE);
  const [isProfileCorrupt, setIsProfileCorrupt] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Initialize consent and profile from localStorage (preserving raw localStorage on corrupt data)
  useEffect(() => {
    const savedConsent = localStorage.getItem('thai_herb_safe_consent');
    if (savedConsent === 'true') {
      setHasAcceptedGate(true);
    }

    const savedProfile = localStorage.getItem('thai_herb_safe_profile');
    if (savedProfile !== null) {
      const { profile: parsedProfile, isCorrupt } = parseStoredProfile(savedProfile);
      setProfile(parsedProfile);
      setIsProfileCorrupt(isCorrupt);
    }
  }, []);

  // Accept Welcome Gate
  const handleAcceptGate = () => {
    setHasAcceptedGate(true);
    localStorage.setItem('thai_herb_safe_consent', 'true');
  };

  // Update profile when user explicitly saves
  const handleUpdateProfile = (newProfile: HealthProfile) => {
    setProfile(newProfile);
    setIsProfileCorrupt(false);
    localStorage.setItem('thai_herb_safe_profile', JSON.stringify(newProfile));
  };

  // Launch a feature modal from Home Feature Directory or any component
  const handleOpenFeature = (featureId: string) => {
    setActiveModal(featureId);
    if (featureId === 'organ-safety') {
      setCurrentTab('organ-safety');
    } else if (featureId === 'born-vs-current') {
      setCurrentTab('elements');
    } else if (featureId === 'drug-interaction') {
      setCurrentTab('interaction');
    } else if (featureId === 'g2c-registry') {
      setCurrentTab('g2c-season');
    } else {
      setCurrentTab('home');
    }
  };

  // Dismiss/close modal and return to Home
  const handleCloseFeature = () => {
    setActiveModal(null);
    setCurrentTab('home');
  };

  // Handle Tab navigation from BottomNav
  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    if (tabId === 'home') {
      setActiveModal(null);
    } else if (tabId === 'organ-safety') {
      setActiveModal('organ-safety');
    } else if (tabId === 'elements') {
      setActiveModal('born-vs-current');
    } else if (tabId === 'interaction') {
      setActiveModal('drug-interaction');
    } else if (tabId === 'g2c-season') {
      setActiveModal('g2c-registry');
    }
  };

  // 1. LOCKED FIRST-TIME WELCOME GATE
  if (!hasAcceptedGate) {
    return <WelcomeGate onAccept={handleAcceptGate} />;
  }

  // 2. MAIN APPLICATION WORKFLOW
  return (
    <div className="min-h-dvh bg-surface-muted text-text-primary pb-24 lg:pb-20 pt-safe">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="w-full px-4 md:px-6 lg:px-8 pt-24 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto">
        <MainDashboard 
          profile={profile} 
          isProfileCorrupt={isProfileCorrupt}
          onUpdateProfile={handleUpdateProfile} 
          activeFeature={activeModal}
          onOpenFeature={handleOpenFeature}
          onCloseFeature={handleCloseFeature}
        />
      </main>

      {/* Persistent Bottom Tab Navigation Bar */}
      <BottomNav 
        currentTab={currentTab} 
        onChangeTab={handleTabChange} 
      />
    </div>
  );
}
