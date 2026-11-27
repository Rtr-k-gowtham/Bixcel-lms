import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

// Fallback Student Personas
const STUDENT_PERSONAS = [
  {
    id: 'gowtham',
    student_id: 'STU-2026-0843',
    name: 'Gowtham Tamilkathir',
    email: 'gowtham@bixcel.edu',
    track: 'Full-Stack Web Development',
    batch: 'BIX-DEV-24A',
    term: 'Semester 2 • Q4-2026',
    attendance: '96.4%',
    attended_sessions: 48,
    total_sessions: 50,
    gpa: '3.86',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    fee_status: 'Paid in Full',
    fee_receipt: 'RCP-2026-9041',
  },
  {
    id: 'kevin',
    student_id: 'STU-2026-0844',
    name: 'Kevin Chen',
    email: 'kevin.chen@bixcel.edu',
    track: 'Full-Stack Web Development',
    batch: 'BIX-DEV-24A',
    term: 'Semester 2 • Q4-2026',
    attendance: '95.2%',
    attended_sessions: 46,
    total_sessions: 50,
    gpa: '3.78',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    fee_status: 'Paid in Full',
    fee_receipt: 'RCP-2026-9042',
  },
  {
    id: 'marcus',
    student_id: 'STU-2026-0845',
    name: 'Marcus Vance',
    email: 'marcus.vance@bixcel.edu',
    track: 'Digital Marketing & Growth',
    batch: 'BIX-MKT-26B',
    term: 'Semester 1 • Q4-2026',
    attendance: '98.0%',
    attended_sessions: 49,
    total_sessions: 50,
    gpa: '3.92',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    fee_status: 'Paid in Full',
    fee_receipt: 'RCP-2026-9043',
  },
  {
    id: 'alena',
    student_id: 'STU-2026-0846',
    name: 'Alena Rostova',
    email: 'alena.rostova@bixcel.edu',
    track: 'UI/UX Product Design',
    batch: 'BIX-UX-26D',
    term: 'Semester 2 • Q4-2026',
    attendance: '97.5%',
    attended_sessions: 47,
    total_sessions: 50,
    gpa: '3.89',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    fee_status: 'Paid in Full',
    fee_receipt: 'RCP-2026-9044',
  },
]

// Default Fallback Calendar Events
const DEFAULT_CALENDAR_EVENTS = [
  {
    id: 101,
    title: 'React 19 Server Actions & Suspense',
    type: 'lecture',
    date: '2026-11-26',
    start_time: '09:30',
    end_time: '12:30',
    location: 'Lab Room 302 (Software Wing)',
    instructor: 'Dr. Marcus Vance',
    track: 'Full-Stack Web Development',
    batch: 'BIX-DEV-24A',
    description: 'Deep dive into optimistic hooks, server actions, and SSR cache invalidation.',
    link: 'https://meet.bixcel.edu/dev-24a',
  },
  {
    id: 102,
    title: 'CodeIgniter 4 REST API Practicum',
    type: 'lab',
    date: '2026-11-26',
    start_time: '14:00',
    end_time: '16:30',
    location: 'Computer Center Hall B',
    instructor: 'Elena Rostova',
    track: 'Full-Stack Web Development',
    batch: 'BIX-DEV-24A',
    description: 'Implementing JWT authentication filters, CORS headers, and MySQL transactions.',
    link: 'https://meet.bixcel.edu/lab-ci4',
  },
  {
    id: 103,
    title: 'Assignment 4: Microservices & API Schema',
    type: 'assignment',
    date: '2026-11-27',
    start_time: '23:59',
    end_time: '23:59',
    location: 'Bixcel LMS Submission Portal',
    instructor: 'Dr. Marcus Vance',
    track: 'Full-Stack Web Development',
    batch: 'BIX-DEV-24A',
    description: 'Submit your GitHub repo link with Dockerfile and Swagger docs.',
    points: 100,
  },
  {
    id: 104,
    title: 'State Management & Redux Toolkit Workshop',
    type: 'lecture',
    date: '2026-11-28',
    start_time: '10:00',
    end_time: '13:00',
    location: 'Seminar Room 1',
    instructor: 'Alan Wright',
    track: 'Full-Stack Web Development',
    batch: 'BIX-DEV-24A',
    description: 'RTK Query, cache normalized tags, and optimistic mutations.',
  },
  {
    id: 105,
    title: 'Competency Milestone #3 Review',
    type: 'milestone',
    date: '2026-11-29',
    start_time: '14:00',
    end_time: '16:00',
    location: 'Faculty Consultation Room 4',
    instructor: 'Dr. Marcus Vance',
    track: 'Full-Stack Web Development',
    batch: 'BIX-DEV-24A',
    description: '1-on-1 viva review for Backend Architecture and Database Schemas.',
  },
  {
    id: 106,
    title: 'Midterm Examination: Web Architecture',
    type: 'exam',
    date: '2026-11-30',
    start_time: '10:00',
    end_time: '13:00',
    location: 'Examination Hall A (Desk 14)',
    instructor: 'Chief Invigilator Board',
    track: 'Full-Stack Web Development',
    batch: 'BIX-DEV-24A',
    description: 'Theory and hands-on coding assessment. Hall ticket mandatory.',
  },
  {
    id: 107,
    title: 'Docker & Kubernetes Containerization',
    type: 'lecture',
    date: '2026-12-02',
    start_time: '09:30',
    end_time: '12:30',
    location: 'Cloud Computing Lab 4',
    instructor: 'Priya Sharma',
    track: 'Full-Stack Web Development',
    batch: 'BIX-DEV-24A',
    description: 'Multi-stage Docker builds and Helm chart deployments.',
  },
]

