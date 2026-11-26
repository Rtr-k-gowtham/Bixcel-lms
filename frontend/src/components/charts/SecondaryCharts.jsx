import React from 'react'

// 5. Weekly Classroom & Lab Occupancy Matrix (Heatmap Grid)
export function ClassroomOccupancyHeatmap() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  const slots = ['09:00', '11:30', '14:00', '16:30']
  const matrix = [
    [92, 88, 95, 78], // Mon
    [85, 96, 90, 82], // Tue
    [98, 94, 88, 70], // Wed
    [82, 89, 94, 85], // Thu
    [75, 80, 68, 55], // Fri
  ]

  const getColor = (val) => {
    if (val >= 90) return 'bg-light-primary text-white'
    if (val >= 80) return 'bg-light-primary-container text-white opacity-85'
    if (val >= 70) return 'bg-light-primary-tint text-light-on-primary-tint font-semibold'
    return 'bg-light-surface-container-low text-light-on-surface-variant'
  }

  return (
    <div className="flex flex-col h-full justify-between gap-3">
      <div className="flex items-center justify-between text-label-sm">
        <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
          Room & Lab Utilization Heatmap
        </span>
        <span className="font-mono text-label-sm font-semibold text-on-success-container bg-success-container px-2 py-0.5 rounded-full">
          86.5% Avg Occupancy
        </span>
      </div>

      <div className="overflow-x-auto py-1">
        <div className="min-w-[280px] space-y-1.5">
          {/* Header row */}
          <div className="grid grid-cols-5 gap-1.5 text-center text-label-sm font-label text-light-on-surface-variant dark:text-dark-on-surface-variant">
            <span className="text-left font-medium">Day</span>
            {slots.map((s, i) => (
              <span key={i} className="font-mono text-[11px]">{s}</span>
            ))}
          </div>

          {/* Matrix rows */}
          {days.map((day, dIdx) => (
            <div key={dIdx} className="grid grid-cols-5 gap-1.5 items-center text-center">
              <span className="text-left font-label text-label-sm font-medium text-light-on-surface dark:text-dark-on-surface">
                {day}
              </span>
              {matrix[dIdx].map((val, sIdx) => (
                <div
                  key={sIdx}
                  className={`py-1 rounded font-mono text-[11px] tabular-nums transition-transform hover:scale-105 cursor-pointer ${getColor(val)}`}
                  title={`${day} @ ${slots[sIdx]}: ${val}% Room Utilization`}
                >
                  {val}%
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant border-t border-light-outline-variant dark:border-dark-outline-variant pt-2 flex justify-between items-center">
        <span>Peak Usage Window</span>
        <span className="font-semibold text-light-on-surface dark:text-dark-on-surface">Wednesday 09:00 AM (98%)</span>
      </div>
    </div>
  )
}

// 6. Course Completion & Retention Funnel
export function CourseCompletionFunnel() {
  const stages = [
    { name: 'Initial Enrolled', count: 2840, percentage: 100, color: 'bg-light-primary' },
    { name: 'Module 1 Verified', count: 2680, percentage: 94.3, color: 'bg-light-primary-container' },
    { name: 'Midterm Completed', count: 2410, percentage: 84.8, color: 'bg-light-secondary' },
    { name: 'Capstone Submitted', count: 2250, percentage: 79.2, color: 'bg-success' },
    { name: 'Certified Graduate', count: 2180, percentage: 76.7, color: 'bg-success' },
  ]

  return (
    <div className="flex flex-col h-full justify-between gap-3">
      <div className="flex items-center justify-between text-label-sm">
        <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
          Academic Retention & Graduation Funnel
        </span>
        <span className="font-mono text-label-sm font-semibold text-on-success-container bg-success-container px-2 py-0.5 rounded-full">
          76.7% Completion Rate
        </span>
      </div>

      <div className="space-y-2 py-1">
        {stages.map((stage, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-label-sm">
              <span className="font-medium text-light-on-surface dark:text-dark-on-surface truncate">
                {stage.name}
              </span>
              <div className="flex items-center gap-2 font-mono text-mono-sm tabular-nums">
                <span className="text-light-on-surface dark:text-dark-on-surface font-semibold">{stage.count.toLocaleString()}</span>
                <span className="text-light-on-surface-variant dark:text-dark-on-surface-variant text-[11px]">({stage.percentage}%)</span>
              </div>
            </div>
            <div className="h-2 w-full rounded-full bg-light-surface-container-low dark:bg-dark-surface-container overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-surface-enter ${stage.color}`}
                style={{ width: `${stage.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant border-t border-light-outline-variant dark:border-dark-outline-variant pt-2 flex justify-between">
        <span>Attrition Rate</span>
        <span className="font-semibold text-success">5.7% (Industry leading &lt;10%)</span>
      </div>
    </div>
  )
}

// 7. Tutor Competency & Student Satisfaction Gauge Bars
export function TutorRatingBreakdown() {
  const metrics = [
    { label: 'Subject Matter Mastery', score: 4.9, benchmark: '4.8' },
    { label: 'Practical Lab Guidance', score: 4.8, benchmark: '4.7' },
    { label: 'Punctuality & Timetable', score: 4.8, benchmark: '4.6' },
    { label: 'Grading Turnaround Speed', score: 4.6, benchmark: '4.5' },
    { label: 'Student Mentorship', score: 4.9, benchmark: '4.7' },
  ]

  return (
    <div className="flex flex-col h-full justify-between gap-3">
      <div className="flex items-center justify-between text-label-sm">
        <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
          Faculty Performance & Student Feedback
        </span>
        <span className="font-mono text-label-sm font-semibold text-light-primary">
          ★ 4.82 / 5.0 Avg
        </span>
      </div>

      <div className="space-y-2.5 py-1">
        {metrics.map((m, i) => {
          const pct = (m.score / 5.0) * 100
          return (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex items-center justify-between text-label-sm">
                <span className="text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
                  {m.label}
                </span>
                <span className="font-mono text-mono-sm font-semibold tabular-nums text-light-on-surface dark:text-dark-on-surface">
                  {m.score} / 5.0
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-light-surface-container-low dark:bg-dark-surface-container overflow-hidden relative">
                <div
                  className="h-full rounded-full bg-light-primary transition-all duration-surface-enter"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant border-t border-light-outline-variant dark:border-dark-outline-variant pt-2 flex justify-between">
        <span>Student Responses</span>
        <span className="font-semibold text-light-on-surface dark:text-dark-on-surface">2,340 Verified Evaluations</span>
      </div>
    </div>
  )
}

// 8. Examination Grade Distribution (Bell Curve / Histogram)
export function GradeHistogramChart() {
  const grades = [
    { grade: 'A+', pct: 24, count: '682', color: 'bg-success' },
    { grade: 'A', pct: 38, count: '1,079', color: 'bg-light-primary' },
    { grade: 'B+', pct: 22, count: '625', color: 'bg-light-primary-container' },
    { grade: 'B', pct: 11, count: '312', color: 'bg-pending' },
    { grade: 'C/D', pct: 5, count: '142', color: 'bg-overdue' },
  ]

  return (
    <div className="flex flex-col h-full justify-between gap-3">
      <div className="flex items-center justify-between text-label-sm">
        <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
          Term Exam Grade Spread
        </span>
        <span className="font-mono text-label-sm font-semibold text-light-primary">
          Normal Bell Curve
        </span>
      </div>

      <div className="grid grid-cols-5 gap-3 items-end h-32 pt-2 border-b border-light-outline-variant dark:border-dark-outline-variant pb-2">
        {grades.map((g, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 h-full justify-end group cursor-pointer">
            <span className="font-mono text-[11px] tabular-nums text-light-on-surface-variant dark:text-dark-on-surface-variant">
              {g.pct}%
            </span>
            <div className="w-full max-w-[42px] flex items-end h-24">
              <div
                className={`w-full rounded-t transition-all duration-surface-enter group-hover:brightness-110 ${g.color}`}
                style={{ height: `${(g.pct / 40) * 100}%` }}
                title={`${g.grade}: ${g.pct}% (${g.count} students)`}
              />
            </div>
            <span className="font-label text-label-sm font-bold text-light-on-surface dark:text-dark-on-surface">
              {g.grade}
            </span>
          </div>
        ))}
      </div>

      <div className="text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant border-t border-light-outline-variant dark:border-dark-outline-variant pt-2 flex justify-between">
        <span>Pass Percentage</span>
        <span className="font-semibold text-on-success-container">95.0% Passing</span>
      </div>
    </div>
  )
}

// 9. Hourly LMS Platform Engagement Curve (Daily Active Learners)
export function PlatformEngagementLineChart() {
  const hours = [
    { time: '08:00', users: 340 },
    { time: '10:00', users: 890 },
    { time: '12:00', users: 740 },
    { time: '14:00', users: 1240 },
    { time: '16:00', users: 980 },
    { time: '18:00', users: 1120 },
    { time: '20:00', users: 610 },
  ]

  const width = 360
  const height = 120
  const max = 1400
  const pts = hours.map((h, i) => {
    const x = 20 + i * ((width - 40) / (hours.length - 1))
    const y = height - 15 - (h.users / max) * (height - 30)
    return { x, y, ...h }
  })

  const pathD = pts.reduce((acc, pt, i) => (i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`), '')

  return (
    <div className="flex flex-col h-full justify-between gap-2">
      <div className="flex items-center justify-between text-label-sm">
        <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
          Concurrent LMS Activity (Today)
        </span>
        <span className="font-mono text-label-sm text-on-success-container bg-success-container px-2 py-0.5 rounded-full font-semibold">
          1,240 Peak Users
        </span>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28 overflow-visible">
          <line x1="20" y1="30" x2={width - 20} y2="30" stroke="currentColor" className="text-light-outline-variant dark:text-dark-outline-variant" strokeDasharray="3 3" />
          <line x1="20" y1="70" x2={width - 20} y2="70" stroke="currentColor" className="text-light-outline-variant dark:text-dark-outline-variant" strokeDasharray="3 3" />
          <path d={pathD} fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {pts.map((pt, i) => (
            <g key={i} className="cursor-pointer group">
              <circle cx={pt.x} cy={pt.y} r="3.5" fill="#FFFFFF" stroke="#059669" strokeWidth="2" className="transition-all group-hover:r-5" />
              <text x={pt.x} y={height - 2} textAnchor="middle" className="text-[10px] font-mono fill-current text-light-on-surface-variant dark:text-dark-on-surface-variant">
                {pt.time}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="flex justify-between items-center text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant border-t border-light-outline-variant dark:border-dark-outline-variant pt-2">
        <span>Average Session Time</span>
        <span className="font-mono font-semibold text-light-on-surface dark:text-dark-on-surface">42 Minutes</span>
      </div>
    </div>
  )
}

// 10. Departmental Budget vs Expense Breakdown
export function BudgetProgressChart() {
  const budgetItems = [
    { category: 'Faculty & Tutors', allocated: '$120K', spent: '$110K', pct: 91.6, color: 'bg-light-primary' },
    { category: 'Cloud Labs & Servers', allocated: '$45K', spent: '$35K', pct: 77.7, color: 'bg-light-secondary' },
    { category: 'Courseware & Software', allocated: '$30K', spent: '$26K', pct: 86.6, color: 'bg-light-primary-container' },
    { category: 'Library & Learning Media', allocated: '$20K', spent: '$13K', pct: 65.0, color: 'bg-success' },
  ]

  return (
    <div className="flex flex-col h-full justify-between gap-3">
      <div className="flex items-center justify-between text-label-sm">
        <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
          Academic Operating Budget Allocation
        </span>
        <span className="font-mono text-label-sm font-semibold text-light-primary">$215K Allocated</span>
      </div>

      <div className="space-y-2.5 py-1">
        {budgetItems.map((item, i) => (
          <div key={i} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-label-sm">
              <span className="font-medium text-light-on-surface dark:text-dark-on-surface">
                {item.category}
              </span>
              <span className="font-mono text-mono-sm tabular-nums text-light-on-surface-variant dark:text-dark-on-surface-variant">
                {item.spent} / {item.allocated} ({item.pct}%)
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-light-surface-container-low dark:bg-dark-surface-container overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-surface-enter ${item.color}`}
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant border-t border-light-outline-variant dark:border-dark-outline-variant pt-2 flex justify-between">
        <span>Fiscal Year 2026-27</span>
        <span className="font-semibold text-on-success-container">Within 4% Margin</span>
      </div>
    </div>
  )
}
