// Standardized Drug Category Definitions mapped 1:1 with ThaiHerbalSafety (294 records) database
// Used across Health Profile Editors and Drug Interaction Checking Engine

export interface StandardDrugCategory {
  id: string;
  categoryName: string;
  commonExamples: string;
  icon: string;
  badgeColor: string; // Tailwind class
  interactsWithHerbs: string[]; // Thai herb names
  clinicalRiskSummary: string;
  keywords: string[]; // For checking in monograph text
}

export const STANDARD_DRUG_CATEGORIES: StandardDrugCategory[] = [
  {
    id: 'anticoagulant_antiplatelet',
    categoryName: 'ยาละลายลิ่มเลือด / ยาต้านการแข็งตัวของเลือด / ยาต้านเกล็ดเลือด',
    commonExamples: 'วอร์ฟาริน (Warfarin), แอสไพริน (Aspirin), โคลพิโดเกรล (Clopidogrel / Plavix), Apixaban, NOACs',
    icon: 'bloodtype',
    badgeColor: 'bg-rose-50 text-rose-900 border-rose-300',
    interactsWithHerbs: [
      'กานพลู',
      'โกฐเชียง',
      'ขิง',
      'กระเทียม',
      'น้ำมันระกำ',
      'ยาขมิ้นชัน',
      'ยาสารสกัดขมิ้นชัน',
      'ยาฟ้าทะลายโจร (ชนิดผง)',
      'ยาฟ้าทะลายโจร (ชนิดสารสกัด)',
      'ยาตรีผลา',
      'ยาบำรุงโลหิต',
      'ยากษัยเส้น',
      'ยาอัมฤตย์โอสถ',
      'ยาทำลายพระสุเมรุ',
      'ยาสตรีหลังคลอด',
      'ยาประสะกัญชา',
      'ยาพริก'
    ],
    clinicalRiskSummary: 'สมุนไพรอาจเสริมฤทธิ์ต้านการแข็งตัวของเลือดและต้านเกล็ดเลือด ทำให้เลือดออกง่าย เลือดหยุดยาก หรือค่า INR สูงผิดปกติ',
    keywords: [
      'anticoagulant',
      'antiplatelet',
      'warfarin',
      'aspirin',
      'clopidogrel',
      'apixaban',
      'noacs',
      'heparin',
      'thrombolytic',
      'ecosprin',
      'ลิ่มเลือด',
      'แข็งตัวของเลือด',
      'เกล็ดเลือด',
      'วอร์ฟาริน',
      'แอสไพริน'
    ]
  },
  {
    id: 'antidiabetic',
    categoryName: 'ยาลดน้ำตาลในเลือด / ยารักษาเบาหวาน / ยาฉีดอินซูลิน',
    commonExamples: 'เมตฟอร์มิน (Metformin), ไกลพิไซด์ (Glipizide), ยาฉีดอินซูลิน (Insulin)',
    icon: 'water_drop',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
    interactsWithHerbs: ['ฟ้าทะลายโจร', 'มะระขี้นก', 'ยามะระขี้นก', 'หญ้าหนวดแมว', 'ยาหญ้าหนวดแมว', 'ยาบัวบก'],
    clinicalRiskSummary: 'สมุนไพรอาจเสริมฤทธิ์ลดน้ำตาล เสี่ยงเกิดภาวะน้ำตาลในเลือดต่ำรุนแรง (Hypoglycemia) หรือบัวบกอาจต้านฤทธิ์ยาลดน้ำตาล',
    keywords: ['น้ำตาลในเลือด', 'ยาลดน้ำตาล', 'อินซูลิน', 'เบาหวาน', 'hypoglycemic', 'antidiabetic', 'metformin']
  },
  {
    id: 'antihypertensive',
    categoryName: 'ยาลดความดันโลหิต / ยาโรคหัวใจทั่วไป',
    commonExamples: 'แอมโลดิพีน (Amlodipine), เอแนลาพริล (ACE inhibitor), โพรพราโนลอล (Propranolol)',
    icon: 'cardiology',
    badgeColor: 'bg-blue-50 text-blue-900 border-blue-300',
    interactsWithHerbs: [
      'ฟ้าทะลายโจร',
      'พริกไทย',
      'ยาสหัศธารา',
      'ยาปราบชมพูทวีป',
      'ยาปลูกไฟธาตุ',
      'ยาตรีพิกัด',
      'ยาอัมฤตย์โอสถ',
      'ยาทำลายพระสุเมรุ',
      'ยาพริก'
    ],
    clinicalRiskSummary: 'ฟ้าทะลายโจรอาจเสริมฤทธิ์ลดความดันโลหิต ตำรับที่มีพริกไทยสูงอาจเพิ่มระดับยา propranolol และยาพริกอาจทำให้เกิดอาการไอเมื่อใช้ร่วมกับยากลุ่ม ACE inhibitor',
    keywords: ['ยาลดความดันโลหิต', 'ลดความดัน', 'propranolol', 'ace inhibitor', 'angiotensin']
  },
  {
    id: 'cardiac_glycoside',
    categoryName: 'ยาโรคหัวใจกลุ่มดิจิทาลิส หรือยาคุมจังหวะการเต้นหัวใจ',
    commonExamples: 'ดิจอกซิน (Digoxin), อะมิโอดาโรน (Amiodarone)',
    icon: 'monitor_heart',
    badgeColor: 'bg-purple-50 text-purple-900 border-purple-300',
    interactsWithHerbs: ['โกฐน้ำเต้า', 'ชะเอมจีน', 'ชะเอมเทศ', 'ยาตรีผลา'],
    clinicalRiskSummary: 'การสูญเสียโพแทสเซียมจากสมุนไพรระบาย/ชะเอม หรือการยับยั้งเอนไซม์ CYP1A2 จากยาตรีผลา อาจเพิ่มพิษของยา Digoxin ทำให้หัวใจเต้นผิดจังหวะรุนแรง',
    keywords: ['cardiac glycosides', 'หัวใจเสียจังหวะ', 'ดิจอกซิน', 'digoxin']
  },
  {
    id: 'diuretic',
    categoryName: 'ยาขับปัสสาวะ',
    commonExamples: 'ไธอะไซด์ (HCTZ / Hydrochlorothiazide), ฟูโรซีไมด์ (Furosemide)',
    icon: 'invert_colors',
    badgeColor: 'bg-cyan-50 text-cyan-900 border-cyan-300',
    interactsWithHerbs: ['โกฐน้ำเต้า', 'ชะเอมจีน', 'ชะเอมเทศ', 'ยาบัวบก'],
    clinicalRiskSummary: 'อาจเสริมฤทธิ์ขับปัสสาวะหรือเร่งการสูญเสียเกลือแร่โพแทสเซียมในร่างกาย เกิดภาวะโพแทสเซียมในเลือดต่ำ กล้ามเนื้ออ่อนแรง',
    keywords: ['thiazide diuretics', 'ขับปัสสาวะ', 'ยาขับปัสสาวะ']
  },
  {
    id: 'corticosteroid',
    categoryName: 'ยาสเตียรอยด์ (ชนิดกินหรือฉีด)',
    commonExamples: 'เพรดนิโซโลน (Prednisolone), เดกซาเมทาโซน (Dexamethasone)',
    icon: 'shield',
    badgeColor: 'bg-indigo-50 text-indigo-900 border-indigo-300',
    interactsWithHerbs: ['โกฐน้ำเต้า', 'ชะเอมจีน', 'ชะเอมเทศ', 'เกลือสมุทร', 'เกลือสินเธาว์'],
    clinicalRiskSummary: 'อาจเสริมฤทธิ์การคั่งน้ำและโซเดียม ความดันโลหิตสูง หรือเร่งการสูญเสียโพแทสเซียม',
    keywords: ['corticosteroid', 'corticotrophin']
  },
  {
    id: 'nsaids',
    categoryName: 'ยาแก้ปวดเมื่อยแก้อักเสบกล้ามเนื้อ-ข้อกลุ่มที่ไม่ใช่สเตียรอยด์ (NSAIDs)',
    commonExamples: 'ไอบูโพรเฟน (Ibuprofen), ไดโคลฟีแนก (Diclofenac), เซเลคอกซิเบ (Celebrex)',
    icon: 'healing',
    badgeColor: 'bg-orange-50 text-orange-900 border-orange-300',
    interactsWithHerbs: ['กานพลู', 'กระเทียม'],
    clinicalRiskSummary: 'เพิ่มความเสี่ยงต่อการเกิดแผลในกระเพาะอาหารและภาวะเลือดออกในทางเดินอาหาร',
    keywords: ['nsaids', 'ไม่ใช่สเตียรอยด์']
  },
  {
    id: 'cns_depressant_sedative',
    categoryName: 'ยานอนหลับ / ยาคลายกังวล / ยาคลายกล้ามเนื้อ / ยากดประสาทส่วนกลาง',
    commonExamples: 'กลุ่ม Benzodiazepines (เช่น Diazepam, Lorazepam), Baclofen, Amitriptyline, ยาแก้ปวดกลุ่มมอร์ฟีน',
    icon: 'bedtime',
    badgeColor: 'bg-violet-50 text-violet-900 border-violet-300',
    interactsWithHerbs: [
      'ยาศุขไสยาสน์',
      'ยาประสะกัญชา',
      'ยาบัวบก',
      'ยาน้ำมันกัญชาทั้งห้า',
      'ยาน้ำมันสารสกัดกัญชาที่มี delta-9-tetrahydrocannabinol (THC) และ cannabidiol (CBD) ในอัตราส่วน 1:1',
      'ยาฟ้าทะลายโจร (ชนิดผง)',
      'ยาฟ้าทะลายโจร (ชนิดสารสกัด)',
      'ยาพริก'
    ],
    clinicalRiskSummary: 'เสริมฤทธิ์กดระบบประสาทส่วนกลาง ทำให้ง่วงซึมรุนแรง มึนงง เสี่ยงต่อการพลัดตกหกล้ม หรือกดการหายใจ',
    keywords: [
      'ยานอนหลับ',
      'กดระบบประสาทส่วนกลาง',
      'ง่วงนอน',
      'benzodiazepines',
      'baclofen',
      'barbiturates',
      'มอร์ฟีน',
      'คลายกล้ามเนื้อ',
      'amitriptyline'
    ]
  },
  {
    id: 'statins_lipid',
    categoryName: 'ยาลดไขมันในเลือด / ยาลดคอเลสเตอรอล (กลุ่ม Statins)',
    commonExamples: 'ซิมวาสแตติน (Simvastatin), อะทอร์วาสแตติน (Atorvastatin), โรซูวาสแตติน (Rosuvastatin)',
    icon: 'monitoring',
    badgeColor: 'bg-pink-50 text-pink-900 border-pink-300',
    interactsWithHerbs: ['ยาฟ้าทะลายโจร (ชนิดผง)', 'ยาฟ้าทะลายโจร (ชนิดสารสกัด)', 'ยาบัวบก', 'ยาสารสกัดขมิ้นชัน'],
    clinicalRiskSummary: 'ฟ้าทะลายโจรและสารสกัดขมิ้นชันยับยั้งเอนไซม์ CYP3A4 อาจทำให้ระดับยาลดไขมัน Statins ในเลือดสูงขึ้น เสี่ยงปวดกล้ามเนื้อหรือตับอักเสบ ส่วนบัวบกอาจลดประสิทธิผลของยาลดคอเลสเตอรอล',
    keywords: ['statins', 'คอเลสเตอรอล', 'ยาลดคอเลสเตอรอล', 'cyp3a4']
  },
  {
    id: 'immunosuppressant_antiviral',
    categoryName: 'ยากดภูมิคุ้มกัน / ยาต้านไวรัส / ยาเคมีบำบัดเฉพาะทาง',
    commonExamples: 'ไซโคลสปอริน (Cyclosporin), ทาโครลิมัส (Tacrolimus), ยาต้านไวรัสกลุ่ม Protease Inhibitors (Saquinavir, Ritonavir)',
    icon: 'coronavirus',
    badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    interactsWithHerbs: [
      'กระเทียม',
      'ยาขมิ้นชัน',
      'ยาสารสกัดขมิ้นชัน',
      'ยาตรีผลา',
      'ยาฟ้าทะลายโจร (ชนิดผง)',
      'ยาฟ้าทะลายโจร (ชนิดสารสกัด)',
      'ยาน้ำมันกัญชาทั้งห้า'
    ],
    clinicalRiskSummary: 'สมุนไพรมีผลต่อเอนไซม์ CYP450 อาจเพิ่มระดับยา Tacrolimus/Cyclosporin จนเกิดพิษต่อไตและตับ หรือรบกวนระดับยาต้านไวรัสและยาเคมีบำบัด',
    keywords: [
      'cyclosporin',
      'cyclosporine',
      'ไซโคลสปอริน',
      'saquinavir',
      'ซาควินาเวียร์',
      'tacrolimus',
      'protease inhibitors',
      'indinavir',
      'ritonavir',
      'paclitaxel',
      'doxorubicin',
      'cyclophosphamide',
      'tamoxifen',
      'itraconazole'
    ]
  },
  {
    id: 'tetracycline_antibiotic',
    categoryName: 'ยาปฏิชีวนะฆ่าเชื้อกลุ่มเตตราไซคลีน',
    commonExamples: 'เตตราไซคลีน (Tetracycline), ดอกซีไซคลิน (Doxycycline)',
    icon: 'biotech',
    badgeColor: 'bg-teal-50 text-teal-900 border-teal-300',
    interactsWithHerbs: ['ดีเกลือฝรั่ง'],
    clinicalRiskSummary: 'แร่ธาตุในสมุนไพรจะไปจับตัวกับยาปฏิชีวนะ ทำให้ลำไส้ไม่สามารถดูดซึมยาฆ่าเชื้อได้',
    keywords: ['เททระไซคลีน', 'tetracycline']
  },
  {
    id: 'narrow_therapeutic_window',
    categoryName: 'ยากันชัก / ยาขยายหลอดลม / ยาวัณโรค',
    commonExamples: 'ฟีไนโทอิน (Phenytoin), ธีโอฟิลลีน (Theophylline), ไรแฟมพิซิน (Rifampicin), วาลโพรเอต (Valproate)',
    icon: 'vital_signs',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
    interactsWithHerbs: [
      'พริกไทย',
      'ยาสหัศธารา',
      'ยาปราบชมพูทวีป',
      'ยาปลูกไฟธาตุ',
      'ยาตรีพิกัด',
      'ยาอัมฤตย์โอสถ',
      'ยาทำลายพระสุเมรุ',
      'ยาฟ้าทะลายโจร (ชนิดผง)',
      'ยาฟ้าทะลายโจร (ชนิดสารสกัด)',
      'ยาประสะกัญชา',
      'ยาศุขไสยาสน์',
      'ยาน้ำมันกัญชาทั้งห้า',
      'ยาพริก'
    ],
    clinicalRiskSummary: 'สารพิเพอรีนในตำรับที่มีพริกไทย/ดีปลีสูงและสารในฟ้าทะลายโจร/กัญชา จะเพิ่มระดับยากันชักและยาขยายหลอดลมในเลือด อาจทำให้เกิดความเป็นพิษจากยาและค่าเอนไซม์ตับสูงขึ้น',
    keywords: ['phenytoin', 'theophylline', 'rifampicin', 'valproate', 'phenobarbital', 'topiramate', 'clobazam', 'ต้านการชัก', 'ยากันชัก']
  },
  {
    id: 'psychiatric_maoi',
    categoryName: 'ยาทางจิตเวชกลุ่มยับยั้งเอนไซม์ MAO (MAO inhibitors)',
    commonExamples: 'ยากลุ่มต้านซึมเศร้าเฉพาะทาง เช่น ฟีนิลซีน (Phenelzine)',
    icon: 'psychology',
    badgeColor: 'bg-red-50 text-red-900 border-red-300',
    interactsWithHerbs: ['ระย่อม'],
    clinicalRiskSummary: 'ห้ามใช้ร่วมกันเด็ดขาด (ระย่อมมีข้อห้ามใช้ร่วมกับยายับยั้งเอนไซม์มอโนแอมีนออกซิเดส)',
    keywords: ['mao inhibitors', 'มอโนแอมีนออกซิเดส', 'ยับยั้งเอนไซม์มอโนแอมีน']
  },
  {
    id: 'other_routine_medications',
    categoryName: 'มียาประจำตัวชนิดอื่น ๆ นอกเหนือจากที่ระบุข้างต้น',
    commonExamples: 'ยาคุมกำเนิด, ยาไทรอยด์, วิตามิน หรือยาบำรุงประจำตัวอื่น ๆ',
    icon: 'medication',
    badgeColor: 'bg-neutral-50 text-neutral-800 border-neutral-300',
    interactsWithHerbs: ['รางจืด', 'ยาน้ำมันสารสกัดกัญชาที่มี delta-9-tetrahydrocannabinol (THC) และ cannabidiol (CBD) ในอัตราส่วน 1:1'],
    clinicalRiskSummary: 'ระวังสมุนไพรที่มีฤทธิ์เร่งการขับสารพิษและยา (เช่น รางจืด) หรือรบกวนเอนไซม์ตับ อาจทำให้ระดับยาประจำตัวหรือยาคุมกำเนิดลดลงจนยาไม่ได้ผล',
    keywords: ['เร่งการขับยา', 'ประสิทธิผลของยาลดลง', 'ยาคุมกำเนิด']
  }
];
