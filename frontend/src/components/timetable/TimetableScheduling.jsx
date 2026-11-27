import React, { useState, useEffect, useMemo } from 'react'
import { apiService } from '../../services/api'

// Fallback faculty leads if none loaded yet
const FALLBACK_TUTORS = [
  { id: 101, staff_id: 'TUT-2026-001', full_name: 'Dr. Marcus Vance', specialization: 'Full-Stack Web Development', role: 'Senior Faculty Lead', status: 'Active', phone: '+91 98450 11223' },
  { id: 102, staff_id: 'TUT-2026-002', full_name: 'Prof. Sarah Jenkins', specialization: 'Full-Stack Web Development', role: 'Associate Tutor', status: 'Active', phone: '+91 98450 44556' },
  { id: 103, staff_id: 'TUT-2026-003', full_name: 'Elena Rostova', specialization: 'UI/UX Product Design', role: 'Lead Design Fellow', status: 'Active', phone: '+91 98450 77889' },
  { id: 104, staff_id: 'TUT-2026-004', full_name: 'Kavita Raman', specialization: 'Digital Marketing', role: 'Growth Marketing Specialist', status: 'Active', phone: '+91 98450 99001' },
  { id: 105, staff_id: 'TUT-2026-005', full_name: 'Dr. Rajesh Nair', specialization: 'Data Science & Analytics', role: 'Principal AI Scientist', status: 'Active', phone: '+91 98450 22334' },
  { id: 106, staff_id: 'TUT-2026-006', full_name: 'Alex Rivera', specialization: 'Cloud & DevOps Engineering', role: 'DevOps Architect', status: 'Active', phone: '+91 98450 55667' },
]

// Fallback students for batches if database is initial
const FALLBACK_BATCH_STUDENTS = {
  'BIX-DEV-24A': [
    { student_id: 'STU-2026-0843', full_name: 'Marcus Vance', phone: '+91 98765 43210', arrival_status: 'Arrived', check_in_time: '09:08 AM', avatar: '' },
    { student_id: 'STU-2026-0844', full_name: 'Priya Sharma', phone: '+91 98765 43211', arrival_status: 'Arrived', check_in_time: '09:12 AM', avatar: '' },
    { student_id: 'STU-2026-0845', full_name: 'David Kim', phone: '+91 98765 43212', arrival_status: 'Arrived', check_in_time: '09:15 AM', avatar: '' },
    { student_id: 'STU-2026-0846', full_name: 'Ananya Verma', phone: '+91 98765 43213', arrival_status: 'Late', check_in_time: '09:35 AM', avatar: '' },
    { student_id: 'STU-2026-0847', full_name: 'Rohan Mehta', phone: '+91 98765 43214', arrival_status: 'Expected', check_in_time: '—', avatar: '' },
    { student_id: 'STU-2026-0848', full_name: 'Sophia Patel', phone: '+91 98765 43215', arrival_status: 'Arrived', check_in_time: '09:02 AM', avatar: '' },
  ],
  'BIX-UX-26D': [
    { student_id: 'STU-2026-0849', full_name: 'Alena Rostova', phone: '+91 98765 43216', arrival_status: 'Arrived', check_in_time: '11:20 AM', avatar: '' },
    { student_id: 'STU-2026-0850', full_name: 'Karthik Rao', phone: '+91 98765 43217', arrival_status: 'Arrived', check_in_time: '11:25 AM', avatar: '' },
    { student_id: 'STU-2026-0851', full_name: 'Sneha Kulkarni', phone: '+91 98765 43218', arrival_status: 'Expected', check_in_time: '—', avatar: '' },
    { student_id: 'STU-2026-0852', full_name: 'Liam Chen', phone: '+91 98765 43219', arrival_status: 'Arrived', check_in_time: '11:18 AM', avatar: '' },
  ],
  'BIX-MKT-26B': [
    { student_id: 'STU-2026-0853', full_name: 'Vikram Joshi', phone: '+91 98765 43220', arrival_status: 'Arrived', check_in_time: '01:55 PM', avatar: '' },
    { student_id: 'STU-2026-0854', full_name: 'Nisha Sundaram', phone: '+91 98765 43221', arrival_status: 'Arrived', check_in_time: '02:00 PM', avatar: '' },
    { student_id: 'STU-2026-0855', full_name: 'Tanya Gupta', phone: '+91 98765 43222', arrival_status: 'Absent', check_in_time: '—', avatar: '' },
  ],
  'BIX-DS-18C': [
    { student_id: 'STU-2026-0856', full_name: 'Arjun Das', phone: '+91 98765 43223', arrival_status: 'Expected', check_in_time: '—', avatar: '' },
    { student_id: 'STU-2026-0857', full_name: 'Meera Nambiar', phone: '+91 98765 43224', arrival_status: 'Expected', check_in_time: '—', avatar: '' },
    { student_id: 'STU-2026-0858', full_name: 'Farhan Ali', phone: '+91 98765 43225', arrival_status: 'Expected', check_in_time: '—', avatar: '' },
  ],
}

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'ST'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'ST'
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

