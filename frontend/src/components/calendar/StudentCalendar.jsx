import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

// Fallback initial calendar events
const DEFAULT_EVENTS = []

const STUDENT_PERSONAS = [
  { id: 'dev', name: 'Kevin Chen', track: 'Full-Stack Web Development', batch: 'BIX-DEV-24A', attendance: '96.4%' },
  { id: 'mkt', name: 'Marcus Vance', track: 'Digital Marketing', batch: 'BIX-MKT-26B', attendance: '98.0%' },
  { id: 'ux', name: 'Alena Rostova', track: 'UI/UX Product Design', batch: 'BIX-UX-26D', attendance: '97.2%' },
  { id: 'all', name: 'Institution Timetable (All Cohorts)', track: 'All Tracks', batch: 'All', attendance: '94.8%' },
]

export function StudentCalendar() {
  const [events, setEvents] = useState([])
  const [activePersona, setActivePersona] = useState(STUDENT_PERSONAS[0])
  const [activeView, setActiveView] = useState('month') // 'month' | 'agenda' | 'week'
  const [selectedType, setSelectedType] = useState('All')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [toast, setToast] = useState('')

  // Calendar Date State: current viewed year and month (0-indexed: 10 = Nov, 11 = Dec)
  const [viewDate, setViewDate] = useState({ year: 2026, month: 10 }) // Nov 2026
  const [selectedDateStr, setSelectedDateStr] = useState('2026-11-26')

  // Form state for creating custom event
  const [newEventForm, setNewEventForm] = useState({
    title: '',
    type: 'lecture',
    date: '2026-11-26',
    start_time: '10:00',
    end_time: '11:30',
    location: 'Online Study Room',
    instructor: 'Self / Study Group',
    description: '',
  })

  // Fetch events from backend
  useEffect(() => {
    let isMounted = true
    const fetchEvents = async () => {
      try {
        const res = await apiService.getCalendarEvents()
        if (res && res.data && Array.isArray(res.data) && isMounted) {
          setEvents(res.data)
        }
      } catch (err) {
        console.warn('Using local calendar events:', err)
      }
    }
    fetchEvents()
    return () => { isMounted = false }
  }, [])

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

  // Month metadata
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  const currentMonthName = `${monthNames[viewDate.month]} ${viewDate.year}`

  // Days in current month
  const firstDayOfWeek = new Date(viewDate.year, viewDate.month, 1).getDay() // 0 = Sun
  const daysInMonth = new Date(viewDate.year, viewDate.month + 1, 0).getDate()

  // Generate calendar grid cells (Monday-aligned: 0 = Mon, 6 = Sun)
  const mondayOffset = (firstDayOfWeek + 6) % 7
  const calendarCells = []

  // Pre-padding from prev month
  const prevMonthTotalDays = new Date(viewDate.year, viewDate.month, 0).getDate()
  for (let i = mondayOffset - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i
    const prevMonthIdx = viewDate.month === 0 ? 11 : viewDate.month - 1
    const prevYear = viewDate.month === 0 ? viewDate.year - 1 : viewDate.year
    const dateStr = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
    calendarCells.push({ dayNum, dateStr, isCurrentMonth: false })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${viewDate.year}-${String(viewDate.month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    calendarCells.push({ dayNum: d, dateStr, isCurrentMonth: true })
  }

  // Post-padding to complete 35 or 42 cells grid
  const remaining = (7 - (calendarCells.length % 7)) % 7
  for (let r = 1; r <= remaining; r++) {
    const nextMonthIdx = viewDate.month === 11 ? 0 : viewDate.month + 1
    const nextYear = viewDate.month === 11 ? viewDate.year + 1 : viewDate.year
    const dateStr = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(r).padStart(2, '0')}`
    calendarCells.push({ dayNum: r, dateStr, isCurrentMonth: false })
  }

  // Filter events based on persona & category
  const filteredEvents = events.filter((e) => {
    const matchPersona =
      activePersona.batch === 'All' ||
      e.batch === activePersona.batch ||
      e.batch === 'All Cohorts' ||
      e.track === activePersona.track ||
      e.track === 'All Tracks'

    const matchType = selectedType === 'All' || e.type === selectedType
    return matchPersona && matchType
  })

  // Selected date events
  const selectedDateEvents = filteredEvents.filter((e) => e.date === selectedDateStr)

  // Type badge styling helper
  const getTypeBadge = (type) => {
    switch (type) {
      case 'lecture':
        return { label: 'Live Class', bg: 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' }
      case 'lab':
        return { label: 'Practical Lab', bg: 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' }
      case 'assignment':
        return { label: 'Assignment Due', bg: 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' }
      case 'exam':
        return { label: 'Assessment / Quiz', bg: 'bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800' }
      case 'milestone':
        return { label: 'Milestone Review', bg: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' }
      case 'holiday':
        return { label: 'Campus Event', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' }
      default:
        return { label: 'Class', bg: 'bg-slate-100 text-slate-700' }
    }
  }

  // Handle Create Custom Event
  const handleCreateEvent = async (e) => {
    e.preventDefault()
    if (!newEventForm.title.trim()) return

    const newObj = {
      id: Date.now(),
      ...newEventForm,
      track: activePersona.track,
      batch: activePersona.batch,
      status: 'Scheduled',
      link: '#',
      materials: '',
    }

    try {
      await apiService.createCalendarEvent(newObj)
    } catch (err) {
      console.warn('API event create failed:', err)
    }

    setEvents((prev) => [newObj, ...prev])
    setToast(`Event "${newObj.title}" added to your student calendar.`)
    setShowAddModal(false)
    setNewEventForm({
      title: '',
      type: 'lecture',
      date: selectedDateStr,
      start_time: '10:00',
      end_time: '11:30',
      location: 'Online Study Room',
      instructor: 'Self / Study Group',
      description: '',
    })
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Toast Notification */}
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

      {/* Screen Header: Student Persona, Environment Status & Controls */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-3.5 rounded-md shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="material-symbols-outlined text-light-primary text-[20px]">calendar_month</span>
            <h1 className="font-title text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface">
              Student Environment &amp; Academic Calendar
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint font-mono text-[10px] font-bold">
              {activePersona.batch}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-container text-on-success-container text-[10px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span>Next: React 19 Actions (09:30)</span>
            </span>
          </div>
          <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Live interactive timetable, instructional class links, lab sessions, and competency deadlines.
          </p>
        </div>

        {/* Persona Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-light-surface-container-low dark:bg-dark-surface-container px-2 py-1 rounded border border-light-outline-variant dark:border-dark-outline-variant">
            <span className="material-symbols-outlined text-[16px] text-light-outline">account_circle</span>
            <select
              value={activePersona.id}
              onChange={(e) => {
                const found = STUDENT_PERSONAS.find((p) => p.id === e.target.value)
                if (found) setActivePersona(found)
              }}
              className="bg-transparent text-xs font-semibold text-light-on-surface dark:text-dark-on-surface focus:outline-none cursor-pointer"
            >
              {STUDENT_PERSONAS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.batch})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              setToast('Subscribed to iCal / Google Calendar feed!')
              setTimeout(() => setToast(''), 3000)
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant text-xs font-semibold text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">sync</span>
            <span>Sync Feed</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-light-primary text-light-on-primary font-semibold text-xs hover:bg-light-primary-container shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            <span>Schedule Session</span>
          </button>
        </div>
      </section>

      {/* 4 Compact KPIs Banner */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Enrolled Track</span>
            <span className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface truncate block max-w-[150px]">
              {activePersona.track}
            </span>
          </div>
          <span className="w-7 h-7 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">school</span>
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Today's Sessions</span>
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-[18px] font-bold text-light-primary tabular-nums">
                {events.filter((e) => e.date === '2026-11-26').length}
              </span>
              <span className="text-[10px] text-on-success-container bg-success-container px-1 py-0.2 rounded font-semibold">
                1 Live Now
              </span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-light-primary-tint text-light-primary inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">video_camera_front</span>
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Term Attendance</span>
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-[18px] font-bold text-success tabular-nums">
                {activePersona.attendance}
              </span>
              <span className="text-[10px] text-light-on-surface-variant">Optimal</span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-success-container text-on-success-container inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">verified</span>
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Pending Assignment</span>
            <div className="flex items-center gap-1.5">
              <span className="font-title text-xs font-bold text-amber-700 dark:text-amber-400 truncate max-w-[140px]">
                API Handoff (Nov 27)
              </span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-pending-container text-on-pending-container inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">assignment</span>
          </span>
        </article>
      </section>

      {/* Main Grid: 2 Columns (Calendar 8 cols, Today's Live Agenda 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        {/* Left Column: Calendar Grid & Controls (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Calendar Navigation & Filters Strip */}
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2">
            {/* Month & Prev/Next */}
            <div className="flex items-center gap-2">
              <h2 className="font-title text-sm font-bold text-light-on-surface dark:text-dark-on-surface min-w-[130px]">
                {currentMonthName}
              </h2>
              <div className="flex items-center p-0.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container transition-colors"
                  title="Previous Month"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={handleToday}
                  className="px-2 py-0.5 text-[11px] font-semibold text-light-on-surface hover:bg-light-surface-container transition-colors"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container transition-colors"
                  title="Next Month"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Type Filter & View Switcher */}
            <div className="flex flex-wrap items-center gap-1.5">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
              >
                <option value="All">All Event Types</option>
                <option value="lecture">Live Classes</option>
                <option value="lab">Practical Labs</option>
                <option value="assignment">Assignments Due</option>
                <option value="exam">Quizzes &amp; Tests</option>
                <option value="milestone">Milestones</option>
                <option value="holiday">Campus Events</option>
              </select>

              <div className="flex items-center p-0.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container">
                <button
                  type="button"
                  onClick={() => setActiveView('month')}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                    activeView === 'month'
                      ? 'bg-light-primary text-light-on-primary shadow-xs'
                      : 'text-light-on-surface-variant hover:text-light-on-surface'
                  }`}
                >
                  Month
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView('agenda')}
                  className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                    activeView === 'agenda'
                      ? 'bg-light-primary text-light-on-primary shadow-xs'
                      : 'text-light-on-surface-variant hover:text-light-on-surface'
                  }`}
                >
                  Agenda
                </button>
              </div>
            </div>
          </div>

          {/* MONTH VIEW: 7-DAY CALENDAR GRID */}
          {activeView === 'month' && (
            <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded overflow-hidden shadow-xs flex flex-col">
              {/* Day Headers (Mon - Sun) */}
              <div className="grid grid-cols-7 border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-center text-[11px] font-bold text-light-on-surface-variant py-1.5 uppercase tracking-wider">
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
                      className={`min-h-[85px] p-1.5 flex flex-col gap-1 transition-colors cursor-pointer ${
                        !cell.isCurrentMonth
                          ? 'opacity-35 bg-light-surface-container-low/30'
                          : isSelected
                          ? 'bg-light-primary-tint/25 dark:bg-dark-primary-tint/25 ring-1 ring-light-primary inset-0'
                          : 'hover:bg-light-surface-container-low/60'
                      }`}
                    >
                      {/* Day Number Header */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[11px] font-bold ${
                            isToday
                              ? 'bg-light-primary text-light-on-primary'
                              : 'text-light-on-surface dark:text-dark-on-surface'
                          }`}
                        >
                          {cell.dayNum}
                        </span>

                        {dayEvents.length > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-light-primary" />
                        )}
                      </div>

                      {/* Event Badges list */}
                      <div className="flex flex-col gap-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => {
                          const badge = getTypeBadge(ev.type)
                          return (
                            <button
                              key={ev.id}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedEvent(ev)
                              }}
                              className={`text-left px-1 py-0.5 rounded border text-[10px] font-semibold truncate transition-transform hover:scale-[1.02] ${badge.bg}`}
                              title={`${ev.start_time} - ${ev.title}`}
                            >
                              <span className="font-mono text-[9px] mr-1 opacity-80">{ev.start_time}</span>
                              <span>{ev.title}</span>
                            </button>
                          )
                        })}

                        {dayEvents.length > 2 && (
                          <span className="text-[9px] font-semibold text-light-on-surface-variant pl-0.5">
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

          {/* AGENDA VIEW: CHRONOLOGICAL LIST */}
          {activeView === 'agenda' && (
            <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-3 shadow-xs flex flex-col gap-2.5">
              <span className="font-label text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                Scheduled Academic Timeline ({filteredEvents.length} Events)
              </span>

              <div className="space-y-2">
                {filteredEvents.map((ev) => {
                  const badge = getTypeBadge(ev.type)
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="p-2.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/40 dark:bg-dark-surface-container/40 hover:bg-light-surface-container-low transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="flex flex-col items-center justify-center p-1.5 rounded bg-light-surface-container border border-light-outline-variant/60 min-w-[50px]">
                          <span className="font-mono text-[10px] text-light-on-surface-variant uppercase">
                            {new Date(ev.date).toLocaleDateString('en-US', { weekday: 'short' })}
                          </span>
                          <span className="font-headline text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                            {ev.date.slice(-2)}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-1.5 py-0.2 rounded border text-[10px] font-bold ${badge.bg}`}>
                              {badge.label}
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-light-primary">
                              {ev.start_time} - {ev.end_time}
                            </span>
                            <span className="text-[11px] text-light-on-surface-variant font-mono">
                              • {ev.batch}
                            </span>
                          </div>
                          <h4 className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface mt-0.5">
                            {ev.title}
                          </h4>
                          <span className="text-[11px] text-light-on-surface-variant">
                            Instructor: {ev.instructor} • {ev.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {ev.link && ev.link !== '#' && (
                          <a
                            href={ev.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-light-primary text-light-on-primary text-[11px] font-semibold hover:bg-light-primary-container"
                          >
                            <span className="material-symbols-outlined text-[13px]">videocam</span>
                            <span>Join</span>
                          </a>
                        )}
                        <span className="material-symbols-outlined text-light-outline text-[16px]">chevron_right</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Today's Live Dashboard & Selected Date Agenda (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Active Live Class Card */}
          <article className="bg-gradient-to-br from-[#2B1B54] to-[#1E113A] text-white p-3.5 rounded-md shadow-xs flex flex-col gap-2.5 border border-purple-900/60">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-label text-[10px] font-bold border border-red-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                <span>LIVE CLASSROOM</span>
              </span>
              <span className="font-mono text-[11px] text-purple-200">Room 302</span>
            </div>

            <div>
              <h3 className="font-title text-xs font-bold text-white leading-snug">
                React &amp; Next.js Architecture: Server Components
              </h3>
              <p className="text-[11px] text-purple-200/90 mt-0.5">
                Instructor: Dr. Aris Thorne • Full-Stack Web Dev (BIX-DEV-24A)
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-purple-800/80 pt-2 text-[11px]">
              <span className="text-purple-300">09:30 - 11:30 AM</span>
              <a
                href="https://meet.bixcel.edu/dev-24a"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1 rounded bg-white text-[#2B1B54] font-bold text-xs hover:bg-purple-100 transition-colors shadow-xs"
              >
                <span className="material-symbols-outlined text-[15px]">videocam</span>
                <span>Launch Classroom</span>
              </a>
            </div>
          </article>

          {/* Agenda for Selected Date */}
          <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3 shadow-xs flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-light-primary text-[17px]">event</span>
                <h3 className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                  Agenda: {selectedDateStr}
                </h3>
              </div>
              <span className="text-[11px] text-light-on-surface-variant font-medium">
                {selectedDateEvents.length} session(s)
              </span>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="py-8 text-center text-light-on-surface-variant">
                <span className="material-symbols-outlined text-[28px] opacity-40 block mb-1">free_cancellation</span>
                <p className="text-xs font-semibold">No scheduled events for this date</p>
                <p className="text-[11px] opacity-80 mt-0.5">Select another date or click "Schedule Session"</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDateEvents.map((ev) => {
                  const badge = getTypeBadge(ev.type)
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvent(ev)}
                      className="p-2.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/50 dark:bg-dark-surface-container/50 hover:border-light-primary transition-colors cursor-pointer flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className={`px-1.5 py-0.2 rounded border text-[10px] font-bold ${badge.bg}`}>
                          {badge.label}
                        </span>
                        <span className="font-mono text-[10px] font-semibold text-light-on-surface-variant">
                          {ev.start_time} - {ev.end_time}
                        </span>
                      </div>

                      <h4 className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface mt-0.5">
                        {ev.title}
                      </h4>

                      <span className="text-[11px] text-light-on-surface-variant">
                        {ev.location} • {ev.instructor}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </article>

          {/* Quick Academic Progress & Resources Widget */}
          <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3 shadow-xs flex flex-col gap-2">
            <span className="font-label text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
              Upcoming Academic Deadlines
            </span>

            <ul className="space-y-1.5 text-xs divide-y divide-light-outline-variant/60">
              <li className="pt-1.5 flex items-start justify-between gap-2">
                <div>
                  <span className="font-semibold text-light-on-surface dark:text-dark-on-surface block">
                    E-Commerce REST API
                  </span>
                  <span className="text-[10px] text-light-on-surface-variant">Project 3 Submission</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold whitespace-nowrap">
                  Tomorrow 23:59
                </span>
              </li>

              <li className="pt-1.5 flex items-start justify-between gap-2">
                <div>
                  <span className="font-semibold text-light-on-surface dark:text-dark-on-surface block">
                    Hypothesis Testing Quiz
                  </span>
                  <span className="text-[10px] text-light-on-surface-variant">Proctored Assessment</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold whitespace-nowrap">
                  Nov 29, 15:00
                </span>
              </li>

              <li className="pt-1.5 flex items-start justify-between gap-2">
                <div>
                  <span className="font-semibold text-light-on-surface dark:text-dark-on-surface block">
                    Cloud Architecture Defense
                  </span>
                  <span className="text-[10px] text-light-on-surface-variant">Milestone 2 Verification</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold whitespace-nowrap">
                  Nov 30, 14:00
                </span>
              </li>
            </ul>
          </article>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: EVENT DETAILS & VIRTUAL CLASSROOM LAUNCHER                   */}
      {/* ===================================================================== */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-lg p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2">
              <div>
                <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getTypeBadge(selectedEvent.type).bg}`}>
                  {getTypeBadge(selectedEvent.type).label}
                </span>
                <h3 className="font-title text-sm font-bold text-light-on-surface dark:text-dark-on-surface mt-1">
                  {selectedEvent.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Details Grid */}
            <div className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2 p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container">
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block">Session Timing:</span>
                  <strong className="text-light-on-surface dark:text-dark-on-surface font-mono">
                    {selectedEvent.date} ({selectedEvent.start_time} - {selectedEvent.end_time})
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block">Classroom / Location:</span>
                  <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedEvent.location}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block">Course Track:</span>
                  <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedEvent.track}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block">Assigned Batch:</span>
                  <strong className="font-mono text-light-primary">{selectedEvent.batch}</strong>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-light-on-surface-variant block mb-0.5">Instructor / Lead:</span>
                <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedEvent.instructor}</strong>
              </div>

              {selectedEvent.description && (
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block mb-0.5">Syllabus &amp; Focus:</span>
                  <p className="text-[11px] text-light-on-surface dark:text-dark-on-surface leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>
              )}

              {selectedEvent.materials && (
                <div className="p-2 rounded border border-light-outline-variant/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-light-primary text-[16px]">attach_file</span>
                    <span className="text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface">
                      {selectedEvent.materials}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Downloading study materials: ${selectedEvent.materials}`)}
                    className="px-2 py-0.5 rounded bg-light-surface-container-low text-[10px] font-bold hover:bg-light-surface-container"
                  >
                    Download
                  </button>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between border-t border-light-outline-variant dark:border-dark-outline-variant pt-2.5 mt-1">
              <span className="text-[11px] text-light-on-surface-variant">
                Status: <strong className="text-light-primary font-semibold">{selectedEvent.status}</strong>
              </span>

              <div className="flex items-center gap-2">
                {selectedEvent.link && selectedEvent.link !== '#' && (
                  <a
                    href={selectedEvent.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-1 rounded bg-light-primary text-light-on-primary font-semibold text-xs hover:bg-light-primary-container"
                  >
                    <span className="material-symbols-outlined text-[15px]">videocam</span>
                    <span>Launch Virtual Class</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  className="px-3 py-1 rounded border border-light-outline-variant text-xs hover:bg-light-surface-container-low"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: SCHEDULE CUSTOM STUDY SESSION                                */}
      {/* ===================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-md p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2">
              <h3 className="font-title text-sm font-bold text-light-on-surface dark:text-dark-on-surface">
                Schedule Custom Study Session / Task
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={newEventForm.title}
                  onChange={(e) => setNewEventForm({ ...newEventForm, title: e.target.value })}
                  placeholder="e.g. Peer Code Review & React Hook Debugging"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Category
                  </label>
                  <select
                    value={newEventForm.type}
                    onChange={(e) => setNewEventForm({ ...newEventForm, type: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="lecture">Study Session / Lecture</option>
                    <option value="lab">Practical Code Lab</option>
                    <option value="assignment">Assignment Work</option>
                    <option value="exam">Self Assessment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newEventForm.date}
                    onChange={(e) => setNewEventForm({ ...newEventForm, date: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newEventForm.start_time}
                    onChange={(e) => setNewEventForm({ ...newEventForm, start_time: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newEventForm.end_time}
                    onChange={(e) => setNewEventForm({ ...newEventForm, end_time: e.target.value })}
                    className="w-full px-2 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                  Location / Platform
                </label>
                <input
                  type="text"
                  value={newEventForm.location}
                  onChange={(e) => setNewEventForm({ ...newEventForm, location: e.target.value })}
                  placeholder="Library Pod / Google Meet"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                  Session Notes / Agenda
                </label>
                <textarea
                  rows={2}
                  value={newEventForm.description}
                  onChange={(e) => setNewEventForm({ ...newEventForm, description: e.target.value })}
                  placeholder="Topics to study or project deliverables to complete..."
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-light-outline-variant dark:border-dark-outline-variant pt-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1 rounded border border-light-outline-variant text-xs hover:bg-light-surface-container-low"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-light-primary text-light-on-primary font-semibold text-xs hover:bg-light-primary-container"
                >
                  Add to Calendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentCalendar
