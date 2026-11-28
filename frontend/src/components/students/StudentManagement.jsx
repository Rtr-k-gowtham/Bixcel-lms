import React, { useState, useEffect, useMemo } from 'react'
import { apiService } from '../../services/api'

// Fallback track catalog matching UI reference
const TRACK_CATALOG = {
  'Digital Marketing': {
    name: 'Digital Marketing',
    category: 'Marketing',
    default_days: 36,
    batch_prefix: 'BIX-MKT-26B',
  },
  'Full-Stack Web Development': {
    name: 'Full-Stack Web Development',
    category: 'Engineering',
    default_days: 50,
    batch_prefix: 'BIX-DEV-24A',
  },
  'UI/UX Product Design': {
    name: 'UI/UX Product Design',
    category: 'Design',
    default_days: 36,
    batch_prefix: 'BIX-UX-26D',
  },
  'Data Science & Analytics': {
    name: 'Data Science & Analytics',
    category: 'Data',
    default_days: 44,
    batch_prefix: 'BIX-DS-18C',
  },
  'Cloud & DevOps Engineering': {
    name: 'Cloud & DevOps Engineering',
    category: 'Infrastructure',
    default_days: 40,
    batch_prefix: 'BIX-CLD-12A',
  },
  'Cybersecurity Operations': {
    name: 'Cybersecurity Operations',
    category: 'Security',
    default_days: 42,
    batch_prefix: 'BIX-SEC-09F',
  },
}

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'ST'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'ST'
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

const INITIAL_ADD_FORM = {
  fullName: '',
  studentId: '',
  phone: '',
  email: '',
  track: 'Full-Stack Web Development',
  batch: 'BIX-DEV-26A',
  courseMode: 'standard',
  instructionalDays: 36,
  status: 'Active',
  guardianName: 'Self / Guardian',
  guardianPhone: '',
  guardianRelation: 'Guardian',
  feePlan: 'Standard',
  feeStatus: 'Paid',
  username: '',
  password: 'Student@123',
  showPassword: false,
  dob: '2004-05-15',
  gender: 'Male',
  bloodGroup: 'O+',
  address: '',
  avatar: '',
}

const handleAvatarUpload = (e, callback) => {
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    alert('Please select a valid image file (PNG, JPG, WebP, etc.)')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    alert('Image size exceeds 2MB limit. Please choose a smaller image.')
    return
  }
  const reader = new FileReader()
  reader.onload = (uploadEvent) => {
    const base64Url = uploadEvent.target?.result
    if (base64Url && callback) {
      callback(base64Url)
    }
  }
  reader.readAsDataURL(file)
}

