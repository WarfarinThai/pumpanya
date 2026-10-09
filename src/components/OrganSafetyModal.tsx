import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HealthProfile } from '../types';
import {
  fetchHerbalSafetyRecords,
  ThaiHerbalSafetyRecord,
  isValidText,
  parseStringOrArray,
  parseTasteList,
  formatSourcePdfPages,
  formatRecordDate
} from '../services/supabaseHerbalSafety';
import ErrorState from './ErrorState';
import InfoDialog from './InfoDialog';
import { FeatureVisualSafety } from './FeatureVisuals';

interface OrganSafetyModalProps {
  profile: HealthProfile;
  onClose: () => void;
}

type TabType = 'liver-kidney' | 'duration' | 'maternal' | 'search';
type SafetyFilter = 'all' | 'liver' | 'kidney' | 'duration' | 'pregnancy' | 'interaction';

export default function OrganSafetyModal({ profile, onClose }: OrganSafetyModalProps) {
  const [herbs, setHerbs] = useState<ThaiHerbalSafetyRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('liver-kidney');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [safetyFilter, setSafetyFilter] = useState<SafetyFilter>('all');
  const [selectedHerbDetail, setSelectedHerbDetail] = useState<ThaiHerbalSafetyRecord | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHerbalSafetyRecords();
      setHerbs(data);
      if (data.length > 0) {
        const defaultMonograph =
          data.find(
            h =>
              h.english_title?.toLowerCase().includes('andrographis') ||
              h.definition?.toLowerCase().includes('andrographis paniculata') ||
              h.monograph_th.includes('ฟ้าทะลายโจร')
          ) ||
          data.find(
            h =>
              isValidText(h.maximum_continuous_use?.duration) &&
              isValidText(h.drug_interactions)
          ) ||
          data[0];
        setSelectedHerbDetail(prev => (prev && data.some(h => h.id === prev.id) ? prev : defaultMonograph));
      } else {
        setSelectedHerbDetail(null);
      }
    } catch (err) {
      console.error('Error fetching herbal safety records:', err);
      setHerbs([]);
      setSelectedHerbDetail(null);
      setError('ไม่สามารถตรวจสอบข้อมูลความปลอดภัยได้ในขณะนี้ กรุณาลองอีกครั้ง หรือปรึกษาเภสัชกรก่อนใช้สมุนไพรนี้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Check user profile for liver/kidney vulnerability
  const hasLiver = Boolean(profile.hasLiverDisease || profile.chronicConditions.some(c => c.includes('ตับ')));
  const hasKidney = Boolean(profile.hasKidneyDisease || profile.chronicConditions.some(c => c.includes('ไต')));
  const hasConfiguredOrganStatus =
    typeof profile.hasLiverDisease === 'boolean' ||
    typeof profile.hasKidneyDisease === 'boolean' ||
    profile.chronicConditions.length > 0;

  // 1. Liver & Kidney specific lists
  const liverContraList = useMemo(() => {
    return herbs.filter(h => isValidText(h.contraindications?.hepatitis));
  }, [herbs]);

  const kidneyContraList = useMemo(() => {
    return herbs.filter(h => isValidText(h.contraindications?.chronic_renal_failure));
  }, [herbs]);

  const liverPrecautionList = useMemo(() => {
    return herbs.filter(h => isValidText(h.precautions?.hepatitis));
  }, [herbs]);

  const kidneyPrecautionList = useMemo(() => {
    return herbs.filter(h => isValidText(h.precautions?.chronic_renal_failure));
  }, [herbs]);

  // 2. Maximum Duration List
  const durationList = useMemo(() => {
    return herbs.filter(h => isValidText(h.maximum_continuous_use?.duration) || isValidText(h.maximum_continuous_use?.reason));
  }, [herbs]);

  // 3. Maternal List (Pregnancy & Lactation)
  const pregnancyList = useMemo(() => {
    return herbs.filter(
      h =>
        isValidText(h.pregnancy?.status) ||
        isValidText(h.pregnancy?.detail) ||
        isValidText(h.lactation?.status) ||
        isValidText(h.lactation?.detail)
    );
  }, [herbs]);

  // 4. Comprehensive Search & Category Filter
  const filteredSearchList = useMemo(() => {
    let list = herbs;

    // Apply safety filter tag
    if (safetyFilter === 'liver') {
      list = list.filter(h => isValidText(h.contraindications?.hepatitis) || isValidText(h.precautions?.hepatitis));
    } else if (safetyFilter === 'kidney') {
      list = list.filter(h => isValidText(h.contraindications?.chronic_renal_failure) || isValidText(h.precautions?.chronic_renal_failure));
    } else if (safetyFilter === 'duration') {
      list = list.filter(h => isValidText(h.maximum_continuous_use?.duration));
    } else if (safetyFilter === 'pregnancy') {
      list = list.filter(h => isValidText(h.pregnancy?.detail) || isValidText(h.lactation?.detail));
    } else if (safetyFilter === 'interaction') {
      list = list.filter(h => isValidText(h.drug_interactions));
    }

    if (!searchQuery.trim()) {
      return list;
    }
    const q = searchQuery.toLowerCase().trim();
    return list.filter(h => {
      const tastes = parseTasteList(h.thai_medicine_taste);
      return (
        h.monograph_th.toLowerCase().includes(q) ||
        (h.english_title && h.english_title.toLowerCase().includes(q)) ||
        (h.definition && h.definition.toLowerCase().includes(q)) ||
        tastes.some(t => t.toLowerCase().includes(q))
      );
    });
  }, [herbs, searchQuery, safetyFilter]);

  // Auto-sync selected item if current selection not in filtered list
  useEffect(() => {
    if (filteredSearchList.length > 0) {
      if (!selectedHerbDetail || !filteredSearchList.some(h => h.id === selectedHerbDetail.id)) {
        setSelectedHerbDetail(filteredSearchList[0]);
      }
    }
  }, [filteredSearchList, selectedHerbDetail]);

  return (
    <InfoDialog
      isOpen={true}
      customChrome
      title="3. ข้อมูลความปลอดภัยของสมุนไพร (เฝ้าระวังตับ ไต ระยะเวลาใช้ และสตรีมีครรภ์)"
      description="ฐานข้อมูลความปลอดภัยสมุนไพร เฝ้าระวังตับ ไต ระยะเวลาใช้ และสตรีมีครรภ์"
      ariaLabelledBy="organ-safety-modal-title"
      onClose={onClose}
      maxWidth="max-w-3xl"
      maxHeight="max-h-[92vh]"
      overlayClassName="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      className="bg-white rounded-3xl w-full overflow-y-auto p-5 sm:p-7 shadow-2xl border border-border-default flex flex-col gap-5"
    >
        {/* ── Modal Header ── */}
        <div className="flex flex-col border-b border-neutral-100 pb-4 gap-2.5">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-brand-border-subtle/80 shadow-3xs flex items-center justify-center">
                <FeatureVisualSafety className="w-full h-full" />
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 truncate">
                {!loading && !error && herbs.length > 0
                  ? `ฐานข้อมูลความปลอดภัย ${herbs.length} ชนิด`
                  : 'ฐานข้อมูลความปลอดภัยสมุนไพร'}
              </span>
            </div>
            <button 
              type="button"
              onClick={onClose} 
              aria-label="ปิดหน้าต่าง"
              className="w-11 h-11 min-w-[44px] min-h-[44px] -mr-1.5 flex items-center justify-center text-neutral-600 hover:text-neutral-900 rounded-full cursor-pointer hover:bg-neutral-100 transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
              title="ปิดหน้าต่าง"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
          <h2 id="organ-safety-modal-title" className="text-base sm:text-xl font-bold text-brand-primary leading-snug">
            3. ข้อมูลความปลอดภัยของสมุนไพร (เฝ้าระวังตับ ไต ระยะเวลาใช้ และสตรีมีครรภ์)
          </h2>
        </div>

        {/* ── Content Area: 4 Distinct States (LOADING / ERROR / EMPTY / SUCCESS) ── */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-600">
            <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold">กำลังเชื่อมต่อฐานข้อมูลสารสนเทศความปลอดภัยสมุนไพร...</span>
          </div>
        ) : error ? (
          <ErrorState
            isSafetyCritical
            message={error}
            onRetry={loadData}
          />
        ) : herbs.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-center flex flex-col items-center gap-3">
            <span aria-hidden="true" className="material-symbols-outlined text-3xl text-neutral-500">inbox</span>
            <p className="text-sm font-bold text-neutral-700">ไม่พบข้อมูลความปลอดภัยของสมุนไพรในระบบ</p>
            <button
              type="button"
              onClick={loadData}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold cursor-pointer hover:bg-brand-hover"
            >
              ลองอีกครั้ง
            </button>
          </div>
        ) : (
          <>
            {/* ── Personalized Patient Status Watchdog (สถานะอวัยวะของท่านตามโปรไฟล์) ── */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
              hasLiver || hasKidney 
                ? 'bg-rose-50/90 border-rose-200 text-rose-950' 
                : hasConfiguredOrganStatus
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                : 'bg-neutral-50 border-neutral-200 text-neutral-900'
            }`}>
              <div className="flex items-start gap-3">
                <div aria-hidden="true" className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  hasLiver || hasKidney
                    ? 'bg-rose-200 text-rose-800'
                    : hasConfiguredOrganStatus
                    ? 'bg-emerald-200 text-emerald-800'
                    : 'bg-neutral-200 text-neutral-700'
                }`}>
                  <span aria-hidden="true" className="material-symbols-outlined text-xl">
                    {hasLiver || hasKidney ? 'warning' : hasConfiguredOrganStatus ? 'verified_user' : 'info'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-neutral-500">
                    สถานะอวัยวะของท่านตามโปรไฟล์:
                  </span>
                  <span className="text-sm sm:text-base font-bold mt-0.5">
                    {hasLiver && hasKidney && '⚠️ ตรวจพบประวัติ: ทั้งโรคตับ และ โรคไต'}
                    {hasLiver && !hasKidney && '⚠️ ตรวจพบประวัติ: ภาวะโรคตับ'}
                    {!hasLiver && hasKidney && '⚠️ ตรวจพบประวัติ: ภาวะโรคไต/ไตวาย'}
                    {!hasLiver && !hasKidney && hasConfiguredOrganStatus && '✓ สุขภาพตับและไตปกติ (ไม่มีประวัติโรคตับ/ไต)'}
                    {!hasLiver && !hasKidney && !hasConfiguredOrganStatus && 'ยังไม่ได้ระบุประวัติโรคตับและโรคไตในโปรไฟล์'}
                  </span>
                  <span className="text-sm sm:text-[15px] text-neutral-700 font-medium mt-0.5 leading-relaxed">
                    {hasLiver || hasKidney 
                      ? `ระบบเปิดโหมดระวังพิเศษ: มีสมุนไพร ${liverContraList.length + kidneyContraList.length} ตัวที่ห้ามใช้เด็ดขาดสำหรับคุณ` 
                      : hasConfiguredOrganStatus
                      ? 'สามารถใช้สมุนไพรตามขนาดยาและระยะเวลามาตรฐานได้อย่างปลอดภัย'
                      : 'กรุณาตรวจสอบเกณฑ์ข้อห้ามใช้และข้อควรระวังของสมุนไพรแต่ละชนิดด้านล่าง'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-white border border-neutral-200 shadow-3xs">
                  {profile.chronicConditions.length > 0
                    ? profile.chronicConditions.join(', ')
                    : hasConfiguredOrganStatus
                    ? 'ไม่มีโรคประจำตัวที่ระบุ'
                    : 'ยังไม่ได้ระบุโรคประจำตัว'}
                </span>
              </div>
            </div>

            {/* ── Primary Clinical Navigation Tabs (box ที่ให้เลือก) ── */}
            <div className="bg-neutral-100/90 p-1.5 rounded-2xl border border-neutral-200/80 shadow-inner">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs sm:text-sm font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('liver-kidney')}
                  className={`py-2 px-2.5 sm:px-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-1.5 min-h-[44px] text-left ${
                    activeTab === 'liver-kidney'
                      ? 'bg-brand-primary text-white shadow-sm ring-1 ring-black/5'
                      : 'bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span aria-hidden="true" className="material-symbols-outlined text-base shrink-0">health_and_safety</span>
                    <span className="leading-tight break-words">ตับและไต</span>
                  </div>
                  <span className={`text-[11px] sm:text-xs px-1.5 py-0.5 rounded-full font-bold shrink-0 self-center ${
                    activeTab === 'liver-kidney' ? 'bg-emerald-800 text-white' : 'bg-neutral-200 text-neutral-700'
                  }`}>
                    {liverContraList.length + kidneyContraList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('duration')}
                  className={`py-2 px-2.5 sm:px-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-1.5 min-h-[44px] text-left ${
                    activeTab === 'duration'
                      ? 'bg-brand-primary text-white shadow-sm ring-1 ring-black/5'
                      : 'bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span aria-hidden="true" className="material-symbols-outlined text-base shrink-0">schedule</span>
                    <span className="leading-tight break-words">ระยะเวลาสูงสุด</span>
                  </div>
                  <span className={`text-[11px] sm:text-xs px-1.5 py-0.5 rounded-full font-bold shrink-0 self-center ${
                    activeTab === 'duration' ? 'bg-emerald-800 text-white' : 'bg-neutral-200 text-neutral-700'
                  }`}>
                    {durationList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('maternal')}
                  className={`py-2 px-2.5 sm:px-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-1.5 min-h-[44px] text-left ${
                    activeTab === 'maternal'
                      ? 'bg-brand-primary text-white shadow-sm ring-1 ring-black/5'
                      : 'bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span aria-hidden="true" className="material-symbols-outlined text-base shrink-0">pregnant_woman</span>
                    <span className="leading-tight break-words">สตรีตั้งครรภ์/ให้นม</span>
                  </div>
                  <span className={`text-[11px] sm:text-xs px-1.5 py-0.5 rounded-full font-bold shrink-0 self-center ${
                    activeTab === 'maternal' ? 'bg-emerald-800 text-white' : 'bg-neutral-200 text-neutral-700'
                  }`}>
                    {pregnancyList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('search')}
                  className={`py-2 px-2.5 sm:px-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-1.5 min-h-[44px] text-left ${
                    activeTab === 'search'
                      ? 'bg-brand-primary text-white shadow-sm ring-1 ring-black/5'
                      : 'bg-transparent text-neutral-600 hover:text-neutral-900 hover:bg-white/60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span aria-hidden="true" className="material-symbols-outlined text-base shrink-0">menu_book</span>
                    <span className="leading-tight break-words">สารสนเทศ {herbs.length} ชนิด</span>
                  </div>
                  <span className={`text-[11px] sm:text-xs px-1.5 py-0.5 rounded-full font-bold shrink-0 self-center ${
                    activeTab === 'search' ? 'bg-emerald-800 text-white' : 'bg-neutral-200 text-neutral-700'
                  }`}>
                    {herbs.length}
                  </span>
                </button>
              </div>
            </div>
            {/* ────── TAB 1: ตับและไต (Liver & Kidney) ────── */}
            {activeTab === 'liver-kidney' && (
              <div className="flex flex-col gap-5">
                
                {/* 1.1 ข้อห้ามใช้สำหรับผู้ป่วยโรคตับ หรือ โรคไต (Contraindication) */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-bold text-rose-900 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-rose-600 animate-pulse"></span>
                      <span>ข้อห้ามใช้สำหรับผู้ป่วยโรคตับ หรือ โรคไต (Contraindication)</span>
                    </span>
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-200">
                      ห้ามรับประทาน
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Liver Contra */}
                    <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between border-b border-rose-200/80 pb-2">
                        <span className="text-sm font-bold text-rose-900 flex items-center gap-1.5">
                          <span>🫁</span>
                          <span>ข้อห้ามในโรคตับ</span>
                        </span>
                        <span className="text-xs font-bold text-rose-800 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                          {liverContraList.length} ตัวยา
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {liverContraList.map((herb) => (
                          <div key={herb.id} className="p-3 rounded-xl bg-white border border-rose-100 shadow-3xs flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm sm:text-base font-bold text-rose-950">{herb.monograph_th}</span>
                              <span className="text-xs text-neutral-600 font-bold">{herb.english_title}</span>
                            </div>
                            <p className="text-[15px] text-rose-900 font-semibold leading-relaxed">
                              {herb.contraindications?.hepatitis}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Kidney Contra */}
                    <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200 flex flex-col gap-2.5">
                      <div className="flex items-center justify-between border-b border-rose-200/80 pb-2">
                        <span className="text-sm font-bold text-rose-900 flex items-center gap-1.5">
                          <span>🫘</span>
                          <span>ข้อห้ามในโรคไต</span>
                        </span>
                        <span className="text-xs font-bold text-rose-800 bg-white px-2 py-0.5 rounded-md border border-rose-200">
                          {kidneyContraList.length} ตัวยา
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        {kidneyContraList.map((herb) => (
                          <div key={herb.id} className="p-3 rounded-xl bg-white border border-rose-100 shadow-3xs flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm sm:text-base font-bold text-rose-950">{herb.monograph_th}</span>
                              <span className="text-xs text-neutral-600 font-bold">{herb.english_title}</span>
                            </div>
                            <p className="text-[15px] text-rose-900 font-semibold leading-relaxed">
                              {herb.contraindications?.chronic_renal_failure}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 1.2 ข้อควรระวังและการเฝ้าระวัง (Precautions) */}
                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm sm:text-base font-bold text-amber-950 flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                      <span>ข้อควรระวังพิเศษต่อตับและไต (Precautions &amp; Monitoring)</span>
                    </span>
                    <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
                      เฝ้าระวังอาการ
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Liver Precautions */}
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col gap-2">
                      <span className="text-sm font-bold text-amber-950 flex items-center gap-1.5 pb-1 border-b border-amber-200/80">
                        <span>🫁 เฝ้าระวังเอนไซม์ตับ/ตับทำงานหนัก</span>
                      </span>
                      <div className="flex flex-col gap-2 mt-1">
                        {liverPrecautionList.map((herb) => (
                          <div key={herb.id} className="p-3 rounded-xl bg-white border border-amber-100 shadow-3xs flex flex-col gap-1">
                            <span className="text-sm sm:text-base font-bold text-neutral-900">{herb.monograph_th}</span>
                            <p className="text-[15px] text-neutral-800 font-medium leading-relaxed">
                              {herb.precautions?.hepatitis}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Kidney Precautions */}
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col gap-2">
                      <span className="text-sm font-bold text-amber-950 flex items-center gap-1.5 pb-1 border-b border-amber-200/80">
                        <span>🫘 เฝ้าระวังการขับสารออกทางไต/เกลือแร่</span>
                      </span>
                      <div className="flex flex-col gap-2 mt-1">
                        {kidneyPrecautionList.map((herb) => (
                          <div key={herb.id} className="p-3 rounded-xl bg-white border border-amber-100 shadow-3xs flex flex-col gap-1">
                            <span className="text-sm sm:text-base font-bold text-neutral-900">{herb.monograph_th}</span>
                            <p className="text-[15px] text-neutral-800 font-medium leading-relaxed">
                              {herb.precautions?.chronic_renal_failure}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ────── TAB 2: ระยะเวลาทานสูงสุด (Maximum Duration) ────── */}
            {activeTab === 'duration' && (
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-950 flex items-start gap-3">
                  <span aria-hidden="true" className="material-symbols-outlined text-2xl text-blue-700 shrink-0 mt-0.5">
                    timer
                  </span>
                  <div className="flex flex-col text-sm sm:text-[15px]">
                    <strong className="font-bold text-blue-900">เกณฑ์จำกัดระยะเวลาใช้ติดต่อกันสูงสุด (Maximum Continuous Use)</strong>
                    <p className="text-blue-800 leading-relaxed mt-0.5 font-medium">
                      ยาสมุนไพรหลายชนิดออกฤทธิ์ทางชีวภาพเข้มข้น หากรับประทานต่อเนื่องนานเกินกำหนด อาจทำให้ลำไส้เคยชิน ร่างกายสูญเสียเกลือแร่โพแทสเซียม หรือเกิดการสะสมพิษต่อตับและไตได้
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {durationList.map((herb) => (
                    <div key={herb.id} className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs hover:border-emerald-400 transition-all flex flex-col justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-base font-bold text-brand-primary">{herb.monograph_th}</h4>
                          <span className="text-xs text-neutral-600 font-bold">{herb.english_title}</span>
                        </div>
                        {parseTasteList(herb.thai_medicine_taste).length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {parseTasteList(herb.thai_medicine_taste).map((t, idx) => (
                              <span key={idx} className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md font-bold">
                                รส{t}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="mt-2 p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-[15px] font-bold text-blue-950 leading-relaxed flex items-center gap-2">
                          <span aria-hidden="true" className="material-symbols-outlined text-base text-blue-700 shrink-0">schedule</span>
                          <span>ไม่ควรเกิน: {herb.maximum_continuous_use?.duration || 'ไม่ควรใช้ติดต่อกันเป็นเวลานาน'}</span>
                        </div>
                        {herb.maximum_continuous_use?.reason && (
                          <p className="text-[15px] text-neutral-700 font-medium leading-relaxed mt-1">
                            <strong>เหตุผลทางการแพทย์:</strong> {herb.maximum_continuous_use.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ────── TAB 3: สตรีมีครรภ์และให้นมบุตร (Maternal Safety) ────── */}
            {activeTab === 'maternal' && (
              <div className="flex flex-col gap-4">
                <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 text-purple-950 flex items-start gap-3">
                  <span aria-hidden="true" className="material-symbols-outlined text-2xl text-purple-700 shrink-0 mt-0.5">
                    pregnant_woman
                  </span>
                  <div className="flex flex-col text-sm sm:text-[15px]">
                    <strong className="font-bold text-purple-900">เกณฑ์ความปลอดภัยสำหรับคุณแม่ตั้งครรภ์และให้นมบุตร</strong>
                    <p className="text-purple-800 leading-relaxed mt-0.5 font-medium">
                      สารออกฤทธิ์บางชนิดในสมุนไพรสามารถกระตุ้นการบีบตัวของมดลูก ทำให้เสี่ยงต่อการแท้ง หรืออาจขับออกทางน้ำนมไปยังทารกได้
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {pregnancyList.map((herb) => {
                    const isStrictForbidden =
                      herb.pregnancy?.status?.includes('ห้าม') ||
                      herb.pregnancy?.detail?.includes('ห้าม') ||
                      herb.lactation?.status?.includes('ห้าม') ||
                      herb.lactation?.detail?.includes('ห้าม');
                    const displayStatus = isValidText(herb.pregnancy?.status)
                      ? herb.pregnancy?.status
                      : isValidText(herb.lactation?.status)
                      ? herb.lactation?.status
                      : 'เฝ้าระวัง';
                    return (
                      <div key={herb.id} className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-2xs flex flex-col justify-between gap-3">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-neutral-900">{herb.monograph_th}</span>
                            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${
                              isStrictForbidden 
                                ? 'bg-rose-50 text-rose-800 border-rose-200' 
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {displayStatus}
                            </span>
                          </div>
                          {herb.english_title && (
                            <span className="text-xs text-neutral-600 font-bold">{herb.english_title}</span>
                          )}
                          
                          {isValidText(herb.pregnancy?.detail) && (
                            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-[15px] text-neutral-800 font-medium leading-relaxed mt-1">
                              <strong className="text-neutral-900 font-bold">🤰 ข้อมูลสตรีตั้งครรภ์:</strong> {herb.pregnancy?.detail}
                            </div>
                          )}

                          {isValidText(herb.lactation?.detail) && (
                            <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-[15px] text-purple-950 font-medium leading-relaxed">
                              <strong>🤱 สตรีให้นมบุตร:</strong> {herb.lactation?.detail}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ────── TAB 4: สารสนเทศความปลอดภัยสมุนไพร (Comprehensive Monographs) ────── */}
            {activeTab === 'search' && (
              <div className="flex flex-col gap-4">
                
                {/* 1. Monograph Introduction & Guidance Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-brand-surface to-white border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div aria-hidden="true" className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <span aria-hidden="true" className="material-symbols-outlined text-2xl">menu_book</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-brand-primary">
                          สารสนเทศความปลอดภัยสมุนไพรและตำรับยา
                        </h3>
                        <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ครบ {herbs.length} รายการ
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-neutral-600 mt-0.5 leading-relaxed">
                        สืบค้นข้อห้ามใช้เด็ดขาด, ข้อควรระวัง, พิษต่อตับ-ไต, ระยะเวลาสูงสุด, สตรีมีครรภ์/ให้นมบุตร และปฏิกิริยากับยาแผนปัจจุบัน (Drug Interactions) ตามเกณฑ์ตำราอ้างอิงยาสมุนไพรไทย
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Interactive Search & Category Quick Filter Controls */}
                <div className="flex flex-col gap-3">
                  
                  {/* Safety Quick Filters (Filter Chips) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                    <span className="text-xs font-bold text-neutral-500 whitespace-nowrap mr-1">
                      ตัวกรองหมวดความปลอดภัย:
                    </span>
                    <button
                      type="button"
                      onClick={() => setSafetyFilter('all')}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border ${
                        safetyFilter === 'all'
                          ? 'bg-brand-primary text-white border-brand-primary shadow-xs'
                          : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                      }`}
                    >
                      ทั้งหมด ({herbs.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSafetyFilter('liver')}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1 ${
                        safetyFilter === 'liver'
                          ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                          : 'bg-white text-rose-800 border-rose-200 hover:bg-rose-50'
                      }`}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-base">health_and_safety</span>
                      <span>มีข้อห้าม/ระวังโรคตับ ({herbs.filter(h => isValidText(h.contraindications?.hepatitis) || isValidText(h.precautions?.hepatitis)).length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSafetyFilter('kidney')}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1 ${
                        safetyFilter === 'kidney'
                          ? 'bg-rose-700 text-white border-rose-700 shadow-xs'
                          : 'bg-white text-rose-800 border-rose-200 hover:bg-rose-50'
                      }`}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-base">shield</span>
                      <span>มีข้อห้าม/ระวังโรคไต ({herbs.filter(h => isValidText(h.contraindications?.chronic_renal_failure) || isValidText(h.precautions?.chronic_renal_failure)).length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSafetyFilter('duration')}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1 ${
                        safetyFilter === 'duration'
                          ? 'bg-blue-700 text-white border-blue-700 shadow-xs'
                          : 'bg-white text-blue-800 border-blue-200 hover:bg-blue-50'
                      }`}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-base">schedule</span>
                      <span>จำกัดระยะเวลาใช้ ({herbs.filter(h => isValidText(h.maximum_continuous_use?.duration)).length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSafetyFilter('pregnancy')}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1 ${
                        safetyFilter === 'pregnancy'
                          ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                          : 'bg-white text-purple-800 border-purple-200 hover:bg-purple-50'
                      }`}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-base">pregnant_woman</span>
                      <span>ระวังในสตรีมีครรภ์/ให้นม ({herbs.filter(h => isValidText(h.pregnancy?.detail) || isValidText(h.lactation?.detail)).length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSafetyFilter('interaction')}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1 ${
                        safetyFilter === 'interaction'
                          ? 'bg-amber-700 text-white border-amber-700 shadow-xs'
                          : 'bg-white text-amber-800 border-amber-200 hover:bg-amber-50'
                      }`}
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-base">medication</span>
                      <span>ปฏิกิริยากับยาแผนปัจจุบัน ({herbs.filter(h => isValidText(h.drug_interactions)).length})</span>
                    </button>
                  </div>

                  {/* Direct Selection & Search Header Bar: Replaces the long 424 list with instant access */}
                  <div className="p-3.5 rounded-2xl bg-neutral-50/90 border border-neutral-200/90 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-3xs">
                    
                    {/* Herb Dropdown Selector (Direct Switcher) */}
                    <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                      <div className="flex items-center gap-1.5 text-neutral-800 shrink-0">
                        <span aria-hidden="true" className="material-symbols-outlined text-lg text-emerald-800">format_list_bulleted</span>
                        <label htmlFor="herb-quick-select" className="text-xs sm:text-sm font-bold whitespace-nowrap">
                          เลือกสมุนไพรที่จะดูสารสนเทศ:
                        </label>
                      </div>
                      <div className="flex-1 relative">
                        <select
                          id="herb-quick-select"
                          value={selectedHerbDetail?.id || ''}
                          onChange={(e) => {
                            const found = herbs.find(h => h.id === Number(e.target.value));
                            if (found) setSelectedHerbDetail(found);
                          }}
                          className="w-full bg-white border-2 border-emerald-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-neutral-900 focus-visible:outline-none focus-visible:border-emerald-800 focus-visible:ring-2 focus-visible:ring-emerald-500/40 cursor-pointer shadow-2xs transition-all"
                        >
                          {filteredSearchList.map(h => (
                            <option key={h.id} value={h.id}>
                              #{h.display_index || h.id} {h.monograph_th} {h.english_title ? `(${h.english_title})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Search Input Box */}
                    <div className="md:w-80 relative shrink-0">
                      <input
                        type="text"
                        aria-label="ค้นหาชื่อสมุนไพรในสารสนเทศความปลอดภัย"
                        aria-invalid={searchQuery.trim() !== '' && filteredSearchList.length === 0 ? 'true' : undefined}
                        aria-describedby={searchQuery.trim() !== '' && filteredSearchList.length === 0 ? 'organ-safety-search-empty' : undefined}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ค้นหาชื่อ เช่น ขมิ้นชัน, ขิง, ฟ้าทะลายโจร..."
                        className="w-full h-10 pl-9 pr-10 rounded-xl border border-neutral-500 focus-visible:outline-none focus-visible:border-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 text-xs sm:text-sm font-semibold text-neutral-900 bg-white shadow-3xs"
                      />
                      <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-600 flex items-center pointer-events-none">
                        <span aria-hidden="true" className="material-symbols-outlined text-lg">search</span>
                      </div>
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          aria-label="ล้างข้อความค้นหา"
                          className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-600 hover:text-neutral-900 rounded-full cursor-pointer"
                          title="ล้างข้อความค้นหา"
                        >
                          <span aria-hidden="true" className="material-symbols-outlined text-base">close</span>
                        </button>
                      )}
                    </div>

                  </div>

                  {/* Summary & Filter Status Bar */}
                  <div className="flex items-center justify-between text-xs text-neutral-600 px-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">
                        แสดงข้อมูลจากตัวกรอง: <strong className="text-emerald-900">{filteredSearchList.length}</strong> จากทั้งหมด {herbs.length} รายการ
                      </span>
                      {safetyFilter !== 'all' && (
                        <button
                          type="button"
                          onClick={() => setSafetyFilter('all')}
                          className="text-xs font-bold text-rose-600 hover:underline cursor-pointer ml-1"
                        >
                          (ล้างตัวกรองหมวด)
                        </button>
                      )}
                    </div>
                    {filteredSearchList.length > 0 && selectedHerbDetail && (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={filteredSearchList.findIndex(h => h.id === selectedHerbDetail.id) <= 0}
                          onClick={() => {
                            const idx = filteredSearchList.findIndex(h => h.id === selectedHerbDetail.id);
                            if (idx > 0) setSelectedHerbDetail(filteredSearchList[idx - 1]);
                          }}
                          className="px-2 py-0.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none text-neutral-700 font-bold text-xs cursor-pointer flex items-center gap-0.5"
                        >
                          <span aria-hidden="true" className="material-symbols-outlined text-xs">arrow_back</span>
                          <span>รายการก่อนหน้า</span>
                        </button>
                        <button
                          type="button"
                          disabled={filteredSearchList.findIndex(h => h.id === selectedHerbDetail.id) >= filteredSearchList.length - 1}
                          onClick={() => {
                            const idx = filteredSearchList.findIndex(h => h.id === selectedHerbDetail.id);
                            if (idx >= 0 && idx < filteredSearchList.length - 1) setSelectedHerbDetail(filteredSearchList[idx + 1]);
                          }}
                          className="px-2 py-0.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:pointer-events-none text-neutral-700 font-bold text-xs cursor-pointer flex items-center gap-0.5"
                        >
                          <span>รายการถัดไป</span>
                          <span aria-hidden="true" className="material-symbols-outlined text-xs">arrow_forward</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Official Herbal Safety Monograph Card (Full Width Direct Display) */}
                <div className="w-full">
                  {selectedHerbDetail ? (
                    <div className="p-5 sm:p-7 rounded-3xl bg-white border-2 border-emerald-800/25 shadow-xs flex flex-col gap-5">
                      
                      {/* Monograph Header */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-neutral-200 pb-4">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                              ลำดับรายการที่ #{selectedHerbDetail.display_index || selectedHerbDetail.id} / {herbs.length}
                            </span>
                            {selectedHerbDetail.monograph_order && (
                              <span className="text-xs font-bold text-neutral-600">
                                สารสนเทศลำดับที่ {selectedHerbDetail.monograph_order}
                              </span>
                            )}
                            {formatSourcePdfPages(selectedHerbDetail.source_pdf_pages) && (
                              <span className="text-xs font-bold text-teal-900 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200 flex items-center gap-1">
                                <span aria-hidden="true" className="material-symbols-outlined text-xs">description</span>
                                <span>หน้าเอกสารอ้างอิง: หน้า {formatSourcePdfPages(selectedHerbDetail.source_pdf_pages)}</span>
                              </span>
                            )}
                          </div>
                          <h3 className="text-2xl sm:text-3xl font-bold text-brand-primary mt-1.5 leading-tight">
                            {selectedHerbDetail.monograph_th}
                          </h3>
                          <p className="text-sm sm:text-base text-neutral-600 font-semibold mt-0.5 italic">
                            {selectedHerbDetail.english_title || '-'}
                          </p>
                        </div>

                        {/* Thai Medicine Tastes */}
                        {parseTasteList(selectedHerbDetail.thai_medicine_taste).length > 0 && (
                          <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 shrink-0">
                            <span className="text-xs font-bold text-neutral-500">
                              รสยาแผนไทย:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {parseTasteList(selectedHerbDetail.thai_medicine_taste).map((t, idx) => (
                                <span key={idx} className="text-xs sm:text-sm font-bold px-3 py-1 rounded-xl bg-emerald-50 text-emerald-950 border border-emerald-200 shadow-3xs">
                                  รส{t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Botanical / Pharmaceutical Definition */}
                      {selectedHerbDetail.definition && (
                        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/90 text-sm sm:text-[15px] text-neutral-700 leading-relaxed">
                          <span className="font-bold text-neutral-900">คำจำกัดความและส่วนที่ใช้ทางเภสัชกรรม: </span>
                          <span>{selectedHerbDetail.definition}</span>
                        </div>
                      )}

                      {/* Monograph Safety Deep-Dive Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[15px] leading-relaxed">
                        
                        {/* 1. Liver Safety (ตับ) */}
                        <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                          isValidText(selectedHerbDetail.contraindications?.hepatitis)
                            ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                            : isValidText(selectedHerbDetail.precautions?.hepatitis)
                            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                            : 'bg-neutral-50/70 border-neutral-200 text-neutral-800'
                        }`}>
                          <div className="flex items-center justify-between border-b border-black/5 pb-1.5">
                            <h4 className="text-sm sm:text-base font-bold flex items-center gap-1.5">
                              <span>🫁</span>
                              <span>ความปลอดภัยต่อตับ</span>
                            </h4>
                            {isValidText(selectedHerbDetail.contraindications?.hepatitis) ? (
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-rose-600 text-white">
                                ห้ามใช้เด็ดขาด
                              </span>
                            ) : isValidText(selectedHerbDetail.precautions?.hepatitis) ? (
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-700 text-white">
                                ควรระวัง
                              </span>
                            ) : (
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-neutral-200 text-neutral-700">
                                ไม่มีข้อมูล
                              </span>
                            )}
                          </div>
                          <p className="font-semibold leading-relaxed">
                            {isValidText(selectedHerbDetail.contraindications?.hepatitis)
                              ? selectedHerbDetail.contraindications?.hepatitis
                              : isValidText(selectedHerbDetail.precautions?.hepatitis)
                              ? selectedHerbDetail.precautions?.hepatitis
                              : 'ไม่มีข้อมูลในฐานข้อมูลสำหรับหัวข้อนี้'}
                          </p>
                        </div>

                        {/* 2. Kidney Safety (ไต) */}
                        <div className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                          isValidText(selectedHerbDetail.contraindications?.chronic_renal_failure)
                            ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                            : isValidText(selectedHerbDetail.precautions?.chronic_renal_failure)
                            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                            : 'bg-neutral-50/70 border-neutral-200 text-neutral-800'
                        }`}>
                          <div className="flex items-center justify-between border-b border-black/5 pb-1.5">
                            <h4 className="text-sm sm:text-base font-bold flex items-center gap-1.5">
                              <span>🫘</span>
                              <span>ความปลอดภัยต่อไต</span>
                            </h4>
                            {isValidText(selectedHerbDetail.contraindications?.chronic_renal_failure) ? (
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-rose-600 text-white">
                                ห้ามใช้เด็ดขาด
                              </span>
                            ) : isValidText(selectedHerbDetail.precautions?.chronic_renal_failure) ? (
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-700 text-white">
                                ควรระวัง
                              </span>
                            ) : (
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-neutral-200 text-neutral-700">
                                ไม่มีข้อมูล
                              </span>
                            )}
                          </div>
                          <p className="font-semibold leading-relaxed">
                            {isValidText(selectedHerbDetail.contraindications?.chronic_renal_failure)
                              ? selectedHerbDetail.contraindications?.chronic_renal_failure
                              : isValidText(selectedHerbDetail.precautions?.chronic_renal_failure)
                              ? selectedHerbDetail.precautions?.chronic_renal_failure
                              : 'ไม่มีข้อมูลในฐานข้อมูลสำหรับหัวข้อนี้'}
                          </p>
                        </div>

                        {/* 3. Duration Limit */}
                        <div className={`p-4 rounded-2xl border flex flex-col gap-2 md:col-span-2 ${
                          isValidText(selectedHerbDetail.maximum_continuous_use?.duration)
                            ? 'bg-blue-50/80 border-blue-200 text-blue-950'
                            : 'bg-neutral-50/70 border-neutral-200 text-neutral-800'
                        }`}>
                          <div className="flex items-center justify-between border-b border-black/5 pb-1.5">
                            <h4 className="text-sm sm:text-base font-bold flex items-center gap-1.5 text-blue-950">
                              <span>⏱️</span>
                              <span>ระยะเวลาการใช้ยาต่อเนื่องสูงสุด (Maximum Continuous Use)</span>
                            </h4>
                            {isValidText(selectedHerbDetail.maximum_continuous_use?.duration) ? (
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-700 text-white">
                                {selectedHerbDetail.maximum_continuous_use?.duration}
                              </span>
                            ) : (
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-neutral-200 text-neutral-700">
                                ไม่มีข้อมูล
                              </span>
                            )}
                          </div>
                          <p className="font-semibold leading-relaxed">
                            {isValidText(selectedHerbDetail.maximum_continuous_use?.reason)
                              ? selectedHerbDetail.maximum_continuous_use?.reason
                              : isValidText(selectedHerbDetail.maximum_continuous_use?.duration)
                              ? `ไม่ควรใช้ติดต่อกันเกิน ${selectedHerbDetail.maximum_continuous_use?.duration}`
                              : 'ไม่มีข้อมูลในฐานข้อมูลสำหรับหัวข้อนี้'}
                          </p>
                        </div>

                        {/* 4. Pregnancy & Lactation */}
                        <div className={`p-4 rounded-2xl border flex flex-col gap-2 md:col-span-2 ${
                          isValidText(selectedHerbDetail.pregnancy?.detail) || isValidText(selectedHerbDetail.lactation?.detail)
                            ? 'bg-purple-50/80 border-purple-200 text-purple-950'
                            : 'bg-neutral-50/70 border-neutral-200 text-neutral-800'
                        }`}>
                          <div className="flex items-center justify-between border-b border-black/5 pb-1.5">
                            <h4 className="text-sm sm:text-base font-bold flex items-center gap-1.5 text-purple-950">
                              <span aria-hidden="true" className="material-symbols-outlined text-lg text-purple-700">pregnant_woman</span>
                              <span>สตรีตั้งครรภ์และสตรีให้นมบุตร</span>
                            </h4>
                            {(isValidText(selectedHerbDetail.pregnancy?.detail) || isValidText(selectedHerbDetail.pregnancy?.status)) && (
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-purple-700 text-white">
                                {selectedHerbDetail.pregnancy?.status || 'มีข้อควรระวัง'}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <div>
                              <strong className="font-bold text-purple-900">สตรีตั้งครรภ์: </strong>
                              <span className="font-medium">
                                {isValidText(selectedHerbDetail.pregnancy?.detail)
                                  ? selectedHerbDetail.pregnancy?.detail
                                  : 'ไม่มีข้อมูลรายงานความเป็นพิษเด่นชัด แต่ควรปรึกษาแพทย์ก่อนใช้'}
                              </span>
                            </div>
                            {isValidText(selectedHerbDetail.lactation?.detail) && (
                              <div>
                                <strong className="font-bold text-purple-900">สตรีให้นมบุตร: </strong>
                                <span className="font-medium">{selectedHerbDetail.lactation?.detail}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 5. Drug Interactions (ปฏิกิริยากับยาแผนปัจจุบัน) - HEADLINE ENLARGED */}
                        <div className={`p-4 sm:p-5 rounded-2xl border-2 flex flex-col gap-2.5 md:col-span-2 ${
                          isValidText(selectedHerbDetail.drug_interactions)
                            ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                            : 'bg-neutral-50/70 border-neutral-200 text-neutral-800'
                        }`}>
                          <div className="flex items-center justify-between border-b border-black/5 pb-2">
                            <h4 className="text-base sm:text-lg font-bold flex items-center gap-2 text-amber-950">
                              <span aria-hidden="true" className="material-symbols-outlined text-xl text-amber-700">medication</span>
                              <span>ปฏิกิริยากับยาแผนปัจจุบัน (ยาตีกัน)</span>
                            </h4>
                            {isValidText(selectedHerbDetail.drug_interactions) && (
                              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-amber-700 text-white">
                                เฝ้าระวังยาตีกัน
                              </span>
                            )}
                          </div>
                          {isValidText(selectedHerbDetail.drug_interactions) ? (
                            <div className="flex flex-wrap gap-2 mt-0.5">
                              {parseStringOrArray(selectedHerbDetail.drug_interactions).map((item, idx) => (
                                <span key={idx} className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-[15px] leading-relaxed font-bold text-amber-950 shadow-3xs">
                                  ⚠️ {item}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[15px] font-semibold text-neutral-600 leading-relaxed">
                              ไม่มีรายงานปฏิกิริยารุนแรงที่ต้องห้ามใช้ร่วมกับยาแผนปัจจุบันเป็นพิเศษ
                            </p>
                          )}
                        </div>

                        {/* 6. Other Contraindications / Precautions - HEADLINE ENLARGED */}
                        {(isValidText(selectedHerbDetail.contraindications?.other) || isValidText(selectedHerbDetail.precautions?.other)) && (
                          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/70 border-2 border-rose-300 md:col-span-2 text-rose-950 flex flex-col gap-2.5">
                            <div className="flex items-center justify-between border-b border-rose-200/80 pb-2">
                              <h4 className="text-base sm:text-lg font-bold flex items-center gap-2 text-rose-950">
                                <span aria-hidden="true" className="material-symbols-outlined text-xl text-rose-700">block</span>
                                <span>ข้อห้ามใช้และข้อควรระวังเพิ่มเติม</span>
                              </h4>
                            </div>
                            {isValidText(selectedHerbDetail.contraindications?.other) && (
                              <div className="text-[15px] leading-relaxed">
                                <strong className="text-rose-900 font-bold text-sm sm:text-base block mb-0.5">ข้อห้ามใช้: </strong>
                                <span className="font-semibold">
                                  {Array.isArray(selectedHerbDetail.contraindications?.other)
                                    ? selectedHerbDetail.contraindications?.other.join(', ')
                                    : selectedHerbDetail.contraindications?.other}
                                </span>
                              </div>
                            )}
                            {isValidText(selectedHerbDetail.precautions?.other) && (
                              <div className="text-[15px] leading-relaxed mt-1">
                                <strong className="text-neutral-900 font-bold text-sm sm:text-base block mb-0.5">ข้อควรระวัง: </strong>
                                <span className="font-medium text-neutral-800">
                                  {Array.isArray(selectedHerbDetail.precautions?.other)
                                    ? selectedHerbDetail.precautions?.other.join(', ')
                                    : selectedHerbDetail.precautions?.other}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                      </div>

                      {/* Per-Record Source Provenance Block */}
                      <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-neutral-700">
                        <div className="flex items-start gap-2">
                          <span aria-hidden="true" className="material-symbols-outlined text-base text-emerald-800 shrink-0 mt-0.5">menu_book</span>
                          <div className="flex flex-col gap-0.5 leading-relaxed">
                            <div>
                              <strong className="text-brand-primary">แหล่งอ้างอิงรายระเบียน:</strong> คณะอนุกรรมการจัดทำตำราอ้างอิงยาสมุนไพรไทย. ตำราอ้างอิงยาสมุนไพรไทย เล่ม 1. กรุงเทพฯ: อมรินทร์พริ้นติ้งแอนด์พับลิชชิ่ง; 2551.
                            </div>
                            {formatSourcePdfPages(selectedHerbDetail.source_pdf_pages) && (
                              <div className="font-bold text-emerald-900">
                                หน้าเอกสารต้นฉบับ: หน้า {formatSourcePdfPages(selectedHerbDetail.source_pdf_pages)}
                              </div>
                            )}
                            {formatRecordDate(selectedHerbDetail.created_at) && (
                              <div className="text-[11px] text-neutral-500 font-medium">
                                บันทึกข้อมูลเมื่อ: {formatRecordDate(selectedHerbDetail.created_at)}
                              </div>
                            )}
                          </div>
                        </div>
                        <a
                          href="https://www.dtam.moph.go.th/ebook/14749/"
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-900 hover:text-brand-primary font-bold underline shrink-0 self-end sm:self-center"
                        >
                          <span>เปิดอ่านเอกสารอ้างอิงต้นฉบับ</span>
                          <span aria-hidden="true" className="material-symbols-outlined text-sm">open_in_new</span>
                        </a>
                      </div>

                    </div>
                  ) : (
                    <div id="organ-safety-search-empty" role="alert" className="p-12 rounded-3xl border border-dashed text-center text-neutral-600 text-sm flex flex-col items-center justify-center gap-2">
                      <span aria-hidden="true" className="material-symbols-outlined text-4xl text-neutral-500">menu_book</span>
                      <span>กรุณาเลือกสมุนไพรจากเมนูด้านบนเพื่อดูสารสนเทศฉบับเต็ม</span>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ── Academic Reference Footer ── */}
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-600 font-medium">
              <div className="flex items-start gap-2">
                <span aria-hidden="true" className="material-symbols-outlined text-base text-emerald-700 shrink-0 mt-0.5">verified</span>
                <div>
                  <strong className="text-neutral-800">อ้างอิง:</strong> คณะอนุกรรมการจัดทำตำราอ้างอิงยาสมุนไพรไทย. ตำราอ้างอิงยาสมุนไพรไทย เล่ม 1. กรุงเทพฯ: อมรินทร์พริ้นติ้งแอนด์พับลิชชิ่ง; 2551.
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <a
                  href="https://www.dtam.moph.go.th/ebook/14749/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold underline"
                >
                  <span>เอกสารอ้างอิงกรมการแพทย์แผนไทยฯ</span>
                  <span aria-hidden="true" className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
                <span className="text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                  รวม {herbs.length} ตำรับ/สมุนไพร
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-full h-12 rounded-2xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-hover active:scale-[0.99] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <span>เข้าใจแล้ว / ปิดหน้าต่างนี้</span>
            </button>
          </>
        )}

    </InfoDialog>
  );
}
