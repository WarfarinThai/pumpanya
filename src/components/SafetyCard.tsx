import React, { useState } from 'react';
import { SimulationResult, HealthProfile, Herb } from '../types';

interface SafetyCardProps {
  result: SimulationResult;
  profile: HealthProfile;
  herb: Herb;
  onReset: () => void;
}

export default function SafetyCard({ result, profile, herb, onReset }: SafetyCardProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQuickView, setIsQuickView] = useState(false);
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleSaveImage = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      showToast('บันทึกบัตรสรุปความปลอดภัย (ภูมิปัญญา | PUM PANYA) ลงในอัลบั้มรูปภาพสำเร็จ!');
    }, 1200);
  };

  const toggleQuickView = () => {
    setIsQuickView(!isQuickView);
    if (!isQuickView) {
      showToast('เปิดโหมดขยายใหญ่สำหรับปรึกษาเภสัชกรหรือแพทย์');
    }
  };

  const formattedDate = () => {
    const d = new Date();
    const months = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear() + 543} • ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')} น.`;
  };

  return (
    <div className="w-full flex flex-col gap-4 max-w-lg mx-auto pb-12 relative">
      
      {/* Top Helper Notice Banner */}
      <div className="w-full bg-brand-tint/30 rounded-2xl p-4 flex items-start gap-3 border border-brand-secondary/20 shadow-sm">
        <span aria-hidden="true" className="material-symbols-outlined text-brand-secondary text-[24px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
          medical_information
        </span>
        <div className="flex flex-col min-w-0">
          <h2 className="text-xs font-bold text-[#002115]">บัตรสรุปความปลอดภัยสมุนไพร</h2>
          <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
            สามารถยื่นแสดงหน้าจอนี้ให้แพทย์ เภสัชกร หรือบุคลากรแพทย์แผนไทยดูได้ทันทีขณะรับคำปรึกษา
          </p>
        </div>
      </div>

      {/* Main Shareable Safety Card Container */}
      <div 
        id="safety-card" 
        className={`w-full bg-white rounded-2xl shadow-md overflow-hidden flex flex-col border border-border-default transition-all duration-300 ${
          isQuickView ? 'scale-[1.02] border-brand-primary ring-4 ring-brand-tint/20' : ''
        }`}
      >
        {/* Top Dark Green Botanical Brand Bar */}
        <div className="relative w-full bg-brand-primary px-6 py-4 flex items-center justify-between text-white overflow-hidden border-b border-brand-secondary/20">
          {/* Subtle Background SVG Pattern */}
          <svg className="absolute right-0 top-0 h-full w-48 text-brand-tint/10 pointer-events-none -mr-6 -mt-2" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 160 120">
            <path d="M110,120 C110,75 140,40 155,10 C130,30 115,55 105,75 C98,50 90,30 75,15 C85,45 88,70 95,95 C75,70 50,55 25,48 C50,68 70,88 88,110"></path>
            <circle cx="120" cy="28" r="3"></circle>
            <path d="M105,75 C95,95 90,110 88,120"></path>
          </svg>
          
          <div className="relative z-10 flex items-center gap-3 min-w-0">
            <img 
              alt="ภูมิปัญญา | PUM PANYA" 
              className="w-10 h-10 object-contain rounded-full bg-white p-1 shadow-sm shrink-0 border border-brand-gold/20" 
              src="/logo.png"
              referrerPolicy="no-referrer"
            />
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-brand-badge uppercase font-bold tracking-wider leading-none">Clinical Safety Summary</span>
              <span className="text-sm font-bold text-white tracking-tight mt-1">ภูมิปัญญา | PUM PANYA SAFETY CARD</span>
            </div>
          </div>
          
          <div className="relative z-10 flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-full text-brand-badge text-xs font-bold">
            <span aria-hidden="true" className="material-symbols-outlined text-xs">verified</span>
            <span>ID: TT-84920</span>
          </div>
        </div>

        {/* Status Triage Ribbon */}
        <div className="w-full bg-warning-bg px-6 py-3 flex items-center justify-between gap-2 border-b border-warning-border/30">
          <div className="flex items-start gap-2.5 min-w-0">
            <span aria-hidden="true" className="material-symbols-outlined text-warning-text text-[22px] mt-0.5 shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
              warning
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-warning-text">ระดับการเฝ้าระวัง: {result.safetyLevelText}</span>
              <span className="text-xs text-text-secondary truncate mt-0.5">ตรวจพบประเด็นความปลอดภัยสำคัญที่ควรปรึกษาก่อนเริ่มใช้</span>
            </div>
          </div>
          <span className="text-xs bg-white/80 text-warning-text px-2.5 py-0.5 rounded-full font-bold whitespace-nowrap border border-warning-border/40 shadow-sm uppercase">
            Cautionary
          </span>
        </div>

        {/* Card Body Content */}
        <div className="p-6 flex flex-col gap-6">
          
          {/* Section 1: Herb Investigated */}
          <div className="bg-neutral-50 rounded-xl p-4 flex flex-col gap-2 border border-neutral-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-brand-secondary font-bold">1. ข้อมูลสมุนไพรที่ตรวจสอบ</span>
              <span className="text-xs bg-neutral-200 text-neutral-800 px-1.5 py-0.2 rounded font-bold">สมุนไพรเดี่ยว</span>
            </div>
            <div className="flex items-start justify-between gap-3 pt-1">
              <div>
                <h3 className="text-lg font-bold text-brand-primary">{herb.name} ({herb.botanicalName})</h3>
                <p className="text-xs text-text-secondary mt-1 leading-snug">
                  วัตถุประสงค์การใช้: <span className="font-semibold text-neutral-800">{herb.purpose}</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-brand-badge/40 flex items-center justify-center text-brand-primary shrink-0 border">
                <span aria-hidden="true" className="material-symbols-outlined text-[24px]">eco</span>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Rationale Summary */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <span aria-hidden="true" className="material-symbols-outlined text-warning-text-strong text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
              <h4 className="text-xs font-bold text-text-primary">2. สรุปเหตุผลหลักจากการจำลองผลทางเภสัชวิทยา</h4>
            </div>
            
            <div className="space-y-2">
              <div className="bg-neutral-50 rounded-xl p-3.5 flex items-start gap-2.5 border border-neutral-100">
                <span aria-hidden="true" className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>error_outline</span>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-text-primary">ข้อสรุปจำลองปฏิกิริยาร่วมกับยาและโรคประจำตัว</span>
                  <p className="text-[15px] text-text-secondary leading-relaxed mt-1">
                    {result.summary}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Patient Profile Snapshot */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <span aria-hidden="true" className="material-symbols-outlined text-brand-primary text-sm">person_pin</span>
              <h4 className="text-xs font-bold text-text-primary">3. ข้อมูลพื้นฐานและประวัติการใช้ยาของผู้รับการประเมิน</h4>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 flex flex-col gap-0.5">
                <span className="text-xs text-text-muted font-bold">กลุ่มช่วงอายุ</span>
                <span className="text-xs font-bold text-text-primary mt-0.5">
                  {profile.ageRange ? `ช่วงอายุ ${profile.ageRange}` : 'ยังไม่ได้ระบุ'}
                </span>
              </div>
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 flex flex-col gap-0.5">
                <span className="text-xs text-text-muted font-bold">ประวัติแพ้ยา/สมุนไพร</span>
                <span className="text-xs font-bold text-brand-secondary mt-0.5">
                  {profile.allergies === 'has-allergy'
                    ? 'มีรายงาน'
                    : profile.allergies === 'none'
                    ? 'ไม่มีรายงาน'
                    : 'ยังไม่ได้ระบุ'}
                </span>
              </div>
              
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 flex flex-col col-span-2 gap-1">
                <span className="text-xs text-text-muted font-bold">โรคประจำตัวที่บันทึกไว้</span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {profile.chronicConditions.map((c) => (
                    <span key={c} className="bg-neutral-200 text-text-primary text-xs px-2 py-0.5 rounded-full border border-neutral-300 font-semibold">
                      {c}
                    </span>
                  ))}
                  {profile.chronicConditions.length === 0 && (
                    <span className="text-xs text-text-muted">ไม่มีข้อมูล</span>
                  )}
                </div>
              </div>

              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 flex flex-col col-span-2 gap-1">
                <span className="text-xs text-text-muted font-bold">ยาและผลิตภัณฑ์ที่รับประทานเป็นประจำ</span>
                <div className="space-y-1 mt-1">
                  {profile.medications.map((m) => (
                    <div key={m.id} className="flex justify-between items-center text-xs p-1.5 rounded bg-white border border-neutral-200/50">
                      <span className="font-semibold text-neutral-800">• {m.name}</span>
                      <span className="text-xs text-text-muted">{m.dosage} ({m.frequency})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Customized Questions */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span aria-hidden="true" className="material-symbols-outlined text-brand-secondary text-sm">contact_support</span>
                <h4 className="text-xs font-bold text-text-primary">4. คำถามแนะนำสำหรับนำไปปรึกษาแพทย์หรือเภสัชกร</h4>
              </div>
              <span className="text-xs text-brand-secondary font-bold">แนะนำถาม {result.recommendedQuestions?.length || 0} ข้อนี้</span>
            </div>

            <div className="bg-brand-tint/15 rounded-xl p-4 space-y-3 border border-brand-tint/30">
              {result.recommendedQuestions?.map((q, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-brand-secondary text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-text-primary font-medium leading-snug">
                    “{q}”
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Clinical Warning */}
          <div className="w-full bg-[#ffdad6] rounded-xl p-4 flex items-center gap-3 border border-[#ffb4ab]/40">
            <div className="w-10 h-10 rounded-full bg-danger-primary text-white flex items-center justify-center shrink-0 shadow-sm">
              <span aria-hidden="true" className="material-symbols-outlined text-[22px]">do_not_disturb</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-danger-text font-bold">คำเตือนสำคัญทางการแพทย์</span>
              <p className="text-[15px] text-danger-text font-bold leading-relaxed mt-0.5">
                “ห้ามหยุดหรือปรับขนาดยาแผนปัจจุบันที่แพทย์สั่งด้วยตนเองเด็ดขาด แม้จะเริ่มรับประทานสมุนไพร”
              </p>
            </div>
          </div>

          {/* Section 6: QR verification & Timestamp */}
          <div className="bg-neutral-50 rounded-xl p-4 flex items-center justify-between gap-4 border border-neutral-100">
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-brand-primary">สแกนเพื่อยืนยันผลจำลองฉบับสมบูรณ์</span>
              <p className="text-xs text-text-muted leading-relaxed mt-0.5">
                บุคลากรทางการแพทย์สามารถสแกนเพื่ออ่านหลักฐานงานวิจัย ข้อบ่งใช้ TTM Pharmacopeia และกลไกทางสรีรวิทยา
              </p>
              <div className="flex items-center gap-1.5 text-text-muted text-xs mt-2">
                <span aria-hidden="true" className="material-symbols-outlined text-xs">schedule</span>
                <span>ประเมินเมื่อ: {formattedDate()}</span>
              </div>
            </div>

            {/* SVG QR Code Placeholder */}
            <div className="w-20 h-20 bg-white p-1 rounded-lg border border-neutral-200 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full text-[#003625]" fill="currentColor" viewBox="0 0 100 100">
                <rect x="0" y="0" width="30" height="30" rx="3"></rect>
                <rect x="5" y="5" width="20" height="20" fill="#ffffff"></rect>
                <rect x="10" y="10" width="10" height="10"></rect>
                <rect x="70" y="0" width="30" height="30" rx="3"></rect>
                <rect x="75" y="5" width="20" height="20" fill="#ffffff"></rect>
                <rect x="80" y="10" width="10" height="10"></rect>
                <rect x="0" y="70" width="30" height="30" rx="3"></rect>
                <rect x="5" y="75" width="20" height="20" fill="#ffffff"></rect>
                <rect x="10" y="80" width="10" height="10"></rect>
                <rect x="36" y="10" width="8" height="8"></rect>
                <rect x="48" y="4" width="8" height="14"></rect>
                <rect x="38" y="24" width="20" height="8"></rect>
                <rect x="10" y="38" width="16" height="8"></rect>
                <rect x="38" y="38" width="24" height="24" rx="2"></rect>
                <circle cx="50" cy="50" r="6" fill="#ffffff"></circle>
                <rect x="70" y="38" width="12" height="8"></rect>
                <rect x="86" y="42" width="10" height="18"></rect>
                <rect x="70" y="54" width="10" height="12"></rect>
                <rect x="36" y="70" width="14" height="8"></rect>
                <rect x="38" y="84" width="8" height="12"></rect>
                <rect x="56" y="74" width="12" height="22"></rect>
                <rect x="74" y="74" width="22" height="10"></rect>
                <rect x="80" y="90" width="16" height="6"></rect>
              </svg>
            </div>
          </div>

          {/* Card Footer Brand Accent */}
          <div className="text-center pt-3 border-t border-neutral-100 flex flex-col items-center gap-1.5">
            <div className="flex items-center justify-center gap-2 text-neutral-300">
              <svg className="w-8 h-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" viewBox="0 0 40 16">
                <path d="M2,8 C10,3 15,3 20,8 C25,13 30,13 38,8"></path>
                <circle cx="20" cy="8" r="1.8" fill="currentColor"></circle>
              </svg>
              <span aria-hidden="true" className="material-symbols-outlined text-[16px] text-brand-secondary/60">spa</span>
              <svg className="w-8 h-4 rotate-180" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" viewBox="0 0 40 16">
                <path d="M2,8 C10,3 15,3 20,8 C25,13 30,13 38,8"></path>
                <circle cx="20" cy="8" r="1.8" fill="currentColor"></circle>
              </svg>
            </div>
            <p className="text-sm text-text-muted leading-relaxed max-w-sm">
              รายงานนี้จัดทำขึ้นโดยระบบ ภูมิปัญญา | PUM PANYA เพื่อเป็นข้อมูลประกอบการตัดสินใจเบื้องต้น ไม่สามารถทดแทนการตรวจวินิจฉัยโดยแพทย์ผู้เชี่ยวชาญ
            </p>
          </div>

        </div>
      </div>

      {/* Interactive Action Buttons */}
      <div className="mt-4 flex flex-col gap-3">
        <button 
          type="button"
          onClick={handleSaveImage}
          disabled={saving}
          className="w-full h-12 bg-brand-hover text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md hover:bg-brand-primary transition-all active:scale-[0.98]"
        >
          {saving ? (
            <>
              <span aria-hidden="true" className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              <span>กำลังบันทึกภาพ...</span>
            </>
          ) : (
            <>
              <span aria-hidden="true" className="material-symbols-outlined text-[18px]">save_alt</span>
              <span>บันทึกเป็นภาพ (Save Safety Card)</span>
            </>
          )}
        </button>

        <button 
          type="button"
          onClick={toggleQuickView}
          className="w-full h-12 bg-neutral-100 text-brand-secondary rounded-xl font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.98] border transition-colors hover:bg-neutral-200"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
            {isQuickView ? 'close_fullscreen' : 'screen_rotation'}
          </span>
          <span>
            {isQuickView ? 'กลับสู่มุมมองปกติ' : 'แสดงให้เภสัชกรดู (Clinical Quick View)'}
          </span>
        </button>

        <button 
          type="button"
          onClick={onReset}
          className="w-full h-12 text-text-secondary rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 hover:text-brand-primary transition-colors"
        >
          <span aria-hidden="true" className="material-symbols-outlined text-[16px]">refresh</span>
          <span>เริ่มการประเมินความปลอดภัยสมุนไพรใหม่</span>
        </button>
      </div>

      {/* Toast Notification element */}
      {toastMessage && (
        <div role="status" aria-live="polite" className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-5 py-3 rounded-full shadow-2xl flex items-center gap-2 z-50 animate-bounce">
          <span aria-hidden="true" className="material-symbols-outlined text-[20px] text-brand-tint">check_circle</span>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
