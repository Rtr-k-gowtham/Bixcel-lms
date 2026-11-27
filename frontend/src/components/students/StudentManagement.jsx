import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

// Fallback track catalog matching UI reference
const TRACK_CATALOG = {
  'Digital Marketing': {
    name: 'Digital Marketing',
    category: 'Marketing',
    default_days: 36,
    batch_prefix: 'BIX-MKT-26B',
    modules: [
      { id: 'MOD-DM-01', title: 'SEO & Keyword Strategy', days: 8, default: true, desc: 'On-page technical SEO, search intent mapping, and Semrush audit workflows.' },
      { id: 'MOD-DM-02', title: 'Meta & Google Ads', days: 12, default: true, desc: 'Conversion campaign bidding, audience segmentation, and ROAS optimization.' },
      { id: 'MOD-DM-03', title: 'Content & Social Media Strategy', days: 10, default: true, desc: 'Organic viral distribution, brand storytelling, and multi-channel scheduling.' },
      { id: 'MOD-DM-04', title: 'Email Marketing & Growth Analytics', days: 6, default: false, desc: 'Klaviyo lifecycle flows, cohort retention analysis, and GA4 tracking.' },
      { id: 'MOD-DM-05', title: 'Affiliate & Influencer Partnerships', days: 5, default: false, desc: 'Commission structures, creator contracting, and affiliate tracking pipelines.' },
    ],
  },
  'Full-Stack Web Development': {
    name: 'Full-Stack Web Development',
    category: 'Engineering',
    default_days: 50,
    batch_prefix: 'BIX-DEV-24A',
    modules: [
      { id: 'MOD-FS-01', title: 'Frontend Foundations & Semantic HTML/CSS', days: 10, default: true, desc: 'DOM hierarchy, flexbox/grid architectures, and modern accessibility standards.' },
      { id: 'MOD-FS-02', title: 'Modern JavaScript ES6+ & TypeScript', days: 14, default: true, desc: 'Asynchronous event loops, generics, interfaces, and strict type safety.' },
      { id: 'MOD-FS-03', title: 'React & Next.js Architecture', days: 14, default: true, desc: 'Server components, hooks state management, and SSR routing paradigms.' },
      { id: 'MOD-FS-04', title: 'Node.js, Express & Microservices', days: 12, default: false, desc: 'REST endpoints, JWT auth, middleware chaining, and rate limiting.' },
      { id: 'MOD-FS-05', title: 'PostgreSQL, ORM & Database Optimization', days: 8, default: false, desc: 'Schema migrations, indexing, relational constraints, and connection pooling.' },
      { id: 'MOD-FS-06', title: 'Docker, CI/CD & Cloud Deployment', days: 6, default: false, desc: 'Containerization, GitHub actions, automated testing, and VPS staging.' },
    ],
  },
  'UI/UX Product Design': {
    name: 'UI/UX Product Design',
    category: 'Design',
    default_days: 36,
    batch_prefix: 'BIX-UX-26D',
    modules: [
      { id: 'MOD-UX-01', title: 'User Research, Personas & Journey Mapping', days: 6, default: true, desc: 'Qualitative interviews, synthesis affinity maps, and behavioral heuristics.' },
      { id: 'MOD-UX-02', title: 'Wireframing & Prototyping in Figma', days: 10, default: true, desc: 'Interactive variants, auto-layouts, smart-animate curves, and user flows.' },
      { id: 'MOD-UX-03', title: 'Design Systems & Component Tokens', days: 8, default: true, desc: 'Design tokens, atomic components, WCAG AAA accessibility, and dark mode.' },
      { id: 'MOD-UX-04', title: 'Usability Testing & Micro-interactions', days: 6, default: true, desc: 'Unmoderated testing, heatmaps, interactive feedback loops, and metrics.' },
      { id: 'MOD-UX-05', title: 'Design Handoff & Developer Collaboration', days: 6, default: false, desc: 'Dev mode specifications, redlining, asset exports, and token synchronizations.' },
    ],
  },
  'Data Science & Analytics': {
    name: 'Data Science & Analytics',
    category: 'Data',
    default_days: 44,
    batch_prefix: 'BIX-DS-18C',
    modules: [
      { id: 'MOD-DS-01', title: 'Python for Data Analysis (NumPy, Pandas)', days: 10, default: true, desc: 'Data wrangling, cleaning missing values, time-series parsing, and vectorization.' },
      { id: 'MOD-DS-02', title: 'Statistical Modeling & Hypothesis Testing', days: 8, default: true, desc: 'Probability distributions, p-values, ANOVA, regression, and Bayesian inferences.' },
      { id: 'MOD-DS-03', title: 'Machine Learning & Predictive Modeling', days: 14, default: true, desc: 'Supervised classification, ensemble random forests, evaluation metrics.' },
      { id: 'MOD-DS-04', title: 'PowerBI & Executive Data Storytelling', days: 6, default: false, desc: 'DAX measures, interactive executive dashboards, and stakeholders reporting.' },
      { id: 'MOD-DS-05', title: 'SQL for Big Data & Warehouse Modeling', days: 6, default: false, desc: 'Window functions, CTEs, star schema modeling, and Snowflake data pipelines.' },
    ],
  },
  'Cloud & DevOps Engineering': {
    name: 'Cloud & DevOps Engineering',
    category: 'Infrastructure',
    default_days: 40,
    batch_prefix: 'BIX-CLD-12A',
    modules: [
      { id: 'MOD-CL-01', title: 'Linux System Administration & Networking', days: 8, default: true, desc: 'Bash scripting, systemd services, SSH hardening, and TCP/IP subnetting.' },
      { id: 'MOD-CL-02', title: 'AWS & Multi-Cloud Infrastructure (IAM, VPC, S3)', days: 12, default: true, desc: 'Cloud architecture design, security policies, and high-availability setups.' },
      { id: 'MOD-CL-03', title: 'Infrastructure as Code with Terraform', days: 8, default: true, desc: 'Declarative state files, reusable cloud modules, and plan drift prevention.' },
      { id: 'MOD-CL-04', title: 'Kubernetes Orchestration & Helm', days: 10, default: false, desc: 'Cluster architecture, deployments, ingresses, ConfigMaps, and Helm charts.' },
      { id: 'MOD-CL-05', title: 'Observability, Prometheus & Grafana', days: 6, default: false, desc: 'Log aggregation, telemetry dashboards, alerting rules, and incident tracing.' },
    ],
  },
  'Cybersecurity Operations': {
    name: 'Cybersecurity Operations',
    category: 'Security',
    default_days: 42,
    batch_prefix: 'BIX-SEC-09F',
    modules: [
      { id: 'MOD-SEC-01', title: 'Network Defense & Protocol Hardening', days: 10, default: true, desc: 'Firewall architectures, IDS/IPS tuning, packet inspection, and zero trust.' },
      { id: 'MOD-SEC-02', title: 'Ethical Hacking & Vulnerability Assessment', days: 12, default: true, desc: 'Burp Suite probing, CVE scoring, port scanning, and exploit mitigations.' },
      { id: 'MOD-SEC-03', title: 'SOC Operations & SIEM Incident Response', days: 10, default: true, desc: 'Splunk query syntax, threat containment, triage logs, and memory forensics.' },
      { id: 'MOD-SEC-04', title: 'Application Security & OWASP Top 10', days: 10, default: false, desc: 'SQLi, XSS, CSRF mitigations, automated SAST/DAST testing in CI pipelines.' },
    ],
  },
}

