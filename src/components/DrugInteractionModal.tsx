import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HealthProfile } from '../types';
import { STANDARD_DRUG_CATEGORIES } from '../data/standardDrugCategories';
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
import { FeatureVisualInteraction } from './FeatureVisuals';

interface DrugInteractionModalProps {
  profile: HealthProfile;
  onClose: () => void;
}

type ScopeFilter = 'interactions_only' | 'all';

const QUICK_HERB_CHIPS = [
  'ฟ้าทะลายโจร',
  'ยาฟ้าทะลายโจร (ชนิดผง)',
  'ยาขมิ้นชัน',
  'ยาสารสกัดขมิ้นชัน',
  'ยาตรีผลา',
  'ยาบัวบก',
  'ยาสหัศธารา',
  'ยาปราบชมพูทวีป',
  'ยาศุขไสยาสน์',
  'ยาประสะกัญชา',
  'ขิง',
  'กานพลู',
  'ชะเอมเทศ',
  'กระเทียม',
  'พริกไทย',
  'หญ้าหนวดแมว',
  'มะระขี้นก',
  'รางจืด'
];

// Classify herb's Thai Medicine Taste into the 3 Primary Taste Groups (รสประธาน 3 รส) & identify conflicting tastes
function analyzeTasteConflict(tastes: string[]) {
  const joined = tastes.join(' ');
  const isHot =
    joined.includes('ร้อน') ||
    joined.includes('เผ็ด') ||
    joined.includes('ปร่า') ||
    joined.includes('ฉุน');
  const isCool =
    joined.includes('เย็น') ||
    joined.includes('ขม') ||
    joined.includes('จืด') ||
    joined.includes('ฝาด') ||
    joined.includes('หวาน');
  const isBland =
    joined.includes('สุขุม') ||
    joined.includes('หอม') ||
    joined.includes('มัน') ||
    joined.includes('เค็ม') ||
    joined.includes('เปรี้ยว') ||
    joined.includes('เมาเบื่อ');

  if (isHot && !isCool) {
    return {
      primaryGroup: 'ยารสร้อน (แก้ลม / บำรุงธาตุไฟ / กระจายเลือดลม)',
      badgeClass: 'bg-orange-100 text-orange-950 border-orange-300',
      conflictingGroup: 'ยารสเย็นจัด / รสขมจัด / รสจืดเย็น',
      conflictReason:
        'ยารสร้อนออกฤทธิ์กระตุ้นการไหลเวียนโลหิตและเพิ่มความอบอุ่น หากรับประทานพร้อมกับยารสเย็นจัดหรือขมจัด (เช่น ฟ้าทะลายโจร, รางจืด, บอระเพ็ด, ยาเขียว) ฤทธิ์ยาจะหักล้างกันเอง (รสยาขัดแย้งกัน) ทำให้การขับลมหรือบำรุงไฟธาตุไม่ได้ผล และอาจทำให้ท้องอืดหรือจุกแน่น',
      conflictingExamples: ['ฟ้าทะลายโจร', 'รางจืด', 'บอระเพ็ด', 'ชุมเห็ดเทศ', 'หญ้าหนวดแมว']
    };
  }

  if (isCool && !isHot) {
    return {
      primaryGroup: 'ยารสเย็น / รสขม-ฝาด-หวาน (แก้ไข้ / ถอนพิษร้อน / บำรุงกำลัง)',
      badgeClass: 'bg-cyan-100 text-cyan-950 border-cyan-300',
      conflictingGroup: 'ยารสร้อนจัด / รสเผ็ดร้อน (เช่น พริกไทย, ขิงแก่, กานพลู, ยาสหัศธารา)',
      conflictReason:
        'ยารสเย็นและรสขมใช้ดับพิษร้อน ถอนพิษไข้ และลดการอักเสบ หากรับประทานพร้อมกับยารสร้อนจัดหรือเผ็ดร้อน จะไปกระตุ้นธาตุไฟให้กำเริบ ขัดแย้งกับฤทธิ์ถอนพิษร้อน และทำให้ยาแก้ไข้ลดประสิทธิภาพลง',
      conflictingExamples: ['พริกไทย', 'ขิง', 'กานพลู', 'ยาสหัศธารา', 'ยาปราบชมพูทวีป', 'ยาปลูกไฟธาตุ']
    };
  }

  if (isBland || (isHot && isCool)) {
    return {
      primaryGroup: 'ยารสสุขุม / รสผสมผสาน (ปรับสมดุลโลหิตและลม)',
      badgeClass: 'bg-emerald-100 text-emerald-950 border-emerald-300',
      conflictingGroup: 'ยารสร้อนจัด หรือ ยารสเย็นจัดในขนาดสูงพร้อมกัน',
      conflictReason:
        'ยารสสุขุมออกฤทธิ์ประคองธาตุและบำรุงโลหิตอย่างค่อยเป็นค่อยไป ไม่ควรรับประทานร่วมกับยาที่มีฤทธิ์ขับถ่ายรุนแรงหรือยาล้างพิษรสจืดเย็นจัด (เช่น รางจืด) ในมื้อเดียวกัน เพราะจะเร่งการขับตัวยาสำคัญออกจากร่างกายก่อนออกฤทธิ์',
      conflictingExamples: ['รางจืด', 'ดีเกลือฝรั่ง', 'โกฐน้ำเต้า']
    };
  }

  return {
    primaryGroup: 'ตำรับยาแผนไทย / สมุนไพรควบคุมเฉพาะทาง',
    badgeClass: 'bg-neutral-100 text-neutral-800 border-neutral-300',
    conflictingGroup: 'สมุนไพรล้างพิษ (เช่น รางจืด) หรือตำรับที่มีฤทธิ์ซ้ำซ้อนกัน',
    conflictReason:
      'ควรหลีกเลี่ยงการรับประทานร่วมกับสมุนไพรกลุ่มเร่งการขับสารพิษ (เช่น รางจืด) หรือตำรับยาที่มีตัวยาหลักซ้ำซ้อนกันในมื้อเดียว และควรเว้นระยะห่างจากยาแผนปัจจุบันอย่างน้อย 1 - 2 ชั่วโมง',
    conflictingExamples: ['รางจืด', 'ชุมเห็ดเทศ', 'ดีเกลือฝรั่ง']
  };
}

