import React, { useState, useEffect, useMemo } from 'react'
import { apiService } from '../../services/api'

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'ST'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'ST'
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

export function CourseOnboarding({ onNavigateToStudents, onNavigateToCourses }) {
  const [enrollments, setEnrollments] = useState([])
  const [studentsList, setStudentsList] = useState([])
  const [coursesList, setCoursesList] = useState([])
  const [modulesList, setModulesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  // Search & Filters
  const [search, setSearch] = useState('')
  const [filterCourse, setFilterCourse] = useState('All')
  const [filterBatch, setFilterBatch] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  // Modals
  const [showOnboardModal, setShowOnboardModal] = useState(false)
  const [isOnboarding, setIsOnboarding] = useState(false)
  const [viewingOnboarding, setViewingOnboarding] = useState(null)
  const [editingOnboarding, setEditingOnboarding] = useState(null)
  const [viewingPass, setViewingPass] = useState(null)

  // Onboard Form State
  const [onboardForm, setOnboardForm] = useState({
    studentId: '',
    courseTitle: '',
    courseId: '',
    batch: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'Active',
    tuitionFee: 4500,
    plan: 'Full Payment',
    selectedModules: [],
  })

  // Fetch initial data
  const loadData = async () => {
    try {
      setLoading(true)
      const [enrollRes, studentsRes, coursesRes, modulesRes] = await Promise.allSettled([
        apiService.getEnrollments(),
        apiService.getStudents(),
        apiService.getCourses(),
        apiService.getModules(),
      ])

      if (enrollRes.status === 'fulfilled' && enrollRes.value?.data) {
        setEnrollments(Array.isArray(enrollRes.value.data) ? enrollRes.value.data : [])
      }
      if (studentsRes.status === 'fulfilled' && studentsRes.value?.data) {
        setStudentsList(Array.isArray(studentsRes.value.data) ? studentsRes.value.data : [])
      }
      if (coursesRes.status === 'fulfilled' && coursesRes.value?.data) {
        setCoursesList(Array.isArray(coursesRes.value.data) ? coursesRes.value.data : [])
      }
      if (modulesRes.status === 'fulfilled' && modulesRes.value?.data) {
        setModulesList(Array.isArray(modulesRes.value.data) ? modulesRes.value.data : [])
      }
    } catch (err) {
      console.warn('Error loading course onboarding data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Open Onboard Modal
  const openOnboardModal = () => {
    const firstStudent = studentsList.length > 0 ? studentsList[0] : null
    const firstCourse = coursesList.length > 0 ? coursesList[0] : null

    const defaultBatch = firstCourse?.code ? `${firstCourse.code}-26A` : 'BIX-2026-A'
    const defaultDays = firstCourse?.days ? Number(firstCourse.days) : 30

    // Match modules for first course if available
    let initialModules = []
    if (firstCourse && Array.isArray(firstCourse.module_ids)) {
      const idSet = new Set(firstCourse.module_ids.map(String))
      initialModules = modulesList.filter((m) => idSet.has(String(m.id)) || idSet.has(String(m.code)))
    }
    if (initialModules.length === 0 && firstCourse) {
      initialModules = [{ id: 'MOD-1', title: `${firstCourse.title} Foundations`, days: defaultDays }]
    }

    setOnboardForm({
      studentId: firstStudent ? (firstStudent.student_id || firstStudent.id) : '',
      courseTitle: firstCourse ? firstCourse.title : '',
      courseId: firstCourse ? firstCourse.id : '',
      batch: defaultBatch,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Active',
      tuitionFee: 4500,
      plan: 'Full Payment',
      selectedModules: initialModules,
    })
    setShowOnboardModal(true)
  }

  // Handle Course Change inside Modal
  const handleCourseChange = (courseTitle) => {
    const found = coursesList.find((c) => c.title === courseTitle)
    const batchCode = found?.code ? `${found.code}-26A` : 'BIX-2026-A'
    const days = found?.days ? Number(found.days) : 30

    let assignedMods = []
    if (found && Array.isArray(found.module_ids)) {
      const idSet = new Set(found.module_ids.map(String))
      assignedMods = modulesList.filter((m) => idSet.has(String(m.id)) || idSet.has(String(m.code)))
    }
    if (assignedMods.length === 0 && found) {
      assignedMods = [{ id: 'MOD-1', title: `${found.title} Core Curriculum`, days }]
    }

    setOnboardForm((prev) => ({
      ...prev,
      courseTitle,
      courseId: found ? found.id : '',
      batch: batchCode,
      selectedModules: assignedMods,
    }))
  }

  // Toggle Module Selection
  const toggleModule = (mod) => {
    setOnboardForm((prev) => {
      const exists = prev.selectedModules.some((m) => String(m.id || m.module_code) === String(mod.id || mod.module_code))
      if (exists) {
        return {
          ...prev,
          selectedModules: prev.selectedModules.filter((m) => String(m.id || m.module_code) !== String(mod.id || mod.module_code)),
        }
      } else {
        return {
          ...prev,
          selectedModules: [...prev.selectedModules, mod],
        }
      }
    })
  }

  // Calculate Cumulative Days of Selected Modules
  const computedTotalDays = useMemo(() => {
    if (onboardForm.selectedModules.length > 0) {
      return onboardForm.selectedModules.reduce((acc, m) => acc + (Number(m.days) || 0), 0)
    }
    const found = coursesList.find((c) => c.title === onboardForm.courseTitle)
    return found?.days ? Number(found.days) : 30
  }, [onboardForm.selectedModules, onboardForm.courseTitle, coursesList])

  // Submit Onboard Student to Course
  const handleConfirmOnboard = async (e) => {
    e.preventDefault()
    if (!onboardForm.studentId) {
      alert('Please select a student to onboard.')
      return
    }
    if (!onboardForm.courseTitle) {
      alert('Please select a course program.')
      return
    }

    setIsOnboarding(true)
    const selectedStudent = studentsList.find(
      (s) => String(s.student_id) === String(onboardForm.studentId) || String(s.id) === String(onboardForm.studentId)
    )

    const payload = {
      student_id: selectedStudent?.id,
      student_code: selectedStudent?.student_id || onboardForm.studentId,
      track: onboardForm.courseTitle,
      course_title: onboardForm.courseTitle,
      batch: onboardForm.batch.trim() || 'BIX-2026-A',
      start_date: onboardForm.startDate,
      end_date: onboardForm.endDate,
      total_days: computedTotalDays,
      total_modules: onboardForm.selectedModules.length,
      status: onboardForm.status,
      plan: onboardForm.plan,
      tuition_fee: Number(onboardForm.tuitionFee) || 4500,
      payment_method: 'Bank Transfer',
      modules: onboardForm.selectedModules.map((m, idx) => ({
        module_code: m.code || m.id || `MOD-${idx + 1}`,
        title: m.title,
        days: Number(m.days) || 1,
        instructor: m.instructor || '',
      })),
    }

    try {
      const res = await apiService.createEnrollment(payload)
      const newRecord = res?.data || { id: Date.now(), ...payload, student_name: selectedStudent?.full_name }
      setEnrollments((prev) => [newRecord, ...prev])
      setToast(`Student "${selectedStudent?.full_name || payload.student_code}" successfully onboarded to ${payload.track}!`)
      setShowOnboardModal(false)
    } catch (err) {
      console.warn('API error, saving locally:', err)
      const mockRecord = { id: Date.now(), ...payload, student_name: selectedStudent?.full_name }
      setEnrollments((prev) => [mockRecord, ...prev])
      setToast(`Student "${selectedStudent?.full_name || payload.student_code}" onboarded locally!`)
      setShowOnboardModal(false)
    } finally {
      setIsOnboarding(false)
      setTimeout(() => setToast(''), 4000)
    }
  }

  // Handle Edit Update
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editingOnboarding) return

    try {
      await apiService.updateEnrollment(editingOnboarding.id, editingOnboarding)
    } catch (err) {
      console.warn('API update failed:', err)
    }

    setEnrollments((prev) =>
      prev.map((item) => (item.id === editingOnboarding.id ? { ...editingOnboarding, updated_at: new Date().toISOString() } : item))
    )
    setToast(`Course onboarding for "${editingOnboarding.student_name}" updated!`)
    setEditingOnboarding(null)
    setTimeout(() => setToast(''), 3000)
  }

  // Handle Drop / Delete Onboarding
  const handleDeleteEnrollment = async (id, studentName, courseTitle) => {
    if (window.confirm(`Are you sure you want to drop course enrollment of "${studentName}" from "${courseTitle}"?`)) {
      try {
        await apiService.deleteEnrollment(id)
      } catch (err) {
        console.warn('API delete failed:', err)
      }
      setEnrollments((prev) => prev.filter((item) => item.id !== id))
      setToast(`Dropped course onboarding for "${studentName}".`)
      setTimeout(() => setToast(''), 3000)
    }
  }

  // Filtered Roster
  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((item) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        item.student_name?.toLowerCase().includes(q) ||
        item.student_code?.toLowerCase().includes(q) ||
        item.track?.toLowerCase().includes(q) ||
        item.batch?.toLowerCase().includes(q) ||
        item.batch_id?.toLowerCase().includes(q)

      const matchCourse = filterCourse === 'All' || item.track === filterCourse
      const matchBatch = filterBatch === 'All' || (item.batch || item.batch_id) === filterBatch
      const matchStatus = filterStatus === 'All' || item.status === filterStatus

      return matchSearch && matchCourse && matchBatch && matchStatus
    })
  }, [enrollments, search, filterCourse, filterBatch, filterStatus])

  // Available distinct batches for filter
  const distinctBatches = useMemo(() => {
    const set = new Set()
    enrollments.forEach((e) => {
      if (e.batch || e.batch_id) set.add(e.batch || e.batch_id)
    })
    return Array.from(set)
  }, [enrollments])

  // Metrics
  const totalCount = enrollments.length
  const activeCount = enrollments.filter((e) => e.status === 'Active').length
  const coursesCount = new Set(enrollments.map((e) => e.track)).size
  const avgDays = totalCount > 0 ? Math.round(enrollments.reduce((acc, e) => acc + (Number(e.total_days) || 0), 0) / totalCount) : 0

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

      {/* Screen Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-3 rounded-md shadow-xs">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-light-primary text-[20px]">assignment_ind</span>
            <h1 className="font-title text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface">
              Course Onboarding
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint font-mono text-[10px] font-bold">
              {totalCount} Enrolled
            </span>
          </div>
          <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Onboard registered students into institutional course programs, batch cohorts, and modular curriculum tracks.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openOnboardModal}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-xs font-semibold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
            <span>+ Onboard Student to Course</span>
          </button>
        </div>
      </section>

      {/* 4 Compact Metric Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Total Onboarded</span>
            <span className="font-headline text-[18px] font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
              {totalCount}
            </span>
          </div>
          <span className="w-7 h-7 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">groups</span>
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Active Enrolled</span>
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-[18px] font-bold text-success tabular-nums">
                {activeCount}
              </span>
              <span className="text-[10px] text-on-success-container bg-success-container px-1 py-0.2 rounded font-semibold">
                {totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 100}%
              </span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-success-container text-on-success-container inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Programs Allocated</span>
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-[18px] font-bold text-light-primary dark:text-dark-primary tabular-nums">
                {coursesCount}
              </span>
              <span className="text-[10px] text-light-on-surface-variant font-medium">Active tracks</span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-light-secondary-container text-light-on-secondary-container inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">menu_book</span>
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Avg Course Duration</span>
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-[18px] font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                {avgDays} Days
              </span>
              <span className="text-[10px] text-light-on-surface-variant font-medium">Instructional</span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-pending-container text-on-pending-container inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
          </span>
        </article>
      </section>

      {/* Search & Filter Strip */}
      <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="relative flex items-center w-full sm:w-72">
          <span className="material-symbols-outlined text-[16px] text-light-outline absolute left-2.5 pointer-events-none">
            search
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, ID, course, or batch..."
            className="w-full pl-8 pr-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
          >
            <option value="All">All Course Programs</option>
            {coursesList.map((c) => (
              <option key={c.id} value={c.title}>{c.title}</option>
            ))}
          </select>

          <select
            value={filterBatch}
            onChange={(e) => setFilterBatch(e.target.value)}
            className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
          >
            <option value="All">All Batches</option>
            {distinctBatches.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Completed">Completed</option>
            <option value="On Leave">On Leave</option>
          </select>

          {(search || filterCourse !== 'All' || filterBatch !== 'All' || filterStatus !== 'All') && (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                setFilterCourse('All')
                setFilterBatch('All')
                setFilterStatus('All')
              }}
              className="px-2 py-1 text-xs text-light-primary hover:underline font-medium cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Onboarding Roster Table */}
      <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded overflow-hidden shadow-xs flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/60 dark:bg-dark-surface-container/60 text-light-on-surface-variant dark:text-dark-on-surface-variant font-label text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Student ID</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Enrolled Course</th>
                <th className="py-2.5 px-3">Batch Cohort</th>
                <th className="py-2.5 px-3">Curriculum / Days</th>
                <th className="py-2.5 px-3">Start Date</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Fee Plan</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-outline-variant/60 dark:divide-dark-outline-variant/60 font-body text-xs">
              {filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-light-on-surface-variant">
                    <span className="material-symbols-outlined text-[36px] opacity-40 block mb-1">assignment_late</span>
                    <p className="font-semibold text-xs">No student course onboardings match criteria</p>
                    <p className="text-[11px] opacity-80 mt-0.5">Click "+ Onboard Student to Course" to enroll a student</p>
                  </td>
                </tr>
              ) : (
                filteredEnrollments.map((item) => {
                  const initials = getInitials(item.student_name)

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-light-surface-container-low/40 dark:hover:bg-dark-surface-container/30 transition-colors"
                    >
                      {/* Student ID */}
                      <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                        <span className="font-mono text-xs font-bold text-light-primary dark:text-dark-primary">
                          {item.student_code}
                        </span>
                      </td>

                      {/* Student Details */}
                      <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-2">
                          {item.student_avatar && !item.student_avatar.includes('unsplash.com') ? (
                            <img
                              src={item.student_avatar}
                              alt={item.student_name}
                              className="w-7 h-7 rounded-full object-cover shrink-0 border border-light-outline-variant/60 shadow-2xs"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-light-primary text-light-on-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                          )}
                          <div>
                            <span className="font-body text-xs font-semibold text-light-on-surface dark:text-dark-on-surface block">
                              {item.student_name}
                            </span>
                            <span className="font-mono text-[10px] text-light-on-surface-variant block">
                              {item.student_phone || item.student_email || 'Contact Registered'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Enrolled Course */}
                      <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                        <div className="flex flex-col">
                          <span className="font-body text-xs font-medium text-light-on-surface dark:text-dark-on-surface">
                            {item.track}
                          </span>
                          <span className="text-[10px] text-light-on-surface-variant">
                            {item.course_category || 'Academic Program'}
                          </span>
                        </div>
                      </td>

                      {/* Batch */}
                      <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-light-surface-container dark:bg-dark-surface-container border border-light-outline-variant/60">
                          {item.batch || item.batch_id}
                        </span>
                      </td>

                      {/* Curriculum / Days */}
                      <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                            {item.total_days || 30} Days
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary font-semibold">
                            {item.modules?.length || item.total_modules || 1} Mod
                          </span>
                        </div>
                      </td>

                      {/* Start Date */}
                      <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                        <span className="font-mono text-xs text-light-on-surface-variant">
                          {item.start_date || '2026-11-28'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-center align-middle">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            item.status === 'Active'
                              ? 'bg-success-container text-on-success-container'
                              : 'bg-pending-container text-on-pending-container'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.status === 'Active' ? 'bg-success' : 'bg-pending'
                            }`}
                          />
                          <span>{item.status || 'Active'}</span>
                        </span>
                      </td>

                      {/* Fee Plan */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-center align-middle">
                        <span className="text-[11px] font-medium text-light-on-surface dark:text-dark-on-surface">
                          {item.plan || 'Standard'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-right align-middle">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setViewingOnboarding(item)}
                            title="View Curriculum Modules & Details"
                            className="p-1 rounded text-light-on-surface-variant hover:text-light-primary hover:bg-light-surface-container transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingOnboarding({ ...item })}
                            title="Edit Onboarding & Batch Allocation"
                            className="p-1 rounded text-light-on-surface-variant hover:text-light-primary hover:bg-light-surface-container transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setViewingPass(item)}
                            title="View / Print Course Enrollment Pass"
                            className="p-1 rounded text-light-on-surface-variant hover:text-light-primary hover:bg-light-surface-container transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">badge</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteEnrollment(item.id, item.student_name, item.track)}
                            title="Drop / Unenroll Course"
                            className="p-1 rounded text-light-on-surface-variant hover:text-overdue hover:bg-overdue-container/20 transition-colors cursor-pointer"
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
        </div>

        {/* Table Footer */}
        <div className="p-2 border-t border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/40 dark:bg-dark-surface-container/40 flex items-center justify-between text-[11px] text-light-on-surface-variant">
          <span>
            Showing <strong>{filteredEnrollments.length}</strong> of <strong>{enrollments.length}</strong> course onboardings
          </span>
          <span>Bixcel ERP Academic Course Onboarding</span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: ONBOARD STUDENT TO COURSE                                    */}
      {/* ===================================================================== */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-2xl p-4 flex flex-col gap-3 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                </span>
                <div>
                  <h3 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                    Onboard Student to Course
                  </h3>
                  <span className="text-[11px] text-light-on-surface-variant block">
                    Select registered student, target course curriculum, and allocate batch cohort
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOnboardModal(false)}
                className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container-low"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmOnboard} className="flex flex-col gap-3 text-xs">
              {/* Student Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  1. Select Student (From Student Master) *
                </label>
                <select
                  required
                  value={onboardForm.studentId}
                  onChange={(e) => setOnboardForm((prev) => ({ ...prev, studentId: e.target.value }))}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                >
                  <option value="">-- Choose Registered Student --</option>
                  {studentsList.map((s) => (
                    <option key={s.id} value={s.student_id || s.id}>
                      [{s.student_id}] {s.full_name} {s.phone ? `• ${s.phone}` : ''}
                    </option>
                  ))}
                </select>
                {studentsList.length === 0 && (
                  <p className="text-[10px] text-overdue mt-1">
                    No students found in Student Master. Please add a student in Student Master first.
                  </p>
                )}
              </div>

              {/* Course Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  2. Select Course Program (From Course Master) *
                </label>
                <select
                  required
                  value={onboardForm.courseTitle}
                  onChange={(e) => handleCourseChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                >
                  <option value="">-- Choose Course Program --</option>
                  {coursesList.map((c) => (
                    <option key={c.id} value={c.title}>
                      {c.title} ({c.code || 'CRS'}) • {c.days || 30} Days • {c.instructor || 'Faculty Lead'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch & Scheduling Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Batch Cohort Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={onboardForm.batch}
                    onChange={(e) => setOnboardForm((prev) => ({ ...prev, batch: e.target.value }))}
                    className="w-full px-2 py-1 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Course Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={onboardForm.startDate}
                    onChange={(e) => setOnboardForm((prev) => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Estimated End Date
                  </label>
                  <input
                    type="date"
                    value={onboardForm.endDate}
                    onChange={(e) => setOnboardForm((prev) => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
              </div>

              {/* Tuition & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Enrollment Status
                  </label>
                  <select
                    value={onboardForm.status}
                    onChange={(e) => setOnboardForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Tuition Fee Plan
                  </label>
                  <select
                    value={onboardForm.plan}
                    onChange={(e) => setOnboardForm((prev) => ({ ...prev, plan: e.target.value }))}
                    className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  >
                    <option value="Full Payment">Full Payment</option>
                    <option value="Installments">Installments</option>
                    <option value="Scholarship">Scholarship</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Tuition Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={onboardForm.tuitionFee}
                    onChange={(e) => setOnboardForm((prev) => ({ ...prev, tuitionFee: e.target.value }))}
                    className="w-full px-2 py-1 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
              </div>

              {/* Module Allocation Overview */}
              <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-label text-[11px] font-bold text-light-primary dark:text-dark-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[15px]">view_quilt</span>
                    <span>Allocated Modules ({onboardForm.selectedModules.length} Modules • {computedTotalDays} Total Days)</span>
                  </span>
                  <span className="text-[10px] text-light-on-surface-variant">Check/uncheck to customize curriculum</span>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {modulesList.map((m) => {
                    const isChecked = onboardForm.selectedModules.some((sm) => String(sm.id || sm.code) === String(m.id || m.code))
                    return (
                      <label
                        key={m.id}
                        className={`flex items-center justify-between p-1.5 rounded border text-xs cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-light-primary-tint/50 dark:bg-dark-primary-tint/30 border-light-primary/40'
                            : 'bg-light-surface-container-lowest dark:bg-dark-surface-bright border-light-outline-variant opacity-75'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleModule(m)}
                            className="rounded text-light-primary focus:ring-0 cursor-pointer"
                          />
                          <span className="font-mono text-[10px] font-bold text-light-primary">{m.code || `M-${m.id}`}</span>
                          <span className="font-medium truncate max-w-[280px]">{m.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {m.instructor && <span className="text-[10px] text-light-on-surface-variant truncate max-w-[100px]">{m.instructor}</span>}
                          <span className="font-mono text-[10px] font-bold">{m.days || 1}d</span>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-light-outline-variant dark:border-dark-outline-variant pt-2.5 mt-1">
                <button
                  type="button"
                  onClick={() => setShowOnboardModal(false)}
                  className="px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant text-xs font-semibold hover:bg-light-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOnboarding}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-light-primary text-light-on-primary font-semibold text-xs shadow-xs hover:bg-light-primary-container disabled:opacity-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isOnboarding ? 'sync' : 'how_to_reg'}
                  </span>
                  <span>{isOnboarding ? 'Onboarding...' : 'Confirm Course Onboarding'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: VIEW CURRICULUM MODULES DRAWER                               */}
      {/* ===================================================================== */}
      {viewingOnboarding && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-lg p-4 flex flex-col gap-3 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-light-primary text-[20px]">menu_book</span>
                <div>
                  <h3 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                    {viewingOnboarding.track}
                  </h3>
                  <span className="text-[11px] text-light-on-surface-variant font-mono">
                    Student: {viewingOnboarding.student_name} ({viewingOnboarding.student_code})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingOnboarding(null)}
                className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant">
              <div>
                <span className="text-light-on-surface-variant block">Batch:</span>
                <strong className="font-mono text-light-primary font-bold">{viewingOnboarding.batch || viewingOnboarding.batch_id}</strong>
              </div>
              <div>
                <span className="text-light-on-surface-variant block">Total Days:</span>
                <strong>{viewingOnboarding.total_days} Instructional Days</strong>
              </div>
              <div>
                <span className="text-light-on-surface-variant block">Start Date:</span>
                <span className="font-mono">{viewingOnboarding.start_date}</span>
              </div>
              <div>
                <span className="text-light-on-surface-variant block">Status:</span>
                <span className="font-semibold text-success">{viewingOnboarding.status}</span>
              </div>
            </div>

            {/* Modules List */}
            <div className="space-y-1.5">
              <span className="font-label text-xs font-bold text-light-on-surface dark:text-dark-on-surface block">
                Assigned Curriculum Modules ({viewingOnboarding.modules?.length || 1}):
              </span>
              <div className="divide-y divide-light-outline-variant/60 border border-light-outline-variant rounded overflow-hidden">
                {(viewingOnboarding.modules && viewingOnboarding.modules.length > 0 ? viewingOnboarding.modules : [
                  { title: viewingOnboarding.track, days: viewingOnboarding.total_days, status: 'Active' }
                ]).map((m, idx) => (
                  <div key={idx} className="p-2 flex items-center justify-between text-xs bg-light-surface-container-lowest dark:bg-dark-surface-bright">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-light-primary">{m.module_code || m.id || `M-${idx + 1}`}</span>
                      <span className="font-medium text-light-on-surface dark:text-dark-on-surface">{m.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {m.instructor && <span className="text-[10px] text-light-on-surface-variant">{m.instructor}</span>}
                      <span className="font-mono text-xs font-bold text-light-on-surface dark:text-dark-on-surface">{m.days} Days</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-light-outline-variant dark:border-dark-outline-variant">
              <button
                type="button"
                onClick={() => setViewingOnboarding(null)}
                className="px-3 py-1 rounded bg-light-surface-container font-semibold text-xs hover:bg-light-surface-container-high cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: EDIT ONBOARDING RECORD                                       */}
      {/* ===================================================================== */}
      {editingOnboarding && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-md p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2">
              <h3 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                Edit Course Onboarding: {editingOnboarding.student_name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingOnboarding(null)}
                className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                  Course Program
                </label>
                <input
                  type="text"
                  disabled
                  value={editingOnboarding.track}
                  className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant bg-light-surface-container opacity-70"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Batch Code
                  </label>
                  <input
                    type="text"
                    value={editingOnboarding.batch || editingOnboarding.batch_id}
                    onChange={(e) => setEditingOnboarding({ ...editingOnboarding, batch: e.target.value, batch_id: e.target.value })}
                    className="w-full px-2 py-1 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Status
                  </label>
                  <select
                    value={editingOnboarding.status}
                    onChange={(e) => setEditingOnboarding({ ...editingOnboarding, status: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editingOnboarding.start_date || ''}
                    onChange={(e) => setEditingOnboarding({ ...editingOnboarding, start_date: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Fee Plan
                  </label>
                  <select
                    value={editingOnboarding.plan || 'Standard'}
                    onChange={(e) => setEditingOnboarding({ ...editingOnboarding, plan: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  >
                    <option value="Full Payment">Full Payment</option>
                    <option value="Installments">Installments</option>
                    <option value="Scholarship">Scholarship</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-light-outline-variant dark:border-dark-outline-variant pt-2 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingOnboarding(null)}
                  className="px-3 py-1 rounded border border-light-outline-variant text-xs hover:bg-light-surface-container-low"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-light-primary text-light-on-primary font-semibold text-xs hover:bg-light-primary-container"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: COURSE ENROLLMENT PASS BADGE                                 */}
      {/* ===================================================================== */}
      {viewingPass && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-md p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2">
              <span className="font-label text-xs font-bold text-light-primary">
                Official Course Enrollment Pass
              </span>
              <button type="button" onClick={() => setViewingPass(null)} className="p-0.5 text-light-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <div className="border border-light-primary/30 rounded p-3 bg-light-surface-container-low/50 dark:bg-dark-surface-container/50 flex flex-col gap-2.5">
              <div className="flex items-center justify-between border-b border-light-outline-variant/60 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-light-primary text-light-on-primary font-bold text-xs flex items-center justify-center shrink-0">
                    {getInitials(viewingPass.student_name)}
                  </div>
                  <div>
                    <h4 className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                      {viewingPass.student_name}
                    </h4>
                    <span className="font-mono text-[10px] text-light-primary font-bold">
                      {viewingPass.student_code}
                    </span>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-success-container text-on-success-container text-[10px] font-bold">
                  {viewingPass.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block">Enrolled Course:</span>
                  <strong className="text-light-on-surface dark:text-dark-on-surface">{viewingPass.track}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block">Batch Cohort:</span>
                  <strong className="font-mono text-light-on-surface dark:text-dark-on-surface">{viewingPass.batch || viewingPass.batch_id}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block">Curriculum Pacing:</span>
                  <strong className="text-light-on-surface dark:text-dark-on-surface">{viewingPass.total_days} Instructional Days</strong>
                </div>
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block">Fee Plan:</span>
                  <strong className="text-success">{viewingPass.plan || 'Full Payment'}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-light-outline-variant">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 px-3 py-1 rounded bg-light-primary text-light-on-primary text-xs font-semibold hover:bg-light-primary-container"
              >
                <span className="material-symbols-outlined text-[15px]">print</span>
                <span>Print Pass</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingPass(null)}
                className="px-3 py-1 rounded border border-light-outline-variant text-xs hover:bg-light-surface-container-low"
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

export default CourseOnboarding
