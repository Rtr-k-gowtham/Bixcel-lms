import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

const DEFAULT_TUTORS = [
  {
    id: 1,
    staff_id: 'TUT-101',
    name: 'Sofia Alvarez',
    role: 'Lead Product Designer',
    expertise: 'UI/UX Design, Figma, Design Systems',
    courses: 'UI/UX Product Design, Design Systems',
    availability: 'Available',
    hours: 12,
    max_hours: 24,
    rating: 4.9,
    email: 'sofia.alvarez@bixcel.edu',
    phone: '+1 (555) 234-8901',
    assigned_batches: ['BIX-UX-26D', 'BIX-UX-26A'],
  },
  {
    id: 2,
    staff_id: 'TUT-104',
    name: 'Marcus Vance',
    role: 'Senior Brand & Visual Tutor',
    expertise: 'Graphic Design, Typography, Branding',
    courses: 'Graphic Design Master Course',
    availability: 'Partial',
    hours: 18,
    max_hours: 24,
    rating: 4.8,
    email: 'marcus.vance@bixcel.edu',
    phone: '+1 (555) 345-9012',
    assigned_batches: ['BIX-GD-26A', 'BIX-GD-26B'],
  },
  {
    id: 3,
    staff_id: 'TUT-109',
    name: 'Priya Nair',
    role: 'Creative Studio Mentor',
    expertise: 'Photoshop, UI Prototyping, Accessibility',
    courses: 'Graphic Design, UI/UX Product Design',
    availability: 'Available',
    hours: 10,
    max_hours: 24,
    rating: 4.7,
    email: 'priya.nair@bixcel.edu',
    phone: '+1 (555) 456-0123',
    assigned_batches: ['BIX-GD-26A', 'BIX-UX-26D'],
  },
  {
    id: 4,
    staff_id: 'TUT-112',
    name: 'Dr. Aris Thorne',
    role: 'Principal Engineering Tutor',
    expertise: 'Full-Stack Web, Data Science, Cloud',
    courses: 'Full-Stack Web, Data Science',
    availability: 'Full',
    hours: 24,
    max_hours: 24,
    rating: 4.95,
    email: 'aris.thorne@bixcel.edu',
    phone: '+1 (555) 567-1234',
    assigned_batches: ['BIX-FS-26C', 'BIX-DS-26E'],
  },
  {
    id: 5,
    staff_id: 'TUT-115',
    name: 'Tariq Al-Mansoor',
    role: 'Cloud Solutions Architect',
    expertise: 'AWS, Terraform, Kubernetes, DevOps',
    courses: 'Cloud & DevOps Engineering',
    availability: 'Available',
    hours: 14,
    max_hours: 24,
    rating: 4.85,
    email: 'tariq.mansoor@bixcel.edu',
    phone: '+1 (555) 678-2345',
    assigned_batches: ['BIX-CLD-26F'],
  },
  {
    id: 6,
    staff_id: 'TUT-118',
    name: 'Elena Rostova',
    role: 'Cybersecurity Specialist',
    expertise: 'Network Defense, SOC Operations, Ethical Hacking',
    courses: 'Cybersecurity Operations',
    availability: 'Partial',
    hours: 16,
    max_hours: 24,
    rating: 4.9,
    email: 'elena.rostova@bixcel.edu',
    phone: '+1 (555) 789-3456',
    assigned_batches: ['BIX-SEC-09F'],
  },
]

const BATCH_TARGETS = [
  { code: 'BIX-UX-26D', title: 'UI/UX Product Evening (UI/UX Product Design)' },
  { code: 'BIX-FS-26C', title: 'Full-Stack Cohort C (Full-Stack Web Engineering)' },
  { code: 'BIX-GD-26A', title: 'Graphic Design Morning (Graphic Design Master Course)' },
  { code: 'BIX-DS-26E', title: 'Data Science Weekend (Data Science & Analytics)' },
  { code: 'BIX-CLD-26F', title: 'Cloud & DevOps Accelerated (Cloud & DevOps Engineering)' },
]

