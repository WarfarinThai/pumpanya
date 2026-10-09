import React, { useState } from 'react';
import { HealthProfile } from '../types';
import { getBirthElement } from '../data/elementsAndSafety';
import OrganSafetyModal from './OrganSafetyModal';
import BornVsCurrentModal from './BornVsCurrentModal';
import DrugInteractionModal from './DrugInteractionModal';
import G2CRegistryModal from './G2CRegistryModal';
import SeasonalTransitionModal from './SeasonalTransitionModal';
import QuickProfileEditorModal from './QuickProfileEditorModal';
import ElementRadarSpider from './ElementRadarSpider';
import SymptomGuidelineModal from './SymptomGuidelineModal';
import HerbalSubstituteModal from './HerbalSubstituteModal';
import {
  FeatureVisualBirth,
  FeatureVisualSeason,
  FeatureVisualSafety,
  FeatureVisualInteraction,
  FeatureVisualRegistry,
  FeatureVisualSymptom,
  FeatureVisualSubstitute
} from './FeatureVisuals';

interface MainDashboardProps {
  profile: HealthProfile;
  isProfileCorrupt?: boolean;
  onUpdateProfile: (updated: HealthProfile) => void;
  onResetWelcome?: () => void;
  activeFeature?: string | null;
  onOpenFeature?: (featureId: string) => void;
  onCloseFeature?: () => void;
}

export default function MainDashboard({
  profile,
  isProfileCorrupt = false,
  onUpdateProfile,
  activeFeature,
  onOpenFeature,
  onCloseFeature
}: MainDashboardProps) {
  const [localActiveModal, setLocalActiveModal] = useState<string | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const activeModal = activeFeature !== undefined ? activeFeature : localActiveModal;

  const handleOpenModal = (featureId: string) => {
    if (onOpenFeature) {
      onOpenFeature(featureId);
    } else {
      setLocalActiveModal(featureId);
    }
  };

  const handleCloseModal = () => {
    if (onCloseFeature) {
      onCloseFeature();
    } else {
      setLocalActiveModal(null);
    }
  };

  const birthInfo = getBirthElement(profile.birthMonth);

  const hasOrganRisk = Boolean(
    profile.hasLiverDisease ||
    profile.hasKidneyDisease ||
    profile.chronicConditions.some(c => c.includes('ตับ') || c.includes('ไต'))
  );
  const hasConfiguredOrganStatus =
    typeof profile.hasLiverDisease === 'boolean' ||
    typeof profile.hasKidneyDisease === 'boolean' ||
    profile.chronicConditions.length > 0;
  const hasConfiguredMedications =
    profile.medications.length > 0 || Array.isArray(profile.drugCategoryIds);

  return (
    <div className="flex flex-col gap-5 pb-6 animate-fade-in">
      
      {/* ────────────────────────────────────────────────────────── */}
      {/* 1. TOP CARD: YOUR HEALTH & ELEMENT PROFILE                 */}
      {/* ────────────────────────────────────────────────────────── */}
      <div className="w-full bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-border-default flex flex-col gap-3.5">
        
        {/* Card Header with generous spacing & clean layout */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-neutral-100">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-brand-primary text-white flex items-center justify-center shrink-0 shadow-xs" aria-hidden="true">
              <span aria-hidden="true" className="material-symbols-outlined text-2xl">person</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-base sm:text-xl font-bold text-brand-primary leading-snug">
                ข้อมูลสุขภาพและธาตุของคุณ
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingProfile(true)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 text-xs sm:text-sm font-semibold text-brand-primary bg-brand-surface hover:bg-emerald-50 active:scale-95 px-3.5 py-2 rounded-xl border border-brand-border-subtle transition-all shrink-0 cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary self-start sm:self-auto"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">edit</span>
            <span>แก้ไขข้อมูล</span>
          </button>
        </div>

        {/* Non-blocking notice if stored profile in localStorage was corrupt */}
        {isProfileCorrupt && (
          <div
            role="status"
            data-testid="corrupt-profile-notice"
            className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-xs"
          >
            <div className="flex items-start gap-2.5">
              <span aria-hidden="true" className="material-symbols-outlined text-amber-700 text-xl shrink-0 mt-0.5">
                warning
              </span>
              <span className="text-[15px] font-semibold leading-relaxed">
                ไม่สามารถอ่านข้อมูลโปรไฟล์เดิมได้ กรุณาตรวจสอบข้อมูลของคุณอีกครั้ง
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs sm:text-sm font-semibold shrink-0 cursor-pointer transition-colors inline-flex items-center justify-center"
            >
              ตรวจสอบข้อมูล
            </button>
          </div>
        )}

        {/* ── Spider Web (ใยแมงมุม) Birth Element Visualization ── */}
        <ElementRadarSpider 
          birthElement={birthInfo ? birthInfo.element : null}
          birthMonth={profile.birthMonth}
          onRequestSetBirthMonth={() => setIsEditingProfile(true)}
        />

        {/* Status Pills: Liver/Kidney + Meds */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-3 pt-1 text-sm sm:text-[15px]">
          {/* Liver / Kidney status */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-muted border border-border-default">
            <span className="text-text-secondary font-medium flex items-center gap-1.5">
              <span aria-hidden="true" className="material-symbols-outlined text-base text-brand-secondary">shield</span>
              <span className="font-semibold">สถานะตับและไต:</span>
            </span>
            <span className={`font-semibold ${
              hasOrganRisk
                ? 'text-danger-primary'
                : hasConfiguredOrganStatus
                ? 'text-success-primary'
                : 'text-text-muted'
            }`}>
              {hasOrganRisk
                ? '⚠️ มีภาวะโรคตับ/ไต'
                : hasConfiguredOrganStatus
                ? '✓ ปกติ (ไม่มีประวัติโรค)'
                : 'ยังไม่ได้ระบุข้อมูล'}
            </span>
          </div>

          {/* Active medications */}
          <div className="flex flex-col gap-2 p-3 rounded-xl bg-surface-muted border border-border-default">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary font-medium flex items-center gap-1.5">
                <span aria-hidden="true" className="material-symbols-outlined text-base text-blue-700">medication</span>
                <span className="font-semibold">กลุ่มยาแผนปัจจุบันที่บันทึกไว้:</span>
              </span>
              <span className="text-xs sm:text-sm text-text-muted font-semibold">
                {profile.medications.length > 0
                  ? `${profile.medications.length} กลุ่ม`
                  : hasConfiguredMedications
                  ? 'ไม่มี'
                  : 'ยังไม่ได้ระบุ'}
              </span>
            </div>
            
            {profile.medications.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {profile.medications.map((m) => (
                  <span
                    key={m.id || m.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-border-default text-brand-primary text-xs sm:text-sm font-semibold shadow-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                    <span>{m.name}</span>
                  </span>
                ))}
              </div>
            ) : hasConfiguredMedications ? (
              <span className="text-xs sm:text-sm text-text-muted italic leading-relaxed">
                ✓ ไม่ได้รับประทานยาแผนปัจจุบันเป็นประจำ (กดปุ่ม &quot;แก้ไขข้อมูล&quot; ด้านบนเพื่อปรับเปลี่ยน)
              </span>
            ) : (
              <span className="text-xs sm:text-sm text-text-muted italic leading-relaxed">
                ยังไม่ได้ระบุข้อมูลยาประจำตัว (กดปุ่ม &quot;แก้ไขข้อมูล&quot; ด้านบนเพื่อระบุ)
              </span>
            )}
          </div>
        </div>

      </div>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 2. FEATURE DIRECTORY: ALL 7 MAJOR TOOLS                    */}
      {/* ────────────────────────────────────────────────────────── */}
      <section aria-labelledby="feature-directory-heading" className="flex flex-col gap-3.5 pt-1">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 px-1">
          <div>
            <h2 id="feature-directory-heading" className="text-base sm:text-lg font-bold text-brand-primary leading-snug">
              เครื่องมือทั้งหมด
            </h2>
            <p className="text-xs sm:text-sm text-text-muted font-medium mt-0.5">
              เลือกเครื่องมือเพื่อเริ่มต้นประเมินความปลอดภัย หรือคัดกรองการใช้สมุนไพร
            </p>
          </div>
          <span className="text-xs font-semibold text-text-muted bg-surface-muted px-2.5 py-1 rounded-full border border-border-default shrink-0 self-start sm:self-auto">
            7 เครื่องมือ
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* ── Feature 1: Birth Element & Diet Guidance ── */}
        <button
          type="button"
          id="feature-card-birth-element"
          onClick={() => handleOpenModal('born-vs-current')}
          className="w-full text-left bg-white p-3 sm:p-4 rounded-2xl border border-border-default shadow-xs hover:border-emerald-300 hover:bg-emerald-50/15 transition-all flex items-center gap-3 sm:gap-4 group active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border border-brand-border-subtle shadow-xs group-hover:scale-105 transition-transform bg-brand-surface p-1 flex items-center justify-center">
            <FeatureVisualBirth className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-brand-primary leading-snug group-hover:text-emerald-950">
              1. ธาตุเจ้าเรือนเกิด และอาหารปรับสมดุลธาตุ
            </h3>
          </div>
          <span aria-hidden="true" className="material-symbols-outlined text-neutral-400 group-hover:text-brand-primary text-xl sm:text-2xl shrink-0 transition-colors">
            chevron_right
          </span>
        </button>

        {/* ── Feature 2: Seasonal Transition ── */}
        <button
          type="button"
          id="feature-card-seasonal-transition"
          onClick={() => handleOpenModal('seasonal-transition')}
          className="w-full text-left bg-white p-3.5 sm:p-4 rounded-2xl border border-border-default shadow-xs hover:border-emerald-300 hover:bg-emerald-50/15 transition-all flex items-center gap-4 group active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-brand-border-subtle shadow-xs group-hover:scale-105 transition-transform bg-brand-surface p-1 flex items-center justify-center">
            <FeatureVisualSeason className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-brand-primary leading-snug group-hover:text-emerald-950">
              2. ปรับสมดุลตามฤดูกาล &amp; ไข้หัวลม
            </h3>
          </div>
          <span aria-hidden="true" className="material-symbols-outlined text-neutral-400 group-hover:text-brand-primary text-2xl shrink-0 transition-colors">
            chevron_right
          </span>
        </button>

        {/* ── Feature 3: Organ Safety ── */}
        <button
          type="button"
          id="feature-card-organ-safety"
          onClick={() => handleOpenModal('organ-safety')}
          className="w-full text-left bg-white p-3.5 sm:p-4 rounded-2xl border border-border-default shadow-xs hover:border-emerald-300 hover:bg-emerald-50/15 transition-all flex items-center gap-4 group active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-brand-border-subtle shadow-xs group-hover:scale-105 transition-transform bg-brand-surface p-1 flex items-center justify-center">
            <FeatureVisualSafety className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-brand-primary leading-snug group-hover:text-emerald-950">
              3. ข้อมูลความปลอดภัยของสมุนไพร
            </h3>
          </div>
          <span aria-hidden="true" className="material-symbols-outlined text-neutral-400 group-hover:text-brand-primary text-2xl shrink-0 transition-colors">
            chevron_right
          </span>
        </button>

        {/* ── Feature 4: Prescription Contraindication ── */}
        <button
          type="button"
          id="feature-card-drug-interaction"
          onClick={() => handleOpenModal('drug-interaction')}
          className="w-full text-left bg-white p-3.5 sm:p-4 rounded-2xl border border-border-default shadow-xs hover:border-emerald-300 hover:bg-emerald-50/15 transition-all flex items-center gap-4 group active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-brand-border-subtle shadow-xs group-hover:scale-105 transition-transform bg-brand-surface p-1 flex items-center justify-center">
            <FeatureVisualInteraction className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-brand-primary leading-snug group-hover:text-emerald-950">
              4. ตรวจสอบยาตีกัน &amp; รสยาขัดแย้ง
            </h3>
          </div>
          <span aria-hidden="true" className="material-symbols-outlined text-neutral-400 group-hover:text-brand-primary text-2xl shrink-0 transition-colors">
            chevron_right
          </span>
        </button>

        {/* ── Feature 5: G2C Registry Scanner ── */}
        <button
          type="button"
          id="feature-card-g2c-registry"
          onClick={() => handleOpenModal('g2c-registry')}
          className="w-full text-left bg-white p-3.5 sm:p-4 rounded-2xl border border-border-default shadow-xs hover:border-emerald-300 hover:bg-emerald-50/15 transition-all flex items-center gap-4 group active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-brand-border-subtle shadow-xs group-hover:scale-105 transition-transform bg-brand-surface p-1 flex items-center justify-center">
            <FeatureVisualRegistry className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-brand-primary leading-snug group-hover:text-emerald-950">
              5. ตรวจสอบทะเบียนยาออนไลน์
            </h3>
          </div>
          <span aria-hidden="true" className="material-symbols-outlined text-neutral-400 group-hover:text-brand-primary text-2xl shrink-0 transition-colors">
            chevron_right
          </span>
        </button>

        {/* ── Feature 6: Symptom Guidelines ── */}
        <button
          type="button"
          id="feature-card-symptom-guideline"
          onClick={() => handleOpenModal('symptom-guideline')}
          className="w-full text-left bg-white p-3.5 sm:p-4 rounded-2xl border border-border-default shadow-xs hover:border-emerald-300 hover:bg-emerald-50/15 transition-all flex items-center gap-4 group active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-brand-border-subtle shadow-xs group-hover:scale-105 transition-transform bg-brand-surface p-1 flex items-center justify-center">
            <FeatureVisualSymptom className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-brand-primary leading-snug group-hover:text-emerald-950">
              6. ยาสมุนไพรตามกลุ่มอาการ
            </h3>
          </div>
          <span aria-hidden="true" className="material-symbols-outlined text-neutral-400 group-hover:text-brand-primary text-2xl shrink-0 transition-colors">
            chevron_right
          </span>
        </button>

        {/* ── Feature 7: Herbal Substitute for Conventional Drugs ── */}
        <button
          type="button"
          id="feature-card-herbal-substitute"
          onClick={() => handleOpenModal('herbal-substitute')}
          className="w-full text-left bg-white p-3.5 sm:p-4 rounded-2xl border border-border-default shadow-xs hover:border-emerald-300 hover:bg-emerald-50/15 transition-all flex items-center gap-4 group active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-brand-border-subtle shadow-xs group-hover:scale-105 transition-transform bg-brand-surface p-1 flex items-center justify-center">
            <FeatureVisualSubstitute className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-brand-primary leading-snug group-hover:text-emerald-950">
              7. ยาสมุนไพรที่ใช้ทดแทนยาแผนปัจจุบัน
            </h3>
          </div>
          <span aria-hidden="true" className="material-symbols-outlined text-neutral-400 group-hover:text-brand-primary text-2xl shrink-0 transition-colors">
            chevron_right
          </span>
        </button>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. MODALS RENDERING                                        */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeModal === 'organ-safety' && (
        <OrganSafetyModal profile={profile} onClose={handleCloseModal} />
      )}

      {activeModal === 'born-vs-current' && (
        <BornVsCurrentModal 
          profile={profile} 
          onUpdateProfile={onUpdateProfile}
          onRequestEditProfile={() => {
            handleCloseModal();
            setIsEditingProfile(true);
          }}
          onClose={handleCloseModal} 
        />
      )}

      {activeModal === 'drug-interaction' && (
        <DrugInteractionModal profile={profile} onClose={handleCloseModal} />
      )}

      {activeModal === 'g2c-registry' && (
        <G2CRegistryModal onClose={handleCloseModal} />
      )}

      {activeModal === 'seasonal-transition' && (
        <SeasonalTransitionModal onClose={handleCloseModal} />
      )}

      {activeModal === 'symptom-guideline' && (
        <SymptomGuidelineModal profile={profile} onClose={handleCloseModal} />
      )}

      {activeModal === 'herbal-substitute' && (
        <HerbalSubstituteModal profile={profile} onClose={handleCloseModal} />
      )}

      {isEditingProfile && (
        <QuickProfileEditorModal 
          profile={profile} 
          onSave={onUpdateProfile} 
          onClose={() => setIsEditingProfile(false)} 
        />
      )}

    </div>
  );
}
