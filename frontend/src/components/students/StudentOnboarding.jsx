import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

// Fallback track catalog matching UI reference
const TRACK_CATALOG = {
  'Digital Marketing': {
    name: 'Digital Marketing',
    category: 'Marketing',
    default_days: 36,
    modules: [
      { id: 'MOD-DM-01', title: 'SEO & Keyword Strategy', days: 8, default: true },
      { id: 'MOD-DM-02', title: 'Meta & Google Ads', days: 12, default: true },
      { id: 'MOD-DM-03', title: 'Content & Social Media Strategy', days: 10, default: true },
      { id: 'MOD-DM-04', title: 'Email Marketing & Growth Analytics', days: 6, default: false },
      { id: 'MOD-DM-05', title: 'Affiliate & Influencer Partnerships', days: 5, default: false },
    ],
  },
  'Full-Stack Web Development': {
    name: 'Full-Stack Web Development',
    category: 'Engineering',
    default_days: 50,
    modules: [
      { id: 'MOD-FS-01', title: 'Frontend Foundations & Semantic HTML/CSS', days: 10, default: true },
      { id: 'MOD-FS-02', title: 'Modern JavaScript ES6+ & TypeScript', days: 14, default: true },
      { id: 'MOD-FS-03', title: 'React & Next.js Architecture', days: 14, default: true },
      { id: 'MOD-FS-04', title: 'Node.js, Express & Microservices', days: 12, default: false },
      { id: 'MOD-FS-05', title: 'PostgreSQL, ORM & Database Optimization', days: 8, default: false },
      { id: 'MOD-FS-06', title: 'Docker, CI/CD & Cloud Deployment', days: 6, default: false },
    ],
  },
  'UI/UX Product Design': {
    name: 'UI/UX Product Design',
    category: 'Design',
    default_days: 36,
    modules: [
      { id: 'MOD-UX-01', title: 'User Research, Personas & Journey Mapping', days: 6, default: true },
      { id: 'MOD-UX-02', title: 'Wireframing & Prototyping in Figma', days: 10, default: true },
      { id: 'MOD-UX-03', title: 'Design Systems & Component Tokens', days: 8, default: true },
      { id: 'MOD-UX-04', title: 'Usability Testing & Micro-interactions', days: 6, default: true },
      { id: 'MOD-UX-05', title: 'Design Handoff & Developer Collaboration', days: 6, default: false },
    ],
  },
  'Data Science & Analytics': {
    name: 'Data Science & Analytics',
    category: 'Data',
    default_days: 44,
    modules: [
      { id: 'MOD-DS-01', title: 'Python for Data Analysis (NumPy, Pandas)', days: 10, default: true },
      { id: 'MOD-DS-02', title: 'Statistical Modeling & Hypothesis Testing', days: 8, default: true },
      { id: 'MOD-DS-03', title: 'Machine Learning & Predictive Modeling', days: 14, default: true },
      { id: 'MOD-DS-04', title: 'PowerBI & Executive Data Storytelling', days: 6, default: false },
      { id: 'MOD-DS-05', title: 'SQL for Big Data & Warehouse Modeling', days: 6, default: false },
    ],
  },
  'Cloud & DevOps Engineering': {
    name: 'Cloud & DevOps Engineering',
    category: 'Infrastructure',
    default_days: 40,
    modules: [
      { id: 'MOD-CL-01', title: 'Linux System Administration & Networking', days: 8, default: true },
      { id: 'MOD-CL-02', title: 'AWS & Multi-Cloud Infrastructure (IAM, VPC, S3)', days: 12, default: true },
      { id: 'MOD-CL-03', title: 'Infrastructure as Code with Terraform', days: 8, default: true },
      { id: 'MOD-CL-04', title: 'Kubernetes Orchestration & Helm', days: 10, default: false },
      { id: 'MOD-CL-05', title: 'Observability, Prometheus & Grafana', days: 6, default: false },
    ],
  },
  'Cybersecurity Operations': {
    name: 'Cybersecurity Operations',
    category: 'Security',
    default_days: 42,
    modules: [
      { id: 'MOD-SEC-01', title: 'Network Defense & Protocol Hardening', days: 10, default: true },
      { id: 'MOD-SEC-02', title: 'Ethical Hacking & Vulnerability Assessment', days: 12, default: true },
      { id: 'MOD-SEC-03', title: 'SOC Operations & SIEM Incident Response', days: 10, default: true },
      { id: 'MOD-SEC-04', title: 'Application Security & OWASP Top 10', days: 10, default: false },
    ],
  },
}

