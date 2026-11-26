import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

// Fallback initial reports data
const DEFAULT_REPORTS = [
  {
    id: 1,
    student_id: 'STU-2026-0842',
    full_name: 'Marcus Vance',
    email: 'marcus.vance@student.bixcel.edu',
    phone: '+1 (555) 349-2194',
    guardian_name: 'Eleanor Vance (Mother)',
    track: 'Digital Marketing',
    batch: 'BIX-MKT-26B',
    admission_date: '2026-10-15',
    term: 'Fall Term 2026',
    gpa: 3.82,
    letter_grade: 'A',
    standing: 'Honors Distinction',
    overall_completion_pct: 83,
    instructional_days_done: 25,
    instructional_days_total: 30,
    attendance_pct: 96.0,
    attendance_days_present: 24,
    attendance_days_total: 25,
    assignments_submitted: 5,
    assignments_total: 5,
    assignments_avg: 91.4,
    quizzes_avg: 89.0,
    milestones_cleared: 2,
    milestones_total: 2,
    modules_progress: [
      {
        code: 'MOD-DM-01',
        title: 'SEO & Keyword Strategy',
        days: 8,
        days_done: 8,
        status: 'Completed',
        pct: 100,
        score: 94,
        grade: 'A+',
        practical_tasks: '6/6 Passed',
      },
      {
        code: 'MOD-DM-02',
        title: 'Meta & Google Ads Conversion Funnels',
        days: 12,
        days_done: 12,
        status: 'Completed',
        pct: 100,
        score: 90,
        grade: 'A',
        practical_tasks: '8/8 Passed',
      },
      {
        code: 'MOD-DM-03',
        title: 'Content & Social Media Strategy',
        days: 10,
        days_done: 5,
        status: 'In Progress',
        pct: 50,
        score: 88,
        grade: 'A-',
        practical_tasks: '3/6 In Progress',
      },
    ],
    assessments: [
      {
        name: 'Comprehensive SEO Technical Audit Case',
        type: 'Assignment',
        date: '2026-10-28',
        max_marks: 100,
        marks_obtained: 95,
        grade: 'A+',
        feedback: 'Exceptional schema markup analysis and Semrush audit recommendations.',
      },
      {
        name: 'Keyword Intent & Clustering Assessment',
        type: 'Quiz',
        date: '2026-11-04',
        max_marks: 50,
        marks_obtained: 46,
        grade: 'A',
        feedback: 'Solid understanding of commercial vs informational search patterns.',
      },
      {
        name: 'Google Search Ads Live Campaign Setup',
        type: 'Practical Lab',
        date: '2026-11-12',
        max_marks: 100,
        marks_obtained: 92,
        grade: 'A',
        feedback: 'Configured target CPA bidding with tight negative keyword lists.',
      },
      {
        name: 'Meta Retargeting Custom Audiences Project',
        type: 'Project',
        date: '2026-11-19',
        max_marks: 100,
        marks_obtained: 88,
        grade: 'A-',
        feedback: 'Great pixel event mapping; consider refining lookalike ratios.',
      },
      {
        name: 'Mid-Term Digital Attribution Examination',
        type: 'Examination',
        date: '2026-11-23',
        max_marks: 100,
        marks_obtained: 91,
        grade: 'A',
        feedback: 'Thorough analysis of first-click vs linear attribution models.',
      },
    ],
    milestones: [
      {
        title: 'Milestone 1: Organic Growth & Search Dominance',
        status: 'Verified Cleared',
        date: '2026-11-02',
        mentor: 'Eleanor Vance',
        notes: 'Achieved top 3 SERP simulation ranking and resolved 15 technical crawler errors.',
      },
      {
        title: 'Milestone 2: Paid Acquisition & ROAS Profitability',
        status: 'Verified Cleared',
        date: '2026-11-20',
        mentor: 'Sarah Jenkins',
        notes: 'Demonstrated 3.8x ROAS model in mock conversion pipeline with zero budget leakage.',
      },
    ],
    attendance_monthly: [
      { month: 'October 2026', total: 11, present: 11, late: 0, absent: 0, pct: 100.0 },
      { month: 'November 2026', total: 14, present: 13, late: 1, absent: 0, pct: 92.8 },
    ],
    advisor_remarks: [
      {
        advisor: 'Dr. Aris Thorne (Academic Dean)',
        date: '2026-11-24',
        note: 'Marcus demonstrates exemplary aptitude for data-driven performance marketing. Consistently delivers rigorous analytics in group case studies.',
        recommendation: 'Recommended for Advanced Programmatic Bidding certification.',
      },
    ],
  },
  {
    id: 2,
    student_id: 'STU-2026-0841',
    full_name: 'Alena Rostova',
    email: 'alena.rostova@student.bixcel.edu',
    phone: '+1 (555) 781-4402',
    guardian_name: 'Mikhail Rostov (Father)',
    track: 'UI/UX Product Design',
    batch: 'BIX-UX-26D',
    admission_date: '2026-09-20',
    term: 'Fall Term 2026',
    gpa: 3.94,
    letter_grade: 'A+',
    standing: 'Top 1% Cohort Ranking',
    overall_completion_pct: 75,
    instructional_days_done: 45,
    instructional_days_total: 60,
    attendance_pct: 97.8,
    attendance_days_present: 44,
    attendance_days_total: 45,
    assignments_submitted: 8,
    assignments_total: 8,
    assignments_avg: 96.2,
    quizzes_avg: 94.0,
    milestones_cleared: 3,
    milestones_total: 4,
    modules_progress: [
      {
        code: 'MOD-UX-01',
        title: 'User Research, Personas & Journey Mapping',
        days: 12,
        days_done: 12,
        status: 'Completed',
        pct: 100,
        score: 98,
        grade: 'A+',
        practical_tasks: '8/8 Passed',
      },
      {
        code: 'MOD-UX-02',
        title: 'Wireframing & Prototyping in Figma',
        days: 15,
        days_done: 15,
        status: 'Completed',
        pct: 100,
        score: 97,
        grade: 'A+',
        practical_tasks: '10/10 Passed',
      },
      {
        code: 'MOD-UX-03',
        title: 'Design Systems & Component Tokens',
        days: 18,
        days_done: 18,
        status: 'Completed',
        pct: 100,
        score: 95,
        grade: 'A+',
        practical_tasks: '12/12 Passed',
      },
      {
        code: 'MOD-UX-04',
        title: 'Usability Testing & Micro-interactions',
        days: 15,
        days_done: 0,
        status: 'Upcoming',
        pct: 0,
        score: 0,
        grade: 'Pending',
        practical_tasks: '0/8 Pending',
      },
    ],
    assessments: [
      {
        name: 'Generative User Research Synthesis & Persona Deck',
        type: 'Project',
        date: '2026-10-05',
        max_marks: 100,
        marks_obtained: 99,
        grade: 'A+',
        feedback: 'Masterful empathy mapping and qualitative interview coding.',
      },
      {
        name: 'Figma Interactive Mobile Banking Prototype',
        type: 'Practical Lab',
        date: '2026-10-22',
        max_marks: 100,
        marks_obtained: 97,
        grade: 'A+',
        feedback: 'Flawless auto-layout components and micro-interaction states.',
      },
      {
        name: 'Atomic Design System & WCAG AAA Audit',
        type: 'Project',
        date: '2026-11-15',
        max_marks: 100,
        marks_obtained: 96,
        grade: 'A+',
        feedback: 'Enterprise token architecture ready for production front-end handoff.',
      },
      {
        name: 'Mid-Term Design Theory & Heuristic Assessment',
        type: 'Examination',
        date: '2026-11-18',
        max_marks: 100,
        marks_obtained: 94,
        grade: 'A',
        feedback: 'Comprehensive critique of Nielsen Norman heuristics.',
      },
    ],
    milestones: [
      {
        title: 'Milestone 1: Empathy & Research Discovery',
        status: 'Verified Cleared',
        date: '2026-10-08',
        mentor: 'Elena Rostova',
        notes: 'Conducted 12 user interviews and established validated problem statements.',
      },
      {
        title: 'Milestone 2: Wireframe Architecture & Usability Baseline',
        status: 'Verified Cleared',
        date: '2026-10-25',
        mentor: 'Elena Rostova',
        notes: 'Built high-fidelity 48-screen interactive user flow with zero dead ends.',
      },
      {
        title: 'Milestone 3: Scalable Design System Token Library',
        status: 'Verified Cleared',
        date: '2026-11-16',
        mentor: 'David Chen',
        notes: 'Published 140+ component tokens with full dark/light theme aliases.',
      },
    ],
    attendance_monthly: [
      { month: 'September 2026', total: 9, present: 9, late: 0, absent: 0, pct: 100.0 },
      { month: 'October 2026', total: 22, present: 22, late: 0, absent: 0, pct: 100.0 },
      { month: 'November 2026', total: 14, present: 13, late: 1, absent: 0, pct: 92.8 },
    ],
    advisor_remarks: [
      {
        advisor: 'Elena Rostova (Lead Design Director)',
        date: '2026-11-20',
        note: 'Alena is performing at an exceptional senior product designer caliber. Outstanding attention to typographic scales and user ergonomics.',
        recommendation: 'Recommended for institutional design team leadership and industry portfolio spotlight.',
      },
    ],
  },
  {
    id: 3,
    student_id: 'STU-2026-0840',
    full_name: 'Kevin Chen',
    email: 'kevin.chen@student.bixcel.edu',
    phone: '+1 (555) 912-3341',
    guardian_name: 'David Chen (Father)',
    track: 'Full-Stack Web Development',
    batch: 'BIX-DEV-24A',
    admission_date: '2026-10-01',
    term: 'Fall Term 2026',
    gpa: 3.78,
    letter_grade: 'A',
    standing: 'Distinction',
    overall_completion_pct: 71,
    instructional_days_done: 27,
    instructional_days_total: 38,
    attendance_pct: 94.4,
    attendance_days_present: 25,
    attendance_days_total: 27,
    assignments_submitted: 6,
    assignments_total: 7,
    assignments_avg: 89.8,
    quizzes_avg: 91.0,
    milestones_cleared: 2,
    milestones_total: 3,
    modules_progress: [
      {
        code: 'MOD-FS-01',
        title: 'Frontend Foundations & Semantic HTML/CSS',
        days: 10,
        days_done: 10,
        status: 'Completed',
        pct: 100,
        score: 94,
        grade: 'A',
        practical_tasks: '8/8 Passed',
      },
      {
        code: 'MOD-FS-02',
        title: 'Modern JavaScript ES6+ & TypeScript',
        days: 14,
        days_done: 14,
        status: 'Completed',
        pct: 100,
        score: 91,
        grade: 'A',
        practical_tasks: '12/12 Passed',
      },
      {
        code: 'MOD-FS-03',
        title: 'React & Next.js Architecture',
        days: 14,
        days_done: 3,
        status: 'In Progress',
        pct: 21,
        score: 85,
        grade: 'B+',
        practical_tasks: '2/10 In Progress',
      },
    ],
    assessments: [
      {
        name: 'Responsive Enterprise Landing Page Build',
        type: 'Assignment',
        date: '2026-10-14',
        max_marks: 100,
        marks_obtained: 96,
        grade: 'A+',
        feedback: 'Pixel-perfect mobile breakpoint handling and semantic tags.',
      },
      {
        name: 'TypeScript Strict Interfaces & Generic Utilities',
        type: 'Practical Lab',
        date: '2026-10-28',
        max_marks: 100,
        marks_obtained: 91,
        grade: 'A',
        feedback: 'Good generic type constraints; minor inference warning in state handler.',
      },
      {
        name: 'Asynchronous Event Loop & Promise Concurrency Quiz',
        type: 'Quiz',
        date: '2026-11-08',
        max_marks: 50,
        marks_obtained: 46,
        grade: 'A',
        feedback: 'Demonstrated clear mental model of microtasks vs macrotasks.',
      },
      {
        name: 'RESTful Express Backend with JWT Auth',
        type: 'Project',
        date: '2026-11-20',
        max_marks: 100,
        marks_obtained: 87,
        grade: 'B+',
        feedback: 'Solid token refresh strategy; optimize bcrypt round workload.',
      },
    ],
    milestones: [
      {
        title: 'Milestone 1: Web Fundamentals & Semantic Standards',
        status: 'Verified Cleared',
        date: '2026-10-18',
        mentor: 'David Chen',
        notes: 'Passed automated Lighthouse accessibility and performance audits (>95 score).',
      },
      {
        title: 'Milestone 2: Strong Typing & Data Structures Verification',
        status: 'Verified Cleared',
        date: '2026-11-10',
        mentor: 'Dr. Aris Thorne',
        notes: 'Implemented custom Redux-like state store in strict TypeScript with zero any casts.',
      },
    ],
    attendance_monthly: [
      { month: 'October 2026', total: 16, present: 15, late: 1, absent: 0, pct: 93.7 },
      { month: 'November 2026', total: 11, present: 10, late: 0, absent: 1, pct: 90.9 },
    ],
    advisor_remarks: [
      {
        advisor: 'Dr. Aris Thorne (Lead Engineering Tutor)',
        date: '2026-11-21',
        note: 'Kevin is making steady, dependable progress in full-stack engineering. Strong algorithmic comprehension.',
        recommendation: 'Focus on Next.js 15 App Router caching mechanisms in current module.',
      },
    ],
  },
]

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'ST'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'ST'
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

