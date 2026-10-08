import React, { useState } from 'react';
import { HealthProfile, Medication } from '../types';
import { STANDARD_DRUG_CATEGORIES } from '../data/standardDrugCategories';

interface HealthProfileFormProps {
  onSubmit: (profile: HealthProfile) => void;
  initialProfile?: HealthProfile | null;
}

export default function HealthProfileForm({ onSubmit, initialProfile }: HealthProfileFormProps) {
  // Current active step: 1, 2, 3, or 4
  const [step, setStep] = useState(1);

  // Form State Values (initialized from initialProfile or safe empty/unknown defaults)
  const [ageRange, setAgeRange] = useState(initialProfile?.ageRange || '');
  const [gender, setGender] = useState<'male' | 'female' | 'unspecified'>(initialProfile?.gender || 'unspecified');
  const [weight, setWeight] = useState(initialProfile?.weight ?? 0);
  const [isPregnant, setIsPregnant] = useState(initialProfile?.isPregnant || false);
  const [chronicConditions, setChronicConditions] = useState<string[]>(
    initialProfile?.chronicConditions || []
  );
  const [allergies, setAllergies] = useState<'none' | 'has-allergy' | 'unknown'>(initialProfile?.allergies || 'unknown');
  const [allergyDetails, setAllergyDetails] = useState(initialProfile?.allergyDetails || '');
  const [currentSymptoms, setCurrentSymptoms] = useState<string[]>(
    initialProfile?.currentSymptoms || []
  );

  // Traditional observations state
  const [heatLevel, setHeatLevel] = useState<'cold' | 'normal' | 'hot' | 'unknown'>(
    initialProfile?.traditional?.heatLevel || 'unknown'
  );
  const [windType, setWindType] = useState<'after-meal' | 'empty-stomach' | 'rare' | 'unknown'>(
    initialProfile?.traditional?.windType || 'unknown'
  );
  const [bowelHabit, setBowelHabit] = useState(initialProfile?.traditional?.bowelHabit || '');
  const [sleepQuality, setSleepQuality] = useState(initialProfile?.traditional?.sleepQuality || '');

  // Selected drug category IDs (initialized from existing profile or mapped from medications)
  const getInitialCategories = () => {
    if (initialProfile?.drugCategoryIds && initialProfile.drugCategoryIds.length > 0) {
      return [...initialProfile.drugCategoryIds];
    }
    const set = new Set<string>();
    (initialProfile?.medications || []).forEach(m => {
      if (m.categoryId) {
        set.add(m.categoryId);
      } else {
        const n = m.name.toLowerCase();
        STANDARD_DRUG_CATEGORIES.forEach(cat => {
          if (cat.keywords.some(k => n.includes(k.toLowerCase()))) {
            set.add(cat.id);
          }
        });
      }
    });
    return Array.from(set);
  };

  const [selectedDrugCategoryIds, setSelectedDrugCategoryIds] = useState<string[]>(getInitialCategories());

  const toggleDrugCategory = (catId: string) => {
    setSelectedDrugCategoryIds(prev => {
      if (prev.includes(catId)) {
        return prev.filter(id => id !== catId);
      } else {
        return [...prev, catId];
      }
    });
  };

  const handleSelectNoDrugs = () => {
    setSelectedDrugCategoryIds([]);
  };

  // Toggle handlers
  const toggleChronicCondition = (condition: string) => {
    if (chronicConditions.includes(condition)) {
      setChronicConditions(chronicConditions.filter(c => c !== condition));
    } else {
      setChronicConditions([...chronicConditions, condition]);
    }
  };

  const toggleSymptom = (symptom: string) => {
    if (currentSymptoms.includes(symptom)) {
      setCurrentSymptoms(currentSymptoms.filter(s => s !== symptom));
    } else {
      setCurrentSymptoms([...currentSymptoms, symptom]);
    }
  };

  const handleNextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step < 4) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Build standardized medications from selected categories
    const compiledMeds: Medication[] = selectedDrugCategoryIds.map((catId, idx) => {
      const cat = STANDARD_DRUG_CATEGORIES.find(c => c.id === catId);
      return {
        id: String(idx + 1),
        name: cat ? cat.categoryName : catId,
        dosage: 'รับประทานประจำ',
        frequency: 'ประจำวัน',
        categoryId: catId,
        notes: cat ? cat.commonExamples : ''
      };
    });

    const profile: HealthProfile = {
      birthMonth: initialProfile?.birthMonth,
      birthElement: initialProfile?.birthElement,
      ageRange,
      gender,
      weight: Number(weight) || 0,
      isPregnant,
      chronicConditions,
      medications: compiledMeds,
      drugCategoryIds: selectedDrugCategoryIds,
      allergies,
      allergyDetails: allergies === 'has-allergy' ? allergyDetails : '',
      currentSymptoms,
      traditional: {
        heatLevel,
        windType,
        bowelHabit,
        sleepQuality
      }
    };
    onSubmit(profile);
  };

  const ageOptions = ['ต่ำกว่า 20 ปี', '20–39 ปี', '40–59 ปี', '60–69 ปี', '70 ปีขึ้นไป'];

  const diseaseOptions = [
    'เบาหวาน (Diabetes)',
    'ความดันโลหิตสูง (HT)',
    'โรคหัวใจ',
    'โรคตับ',
    'โรคไต',
    'โรคเกล็ดเลือด / ยาละลายลิ่มเลือด',
    'โรคภูมิแพ้ทั่วไป'
  ];

  const symptomOptions = [
    'ท้องอืด ท้องเฟ้อ แน่นท้อง',
    'ไอ มีเสมหะ',
    'เจ็บคอ / คอแห้ง',
    'มีไข้ตัวร้อนต่ำๆ',
    'ท้องเสียง่าย',
    'ท้องผูก',
    'วิงเวียนศีรษะ',
    'ปวดเมื่อยกล้ามเนื้อ'
  ];

  const getStepProgressPercentage = () => {
    return (step / 4) * 100;
  };

  return (
    <div className="w-full flex flex-col gap-5 max-w-md mx-auto pb-8">
      
      {/* Visual Stepper Progress Indicator */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e5e0d8]/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-[#1a6b4c] tracking-wider">
            ขั้นตอนประเมิน ({step}/4)
          </span>
          <span className="text-xs font-bold text-[#003625]">
            {step === 1 && 'ข้อมูลพื้นฐานทั่วไป'}
            {step === 2 && 'โรคประจำตัวและยาเดิม'}
            {step === 3 && 'อาการเด่น & ประวัติแพ้ยา'}
            {step === 4 && 'สมดุลร่างกายแผนไทย'}
          </span>
        </div>
        
        {/* Minimal Progress Bar */}
        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#003625] transition-all duration-300"
            style={{ width: `${getStepProgressPercentage()}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
        
        {/* STEP 1: DEMOGRAPHICS */}
        {step === 1 && (
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#e5e0d8]/40 flex flex-col gap-4 animate-fade-in">
            <h3 className="text-sm font-bold text-[#003625] border-b pb-2 mb-1">ส่วนที่ 1: ข้อมูลสุขภาพทั่วไป</h3>
            
            {/* Age selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#404944]">ช่วงอายุของคุณ</label>
              <div className="grid grid-cols-2 gap-2">
                {ageOptions.map((opt) => {
                  const isSelected = ageRange === opt || (opt.startsWith('70') && ageRange.includes('70'));
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setAgeRange(opt)}
                      className={`h-10 rounded-xl text-xs font-semibold flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-[#003625] text-white border-[#003625] font-bold shadow-sm'
                          : 'bg-[#fbf9f6] text-[#1c1c19] border-[#e5e0d8] hover:bg-neutral-50'
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gender selector */}
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-xs font-bold text-[#404944]">เพศ</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'male', label: 'ชาย', icon: 'male' },
                  { id: 'female', label: 'หญิง', icon: 'female' },
                  { id: 'unspecified', label: 'ทั่วไป', icon: 'person' }
                ].map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setGender(g.id);
                      if (g.id !== 'female') setIsPregnant(false);
                    }}
                    className={`h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border transition-all ${
                      gender === g.id
                        ? 'bg-[#003625] text-white border-[#003625] font-bold shadow-sm'
                        : 'bg-[#fbf9f6] text-[#1c1c19] border-[#e5e0d8]'
                    }`}
                  >
                    <span aria-hidden="true" className="material-symbols-outlined text-sm">{g.icon}</span>
                    <span>{g.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Weight Input */}
            <div className="flex flex-col gap-2 mt-2">
              <label htmlFor="profile-weight-input" className="text-xs font-bold text-[#404944]">น้ำหนักตัวโดยประมาณ (กิโลกรัม)</label>
              <div className="flex items-center h-11 px-4 bg-neutral-50 rounded-xl border border-neutral-600 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#003625]">
                <span aria-hidden="true" className="material-symbols-outlined text-[#4a5550] mr-2 text-sm">scale</span>
                <input
                  id="profile-weight-input"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-transparent text-[#1c1c19] font-bold text-xs focus-visible:outline-none"
                  placeholder="ตัวอย่างเช่น 65"
                  min="20"
                  max="200"
                />
                <span className="text-xs text-[#404944] font-bold">กก.</span>
              </div>
            </div>

            {/* Pregnancy check */}
            {gender === 'female' && (
              <button
                type="button"
                onClick={() => setIsPregnant(!isPregnant)}
                className={`h-11 px-4 rounded-xl flex items-center justify-between border transition-all mt-2 ${
                  isPregnant
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold'
                    : 'bg-neutral-50 border-[#e5e0d8] text-[#404944]'
                }`}
              >
                <span className="text-xs">กำลังตั้งครรภ์ หรืออยู่ในช่วงให้นมบุตร</span>
                <span aria-hidden="true" className="material-symbols-outlined text-sm">
                  {isPregnant ? 'check_circle' : 'radio_button_unchecked'}
                </span>
              </button>
            )}
          </div>
        )}

        {/* STEP 2: CHRONIC DISEASES & MEDICATIONS */}
        {step === 2 && (
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#e5e0d8]/40 flex flex-col gap-4 animate-fade-in">
            <h3 className="text-sm font-bold text-[#003625] border-b pb-2 mb-1">ส่วนที่ 2: โรคและยาแผนปัจจุบันที่ทานประจำ</h3>
            
            {/* Diseases Chips */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#404944]">โรคประจำตัวที่คัดกรองพบ (เลือกได้มากกว่า 1)</label>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {diseaseOptions.map((disease) => {
                  const active = chronicConditions.some(c => c.includes(disease) || disease.includes(c));
                  return (
                    <button
                      key={disease}
                      type="button"
                      onClick={() => toggleChronicCondition(disease)}
                      className={`h-9 px-3 rounded-full text-xs font-bold border transition-all ${
                        active
                          ? 'bg-[#184e3a] text-white border-[#184e3a] shadow-sm'
                          : 'bg-[#fbf9f6] text-[#1c1c19] border-[#e5e0d8] hover:bg-neutral-50'
                      }`}
                    >
                      {disease}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Standardized Drug Categories Multi-Select Selection */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#404944] flex items-center gap-1">
                  <span aria-hidden="true" className="material-symbols-outlined text-sm text-blue-700">medication</span>
                  <span>กลุ่มยาแผนปัจจุบันที่ท่านรับประทานประจำ</span>
                </label>
                <span className="text-xs text-[#1a6b4c] font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                  {selectedDrugCategoryIds.length === 0 ? 'ไม่มียาประจำตัว' : `เลือกแล้ว ${selectedDrugCategoryIds.length} กลุ่ม`}
                </span>
              </div>

              <p className="text-xs text-neutral-500 leading-relaxed">
                เลือกกลุ่มยาตามฉลากซองยาของท่าน (เลือกได้หลายข้อ) เพื่อให้ระบบนำไปตรวจจับยาตีกันกับสมุนไพรได้อย่างแม่นยำ 100%
              </p>

              {/* Quick option: No routine medications */}
              <button
                type="button"
                onClick={handleSelectNoDrugs}
                className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  selectedDrugCategoryIds.length === 0
                    ? 'bg-emerald-900 text-white border-emerald-950 shadow-xs'
                    : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="material-symbols-outlined text-base">
                    {selectedDrugCategoryIds.length === 0 ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <span className="text-xs font-bold">
                    ✓ ไม่ได้รับประทานยาแผนปัจจุบันเป็นประจำ
                  </span>
                </div>
                {selectedDrugCategoryIds.length === 0 && (
                  <span className="text-xs font-bold bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded">
                    เลือกอยู่
                  </span>
                )}
              </button>

              {/* Categorized Options List */}
              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1">
                {STANDARD_DRUG_CATEGORIES.map((cat) => {
                  const isSelected = selectedDrugCategoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleDrugCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                        isSelected
                          ? 'bg-blue-50/80 border-blue-600 ring-1 ring-blue-500/20'
                          : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span aria-hidden="true" className="material-symbols-outlined text-sm text-blue-700 shrink-0">
                            {cat.icon}
                          </span>
                          <span className={`text-xs font-bold leading-tight ${isSelected ? 'text-blue-950' : 'text-neutral-900'}`}>
                            {cat.categoryName}
                          </span>
                        </div>
                        <span aria-hidden="true" className="material-symbols-outlined text-base shrink-0 text-blue-700">
                          {isSelected ? 'check_box' : 'check_box_outline_blank'}
                        </span>
                      </div>

                      <div className="text-xs text-neutral-600 pl-5 leading-relaxed">
                        <strong className="text-neutral-700 font-bold">ตัวอย่างบนซอง: </strong>
                        <span>{cat.commonExamples}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: SYMPTOMS & ALLERGIES */}
        {step === 3 && (
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#e5e0d8]/40 flex flex-col gap-4 animate-fade-in">
            <h3 className="text-sm font-bold text-[#003625] border-b pb-2 mb-1">ส่วนที่ 3: อาการปัจจุบันเด่น &amp; คัดกรองการแพ้</h3>
            
            {/* Symptoms Options */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#404944]">อาการจุกแน่นหรือปัญหาสุขภาพปัจจุบัน</label>
              <div className="grid grid-cols-2 gap-1.5">
                {symptomOptions.map((sym) => {
                  const active = currentSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => toggleSymptom(sym)}
                      className={`h-10 px-2 rounded-xl text-xs font-bold border leading-snug flex items-center justify-center text-center transition-all ${
                        active
                          ? 'bg-[#184e3a] text-white border-[#184e3a] shadow-sm'
                          : 'bg-[#fbf9f6] text-[#1c1c19] border-[#e5e0d8] hover:bg-neutral-50'
                      }`}
                    >
                      {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Allergies checks */}
            <div className="flex flex-col gap-2 mt-2">
              <label className="text-xs font-bold text-[#404944]">ประวัติการแพ้ยาสมุนไพรหรือผลิตภัณฑ์อาหารเสริม</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAllergies('none')}
                  className={`h-10 rounded-xl text-xs font-bold border flex flex-col items-center justify-center transition-all ${
                    allergies === 'none'
                      ? 'bg-[#a5f3cb]/30 border-[#1a6b4c] text-[#002114]'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <span>ไม่เคยแพ้รุนแรง</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAllergies('has-allergy')}
                  className={`h-10 rounded-xl text-xs font-bold border flex flex-col items-center justify-center transition-all ${
                    allergies === 'has-allergy'
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <span>เคยแพ้ยาหรือพืช</span>
                </button>
              </div>

              {allergies === 'has-allergy' && (
                <textarea
                  aria-label="ระบุชื่อยาสมุนไพรที่แพ้ และอาการผื่นคัน หายใจไม่ออก"
                  value={allergyDetails}
                  onChange={(e) => setAllergyDetails(e.target.value)}
                  placeholder="ระบุชื่อยาสมุนไพรที่แพ้ และอาการผื่นคัน หายใจไม่ออก"
                  className="w-full p-2.5 mt-1 rounded-xl bg-neutral-50 border border-neutral-600 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#003625] min-h-[60px]"
                />
              )}
            </div>
          </div>
        )}

        {/* STEP 4: TTM TRADITIONAL OBSERVATIONS */}
        {step === 4 && (
          <div className="rounded-2xl bg-white p-5 shadow-sm border border-[#e5e0d8]/40 flex flex-col gap-4 animate-fade-in">
            <h3 className="text-sm font-bold text-[#003625] border-b pb-2 mb-1">ส่วนที่ 4: สภาพสมดุลร่างกายแผนไทย (ธาตุเจ้าเรือน)</h3>
            
            {/* Heat level / fire element */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#1c1c19]">1. สภาพความร้อนในตัว (ธาตุไฟ)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'cold', label: 'ขี้หนาว เย็นง่าย' },
                  { id: 'normal', label: 'ร่างกายปกติ' },
                  { id: 'hot', label: 'ร้อนใน คอแห้ง' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHeatLevel(item.id as any)}
                    className={`h-10 rounded-xl text-xs font-semibold flex items-center justify-center border transition-all ${
                      heatLevel === item.id
                        ? 'bg-[#003625] text-white border-[#003625] font-bold'
                        : 'bg-neutral-50 border-[#e5e0d8]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Wind conditions */}
            <div className="flex flex-col gap-2 mt-1">
              <label className="text-xs font-bold text-[#1c1c19]">2. อาการจุกแน่นลมในท้อง (ธาตุลม)</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'after-meal', label: 'แน่นหลังมื้อยา' },
                  { id: 'empty-stomach', label: 'แน่นช่วงท้องว่าง' },
                  { id: 'rare', label: 'ไม่มีแก๊สลมแน่น' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setWindType(item.id as any)}
                    className={`h-10 rounded-xl text-xs font-semibold flex items-center justify-center border transition-all ${
                      windType === item.id
                        ? 'bg-[#003625] text-white border-[#003625] font-bold'
                        : 'bg-neutral-50 border-[#e5e0d8]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Bowels and sleep selectors */}
            <div className="grid grid-cols-1 gap-3 mt-1 pt-1 border-t border-dashed">
              <div className="flex flex-col gap-1">
                <label htmlFor="profile-bowel-habit" className="text-xs font-bold text-[#1c1c19]">3. พฤติกรรมการขับถ่ายปกติของคุณ</label>
                <select
                  id="profile-bowel-habit"
                  value={bowelHabit}
                  onChange={(e) => setBowelHabit(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-neutral-50 border border-neutral-600 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003625]"
                >
                  <option value="">-- ยังไม่ได้ระบุ --</option>
                  <option value="ขับถ่ายปกติ ทุกวัน (อุจจาระก้อนนิ่ม)">ขับถ่ายปกติ ทุกวัน (อุจจาระก้อนนิ่ม)</option>
                  <option value="ท้องผูกบ่อย (อุจจาระแข็ง ถ่ายยาก)">ท้องผูกบ่อย (อุจจาระแข็ง ถ่ายยาก)</option>
                  <option value="ท้องเสียง่าย (อุจจาระเหลวบ่อยครั้ง)">ท้องเสียง่าย (อุจจาระเหลวบ่อยครั้ง)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="profile-sleep-quality" className="text-xs font-bold text-[#1c1c19]">4. คุณภาพการนอนหลับและความอยากอาหาร</label>
                <select
                  id="profile-sleep-quality"
                  value={sleepQuality}
                  onChange={(e) => setSleepQuality(e.target.value)}
                  className="h-10 px-3 rounded-xl bg-neutral-50 border border-neutral-600 text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003625]"
                >
                  <option value="">-- ยังไม่ได้ระบุ --</option>
                  <option value="หลับได้ดีตามปกติ เจริญอาหารปกติ">หลับได้ดีตามปกติ เจริญอาหารปกติ</option>
                  <option value="นอนหลับยากตื่นกลางดึก อ่อนเพลีย">นอนหลับยากตื่นกลางดึก อ่อนเพลีย</option>
                  <option value="ทานอาหารได้น้อย เบื่ออาหาร">ทานอาหารได้น้อย เบื่ออาหาร</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION BOTTOM BUTTONS */}
        <div className="flex items-center gap-2 mt-2">
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrevStep}
              className="flex-1 h-11 bg-white border border-[#e5e0d8] text-[#404944] font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all active:scale-[0.98]"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_back</span>
              <span>ย้อนกลับ</span>
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="flex-[2] h-11 bg-[#003625] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all active:scale-[0.98]"
            >
              <span>ถัดไป</span>
              <span aria-hidden="true" className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          ) : (
            <button
              type="submit"
              onClick={handleFormSubmit}
              className="flex-[2] h-11 bg-[#003625] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-md transition-all active:scale-[0.98] hover:bg-[#184e3a]"
            >
              <span>สร้างและดูผลบุคคลจำลองเฉพาะคุณ</span>
              <span aria-hidden="true" className="material-symbols-outlined text-sm">auto_awesome</span>
            </button>
          )}
        </div>

      </form>
    </div>
  );
}
