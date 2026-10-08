// Thai Traditional Medicine (TTM) Data & Safety Guidelines
// Aligned with Supabase 'element_profiles' table (solar birth_months):
// - ธาตุไฟ (Fire): มกราคม, กุมภาพันธ์, มีนาคม (เดือน 2, 3, 4)
// - ธาตุลม (Wind): เมษายน, พฤษภาคม, มิถุนายน (เดือน 5, 6, 7)
// - ธาตุน้ำ (Water): กรกฎาคม, สิงหาคม, กันยายน (เดือน 8, 9, 10)
// - ธาตุดิน (Earth): ตุลาคม, พฤศจิกายน, ธันวาคม (เดือน 11, 12, 1)

export interface MonthElementMap {
  month: string;
  element: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ';
  elementName: string;
  characteristics: string;
  balancingTaste: string;
}

export const MONTH_ELEMENT_LIST: MonthElementMap[] = [
  { month: 'มกราคม', element: 'ไฟ', elementName: 'เตโชธาตุ (ธาตุไฟ 🔥)', characteristics: 'มักขี้ร้อน ทนร้อนไม่ค่อยได้ หิวบ่อย เผาผลาญเร็ว', balancingTaste: 'รสขม เย็น จืด' },
  { month: 'กุมภาพันธ์', element: 'ไฟ', elementName: 'เตโชธาตุ (ธาตุไฟ 🔥)', characteristics: 'มักขี้ร้อน ทนร้อนไม่ค่อยได้ หิวบ่อย เผาผลาญเร็ว', balancingTaste: 'รสขม เย็น จืด' },
  { month: 'มีนาคม', element: 'ไฟ', elementName: 'เตโชธาตุ (ธาตุไฟ 🔥)', characteristics: 'มักขี้ร้อน ทนร้อนไม่ค่อยได้ หิวบ่อย เผาผลาญเร็ว', balancingTaste: 'รสขม เย็น จืด' },
  { month: 'เมษายน', element: 'ลม', elementName: 'วาโยธาตุ (ธาตุลม 💨)', characteristics: 'ผิวหนังแห้ง รูปร่างโปร่ง ผอมบาง ข้อกระดูกมักลั่น ท้องอืดง่าย', balancingTaste: 'รสเผ็ดร้อน' },
  { month: 'พฤษภาคม', element: 'ลม', elementName: 'วาโยธาตุ (ธาตุลม 💨)', characteristics: 'ผิวหนังแห้ง รูปร่างโปร่ง ผอมบาง ข้อกระดูกมักลั่น ท้องอืดง่าย', balancingTaste: 'รสเผ็ดร้อน' },
  { month: 'มิถุนายน', element: 'ลม', elementName: 'วาโยธาตุ (ธาตุลม 💨)', characteristics: 'ผิวหนังแห้ง รูปร่างโปร่ง ผอมบาง ข้อกระดูกมักลั่น ท้องอืดง่าย', balancingTaste: 'รสเผ็ดร้อน' },
  { month: 'กรกฎาคม', element: 'น้ำ', elementName: 'อาโปธาตุ (ธาตุน้ำ 💧)', characteristics: 'รูปร่างสมบูรณ์สมส่วน ผิวพรรณสดใสเปล่งปลั่ง ตาหวาน มีเสมหะง่าย', balancingTaste: 'รสเปรี้ยว ขม' },
  { month: 'สิงหาคม', element: 'น้ำ', elementName: 'อาโปธาตุ (ธาตุน้ำ 💧)', characteristics: 'รูปร่างสมบูรณ์สมส่วน ผิวพรรณสดใสเปล่งปลั่ง ตาหวาน มีเสมหะง่าย', balancingTaste: 'รสเปรี้ยว ขม' },
  { month: 'กันยายน', element: 'น้ำ', elementName: 'อาโปธาตุ (ธาตุน้ำ 💧)', characteristics: 'รูปร่างสมบูรณ์สมส่วน ผิวพรรณสดใสเปล่งปลั่ง ตาหวาน มีเสมหะง่าย', balancingTaste: 'รสเปรี้ยว ขม' },
  { month: 'ตุลาคม', element: 'ดิน', elementName: 'ปฐวีธาตุ (ธาตุดิน 🌍)', characteristics: 'รูปร่างสูงใหญ่ ผิวค่อนข้างคล้ำ กระดูกใหญ่ ข้อแข็งแรง เสียงหนักแน่น', balancingTaste: 'รสฝาด หวาน มัน เค็ม' },
  { month: 'พฤศจิกายน', element: 'ดิน', elementName: 'ปฐวีธาตุ (ธาตุดิน 🌍)', characteristics: 'รูปร่างสูงใหญ่ ผิวค่อนข้างคล้ำ กระดูกใหญ่ ข้อแข็งแรง เสียงหนักแน่น', balancingTaste: 'รสฝาด หวาน มัน เค็ม' },
  { month: 'ธันวาคม', element: 'ดิน', elementName: 'ปฐวีธาตุ (ธาตุดิน 🌍)', characteristics: 'รูปร่างสูงใหญ่ ผิวค่อนข้างคล้ำ กระดูกใหญ่ ข้อแข็งแรง เสียงหนักแน่น', balancingTaste: 'รสฝาด หวาน มัน เค็ม' }
];

