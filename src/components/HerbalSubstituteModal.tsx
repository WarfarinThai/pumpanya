import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HealthProfile } from '../types';
import {
  fetchHerbalComparisons,
  HerbalComparisonRecord
} from '../services/supabaseHerbalComparisons';
import ErrorState from './ErrorState';
import InfoDialog from './InfoDialog';
import { FeatureVisualSubstitute } from './FeatureVisuals';

interface HerbalSubstituteModalProps {
  profile: HealthProfile;
  onClose: () => void;
}

export default function HerbalSubstituteModal({ profile, onClose }: HerbalSubstituteModalProps) {
  const [comparisons, setComparisons] = useState<HerbalComparisonRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDrug, setSelectedDrug] = useState<string>('');
  const [selectedHerbalId, setSelectedHerbalId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHerbalComparisons();
      setComparisons(data);
      if (data.length > 0) {
        const userMeds = profile.medications || [];
        const matched = data.find(d => 
          userMeds.some(m => {
            const medName = typeof m === 'string' ? m : (m as any).name || '';
            return medName.toLowerCase().includes(d.conventional_drug.toLowerCase()) ||
                   d.conventional_drug.toLowerCase().includes(medName.toLowerCase());
          })
        );
        const initialDrug = matched ? matched.conventional_drug : data[0].conventional_drug;
        setSelectedDrug(initialDrug);
        const initialItem = data.find(d => d.conventional_drug === initialDrug);
        if (initialItem) {
          setSelectedHerbalId(initialItem.id);
        }
      }
    } catch (err) {
      console.error('Failed to load herbal comparisons:', err);
      setComparisons([]);
      setSelectedHerbalId(null);
      setError('ไม่สามารถตรวจสอบข้อมูลความปลอดภัยได้ในขณะนี้ กรุณาลองอีกครั้ง หรือปรึกษาเภสัชกรก่อนใช้สมุนไพรนี้');
    } finally {
      setLoading(false);
    }
  }, [profile.medications]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Unique list of conventional drugs
  const uniqueConventionalDrugs = useMemo(() => {
    const list: { name: string; indications: string[]; count: number }[] = [];
    comparisons.forEach(item => {
      const existing = list.find(l => l.name.toLowerCase() === item.conventional_drug.toLowerCase());
      if (existing) {
        if (!existing.indications.includes(item.indication)) {
          existing.indications.push(item.indication);
        }
        existing.count += 1;
      } else {
        list.push({
          name: item.conventional_drug,
          indications: [item.indication],
          count: 1
        });
      }
    });
    return list;
  }, [comparisons]);

  // Filtered conventional drugs by search
  const filteredDrugs = useMemo(() => {
    if (!searchQuery.trim()) return uniqueConventionalDrugs;
    const q = searchQuery.toLowerCase();
    return uniqueConventionalDrugs.filter(d => 
      d.name.toLowerCase().includes(q) || 
      d.indications.some(ind => ind.toLowerCase().includes(q))
    );
  }, [uniqueConventionalDrugs, searchQuery]);

  // Herbal alternatives for currently selected conventional drug
  const herbalAlternatives = useMemo(() => {
    return comparisons.filter(c => c.conventional_drug.toLowerCase() === selectedDrug.toLowerCase());
  }, [comparisons, selectedDrug]);

  // Current selected comparison record
  const currentRecord = useMemo(() => {
    if (!selectedHerbalId) return herbalAlternatives[0] || comparisons[0];
    return comparisons.find(c => c.id === selectedHerbalId) || herbalAlternatives[0] || comparisons[0];
  }, [comparisons, herbalAlternatives, selectedHerbalId]);

  const handleDrugChange = (drugName: string) => {
    setSelectedDrug(drugName);
    const matching = comparisons.filter(c => c.conventional_drug.toLowerCase() === drugName.toLowerCase());
    if (matching.length > 0) {
      setSelectedHerbalId(matching[0].id);
    }
  };

  return (
    <InfoDialog
      isOpen={true}
      customChrome
      title="7. ยาสมุนไพรในบัญชียาหลักแห่งชาติที่สามารถใช้ทดแทนยาแผนปัจจุบัน"
      ariaLabelledBy="herbal-substitute-modal-title"
      ariaDescribedBy="herbal-substitute-modal-desc"
      onClose={onClose}
      maxWidth="max-w-lg"
      maxHeight="max-h-[90vh]"
      overlayClassName="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in overflow-hidden touch-none"
      className="bg-white rounded-3xl w-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 shadow-2xl border border-border-default flex flex-col gap-4.5 overscroll-contain touch-pan-y"
    >
        {/* ── 1. Modal Top Header ── */}
        <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-emerald-100 shadow-sm bg-emerald-50 mt-0.5 p-1 flex items-center justify-center">
              <FeatureVisualSubstitute className="w-full h-full" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  บัญชียาหลักแห่งชาติ (NLEM)
                </span>
                <span className="text-xs font-semibold text-text-muted">
                  สมุนไพรที่มีหลักฐานเชิงประจักษ์
                </span>
              </div>
              <h2 id="herbal-substitute-modal-title" className="text-lg sm:text-xl font-bold text-brand-primary leading-snug mt-1">
                7. ยาสมุนไพรในบัญชียาหลักแห่งชาติที่สามารถใช้ทดแทนยาแผนปัจจุบัน
              </h2>
              <p id="herbal-substitute-modal-desc" className="text-xs sm:text-sm text-neutral-500 font-medium mt-0.5">
                เปรียบเทียบข้อบ่งใช้ ขนาดยา ความปลอดภัยต่อตับและไต และข้อควรระวังการใช้
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            aria-label="ปิดหน้าต่าง"
            className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-1.5 flex items-center justify-center text-neutral-600 hover:text-neutral-900 rounded-full cursor-pointer hover:bg-neutral-100 transition-colors shrink-0"
            title="ปิดหน้าต่าง"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* ── 4 States: LOADING / ERROR / EMPTY / SUCCESS ── */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-500">
            <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold">กำลังเชื่อมโยงข้อมูลยาจากบัญชียาหลักแห่งชาติ...</span>
          </div>
        ) : error ? (
          <ErrorState
            isSafetyCritical
            message={error}
            onRetry={loadData}
          />
        ) : comparisons.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-center flex flex-col items-center gap-3">
            <span aria-hidden="true" className="material-symbols-outlined text-3xl text-neutral-400">inbox</span>
            <p className="text-sm font-bold text-neutral-700">ไม่พบข้อมูลยาสมุนไพรทดแทนในระบบ</p>
            <button
              type="button"
              onClick={loadData}
              className="px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold cursor-pointer hover:bg-brand-hover"
            >
              ลองอีกครั้ง
            </button>
          </div>
        ) : (
          <>
            {/* ── 2. กล่องเลือกยาแผนปัจจุบันที่ท่านรับประทานอยู่ (Minimal & Modern Medical Selector) ── */}
            <div className="p-4 sm:p-5 rounded-2xl bg-surface-brand border border-border-brand-subtle shadow-2xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label htmlFor="conventional-drug-select" className="text-sm sm:text-base font-bold text-brand-primary flex items-center gap-2">
                  <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span>ยาแผนปัจจุบันที่ท่านรับประทานอยู่:</span>
                </label>
                <span className="text-xs text-neutral-500 font-medium">
                  มีข้อมูลเทียบเคียง {uniqueConventionalDrugs.length} กลุ่มยา
                </span>
              </div>

              {/* Modern Select Dropdown */}
              <div className="relative">
                <select
                  id="conventional-drug-select"
                  value={selectedDrug}
                  onChange={(e) => handleDrugChange(e.target.value)}
                  className="w-full h-12 sm:h-13 pl-4 pr-10 text-sm sm:text-base font-bold text-neutral-900 bg-white border-2 border-emerald-700/70 rounded-2xl focus-visible:outline-none focus-visible:border-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-500/20 shadow-xs appearance-none cursor-pointer transition-all truncate"
                >
                  {uniqueConventionalDrugs.map((drug) => (
                    <option key={drug.name} value={drug.name} className="py-2 text-sm text-neutral-900 font-medium truncate">
                      {drug.name} — ({drug.indications[0]})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-emerald-800 flex items-center">
                  <span aria-hidden="true" className="material-symbols-outlined text-2xl">arrow_drop_down</span>
                </div>
              </div>

              {/* Quick Drug Pills for Fast Clinical Selection */}
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-xs font-bold text-neutral-500">
                  หรือเลือกยาด่วนที่พบบ่อย:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Omeprazole', 'NSAIDs', 'Anti-Flatulence', 'ยาบรรเทาอาการไอ', 'ยาบรรเทาอาการไข้ เจ็บคอ', 'Bisacodyl'].map((quickName) => {
                    const isSelected = selectedDrug.toLowerCase() === quickName.toLowerCase();
                    return (
                      <button
                        key={quickName}
                        type="button"
                        onClick={() => handleDrugChange(quickName)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-emerald-700 text-white shadow-xs ring-2 ring-emerald-600/40' 
                            : 'bg-white text-neutral-700 border border-neutral-500 hover:border-emerald-600 hover:bg-emerald-50/50'
                        }`}
                      >
                        {quickName}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── 3. หากยากลุ่มนี้มีสมุนไพรทดแทนมากกว่า 1 รายการ ให้เลือกสลับดูได้ ── */}
            {herbalAlternatives.length > 1 && (
              <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                    <span aria-hidden="true" className="material-symbols-outlined text-base text-emerald-700">alt_route</span>
                    <span>พบยาสมุนไพรที่ใช้ทดแทนได้ {herbalAlternatives.length} รายการ:</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    คลิกเพื่อดูรายละเอียด
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {herbalAlternatives.map((alt) => {
                    const isCurrent = currentRecord?.id === alt.id;
                    return (
                      <button
                        key={alt.id}
                        type="button"
                        onClick={() => setSelectedHerbalId(alt.id)}
                        className={`p-3 rounded-xl text-left transition-all cursor-pointer border flex flex-col gap-1 ${
                          isCurrent
                            ? 'bg-white border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                            : 'bg-white/70 border-neutral-200 hover:border-emerald-300'
                        }`}
                      >
                        <span className={`text-sm font-bold ${isCurrent ? 'text-emerald-950' : 'text-neutral-800'}`}>
                          {alt.herbal_drug}
                        </span>
                        <span className="text-xs text-neutral-500 line-clamp-1">
                          {alt.indication}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── 4. Main Medical Comparison Card (ตัวอักษรใหญ่ ชัดเจน ไม่รกตา) ── */}
            {currentRecord && (
              <div className="flex flex-col gap-4">
                
                {/* 4.1 Card Header: Herbal Drug Name & Substitution Relation */}
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-brand-primary to-[#0a523a] text-white shadow-md flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-400 text-emerald-950 shadow-2xs flex items-center gap-1.5">
                      <span aria-hidden="true" className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      ยาสมุนไพรในบัญชียาหลักแห่งชาติ
                    </span>
                    <span className="text-xs text-emerald-100 font-medium">
                      ลำดับทะเบียนยาเทียบเคียง #{currentRecord.id}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-emerald-200 font-semibold">
                      ยาสมุนไพรที่ใช้ทดแทน {currentRecord.conventional_drug}:
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight flex items-center">
                      <span aria-hidden="true" className="material-symbols-outlined text-3xl mr-1.5 shrink-0">spa</span>
                      <span>{currentRecord.herbal_drug}</span>
                    </h3>
                  </div>

                  <div className="pt-2 border-t border-emerald-700/60 flex items-center gap-2 text-xs sm:text-sm text-emerald-100">
                    <span className="font-bold text-white">ยาแผนปัจจุบันเดิม:</span>
                    <span className="bg-black/20 px-2.5 py-0.5 rounded-lg border border-white/10 font-bold">
                      {currentRecord.conventional_drug}
                    </span>
                  </div>
                </div>

                {/* 4.2 ข้อบ่งใช้ */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
                      <span aria-hidden="true" className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                        medical_services
                      </span>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-brand-primary">
                      ข้อบ่งใช้ทางการแพทย์
                    </span>
                  </div>
                  <p className="text-base sm:text-lg font-bold text-neutral-900 pl-9 leading-relaxed">
                    {currentRecord.indication}
                  </p>
                </div>

                {/* 4.3 ขนาดยาและวิธีใช้ */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                        <span aria-hidden="true" className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                          schedule
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-bold text-brand-primary">
                        ขนาดและวิธีใช้
                      </span>
                    </div>
                    <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                      ขนาดยามาตรฐาน
                    </span>
                  </div>
                  <div className="pl-9">
                    <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 text-[15px] sm:text-base font-bold text-blue-950 leading-relaxed">
                      {currentRecord.dosage_and_administration}
                    </div>
                  </div>
                </div>

                {/* 4.4 ความปลอดภัยต่อตับและไต */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
                      <span aria-hidden="true" className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                        health_and_safety
                      </span>
                    </div>
                    <span className="text-sm sm:text-base font-bold text-brand-primary">
                      การเฝ้าระวังความเป็นพิษต่อตับและไต
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 sm:pl-9">
                    {/* Liver Toxicity */}
                    <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                          <span aria-hidden="true" className="material-symbols-outlined text-sm text-emerald-800">health_and_safety</span>
                          <span>ความเป็นพิษต่อตับ</span>
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-600">
                          ความปลอดภัยตับ
                        </span>
                      </div>
                      <p className="text-[15px] font-semibold text-neutral-800 leading-relaxed">
                        {currentRecord.organ_toxicity?.liver_toxicity || 'ไม่มีรายงานความเป็นพิษเด่นชัดในขนาดรักษา'}
                      </p>
                    </div>

                    {/* Kidney Toxicity */}
                    <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                          <span aria-hidden="true" className="material-symbols-outlined text-sm text-emerald-800">shield</span>
                          <span>ความเป็นพิษต่อไต</span>
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-600">
                          ความปลอดภัยไต
                        </span>
                      </div>
                      <p className="text-[15px] font-semibold text-neutral-800 leading-relaxed">
                        {currentRecord.organ_toxicity?.kidney_toxicity || 'ไม่มีรายงานความเป็นพิษเด่นชัดในขนาดรักษา'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4.5 ข้อห้ามใช้และกลุ่มเสี่ยง */}
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-2xs flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-200 text-amber-950 flex items-center justify-center shrink-0">
                        <span aria-hidden="true" className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                          do_not_disturb_on
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-bold text-amber-950">
                        ข้อห้ามใช้และกลุ่มประชากรที่ต้องระวัง
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-900 bg-white px-2 py-0.5 rounded-md border border-amber-300">
                      ข้อควรระวัง
                    </span>
                  </div>

                  <div className="pl-0 sm:pl-9 flex flex-wrap gap-2 pt-1">
                    {currentRecord.restricted_populations && currentRecord.restricted_populations.length > 0 ? (
                      currentRecord.restricted_populations.map((pop, idx) => (
                        <div 
                          key={idx}
                          className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-950 font-bold text-[15px] leading-relaxed flex items-center gap-1.5 shadow-3xs"
                        >
                          <span className="text-amber-700 font-bold">•</span>
                          <span>{pop}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[15px] text-amber-900 font-medium leading-relaxed">ไม่มีข้อมูลในฐานข้อมูลสำหรับหัวข้อนี้</span>
                    )}
                  </div>
                </div>

                {/* 4.6 ปฏิกิริยาระหว่างยา / ยาตีกัน */}
                <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/60 border border-rose-200/80 shadow-2xs flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-rose-200 text-rose-950 flex items-center justify-center shrink-0">
                        <span aria-hidden="true" className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                          sync_problem
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-bold text-rose-950">
                        ปฏิกิริยาระหว่างยาที่ต้องระวัง
                      </span>
                    </div>
                    <span className="text-xs font-bold text-rose-900 bg-white px-2 py-0.5 rounded-md border border-rose-300">
                      ยาตีกัน
                    </span>
                  </div>

                  <div className="pl-0 sm:pl-9 flex flex-col gap-1.5 pt-1">
                    {currentRecord.drug_interactions && currentRecord.drug_interactions.length > 0 ? (
                      currentRecord.drug_interactions.map((interaction, idx) => (
                        <div 
                          key={idx}
                          className="p-3 rounded-xl bg-white border border-rose-200 text-[15px] font-bold text-rose-950 leading-relaxed flex items-start gap-2 shadow-3xs"
                        >
                          <span aria-hidden="true" className="material-symbols-outlined text-rose-600 text-base mt-0.5 shrink-0">
                            warning
                          </span>
                          <span>ระวังใช้ร่วมกับ: {interaction}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[15px] text-rose-900 font-medium leading-relaxed">ไม่มีรายงานปฏิกิริยาระหว่างยาที่รุนแรง</span>
                    )}
                  </div>
                </div>

                {/* 4.7 อาการไม่พึงประสงค์ */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0">
                        <span aria-hidden="true" className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                          info
                        </span>
                      </div>
                      <span className="text-sm sm:text-base font-bold text-brand-primary">
                        อาการไม่พึงประสงค์ที่อาจพบ
                      </span>
                    </div>
                    <span className="text-xs font-bold text-neutral-500">
                      ผลข้างเคียง
                    </span>
                  </div>

                  <div className="pl-0 sm:pl-9 flex flex-wrap gap-2 pt-1">
                    {currentRecord.adverse_effects && currentRecord.adverse_effects.length > 0 ? (
                      currentRecord.adverse_effects.map((effect, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-neutral-100 text-neutral-800 text-sm sm:text-[15px] font-semibold border border-neutral-200 leading-relaxed"
                        >
                          {effect}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-neutral-500">ไม่มีข้อมูลในฐานข้อมูลสำหรับหัวข้อนี้</span>
                    )}
                  </div>
                </div>

                {/* 4.8 แหล่งข้อมูลและการอ้างอิงเชิงวิชาการ */}
                <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-600 font-medium">
                  <div className="flex items-start gap-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-base text-emerald-700 shrink-0 mt-0.5">verified</span>
                    <div className="leading-relaxed">
                      <strong className="text-neutral-800">อ้างอิง:</strong> กรมการแพทย์แผนไทยและการแพทย์ทางเลือก. ยาสมุนไพรในบัญชียาหลักแห่งชาติ ที่สามารถใช้ทดแทนยาแผนปัจจุบัน. นนทบุรี: กรมการแพทย์แผนไทยและการแพทย์ทางเลือก กระทรวงสาธารณสุข; 2567.
                    </div>
                  </div>
                  <a
                    href="https://www.dtam.moph.go.th/ebook/14749/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold underline shrink-0 self-end sm:self-center"
                  >
                    <span>เอกสารอ้างอิงกรมการแพทย์แผนไทยฯ</span>
                    <span aria-hidden="true" className="material-symbols-outlined text-sm">open_in_new</span>
                  </a>
                </div>

              </div>
            )}

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-full h-12 rounded-2xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-hover active:scale-[0.99] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <span>เสร็จสิ้น / ปิดหน้าต่าง</span>
            </button>
          </>
        )}

    </InfoDialog>
  );
}