const DEFAULT_STUDENTS = [
  {
    id: 1,
    student_id: 'STU-2026-0842',
    full_name: 'Marcus Vance',
    guardian_name: 'Eleanor Vance',
    phone: '+1 (555) 349-2194',
    email: 'marcus.vance@student.bixcel.edu',
    status: 'Active',
    course_mode: 'custom',
    track: 'Digital Marketing',
    batch: 'BIX-MKT-26B',
    instructional_days: 30,
    module_chunks: [
      { title: 'SEO & Keyword Strategy', days: 8 },
      { title: 'Meta & Google Ads', days: 12 },
      { title: 'Content & Social Media Strategy', days: 10 },
    ],
    created_at: '2026-11-24 14:20',
  },
  {
    id: 2,
    student_id: 'STU-2026-0841',
    full_name: 'Alena Rostova',
    guardian_name: 'Mikhail Rostov',
    phone: '+1 (555) 781-4402',
    email: 'alena.rostova@student.bixcel.edu',
    status: 'Active',
    course_mode: 'standard',
    track: 'UI/UX Product Design',
    batch: 'BIX-UX-26D',
    instructional_days: 60,
    module_chunks: [
      { title: 'Full Curriculum UI/UX Standard Program', days: 60 },
    ],
    created_at: '2026-11-23 10:12',
  },
  {
    id: 3,
    student_id: 'STU-2026-0840',
    full_name: 'Kevin Chen',
    guardian_name: 'David Chen',
    phone: '+1 (555) 912-3341',
    email: 'kevin.chen@student.bixcel.edu',
    status: 'Active',
    course_mode: 'custom',
    track: 'Full-Stack Web Development',
    batch: 'BIX-DEV-24A',
    instructional_days: 38,
    module_chunks: [
      { title: 'Frontend Foundations & Semantic HTML/CSS', days: 10 },
      { title: 'Modern JavaScript ES6+ & TypeScript', days: 14 },
      { title: 'React & Next.js Architecture', days: 14 },
    ],
    created_at: '2026-11-21 08:30',
  },
  {
    id: 4,
    student_id: 'STU-2026-0839',
    full_name: 'Sophia Martinez',
    guardian_name: 'Carlos Martinez',
    phone: '+1 (555) 203-8877',
    email: 'sophia.m@student.bixcel.edu',
    status: 'On Leave',
    course_mode: 'standard',
    track: 'Data Science & Analytics',
    batch: 'BIX-DS-18C',
    instructional_days: 45,
    module_chunks: [
      { title: 'Full Curriculum Data Science Standard Program', days: 45 },
    ],
    created_at: '2026-11-18 11:00',
  },
  {
    id: 5,
    student_id: 'STU-2026-0838',
    full_name: 'Tariq Al-Mansoor',
    guardian_name: 'Rashid Al-Mansoor',
    phone: '+1 (555) 604-5120',
    email: 'tariq.mansoor@student.bixcel.edu',
    status: 'Active',
    course_mode: 'custom',
    track: 'Cloud & DevOps Engineering',
    batch: 'BIX-CLD-12A',
    instructional_days: 28,
    module_chunks: [
      { title: 'Linux System Administration & Networking', days: 8 },
      { title: 'AWS & Multi-Cloud Infrastructure (IAM, VPC, S3)', days: 12 },
      { title: 'Infrastructure as Code with Terraform', days: 8 },
    ],
    created_at: '2026-11-16 15:45',
  },
  {
    id: 6,
    student_id: 'STU-2026-0837',
    full_name: 'Priya Sharma',
    guardian_name: 'Rajesh Sharma',
    phone: '+1 (555) 472-9901',
    email: 'priya.sharma@student.bixcel.edu',
    status: 'Active',
    course_mode: 'custom',
    track: 'Cybersecurity Operations',
    batch: 'BIX-SEC-09F',
    instructional_days: 32,
    module_chunks: [
      { title: 'Network Defense & Protocol Hardening', days: 10 },
      { title: 'Ethical Hacking & Vulnerability Assessment', days: 12 },
      { title: 'SOC Operations & SIEM Incident Response', days: 10 },
    ],
    created_at: '2026-11-15 09:10',
  },
]