export function StudentProgressReport() {
  const [reports, setReports] = useState(DEFAULT_REPORTS)
  const [selectedReport, setSelectedReport] = useState(DEFAULT_REPORTS[0])
  const [activeTab, setActiveTab] = useState('modules') // 'modules' | 'assessments' | 'milestones' | 'attendance' | 'remarks'
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [showRemarkModal, setShowRemarkModal] = useState(false)
  const [toast, setToast] = useState('')

  // Remark form state
  const [remarkForm, setRemarkForm] = useState({
    advisor: 'Dr. Aris Thorne (Academic Dean)',
    note: '',
    recommendation: 'Continue consistent progress across instructional labs.',
  })

  // Load progress from backend
  useEffect(() => {
    let isMounted = true
    const fetchReports = async () => {
      try {
        const res = await apiService.getProgressList()
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0 && isMounted) {
          setReports(res.data)
          setSelectedReport(res.data[0])
        }
      } catch (err) {
        console.warn('Using local student progress records:', err)
      }
    }
    fetchReports()
    return () => { isMounted = false }
  }, [])

  // Switch student
  const handleSelectStudent = (studentId) => {
    const found = reports.find((r) => r.student_id === studentId || r.id === Number(studentId))
    if (found) setSelectedReport(found)
  }

  // Handle Save Remark
  const handleSaveRemark = async (e) => {
    e.preventDefault()
    if (!remarkForm.note.trim()) return

    const newRemark = {
      advisor: remarkForm.advisor,
      date: new Date().toISOString().slice(0, 10),
      note: remarkForm.note.trim(),
      recommendation: remarkForm.recommendation.trim(),
    }

    try {
      await apiService.saveAdvisorRemark({
        student_id: selectedReport.student_id,
        ...newRemark,
      })
    } catch (err) {
      console.warn('API save remark failed:', err)
    }

    // Update local state
    const updated = {
      ...selectedReport,
      advisor_remarks: [newRemark, ...(selectedReport.advisor_remarks || [])],
    }
    setSelectedReport(updated)
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))

    setToast(`Academic remark added for ${selectedReport.full_name}`)
    setShowRemarkModal(false)
    setRemarkForm({
      advisor: 'Dr. Aris Thorne (Academic Dean)',
      note: '',
      recommendation: 'Continue consistent progress across instructional labs.',
    })
    setTimeout(() => setToast(''), 3000)
  }

  const s = selectedReport

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Toast Alert */}
      {toast && (
        <div className="p-2.5 rounded bg-success-container text-on-success-container font-label text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
            <span>{toast}</span>
          </div>
          <button type="button" onClick={() => setToast('')} className="p-0.5 opacity-70 hover:opacity-100">
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      {/* Screen Header & Student Selector Strip */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-3.5 rounded-md shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="material-symbols-outlined text-light-primary text-[20px]">monitoring</span>
            <h1 className="font-title text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface">
              Student Academic Progress Report
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint font-mono text-[10px] font-bold">
              {s.term}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-container text-on-success-container text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span>Academic Standing: {s.standing}</span>
            </span>
          </div>
          <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Comprehensive curriculum mastery, assessment grading transcripts, and competency milestone evaluations.
          </p>
        </div>

        {/* Student Selector & Report Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-light-surface-container-low dark:bg-dark-surface-container px-2 py-1 rounded border border-light-outline-variant dark:border-dark-outline-variant">
            <span className="material-symbols-outlined text-[16px] text-light-outline">person</span>
            <select
              value={s.student_id}
              onChange={(e) => handleSelectStudent(e.target.value)}
              className="bg-transparent text-xs font-semibold text-light-on-surface dark:text-dark-on-surface focus:outline-none cursor-pointer"
            >
              {reports.map((r) => (
                <option key={r.id} value={r.student_id}>
                  {r.full_name} ({r.batch})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setToast(`Progress report shared with guardian (${s.guardian_name}) via portal notification!`)
              setTimeout(() => setToast(''), 3500)
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant text-xs font-semibold text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">send</span>
            <span>Notify Guardian</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRemarkModal(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant text-xs font-semibold text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">rate_review</span>
            <span>Add Remark</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-light-primary text-light-on-primary font-semibold text-xs hover:bg-light-primary-container shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">print</span>
            <span>Official Report Card</span>
          </button>
        </div>
      </section>

      {/* Student Profile Card & Summary Banner */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-light-primary text-light-on-primary font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
            {getInitials(s.full_name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                {s.full_name}
              </h2>
              <span className="font-mono text-xs font-bold text-light-primary">
                {s.student_id}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-light-on-surface-variant mt-0.5">
              <span><strong>Track:</strong> {s.track}</span>
              <span>•</span>
              <span><strong>Batch:</strong> <span className="font-mono">{s.batch}</span></span>
              <span>•</span>
              <span><strong>Enrolled:</strong> {s.admission_date}</span>
              <span>•</span>
              <span><strong>Guardian:</strong> {s.guardian_name}</span>
            </div>
          </div>
        </div>

        {/* GPA Badge Box */}
        <div className="flex items-center gap-3 bg-light-surface-container-low dark:bg-dark-surface-container p-2.5 rounded border border-light-outline-variant/60 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-light-on-surface-variant font-bold uppercase tracking-wider block">
              Cumulative GPA
            </span>
            <div className="flex items-baseline justify-end gap-1">
              <span className="font-headline text-[20px] font-extrabold text-light-primary tabular-nums">
                {s.gpa.toFixed(2)}
              </span>
              <span className="text-xs text-light-on-surface-variant">/ 4.0</span>
            </div>
          </div>
          <div className="w-9 h-9 rounded bg-success-container text-on-success-container font-headline text-base font-bold flex items-center justify-center">
            {s.letter_grade}
          </div>
        </div>
      </section>

      {/* 5 Compact KPI Metrics Banner */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Curriculum Done</span>
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-[18px] font-bold text-light-primary tabular-nums">
                {s.overall_completion_pct}%
              </span>
              <span className="text-[10px] text-light-on-surface-variant">{s.instructional_days_done}/{s.instructional_days_total}d</span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-light-primary-tint text-light-primary inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">timelapse</span>
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Attendance Rate</span>
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-[18px] font-bold text-success tabular-nums">
                {s.attendance_pct}%
              </span>
              <span className="text-[10px] text-on-success-container bg-success-container px-1 py-0.2 rounded font-semibold">
                Compliant
              </span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-success-container text-on-success-container inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Assignments Avg</span>
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-[18px] font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                {s.assignments_avg}%
              </span>
              <span className="text-[10px] text-light-on-surface-variant">{s.assignments_submitted}/{s.assignments_total}</span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-light-secondary-container text-light-on-secondary-container inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">assignment</span>
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Quizzes &amp; Tests</span>
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-[18px] font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                {s.quizzes_avg}%
              </span>
              <span className="text-[10px] text-on-success-container bg-success-container px-1 py-0.2 rounded font-semibold">
                Passed
              </span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-pending-container text-on-pending-container inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">quiz</span>
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Milestones Cleared</span>
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-[18px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {s.milestones_cleared} / {s.milestones_total}
              </span>
              <span className="text-[10px] text-light-on-surface-variant">Verified</span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">flag</span>
          </span>
        </article>
      </section>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-light-outline-variant dark:border-dark-outline-variant pb-2 overflow-x-auto">
        {[
          { id: 'modules', label: 'Curriculum Modules', icon: 'view_quilt' },
          { id: 'assessments', label: 'Assessments & Transcripts', icon: 'assignment_turned_in' },
          { id: 'milestones', label: 'Competency Milestones', icon: 'verified' },
          { id: 'attendance', label: 'Attendance Records', icon: 'schedule' },
          { id: 'remarks', label: 'Advisor & Faculty Notes', icon: 'chat' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded font-label text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-light-primary text-light-on-primary shadow-xs'
                : 'text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[15px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ===================================================================== */}
      {/* TAB 1: CURRICULUM MODULES PROGRESS                                    */}
      {/* ===================================================================== */}
      {activeTab === 'modules' && (
        <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-xs overflow-hidden flex flex-col">
          <div className="p-3 border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/40 dark:bg-dark-surface-container/40 flex items-center justify-between">
            <span className="font-label text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
              Standardized Curriculum Progression — {s.track}
            </span>
            <span className="text-[11px] text-light-on-surface-variant">
              Instructional Days Completed: <strong>{s.instructional_days_done}</strong> of <strong>{s.instructional_days_total}</strong> Days
            </span>
          </div>

          <div className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
            {(s.modules_progress || []).map((mod, idx) => (
              <div key={idx} className="p-3 hover:bg-light-surface-container-low/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-light-surface-container border border-light-outline-variant/60 shrink-0">
                    {mod.code}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                        {mod.title}
                      </h4>
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                          mod.status === 'Completed'
                            ? 'bg-success-container text-on-success-container'
                            : mod.status === 'In Progress'
                            ? 'bg-pending-container text-on-pending-container'
                            : 'bg-light-surface-container text-light-on-surface-variant'
                        }`}
                      >
                        {mod.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex items-center gap-2 mt-1.5 max-w-md">
                      <div className="flex-1 h-1.5 rounded-full bg-light-surface-container-low dark:bg-dark-surface-container overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            mod.status === 'Completed' ? 'bg-success' : 'bg-light-primary'
                          }`}
                          style={{ width: `${mod.pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                        {mod.pct}% ({mod.days_done}/{mod.days}d)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div>
                    <span className="text-[10px] text-light-on-surface-variant block">Lab Tasks:</span>
                    <strong className="text-light-on-surface dark:text-dark-on-surface">{mod.practical_tasks}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-light-on-surface-variant block">Score:</span>
                    <strong className="text-light-primary font-mono">{mod.score > 0 ? `${mod.score}%` : '—'}</strong>
                  </div>
                  <div className="w-7 h-7 rounded bg-light-surface-container text-light-on-surface font-bold text-xs flex items-center justify-center border border-light-outline-variant/60">
                    {mod.grade}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: ASSESSMENTS & GRADING TRANSCRIPTS                              */}
      {/* ===================================================================== */}
      {activeTab === 'assessments' && (
        <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant font-label text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Assessment Title</th>
                  <th className="py-2.5 px-3">Evaluation Type</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-center">Score / Marks</th>
                  <th className="py-2.5 px-3 text-center">Grade</th>
                  <th className="py-2.5 px-3">Faculty Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant font-body">
                {(s.assessments || []).map((asm, idx) => (
                  <tr key={idx} className="hover:bg-light-surface-container-low/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-light-on-surface dark:text-dark-on-surface max-w-xs">
                      {asm.name}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant border border-light-outline-variant/60">
                        {asm.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-light-on-surface-variant">
                      {asm.date}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-center font-mono font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                      {asm.marks_obtained} / {asm.max_marks} ({Math.round((asm.marks_obtained / asm.max_marks) * 100)}%)
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap text-center">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-success-container text-on-success-container">
                        {asm.grade}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-light-on-surface-variant leading-relaxed max-w-sm">
                      {asm.feedback}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 3: COMPETENCY MILESTONES DEFENSE                                  */}
      {/* ===================================================================== */}
      {activeTab === 'milestones' && (
        <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-xs p-3 flex flex-col gap-3">
          <span className="font-label text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
            Competency Milestone Verifications ({s.milestones_cleared} of {s.milestones_total} Verified)
          </span>

          <div className="space-y-2.5">
            {(s.milestones || []).map((m, idx) => (
              <div
                key={idx}
                className="p-3 rounded border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col gap-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[12px]">
                      ✓
                    </span>
                    <h4 className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                      {m.title}
                    </h4>
                  </div>
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                    {m.status}
                  </span>
                </div>
                <p className="text-[11px] text-light-on-surface-variant pl-7 leading-relaxed">
                  {m.notes}
                </p>
                <div className="pl-7 flex items-center gap-3 text-[10px] text-light-on-surface-variant">
                  <span><strong>Evaluated:</strong> {m.date}</span>
                  <span>•</span>
                  <span><strong>Reviewing Faculty:</strong> {m.mentor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 4: ATTENDANCE RECORDS                                             */}
      {/* ===================================================================== */}
      {activeTab === 'attendance' && (
        <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-xs p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2">
            <div>
              <span className="font-label text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                Term Attendance Log ({s.attendance_pct}% Compliance)
              </span>
              <p className="text-[11px] text-light-on-surface-variant">
                Total Sessions Attended: <strong>{s.attendance_days_present}</strong> of <strong>{s.attendance_days_total}</strong> Scheduled Sessions
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-success-container text-on-success-container font-mono text-xs font-bold">
              {s.attendance_pct}% Rate
            </span>
          </div>

          <div className="space-y-2">
            {(s.attendance_monthly || []).map((m, idx) => (
              <div key={idx} className="p-2.5 rounded border border-light-outline-variant/60 flex items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-light-on-surface dark:text-dark-on-surface">{m.month}</h4>
                  <span className="text-[11px] text-light-on-surface-variant">
                    {m.present} Present • {m.late} Late • {m.absent} Absent ({m.total} Sessions)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 rounded-full bg-light-surface-container overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{ width: `${m.pct}%` }} />
                  </div>
                  <span className="font-mono font-bold text-xs tabular-nums text-light-on-surface dark:text-dark-on-surface">
                    {m.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 5: ADVISOR & FACULTY NOTES                                        */}
      {/* ===================================================================== */}
      {activeTab === 'remarks' && (
        <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-xs p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2">
            <span className="font-label text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
              Faculty &amp; Academic Dean Mentorship Notes
            </span>
            <button
              type="button"
              onClick={() => setShowRemarkModal(true)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-light-primary text-light-on-primary font-semibold text-xs hover:bg-light-primary-container"
            >
              <span className="material-symbols-outlined text-[14px]">add</span>
              <span>Add Remark</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {(s.advisor_remarks || []).map((rem, idx) => (
              <div key={idx} className="p-3 rounded border border-light-outline-variant/60 bg-light-surface-container-low/40 flex flex-col gap-1 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-light-primary">{rem.advisor}</strong>
                  <span className="font-mono text-[10px] text-light-on-surface-variant">{rem.date}</span>
                </div>
                <p className="text-[11px] text-light-on-surface dark:text-dark-on-surface leading-relaxed mt-0.5">
                  "{rem.note}"
                </p>
                {rem.recommendation && (
                  <div className="mt-1 p-1.5 rounded bg-light-surface-container border border-light-outline-variant/40 text-[10px]">
                    <strong>Recommendation:</strong> {rem.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: OFFICIAL PRINTABLE REPORT CARD                               */}
      {/* ===================================================================== */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-sidebar/70 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white text-slate-900 rounded-md shadow-2xl w-full max-w-2xl p-6 flex flex-col gap-4 max-h-[95vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Report Header with Institutional Branding */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
              <div>
                <span className="font-bold tracking-widest text-[11px] text-purple-900 uppercase block">
                  Bixcel Institute of Technologies
                </span>
                <h2 className="text-lg font-extrabold text-slate-900">
                  OFFICIAL ACADEMIC PROGRESS REPORT
                </h2>
                <span className="text-xs text-slate-600 block">
                  Accredited Enterprise Curriculum Evaluation • {s.term}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Generated:</span>
                <strong className="text-xs font-mono">2026-11-26</strong>
              </div>
            </div>

            {/* Student Info Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Student Name:</span>
                <strong className="text-slate-900 block truncate">{s.full_name}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Registration ID:</span>
                <strong className="text-slate-900 font-mono block">{s.student_id}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Course Track:</span>
                <strong className="text-slate-900 block truncate">{s.track}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Batch Cohort:</span>
                <strong className="text-slate-900 font-mono block">{s.batch}</strong>
              </div>
            </div>

            {/* GPA Summary Highlights */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2 rounded bg-purple-50 border border-purple-200">
                <span className="text-[10px] text-purple-700 block font-semibold">Cumulative GPA</span>
                <strong className="text-base text-purple-900 font-extrabold">{s.gpa.toFixed(2)} / 4.0</strong>
              </div>
              <div className="p-2 rounded bg-green-50 border border-green-200">
                <span className="text-[10px] text-green-700 block font-semibold">Letter Grade</span>
                <strong className="text-base text-green-900 font-extrabold">{s.letter_grade}</strong>
              </div>
              <div className="p-2 rounded bg-blue-50 border border-blue-200">
                <span className="text-[10px] text-blue-700 block font-semibold">Curriculum Done</span>
                <strong className="text-base text-blue-900 font-extrabold">{s.overall_completion_pct}%</strong>
              </div>
              <div className="p-2 rounded bg-amber-50 border border-amber-200">
                <span className="text-[10px] text-amber-700 block font-semibold">Attendance Rate</span>
                <strong className="text-base text-amber-900 font-extrabold">{s.attendance_pct}%</strong>
              </div>
            </div>

            {/* Assessment Transcript Table */}
            <div>
              <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block mb-1">
                Course Assessment Transcript
              </span>
              <table className="w-full text-left border-collapse text-xs border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[10px] uppercase">
                    <th className="p-2">Subject / Assessment</th>
                    <th className="p-2">Type</th>
                    <th className="p-2 text-center">Marks</th>
                    <th className="p-2 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-[11px]">
                  {(s.assessments || []).map((asm, i) => (
                    <tr key={i}>
                      <td className="p-2 font-medium">{asm.name}</td>
                      <td className="p-2 text-slate-600">{asm.type}</td>
                      <td className="p-2 text-center font-mono font-semibold">{asm.marks_obtained}/{asm.max_marks}</td>
                      <td className="p-2 text-center font-bold">{asm.grade}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Signatures & Seal */}
            <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 mt-2 text-xs">
              <div className="flex flex-col gap-1 border-t border-slate-400 pt-1">
                <span className="font-semibold text-slate-900">Dr. Aris Thorne</span>
                <span className="text-[10px] text-slate-500">Lead Academic Dean • Bixcel Institute</span>
              </div>
              <div className="flex flex-col gap-1 border-t border-slate-400 pt-1 text-right">
                <span className="font-semibold text-slate-900">Office of the Registrar</span>
                <span className="text-[10px] text-slate-500">Official Seal Verified Online</span>
              </div>
            </div>

            {/* Print Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded bg-purple-900 text-white font-semibold text-xs hover:bg-purple-800"
              >
                <span className="material-symbols-outlined text-[15px]">print</span>
                <span>Print Report</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPrintModal(false)}
                className="px-3 py-1.5 rounded border border-slate-300 text-xs hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: ADD ADVISOR REMARK                                           */}
      {/* ===================================================================== */}
      {showRemarkModal && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-md p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2">
              <h3 className="font-title text-sm font-bold text-light-on-surface dark:text-dark-on-surface">
                Record Faculty Advisor Remark for {s.full_name}
              </h3>
              <button type="button" onClick={() => setShowRemarkModal(false)} className="p-0.5 text-light-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveRemark} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                  Advisor / Evaluator Name
                </label>
                <input
                  type="text"
                  required
                  value={remarkForm.advisor}
                  onChange={(e) => setRemarkForm({ ...remarkForm, advisor: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                  Academic Evaluation Remark *
                </label>
                <textarea
                  rows={3}
                  required
                  value={remarkForm.note}
                  onChange={(e) => setRemarkForm({ ...remarkForm, note: e.target.value })}
                  placeholder="Observation regarding code quality, participation, and technical growth..."
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                  Actionable Recommendation
                </label>
                <input
                  type="text"
                  value={remarkForm.recommendation}
                  onChange={(e) => setRemarkForm({ ...remarkForm, recommendation: e.target.value })}
                  placeholder="e.g. Recommended for Advanced Certification / Next Milestone"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-light-outline-variant dark:border-dark-outline-variant pt-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowRemarkModal(false)}
                  className="px-3 py-1 rounded border border-light-outline-variant text-xs hover:bg-light-surface-container-low"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-light-primary text-light-on-primary font-semibold text-xs hover:bg-light-primary-container"
                >
                  Save Remark
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentProgressReport
