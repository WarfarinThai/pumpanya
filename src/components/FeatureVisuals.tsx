import React from 'react';

interface FeatureVisualProps {
  className?: string;
}

/**
 * THAITWIN Soft Visual Anchor System (Sprint 3)
 * Modern Botanical Healthcare Editorial Visual Anchors
 * 
 * Composition:
 * 1. One large dominant Material Symbol (already loaded in project)
 * 2. One soft organic backplate with asymmetrical unequal corner radii
 * 3. Soft ambient background aura layer for organic depth
 * 4. Restrained botanical accent node
 * 
 * Aesthetic:
 * - Soft, organic, botanical/editorial healthcare product
 * - Calming, cohesive, and premium across all 7 tools
 * - No rigid icons, badges, logos, technical line art, or cartoons
 * - 100% accessible (aria-hidden="true")
 */

/** 1. Born vs Current: ธาตุเจ้าเรือนเกิด และอาหารปรับสมดุลธาตุ */
export function FeatureVisualBirth({ className = 'w-full h-full' }: FeatureVisualProps) {
  return (
    <div
      className={`relative flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-br from-[#fcfbf9] to-[#f4f8f5] ${className}`}
      aria-hidden="true"
    >
      {/* Soft Layer 1: Ambient offset organic aura */}
      <div className="absolute w-10 h-10 rounded-[45%_55%_65%_35%/35%_45%_55%_65%] bg-amber-100/50 -rotate-6 transform-gpu" />

      {/* Soft Layer 2: Primary organic botanical backplate */}
      <div className="relative w-9 h-9 rounded-[20px_14px_22px_16px] bg-gradient-to-br from-[#eaf6ef] to-[#d4ebde] shadow-3xs flex items-center justify-center rotate-3 transform-gpu">
        {/* Dominant Material Symbol */}
        <span
          className="material-symbols-outlined text-[24px] text-brand-primary -rotate-3 transition-transform group-hover:scale-105"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24" }}
        >
          balance
        </span>
      </div>

      {/* Subtle botanical seed accent */}
      <div className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-[#c59b48]/70" />
    </div>
  );
}

/** 2. Seasonal Transition: ปรับสมดุลตามฤดูกาล & ไข้หัวลม */
export function FeatureVisualSeason({ className = 'w-full h-full' }: FeatureVisualProps) {
  return (
    <div
      className={`relative flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-br from-[#fbfdfc] to-[#f0f8f4] ${className}`}
      aria-hidden="true"
    >
      {/* Soft Layer 1: Ambient seasonal movement aura */}
      <div className="absolute w-10 h-10 rounded-[55%_45%_35%_65%/45%_60%_40%_55%] bg-teal-100/50 rotate-12 transform-gpu" />

      {/* Soft Layer 2: Primary cyclical transition backplate */}
      <div className="relative w-9 h-9 rounded-[16px_22px_15px_24px] bg-gradient-to-br from-[#ecfdf5] to-[#cbf7df] shadow-3xs flex items-center justify-center -rotate-3 transform-gpu">
        {/* Dominant Material Symbol */}
        <span
          className="material-symbols-outlined text-[24px] text-emerald-800 rotate-3 transition-transform group-hover:scale-105"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24" }}
        >
          autorenew
        </span>
      </div>

      {/* Subtle seasonal breeze droplet accent */}
      <div className="absolute top-2 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
    </div>
  );
}

/** 3. Organ Safety: ข้อมูลความปลอดภัยของสมุนไพร */
export function FeatureVisualSafety({ className = 'w-full h-full' }: FeatureVisualProps) {
  return (
    <div
      className={`relative flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-br from-[#fcfdfc] to-[#f2f8f5] ${className}`}
      aria-hidden="true"
    >
      {/* Soft Layer 1: Ambient health protection aura */}
      <div className="absolute w-10 h-10 rounded-[48%_52%_62%_38%/40%_55%_45%_60%] bg-emerald-200/40 -rotate-6 transform-gpu" />

      {/* Soft Layer 2: Primary protective botanical backplate */}
      <div className="relative w-9 h-9 rounded-[22px_16px_24px_18px] bg-gradient-to-br from-[#f0f9f4] to-[#d4ede0] shadow-3xs flex items-center justify-center rotate-2 transform-gpu">
        {/* Dominant Material Symbol */}
        <span
          className="material-symbols-outlined text-[24px] text-emerald-950 -rotate-2 transition-transform group-hover:scale-105"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24" }}
        >
          health_and_safety
        </span>
      </div>

      {/* Subtle herbal leaf node accent */}
      <div className="absolute bottom-2 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-600/70" />
    </div>
  );
}

/** 4. Drug Interaction: ตรวจสอบยาตีกัน & รสยาขัดแย้ง */
export function FeatureVisualInteraction({ className = 'w-full h-full' }: FeatureVisualProps) {
  return (
    <div
      className={`relative flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-br from-[#fafcff] to-[#f0f6fa] ${className}`}
      aria-hidden="true"
    >
      {/* Soft Layer 1: Ambient medication relationship aura */}
      <div className="absolute w-10 h-10 rounded-[60%_40%_48%_52%/45%_55%_45%_55%] bg-sky-100/60 rotate-6 transform-gpu" />

      {/* Soft Layer 2: Primary pharmaceutical screening backplate */}
      <div className="relative w-9 h-9 rounded-[18px_24px_16px_22px] bg-gradient-to-br from-[#f0f9ff] to-[#d7ecfb] shadow-3xs flex items-center justify-center -rotate-2 transform-gpu">
        {/* Dominant Material Symbol */}
        <span
          className="material-symbols-outlined text-[24px] text-cyan-950 rotate-2 transition-transform group-hover:scale-105"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24" }}
        >
          medication
        </span>
      </div>

      {/* Subtle interaction relationship link dot */}
      <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-teal-600/60" />
    </div>
  );
}

/** 5. G2C Registry: ตรวจสอบทะเบียนยาออนไลน์ */
export function FeatureVisualRegistry({ className = 'w-full h-full' }: FeatureVisualProps) {
  return (
    <div
      className={`relative flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-br from-[#fcfdfc] to-[#f2f7f4] ${className}`}
      aria-hidden="true"
    >
      {/* Soft Layer 1: Ambient official verification aura */}
      <div className="absolute w-10 h-10 rounded-[40%_60%_55%_45%/55%_40%_60%_45%] bg-emerald-100/60 -rotate-12 transform-gpu" />

      {/* Soft Layer 2: Primary official registry certificate backplate */}
      <div className="relative w-9 h-9 rounded-[22px_18px_24px_16px] bg-gradient-to-br from-[#f6fcf8] to-[#d6efdf] shadow-3xs flex items-center justify-center rotate-3 transform-gpu">
        {/* Dominant Material Symbol */}
        <span
          className="material-symbols-outlined text-[24px] text-emerald-800 -rotate-3 transition-transform group-hover:scale-105"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24" }}
        >
          verified
        </span>
      </div>

      {/* Subtle official gold seal accent */}
      <div className="absolute bottom-1.5 right-2 w-1.5 h-1.5 rounded-full bg-[#c59b48]/80" />
    </div>
  );
}

/** 6. Symptom Guideline: ยาสมุนไพรตามกลุ่มอาการ */
export function FeatureVisualSymptom({ className = 'w-full h-full' }: FeatureVisualProps) {
  return (
    <div
      className={`relative flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-br from-[#fdfbf8] to-[#f6f3ed] ${className}`}
      aria-hidden="true"
    >
      {/* Soft Layer 1: Ambient clinical assessment aura */}
      <div className="absolute w-10 h-10 rounded-[52%_48%_65%_35%/38%_62%_38%_62%] bg-amber-100/50 rotate-6 transform-gpu" />

      {/* Soft Layer 2: Primary supportive guideline backplate */}
      <div className="relative w-9 h-9 rounded-[18px_22px_16px_24px] bg-gradient-to-br from-[#faf7f2] to-[#ebe1d2] shadow-3xs flex items-center justify-center -rotate-2 transform-gpu">
        {/* Dominant Material Symbol */}
        <span
          className="material-symbols-outlined text-[24px] text-brand-primary rotate-2 transition-transform group-hover:scale-105"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24" }}
        >
          clinical_notes
        </span>
      </div>

      {/* Subtle herbal remedy accent dot */}
      <div className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-[#1a6b4c]/60" />
    </div>
  );
}

/** 7. Herbal Substitute: ยาสมุนไพรที่ใช้ทดแทนยาแผนปัจจุบัน */
export function FeatureVisualSubstitute({ className = 'w-full h-full' }: FeatureVisualProps) {
  return (
    <div
      className={`relative flex items-center justify-center select-none overflow-hidden rounded-2xl bg-gradient-to-br from-[#fcfdfc] to-[#f2f8f5] ${className}`}
      aria-hidden="true"
    >
      {/* Soft Layer 1: Ambient dual-path consideration aura */}
      <div className="absolute w-10 h-10 rounded-[45%_55%_35%_65%/58%_42%_58%_42%] bg-emerald-100/50 -rotate-6 transform-gpu" />

      {/* Soft Layer 2: Primary alternative consideration backplate */}
      <div className="relative w-9 h-9 rounded-[24px_16px_22px_18px] bg-gradient-to-br from-[#f2f9f5] to-[#d5edd9] shadow-3xs flex items-center justify-center rotate-2 transform-gpu">
        {/* Dominant Material Symbol */}
        <span
          className="material-symbols-outlined text-[24px] text-emerald-800 -rotate-2 transition-transform group-hover:scale-105"
          style={{ fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 24" }}
        >
          alt_route
        </span>
      </div>

      {/* Subtle dual-option comparison dot */}
      <div className="absolute bottom-1.5 left-2 w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
    </div>
  );
}

/** Unified Feature Visual Dispatcher */
export function FeatureVisual({ featureId, className }: { featureId: string; className?: string }) {
  switch (featureId) {
    case 'born-vs-current':
      return <FeatureVisualBirth className={className} />;
    case 'seasonal-transition':
      return <FeatureVisualSeason className={className} />;
    case 'organ-safety':
      return <FeatureVisualSafety className={className} />;
    case 'drug-interaction':
      return <FeatureVisualInteraction className={className} />;
    case 'g2c-registry':
      return <FeatureVisualRegistry className={className} />;
    case 'symptom-guideline':
      return <FeatureVisualSymptom className={className} />;
    case 'herbal-substitute':
      return <FeatureVisualSubstitute className={className} />;
    default:
      return null;
  }
}