export default function DrugInteractionModal({ profile, onClose }: DrugInteractionModalProps) {
  const [herbs, setHerbs] = useState<ThaiHerbalSafetyRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('interactions_only');
  const [selectedHerb, setSelectedHerb] = useState<ThaiHerbalSafetyRecord | null>(null);
  const [herbSearch, setHerbSearch] = useState<string>('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHerbalSafetyRecords();
      setHerbs(data);
      const interesting =
        data.find(
          h =>
            h.english_title?.toLowerCase().includes('andrographis') ||
            h.definition?.toLowerCase().includes('andrographis paniculata') ||
            h.monograph_th.includes('ฟ้าทะลายโจร')
        ) ||
        data.find(h => isValidText(h.drug_interactions)) ||
        data[0];
      setSelectedHerb(interesting || null);
    } catch (err) {
      console.error('Error fetching herbs for interaction:', err);
      setHerbs([]);
      setSelectedHerb(null);
      setError('ไม่สามารถตรวจสอบข้อมูลความปลอดภัยได้ในขณะนี้ กรุณาลองอีกครั้ง หรือปรึกษาเภสัชกรก่อนใช้สมุนไพรนี้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter herbs that have documented drug interactions (59 records in the 294 dataset)
  const herbsWithInteractions = useMemo(() => {
    return herbs.filter(h => isValidText(h.drug_interactions));
  }, [herbs]);

  // Scan user medications and standardized drug categories against all herbs with known interactions
  const matchedInteractions = useMemo(() => {
    const list: { herb: ThaiHerbalSafetyRecord; matchedMed: string; interactionText: string; categoryName?: string }[] = [];

    const activeCategoryIds = new Set<string>(profile.drugCategoryIds || []);
    profile.medications.forEach(m => {
      if (m.categoryId) activeCategoryIds.add(m.categoryId);
    });

    const activeCategories = STANDARD_DRUG_CATEGORIES.filter(cat => activeCategoryIds.has(cat.id));

    herbsWithInteractions.forEach(herb => {
      const interactions = parseStringOrArray(herb.drug_interactions);
      const interactionStr = interactions.join(' ').toLowerCase();

      activeCategories.forEach(cat => {
        const textMatchesKeyword =
          cat.interactsWithHerbs.includes(herb.monograph_th.trim()) ||
          cat.keywords.some(k => interactionStr.includes(k.toLowerCase()));

        if (textMatchesKeyword) {
          if (!list.some(item => item.herb.monograph_th.trim() === herb.monograph_th.trim())) {
            list.push({
              herb,
              matchedMed: cat.categoryName,
              categoryName: cat.categoryName,
              interactionText: interactions.join(' • ')
            });
          }
        }
      });

      // Backward compatibility check for any free-named medications
      profile.medications.forEach(m => {
        if (!m.categoryId) {
          const med = m.name.toLowerCase();
          let isMatch = false;
          if (med.includes('warfarin') || med.includes('วาร์ฟาริน') || med.includes('วอร์ฟาริน')) {
            isMatch =
              interactionStr.includes('warfarin') ||
              interactionStr.includes('วาร์ฟาริน') ||
              interactionStr.includes('ลิ่มเลือด') ||
              interactionStr.includes('anticoagulant');
          } else if (med.includes('aspirin') || med.includes('แอสไพริน')) {
            isMatch =
              interactionStr.includes('aspirin') ||
              interactionStr.includes('แอสไพริน') ||
              interactionStr.includes('เกล็ดเลือด') ||
              interactionStr.includes('antiplatelet');
          } else if (med.includes('nsaid') || med.includes('แก้ปวด') || med.includes('ibuprofen')) {
            isMatch = interactionStr.includes('nsaid') || interactionStr.includes('ไม่ใช่สเตียรอยด์');
          } else if (med.includes('pressure') || med.includes('ความดัน') || med.includes('amlodipine') || med.includes('losartan')) {
            isMatch =
              interactionStr.includes('ยาลดความดันโลหิต') ||
              interactionStr.includes('ลดความดัน') ||
              interactionStr.includes('propranolol') ||
              interactionStr.includes('ace inhibitor');
          } else if (med.includes('sugar') || med.includes('เบาหวาน') || med.includes('metformin')) {
            isMatch =
              interactionStr.includes('ยาลดน้ำตาล') ||
              interactionStr.includes('น้ำตาลในเลือด') ||
              interactionStr.includes('อินซูลิน') ||
              interactionStr.includes('hypoglycemic');
          } else if (med.includes('statin') || med.includes('ไขมัน') || med.includes('คอเลสเตอรอล')) {
            isMatch =
              interactionStr.includes('statin') ||
              interactionStr.includes('คอเลสเตอรอล') ||
              interactionStr.includes('cyp3a4');
          } else if (med.includes('นอนหลับ') || med.includes('คลายกังวล')) {
            isMatch =
              interactionStr.includes('ยานอนหลับ') ||
              interactionStr.includes('กดระบบประสาทส่วนกลาง') ||
              interactionStr.includes('benzodiazepine');
          } else if (med.includes('mao') || med.includes('ซึมเศร้า')) {
            isMatch = interactionStr.includes('มอโนแอมีนออกซิเดส') || interactionStr.includes('mao inhibitors');
          } else {
            isMatch = interactionStr.includes(med);
          }

          if (isMatch && !list.some(item => item.herb.monograph_th.trim() === herb.monograph_th.trim())) {
            list.push({
              herb,
              matchedMed: m.name,
              interactionText: interactions.join(' • ')
            });
          }
        }
      });
    });

    return list;
  }, [herbsWithInteractions, profile.medications, profile.drugCategoryIds]);

  // Filter list for selector dropdown / search input
  const filteredHerbs = useMemo(() => {
    const baseList = scopeFilter === 'interactions_only' && !herbSearch.trim() ? herbsWithInteractions : herbs;
    if (!herbSearch.trim()) return baseList;
    const q = herbSearch.toLowerCase().trim();
    return herbs.filter(h => {
      const tastes = parseTasteList(h.thai_medicine_taste);
      const interactions = parseStringOrArray(h.drug_interactions);
      return (
        h.monograph_th.toLowerCase().includes(q) ||
        (h.english_title && h.english_title.toLowerCase().includes(q)) ||
        tastes.some(t => t.toLowerCase().includes(q)) ||
        interactions.some(i => i.toLowerCase().includes(q))
      );
    });
  }, [herbsWithInteractions, herbs, herbSearch, scopeFilter]);

  // Keep selectedHerb synced when searching or switching scope
  useEffect(() => {
    if (filteredHerbs.length > 0) {
      if (!selectedHerb || !filteredHerbs.some(h => h.id === selectedHerb.id)) {
        setSelectedHerb(filteredHerbs[0]);
      }
    }
  }, [filteredHerbs, selectedHerb]);

  const currentInteractions = selectedHerb ? parseStringOrArray(selectedHerb.drug_interactions) : [];
  const currentTastes = selectedHerb ? parseTasteList(selectedHerb.thai_medicine_taste) : [];
  const tasteAnalysis = useMemo(() => analyzeTasteConflict(currentTastes), [currentTastes]);
  const hasConfiguredMedications =
    profile.medications.length > 0 || Array.isArray(profile.drugCategoryIds);

  return (
    <InfoDialog
      isOpen={true}
      customChrome
      title="4. ตรวจสอบยาตีกัน & รสยาขัดแย้ง"
      description="ตรวจสอบปฏิกิริยาระหว่างยาแผนปัจจุบันกับสมุนไพรและรสยาที่ขัดแย้งกัน"
      ariaLabelledBy="drug-interaction-modal-title"
      onClose={onClose}
      maxWidth="max-w-3xl"
      maxHeight="max-h-[92vh]"
      overlayClassName="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      className="bg-white rounded-3xl w-full overflow-y-auto p-5 sm:p-7 shadow-2xl border border-border-default flex flex-col gap-5"
    >
        {/* ── Header ── */}
        <div className="flex items-start justify-between border-b border-neutral-100 pb-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-rose-100 shadow-sm bg-rose-50 mt-0.5 p-1 flex items-center justify-center">
              <FeatureVisualInteraction className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-900 border border-rose-300">
                  {!loading && !error && herbs.length > 0
                    ? `ฐานข้อมูลความปลอดภัย ${herbs.length} ชนิด`
                    : 'ฐานข้อมูลความปลอดภัยสมุนไพร'}
                </span>
                <span className="text-xs font-semibold text-text-muted">
                  ปฏิกิริยาระหว่างยาและรสยาขัดแย้ง
                </span>
              </div>
              <h2 id="drug-interaction-modal-title" className="text-lg sm:text-xl font-bold text-brand-primary leading-snug mt-1">
                4. ตรวจสอบยาตีกัน &amp; รสยาขัดแย้ง
              </h2>
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

        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-neutral-600">
            <div className="w-9 h-9 border-3 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold">กำลังเชื่อมต่อฐานข้อมูลตรวจสอบยาตีกันและรสยา...</span>
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
            <p className="text-sm font-bold text-neutral-700">ไม่พบข้อมูลสมุนไพรสำหรับตรวจสอบยาตีกันในระบบ</p>
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
            {/* ── User Active Prescription Scanner Banner ── */}
            <div className="p-4 rounded-2xl bg-surface-brand border border-border-brand-subtle shadow-2xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-bold text-brand-primary flex items-center gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-base text-emerald-700">prescriptions</span>
                  <span>กลุ่มยาแผนปัจจุบันที่ท่านรับประทานเป็นประจำ ({profile.medications.length} กลุ่ม):</span>
                </span>
                <span className="text-xs font-bold text-neutral-500">
                  สแกนเทียบกับ {herbs.length} รายการ
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                {profile.medications.length > 0 ? (
                  profile.medications.map((m) => (
                    <div 
                      key={m.id} 
                      className="p-2.5 rounded-xl bg-white border border-neutral-200 text-neutral-800 text-xs sm:text-sm font-bold shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                    >
                      <div className="flex items-center gap-2">
                        <span aria-hidden="true" className="material-symbols-outlined text-base text-blue-700">medication</span>
                        <span className="text-neutral-900">{m.name}</span>
                      </div>
                      {m.notes && (
                        <span className="text-xs text-neutral-500 font-normal truncate max-w-xs">
                          (ตัวอย่าง: {m.notes})
                        </span>
                      )}
                    </div>
                  ))
                ) : hasConfiguredMedications ? (
                  <span className="text-xs text-neutral-500 font-medium">✓ ไม่ได้รับประทานยาแผนปัจจุบันเป็นประจำ</span>
                ) : (
                  <span className="text-xs text-neutral-500 font-medium">ยังไม่ได้ระบุรายการยาแผนปัจจุบันในโปรไฟล์</span>
                )}
              </div>

              {/* Alert if any user meds match herbs */}
              {matchedInteractions.length > 0 ? (
                <div className="mt-1 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-sm sm:text-base">
                    <span aria-hidden="true" className="material-symbols-outlined text-rose-600 text-base">report_problem</span>
                    <span>ตรวจพบความเสี่ยงยาตีกันกับสมุนไพร/ตำรับยา {matchedInteractions.length} รายการ:</span>
                  </div>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                    {matchedInteractions.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedHerb(item.herb)}
                        className="p-3 rounded-xl bg-white border border-rose-200/80 hover:border-rose-400 text-xs flex flex-col gap-1.5 shadow-3xs cursor-pointer transition-all"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold text-neutral-900 flex items-center gap-1.5">
                            <span aria-hidden="true" className="material-symbols-outlined text-base text-emerald-800">spa</span>
                            <span>{item.herb.monograph_th}</span>
                          </span>
                          <span className="text-xs bg-rose-100 text-rose-900 px-2 py-0.5 rounded-full font-bold shrink-0">
                            แตะดูรายละเอียด
                          </span>
                        </div>
                        <p className="text-[15px] text-neutral-800 font-medium leading-relaxed bg-rose-50/50 p-2.5 rounded-lg border border-rose-100/60">
                          {item.interactionText}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : hasConfiguredMedications ? (
                <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs sm:text-sm text-emerald-900 font-bold flex items-center gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm text-emerald-700">check_circle</span>
                  <span>ไม่พบการตีกันโดยตรงกับยาหลักที่ท่านทานอยู่ (สามารถเลือกสมุนไพรเพื่อดูข้อมูลยาตีกันและรสยาขัดแย้งด้านล่าง)</span>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-xs sm:text-sm text-neutral-700 font-semibold flex items-center gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm text-neutral-500">info</span>
                  <span>สามารถเลือกสมุนไพรด้านล่างเพื่อตรวจสอบรายการยาแผนปัจจุบันที่มีรายงานการตีกันและรสยาขัดแย้ง</span>
                </div>
              )}
            </div>

            {/* ── Interactive Herb Selector & Quick Chips (294 Records) ── */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-sm font-bold text-brand-primary flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                  <span>เลือกหรือค้นหาสมุนไพรจากฐานข้อมูล ({herbs.length} รายการ):</span>
                </label>

                {/* Scope Filter Pills */}
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => setScopeFilter('interactions_only')}
                    className={`px-2.5 py-1 rounded-xl font-bold cursor-pointer border transition-all flex items-center gap-1 ${
                      scopeFilter === 'interactions_only'
                        ? 'bg-rose-700 text-white border-rose-700 shadow-3xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-sm">medication</span>
                    <span>มีรายงานยาตีกัน ({herbsWithInteractions.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setScopeFilter('all')}
                    className={`px-2.5 py-1 rounded-xl font-bold cursor-pointer border transition-all flex items-center gap-1 ${
                      scopeFilter === 'all'
                        ? 'bg-brand-primary text-white border-brand-primary shadow-3xs'
                        : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                    }`}
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-sm">menu_book</span>
                    <span>ทั้งหมด ({herbs.length})</span>
                  </button>
                </div>
              </div>

              {/* Quick selection chips */}
              <div className="flex flex-wrap gap-1.5">
                {QUICK_HERB_CHIPS.map((hName) => {
                  const item = herbs.find(h => h.monograph_th === hName);
                  if (!item) return null;
                  const isSelected = selectedHerb?.monograph_th === hName;
                  return (
                    <button
                      key={hName}
                      type="button"
                      onClick={() => {
                        setHerbSearch('');
                        setSelectedHerb(item);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-rose-700 text-white shadow-xs scale-102' 
                          : 'bg-neutral-50 text-neutral-700 border border-neutral-200 hover:border-rose-400 hover:bg-rose-50/50'
                      }`}
                    >
                      🌿 {hName}
                    </button>
                  );
                })}
              </div>

              {/* Direct Dropdown + Search Bar */}
              <div className="p-3.5 rounded-2xl bg-neutral-50/90 border border-neutral-200/90 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between shadow-3xs">
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                  <div className="flex items-center gap-1.5 text-neutral-800 shrink-0">
                    <span aria-hidden="true" className="material-symbols-outlined text-lg text-rose-700">format_list_bulleted</span>
                    <label htmlFor="interaction-herb-select" className="text-xs sm:text-sm font-bold whitespace-nowrap">
                      เลือกสมุนไพร/ตำรับยา:
                    </label>
                  </div>
                  <div className="flex-1 relative">
                    <select
                      id="interaction-herb-select"
                      value={selectedHerb?.id || ''}
                      onChange={(e) => {
                        const found = herbs.find(h => h.id === Number(e.target.value));
                        if (found) setSelectedHerb(found);
                      }}
                      className="w-full bg-white border-2 border-rose-700 rounded-xl px-3 py-2 text-xs sm:text-sm font-bold text-neutral-900 focus-visible:outline-none focus-visible:border-rose-800 focus-visible:ring-2 focus-visible:ring-rose-500/40 cursor-pointer shadow-2xs transition-all"
                    >
                      {filteredHerbs.map(h => (
                        <option key={h.id} value={h.id}>
                          #{h.display_index || h.id} {h.monograph_th} {h.english_title ? `(${h.english_title})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Search Input Box */}
                <div className="md:w-72 relative shrink-0">
                  <input
                    type="text"
                    aria-label="ค้นหาชื่อสมุนไพร รสยา หรือชื่อยา"
                    value={herbSearch}
                    onChange={(e) => setHerbSearch(e.target.value)}
                    placeholder="ค้นหาชื่อสมุนไพร, รสยา, หรือชื่อยา..."
                    className="w-full h-10 pl-9 pr-10 rounded-xl border border-neutral-500 focus-visible:outline-none focus-visible:border-rose-600 focus-visible:ring-2 focus-visible:ring-rose-500/40 text-xs sm:text-sm font-bold bg-white"
                  />
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-600 flex items-center pointer-events-none">
                    <span aria-hidden="true" className="material-symbols-outlined text-lg">search</span>
                  </div>
                  {herbSearch && (
                    <button
                      type="button"
                      onClick={() => setHerbSearch('')}
                      aria-label="ล้างข้อความค้นหา"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-600 hover:text-neutral-900 rounded-full cursor-pointer"
                      title="ล้างข้อความค้นหา"
                    >
                      <span aria-hidden="true" className="material-symbols-outlined text-base">close</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* ── Selected Herb Interaction & Taste Conflict Detailed Report ── */}
            {selectedHerb && (
              <div className="flex flex-col gap-4">
                
                {/* Herb Header Card */}
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-neutral-900 to-[#2d312e] text-white shadow-md flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-400 text-rose-950 shadow-2xs flex items-center gap-1.5">
                        <span aria-hidden="true" className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
                          warning
                        </span>
                        ลำดับที่ #{selectedHerb.display_index || selectedHerb.id} จาก {herbs.length} รายการ
                      </span>
                      {formatSourcePdfPages(selectedHerb.source_pdf_pages) && (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/15 text-emerald-200 border border-white/20 flex items-center gap-1">
                          <span aria-hidden="true" className="material-symbols-outlined text-xs">description</span>
                          <span>หน้าเอกสารอ้างอิง: หน้า {formatSourcePdfPages(selectedHerb.source_pdf_pages)}</span>
                        </span>
                      )}
                    </div>
                    {selectedHerb.english_title && (
                      <span className="text-xs text-neutral-200 font-medium">
                        {selectedHerb.english_title}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs text-neutral-300 font-bold">สมุนไพร/ตำรับยาที่กำลังตรวจสอบ:</span>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white leading-tight mt-0.5">
                        🌿 {selectedHerb.monograph_th}
                      </h3>
                    </div>
                    {currentTastes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 sm:justify-end">
                        {currentTastes.map((t, idx) => (
                          <span key={idx} className="px-3 py-1 rounded-xl text-xs font-bold bg-white/10 text-white border border-white/20">
                            รส{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 1. Documented Drug Interactions */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200 shadow-2xs flex flex-col gap-2.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm sm:text-base font-bold text-rose-900 flex items-center gap-2">
                      <span aria-hidden="true" className="material-symbols-outlined text-rose-600">sync_problem</span>
                      <span>1. ยาแผนปัจจุบันที่มีรายงานการตีกัน (Reported Drug Interactions):</span>
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                      currentInteractions.length > 0
                        ? 'text-rose-800 bg-rose-50 border-rose-200'
                        : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                    }`}>
                      {currentInteractions.length > 0 ? `พบ ${currentInteractions.length} ประเด็นเฝ้าระวัง` : 'ไม่มีรายงานตีกันรุนแรง'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2 mt-1">
                    {currentInteractions.length > 0 ? (
                      currentInteractions.map((text, idx) => (
                        <div 
                          key={idx} 
                          className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-[15px] font-bold text-rose-950 flex items-start gap-2.5 shadow-3xs leading-relaxed"
                        >
                          <span aria-hidden="true" className="material-symbols-outlined text-rose-600 text-base mt-0.5 shrink-0">
                            warning
                          </span>
                          <span className="leading-relaxed">{text}</span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 rounded-xl bg-neutral-50 text-neutral-600 text-sm sm:text-[15px] leading-relaxed font-medium text-center">
                        ไม่พบรายงานการตีกันกับยาแผนปัจจุบันที่รุนแรงในฐานข้อมูลของ <strong>{selectedHerb.monograph_th}</strong> (อย่างไรก็ตาม ควรรับประทานห่างจากยาแผนปัจจุบันอย่างน้อย 1-2 ชั่วโมง)
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Conflicting Thai Medicine Tastes (รสยาขัดแย้งกัน) */}
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 flex flex-col gap-3 shadow-2xs">
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-amber-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span aria-hidden="true" className="material-symbols-outlined text-amber-800 text-xl">balance</span>
                      <strong className="text-sm sm:text-base font-bold text-amber-950">
                        2. วิเคราะห์รสยาขัดแย้งกัน (หลักเภสัชกรรมแผนไทย)
                      </strong>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${tasteAnalysis.badgeClass}`}>
                      {tasteAnalysis.primaryGroup}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-xl bg-white/90 border border-amber-200/80 flex flex-col gap-1">
                      <span className="text-xs font-bold text-amber-800">รสยาประจำตำรับ/สมุนไพรนี้:</span>
                      <span className="text-[15px] font-bold text-neutral-900 leading-relaxed">
                        {currentTastes.length > 0 ? currentTastes.map(t => `รส${t}`).join(' • ') : 'ตำรับผสมผสาน / ไม่ระบุรสเดี่ยว'}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-rose-50/90 border border-rose-200 flex flex-col gap-1">
                      <span className="text-xs font-bold text-rose-800">กลุ่มรสยาที่ขัดแย้งกัน (ไม่ควรทานพร้อมกัน):</span>
                      <span className="text-[15px] font-bold text-rose-950 leading-relaxed">
                        ⚠️ {tasteAnalysis.conflictingGroup}
                      </span>
                    </div>
                  </div>

                  <p className="text-[15px] text-amber-950 leading-relaxed font-medium">
                    <strong>เหตุผลทางเภสัชกรรมแผนไทย:</strong> {tasteAnalysis.conflictReason}
                  </p>

                  {/* Quick clickable examples of conflicting herbs in the 294 DB */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-xs font-bold text-amber-900">ตัวอย่างสมุนไพรที่รสยาขัดแย้งกัน:</span>
                    {tasteAnalysis.conflictingExamples.map(exName => {
                      const exHerb = herbs.find(h => h.monograph_th === exName);
                      return (
                        <button
                          key={exName}
                          type="button"
                          onClick={() => exHerb && setSelectedHerb(exHerb)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-950 text-xs font-bold hover:bg-amber-100 cursor-pointer transition-colors"
                        >
                          ⚡ {exName}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ── Per-Record Provenance Bar ── */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-700">
                  <div className="flex items-start gap-2">
                    <span aria-hidden="true" className="material-symbols-outlined text-base text-emerald-800 shrink-0 mt-0.5">menu_book</span>
                    <div className="flex flex-col gap-0.5 leading-relaxed">
                      <div>
                        <strong className="text-brand-primary">แหล่งอ้างอิงรายระเบียน:</strong> คณะอนุกรรมการจัดทำตำราอ้างอิงยาสมุนไพรไทย. ตำราอ้างอิงยาสมุนไพรไทย เล่ม 1. กรุงเทพฯ: อมรินทร์พริ้นติ้งแอนด์พับลิชชิ่ง; 2551.
                      </div>
                      {formatSourcePdfPages(selectedHerb.source_pdf_pages) && (
                        <div className="font-bold text-emerald-900">
                          หน้าเอกสารต้นฉบับ: หน้า {formatSourcePdfPages(selectedHerb.source_pdf_pages)}
                        </div>
                      )}
                      {formatRecordDate(selectedHerb.created_at) && (
                        <div className="text-[11px] text-neutral-500 font-medium">
                          บันทึกข้อมูลเมื่อ: {formatRecordDate(selectedHerb.created_at)}
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
            )}
          </>
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
            {!loading && !error && herbs.length > 0 && (
              <span className="text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-neutral-200">
                รวม {herbs.length} ตำรับ/สมุนไพร
              </span>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full h-12 rounded-2xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-hover active:scale-[0.99] transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
        >
          <span>รับทราบข้อควรระวังยาตีกันและรสยาขัดแย้ง / ปิดหน้าต่าง</span>
        </button>

    </InfoDialog>
  );
}
