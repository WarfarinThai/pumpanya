import React, { useState, useEffect, useCallback } from 'react';
import { HealthProfile } from '../types';
import {
  SymptomGroup,
  Disease,
  RecommendedHerb,
  fetchSymptomGroups,
  fetchDiseasesByGroup,
  fetchRecommendedHerbs
} from '../services/guideline2568Service';
import ErrorState from './ErrorState';
import InfoDialog from './InfoDialog';
import { FeatureVisualSymptom } from './FeatureVisuals';

interface SymptomGuidelineModalProps {
  profile: HealthProfile;
  onClose: () => void;
}

// Icons & styles for the 6 symptom groups resolved by group_name (with id as fallback)
const GROUP_META: Record<number, { icon: string; color: string; bg: string; border: string }> = {
  1: { icon: 'restaurant', color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-200' },
  2: { icon: 'air', color: 'text-sky-800', bg: 'bg-sky-50', border: 'border-sky-200' },
  3: { icon: 'accessibility_new', color: 'text-emerald-800', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  4: { icon: 'medical_services', color: 'text-purple-800', bg: 'bg-purple-50', border: 'border-purple-200' },
  5: { icon: 'psychology', color: 'text-indigo-800', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  6: { icon: 'healing', color: 'text-rose-800', bg: 'bg-rose-50', border: 'border-rose-200' },
};

function getGroupMeta(grp: SymptomGroup) {
  const name = grp.group_name || '';
  if (name.includes('ทางเดินอาหาร')) return GROUP_META[1];
  if (name.includes('ทางเดินหายใจ')) return GROUP_META[2];
  if (name.includes('กล้ามเนื้อ') || name.includes('กระดูก')) return GROUP_META[3];
  if (name.includes('มะเร็ง')) return GROUP_META[4];
  if (name.includes('สมอง') || name.includes('ประสาท')) return GROUP_META[5];
  if (name.includes('ผิวหนัง')) return GROUP_META[6];
  return GROUP_META[grp.id] || { icon: 'medical_services', color: 'text-neutral-700', bg: 'bg-neutral-50', border: 'border-neutral-200' };
}

export default function SymptomGuidelineModal({ profile, onClose }: SymptomGuidelineModalProps) {
  const [groups, setGroups] = useState<SymptomGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<SymptomGroup | null>(null);

  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);

  const [herbs, setHerbs] = useState<RecommendedHerb[]>([]);
  const [loadingGroups, setLoadingGroups] = useState<boolean>(true);
  const [loadingDiseases, setLoadingDiseases] = useState<boolean>(false);
  const [loadingHerbs, setLoadingHerbs] = useState<boolean>(false);

  const [errorGroups, setErrorGroups] = useState<string | null>(null);
  const [errorDiseases, setErrorDiseases] = useState<string | null>(null);
  const [errorHerbs, setErrorHerbs] = useState<string | null>(null);

  const loadGroups = useCallback(async () => {
    setLoadingGroups(true);
    setErrorGroups(null);
    try {
      const data = await fetchSymptomGroups();
      setGroups(data);
      if (data.length > 0) {
        const initial =
          data.find(g => g.group_name?.includes('ทางเดินหายใจ')) ||
          data[0];
        setSelectedGroup(initial);
      } else {
        setSelectedGroup(null);
      }
    } catch (err) {
      console.error('Failed to load symptom groups:', err);
      setGroups([]);
      setSelectedGroup(null);
      setErrorGroups('ไม่สามารถตรวจสอบข้อมูลความปลอดภัยได้ในขณะนี้ กรุณาลองอีกครั้ง หรือปรึกษาเภสัชกรก่อนใช้สมุนไพรนี้');
    } finally {
      setLoadingGroups(false);
    }
  }, []);

  const loadDiseases = useCallback(async (groupId: number) => {
    setLoadingDiseases(true);
    setErrorDiseases(null);
    setSelectedDisease(null);
    setHerbs([]);
    try {
      const dis = await fetchDiseasesByGroup(groupId);
      setDiseases(dis);
      if (dis.length > 0) {
        setSelectedDisease(dis[0]);
      }
    } catch (err) {
      console.error('Failed to load diseases:', err);
      setDiseases([]);
      setSelectedDisease(null);
      setErrorDiseases('ไม่สามารถตรวจสอบข้อมูลความปลอดภัยได้ในขณะนี้ กรุณาลองอีกครั้ง หรือปรึกษาเภสัชกรก่อนใช้สมุนไพรนี้');
    } finally {
      setLoadingDiseases(false);
    }
  }, []);

  const loadHerbs = useCallback(async (diseaseId: number) => {
    setLoadingHerbs(true);
    setErrorHerbs(null);
    try {
      const res = await fetchRecommendedHerbs(diseaseId);
      setHerbs(res);
    } catch (err) {
      console.error('Failed to load recommended herbs:', err);
      setHerbs([]);
      setErrorHerbs('ไม่สามารถตรวจสอบข้อมูลความปลอดภัยได้ในขณะนี้ กรุณาลองอีกครั้ง หรือปรึกษาเภสัชกรก่อนใช้สมุนไพรนี้');
    } finally {
      setLoadingHerbs(false);
    }
  }, []);

  // Load Symptom Groups on Mount
  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  // Load Diseases when Group changes
  useEffect(() => {
    if (!selectedGroup) return;
    loadDiseases(selectedGroup.id);
  }, [selectedGroup, loadDiseases]);

  // Load Herbs when Disease changes
  useEffect(() => {
    if (!selectedDisease) return;
    loadHerbs(selectedDisease.id);
  }, [selectedDisease, loadHerbs]);

  const hasLiverIssue = Boolean(profile.hasLiverDisease || profile.chronicConditions.some(c => c.includes('ตับ')));
  const hasKidneyIssue = Boolean(profile.hasKidneyDisease || profile.chronicConditions.some(c => c.includes('ไต')));
  const hasConfiguredOrganStatus =
    typeof profile.hasLiverDisease === 'boolean' ||
    typeof profile.hasKidneyDisease === 'boolean' ||
    profile.chronicConditions.length > 0;
  const isPregnant = profile.isPregnant;

  return (
    <InfoDialog
      isOpen={true}
      customChrome
      title="6. ยาสมุนไพรตามกลุ่มอาการ"
      description="คัดกรองและเลือกใช้ยาสมุนไพรตามกลุ่มอาการและบัญชียาหลักแห่งชาติ"
      ariaLabelledBy="symptom-guideline-modal-title"
      onClose={onClose}
      maxWidth="max-w-2xl"
      maxHeight="max-h-[92vh]"
      overlayClassName="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      className="bg-white rounded-3xl w-full overflow-hidden shadow-2xl border border-border-default flex flex-col"
    >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border-default bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-brand-border-subtle/80 shadow-3xs flex items-center justify-center">
              <FeatureVisualSymptom className="w-full h-full" />
            </div>
            <div>
              <h2 id="symptom-guideline-modal-title" className="text-lg sm:text-xl font-bold text-brand-primary leading-snug">
                6. ยาสมุนไพรตามกลุ่มอาการ
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดหน้าต่าง"
            className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-6">

          {/* User Organ Precaution Banner */}
          <div className="p-4 rounded-2xl bg-white border border-border-default flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span aria-hidden="true" className="material-symbols-outlined text-emerald-700 text-xl">shield_person</span>
              <span className="text-sm font-bold text-brand-primary">สถานะผู้ป่วย:</span>
              <span className="text-sm font-semibold text-text-secondary">
                {profile.gender === 'female' ? 'หญิง' : profile.gender === 'male' ? 'ชาย' : 'ยังไม่ระบุ'}
                {isPregnant && <span className="ml-1 text-rose-700 font-bold">(ตั้งครรภ์ ⚠️)</span>}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2.5 py-1 rounded-lg font-bold ${hasLiverIssue ? 'bg-rose-100 text-rose-800' : 'bg-neutral-100 text-neutral-600'}`}>
                {hasLiverIssue ? '⚠️ เสี่ยงโรคตับ' : hasConfiguredOrganStatus ? 'ตับปกติ' : 'ตับ: ยังไม่ระบุ'}
              </span>
              <span className={`px-2.5 py-1 rounded-lg font-bold ${hasKidneyIssue ? 'bg-rose-100 text-rose-800' : 'bg-neutral-100 text-neutral-600'}`}>
                {hasKidneyIssue ? '⚠️ เสี่ยงโรคไต' : hasConfiguredOrganStatus ? 'ไตปกติ' : 'ไต: ยังไม่ระบุ'}
              </span>
            </div>
          </div>

          {/* 1. SELECT SYMPTOM GROUP (6 Groups) */}
          <div className="flex flex-col gap-3">
            <label className="text-sm sm:text-base font-bold text-brand-primary">
              ขั้นตอนที่ 1: เลือกกลุ่มอาการหลัก
            </label>

            {loadingGroups ? (
              <div className="p-6 text-center text-sm text-neutral-500 animate-pulse">กำลังโหลดกลุ่มอาการ...</div>
            ) : errorGroups ? (
              <ErrorState
                isSafetyCritical
                message={errorGroups}
                onRetry={loadGroups}
              />
            ) : groups.length === 0 ? (
              <div className="p-8 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-center text-sm text-neutral-500 flex flex-col items-center gap-2">
                <span>ไม่พบข้อมูลกลุ่มอาการในระบบ</span>
                <button
                  type="button"
                  onClick={loadGroups}
                  className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold cursor-pointer"
                >
                  ลองอีกครั้ง
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {groups.map((grp) => {
                  const isSelected = selectedGroup?.id === grp.id;
                  const meta = getGroupMeta(grp);

                  return (
                    <button
                      key={grp.id}
                      type="button"
                      onClick={() => setSelectedGroup(grp)}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3.5 cursor-pointer ${
                        isSelected
                          ? 'bg-brand-primary text-white border-brand-primary shadow-md ring-2 ring-brand-primary/20'
                          : 'bg-white text-text-primary border-border-default hover:border-emerald-400 hover:bg-neutral-50/80 shadow-2xs'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : `${meta.bg} ${meta.color}`
                      }`}>
                        <span aria-hidden="true" className="material-symbols-outlined text-2xl">
                          {meta.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-bold tracking-wide block mb-0.5 ${isSelected ? 'text-white/85' : 'text-neutral-600'}`}>
                          กลุ่มที่ {grp.id}
                        </span>
                        <h4 className="text-sm font-bold leading-snug break-words">
                          {grp.group_name}
                        </h4>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. SELECT DISEASE IN CHOSEN GROUP */}
          {selectedGroup && !errorGroups && (
            <div className="flex flex-col gap-3">
              <label className="text-sm sm:text-base font-bold text-brand-primary">
                ขั้นตอนที่ 2: เลือกโรคหรืออาการย่อย
              </label>

              {loadingDiseases ? (
                <div className="p-6 text-center text-sm text-neutral-500 animate-pulse">กำลังโหลดรายการโรค...</div>
              ) : errorDiseases ? (
                <ErrorState
                  isSafetyCritical
                  message={errorDiseases}
                  onRetry={() => loadDiseases(selectedGroup.id)}
                />
              ) : diseases.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-center text-sm text-neutral-500">
                  ไม่พบรายการโรคในกลุ่มนี้
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {diseases.map((dis) => {
                    const isSelected = selectedDisease?.id === dis.id;
                    return (
                      <button
                        key={dis.id}
                        type="button"
                        onClick={() => setSelectedDisease(dis)}
                        className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                            : 'bg-white text-[#303833] border-border-default hover:border-emerald-400 hover:text-emerald-900 shadow-2xs'
                        }`}
                      >
                        {dis.disease_name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. RECOMMENDED HERBS RESULT (from recommended_herbs) */}
          {selectedDisease && !errorGroups && !errorDiseases && (
            <div className="flex flex-col gap-3 pt-2">
              <div className="border-b border-border-default pb-3">
                <h4 className="text-sm sm:text-base font-bold text-brand-primary">
                  ขั้นตอนที่ 3: แนวทางการใช้ยาสมุนไพรสำหรับ &quot;{selectedDisease.disease_name}&quot;
                </h4>
                {!loadingHerbs && !errorHerbs && (
                  <p className="text-xs text-text-muted mt-0.5 font-medium">
                    พบคำแนะนำทั้งหมด {herbs.length} ตำรับ
                  </p>
                )}
              </div>

              {loadingHerbs ? (
                <div className="p-6 text-center text-xs text-neutral-500 animate-pulse">กำลังโหลดข้อมูลเกณฑ์ยา...</div>
              ) : errorHerbs ? (
                <ErrorState
                  isSafetyCritical
                  message={errorHerbs}
                  onRetry={() => loadHerbs(selectedDisease.id)}
                />
              ) : herbs.length === 0 ? (
                <div className="p-8 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-center text-xs text-neutral-500">
                  ไม่มีรายการยาสมุนไพรที่บันทึกไว้สำหรับอาการนี้
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {herbs.map((herb, idx) => {
                    // Check contraindications against patient
                    const isContraindicated = 
                      (isPregnant && herb.contraindications.some(c => c.includes('ตั้งครรภ์') || c.includes('สตรีมีครรภ์'))) ||
                      (hasLiverIssue && herb.contraindications.some(c => c.includes('ตับ')));

                    return (
                      <div
                        key={herb.id || idx}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col gap-3.5 shadow-2xs ${
                          isContraindicated 
                            ? 'bg-rose-50/70 border-rose-200' 
                            : 'bg-white border-border-default hover:border-teal-300'
                        }`}
                      >
                        {/* Herb Name Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <h5 className="text-sm sm:text-base font-bold text-brand-primary leading-tight">
                                {herb.herb_name}
                              </h5>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center">
                                  <span aria-hidden="true" className="material-symbols-outlined text-xs text-amber-800 mr-0.5">spa</span>
                                  <span>{herb.taste_profile}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-bold px-2 py-1 rounded-lg bg-neutral-100 text-neutral-600 border border-neutral-200 shrink-0">
                            รหัสตำรับ: {herb.id}
                          </span>
                        </div>

                        {/* Patient Warning if Contraindicated */}
                        {isContraindicated && (
                          <div className="p-3 rounded-xl bg-rose-100/80 border border-rose-300 flex items-center gap-2 text-[15px] font-bold text-rose-900 leading-relaxed">
                            <span aria-hidden="true" className="material-symbols-outlined text-rose-700 text-base shrink-0">warning</span>
                            <span>แจ้งเตือน: ขัดแย้งกับประวัติสุขภาพของผู้ป่วยรายนี้ (โปรดหลีกเลี่ยงหรือปรึกษาแพทย์)</span>
                          </div>
                        )}

                        {/* Dosage & Duration Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                          <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col gap-1">
                            <span className="text-xs font-bold text-text-muted">ขนาดยาและวิธีใช้</span>
                            <span className="text-sm font-bold text-text-primary leading-relaxed">{herb.dosage_and_instruction}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col gap-1">
                            <span className="text-xs font-bold text-emerald-800">ระยะเวลาใช้ที่ปลอดภัย</span>
                            <span className="text-[15px] font-bold text-emerald-950 leading-relaxed">{herb.safe_duration}</span>
                          </div>
                        </div>

                        {/* Clinical Safety Bulletins */}
                        <div className="flex flex-col gap-2.5 pt-2 border-t border-dashed border-neutral-200 text-sm">
                          
                          {/* Contraindications */}
                          {herb.contraindications && herb.contraindications.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                              <span className="text-sm font-bold text-rose-800 flex items-center gap-1">
                                <span aria-hidden="true" className="material-symbols-outlined text-base">block</span>
                                ข้อห้ามใช้เด็ดขาด:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {herb.contraindications.map((c, i) => (
                                  <span key={i} className="text-[15px] bg-rose-50 text-rose-950 font-medium px-2.5 py-1 rounded-md border border-rose-200 leading-relaxed">
                                    • {c}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Drug Interactions */}
                          {herb.drug_interactions && herb.drug_interactions.length > 0 && (
                            <div className="flex flex-col gap-1.5">
                              <span className="text-sm font-bold text-amber-800 flex items-center gap-1">
                                <span aria-hidden="true" className="material-symbols-outlined text-base">sync_problem</span>
                                ยาตีกัน / อันตรกิริยาระหว่างยา:
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {herb.drug_interactions.map((di, i) => (
                                  <span key={i} className="text-[15px] bg-amber-50 text-amber-950 font-medium px-2.5 py-1 rounded-md border border-amber-200 leading-relaxed">
                                    • {di}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Organ Precautions (Liver & Kidney) */}
                          {herb.organ_precautions && (
                            <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-200 flex flex-col gap-1.5 mt-1">
                              <span className="text-sm font-bold text-teal-950 flex items-center gap-1">
                                <span aria-hidden="true" className="material-symbols-outlined text-base text-teal-700">health_and_safety</span>
                                การเฝ้าระวังตับและไต:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[15px] leading-relaxed">
                                {herb.organ_precautions.liver && (
                                  <div className="flex flex-col">
                                    <span className="font-bold text-teal-900 flex items-center">
                                      <span aria-hidden="true" className="material-symbols-outlined text-xs text-teal-700 mr-1">health_and_safety</span>
                                      <span>ตับ:</span>
                                    </span>
                                    <span className="text-text-secondary">{herb.organ_precautions.liver}</span>
                                  </div>
                                )}
                                {herb.organ_precautions.kidney && (
                                  <div className="flex flex-col">
                                    <span className="font-bold text-teal-900 flex items-center">
                                      <span aria-hidden="true" className="material-symbols-outlined text-xs text-teal-700 mr-1">shield</span>
                                      <span>ไต:</span>
                                    </span>
                                    <span className="text-text-secondary">{herb.organ_precautions.kidney}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-border-default bg-white flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            อ้างอิง: บัญชียาหลักแห่งชาติด้านสมุนไพร &amp; เวชปฏิบัติ 2568
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-brand-primary text-white font-bold text-xs hover:bg-brand-hover transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
          >
            ปิดหน้าต่าง
          </button>
        </div>

    </InfoDialog>
  );
}
