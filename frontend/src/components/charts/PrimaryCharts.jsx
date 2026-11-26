import React, { useState } from 'react'

// 1. Grouped Bar Chart: Academic Score vs Curriculum Completion
export function PerformanceBarChart() {
  const [activeIdx, setActiveIdx] = useState(null)
  const data = [
    { cohort: 'CS-401', score: 84, completion: 76 },
    { cohort: 'DS-204', score: 89, completion: 92 },
    { cohort: 'CA-302', score: 77, completion: 69 },
    { cohort: 'UX-110', score: 93, completion: 87 },
    { cohort: 'SE-215', score: 80, completion: 82 },
    { cohort: 'AI-501', score: 86, completion: 80 },
  ]

  return (
    <div className="flex flex-col h-full justify-between gap-3">
      <div className="flex items-center justify-end text-label-sm">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            <span className="w-2.5 h-2.5 rounded-sm bg-light-primary"></span>
            Score
          </span>
          <span className="inline-flex items-center gap-1.5 text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            <span className="w-2.5 h-2.5 rounded-sm bg-light-secondary-container dark:bg-dark-secondary-container"></span>
            Completion
          </span>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-3 items-end h-36 pt-2 border-b border-light-outline-variant dark:border-dark-outline-variant pb-2">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
            onMouseEnter={() => setActiveIdx(idx)}
            onMouseLeave={() => setActiveIdx(null)}
          >
            {activeIdx === idx && (
              <div className="absolute -top-7 px-2 py-0.5 rounded bg-sidebar text-on-sidebar text-[11px] font-mono shadow-md z-10 whitespace-nowrap">
                Score: {item.score}% | Comp: {item.completion}%
              </div>
            )}
            <div className="w-full max-w-[34px] flex items-end gap-1 h-28 relative">
              <div
                className="flex-1 bg-light-primary rounded-t transition-all duration-state-change group-hover:brightness-110"
                style={{ height: `${item.score}%` }}
              />
              <div
                className="flex-1 bg-light-secondary-container dark:bg-dark-secondary-container rounded-t transition-all duration-state-change group-hover:brightness-110"
                style={{ height: `${item.completion}%` }}
              />
            </div>
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              {item.cohort}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
        <span>Average Score: <strong className="font-mono text-light-on-surface dark:text-dark-on-surface">84.8%</strong></span>
        <span>Average Completion: <strong className="font-mono text-light-on-surface dark:text-dark-on-surface">81.0%</strong></span>
      </div>
    </div>
  )
}