export function getBirthElement(month?: string | null): MonthElementMap | null {
  if (!month || !month.trim()) return null;
  const trimmed = month.trim();
  const found = MONTH_ELEMENT_LIST.find(m => m.month === trimmed || m.month.includes(trimmed) || trimmed.includes(m.month));
  return found || null;
}

export interface RecommendedHerbItem {
  name: string;
  taste: string;
  sourceName: string;
  sourceUrl: string;
  note: string;
}

// Symptom to Current Element Disruption
export function getCurrentElementFromSymptoms(symptoms: string[]): {
  element: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ';
  elementName: string;
  reason: string;
  overrideAdvice: string;
  recommendedHerbs: RecommendedHerbItem[];
} {
  const isWind = symptoms.some(s => s.includes('ท้องอืด') || s.includes('แน่น') || s.includes('วิงเวียน') || s.includes('ลม'));
  const isWater = symptoms.some(s => s.includes('ไอ') || s.includes('เสมหะ') || s.includes('หวัด') || s.includes('ท้องเสีย'));
  const isFire = symptoms.some(s => s.includes('ไข้') || s.includes('ร้อนใน') || s.includes('เจ็บคอ') || s.includes('ตัวร้อน'));

  if (isWind) {
    return {
      element: 'ลม',
      elementName: 'วาโยธาตุ (ธาตุลม 💨 กำเริบ)',
      reason: 'พบอาการท้องอืด ท้องเฟ้อ แน่นอึดอัด หรือวิงเวียน ซึ่งเป็นภาวะลมคั่งค้างในทางเดินอาหาร',
      overrideAdvice: 'ควรแก้ไขอาการธาตุลมก่อน โดยเลือกใช้สมุนไพรและอาหารที่มีรสเผ็ดร้อน ขับลม กระจายลม',
      recommendedHerbs: [
        {
          name: 'ขมิ้นชัน (Curcuma longa)',
          taste: 'รสฝาด เผ็ดร้อน ขม',
          sourceName: 'ฐานข้อมูลเครื่องยาไทย คณะเภสัชศาสตร์ ม.อุบลราชธานี',
          sourceUrl: 'http://www.thaicrudedrug.com/main.php?action=viewpage&pid=37',
          note: 'ช่วยขับลม แน่นจุกเสียด สมานแผลในกระเพาะอาหาร'
        },
        {
          name: 'ขิง (Zingiber officinale)',
          taste: 'รสเผ็ดร้อน หวาน',
          sourceName: 'ฐานข้อมูลเครื่องยาไทย คณะเภสัชศาสตร์ ม.อุบลราชธานี',
          sourceUrl: 'http://www.thaicrudedrug.com/main.php?action=viewpage&pid=36',
          note: 'กระจายลม แก้ท้องอืดเฟ้อ คลื่นไส้อาเจียน'
        },
        {
          name: 'กานพลู (Syzygium aromaticum)',
          taste: 'รสเผ็ด ปร่า หอม',
          sourceName: 'ฐานข้อมูลเครื่องยาไทย คณะเภสัชศาสตร์ ม.อุบลราชธานี',
          sourceUrl: 'http://www.thaicrudedrug.com/main.php?action=viewpage&pid=20',
          note: 'กระจายเสมหะ ขับลมในลำไส้ แก้ปวดท้อง'
        },
        {
          name: 'ยาธาตุบรรจบ',
          taste: 'รสสุขุม เผ็ดร้อน',
          sourceName: 'ตำรับยาในบัญชียาหลัก คณะเภสัชศาสตร์ ม.อุบลราชธานี',
          sourceUrl: 'http://www.thaicrudedrug.com',
          note: 'บรรเทาอาการท้องอืดเฟ้อ ปรับสมดุลธาตุลม'
        }
      ]
    };
  }

  if (isFire) {
    return {
      element: 'ไฟ',
      elementName: 'เตโชธาตุ (ธาตุไฟ 🔥 กำเริบ)',
      reason: 'มีภาวะร้อนใน มีไข้ตัวร้อน หรือคอแห้งเจ็บคอ แสดงถึงความร้อนสะสมในร่างกายสูงเกินปกติ',
      overrideAdvice: 'ต้องลดความร้อนก่อนเป็นอันดับแรก ห้ามทานสมุนไพรร้อนจัด ให้เน้นรสขมเย็น จืด',
      recommendedHerbs: [
        {
          name: 'ฟ้าทะลายโจร (Andrographis paniculata)',
          taste: 'รสขมจัด',
          sourceName: 'ฐานข้อมูลเครื่องยาไทย คณะเภสัชศาสตร์ ม.อุบลราชธานี',
          sourceUrl: 'http://www.thaicrudedrug.com/main.php?action=viewpage&pid=84',
          note: 'แก้ไข้หวัด เจ็บคอ ร้อนใน (ระวังไม่ทานเกิน 5-7 วัน)'
        },
        {
          name: 'บอระเพ็ด (Tinospora crispa)',
          taste: 'รสขมเย็น',
          sourceName: 'ฐานข้อมูลเครื่องยาไทย คณะเภสัชศาสตร์ ม.อุบลราชธานี',
          sourceUrl: 'http://www.thaicrudedrug.com/main.php?action=viewpage&pid=67',
          note: 'แก้ไข้ ดับพิษร้อน บำรุงน้ำดี เจริญอาหาร'
        },
        {
          name: 'รางจืด (Thunbergia laurifolia)',
          taste: 'รสจืดเย็น',
          sourceName: 'ฐานข้อมูลเครื่องยาไทย คณะเภสัชศาสตร์ ม.อุบลราชธานี',
          sourceUrl: 'http://www.thaicrudedrug.com/main.php?action=viewpage&pid=114',
          note: 'ถอนพิษไข้ ดับพิษร้อน แก้ร้อนในกระหายน้ำ'
        },
        {
          name: 'ยาเขียวหอม',
          taste: 'รสเย็น จืด กลิ่นหอม',
          sourceName: 'ตำรับยาแผนไทย คณะเภสัชศาสตร์ ม.อุบลราชธานี',
          sourceUrl: 'http://www.thaicrudedrug.com',
          note: 'บรรเทาไข้ตัวร้อน ดับพิษไข้ ร้อนใน'
        }
      ]
    };
  }

  if (isWater) {
    return {
      element: 'น้ำ',
      elementName: 'อาโปธาตุ (ธาตุน้ำ 💧 เสียสมดุล)',
      reason: 'มีอาการไอ เสมหะ หรือน้ำมูกไหล เป็นสัญญาณของเสมหะและธาตุน้ำเสียสมดุล',
      overrideAdvice: 'แนะนำสมุนไพรรสเปรี้ยว รสเผ็ดปร่า ช่วยกัดเสมหะ ละลายน้ำมูก และบำรุงปอด',
      recommendedHerbs: [
        {
          name: 'มะขามป้อม (Phyllanthus emblica)',
          taste: 'รสเปรี้ยว ฝาด หวานชุ่มคอ',
          sourceName: 'ฐานข้อมูลเครื่องยาไทย คณะเภสัชศาสตร์ ม.อุบลราชธานี',
          sourceUrl: 'http://www.thaicrudedrug.com/main.php?action=viewpage&pid=104',
          note: 'แก้ไอ ละลายเสมหะ บำรุงเสียง อุดมด้วยวิตามินซี'
        },
        {
          name: 'ชะเอมเทศ (Glycyrrhiza glabra)',
          taste: 'รสหวานชุ่มคอ ชื่นใจ',
          sourceName: 'ฐานข้อมูลเครื่องยาไทย คณะเภสัชศาสตร์ ม.อุบลราชธานี',
          sourceUrl: 'http://www.thaicrudedrug.com/main.php?action=viewpage&pid=44',
          note: 'แก้ไอ ขับเสมหะ บำรุงกำลัง บรรเทาเจ็บคอ'
        },
        {
          name: 'มะแว้งเครือ / ยาประสะมะแว้ง',
          taste: 'รสขม เปรี้ยว ปร่า',
          sourceName: 'ฐานข้อมูลเครื่องยาไทย คณะเภสัชศาสตร์ ม.อุบลราชธานี',
          sourceUrl: 'http://www.thaicrudedrug.com/main.php?action=viewpage&pid=106',
          note: 'กัดเสมหะ บรรเทาอาการไอ เจ็บคอ ขับน้ำมูก'
        }
      ]
    };
  }

  return {
    element: 'ดิน',
    elementName: 'ปฐวีธาตุ (ธาตุดิน 🌍)',
    reason: 'อาการเมื่อยล้า อ่อนเพลีย หรือท้องผูก การทำงานของกล้ามเนื้อและลำไส้เคลื่อนไหวช้า',
    overrideAdvice: 'ปรับสมดุลด้วยการบำรุงธาตุ ทานอาหารที่มีกากใย และสมุนไพรช่วยระบายอ่อนๆ',
    recommendedHerbs: [
      {
        name: 'สมอไทย (Terminalia chebula)',
        taste: 'รสเปรี้ยว ฝาด ขม',
        sourceName: 'ฐานข้อมูลเครื่องยาไทย คณะเภสัชศาสตร์ ม.อุบลราชธานี',
        sourceUrl: 'http://www.thaicrudedrug.com/main.php?action=viewpage&pid=131',
        note: 'ราชาแห่งสมุนไพร ถ่ายพิษไข้ ระบายอ่อนๆ ปรับธาตุ'
      },
      {
        name: 'มะขามแขก (Senna alexandrina)',
        taste: 'รสเอียน ขม เปรี้ยว',
        sourceName: 'ฐานข้อมูลเครื่องยาไทย คณะเภสัชศาสตร์ ม.อุบลราชธานี',
        sourceUrl: 'http://www.thaicrudedrug.com/main.php?action=viewpage&pid=105',
        note: 'ระบายของเสียตกค้าง บรรเทาอาการท้องผูกเรื้อรัง'
      },
      {
        name: 'ตรีผลา (Triphala)',
        taste: 'รสเปรี้ยว ฝาด หวาน',
        sourceName: 'ฐานข้อมูลเครื่องยาไทย คณะเภสัชศาสตร์ ม.อุบลราชธานี',
        sourceUrl: 'http://www.thaicrudedrug.com',
        note: 'ล้างสารพิษ ปรับสมดุลระบบขับถ่ายและภูมิต้านทาน'
      }
    ]
  };
}

// Organ Safety & Safe Duration Rules
export interface HerbDurationRule {
  id: string;
  name: string;
  maxSafeDays: number;
  durationText: string;
  toxicTarget: 'ตับ' | 'ไต' | 'ตับและไต' | 'ความดัน/หัวใจ';
  contraindicatedConditions: string[]; // e.g. ['โรคตับ', 'โรคไต']
  warning: string;
  safeUsageTips: string;
}

export const HERB_DURATION_RULES: HerbDurationRule[] = [
  {
    id: 'fa-thalai',
    name: 'ฟ้าทะลายโจร',
    maxSafeDays: 5,
    durationText: 'ไม่ควรทานติดต่อกันเกิน 3 - 5 วัน',
    toxicTarget: 'ตับและไต',
    contraindicatedConditions: ['โรคตับ', 'โรคไต', 'ความดันโลหิตสูง', 'สตรีมีครรภ์'],
    warning: 'การทานติดต่อกันเป็นเวลานาน สาร Andrographolide อาจสะสมจนทำให้เอนไซม์ตับ (SGOT/SGPT) สูงขึ้น และทำให้ไตทำงานหนัก แขนขาอ่อนแรงได้',
    safeUsageTips: 'ใช้รักษาอาการหวัด เจ็บคอ เมื่อหายแล้วควรหยุดยาทันที หากทานครบ 3 วันไม่ดีขึ้นต้องพบแพทย์'
  },
  {
    id: 'kamin-chan',
    name: 'ขมิ้นชัน',
    maxSafeDays: 28,
    durationText: 'ไม่ควรทานติดต่อกันเกิน 2 - 4 สัปดาห์ (ต้องเว้นระยะ)',
    toxicTarget: 'ตับ',
    contraindicatedConditions: ['โรคนิ่วในถุงน้ำดี', 'ท่อน้ำดีอุดตัน', 'โรคตับรุนแรง'],
    warning: 'ขมิ้นชันช่วยกระตุ้นการหลั่งน้ำดี หากทานต่อเนื่องนานเกินไปโดยไม่เว้นระยะ อาจเกิดภาระต่อตับ และห้ามเด็ดขาดในผู้ป่วยท่อน้ำดีอุดตัน',
    safeUsageTips: 'ทานหลังอาหารเพื่อขับลม เมื่ออาการท้องอืดทุเลาลงให้หยุดพัก ไม่ควรทานแทนยาวิตามินประจำวัน'
  },
  {
    id: 'borapet',
    name: 'บอระเพ็ด',
    maxSafeDays: 7,
    durationText: 'ไม่ควรทานติดต่อกันเกิน 7 วัน',
    toxicTarget: 'ตับ',
    contraindicatedConditions: ['โรคตับ', 'โรคไต', 'สตรีมีครรภ์'],
    warning: 'มีรายงานความเป็นพิษต่อตับ (Toxic Hepatitis) หากทานในปริมาณสูงหรือทานติดต่อกันเป็นเวลานาน',
    safeUsageTips: 'ใช้แก้ไข้ระยะสั้น ห้ามทานต่อเนื่องเป็นยาอายุวัฒนะโดยไม่มีแพทย์แผนไทยควบคุม'
  },
  {
    id: 'ya-stree',
    name: 'ยาสตรี / ยาดองสมุนไพรผสมแอลกอฮอล์',
    maxSafeDays: 7,
    durationText: 'ไม่ควรทานติดต่อกันเกิน 5 - 7 วัน',
    toxicTarget: 'ตับและไต',
    contraindicatedConditions: ['โรคตับ', 'โรคไต', 'มะเร็งเต้านม', 'ความดันโลหิตสูง'],
    warning: 'มักมีส่วนผสมของเอทานอล (แอลกอฮอล์) และพืชกลุ่มไฟโตเอสโตรเจน เร่งการอักเสบของตับและเพิ่มภาระไตอย่างรุนแรง',
    safeUsageTips: 'ไม่ควรทานเป็นประจำเพื่อบำรุงผิวพรรณ ผู้มีโรคตับ/ไต ห้ามรับประทานเด็ดขาด'
  },
  {
    id: 'senna',
    name: 'มะขามแขก (ยาระบาย)',
    maxSafeDays: 7,
    durationText: 'ไม่ควรทานติดต่อกันเกิน 7 วัน',
    toxicTarget: 'ไต',
    contraindicatedConditions: ['โรคไต', 'ลำไส้อุดตัน', 'ภาวะขาดน้ำ'],
    warning: 'ทำให้ลำไส้ติดยา ไม่สามารถขับถ่ายเองได้ และทำให้สูญเสียเกลือแร่โพแทสเซียม เสี่ยงไตวายและหัวใจเต้นผิดจังหวะ',
    safeUsageTips: 'ใช้เฉพาะกรณีท้องผูกเฉียบพลันชั่วคราว ไม่ควรใช้เพื่อลดน้ำหนักเด็ดขาด'
  }
];

// Drug Interactions Matrix (High Alert Warnings)
export interface DrugHerbContraindication {
  drugName: string;
  drugGroup: string;
  conflictingHerbs: string[];
  severity: 'red' | 'orange' | 'yellow';
  riskTitle: string;
  mechanism: string;
  recommendation: string;
}

export const DRUG_HERB_CONTRAINDICATIONS: DrugHerbContraindication[] = [
  {
    drugName: 'Warfarin / Aspirin / Clopidogrel',
    drugGroup: 'ยาต้านการแข็งตัวของเลือดและยาต้านเกล็ดเลือด',
    conflictingHerbs: ['ขิง', 'แปะก๊วย', 'โสม', 'กระชายดำ', 'ตังกุย', 'กระเทียมสกัด'],
    severity: 'red',
    riskTitle: '🚨 อันตรายระดับสีแดง: เสี่ยงเลือดออกไม่หยุด (Bleeding Risk)',
    mechanism: 'สมุนไพรเหล่านี้มีฤทธิ์ยับยั้งการรวมตัวของเกล็ดเลือด เมื่อทานร่วมกับ Warfarin จะเสริมฤทธิ์จนทำให้เลือดออกในทางเดินอาหาร หรือเลือดออกในสมองได้',
    recommendation: 'ห้ามรับประทานสมุนไพรกลุ่มนี้ในรูปแบบสารสกัดเข้มข้นเด็ดขาด หากจำเป็นต้องแจ้งแพทย์ผู้สั่งยาเจาะตรวจค่า INR ทันที'
  },
  {
    drugName: 'Amlodipine / Enalapril / Losartan',
    drugGroup: 'ยาลดความดันโลหิตสูง',
    conflictingHerbs: ['ฟ้าทะลายโจร', 'บัวบก', 'กระเจี๊ยบแดงเข้มข้น', 'ชะเอมเทศ'],
    severity: 'orange',
    riskTitle: '⚠️ ข้อควรระวังสูง: ความดันโลหิตตกวูบ หรือความดันดีดสูงเฉียบพลัน',
    mechanism: 'ฟ้าทะลายโจรและบัวบกเสริมฤทธิ์ลดความดัน อาจทำให้หน้ามืดเป็นลม ส่วนชะเอมเทศทำให้โซเดียมคั่ง ดันความดันให้พุ่งสูงต้านฤทธิ์ยา',
    recommendation: 'หลีกเลี่ยงการทานฟ้าทะลายโจรพร้อมยาลดความดัน และวัดความดันสม่ำเสมอ ห้ามทานชะเอมเทศต่อเนื่อง'
  },
  {
    drugName: 'Metformin / Glipizide / ยาฉีดอินซูลิน',
    drugGroup: 'ยาลดระดับน้ำตาลในเลือด (เบาหวาน)',
    conflictingHerbs: ['ขมิ้นชัน', 'มะระขี้นก', 'ใบหม่อน', 'ว่านหางจระเข้'],
    severity: 'orange',
    riskTitle: '⚠️ เสี่ยงภาวะน้ำตาลในเลือดต่ำเฉียบพลัน (Hypoglycemia)',
    mechanism: 'สมุนไพรรสขมและขมิ้นชันช่วยลดน้ำตาล เมื่อใช้ร่วมกับยาเบาหวานอาจทำให้น้ำตาลลดฮวบจนเกิดอาการใจสั่น เหงื่อแตก หมดสติได้',
    recommendation: 'ต้องตรวจค่าน้ำตาลในเลือดปลายนิ้วสม่ำเสมอ และเว้นระยะห่างจากการทานยาเบาหวานอย่างน้อย 2-3 ชั่วโมง'
  }
];

// G2C Registry Check & Safety Checklist
export interface G2CRecord {
  regNumber: string;
  tradeName: string;
  producer: string;
  status: 'valid' | 'invalid' | 'warning';
  activeIngredients: string;
  steroidTest: 'ผ่านการตรวจ (ปลอดภัย ไร้สเตียรอยด์)' | 'พบสารปนเปื้อน / ไม่ผ่าน';
}

export const SAMPLE_G2C_DATABASE: G2CRecord[] = [
  {
    regNumber: 'G 123/50',
    tradeName: 'ยาแคปซูลขมิ้นชัน อภัยภูเบศร',
    producer: 'มูลนิธิโรงพยาบาลเจ้าพระยาอภัยภูเบศร',
    status: 'valid',
    activeIngredients: 'ผงขมิ้นชันแห้ง 400 มก.',
    steroidTest: 'ผ่านการตรวจ (ปลอดภัย ไร้สเตียรอยด์)'
  },
  {
    regNumber: 'G 456/64',
    tradeName: 'ฟ้าทะลายโจรแคปซูล ศิริราช',
    producer: 'คณะแพทยศาสตร์ศิริราชพยาบาล',
    status: 'valid',
    activeIngredients: 'สารแอนโดรกราโฟไลด์ไม่น้อยกว่า 20 มก./เม็ด',
    steroidTest: 'ผ่านการตรวจ (ปลอดภัย ไร้สเตียรอยด์)'
  },
  {
    regNumber: 'G 789/55',
    tradeName: 'ยาหอมนวโกฐ ตราห้าเจดีย์',
    producer: 'ห้างขายยาแผนโบราณ',
    status: 'valid',
    activeIngredients: 'เกสรทั้ง 5, โกฐทั้ง 9, เทียนทั้ง 9',
    steroidTest: 'ผ่านการตรวจ (ปลอดภัย ไร้สเตียรอยด์)'
  }
];

