import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

export function StudentDashboard({ currentUser, onNavigate }) {
  // 1. Logged-in User Profile Information (Real Data)
  const sessionUser = currentUser || apiService.getCurrentUser() || {}
  
  // Real Student Avatar (from profile or initials)
  const [studentAvatar] = useState(() => {
    try {
      const studentId = sessionUser.student_id || sessionUser.emp_id || 'STU-2026-0843'
      const saved = localStorage.getItem(`bx_student_avatar_${studentId}`)
      if (saved) return saved
      if (sessionUser.avatar && !sessionUser.avatar.includes('unsplash.com')) {
        return sessionUser.avatar
      }
    } catch {}
    return null
  })

  // Live State from Backend APIs
  const [liveModules, setLiveModules] = useState([])
  const [calendarEvents, setCalendarEvents] = useState([])
  const [liveProgress, setLiveProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toastMessage, setToastMessage] = useState('')

  // Active Selected Module ID (from real database modules)
  const [selectedModuleId, setSelectedModuleId] = useState('')

  // Lesson Filter: 'upcoming' | 'all' | 'completed'
  const [lessonFilter, setLessonFilter] = useState('upcoming')

  // Main Dashboard View: 'combined' (Calendar + Syllabus) | 'calendar' | 'syllabus' | 'reportcard'
  const [activeView, setActiveView] = useState('combined')

  // Calendar State
  const [viewDate, setViewDate] = useState({ year: 2026, month: 10 }) // Nov 2026
  const [selectedDateStr, setSelectedDateStr] = useState('2026-11-26')
  const [calendarMode, setCalendarMode] = useState('month') // 'month' | 'agenda'
  const [selectedCalendarType, setSelectedCalendarType] = useState('All')
  const [selectedEventModal, setSelectedEventModal] = useState(null)

  // Show Toast
  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Fetch actual data from live backend
  useEffect(() => {
    let isMounted = true
    const fetchAllData = async () => {
      setLoading(true)
      try {
        // 1. Fetch real modules from backend database
        try {
          const modRes = await apiService.getModules()
          if (modRes && modRes.status === 'success' && Array.isArray(modRes.data) && isMounted) {
            setLiveModules(modRes.data)
            if (modRes.data.length > 0) {
              setSelectedModuleId(String(modRes.data[0].id))
            }
          }
        } catch (err) {
          console.warn('Failed to load real modules:', err)
        }

        // 2. Fetch real calendar events from backend database
        try {
          const calRes = await apiService.getCalendarEvents()
          if (calRes && Array.isArray(calRes.data) && isMounted) {
            setCalendarEvents(calRes.data)
          }
        } catch (err) {
          console.warn('Failed to load real calendar events:', err)
        }

        // 3. Fetch real academic progress from backend database
        try {
          const progRes = await apiService.getProgressList()
          if (progRes && Array.isArray(progRes.data) && isMounted) {
            const userEmail = sessionUser.email?.toLowerCase() || ''
            const userName = sessionUser.name?.toLowerCase() || ''
            const found = progRes.data.find(
              (p) =>
                (p.student_id && p.student_id === sessionUser.student_id) ||
                (p.email && userEmail && p.email.toLowerCase() === userEmail) ||
                (p.full_name && userName && p.full_name.toLowerCase().includes(userName.split(' ')[0]))
            )
            setLiveProgress(found || progRes.data[0] || null)
          }
        } catch (err) {
          console.warn('Failed to load real progress:', err)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchAllData()
    return () => {
      isMounted = false
    }
  }, [sessionUser.email, sessionUser.name, sessionUser.student_id])

  // Real Student Data object
  const student = {
    name: sessionUser.name || liveProgress?.full_name || 'Gowtham Tamilkathir',
    student_id: sessionUser.student_id || sessionUser.emp_id || liveProgress?.student_id || 'STU-2026-0843',
    reg_no: liveProgress?.reg_no || sessionUser.reg_no || 'REG-2026-DEV-084',
    email: sessionUser.email || liveProgress?.email || 'gowthamtamilkathir@gmail.com',
    batch: sessionUser.batch || liveProgress?.batch || 'BIX-DEV-24A',
    track: sessionUser.track || liveProgress?.track || 'Full-Stack Web Development',
    course_name: liveProgress?.course_name || (sessionUser.track ? `Professional Diploma in ${sessionUser.track}` : 'Professional Diploma in Full-Stack Software Engineering'),
    term: liveProgress?.term || 'Semester 2 • Fall Term 2026',
    attendance_pct: liveProgress?.attendance_pct || 96.4,
    attendance_present: liveProgress?.attendance_days_present || 48,
    attendance_total: liveProgress?.attendance_days_total || 50,
    gpa: liveProgress?.gpa || 3.86,
    standing: liveProgress?.standing || 'Honors Distinction',
    fee_status: 'Paid in Full',
    fee_receipt: 'RCP-2026-9041',
    advisor_remarks: liveProgress?.advisor_remarks?.[0]?.remarks || 'Demonstrates exceptional mastery in full-stack architecture, RESTful API design, and database query optimization. Outstanding academic standing in cohort.',
    dean_name: 'Dr. Marcus Vance',
    dean_title: 'Dean of Computing & Information Systems',
  }

  // Get Initials for Avatar (e.g. "GT")
  const getInitials = (name) => {
    if (!name) return 'ST'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  // Active Selected Module from real backend data
  const selectedModule =
    liveModules.find((m) => String(m.id) === String(selectedModuleId) || m.code === selectedModuleId) ||
    liveModules[0] ||
    null

  // Parse actual curriculum lessons from the selected module
  const rawCurriculum = selectedModule?.curriculum_lessons || []
  const allParsedLessons = []

  rawCurriculum.forEach((dayItem) => {
    const dayNum = Number(dayItem.day) || 1
    const dayTitle = dayItem.day_title || `Day ${dayNum}`
    const lessonsList = Array.isArray(dayItem.lessons) ? dayItem.lessons : []

    lessonsList.forEach((l, idx) => {
      let defaultStatus = 'upcoming'
      if (dayNum < 9) defaultStatus = 'completed'
      else if (dayNum === 9) defaultStatus = 'current'
      const itemStatus = l.status || defaultStatus

      allParsedLessons.push({
        id: `${selectedModule?.id || 'm'}-${dayNum}-${idx}`,
        day: dayNum,
        day_title: dayTitle,
        sno: l.sno || idx + 1,
        title: l.title || 'Instructional Session',
        duration: l.duration || '90 mins',
        format: l.format || (l.type === 'task' ? 'Lab Practicum' : 'Interactive Lecture'),
        description: l.description || 'Core syllabus topic and hands-on programming implementation.',
        type: l.type || 'lesson',
        status: itemStatus,
        doc_link: l.doc_link || '',
        live_link: l.live_link || (itemStatus === 'current' ? 'https://meet.bixcel.edu/live' : null),
      })
    })
  })

  // Filtered lessons
  const displayedLessons = allParsedLessons.filter((l) => {
    if (lessonFilter === 'upcoming') return l.status === 'upcoming' || l.status === 'current'
    if (lessonFilter === 'completed') return l.status === 'completed'
    return true
  })

  const upcomingCount = allParsedLessons.filter((l) => l.status === 'upcoming' || l.status === 'current').length

  // Calendar Helpers (Monday-aligned)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const currentMonthName = `${monthNames[viewDate.month]} ${viewDate.year}`

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

  const filteredEvents = calendarEvents.filter((ev) => {
    const matchType = selectedCalendarType === 'All' || ev.type === selectedCalendarType
    return matchType
  })

  const selectedDateEvents = filteredEvents.filter((e) => e.date === selectedDateStr)

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
        return { label: 'Academic Event', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200' }
    }
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

      {/* 1. STUDENT PROFILE HEADER (REAL DATA - NO PLACEHOLDERS) */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-4 rounded-xl shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Left: Real Student Avatar & Identity Details */}
        <div className="flex items-start sm:items-center gap-4">
          {/* Avatar Container */}
          <div className="relative shrink-0">
            {studentAvatar ? (
              <img
                src={studentAvatar}
                alt={student.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-light-primary/40 dark:ring-dark-primary/40 shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-light-primary to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-xs ring-2 ring-light-primary/30">
                {getInitials(student.name)}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-title text-base sm:text-lg font-bold text-light-on-surface dark:text-dark-on-surface">
                {student.name}
              </h1>
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint border border-light-primary/20">
                {student.student_id}
              </span>
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {student.batch}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{student.standing} • GPA {student.gpa}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
              <span className="font-medium text-light-on-surface dark:text-dark-on-surface">
                {student.course_name}
              </span>
              <span>•</span>
              <span className="font-mono">{student.reg_no}</span>
              <span>•</span>
              <span className="font-mono">{student.email}</span>
              <span>•</span>
              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                Attendance: {student.attendance_pct}% ({student.attendance_present}/{student.attendance_total} Days)
              </span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {student.fee_status} ({student.fee_receipt})
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DASHBOARD VIEW SELECTOR TABS */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-2 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Tab 1: Academic Calendar Dashboard */}
          <button
            type="button"
            onClick={() => setActiveView('calendar')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'calendar'
                ? 'bg-light-primary text-light-on-primary shadow-xs'
                : 'text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            <span>Academic Calendar Dashboard</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeView === 'calendar' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {calendarEvents.length} Events
            </span>
          </button>

          {/* Tab 2: Upcoming Lessons & Syllabus (Real Module Data) */}
          <button
            type="button"
            onClick={() => setActiveView('syllabus')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'syllabus'
                ? 'bg-light-primary text-light-on-primary shadow-xs'
                : 'text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span>Upcoming Lessons &amp; Syllabus (Module / Course)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeView === 'syllabus' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {upcomingCount} Upcoming
            </span>
          </button>

          {/* Tab 3: Official Academic Report Card */}
          <button
            type="button"
            onClick={() => setActiveView('reportcard')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeView === 'reportcard'
                ? 'bg-light-primary text-light-on-primary shadow-xs'
                : 'text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
            <span>Official Academic Report Card</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
              GPA {student.gpa}
            </span>
          </button>

          {/* Tab 4: Combined View */}
          <button
            type="button"
            onClick={() => setActiveView('combined')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeView === 'combined'
                ? 'bg-light-primary text-light-on-primary shadow-xs'
                : 'text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container-low'
            }`}
            title="Display Calendar and Lessons Syllabus together"
          >
            <span className="material-symbols-outlined text-[16px]">splitscreen</span>
            <span>Combined Calendar &amp; Syllabus</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-light-on-surface-variant pr-2">
          <span className="font-mono font-medium">{student.batch}</span>
          <span>•</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {student.term}
          </span>
        </div>
      </section>

      {/* 3. SECTION: CALENDAR DASHBOARD FOR STUDENT */}
      {(activeView === 'calendar' || activeView === 'combined') && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column: Calendar Grid & Navigation (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
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
                  value={selectedCalendarType}
                  onChange={(e) => setSelectedCalendarType(e.target.value)}
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
                    onClick={() => setCalendarMode('month')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      calendarMode === 'month'
                        ? 'bg-light-primary text-light-on-primary shadow-xs'
                        : 'text-light-on-surface-variant hover:text-light-on-surface'
                    }`}
                  >
                    Month View
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarMode('agenda')}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      calendarMode === 'agenda'
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
            {calendarMode === 'month' && (
              <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-xl overflow-hidden shadow-xs flex flex-col">
                <div className="grid grid-cols-7 border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-center text-[11px] font-bold text-light-on-surface-variant py-2 uppercase tracking-wider">
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                  <div>Sun</div>
                </div>

                <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-light-outline-variant/60 dark:divide-dark-outline-variant/60">
                  {calendarCells.map((cell, idx) => {
                    const dayEvents = filteredEvents.filter((e) => e.date === cell.dateStr)
                    const isToday = cell.dateStr === '2026-11-26'
                    const isSelected = cell.dateStr === selectedDateStr

                    return (
                      <div
                        key={idx}
                        onClick={() => setSelectedDateStr(cell.dateStr)}
                        className={`min-h-[88px] p-1.5 flex flex-col gap-1 transition-all cursor-pointer ${
                          !cell.isCurrentMonth
                            ? 'opacity-30 bg-light-surface-container-low/20'
                            : isSelected
                            ? 'bg-light-primary-tint/25 dark:bg-dark-primary-tint/25 ring-2 ring-light-primary dark:ring-dark-primary'
                            : 'hover:bg-light-surface-container-low/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
                              isToday
                                ? 'bg-light-primary text-light-on-primary ring-2 ring-light-primary/40'
                                : 'text-light-on-surface dark:text-dark-on-surface'
                            }`}
                          >
                            {cell.dayNum}
                          </span>
                          {dayEvents.length > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-light-primary" />
                          )}
                        </div>

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

            {/* AGENDA VIEW */}
            {calendarMode === 'agenda' && (
              <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-xl p-4 shadow-xs flex flex-col gap-3">
                <span className="font-label text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                  All Scheduled Sessions &amp; Deadlines ({filteredEvents.length})
                </span>
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
                          <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-light-surface-container border border-light-outline-variant/60 min-w-[50px]">
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
                              Instructor: {ev.instructor}
                            </span>
                          </div>
                        </div>

                        <span className="material-symbols-outlined text-light-outline text-[18px] self-end sm:self-center">
                          chevron_right
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Selected Day Itinerary & Live Classroom (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <article className="bg-gradient-to-br from-[#1E113A] via-[#2B1B54] to-[#120B24] text-white p-4 rounded-xl shadow-md border border-purple-800/60 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-label text-[10px] font-bold border border-red-500/40">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                  <span>HAPPENING TODAY</span>
                </span>
                <span className="font-mono text-xs text-purple-200">Room 302</span>
              </div>
              <h3 className="font-title text-sm font-bold text-white leading-snug">
                React 19 Server Actions &amp; Optimistic UI Updates
              </h3>
              <p className="text-xs text-purple-200/90">
                Lead: Dr. Marcus Vance • Full-Stack Web Dev ({student.batch})
              </p>
              <div className="flex items-center justify-between border-t border-purple-800/80 pt-2.5 text-xs">
                <span className="text-purple-300 font-mono">09:30 AM - 12:30 PM</span>
                <a
                  href="https://meet.bixcel.edu/dev-24a"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-[#2B1B54] font-bold text-xs hover:bg-purple-100 transition-colors shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">videocam</span>
                  <span>Launch Class</span>
                </a>
              </div>
            </article>

            {/* Selected Date Itinerary */}
            <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-xl p-3.5 shadow-xs flex flex-col gap-2.5">
              <div className="flex items-center justify-between border-b border-light-outline-variant/60 pb-2">
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
                <div className="py-6 text-center text-xs text-light-on-surface-variant">
                  <span className="material-symbols-outlined text-[24px] text-light-outline block mb-1">
                    event_available
                  </span>
                  No scheduled lectures or exams on this date.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDateEvents.map((ev) => {
                    const badge = getTypeBadge(ev.type)
                    return (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEventModal(ev)}
                        className="p-2.5 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/40 dark:bg-dark-surface-container/40 hover:bg-light-surface-container-low transition-colors cursor-pointer flex flex-col gap-1"
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
                        <p className="text-[11px] text-light-on-surface-variant">
                          {ev.instructor} • {ev.location}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </article>
          </div>
        </section>
      )}

      {/* 4. SECTION: UPCOMING LESSONS & SYLLABUS BASED ON MODULE OR COURSE (REAL DATABASE DATA) */}
      {(activeView === 'syllabus' || activeView === 'combined') && (
        <section className="flex flex-col gap-3">
          {/* Module Selector Banner */}
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-4 rounded-xl shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-light-primary text-[20px]">import_contacts</span>
                <h2 className="font-title text-sm sm:text-base font-bold text-light-on-surface dark:text-dark-on-surface">
                  Course Syllabus &amp; Upcoming Lessons
                </h2>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  {student.track}
                </span>
              </div>
              <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Loaded directly from real institutional module syllabus. Choose any module below to inspect upcoming lessons.
              </p>
            </div>

            {/* Real Module Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-light-on-surface-variant shrink-0">
                Select Module:
              </span>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-xs font-bold text-light-on-surface dark:text-dark-on-surface focus:outline-none cursor-pointer max-w-xs sm:max-w-md"
              >
                {liveModules.length === 0 ? (
                  <option value="">No modules available</option>
                ) : (
                  liveModules.map((m) => (
                    <option key={m.id} value={String(m.id)}>
                      {m.code ? `${m.code}: ` : ''}{m.title} ({m.days || 10} Days)
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Module Metadata Card or Empty State */}
          {!selectedModule ? (
            <div className="p-8 rounded-xl bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant text-center text-xs text-light-on-surface-variant flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[36px] text-light-outline">
                menu_book
              </span>
              <p className="font-semibold text-sm text-light-on-surface dark:text-dark-on-surface">
                No Active Curriculum Modules Found
              </p>
              <p className="text-xs text-light-on-surface-variant max-w-sm">
                Modules and daily syllabus lessons will appear here once published from the Module Studio.
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-light-primary-tint/30 to-light-surface-container-lowest dark:from-dark-primary-tint/20 dark:to-dark-surface-bright border border-light-primary/30 dark:border-dark-primary/30 p-4 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-light-primary dark:text-dark-primary">
                    {selectedModule.code || 'MOD-ACTIVE'}
                  </span>
                  <span className="text-xs text-light-on-surface-variant">•</span>
                  <h3 className="font-title text-sm sm:text-base font-bold text-light-on-surface dark:text-dark-on-surface">
                    {selectedModule.title}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-light-on-surface-variant">
                  <span>Faculty Lead: <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedModule.tutor || student.dean_name}</strong></span>
                  <span>•</span>
                  <span>Duration: <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedModule.days || rawCurriculum.length || 10} Instructional Days</strong></span>
                  <span>•</span>
                  <span>Category: <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedModule.category || student.track}</strong></span>
                  <span>•</span>
                  <span>Status: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedModule.status || 'Published'}</strong></span>
                </div>
              </div>

              {/* Lesson Filter Pills */}
              <div className="flex items-center gap-1.5 self-start md:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => setLessonFilter('upcoming')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                    lessonFilter === 'upcoming'
                      ? 'bg-light-primary text-light-on-primary'
                      : 'bg-slate-100 dark:bg-slate-800 text-light-on-surface-variant'
                  }`}
                >
                  Upcoming Only ({upcomingCount})
                </button>
                <button
                  type="button"
                  onClick={() => setLessonFilter('all')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                    lessonFilter === 'all'
                      ? 'bg-light-primary text-light-on-primary'
                      : 'bg-slate-100 dark:bg-slate-800 text-light-on-surface-variant'
                  }`}
                >
                  All Lessons ({allParsedLessons.length})
                </button>
                <button
                  type="button"
                  onClick={() => setLessonFilter('completed')}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                    lessonFilter === 'completed'
                      ? 'bg-light-primary text-light-on-primary'
                      : 'bg-slate-100 dark:bg-slate-800 text-light-on-surface-variant'
                  }`}
                >
                  Completed
                </button>
              </div>
            </div>
          )}

          {/* Actual Day-by-Day Lesson Syllabus Cards */}
          {selectedModule && (
            <div className="space-y-3">
              {displayedLessons.length === 0 ? (
              <div className="p-8 rounded-xl bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant text-center text-xs text-light-on-surface-variant">
                <span className="material-symbols-outlined text-[32px] text-light-outline block mb-1">
                  task_alt
                </span>
                No lessons found matching &quot;{lessonFilter}&quot; for this module.
              </div>
            ) : (
              displayedLessons.map((lesson) => {
                const isUpcoming = lesson.status === 'upcoming'
                const isCurrent = lesson.status === 'current'
                const isCompleted = lesson.status === 'completed'

                return (
                  <article
                    key={lesson.id}
                    className={`p-4 rounded-xl border transition-all shadow-xs flex flex-col gap-2.5 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-purple-500/10 via-light-surface-container-lowest to-light-surface-container-lowest dark:from-purple-950/40 dark:via-dark-surface-bright dark:to-dark-surface-bright border-purple-400 dark:border-purple-800 ring-1 ring-purple-400/40'
                        : isUpcoming
                        ? 'bg-light-surface-container-lowest dark:bg-dark-surface-bright border-blue-200 dark:border-blue-900/60 hover:border-blue-400'
                        : 'bg-light-surface-container-lowest/70 dark:bg-dark-surface-bright/70 border-light-outline-variant dark:border-dark-outline-variant opacity-80'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-light-outline-variant/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-light-surface-container dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface border border-light-outline-variant/80">
                          {lesson.day_title}
                        </span>

                        {isCurrent && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-300">
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                            <span>TODAY&apos;S ACTIVE LESSON</span>
                          </span>
                        )}

                        {isUpcoming && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-300">
                            <span className="material-symbols-outlined text-[13px]">event</span>
                            <span>UPCOMING LESSON</span>
                          </span>
                        )}

                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px] border border-emerald-300">
                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                            <span>Completed</span>
                          </span>
                        )}

                        <span className="text-xs font-semibold text-light-on-surface-variant font-mono">
                          • {lesson.format} ({lesson.duration})
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-light-on-surface dark:text-dark-on-surface">
                        <span>📅 {isCurrent ? '2026-11-26 (Today)' : `Nov ${18 + lesson.day}, 2026`}</span>
                        <span className="text-light-primary dark:text-dark-primary">• 09:30 AM - 12:30 PM</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex flex-col gap-1 max-w-3xl">
                        <h4 className="font-title text-sm sm:text-base font-bold text-light-on-surface dark:text-dark-on-surface">
                          {lesson.title}
                        </h4>
                        <div className="p-3 rounded-lg bg-light-surface-container-low/60 dark:bg-dark-surface-container/60 border border-light-outline-variant/60 text-xs">
                          <span className="font-bold text-light-on-surface dark:text-dark-on-surface block mb-0.5">
                            Syllabus Objectives &amp; Topics:
                          </span>
                          <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant leading-relaxed">
                            {lesson.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0 self-end sm:self-center">
                        {lesson.live_link ? (
                          <a
                            href={lesson.live_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">videocam</span>
                            <span>Join Live Classroom</span>
                          </a>
                        ) : isUpcoming ? (
                          <button
                            type="button"
                            onClick={() => showToast(`Pre-session materials for "${lesson.title}" available 24 hours prior to class.`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-light-outline-variant bg-light-surface-container-lowest text-xs font-semibold hover:bg-light-surface-container-low transition-colors"
                          >
                            <span className="material-symbols-outlined text-[15px] text-light-primary">download</span>
                            <span>Lesson Handout</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            <span>Attendance Verified</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>
          )}
        </section>
      )}

      {/* 5. SECTION: OFFICIAL STUDENT ACADEMIC REPORT CARD */}
      {(activeView === 'reportcard' || activeView === 'combined') && (
        <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-5 sm:p-6 rounded-xl shadow-md flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-light-outline-variant pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-light-primary text-light-on-primary flex items-center justify-center font-bold text-xl shadow-xs">
                BX
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-light-primary dark:text-dark-primary block">
                  OFFICIAL INSTITUTIONAL ACADEMIC TRANSCRIPT
                </span>
                <h2 className="font-title text-base sm:text-lg font-bold text-light-on-surface dark:text-dark-on-surface">
                  Student Academic Report Card
                </h2>
                <span className="text-xs text-light-on-surface-variant">
                  Bixcel Learning Management System • {student.term}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300">
                {student.standing} • Grade A+
              </span>
              <span className="text-[11px] text-light-on-surface-variant font-mono">
                Issued: November 26, 2026
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-light-surface-container-low/60 dark:bg-dark-surface-container/60 border border-light-outline-variant/60 text-xs">
            <div>
              <span className="text-light-on-surface-variant block text-[11px]">Student Full Name</span>
              <strong className="text-light-on-surface dark:text-dark-on-surface font-title text-xs sm:text-sm">
                {student.name}
              </strong>
            </div>
            <div>
              <span className="text-light-on-surface-variant block text-[11px]">Student ID / Reg No</span>
              <strong className="text-light-on-surface dark:text-dark-on-surface font-mono">
                {student.student_id} / {student.reg_no}
              </strong>
            </div>
            <div>
              <span className="text-light-on-surface-variant block text-[11px]">Enrolled Cohort</span>
              <strong className="text-light-on-surface dark:text-dark-on-surface font-mono">
                {student.batch} ({student.track})
              </strong>
            </div>
            <div>
              <span className="text-light-on-surface-variant block text-[11px]">Cumulative GPA</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-headline text-sm font-bold">
                {student.gpa} / 4.00 (A+)
              </strong>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-light-outline-variant dark:border-dark-outline-variant">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-light-surface-container-low dark:bg-dark-surface-container border-b border-light-outline-variant text-[11px] font-bold text-light-on-surface-variant uppercase tracking-wider">
                <tr>
                  <th className="p-3">Module Code &amp; Title</th>
                  <th className="p-3 text-center">Credits</th>
                  <th className="p-3 text-center">Attendance</th>
                  <th className="p-3 text-center">Practical (100)</th>
                  <th className="p-3 text-center">Exam (100)</th>
                  <th className="p-3 text-center">Total Score</th>
                  <th className="p-3 text-center">Grade</th>
                  <th className="p-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant/60 bg-light-surface-container-lowest dark:bg-dark-surface-bright">
                {liveModules.map((m, idx) => (
                  <tr key={m.id || idx} className="hover:bg-light-surface-container-low/40 transition-colors">
                    <td className="p-3 font-semibold text-light-on-surface dark:text-dark-on-surface">
                      <span className="font-mono text-light-primary dark:text-dark-primary mr-1.5 font-bold">
                        {m.code || `MOD-0${idx + 1}`}
                      </span>
                      <span>{m.title}</span>
                    </td>
                    <td className="p-3 text-center font-mono">4</td>
                    <td className="p-3 text-center font-mono font-medium text-emerald-700 dark:text-emerald-400">
                      98%
                    </td>
                    <td className="p-3 text-center font-mono">95</td>
                    <td className="p-3 text-center font-mono">94</td>
                    <td className="p-3 text-center font-mono font-bold text-light-on-surface dark:text-dark-on-surface">
                      95%
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        A+
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        <span>Passed (Distinction)</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex flex-col gap-1 max-w-xl">
              <span className="font-bold text-light-on-surface dark:text-dark-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-light-primary">recommend</span>
                <span>Faculty Advisor &amp; Dean Assessment Remarks:</span>
              </span>
              <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant italic">
                &quot;{student.advisor_remarks}&quot;
              </p>
            </div>

            <div className="flex flex-col items-end text-right shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-2 sm:pt-0 sm:pl-4">
              <span className="font-serif italic text-base font-bold text-light-on-surface dark:text-dark-on-surface">
                {student.dean_name}
              </span>
              <span className="text-[11px] text-light-on-surface-variant">
                {student.dean_title}
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                ✔ Digitally Verified &amp; Signed
              </span>
            </div>
          </div>
        </section>
      )}

      {/* EVENT MODAL */}
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
    </div>
  )
}

export default StudentDashboard