const DEFAULT_DETAILED_STUDENTS = []

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'ST'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'ST'
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

const INITIAL_WIZARD_FORM = {
  // Step 1: Personal
  studentId: '',
  fullName: '',
  phone: '',
  email: '',
  dob: '2004-05-15',
  gender: 'Male',
  bloodGroup: 'O+',
  address: '',
  idProofType: 'National ID',
  idProofNumber: '',

  // Step 2: Guardian & Academic
  guardianName: '',
  guardianRelation: 'Father',
  guardianPhone: '',
  guardianEmail: '',
  qualification: 'B.Tech / B.E.',
  institution: '',
  passingYear: '2025',

  // Step 3: Course & Batch
  batch: 'BIX-DEV-24A',
  admissionDate: '2026-11-26',
  status: 'Active',

  // Step 5: Fee & Plan
  feePlan: 'Full Payment',
  feeStatus: 'Paid',
}

export function StudentManagement({ initialTab = 'directory' }) {
  const [activeTab, setActiveTab] = useState(initialTab) // 'directory' | 'wizard'
  const [prevTabProp, setPrevTabProp] = useState(initialTab)
  if (initialTab !== prevTabProp) {
    setPrevTabProp(initialTab)
    setActiveTab(initialTab)
  }

  const [students, setStudents] = useState([])
  const [tracks, setTracks] = useState(TRACK_CATALOG)
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

  // -------------------------------------------------------------
  // STEP-BY-STEP ONBOARDING WIZARD STATE
  // -------------------------------------------------------------
  const [wizardStep, setWizardStep] = useState(1) // 1: Personal, 2: Guardian/Academic, 3: Course/Batch, 4: Modules, 5: Review
  const [wizardCourseMode, setWizardCourseMode] = useState('custom') // 'custom' | 'standard'
  const [wizardTrack, setWizardTrack] = useState('Full-Stack Web Development')
  const [selectedModuleIds, setSelectedModuleIds] = useState(() => {
    return TRACK_CATALOG['Full-Stack Web Development'].modules.filter((m) => m.default).map((m) => m.id)
  })

  const [wizardForm, setWizardForm] = useState(INITIAL_WIZARD_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load backend students on mount
  useEffect(() => {
    let isMounted = true
    const fetchStudents = async () => {
      try {
        const res = await apiService.getStudents()
        if (res && res.data && Array.isArray(res.data) && isMounted) {
          setStudents(res.data)
        }
        if (res && res.tracks && isMounted) {
          setTracks(res.tracks)
        }
      } catch (err) {
        console.warn('Fallback to local student records:', err)
      }
    }
    fetchStudents()
    return () => { isMounted = false }
  }, [])

  // Track change in Wizard
  const handleWizardTrackChange = (trackName) => {
    setWizardTrack(trackName)
    const trackData = tracks[trackName] || TRACK_CATALOG[trackName]
    if (trackData && trackData.modules) {
      setSelectedModuleIds(trackData.modules.filter((m) => m.default).map((m) => m.id))
    }
    if (trackData?.batch_prefix) {
      setWizardForm((prev) => ({ ...prev, batch: trackData.batch_prefix }))
    }
  }

  // Toggle Module Checkbox
  const handleToggleModule = (modId) => {
    setSelectedModuleIds((prev) =>
      prev.includes(modId) ? prev.filter((id) => id !== modId) : [...prev, modId]
    )
  }

  // Calculate Cumulative Days
  const currentTrackData = tracks[wizardTrack] || TRACK_CATALOG[wizardTrack] || { modules: [] }
  const selectedModules = (currentTrackData.modules || []).filter((m) =>
    selectedModuleIds.includes(m.id)
  )
  const cumulativeDays =
    wizardCourseMode === 'custom'
      ? selectedModules.reduce((acc, curr) => acc + curr.days, 0)
      : 60

  // Wizard Step Validation
  const validateStep = (step) => {
    if (step === 1) {
      if (!wizardForm.fullName.trim()) {
        alert('Please enter Student Full Name')
        return false
      }
      if (!wizardForm.phone.trim()) {
        alert('Please enter Student Phone Number')
        return false
      }
      return true
    }
    if (step === 2) {
      if (!wizardForm.guardianName.trim()) {
        alert('Please enter Guardian / Parent Name')
        return false
      }
      return true
    }
    if (step === 3) {
      if (!wizardTrack || !wizardForm.batch) {
        alert('Please select a course track and batch')
        return false
      }
      return true
    }
    if (step === 4) {
      if (wizardCourseMode === 'custom' && selectedModules.length === 0) {
        alert('Please select at least one module chunk for custom curriculum')
        return false
      }
      return true
    }
    return true
  }

  const handleNextStep = () => {
    if (validateStep(wizardStep)) {
      setWizardStep((prev) => Math.min(prev + 1, 5))
    }
  }

  const handlePrevStep = () => {
    setWizardStep((prev) => Math.max(prev - 1, 1))
  }

  // Complete Step Wizard Onboarding
  const handleCompleteWizard = async (e) => {
    e.preventDefault()
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) return

    setIsSubmitting(true)
    const nextNum = 843 + students.length
    const autoId = wizardForm.studentId.trim() || `STU-2026-0${nextNum}`
    const generatedEmail =
      wizardForm.email.trim() ||
      `${wizardForm.fullName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@student.bixcel.edu`

    const payload = {
      student_id: autoId,
      full_name: wizardForm.fullName.trim(),
      guardian_name: wizardForm.guardianName.trim(),
      guardian_relation: wizardForm.guardianRelation,
      guardian_phone: wizardForm.guardianPhone || wizardForm.phone,
      guardian_email: wizardForm.guardianEmail || '',
      phone: wizardForm.phone.trim(),
      email: generatedEmail,
      dob: wizardForm.dob,
      gender: wizardForm.gender,
      blood_group: wizardForm.bloodGroup,
      address: wizardForm.address.trim(),
      qualification: wizardForm.qualification,
      institution: wizardForm.institution.trim() || 'Accredited Institution',
      passing_year: wizardForm.passingYear,
      id_proof_type: wizardForm.idProofType,
      id_proof_number: wizardForm.idProofNumber.trim() || `ID-${Date.now().toString().slice(-6)}`,
      fee_plan: wizardForm.feePlan,
      fee_status: wizardForm.feeStatus,
      attendance_pct: 100,
      status: wizardForm.status,
      course_mode: wizardCourseMode,
      track: wizardTrack,
      batch: wizardForm.batch,
      instructional_days: cumulativeDays,
      module_chunks:
        wizardCourseMode === 'custom'
          ? selectedModules.map((m) => ({ title: m.title, days: m.days }))
          : [{ title: `Full Curriculum ${wizardTrack} Standard Program`, days: 60 }],
      last_login_at: 'Never',
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
    }

    try {
      const res = await apiService.createStudent(payload)
      const finalStudent = res?.data || { id: Date.now(), ...payload }
      setStudents((prev) => [finalStudent, ...prev])
      setToast(`Student "${finalStudent.full_name}" (${finalStudent.student_id}) successfully onboarded!`)
      setViewingPass(finalStudent)
      setWizardStep(1)
      setWizardForm(INITIAL_WIZARD_FORM)
      setActiveTab('directory')
    } catch (err) {
      console.warn('API onboard failed, saving locally:', err)
      const mockNew = { id: Date.now(), ...payload }
      setStudents((prev) => [mockNew, ...prev])
      setToast(`Student "${mockNew.full_name}" (${mockNew.student_id}) saved locally!`)
      setViewingPass(mockNew)
      setWizardStep(1)
      setWizardForm(INITIAL_WIZARD_FORM)
      setActiveTab('directory')
    } finally {
      setIsSubmitting(false)
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

      {/* Screen Header & Top Switcher (High Density, Reduced Font Size) */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-3 rounded-md shadow-xs">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-light-primary text-[18px]">groups</span>
            <h1 className="font-title text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface">
              Student Management &amp; Onboarding
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint font-mono text-[10px] font-bold">
              {totalCount} Total
            </span>
          </div>
          <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Master student directory, multi-step course onboarding wizard, and curriculum track allocations.
          </p>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center p-0.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant">
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-label text-xs font-semibold transition-colors ${
                activeTab === 'directory'
                  ? 'bg-light-primary text-light-on-primary shadow-xs'
                  : 'text-light-on-surface-variant hover:text-light-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">badge</span>
              <span>Student Directory</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('wizard')
                setWizardStep(1)
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-label text-xs font-semibold transition-colors ${
                activeTab === 'wizard'
                  ? 'bg-light-primary text-light-on-primary shadow-xs'
                  : 'text-light-on-surface-variant hover:text-light-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">person_add</span>
              <span>Onboarding Wizard</span>
            </button>
          </div>

          {activeTab === 'directory' && (
            <button
              type="button"
              onClick={() => {
                setActiveTab('wizard')
                setWizardStep(1)
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>Onboard Student</span>
            </button>
          )}
        </div>
      </section>

      {/* 4 Compact Metric Cards (Decreased sizing & padding) */}
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
      {/* VIEW 1: STUDENT DIRECTORY (HIGH DENSITY TABLE)                        */}
      {/* ===================================================================== */}
      {activeTab === 'directory' && (
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
                {Object.keys(tracks).map((t) => (
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
                <option value="custom">Custom Chunks</option>
                <option value="standard">Standard Syllabus</option>
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
                        <p className="text-[11px] opacity-80 mt-0.5">Try clearing filters or onboarding a new student</p>
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
                              <div className="w-6 h-6 rounded-full bg-light-primary text-light-on-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                                {initials}
                              </div>
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
                            <span className="px-2 py-0.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-[11px] font-medium text-light-on-surface-variant">
                              {s.track || 'General'}
                            </span>
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
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: STEP-BY-STEP ONBOARDING WIZARD ("WITH STEP AND COURSE")       */}
      {/* ===================================================================== */}
      {activeTab === 'wizard' && (
        <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-xs p-4 flex flex-col gap-4">
          {/* Step Progress Tracker Bar */}
          <div className="flex flex-col gap-2 border-b border-light-outline-variant dark:border-dark-outline-variant pb-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label text-[11px] text-light-primary font-bold uppercase tracking-wider">
                  Step {wizardStep} of 5
                </span>
                <h2 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                  {wizardStep === 1 && 'Personal Information & Identification'}
                  {wizardStep === 2 && 'Guardian, Contact & Academic Background'}
                  {wizardStep === 3 && 'Course Track & Cohort Allocation'}
                  {wizardStep === 4 && 'Modular Curriculum & Chunk Selection'}
                  {wizardStep === 5 && 'Fee Plan, Review & Confirm Admission'}
                </h2>
              </div>
              <span className="text-xs text-light-on-surface-variant font-medium">
                Auto ID:{' '}
                <strong className="font-mono text-light-primary font-bold">
                  {wizardForm.studentId || `STU-2026-0${843 + students.length}`}
                </strong>
              </span>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[
                { s: 1, label: '1. Personal' },
                { s: 2, label: '2. Guardian' },
                { s: 3, label: '3. Course' },
                { s: 4, label: '4. Modules' },
                { s: 5, label: '5. Review' },
              ].map(({ s, label }) => {
                const isPassed = wizardStep > s
                const isCurrent = wizardStep === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      if (s < wizardStep || validateStep(wizardStep)) setWizardStep(s)
                    }}
                    className={`h-7 rounded px-1.5 text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors ${
                      isPassed
                        ? 'bg-success text-white'
                        : isCurrent
                        ? 'bg-light-primary text-light-on-primary'
                        : 'bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant'
                    }`}
                  >
                    {isPassed ? (
                      <span className="material-symbols-outlined text-[13px]">check</span>
                    ) : (
                      <span>{s}</span>
                    )}
                    <span className="hidden sm:inline truncate">{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form Step Bodies */}
          <form onSubmit={handleCompleteWizard} className="flex flex-col gap-4">
            {/* ------------------------------------------------------------- */}
            {/* STEP 1: PERSONAL INFORMATION                                  */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in duration-150">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={wizardForm.fullName}
                    onChange={(e) => setWizardForm({ ...wizardForm, fullName: e.target.value })}
                    placeholder="e.g. Marcus Vance"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Custom / Target Student ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={wizardForm.studentId}
                    onChange={(e) => setWizardForm({ ...wizardForm, studentId: e.target.value.toUpperCase() })}
                    placeholder={`STU-2026-0${843 + students.length}`}
                    className="w-full px-2.5 py-1.5 text-xs font-mono uppercase rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={wizardForm.phone}
                    onChange={(e) => setWizardForm({ ...wizardForm, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Student Primary Email
                  </label>
                  <input
                    type="email"
                    value={wizardForm.email}
                    onChange={(e) => setWizardForm({ ...wizardForm, email: e.target.value })}
                    placeholder="auto-generated if empty"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={wizardForm.dob}
                    onChange={(e) => setWizardForm({ ...wizardForm, dob: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Gender
                  </label>
                  <select
                    value={wizardForm.gender}
                    onChange={(e) => setWizardForm({ ...wizardForm, gender: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer Not to Say">Prefer Not to Say</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Blood Group
                  </label>
                  <select
                    value={wizardForm.bloodGroup}
                    onChange={(e) => setWizardForm({ ...wizardForm, bloodGroup: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    ID Proof Type
                  </label>
                  <select
                    value={wizardForm.idProofType}
                    onChange={(e) => setWizardForm({ ...wizardForm, idProofType: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="National ID">National ID / Aadhar</option>
                    <option value="Passport">International Passport</option>
                    <option value="Driver License">Driver's License</option>
                    <option value="Student Card">Prior Institution ID</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    ID Proof Number / Ref
                  </label>
                  <input
                    type="text"
                    value={wizardForm.idProofNumber}
                    onChange={(e) => setWizardForm({ ...wizardForm, idProofNumber: e.target.value })}
                    placeholder="e.g. NID-8492014"
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Residential Address
                  </label>
                  <input
                    type="text"
                    value={wizardForm.address}
                    onChange={(e) => setWizardForm({ ...wizardForm, address: e.target.value })}
                    placeholder="e.g. 742 Evergreen Terrace, Springfield, OR"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 2: GUARDIAN & ACADEMIC BACKGROUND                        */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in duration-150">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Guardian / Parent Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={wizardForm.guardianName}
                    onChange={(e) => setWizardForm({ ...wizardForm, guardianName: e.target.value })}
                    placeholder="e.g. Eleanor Vance"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Relationship
                  </label>
                  <select
                    value={wizardForm.guardianRelation}
                    onChange={(e) => setWizardForm({ ...wizardForm, guardianRelation: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="Father">Father</option>
                    <option value="Mother">Mother</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Self / Sponsor">Self / Corporate Sponsor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Guardian Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={wizardForm.guardianPhone}
                    onChange={(e) => setWizardForm({ ...wizardForm, guardianPhone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Guardian Email Address
                  </label>
                  <input
                    type="email"
                    value={wizardForm.guardianEmail}
                    onChange={(e) => setWizardForm({ ...wizardForm, guardianEmail: e.target.value })}
                    placeholder="guardian@example.com"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Highest Educational Qualification
                  </label>
                  <select
                    value={wizardForm.qualification}
                    onChange={(e) => setWizardForm({ ...wizardForm, qualification: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="B.Tech / B.E.">B.Tech / B.E. (Engineering)</option>
                    <option value="B.Sc Computer Science">B.Sc Computer Science / IT</option>
                    <option value="B.Des / Design Degree">B.Des / Fine Arts</option>
                    <option value="B.Com / Management">B.Com / BBA / Finance</option>
                    <option value="Master's / Post-Grad">Master's / M.Tech / MBA</option>
                    <option value="High School / Diploma">High School / Technical Diploma</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    College / University Name
                  </label>
                  <input
                    type="text"
                    value={wizardForm.institution}
                    onChange={(e) => setWizardForm({ ...wizardForm, institution: e.target.value })}
                    placeholder="e.g. Stanford / State University"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Passing Year / Graduation
                  </label>
                  <input
                    type="number"
                    min="2010"
                    max="2030"
                    value={wizardForm.passingYear}
                    onChange={(e) => setWizardForm({ ...wizardForm, passingYear: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 3: COURSE TRACK & COHORT ALLOCATION                      */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 3 && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setWizardCourseMode('standard')}
                    className={`p-3 rounded border cursor-pointer transition-all ${
                      wizardCourseMode === 'standard'
                        ? 'border-light-primary bg-light-primary-tint/30 dark:bg-dark-primary-tint/30 shadow-xs'
                        : 'border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low hover:bg-light-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-light-primary text-[18px]">
                        {wizardCourseMode === 'standard' ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                      <strong className="text-xs text-light-on-surface dark:text-dark-on-surface">Standard Institutional Syllabus</strong>
                    </div>
                    <p className="text-[11px] text-light-on-surface-variant mt-1 pl-6">
                      Fixed 60-day curriculum with standardized lecture modules and predetermined milestones.
                    </p>
                  </div>

                  <div
                    onClick={() => setWizardCourseMode('custom')}
                    className={`p-3 rounded border cursor-pointer transition-all ${
                      wizardCourseMode === 'custom'
                        ? 'border-light-primary bg-light-primary-tint/30 dark:bg-dark-primary-tint/30 shadow-xs'
                        : 'border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low hover:bg-light-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-light-primary text-[18px]">
                        {wizardCourseMode === 'custom' ? 'radio_button_checked' : 'radio_button_unchecked'}
                      </span>
                      <strong className="text-xs text-light-on-surface dark:text-dark-on-surface">Custom Modular Track (Pick Chunks)</strong>
                    </div>
                    <p className="text-[11px] text-light-on-surface-variant mt-1 pl-6">
                      Customize curriculum by selecting tailored modular chunks to assemble custom course pacing.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Target Course Track *
                    </label>
                    <select
                      value={wizardTrack}
                      onChange={(e) => handleWizardTrackChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                    >
                      {Object.keys(tracks).map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Assigned Batch Cohort *
                    </label>
                    <input
                      type="text"
                      required
                      value={wizardForm.batch}
                      onChange={(e) => setWizardForm({ ...wizardForm, batch: e.target.value })}
                      placeholder="e.g. BIX-DEV-24A"
                      className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Admission Date
                    </label>
                    <input
                      type="date"
                      value={wizardForm.admissionDate}
                      onChange={(e) => setWizardForm({ ...wizardForm, admissionDate: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 4: MODULAR CURRICULUM & CHUNK SELECTION                  */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 4 && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between bg-light-surface-container-low dark:bg-dark-surface-container p-2.5 rounded border border-light-outline-variant dark:border-dark-outline-variant">
                  <div>
                    <span className="font-label text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                      {wizardTrack}
                    </span>
                    <p className="text-[11px] text-light-on-surface-variant">
                      {wizardCourseMode === 'custom'
                        ? 'Select modular chunks to include in this student customized syllabus'
                        : 'Standard 60-day institutional course includes all base modules'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-label text-xs font-bold text-light-primary dark:text-dark-primary block">
                      {cumulativeDays} Total Days
                    </span>
                    <span className="text-[10px] text-light-on-surface-variant">
                      {selectedModules.length} Modules Selected
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {(currentTrackData.modules || []).map((mod) => {
                    const isChecked = selectedModuleIds.includes(mod.id)
                    const isStandardMode = wizardCourseMode === 'standard'

                    return (
                      <div
                        key={mod.id}
                        onClick={() => {
                          if (!isStandardMode) handleToggleModule(mod.id)
                        }}
                        className={`p-2.5 rounded border transition-colors flex items-start gap-2.5 ${
                          isChecked
                            ? 'border-light-primary/60 bg-light-primary-tint/20 dark:bg-dark-primary-tint/20'
                            : 'border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low'
                        } ${!isStandardMode ? 'cursor-pointer hover:border-light-primary' : 'opacity-90'}`}
                      >
                        <input
                          type="checkbox"
                          disabled={isStandardMode}
                          checked={isChecked}
                          onChange={() => handleToggleModule(mod.id)}
                          className="mt-0.5 rounded text-light-primary focus:ring-0 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono text-[10px] text-light-primary font-bold">{mod.id}</span>
                            <span className="font-label text-[10px] font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                              {mod.days} Days
                            </span>
                          </div>
                          <span className="font-title text-xs font-semibold text-light-on-surface dark:text-dark-on-surface block mt-0.5">
                            {mod.title}
                          </span>
                          {mod.desc && (
                            <p className="text-[10px] text-light-on-surface-variant line-clamp-1 mt-0.5">
                              {mod.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 5: FEE PLAN, REVIEW & CONFIRM                            */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 5 && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Fee Installment Plan
                    </label>
                    <select
                      value={wizardForm.feePlan}
                      onChange={(e) => setWizardForm({ ...wizardForm, feePlan: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                    >
                      <option value="Full Payment">Full Payment (Upfront)</option>
                      <option value="2-Installment">2-Installment Split</option>
                      <option value="3-Installment EMI">3-Installment EMI Plan</option>
                      <option value="Scholarship / Sponsored">Scholarship / Sponsored</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Initial Payment Status
                    </label>
                    <select
                      value={wizardForm.feeStatus}
                      onChange={(e) => setWizardForm({ ...wizardForm, feeStatus: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                    >
                      <option value="Paid">Paid / Receipt Generated</option>
                      <option value="Partial">Partial Deposit Received</option>
                      <option value="Pending">Pending / Awaiting Wire</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Initial Enrollment Status
                    </label>
                    <select
                      value={wizardForm.status}
                      onChange={(e) => setWizardForm({ ...wizardForm, status: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                    >
                      <option value="Active">Active Student</option>
                      <option value="Pending">Pending Verification</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                </div>

                {/* Final Review Summary Card */}
                <div className="p-3 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/60 dark:bg-dark-surface-container/60 flex flex-col gap-2 mt-1">
                  <span className="font-label text-xs font-bold text-light-primary dark:text-dark-primary">
                    Onboarding Verification Summary
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-light-on-surface-variant block">Student Name:</span>
                      <strong className="text-light-on-surface dark:text-dark-on-surface truncate block">{wizardForm.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-light-on-surface-variant block">Registration ID:</span>
                      <strong className="font-mono text-light-on-surface dark:text-dark-on-surface">{wizardForm.studentId || `STU-2026-0${843 + students.length}`}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-light-on-surface-variant block">Course Track:</span>
                      <strong className="text-light-on-surface dark:text-dark-on-surface">{wizardTrack}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-light-on-surface-variant block">Batch / Days:</span>
                      <strong className="text-light-on-surface dark:text-dark-on-surface">{wizardForm.batch} • {cumulativeDays} Days</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex items-center justify-between border-t border-light-outline-variant dark:border-dark-outline-variant pt-3 mt-2">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={wizardStep === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant text-xs font-semibold text-light-on-surface dark:text-dark-on-surface disabled:opacity-40 hover:bg-light-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">arrow_back</span>
                <span>Previous Step</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('directory')}
                  className="px-3 py-1.5 rounded text-xs text-light-on-surface-variant hover:text-light-on-surface"
                >
                  Cancel
                </button>

                {wizardStep < 5 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-1 px-4 py-1.5 rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>Next: Step {wizardStep + 1}</span>
                    <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1 px-4 py-1.5 rounded bg-success text-white hover:bg-success/90 font-label text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">how_to_reg</span>
                    <span>{isSubmitting ? 'Onboarding...' : 'Confirm & Complete Onboarding'}</span>
                  </button>
                )}
              </div>
            </div>
          </form>
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
                <div className="w-9 h-9 rounded-full bg-light-primary text-light-on-primary font-bold text-xs flex items-center justify-center">
                  {getInitials(selectedStudent?.full_name)}
                </div>
                <div>
                  <h3 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                    {selectedStudent.full_name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-light-on-surface-variant font-mono">
                    <span>{selectedStudent.student_id}</span>
                    <span>•</span>
                    <span className="text-light-primary font-semibold">{selectedStudent.track}</span>
                  </div>
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
                  <div className="w-8 h-8 rounded-full bg-light-primary text-light-on-primary font-bold text-xs flex items-center justify-center">
                    {getInitials(viewingPass?.full_name)}
                  </div>
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
    </div>
  )
}

export default StudentManagement
