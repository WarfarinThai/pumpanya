import React from 'react';
import { getCurrentSeasonalData } from '../data/elementsAndSafety';
import InfoDialog from './InfoDialog';
import { FeatureVisualSeason } from './FeatureVisuals';

interface SeasonalTransitionModalProps {
  onClose: () => void;
}

export default function SeasonalTransitionModal({ onClose }: SeasonalTransitionModalProps) {
  const season = getCurrentSeasonalData();

  return (
    <InfoDialog
      isOpen={true}
      customChrome
      title="2. ปรับสมดุลตามฤดูกาล & ไข้หัวลม (กาลสมุฏฐาน)"
      ariaLabelledBy="seasonal-transition-modal-title"
      ariaDescribedBy="seasonal-transition-modal-desc"
      onClose={onClose}
      maxWidth="max-w-md"
      maxHeight="max-h-[90vh]"
      overlayClassName="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      className="bg-white rounded-3xl w-full overflow-y-auto p-5 sm:p-6 shadow-2xl border border-border-default flex flex-col gap-4"
    >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-brand-border-subtle/80 shadow-3xs flex items-center justify-center">
              <FeatureVisualSeason className="w-full h-full" />
            </div>
            <div>
              <h3 id="seasonal-transition-modal-title" className="text-sm sm:text-base font-bold text-brand-primary">2. ปรับสมดุลตามฤดูกาล &amp; ไข้หัวลม (กาลสมุฏฐาน)</h3>
              <p id="seasonal-transition-modal-desc" className="text-xs text-text-muted">ป้องกันไข้หัวลมและปรับรสอาหารล่วงหน้า</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-1.5 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full cursor-pointer transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Current Season Banner */}
        <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-800">สภาวะฤดูกาลปัจจุบัน</span>
            <span className="text-xs bg-teal-200/80 text-teal-900 font-bold px-2.5 py-0.5 rounded-full">
              กาลสมุฏฐาน
            </span>
          </div>

          <div className="text-base font-bold text-brand-primary">
            {season.seasonName}
          </div>

          <div className="text-sm font-bold text-teal-900">
            ธาตุที่ได้รับผลกระทบ: {season.affectedElement}
          </div>

          <div className="p-3 rounded-xl bg-white border border-teal-100 text-[15px] text-text-primary leading-relaxed">
            {season.healthAlert}
          </div>
        </div>

        {/* Food Recommendations */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col gap-2">
          <strong className="text-sm font-bold text-brand-primary flex items-center gap-1.5">
            <span aria-hidden="true" className="material-symbols-outlined text-base text-amber-700">soup_kitchen</span>
            <span>เมนูอาหารปรับธาตุแนะนำประจำช่วงนี้:</span>
          </strong>
          <ul className="flex flex-col gap-1.5 text-sm text-text-secondary leading-relaxed">
            {season.foodAdvice.map((food, idx) => (
              <li key={idx} className="flex items-start gap-1.5 p-2 rounded-lg bg-white border border-neutral-100 font-medium">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>{food}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Drink Recommendations */}
        <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col gap-2">
          <strong className="text-sm font-bold text-brand-primary flex items-center gap-1.5">
            <span aria-hidden="true" className="material-symbols-outlined text-base text-emerald-700">local_cafe</span>
            <span>เครื่องดื่มสมุนไพรอุ่นๆ ช่วยป้องกันไข้:</span>
          </strong>
          <ul className="flex flex-col gap-1.5 text-sm text-text-secondary leading-relaxed">
            {season.drinkAdvice.map((drink, idx) => (
              <li key={idx} className="flex items-start gap-1.5 p-2 rounded-lg bg-white border border-neutral-100 font-medium">
                <span className="text-teal-700 font-bold">🍵</span>
                <span>{drink}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 rounded-2xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-hover transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          เข้าใจวิธีรับมือไข้เปลี่ยนฤดู
        </button>

    </InfoDialog>
  );
}
