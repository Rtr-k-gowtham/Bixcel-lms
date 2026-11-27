import React, { useState, useEffect, useMemo } from 'react'
import { apiService } from '../../services/api'

const CLASSROOM_OPTIONS = [
  { name: 'Design Room 302', capacity: 28 },
  { name: 'Studio Lab 204', capacity: 30 },
  { name: 'Lab 101', capacity: 28 },
  { name: 'Lab 102', capacity: 25 },
  { name: 'Analytics Hub 105', capacity: 20 },
  { name: 'Cybersecurity Lab 401', capacity: 24 },
]

const COURSE_PRESETS = [
  { name: 'UI/UX Product Design', duration: '45 Days', codePrefix: 'BIX-UX-26' },
  { name: 'Graphic Design Master Course', duration: '52 Days', codePrefix: 'BIX-GD-26' },
  { name: 'Full-Stack Web Engineering', duration: '90 Days', codePrefix: 'BIX-FS-26' },
  { name: 'Data Science & Analytics', duration: '75 Days', codePrefix: 'BIX-DS-26' },
  { name: 'Cloud & DevOps Engineering', duration: '60 Days', codePrefix: 'BIX-CLD-26' },
  { name: 'Cybersecurity Operations', duration: '70 Days', codePrefix: 'BIX-SEC-26' },
]

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'ST'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'ST'
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

export function BatchManagement() {
  const [batches, setBatches] = useState([])
  const [students, setStudents] = useState([])
  const [coursesList, setCoursesList] = useState([])
  const [tutorsList, setTutorsList] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [toast, setToast] = useState('')

  // Create / Edit Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingBatch, setEditingBatch] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    course: '',
    start: new Date().toISOString().substring(0, 10),
    end: new Date(Date.now() + 75 * 86400000).toISOString().substring(0, 10),
    capacity: 30,
    room: 'Lab 101',
    status: 'Enrolling',
    primary_tutor: '',
    co_tutor: 'Unassigned',
  })

  // Student Allocation & Roster Modal State
  const [managingBatch, setManagingBatch] = useState(null)
  const [rosterTab, setRosterTab] = useState('enrolled') // 'enrolled' | 'add'
  const [studentSearch, setStudentSearch] = useState('')
  const [studentTrackFilter, setStudentTrackFilter] = useState('all')
  const [unassignedOnly, setUnassignedOnly] = useState(false)
  const [selectedStudentCodes, setSelectedStudentCodes] = useState([])
  const [isAssigning, setIsAssigning] = useState(false)

  // Load all required data on mount
  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [batchesRes, studentsRes, coursesRes, tutorsRes] = await Promise.allSettled([
        apiService.getBatches(),
        apiService.getStudents(),
        apiService.getCourses(),
        apiService.getTutors(),
      ])

      if (batchesRes.status === 'fulfilled' && batchesRes.value?.data && Array.isArray(batchesRes.value.data)) {
        setBatches(batchesRes.value.data)
      } else {
        setBatches([])
      }

      if (studentsRes.status === 'fulfilled' && studentsRes.value?.data && Array.isArray(studentsRes.value.data)) {
        setStudents(studentsRes.value.data)
      } else {
        setStudents([])
      }

      if (coursesRes.status === 'fulfilled' && coursesRes.value?.data && Array.isArray(coursesRes.value.data)) {
        setCoursesList(coursesRes.value.data)
      }

      if (tutorsRes.status === 'fulfilled' && tutorsRes.value?.data && Array.isArray(tutorsRes.value.data)) {
        setTutorsList(tutorsRes.value.data)
      }
    } catch (err) {
      console.warn('Error fetching batch data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Handle Create / Edit Open
  const handleOpenCreate = () => {
    setEditingBatch(null)
    const defaultCourse = coursesList[0]?.title || COURSE_PRESETS[0].name
    const preset = COURSE_PRESETS.find((p) => p.name === defaultCourse)
    const codePrefix = preset ? preset.codePrefix : 'BIX-BATCH'
    const code = `${codePrefix}-${101 + batches.length}`

    setFormData({
      name: `${defaultCourse} Cohort`,
      code,
      course: defaultCourse,
      start: new Date().toISOString().substring(0, 10),
      end: new Date(Date.now() + 75 * 86400000).toISOString().substring(0, 10),
      capacity: 30,
      room: 'Lab 101',
      status: 'Enrolling',
      primary_tutor: tutorsList[0]?.name || 'Unassigned',
      co_tutor: 'Unassigned',
    })
    setShowModal(true)
  }

  const handleOpenEdit = (batch) => {
    setEditingBatch(batch)
    setFormData({
      name: batch.name || '',
      code: batch.code || '',
      course: batch.course || '',
      start: batch.start || new Date().toISOString().substring(0, 10),
      end: batch.end || new Date(Date.now() + 75 * 86400000).toISOString().substring(0, 10),
      capacity: batch.capacity || 30,
      room: batch.room || 'Lab 101',
      status: batch.status || 'Enrolling',
      primary_tutor: batch.primary_tutor || '',
      co_tutor: batch.co_tutor || 'Unassigned',
    })
    setShowModal(true)
  }

  // Course preset selection in form
  const handleCourseChange = (courseName) => {
    const preset = COURSE_PRESETS.find((p) => p.name === courseName)
    const newCode = preset ? `${preset.codePrefix}-${String.fromCharCode(65 + batches.length)}` : formData.code
    setFormData({
      ...formData,
      course: courseName,
      name: `${courseName} Cohort`,
      code: editingBatch ? formData.code : newCode,
    })
  }

  // Save Batch (Create / Update)
  const handleSaveBatch = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.course) {
      alert('Please fill in the Batch Name and select a Course.')
      return
    }

    try {
      if (editingBatch) {
        await apiService.updateBatch(editingBatch.id, formData).catch(() => null)
        setBatches((prev) =>
          prev.map((b) => (b.id === editingBatch.id ? { ...b, ...formData } : b))
        )
        setToast(`Batch ${formData.code} updated successfully.`)
      } else {
        const payload = {
          ...formData,
          enrolled: 0,
        }
        const res = await apiService.createBatch(payload).catch(() => null)
        if (res && res.data) {
          setBatches((prev) => [res.data, ...prev])
        } else {
          const mockNew = {
            id: Date.now(),
            ...payload,
          }
          setBatches((prev) => [mockNew, ...prev])
        }
        setToast(`New batch ${formData.code} created successfully.`)
      }
      setShowModal(false)
    } catch (err) {
      alert(err.message || 'Failed to save batch.')
    } finally {
      setTimeout(() => setToast(''), 4000)
    }
  }

  // Delete Batch
  const handleDeleteBatch = async (id, code) => {
    if (!confirm(`Are you sure you want to remove batch "${code}"?`)) return
    try {
      await apiService.deleteBatch(id).catch(() => null)
      setBatches((prev) => prev.filter((b) => b.id !== id))
      setToast(`Batch ${code} removed successfully.`)
    } catch {
      alert('Failed to delete batch')
    } finally {
      setTimeout(() => setToast(''), 4000)
    }
  }

  // Open Student Allocation Modal
  const handleOpenStudentManager = (batch) => {
    setManagingBatch(batch)
    setRosterTab('enrolled')
    setSelectedStudentCodes([])
    setStudentSearch('')
    setStudentTrackFilter('all')
    setUnassignedOnly(false)
  }

  // Close Student Allocation Modal
  const handleCloseStudentManager = () => {
    setManagingBatch(null)
    setSelectedStudentCodes([])
    setStudentSearch('')
  }

  // Toggle selection for a single student code
  const handleToggleSelectStudent = (code) => {
    setSelectedStudentCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  // Assign Selected Students to Managing Batch
  const handleAssignSelectedStudents = async () => {
    if (!managingBatch || selectedStudentCodes.length === 0) return
    setIsAssigning(true)
    const batchCode = managingBatch.code
    const count = selectedStudentCodes.length

    try {
      await apiService.assignBatchStudents({
        batch_code: batchCode,
        student_codes: selectedStudentCodes,
      })

      // Update local students list
      setStudents((prev) =>
        prev.map((s) =>
          selectedStudentCodes.includes(s.student_id) ? { ...s, batch: batchCode } : s
        )
      )

      // Update batches enrolled count
      setBatches((prev) =>
        prev.map((b) =>
          b.code === batchCode ? { ...b, enrolled: (b.enrolled || 0) + count } : b
        )
      )

      // Update current managing batch state
      setManagingBatch((prev) => ({
        ...prev,
        enrolled: (prev.enrolled || 0) + count,
      }))

      setSelectedStudentCodes([])
      setRosterTab('enrolled')
      setToast(`Successfully enrolled ${count} onboarded student(s) into ${batchCode}.`)
    } catch (err) {
      alert(err.message || 'Failed to assign students to batch.')
    } finally {
      setIsAssigning(false)
      setTimeout(() => setToast(''), 4000)
    }
  }

  // Remove a student from batch
  const handleRemoveStudentFromBatch = async (studentCode) => {
    if (!managingBatch) return
    if (!confirm(`Are you sure you want to remove student ${studentCode} from ${managingBatch.code}?`)) return

    try {
      await apiService.removeBatchStudent({
        batch_code: managingBatch.code,
        student_code: studentCode,
      })

      // Update local students
      setStudents((prev) =>
        prev.map((s) =>
          s.student_id === studentCode ? { ...s, batch: 'Unassigned' } : s
        )
      )

      // Update batches enrolled count
      setBatches((prev) =>
        prev.map((b) =>
          b.code === managingBatch.code
            ? { ...b, enrolled: Math.max(0, (b.enrolled || 0) - 1) }
            : b
        )
      )

      // Update current managing batch state
      setManagingBatch((prev) => ({
        ...prev,
        enrolled: Math.max(0, (prev.enrolled || 0) - 1),
      }))

      setToast(`Student ${studentCode} unassigned from ${managingBatch.code}.`)
    } catch (err) {
      alert(err.message || 'Failed to remove student from batch.')
    } finally {
      setTimeout(() => setToast(''), 4000)
    }
  }

  // Students enrolled in managingBatch
  const enrolledStudentsInBatch = useMemo(() => {
    if (!managingBatch) return []
    return students.filter((s) => s.batch === managingBatch.code)
  }, [students, managingBatch])

  // Filtered enrolled students by search
  const filteredEnrolledStudents = useMemo(() => {
    if (!studentSearch.trim()) return enrolledStudentsInBatch
    const q = studentSearch.toLowerCase()
    return enrolledStudentsInBatch.filter(
      (s) =>
        s.full_name?.toLowerCase().includes(q) ||
        s.student_id?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q)
    )
  }, [enrolledStudentsInBatch, studentSearch])

  // Available onboarded students for allocation
  const availableOnboardedStudents = useMemo(() => {
    if (!managingBatch) return []
    return students.filter((s) => {
      // Must not already be enrolled in THIS batch
      if (s.batch === managingBatch.code) return false

      if (unassignedOnly && s.batch && s.batch !== 'Unassigned') return false

      if (studentTrackFilter !== 'all' && s.track !== studentTrackFilter) return false

      if (studentSearch.trim()) {
        const q = studentSearch.toLowerCase()
        const match =
          s.full_name?.toLowerCase().includes(q) ||
          s.student_id?.toLowerCase().includes(q) ||
          s.phone?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.track?.toLowerCase().includes(q)
        if (!match) return false
      }

      return true
    })
  }, [students, managingBatch, unassignedOnly, studentTrackFilter, studentSearch])

  // Filter batches for main directory table
  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const q = search.toLowerCase()
      const matchesSearch =
        !q ||
        b.code?.toLowerCase().includes(q) ||
        b.name?.toLowerCase().includes(q) ||
        b.course?.toLowerCase().includes(q) ||
        b.primary_tutor?.toLowerCase().includes(q) ||
        b.room?.toLowerCase().includes(q)
      const matchesCourse = courseFilter === 'all' || b.course === courseFilter
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter
      return matchesSearch && matchesCourse && matchesStatus
    })
  }, [batches, search, courseFilter, statusFilter])

  // Aggregate metrics
  const totalBatchesCount = batches.length
  const totalEnrolled = batches.reduce((acc, curr) => acc + (curr.enrolled || 0), 0)
  const totalCapacity = batches.reduce((acc, curr) => acc + (curr.capacity || 0), 0)
  const seatUtilization = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0
  const activeBatchesCount = batches.filter((b) => b.status === 'Active').length
  const enrollingCount = batches.filter((b) => b.status === 'Enrolling').length
  const remainingSeats = Math.max(0, totalCapacity - totalEnrolled)

  // Status badge style helper
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-success-container text-on-success-container'
      case 'Enrolling':
        return 'bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint'
      case 'Upcoming':
        return 'bg-pending-container text-on-pending-container'
      case 'Completed':
        return 'bg-light-surface-container dark:bg-dark-surface-container text-light-on-surface-variant'
      default:
        return 'bg-light-surface-container text-light-on-surface-variant'
    }
  }

  // Room capacity check for create modal
  const selectedRoom = CLASSROOM_OPTIONS.find((r) => r.name === formData.room) || { capacity: 30 }
  const roomExceeded = Number(formData.capacity) > selectedRoom.capacity

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

      {/* Screen Header & Action Bar (Matching Student Master & Tutor Master) */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-3 rounded-md shadow-xs">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-light-primary text-[18px]">workspaces</span>
            <h1 className="font-title text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface">
              Batch Management &amp; Cohort Allocation
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint font-mono text-[10px] font-bold">
              {totalBatchesCount} Batches
            </span>
          </div>
          <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Manage cohort schedules, seat capacities, faculty leads, and assign onboarded students directly to batches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container shadow-xs font-label text-xs font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Create Batch</span>
          </button>
        </div>
      </section>

      {/* 4 KPI Metrics Grid (matching UI reference) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Active Batches</span>
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-[18px] font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                {activeBatchesCount}
              </span>
              <span className="text-[10px] text-on-success-container bg-success-container px-1 py-0.2 rounded font-semibold">
                {enrollingCount} Enrolling
              </span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">workspaces</span>
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Enrolled Students</span>
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-[18px] font-bold text-light-primary dark:text-dark-primary tabular-nums">
                {totalEnrolled}
              </span>
              <span className="text-[10px] text-light-on-surface-variant font-medium">
                in active cohorts
              </span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-light-secondary-container text-light-on-secondary-container inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">groups</span>
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Seat Utilization</span>
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-[18px] font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                {seatUtilization}%
              </span>
              <span className="text-[10px] text-on-success-container bg-success-container px-1 py-0.2 rounded font-semibold">
                {totalCapacity} Capacity
              </span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-success-container text-on-success-container inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">event_seat</span>
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Available Seats</span>
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-[18px] font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                {remainingSeats}
              </span>
              <span className="text-[10px] text-light-on-surface-variant font-medium">Open for onboarding</span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-pending-container text-on-pending-container inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">meeting_room</span>
          </span>
        </article>
      </section>

      {/* Search & Filter Toolbar */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="relative flex items-center w-full sm:w-64">
          <span className="material-symbols-outlined text-[16px] text-light-outline absolute left-2.5 pointer-events-none">
            search
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Batch ID, course, tutor, room..."
            className="w-full pl-8 pr-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            aria-label="Course filter"
            className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
          >
            <option value="all">All Courses</option>
            {COURSE_PRESETS.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Status filter"
            className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Enrolling">Enrolling</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>

          {(search || courseFilter !== 'all' || statusFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setCourseFilter('all')
                setStatusFilter('all')
              }}
              className="px-2 py-1 text-xs text-light-primary hover:underline font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </section>

      {/* Batches Table (High Density Single-Row Layout) */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/70 dark:bg-dark-surface-container/70 text-[11px] font-semibold text-light-on-surface-variant dark:text-dark-on-surface-variant uppercase tracking-wider">
              <th className="py-2 px-3 whitespace-nowrap">Batch ID</th>
              <th className="py-2 px-3 whitespace-nowrap">Course Track</th>
              <th className="py-2 px-3 whitespace-nowrap">Faculty Lead</th>
              <th className="py-2 px-3 whitespace-nowrap">Schedule</th>
              <th className="py-2 px-3 whitespace-nowrap">Venue / Classroom</th>
              <th className="py-2 px-3 whitespace-nowrap">Enrolled / Capacity</th>
              <th className="py-2 px-3 whitespace-nowrap text-center">Status</th>
              <th className="py-2 px-3 whitespace-nowrap text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-outline-variant/60 dark:divide-dark-outline-variant/60 text-xs">
            {filteredBatches.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-12 text-center text-light-on-surface-variant">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="material-symbols-outlined text-[32px] opacity-40">workspaces</span>
                    <span className="font-semibold text-xs">No batches found</span>
                    <span className="text-[11px] opacity-70">Try adjusting your search criteria or create a new batch</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredBatches.map((b) => {
                const pct = b.capacity > 0 ? Math.round(((b.enrolled || 0) / b.capacity) * 100) : 0
                return (
                  <tr
                    key={b.id || b.code}
                    className="hover:bg-light-surface-container-low/50 dark:hover:bg-dark-surface-container/50 transition-colors"
                  >
                    {/* Batch Code */}
                    <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-light-primary/10 dark:bg-dark-primary/20 text-light-primary dark:text-dark-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[15px]">workspaces</span>
                        </div>
                        <span className="font-mono text-xs font-bold text-light-primary dark:text-dark-primary">
                          {b.code}
                        </span>
                      </div>
                    </td>

                    {/* Course Track */}
                    <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                      <div className="flex flex-col">
                        <span className="font-body text-xs font-semibold text-light-on-surface dark:text-dark-on-surface">
                          {b.course}
                        </span>
                        {b.name && b.name !== b.course && (
                          <span className="text-[10px] text-light-on-surface-variant truncate max-w-[180px]">
                            {b.name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Faculty Lead */}
                    <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                      <div className="flex items-center gap-1.5">
                        <span className="font-body text-xs font-medium text-light-on-surface dark:text-dark-on-surface">
                          {b.primary_tutor || 'Unassigned'}
                        </span>
                        {b.co_tutor && b.co_tutor !== 'Unassigned' && (
                          <span className="text-[10px] text-light-on-surface-variant font-normal">
                            (+ {b.co_tutor})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                      <span className="font-mono text-xs text-light-on-surface dark:text-dark-on-surface tabular-nums">
                        {b.start} → {b.end}
                      </span>
                    </td>

                    {/* Venue / Classroom */}
                    <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                      <span className="px-2 py-0.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-[11px] font-medium text-light-on-surface-variant">
                        {b.room || 'Lab 101'}
                      </span>
                    </td>

                    {/* Enrolled / Capacity */}
                    <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                      <div className="flex flex-col gap-1 w-28">
                        <div className="flex items-center justify-between tabular-nums">
                          <span className="font-label text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface">
                            {b.enrolled || 0} / {b.capacity}
                          </span>
                          <span className="font-label text-[10px] text-light-on-surface-variant">
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-light-surface-container dark:bg-dark-surface-container overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct >= 100
                                ? 'bg-overdue'
                                : pct >= 80
                                ? 'bg-light-primary dark:bg-dark-primary'
                                : 'bg-success'
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 whitespace-nowrap align-middle text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-label text-[10px] font-bold ${getStatusBadge(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 whitespace-nowrap align-middle text-right">
                      <div className="inline-flex items-center gap-1">
                        {/* Manage Students Roster Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenStudentManager(b)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint hover:bg-light-primary hover:text-white transition-colors font-label text-[11px] font-semibold whitespace-nowrap"
                          title="Manage Onboarded Students & Roster"
                        >
                          <span className="material-symbols-outlined text-[15px]">groups</span>
                          <span>Students ({b.enrolled || 0})</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(b)}
                          className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container-low"
                          title="Edit Batch"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteBatch(b.id, b.code)}
                          className="p-1 rounded text-light-on-surface-variant hover:text-overdue hover:bg-overdue-container/40"
                          title="Delete Batch"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </section>

      {/* ===================================================================== */}
      {/* STUDENT ALLOCATION & ROSTER MODAL                                    */}
      {/* ===================================================================== */}
      {managingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright rounded-lg border border-light-outline-variant dark:border-dark-outline-variant shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-sidebar text-on-sidebar flex items-center justify-between border-b border-sidebar-surface">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-light-primary">groups</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-title text-[15px] font-bold text-white">
                      Batch Student Roster &amp; Allocation
                    </h3>
                    <span className="px-2 py-0.5 rounded bg-light-primary text-white font-mono text-xs font-bold">
                      {managingBatch.code}
                    </span>
                  </div>
                  <span className="text-[11px] text-sidebar-muted">
                    {managingBatch.course} · {managingBatch.enrolled || 0} / {managingBatch.capacity} Seats Occupied · Room: {managingBatch.room}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseStudentManager}
                className="text-white/70 hover:text-white p-1 rounded transition-colors"
                title="Close"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Tabs Strip */}
            <div className="flex items-center justify-between px-5 py-2 border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/50 dark:bg-dark-surface-container/40">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setRosterTab('enrolled')
                    setStudentSearch('')
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                    rosterTab === 'enrolled'
                      ? 'bg-light-primary text-light-on-primary shadow-xs'
                      : 'text-light-on-surface-variant hover:bg-light-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">badge</span>
                  <span>Enrolled Students ({enrolledStudentsInBatch.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRosterTab('add')
                    setStudentSearch('')
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                    rosterTab === 'add'
                      ? 'bg-light-primary text-light-on-primary shadow-xs'
                      : 'text-light-on-surface-variant hover:bg-light-surface-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">person_add</span>
                  <span>Add Onboarded Students</span>
                  {selectedStudentCodes.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-light-on-primary text-light-primary font-bold text-[10px]">
                      {selectedStudentCodes.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Remaining Seats Pill */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs">
                <span className="text-light-on-surface-variant">Available Seats:</span>
                <span className="font-mono font-bold text-success">
                  {Math.max(0, (managingBatch.capacity || 30) - (managingBatch.enrolled || 0))} open
                </span>
              </div>
            </div>

            {/* Tab 1: ENROLLED STUDENTS IN THIS BATCH */}
            {rosterTab === 'enrolled' && (
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {/* Search Bar for Enrolled Students */}
                <div className="flex items-center justify-between gap-2">
                  <div className="relative flex items-center w-full sm:w-72">
                    <span className="material-symbols-outlined text-[16px] text-light-outline absolute left-2.5 pointer-events-none">
                      search
                    </span>
                    <input
                      type="search"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search enrolled students..."
                      className="w-full pl-8 pr-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setRosterTab('add')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint font-label text-xs font-semibold hover:bg-light-primary hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    <span>Enroll More Students</span>
                  </button>
                </div>

                {filteredEnrolledStudents.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-center text-light-on-surface-variant">
                    <span className="material-symbols-outlined text-[36px] opacity-40">groups</span>
                    <span className="font-semibold text-xs">No students enrolled in this batch yet</span>
                    <p className="text-[11px] max-w-sm opacity-70">
                      Switch to the &ldquo;Add Onboarded Students&rdquo; tab to choose from your onboarded students and assign them to this batch.
                    </p>
                    <button
                      type="button"
                      onClick={() => setRosterTab('add')}
                      className="mt-1 px-3 py-1.5 rounded bg-light-primary text-light-on-primary font-semibold text-xs transition-colors hover:bg-light-primary-container"
                    >
                      Browse Onboarded Students
                    </button>
                  </div>
                ) : (
                  <div className="border border-light-outline-variant dark:border-dark-outline-variant rounded overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-light-surface-container-low/70 dark:bg-dark-surface-container/70 border-b border-light-outline-variant dark:border-dark-outline-variant text-[11px] font-semibold text-light-on-surface-variant uppercase tracking-wider">
                          <th className="py-2 px-3">Student</th>
                          <th className="py-2 px-3">Student ID</th>
                          <th className="py-2 px-3">Contact</th>
                          <th className="py-2 px-3">Track</th>
                          <th className="py-2 px-3 text-center">Status</th>
                          <th className="py-2 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-light-outline-variant/60 dark:divide-dark-outline-variant/60">
                        {filteredEnrolledStudents.map((s) => {
                          const initials = getInitials(s.full_name)
                          return (
                            <tr
                              key={s.id || s.student_id}
                              className="hover:bg-light-surface-container-low/50 dark:hover:bg-dark-surface-container/50 transition-colors"
                            >
                              <td className="py-2 px-3 whitespace-nowrap align-middle">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-light-primary text-light-on-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                                    {initials}
                                  </div>
                                  <span className="font-semibold text-xs text-light-on-surface dark:text-dark-on-surface">
                                    {s.full_name}
                                  </span>
                                </div>
                              </td>

                              <td className="py-2 px-3 whitespace-nowrap align-middle font-mono text-light-primary dark:text-dark-primary font-bold">
                                {s.student_id}
                              </td>

                              <td className="py-2 px-3 whitespace-nowrap align-middle">
                                <div className="flex flex-col">
                                  <span className="font-mono text-[11px] text-light-on-surface dark:text-dark-on-surface">
                                    {s.phone || '—'}
                                  </span>
                                  <span className="text-[10px] text-light-on-surface-variant truncate max-w-[130px]">
                                    {s.email || '—'}
                                  </span>
                                </div>
                              </td>

                              <td className="py-2 px-3 whitespace-nowrap align-middle">
                                <span className="font-body text-xs text-light-on-surface dark:text-dark-on-surface">
                                  {s.track || managingBatch.course}
                                </span>
                              </td>

                              <td className="py-2 px-3 whitespace-nowrap align-middle text-center">
                                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-container text-on-success-container">
                                  {s.status || 'Active'}
                                </span>
                              </td>

                              <td className="py-2 px-3 whitespace-nowrap align-middle text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStudentFromBatch(s.student_id)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded border border-overdue/30 text-overdue hover:bg-overdue-container/40 transition-colors font-label text-[11px] font-semibold"
                                  title="Unassign from this batch"
                                >
                                  <span className="material-symbols-outlined text-[14px]">person_remove</span>
                                  <span>Remove</span>
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: ADD ONBOARDED STUDENTS */}
            {rosterTab === 'add' && (
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {/* Available Capacity Indicator */}
                <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-light-primary text-[18px]">info</span>
                    <div>
                      <span className="font-semibold text-light-on-surface dark:text-dark-on-surface">
                        Select Onboarded Students to Enroll
                      </span>
                      <p className="text-[11px] text-light-on-surface-variant">
                        Select students below and confirm enrollment into cohort <span className="font-mono font-bold">{managingBatch.code}</span>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-semibold text-light-on-surface dark:text-dark-on-surface">
                      Selected: <span className="text-light-primary font-bold">{selectedStudentCodes.length}</span>
                    </span>
                    <span className="text-light-outline">|</span>
                    <span className="font-mono font-semibold text-success">
                      Remaining Capacity: {Math.max(0, (managingBatch.capacity || 30) - (managingBatch.enrolled || 0))}
                    </span>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="relative flex items-center w-full sm:w-64">
                    <span className="material-symbols-outlined text-[16px] text-light-outline absolute left-2.5 pointer-events-none">
                      search
                    </span>
                    <input
                      type="search"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="Search onboarded students..."
                      className="w-full pl-8 pr-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Unassigned Only Toggle */}
                    <label className="flex items-center gap-1.5 text-xs text-light-on-surface dark:text-dark-on-surface cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={unassignedOnly}
                        onChange={(e) => setUnassignedOnly(e.target.checked)}
                        className="rounded border-light-outline-variant text-light-primary focus:ring-light-primary"
                      />
                      <span>Unassigned Only</span>
                    </label>

                    {/* Track Filter */}
                    <select
                      value={studentTrackFilter}
                      onChange={(e) => setStudentTrackFilter(e.target.value)}
                      className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                    >
                      <option value="all">All Tracks</option>
                      {COURSE_PRESETS.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    {/* Select All Toggle */}
                    {availableOnboardedStudents.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const allCodes = availableOnboardedStudents.map((s) => s.student_id)
                          const allSelected = allCodes.every((c) => selectedStudentCodes.includes(c))
                          if (allSelected) {
                            setSelectedStudentCodes((prev) => prev.filter((c) => !allCodes.includes(c)))
                          } else {
                            setSelectedStudentCodes((prev) => Array.from(new Set([...prev, ...allCodes])))
                          }
                        }}
                        className="px-2 py-1 rounded border border-light-outline-variant text-xs font-semibold hover:bg-light-surface-container-low transition-colors"
                      >
                        {availableOnboardedStudents.every((s) => selectedStudentCodes.includes(s.student_id))
                          ? 'Deselect All'
                          : 'Select All Filtered'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Available Students List / Table */}
                {availableOnboardedStudents.length === 0 ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-center text-light-on-surface-variant">
                    <span className="material-symbols-outlined text-[36px] opacity-40">person_search</span>
                    <span className="font-semibold text-xs">No onboarded students match the filters</span>
                    <span className="text-[11px] opacity-70">
                      Try unchecking &ldquo;Unassigned Only&rdquo; or clearing the search query.
                    </span>
                  </div>
                ) : (
                  <div className="border border-light-outline-variant dark:border-dark-outline-variant rounded overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-light-surface-container-low/70 dark:bg-dark-surface-container/70 border-b border-light-outline-variant dark:border-dark-outline-variant text-[11px] font-semibold text-light-on-surface-variant uppercase tracking-wider">
                          <th className="py-2 px-3 w-8">
                            <span className="sr-only">Select</span>
                          </th>
                          <th className="py-2 px-3">Student Name</th>
                          <th className="py-2 px-3">Student ID</th>
                          <th className="py-2 px-3">Current Batch</th>
                          <th className="py-2 px-3">Course Track</th>
                          <th className="py-2 px-3">Contact</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-light-outline-variant/60 dark:divide-dark-outline-variant/60">
                        {availableOnboardedStudents.map((s) => {
                          const isSelected = selectedStudentCodes.includes(s.student_id)
                          const initials = getInitials(s.full_name)
                          const currentBatch = s.batch || 'Unassigned'
                          const isUnassigned = currentBatch === 'Unassigned'

                          return (
                            <tr
                              key={s.id || s.student_id}
                              onClick={() => handleToggleSelectStudent(s.student_id)}
                              className={`cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-light-primary-tint/60 dark:bg-dark-primary-tint/40'
                                  : 'hover:bg-light-surface-container-low/50 dark:hover:bg-dark-surface-container/50'
                              }`}
                            >
                              <td className="py-2.5 px-3 align-middle">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectStudent(s.student_id)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="rounded border-light-outline-variant text-light-primary focus:ring-light-primary"
                                />
                              </td>

                              <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-light-primary text-light-on-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                                    {initials}
                                  </div>
                                  <span className="font-semibold text-xs text-light-on-surface dark:text-dark-on-surface">
                                    {s.full_name}
                                  </span>
                                </div>
                              </td>

                              <td className="py-2.5 px-3 whitespace-nowrap align-middle font-mono text-light-primary dark:text-dark-primary font-bold">
                                {s.student_id}
                              </td>

                              <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${
                                    isUnassigned
                                      ? 'bg-pending-container text-on-pending-container'
                                      : 'bg-light-surface-container dark:bg-dark-surface-container text-light-on-surface-variant'
                                  }`}
                                >
                                  {currentBatch}
                                </span>
                              </td>

                              <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                                <span className="font-body text-xs text-light-on-surface dark:text-dark-on-surface">
                                  {s.track || 'General'}
                                </span>
                              </td>

                              <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                                <span className="font-mono text-[11px] text-light-on-surface dark:text-dark-on-surface">
                                  {s.phone || s.email || '—'}
                                </span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Sticky Action Footer */}
                <div className="sticky bottom-0 bg-light-surface-container-lowest dark:bg-dark-surface-bright pt-3 pb-1 border-t border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-light-on-surface dark:text-dark-on-surface">
                      {selectedStudentCodes.length} student(s) selected
                    </span>
                    {selectedStudentCodes.length > Math.max(0, (managingBatch.capacity || 30) - (managingBatch.enrolled || 0)) && (
                      <span className="text-overdue font-semibold text-[11px]">
                        ⚠️ Exceeds remaining seats in this batch!
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setRosterTab('enrolled')}
                      className="px-3 py-1.5 rounded border border-light-outline-variant text-xs font-semibold hover:bg-light-surface-container-low transition-colors"
                    >
                      Back to Roster
                    </button>
                    <button
                      type="button"
                      disabled={selectedStudentCodes.length === 0 || isAssigning}
                      onClick={handleAssignSelectedStudents}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-light-primary text-light-on-primary font-semibold text-xs shadow-xs hover:bg-light-primary-container disabled:opacity-50 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isAssigning ? 'sync' : 'group_add'}
                      </span>
                      <span>
                        {isAssigning
                          ? 'Enrolling...'
                          : `Enroll Selected (${selectedStudentCodes.length}) into ${managingBatch.code}`}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CREATE & EDIT BATCH MODAL                                            */}
      {/* ===================================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright rounded-lg border border-light-outline-variant dark:border-dark-outline-variant shadow-xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-sidebar text-on-sidebar flex items-center justify-between border-b border-sidebar-surface">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-light-primary">
                  {editingBatch ? 'edit_note' : 'add_box'}
                </span>
                <h3 className="font-title text-title-md font-semibold text-white">
                  {editingBatch ? `Edit Batch: ${editingBatch.code}` : 'Create New Batch'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-white/80 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveBatch} className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Left 8 Cols: Identity & Schedule */}
                <div className="lg:col-span-8 flex flex-col gap-4">
                  <div className="p-4 rounded-md border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/40 dark:bg-dark-surface-container/30 flex flex-col gap-3">
                    <span className="font-label text-label-sm font-semibold uppercase text-light-on-surface-variant">
                      Batch Identity &amp; Course Track
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1">
                        <span className="font-label text-label-sm font-medium">Batch Name *</span>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container focus:outline-none focus:ring-1 focus:ring-light-primary"
                        />
                      </label>

                      <label className="flex flex-col gap-1">
                        <span className="font-label text-label-sm font-medium">Batch Code *</span>
                        <input
                          type="text"
                          required
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container font-mono text-mono-sm text-light-primary font-semibold focus:outline-none focus:ring-1 focus:ring-light-primary"
                        />
                      </label>
                    </div>

                    <label className="flex flex-col gap-1">
                      <span className="font-label text-label-sm font-medium">Published Course Selection *</span>
                      <select
                        value={formData.course}
                        onChange={(e) => handleCourseChange(e.target.value)}
                        className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container focus:outline-none focus:ring-1 focus:ring-light-primary"
                      >
                        {COURSE_PRESETS.map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.name} ({p.duration})
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="p-4 rounded-md border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/40 dark:bg-dark-surface-container/30 flex flex-col gap-3">
                    <span className="font-label text-label-sm font-semibold uppercase text-light-on-surface-variant">
                      Schedule, Classroom &amp; Capacity
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1">
                        <span className="font-label text-label-sm font-medium">Start Date</span>
                        <input
                          type="date"
                          value={formData.start}
                          onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                          className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container focus:outline-none focus:ring-1 focus:ring-light-primary"
                        />
                      </label>

                      <label className="flex flex-col gap-1">
                        <span className="font-label text-label-sm font-medium">End Date</span>
                        <input
                          type="date"
                          value={formData.end}
                          onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                          className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container focus:outline-none focus:ring-1 focus:ring-light-primary"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="flex flex-col gap-1">
                        <span className="font-label text-label-sm font-medium">Seat Limit</span>
                        <input
                          type="number"
                          min="5"
                          max="60"
                          value={formData.capacity}
                          onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                          className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container tabular-nums focus:outline-none focus:ring-1 focus:ring-light-primary"
                        />
                      </label>

                      <label className="flex flex-col gap-1 sm:col-span-2">
                        <span className="font-label text-label-sm font-medium">Assigned Classroom</span>
                        <select
                          value={formData.room}
                          onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                          className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container focus:outline-none focus:ring-1 focus:ring-light-primary"
                        >
                          {CLASSROOM_OPTIONS.map((c) => (
                            <option key={c.name} value={c.name}>
                              {c.name} (Max Capacity: {c.capacity})
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="flex flex-col gap-1">
                        <span className="font-label text-label-sm font-medium">Batch Status</span>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container focus:outline-none focus:ring-1 focus:ring-light-primary"
                        >
                          <option value="Enrolling">Enrolling</option>
                          <option value="Upcoming">Upcoming</option>
                          <option value="Active">Active</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </label>

                      <label className="flex flex-col gap-1">
                        <span className="font-label text-label-sm font-medium">Lead Tutor</span>
                        <input
                          type="text"
                          value={formData.primary_tutor}
                          onChange={(e) => setFormData({ ...formData, primary_tutor: e.target.value })}
                          className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container focus:outline-none focus:ring-1 focus:ring-light-primary"
                        />
                      </label>

                      <label className="flex flex-col gap-1">
                        <span className="font-label text-label-sm font-medium">Co-Tutor</span>
                        <input
                          type="text"
                          value={formData.co_tutor}
                          onChange={(e) => setFormData({ ...formData, co_tutor: e.target.value })}
                          className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container focus:outline-none focus:ring-1 focus:ring-light-primary"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right 4 Cols: Live Configuration Summary Card */}
                <aside className="lg:col-span-4 flex flex-col gap-3">
                  <div className="bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-4 shadow-sm flex flex-col gap-3">
                    <h4 className="font-title text-title-sm font-semibold text-light-on-surface dark:text-dark-on-surface">
                      Configuration Summary
                    </h4>

                    <div className="flex flex-col gap-2 p-3 rounded bg-light-surface-container-low dark:bg-dark-surface-container-high border border-light-outline-variant text-body-sm">
                      <div className="flex justify-between">
                        <span className="text-light-on-surface-variant">Course:</span>
                        <span className="font-medium text-light-on-surface dark:text-dark-on-surface text-right">
                          {formData.course}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-light-on-surface-variant">Room:</span>
                        <span className="font-medium">{formData.room}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-light-on-surface-variant">Room Max:</span>
                        <span className="font-mono">{selectedRoom.capacity} Seats</span>
                      </div>
                      <div className="flex justify-between border-t border-light-outline-variant pt-1.5">
                        <span className="text-light-on-surface-variant font-medium">Target Seats:</span>
                        <span className="font-mono font-bold text-light-primary dark:text-dark-primary">
                          {formData.capacity} Seats
                        </span>
                      </div>
                    </div>

                    {/* Capacity Alert */}
                    <div
                      className={`p-3 rounded flex items-center gap-2 text-body-sm ${
                        roomExceeded
                          ? 'bg-overdue-container text-on-overdue-container'
                          : 'bg-success-container/70 text-on-success-container'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {roomExceeded ? 'error' : 'check_circle'}
                      </span>
                      <span>
                        {roomExceeded
                          ? `Seat limit (${formData.capacity}) exceeds room capacity (${selectedRoom.capacity})!`
                          : `Room capacity fits selected seat limit.`}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 pt-2 border-t border-light-outline-variant">
                      <button
                        type="submit"
                        className="w-full py-2 px-4 rounded bg-light-primary hover:bg-light-primary-container text-light-on-primary font-semibold text-body-sm shadow-sm transition-colors"
                      >
                        {editingBatch ? 'Save Changes' : 'Create Batch'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="w-full py-2 px-4 rounded border border-light-outline-variant text-body-sm hover:bg-light-surface-container-low transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default BatchManagement