// 2. Smooth Area Line Chart: Monthly Admissions & Enrollment Trend
export function EnrollmentAreaChart() {
  const points = [
    { month: 'Jun', value: 310, target: 280 },
    { month: 'Jul', value: 390, target: 350 },
    { month: 'Aug', value: 520, target: 450 },
    { month: 'Sep', value: 480, target: 500 },
    { month: 'Oct', value: 610, target: 550 },
    { month: 'Nov', value: 720, target: 600 },
  ]

  // SVG dimensions
  const width = 360
  const height = 130
  const max = 800
  const pts = points.map((p, i) => {
    const x = 20 + i * ((width - 40) / (points.length - 1))
    const y = height - 20 - (p.value / max) * (height - 35)
    return { x, y, ...p }
  })

  const pathD = pts.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '')
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${height - 15} L ${pts[0].x} ${height - 15} Z`

  return (
    <div className="flex flex-col h-full justify-between gap-2">
      <div className="flex items-center justify-end text-label-sm">
        <span className="font-mono text-label-sm text-on-success-container bg-success-container px-2 py-0.5 rounded-full font-semibold">
          +38.5% YoY
        </span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 overflow-visible">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0037B0" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#0037B0" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          {/* Subtle grid lines */}
          <line x1="20" y1="35" x2={width - 20} y2="35" stroke="currentColor" className="text-light-outline-variant dark:text-dark-outline-variant" strokeDasharray="3 3" />
          <line x1="20" y1="75" x2={width - 20} y2="75" stroke="currentColor" className="text-light-outline-variant dark:text-dark-outline-variant" strokeDasharray="3 3" />

          {/* Area Fill */}
          <path d={areaD} fill="url(#areaGradient)" />
          {/* Line */}
          <path d={pathD} fill="none" stroke="#0037B0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points */}
          {pts.map((pt, i) => (
            <g key={i} className="cursor-pointer group">
              <circle cx={pt.x} cy={pt.y} r="3.5" fill="#FFFFFF" stroke="#0037B0" strokeWidth="2" className="transition-all group-hover:r-5" />
              <text x={pt.x} y={height - 2} textAnchor="middle" className="text-[11px] font-label fill-current text-light-on-surface-variant dark:text-dark-on-surface-variant">
                {pt.month}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex justify-between items-center text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant border-t border-light-outline-variant dark:border-dark-outline-variant pt-2">
        <span>Current Month: <strong className="font-mono text-light-on-surface dark:text-dark-on-surface">720 Admitted</strong></span>
        <span>Target: <strong className="font-mono text-light-on-surface dark:text-dark-on-surface">600</strong></span>
      </div>
    </div>
  )
}

// 3. Donut Chart: Fee Collection Status Breakdown
export function FeeCollectionDonutChart() {
  const segments = [
    { label: 'Paid in Full', percentage: 68, amount: '$125.4K', color: '#059669', strokeColor: 'stroke-success' },
    { label: 'Pending Installment', percentage: 22, amount: '$40.6K', color: '#B45309', strokeColor: 'stroke-pending' },
    { label: 'Overdue / Alerts', percentage: 10, amount: '$18.5K', color: '#BE123C', strokeColor: 'stroke-overdue' },
  ]

  // Circumference of 2 * PI * r (r = 40 => ~251.32)
  const c = 251.32
  const offset1 = c - (segments[0].percentage / 100) * c
  const offset2 = c - ((segments[0].percentage + segments[1].percentage) / 100) * c

  return (
    <div className="flex flex-col h-full justify-between gap-3">
      <div className="flex items-center justify-end text-label-sm">
        <span className="font-mono text-label-sm text-light-primary font-semibold">$184.5K Total</span>
      </div>

      <div className="flex items-center justify-center gap-6 py-1">
        {/* SVG Donut */}
        <div className="relative w-28 h-28 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            {/* Background ring */}
            <circle cx="50" cy="50" r="40" fill="none" strokeWidth="12" className="stroke-light-surface-container-low dark:stroke-dark-surface-container" />
            {/* Segment 1: Paid (68%) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#059669"
              strokeWidth="12"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - 0.68)}
              strokeLinecap="round"
            />
            {/* Segment 2: Pending (22%) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#B45309"
              strokeWidth="12"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - 0.22)}
              transform="rotate(244.8 50 50)"
            />
            {/* Segment 3: Overdue (10%) */}
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="#BE123C"
              strokeWidth="12"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - 0.10)}
              transform="rotate(324 50 50)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-headline text-headline-sm font-bold tabular-nums">68%</span>
            <span className="text-[10px] font-label text-light-on-surface-variant uppercase">Collected</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2 flex-1">
          {segments.map((seg, i) => (
            <div key={i} className="flex items-center justify-between text-label-sm">
              <span className="flex items-center gap-2 text-light-on-surface-variant dark:text-dark-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }}></span>
                {seg.label}
              </span>
              <span className="font-mono text-mono-sm font-semibold tabular-nums text-light-on-surface dark:text-dark-on-surface">
                {seg.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant border-t border-light-outline-variant dark:border-dark-outline-variant pt-2 flex justify-between">
        <span>Term 1 Reconciliation</span>
        <span className="text-on-success-container font-semibold">94% Audited</span>
      </div>
    </div>
  )
}

// 4. Pie / Slice Chart: Departmental Enrollment Share
export function DepartmentPieChart() {
  const depts = [
    { name: 'Computer Science', share: 38, count: '1,079', color: '#0037B0' },
    { name: 'Cloud & DevOps', share: 24, count: '681', color: '#1D4ED8' },
    { name: 'Data Engineering', share: 20, count: '568', color: '#4D5B94' },
    { name: 'UI / UX Design', share: 12, count: '341', color: '#059669' },
    { name: 'Cyber Security', share: 6, count: '171', color: '#B45309' },
  ]

  return (
    <div className="flex flex-col h-full justify-between gap-3">
      <div className="flex items-center justify-end text-label-sm">
        <span className="font-mono text-label-sm font-semibold text-light-primary">5 Departments</span>
      </div>

      {/* Stacked Progress Bar Representation of Pie Share */}
      <div className="space-y-3 py-1">
        <div className="h-4 w-full rounded-full overflow-hidden flex bg-light-surface-container-low dark:bg-dark-surface-container">
          {depts.map((d, i) => (
            <div
              key={i}
              className="h-full transition-all duration-state-change hover:opacity-90"
              style={{ width: `${d.share}%`, backgroundColor: d.color }}
              title={`${d.name}: ${d.share}% (${d.count} students)`}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
          {depts.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-label-sm">
              <span className="flex items-center gap-1.5 text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }}></span>
                <span className="truncate">{d.name}</span>
              </span>
              <span className="font-mono text-mono-sm font-semibold tabular-nums ml-1">
                {d.share}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant border-t border-light-outline-variant dark:border-dark-outline-variant pt-2 flex justify-between">
        <span>Highest Demand</span>
        <span className="font-semibold text-light-primary">Computer Science (+18%)</span>
      </div>
    </div>
  )
}
