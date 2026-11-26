import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

const DEFAULT_BATCHES = [
  {
    id: 1,
    code: 'BIX-GD-26A',
    name: 'Graphic Design Morning',
    course: 'Graphic Design Master Course',
    start: '2026-11-02',
    end: '2027-01-15',
    enrolled: 26,
    capacity: 30,
    primary_tutor: 'Marcus Vance',
    co_tutor: 'Priya Nair',
    room: 'Studio Lab 204',
    status: 'Active',
  },
  {
    id: 2,
    code: 'BIX-FS-26C',
    name: 'Full-Stack Cohort C',
    course: 'Full-Stack Web Engineering',
    start: '2026-11-10',
    end: '2027-03-24',
    enrolled: 28,
    capacity: 28,
    primary_tutor: 'Dr. Aris Thorne',
    co_tutor: 'Liam Chen',
    room: 'Lab 101',
    status: 'Active',
  },
  {
    id: 3,
    code: 'BIX-UX-26D',
    name: 'UI/UX Product Evening',
    course: 'UI/UX Product Design',
    start: '2026-12-01',
    end: '2027-02-18',
    enrolled: 19,
    capacity: 25,
    primary_tutor: 'Sofia Alvarez',
    co_tutor: 'Unassigned',
    room: 'Design Room 302',
    status: 'Enrolling',
  },
  {
    id: 4,
    code: 'BIX-DS-26E',
    name: 'Data Science Weekend',
    course: 'Data Science & Analytics',
    start: '2026-12-07',
    end: '2027-04-04',
    enrolled: 14,
    capacity: 30,
    primary_tutor: 'Dr. Aris Thorne',
    co_tutor: 'Maya Lin',
    room: 'Analytics Hub 105',
    status: 'Upcoming',
  },
  {
    id: 5,
    code: 'BIX-GD-26B',
    name: 'Graphic Design Afternoon',
    course: 'Graphic Design Master Course',
    start: '2026-08-18',
    end: '2026-10-30',
    enrolled: 24,
    capacity: 24,
    primary_tutor: 'Priya Nair',
    co_tutor: 'Marcus Vance',
    room: 'Studio Lab 204',
    status: 'Completed',
  },
  {
    id: 6,
    code: 'BIX-CLD-26F',
    name: 'Cloud & DevOps Accelerated',
    course: 'Cloud & DevOps Engineering',
    start: '2026-12-15',
    end: '2027-03-30',
    enrolled: 12,
    capacity: 25,
    primary_tutor: 'Tariq Al-Mansoor',
    co_tutor: 'Chen Wei',
    room: 'Lab 102',
    status: 'Enrolling',
  },
]

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

export function BatchManagement() {
  const [batches, setBatches] = useState(DEFAULT_BATCHES)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Create / Edit Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingBatch, setEditingBatch] = useState(null)
  const [formData, setFormData] = useState({
    name: 'UI/UX Product Design Cohort D',
    code: 'BIX-UX-26D',
    course: 'UI/UX Product Design',
    start: '2026-12-01',
    end: '2027-02-18',
    capacity: 25,
    room: 'Design Room 302',
    status: 'Enrolling',
    primary_tutor: 'Sofia Alvarez',
    co_tutor: 'Unassigned',
  })

  // Quick Enrollment Modal State
  const [enrollingBatch, setEnrollingBatch] = useState(null)
  const [newStudentName, setNewStudentName] = useState('')

  // Load from CI4 backend on mount
  useEffect(() => {
    fetchBatches()
  }, [])

  const fetchBatches = async () => {
    setLoading(true)
    try {
      const res = await apiService.getBatches()
      if (res && res.data && Array.isArray(res.data)) {
        setBatches(res.data)
      }
    } catch {
      // Keep default mock data
    } finally {
      setLoading(false)
    }
  }

  // Handle Create / Edit Open
  const handleOpenCreate = () => {
    setEditingBatch(null)
    setFormData({
      name: 'UI/UX Product Design Cohort G',
      code: `BIX-UX-26${String.fromCharCode(65 + batches.length)}`,
      course: 'UI/UX Product Design',
      start: new Date().toISOString().substring(0, 10),
      end: new Date(Date.now() + 75 * 86400000).toISOString().substring(0, 10),
      capacity: 25,
      room: 'Design Room 302',
      status: 'Enrolling',
      primary_tutor: 'Sofia Alvarez',
      co_tutor: 'Unassigned',
    })
    setShowModal(true)
  }

  const handleOpenEdit = (batch) => {
    setEditingBatch(batch)
    setFormData({
      name: batch.name,
      code: batch.code,
      course: batch.course,
      start: batch.start,
      end: batch.end,
      capacity: batch.capacity,
      room: batch.room,
      status: batch.status,
      primary_tutor: batch.primary_tutor,
      co_tutor: batch.co_tutor,
    })
    setShowModal(true)
  }

  // Course preset selection in form
  const handleCourseChange = (courseName) => {
    const preset = COURSE_PRESETS.find((p) => p.name === courseName)
    const newCode = preset ? `${preset.codePrefix}${String.fromCharCode(65 + batches.length)}` : formData.code
    setFormData({
      ...formData,
      course: courseName,
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
      }
      setShowModal(false)
    } catch (err) {
      alert(err.message || 'Failed to save batch.')
    }
  }

  // Delete Batch
  const handleDeleteBatch = async (id) => {
    if (!confirm('Are you sure you want to remove this batch?')) return
    try {
      await apiService.deleteBatch(id).catch(() => null)
      setBatches((prev) => prev.filter((b) => b.id !== id))
    } catch (err) {
      alert('Failed to delete batch')
    }
  }

  // Quick enroll a student into batch
  const handleEnrollStudent = (e) => {
    e.preventDefault()
    if (!newStudentName.trim() || !enrollingBatch) return
    if (enrollingBatch.enrolled >= enrollingBatch.capacity) {
      alert('Batch is already at full capacity!')
      return
    }
    const updated = {
      ...enrollingBatch,
      enrolled: enrollingBatch.enrolled + 1,
    }
    setBatches((prev) => prev.map((b) => (b.id === enrollingBatch.id ? updated : b)))
    setEnrollingBatch(updated)
    setNewStudentName('')
  }

  // Calculate room capacity check
  const selectedRoom = CLASSROOM_OPTIONS.find((r) => r.name === formData.room) || { capacity: 30 }
  const roomExceeded = Number(formData.capacity) > selectedRoom.capacity

  // Filter batches
  const filteredBatches = batches.filter((b) => {
    const q = search.toLowerCase()
    const matchesSearch =
      b.code?.toLowerCase().includes(q) ||
      b.name?.toLowerCase().includes(q) ||
      b.course?.toLowerCase().includes(q) ||
      b.primary_tutor?.toLowerCase().includes(q) ||
      b.room?.toLowerCase().includes(q)
    const matchesCourse = courseFilter === 'all' || b.course === courseFilter
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter
    return matchesSearch && matchesCourse && matchesStatus
  })

  // Aggregate metrics
  const totalEnrolled = batches.reduce((acc, curr) => acc + (curr.enrolled || 0), 0)
  const totalCapacity = batches.reduce((acc, curr) => acc + (curr.capacity || 0), 0)
  const seatUtilization = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0
  const activeBatchesCount = batches.filter((b) => b.status === 'Active').length
  const enrollingCount = batches.filter((b) => b.status === 'Enrolling').length

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

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-light-primary text-[22px]">workspaces</span>
            <h1 className="font-headline text-headline-lg font-semibold text-light-on-surface dark:text-dark-on-surface">
              Batch Management
            </h1>
          </div>
          <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Monitor active cohorts, seat capacity, tutor assignments, and schedule readiness.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => alert('Opening institutional timetable view...')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low transition-colors font-label text-label-md"
          >
            <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            <span>Timetable</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container shadow-sm font-label text-label-md font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Create Batch</span>
          </button>
        </div>
      </section>

      {/* 4 KPI Metrics Grid (matching UI reference) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-4 shadow-sm flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Active Batches
            </span>
            <span className="material-symbols-outlined text-light-primary text-[18px]">workspaces</span>
          </div>
          <span className="font-headline text-headline-lg text-light-on-surface dark:text-dark-on-surface tabular-nums font-bold">
            {activeBatchesCount || 18}
          </span>
          <span className="font-body text-body-sm text-on-success-container font-medium">
            {enrollingCount} enrolling for upcoming term
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-4 shadow-sm flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Enrolled Students
            </span>
            <span className="material-symbols-outlined text-light-primary text-[18px]">groups</span>
          </div>
          <span className="font-headline text-headline-lg text-light-on-surface dark:text-dark-on-surface tabular-nums font-bold">
            {totalEnrolled || 412}
          </span>
          <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Across 6 institutional wings
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-4 shadow-sm flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Seat Utilization
            </span>
            <span className="material-symbols-outlined text-success text-[18px]">event_seat</span>
          </div>
          <span className="font-headline text-headline-lg text-light-on-surface dark:text-dark-on-surface tabular-nums font-bold">
            {seatUtilization || 86.4}%
          </span>
          <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            {Math.max(0, totalCapacity - totalEnrolled)} seats remaining
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-4 shadow-sm flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Schedule Readiness
            </span>
            <span className="material-symbols-outlined text-pending text-[18px]">warning</span>
          </div>
          <span className="font-headline text-headline-lg text-pending tabular-nums font-bold">
            2 Alerts
          </span>
          <span className="font-body text-body-sm text-pending">
            1 room overlap · 1 tutor gap
          </span>
        </article>
      </section>

      {/* Search & Filter Toolbar */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex items-center flex-1 max-w-lg">
          <span className="material-symbols-outlined text-light-outline text-[18px] absolute left-3 pointer-events-none">
            search
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Batch ID, course name, tutor, or room..."
            className="w-full pl-9 pr-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-sm placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            aria-label="Course filter"
            className="px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-sm focus:outline-none focus:ring-1 focus:ring-light-primary"
          >
            <option value="all">Course: All</option>
            <option value="Graphic Design Master Course">Graphic Design</option>
            <option value="Full-Stack Web Engineering">Full-Stack Web</option>
            <option value="UI/UX Product Design">UI/UX Product Design</option>
            <option value="Data Science & Analytics">Data Science</option>
            <option value="Cloud & DevOps Engineering">Cloud &amp; DevOps</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Status filter"
            className="px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-sm focus:outline-none focus:ring-1 focus:ring-light-primary"
          >
            <option value="all">Status: All</option>
            <option value="Active">Active</option>
            <option value="Enrolling">Enrolling</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>

          <button
            type="button"
            onClick={() => alert('Exporting batch roster report...')}
            className="px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface font-medium hover:bg-light-surface-container transition-colors inline-flex items-center gap-1.5 text-body-sm"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Roster</span>
          </button>
        </div>
      </section>

      {/* Batches Table */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-light-surface-container-low/70 dark:bg-dark-surface-container/60 border-b border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant dark:text-dark-on-surface-variant font-label text-label-sm">
                <th className="px-4 py-3">Batch ID</th>
                <th className="px-4 py-3">Course Name</th>
                <th className="px-4 py-3">Start – End Date</th>
                <th className="px-4 py-3">Capacity</th>
                <th className="px-4 py-3">Assigned Tutors</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant text-body-sm">
              {filteredBatches.map((b) => {
                const pct = b.capacity > 0 ? Math.round((b.enrolled / b.capacity) * 100) : 0
                return (
                  <tr
                    key={b.id}
                    className="hover:bg-light-surface-container-low/50 dark:hover:bg-dark-surface-container/50 transition-colors"
                  >
                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-mono-sm font-semibold text-light-primary dark:text-dark-primary">
                          {b.code}
                        </span>
                        <span className="font-body text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                          {b.room}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-body font-semibold text-body-md text-light-on-surface dark:text-dark-on-surface">
                          {b.course}
                        </span>
                        <span className="font-body text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                          {b.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                      <div className="flex flex-col gap-0.5 tabular-nums">
                        <span className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface">
                          {b.start}
                        </span>
                        <span className="font-label text-label-xs text-light-on-surface-variant whitespace-nowrap">
                          to {b.end}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 align-middle">
                      <div className="flex flex-col gap-1 w-28">
                        <div className="flex items-center justify-between tabular-nums">
                          <span className="font-label text-label-sm font-medium text-light-on-surface dark:text-dark-on-surface">
                            {b.enrolled} / {b.capacity}
                          </span>
                          <span className="font-label text-label-xs text-light-on-surface-variant">
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-light-surface-container dark:bg-dark-surface-container overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pct >= 100
                                ? 'bg-success'
                                : pct >= 80
                                ? 'bg-light-primary dark:bg-dark-primary'
                                : 'bg-pending'
                            }`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 align-middle whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface font-medium">
                          {b.primary_tutor}
                        </span>
                        <span
                          className={`font-label text-label-xs whitespace-nowrap ${
                            b.co_tutor === 'Unassigned'
                              ? 'text-pending font-medium'
                              : 'text-light-on-surface-variant'
                          }`}
                        >
                          + {b.co_tutor}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 align-middle">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-label text-label-xs font-semibold whitespace-nowrap ${getStatusBadge(
                          b.status
                        )}`}
                      >
                        {b.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 align-middle text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEnrollingBatch(b)}
                          className="px-2.5 py-1 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright hover:bg-light-surface-container-low font-label text-label-xs text-light-primary dark:text-dark-primary font-semibold whitespace-nowrap"
                        >
                          Enroll
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(b)}
                          className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container-low"
                          title="Edit Batch"
                        >
                          <span className="material-symbols-outlined text-[17px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBatch(b.id)}
                          className="p-1 rounded text-light-on-surface-variant hover:text-overdue hover:bg-overdue-container/40"
                          title="Delete Batch"
                        >
                          <span className="material-symbols-outlined text-[17px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredBatches.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-light-on-surface-variant">
                    No batches match the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* CREATE & EDIT BATCH MODAL (Based on UI reference/16_create_batch/code.html) */}
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
                      Batch Identity &amp; Course
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

                    {/* Capacity Alert (matching UI reference) */}
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

      {/* QUICK ENROLLMENT MODAL */}
      {enrollingBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright rounded-lg border border-light-outline-variant dark:border-dark-outline-variant shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-3.5 bg-sidebar text-on-sidebar flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-light-primary text-[18px]">group_add</span>
                <h3 className="font-title text-title-md font-semibold text-white">
                  Enroll in {enrollingBatch.code}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEnrollingBatch(null)}
                className="text-white/80 hover:text-white"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="p-3 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant text-body-sm flex flex-col gap-1.5">
                <div className="flex justify-between">
                  <span className="text-light-on-surface-variant">Course:</span>
                  <span className="font-semibold">{enrollingBatch.course}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-light-on-surface-variant">Current Enrolled:</span>
                  <span className="font-mono font-bold text-light-primary">
                    {enrollingBatch.enrolled} / {enrollingBatch.capacity} Seats
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-light-on-surface-variant">Open Seats:</span>
                  <span className="font-semibold text-success">
                    {Math.max(0, enrollingBatch.capacity - enrollingBatch.enrolled)} available
                  </span>
                </div>
              </div>

              <form onSubmit={handleEnrollStudent} className="flex flex-col gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-label text-label-sm font-medium">Student Full Name</span>
                  <input
                    type="text"
                    required
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Enter student name to enroll..."
                    className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </label>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEnrollingBatch(null)}
                    className="px-3 py-1.5 rounded border border-light-outline-variant text-body-sm hover:bg-light-surface-container-low transition-colors"
                  >
                    Done
                  </button>
                  <button
                    type="submit"
                    disabled={enrollingBatch.enrolled >= enrollingBatch.capacity}
                    className="px-4 py-1.5 rounded bg-light-primary text-light-on-primary font-semibold text-body-sm shadow-sm hover:bg-light-primary-container disabled:opacity-50 transition-colors"
                  >
                    Confirm Enrollment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BatchManagement