export function StudentOnboarding() {
  const [activeTab, setActiveTab] = useState('wizard') // 'wizard' | 'roster'
  const [tracks, setTracks] = useState(TRACK_CATALOG)
  const [students, setStudents] = useState(DEFAULT_STUDENTS)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successToast, setSuccessToast] = useState('')
  const [createdStudentPass, setCreatedStudentPass] = useState(null)
  const [viewingPass, setViewingPass] = useState(null)

  // Form State
  const [courseMode, setCourseMode] = useState('custom') // 'custom' | 'standard'
  const [selectedTrack, setSelectedTrack] = useState('Digital Marketing')
  const [trackSearch, setTrackSearch] = useState('Digital Marketing')
  const [trackDropdownOpen, setTrackDropdownOpen] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    guardianName: '',
    phone: '',
    email: '',
    status: 'Active',
    batch: 'BIX-MKT-26B',
  })

  // Selected module chunks for current track
  const [selectedModuleIds, setSelectedModuleIds] = useState(() => {
    return TRACK_CATALOG['Digital Marketing'].modules
      .filter((m) => m.default)
      .map((m) => m.id)
  })

  // Filter & Search in Roster
  const [rosterSearch, setRosterSearch] = useState('')
  const [rosterStatus, setRosterStatus] = useState('All')
  const [rosterMode, setRosterMode] = useState('All')

  // Load students & tracks from CI4 backend on mount
  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await apiService.getStudents()
      if (res && res.data && Array.isArray(res.data)) {
        setStudents(res.data)
      }
      if (res && res.tracks) {
        setTracks(res.tracks)
      }
    } catch {
      // Fallback to initial mock data
    } finally {
      setLoading(false)
    }
  }

  // Handle Track Selection
  const handleSelectTrack = (trackName) => {
    setSelectedTrack(trackName)
    setTrackSearch(trackName)
    setTrackDropdownOpen(false)

    // Reset module selections to track defaults
    const trackData = tracks[trackName] || TRACK_CATALOG[trackName]
    if (trackData && trackData.modules) {
      setSelectedModuleIds(
        trackData.modules.filter((m) => m.default).map((m) => m.id)
      )
    }

    // Set matching batch recommendation
    const batchMap = {
      'Digital Marketing': 'BIX-MKT-26B',
      'Full-Stack Web Development': 'BIX-DEV-24A',
      'UI/UX Product Design': 'BIX-UX-26D',
      'Data Science & Analytics': 'BIX-DS-18C',
      'Cloud & DevOps Engineering': 'BIX-CLD-12A',
      'Cybersecurity Operations': 'BIX-SEC-09F',
    }
    if (batchMap[trackName]) {
      setFormData((prev) => ({ ...prev, batch: batchMap[trackName] }))
    }
  }

  // Toggle module chunk checkbox
  const handleToggleModule = (modId) => {
    setSelectedModuleIds((prev) =>
      prev.includes(modId) ? prev.filter((id) => id !== modId) : [...prev, modId]
    )
  }

  // Calculate selected path and days
  const currentTrackData = tracks[selectedTrack] || TRACK_CATALOG[selectedTrack] || { modules: [] }
  const selectedModules = currentTrackData.modules.filter((m) =>
    selectedModuleIds.includes(m.id)
  )
  const cumulativeDays =
    courseMode === 'custom'
      ? selectedModules.reduce((acc, curr) => acc + curr.days, 0)
      : 60

  // Form submission
  const handleSubmitOnboarding = async (e) => {
    e.preventDefault()
    if (!formData.fullName.trim() || !formData.guardianName.trim() || !formData.phone.trim()) {
      alert('Please fill in Student Full Name, Guardian Name, and Phone Number.')
      return
    }

    if (courseMode === 'custom' && selectedModules.length === 0) {
      alert('Please select at least one module chunk to build the custom curriculum path.')
      return
    }

    setSubmitting(true)
    const payload = {
      full_name: formData.fullName.trim(),
      guardian_name: formData.guardianName.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim() || `${formData.fullName.toLowerCase().replace(/\s+/g, '.')}@student.bixcel.edu`,
      status: formData.status,
      course_mode: courseMode,
      track: selectedTrack,
      batch: formData.batch,
      instructional_days: cumulativeDays,
      module_chunks:
        courseMode === 'custom'
          ? selectedModules.map((m) => ({ title: m.title, days: m.days }))
          : [{ title: `Full Curriculum ${selectedTrack} Standard Program`, days: 60 }],
    }

    try {
      const res = await apiService.createStudent(payload)
      if (res && res.data) {
        setStudents((prev) => [res.data, ...prev])
        setCreatedStudentPass(res.data)
        setSuccessToast(`Student ${res.data.full_name} onboarded with ID ${res.data.student_id}!`)
      } else {
        // Local simulation fallback
        const mockNew = {
          id: Date.now(),
          student_id: `STU-2026-0${843 + students.length}`,
          ...payload,
          created_at: new Date().toISOString().replace('T', ' ').substring(0, 16),
        }
        setStudents((prev) => [mockNew, ...prev])
        setCreatedStudentPass(mockNew)
        setSuccessToast(`Student ${mockNew.full_name} onboarded with ID ${mockNew.student_id}!`)
      }

      // Reset form fields
      setFormData({
        fullName: '',
        guardianName: '',
        phone: '',
        email: '',
        status: 'Active',
        batch: 'BIX-MKT-26B',
      })
    } catch (err) {
      alert(err.response?.data?.messages?.full_name || err.message || 'Failed to complete onboarding')
    } finally {
      setSubmitting(false)
    }
  }

  // Filter roster list
  const filteredRoster = students.filter((s) => {
    const q = rosterSearch.toLowerCase()
    const matchesQuery =
      s.full_name?.toLowerCase().includes(q) ||
      s.student_id?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.track?.toLowerCase().includes(q)
    const matchesStatus = rosterStatus === 'All' || s.status === rosterStatus
    const matchesMode = rosterMode === 'All' || s.course_mode === rosterMode
    return matchesQuery && matchesStatus && matchesMode
  })

  // Filter track options for combobox
  const filteredTrackNames = Object.keys(tracks).filter((t) =>
    t.toLowerCase().includes(trackSearch.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header with Tab Navigation */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-light-primary text-[22px]">how_to_reg</span>
            <h1 className="font-headline text-headline-lg font-semibold text-light-on-surface dark:text-dark-on-surface">
              Student Onboarding &amp; Enrollment
            </h1>
          </div>
          <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Onboard new students and configure custom module chunks for specialized curricula.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-md bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('wizard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded font-label text-label-md font-medium transition-colors ${
              activeTab === 'wizard'
                ? 'bg-light-primary text-light-on-primary shadow-sm'
                : 'text-light-on-surface-variant hover:text-light-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">person_add</span>
            <span>Onboarding Wizard</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded font-label text-label-md font-medium transition-colors ${
              activeTab === 'roster'
                ? 'bg-light-primary text-light-on-primary shadow-sm'
                : 'text-light-on-surface-variant hover:text-light-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">badge</span>
            <span>Student Roster ({students.length})</span>
          </button>
        </div>
      </section>

      {/* KPI Stats Banner */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm">
          <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Total Enrolled
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-headline text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
              1,426
            </span>
            <span className="font-label text-label-sm text-success font-medium inline-flex items-center">
              +12 this wk
            </span>
          </div>
        </div>

        <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm">
          <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Active Status
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-headline text-headline-md font-bold text-success tabular-nums">
              1,380
            </span>
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              96.8% active
            </span>
          </div>
        </div>

        <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm">
          <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Custom Track Share
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-headline text-headline-md font-bold text-light-primary dark:text-dark-primary tabular-nums">
              67%
            </span>
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              modular chunks
            </span>
          </div>
        </div>

        <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm">
          <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Avg Duration
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-headline text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
              34 Days
            </span>
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              custom pacing
            </span>
          </div>
        </div>
      </section>

      {/* Success Toast */}
      {successToast && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-md bg-success-container text-on-success-container border border-success/30 shadow-sm animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[20px] text-success">check_circle</span>
            <span className="font-body text-body-md font-medium">{successToast}</span>
          </div>
          <div className="flex items-center gap-2">
            {createdStudentPass && (
              <button
                type="button"
                onClick={() => setViewingPass(createdStudentPass)}
                className="px-2.5 py-1 text-label-sm font-semibold rounded bg-white text-success shadow-xs hover:bg-slate-50 transition-colors"
              >
                View Enrollment Pass
              </button>
            )}
            <button
              type="button"
              onClick={() => setSuccessToast('')}
              className="text-on-success-container/70 hover:text-on-success-container"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: ONBOARDING WIZARD */}
      {activeTab === 'wizard' && (
        <div className="flex flex-col gap-6">
          {/* Auto-generated ID Info Banner (matching reference) */}
          <div
            role="status"
            className="flex items-center gap-3 px-4 py-3 rounded-md bg-light-primary-tint dark:bg-dark-primary-tint/30 border border-light-primary/20 dark:border-dark-primary/30 text-light-on-primary-tint dark:text-dark-on-primary-tint"
          >
            <span className="material-symbols-outlined text-light-primary dark:text-dark-primary text-[20px] shrink-0">
              info
            </span>
            <span className="font-body text-body-md">
              Student Registration ID is auto-generated upon onboarding submission (Next:{' '}
              <strong className="font-mono text-mono-sm">STU-2026-0{843 + students.length}</strong>).
            </span>
          </div>

          <form onSubmit={handleSubmitOnboarding} className="flex flex-col gap-6">
            {/* Top Row: Student Details + System Metadata */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Student Details Card */}
              <article className="lg:col-span-9 bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-5 sm:p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-3">
                  <h2 className="font-title text-title-lg font-semibold text-light-on-surface dark:text-dark-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-light-primary text-[20px]">person</span>
                    <span>Student Details</span>
                  </h2>
                  <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    * Required fields
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="font-label text-label-md font-medium text-light-on-surface dark:text-dark-on-surface">
                      Full Name *
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Marcus Vance"
                      className="px-3 py-2 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-md placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary focus:outline-none"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="font-label text-label-md font-medium text-light-on-surface dark:text-dark-on-surface">
                      Guardian / Sponsor Name *
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      placeholder="e.g. Eleanor Vance"
                      className="px-3 py-2 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-md placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary focus:outline-none"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="font-label text-label-md font-medium text-light-on-surface dark:text-dark-on-surface">
                      Phone Number *
                    </span>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="px-3 py-2 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-md tabular-nums placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary focus:outline-none"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="font-label text-label-md font-medium text-light-on-surface dark:text-dark-on-surface">
                      Student Email Address
                    </span>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="auto-generated if empty"
                      className="px-3 py-2 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-md placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary focus:outline-none"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="font-label text-label-md font-medium text-light-on-surface dark:text-dark-on-surface">
                      Enrollment Status
                    </span>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="px-3 py-2 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-md focus:border-light-primary focus:ring-1 focus:ring-light-primary focus:outline-none"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Dropped">Dropped</option>
                      <option value="Pending">Pending Verification</option>
                    </select>
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="font-label text-label-md font-medium text-light-on-surface dark:text-dark-on-surface">
                      Target Batch Cohort
                    </span>
                    <select
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                      className="px-3 py-2 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-md focus:border-light-primary focus:ring-1 focus:ring-light-primary focus:outline-none"
                    >
                      <option value="BIX-MKT-26B">BIX-MKT-26B (Digital Marketing)</option>
                      <option value="BIX-UX-26D">BIX-UX-26D (UI/UX Product Design)</option>
                      <option value="BIX-DEV-24A">BIX-DEV-24A (Full-Stack Dev)</option>
                      <option value="BIX-DS-18C">BIX-DS-18C (Data Science)</option>
                      <option value="BIX-CLD-12A">BIX-CLD-12A (Cloud &amp; DevOps)</option>
                      <option value="BIX-SEC-09F">BIX-SEC-09F (Cybersecurity)</option>
                    </select>
                  </label>
                </div>
              </article>

              {/* System Metadata Card (matching reference aside) */}
              <aside className="lg:col-span-3 bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b border-light-outline-variant dark:border-dark-outline-variant pb-2.5">
                  <span className="material-symbols-outlined text-light-primary text-[20px]">fingerprint</span>
                  <h2 className="font-title text-title-md font-semibold text-light-on-surface dark:text-dark-on-surface">
                    System Metadata
                  </h2>
                </div>
                <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  The following fields will be generated automatically by the system:
                </p>
                <ul className="flex flex-col gap-2 pl-4 list-disc text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  <li>
                    <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface">
                      student_id: STU-2026-XXXX
                    </span>
                  </li>
                  <li>
                    <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface">
                      last_login_at
                    </span>
                  </li>
                  <li>
                    <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface">
                      created_at
                    </span>
                  </li>
                  <li>
                    <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface">
                      updated_at
                    </span>
                  </li>
                  <li>
                    <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface">
                      enrollment_hash
                    </span>
                  </li>
                </ul>
              </aside>
            </div>

            {/* Course Mode Selector Card */}
            <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-4 sm:p-5">
              <span className="font-label text-label-sm font-semibold uppercase tracking-wider text-light-on-surface-variant dark:text-dark-on-surface-variant block mb-3">
                Select Curriculum Mode
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setCourseMode('standard')}
                  className={`flex items-center gap-3 px-4 py-3 rounded border text-left transition-colors ${
                    courseMode === 'standard'
                      ? 'border-[#0F172A] dark:border-light-primary bg-[#0F172A] text-white shadow-sm'
                      : 'border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant hover:bg-light-surface-container'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      courseMode === 'standard' ? 'text-white' : 'text-light-outline'
                    }`}
                  >
                    {courseMode === 'standard' ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <div>
                    <span className="font-label text-label-lg font-semibold block">
                      Standard Published Course
                    </span>
                    <span className="font-body text-body-sm opacity-80 block">
                      Fixed 60-day institutional master syllabus
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setCourseMode('custom')}
                  className={`flex items-center gap-3 px-4 py-3 rounded border text-left transition-colors ${
                    courseMode === 'custom'
                      ? 'border-[#0F172A] dark:border-light-primary bg-[#0F172A] text-white shadow-sm'
                      : 'border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant hover:bg-light-surface-container'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      courseMode === 'custom' ? 'text-white' : 'text-light-outline'
                    }`}
                  >
                    {courseMode === 'custom' ? 'check_circle' : 'radio_button_unchecked'}
                  </span>
                  <div>
                    <span className="font-label text-label-lg font-semibold block">
                      Custom Course (Module Chunks)
                    </span>
                    <span className="font-body text-body-sm opacity-80 block">
                      Pick modular chunks to assemble custom course pacing
                    </span>
                  </div>
                </button>
              </div>
            </article>

            {/* Custom Course Builder Card */}
            {courseMode === 'custom' ? (
              <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-5 sm:p-6 flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-light-outline-variant dark:border-dark-outline-variant pb-3">
                  <h2 className="font-title text-title-lg font-semibold text-light-on-surface dark:text-dark-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-light-primary text-[20px]">view_quilt</span>
                    <span>Custom Course Builder — {selectedTrack}</span>
                  </h2>
                  <span className="font-label text-label-sm font-medium px-2.5 py-1 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint">
                    {selectedModules.length} Chunks Selected • {cumulativeDays} Days
                  </span>
                </div>

                {/* Track Selector Combobox */}
                <div className="flex flex-col gap-1.5 relative">
                  <label className="font-label text-label-md font-medium text-light-on-surface dark:text-dark-on-surface">
                    Select Course Blueprint / Track
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={trackSearch}
                      onChange={(e) => {
                        setTrackSearch(e.target.value)
                        setTrackDropdownOpen(true)
                      }}
                      onFocus={() => setTrackDropdownOpen(true)}
                      placeholder="Search or select course blueprint / track..."
                      className="w-full pl-3 pr-10 py-2 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-md placeholder:text-light-outline focus:border-light-primary focus:ring-1 focus:ring-light-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setTrackDropdownOpen(!trackDropdownOpen)}
                      className="absolute right-1.5 p-1 rounded text-light-on-surface-variant hover:bg-light-surface-container-low transition-colors"
                    >
                      <span
                        className={`material-symbols-outlined text-[20px] transition-transform ${
                          trackDropdownOpen ? 'rotate-180' : ''
                        }`}
                      >
                        keyboard_arrow_down
                      </span>
                    </button>
                  </div>

                  {trackDropdownOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-lg z-30 overflow-hidden">
                      <ul className="max-h-56 overflow-y-auto py-1">
                        {filteredTrackNames.map((tName) => {
                          const isSelected = tName === selectedTrack
                          return (
                            <li key={tName}>
                              <button
                                type="button"
                                onClick={() => handleSelectTrack(tName)}
                                className={`w-full px-3.5 py-2 text-left flex items-center justify-between text-body-md transition-colors ${
                                  isSelected
                                    ? 'bg-light-primary-tint/70 dark:bg-dark-primary-tint/60 text-light-primary dark:text-dark-primary font-semibold'
                                    : 'text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container'
                                }`}
                              >
                                <span>{tName}</span>
                                {isSelected && (
                                  <span className="material-symbols-outlined text-light-primary dark:text-dark-primary text-[18px]">
                                    check
                                  </span>
                                )}
                              </button>
                            </li>
                          )
                        })}
                        {filteredTrackNames.length === 0 && (
                          <li className="px-3.5 py-3 text-center text-body-sm text-light-on-surface-variant">
                            No matching tracks found.
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 2-Column: Available Module Chunks vs Selected Course Path */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-2">
                  {/* Available Module Chunks */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-label text-label-lg font-semibold text-light-on-surface dark:text-dark-on-surface">
                        Available Module Chunks
                      </h3>
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedModuleIds(currentTrackData.modules.map((m) => m.id))
                        }
                        className="font-label text-label-sm text-light-primary dark:text-dark-primary hover:underline"
                      >
                        Select All
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 p-3 rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container/50 border border-light-outline-variant dark:border-dark-outline-variant">
                      {currentTrackData.modules.map((mod) => {
                        const isChecked = selectedModuleIds.includes(mod.id)
                        return (
                          <label
                            key={mod.id}
                            className={`flex items-center justify-between p-2.5 rounded cursor-pointer transition-colors border ${
                              isChecked
                                ? 'bg-light-primary-tint/40 dark:bg-dark-primary-tint/20 border-light-primary/30 dark:border-dark-primary/30'
                                : 'bg-transparent border-transparent hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleModule(mod.id)}
                                className="w-4 h-4 rounded border-light-outline text-light-primary focus:ring-light-primary"
                              />
                              <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface font-medium">
                                {mod.title}
                              </span>
                            </div>
                            <span className="font-mono text-mono-sm tabular-nums px-2 py-0.5 rounded bg-light-surface-container dark:bg-dark-surface-container text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium shrink-0 ml-2">
                              {mod.days} Days
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>

                  {/* Selected Course Path */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-label text-label-lg font-semibold text-light-on-surface dark:text-dark-on-surface">
                        Selected Course Path
                      </h3>
                      <span className="font-label text-label-sm text-light-on-surface-variant">
                        Sequential Pacing
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 p-3 rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-container/50 border border-light-outline-variant dark:border-dark-outline-variant">
                      {selectedModules.map((mod, idx) => (
                        <div
                          key={mod.id}
                          className="flex items-center justify-between px-3.5 py-2 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface border border-light-outline-variant/60 dark:border-dark-outline-variant/60"
                        >
                          <span className="font-body text-body-md tabular-nums font-medium">
                            {String(idx + 1).padStart(2, '0')}. {mod.title} ({mod.days} Days)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleModule(mod.id)}
                            className="text-light-on-surface-variant hover:text-overdue p-1 rounded transition-colors"
                            title="Remove module chunk"
                          >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ))}

                      {selectedModules.length === 0 && (
                        <div className="px-3.5 py-3 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant text-center font-body text-body-sm">
                          Select at least one module chunk from the left to build the path.
                        </div>
                      )}

                      <div className="px-3.5 py-2.5 rounded bg-light-surface-container dark:bg-dark-surface-container-high text-light-on-surface dark:text-dark-on-surface mt-2 flex items-center justify-between">
                        <span className="font-title text-title-md font-semibold tabular-nums">
                          Cumulative Total: {cumulativeDays} Instructional Days
                        </span>
                        <span className="font-label text-label-sm font-semibold text-light-primary dark:text-dark-primary">
                          {Math.round(cumulativeDays / 5)} Weeks
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ) : (
              /* Standard Course Card */
              <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-5 sm:p-6 flex flex-col gap-4">
                <h2 className="font-title text-title-lg font-semibold text-light-on-surface dark:text-dark-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-light-primary text-[20px]">menu_book</span>
                  <span>Standard Institutional Curriculum</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container">
                    <span className="font-label text-label-sm text-light-on-surface-variant block">Track Blueprint</span>
                    <span className="font-body text-body-md font-semibold text-light-on-surface dark:text-dark-on-surface">{selectedTrack}</span>
                  </div>
                  <div className="p-3.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container">
                    <span className="font-label text-label-sm text-light-on-surface-variant block">Standard Duration</span>
                    <span className="font-body text-body-md font-semibold text-light-on-surface dark:text-dark-on-surface">60 Instructional Days (12 Weeks)</span>
                  </div>
                  <div className="p-3.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container">
                    <span className="font-label text-label-sm text-light-on-surface-variant block">Syllabus Format</span>
                    <span className="font-body text-body-md font-semibold text-success">Accredited Full Curriculum</span>
                  </div>
                </div>
              </article>
            )}

            {/* Form Action Footer */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-light-primary text-light-on-primary shadow-sm hover:bg-light-primary-container transition-colors font-label text-label-lg font-semibold disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Processing Onboarding...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                    <span>Complete Student Onboarding</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    fullName: '',
                    guardianName: '',
                    phone: '',
                    email: '',
                    status: 'Active',
                    batch: 'BIX-MKT-26B',
                  })
                }}
                className="px-5 py-2.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface font-label text-label-lg hover:bg-light-surface-container-low transition-colors"
              >
                Reset Form
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: ENROLLED STUDENTS ROSTER */}
      {activeTab === 'roster' && (
        <div className="flex flex-col gap-4">
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant shadow-sm">
            <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[18px] text-light-outline">
                search
              </span>
              <input
                type="search"
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                placeholder="Search by student name, ID, or track..."
                className="w-full pl-9 pr-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={rosterMode}
                onChange={(e) => setRosterMode(e.target.value)}
                className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
              >
                <option value="All">All Modes</option>
                <option value="custom">Custom Chunks</option>
                <option value="standard">Standard Course</option>
              </select>

              <select
                value={rosterStatus}
                onChange={(e) => setRosterStatus(e.target.value)}
                className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Dropped">Dropped</option>
              </select>

              <button
                type="button"
                onClick={() => alert('Exporting student enrollment register...')}
                className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface font-medium hover:bg-light-surface-container transition-colors inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Export Register</span>
              </button>
            </div>
          </div>

          {/* Roster Table */}
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-body-sm">
                <thead>
                  <tr className="border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/70 dark:bg-dark-surface-container/50">
                    <th className="py-2.5 px-4 font-label text-label-sm font-semibold uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Student ID
                    </th>
                    <th className="py-2.5 px-4 font-label text-label-sm font-semibold uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Student Name
                    </th>
                    <th className="py-2.5 px-4 font-label text-label-sm font-semibold uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Curriculum Track
                    </th>
                    <th className="py-2.5 px-4 font-label text-label-sm font-semibold uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Mode
                    </th>
                    <th className="py-2.5 px-4 font-label text-label-sm font-semibold uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Duration
                    </th>
                    <th className="py-2.5 px-4 font-label text-label-sm font-semibold uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Batch
                    </th>
                    <th className="py-2.5 px-4 font-label text-label-sm font-semibold uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Status
                    </th>
                    <th className="py-2.5 px-4 font-label text-label-sm font-semibold uppercase text-light-on-surface-variant dark:text-dark-on-surface-variant text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
                  {filteredRoster.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-light-surface-container-low/50 dark:hover:bg-dark-surface-container/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-mono-sm font-semibold text-light-primary dark:text-dark-primary">
                        {s.student_id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-body text-body-md font-semibold text-light-on-surface dark:text-dark-on-surface">
                            {s.full_name}
                          </span>
                          <span className="font-body text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            {s.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-light-on-surface dark:text-dark-on-surface">
                        {s.track}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-label-xs font-semibold ${
                            s.course_mode === 'custom'
                              ? 'bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint'
                              : 'bg-light-surface-container dark:bg-dark-surface-container text-light-on-surface'
                          }`}
                        >
                          {s.course_mode === 'custom' ? 'Custom Chunks' : 'Standard'}
                        </span>
                      </td>
                      <td className="py-3 px-4 tabular-nums font-mono text-mono-sm">
                        {s.instructional_days} Days
                      </td>
                      <td className="py-3 px-4 font-mono text-mono-sm text-light-on-surface-variant">
                        {s.batch}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-semibold ${
                            s.status === 'Active'
                              ? 'bg-success-container text-on-success-container'
                              : s.status === 'On Leave'
                              ? 'bg-pending-container text-on-pending-container'
                              : 'bg-overdue-container text-on-overdue-container'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setViewingPass(s)}
                          className="px-2.5 py-1 text-label-sm font-medium rounded border border-light-outline-variant dark:border-dark-outline-variant hover:bg-light-surface-container-low transition-colors"
                        >
                          View Pass
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredRoster.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-light-on-surface-variant">
                        No enrolled students matching the selected filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ENROLLMENT PASS / ID CARD MODAL */}
      {viewingPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright rounded-lg border border-light-outline-variant dark:border-dark-outline-variant shadow-xl max-w-lg w-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-light-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px] text-white">school</span>
                </div>
                <div>
                  <h3 className="font-title text-title-md font-bold tracking-tight">BIXCEL INSTITUTE</h3>
                  <span className="font-label text-label-sm opacity-80">Student Enrollment Verification Pass</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingPass(null)}
                className="text-white/80 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Pass Body */}
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-4">
                <div className="flex flex-col">
                  <span className="font-label text-label-xs text-light-on-surface-variant uppercase tracking-wider">
                    Student Full Name
                  </span>
                  <span className="font-headline text-headline-sm font-bold text-light-on-surface dark:text-dark-on-surface">
                    {viewingPass.full_name}
                  </span>
                  <span className="font-body text-body-sm text-light-on-surface-variant">
                    {viewingPass.email} • {viewingPass.phone}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-label text-label-xs text-light-on-surface-variant uppercase tracking-wider">
                    Registration ID
                  </span>
                  <span className="font-mono text-mono-md font-bold text-light-primary dark:text-dark-primary block">
                    {viewingPass.student_id}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container">
                  <span className="font-label text-label-xs text-light-on-surface-variant block">Track Blueprint</span>
                  <span className="font-body text-body-sm font-semibold text-light-on-surface dark:text-dark-on-surface">
                    {viewingPass.track}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container">
                  <span className="font-label text-label-xs text-light-on-surface-variant block">Assigned Batch</span>
                  <span className="font-mono text-mono-sm font-semibold text-light-on-surface dark:text-dark-on-surface">
                    {viewingPass.batch}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container">
                  <span className="font-label text-label-xs text-light-on-surface-variant block">Total Duration</span>
                  <span className="font-body text-body-sm font-semibold text-light-primary dark:text-dark-primary">
                    {viewingPass.instructional_days} Days
                  </span>
                </div>
              </div>

              {/* Module Chunks Breakdown */}
              <div className="flex flex-col gap-1.5 mt-1">
                <span className="font-label text-label-xs text-light-on-surface-variant uppercase font-semibold">
                  Enrolled Module Chunks ({viewingPass.module_chunks?.length || 1})
                </span>
                <div className="flex flex-col gap-1 max-h-36 overflow-y-auto">
                  {viewingPass.module_chunks?.map((chunk, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-1.5 rounded bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant text-body-sm"
                    >
                      <span className="font-medium text-light-on-surface dark:text-dark-on-surface">
                        {i + 1}. {chunk.title}
                      </span>
                      <span className="font-mono text-mono-xs text-light-on-surface-variant">
                        {chunk.days} Days
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Barcode Mock Visual */}
              <div className="pt-2 flex flex-col items-center justify-center border-t border-dashed border-light-outline-variant dark:border-dark-outline-variant">
                <div className="h-9 flex items-center justify-center gap-1 font-mono text-[22px] tracking-[6px] text-light-on-surface dark:text-dark-on-surface opacity-75">
                  ||||| | |||| || |||||| | |||
                </div>
                <span className="font-mono text-[11px] text-light-outline">
                  {viewingPass.student_id}-AUTH-VERIFIED
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-3.5 bg-light-surface-container-low dark:bg-dark-surface-container border-t border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between">
              <span className="font-label text-label-xs text-light-on-surface-variant">
                Enrolled: {viewingPass.created_at || 'Nov 26, 2026'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert(`Printing official registration pass for ${viewingPass.full_name}...`)}
                  className="px-3 py-1.5 rounded bg-light-primary text-light-on-primary font-semibold text-body-sm shadow-xs hover:bg-light-primary-container transition-colors inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingPass(null)}
                  className="px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant text-body-sm hover:bg-light-surface-container transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentOnboarding
