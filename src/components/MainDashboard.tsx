import React, { useState, useEffect, useMemo } from 'react';
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
  fetchHerbalSafetyRecords,
  ThaiHerbalSafetyRecord
} from '../services/supabaseHerbalSafety';
import {
  FeatureVisualBirth,
  FeatureVisualSeason,
  FeatureVisualSafety,
  FeatureVisualInteraction,
  FeatureVisualRegistry,
  FeatureVisualSymptom,
  FeatureVisualSubstitute
} from './FeatureVisuals';

const POPULAR_PREPARATIONS = [
  'ฟ้าทะลายโจร',
  'ขมิ้นชัน',
  'ยาปราบชมพูทวีป',
  'ยาตรีผลา',
  'ยาบำรุงโลหิต',
  'ยาสหัศธารา',
  'ยาจันทน์ลีลา',
  'ยาหอมนวโกฐ'
];

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
  const [selectedHerbForJourney, setSelectedHerbForJourney] = useState<number | null>(null);
  const [herbalRecords, setHerbalRecords] = useState<ThaiHerbalSafetyRecord[]>([]);
  const [prepSearchQuery, setPrepSearchQuery] = useState('');

  const activeModal = activeFeature !== undefined ? activeFeature : localActiveModal;

  useEffect(() => {
    fetchHerbalSafetyRecords()
      .then(data => setHerbalRecords(data))
      .catch(err => console.error('Error prefetching herbs in dashboard:', err));
  }, []);

  const matchingHerbs = useMemo(() => {
    const q = prepSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return herbalRecords
      .filter(h =>
        h.monograph_th.toLowerCase().includes(q) ||
        (h.english_title && h.english_title.toLowerCase().includes(q)) ||
        (h.definition && h.definition.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [herbalRecords, prepSearchQuery]);

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

  const handleSelectPreparation = (herb: ThaiHerbalSafetyRecord) => {
    setSelectedHerbForJourney(herb.id);
    setPrepSearchQuery('');
    handleOpenModal('organ-safety');
  };

  const birthInfo = getBirthElement(profile.birthMonth);

  const hasOrganRisk = Boolean(
    profile.hasLiverDisease ||
    profile.hasKidneyDisease ||
    profile.chronicConditions.some(c => c.includes('ตับ') || c.includes('ไต'))
  );
  const isOrganExplicitlyNormal =
    profile.hasLiverDisease === false &&
    profile.hasKidneyDisease === false &&
    !profile.chronicConditions.some(c => c.includes('ตับ') || c.includes('ไต'));
  const hasExplicitlyNoMedications =
    Array.isArray(profile.drugCategoryIds) &&
    profile.drugCategoryIds.length === 0 &&
    profile.medications.length === 0;

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
                : isOrganExplicitlyNormal
                ? 'text-success-primary'
                : 'text-text-muted'
            }`}>
              {hasOrganRisk
                ? '⚠️ มีภาวะโรคตับ/ไต'
                : isOrganExplicitlyNormal
                ? '✓ ปกติ (ไม่มีประวัติโรคตับ/ไต)'
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
                  : hasExplicitlyNoMedications
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
            ) : hasExplicitlyNoMedications ? (
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
      {/* 1.5 PREPARATION-FIRST SAFETY JOURNEY QUICK FINDER          */}
      {/* ────────────────────────────────────────────────────────── */}
      <section aria-labelledby="prep-journey-heading" className="w-full bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-border-default flex flex-col gap-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-100 pb-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-brand-surface text-brand-primary border border-brand-border-subtle flex items-center justify-center shrink-0 shadow-3xs" aria-hidden="true">
              <span aria-hidden="true" className="material-symbols-outlined text-xl">medication_liquid</span>
            </div>
            <div className="flex flex-col min-w-0">
              <h2 id="prep-journey-heading" className="text-base sm:text-lg font-bold text-brand-primary leading-snug">
                คัดกรองตำรับยาสมุนไพร (Preparation-First Safety)
              </h2>
              <p className="text-xs sm:text-sm text-text-muted font-medium mt-0.5">
                ค้นหาตำรับยาแผนโบราณหรือสมุนไพรเดี่ยวจาก 294 รายการ เพื่อตรวจส่วนประกอบ ความปลอดภัยตับ/ไต และยาตีกัน
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 shrink-0 self-start sm:self-auto">
            294 ตำรับอ้างอิง
          </span>
        </div>

        {/* Search input with live suggestion dropdown */}
        <div className="relative">
          <div className="relative flex items-center">
            <span aria-hidden="true" className="material-symbols-outlined text-neutral-400 absolute left-3.5 text-lg pointer-events-none">
              search
            </span>
            <input
              type="text"
              aria-label="ค้นหาตำรับยาสมุนไพร"
              placeholder="ค้นหาชื่อตำรับหรือสมุนไพร เช่น ฟ้าทะลายโจร, ขมิ้นชัน, ยาปราบชมพูทวีป..."
              value={prepSearchQuery}
              onChange={(e) => setPrepSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-10 bg-surface-muted border border-border-default rounded-xl text-xs sm:text-sm font-semibold text-text-primary placeholder:text-neutral-400 focus-visible:outline-none focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/20 transition-all"
            />
            {prepSearchQuery && (
              <button
                type="button"
                onClick={() => setPrepSearchQuery('')}
                aria-label="ล้างการค้นหา"
                className="absolute right-1 w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-neutral-700 rounded-lg cursor-pointer"
              >
                <span aria-hidden="true" className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          {/* Live matches dropdown */}
          {prepSearchQuery.trim() && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-white rounded-2xl border border-neutral-200 shadow-lg overflow-hidden flex flex-col divide-y divide-neutral-100 max-h-72 overflow-y-auto">
              {matchingHerbs.length > 0 ? (
                matchingHerbs.map((h) => {
                  const isFormula =
                    h.monograph_th.startsWith('ยา') ||
                    h.monograph_th.startsWith('พิกัด') ||
                    h.definition?.includes('ประกอบด้วย');
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => handleSelectPreparation(h)}
                      className="w-full text-left p-3 hover:bg-emerald-50/40 flex items-center justify-between gap-3 transition-colors cursor-pointer group"
                    >
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-brand-primary group-hover:text-emerald-950">
                            🌿 {h.monograph_th}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600">
                            {isFormula ? 'ตำรับยาแผนโบราณ' : 'สมุนไพรเดี่ยว'}
                          </span>
                        </div>
                        {h.english_title && (
                          <span className="text-xs text-neutral-500 italic truncate mt-0.5">
                            {h.english_title}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-brand-primary font-bold shrink-0">
                        <span>ตรวจความปลอดภัย</span>
                        <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_forward</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-xs sm:text-sm text-neutral-500 text-center font-medium">
                  ไม่พบรายการที่ตรงกับคำค้นหา &ldquo;{prepSearchQuery}&rdquo; ใน 294 รายการ
                </div>
              )}
            </div>
          )}
        </div>

        {/* High-frequency folk preparations quick chips */}
        <div className="flex flex-col gap-2 pt-0.5">
          <span className="text-xs font-semibold text-text-muted flex items-center gap-1">
            <span aria-hidden="true" className="material-symbols-outlined text-sm text-brand-secondary">stars</span>
            <span>ตำรับยาและสมุนไพรใช้บ่อย (แตะเพื่อเริ่มตรวจความปลอดภัยทันที):</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_PREPARATIONS.map((name) => {
              const matched = herbalRecords.find(
                h => h.monograph_th === name || h.monograph_th.includes(name)
              );
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    if (matched) {
                      handleSelectPreparation(matched);
                    } else {
                      handleOpenModal('organ-safety');
                    }
                  }}
                  className="min-h-[40px] px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-emerald-50 active:bg-emerald-100 border border-border-default hover:border-emerald-300 text-xs sm:text-sm font-bold text-neutral-800 hover:text-brand-primary transition-all cursor-pointer shadow-3xs flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>{name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

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
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 border border-brand-border-subtle/80 shadow-3xs group-hover:scale-105 transition-transform flex items-center justify-center">
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
          className="w-full text-left bg-white p-3 sm:p-4 rounded-2xl border border-border-default shadow-xs hover:border-emerald-300 hover:bg-emerald-50/15 transition-all flex items-center gap-3 sm:gap-4 group active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 border border-brand-border-subtle/80 shadow-3xs group-hover:scale-105 transition-transform flex items-center justify-center">
            <FeatureVisualSeason className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-brand-primary leading-snug group-hover:text-emerald-950">
              2. ปรับสมดุลตามฤดูกาล &amp; ไข้หัวลม
            </h3>
          </div>
          <span aria-hidden="true" className="material-symbols-outlined text-neutral-400 group-hover:text-brand-primary text-xl sm:text-2xl shrink-0 transition-colors">
            chevron_right
          </span>
        </button>

        {/* ── Feature 3: Organ Safety ── */}
        <button
          type="button"
          id="feature-card-organ-safety"
          onClick={() => handleOpenModal('organ-safety')}
          className="w-full text-left bg-white p-3 sm:p-4 rounded-2xl border border-border-default shadow-xs hover:border-emerald-300 hover:bg-emerald-50/15 transition-all flex items-center gap-3 sm:gap-4 group active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 border border-brand-border-subtle/80 shadow-3xs group-hover:scale-105 transition-transform flex items-center justify-center">
            <FeatureVisualSafety className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-brand-primary leading-snug group-hover:text-emerald-950">
              3. ข้อมูลความปลอดภัยของสมุนไพร
            </h3>
          </div>
          <span aria-hidden="true" className="material-symbols-outlined text-neutral-400 group-hover:text-brand-primary text-xl sm:text-2xl shrink-0 transition-colors">
            chevron_right
          </span>
        </button>

        {/* ── Feature 4: Prescription Contraindication ── */}
        <button
          type="button"
          id="feature-card-drug-interaction"
          onClick={() => handleOpenModal('drug-interaction')}
          className="w-full text-left bg-white p-3 sm:p-4 rounded-2xl border border-border-default shadow-xs hover:border-emerald-300 hover:bg-emerald-50/15 transition-all flex items-center gap-3 sm:gap-4 group active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 border border-brand-border-subtle/80 shadow-3xs group-hover:scale-105 transition-transform flex items-center justify-center">
            <FeatureVisualInteraction className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-brand-primary leading-snug group-hover:text-emerald-950">
              4. ตรวจสอบยาตีกัน &amp; รสยาขัดแย้ง
            </h3>
          </div>
          <span aria-hidden="true" className="material-symbols-outlined text-neutral-400 group-hover:text-brand-primary text-xl sm:text-2xl shrink-0 transition-colors">
            chevron_right
          </span>
        </button>

        {/* ── Feature 5: G2C Registry Scanner ── */}
        <button
          type="button"
          id="feature-card-g2c-registry"
          onClick={() => handleOpenModal('g2c-registry')}
          className="w-full text-left bg-white p-3 sm:p-4 rounded-2xl border border-border-default shadow-xs hover:border-emerald-300 hover:bg-emerald-50/15 transition-all flex items-center gap-3 sm:gap-4 group active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 border border-brand-border-subtle/80 shadow-3xs group-hover:scale-105 transition-transform flex items-center justify-center">
            <FeatureVisualRegistry className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-brand-primary leading-snug group-hover:text-emerald-950">
              5. ตรวจสอบทะเบียนยาออนไลน์
            </h3>
          </div>
          <span aria-hidden="true" className="material-symbols-outlined text-neutral-400 group-hover:text-brand-primary text-xl sm:text-2xl shrink-0 transition-colors">
            chevron_right
          </span>
        </button>

        {/* ── Feature 6: Symptom Guidelines ── */}
        <button
          type="button"
          id="feature-card-symptom-guideline"
          onClick={() => handleOpenModal('symptom-guideline')}
          className="w-full text-left bg-white p-3 sm:p-4 rounded-2xl border border-border-default shadow-xs hover:border-emerald-300 hover:bg-emerald-50/15 transition-all flex items-center gap-3 sm:gap-4 group active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 border border-brand-border-subtle/80 shadow-3xs group-hover:scale-105 transition-transform flex items-center justify-center">
            <FeatureVisualSymptom className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-brand-primary leading-snug group-hover:text-emerald-950">
              6. ยาสมุนไพรตามกลุ่มอาการ
            </h3>
          </div>
          <span aria-hidden="true" className="material-symbols-outlined text-neutral-400 group-hover:text-brand-primary text-xl sm:text-2xl shrink-0 transition-colors">
            chevron_right
          </span>
        </button>

        {/* ── Feature 7: Herbal Substitute for Conventional Drugs ── */}
        <button
          type="button"
          id="feature-card-herbal-substitute"
          onClick={() => handleOpenModal('herbal-substitute')}
          className="w-full text-left bg-white p-3 sm:p-4 rounded-2xl border border-border-default shadow-xs hover:border-emerald-300 hover:bg-emerald-50/15 transition-all flex items-center gap-3 sm:gap-4 group active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shrink-0 border border-brand-border-subtle/80 shadow-3xs group-hover:scale-105 transition-transform flex items-center justify-center">
            <FeatureVisualSubstitute className="w-full h-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-brand-primary leading-snug group-hover:text-emerald-950">
              7. ยาสมุนไพรที่ใช้ทดแทนยาแผนปัจจุบัน
            </h3>
          </div>
          <span aria-hidden="true" className="material-symbols-outlined text-neutral-400 group-hover:text-brand-primary text-xl sm:text-2xl shrink-0 transition-colors">
            chevron_right
          </span>
        </button>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────── */}
      {/* 3. MODALS RENDERING                                        */}
      {/* ────────────────────────────────────────────────────────── */}
      {activeModal === 'organ-safety' && (
        <OrganSafetyModal
          profile={profile}
          initialHerbId={selectedHerbForJourney}
          onCheckInteraction={(herb) => {
            setSelectedHerbForJourney(herb.id);
            handleOpenModal('drug-interaction');
          }}
          onClose={handleCloseModal}
        />
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
        <DrugInteractionModal
          profile={profile}
          initialHerbId={selectedHerbForJourney}
          onViewSafetyMonograph={(herb) => {
            setSelectedHerbForJourney(herb.id);
            handleOpenModal('organ-safety');
          }}
          onClose={handleCloseModal}
        />
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
