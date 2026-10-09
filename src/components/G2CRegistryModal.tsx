import React, { useState } from 'react';
import ErrorState from './ErrorState';
import InfoDialog from './InfoDialog';
import { FeatureVisualRegistry } from './FeatureVisuals';

interface G2CRegistryModalProps {
  onClose: () => void;
}

interface FDAResultItem {
  regNo: string;
  nameTh: string;
  nameEn: string;
  status: string;
  isValid: boolean;
  isExpiredOrCanceled: boolean;
  applicant: string;
  manufacturer: string;
  address: string;
  fdaUrl: string;
  newCode: string;
  type: string;
}

export default function G2CRegistryModal({ onClose }: G2CRegistryModalProps) {
  // เปิดขึ้นมาให้เด้ง "จุดสังเกตยาแผนโบราณปลอดภัย (พกไปเช็กที่ตลาด)" เป็นหน้าแรก
  const [activeTab, setActiveTab] = useState<'checklist' | 'check'>('checklist');
  
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [fdaResults, setFdaResults] = useState<FDAResultItem[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Quick test examples clearly distinguished as samples (including a simulated invalid number for testing alert UI)
  const SAMPLE_QUICK_SEARCHES = [
    { label: 'ตัวอย่าง: G 1/64 (ยาถ่ายมะขามแขก)', query: 'G 1/64', isSimulatedInvalid: false },
    { label: 'ตัวอย่าง: G 303/64 (ยาน้ำมัน)', query: 'G 303/64', isSimulatedInvalid: false },
    { label: 'ตัวอย่าง: G 1064/47 (ส้มแขกใบห่อ)', query: 'G 1064/47', isSimulatedInvalid: false },
    { label: 'ตัวอย่าง: G 123/50 (ขมิ้นชัน)', query: 'G 123/50', isSimulatedInvalid: false },
    { label: '[ตัวอย่างจำลองเลขไม่มีในระบบ] G 9999/99 (ทดลองแจ้งเตือน)', query: 'G 9999/99', isSimulatedInvalid: true },
  ];

  const handleOnlineSearch = async (queryToSearch: string) => {
    const trimmed = queryToSearch.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setSearchError(null);
    setHasSearched(true);
    setFdaResults([]);

    try {
      const res = await fetch('/api/fda-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: trimmed })
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      if (data.results && Array.isArray(data.results)) {
        setFdaResults(data.results);
      } else {
        setFdaResults([]);
      }
    } catch (err: any) {
      console.error('Live FDA query failed:', err);
      setSearchError(
        'ไม่สามารถตรวจสอบข้อมูลความปลอดภัยได้ในขณะนี้ กรุณาลองอีกครั้ง หรือปรึกษาเภสัชกรก่อนใช้สมุนไพรนี้'
      );
      setFdaResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <InfoDialog
      isOpen={true}
      customChrome
      title="5. ตรวจสอบทะเบียนยาออนไลน์"
      description="คู่มือสังเกตยาแผนโบราณปลอดภัยและตรวจสอบเลขทะเบียน อย. ออนไลน์"
      ariaLabelledBy="g2c-registry-modal-title"
      onClose={onClose}
      maxWidth="max-w-xl"
      maxHeight="max-h-[92vh]"
      overlayClassName="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      className="bg-white rounded-3xl w-full overflow-y-auto p-5 sm:p-6 shadow-2xl border border-border-default flex flex-col gap-4"
    >
        {/* ── Modal Header ── */}
        <div className="flex items-start justify-between border-b border-neutral-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-brand-border-subtle/80 shadow-3xs flex items-center justify-center">
              <FeatureVisualRegistry className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-200">
                  อย. กระทรวงสาธารณสุข
                </span>
              </div>
              <h2 id="g2c-registry-modal-title" className="text-lg sm:text-xl font-bold text-brand-primary leading-snug mt-1">
                5. ตรวจสอบทะเบียนยาออนไลน์
              </h2>
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

        {/* ── Navigation Tabs ── */}
        <div className="grid grid-cols-2 p-1 bg-neutral-100/90 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'checklist'
                ? 'bg-white text-brand-primary shadow-xs border border-neutral-200'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-sm text-amber-700">checklist</span>
            <span>จุดสังเกต (พกไปเช็กที่ตลาด)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('check');
              if (!hasSearched && inputQuery.trim()) {
                handleOnlineSearch(inputQuery);
              }
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'check'
                ? 'bg-brand-primary text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <span aria-hidden="true" className="material-symbols-outlined text-sm">verified_user</span>
            <span>ตรวจเลขทะเบียน อย. ออนไลน์</span>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/* TAB 1: จุดสังเกตยาแผนโบราณปลอดภัย (พกไปเช็กที่ตลาด)          */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === 'checklist' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            
            {/* Market Warning Banner */}
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-start gap-3">
              <span aria-hidden="true" className="material-symbols-outlined text-amber-700 text-2xl shrink-0 mt-0.5">
                storefront
              </span>
              <div className="flex flex-col gap-1">
                <h4 className="text-sm font-bold text-amber-950">
                  คู่มือเช็กด่วน 6 ข้อ ก่อนหยิบเงินซื้อยาแผนโบราณตามตลาดนัดหรืองานวัด
                </h4>
                <p className="text-[15px] text-amber-950 leading-relaxed">
                  ยาลูกกลอนและยาแผนโบราณที่วางขายทั่วไป หากไม่มีเลขทะเบียนที่ถูกต้อง มักลักลอบผสม <strong>สเตียรอยด์ (Dexamethasone)</strong> หรือยาแก้ปวดเคมีอันตราย กินแรกๆ หายไวแต่ต่อมาไตวาย กระเพาะทะลุ
                </p>
              </div>
            </div>

            {/* 6 Visual Safety Check Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Point 1 */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <h5 className="text-sm font-bold text-emerald-950">มองหาเลขทะเบียน 'G'</h5>
                </div>
                <p className="text-sm text-emerald-950 leading-relaxed">
                  ต้องมีตัวอักษร <strong>G</strong> นำหน้า เช่น <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono font-bold text-emerald-950">G 123/50</code> หรือ <code className="bg-emerald-100/80 px-1 py-0.5 rounded font-mono font-bold text-emerald-950">G 1/64</code> (เลข 2 ตัวหลังคือปี พ.ศ. ที่ขึ้นทะเบียน)
                </p>
                <span className="text-xs text-emerald-800 font-semibold bg-white/70 px-2 py-0.5 rounded border border-emerald-200/60 w-fit">
                  ✓ หากเป็นเลข อย. 13 หลัก = เป็นแค่อาหารเสริม ไม่ใช่ยา
                </span>
              </div>

              {/* Point 2 */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-neutral-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <h5 className="text-sm font-bold text-neutral-900">ฉลากภาษาไทยต้องครบถ้วน</h5>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  ต้องระบุชื่อยา, ส่วนประกอบสมุนไพรสำคัญ, สรรพคุณ, ขนาดวิธีใช้ และข้อห้ามใช้/คำเตือนอย่างชัดเจน
                </p>
                <span className="text-xs text-rose-800 font-semibold bg-rose-50 px-2 py-0.5 rounded border border-rose-200/60 w-fit">
                  ✕ ห้ามซื้อยาที่มีแต่ภาษาต่างประเทศล้วน
                </span>
              </div>

              {/* Point 3 */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-neutral-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <h5 className="text-sm font-bold text-neutral-900">ผู้ผลิต & วันหมดอายุ (EXP)</h5>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  มีชื่อโรงงาน/ห้างขายยา ที่อยู่ชัดเจน มีเลขที่ครั้งที่ผลิต (Lot/Batch No.), วันผลิต (MFG) และวันหมดอายุ (EXP) ตัวหนังสือคมชัด ไม่เลือนลาง
                </p>
                <span className="text-xs text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 w-fit">
                  ✓ ยาสมุนไพรอายุเฉลี่ยไม่ควรเกิน 2–3 ปี
                </span>
              </div>

              {/* Point 4 */}
              <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-rose-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    4
                  </span>
                  <h5 className="text-sm font-bold text-rose-950">ระวังคำโอ้อวดเกินจริง</h5>
                </div>
                <p className="text-[15px] text-rose-950 leading-relaxed">
                  ห้ามหลงเชื่อคำว่า <strong>"รักษาได้สารพัดโรค"</strong>, "ยาเทวดา/ผีบอก", "หายขาดใน 3 วัน", "รักษาเบาหวาน มะเร็ง อัมพฤกษ์ พร้อมกัน"
                </p>
                <span className="text-xs text-rose-900 font-bold bg-white px-2 py-0.5 rounded border border-rose-300 w-fit">
                  ✕ ยาจริงจะระบุเฉพาะอาการตามตำรับเท่านั้น
                </span>
              </div>

              {/* Point 5 */}
              <div className="p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-rose-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    5
                  </span>
                  <h5 className="text-sm font-bold text-rose-950">ระวังยาลูกกลอนใส่สเตียรอยด์</h5>
                </div>
                <p className="text-[15px] text-rose-950 leading-relaxed">
                  เม็ดกลมสีดำเป็นมันเงาผิดปกติ กลิ่นฉุนสารเคมี กินแล้วหายปวดฉับพลันทันใจ แต่ทำให้หน้าบวมกลม (Moon Face) ผิวบาง กระดูกพรุน
                </p>
                <span className="text-xs text-rose-900 font-bold bg-white px-2 py-0.5 rounded border border-rose-300 w-fit">
                  อันตรายถึงชีวิต เสี่ยงไตวาย-กระเพาะทะลุ
                </span>
              </div>

              {/* Point 6 */}
              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-neutral-800 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    6
                  </span>
                  <h5 className="text-sm font-bold text-neutral-900">ภาชนะบรรจุมิดชิด สะอาด</h5>
                </div>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  มีฝาปิดผนึก มีซีลเรียบร้อย ไม่ชื้น ไม่ขึ้นรา และไม่ซื้อยาที่แบ่งใส่ถุงพลาสติกใส ถุงซิป มัดหนังยางขายตามแผงเร่
                </p>
                <span className="text-xs text-blue-800 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60 w-fit">
                  ✓ ซื้อจากร้านขายยาที่มีใบอนุญาตถูกต้อง
                </span>
              </div>

            </div>

            {/* Action CTA: Move to Online Search */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-brand-primary text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <span aria-hidden="true" className="material-symbols-outlined text-emerald-300 text-2xl">search_check</span>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-white">
                    เจอเลขทะเบียนบนกล่องยาแล้วใช่ไหม?
                  </h5>
                  <p className="text-xs text-emerald-100/90">
                    นำเลขมาตรวจสอบกับฐานข้อมูลทางการของ อย. กระทรวงสาธารณสุข ได้ทันที
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('check');
                  if (!hasSearched && inputQuery.trim()) {
                    handleOnlineSearch(inputQuery);
                  }
                }}
                className="w-full sm:w-auto px-4 py-2.5 bg-emerald-400 text-emerald-950 rounded-xl text-xs font-bold hover:bg-emerald-300 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
              >
                <span>ไปที่หน้าตรวจเลขทะเบียน</span>
                <span aria-hidden="true" className="material-symbols-outlined text-base">arrow_forward</span>
              </button>
            </div>

            {/* FDA Hotline Alert */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-100 text-neutral-700 text-xs">
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true" className="material-symbols-outlined text-sm text-neutral-500">call</span>
                <span>พบยาต้องสงสัยหรือยาแผนโบราณปลอม แจ้งสายด่วน อย.:</span>
              </span>
              <a 
                href="tel:1556" 
                className="font-bold text-brand-primary hover:underline flex items-center gap-0.5 bg-white px-2 py-0.5 rounded-lg border border-neutral-200"
              >
                โทร 1556
              </a>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/* TAB 2: ตรวจสอบเลขทะเบียน อย. ออนไลน์ (Live FDA Web Service)  */}
        {/* ══════════════════════════════════════════════════════════ */}
        {activeTab === 'check' && (
          <div className="flex flex-col gap-4 animate-fade-in">
            
            {/* Back button to checklist */}
            <button
              type="button"
              onClick={() => setActiveTab('checklist')}
              className="text-neutral-500 hover:text-brand-primary text-xs font-bold flex items-center gap-1 w-fit transition-colors"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_back</span>
              <span>กลับไปดูจุดสังเกต 6 ข้อ (พกไปเช็กที่ตลาด)</span>
            </button>

            {/* Input & Search Box */}
            <div className="flex flex-col gap-2 bg-neutral-50 p-3.5 rounded-2xl border border-neutral-200/80">
              <label htmlFor="fda-search-input" className="text-xs font-bold text-text-secondary flex items-center justify-between">
                <span>กรอกเลขทะเบียนยา หรือชื่อยา/สมุนไพร:</span>
                <span className="text-xs font-normal text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  เชื่อมต่อเซิร์ฟเวอร์ อย. ทางการ
                </span>
              </label>

              <div className="flex gap-2">
                <input
                  id="fda-search-input"
                  type="text"
                  value={inputQuery}
                  onChange={(e) => setInputQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleOnlineSearch(inputQuery);
                  }}
                  aria-invalid={!isLoading && (Boolean(searchError) || (hasSearched && fdaResults.length === 0)) ? true : undefined}
                  aria-describedby={
                    !isLoading && searchError
                      ? 'fda-search-error'
                      : !isLoading && hasSearched && fdaResults.length === 0
                        ? 'fda-no-results-error'
                        : undefined
                  }
                  placeholder="กรอกเลขทะเบียนบนกล่องยา เช่น G 1/64 หรือชื่อสมุนไพร"
                  className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm border border-neutral-500 rounded-xl font-mono focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary bg-white shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => handleOnlineSearch(inputQuery)}
                  disabled={isLoading || !inputQuery.trim()}
                  className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-bold hover:bg-brand-hover transition-all disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  {isLoading ? (
                    <>
                      <span aria-hidden="true" className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>กำลังตรวจ...</span>
                    </>
                  ) : (
                    <>
                      <span aria-hidden="true" className="material-symbols-outlined text-sm">search</span>
                      <span>ตรวจสอบ</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Select Sample Buttons */}
              <div className="flex flex-col gap-1.5 pt-1">
                <span className="text-neutral-600 font-bold text-xs">
                  ตัวอย่างสำหรับทดลองระบบค้นหา (ไม่ใช่เลขยาของท่าน):
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                  {SAMPLE_QUICK_SEARCHES.map(item => (
                    <button
                      key={item.query}
                      type="button"
                      onClick={() => {
                        setInputQuery(item.query);
                        handleOnlineSearch(item.query);
                      }}
                      className={`px-2.5 py-1 rounded-lg shrink-0 font-mono text-xs font-bold border transition-colors cursor-pointer ${
                        inputQuery === item.query
                          ? item.isSimulatedInvalid
                            ? 'bg-amber-800 text-white border-amber-900'
                            : 'bg-emerald-800 text-white border-emerald-900'
                          : item.isSimulatedInvalid
                            ? 'bg-amber-50/80 text-amber-950 hover:bg-amber-100 border-dashed border-amber-600'
                            : 'bg-white text-neutral-700 hover:bg-neutral-100 border-neutral-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results Area: 4 Distinct States (LOADING / ERROR / EMPTY / SUCCESS) */}
            {isLoading && (
              <div className="p-8 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 flex flex-col items-center justify-center gap-2.5 text-center" role="status" aria-live="polite">
                <div aria-hidden="true" className="w-8 h-8 border-3 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                <div className="text-xs font-bold text-neutral-800">
                  กำลังส่งคำขอสืบค้นไปยังฐานข้อมูล อย. กระทรวงสาธารณสุข...
                </div>
                <div className="text-xs text-neutral-500">
                  ตรวจสอบสถานะใบอนุญาตและทะเบียนตำรับผลิตภัณฑ์สมุนไพร
                </div>
              </div>
            )}

            {!isLoading && searchError && (
              <ErrorState
                id="fda-search-error"
                isSafetyCritical
                message={searchError}
                onRetry={() => handleOnlineSearch(inputQuery)}
              />
            )}

            {!isLoading && !searchError && hasSearched && fdaResults.length === 0 && (
              <div id="fda-no-results-error" role="alert" className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex flex-col gap-2.5 text-rose-900">
                <div className="flex items-center gap-2 text-rose-800 font-bold text-sm sm:text-base">
                  <span aria-hidden="true" className="material-symbols-outlined text-lg">warning</span>
                  <span>ไม่พบข้อมูลเลขทะเบียนนี้ในระบบ อย.</span>
                </div>
                <p className="text-[15px] text-rose-900 leading-relaxed">
                  เลขทะเบียน <strong>"{inputQuery}"</strong> ไม่ปรากฏในฐานข้อมูลผลิตภัณฑ์สมุนไพรที่ได้รับอนุญาตของสำนักงานคณะกรรมการอาหารและยา
                </p>
                <div className="p-3 bg-white/80 rounded-xl border border-rose-200/80 text-[15px] text-rose-950 leading-relaxed flex flex-col gap-1">
                  <span className="font-bold">⚠️ ข้อควรระวังสูงสุด:</span>
                  <span>• เสี่ยงเป็นยาปลอม ยาไม่มีทะเบียน หรือนำเลขทะเบียนของผลิตภัณฑ์อื่นมาแอบอ้างสวมรอย</span>
                  <span>• ระวังยาลูกกลอนลักลอบผสมสเตียรอยด์ ไม่ควรซื้อมารับประทานโดยเด็ดขาด</span>
                </div>
              </div>
            )}

            {!isLoading && !searchError && fdaResults.length > 0 && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-neutral-600 px-1">
                  <span>พบข้อมูลทั้งหมด <strong>{fdaResults.length}</strong> รายการ:</span>
                  <span className="text-xs text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    ✓ ดึงจากระบบ อย. โดยตรง
                  </span>
                </div>

                {fdaResults.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border flex flex-col gap-2.5 transition-all shadow-2xs ${
                      item.isValid
                        ? 'bg-emerald-50/70 border-emerald-200'
                        : 'bg-amber-50/80 border-amber-200'
                    }`}
                  >
                    {/* Status & Reg No Badge */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-brand-primary bg-white px-2.5 py-0.5 rounded-lg border border-neutral-200 shadow-2xs">
                          {item.regNo || inputQuery}
                        </span>
                        <span className="text-xs text-neutral-600 bg-white/70 px-2 py-0.5 rounded border border-neutral-200">
                          {item.type}
                        </span>
                      </div>

                      {item.isValid ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-900 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          <span aria-hidden="true" className="material-symbols-outlined text-xs text-emerald-700">verified</span>
                          <span>สถานะ: {item.status}</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                          <span aria-hidden="true" className="material-symbols-outlined text-xs text-amber-700">warning</span>
                          <span>สถานะ: {item.status}</span>
                        </span>
                      )}
                    </div>

                    {/* Product Names */}
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-text-primary leading-snug">
                        {item.nameTh !== '-' ? item.nameTh : item.nameEn}
                      </h4>
                      {item.nameEn && item.nameEn !== '-' && (
                        <p className="text-xs text-neutral-500 font-mono mt-0.5">
                          {item.nameEn}
                        </p>
                      )}
                    </div>

                    {/* Manufacturer & Applicant */}
                    <div className="text-xs sm:text-sm text-neutral-700 flex flex-col gap-0.5 bg-white/80 p-2.5 rounded-xl border border-neutral-100">
                      <div>
                        ผู้รับอนุญาต / ผู้ผลิต: <strong className="text-neutral-900">{item.manufacturer || item.applicant || 'ไม่ระบุ'}</strong>
                      </div>
                      {item.address && (
                        <div className="text-xs text-neutral-500 line-clamp-2 mt-0.5">
                          สถานที่ผลิต: {item.address}
                        </div>
                      )}
                    </div>

                    {/* Safety Evaluation & FDA Official URL */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-200/60 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold">
                        <span aria-hidden="true" className="material-symbols-outlined text-base text-emerald-700">security</span>
                        <span className={item.isValid ? 'text-emerald-800' : 'text-amber-800'}>
                          {item.isValid ? 'ผ่านการรับรองตำรับ ปลอดภัย' : 'ทะเบียนไม่พร้อมจำหน่าย'}
                        </span>
                      </div>

                      {item.fdaUrl && (
                        <a
                          href={item.fdaUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-brand-primary hover:text-emerald-700 hover:underline flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-neutral-200 shadow-2xs"
                        >
                          <span>ดูหน้าประกาศทางการ อย.</span>
                          <span aria-hidden="true" className="material-symbols-outlined text-xs">open_in_new</span>
                        </a>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 rounded-2xl bg-brand-primary text-white font-bold text-sm hover:bg-brand-hover transition-all cursor-pointer mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          ปิดหน้าต่าง
        </button>

    </InfoDialog>
  );
}