export function StudentDashboard({ currentUser, onNavigate }) {
  // Select initial student persona
  const [activeStudent, setActiveStudent] = useState(() => {
    if (currentUser?.email) {
      const match = STUDENT_PERSONAS.find((p) => p.email.toLowerCase() === currentUser.email.toLowerCase())
      if (match) return match
    }
    if (currentUser?.name) {
      const match = STUDENT_PERSONAS.find((p) => p.name.toLowerCase().includes(currentUser.name.toLowerCase().split(' ')[0]))
      if (match) return match
    }
    return {
      id: 'current',
      student_id: currentUser?.student_id || 'STU-2026-0843',
      name: currentUser?.name || 'Gowtham Tamilkathir',
      email: currentUser?.email || 'student@bixcel.edu',
      track: currentUser?.track || 'Full-Stack Web Development',
      batch: currentUser?.batch || 'BIX-DEV-24A',
      term: 'Semester 2 • Q4-2026',
      attendance: '96.4%',
      attended_sessions: 48,
      total_sessions: 50,
      gpa: '3.86',
      avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      fee_status: 'Paid in Full',
      fee_receipt: 'RCP-2026-9041',
    }
  })

  // Calendar State
  const [calendarEvents, setCalendarEvents] = useState(DEFAULT_CALENDAR_EVENTS)
  const [viewDate, setViewDate] = useState({ year: 2026, month: 10 }) // Nov 2026
  const [selectedDateStr, setSelectedDateStr] = useState('2026-11-26')
  const [calendarViewMode, setCalendarViewMode] = useState('month') // 'month' | 'agenda'
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All')
  const [selectedEventModal, setSelectedEventModal] = useState(null)

  // Live Data State
  const [assignments, setAssignments] = useState([])
  const [exams, setExams] = useState([])
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Interactive Check-In State
  const [checkedInToday, setCheckedInToday] = useState(() => {
    try {
      return localStorage.getItem('bx_student_checked_in_2026-11-26') === 'true'
    } catch {
      return false
    }
  })
  const [checkInTime, setCheckInTime] = useState(() => {
    try {
      return localStorage.getItem('bx_student_checkin_time') || '09:24 AM'
    } catch {
      return '09:24 AM'
    }
  })

  // Hall Ticket Modal State
  const [showHallTicketModal, setShowHallTicketModal] = useState(false)
  const [showSubmitModal, setShowSubmitModal] = useState(null)
  const [submissionUrl, setSubmissionUrl] = useState('')
  const [submissionNotes, setSubmissionNotes] = useState('')

  // Fetch real backend data
  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      setLoading(true)
      try {
        // Fetch Calendar
        try {
          const calRes = await apiService.getCalendarEvents()
          if (calRes && calRes.data && Array.isArray(calRes.data) && calRes.data.length > 0 && isMounted) {
            setCalendarEvents(calRes.data)
          }
        } catch (e) {
          console.warn('Calendar API fallback:', e)
        }

        // Fetch Assignments
        try {
          const assignRes = await apiService.getAssignments()
          if (assignRes && assignRes.data && Array.isArray(assignRes.data) && isMounted) {
            setAssignments(assignRes.data)
          }
        } catch (e) {
          console.warn('Assignments API fallback:', e)
        }

        // Fetch Exams
        try {
          const examRes = await apiService.getExams()
          if (examRes && examRes.data && Array.isArray(examRes.data) && isMounted) {
            setExams(examRes.data)
          }
        } catch (e) {
          console.warn('Exams API fallback:', e)
        }

        // Fetch Milestones
        try {
          const msRes = await apiService.getMilestones()
          if (msRes && msRes.data && Array.isArray(msRes.data) && isMounted) {
            setMilestones(msRes.data)
          }
        } catch (e) {
          console.warn('Milestones API fallback:', e)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchData()
    return () => { isMounted = false }
  }, [])

  // Show Toast Helper
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Handle Check-In
  const handleCheckIn = () => {
    const now = new Date()
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setCheckedInToday(true)
    setCheckInTime(timeStr)
    try {
      localStorage.setItem('bx_student_checked_in_2026-11-26', 'true')
      localStorage.setItem('bx_student_checkin_time', timeStr)
    } catch {
      // ignore
    }
    showToast(`Checked in successfully at ${timeStr}! Attendance marked: Present (Lab 302).`)
  }

  // Month navigation
  const handlePrevMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 0) return { year: prev.year - 1, month: 11 }
      return { year: prev.year, month: prev.month - 1 }
    })
  }

  const handleNextMonth = () => {
    setViewDate((prev) => {
      if (prev.month === 11) return { year: prev.year + 1, month: 0 }
      return { year: prev.year, month: prev.month + 1 }
    })
  }

  const handleToday = () => {
    setViewDate({ year: 2026, month: 10 })
    setSelectedDateStr('2026-11-26')
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const currentMonthName = `${monthNames[viewDate.month]} ${viewDate.year}`

  // Calendar Grid computation (Monday-aligned)
  const firstDayOfWeek = new Date(viewDate.year, viewDate.month, 1).getDay()
  const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate()
  const mondayOffset = (firstDayOfWeek + 6) % 7
  const calendarCells = []

  const prevMonthTotalDays = new Date(viewDate.year, viewDate.month, 0).getDate()
  for (let i = mondayOffset - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i
    const prevMonthIdx = viewDate.month === 0 ? 11 : viewDate.month - 1
    const prevYear = viewDate.month === 0 ? viewDate.year - 1 : viewDate.year
    const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    calendarCells.push({ dayNum, dateStr, isCurrentMonth: false })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    calendarCells.push({ dayNum: d, dateStr, isCurrentMonth: true })
  }

  const remaining = (7 - (calendarCells.length % 7)) % 7
  for (let r = 1; r <= remaining; r++) {
    const nextMonthIdx = viewDate.month === 11 ? 0 : viewDate.month + 1
    const nextYear = viewDate.month === 11 ? viewDate.year + 1 : viewDate.year
    const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(r).padStart(2, '0')}`
    calendarCells.push({ dayNum: r, dateStr, isCurrentMonth: false })
  }

  // Filter Calendar Events
  const filteredEvents = calendarEvents.filter((ev) => {
    const matchType = selectedTypeFilter === 'All' || ev.type === selectedTypeFilter
    return matchType
  })

  // Selected date events
  const selectedDateEvents = filteredEvents.filter((e) => e.date === selectedDateStr)

  // Type Badge helper
  const getTypeBadge = (type) => {
    switch (type) {
      case 'lecture':
        return { label: 'Class', bg: 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' }
      case 'lab':
        return { label: 'Lab Practicum', bg: 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' }
      case 'assignment':
        return { label: 'Assignment Due', bg: 'bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' }
      case 'exam':
        return { label: 'Examination', bg: 'bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' }
      case 'milestone':
        return { label: 'Milestone Review', bg: 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' }
      default:
        return { label: 'Academic Event', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' }
    }
  }

  // Handle Quick Submit Assignment
  const handleConfirmSubmit = (e) => {
    e.preventDefault()
    if (!submissionUrl.trim()) return
    showToast(`Assignment "${showSubmitModal?.title}" submitted successfully! Sent to tutor for evaluation.`)
    setShowSubmitModal(null)
    setSubmissionUrl('')
    setSubmissionNotes('')
  }

  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-3 rounded-md bg-emerald-600 text-white font-label text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>{toastMessage}</span>
          </div>
          <button type="button" onClick={() => setToastMessage('')} className="opacity-80 hover:opacity-100">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* 1. Student Identity, Academic Standing & Persona Switcher */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-4 rounded-xl shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Left: Avatar & Identity Details */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative shrink-0">
            <img
              src={activeStudent.avatar}
              alt={activeStudent.name}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-light-primary/30 dark:ring-dark-primary/30 shadow-xs"
            />
            <span
              className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-dark-surface-bright ${
                checkedInToday ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
              title={checkedInToday ? 'Active on Campus' : 'Not Checked In'}
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-title text-base sm:text-lg font-bold text-light-on-surface dark:text-dark-on-surface">
                {activeStudent.name}
              </h1>
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint border border-light-primary/20">
                {activeStudent.student_id}
              </span>
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {activeStudent.batch}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Good Standing • GPA {activeStudent.gpa}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
              <span className="font-medium text-light-on-surface dark:text-dark-on-surface">
                {activeStudent.track}
              </span>
              <span>•</span>
              <span>{activeStudent.term}</span>
              <span>•</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                <span className="material-symbols-outlined text-[14px]">receipt_long</span>
                <span>{activeStudent.fee_status} ({activeStudent.fee_receipt})</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Persona Switcher, Check-in Button & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start xl:self-center">
          {/* Persona selector for quick testing */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container">
            <span className="material-symbols-outlined text-[16px] text-light-outline">switch_account</span>
            <select
              value={activeStudent.id}
              onChange={(e) => {
                const found = STUDENT_PERSONAS.find((p) => p.id === e.target.value)
                if (found) setActiveStudent(found)
              }}
              className="bg-transparent text-xs font-semibold text-light-on-surface dark:text-dark-on-surface focus:outline-none cursor-pointer"
              title="Switch student persona for preview"
            >
              {STUDENT_PERSONAS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.batch})
                </option>
              ))}
            </select>
          </div>

          {/* Today's Campus Arrival / Check-in Button */}
          {checkedInToday ? (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold text-xs shadow-xs">
              <span className="material-symbols-outlined text-[16px] text-emerald-600 dark:text-emerald-400">check_circle</span>
              <span>Checked In at {checkInTime}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleCheckIn}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">touch_app</span>
              <span>Check In for Today</span>
            </button>
          )}

          {/* Hall Ticket View Button */}
          <button
            type="button"
            onClick={() => setShowHallTicketModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface text-xs font-semibold hover:bg-light-surface-container-low transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px] text-purple-600 dark:text-purple-400">confirmation_number</span>
            <span>Hall Ticket</span>
          </button>

          {/* Calendar Sync Button */}
          <button
            type="button"
            onClick={() => showToast('Calendar synced! Google Calendar / Apple iCal subscription refreshed.')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface text-xs font-semibold hover:bg-light-surface-container-low transition-colors cursor-pointer"
            title="Sync with external calendar"
          >
            <span className="material-symbols-outlined text-[16px]">sync</span>
            <span>Sync iCal</span>
          </button>
        </div>
      </section>

      {/* 2. Four Academic Core KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Attendance Rate */}
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs font-semibold text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Term Attendance
            </span>
            <span className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 inline-flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="font-headline text-2xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                {activeStudent.attendance}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Optimal
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${parseFloat(activeStudent.attendance)}%` }}
              />
            </div>
            <span className="text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1.5 block">
              {activeStudent.attended_sessions} of {activeStudent.total_sessions} classes attended • Min 80% req.
            </span>
          </div>
        </article>

        {/* KPI 2: Enrolled Modules & Coursework */}
        <article
          onClick={() => onNavigate && onNavigate('modules')}
          className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-2.5 cursor-pointer hover:border-light-primary/50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-label text-xs font-semibold text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Enrolled Modules
            </span>
            <span className="w-7 h-7 rounded-lg bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary inline-flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">menu_book</span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="font-headline text-2xl font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                4 Active
              </span>
              <span className="text-[11px] font-semibold text-light-primary dark:text-dark-primary bg-light-primary-tint dark:bg-dark-primary-tint px-2 py-0.5 rounded-full">
                68% Progress
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-light-primary dark:bg-dark-primary h-1.5 rounded-full" style={{ width: '68%' }} />
            </div>
            <span className="text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1.5 block">
              React 19, CI4 REST, PostgreSQL, Docker
            </span>
          </div>
        </article>

        {/* KPI 3: Pending Assignments */}
        <article
          onClick={() => onNavigate && onNavigate('assignments')}
          className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-2.5 cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-label text-xs font-semibold text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Pending Tasks
            </span>
            <span className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 inline-flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">assignment</span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="font-headline text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                {assignments.filter((a) => a.stage === 'sent' || a.stage === 'created').length || 2} Due
              </span>
              <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                Due Tomorrow
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: '75%' }} />
            </div>
            <span className="text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1.5 block">
              1 Ready to Submit • 3 Graded (Avg 96%)
            </span>
          </div>
        </article>

        {/* KPI 4: Upcoming Exams */}
        <article
          onClick={() => setShowHallTicketModal(true)}
          className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-xl p-3.5 shadow-xs flex flex-col justify-between gap-2.5 cursor-pointer hover:border-purple-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="font-label text-xs font-semibold text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Next Examination
            </span>
            <span className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 inline-flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">quiz</span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <span className="font-headline text-2xl font-bold text-purple-600 dark:text-purple-400 tabular-nums">
                Nov 30
              </span>
              <span className="text-[11px] font-semibold text-purple-800 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                In 4 Days
              </span>
            </div>
            <div className="mt-2 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: '90%' }} />
            </div>
            <span className="text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1.5 block truncate">
              Hall A • Desk 14 • Admit Card Ready
            </span>
          </div>
        </article>
      </section>

      {/* 3. Main Workspace Grid: Interactive Calendar Dashboard (Left 8 cols) & Today's Schedule & Tasks (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Calendar Dashboard (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Calendar Controls & Month Switcher Bar */}
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
            {/* Month & Navigation */}
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-light-primary text-[20px]">calendar_month</span>
              <h2 className="font-title text-sm sm:text-base font-bold text-light-on-surface dark:text-dark-on-surface min-w-[140px]">
                {currentMonthName}
              </h2>
              <div className="flex items-center p-0.5 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container transition-colors cursor-pointer"
                  title="Previous Month"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={handleToday}
                  className="px-2 py-0.5 text-xs font-semibold text-light-on-surface hover:bg-light-surface-container transition-colors cursor-pointer"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container transition-colors cursor-pointer"
                  title="Next Month"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Filter and View Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none"
              >
                <option value="All">All Event Types</option>
                <option value="lecture">Live Classes</option>
                <option value="lab">Practical Labs</option>
                <option value="assignment">Assignments Due</option>
                <option value="exam">Examinations</option>
                <option value="milestone">Milestones</option>
              </select>

              <div className="flex items-center p-0.5 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container">
                <button
                  type="button"
                  onClick={() => setCalendarViewMode('month')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    calendarViewMode === 'month'
                      ? 'bg-light-primary text-light-on-primary shadow-xs'
                      : 'text-light-on-surface-variant hover:text-light-on-surface'
                  }`}
                >
                  Month View
                </button>
                <button
                  type="button"
                  onClick={() => setCalendarViewMode('agenda')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    calendarViewMode === 'agenda'
                      ? 'bg-light-primary text-light-on-primary shadow-xs'
                      : 'text-light-on-surface-variant hover:text-light-on-surface'
                  }`}
                >
                  Agenda
                </button>
              </div>
            </div>
          </div>

          {/* MONTH CALENDAR GRID */}
          {calendarViewMode === 'month' && (
            <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-xl overflow-hidden shadow-xs flex flex-col">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-center text-[11px] font-bold text-light-on-surface-variant py-2 uppercase tracking-wider">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
                <div>Sun</div>
              </div>

              {/* Day Grid Cells */}
              <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-light-outline-variant/60 dark:divide-dark-outline-variant/60">
                {calendarCells.map((cell, idx) => {
                  const dayEvents = filteredEvents.filter((e) => e.date === cell.dateStr)
                  const isToday = cell.dateStr === '2026-11-26'
                  const isSelected = cell.dateStr === selectedDateStr

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDateStr(cell.dateStr)}
                      className={`min-h-[92px] p-1.5 sm:p-2 flex flex-col gap-1 transition-all cursor-pointer ${
                        !cell.isCurrentMonth
                          ? 'opacity-30 bg-light-surface-container-low/20'
                          : isSelected
                          ? 'bg-light-primary-tint/25 dark:bg-dark-primary-tint/25 ring-2 ring-light-primary dark:ring-dark-primary'
                          : 'hover:bg-light-surface-container-low/50'
                      }`}
                    >
                      {/* Day Number Header */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                            isToday
                              ? 'bg-light-primary text-light-on-primary ring-2 ring-light-primary/40'
                              : 'text-light-on-surface dark:text-dark-on-surface'
                          }`}
                        >
                          {cell.dayNum}
                        </span>

                        {dayEvents.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-light-primary" title={`${dayEvents.length} events`} />
                        )}
                      </div>

                      {/* Event Badges in Cell */}
                      <div className="flex flex-col gap-1 overflow-hidden mt-0.5">
                        {dayEvents.slice(0, 2).map((ev) => {
                          const badge = getTypeBadge(ev.type)
                          return (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedEventModal(ev)
                              }}
                              className={`text-left px-1.5 py-0.5 rounded border text-[10px] font-semibold truncate transition-transform hover:scale-[1.02] ${badge.bg}`}
                              title={`${ev.start_time} - ${ev.title}`}
                            >
                              <span className="font-mono text-[9px] mr-1 opacity-75">{ev.start_time}</span>
                              <span>{ev.title}</span>
                            </button>
                          )
                        })}

                        {dayEvents.length > 2 && (
                          <span className="text-[9px] font-bold text-light-on-surface-variant dark:text-dark-on-surface-variant pl-0.5">
                            +{dayEvents.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* AGENDA CHRONOLOGICAL VIEW */}
          {calendarViewMode === 'agenda' && (
            <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-xl p-4 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-label text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                  All Scheduled Sessions &amp; Deadlines ({filteredEvents.length})
                </span>
                <span className="text-xs text-light-on-surface-variant">November - December 2026</span>
              </div>

              <div className="space-y-2">
                {filteredEvents.map((ev) => {
                  const badge = getTypeBadge(ev.type)
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEventModal(ev)}
                      className="p-3 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/40 dark:bg-dark-surface-container/40 hover:bg-light-surface-container-low transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-light-surface-container border border-light-outline-variant/60 min-w-[55px]">
                          <span className="font-mono text-[10px] text-light-on-surface-variant uppercase font-bold">
                            {new Date(ev.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className="font-headline text-sm font-bold text-light-on-surface dark:text-dark-on-surface">
                            {ev.date.slice(-2)}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${badge.bg}`}>
                              {badge.label}
                            </span>
                            <span className="font-mono text-xs font-semibold text-light-primary dark:text-dark-primary">
                              {ev.start_time} - {ev.end_time}
                            </span>
                            <span className="text-xs text-light-on-surface-variant font-mono">
                              • {ev.location}
                            </span>
                          </div>
                          <h4 className="font-title text-sm font-bold text-light-on-surface dark:text-dark-on-surface mt-1">
                            {ev.title}
                          </h4>
                          <span className="text-xs text-light-on-surface-variant block mt-0.5">
                            Instructor: {ev.instructor} • {ev.description}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {ev.link && (
                          <a
                            href={ev.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-light-primary text-light-on-primary text-xs font-semibold hover:bg-light-primary-container"
                          >
                            <span className="material-symbols-outlined text-[14px]">videocam</span>
                            <span>Join</span>
                          </a>
                        )}
                        <span className="material-symbols-outlined text-light-outline text-[18px]">chevron_right</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Today's Class Itinerary & Selected Day Task Drawer (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Active Live Class Card */}
          <article className="bg-gradient-to-br from-[#1E113A] via-[#2B1B54] to-[#120B24] text-white p-4 rounded-xl shadow-md border border-purple-800/60 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-label text-[10px] font-bold border border-red-500/40">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                <span>HAPPENING TODAY</span>
              </span>
              <span className="font-mono text-xs text-purple-200">Room 302</span>
            </div>

            <div>
              <h3 className="font-title text-sm font-bold text-white leading-snug">
                React 19 Server Actions &amp; Microservices Architecture
              </h3>
              <p className="text-xs text-purple-200/90 mt-1">
                Faculty Lead: Dr. Marcus Vance • Full-Stack Web Dev ({activeStudent.batch})
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-purple-800/80 pt-3 text-xs">
              <span className="text-purple-300 font-mono">09:30 AM - 12:30 PM</span>
              <a
                href="https://meet.bixcel.edu/dev-24a"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#2B1B54] font-bold text-xs hover:bg-purple-100 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">videocam</span>
                <span>Launch Classroom</span>
              </a>
            </div>
          </article>

          {/* Agenda for Selected Date */}
          <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-xl p-4 shadow-xs flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-light-outline-variant/60 dark:border-dark-outline-variant/60 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-light-primary text-[18px]">event</span>
                <h3 className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                  Day Schedule: {selectedDateStr}
                </h3>
              </div>
              <span className="font-mono text-[11px] font-semibold text-light-on-surface-variant">
                {selectedDateEvents.length} Item{selectedDateEvents.length === 1 ? '' : 's'}
              </span>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="py-6 text-center text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                <span className="material-symbols-outlined text-[24px] text-light-outline block mb-1">
                  event_available
                </span>
                No scheduled lectures or deadlines on this date.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDateEvents.map((ev) => {
                  const badge = getTypeBadge(ev.type)
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEventModal(ev)}
                      className="p-2.5 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/40 dark:bg-dark-surface-container/40 hover:bg-light-surface-container-low transition-colors cursor-pointer flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="font-mono text-[11px] font-semibold text-light-primary dark:text-dark-primary">
                          {ev.start_time} - {ev.end_time}
                        </span>
                      </div>
                      <h4 className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                        {ev.title}
                      </h4>
                      <p className="text-[11px] text-light-on-surface-variant line-clamp-2">
                        {ev.instructor} • {ev.location}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </article>

          {/* Quick Notice Banner */}
          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
              campaign
            </span>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold">Campus Library Prep Week:</span>
              <span>
                Study halls in North Block are open 24/7 leading up to the Nov 30 Midterm examination.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Active Assignments & Competency Milestones Two-Column Widgets */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Assignments Widget with 3-Stage Lifecycle */}
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-xl p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-light-outline-variant/60 dark:border-dark-outline-variant/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[18px]">assignment</span>
              <h3 className="font-title text-sm font-bold text-light-on-surface dark:text-dark-on-surface">
                My Active Assignments &amp; Submissions
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('assignments')}
              className="text-xs font-semibold text-light-primary hover:underline"
            >
              View All &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {/* Task 1 */}
            <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    STAGE: SENT TO STUDENTS
                  </span>
                  <span className="text-[11px] text-light-on-surface-variant font-mono">
                    Due: Nov 27, 2026 (Tomorrow)
                  </span>
                </div>
                <h4 className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                  RESTful API Design &amp; Authentication Middleware
                </h4>
                <span className="text-[11px] text-light-on-surface-variant">
                  Points: 100 • Dr. Marcus Vance • Full-Stack Track
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowSubmitModal({ title: 'RESTful API Design & Authentication Middleware', due: 'Nov 27' })}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">upload_file</span>
                <span>Submit Work</span>
              </button>
            </div>

            {/* Task 2 */}
            <div className="p-3 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/30 dark:bg-dark-surface-container/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                    STAGE: UNDER REVIEW
                  </span>
                  <span className="text-[11px] text-light-on-surface-variant font-mono">
                    Submitted: Nov 24
                  </span>
                </div>
                <h4 className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                  React Component Tree &amp; State Management
                </h4>
                <span className="text-[11px] text-light-on-surface-variant">
                  Points: 100 • Elena Rostova • Awaiting Grade
                </span>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-light-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]">pending</span>
                <span>In Review</span>
              </span>
            </div>

            {/* Task 3 */}
            <div className="p-3 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/30 dark:bg-dark-surface-container/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    STAGE: COMPLETED &amp; GRADED
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                    Score: 98 / 100 (A+)
                  </span>
                </div>
                <h4 className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                  Database Normalization &amp; PostgreSQL Indexing
                </h4>
                <span className="text-[11px] text-light-on-surface-variant">
                  Tutor Feedback: &quot;Exceptional execution of multi-column indexes.&quot;
                </span>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                <span>Passed</span>
              </span>
            </div>
          </div>
        </article>

        {/* Competency Milestones Tracker Widget */}
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-xl p-4 shadow-xs flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-light-outline-variant/60 dark:border-dark-outline-variant/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px]">flag</span>
              <h3 className="font-title text-sm font-bold text-light-on-surface dark:text-dark-on-surface">
                Competency Milestones Roadmap
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('milestones')}
              className="text-xs font-semibold text-light-primary hover:underline"
            >
              View Details &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {/* Milestone 1 */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-light-on-surface dark:text-dark-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                  <span>1. Modern Frontend Architecture (React 19)</span>
                </div>
                <span className="font-mono text-emerald-600 font-bold">100% Mastered</span>
              </div>
              <div className="mt-1 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }} />
              </div>
              <span className="text-[10px] text-light-on-surface-variant block mt-0.5">
                Evaluator: Dr. Marcus Vance • Sign-off recorded
              </span>
            </div>

            {/* Milestone 2 */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-light-on-surface dark:text-dark-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
                  <span>2. Backend Services &amp; RESTful API Engineering</span>
                </div>
                <span className="font-mono text-emerald-600 font-bold">100% Mastered</span>
              </div>
              <div className="mt-1 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '100%' }} />
              </div>
              <span className="text-[10px] text-light-on-surface-variant block mt-0.5">
                Evaluator: Elena Rostova • Sign-off recorded
              </span>
            </div>

            {/* Milestone 3 */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-light-on-surface dark:text-dark-on-surface">
                  <span className="material-symbols-outlined text-[16px] text-light-primary">timelapse</span>
                  <span>3. Enterprise RBAC &amp; Authentication Systems</span>
                </div>
                <span className="font-mono text-light-primary font-bold">80% In Progress</span>
              </div>
              <div className="mt-1 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-light-primary dark:bg-dark-primary h-2 rounded-full" style={{ width: '80%' }} />
              </div>
              <span className="text-[10px] text-light-on-surface-variant block mt-0.5">
                Target Evaluation Date: Nov 29, 2026
              </span>
            </div>

            {/* Milestone 4 */}
            <div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-light-on-surface dark:text-dark-on-surface opacity-75">
                  <span className="material-symbols-outlined text-[16px] text-slate-400">lock</span>
                  <span>4. Cloud Deployment, CI/CD &amp; Production Monitoring</span>
                </div>
                <span className="font-mono text-slate-500 font-bold">Scheduled</span>
              </div>
              <div className="mt-1 w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-slate-300 dark:bg-slate-700 h-2 rounded-full" style={{ width: '15%' }} />
              </div>
              <span className="text-[10px] text-light-on-surface-variant block mt-0.5">
                Scheduled for Term 2026-Q4 Capstone Phase
              </span>
            </div>
          </div>
        </article>
      </section>

      {/* MODAL 1: Examination Hall Ticket / Admit Card Viewer */}
      {showHallTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-4 relative">
            <button
              type="button"
              onClick={() => setShowHallTicketModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-light-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>

            {/* Admit Card Header */}
            <div className="flex items-center gap-3 border-b border-light-outline-variant/60 dark:border-dark-outline-variant/60 pb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                BX
              </div>
              <div>
                <h3 className="font-title text-base font-bold text-light-on-surface dark:text-dark-on-surface">
                  Official Examination Admit Card
                </h3>
                <span className="text-xs text-light-on-surface-variant">
                  Bixcel Learning Management System • Academic Term 2026-Q4
                </span>
              </div>
            </div>

            {/* Hall Ticket Body Card */}
            <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-300 block">
                    HALL TICKET NUMBER
                  </span>
                  <span className="font-mono text-base font-bold text-light-on-surface dark:text-dark-on-surface">
                    HT-2026-8819
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
                    STATUS
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span>Verified &amp; Issued</span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs border-t border-purple-200/60 dark:border-purple-800/60 pt-2">
                <div>
                  <span className="text-light-on-surface-variant block text-[11px]">Candidate Name</span>
                  <span className="font-bold text-light-on-surface dark:text-dark-on-surface">
                    {activeStudent.name}
                  </span>
                </div>
                <div>
                  <span className="text-light-on-surface-variant block text-[11px]">Student ID</span>
                  <span className="font-mono font-bold text-light-on-surface dark:text-dark-on-surface">
                    {activeStudent.student_id}
                  </span>
                </div>
                <div>
                  <span className="text-light-on-surface-variant block text-[11px]">Assigned Cohort</span>
                  <span className="font-bold text-light-on-surface dark:text-dark-on-surface">
                    {activeStudent.batch}
                  </span>
                </div>
                <div>
                  <span className="text-light-on-surface-variant block text-[11px]">Exam Center / Desk</span>
                  <span className="font-bold text-purple-700 dark:text-purple-300">
                    Main Hall A • Desk 14
                  </span>
                </div>
              </div>

              <div className="border-t border-purple-200/60 dark:border-purple-800/60 pt-2 text-xs">
                <span className="text-light-on-surface-variant block text-[11px]">Paper &amp; Time</span>
                <span className="font-bold text-light-on-surface dark:text-dark-on-surface">
                  Full-Stack Architecture &amp; Web Systems Midterm Assessment
                </span>
                <span className="font-mono text-[11px] text-purple-600 dark:text-purple-400 block mt-0.5">
                  Nov 30, 2026 • 10:00 AM - 01:00 PM (180 mins)
                </span>
              </div>
            </div>

            {/* Candidate Instructions */}
            <div className="text-[11px] text-light-on-surface-variant space-y-1">
              <p className="font-semibold text-light-on-surface dark:text-dark-on-surface">
                Candidate Guidelines:
              </p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Candidates must present physical institutional ID card along with this hall ticket.</li>
                <li>Arrival at the examination hall is mandatory 20 minutes before paper commencement.</li>
                <li>Calculators and scratch notes provided by invigilator desk. Electronic devices prohibited.</li>
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 border-t border-light-outline-variant/60 dark:border-dark-outline-variant/60 pt-3">
              <button
                type="button"
                onClick={() => {
                  window.print()
                }}
                className="px-3 py-1.5 rounded-lg border border-light-outline-variant text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Print Admit Card
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Hall Ticket downloaded as PDF: HT-2026-8819.pdf')
                  setShowHallTicketModal(false)
                }}
                className="px-4 py-1.5 rounded-lg bg-light-primary text-light-on-primary text-xs font-semibold hover:bg-light-primary-container shadow-xs transition-colors"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Event Details Modal */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-2xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-3 relative">
            <button
              type="button"
              onClick={() => setSelectedEventModal(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-light-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${getTypeBadge(selectedEventModal.type).bg}`}>
                {getTypeBadge(selectedEventModal.type).label}
              </span>
              <span className="font-mono text-xs text-light-on-surface-variant">
                {selectedEventModal.date}
              </span>
            </div>

            <h3 className="font-title text-base font-bold text-light-on-surface dark:text-dark-on-surface">
              {selectedEventModal.title}
            </h3>

            <div className="p-3 rounded-lg bg-light-surface-container-low dark:bg-dark-surface-container text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-light-on-surface-variant">Time:</span>
                <span className="font-mono font-bold text-light-on-surface dark:text-dark-on-surface">
                  {selectedEventModal.start_time} - {selectedEventModal.end_time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-light-on-surface-variant">Location:</span>
                <span className="font-bold text-light-on-surface dark:text-dark-on-surface">
                  {selectedEventModal.location}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-light-on-surface-variant">Instructor:</span>
                <span className="font-bold text-light-on-surface dark:text-dark-on-surface">
                  {selectedEventModal.instructor}
                </span>
              </div>
            </div>

            {selectedEventModal.description && (
              <p className="text-xs text-light-on-surface-variant">
                {selectedEventModal.description}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 border-t border-light-outline-variant/60 pt-3">
              {selectedEventModal.link && (
                <a
                  href={selectedEventModal.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-light-primary text-light-on-primary text-xs font-semibold hover:bg-light-primary-container"
                >
                  Open Meeting Link
                </a>
              )}
              <button
                type="button"
                onClick={() => setSelectedEventModal(null)}
                className="px-3 py-1.5 rounded-lg border border-light-outline-variant text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Submit Assignment Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-2xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-3 relative">
            <button
              type="button"
              onClick={() => setShowSubmitModal(null)}
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-light-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <h3 className="font-title text-base font-bold text-light-on-surface dark:text-dark-on-surface">
              Submit Assignment
            </h3>
            <p className="text-xs text-light-on-surface-variant">
              {showSubmitModal.title} (Due: {showSubmitModal.due})
            </p>

            <form onSubmit={handleConfirmSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Repository URL / Live Link:
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://github.com/student/bixcel-rest-api"
                  value={submissionUrl}
                  onChange={(e) => setSubmissionUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-xs text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Submission Notes for Faculty:
                </label>
                <textarea
                  rows="3"
                  placeholder="Notes on API endpoints, Docker compose commands, test instructions..."
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-xs text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-light-outline-variant/60 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(null)}
                  className="px-3 py-1.5 rounded-lg border border-light-outline-variant text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs"
                >
                  Confirm Submission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentDashboard
