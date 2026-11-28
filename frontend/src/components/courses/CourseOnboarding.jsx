import React, { useState, useEffect, useMemo } from 'react'
import { apiService } from '../../services/api'

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'ST'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'ST'
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

const getRecordModules = (record) => {
  if (!record) return []
  let mods = record.modules
  if (typeof mods === 'string') {
    try {
      mods = JSON.parse(mods)
    } catch {
      mods = []
    }
  }
  if (Array.isArray(mods) && mods.length > 0) return mods
  return [
    {
      module_code: record.course_code || 'MOD-1',
      title: record.track || 'Core Curriculum Module',
      days: record.total_days || 30,
      instructor: 'Faculty Lead',
      status: 'Active',
    },
  ]
}

export function CourseOnboarding({ onNavigateToStudents, onNavigateToCourses }) {
  // Navigation / View Mode: 'list' (Directory table) | 'form' (Full-screen onboarding form)
  const [viewMode, setViewMode] = useState('list')

  const [enrollments, setEnrollments] = useState([])
  const [studentsList, setStudentsList] = useState([])
  const [coursesList, setCoursesList] = useState([])
  const [modulesList, setModulesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')

  // Search & Filters in List View
  const [search, setSearch] = useState('')
  const [filterCourse, setFilterCourse] = useState('All')
  const [filterBatch, setFilterBatch] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')

  // Modals & Drawers in List View
  const [viewingOnboarding, setViewingOnboarding] = useState(null)
  const [editingOnboarding, setEditingOnboarding] = useState(null)
  const [viewingPass, setViewingPass] = useState(null)

  // =========================================================================
  // FULL-SCREEN ONBOARDING FORM STATE
  // =========================================================================
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [courseMode, setCourseMode] = useState('standard') // 'standard' (Course Master) | 'custom' (Pick from Module Master)

  // Standard Course Mode State
  const [selectedCourseId, setSelectedCourseId] = useState('')

  // Custom Modular Course Framing State
  const [customCourseTitle, setCustomCourseTitle] = useState('')
  const [customCourseCode, setCustomCourseCode] = useState('CUST-2026')
  const [customCategory, setCustomCategory] = useState('General')
  const [selectedModuleIds, setSelectedModuleIds] = useState([])
  const [moduleSearch, setModuleSearch] = useState('')
  const [moduleCategoryFilter, setModuleCategoryFilter] = useState('All')

  // Cohort, Scheduling & Tuition Fee Scheduler State
  const [batchCode, setBatchCode] = useState('BIX-2026-A')
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(() => new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  const [status, setStatus] = useState('Active')
  const [totalAmount, setTotalAmount] = useState(45000)
  const [paidNow, setPaidNow] = useState(15000)
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 30)
    return d.toISOString().split('T')[0]
  })
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer')
  const [plan, setPlan] = useState('Installments')
  const [isOnboarding, setIsOnboarding] = useState(false)

  // Balance calculation (Dynamic: Total Amount - Now Paid)
  const balanceAmount = useMemo(() => {
    const tot = Number(totalAmount) || 0
    const paid = Number(paidNow) || 0
    return Math.max(0, tot - paid)
  }, [totalAmount, paidNow])

  // Helper to schedule due date relative to today
  const setDueDaysFromNow = (days) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    setDueDate(d.toISOString().split('T')[0])
  }

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

  // Auto-sync selected course and student once data loads if not yet set
  useEffect(() => {
    if (!selectedCourseId && coursesList.length > 0) {
      const firstCourse = coursesList[0]
      setSelectedCourseId(firstCourse.id)
      if (firstCourse.code) {
        setBatchCode(`${firstCourse.code}-26A`)
      }
      const fee = Number(firstCourse.price || firstCourse.tuition_fee)
      if (fee > 0) {
        setTotalAmount(fee)
        setPaidNow(Math.round(fee / 2))
      }
    }
  }, [coursesList, selectedCourseId])

  useEffect(() => {
    if (!selectedStudentId && studentsList.length > 0) {
      setSelectedStudentId(studentsList[0].student_id || studentsList[0].id)
    }
  }, [studentsList, selectedStudentId])

  // Currently selected student object
  const selectedStudent = useMemo(() => {
    if (!selectedStudentId) return null
    return studentsList.find((s) => String(s.student_id) === String(selectedStudentId) || String(s.id) === String(selectedStudentId)) || null
  }, [studentsList, selectedStudentId])

  // Currently selected Course Master object
  const selectedCourse = useMemo(() => {
    if (!selectedCourseId && coursesList.length > 0) return coursesList[0]
    return coursesList.find((c) => String(c.id) === String(selectedCourseId) || c.title === selectedCourseId) || coursesList[0] || null
  }, [coursesList, selectedCourseId])

  // Modules belonging to selected Standard Course
  const standardCourseModules = useMemo(() => {
    if (!selectedCourse) return []
    let rawIds = selectedCourse.module_ids || []
    if (typeof rawIds === 'string') {
      try {
        rawIds = JSON.parse(rawIds)
      } catch {
        rawIds = []
      }
    }
    if (Array.isArray(rawIds) && rawIds.length > 0) {
      const idSet = new Set(rawIds.map(String))
      const matched = modulesList.filter((m) => idSet.has(String(m.id)) || idSet.has(String(m.code)))
      if (matched.length > 0) return matched
    }
    return [
      {
        id: selectedCourse.code || `CRS-${selectedCourse.id}`,
        code: selectedCourse.code || `CRS-${selectedCourse.id}`,
        title: `${selectedCourse.title} Comprehensive Syllabus`,
        days: selectedCourse.days ? Number(selectedCourse.days) : 30,
        instructor: selectedCourse.instructor || 'Faculty Lead',
      },
    ]
  }, [selectedCourse, modulesList])

  // Modules selected in Custom Framing Mode
  const customSelectedModules = useMemo(() => {
    const idSet = new Set(selectedModuleIds.map(String))
    return modulesList.filter((m) => idSet.has(String(m.id)) || idSet.has(String(m.code)))
  }, [modulesList, selectedModuleIds])

  // Distinct Module Categories
  const moduleCategories = useMemo(() => {
    const set = new Set(['All'])
    modulesList.forEach((m) => {
      if (m.category) set.add(m.category)
      if (m.domain) set.add(m.domain)
    })
    return Array.from(set)
  }, [modulesList])

  // Filtered modules for Custom Modular Picker
  const filteredModulesForPicker = useMemo(() => {
    return modulesList.filter((m) => {
      const q = moduleSearch.toLowerCase().trim()
      const matchSearch =
        !q ||
        m.title?.toLowerCase().includes(q) ||
        m.code?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q) ||
        m.instructor?.toLowerCase().includes(q)

      const matchCat =
        moduleCategoryFilter === 'All' ||
        m.category?.toLowerCase() === moduleCategoryFilter.toLowerCase() ||
        m.domain?.toLowerCase() === moduleCategoryFilter.toLowerCase()

      return matchSearch && matchCat
    })
  }, [modulesList, moduleSearch, moduleCategoryFilter])

  // Cumulative Instructional Days Calculation
  const cumulativeDays = useMemo(() => {
    if (courseMode === 'standard') {
      if (selectedCourse?.days && Number(selectedCourse.days) > 0) {
        return Number(selectedCourse.days)
      }
      if (standardCourseModules.length > 0) {
        return standardCourseModules.reduce((acc, m) => acc + (Number(m.days) || 0), 0)
      }
      return 30
    }
    return customSelectedModules.reduce((acc, m) => acc + (Number(m.days) || 0), 0)
  }, [courseMode, selectedCourse, standardCourseModules, customSelectedModules])

  // Open Full-Screen Onboarding Form
  const startFullOnboarding = (initialStudentId = '') => {
    const defaultStudent = initialStudentId || (studentsList.length > 0 ? (studentsList[0].student_id || studentsList[0].id) : '')
    const defaultCourse = coursesList.length > 0 ? coursesList[0] : null
    const courseFee = defaultCourse ? Number(defaultCourse.price || defaultCourse.tuition_fee || 45000) : 45000

    setSelectedStudentId(defaultStudent)
    setCourseMode('standard')
    setSelectedCourseId(defaultCourse ? defaultCourse.id : '')
    setCustomCourseTitle('')
    setCustomCourseCode(`CUST-${Date.now().toString().slice(-4)}`)
    setSelectedModuleIds([])
    setBatchCode(defaultCourse?.code ? `${defaultCourse.code}-26A` : 'BIX-2026-A')
    setStartDate(new Date().toISOString().split('T')[0])
    setEndDate(new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    setStatus('Active')
    setTotalAmount(courseFee > 0 ? courseFee : 45000)
    setPaidNow(courseFee > 0 ? Math.round(courseFee / 2) : 15000)
    const d = new Date()
    d.setDate(d.getDate() + 30)
    setDueDate(d.toISOString().split('T')[0])
    setPaymentMethod('Bank Transfer')
    setPlan('Installments')

    setViewMode('form')
  }

  // Toggle Module Selection in Custom Mode
  const handleToggleModule = (mod) => {
    const key = String(mod.id || mod.code)
    setSelectedModuleIds((prev) => {
      const exists = prev.some((id) => String(id) === key)
      if (exists) {
        return prev.filter((id) => String(id) !== key)
      } else {
        return [...prev, key]
      }
    })
  }

  // Handle Course Selection in Standard Mode
  const handleSelectStandardCourse = (courseId) => {
    setSelectedCourseId(courseId)
    const found = coursesList.find((c) => String(c.id) === String(courseId) || c.title === courseId)
    if (found) {
      if (found.code) {
        setBatchCode(`${found.code}-26A`)
      }
      const p = Number(found.price || found.tuition_fee)
      if (p > 0) {
        setTotalAmount(p)
        setPaidNow(Math.round(p / 2))
      }
    }
  }

  // Submit Full-Screen Course Onboarding Form
  const handleSubmitOnboardingForm = async (e) => {
    e.preventDefault()

    if (!selectedStudent) {
      alert('Please select a student to onboard.')
      return
    }

    if (courseMode === 'standard' && !selectedCourse) {
      alert('Please select a course program from Course Master.')
      return
    }

    if (courseMode === 'custom') {
      if (!customCourseTitle.trim()) {
        alert('Please enter a custom course title.')
        return
      }
      if (customSelectedModules.length === 0) {
        alert('Please pick and select at least one module from the Module List.')
        return
      }
    }

    setIsOnboarding(true)

    const effectiveTitle = courseMode === 'standard' ? selectedCourse.title : customCourseTitle.trim()
    const effectiveCategory = courseMode === 'standard' ? (selectedCourse.category || 'Engineering') : customCategory
    const effectiveModules = courseMode === 'standard' ? standardCourseModules : customSelectedModules

    const payload = {
      student_id: selectedStudent.id,
      student_code: selectedStudent.student_id,
      track: effectiveTitle,
      course_title: effectiveTitle,
      category: effectiveCategory,
      batch: batchCode.trim() || 'BIX-2026-A',
      start_date: startDate,
      end_date: endDate,
      total_days: cumulativeDays || 30,
      total_modules: effectiveModules.length,
      status: status,
      plan: plan,
      tuition_fee: Number(totalAmount) || 0,
      total_amount: Number(totalAmount) || 0,
      paid_amount: Number(paidNow) || 0,
      balance_amount: balanceAmount,
      due_date: dueDate || null,
      payment_method: paymentMethod || 'Bank Transfer',
      modules: effectiveModules.map((m, idx) => ({
        module_code: m.code || m.id || `MOD-${idx + 1}`,
        title: m.title,
        days: Number(m.days) || 1,
        instructor: m.instructor || '',
      })),
    }

    try {
      const res = await apiService.createEnrollment(payload)
      const newRecord = res?.data || {
        id: Date.now(),
        ...payload,
        student_name: selectedStudent.full_name,
        student_phone: selectedStudent.phone,
        student_email: selectedStudent.email,
        student_avatar: selectedStudent.avatar,
      }
      setEnrollments((prev) => [newRecord, ...prev])
      setToast(`Student "${selectedStudent.full_name}" (${selectedStudent.student_id}) successfully onboarded to "${effectiveTitle}"!`)
      setViewMode('list')
    } catch (err) {
      console.warn('API error, saving locally:', err)
      const mockRecord = {
        id: Date.now(),
        ...payload,
        student_name: selectedStudent.full_name,
        student_phone: selectedStudent.phone,
        student_email: selectedStudent.email,
        student_avatar: selectedStudent.avatar,
      }
      setEnrollments((prev) => [mockRecord, ...prev])
      setToast(`Student "${selectedStudent.full_name}" onboarded locally!`)
      setViewMode('list')
    } finally {
      setIsOnboarding(false)
      setTimeout(() => setToast(''), 4000)
    }
  }

  // Handle Edit Update
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editingOnboarding) return

    const tot = Number(editingOnboarding.tuition_fee || editingOnboarding.total_amount) || 0
    const paid = Number(editingOnboarding.paid_amount) || 0
    const bal = Math.max(0, tot - paid)

    const updated = {
      ...editingOnboarding,
      tuition_fee: tot,
      total_amount: tot,
      paid_amount: paid,
      balance_amount: bal,
      due_date: editingOnboarding.due_date || null,
      payment_method: editingOnboarding.payment_method || 'Bank Transfer',
    }

    try {
      await apiService.updateEnrollment(updated.id, updated)
    } catch (err) {
      console.warn('API update failed:', err)
    }

    setEnrollments((prev) =>
      prev.map((item) => (item.id === updated.id ? { ...updated, updated_at: new Date().toISOString() } : item))
    )
    setToast(`Course onboarding & fee schedule for "${editingOnboarding.student_name}" updated!`)
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
      if (!item) return false
      const q = (search || '').toLowerCase().trim()
      const matchSearch =
        !q ||
        (item.student_name && item.student_name.toLowerCase().includes(q)) ||
        (item.student_code && item.student_code.toLowerCase().includes(q)) ||
        (item.track && item.track.toLowerCase().includes(q)) ||
        (item.batch && item.batch.toLowerCase().includes(q)) ||
        (item.batch_id && item.batch_id.toLowerCase().includes(q))

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
      if (e && (e.batch || e.batch_id)) set.add(e.batch || e.batch_id)
    })
    return Array.from(set)
  }, [enrollments])

  // Metrics
  const totalCount = enrollments.length
  const activeCount = enrollments.filter((e) => e && e.status === 'Active').length
  const coursesCount = new Set(enrollments.filter(Boolean).map((e) => e.track)).size
  const avgDays = totalCount > 0 ? Math.round(enrollments.reduce((acc, e) => acc + (Number(e?.total_days) || 0), 0) / totalCount) : 0

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

      {/* ===================================================================== */}
      {/* VIEW 1: FULL-SCREEN COURSE ONBOARDING FORM                            */}
      {/* ===================================================================== */}
      {viewMode === 'form' ? (
        <div className="flex flex-col gap-4 w-full animate-in fade-in duration-150">
          {/* Top Form Header with Back Action */}
          <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-3.5 rounded-md shadow-xs">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="p-1 rounded text-light-on-surface-variant hover:text-light-primary hover:bg-light-surface-container-low transition-colors cursor-pointer mr-1"
                  title="Back to Directory"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                </button>
                <span className="material-symbols-outlined text-light-primary text-[20px]">how_to_reg</span>
                <h1 className="font-title text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface">
                  Onboard Student to Course
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint font-mono text-[10px] font-bold">
                  {courseMode === 'standard' ? 'Standard Course Master' : 'Custom Modular Framing'}
                </span>
              </div>
              <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant ml-8">
                Select registered student, allocate standard institutional course program, or custom-frame individualized modules.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setViewMode('list')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container font-label text-xs font-semibold shadow-xs transition-colors whitespace-nowrap cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[16px]">view_list</span>
              <span>Back to Directory</span>
            </button>
          </section>

          {/* Main Full-Screen Form Container */}
          <form onSubmit={handleSubmitOnboardingForm} className="flex flex-col gap-4">
            {/* STEP 1: SELECT STUDENT */}
            <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-4 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-light-outline-variant/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-light-primary text-light-on-primary text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h2 className="font-title text-sm font-bold text-light-on-surface dark:text-dark-on-surface">
                    Select Registered Student
                  </h2>
                </div>
                <span className="text-[11px] text-light-on-surface-variant">Step 1 of 3</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Student Candidate (From Student Master) *
                  </label>
                  <select
                    required
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="">-- Choose Candidate Student --</option>
                    {studentsList.map((s) => (
                      <option key={s.id} value={s.student_id || s.id}>
                        [{s.student_id}] {s.full_name} {s.phone ? `• ${s.phone}` : ''}
                      </option>
                    ))}
                  </select>
                  {studentsList.length === 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <p className="text-[11px] text-overdue font-medium">
                        No students registered. Please add a student in Student Master first.
                      </p>
                      {onNavigateToStudents && (
                        <button
                          type="button"
                          onClick={onNavigateToStudents}
                          className="text-[11px] text-light-primary hover:underline font-bold cursor-pointer"
                        >
                          Go to Student Master &rarr;
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Student Profile Preview Card */}
                {selectedStudent ? (
                  <div className="p-3 rounded border border-light-primary/30 bg-light-primary-tint/30 dark:bg-dark-primary-tint/20 flex items-center gap-3">
                    {selectedStudent.avatar && typeof selectedStudent.avatar === 'string' && selectedStudent.avatar.trim().length > 5 && !selectedStudent.avatar.includes('unsplash.com') ? (
                      <img
                        src={selectedStudent.avatar}
                        alt={selectedStudent.full_name}
                        className="w-12 h-12 rounded-full object-cover border border-light-primary shrink-0 shadow-2xs"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-light-primary text-light-on-primary font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                        {getInitials(selectedStudent.full_name)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs text-light-on-surface dark:text-dark-on-surface truncate block">
                          {selectedStudent.full_name}
                        </strong>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-success-container text-on-success-container">
                          {selectedStudent.status || 'Active'}
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-light-primary font-bold block">
                        {selectedStudent.student_id}
                      </span>
                      <span className="text-[10px] text-light-on-surface-variant block truncate">
                        {selectedStudent.phone} • {selectedStudent.email || 'Email registered'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded border border-dashed border-light-outline-variant flex items-center justify-center text-center text-xs text-light-on-surface-variant">
                    Please select a student from the dropdown to preview registration profile
                  </div>
                )}
              </div>
            </section>

            {/* STEP 2: COURSE PROGRAM MODE & ALLOCATION */}
            <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-4 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-light-outline-variant/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-light-primary text-light-on-primary text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <h2 className="font-title text-sm font-bold text-light-on-surface dark:text-dark-on-surface">
                    Curriculum Framing &amp; Course Selection
                  </h2>
                </div>
                <span className="text-[11px] text-light-on-surface-variant">Step 2 of 3</span>
              </div>

              {/* Segmented Mode Picker Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setCourseMode('standard')}
                  className={`p-3 rounded-md border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    courseMode === 'standard'
                      ? 'border-light-primary bg-light-primary-tint/30 dark:bg-dark-primary-tint/20 shadow-xs'
                      : 'border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container hover:border-light-primary/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    courseMode === 'standard' ? 'bg-light-primary text-light-on-primary' : 'bg-light-surface-container text-light-on-surface-variant'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">menu_book</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                        Option A: Standard Course Program
                      </h3>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary">
                        Course Master
                      </span>
                    </div>
                    <p className="text-[11px] text-light-on-surface-variant mt-0.5">
                      Fetch and allocate a complete institutional certified course program from Course Master with its pre-assigned modules.
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setCourseMode('custom')}
                  className={`p-3 rounded-md border-2 cursor-pointer transition-all flex items-start gap-3 ${
                    courseMode === 'custom'
                      ? 'border-light-primary bg-light-primary-tint/30 dark:bg-dark-primary-tint/20 shadow-xs'
                      : 'border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container hover:border-light-primary/50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    courseMode === 'custom' ? 'bg-light-primary text-light-on-primary' : 'bg-light-surface-container text-light-on-surface-variant'
                  }`}>
                    <span className="material-symbols-outlined text-[18px]">view_quilt</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                        Option B: Custom Modular Course Framing
                      </h3>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-light-secondary-container text-light-on-secondary-container">
                        Module Library
                      </span>
                    </div>
                    <p className="text-[11px] text-light-on-surface-variant mt-0.5">
                      Frame an individualized custom curriculum for this student by picking and selecting modules directly from the Module List.
                    </p>
                  </div>
                </div>
              </div>

              {/* OPTION A: STANDARD COURSE PROGRAM (FETCH FROM COURSE MASTER) */}
              {courseMode === 'standard' && (
                <div className="p-3.5 rounded border border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container flex flex-col gap-3 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface">
                          Select Course Program (From Course Master) *
                        </label>
                        {onNavigateToCourses && (
                          <button
                            type="button"
                            onClick={onNavigateToCourses}
                            className="text-[10px] text-light-primary hover:underline font-bold cursor-pointer"
                          >
                            Course Master &rarr;
                          </button>
                        )}
                      </div>
                      <select
                        required
                        value={selectedCourseId}
                        onChange={(e) => handleSelectStandardCourse(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                      >
                        {coursesList.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.title} ({c.code || 'CRS'}) • {c.days || 30} Days • Instructor: {c.instructor || 'Faculty Lead'}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Course Master Details Preview */}
                  {selectedCourse && (
                    <div className="p-3 rounded border border-light-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright flex flex-col gap-2">
                      <div className="flex items-center justify-between border-b border-light-outline-variant/60 pb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-light-primary">{selectedCourse.code || 'CRS'}</span>
                          <strong className="text-xs text-light-on-surface dark:text-dark-on-surface">{selectedCourse.title}</strong>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary">
                          {selectedCourse.days || 30} Instructional Days
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div>
                          <span className="text-light-on-surface-variant block">Category / Domain:</span>
                          <strong>{selectedCourse.category || 'General'}</strong>
                        </div>
                        <div>
                          <span className="text-light-on-surface-variant block">Course Instructor:</span>
                          <strong>{selectedCourse.instructor || 'Faculty Lead'}</strong>
                        </div>
                        <div>
                          <span className="text-light-on-surface-variant block">Total Modules:</span>
                          <strong>{standardCourseModules.length} Modules</strong>
                        </div>
                        <div>
                          <span className="text-light-on-surface-variant block">Curriculum Status:</span>
                          <strong className="text-success">{selectedCourse.status || 'Active'}</strong>
                        </div>
                      </div>

                      {/* Modules belonging to Course */}
                      <div className="mt-1 pt-2 border-t border-light-outline-variant/60">
                        <span className="text-[11px] font-semibold text-light-on-surface-variant block mb-1">
                          Curriculum Modules in this Course Program ({standardCourseModules.length}):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 max-h-40 overflow-y-auto pr-1">
                          {standardCourseModules.map((m, idx) => (
                            <div
                              key={idx}
                              className="p-1.5 rounded border border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-mono text-[10px] font-bold text-light-primary shrink-0">{m.code || `M${idx + 1}`}</span>
                                <span className="truncate text-[11px]">{m.title}</span>
                              </div>
                              <span className="font-mono text-[10px] font-bold text-light-on-surface-variant shrink-0">{m.days || 1}d</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* OPTION B: CUSTOM MODULAR COURSE FRAMING (PICK FROM MODULE MASTER) */}
              {courseMode === 'custom' && (
                <div className="p-3.5 rounded border border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container flex flex-col gap-3 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                        Frame Custom Course Title for Student *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Full-Stack Web Development & Cloud Acceleration"
                        value={customCourseTitle}
                        onChange={(e) => setCustomCourseTitle(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                        Custom Course Code
                      </label>
                      <input
                        type="text"
                        value={customCourseCode}
                        onChange={(e) => setCustomCourseCode(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                        Category / Domain
                      </label>
                      <select
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface"
                      >
                        <option value="General">General</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Design">Design</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Management">Management</option>
                      </select>
                    </div>
                  </div>

                  {/* Live Framing Summary Banner */}
                  <div className="p-2.5 rounded bg-light-primary-tint/50 dark:bg-dark-primary-tint/30 border border-light-primary/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-light-primary">playlist_add_check</span>
                      <span className="text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                        Framed Curriculum: <strong className="text-light-primary">{selectedModuleIds.length} Modules Selected</strong> • <strong className="text-light-primary">{cumulativeDays} Cumulative Instructional Days</strong>
                      </span>
                    </div>
                    {selectedModuleIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedModuleIds([])}
                        className="text-[10px] text-overdue hover:underline font-semibold"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Module Master Search & Category Filter */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-light-outline-variant/60 pb-2">
                    <div className="relative flex items-center w-full sm:w-64">
                      <span className="material-symbols-outlined text-[15px] text-light-outline absolute left-2 pointer-events-none">
                        search
                      </span>
                      <input
                        type="search"
                        value={moduleSearch}
                        onChange={(e) => setModuleSearch(e.target.value)}
                        placeholder="Search Module Master..."
                        className="w-full pl-7 pr-2 py-1 text-xs rounded border border-light-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      {moduleCategories.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setModuleCategoryFilter(cat)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                            moduleCategoryFilter === cat
                              ? 'bg-light-primary text-light-on-primary'
                              : 'bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant text-light-on-surface-variant hover:border-light-primary'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Module Master Selection Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                    {filteredModulesForPicker.map((m) => {
                      const isSelected = selectedModuleIds.some((id) => String(id) === String(m.id || m.code))

                      return (
                        <div
                          key={m.id}
                          onClick={() => handleToggleModule(m)}
                          className={`p-2.5 rounded border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                            isSelected
                              ? 'border-light-primary bg-light-primary-tint/40 dark:bg-dark-primary-tint/30 shadow-xs'
                              : 'border-light-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright hover:border-light-primary/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}} // handled by parent onClick
                                className="rounded text-light-primary focus:ring-0 cursor-pointer"
                              />
                              <span className="font-mono text-[10px] font-bold text-light-primary">{m.code || `M-${m.id}`}</span>
                            </div>
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-light-surface-container text-light-on-surface-variant">
                              {m.days || 1} Days
                            </span>
                          </div>

                          <h4 className="font-title text-xs font-semibold text-light-on-surface dark:text-dark-on-surface line-clamp-2">
                            {m.title}
                          </h4>

                          <div className="flex items-center justify-between text-[10px] text-light-on-surface-variant border-t border-light-outline-variant/40 pt-1 mt-0.5">
                            <span className="truncate max-w-[120px]">{m.category || 'General'}</span>
                            <span className="truncate max-w-[100px]">{m.tutor || m.instructor || 'Faculty'}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </section>

            {/* STEP 3: COHORT, SCHEDULE & TUITION FEE SCHEDULER */}
            <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-4 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-light-outline-variant/60 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-light-primary text-light-on-primary text-xs font-bold flex items-center justify-center">
                    3
                  </span>
                  <h2 className="font-title text-sm font-bold text-light-on-surface dark:text-dark-on-surface">
                    Batch Allocation &amp; Tuition Fee Scheduler
                  </h2>
                </div>
                <span className="text-[11px] text-light-on-surface-variant">Step 3 of 3</span>
              </div>

              {/* Cohort Batch & Schedule Row */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Batch Cohort Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={batchCode}
                    onChange={(e) => setBatchCode(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Course Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Estimated End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Initial Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>

              {/* DEDICATED TUITION FEE SCHEDULER */}
              <div className="p-3.5 rounded-md border-2 border-light-primary/30 bg-light-surface-container-low/50 dark:bg-dark-surface-container/40 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-light-outline-variant/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">payments</span>
                    </span>
                    <div>
                      <h3 className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                        Tuition Fee &amp; Balance Scheduler
                      </h3>
                      <p className="text-[10px] text-light-on-surface-variant">
                        Open total amount, enter initial payment received now, and schedule the remaining balance due date in DB.
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary font-mono">
                    Fee Auto-Sync
                  </span>
                </div>

                {/* 3 Fee Inputs: Total Amount, Now Paid, Payment Mode */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Total Tuition Amount (₹) *
                    </label>
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-xs font-bold text-light-outline pointer-events-none">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="500"
                        required
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        placeholder="e.g. 45000"
                        className="w-full pl-6 pr-3 py-1.5 text-xs font-mono font-bold rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface">
                        Amount Now Paid (₹) *
                      </label>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setPaidNow(totalAmount)}
                          className="text-[9px] font-bold text-light-primary hover:underline cursor-pointer"
                        >
                          Full
                        </button>
                        <span className="text-[9px] text-light-outline">•</span>
                        <button
                          type="button"
                          onClick={() => setPaidNow(Math.round((Number(totalAmount) || 0) / 2))}
                          className="text-[9px] font-bold text-light-primary hover:underline cursor-pointer"
                        >
                          50%
                        </button>
                        <span className="text-[9px] text-light-outline">•</span>
                        <button
                          type="button"
                          onClick={() => setPaidNow(0)}
                          className="text-[9px] font-bold text-light-on-surface-variant hover:underline cursor-pointer"
                        >
                          Zero
                        </button>
                      </div>
                    </div>
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-xs font-bold text-light-outline pointer-events-none">₹</span>
                      <input
                        type="number"
                        min="0"
                        max={totalAmount}
                        step="500"
                        required
                        value={paidNow}
                        onChange={(e) => setPaidNow(e.target.value)}
                        placeholder="e.g. 15000"
                        className="w-full pl-6 pr-3 py-1.5 text-xs font-mono font-bold rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Payment Mode / Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                    >
                      <option value="UPI">UPI / QR Code</option>
                      <option value="Cash">Cash Receipt</option>
                      <option value="Credit / Debit Card">Credit / Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                      <option value="Net Banking">Net Banking</option>
                      <option value="Cheque / DD">Cheque / Demand Draft</option>
                    </select>
                  </div>
                </div>

                {/* Live Calculated Fee Balance & Schedule Status Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-2.5 rounded bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant/70 text-xs">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-light-on-surface-variant font-medium">Total Course Fee</span>
                    <span className="font-mono text-sm font-bold text-light-on-surface dark:text-dark-on-surface">
                      ₹{Number(totalAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-light-on-surface-variant font-medium">Now Paid (Receipt)</span>
                    <span className="font-mono text-sm font-bold text-success">
                      ₹{Number(paidNow || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-light-on-surface-variant font-medium">Remaining Balance</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`font-mono text-sm font-bold ${balanceAmount === 0 ? 'text-success' : 'text-pending'}`}>
                        ₹{balanceAmount.toLocaleString('en-IN')}
                      </span>
                      {balanceAmount === 0 ? (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-success-container text-on-success-container">
                          Settled
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
                          Balance Due
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* SCHEDULE BALANCE DUE DATE SECTION */}
                {balanceAmount > 0 ? (
                  <div className="p-3 rounded border border-pending/30 bg-pending-container/20 dark:bg-pending-container/10 flex flex-col gap-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[17px] text-pending">event_upcoming</span>
                        <label className="text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                          Schedule Balance Due Date *
                        </label>
                      </div>
                      <div className="flex flex-wrap items-center gap-1">
                        <span className="text-[10px] text-light-on-surface-variant font-medium mr-1">Quick Presets:</span>
                        <button
                          type="button"
                          onClick={() => setDueDaysFromNow(15)}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant hover:border-light-primary text-light-on-surface cursor-pointer"
                        >
                          +15 Days
                        </button>
                        <button
                          type="button"
                          onClick={() => setDueDaysFromNow(30)}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant hover:border-light-primary text-light-primary cursor-pointer"
                        >
                          +30 Days (1 Mo)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDueDaysFromNow(45)}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant hover:border-light-primary text-light-on-surface cursor-pointer"
                        >
                          +45 Days
                        </button>
                        <button
                          type="button"
                          onClick={() => setDueDaysFromNow(60)}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant hover:border-light-primary text-light-on-surface cursor-pointer"
                        >
                          +60 Days (2 Mo)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDueDaysFromNow(90)}
                          className="px-2 py-0.5 rounded text-[10px] font-bold bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant hover:border-light-primary text-light-on-surface cursor-pointer"
                        >
                          +90 Days (3 Mo)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <input
                          type="date"
                          required
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded border border-pending/40 bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-pending"
                        />
                      </div>
                      <div className="text-[11px] text-light-on-surface-variant bg-light-surface-container-lowest/80 dark:bg-dark-surface-bright/80 p-2 rounded border border-light-outline-variant/60">
                        Balance of <strong className="text-pending font-mono">₹{balanceAmount.toLocaleString('en-IN')}</strong> will be captured in the database with scheduled due date <strong className="font-mono text-light-primary">{dueDate}</strong>.
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded border border-success/30 bg-success-container/20 text-xs flex items-center gap-2 text-on-success-container font-medium">
                    <span className="material-symbols-outlined text-[18px] text-success">verified</span>
                    <span>Tuition fee marked as fully paid at onboarding. No future balance invoice will be scheduled.</span>
                  </div>
                )}
              </div>
            </section>

            {/* Form Footer Action Buttons */}
            <div className="flex items-center justify-between p-3 bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="px-4 py-2 rounded border border-light-outline-variant dark:border-dark-outline-variant text-xs font-semibold hover:bg-light-surface-container-low transition-colors cursor-pointer"
              >
                Cancel &amp; Return to Directory
              </button>

              <button
                type="submit"
                disabled={isOnboarding}
                className="inline-flex items-center gap-1.5 px-6 py-2 rounded bg-light-primary text-light-on-primary font-semibold text-xs shadow-xs hover:bg-light-primary-container disabled:opacity-50 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isOnboarding ? 'sync' : 'how_to_reg'}
                </span>
                <span>{isOnboarding ? 'Onboarding Student...' : 'Confirm & Complete Course Onboarding'}</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* =================================================================== */
        /* VIEW 2: ONBOARDED STUDENTS DIRECTORY (LIST VIEW)                    */
        /* =================================================================== */
        <div className="flex flex-col gap-4 w-full">
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

            {/* Action Button: Opens Full-Screen Form */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => startFullOnboarding()}
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
                    <th className="py-2.5 px-3 text-center">Tuition &amp; Fee Schedule</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-outline-variant/60 dark:divide-dark-outline-variant/60 font-body text-xs">
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-light-on-surface-variant">
                        <span className="material-symbols-outlined text-[32px] text-light-primary animate-spin block mb-1">sync</span>
                        <p className="font-semibold text-xs">Loading course onboarding roster...</p>
                      </td>
                    </tr>
                  ) : filteredEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="py-12 text-center text-light-on-surface-variant">
                        <span className="material-symbols-outlined text-[36px] opacity-40 block mb-1">assignment_late</span>
                        <p className="font-semibold text-xs">No student course onboardings match criteria</p>
                        <p className="text-[11px] opacity-80 mt-0.5">Click "+ Onboard Student to Course" to frame and enroll a student</p>
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
                              {typeof item.student_avatar === 'string' && item.student_avatar.trim().length > 5 && !item.student_avatar.includes('unsplash.com') ? (
                                <img
                                  src={item.student_avatar}
                                  alt={item.student_name || 'Student'}
                                  className="w-7 h-7 rounded-full object-cover shrink-0 border border-light-outline-variant/60 shadow-2xs"
                                />
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-light-primary text-light-on-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                                  {initials}
                                </div>
                              )}
                              <div>
                                <span className="font-body text-xs font-semibold text-light-on-surface dark:text-dark-on-surface block">
                                  {item.student_name || 'Student Name'}
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
                                {getRecordModules(item).length} Mod
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

                          {/* Tuition & Fee Schedule */}
                          <td className="py-2.5 px-3 whitespace-nowrap text-center align-middle">
                            <div className="flex flex-col items-center">
                              <div className="flex items-center gap-1">
                                <span className="font-mono text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                                  ₹{(item.tuition_fee || item.total_amount || 0).toLocaleString('en-IN')}
                                </span>
                                {(item.balance_amount !== undefined ? item.balance_amount : ((item.tuition_fee || item.total_amount || 0) - (item.paid_amount || 0))) <= 0 ? (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-success-container text-on-success-container">
                                    Paid
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                    Bal ₹{(item.balance_amount !== undefined ? item.balance_amount : ((item.tuition_fee || item.total_amount || 0) - (item.paid_amount || 0))).toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-light-on-surface-variant font-mono">
                                <span>Paid: ₹{(item.paid_amount || 0).toLocaleString('en-IN')}</span>
                                {item.due_date && (item.balance_amount !== undefined ? item.balance_amount : ((item.tuition_fee || item.total_amount || 0) - (item.paid_amount || 0))) > 0 && (
                                  <span className="inline-flex items-center gap-0.5 text-pending font-semibold" title={`Balance Due Date: ${item.due_date}`}>
                                    <span className="material-symbols-outlined text-[11px]">event</span>
                                    Due: {item.due_date}
                                  </span>
                                )}
                              </div>
                            </div>
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
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: VIEW CURRICULUM MODULES DRAWER                               */}
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

            {/* Tuition Fee & Balance Schedule Card */}
            <div className="p-3 rounded-md border border-light-outline-variant bg-light-surface-container-low/70 dark:bg-dark-surface-container/70 flex flex-col gap-2">
              <div className="flex items-center justify-between border-b border-light-outline-variant/60 pb-1.5">
                <span className="font-label text-xs font-bold text-light-on-surface dark:text-dark-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-light-primary">payments</span>
                  Tuition Fee &amp; Balance Schedule
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  (viewingOnboarding.balance_amount !== undefined ? viewingOnboarding.balance_amount : ((viewingOnboarding.tuition_fee || 0) - (viewingOnboarding.paid_amount || 0))) <= 0
                    ? 'bg-success-container text-on-success-container'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                }`}>
                  {viewingOnboarding.fee_status || ((viewingOnboarding.balance_amount !== undefined ? viewingOnboarding.balance_amount : ((viewingOnboarding.tuition_fee || 0) - (viewingOnboarding.paid_amount || 0))) <= 0 ? 'Paid in Full' : 'Balance Scheduled')}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-light-on-surface-variant block">Total Tuition:</span>
                  <strong className="font-mono text-light-on-surface dark:text-dark-on-surface">₹{(viewingOnboarding.tuition_fee || viewingOnboarding.total_amount || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-light-on-surface-variant block">Now Paid:</span>
                  <strong className="font-mono text-success">₹{(viewingOnboarding.paid_amount || 0).toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-light-on-surface-variant block">Balance Amount:</span>
                  <strong className="font-mono text-pending">₹{(viewingOnboarding.balance_amount !== undefined ? viewingOnboarding.balance_amount : ((viewingOnboarding.tuition_fee || 0) - (viewingOnboarding.paid_amount || 0))).toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <span className="text-light-on-surface-variant block">Scheduled Due Date:</span>
                  <strong className="font-mono text-light-primary">{viewingOnboarding.due_date || 'N/A'}</strong>
                </div>
              </div>
              <div className="text-[10px] text-light-on-surface-variant flex items-center justify-between border-t border-light-outline-variant/40 pt-1">
                <span>Payment Mode: <strong>{viewingOnboarding.payment_method || 'Bank Transfer'}</strong></span>
                <span>Fee Plan: <strong>{viewingOnboarding.plan || 'Standard'}</strong></span>
              </div>
            </div>

            {/* Modules List */}
            {(() => {
              const modsList = getRecordModules(viewingOnboarding)
              return (
                <div className="space-y-1.5">
                  <span className="font-label text-xs font-bold text-light-on-surface dark:text-dark-on-surface block">
                    Assigned Curriculum Modules ({modsList.length}):
                  </span>
                  <div className="divide-y divide-light-outline-variant/60 border border-light-outline-variant rounded overflow-hidden">
                    {modsList.map((m, idx) => (
                      <div key={idx} className="p-2 flex items-center justify-between text-xs bg-light-surface-container-lowest dark:bg-dark-surface-bright">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-light-primary">{m.module_code || m.id || `M-${idx + 1}`}</span>
                          <span className="font-medium text-light-on-surface dark:text-dark-on-surface">{m.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {m.instructor && <span className="text-[10px] text-light-on-surface-variant">{m.instructor}</span>}
                          <span className="font-mono text-xs font-bold text-light-on-surface dark:text-dark-on-surface">{m.days || 1} Days</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

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
      {/* MODAL 2: EDIT ONBOARDING RECORD                                       */}
      {/* ===================================================================== */}
      {editingOnboarding && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-md p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2">
              <h3 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                Edit Course Onboarding: {editingOnboarding.student_name || 'Student'}
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
                  value={editingOnboarding.track || ''}
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
                    value={editingOnboarding.batch || editingOnboarding.batch_id || ''}
                    onChange={(e) => setEditingOnboarding({ ...editingOnboarding, batch: e.target.value, batch_id: e.target.value })}
                    className="w-full px-2 py-1 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Status
                  </label>
                  <select
                    value={editingOnboarding.status || 'Active'}
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

              {/* Fee & Schedule Settings in Edit Modal */}
              <div className="p-2.5 rounded border border-light-outline-variant bg-light-surface-container-low/60 dark:bg-dark-surface-container/60 space-y-2">
                <span className="font-label text-[11px] font-bold text-light-on-surface dark:text-dark-on-surface block border-b border-light-outline-variant/60 pb-1">
                  Tuition Fee &amp; Balance Schedule
                </span>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                      Total Tuition (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingOnboarding.tuition_fee ?? editingOnboarding.total_amount ?? 0}
                      onChange={(e) => setEditingOnboarding({ ...editingOnboarding, tuition_fee: Number(e.target.value), total_amount: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                      Now Paid (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editingOnboarding.paid_amount ?? 0}
                      onChange={(e) => setEditingOnboarding({ ...editingOnboarding, paid_amount: Number(e.target.value) })}
                      className="w-full px-2 py-1 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] p-1.5 rounded bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant/60">
                  <span className="text-light-on-surface-variant font-medium">Calculated Balance:</span>
                  <strong className={`font-mono ${
                    (Number(editingOnboarding.tuition_fee || editingOnboarding.total_amount || 0) - Number(editingOnboarding.paid_amount || 0)) <= 0 ? 'text-success' : 'text-pending'
                  }`}>
                    ₹{Math.max(0, Number(editingOnboarding.tuition_fee || editingOnboarding.total_amount || 0) - Number(editingOnboarding.paid_amount || 0)).toLocaleString('en-IN')}
                  </strong>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                      Balance Due Date
                    </label>
                    <input
                      type="date"
                      value={editingOnboarding.due_date || ''}
                      onChange={(e) => setEditingOnboarding({ ...editingOnboarding, due_date: e.target.value })}
                      className="w-full px-2 py-1 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                      Payment Mode
                    </label>
                    <select
                      value={editingOnboarding.payment_method || 'Bank Transfer'}
                      onChange={(e) => setEditingOnboarding({ ...editingOnboarding, payment_method: e.target.value })}
                      className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface"
                    >
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                      <option value="Credit / Debit Card">Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Net Banking">Net Banking</option>
                    </select>
                  </div>
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
      {/* MODAL 3: COURSE ENROLLMENT PASS BADGE                                 */}
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
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block">Tuition Paid / Total:</span>
                  <strong className="font-mono text-light-on-surface dark:text-dark-on-surface">
                    ₹{(viewingPass.paid_amount || 0).toLocaleString('en-IN')} / ₹{(viewingPass.tuition_fee || viewingPass.total_amount || 0).toLocaleString('en-IN')}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block">Scheduled Balance Due:</span>
                  <strong className="font-mono text-pending">
                    {(viewingPass.balance_amount || 0) > 0 ? `₹${(viewingPass.balance_amount || 0).toLocaleString('en-IN')} (Due: ${viewingPass.due_date || 'TBD'})` : 'Paid in Full (₹0)'}
                  </strong>
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