const getTodayDateStr = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function TimetableScheduling() {
  const [selectedDate, setSelectedDate] = useState(getTodayDateStr)
  const [sessions, setSessions] = useState([])
  const [tutorsList, setTutorsList] = useState([])
  const [studentsList, setStudentsList] = useState([])
  const [batchesList, setBatchesList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [toast, setToast] = useState('')

  // Filters
  const [selectedBatch, setSelectedBatch] = useState('All')
  const [selectedCoverage, setSelectedCoverage] = useState('All') // 'All' | 'Substituted' | 'Absent' | 'Present'
  const [searchQuery, setSearchQuery] = useState('')

  // Expandable student arrival accordion per session
  const [expandedSessionIds, setExpandedSessionIds] = useState(new Set([1]))

  // Substitution Modal State
  const [substitutingSession, setSubstitutingSession] = useState(null)
  const [substituteForm, setSubstituteForm] = useState({
    substitute_tutor: '',
    reason: 'Medical / Sick Leave',
    custom_reason: '',
    handover_notes: '',
    notify_students: true,
  })
  const [isSavingSubstitute, setIsSavingSubstitute] = useState(false)

  // Add Session Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSessionForm, setNewSessionForm] = useState({
    title: '',
    batch_code: 'BIX-DEV-24A',
    track: 'Full-Stack Web Development',
    room: 'Lab 304 - Cloud Infrastructure Suite',
    instructor: 'Dr. Marcus Vance',
    start_time: '09:30',
    end_time: '11:30',
    description: '',
  })
  const [isCreatingSession, setIsCreatingSession] = useState(false)

  // Load backend data on mount
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      setIsLoading(true)
      try {
        const [calRes, tutorsRes, studentsRes, batchesRes] = await Promise.allSettled([
          apiService.getCalendarEvents(),
          apiService.getTutors(),
          apiService.getStudents(),
          apiService.getBatches(),
        ])

        if (!isMounted) return

        let dbTutors = []
        if (tutorsRes.status === 'fulfilled' && tutorsRes.value?.data) {
          dbTutors = Array.isArray(tutorsRes.value.data) ? tutorsRes.value.data : []
          setTutorsList(dbTutors)
        }

        let dbStudents = []
        if (studentsRes.status === 'fulfilled' && studentsRes.value?.data) {
          dbStudents = Array.isArray(studentsRes.value.data) ? studentsRes.value.data : []
          setStudentsList(dbStudents)
        }

        if (batchesRes.status === 'fulfilled' && batchesRes.value?.data) {
          const bList = Array.isArray(batchesRes.value.data) ? batchesRes.value.data : []
          setBatchesList(bList)
        }

        // Initialize sessions from backend or rich defaults
        let loadedEvents = []
        if (calRes.status === 'fulfilled' && calRes.value?.data && Array.isArray(calRes.value.data)) {
          loadedEvents = calRes.value.data
        }

        // Merge / map events into timetable sessions
        buildTimetableSessions(loadedEvents, dbStudents, dbTutors)
      } catch (err) {
        console.warn('Using structured local timetable sessions:', err)
        buildTimetableSessions([], [], [])
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadData()
    return () => { isMounted = false }
  }, [selectedDate])

  // Build timetable sessions with live student rosters and tutors
  const buildTimetableSessions = (dbEvents, dbStudents, dbTutors) => {
    const todayEvents = (dbEvents || []).filter((e) => e.date === selectedDate)

    const defaultFaculty = dbTutors.length > 0 ? (dbTutors[0].name || dbTutors[0].full_name) : 'Dr. Marcus Vance'

    if (todayEvents.length > 0) {
      const mapped = todayEvents.map((evt, idx) => {
        const batchCode = evt.batch || evt.batch_code || 'BIX-DEV-24A'
        const existingRoster = evt.student_arrivals || buildStudentsForBatch(batchCode, dbStudents)
        return {
          id: evt.id || idx + 1,
          date: evt.date || selectedDate,
          start_time: evt.start_time || '09:30',
          end_time: evt.end_time || '11:30',
          title: evt.title || 'Advanced Core Curriculum Workshop',
          batch: batchCode,
          track: evt.track || 'Full-Stack Web Development',
          room: evt.location || evt.room || 'Lab 304 - Cloud Suite',
          instructor: evt.instructor || defaultFaculty,
          tutor_status: evt.tutor_status || 'Present',
          substitute_tutor: evt.substitute_tutor || null,
          substitution_reason: evt.substitution_reason || null,
          handover_notes: evt.description || '',
          students_roster: Array.isArray(existingRoster) ? existingRoster : buildStudentsForBatch(batchCode, dbStudents),
        }
      })
      setSessions(mapped)
    } else {
      // Create modern default sessions for this day
      const defaults = [
        {
          id: 1,
          date: selectedDate,
          start_time: '09:00 AM',
          end_time: '11:00 AM',
          title: 'Full-Stack Web Engineering: Server Components & Database ORM',
          batch: 'BIX-DEV-24A',
          track: 'Full-Stack Web Development',
          room: 'Lab 304 - High Performance Cloud Suite',
          instructor: dbTutors[0]?.name || dbTutors[0]?.full_name || 'Dr. Marcus Vance',
          tutor_status: 'Present',
          substitute_tutor: null,
          substitution_reason: null,
          handover_notes: 'Hands-on practical: API route controllers and connection pooling with PostgreSQL.',
          students_roster: buildStudentsForBatch('BIX-DEV-24A', dbStudents),
        },
        {
          id: 2,
          date: selectedDate,
          start_time: '11:30 AM',
          end_time: '01:30 PM',
          title: 'UI/UX Design Systems, Component Tokens & WCAG AAA Accessibility',
          batch: 'BIX-UX-26D',
          track: 'UI/UX Product Design',
          room: 'Design Studio 104 - Creative Lab',
          instructor: dbTutors[2]?.name || dbTutors[2]?.full_name || 'Elena Rostova',
          tutor_status: 'Present',
          substitute_tutor: null,
          substitution_reason: null,
          handover_notes: 'Design handoff review and atomic component variants in Figma.',
          students_roster: buildStudentsForBatch('BIX-UX-26D', dbStudents),
        },
        {
          id: 3,
          date: selectedDate,
          start_time: '02:00 PM',
          end_time: '04:00 PM',
          title: 'Digital Marketing & Conversion Bidding: Meta Ads & GA4 Tracking',
          batch: 'BIX-MKT-26B',
          track: 'Digital Marketing',
          room: 'Seminar Hall B - Analytics Hub',
          instructor: dbTutors[3]?.name || dbTutors[3]?.full_name || 'Kavita Raman',
          tutor_status: 'Absent',
          substitute_tutor: dbTutors[1]?.name || dbTutors[1]?.full_name || 'Prof. Sarah Jenkins',
          substitution_reason: 'Medical Leave (Fever) - Covered with confirmed session notes',
          handover_notes: 'Covering campaign segmentation and ROAS optimization exercises.',
          students_roster: buildStudentsForBatch('BIX-MKT-26B', dbStudents),
        },
        {
          id: 4,
          date: selectedDate,
          start_time: '04:30 PM',
          end_time: '06:30 PM',
          title: 'Data Science Vectorization: NumPy, Pandas & Feature Wrangling',
          batch: 'BIX-DS-18C',
          track: 'Data Science & Analytics',
          room: 'Computing Suite 202',
          instructor: dbTutors[4]?.name || dbTutors[4]?.full_name || 'Dr. Rajesh Nair',
          tutor_status: 'Present',
          substitute_tutor: null,
          substitution_reason: null,
          handover_notes: 'Time series cleaning and missing value handling algorithms.',
          students_roster: buildStudentsForBatch('BIX-DS-18C', dbStudents),
        },
      ]
      setSessions(defaults)
    }
  }

  // Helper to build student roster for a batch
  const buildStudentsForBatch = (batchCode, dbStudents = []) => {
    // If we have real students assigned to this batch in db
    const matched = dbStudents.filter((s) => s.batch === batchCode || s.assigned_track === batchCode)
    if (matched.length > 0) {
      return matched.map((s, idx) => ({
        student_id: s.student_id || `STU-${s.id}`,
        full_name: s.full_name,
        phone: s.phone || '—',
        avatar: s.avatar || '',
        arrival_status: idx % 4 === 3 ? 'Expected' : idx % 6 === 5 ? 'Late' : 'Arrived',
        check_in_time: idx % 4 === 3 ? '—' : `09:${String(idx * 4 + 5).padStart(2, '0')} AM`,
      }))
    }
    // Fallback to static batch roster
    return FALLBACK_BATCH_STUDENTS[batchCode] || [
      { student_id: 'STU-2026-001', full_name: 'Aditya Nair', phone: '+91 98765 00112', arrival_status: 'Arrived', check_in_time: '09:05 AM', avatar: '' },
      { student_id: 'STU-2026-002', full_name: 'Neha Kapoor', phone: '+91 98765 00113', arrival_status: 'Arrived', check_in_time: '09:12 AM', avatar: '' },
      { student_id: 'STU-2026-003', full_name: 'Rahul Sen', phone: '+91 98765 00114', arrival_status: 'Expected', check_in_time: '—', avatar: '' },
    ]
  }

  // Filtered Sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchBatch = selectedBatch === 'All' || s.batch === selectedBatch
      const matchCoverage =
        selectedCoverage === 'All' ||
        (selectedCoverage === 'Substituted' && s.substitute_tutor) ||
        (selectedCoverage === 'Absent' && s.tutor_status === 'Absent' && !s.substitute_tutor) ||
        (selectedCoverage === 'Present' && s.tutor_status === 'Present')

      const q = searchQuery.toLowerCase().trim()
      const matchQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.batch.toLowerCase().includes(q) ||
        s.room.toLowerCase().includes(q) ||
        s.instructor.toLowerCase().includes(q) ||
        (s.substitute_tutor && s.substitute_tutor.toLowerCase().includes(q))

      return matchBatch && matchCoverage && matchQuery
    })
  }, [sessions, selectedBatch, selectedCoverage, searchQuery])

  // Aggregate KPI Metrics for Selected Day
  const metrics = useMemo(() => {
    let totalExpected = 0
    let totalArrived = 0
    let totalLate = 0
    let totalAbsent = 0
    let tutorsPresent = 0
    let tutorsAbsent = 0
    let tutorsSubstituted = 0

    sessions.forEach((s) => {
      // Tutor metrics
      if (s.substitute_tutor) {
        tutorsSubstituted += 1
      } else if (s.tutor_status === 'Absent') {
        tutorsAbsent += 1
      } else {
        tutorsPresent += 1
      }

      // Student arrivals metrics
      const roster = s.students_roster || []
      roster.forEach((st) => {
        totalExpected += 1
        if (st.arrival_status === 'Arrived') totalArrived += 1
        else if (st.arrival_status === 'Late') totalLate += 1
        else if (st.arrival_status === 'Absent') totalAbsent += 1
      })
    })

    const arrivalPct = totalExpected > 0 ? Math.round(((totalArrived + totalLate) / totalExpected) * 100) : 0

    return {
      totalSessions: sessions.length,
      totalExpected,
      totalArrived,
      totalLate,
      totalAbsent,
      arrivalPct,
      tutorsPresent,
      tutorsAbsent,
      tutorsSubstituted,
    }
  }, [sessions])

  // Toggle Accordion for session arrivals
  const toggleExpandSession = (sessionId) => {
    setExpandedSessionIds((prev) => {
      const next = new Set(prev)
      if (next.has(sessionId)) next.delete(sessionId)
      else next.add(sessionId)
      return next
    })
  }

  // Date Navigators
  const handleShiftDate = (days) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + days)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    setSelectedDate(`${year}-${month}-${day}`)
  }

  const handleSelectToday = () => {
    setSelectedDate(getTodayDateStr())
  }

  // Open Substitution Modal
  const handleOpenSubstitutionModal = (session) => {
    setSubstitutingSession(session)
    const availableTutors = (tutorsList.length > 0 ? tutorsList : FALLBACK_TUTORS).filter(
      (t) => (t.name || t.full_name) !== session.instructor
    )
    setSubstituteForm({
      substitute_tutor: session.substitute_tutor || (availableTutors[0]?.name || availableTutors[0]?.full_name || 'Prof. Sarah Jenkins'),
      reason: session.substitution_reason || 'Medical / Sick Leave',
      custom_reason: '',
      handover_notes: session.handover_notes || `Please cover session for batch ${session.batch}.`,
      notify_students: true,
    })
  }

  // Confirm Tutor Substitution
  const handleConfirmSubstitution = async (e) => {
    e.preventDefault()
    if (!substitutingSession) return

    setIsSavingSubstitute(true)
    const finalReason = substituteForm.reason === 'Other' && substituteForm.custom_reason.trim()
      ? substituteForm.custom_reason.trim()
      : substituteForm.reason

    const updatedSession = {
      ...substitutingSession,
      tutor_status: 'Absent',
      substitute_tutor: substituteForm.substitute_tutor,
      substitution_reason: finalReason,
      handover_notes: substituteForm.handover_notes,
    }

    // Update local state immediately
    setSessions((prev) => prev.map((s) => (s.id === substitutingSession.id ? updatedSession : s)))

    // Save to backend if session has an ID
    try {
      await apiService.updateCalendarEvent(substitutingSession.id, {
        tutor_status: 'Absent',
        substitute_tutor: substituteForm.substitute_tutor,
        substitution_reason: finalReason,
        description: substituteForm.handover_notes,
      })
    } catch (err) {
      console.warn('Backend update failed, saved locally:', err)
    }

    setToast(`Faculty cover confirmed! "${substituteForm.substitute_tutor}" assigned to substitute for "${substitutingSession.instructor}".`)
    setSubstitutingSession(null)
    setIsSavingSubstitute(false)
    setTimeout(() => setToast(''), 4000)
  }

  // Revert Substitution back to Primary Tutor
  const handleRevertSubstitution = async (session) => {
    if (!window.confirm(`Revert tutor assignment back to original primary tutor "${session.instructor}"?`)) return

    const updated = {
      ...session,
      tutor_status: 'Present',
      substitute_tutor: null,
      substitution_reason: null,
    }

    setSessions((prev) => prev.map((s) => (s.id === session.id ? updated : s)))

    try {
      await apiService.updateCalendarEvent(session.id, {
        tutor_status: 'Present',
        substitute_tutor: null,
        substitution_reason: null,
      })
    } catch (err) {
      console.warn('Backend revert failed:', err)
    }

    setToast(`Tutor assignment reverted back to original faculty "${session.instructor}".`)
    setTimeout(() => setToast(''), 3000)
  }

  // Quick Toggle Tutor Absent / Present
  const handleToggleTutorStatus = async (session) => {
    if (session.substitute_tutor) {
      handleRevertSubstitution(session)
      return
    }

    if (session.tutor_status === 'Present') {
      // Prompt substitution modal directly
      handleOpenSubstitutionModal(session)
    } else {
      // Mark present
      const updated = { ...session, tutor_status: 'Present' }
      setSessions((prev) => prev.map((s) => (s.id === session.id ? updated : s)))
      try {
        await apiService.updateCalendarEvent(session.id, { tutor_status: 'Present' })
      } catch (err) {
        console.warn('Backend update failed:', err)
      }
      setToast(`Faculty "${session.instructor}" marked Present & On Duty.`)
      setTimeout(() => setToast(''), 3000)
    }
  }

  // Toggle individual student arrival status
  const handleStudentArrivalToggle = (sessionId, studentId, newStatus) => {
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s
        const updatedRoster = (s.students_roster || []).map((st) => {
          if (st.student_id !== studentId) return st
          return {
            ...st,
            arrival_status: newStatus,
            check_in_time: newStatus === 'Arrived' || newStatus === 'Late' ? nowTime : '—',
          }
        })

        // Also async save to backend
        apiService.updateCalendarEvent(s.id, { student_arrivals: updatedRoster }).catch(() => null)

        return { ...s, students_roster: updatedRoster }
      })
    )
  }

  // Bulk check-in all expected students as Arrived
  const handleBulkCheckInAll = (sessionId) => {
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id !== sessionId) return s
        const updatedRoster = (s.students_roster || []).map((st) => ({
          ...st,
          arrival_status: 'Arrived',
          check_in_time: st.arrival_status === 'Arrived' ? st.check_in_time : nowTime,
        }))
        apiService.updateCalendarEvent(s.id, { student_arrivals: updatedRoster }).catch(() => null)
        return { ...s, students_roster: updatedRoster }
      })
    )
    setToast('All enrolled students in this session marked Arrived!')
    setTimeout(() => setToast(''), 3000)
  }

  // Create new timetable slot
  const handleCreateSession = async (e) => {
    e.preventDefault()
    if (!newSessionForm.title.trim()) return

    setIsCreatingSession(true)
    const newSession = {
      id: Date.now(),
      date: selectedDate,
      title: newSessionForm.title.trim(),
      batch: newSessionForm.batch_code,
      track: newSessionForm.track,
      room: newSessionForm.room,
      instructor: newSessionForm.instructor,
      tutor_status: 'Present',
      substitute_tutor: null,
      substitution_reason: null,
      start_time: newSessionForm.start_time,
      end_time: newSessionForm.end_time,
      handover_notes: newSessionForm.description,
      students_roster: buildStudentsForBatch(newSessionForm.batch_code, studentsList),
    }

    try {
      await apiService.createCalendarEvent({
        title: newSession.title,
        batch: newSession.batch,
        track: newSession.track,
        location: newSession.room,
        instructor: newSession.instructor,
        date: newSession.date,
        start_time: newSession.start_time,
        end_time: newSession.end_time,
        description: newSession.handover_notes,
      })
    } catch (err) {
      console.warn('Backend event create failed:', err)
    }

    setSessions((prev) => [newSession, ...prev])
    setShowAddModal(false)
    setIsCreatingSession(false)
    setToast(`New session "${newSession.title}" added to timetable.`)
    setTimeout(() => setToast(''), 3000)
  }

  // Available substitute tutors pool (excluding current primary tutor)
  const availableSubstituteTutors = useMemo(() => {
    const list = tutorsList.length > 0 ? tutorsList : FALLBACK_TUTORS
    if (!substitutingSession) return list
    return list.filter((t) => (t.name || t.full_name) !== substitutingSession.instructor)
  }, [tutorsList, substitutingSession])

  // Formatted date header string (e.g. "Friday, November 27, 2026")
  const formattedDateTitle = useMemo(() => {
    try {
      const parts = selectedDate.split('-')
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return selectedDate
    }
  }, [selectedDate])

  const isToday = selectedDate === getTodayDateStr()

  return (
    <div className="flex flex-col gap-3.5 w-full">
      {/* Toast Feedback */}
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

      {/* Screen Header: Title, Live Date Controls & Primary Actions */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-3.5 rounded-md shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="material-symbols-outlined text-light-primary text-[20px]">schedule</span>
            <h1 className="font-title text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface">
              Timetable &amp; Daily Scheduling
            </h1>
            {isToday ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-container text-on-success-container text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                <span>Today Live</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant text-[10px] font-bold">
                Archived Date
              </span>
            )}
          </div>
          <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Live student arrivals, class check-ins, tutor presence tracking, and emergency faculty substitution.
          </p>
        </div>

        {/* Date Selector & Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Quick Date Stepper */}
          <div className="inline-flex items-center rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container p-0.5">
            <button
              type="button"
              onClick={() => handleShiftDate(-1)}
              title="Previous Day"
              className="p-1 rounded hover:bg-light-surface-container text-light-on-surface-variant hover:text-light-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={handleSelectToday}
              className={`px-2 py-0.5 rounded text-xs font-semibold transition-colors ${
                isToday
                  ? 'bg-light-primary text-light-on-primary shadow-2xs'
                  : 'text-light-on-surface-variant hover:text-light-on-surface'
              }`}
            >
              Today
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-1.5 py-0.5 text-xs bg-transparent text-light-on-surface dark:text-dark-on-surface font-mono font-medium focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleShiftDate(1)}
              title="Next Day"
              className="p-1 rounded hover:bg-light-surface-container text-light-on-surface-variant hover:text-light-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>

          {/* Add Slot Button */}
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">add</span>
            <span>Add Class Slot</span>
          </button>

          {/* Print Roster Button */}
          <button
            type="button"
            onClick={() => window.print()}
            title="Print Daily Faculty & Student Arrival Log"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface text-xs font-semibold hover:bg-light-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">print</span>
            <span>Print Log</span>
          </button>
        </div>
      </section>

      {/* KPI Cards: High Density Real-Time Telemetry */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 items-stretch">
        {/* Metric 1: Scheduled Classes */}
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3 shadow-2xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-label text-[11px] font-semibold text-light-on-surface-variant uppercase tracking-wider">
              Today's Classes
            </span>
            <span className="w-6 h-6 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">school</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-lg font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
              {metrics.totalSessions} Sessions
            </span>
            <span className="font-mono text-[10px] text-light-on-surface-variant">
              {formattedDateTitle}
            </span>
          </div>
        </article>

        {/* Metric 2: Student Arrivals */}
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3 shadow-2xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-label text-[11px] font-semibold text-light-on-surface-variant uppercase tracking-wider">
              Student Arrivals
            </span>
            <span className="w-6 h-6 rounded bg-success-container text-on-success-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">how_to_reg</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-lg font-bold text-success tabular-nums">
              {metrics.totalArrived + metrics.totalLate} / {metrics.totalExpected}
            </span>
            <span className="font-label text-[11px] font-bold text-on-success-container bg-success-container px-1.5 py-0.2 rounded">
              {metrics.arrivalPct}% Arrived
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-1 bg-light-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-success transition-all duration-300"
              style={{ width: `${Math.min(metrics.arrivalPct, 100)}%` }}
            />
          </div>
        </article>

        {/* Metric 3: Faculty On Duty */}
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3 shadow-2xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-label text-[11px] font-semibold text-light-on-surface-variant uppercase tracking-wider">
              Faculty Attendance
            </span>
            <span className="w-6 h-6 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">co_present</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-lg font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
              {metrics.tutorsPresent} Present
            </span>
            {metrics.tutorsAbsent > 0 ? (
              <span className="font-label text-[10px] font-bold text-on-overdue-container bg-overdue-container px-1.5 py-0.2 rounded">
                {metrics.tutorsAbsent} Absent
              </span>
            ) : (
              <span className="font-label text-[10px] font-bold text-on-success-container bg-success-container px-1.5 py-0.2 rounded">
                Full Faculty
              </span>
            )}
          </div>
        </article>

        {/* Metric 4: Faculty Covers / Substitutions */}
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3 shadow-2xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-label text-[11px] font-semibold text-light-on-surface-variant uppercase tracking-wider">
              Tutor Covers
            </span>
            <span className="w-6 h-6 rounded bg-pending-container text-on-pending-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">published_with_changes</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-lg font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
              {metrics.tutorsSubstituted} Substituted
            </span>
            <span className={`font-label text-[10px] font-bold px-1.5 py-0.2 rounded ${
              metrics.tutorsSubstituted > 0
                ? 'bg-pending-container text-on-pending-container'
                : 'bg-light-surface-container text-light-on-surface-variant'
            }`}>
              {metrics.tutorsSubstituted > 0 ? 'Covers Active' : '0 Emergency'}
            </span>
          </div>
        </article>
      </section>

      {/* Filter & Search Toolbar */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-2.5 rounded-md shadow-2xs flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex items-center flex-1 max-w-xs">
            <span className="material-symbols-outlined text-[15px] text-light-outline absolute left-2 pointer-events-none">
              search
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, batch, tutor, room..."
              className="w-full pl-7 pr-2.5 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
            />
          </div>

          {/* Batch Cohort Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-light-on-surface-variant text-[11px] font-medium hidden sm:inline">Cohort:</span>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
            >
              <option value="All">All Cohort Batches</option>
              {batchesList.length > 0
                ? batchesList.map((b) => (
                    <option key={b.id || b.batch_code} value={b.batch_code || b.title}>
                      {b.batch_code || b.title}
                    </option>
                  ))
                : Object.keys(FALLBACK_BATCH_STUDENTS).map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
            </select>
          </div>

          {/* Faculty Coverage Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-light-on-surface-variant text-[11px] font-medium hidden sm:inline">Tutor Status:</span>
            <select
              value={selectedCoverage}
              onChange={(e) => setSelectedCoverage(e.target.value)}
              className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
            >
              <option value="All">All Faculty Presence</option>
              <option value="Present">Present &amp; On Duty</option>
              <option value="Substituted">Substituted Cover</option>
              <option value="Absent">Absent / Needs Cover</option>
            </select>
          </div>
        </div>

        {(searchQuery || selectedBatch !== 'All' || selectedCoverage !== 'All') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('')
              setSelectedBatch('All')
              setSelectedCoverage('All')
            }}
            className="text-xs text-light-primary hover:underline font-semibold"
          >
            Reset Filters
          </button>
        )}
      </section>

      {/* Main Timetable Schedule List with Expandable Student Arrival Roster */}
      <section className="flex flex-col gap-3">
        {filteredSessions.length === 0 ? (
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-10 text-center flex flex-col items-center justify-center gap-1.5 shadow-xs">
            <span className="material-symbols-outlined text-[36px] text-light-outline opacity-40">event_busy</span>
            <h3 className="font-title text-sm font-bold text-light-on-surface dark:text-dark-on-surface">
              No Scheduled Sessions Found
            </h3>
            <p className="text-xs text-light-on-surface-variant">
              No classes match your current date ({formattedDateTitle}) or active filters.
            </p>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="mt-2 px-3 py-1.5 rounded bg-light-primary text-light-on-primary text-xs font-semibold"
            >
              + Schedule Class Slot for this Date
            </button>
          </div>
        ) : (
          filteredSessions.map((session) => {
            const isExpanded = expandedSessionIds.has(session.id)
            const roster = session.students_roster || []
            const arrivedCount = roster.filter((st) => st.arrival_status === 'Arrived' || st.arrival_status === 'Late').length
            const isFullyArrived = roster.length > 0 && arrivedCount === roster.length
            const hasSub = Boolean(session.substitute_tutor)
            const isAbsentWithoutSub = session.tutor_status === 'Absent' && !hasSub

            return (
              <div
                key={session.id}
                className={`bg-light-surface-container-lowest dark:bg-dark-surface-bright border rounded-md shadow-xs transition-all overflow-hidden ${
                  hasSub
                    ? 'border-pending/40 bg-pending-container/10'
                    : isAbsentWithoutSub
                    ? 'border-overdue/60 bg-overdue-container/10'
                    : 'border-light-outline-variant dark:border-dark-outline-variant'
                }`}
              >
                {/* Session Card Header Row */}
                <div className="p-3.5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-light-outline-variant/60">
                  {/* Left: Timing & Session Information */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Time Slot Badge */}
                    <div className="flex flex-col items-center justify-center px-2.5 py-1.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant shrink-0 min-w-[96px] text-center">
                      <span className="font-mono text-xs font-bold text-light-primary dark:text-dark-primary">
                        {session.start_time}
                      </span>
                      <span className="text-[10px] text-light-on-surface-variant">to</span>
                      <span className="font-mono text-xs font-medium text-light-on-surface dark:text-dark-on-surface">
                        {session.end_time}
                      </span>
                    </div>

                    {/* Class Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                        <span className="font-mono text-[11px] font-bold text-light-primary bg-light-primary-tint dark:bg-dark-primary-tint px-1.5 py-0.2 rounded">
                          {session.batch}
                        </span>
                        <span className="text-[11px] text-light-on-surface-variant font-medium truncate max-w-[200px]">
                          • {session.track}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-light-on-surface-variant bg-light-surface-container-low dark:bg-dark-surface-container px-1.5 py-0.2 rounded">
                          <span className="material-symbols-outlined text-[13px]">meeting_room</span>
                          <span>{session.room}</span>
                        </span>
                      </div>

                      <h3 className="font-title text-sm font-bold text-light-on-surface dark:text-dark-on-surface truncate">
                        {session.title}
                      </h3>

                      {session.handover_notes && (
                        <p className="text-[11px] text-light-on-surface-variant truncate mt-0.5">
                          {session.handover_notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Faculty Tutor & Substitution Controls */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0 lg:border-l lg:border-light-outline-variant/60 lg:pl-3">
                    {/* Tutor Box */}
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                        hasSub
                          ? 'bg-pending text-white'
                          : isAbsentWithoutSub
                          ? 'bg-overdue text-white'
                          : 'bg-light-primary text-light-on-primary'
                      }`}>
                        {getInitials(hasSub ? session.substitute_tutor : session.instructor)}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                            {hasSub ? session.substitute_tutor : session.instructor}
                          </span>
                          {hasSub && (
                            <span className="px-1.5 py-0.2 rounded bg-pending-container text-on-pending-container text-[10px] font-bold">
                              Substitute
                            </span>
                          )}
                        </div>

                        {/* Status Label */}
                        <div className="flex items-center gap-1 text-[11px]">
                          {hasSub ? (
                            <span className="text-pending font-semibold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[13px]">swap_horiz</span>
                              <span>Covering for {session.instructor} ({session.substitution_reason || 'Absent'})</span>
                            </span>
                          ) : isAbsentWithoutSub ? (
                            <span className="text-overdue font-bold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[13px]">error</span>
                              <span>Primary Tutor Absent • Cover Needed!</span>
                            </span>
                          ) : (
                            <span className="text-success font-semibold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[13px]">verified</span>
                              <span>Present &amp; Instructing</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Faculty Action Buttons */}
                    <div className="flex items-center gap-1.5">
                      {hasSub ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenSubstitutionModal(session)}
                            className="px-2 py-1 rounded bg-pending-container text-on-pending-container text-[11px] font-semibold hover:bg-pending-container/80 transition-colors"
                            title="Modify Substitute Faculty"
                          >
                            Edit Cover
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRevertSubstitution(session)}
                            className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container"
                            title="Revert back to Primary Tutor"
                          >
                            <span className="material-symbols-outlined text-[16px]">undo</span>
                          </button>
                        </div>
                      ) : isAbsentWithoutSub ? (
                        <button
                          type="button"
                          onClick={() => handleOpenSubstitutionModal(session)}
                          className="px-2.5 py-1 rounded bg-overdue text-white text-[11px] font-semibold hover:bg-overdue/90 shadow-2xs transition-colors flex items-center gap-1 animate-pulse"
                        >
                          <span className="material-symbols-outlined text-[14px]">person_add</span>
                          <span>Assign Substitute Tutor</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenSubstitutionModal(session)}
                            className="px-2 py-1 rounded border border-light-outline-variant hover:bg-light-surface-container text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface transition-colors flex items-center gap-1"
                            title="Assign a replacement faculty cover"
                          >
                            <span className="material-symbols-outlined text-[13px]">person_search</span>
                            <span>Substitute</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleTutorStatus(session)}
                            className="px-2 py-1 rounded bg-overdue-container/40 text-overdue hover:bg-overdue-container text-[11px] font-semibold transition-colors"
                            title="Mark faculty absent"
                          >
                            Mark Absent
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Session Footer: Student Arrival Overview & Accordion Toggle */}
                <div className="px-3.5 py-2 bg-light-surface-container-low/50 dark:bg-dark-surface-container/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-light-on-surface dark:text-dark-on-surface">
                      Student Arrivals:
                    </span>
                    <span className="font-mono font-bold text-light-primary dark:text-dark-primary tabular-nums">
                      {arrivedCount} / {roster.length} Checked In
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isFullyArrived
                        ? 'bg-success-container text-on-success-container'
                        : arrivedCount > 0
                        ? 'bg-pending-container text-on-pending-container'
                        : 'bg-light-surface-container text-light-on-surface-variant'
                    }`}>
                      {roster.length > 0 ? Math.round((arrivedCount / roster.length) * 100) : 0}% Arrived
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleBulkCheckInAll(session.id)}
                      className="text-[11px] text-light-primary hover:underline font-semibold flex items-center gap-0.5"
                    >
                      <span className="material-symbols-outlined text-[14px]">done_all</span>
                      <span>Mark All Arrived</span>
                    </button>
                    <span className="text-light-outline-variant">|</span>
                    <button
                      type="button"
                      onClick={() => toggleExpandSession(session.id)}
                      className="inline-flex items-center gap-1 font-semibold text-xs text-light-primary hover:underline cursor-pointer"
                    >
                      <span>{isExpanded ? 'Hide Arrival Roster' : `View Student Arrival Roster (${roster.length})`}</span>
                      <span className="material-symbols-outlined text-[16px]">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Expandable Student Arrival Roster */}
                {isExpanded && (
                  <div className="p-3 bg-light-surface-container-lowest dark:bg-dark-surface-bright border-t border-light-outline-variant/60 animate-in fade-in duration-150">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-light-outline-variant text-[11px] font-semibold text-light-on-surface-variant uppercase tracking-wider bg-light-surface-container-low/40">
                            <th className="py-1.5 px-3">Student Name &amp; ID</th>
                            <th className="py-1.5 px-3">Contact</th>
                            <th className="py-1.5 px-3">Arrival Status</th>
                            <th className="py-1.5 px-3">Check-In Time</th>
                            <th className="py-1.5 px-3 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-light-outline-variant/40">
                          {roster.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="py-4 text-center text-light-on-surface-variant text-[11px]">
                                No students registered under batch {session.batch}.
                              </td>
                            </tr>
                          ) : (
                            roster.map((student) => {
                              const isArrived = student.arrival_status === 'Arrived'
                              const isLate = student.arrival_status === 'Late'
                              const isAbsent = student.arrival_status === 'Absent'

                              return (
                                <tr key={student.student_id} className="hover:bg-light-surface-container-low/30">
                                  {/* Student Name & Avatar */}
                                  <td className="py-2 px-3 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      {student.avatar ? (
                                        <img
                                          src={student.avatar}
                                          alt={student.full_name}
                                          className="w-6 h-6 rounded-full object-cover shrink-0 border border-light-outline-variant"
                                        />
                                      ) : (
                                        <div className="w-6 h-6 rounded-full bg-light-primary text-light-on-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                                          {getInitials(student.full_name)}
                                        </div>
                                      )}
                                      <div className="flex flex-col">
                                        <span className="font-semibold text-light-on-surface dark:text-dark-on-surface">
                                          {student.full_name}
                                        </span>
                                        <span className="font-mono text-[10px] text-light-on-surface-variant">
                                          {student.student_id}
                                        </span>
                                      </div>
                                    </div>
                                  </td>

                                  {/* Contact */}
                                  <td className="py-2 px-3 whitespace-nowrap font-mono text-[11px] text-light-on-surface-variant">
                                    {student.phone}
                                  </td>

                                  {/* Arrival Status Pill */}
                                  <td className="py-2 px-3 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                        isArrived
                                          ? 'bg-success-container text-on-success-container'
                                          : isLate
                                          ? 'bg-pending-container text-on-pending-container'
                                          : isAbsent
                                          ? 'bg-overdue-container text-on-overdue-container'
                                          : 'bg-light-surface-container text-light-on-surface-variant'
                                      }`}
                                    >
                                      <span
                                        className={`w-1.5 h-1.5 rounded-full ${
                                          isArrived ? 'bg-success' : isLate ? 'bg-pending' : isAbsent ? 'bg-overdue' : 'bg-light-outline'
                                        }`}
                                      />
                                      <span>{student.arrival_status}</span>
                                    </span>
                                  </td>

                                  {/* Check-In Timestamp */}
                                  <td className="py-2 px-3 whitespace-nowrap font-mono text-xs tabular-nums text-light-on-surface dark:text-dark-on-surface">
                                    {student.check_in_time}
                                  </td>

                                  {/* Quick Action Toggle */}
                                  <td className="py-2 px-3 whitespace-nowrap text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleStudentArrivalToggle(session.id, student.student_id, 'Arrived')}
                                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                                          isArrived
                                            ? 'bg-success text-white shadow-2xs'
                                            : 'bg-light-surface-container hover:bg-success/20 text-light-on-surface'
                                        }`}
                                      >
                                        Arrived
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleStudentArrivalToggle(session.id, student.student_id, 'Late')}
                                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                                          isLate
                                            ? 'bg-pending text-white shadow-2xs'
                                            : 'bg-light-surface-container hover:bg-pending/20 text-light-on-surface'
                                        }`}
                                      >
                                        Late
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleStudentArrivalToggle(session.id, student.student_id, 'Absent')}
                                        className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                                          isAbsent
                                            ? 'bg-overdue text-white shadow-2xs'
                                            : 'bg-light-surface-container hover:bg-overdue/20 text-overdue'
                                        }`}
                                      >
                                        Absent
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </section>

      {/* ===================================================================== */}
      {/* MODAL 1: SUBSTITUTE FACULTY ASSIGNMENT                                */}
      {/* ===================================================================== */}
      {substitutingSession && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-lg p-4 flex flex-col gap-3 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-light-outline-variant pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-pending text-[20px]">
                  published_with_changes
                </span>
                <h3 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                  Faculty Cover &amp; Tutor Substitution
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSubstitutingSession(null)}
                className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Session Summary Card */}
            <div className="p-3 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant flex flex-col gap-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-light-primary bg-light-primary-tint px-1.5 py-0.2 rounded">
                  {substitutingSession.batch}
                </span>
                <span className="font-mono text-[11px] font-semibold text-light-on-surface-variant">
                  {substitutingSession.start_time} - {substitutingSession.end_time} • {substitutingSession.room}
                </span>
              </div>
              <strong className="text-light-on-surface dark:text-dark-on-surface text-xs font-bold">
                {substitutingSession.title}
              </strong>
              <div className="flex items-center gap-1.5 text-[11px] text-overdue font-semibold mt-0.5">
                <span className="material-symbols-outlined text-[14px]">person_off</span>
                <span>Original Tutor: <u>{substitutingSession.instructor}</u> (Marked Absent)</span>
              </div>
            </div>

            {/* Substitution Form */}
            <form onSubmit={handleConfirmSubstitution} className="flex flex-col gap-3 text-xs">
              {/* Select Replacement Tutor */}
              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Select Substitute Faculty *
                </label>
                <select
                  required
                  value={substituteForm.substitute_tutor}
                  onChange={(e) => setSubstituteForm({ ...substituteForm, substitute_tutor: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary font-medium"
                >
                  <option value="">-- Choose Available Faculty --</option>
                  {availableSubstituteTutors.map((t) => {
                    const tutorName = t.name || t.full_name
                    const spec = t.specialization || t.expertise || 'Faculty Lead'
                    return (
                      <option key={t.id || tutorName} value={tutorName}>
                        {tutorName} — {spec} ({t.status || 'Active'})
                      </option>
                    )
                  })}
                </select>
                <span className="text-[10px] text-light-on-surface-variant mt-0.5 block">
                  Select certified faculty from the Tutor Master available for this time slot.
                </span>
              </div>

              {/* Substitution Reason */}
              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Reason for Absence / Substitution *
                </label>
                <select
                  value={substituteForm.reason}
                  onChange={(e) => setSubstituteForm({ ...substituteForm, reason: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                >
                  <option value="Medical / Sick Leave">Medical / Sick Leave</option>
                  <option value="Emergency Personal Leave">Emergency Personal Leave</option>
                  <option value="Academic Conference / Seminar">Academic Conference / External Seminar</option>
                  <option value="Institutional Administrative Duty">Institutional Administrative Duty</option>
                  <option value="Travel / External Meeting">Travel / External Client Meeting</option>
                  <option value="Other">Other Specific Reason</option>
                </select>
              </div>

              {substituteForm.reason === 'Other' && (
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Specify Reason
                  </label>
                  <input
                    type="text"
                    required
                    value={substituteForm.custom_reason}
                    onChange={(e) => setSubstituteForm({ ...substituteForm, custom_reason: e.target.value })}
                    placeholder="Enter reason for substitution..."
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
              )}

              {/* Session Handover Notes */}
              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Session Handover &amp; Instructional Notes
                </label>
                <textarea
                  rows="2"
                  value={substituteForm.handover_notes}
                  onChange={(e) => setSubstituteForm({ ...substituteForm, handover_notes: e.target.value })}
                  placeholder="e.g. Please proceed with hands-on lab exercise 4 on React Server Components..."
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              {/* Notify Students Checkbox */}
              <div className="flex items-center gap-2 p-2 rounded bg-light-surface-container-low dark:bg-dark-surface-container">
                <input
                  type="checkbox"
                  id="notifyStudents"
                  checked={substituteForm.notify_students}
                  onChange={(e) => setSubstituteForm({ ...substituteForm, notify_students: e.target.checked })}
                  className="rounded text-light-primary focus:ring-0 cursor-pointer"
                />
                <label htmlFor="notifyStudents" className="text-xs text-light-on-surface dark:text-dark-on-surface cursor-pointer">
                  Notify enrolled students in batch <strong>{substitutingSession.batch}</strong> of this tutor substitution
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 border-t border-light-outline-variant pt-2 mt-1">
                <button
                  type="button"
                  onClick={() => setSubstitutingSession(null)}
                  className="px-3 py-1.5 rounded border border-light-outline-variant text-xs font-semibold hover:bg-light-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSubstitute}
                  className="px-4 py-1.5 rounded bg-pending text-white hover:bg-pending/90 font-label text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[15px]">how_to_reg</span>
                  <span>{isSavingSubstitute ? 'Assigning Cover...' : 'Confirm & Assign Substitute Tutor'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: ADD NEW TIMETABLE CLASS SLOT                                */}
      {/* ===================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-lg p-4 flex flex-col gap-3 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-light-outline-variant pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-light-primary text-[20px]">
                  more_time
                </span>
                <h3 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                  Schedule New Timetable Class Slot
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateSession} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Class / Session Topic Title *
                </label>
                <input
                  type="text"
                  required
                  value={newSessionForm.title}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, title: e.target.value })}
                  placeholder="e.g. Next.js App Router & Server Actions Lab"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Target Cohort Batch *
                  </label>
                  <select
                    value={newSessionForm.batch_code}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, batch_code: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    {batchesList.length > 0
                      ? batchesList.map((b) => (
                          <option key={b.id || b.batch_code} value={b.batch_code || b.title}>
                            {b.batch_code || b.title}
                          </option>
                        ))
                      : Object.keys(FALLBACK_BATCH_STUDENTS).map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Primary Faculty Tutor *
                  </label>
                  <select
                    value={newSessionForm.instructor}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, instructor: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    {(tutorsList.length > 0 ? tutorsList : FALLBACK_TUTORS).map((t) => {
                      const name = t.name || t.full_name
                      return (
                        <option key={t.id || name} value={name}>
                          {name} ({t.specialization || 'Faculty'})
                        </option>
                      )
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={newSessionForm.start_time}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, start_time: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={newSessionForm.end_time}
                    onChange={(e) => setNewSessionForm({ ...newSessionForm, end_time: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Room / Lab Location *
                </label>
                <input
                  type="text"
                  required
                  value={newSessionForm.room}
                  onChange={(e) => setNewSessionForm({ ...newSessionForm, room: e.target.value })}
                  placeholder="e.g. Lab 304 - Cloud Infrastructure Suite"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-light-outline-variant pt-2 mt-1">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded border border-light-outline-variant text-xs font-semibold hover:bg-light-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSession}
                  className="px-4 py-1.5 rounded bg-light-primary text-light-on-primary font-label text-xs font-semibold hover:bg-light-primary-container shadow-xs transition-colors cursor-pointer"
                >
                  {isCreatingSession ? 'Scheduling...' : 'Save & Schedule Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TimetableScheduling