export const SAFE_PURCHASE_CHECKLIST = [
  { title: 'ต้องมีเลขทะเบียนตำรับยาชัดเจน', desc: 'ต้องขึ้นต้นด้วยตัวอักษร G (ยาสามัญแผนโบราณที่ผลิตในประเทศ) เช่น G 123/50 ตรวจสอบได้ทางเว็บไซต์ อย.' },
  { title: 'ระวังยาลูกกลอนซองฟอยล์ไม่มีฉลาก', desc: 'ยาลูกกลอนสีดำที่อ้างว่า "แก้ปวดข้อ หายปวดทันใจใน 1 ชั่วโมง" มักลักลอบผสมสารสเตียรอยด์ (Dexamethasone) อันตรายถึงชีวิต' },
  { title: 'ไม่มีคำโฆษณาโอ้อวดเกินจริง', desc: 'ยาแผนโบราณที่ถูกต้องตามกฎหมาย จะไม่ระบุว่า "รักษาได้ครอบจักรวาล หายขาดทุกโรค เบาหวาน มะเร็ง อัมพฤกษ์"' },
  { title: 'ระบุวันผลิตและวันหมดอายุ (Exp)', desc: 'สมุนไพรเมื่อเก็บไว้นานเกิน 2-3 ปี มักขึ้นราหรือสารสำคัญสลายตัว ไม่ควรซื้อมารับประทาน' }
];