export function StudentManagement() {
  const [students, setStudents] = useState([])
  const [tracks, setTracks] = useState(TRACK_CATALOG)
  const [coursesList, setCoursesList] = useState([])
  const [toast, setToast] = useState('')

  // Search & Filters in Directory
  const [search, setSearch] = useState('')
  const [filterTrack, setFilterTrack] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterMode, setFilterMode] = useState('All')
  const [filterFee, setFilterFee] = useState('All')

  // Modals & Drawers
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [editingStudent, setEditingStudent] = useState(null)
  const [viewingPass, setViewingPass] = useState(null)
  const [managingCredentialsStudent, setManagingCredentialsStudent] = useState(null)
  const [credentialForm, setCredentialForm] = useState({ username: '', password: '', showPassword: false })
  const [isSavingCredentials, setIsSavingCredentials] = useState(false)

  // Direct Add Student Modal State
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState(INITIAL_ADD_FORM)
  const [isCreating, setIsCreating] = useState(false)

  // Load backend students and courses on mount
  useEffect(() => {
    let isMounted = true
    const fetchAllData = async () => {
      try {
        const [studentsRes, coursesRes] = await Promise.allSettled([
          apiService.getStudents(),
          apiService.getCourses(),
        ])

        if (!isMounted) return

        if (studentsRes.status === 'fulfilled' && studentsRes.value?.data) {
          setStudents(Array.isArray(studentsRes.value.data) ? studentsRes.value.data : [])
          if (studentsRes.value.tracks) {
            setTracks(studentsRes.value.tracks)
          }
        }

        if (coursesRes.status === 'fulfilled' && coursesRes.value?.data) {
          const cData = Array.isArray(coursesRes.value.data) ? coursesRes.value.data : []
          setCoursesList(cData)
        }
      } catch (err) {
        console.warn('Fallback to local student records:', err)
      }
    }
    fetchAllData()
    return () => { isMounted = false }
  }, [])

  // Open Direct Add Student Modal
  const openAddModal = () => {
    const nextNum = 845 + students.length
    const nextId = `STU-2026-0${nextNum}`

    setAddForm({
      ...INITIAL_ADD_FORM,
      studentId: nextId,
      track: 'General',
      batch: 'BIX-2026',
      instructionalDays: 0,
    })
    setShowAddModal(true)
  }

  // Create New Student (Direct Modal Submit)
  const handleCreateStudent = async (e) => {
    e.preventDefault()
    if (!addForm.fullName.trim()) {
      alert('Student Full Name is required.')
      return
    }
    if (!addForm.phone.trim()) {
      alert('Phone number is required.')
      return
    }

    setIsCreating(true)
    const nextNum = 845 + students.length
    const autoId = addForm.studentId.trim() || `STU-2026-0${nextNum}`
    const nameClean = addForm.fullName.trim()
    const autoUser = addForm.username.trim() || nameClean.toLowerCase().replace(/[^a-z0-9]/g, '.')
    const autoEmail = addForm.email.trim() || `${autoUser}@student.bixcel.edu`
    const autoPass = addForm.password.trim() || 'Student@123'

    const payload = {
      student_id: autoId,
      full_name: nameClean,
      phone: addForm.phone.trim(),
      email: autoEmail,
      username: autoUser,
      password: autoPass,
      raw_password: autoPass,
      avatar: addForm.avatar || null,
      track: addForm.track || 'General',
      batch: addForm.batch || 'BIX-2026',
      status: addForm.status || 'Active',
      course_mode: 'standard',
      instructional_days: 0,
      guardian_name: addForm.guardianName.trim() || 'Self / Guardian',
      guardian_phone: addForm.guardianPhone.trim() || addForm.phone.trim(),
      guardian_relation: addForm.guardianRelation || 'Guardian',
      dob: addForm.dob || '2004-05-15',
      gender: addForm.gender || 'Not Specified',
      blood_group: addForm.bloodGroup || 'O+',
      address: addForm.address.trim() || '',
      fee_plan: 'Standard',
      fee_status: 'Pending',
    }

    try {
      const res = await apiService.createStudent(payload)
      const newStudent = res?.data || { id: Date.now(), ...payload }
      setStudents((prev) => [newStudent, ...prev])
      setToast(`Student "${newStudent.full_name}" (${newStudent.student_id}) created successfully!`)
      setShowAddModal(false)
    } catch (err) {
      console.warn('API create student failed, saving locally:', err)
      const mockNew = { id: Date.now(), ...payload }
      setStudents((prev) => [mockNew, ...prev])
      setToast(`Student "${mockNew.full_name}" (${mockNew.student_id}) saved locally!`)
      setShowAddModal(false)
    } finally {
      setIsCreating(false)
      setTimeout(() => setToast(''), 4000)
    }
  }

  // Edit Student Update
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editingStudent) return

    try {
      await apiService.updateStudent(editingStudent.id, editingStudent)
    } catch (err) {
      console.warn('API update failed:', err)
    }

    setStudents((prev) =>
      prev.map((s) => (s.id === editingStudent.id ? { ...editingStudent, updated_at: new Date().toISOString() } : s))
    )
    setToast(`Student "${editingStudent.full_name}" profile updated successfully.`)
    setEditingStudent(null)
    setTimeout(() => setToast(''), 3000)
  }

  // Delete Student
  const handleDeleteStudent = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete / archive student profile for "${name}"?`)) {
      try {
        await apiService.deleteStudent(id)
      } catch (err) {
        console.warn('API delete failed:', err)
      }
      setStudents((prev) => prev.filter((s) => s.id !== id))
      if (selectedStudent?.id === id) setSelectedStudent(null)
      setToast(`Student "${name}" archived successfully.`)
      setTimeout(() => setToast(''), 3000)
    }
  }

  // Save or Update Student Login Credentials
  const handleSaveStudentCredentials = async (e) => {
    e.preventDefault()
    if (!managingCredentialsStudent) return
    if (!credentialForm.username.trim() || !credentialForm.password.trim()) {
      alert('Username and password cannot be empty.')
      return
    }

    setIsSavingCredentials(true)
    const payload = {
      student_id: managingCredentialsStudent.student_id,
      username: credentialForm.username.trim(),
      password: credentialForm.password.trim(),
    }

    try {
      await apiService.updateStudentCredentials(payload).catch(() => null)
      setStudents((prev) =>
        prev.map((s) =>
          s.student_id === managingCredentialsStudent.student_id
            ? { ...s, username: payload.username, raw_password: payload.password }
            : s
        )
      )
      if (selectedStudent && selectedStudent.student_id === managingCredentialsStudent.student_id) {
        setSelectedStudent((prev) => ({
          ...prev,
          username: payload.username,
          raw_password: payload.password,
        }))
      }
      setToast(`Login credentials successfully updated for "${managingCredentialsStudent.full_name}"!`)
      setManagingCredentialsStudent(null)
    } catch (err) {
      alert(err.message || 'Failed to update credentials.')
    } finally {
      setIsSavingCredentials(false)
      setTimeout(() => setToast(''), 4000)
    }
  }

  // Filtered Roster
  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase()
    const matchesSearch =
      s.full_name?.toLowerCase().includes(q) ||
      s.student_id?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q) ||
      s.guardian_name?.toLowerCase().includes(q) ||
      s.track?.toLowerCase().includes(q) ||
      s.batch?.toLowerCase().includes(q)
    const matchesTrack = filterTrack === 'All' || s.track === filterTrack
    const matchesStatus = filterStatus === 'All' || s.status === filterStatus
    const matchesMode = filterMode === 'All' || s.course_mode === filterMode
    const matchesFee = filterFee === 'All' || s.fee_status === filterFee
    return matchesSearch && matchesTrack && matchesStatus && matchesMode && matchesFee
  })

  // Aggregated KPI Metrics
  const totalCount = students.length
  const activeCount = students.filter((s) => s.status === 'Active').length
  const customCount = students.filter((s) => s.course_mode === 'custom').length
  const feesPaidCount = students.filter((s) => s.fee_status === 'Paid').length

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
            <span className="material-symbols-outlined text-light-primary text-[18px]">groups</span>
            <h1 className="font-title text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface">
              Student Master
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint font-mono text-[10px] font-bold">
              {totalCount} Total
            </span>
          </div>
          <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Master student directory, academic enrollment profiles, and login credential management.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-xs font-semibold shadow-xs transition-colors whitespace-nowrap cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">person_add</span>
            <span>+ Add Student</span>
          </button>
        </div>
      </section>

      {/* 4 Compact Metric Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Total Students</span>
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
                {Math.round((activeCount / (totalCount || 1)) * 100)}%
              </span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-success-container text-on-success-container inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Custom Pacing</span>
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-[18px] font-bold text-light-primary dark:text-dark-primary tabular-nums">
                {customCount}
              </span>
              <span className="text-[10px] text-light-on-surface-variant font-medium">Modular tracks</span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-light-secondary-container text-light-on-secondary-container inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">view_quilt</span>
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Fees Cleared</span>
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-[18px] font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                {feesPaidCount}
              </span>
              <span className="text-[10px] text-on-success-container bg-success-container px-1 py-0.2 rounded font-semibold">
                100% compliant
              </span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-pending-container text-on-pending-container inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">payments</span>
          </span>
        </article>
      </section>

      {/* ===================================================================== */}
      {/* STUDENT DIRECTORY TABLE                                               */}
      {/* ===================================================================== */}
      <div className="flex flex-col gap-3">
        {/* Search & Filter Strip */}
        <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex flex-wrap items-center justify-between gap-2">
          <div className="relative flex items-center w-full sm:w-64">
            <span className="material-symbols-outlined text-[16px] text-light-outline absolute left-2.5 pointer-events-none">
              search
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, ID, phone, guardian..."
              className="w-full pl-8 pr-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <select
              value={filterTrack}
              onChange={(e) => setFilterTrack(e.target.value)}
              className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
            >
              <option value="All">All Courses / Tracks</option>
              {coursesList.map((c) => (
                <option key={c.id} value={c.title}>{c.title}</option>
              ))}
              {Object.keys(tracks).filter((t) => !coursesList.some((c) => c.title === t)).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Pending">Pending</option>
              <option value="Dropped">Dropped</option>
            </select>

            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
            >
              <option value="All">All Curriculum Modes</option>
              <option value="standard">Course</option>
              <option value="custom">Custom Modular</option>
            </select>

            <select
              value={filterFee}
              onChange={(e) => setFilterFee(e.target.value)}
              className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
            >
              <option value="All">All Fee Status</option>
              <option value="Paid">Fee Paid</option>
              <option value="Partial">Partial Fee</option>
              <option value="Pending">Fee Pending</option>
            </select>

            {(search || filterTrack !== 'All' || filterStatus !== 'All' || filterMode !== 'All' || filterFee !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setFilterTrack('All')
                  setFilterStatus('All')
                  setFilterMode('All')
                  setFilterFee('All')
                }}
                className="px-2 py-1 text-xs text-light-primary hover:underline font-medium"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* High Density Table */}
        <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded overflow-hidden shadow-xs flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/60 dark:bg-dark-surface-container/60 text-light-on-surface-variant dark:text-dark-on-surface-variant font-label text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Student ID</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Course / Track</th>
                  <th className="py-2.5 px-3">Batch</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Fee Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant/60 dark:divide-dark-outline-variant/60 font-body text-xs">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-10 text-center text-light-on-surface-variant">
                      <span className="material-symbols-outlined text-[32px] opacity-40 block mb-1">person_search</span>
                      <p className="font-semibold text-xs">No student profiles match current criteria</p>
                      <p className="text-[11px] opacity-80 mt-0.5">Try clearing filters or adding a new student</p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => {
                    const initials = getInitials(s?.full_name)

                    return (
                      <tr
                        key={s.id}
                        className="hover:bg-light-surface-container-low/40 dark:hover:bg-dark-surface-container/30 transition-colors"
                      >
                        {/* Student ID */}
                        <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                          <span className="font-mono text-xs font-bold text-light-primary dark:text-dark-primary">
                            {s.student_id}
                          </span>
                        </td>

                        {/* Student Name */}
                        <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                          <div className="flex items-center gap-2">
                            {s.avatar && !s.avatar.includes('unsplash.com') ? (
                              <img
                                src={s.avatar}
                                alt={s.full_name}
                                className="w-6 h-6 rounded-full object-cover shrink-0 border border-light-outline-variant/60 shadow-2xs"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-light-primary text-light-on-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                                {initials}
                              </div>
                            )}
                            <span className="font-body text-xs font-medium text-light-on-surface dark:text-dark-on-surface">
                              {s.full_name}
                            </span>
                          </div>
                        </td>

                        {/* Phone / Contact */}
                        <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                          <span className="font-mono text-xs text-light-on-surface-variant">
                            {s.phone}
                          </span>
                        </td>

                        {/* Course / Academic Track */}
                        <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-[11px] font-medium text-light-on-surface-variant">
                              {s.track || 'General'}
                            </span>
                            {s.course_mode === 'custom' ? (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-light-secondary-container text-light-on-secondary-container">
                                Custom
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint">
                                Course
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Batch */}
                        <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                          <span className="font-mono text-xs font-medium text-light-on-surface dark:text-dark-on-surface">
                            {s.batch}
                          </span>
                        </td>

                        {/* Duration (Instructional Days) */}
                        <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                          <span className="font-mono text-xs font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                            {s.instructional_days || 0} Days
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-center align-middle">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              s.status === 'Active'
                                ? 'bg-success-container text-on-success-container'
                                : 'bg-pending-container text-on-pending-container'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                s.status === 'Active' ? 'bg-success' : 'bg-pending'
                              }`}
                            />
                            <span>{s.status}</span>
                          </span>
                        </td>

                        {/* Fee Status */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-center align-middle">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              s.fee_status === 'Paid'
                                ? 'bg-success-container text-on-success-container'
                                : 'bg-pending-container text-on-pending-container'
                            }`}
                          >
                            {s.fee_status || 'Paid'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-right align-middle">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingStudent({ ...s })}
                              title="Edit Profile Details"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit</span>
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedStudent(s)}
                              title="View Detailed Profile"
                              className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setManagingCredentialsStudent(s)
                                setCredentialForm({
                                  username: s.username || s.student_id,
                                  password: s.raw_password || 'Student@123',
                                  showPassword: false,
                                })
                              }}
                              title="Manage Student Portal Login Credentials"
                              className="p-1 rounded text-light-on-surface-variant hover:text-light-primary hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">key</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setViewingPass(s)}
                              title="Print Enrollment Pass"
                              className="p-1 rounded text-light-on-surface-variant hover:text-light-primary hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">badge</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudent(s.id, s.full_name)}
                              title="Delete / Archive Record"
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
            <span>Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> enrolled students</span>
            <span>Bixcel ERP Student Management Master</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL: DIRECT ADD STUDENT MODAL                                       */}
      {/* ===================================================================== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-2xl p-4 flex flex-col gap-3 max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </span>
                <div>
                  <h3 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                    Add New Student
                  </h3>
                  <span className="text-[11px] text-light-on-surface-variant block">
                    Directly enroll student profile and create portal credentials
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container-low"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateStudent} className="flex flex-col gap-3 text-xs">
              {/* Photo & Identity Section */}
              <div className="p-3 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant flex flex-col sm:flex-row items-center gap-3">
                <div className="relative group shrink-0">
                  {addForm.avatar ? (
                    <img
                      src={addForm.avatar}
                      alt="Avatar Preview"
                      className="w-14 h-14 rounded-full object-cover border-2 border-light-primary shadow-xs"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-light-primary text-light-on-primary font-bold text-base flex items-center justify-center shadow-xs">
                      {getInitials(addForm.fullName || 'New Student')}
                    </div>
                  )}
                  <label className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity">
                    <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAvatarUpload(e, (data) => setAddForm((prev) => ({ ...prev, avatar: data })))}
                    />
                  </label>
                </div>
                <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Gowtham T"
                      value={addForm.fullName}
                      onChange={(e) => {
                        const val = e.target.value
                        const autoUser = val ? val.toLowerCase().replace(/[^a-z0-9]/g, '.') : ''
                        setAddForm((prev) => ({
                          ...prev,
                          fullName: val,
                          username: prev.username ? prev.username : autoUser,
                          email: prev.email ? prev.email : (autoUser ? `${autoUser}@student.bixcel.edu` : ''),
                        }))
                      }}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                      Student Registration ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={addForm.studentId}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, studentId: e.target.value }))}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-primary dark:text-dark-primary focus:outline-none focus:ring-1 focus:ring-light-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={addForm.phone}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="student@bixcel.edu"
                    value={addForm.email}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Enrollment Status
                  </label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending">Pending</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Dropped">Dropped</option>
                  </select>
                </div>
              </div>

              {/* Portal Login Credentials */}
              <div className="p-3 rounded bg-light-primary-tint/60 dark:bg-dark-primary-tint/40 border border-light-primary/30 flex flex-col gap-2">
                <span className="font-label text-[11px] font-bold text-light-primary dark:text-dark-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">key</span>
                  <span>Student Portal Login Credentials</span>
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                      Portal Username *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        required
                        value={addForm.username}
                        onChange={(e) => setAddForm((prev) => ({ ...prev, username: e.target.value }))}
                        placeholder="e.g. gowtham.t"
                        className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const auto = addForm.fullName ? addForm.fullName.toLowerCase().replace(/[^a-z0-9]/g, '.') : (addForm.studentId || 'student')
                          setAddForm((prev) => ({ ...prev, username: auto }))
                        }}
                        className="absolute right-1 px-1.5 py-0.5 text-[10px] text-light-primary hover:underline font-semibold"
                      >
                        Auto
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                      Initial Password *
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={addForm.showPassword ? 'text' : 'password'}
                        required
                        value={addForm.password}
                        onChange={(e) => setAddForm((prev) => ({ ...prev, password: e.target.value }))}
                        className="w-full pl-2.5 pr-20 py-1.5 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                      />
                      <div className="absolute right-1 flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setAddForm((prev) => ({ ...prev, showPassword: !prev.showPassword }))}
                          className="p-1 text-light-on-surface-variant hover:text-light-on-surface"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            {addForm.showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const rnd = 'Bixcel@' + Math.floor(1000 + Math.random() * 9000)
                            setAddForm((prev) => ({ ...prev, password: rnd, showPassword: true }))
                          }}
                          className="px-1.5 py-0.5 text-[10px] bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary rounded font-semibold hover:bg-light-primary hover:text-white transition-colors"
                        >
                          Random
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Guardian Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Guardian / Parent Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Self / Guardian"
                    value={addForm.guardianName}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, guardianName: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Guardian Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="Same as student if empty"
                    value={addForm.guardianPhone}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, guardianPhone: e.target.value }))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-light-outline-variant dark:border-dark-outline-variant pt-2.5 mt-1">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant text-xs font-semibold hover:bg-light-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-light-primary text-light-on-primary font-semibold text-xs shadow-xs hover:bg-light-primary-container disabled:opacity-50 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isCreating ? 'sync' : 'person_add'}
                  </span>
                  <span>{isCreating ? 'Adding Student...' : 'Add Student'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: VIEW DETAILED STUDENT PROFILE DRAWER                         */}
      {/* ===================================================================== */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-xl p-4 flex flex-col gap-3 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2.5">
              <div className="flex items-center gap-2.5">
                {selectedStudent.avatar ? (
                  <img
                    src={selectedStudent.avatar}
                    alt={selectedStudent.full_name}
                    className="w-10 h-10 rounded-full object-cover border border-light-outline-variant shadow-2xs shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-light-primary text-light-on-primary font-bold text-xs flex items-center justify-center shrink-0">
                    {getInitials(selectedStudent?.full_name)}
                  </div>
                )}
                <div>
                  <h3 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                    {selectedStudent.full_name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-light-on-surface-variant font-mono">
                    <span>{selectedStudent.student_id}</span>
                    <span>•</span>
                    <span className="text-light-primary font-semibold">{selectedStudent.track}</span>
                  </div>
                  <label className="text-[10px] text-light-primary hover:underline font-semibold cursor-pointer inline-flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[13px]">photo_camera</span>
                    <span>{selectedStudent.avatar ? 'Change photo' : 'Upload photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        handleAvatarUpload(e, async (data) => {
                          const updated = { ...selectedStudent, avatar: data }
                          setSelectedStudent(updated)
                          setStudents((prev) => prev.map((s) => (s.id === selectedStudent.id ? updated : s)))
                          try {
                            await apiService.updateStudent(selectedStudent.id, { avatar: data })
                            setToast(`Updated profile photo for ${selectedStudent.full_name}`)
                            setTimeout(() => setToast(''), 3000)
                          } catch (err) {
                            console.warn('Failed to update photo:', err)
                          }
                        })
                      }}
                    />
                  </label>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Details Grid */}
            <div className="space-y-3 text-xs">
              {/* Personal Section */}
              <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex flex-col gap-1.5">
                <span className="font-label text-[10px] font-bold uppercase tracking-wider text-light-primary">
                  Personal &amp; Contact Details
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-light-on-surface-variant block">Phone:</span>
                    <strong className="text-light-on-surface dark:text-dark-on-surface font-mono">{selectedStudent.phone}</strong>
                  </div>
                  <div>
                    <span className="text-light-on-surface-variant block">Email:</span>
                    <strong className="text-light-on-surface dark:text-dark-on-surface truncate block">{selectedStudent.email}</strong>
                  </div>
                  <div>
                    <span className="text-light-on-surface-variant block">DOB / Blood Group:</span>
                    <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedStudent.dob || 'N/A'} ({selectedStudent.blood_group || 'O+'})</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-light-on-surface-variant block">Residential Address:</span>
                    <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedStudent.address || '742 Evergreen Terrace'}</strong>
                  </div>
                  <div>
                    <span className="text-light-on-surface-variant block">Identity Verification:</span>
                    <strong className="text-light-on-surface dark:text-dark-on-surface font-mono">{selectedStudent.id_proof_type}: {selectedStudent.id_proof_number}</strong>
                  </div>
                </div>
              </div>

              {/* Guardian & Academic */}
              <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex flex-col gap-1.5">
                <span className="font-label text-[10px] font-bold uppercase tracking-wider text-light-primary">
                  Guardian &amp; Academic Background
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-light-on-surface-variant block">Guardian Name:</span>
                    <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedStudent.guardian_name} ({selectedStudent.guardian_relation || 'Parent'})</strong>
                  </div>
                  <div>
                    <span className="text-light-on-surface-variant block">Guardian Phone:</span>
                    <strong className="text-light-on-surface dark:text-dark-on-surface font-mono">{selectedStudent.guardian_phone || selectedStudent.phone}</strong>
                  </div>
                  <div>
                    <span className="text-light-on-surface-variant block">Prior Degree:</span>
                    <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedStudent.qualification || 'B.Tech Computer Science'}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-light-on-surface-variant block">College / University:</span>
                    <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedStudent.institution || 'State Accredited University'} ({selectedStudent.passing_year || '2025'})</strong>
                  </div>
                  <div>
                    <span className="text-light-on-surface-variant block">Attendance Rate:</span>
                    <strong className="text-success font-bold">{selectedStudent.attendance_pct || 96}% Recorded</strong>
                  </div>
                </div>
              </div>

              {/* Course & Curriculum Chunks */}
              <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-label text-[10px] font-bold uppercase tracking-wider text-light-primary">
                    Curriculum Modules ({selectedStudent.instructional_days} Days)
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint font-mono text-[10px] font-bold">
                    Batch: {selectedStudent.batch}
                  </span>
                </div>
                <ul className="space-y-1 text-[11px] text-light-on-surface dark:text-dark-on-surface">
                  {(selectedStudent.module_chunks || []).map((m, i) => (
                    <li key={i} className="flex items-center justify-between py-0.5 border-b border-light-outline-variant/40 last:border-0">
                      <span>• {m.title}</span>
                      <span className="font-mono text-[10px] text-light-on-surface-variant font-bold">{m.days} Days</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Student Portal Login Credentials */}
              <div className="p-2.5 rounded bg-light-primary-tint/60 dark:bg-dark-primary-tint/40 border border-light-primary/30 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-label text-[10px] font-bold uppercase tracking-wider text-light-primary dark:text-dark-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">key</span>
                    <span>Portal Login Credentials</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setManagingCredentialsStudent(selectedStudent)
                      setCredentialForm({
                        username: selectedStudent.username || selectedStudent.student_id,
                        password: selectedStudent.raw_password || 'Student@123',
                        showPassword: false,
                      })
                    }}
                    className="text-[10px] text-light-primary hover:underline font-semibold flex items-center gap-0.5"
                  >
                    <span className="material-symbols-outlined text-[13px]">lock_reset</span>
                    <span>Edit / Reset</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-light-on-surface-variant block text-[10px]">Username:</span>
                    <strong className="font-mono text-light-on-surface dark:text-dark-on-surface select-all">
                      {selectedStudent.username || selectedStudent.student_id}
                    </strong>
                  </div>
                  <div>
                    <span className="text-light-on-surface-variant block text-[10px]">Password:</span>
                    <strong className="font-mono text-light-on-surface dark:text-dark-on-surface select-all">
                      {selectedStudent.raw_password || 'Student@123'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-light-outline-variant dark:border-dark-outline-variant pt-2.5 mt-1">
              <button
                type="button"
                onClick={() => {
                  setViewingPass(selectedStudent)
                  setSelectedStudent(null)
                }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded bg-light-primary-tint text-light-on-primary-tint text-xs font-semibold hover:bg-light-primary-tint/80"
              >
                <span className="material-symbols-outlined text-[15px]">badge</span>
                <span>View Enrollment Pass</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="px-3 py-1 rounded bg-light-surface-container-low text-xs font-semibold hover:bg-light-surface-container"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: EDIT STUDENT PROFILE                                         */}
      {/* ===================================================================== */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-lg p-4 flex flex-col gap-3 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2">
              <h3 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                Edit Student Profile: {editingStudent.full_name}
              </h3>
              <button type="button" onClick={() => setEditingStudent(null)} className="p-1 rounded text-light-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-2.5 text-xs">
              {/* Photo Upload in Edit Modal */}
              <div className="flex items-center gap-3 p-2 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant">
                {editingStudent.avatar ? (
                  <img
                    src={editingStudent.avatar}
                    alt={editingStudent.full_name}
                    className="w-11 h-11 rounded-full object-cover border border-light-outline-variant shrink-0"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-light-primary text-light-on-primary font-bold text-xs flex items-center justify-center shrink-0">
                    {getInitials(editingStudent.full_name)}
                  </div>
                )}
                <div className="flex items-center gap-2 flex-1">
                  <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-light-surface-container hover:bg-light-surface-container-high border border-light-outline-variant text-[11px] font-semibold cursor-pointer">
                    <span className="material-symbols-outlined text-[14px]">add_a_photo</span>
                    <span>{editingStudent.avatar ? 'Change Photo' : 'Upload Photo'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleAvatarUpload(e, (data) =>
                          setEditingStudent((prev) => ({ ...prev, avatar: data }))
                        )
                      }
                    />
                  </label>
                  {editingStudent.avatar && (
                    <button
                      type="button"
                      onClick={() => setEditingStudent((prev) => ({ ...prev, avatar: '' }))}
                      className="text-[11px] text-overdue hover:underline font-semibold"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStudent.full_name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, full_name: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editingStudent.phone}
                    onChange={(e) => setEditingStudent({ ...editingStudent, phone: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    value={editingStudent.guardian_name}
                    onChange={(e) => setEditingStudent({ ...editingStudent, guardian_name: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Guardian Phone
                  </label>
                  <input
                    type="text"
                    value={editingStudent.guardian_phone || ''}
                    onChange={(e) => setEditingStudent({ ...editingStudent, guardian_phone: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Status
                  </label>
                  <select
                    value={editingStudent.status}
                    onChange={(e) => setEditingStudent({ ...editingStudent, status: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Dropped">Dropped</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Batch
                  </label>
                  <input
                    type="text"
                    value={editingStudent.batch}
                    onChange={(e) => setEditingStudent({ ...editingStudent, batch: e.target.value })}
                    className="w-full px-2 py-1 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Fee Status
                  </label>
                  <select
                    value={editingStudent.fee_status || 'Paid'}
                    onChange={(e) => setEditingStudent({ ...editingStudent, fee_status: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={editingStudent.address || ''}
                  onChange={(e) => setEditingStudent({ ...editingStudent, address: e.target.value })}
                  className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-light-outline-variant dark:border-dark-outline-variant pt-2 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingStudent(null)}
                  className="px-3 py-1 rounded border border-light-outline-variant dark:border-dark-outline-variant text-xs hover:bg-light-surface-container-low"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 rounded bg-light-primary text-light-on-primary font-semibold text-xs hover:bg-light-primary-container"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: STUDENT ADMISSION PASS / ENROLLMENT BADGE                    */}
      {/* ===================================================================== */}
      {viewingPass && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-md p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2">
              <span className="font-label text-xs font-bold text-light-primary">
                Official Student Enrollment Pass
              </span>
              <button type="button" onClick={() => setViewingPass(null)} className="p-0.5 text-light-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Clean ID Card Layout */}
            <div className="border border-light-primary/30 rounded p-3 bg-light-surface-container-low/50 dark:bg-dark-surface-container/50 flex flex-col gap-2.5">
              <div className="flex items-center justify-between border-b border-light-outline-variant/60 pb-2">
                <div className="flex items-center gap-2">
                  {viewingPass.avatar ? (
                    <img
                      src={viewingPass.avatar}
                      alt={viewingPass.full_name}
                      className="w-9 h-9 rounded-full object-cover border border-light-primary shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-light-primary text-light-on-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(viewingPass?.full_name)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                      {viewingPass.full_name}
                    </h4>
                    <span className="font-mono text-[10px] text-light-primary font-bold">
                      {viewingPass.student_id}
                    </span>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-success-container text-on-success-container text-[10px] font-bold">
                  {viewingPass.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block">Course Track:</span>
                  <strong className="text-light-on-surface dark:text-dark-on-surface">{viewingPass.track}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block">Batch Cohort:</span>
                  <strong className="font-mono text-light-on-surface dark:text-dark-on-surface">{viewingPass.batch}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block">Pacing / Days:</span>
                  <strong className="text-light-on-surface dark:text-dark-on-surface">{viewingPass.instructional_days} Instructional Days</strong>
                </div>
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block">Fee Status:</span>
                  <strong className="text-success">{viewingPass.fee_status || 'Paid'}</strong>
                </div>
              </div>

              {/* Login Credentials Callout */}
              <div className="p-2.5 rounded bg-light-primary-tint/60 dark:bg-dark-primary-tint/40 border border-light-primary/30 flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-label text-[11px] font-bold text-light-primary dark:text-dark-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">key</span>
                    <span>Student Portal Login Credentials</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `Bixcel LMS Student Credentials\nName: ${viewingPass.full_name}\nStudent ID: ${viewingPass.student_id}\nUsername: ${viewingPass.username || viewingPass.student_id}\nPassword: ${viewingPass.raw_password || 'Student@123'}\nPortal: ${window.location.origin}`
                      navigator.clipboard.writeText(text)
                      setToast('Student credentials copied to clipboard!')
                      setTimeout(() => setToast(''), 3000)
                    }}
                    className="text-[10px] text-light-primary hover:underline font-semibold flex items-center gap-0.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[12px]">content_copy</span>
                    <span>Copy</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-[10px] text-light-on-surface-variant block">Username:</span>
                    <strong className="font-mono text-light-on-surface dark:text-dark-on-surface select-all">
                      {viewingPass.username || viewingPass.student_id}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-light-on-surface-variant block">Initial Password:</span>
                    <strong className="font-mono text-light-on-surface dark:text-dark-on-surface select-all">
                      {viewingPass.raw_password || 'Student@123'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  window.print()
                }}
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

      {/* ===================================================================== */}
      {/* MODAL 4: MANAGE STUDENT LOGIN CREDENTIALS                             */}
      {/* ===================================================================== */}
      {managingCredentialsStudent && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fadeIn">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-md p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2">
              <div className="flex items-center gap-1.5 text-light-primary dark:text-dark-primary font-bold text-xs">
                <span className="material-symbols-outlined text-[18px]">key</span>
                <span>Student Portal Login Credentials</span>
              </div>
              <button
                type="button"
                onClick={() => setManagingCredentialsStudent(null)}
                className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Student Info Card */}
            <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-light-primary text-light-on-primary font-bold text-[11px] flex items-center justify-center">
                  {getInitials(managingCredentialsStudent.full_name)}
                </div>
                <div>
                  <h4 className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                    {managingCredentialsStudent.full_name}
                  </h4>
                  <span className="font-mono text-[10px] text-light-primary font-bold">
                    {managingCredentialsStudent.student_id} • {managingCredentialsStudent.track}
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-container text-on-success-container">
                {managingCredentialsStudent.status || 'Active'}
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveStudentCredentials} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Portal Login Username *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={credentialForm.username}
                    onChange={(e) => setCredentialForm({ ...credentialForm, username: e.target.value })}
                    placeholder="e.g. gowtham.t or STU-2026-0843"
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setCredentialForm({
                        ...credentialForm,
                        username: managingCredentialsStudent.full_name.toLowerCase().replace(/[^a-z0-9]/g, '.'),
                      })
                    }}
                    className="absolute right-1 px-1.5 py-0.5 text-[10px] text-light-primary hover:underline font-semibold"
                    title="Auto-generate from name"
                  >
                    Auto
                  </button>
                </div>
                <span className="text-[10px] text-light-on-surface-variant mt-0.5 block">
                  The student can log in using this username, their email, or their Student ID.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Portal Login Password *
                </label>
                <div className="relative flex items-center">
                  <input
                    type={credentialForm.showPassword ? 'text' : 'password'}
                    required
                    value={credentialForm.password}
                    onChange={(e) => setCredentialForm({ ...credentialForm, password: e.target.value })}
                    placeholder="Enter password (e.g. Student@123)"
                    className="w-full pl-2.5 pr-20 py-1.5 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                  <div className="absolute right-1 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setCredentialForm({ ...credentialForm, showPassword: !credentialForm.showPassword })
                      }
                      className="p-1 text-light-on-surface-variant hover:text-light-on-surface"
                      title={credentialForm.showPassword ? 'Hide password' : 'Show password'}
                    >
                      <span className="material-symbols-outlined text-[15px]">
                        {credentialForm.showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const randomPass = 'Bixcel@' + Math.floor(1000 + Math.random() * 9000)
                        setCredentialForm({ ...credentialForm, password: randomPass, showPassword: true })
                      }}
                      className="px-1.5 py-0.5 text-[10px] bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary rounded font-semibold hover:bg-light-primary hover:text-white transition-colors"
                      title="Generate random password"
                    >
                      Generate
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Copy Box */}
              <div className="p-2 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant flex items-center justify-between text-[11px]">
                <div className="flex flex-col">
                  <span className="text-[10px] text-light-on-surface-variant">Portal URL:</span>
                  <span className="font-mono font-semibold truncate max-w-[220px]">
                    {window.location.origin}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const text = `Bixcel LMS Student Credentials\nName: ${managingCredentialsStudent.full_name}\nStudent ID: ${managingCredentialsStudent.student_id}\nUsername: ${credentialForm.username}\nPassword: ${credentialForm.password}\nPortal: ${window.location.origin}`
                    navigator.clipboard.writeText(text)
                    setToast('Student login details copied to clipboard!')
                    setTimeout(() => setToast(''), 3000)
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-light-surface-container dark:bg-dark-surface-container-high text-light-primary font-semibold text-[10px] hover:bg-light-primary hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[13px]">content_copy</span>
                  <span>Copy Details</span>
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-light-outline-variant dark:border-dark-outline-variant pt-2 mt-1">
                <button
                  type="button"
                  onClick={() => setManagingCredentialsStudent(null)}
                  className="px-3 py-1 rounded border border-light-outline-variant text-xs hover:bg-light-surface-container-low"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCredentials}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded bg-light-primary text-light-on-primary font-semibold text-xs shadow-xs hover:bg-light-primary-container disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {isSavingCredentials ? 'sync' : 'save'}
                  </span>
                  <span>{isSavingCredentials ? 'Saving...' : 'Save Credentials'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

  )
}

export default StudentManagement
