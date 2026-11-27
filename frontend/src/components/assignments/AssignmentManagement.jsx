import React, { useState, useEffect, useMemo } from 'react'
import { apiService } from '../../services/api'

// Fallback initial sample assignments
const FALLBACK_ASSIGNMENTS = [
  {
    id: 1,
    assignment_uid: 'ASN-2026-001',
    title: 'Full-Stack E-Commerce REST API & Auth Middleware',
    track: 'Full-Stack Web Development',
    batch_code: 'BIX-DEV-24A',
    description: 'Build secure JWT auth endpoints, role-based access middleware, and PostgreSQL relational schema migrations with connection pooling.',
    total_marks: 100,
    passing_marks: 50,
    due_date: '2026-12-10',
    status: 'Assigned',
    sent_to_count: 6,
    submitted_count: 5,
    evaluated_count: 4,
    student_submissions: [
      { student_id: 'STU-2026-0843', full_name: 'Marcus Vance', status: 'Evaluated', score: 94, submitted_at: '2026-11-26', remarks: 'Excellent schema design & middleware rate limiting.' },
      { student_id: 'STU-2026-0844', full_name: 'Priya Sharma', status: 'Evaluated', score: 88, submitted_at: '2026-11-26', remarks: 'Clean REST endpoints. Add more unit tests for auth.' },
      { student_id: 'STU-2026-0845', full_name: 'David Kim', status: 'Evaluated', score: 91, submitted_at: '2026-11-25', remarks: 'Well structured Docker compose and Prisma migrations.' },
      { student_id: 'STU-2026-0846', full_name: 'Ananya Verma', status: 'Evaluated', score: 82, submitted_at: '2026-11-27', remarks: 'Good implementation. Minor issue in refresh token rotation.' },
      { student_id: 'STU-2026-0847', full_name: 'Rohan Mehta', status: 'Submitted', score: null, submitted_at: '2026-11-27', remarks: 'Pending evaluator review.' },
      { student_id: 'STU-2026-0848', full_name: 'Sophia Patel', status: 'Pending', score: null, submitted_at: null, remarks: 'Work in progress.' },
    ],
  },
  {
    id: 2,
    assignment_uid: 'ASN-2026-002',
    title: 'Design System Tokens & Micro-Interactions in Figma',
    track: 'UI/UX Product Design',
    batch_code: 'BIX-UX-26D',
    description: 'Construct a complete atomic design system with light/dark tokens, interactive input variants, and WCAG AAA compliance checks.',
    total_marks: 100,
    passing_marks: 50,
    due_date: '2026-12-08',
    status: 'Completed',
    sent_to_count: 4,
    submitted_count: 4,
    evaluated_count: 4,
    student_submissions: [
      { student_id: 'STU-2026-0849', full_name: 'Alena Rostova', status: 'Evaluated', score: 98, submitted_at: '2026-11-24', remarks: 'Stunning component tokens and dark mode contrast.' },
      { student_id: 'STU-2026-0850', full_name: 'Karthik Rao', status: 'Evaluated', score: 92, submitted_at: '2026-11-24', remarks: 'Great auto-layout and interactive variants.' },
      { student_id: 'STU-2026-0851', full_name: 'Sneha Kulkarni', status: 'Evaluated', score: 86, submitted_at: '2026-11-25', remarks: 'Good typography scale. Improve button states.' },
      { student_id: 'STU-2026-0852', full_name: 'Liam Chen', status: 'Evaluated', score: 90, submitted_at: '2026-11-25', remarks: 'Polished micro-animations in prototype.' },
    ],
  },
  {
    id: 3,
    assignment_uid: 'ASN-2026-003',
    title: 'Conversion Funnel Strategy & Meta Ads Campaign Budgeting',
    track: 'Digital Marketing',
    batch_code: 'BIX-MKT-26B',
    description: 'Design a full-funnel acquisition campaign with audience segmentation, lookalike models, ROAS targets, and Klaviyo lifecycle retention flows.',
    total_marks: 100,
    passing_marks: 50,
    due_date: '2026-12-20',
    status: 'Draft',
    sent_to_count: 0,
    submitted_count: 0,
    evaluated_count: 0,
    student_submissions: [],
  },
]

export function AssignmentManagement() {
  const [assignments, setAssignments] = useState([])
  const [batchesList, setBatchesList] = useState([])
  const [studentsList, setStudentsList] = useState([])
  const [toast, setToast] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [selectedBatch, setSelectedBatch] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All') // 'All' | 'Draft' | 'Assigned' | 'Completed'
  const [selectedTrack, setSelectedTrack] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [evaluatingAssignment, setEvaluatingAssignment] = useState(null)
  const [viewingAssignment, setViewingAssignment] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newAssignmentForm, setNewAssignmentForm] = useState({
    title: '',
    batch_code: 'BIX-DEV-24A',
    track: 'Full-Stack Web Development',
    description: '',
    total_marks: 100,
    passing_marks: 50,
    due_date: '2026-12-15',
    status: 'Draft',
  })

  // Load Data
  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [assignRes, batchRes, stuRes] = await Promise.allSettled([
          apiService.getAssignments(),
          apiService.getBatches ? apiService.getBatches() : Promise.resolve([]),
          apiService.getStudents ? apiService.getStudents() : Promise.resolve([]),
        ])

        if (!isMounted) return

        if (assignRes.status === 'fulfilled' && assignRes.value && assignRes.value.data) {
          const list = Array.isArray(assignRes.value.data) ? assignRes.value.data : []
          if (list.length > 0) {
            setAssignments(list)
          } else {
            setAssignments(FALLBACK_ASSIGNMENTS)
          }
        } else {
          setAssignments(FALLBACK_ASSIGNMENTS)
        }

        if (batchRes.status === 'fulfilled' && batchRes.value) {
          const bList = Array.isArray(batchRes.value) ? batchRes.value : (batchRes.value.data || [])
          setBatchesList(bList)
        }

        if (stuRes.status === 'fulfilled' && stuRes.value) {
          const sList = Array.isArray(stuRes.value) ? stuRes.value : (stuRes.value.data || [])
          setStudentsList(sList)
        }
      } catch (err) {
        console.warn('Using fallback assignments:', err)
        if (isMounted) setAssignments(FALLBACK_ASSIGNMENTS)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchData()
    return () => {
      isMounted = false
    }
  }, [])

  const showNotification = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 4000)
  }

  // Calculate KPIs
  const kpis = useMemo(() => {
    const total = assignments.length
    const drafts = assignments.filter((a) => a.status === 'Draft').length
    const assigned = assignments.filter((a) => a.status === 'Assigned').length
    const completed = assignments.filter((a) => a.status === 'Completed').length

    let totalSubmissions = 0
    let evaluatedCount = 0

    assignments.forEach((a) => {
      const submissions = Array.isArray(a.student_submissions) ? a.student_submissions : []
      totalSubmissions += submissions.filter((s) => s.status === 'Submitted' || s.status === 'Evaluated').length
      evaluatedCount += submissions.filter((s) => s.status === 'Evaluated' && typeof s.score === 'number').length
    })

    return { total, drafts, assigned, completed, totalSubmissions, evaluatedCount }
  }, [assignments])

  // Filtered Assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchBatch = selectedBatch === 'All' || a.batch_code === selectedBatch
      const matchStatus = selectedStatus === 'All' || a.status === selectedStatus
      const matchTrack = selectedTrack === 'All' || a.track === selectedTrack
      const q = searchQuery.toLowerCase().trim()
      const matchSearch =
        !q ||
        (a.title && a.title.toLowerCase().includes(q)) ||
        (a.assignment_uid && a.assignment_uid.toLowerCase().includes(q)) ||
        (a.batch_code && a.batch_code.toLowerCase().includes(q)) ||
        (a.track && a.track.toLowerCase().includes(q))
      return matchBatch && matchStatus && matchTrack && matchSearch
    })
  }, [assignments, selectedBatch, selectedStatus, selectedTrack, searchQuery])

  // Distinct batches
  const batchOptions = useMemo(() => {
    const set = new Set(['BIX-DEV-24A', 'BIX-UX-26D', 'BIX-CLD-26C', 'BIX-MKT-26B'])
    assignments.forEach((a) => a.batch_code && set.add(a.batch_code))
    batchesList.forEach((b) => (b.batch_code || b.name) && set.add(b.batch_code || b.name))
    return Array.from(set)
  }, [assignments, batchesList])

  // Distinct tracks
  const trackOptions = useMemo(() => {
    const set = new Set(['Full-Stack Web Development', 'UI/UX Product Design', 'Digital Marketing', 'Data Science & AI', 'Cloud Computing & DevOps'])
    assignments.forEach((a) => a.track && set.add(a.track))
    return Array.from(set)
  }, [assignments])

  // Helper to get cohort students
  const getBatchStudents = (batchCode) => {
    const matched = studentsList.filter((s) => {
      const b = s.batch_code || s.cohort || s.batch
      return b && b.toLowerCase() === (batchCode || '').toLowerCase()
    })
    if (matched.length > 0) return matched

    return [
      { student_id: 'STU-2026-0843', full_name: 'Marcus Vance' },
      { student_id: 'STU-2026-0844', full_name: 'Priya Sharma' },
      { student_id: 'STU-2026-0845', full_name: 'David Kim' },
      { student_id: 'STU-2026-0846', full_name: 'Ananya Verma' },
      { student_id: 'STU-2026-0847', full_name: 'Rohan Mehta' },
      { student_id: 'STU-2026-0848', full_name: 'Sophia Patel' },
    ]
  }

  // =========================================================================
  // STAGE 1: CREATE ASSIGNMENT
  // =========================================================================
  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    if (!newAssignmentForm.title.trim()) {
      alert('Please enter an assignment title.')
      return
    }

    setIsSubmitting(true)
    const uid = `ASN-2026-${String(100 + assignments.length + 1).padStart(3, '0')}`
    const payload = {
      ...newAssignmentForm,
      assignment_uid: uid,
      total_marks: parseInt(newAssignmentForm.total_marks, 10) || 100,
      passing_marks: parseInt(newAssignmentForm.passing_marks, 10) || 50,
      sent_to_count: 0,
      submitted_count: 0,
      evaluated_count: 0,
      student_submissions: [],
    }

    try {
      const res = await apiService.createAssignment(payload)
      const created = res && res.data ? res.data : { ...payload, id: Date.now() }
      setAssignments((prev) => [created, ...prev])
      showNotification(`Assignment "${payload.title}" created successfully!`)
      setShowCreateModal(false)
      setNewAssignmentForm({
        title: '',
        batch_code: 'BIX-DEV-24A',
        track: 'Full-Stack Web Development',
        description: '',
        total_marks: 100,
        passing_marks: 50,
        due_date: '2026-12-15',
        status: 'Draft',
      })
    } catch (err) {
      console.warn('API create failed, saving locally:', err)
      const mock = { ...payload, id: Date.now() }
      setAssignments((prev) => [mock, ...prev])
      showNotification(`Assignment created locally as draft.`)
      setShowCreateModal(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // =========================================================================
  // STAGE 2: SEND TO STUDENTS (DISPATCH TASK TO COHORT)
  // =========================================================================
  const handleSendToStudents = async (assignment) => {
    const batchStudents = getBatchStudents(assignment.batch_code)
    const roster = batchStudents.map((s, idx) => ({
      student_id: s.student_id || `STU-2026-08${40 + idx}`,
      full_name: s.full_name || s.name || `Student ${idx + 1}`,
      status: 'Pending',
      score: null,
      submitted_at: null,
      remarks: 'Task dispatched to student workspace. Awaiting submission.',
    }))

    const updated = {
      ...assignment,
      status: 'Assigned',
      sent_to_count: roster.length,
      student_submissions: roster,
    }

    try {
      await apiService.updateAssignment(assignment.id, updated)
      setAssignments((prev) => prev.map((a) => (a.id === assignment.id ? updated : a)))
      showNotification(
        `Assignment dispatched & sent to ${roster.length} students in cohort ${assignment.batch_code}!`
      )
    } catch (err) {
      console.warn('Backend update failed, updating locally:', err)
      setAssignments((prev) => prev.map((a) => (a.id === assignment.id ? updated : a)))
      showNotification(`Assignment dispatched to ${roster.length} students (saved locally).`)
    }
  }

  // =========================================================================
  // STAGE 3: COMPLETE IT (EVALUATE, GRADE & COMPLETE)
  // =========================================================================
  const openEvaluationModal = (assignment) => {
    let currentSubmissions = Array.isArray(assignment.student_submissions) && assignment.student_submissions.length > 0
      ? [...assignment.student_submissions]
      : []

    if (currentSubmissions.length === 0) {
      const batchStudents = getBatchStudents(assignment.batch_code)
      currentSubmissions = batchStudents.map((s, idx) => ({
        student_id: s.student_id || `STU-2026-08${40 + idx}`,
        full_name: s.full_name || s.name || `Student ${idx + 1}`,
        status: 'Submitted',
        score: null,
        submitted_at: new Date().toISOString().split('T')[0],
        remarks: 'Project deliverables submitted for review.',
      }))
    }

    setEvaluatingAssignment({
      ...assignment,
      student_submissions: currentSubmissions,
    })
  }

  const handleStudentScoreChange = (idx, scoreVal) => {
    if (!evaluatingAssignment) return
    const updated = [...evaluatingAssignment.student_submissions]
    const maxMarks = Number(evaluatingAssignment.total_marks) || 100
    const score = scoreVal === '' ? null : Math.min(maxMarks, Math.max(0, Number(scoreVal)))
    updated[idx] = {
      ...updated[idx],
      score,
      status: score !== null ? 'Evaluated' : updated[idx].status,
      submitted_at: updated[idx].submitted_at || new Date().toISOString().split('T')[0],
      remarks: score !== null
        ? (score >= (Number(evaluatingAssignment.passing_marks) || 50)
            ? `Competency confirmed with ${score}/${maxMarks} marks.`
            : `Needs revision. Scored ${score}/${maxMarks}.`)
        : updated[idx].remarks,
    }
    setEvaluatingAssignment({ ...evaluatingAssignment, student_submissions: updated })
  }

  const handleStudentStatusChange = (idx, statusVal) => {
    if (!evaluatingAssignment) return
    const updated = [...evaluatingAssignment.student_submissions]
    updated[idx] = { ...updated[idx], status: statusVal }
    setEvaluatingAssignment({ ...evaluatingAssignment, student_submissions: updated })
  }

  const handleStudentRemarkChange = (idx, remarksVal) => {
    if (!evaluatingAssignment) return
    const updated = [...evaluatingAssignment.student_submissions]
    updated[idx] = { ...updated[idx], remarks: remarksVal }
    setEvaluatingAssignment({ ...evaluatingAssignment, student_submissions: updated })
  }

  // Quick helper: auto-fill passing marks
  const handleAutoFillPassingScores = () => {
    if (!evaluatingAssignment) return
    const sampleScores = [94, 88, 92, 85, 90, 84]
    const maxMarks = Number(evaluatingAssignment.total_marks) || 100
    const passMarks = Number(evaluatingAssignment.passing_marks) || 50

    const updated = evaluatingAssignment.student_submissions.map((st, i) => {
      const score = Math.min(maxMarks, Math.max(passMarks, sampleScores[i % sampleScores.length]))
      return {
        ...st,
        status: 'Evaluated',
        score: score,
        submitted_at: st.submitted_at || new Date().toISOString().split('T')[0],
        remarks: `Demonstrated solid competency. Scored ${score}/${maxMarks}.`,
      }
    })
    setEvaluatingAssignment({ ...evaluatingAssignment, student_submissions: updated })
  }

  // Complete assignment and save
  const handleCompleteAssignmentAndPublish = async () => {
    if (!evaluatingAssignment) return
    setIsSubmitting(true)

    const submissions = Array.isArray(evaluatingAssignment.student_submissions)
      ? evaluatingAssignment.student_submissions
      : []

    const evaluatedCount = submissions.filter((st) => st.status === 'Evaluated' && typeof st.score === 'number').length
    const submittedCount = submissions.filter((st) => st.status !== 'Pending').length

    const finalAssignment = {
      ...evaluatingAssignment,
      status: 'Completed',
      sent_to_count: submissions.length,
      submitted_count: submittedCount || submissions.length,
      evaluated_count: evaluatedCount || submissions.length,
      student_submissions: submissions,
    }

    try {
      await apiService.updateAssignment(finalAssignment.id, finalAssignment)
      setAssignments((prev) => prev.map((a) => (a.id === finalAssignment.id ? finalAssignment : a)))
      showNotification(`Assignment marked Completed and evaluated for ${finalAssignment.batch_code}!`)
      setEvaluatingAssignment(null)
    } catch (err) {
      console.warn('API update failed, updating state locally:', err)
      setAssignments((prev) => prev.map((a) => (a.id === finalAssignment.id ? finalAssignment : a)))
      showNotification(`Assignment completed & saved locally.`)
      setEvaluatingAssignment(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete Assignment
  const handleDeleteAssignment = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete assignment "${title}"?`)) return
    try {
      await apiService.deleteAssignment(id)
      setAssignments((prev) => prev.filter((a) => a.id !== id))
      showNotification(`Assignment deleted successfully.`)
    } catch (e) {
      console.warn('API delete failed, removing locally:', e)
      setAssignments((prev) => prev.filter((a) => a.id !== id))
      showNotification(`Assignment removed.`)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#2B1B54] text-white px-4 py-2.5 rounded-md shadow-lg border border-purple-400/30 flex items-center gap-2.5 text-sm animate-fade-in font-body">
          <span className="material-symbols-outlined text-[18px] text-green-300">check_circle</span>
          <span className="font-medium">{toast}</span>
        </div>
      )}

      {/* Header Bar */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-4 rounded-md shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary inline-flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">assignment</span>
            </span>
            <h1 className="font-title text-[18px] font-bold text-light-on-surface dark:text-dark-on-surface">
              Assignment Management
            </h1>
          </div>
          <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1">
            Create academic tasks, dispatch/send to enrolled cohort students, track submissions, and complete evaluation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary font-label text-xs font-semibold shadow-xs hover:bg-light-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Create Assignment</span>
          </button>
        </div>
      </section>

      {/* 4 KPI Cards Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Total Assignments
            </span>
            <span className="w-6 h-6 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 inline-flex items-center justify-center text-xs">
              <span className="material-symbols-outlined text-[15px]">assignment</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-2xl font-bold tabular-nums text-light-on-surface dark:text-dark-on-surface">
              {kpis.total}
            </span>
            <span className="font-label text-[11px] text-purple-600 bg-purple-50 dark:bg-purple-900/30 px-1.5 py-0.5 rounded font-semibold">
              {kpis.drafts} Drafts
            </span>
          </div>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Active / Dispatched
            </span>
            <span className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 inline-flex items-center justify-center text-xs">
              <span className="material-symbols-outlined text-[15px]">pending_actions</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-2xl font-bold tabular-nums text-light-on-surface dark:text-dark-on-surface">
              {kpis.assigned}
            </span>
            <span className="font-label text-[11px] text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded font-semibold">
              Sent to Students
            </span>
          </div>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Student Submissions
            </span>
            <span className="w-6 h-6 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 inline-flex items-center justify-center text-xs">
              <span className="material-symbols-outlined text-[15px]">upload_file</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-2xl font-bold tabular-nums text-light-on-surface dark:text-dark-on-surface">
              {kpis.totalSubmissions}
            </span>
            <span className="font-label text-[11px] text-amber-700 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded font-semibold">
              In Review
            </span>
          </div>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Completed & Graded
            </span>
            <span className="w-6 h-6 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 inline-flex items-center justify-center text-xs">
              <span className="material-symbols-outlined text-[15px]">verified</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-2xl font-bold tabular-nums text-light-on-surface dark:text-dark-on-surface">
              {kpis.completed}
            </span>
            <span className="font-label text-[11px] text-green-600 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded font-semibold">
              Evaluated
            </span>
          </div>
        </article>
      </section>

      {/* Filter and Search Bar */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-3 rounded-md shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left Filter Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Tabs */}
          <div className="flex items-center border border-light-outline-variant dark:border-dark-outline-variant rounded p-0.5 bg-light-surface-container-low dark:bg-dark-surface-container text-xs">
            {['All', 'Draft', 'Assigned', 'Completed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  selectedStatus === st
                    ? 'bg-light-primary text-light-on-primary shadow-xs font-semibold'
                    : 'text-light-on-surface-variant hover:text-light-on-surface'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Batch Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-light-on-surface-variant font-medium">Cohort:</span>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="px-2.5 py-1 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-light-primary"
            >
              <option value="All">All Batches</option>
              {batchOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Track Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-light-on-surface-variant font-medium">Track:</span>
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="px-2.5 py-1 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-light-primary"
            >
              <option value="All">All Tracks</option>
              {trackOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Search Input */}
        <div className="relative min-w-[240px]">
          <span className="material-symbols-outlined absolute left-2.5 top-2 text-[17px] text-light-outline">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search assignment, UID, cohort..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
          />
        </div>
      </section>

      {/* Main Assignments Table */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-light-surface-container-low dark:bg-dark-surface-container border-b border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant font-semibold">
                <th className="px-4 py-2.5">Assignment Details</th>
                <th className="px-3 py-2.5">Batch & Track</th>
                <th className="px-3 py-2.5">Deadline</th>
                <th className="px-3 py-2.5">Marks</th>
                <th className="px-3 py-2.5">Students / Progress</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">3-Stage Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-outline-variant/60 dark:divide-dark-outline-variant/60 font-body">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-light-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                    <p className="mt-1">Loading assignments...</p>
                  </td>
                </tr>
              ) : filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-light-on-surface-variant">
                    <span className="material-symbols-outlined text-[32px] text-light-outline">assignment_late</span>
                    <p className="mt-1 font-medium">No assignments found matching your filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((a) => {
                  const submissions = Array.isArray(a.student_submissions) ? a.student_submissions : []
                  const studentCount = Number(a.sent_to_count) || submissions.length
                  const evaluatedCount = submissions.filter((s) => s.status === 'Evaluated' && typeof s.score === 'number').length

                  return (
                    <tr
                      key={a.id}
                      className="hover:bg-light-surface-container-low/50 dark:hover:bg-dark-surface-container/50 transition-colors"
                    >
                      {/* UID & Title */}
                      <td className="px-4 py-3 align-top max-w-[280px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-light-primary dark:text-dark-primary bg-light-primary-tint/60 dark:bg-dark-primary-tint/40 px-1.5 py-0.5 rounded">
                            {a.assignment_uid || `ASN-${a.id}`}
                          </span>
                        </div>
                        <h3 className="font-title text-[13px] font-semibold text-light-on-surface dark:text-dark-on-surface mt-1 line-clamp-2">
                          {a.title}
                        </h3>
                        <p className="font-body text-[11px] text-light-on-surface-variant mt-0.5 line-clamp-1">
                          {a.description || 'Institutional academic assignment'}
                        </p>
                      </td>

                      {/* Batch & Track */}
                      <td className="px-3 py-3 align-top whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                          {a.batch_code}
                        </span>
                        <div className="text-[11px] text-light-on-surface-variant mt-1 max-w-[150px] truncate">
                          {a.track}
                        </div>
                      </td>

                      {/* Due Date */}
                      <td className="px-3 py-3 align-top whitespace-nowrap">
                        <div className="flex items-center gap-1 text-xs font-semibold text-light-on-surface dark:text-dark-on-surface">
                          <span className="material-symbols-outlined text-[14px] text-light-primary">calendar_today</span>
                          <span>{a.due_date}</span>
                        </div>
                      </td>

                      {/* Marks */}
                      <td className="px-3 py-3 align-top whitespace-nowrap">
                        <div className="text-xs">
                          <span className="font-bold text-light-on-surface dark:text-dark-on-surface">
                            {a.total_marks || 100} pts
                          </span>
                        </div>
                        <div className="text-[11px] text-light-on-surface-variant mt-0.5">
                          Pass: <span className="font-semibold text-green-600 dark:text-green-400">{a.passing_marks || 50} pts</span>
                        </div>
                      </td>

                      {/* Students / Progress */}
                      <td className="px-3 py-3 align-top whitespace-nowrap">
                        <div className="text-xs">
                          {studentCount > 0 ? (
                            <>
                              <span className="font-bold text-light-on-surface dark:text-dark-on-surface">
                                {evaluatedCount}/{studentCount}
                              </span>{' '}
                              <span className="text-light-on-surface-variant">Evaluated</span>
                              <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1 overflow-hidden">
                                <div
                                  className="bg-green-600 h-1.5 rounded-full"
                                  style={{ width: `${studentCount > 0 ? (evaluatedCount / studentCount) * 100 : 0}%` }}
                                ></div>
                              </div>
                            </>
                          ) : (
                            <span className="italic text-light-outline">Not dispatched</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3 align-top whitespace-nowrap">
                        {a.status === 'Draft' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                            Draft
                          </span>
                        )}
                        {a.status === 'Assigned' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            Assigned (Sent)
                          </span>
                        )}
                        {a.status === 'Completed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            Completed & Graded
                          </span>
                        )}
                      </td>

                      {/* 3-Stage Lifecycle Actions */}
                      <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* STAGE 2: SEND TO STUDENTS */}
                          {a.status === 'Draft' ? (
                            <button
                              type="button"
                              onClick={() => handleSendToStudents(a)}
                              title="Send Assignment to Batch Students"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#2B1B54] text-white hover:bg-[#3b2575] font-label text-[11px] font-semibold shadow-xs transition-colors"
                            >
                              <span className="material-symbols-outlined text-[14px]">send</span>
                              <span>Send to Students</span>
                            </button>
                          ) : (
                            /* STAGE 3: EVALUATE & COMPLETE */
                            <button
                              type="button"
                              onClick={() => openEvaluationModal(a)}
                              title={a.status === 'Completed' ? 'Review & Update Grades' : 'Evaluate & Complete Assignment'}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-label text-[11px] font-semibold shadow-xs transition-colors ${
                                a.status === 'Completed'
                                  ? 'bg-green-700 text-white hover:bg-green-800'
                                  : 'bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary hover:bg-light-primary-container'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {a.status === 'Completed' ? 'verified' : 'fact_check'}
                              </span>
                              <span>{a.status === 'Completed' ? 'Review Results' : 'Complete It'}</span>
                            </button>
                          )}

                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => setViewingAssignment(a)}
                            title="View Assignment Details"
                            className="p-1 rounded text-light-on-surface-variant hover:bg-light-surface-container-low transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>

                          {/* Delete Assignment */}
                          <button
                            type="button"
                            onClick={() => handleDeleteAssignment(a.id, a.title)}
                            title="Delete Assignment"
                            className="p-1 rounded text-error hover:bg-error-container/20 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
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
      </section>

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE ASSIGNMENT                                                */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary inline-flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">assignment</span>
                </span>
                <h2 className="font-title text-base font-bold text-light-on-surface dark:text-dark-on-surface">
                  Create New Academic Assignment
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded text-light-on-surface-variant hover:bg-light-surface-container-low"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-5 flex flex-col gap-3.5 text-xs">
              <div>
                <label className="block font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Assignment Title <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newAssignmentForm.title}
                  onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, title: e.target.value })}
                  placeholder="e.g. Full-Stack E-Commerce REST API & Auth Middleware"
                  className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Target Cohort / Batch <span className="text-error">*</span>
                  </label>
                  <select
                    value={newAssignmentForm.batch_code}
                    onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, batch_code: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    {batchOptions.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Course Track Domain
                  </label>
                  <input
                    type="text"
                    value={newAssignmentForm.track}
                    onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, track: e.target.value })}
                    placeholder="e.g. Full-Stack Web Development"
                    className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={newAssignmentForm.total_marks}
                    onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, total_marks: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Passing Marks
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={newAssignmentForm.passing_marks}
                    onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, passing_marks: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Submission Deadline
                  </label>
                  <input
                    type="date"
                    value={newAssignmentForm.due_date}
                    onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, due_date: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Brief & Deliverable Instructions
                </label>
                <textarea
                  rows="3"
                  value={newAssignmentForm.description}
                  onChange={(e) => setNewAssignmentForm({ ...newAssignmentForm, description: e.target.value })}
                  placeholder="Explain instructions, GitHub repo submission format, and grading rubric..."
                  className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div>
                <label className="block font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Initial Status
                </label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="asn_status"
                      value="Draft"
                      checked={newAssignmentForm.status === 'Draft'}
                      onChange={() => setNewAssignmentForm({ ...newAssignmentForm, status: 'Draft' })}
                      className="text-light-primary focus:ring-0"
                    />
                    <span>Draft (Ready to dispatch later)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="asn_status"
                      value="Assigned"
                      checked={newAssignmentForm.status === 'Assigned'}
                      onChange={() => setNewAssignmentForm({ ...newAssignmentForm, status: 'Assigned' })}
                      className="text-light-primary focus:ring-0"
                    />
                    <span>Assigned (Dispatch immediately to students)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-light-outline-variant dark:border-dark-outline-variant mt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant font-label text-xs font-medium text-light-on-surface hover:bg-light-surface-container-low"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary font-label text-xs font-semibold shadow-xs hover:bg-light-primary-container"
                >
                  {isSubmitting ? 'Saving...' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: STAGE 3 - EVALUATION, GRADING & COMPLETION                       */}
      {/* ========================================================================= */}
      {evaluatingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-lg shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between bg-light-surface-container-low dark:bg-dark-surface-container">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-light-primary bg-light-primary-tint px-1.5 py-0.5 rounded">
                    {evaluatingAssignment.assignment_uid}
                  </span>
                  <h2 className="font-title text-base font-bold text-light-on-surface dark:text-dark-on-surface">
                    Assignment Grading & Completion
                  </h2>
                </div>
                <p className="font-body text-xs text-light-on-surface-variant mt-0.5">
                  {evaluatingAssignment.title} • Cohort: <span className="font-semibold">{evaluatingAssignment.batch_code}</span> • Max Marks: {evaluatingAssignment.total_marks || 100} • Pass: {evaluatingAssignment.passing_marks || 50}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoFillPassingScores}
                  className="px-2.5 py-1 rounded border border-light-outline-variant text-[11px] font-semibold text-light-primary bg-light-surface hover:bg-light-surface-container transition-colors inline-flex items-center gap-1"
                  title="Auto populate realistic scores for quick testing"
                >
                  <span className="material-symbols-outlined text-[14px]">bolt</span>
                  <span>Auto-Fill Passing Scores</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEvaluatingAssignment(null)}
                  className="p-1 rounded text-light-on-surface-variant hover:bg-light-surface-container"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Submissions Roster */}
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-light-surface-container-low dark:bg-dark-surface-container border-b border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant font-semibold">
                    <th className="px-3 py-2">Candidate Info</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Score ({evaluatingAssignment.total_marks || 100})</th>
                    <th className="px-3 py-2">Evaluator Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-outline-variant/50 font-body">
                  {evaluatingAssignment.student_submissions.map((st, idx) => (
                    <tr key={idx} className="hover:bg-light-surface-container-low/40">
                      {/* Candidate */}
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <div className="font-semibold text-light-on-surface dark:text-dark-on-surface">
                          {st.full_name}
                        </div>
                        <div className="font-mono text-[11px] text-light-on-surface-variant">
                          {st.student_id}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-2 py-2.5 whitespace-nowrap">
                        <select
                          value={st.status || 'Pending'}
                          onChange={(e) => handleStudentStatusChange(idx, e.target.value)}
                          className={`px-2 py-1 text-xs rounded font-semibold border ${
                            st.status === 'Evaluated'
                              ? 'bg-green-50 text-green-700 border-green-300'
                              : st.status === 'Submitted'
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : 'bg-gray-50 text-gray-700 border-gray-300'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Submitted">Submitted</option>
                          <option value="Evaluated">Evaluated</option>
                        </select>
                      </td>

                      {/* Score */}
                      <td className="px-2 py-2.5 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max={evaluatingAssignment.total_marks || 100}
                          value={st.score !== null && st.score !== undefined ? st.score : ''}
                          onChange={(e) => handleStudentScoreChange(idx, e.target.value)}
                          placeholder="Score"
                          className="w-20 px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-light-primary"
                        />
                      </td>

                      {/* Remarks */}
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={st.remarks || ''}
                          onChange={(e) => handleStudentRemarkChange(idx, e.target.value)}
                          placeholder="Feedback & notes..."
                          className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer Summary & Complete Button */}
            <div className="px-5 py-3 border-t border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4 text-light-on-surface-variant">
                <span>
                  Total: <strong className="text-light-on-surface dark:text-dark-on-surface">{evaluatingAssignment.student_submissions.length}</strong>
                </span>
                <span>
                  Evaluated: <strong className="text-green-600">{evaluatingAssignment.student_submissions.filter((s) => s.status === 'Evaluated' && typeof s.score === 'number').length}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setEvaluatingAssignment(null)}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 rounded border border-light-outline-variant text-light-on-surface hover:bg-light-surface font-label text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCompleteAssignmentAndPublish}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-green-700 text-white hover:bg-green-800 font-label text-xs font-semibold shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>{isSubmitting ? 'Finalizing...' : 'Complete Assignment & Publish Grades'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIEW ASSIGNMENT DETAILS                                          */}
      {/* ========================================================================= */}
      {viewingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-light-primary bg-light-primary-tint px-1.5 py-0.5 rounded">
                  {viewingAssignment.assignment_uid}
                </span>
                <h2 className="font-title text-base font-bold text-light-on-surface dark:text-dark-on-surface mt-1">
                  {viewingAssignment.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingAssignment(null)}
                className="p-1 rounded text-light-on-surface-variant hover:bg-light-surface-container-low"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto text-xs flex flex-col gap-3.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-light-surface-container-low dark:bg-dark-surface-container p-3 rounded">
                <div>
                  <span className="text-light-on-surface-variant">Cohort:</span>
                  <p className="font-bold text-light-on-surface dark:text-dark-on-surface">{viewingAssignment.batch_code}</p>
                </div>
                <div>
                  <span className="text-light-on-surface-variant">Track:</span>
                  <p className="font-bold text-light-on-surface dark:text-dark-on-surface">{viewingAssignment.track}</p>
                </div>
                <div>
                  <span className="text-light-on-surface-variant">Deadline:</span>
                  <p className="font-bold text-light-on-surface dark:text-dark-on-surface">{viewingAssignment.due_date}</p>
                </div>
                <div>
                  <span className="text-light-on-surface-variant">Total Marks:</span>
                  <p className="font-bold text-light-on-surface dark:text-dark-on-surface">{viewingAssignment.total_marks || 100} (Pass: {viewingAssignment.passing_marks || 50})</p>
                </div>
              </div>

              <div>
                <h4 className="font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Description & Deliverable Guidelines
                </h4>
                <p className="font-body text-xs text-light-on-surface-variant bg-light-surface-container-low dark:bg-dark-surface-container p-2.5 rounded border border-light-outline-variant">
                  {viewingAssignment.description || 'No special instructions.'}
                </p>
              </div>

              <div>
                <h4 className="font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-2">
                  Enrolled Candidates & Submissions ({Array.isArray(viewingAssignment.student_submissions) ? viewingAssignment.student_submissions.length : 0})
                </h4>
                {Array.isArray(viewingAssignment.student_submissions) && viewingAssignment.student_submissions.length > 0 ? (
                  <div className="divide-y divide-light-outline-variant/60 border border-light-outline-variant rounded">
                    {viewingAssignment.student_submissions.map((st, i) => (
                      <div key={i} className="px-3 py-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-light-on-surface dark:text-dark-on-surface">{st.full_name}</span>
                          <span className="font-mono text-light-outline ml-2">({st.student_id})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {st.score !== null && typeof st.score === 'number' ? (
                            <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                              {st.score}/{viewingAssignment.total_marks || 100} pts
                            </span>
                          ) : (
                            <span className="text-light-outline italic">{st.status}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-light-on-surface-variant italic">No students assigned yet. Click "Send to Students" to dispatch this assignment.</p>
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-light-outline-variant dark:border-dark-outline-variant flex justify-end">
              <button
                type="button"
                onClick={() => setViewingAssignment(null)}
                className="px-4 py-1.5 rounded bg-light-primary text-light-on-primary font-label text-xs font-semibold"
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

export default AssignmentManagement
