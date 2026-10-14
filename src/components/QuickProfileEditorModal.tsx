import React, { useState } from 'react';
import { HealthProfile, Medication } from '../types';
import { MONTH_ELEMENT_LIST } from '../data/elementsAndSafety';
import { STANDARD_DRUG_CATEGORIES } from '../data/standardDrugCategories';
import InfoDialog from './InfoDialog';

interface QuickProfileEditorModalProps {
  profile: HealthProfile;
  onSave: (updated: HealthProfile) => void;
  onClose: () => void;
}

export default function QuickProfileEditorModal({ profile, onSave, onClose }: QuickProfileEditorModalProps) {
  const [birthMonth, setBirthMonth] = useState<string>(profile.birthMonth || '');
  const [hasLiver, setHasLiver] = useState<boolean | undefined>(profile.hasLiverDisease);
  const [hasKidney, setHasKidney] = useState<boolean | undefined>(profile.hasKidneyDisease);
  const [isLiverTouched, setIsLiverTouched] = useState<boolean>(false);
  const [isKidneyTouched, setIsKidneyTouched] = useState<boolean>(false);

  // Derive initially selected categories from profile.drugCategoryIds or existing medications
  const getInitialCategories = (): string[] | null => {
    if (Array.isArray(profile.drugCategoryIds)) {
      return [...profile.drugCategoryIds];
    }
    // Backward compatibility: match existing profile.medications to categories
    if (profile.medications && profile.medications.length > 0) {
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
    }
    // Unanswered / not yet configured
    return null;
  };

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[] | null>(getInitialCategories());
  const [isMedicationsTouched, setIsMedicationsTouched] = useState<boolean>(false);

  // Toggle category
  const toggleCategory = (catId: string) => {
    setIsMedicationsTouched(true);
    setSelectedCategoryIds(prev => {
      const current = prev || [];
      if (current.includes(catId)) {
        return current.filter(id => id !== catId);
      } else {
        return [...current, catId];
      }
    });
  };

  // Clear all medications (explicitly no routine drugs)
  const handleSelectNone = () => {
    setIsMedicationsTouched(true);
    setSelectedCategoryIds([]);
  };

  // Reset medication section to unanswered
  const handleResetMedications = () => {
    setIsMedicationsTouched(true);
    setSelectedCategoryIds(null);
  };

  const handleSave = () => {
    const updatedHasLiver = isLiverTouched ? hasLiver : profile.hasLiverDisease;
    const updatedHasKidney = isKidneyTouched ? hasKidney : profile.hasKidneyDisease;

    let updatedDrugCategoryIds = profile.drugCategoryIds;
    let updatedMeds = profile.medications;

    if (isMedicationsTouched) {
      if (selectedCategoryIds === null) {
        updatedDrugCategoryIds = undefined;
        updatedMeds = [];
      } else {
        updatedDrugCategoryIds = selectedCategoryIds;
        updatedMeds = selectedCategoryIds.map((catId, idx) => {
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
      }
    }

    const updated: HealthProfile = {
      ...profile,
      birthMonth: birthMonth ? birthMonth : undefined,
      hasLiverDisease: updatedHasLiver,
      hasKidneyDisease: updatedHasKidney,
      medications: updatedMeds,
      drugCategoryIds: updatedDrugCategoryIds
    };

    onSave(updated);
    onClose();
  };

  const isNoneSelected = selectedCategoryIds !== null && selectedCategoryIds.length === 0;

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
      className="bg-white rounded-3xl w-full overflow-y-auto p-5 sm:p-6 shadow-2xl border border-border-default flex flex-col gap-4"
    >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
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
            className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-1.5 flex items-center justify-center text-neutral-600 hover:text-neutral-900 rounded-full hover:bg-neutral-100 transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-xl">close</span>
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

        {/* 2. Organ Safety (Liver/Kidney Status) */}
        <div className="flex flex-col gap-3 p-3.5 rounded-2xl bg-rose-50/40 border border-rose-200/80">
          <div className="flex items-center justify-between">
            <label className="text-sm sm:text-[15px] font-bold text-rose-950 flex items-center gap-1.5">
              <span aria-hidden="true" className="material-symbols-outlined text-base text-rose-600">health_and_safety</span>
              <span>2. ประวัติโรคตับและโรคไต:</span>
            </label>
            <span className="text-[11px] font-semibold text-rose-800 bg-rose-100/70 px-2 py-0.5 rounded-md">
              จำเป็นต่อการคัดกรองสมุนไพร
            </span>
          </div>
          
          {/* 2.1 Liver question */}
          <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-white border border-rose-200/60">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-neutral-900">
                ประวัติโรคตับ (เช่น ไวรัสตับอักเสบ, ตับแข็ง, ค่าเอนไซม์ตับผิดปกติ):
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1" role="radiogroup" aria-label="ประวัติโรคตับ">
              <button
                type="button"
                onClick={() => {
                  setHasLiver(true);
                  setIsLiverTouched(true);
                }}
                className={`py-2 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-bold text-center border transition-all cursor-pointer ${
                  hasLiver === true
                    ? 'bg-rose-600 text-white border-rose-700 shadow-xs ring-2 ring-rose-400/30'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                }`}
                aria-checked={hasLiver === true}
                role="radio"
              >
                ⚠️ มีประวัติโรค
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasLiver(false);
                  setIsLiverTouched(true);
                }}
                className={`py-2 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-bold text-center border transition-all cursor-pointer ${
                  hasLiver === false
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs ring-2 ring-emerald-400/30'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                }`}
                aria-checked={hasLiver === false}
                role="radio"
              >
                ✓ ไม่มีประวัติ
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasLiver(undefined);
                  setIsLiverTouched(true);
                }}
                className={`py-2 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-bold text-center border transition-all cursor-pointer ${
                  hasLiver === undefined
                    ? 'bg-neutral-700 text-white border-neutral-800 shadow-xs ring-2 ring-neutral-400/30'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                }`}
                aria-checked={hasLiver === undefined}
                role="radio"
              >
                ยังไม่ระบุ
              </button>
            </div>
          </div>

          {/* 2.2 Kidney question */}
          <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-white border border-rose-200/60">
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-neutral-900">
                ประวัติโรคไต (เช่น ไตวายเรื้อรัง, ค่าการทำงานของไต eGFR ต่ำ):
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 pt-1" role="radiogroup" aria-label="ประวัติโรคไต">
              <button
                type="button"
                onClick={() => {
                  setHasKidney(true);
                  setIsKidneyTouched(true);
                }}
                className={`py-2 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-bold text-center border transition-all cursor-pointer ${
                  hasKidney === true
                    ? 'bg-rose-600 text-white border-rose-700 shadow-xs ring-2 ring-rose-400/30'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                }`}
                aria-checked={hasKidney === true}
                role="radio"
              >
                ⚠️ มีประวัติโรค
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasKidney(false);
                  setIsKidneyTouched(true);
                }}
                className={`py-2 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-bold text-center border transition-all cursor-pointer ${
                  hasKidney === false
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs ring-2 ring-emerald-400/30'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                }`}
                aria-checked={hasKidney === false}
                role="radio"
              >
                ✓ ไม่มีประวัติ
              </button>
              <button
                type="button"
                onClick={() => {
                  setHasKidney(undefined);
                  setIsKidneyTouched(true);
                }}
                className={`py-2 px-1 sm:px-2 rounded-xl text-xs sm:text-sm font-bold text-center border transition-all cursor-pointer ${
                  hasKidney === undefined
                    ? 'bg-neutral-700 text-white border-neutral-800 shadow-xs ring-2 ring-neutral-400/30'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                }`}
                aria-checked={hasKidney === undefined}
                role="radio"
              >
                ยังไม่ระบุ
              </button>
            </div>
          </div>
        </div>

        {/* 3. Standard Drug Categories Selection */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold text-neutral-900 flex items-center gap-1.5">
              <span aria-hidden="true" className="material-symbols-outlined text-base text-blue-700">medication</span>
              <span>3. กลุ่มยาแผนปัจจุบันที่ท่านรับประทานเป็นประจำ:</span>
            </label>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                selectedCategoryIds === null
                  ? 'text-neutral-600 bg-neutral-100 border-neutral-300'
                  : isNoneSelected
                  ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
                  : 'text-blue-800 bg-blue-50 border-blue-200'
              }`}>
                {selectedCategoryIds === null
                  ? 'ยังไม่ได้ระบุ'
                  : isNoneSelected
                  ? 'ไม่มียาประจำตัว'
                  : `เลือกแล้ว ${selectedCategoryIds.length} กลุ่ม`}
              </span>
              {selectedCategoryIds !== null && (
                <button
                  type="button"
                  onClick={handleResetMedications}
                  className="text-[11px] text-neutral-500 hover:text-neutral-800 underline font-semibold cursor-pointer"
                  title="รีเซ็ตเป็นสถานะยังไม่ได้ระบุ"
                >
                  รีเซ็ต
                </button>
              )}
            </div>
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
              const isSelected = selectedCategoryIds !== null && selectedCategoryIds.includes(cat.id);
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