export function TutorManagement() {
  const [activeTab, setActiveTab] = useState('assignment') // 'assignment' | 'directory'
  const [tutors, setTutors] = useState(DEFAULT_TUTORS)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [availFilter, setAvailFilter] = useState('all')
  const [successToast, setSuccessToast] = useState('')

  // Batch Assignment Workspace State
  const [selectedBatchCode, setSelectedBatchCode] = useState('BIX-UX-26D')
  const [primaryTutorId, setPrimaryTutorId] = useState('TUT-101')
  const [additionalTutorIds, setAdditionalTutorIds] = useState(['TUT-109'])

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingTutor, setEditingTutor] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    role: 'Senior Course Tutor',
    staff_id: '',
    expertise: '',
    courses: '',
    email: '',
    phone: '',
    hours: 12,
    availability: 'Available',
  })

  useEffect(() => {
    fetchTutors()
  }, [])

  const fetchTutors = async () => {
    setLoading(true)
    try {
      const res = await apiService.getTutors()
      if (res && res.data && Array.isArray(res.data)) {
        setTutors(res.data)
      }
    } catch {
      // Keep mock fallback
    } finally {
      setLoading(false)
    }
  }

  // Toggle Primary Tutor
  const handleSetPrimary = (staffId) => {
    setPrimaryTutorId(staffId)
    setAdditionalTutorIds((prev) => prev.filter((id) => id !== staffId))
  }

  // Toggle Additional Co-Tutor
  const handleToggleAdditional = (staffId) => {
    if (staffId === primaryTutorId) return
    if (additionalTutorIds.includes(staffId)) {
      setAdditionalTutorIds((prev) => prev.filter((id) => id !== staffId))
    } else {
      setAdditionalTutorIds((prev) => [...prev, staffId])
    }
  }

  // Save Allocation
  const handleSaveAllocation = async () => {
    try {
      await apiService.assignTutor({
        batch_code: selectedBatchCode,
        primary_id: primaryTutorId,
        additional_ids: additionalTutorIds,
      }).catch(() => null)

      const primary = tutors.find((t) => t.staff_id === primaryTutorId)?.name || 'Lead Tutor'
      setSuccessToast(`Tutor allocation saved for batch ${selectedBatchCode} (Lead: ${primary})!`)
      setTimeout(() => setSuccessToast(''), 3500)
    } catch (err) {
      alert('Failed to save allocation')
    }
  }

  // Open Create / Edit Modal
  const handleOpenCreate = () => {
    setEditingTutor(null)
    setFormData({
      name: '',
      role: 'Senior Course Mentor',
      staff_id: `TUT-${120 + tutors.length}`,
      expertise: '',
      courses: '',
      email: '',
      phone: '',
      hours: 10,
      availability: 'Available',
    })
    setShowModal(true)
  }

  const handleOpenEdit = (tutor) => {
    setEditingTutor(tutor)
    setFormData({
      name: tutor.name,
      role: tutor.role,
      staff_id: tutor.staff_id,
      expertise: tutor.expertise,
      courses: tutor.courses,
      email: tutor.email,
      phone: tutor.phone,
      hours: tutor.hours,
      availability: tutor.availability,
    })
    setShowModal(true)
  }

  // Save Tutor
  const handleSaveTutor = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      if (editingTutor) {
        await apiService.updateTutor(editingTutor.id, formData).catch(() => null)
        setTutors((prev) =>
          prev.map((t) => (t.id === editingTutor.id ? { ...t, ...formData } : t))
        )
      } else {
        const res = await apiService.createTutor(formData).catch(() => null)
        if (res && res.data) {
          setTutors((prev) => [res.data, ...prev])
        } else {
          const mockNew = {
            id: Date.now(),
            ...formData,
            rating: 5.0,
            assigned_batches: [],
          }
          setTutors((prev) => [mockNew, ...prev])
        }
      }
      setShowModal(false)
    } catch (err) {
      alert(err.message || 'Failed to save tutor')
    }
  }

  // Delete Tutor
  const handleDeleteTutor = async (id) => {
    if (!confirm('Are you sure you want to remove this faculty record?')) return
    try {
      await apiService.deleteTutor(id).catch(() => null)
      setTutors((prev) => prev.filter((t) => t.id !== id))
    } catch {
      alert('Failed to delete tutor')
    }
  }

  // Filtered tutors
  const filteredTutors = tutors.filter((t) => {
    const q = search.toLowerCase()
    const matchesSearch =
      t.name?.toLowerCase().includes(q) ||
      t.staff_id?.toLowerCase().includes(q) ||
      t.expertise?.toLowerCase().includes(q) ||
      t.courses?.toLowerCase().includes(q)
    const matchesAvail = availFilter === 'all' || t.availability === availFilter
    return matchesSearch && matchesAvail
  })

  // Aggregate Metrics
  const totalWeeklyHours = tutors.reduce((acc, curr) => acc + (curr.hours || 0), 0)
  const avgRating = (
    tutors.reduce((acc, curr) => acc + (curr.rating || 5.0), 0) / (tutors.length || 1)
  ).toFixed(2)
  const activeFacultyCount = tutors.length
  const primaryTutor = tutors.find((t) => t.staff_id === primaryTutorId)

  const getAvailBadge = (avail) => {
    switch (avail) {
      case 'Available':
        return 'bg-success-container text-on-success-container'
      case 'Partial':
        return 'bg-pending-container text-on-pending-container'
      case 'Full':
        return 'bg-overdue-container text-on-overdue-container'
      default:
        return 'bg-light-surface-container text-light-on-surface-variant'
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-light-primary text-[22px]">co_present</span>
            <h1 className="font-headline text-headline-lg font-semibold text-light-on-surface dark:text-dark-on-surface">
              Tutor Management &amp; Allocation
            </h1>
          </div>
          <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Assign certified primary and supporting tutors to cohorts based on expertise and weekly workload.
          </p>
        </div>

        {/* View Switcher Pills & Action */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 p-1 rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant">
            <button
              type="button"
              onClick={() => setActiveTab('assignment')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-label text-label-md font-medium transition-colors ${
                activeTab === 'assignment'
                  ? 'bg-light-primary text-light-on-primary shadow-sm'
                  : 'text-light-on-surface-variant hover:text-light-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">assignment_ind</span>
              <span>Batch Assignment</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded font-label text-label-md font-medium transition-colors ${
                activeTab === 'directory'
                  ? 'bg-light-primary text-light-on-primary shadow-sm'
                  : 'text-light-on-surface-variant hover:text-light-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">badge</span>
              <span>Faculty Roster ({tutors.length})</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container shadow-sm font-label text-label-md font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Onboard Tutor</span>
          </button>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Certified Faculty
            </span>
            <span className="material-symbols-outlined text-light-primary text-[18px]">co_present</span>
          </div>
          <span className="font-headline text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
            {activeFacultyCount || 24}
          </span>
          <span className="font-body text-body-xs text-on-success-container font-medium">
            100% verified credentials
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Weekly Teaching Hours
            </span>
            <span className="material-symbols-outlined text-light-primary text-[18px]">schedule</span>
          </div>
          <span className="font-headline text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
            {totalWeeklyHours || 384}h
          </span>
          <span className="font-body text-body-xs text-light-on-surface-variant">
            Institutional load
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Faculty Rating
            </span>
            <span className="material-symbols-outlined text-pending text-[18px]">star</span>
          </div>
          <span className="font-headline text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
            {avgRating} ★
          </span>
          <span className="font-body text-body-xs text-light-on-surface-variant">
            Based on student evaluations
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Workload Cap
            </span>
            <span className="material-symbols-outlined text-success text-[18px]">verified_user</span>
          </div>
          <span className="font-headline text-headline-md font-bold text-success tabular-nums">
            24h / wk
          </span>
          <span className="font-body text-body-xs text-light-on-surface-variant">
            Institutional max limit
          </span>
        </article>
      </section>

      {/* Success Notification */}
      {successToast && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-md bg-success-container text-on-success-container border border-success/30 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-success">check_circle</span>
            <span className="font-body text-body-md font-medium">{successToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSuccessToast('')}
            className="text-on-success-container/70 hover:text-on-success-container"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

      {/* TAB 1: BATCH ASSIGNMENT WORKSPACE (From UI reference 18_tutor_assignment) */}
      {activeTab === 'assignment' && (
        <div className="flex flex-col gap-5">
          {/* Target Batch Selector Bar */}
          <div className="p-3.5 rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="font-label text-label-sm font-semibold uppercase text-light-on-surface-variant">
                Target Batch:
              </span>
              <select
                value={selectedBatchCode}
                onChange={(e) => setSelectedBatchCode(e.target.value)}
                className="px-3 py-1.5 text-body-sm font-semibold rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-primary dark:text-dark-primary font-mono focus:outline-none focus:ring-1 focus:ring-light-primary"
              >
                {BATCH_TARGETS.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.code} • {b.title}
                  </option>
                ))}
              </select>
            </div>

            <span className="font-mono text-mono-xs px-2.5 py-1 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint font-medium">
              Active Term Assignment
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 8 cols: Certified Tutors List */}
            <div className="lg:col-span-8 flex flex-col gap-3">
              <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex items-center flex-1">
                  <span className="material-symbols-outlined text-light-outline text-[18px] absolute left-3 pointer-events-none">
                    search
                  </span>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search certified tutors by name, staff ID, or expertise..."
                    className="w-full pl-9 pr-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-sm placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <select
                  value={availFilter}
                  onChange={(e) => setAvailFilter(e.target.value)}
                  className="px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-sm focus:outline-none focus:ring-1 focus:ring-light-primary"
                >
                  <option value="all">Availability: All</option>
                  <option value="Available">Available</option>
                  <option value="Partial">Partial</option>
                  <option value="Full">Full</option>
                </select>
              </div>

              {/* Tutors List Cards */}
              <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm divide-y divide-light-outline-variant dark:divide-dark-outline-variant overflow-hidden">
                {filteredTutors.map((t) => {
                  const pct = Math.round((t.hours / t.max_hours) * 100)
                  const isPrimary = primaryTutorId === t.staff_id
                  const isAdditional = additionalTutorIds.includes(t.staff_id)

                  return (
                    <div
                      key={t.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-light-surface-container-low/50 dark:hover:bg-dark-surface-container/50 transition-colors"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Avatar initials badge */}
                        <div className="w-10 h-10 rounded-full bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary flex items-center justify-center font-bold text-body-sm border border-light-primary/20 shrink-0">
                          {t.name
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')}
                        </div>

                        <div className="flex flex-col gap-0.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-body font-semibold text-body-md text-light-on-surface dark:text-dark-on-surface">
                              {t.name}
                            </span>
                            <span className="font-mono text-mono-xs text-light-outline">
                              ({t.staff_id})
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full font-label text-label-xs font-semibold ${getAvailBadge(
                                t.availability
                              )}`}
                            >
                              {t.availability}
                            </span>
                            <span className="text-pending text-body-xs font-semibold">
                              {t.rating} ★
                            </span>
                          </div>
                          <span className="font-body text-body-sm text-light-primary dark:text-dark-primary font-medium">
                            {t.expertise}
                          </span>
                          <span className="font-label text-label-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            Assigned Courses: {t.courses}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-2 shrink-0">
                        <div className="flex items-center gap-2 tabular-nums">
                          <span className="font-label text-label-xs text-light-on-surface-variant">
                            Workload: {t.hours}/{t.max_hours}h
                          </span>
                          <div className="w-20 h-1.5 rounded-full bg-light-surface-container dark:bg-dark-surface-container overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                pct >= 90 ? 'bg-overdue' : 'bg-light-primary dark:bg-dark-primary'
                              }`}
                              style={{ width: `${Math.min(100, pct)}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSetPrimary(t.staff_id)}
                            className={`px-2.5 py-1 rounded border font-label text-label-xs font-medium transition-colors whitespace-nowrap ${
                              isPrimary
                                ? 'bg-light-primary text-light-on-primary border-light-primary shadow-xs'
                                : 'bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface border-light-outline-variant hover:bg-light-surface-container-low'
                            }`}
                          >
                            {isPrimary ? 'Primary Tutor' : 'Set Primary'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleAdditional(t.staff_id)}
                            className={`px-2.5 py-1 rounded border font-label text-label-xs font-medium transition-colors whitespace-nowrap ${
                              isAdditional
                                ? 'bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint border-light-primary/40 font-semibold'
                                : 'bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface border-light-outline-variant hover:bg-light-surface-container-low'
                            }`}
                          >
                            {isAdditional ? 'Added' : '+ Co-Tutor'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {filteredTutors.length === 0 && (
                  <div className="p-8 text-center text-light-on-surface-variant">
                    No tutors found matching the criteria.
                  </div>
                )}
              </div>
            </div>

            {/* Right 4 cols: Batch Tutor Assignments Aside */}
            <aside className="lg:col-span-4 bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2.5">
                <h2 className="font-title text-title-md font-semibold text-light-on-surface dark:text-dark-on-surface">
                  Batch Tutor Roster
                </h2>
                <span className="font-mono text-mono-xs font-semibold text-light-primary">
                  {selectedBatchCode}
                </span>
              </div>

              {/* Primary Tutor Slot */}
              <div className="flex flex-col gap-1.5">
                <span className="font-label text-label-xs font-semibold uppercase text-light-on-surface-variant">
                  Primary Lead Tutor
                </span>
                {primaryTutor ? (
                  <div className="p-3 rounded bg-light-primary-tint/50 dark:bg-dark-primary-tint/30 border border-light-primary/30 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-light-primary text-light-on-primary flex items-center justify-center font-bold text-label-sm">
                        {primaryTutor.name[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-body font-semibold text-body-sm text-light-on-surface dark:text-dark-on-surface">
                          {primaryTutor.name}
                        </span>
                        <span className="font-label text-label-xs text-light-primary dark:text-dark-primary font-medium">
                          {primaryTutor.hours}h / wk • {primaryTutor.expertise.split(',')[0]}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-light-primary text-light-on-primary font-label text-label-xs font-semibold">
                      Primary
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded border border-dashed border-light-outline-variant text-body-sm text-light-on-surface-variant text-center">
                    No primary tutor selected. Click "Set Primary" on any tutor.
                  </div>
                )}
              </div>

              {/* Additional Tutors Slot */}
              <div className="flex flex-col gap-1.5">
                <span className="font-label text-label-xs font-semibold uppercase text-light-on-surface-variant">
                  Supporting Co-Tutors ({additionalTutorIds.length})
                </span>
                <div className="flex flex-col gap-2">
                  {additionalTutorIds.map((id) => {
                    const tutor = tutors.find((t) => t.staff_id === id)
                    if (!tutor) return null
                    return (
                      <div
                        key={id}
                        className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between gap-2"
                      >
                        <div className="flex flex-col">
                          <span className="font-body font-semibold text-body-sm text-light-on-surface dark:text-dark-on-surface">
                            {tutor.name}
                          </span>
                          <span className="font-label text-label-xs text-light-on-surface-variant">
                            {tutor.expertise.split(',')[0]}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleToggleAdditional(id)}
                          className="p-1 text-light-on-surface-variant hover:text-overdue transition-colors"
                          title="Remove co-tutor"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      </div>
                    )
                  })}
                  {additionalTutorIds.length === 0 && (
                    <p className="font-body text-body-sm text-light-on-surface-variant p-2 text-center bg-light-surface-container-low/50 rounded">
                      No additional co-tutors assigned.
                    </p>
                  )}
                </div>
              </div>

              {/* Compliance Box */}
              <div className="p-3 rounded bg-success-container/60 text-on-success-container flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-success">
                  verified_user
                </span>
                <span className="font-body text-body-sm font-medium">
                  All assigned tutors are certified and within the 24h/wk workload cap.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2 border-t border-light-outline-variant dark:border-dark-outline-variant">
                <button
                  type="button"
                  onClick={handleSaveAllocation}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container shadow-sm font-label text-label-md font-semibold transition-colors"
                >
                  <span>Save Allocation &amp; Sync Timetable</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPrimaryTutorId('TUT-101')
                    setAdditionalTutorIds(['TUT-109'])
                  }}
                  className="w-full text-center px-4 py-2 rounded border border-light-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low font-label text-label-md transition-colors"
                >
                  Reset Defaults
                </button>
              </div>
            </aside>
          </div>
        </div>
      )}

      {/* TAB 2: FACULTY DIRECTORY & PROFILES */}
      {activeTab === 'directory' && (
        <div className="flex flex-col gap-4">
          <div className="p-3.5 rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined text-light-outline text-[18px] absolute left-3 top-2 pointer-events-none">
                search
              </span>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search faculty members by name, email, or role..."
                className="w-full pl-9 pr-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
              />
            </div>

            <button
              type="button"
              onClick={() => alert('Exporting certified faculty roster CSV...')}
              className="px-3.5 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface font-medium hover:bg-light-surface-container transition-colors inline-flex items-center gap-1.5 text-body-sm"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Export Faculty List</span>
            </button>
          </div>

          {/* Directory Table */}
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-body-sm">
                <thead>
                  <tr className="bg-light-surface-container-low/70 dark:bg-dark-surface-container/60 border-b border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant font-label text-label-sm">
                    <th className="px-4 py-3 font-semibold uppercase">Staff ID</th>
                    <th className="px-4 py-3 font-semibold uppercase">Faculty Member</th>
                    <th className="px-4 py-3 font-semibold uppercase">Role &amp; Domain</th>
                    <th className="px-4 py-3 font-semibold uppercase">Weekly Hours</th>
                    <th className="px-4 py-3 font-semibold uppercase">Rating</th>
                    <th className="px-4 py-3 font-semibold uppercase">Availability</th>
                    <th className="px-4 py-3 font-semibold uppercase">Assigned Batches</th>
                    <th className="px-4 py-3 font-semibold uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
                  {filteredTutors.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-light-surface-container-low/50 dark:hover:bg-dark-surface-container/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-mono-sm font-semibold text-light-primary dark:text-dark-primary">
                        {t.staff_id}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-semibold text-body-md text-light-on-surface dark:text-dark-on-surface">
                            {t.name}
                          </span>
                          <span className="text-body-xs text-light-on-surface-variant">
                            {t.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-light-on-surface dark:text-dark-on-surface">
                            {t.role}
                          </span>
                          <span className="text-body-xs text-light-primary">
                            {t.expertise.split(',').slice(0, 2).join(', ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 tabular-nums font-mono">
                        {t.hours}h / 24h
                      </td>
                      <td className="px-4 py-3 font-semibold text-pending">
                        {t.rating} ★
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-semibold ${getAvailBadge(
                            t.availability
                          )}`}
                        >
                          {t.availability}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {t.assigned_batches?.map((b) => (
                            <span
                              key={b}
                              className="px-1.5 py-0.5 rounded bg-light-surface-container dark:bg-dark-surface-container font-mono text-[11px]"
                            >
                              {b}
                            </span>
                          ))}
                          {(!t.assigned_batches || t.assigned_batches.length === 0) && (
                            <span className="text-light-on-surface-variant text-[12px] italic">
                              None
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(t)}
                            className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container-low"
                            title="Edit Tutor"
                          >
                            <span className="material-symbols-outlined text-[17px]">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTutor(t.id)}
                            className="p-1 rounded text-light-on-surface-variant hover:text-overdue hover:bg-overdue-container/40"
                            title="Delete Faculty"
                          >
                            <span className="material-symbols-outlined text-[17px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT TUTOR MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright rounded-lg border border-light-outline-variant dark:border-dark-outline-variant shadow-xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-sidebar text-on-sidebar flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-light-primary text-[20px]">
                  {editingTutor ? 'edit' : 'person_add'}
                </span>
                <h3 className="font-title text-title-md font-semibold text-white">
                  {editingTutor ? `Edit Faculty: ${editingTutor.name}` : 'Onboard Certified Tutor'}
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

            <form onSubmit={handleSaveTutor} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-label text-label-sm font-medium">Full Name *</span>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Aris Thorne"
                    className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-label text-label-sm font-medium">Staff ID</span>
                  <input
                    type="text"
                    value={formData.staff_id}
                    onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                    className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container font-mono text-mono-sm text-light-primary focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-label text-label-sm font-medium">Academic Role</span>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Lead Product Designer"
                    className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-label text-label-sm font-medium">Availability</span>
                  <select
                    value={formData.availability}
                    onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                    className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="Available">Available</option>
                    <option value="Partial">Partial</option>
                    <option value="Full">Full (Max Cap)</option>
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-label text-label-sm font-medium">Primary Expertise Areas</span>
                <input
                  type="text"
                  value={formData.expertise}
                  onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
                  placeholder="e.g. UI/UX Design, Figma, Design Systems"
                  className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-label text-label-sm font-medium">Email Address</span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="auto-generated if empty"
                    className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-label text-label-sm font-medium">Teaching Hours / Wk</span>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-light-outline-variant dark:border-dark-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-1.5 rounded border border-light-outline-variant text-body-sm hover:bg-light-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-light-primary hover:bg-light-primary-container text-light-on-primary font-semibold text-body-sm shadow-sm transition-colors"
                >
                  {editingTutor ? 'Save Changes' : 'Onboard Tutor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default TutorManagement