// Seasonal Transition (กาลสมุฏฐาน / หัวลมไหว)
export interface SeasonInfo {
  seasonName: string;
  seasonType: 'คิมหันตฤดู (ร้อน)' | 'วสันตฤดู (ฝน)' | 'เหมันตฤดู (หนาว)' | 'ช่วงหัวลมไหว (รอยต่อฝนเข้าหนาว)';
  isTransitionPeriod: boolean;
  affectedElement: string;
  healthAlert: string;
  foodAdvice: string[];
  drinkAdvice: string[];
}

export function getCurrentSeasonalData(): SeasonInfo {
  const currentMonth = new Date().getMonth() + 1; // 1 - 12
  
  // Late October - November is the famous "หัวลมไหว" (Late Rain to Early Winter)
  if (currentMonth === 10 || currentMonth === 11) {
    return {
      seasonName: 'ช่วงหัวลมไหว (รอยต่อปลายฝนต้นหนาว)',
      seasonType: 'ช่วงหัวลมไหว (รอยต่อฝนเข้าหนาว)',
      isTransitionPeriod: true,
      affectedElement: 'ธาตุลมและธาตุน้ำแปรปรวน (วาโย-อาโปกำเริบ)',
      healthAlert: '⚠️ ระวัง "ไข้หัวลม" หรือไข้เปลี่ยนฤดู อากาศเริ่มแห้ง ลมหนาวพัดพาความเย็น ทำให้เป็นหวัด คัดจมูก แน่นหน้าอก และปวดเมื่อยตัวง่าย',
      foodAdvice: [
        'แกงส้มดอกแค (ดอกแคช่วยแก้ไข้หัวลม ล้างเสมหะ)',
        'ต้มยำปลาใส่ขิง ข่า ตะไคร้ (ขับเหงื่อ กระจายไอเย็น)',
        'แกงเลียงผักรวมใบแมงลัก (ปรับสมดุลลม)'
      ],
      drinkAdvice: [
        'น้ำขิงต้มอุ่นๆ เติมน้ำผึ้งเล็กน้อย',
        'น้ำมะขามป้อมหรือน้ำตรีผลา ชุ่มคอละลายเสมหะ',
        'น้ำตะไคร้ใบเตย อุ่นสบายท้อง'
      ]
    };
  }

  if (currentMonth >= 3 && currentMonth <= 5) {
    return {
      seasonName: 'คิมหันตฤดู (ฤดูร้อน)',
      seasonType: 'คิมหันตฤดู (ร้อน)',
      isTransitionPeriod: false,
      affectedElement: 'เตโชธาตุ (ธาตุไฟกำเริบ)',
      healthAlert: 'อากาศร้อนจัด ร่างกายสูญเสียน้ำง่าย ระวังความดันขึ้น ปวดศีรษะ ร้อนใน และลมแดด',
      foodAdvice: ['ต้มจืดฟัก มะระต้มกระดูกหมู', 'แกงจืดตำลึงเต้าหู้หมูสับ', 'แตงโม ส้มโอ'],
      drinkAdvice: ['น้ำใบบัวบก (แก้ร้อนในช้ำใน)', 'น้ำเก๊กฮวยไม่หวานจัด', 'น้ำใบเตยหอม']
    };
  }

  if (currentMonth >= 6 && currentMonth <= 9) {
    return {
      seasonName: 'วสันตฤดู (ฤดูฝน)',
      seasonType: 'วสันตฤดู (ฝน)',
      isTransitionPeriod: false,
      affectedElement: 'วาโยธาตุ (ธาตุลมกำเริบ)',
      healthAlert: 'ความชื้นในอากาศสูง ลมในท้องอืดเฟ้อง่าย ทางเดินอาหารแปรปรวน',
      foodAdvice: ['ผัดกะเพราสมุนไพร', 'แกงป่าพริกไทยอ่อน', 'ยำสมุนไพร'],
      drinkAdvice: ['น้ำขิงอุ่น', 'น้ำข่าตะไคร้', 'ชาเกสรดอกไม้']
    };
  }

  // Dec - Feb (Winter)
  return {
    seasonName: 'เหมันตฤดู (ฤดูหนาว)',
    seasonType: 'เหมันตฤดู (หนาว)',
    isTransitionPeriod: false,
    affectedElement: 'อาโปธาตุ (ธาตุน้ำกำเริบ เสมหะมาก)',
    healthAlert: 'อากาศเย็นแห้ง ผิวแห้งคัน เสมหะเหนียวข้น ไอจามง่าย',
    foodAdvice: ['ต้มส้มปลาทู (รสเปรี้ยวเผ็ด)', 'แกงส้มผักกาดดอง', 'ผัดเผ็ดไก่'],
    drinkAdvice: ['น้ำมะนาวอุ่นผสมน้ำผึ้ง', 'น้ำมะขามป้อม', 'น้ำขิงแก่']
  };
}
