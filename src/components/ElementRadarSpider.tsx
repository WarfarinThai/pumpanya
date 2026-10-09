import React from 'react';

interface ElementRadarProps {
  birthElement?: 'ดิน' | 'น้ำ' | 'ลม' | 'ไฟ' | null;
  birthMonth?: string;
  onRequestSetBirthMonth?: () => void;
}

// 4 Elemental directions in Thai Traditional Medicine:
// Top: ไฟ (Fire 🔥 / เตโช)
// Right: ลม (Wind 💨 / วาโย)
// Bottom: ดิน (Earth 🌍 / ปฐวี)
// Left: น้ำ (Water 💧 / อาโป)
export default function ElementRadarSpider({ birthElement, birthMonth, onRequestSetBirthMonth }: ElementRadarProps) {
  const cx = 190;
  const cy = 170;
  const maxR = 90;

  // 4 Axes definition with citizen-friendly large badges
  const axes = [
    {
      key: 'ไฟ' as const,
      name: 'ธาตุไฟ',
      emoji: '🔥',
      x: cx,
      y: cy - maxR,
      badgeX: cx,
      badgeY: 34,
    },
    {
      key: 'ลม' as const,
      name: 'ธาตุลม',
      emoji: '💨',
      x: cx + maxR,
      y: cy,
      badgeX: 334,
      badgeY: cy,
    },
    {
      key: 'ดิน' as const,
      name: 'ธาตุดิน',
      emoji: '🌍',
      x: cx,
      y: cy + maxR,
      badgeX: cx,
      badgeY: 306,
    },
    {
      key: 'น้ำ' as const,
      name: 'ธาตุน้ำ',
      emoji: '💧',
      x: cx - maxR,
      y: cy,
      badgeX: 46,
      badgeY: cy,
    },
  ];

  // Calculate polygon vertex points for Birth Element
  const getPoints = (dominant: string) => {
    return axes.map((axis) => {
      let ratio = 0.28;
      if (axis.key === dominant) {
        ratio = 0.94;
      } else if (
        (dominant === 'ไฟ' && (axis.key === 'ลม' || axis.key === 'น้ำ')) ||
        (dominant === 'ลม' && (axis.key === 'ไฟ' || axis.key === 'ดิน')) ||
        (dominant === 'ดิน' && (axis.key === 'ลม' || axis.key === 'น้ำ')) ||
        (dominant === 'น้ำ' && (axis.key === 'ดิน' || axis.key === 'ไฟ'))
      ) {
        ratio = 0.45;
      } else {
        ratio = 0.22;
      }
      const x = cx + (axis.x - cx) * ratio;
      const y = cy + (axis.y - cy) * ratio;
      return { x, y, str: `${x.toFixed(1)},${y.toFixed(1)}` };
    });
  };

  const birthData = birthElement ? getPoints(birthElement) : [];
  const birthPointsStr = birthData.map(p => p.str).join(' ');

  // Concentric radar ring levels (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.50, 0.75, 1.0];

  // Compact empty-state presentation when birthElement is absent
  if (!birthElement) {
    return (
      <div className="w-full flex flex-col bg-gradient-to-b from-white via-amber-50/30 to-amber-50/50 rounded-2xl p-4 sm:p-5 border border-amber-200/80 shadow-xs">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
            <h3 className="text-base sm:text-lg font-semibold text-brand-primary">
              แผนผังธาตุกำเนิดของคุณ
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            ยังไม่ได้ระบุเดือนเกิด
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0" aria-hidden="true">
              <span aria-hidden="true" className="material-symbols-outlined text-2xl">calendar_month</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm text-neutral-700 font-medium leading-relaxed">
                กรุณาระบุเดือนเกิดเพื่อคำนวณธาตุเจ้าเรือนเกิดและรับคำแนะนำเฉพาะบุคคล
              </span>
            </div>
          </div>

          {onRequestSetBirthMonth && (
            <button
              type="button"
              onClick={onRequestSetBirthMonth}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-brand-primary hover:bg-brand-hover active:scale-95 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 flex items-center justify-center gap-1.5 shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary self-start sm:self-auto"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-base">edit_calendar</span>
              <span>ระบุเดือนเกิด</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center bg-gradient-to-b from-white via-surface-muted to-brand-surface rounded-2xl p-4 sm:p-5 border border-brand-border-subtle shadow-xs">
      
      {/* ── Top Header Tag (ตัวอักษรใหญ่ ชัดเจน อ่านง่ายสำหรับประชาชน) ── */}
      <div className="w-full flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-emerald-100/80">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <h3 className="text-base sm:text-lg font-semibold text-brand-primary">
            แผนผังธาตุกำเนิดของคุณ
          </h3>
        </div>

        <div className="px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border flex items-center gap-1.5 shadow-xs bg-emerald-100/90 text-emerald-900 border-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span>ธาตุเจ้าเรือนเกิด</span>
        </div>
      </div>

      {/* ── SVG Pure Vector Radar Graphic ── */}
      <div className="w-full flex justify-center py-1">
        <svg
          viewBox="0 0 380 340"
          className="w-full max-w-[360px] h-auto overflow-visible select-none drop-shadow-xs"
        >
          <defs>
            {/* Birth Element Gradient Fill (Emerald Green) */}
            <linearGradient id="birthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.22" />
            </linearGradient>

            {/* Soft Drop Shadow for Floating Vertex Badges */}
            <filter id="badge-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#003625" floodOpacity="0.08" />
            </filter>

            {/* Soft Glow for Active Badges */}
            <filter id="active-glow" x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.3" />
            </filter>
          </defs>

          {/* 1. Radar Backdrop Ring Layers */}
          <circle cx={cx} cy={cy} r={maxR} fill="#ffffff" fillOpacity="0.8" />
          <circle cx={cx} cy={cy} r={maxR * 0.75} fill="#f9fcfb" fillOpacity="0.6" />
          <circle cx={cx} cy={cy} r={maxR * 0.5} fill="#f2f8f5" fillOpacity="0.5" />
          <circle cx={cx} cy={cy} r={maxR * 0.25} fill="#eaf4ef" fillOpacity="0.4" />

          {/* 2. Concentric Radar Gridlines */}
          {gridLevels.map((lvl, idx) => (
            <g key={`grid-lvl-${idx}`}>
              <circle
                cx={cx}
                cy={cy}
                r={maxR * lvl}
                fill="none"
                stroke="#dce7e1"
                strokeWidth={idx === 3 ? "1.5" : "0.9"}
                strokeDasharray={idx === 3 ? undefined : "3 3"}
              />
              <polygon
                points={axes.map(a => `${cx + (a.x - cx) * lvl},${cy + (a.y - cy) * lvl}`).join(' ')}
                fill="none"
                stroke={idx === 3 ? "#bad8c6" : "#e0eae4"}
                strokeWidth={idx === 3 ? "1.5" : "0.9"}
                strokeDasharray={idx === 3 ? undefined : "2 4"}
              />
            </g>
          ))}

          {/* 3. Crisp 4-Axis Dashed Crosshairs */}
          {axes.map((a, i) => (
            <g key={`crosshair-${i}`}>
              <line
                x1={cx}
                y1={cy}
                x2={a.x}
                y2={a.y}
                stroke="#9fc6b0"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
              <circle
                cx={cx + (a.x - cx) * 0.5}
                cy={cy + (a.y - cy) * 0.5}
                r="2"
                fill="#8ebba2"
              />
              <circle
                cx={cx + (a.x - cx) * 0.75}
                cy={cy + (a.y - cy) * 0.75}
                r="2"
                fill="#8ebba2"
              />
            </g>
          ))}

          {/* 4. Birth Element Overlay Vector Polygon (Emerald Green) */}
          {birthElement && (
            <polygon
              points={birthPointsStr}
              fill="url(#birthGradient)"
              stroke="#059669"
              strokeWidth="2.5"
              strokeLinejoin="round"
              className="transition-all duration-700 ease-out"
            />
          )}

          {/* 5. Vertex Data Anchor Markers with High-Contrast Rings */}
          {birthElement && birthData.map((pt, i) => (
            <circle
              key={`birth-pt-${i}`}
              cx={pt.x}
              cy={pt.y}
              r="4.5"
              fill="#047857"
              stroke="#ffffff"
              strokeWidth="2"
            />
          ))}

          {/* 6. Center Origin Coordinate Core Dot */}
          <circle cx={cx} cy={cy} r="5" fill="#003625" />
          <circle cx={cx} cy={cy} r="2" fill="#ffffff" />

          {/* 7. Floating Capsule Badges with Large Readable Text for Mobile */}
          {axes.map((a, i) => {
            const isBirth = a.key === birthElement;

            const pillW = 86;
            const pillH = 38;
            const pillR = 19;

            let bgFill = '#ffffff';
            let strokeColor = '#d3e2d8';
            let strokeWidth = '1.2';
            let filterId = 'url(#badge-shadow)';

            if (isBirth) {
              bgFill = '#ecfdf5';
              strokeColor = '#10b981';
              strokeWidth = '2.5';
              filterId = 'url(#active-glow)';
            }

            return (
              <g
                key={`badge-${i}`}
                transform={`translate(${a.badgeX}, ${a.badgeY})`}
              >
                {/* Capsule Pill Background */}
                <rect
                  x={-pillW / 2}
                  y={-pillH / 2}
                  width={pillW}
                  height={pillH}
                  rx={pillR}
                  fill={bgFill}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  filter={filterId}
                />

                {/* Elemental Emoji Icon (Large 17px) */}
                <text
                  x={-19}
                  y="6"
                  textAnchor="middle"
                  className="text-[17px] select-none"
                >
                  {a.emoji}
                </text>

                {/* Elemental Thai Name (Large font-bold 15px) */}
                <text
                  x="13"
                  y="6"
                  textAnchor="middle"
                  className={`text-[15px] font-bold select-none ${
                    isBirth ? 'fill-[#065f46]' : 'fill-[#1f2937]'
                  }`}
                >
                  ธาตุ{a.key}
                </text>

                {/* Active Indicator Dot on Pill Corner */}
                {isBirth && (
                  <circle
                    cx={pillW / 2 - 5}
                    cy={-pillH / 2 + 5}
                    r="4"
                    fill="#10b981"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── แถบแสดงธาตุกำเนิดเด่นสง่างาม (ธาตุน้ำ/ธาตุดิน/ธาตุลม/ธาตุไฟ) ── */}
      <div className="w-full mt-3 pt-3 border-t border-emerald-100">
        <div className="flex flex-col p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs sm:text-sm font-bold text-emerald-800">
              🌱 ธาตุกำเนิดของคุณ {birthMonth ? `(เดือน${birthMonth})` : ''}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-white px-2.5 py-0.5 rounded-md border border-emerald-200">
              ธาตุเจ้าเรือนเกิด
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-3xl sm:text-4xl">
              {birthElement === 'ไฟ' ? '🔥' : birthElement === 'ลม' ? '💨' : birthElement === 'ดิน' ? '🌍' : '💧'}
            </span>
            <div className="flex flex-col">
              <span className="text-2xl sm:text-3xl font-bold text-emerald-950 leading-tight">
                ธาตุ{birthElement}
              </span>
              <span className="text-xs sm:text-sm font-medium text-emerald-800 mt-0.5 leading-relaxed">
                {birthElement === 'น้ำ' && 'อาโปธาตุ (สมบูรณ์ ผิวพรรณสดใส เปล่งปลั่ง)'}
                {birthElement === 'ดิน' && 'ปฐวีธาตุ (โครงสร้างแข็งแรง หนักแน่น มั่นคง)'}
                {birthElement === 'ลม' && 'วาโยธาตุ (โปร่ง คล่องแคล่ว มีพลังการเคลื่อนไหว)'}
                {birthElement === 'ไฟ' && 'เตโชธาตุ (อบอุ่น กระตือรือร้น เผาผลาญดี)'}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
