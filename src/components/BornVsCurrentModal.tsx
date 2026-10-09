import React, { useState, useEffect, useCallback } from 'react';
import { HealthProfile } from '../types';
import { getBirthElement, MONTH_ELEMENT_LIST } from '../data/elementsAndSafety';
import {
  fetchElementConcepts,
  fetchElementProfiles,
  getProfileByElement,
  ElementConceptRecord,
  ElementProfileRecord
} from '../services/supabaseElements';
import ErrorState from './ErrorState';
import InfoDialog from './InfoDialog';
import { FeatureVisualBirth } from './FeatureVisuals';

interface BornVsCurrentModalProps {
  profile: HealthProfile;
  onUpdateProfile?: (updated: HealthProfile) => void;
  onRequestEditProfile?: () => void;
  onClose: () => void;
}

export default function BornVsCurrentModal({
  profile,
  onUpdateProfile,
  onRequestEditProfile,
  onClose
}: BornVsCurrentModalProps) {
  const birthInfo = getBirthElement(profile.birthMonth);

  // Step 1: 'concept' (ธาตุเจ้าเรือนคืออะไร)
  // Step 2: 'profile' (ลักษณะธาตุ, จุดอ่อนสุขภาพ, อาหาร/ผักผลไม้/เครื่องดื่มที่แนะนำ, เกร็ดความรู้)
  const [step, setStep] = useState<'concept' | 'profile'>('concept');
  const [concepts, setConcepts] = useState<ElementConceptRecord[]>([]);
  const [profiles, setProfiles] = useState<ElementProfileRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonthInput, setSelectedMonthInput] = useState<string>('');
  const [showMonthPicker, setShowMonthPicker] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [conceptsData, profilesData] = await Promise.all([
        fetchElementConcepts(),
        fetchElementProfiles()
      ]);
      setConcepts(conceptsData);
      setProfiles(profilesData);
    } catch (err) {
      console.error('Error fetching element concepts/profiles:', err);
      setConcepts([]);
      setProfiles([]);
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentProfile = birthInfo ? getProfileByElement(profiles, birthInfo.element) : undefined;
  const introConcept =
    concepts.find(c => c.section_key === 'intro' || c.section_key === 'overview' || c.section_key === 'element_concept') ||
    concepts[0];
  const isEmpty = !loading && !error && concepts.length === 0 && profiles.length === 0;

  const handleActionSetBirthMonth = () => {
    if (onRequestEditProfile) {
      onRequestEditProfile();
    } else {
      setStep('concept');
      setShowMonthPicker(true);
    }
  };

  const handleSaveInlineMonth = () => {
    if (!selectedMonthInput || !onUpdateProfile) return;
    onUpdateProfile({
      ...profile,
      birthMonth: selectedMonthInput
    });
    setShowMonthPicker(false);
  };

  const dialogTitle =
    step === 'concept' || !birthInfo
      ? 'ธาตุเจ้าเรือนคืออะไร'
      : `แนวทางบริโภคตามธาตุเจ้าเรือนเกิด (${birthInfo.elementName})`;

  return (
    <InfoDialog
      isOpen={true}
      customChrome
      title={dialogTitle}
      ariaLabelledBy="born-vs-current-modal-title"
      ariaDescribedBy="born-vs-current-modal-desc"
      onClose={onClose}
      maxWidth="max-w-lg"
      maxHeight="max-h-[90vh]"
      overlayClassName="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      className="bg-white rounded-3xl w-full overflow-y-auto p-5 sm:p-6 shadow-2xl border border-border-default flex flex-col gap-4"
    >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-brand-border-subtle/80 shadow-3xs flex items-center justify-center">
              <FeatureVisualBirth className="w-full h-full" />
            </div>
            <div>
              <h2 id="born-vs-current-modal-title" className="text-lg sm:text-xl font-bold text-brand-primary leading-snug">
                {dialogTitle}
              </h2>
              <p id="born-vs-current-modal-desc" className="text-xs text-text-muted font-medium mt-0.5">
                {step === 'concept' || !birthInfo
                  ? 'แนวคิดและทฤษฎีการแพทย์แผนไทย'
                  : `วิเคราะห์สำหรับผู้เกิดเดือน${profile.birthMonth}`}
              </p>
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

        {/* 1. LOADING STATE */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-neutral-500">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-semibold">กำลังโหลดข้อมูลธาตุเจ้าเรือน...</span>
          </div>
        ) : error ? (
          /* 2. ERROR STATE */
          <ErrorState
            message={error}
            onRetry={loadData}
          />
        ) : isEmpty ? (
          /* 3. EMPTY STATE */
          <div className="p-8 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-center flex flex-col items-center gap-3">
            <span aria-hidden="true" className="material-symbols-outlined text-3xl text-neutral-400">inbox</span>
            <p className="text-sm font-bold text-neutral-700">ไม่พบข้อมูลธาตุเจ้าเรือนในระบบ</p>
            <button
              type="button"
              onClick={loadData}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold cursor-pointer hover:bg-brand-hover"
            >
              ลองอีกครั้ง
            </button>
          </div>
        ) : step === 'concept' ? (
          /* ═══════════════════════════════════════════════════════════════ */
          /* 4. SUCCESS — STEP 1: ELEMENT CONCEPT EXPLANATION                */
          /* ═══════════════════════════════════════════════════════════════ */
          <div className="flex flex-col gap-4">
            
            {/* Concept Main Banner */}
            {introConcept && (
              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 flex flex-col gap-2.5 shadow-2xs">
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-emerald-800 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    menu_book
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-emerald-950">
                    {introConcept.title}
                  </h4>
                </div>
                <p className="text-sm text-emerald-950 leading-relaxed font-normal">
                  {introConcept.description}
                </p>
              </div>
            )}

            {/* Element Types definition list from table */}
            {introConcept?.element_types && introConcept.element_types.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs sm:text-sm font-bold text-neutral-700">
                  ประเภทของธาตุเจ้าเรือน:
                </span>
                <div className="grid grid-cols-1 gap-2.5">
                  {introConcept.element_types.map((t, idx) => (
                    <div 
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs flex items-start gap-3"
                    >
                      <span className="text-2xl shrink-0 mt-0.5">
                        {t.type_name.includes('เกิด') ? '🌱' : '👤'}
                      </span>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-brand-primary">
                          {t.type_name}
                        </span>
                        <span className="text-xs sm:text-sm text-neutral-600 leading-relaxed mt-0.5">
                          {t.determination_method}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User's Computed Birth Element Preview Banner OR Unspecified BirthMonth Warning */}
            {birthInfo ? (
              <>
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">
                      {birthInfo.element === 'ไฟ' ? '🔥' : birthInfo.element === 'ลม' ? '💨' : birthInfo.element === 'ดิน' ? '🌍' : '💧'}
                    </span>
                    <div>
                      <span className="text-xs text-neutral-500 font-bold block">ธาตุประจำตัวตามเดือนเกิดของคุณ:</span>
                      <span className="text-sm font-bold text-brand-primary">{birthInfo.elementName} (เดือน{profile.birthMonth})</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                    พร้อมดูคำแนะนำ
                  </span>
                </div>

                {/* Next Step Button */}
                <button
                  type="button"
                  onClick={() => setStep('profile')}
                  className="w-full h-12 rounded-2xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-hover active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>เข้าใจแล้ว ไปดูคำแนะนำสำหรับธาตุของคุณ</span>
                  <span aria-hidden="true" className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              </>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 flex flex-col gap-3">
                <div id="born-month-required-error" role="alert" className="flex items-start gap-2.5">
                  <span aria-hidden="true" className="material-symbols-outlined text-amber-700 text-2xl shrink-0">
                    calendar_month
                  </span>
                  <div className="flex flex-col">
                    <span className="text-sm sm:text-base font-bold text-amber-950">ยังไม่ได้ระบุเดือนเกิด</span>
                    <span className="text-xs sm:text-sm text-amber-900 font-medium mt-0.5 leading-relaxed">
                      กรุณาระบุเดือนเกิดของท่านก่อน เพื่อคำนวณธาตุเจ้าเรือนเกิดและรับคำแนะนำอาหารเฉพาะบุคคล
                    </span>
                  </div>
                </div>

                {showMonthPicker && onUpdateProfile ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      aria-label="เลือกเดือนเกิด"
                      aria-invalid={!selectedMonthInput ? 'true' : undefined}
                      aria-describedby={!selectedMonthInput ? 'born-month-required-error' : undefined}
                      value={selectedMonthInput}
                      onChange={(e) => setSelectedMonthInput(e.target.value)}
                      className="flex-1 min-h-[44px] px-3 py-2 text-xs sm:text-sm border border-amber-700 rounded-xl bg-white font-bold text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
                    >
                      <option value="">-- เลือกเดือนเกิด --</option>
                      {MONTH_ELEMENT_LIST.map((m) => (
                        <option key={m.month} value={m.month}>
                          {m.month} - {m.elementName}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={!selectedMonthInput}
                      onClick={handleSaveInlineMonth}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-brand-primary text-white text-xs sm:text-sm font-bold disabled:opacity-40 cursor-pointer"
                    >
                      บันทึกเดือนเกิด
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleActionSetBirthMonth}
                    className="w-full h-11 rounded-xl bg-brand-primary hover:bg-brand-hover text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-base">edit_calendar</span>
                    <span>ระบุเดือนเกิด</span>
                  </button>
                )}
              </div>
            )}

          </div>
        ) : !birthInfo ? (
          /* Safety Guard: Never generate personalized result without birthMonth */
          <div role="alert" className="p-5 rounded-2xl bg-amber-50/90 border border-amber-300 flex flex-col items-center text-center gap-3">
            <span aria-hidden="true" className="material-symbols-outlined text-amber-700 text-3xl">calendar_month</span>
            <div className="flex flex-col gap-1">
              <span className="text-base font-bold text-amber-950">ยังไม่ได้ระบุเดือนเกิด</span>
              <span className="text-xs sm:text-sm text-amber-900 font-medium leading-relaxed">
                ไม่สามารถสร้างผลวิเคราะห์ธาตุเจ้าเรือนเฉพาะบุคคลได้จนกว่าจะระบุเดือนเกิด
              </span>
            </div>
            <button
              type="button"
              onClick={handleActionSetBirthMonth}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs sm:text-sm font-bold cursor-pointer"
            >
              ระบุเดือนเกิด
            </button>
          </div>
        ) : (
          /* ═══════════════════════════════════════════════════════════════ */
          /* STEP 2: BIRTH ELEMENT PROFILE & DIETARY GUIDELINE               */
          /* ═══════════════════════════════════════════════════════════════ */
          <div className="flex flex-col gap-3.5">
            
            {/* Back Button to Concept */}
            <button
              type="button"
              onClick={() => setStep('concept')}
              className="self-start flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_back</span>
              <span>ย้อนกลับไปดูแนวคิดธาตุเจ้าเรือน</span>
            </button>

            {/* 1. Element Overview Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200/90 flex flex-col gap-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">
                    {birthInfo.element === 'ไฟ' ? '🔥' : birthInfo.element === 'ลม' ? '💨' : birthInfo.element === 'ดิน' ? '🌍' : '💧'}
                  </span>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold text-brand-primary leading-tight">
                      {currentProfile?.element_name_th || birthInfo.elementName}
                    </h4>
                    <span className="text-xs text-emerald-800 font-semibold">
                      {currentProfile?.element_name_en || ''}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-neutral-500 block">เกิดเดือน:</span>
                  <span className="text-xs font-bold text-emerald-950 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    {profile.birthMonth}
                  </span>
                </div>
              </div>

              {/* Solar Months & Lunar Months Reference from Supabase */}
              {currentProfile?.birth_months && (
                <div className="text-xs text-emerald-900 bg-white/80 p-2 rounded-xl border border-emerald-200/60 flex flex-wrap gap-x-3 gap-y-1 mt-1">
                  <span>
                    <strong>เดือนสุริยคติ:</strong> {currentProfile.birth_months.solar.join(', ')}
                  </span>
                  <span>
                    <strong>เดือนจันทรคติไทย:</strong> {currentProfile.birth_months.thai_lunar.join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* 2. Physical and Personality Traits (ลักษณะทางกายภาพและบุคลิกภาพ) */}
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-800">
                <span aria-hidden="true" className="material-symbols-outlined text-base text-emerald-700">accessibility_new</span>
                <span>ลักษณะทางกายภาพและบุคลิกภาพ</span>
              </div>
              <p className="text-sm text-neutral-700 leading-relaxed">
                {currentProfile?.physical_and_personality_traits || birthInfo.characteristics}
              </p>
            </div>

            {/* 3. Health Vulnerability (จุดอ่อนด้านสุขภาพที่ควรระวัง) */}
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-2xs flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-sm font-bold text-amber-950">
                <span aria-hidden="true" className="material-symbols-outlined text-base text-amber-700">health_and_safety</span>
                <span>จุดอ่อนด้านสุขภาพและช่วงวัยที่ควรระวัง</span>
              </div>
              <p className="text-[15px] text-amber-950 leading-relaxed">
                {currentProfile?.health_vulnerability || 'ควรระมัดระวังการเสียสมดุลของร่างกายตามการเปลี่ยนแปลงของสภาพอากาศและฤดูกาล'}
              </p>
            </div>

            {/* 4. Recommended Tastes (รสชาติที่ควรรับประทานเพื่อปรับสมดุล) */}
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-bold text-neutral-800">
                  <span aria-hidden="true" className="material-symbols-outlined text-base text-emerald-700">restaurant</span>
                  <span>รสอาหารที่ช่วยปรับสมดุล</span>
                </div>
                <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  รสยาปรับสมดุล
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(currentProfile?.recommended_tastes || [birthInfo.balancingTaste]).map((taste, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-950 text-xs sm:text-sm font-bold border border-emerald-300"
                  >
                    รส{taste}
                  </span>
                ))}
              </div>
            </div>

            {/* 5. Recommended Vegetables & Fruits (ผักและผลไม้ที่แนะนำ) */}
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-bold text-brand-primary">
                  <span aria-hidden="true" className="material-symbols-outlined text-base text-emerald-700">nutrition</span>
                  <span>ผักและผลไม้ที่แนะนำ</span>
                </div>
                <span className="text-xs text-neutral-500 font-semibold">
                  {currentProfile?.recommended_vegetables_fruits?.length || 0} รายการ
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                {(currentProfile?.recommended_vegetables_fruits || []).map((item, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-neutral-50 text-neutral-800 text-xs font-bold border border-neutral-200 shadow-3xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* 6. Recommended Beverages (เครื่องดื่มสมุนไพรที่แนะนำ) */}
            <div className="p-3.5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-bold text-brand-primary">
                  <span aria-hidden="true" className="material-symbols-outlined text-base text-blue-700">local_cafe</span>
                  <span>เครื่องดื่มสมุนไพรที่แนะนำ</span>
                </div>
                <span className="text-xs text-neutral-500 font-semibold">
                  {currentProfile?.recommended_beverages?.length || 0} รายการ
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(currentProfile?.recommended_beverages || []).map((bev, idx) => (
                  <span 
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-blue-50/80 text-blue-950 text-xs font-bold border border-blue-200 shadow-3xs"
                  >
                    {bev}
                  </span>
                ))}
              </div>
            </div>

            {/* 7. Interesting Facts & Attributions (เกร็ดความรู้และแหล่งอ้างอิง) */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex flex-col gap-1.5 text-xs text-neutral-600 leading-relaxed">
              <div className="flex items-center gap-1 text-emerald-950 font-bold">
                <span aria-hidden="true" className="material-symbols-outlined text-sm text-emerald-700">lightbulb</span>
                <span>เกร็ดความรู้การแพทย์แผนไทย:</span>
              </div>
              <p>
                การรับประทานอาหารตามธาตุเจ้าเรือนเน้นการใช้อาหารเป็นยา โดยเลือกรสชาติที่ตรงข้ามกับความผิดปกติของธาตุเพื่อถ่วงดุลให้ร่างกายกลับสู่สภาวะสมดุลตามธรรมชาติ
              </p>
              <div className="mt-1 pt-1.5 border-t border-neutral-200 flex items-center gap-1 text-xs text-neutral-500">
                <span aria-hidden="true" className="material-symbols-outlined text-xs text-emerald-800">verified</span>
                <span>แหล่งข้อมูล: กรมการแพทย์แผนไทยและการแพทย์ทางเลือก กระทรวงสาธารณสุข</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-full h-11 rounded-2xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-hover transition-all cursor-pointer mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            >
              เข้าใจแนวทางการดูแลธาตุเจ้าเรือน
            </button>

          </div>
        )}

    </InfoDialog>
  );
}
