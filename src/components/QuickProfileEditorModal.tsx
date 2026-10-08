import React, { useState } from 'react';
import { HealthProfile, Medication } from '../types';
import { MONTH_ELEMENT_LIST } from '../data/elementsAndSafety';
import { STANDARD_DRUG_CATEGORIES, StandardDrugCategory } from '../data/standardDrugCategories';
import InfoDialog from './InfoDialog';

interface QuickProfileEditorModalProps {
  profile: HealthProfile;
  onSave: (updated: HealthProfile) => void;
  onClose: () => void;
}

export default function QuickProfileEditorModal({ profile, onSave, onClose }: QuickProfileEditorModalProps) {
  const [birthMonth, setBirthMonth] = useState<string>(profile.birthMonth || '');
  const [hasLiver, setHasLiver] = useState(profile.hasLiverDisease || false);
  const [hasKidney, setHasKidney] = useState(profile.hasKidneyDisease || false);

  // Derive initially selected categories from profile.drugCategoryIds or existing medications
  const initialCategoryIds = (): string[] => {
    if (profile.drugCategoryIds && profile.drugCategoryIds.length > 0) {
      return [...profile.drugCategoryIds];
    }
    // Backward compatibility: match existing profile.medications to categories
    const matched = new Set<string>();
    profile.medications.forEach(m => {
      const name = m.name.toLowerCase();
      STANDARD_DRUG_CATEGORIES.forEach(cat => {
        if (cat.keywords.some(k => name.includes(k.toLowerCase())) ||
            name.includes(cat.id)) {
          matched.add(cat.id);
        }
      });
    });
    return Array.from(matched);
  };

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(initialCategoryIds());

  // Toggle category
  const toggleCategory = (catId: string) => {
    setSelectedCategoryIds(prev => {
      if (prev.includes(catId)) {
        return prev.filter(id => id !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

  // Clear all medications (no routine drugs)
  const handleSelectNone = () => {
    setSelectedCategoryIds([]);
  };

  const handleSave = () => {
    // Generate standardized medication objects from selected categories
    const updatedMeds: Medication[] = selectedCategoryIds.map((catId, idx) => {
      const cat = STANDARD_DRUG_CATEGORIES.find(c => c.id === catId);
      return {
        id: String(idx + 1),
        name: cat ? cat.categoryName : catId,
        dosage: 'ทานประจำ',
        frequency: 'ประจำวัน',
        categoryId: catId,
        notes: cat ? cat.commonExamples : ''
      };
    });

    const updated: HealthProfile = {
      ...profile,
      birthMonth: birthMonth ? birthMonth : undefined,
      hasLiverDisease: hasLiver,
      hasKidneyDisease: hasKidney,
      medications: updatedMeds,
      drugCategoryIds: selectedCategoryIds
    };

    onSave(updated);
    onClose();
  };

  const isNoneSelected = selectedCategoryIds.length === 0;

  return (
    <InfoDialog
      isOpen={true}
      customChrome
      title="แก้ไขข้อมูลสุขภาพและธาตุ"
      ariaLabelledBy="quick-profile-editor-modal-title"
      ariaDescribedBy="quick-profile-editor-modal-desc"
      onClose={onClose}
      maxWidth="max-w-lg"
      maxHeight="max-h-[92vh]"
      overlayClassName="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      className="bg-white rounded-3xl w-full overflow-y-auto p-4 sm:p-6 shadow-2xl border border-neutral-200 flex flex-col gap-4"
    >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div aria-hidden="true" className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center shadow-3xs">
              <span aria-hidden="true" className="material-symbols-outlined text-xl">clinical_notes</span>
            </div>
            <div>
              <h3 id="quick-profile-editor-modal-title" className="font-semibold text-base sm:text-lg text-brand-primary">แก้ไขข้อมูลสุขภาพและธาตุ</h3>
              <p id="quick-profile-editor-modal-desc" className="text-xs text-neutral-500 font-semibold">ระบุข้อมูลจริงเพื่อคัดกรองความปลอดภัยอย่างแม่นยำ</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            aria-label="ปิดหน้าต่าง"
            className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-1.5 flex items-center justify-center text-neutral-600 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* 1. Birth Month */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="quick-profile-birth-month" className="text-xs sm:text-sm font-bold text-neutral-800 flex items-center gap-1.5">
            <span aria-hidden="true" className="material-symbols-outlined text-emerald-700 text-base">calendar_month</span>
            <span>1. เดือนเกิด (เพื่อคำนวณธาตุกำเนิด):</span>
          </label>
          <select
            id="quick-profile-birth-month"
            value={birthMonth}
            onChange={(e) => setBirthMonth(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm border border-neutral-600 rounded-xl bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary font-bold text-neutral-900 shadow-3xs cursor-pointer"
          >
            <option value="">-- ยังไม่ได้ระบุเดือนเกิด (แตะเพื่อเลือกเดือนเกิด) --</option>
            {MONTH_ELEMENT_LIST.map((m) => (
              <option key={m.month} value={m.month}>
                {m.month} - {m.elementName}
              </option>
            ))}
          </select>
        </div>

        {/* 2. Organ Safety (Liver/Kidney Lock) */}
        <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-rose-50/40 border border-rose-200/80">
          <label className="text-sm sm:text-[15px] font-bold text-rose-950 flex items-center gap-1.5">
            <span aria-hidden="true" className="material-symbols-outlined text-base text-rose-600">health_and_safety</span>
            <span>2. ประวัติโรคตับและโรคไต:</span>
          </label>
          
          <div className="flex flex-col gap-2 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none text-sm sm:text-[15px] p-2.5 rounded-xl bg-white border border-rose-200/60 hover:bg-rose-50/50 transition-colors leading-relaxed">
              <input
                type="checkbox"
                checked={hasLiver}
                onChange={(e) => setHasLiver(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer shrink-0"
              />
              <span className={hasLiver ? 'font-bold text-rose-900' : 'text-neutral-700 font-medium'}>
                มีประวัติโรคตับ (เช่น ไวรัสตับอักเสบ, ตับแข็ง, ค่าเอนไซม์ตับผิดปกติ)
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none text-sm sm:text-[15px] p-2.5 rounded-xl bg-white border border-rose-200/60 hover:bg-rose-50/50 transition-colors leading-relaxed">
              <input
                type="checkbox"
                checked={hasKidney}
                onChange={(e) => setHasKidney(e.target.checked)}
                className="w-4 h-4 rounded text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 cursor-pointer shrink-0"
              />
              <span className={hasKidney ? 'font-bold text-rose-900' : 'text-neutral-700 font-medium'}>
                มีประวัติโรคไต (เช่น ไตวายเรื้อรัง, ค่าการทำงานของไต eGFR ต่ำ)
              </span>
            </label>
          </div>
        </div>

        {/* 3. Standard Drug Categories Selection (No free text, 100% closed choice) */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold text-neutral-900 flex items-center gap-1.5">
              <span aria-hidden="true" className="material-symbols-outlined text-base text-blue-700">medication</span>
              <span>3. กลุ่มยาแผนปัจจุบันที่ท่านรับประทานเป็นประจำ:</span>
            </label>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              {isNoneSelected ? 'ไม่มียาประจำตัว' : `เลือกแล้ว ${selectedCategoryIds.length} กลุ่ม`}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            แตะเลือกกลุ่มยาตามฉลากซองยาของท่าน (เลือกได้หลายข้อ) เพื่อให้ระบบตรวจจับยาตีกันกับฐานข้อมูลตำราสมุนไพรได้อย่างแม่นยำ
          </p>

          {/* Quick Clear / None button */}
          <button
            type="button"
            onClick={handleSelectNone}
            className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
              isNoneSelected
                ? 'bg-emerald-900 text-white border-emerald-950 shadow-xs'
                : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="material-symbols-outlined text-lg">
                {isNoneSelected ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span className="text-xs sm:text-sm font-bold">
                ✓ สุขภาพดี ไม่ได้รับประทานยาแผนปัจจุบันเป็นประจำ
              </span>
            </div>
            {isNoneSelected && (
              <span className="text-xs font-bold bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded-md">
                เลือกอยู่
              </span>
            )}
          </button>

          {/* Category Cards List */}
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
            {STANDARD_DRUG_CATEGORIES.map((cat) => {
              const isSelected = selectedCategoryIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 shadow-3xs'
                      : 'bg-white hover:bg-neutral-50 border-neutral-200/90 text-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true" className="material-symbols-outlined text-base text-blue-700 shrink-0">
                        {cat.icon}
                      </span>
                      <span className={`text-sm font-bold leading-snug ${isSelected ? 'text-blue-950' : 'text-neutral-900'}`}>
                        {cat.categoryName}
                      </span>
                    </div>
                    <span aria-hidden="true" className="material-symbols-outlined text-lg shrink-0 text-blue-700">
                      {isSelected ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                  </div>

                  {/* Common drug examples */}
                  <div className="text-xs text-neutral-600 pl-6 leading-relaxed">
                    <strong className="text-neutral-700 font-bold">ตัวอย่างบนซองยา: </strong>
                    <span>{cat.commonExamples}</span>
                  </div>

                  {/* Clinical risk badge when selected */}
                  {isSelected && (
                    <div className="mt-1 pl-6 flex items-start gap-1.5 text-[15px] font-bold text-rose-700 leading-relaxed">
                      <span aria-hidden="true" className="material-symbols-outlined text-base shrink-0 mt-0.5">warning</span>
                      <span>{cat.clinicalRiskSummary}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 pt-2 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-xl bg-neutral-100 text-neutral-700 font-bold text-xs sm:text-sm hover:bg-neutral-200 transition-all cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 h-11 rounded-xl bg-brand-primary text-white font-bold text-xs sm:text-sm hover:bg-brand-hover transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-base">save</span>
            <span>บันทึกข้อมูล</span>
          </button>
        </div>

    </InfoDialog>
  );
}
