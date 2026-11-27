import React, { useState, useEffect, useMemo } from 'react'
import { apiService } from '../../services/api'

// Fallback faculty track specializations
const TRACK_CATALOG = {
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
    ],
  },
}

const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'TT'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'TT'
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('')
}

const INITIAL_WIZARD_FORM = {
  // Step 1: Personal
  staffId: '',
  fullName: '',
  phone: '',
  email: '',
  dob: '1992-06-15',
  gender: 'Male',
  bloodGroup: 'O+',
  address: '',
  idProofType: 'National ID',
  idProofNumber: '',

  // Step 2: Academic & Credentials
  qualification: 'M.Tech / M.S. in Computer Science',
  specialization: 'Full-Stack Web Development',
  institution: '',
  passingYear: '2016',
  experienceYears: '8',
  portfolioUrl: '',
  bio: '',

  // Step 3: Course Allocation
  batch: 'BIX-DEV-24A',
  role: 'Senior Faculty Lead',
  joiningDate: '2026-11-26',
  status: 'Active',

  // Step 5: Compensation & Workload
  payModel: 'Monthly Retainer',
  compensationAmount: '85000',
  weeklyHours: 16,
  maxHours: 24,
}

export function TutorManagement({ initialTab = 'directory' }) {
  const [activeTab, setActiveTab] = useState(initialTab) // 'directory' | 'wizard'
  const [prevTabProp, setPrevTabProp] = useState(initialTab)
  if (initialTab !== prevTabProp) {
    setPrevTabProp(initialTab)
    setActiveTab(initialTab)
  }

  const [tutors, setTutors] = useState([])
  const [tracks, setTracks] = useState(TRACK_CATALOG)
  const [coursesList, setCoursesList] = useState([])
  const [modulesList, setModulesList] = useState([])
  const [toast, setToast] = useState('')

  // Search & Filters in Directory
  const [search, setSearch] = useState('')
  const [filterDomain, setFilterDomain] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [filterRole, setFilterRole] = useState('All')

  // Modals & Drawers
  const [selectedTutor, setSelectedTutor] = useState(null)
  const [editingTutor, setEditingTutor] = useState(null)
  const [viewingPass, setViewingPass] = useState(null)

  // -------------------------------------------------------------
  // STEP-BY-STEP ONBOARDING WIZARD STATE
  // -------------------------------------------------------------
  const [wizardStep, setWizardStep] = useState(1) // 1: Personal, 2: Academic, 3: Course/Batch, 4: Modules, 5: Review
  const [wizardCourseMode, setWizardCourseMode] = useState('standard') // 'standard' (Course) | 'custom' (Custom Modular)
  const [wizardTrack, setWizardTrack] = useState('Full-Stack Web Development')
  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedModuleIds, setSelectedModuleIds] = useState(() => {
    return TRACK_CATALOG['Full-Stack Web Development'].modules.filter((m) => m.default).map((m) => m.id)
  })
  const [moduleSearch, setModuleSearch] = useState('')
  const [moduleCategoryFilter, setModuleCategoryFilter] = useState('All')

  const [wizardForm, setWizardForm] = useState(INITIAL_WIZARD_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Load backend tutors, courses, and modules on mount
  useEffect(() => {
    let isMounted = true
    const fetchAllData = async () => {
      try {
        const [tutorsRes, coursesRes, modulesRes] = await Promise.allSettled([
          apiService.getTutors(),
          apiService.getCourses(),
          apiService.getModules(),
        ])

        if (!isMounted) return

        if (tutorsRes.status === 'fulfilled' && tutorsRes.value?.data) {
          const list = Array.isArray(tutorsRes.value.data) ? tutorsRes.value.data : []
          setTutors(list)
        }

        if (coursesRes.status === 'fulfilled' && coursesRes.value?.data) {
          const cData = Array.isArray(coursesRes.value.data) ? coursesRes.value.data : []
          setCoursesList(cData)
          if (cData.length > 0) {
            const first = cData[0]
            setSelectedCourseId(first.id)
            setWizardTrack(first.title)
            if (first.code) {
              setWizardForm((prev) => ({ ...prev, batch: `${first.code}-26A` }))
            }
          }
        }

        if (modulesRes.status === 'fulfilled' && modulesRes.value?.data) {
          const mData = Array.isArray(modulesRes.value.data) ? modulesRes.value.data : []
          setModulesList(mData)
        }
      } catch (err) {
        console.warn('Fallback to local faculty records:', err)
      }
    }
    fetchAllData()
    return () => { isMounted = false }
  }, [])

  // All available modules from Module Library (with fallback if empty)
  const allAvailableModules = useMemo(() => {
    if (modulesList && modulesList.length > 0) {
      return modulesList
    }
    const fallbackList = []
    Object.entries(TRACK_CATALOG).forEach(([catName, trackObj]) => {
      (trackObj.modules || []).forEach((m) => {
        fallbackList.push({
          id: m.id,
          code: m.id,
          title: m.title,
          category: trackObj.category || catName,
          days: m.days || 1,
          lessons: m.days ? m.days * 2 : 1,
          description: m.desc || '',
        })
      })
    })
    return fallbackList
  }, [modulesList])

  // Selected Course Object
  const selectedCourse = useMemo(() => {
    if (!coursesList || coursesList.length === 0) return null
    if (!selectedCourseId) return coursesList[0]
    return coursesList.find((c) => String(c.id) === String(selectedCourseId)) || coursesList[0]
  }, [coursesList, selectedCourseId])

  // Modules belonging to selected Course
  const selectedCourseModules = useMemo(() => {
    if (!selectedCourse) return []
    const rawIds = selectedCourse.module_ids || []
    const idSet = new Set(rawIds.map((id) => String(id)))
    return allAvailableModules.filter((m) => idSet.has(String(m.id)) || idSet.has(String(m.code)))
  }, [selectedCourse, allAvailableModules])

  // Modules selected in Custom Modular mode
  const selectedCustomModules = useMemo(() => {
    return allAvailableModules.filter((m) => {
      const idKey = m.id
      const codeKey = m.code
      return selectedModuleIds.includes(idKey) || (codeKey && selectedModuleIds.includes(codeKey))
    })
  }, [allAvailableModules, selectedModuleIds])

  // Cumulative Teaching Days & Hours calculation
  const cumulativeDays = useMemo(() => {
    if (wizardCourseMode === 'standard') {
      if (selectedCourse?.days && Number(selectedCourse.days) > 0) {
        return Number(selectedCourse.days)
      }
      if (selectedCourseModules.length > 0) {
        return selectedCourseModules.reduce((sum, m) => sum + (Number(m.days) || 0), 0)
      }
      return 45
    }
    return selectedCustomModules.reduce((sum, m) => sum + (Number(m.days) || 0), 0)
  }, [wizardCourseMode, selectedCourse, selectedCourseModules, selectedCustomModules])

  // Effective modules for this tutor
  const effectiveModules = useMemo(() => {
    if (wizardCourseMode === 'standard') {
      if (selectedCourseModules.length > 0) return selectedCourseModules
      if (selectedCourse) {
        return [{
          id: selectedCourse.code || `CRS-${selectedCourse.id}`,
          code: selectedCourse.code || `CRS-${selectedCourse.id}`,
          title: selectedCourse.title,
          days: cumulativeDays,
          category: selectedCourse.category || 'General',
          description: selectedCourse.description || `Primary curriculum for ${selectedCourse.title}`,
        }]
      }
      return []
    }
    return selectedCustomModules
  }, [wizardCourseMode, selectedCourseModules, selectedCourse, cumulativeDays, selectedCustomModules])

  // Module Category domain list for filter
  const moduleCategories = useMemo(() => {
    const set = new Set(['All'])
    allAvailableModules.forEach((m) => {
      if (m.category) set.add(m.category)
    })
    return Array.from(set)
  }, [allAvailableModules])

  // Filtered modules for Custom Modular selection
  const filteredModulesForCustom = useMemo(() => {
    return allAvailableModules.filter((m) => {
      const q = moduleSearch.toLowerCase().trim()
      const matchSearch =
        !q ||
        m.title?.toLowerCase().includes(q) ||
        m.code?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q)
      const matchCat =
        moduleCategoryFilter === 'All' ||
        m.category?.toLowerCase() === moduleCategoryFilter.toLowerCase()
      return matchSearch && matchCat
    })
  }, [allAvailableModules, moduleSearch, moduleCategoryFilter])

  // Toggle Module Checkbox
  const handleToggleModule = (mod) => {
    const idKey = mod.id
    const codeKey = mod.code
    setSelectedModuleIds((prev) => {
      const has = prev.includes(idKey) || (codeKey && prev.includes(codeKey))
      if (has) {
        return prev.filter((id) => id !== idKey && id !== codeKey)
      } else {
        return [...prev, idKey]
      }
    })
  }

  // Handle Track change in Wizard (for custom mode)
  const handleWizardTrackChange = (trackName) => {
    setWizardTrack(trackName)
    const trackData = tracks[trackName] || TRACK_CATALOG[trackName]
    if (trackData && trackData.modules) {
      const defaults = trackData.modules.filter((m) => m.default).map((m) => m.id)
      setSelectedModuleIds((prev) => Array.from(new Set([...prev, ...defaults])))
    }
    if (trackData?.batch_prefix) {
      setWizardForm((prev) => ({ ...prev, batch: trackData.batch_prefix }))
    }
  }

  // Handle Course selection in Course mode
  const handleSelectCourse = (courseId) => {
    setSelectedCourseId(courseId)
    const found = coursesList.find((c) => String(c.id) === String(courseId))
    if (found) {
      setWizardTrack(found.title)
      if (found.code) {
        setWizardForm((prev) => ({ ...prev, batch: `${found.code}-26A` }))
      }
      if (found.module_ids && Array.isArray(found.module_ids) && found.module_ids.length > 0) {
        setSelectedModuleIds(found.module_ids)
      }
    }
  }

  // Wizard Step Validation
  const validateStep = (step) => {
    if (step === 1) {
      if (!wizardForm.fullName.trim()) {
        alert('Please enter Faculty / Tutor Full Name')
        return false
      }
      if (!wizardForm.phone.trim()) {
        alert('Please enter Faculty Contact Phone Number')
        return false
      }
      return true
    }
    if (step === 2) {
      if (!wizardForm.specialization.trim()) {
        alert('Please specify Faculty Domain Specialization')
        return false
      }
      return true
    }
    if (step === 3) {
      if (wizardCourseMode === 'standard') {
        if (!selectedCourseId && coursesList.length > 0) {
          alert('Please select a Course Program')
          return false
        }
      } else {
        if (!wizardTrack.trim()) {
          alert('Please select or enter an allocated track domain')
          return false
        }
      }
      if (!wizardForm.batch.trim()) {
        alert('Please enter an assigned batch cohort')
        return false
      }
      return true
    }
    if (step === 4) {
      if (wizardCourseMode === 'custom' && selectedCustomModules.length === 0) {
        alert('Please select at least one module from the Module Library for this tutor to teach')
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
    const nextNum = 120 + tutors.length
    const autoId = wizardForm.staffId.trim() || `TUT-2026-0${nextNum}`
    const generatedEmail =
      wizardForm.email.trim() ||
      `${wizardForm.fullName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@faculty.bixcel.edu`

    const payload = {
      staff_id: autoId,
      tutor_id: autoId,
      name: wizardForm.fullName.trim(),
      full_name: wizardForm.fullName.trim(),
      phone: wizardForm.phone.trim(),
      email: generatedEmail,
      dob: wizardForm.dob,
      gender: wizardForm.gender,
      blood_group: wizardForm.bloodGroup,
      address: wizardForm.address.trim(),
      qualification: wizardForm.qualification,
      specialization: wizardForm.specialization,
      expertise: wizardForm.specialization,
      institution: wizardForm.institution.trim() || 'State Accredited University',
      passing_year: wizardForm.passingYear,
      experience_years: wizardForm.experienceYears,
      portfolio_url: wizardForm.portfolioUrl.trim(),
      bio: wizardForm.bio.trim(),
      id_proof_type: wizardForm.idProofType,
      id_proof_number: wizardForm.idProofNumber.trim() || `ID-${Date.now().toString().slice(-6)}`,
      role: wizardForm.role,
      status: wizardForm.status,
      availability: wizardForm.status === 'Active' ? 'Available' : 'Partial',
      courses: wizardTrack,
      assigned_track: wizardTrack,
      batch: wizardForm.batch,
      assigned_batches: [wizardForm.batch],
      course_mode: wizardCourseMode,
      total_hours: Number(wizardForm.weeklyHours) || 16,
      hours: Number(wizardForm.weeklyHours) || 16,
      max_hours: Number(wizardForm.maxHours) || 24,
      pay_model: wizardForm.payModel,
      compensation_amount: Number(wizardForm.compensationAmount) || 85000,
      rating: 5.0,
      module_chunks: effectiveModules.map((m) => ({
        title: m.title,
        days: Number(m.days) || 1,
        code: m.code || m.id,
      })),
      created_at: new Date().toISOString().replace('T', ' ').slice(0, 16),
    }

    try {
      const res = await apiService.createTutor(payload)
      const finalTutor = res?.data || { id: Date.now(), ...payload }
      setTutors((prev) => [finalTutor, ...prev])
      setToast(`Faculty "${finalTutor.name || finalTutor.full_name}" (${finalTutor.staff_id}) successfully onboarded!`)
      setViewingPass(finalTutor)
      setWizardStep(1)
      setWizardForm(INITIAL_WIZARD_FORM)
      setActiveTab('directory')
    } catch (err) {
      console.warn('API onboard failed, saving locally:', err)
      const mockNew = { id: Date.now(), ...payload }
      setTutors((prev) => [mockNew, ...prev])
      setToast(`Faculty "${mockNew.name}" (${mockNew.staff_id}) saved locally!`)
      setViewingPass(mockNew)
      setWizardStep(1)
      setWizardForm(INITIAL_WIZARD_FORM)
      setActiveTab('directory')
    } finally {
      setIsSubmitting(false)
      setTimeout(() => setToast(''), 4000)
    }
  }

  // Quick Edit Save
  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editingTutor) return

    try {
      await apiService.updateTutor(editingTutor.id, editingTutor).catch(() => null)
      setTutors((prev) =>
        prev.map((t) => (t.id === editingTutor.id ? { ...t, ...editingTutor } : t))
      )
      setToast(`Tutor profile for "${editingTutor.name || editingTutor.full_name}" updated.`)
      setEditingTutor(null)
    } catch (err) {
      console.warn('API update failed:', err)
      setTutors((prev) =>
        prev.map((t) => (t.id === editingTutor.id ? { ...t, ...editingTutor } : t))
      )
      setEditingTutor(null)
    } finally {
      setTimeout(() => setToast(''), 4000)
    }
  }

  // Delete Tutor
  const handleDeleteTutor = async (tutor) => {
    if (!confirm(`Are you sure you want to remove faculty record for ${tutor.name || tutor.full_name}?`)) return
    try {
      await apiService.deleteTutor(tutor.id).catch(() => null)
      setTutors((prev) => prev.filter((t) => t.id !== tutor.id))
      setToast(`Tutor "${tutor.name || tutor.full_name}" removed.`)
    } catch {
      setTutors((prev) => prev.filter((t) => t.id !== tutor.id))
    } finally {
      setTimeout(() => setToast(''), 4000)
    }
  }

  // Filtered Directory Tutors
  const filteredTutors = useMemo(() => {
    return tutors.filter((t) => {
      const q = search.toLowerCase().trim()
      const nameStr = (t.name || t.full_name || '').toLowerCase()
      const staffIdStr = (t.staff_id || t.tutor_id || '').toLowerCase()
      const phoneStr = (t.phone || '').toLowerCase()
      const emailStr = (t.email || '').toLowerCase()
      const expertiseStr = (t.expertise || t.specialization || '').toLowerCase()
      const courseStr = (t.courses || t.assigned_track || '').toLowerCase()

      const matchesSearch =
        !q ||
        nameStr.includes(q) ||
        staffIdStr.includes(q) ||
        phoneStr.includes(q) ||
        emailStr.includes(q) ||
        expertiseStr.includes(q) ||
        courseStr.includes(q)

      const matchesDomain =
        filterDomain === 'All' ||
        expertiseStr.includes(filterDomain.toLowerCase()) ||
        courseStr.includes(filterDomain.toLowerCase())

      const matchesStatus =
        filterStatus === 'All' ||
        (t.status && t.status.toLowerCase() === filterStatus.toLowerCase()) ||
        (t.availability && t.availability.toLowerCase() === filterStatus.toLowerCase())

      const matchesRole =
        filterRole === 'All' ||
        (t.role && t.role.toLowerCase() === filterRole.toLowerCase())

      return matchesSearch && matchesDomain && matchesStatus && matchesRole
    })
  }, [tutors, search, filterDomain, filterStatus, filterRole])

  // Aggregated KPI Metrics
  const totalCount = tutors.length
  const activeCount = tutors.filter((t) => t.status === 'Active' || t.availability === 'Available').length
  const totalWeeklyHours = tutors.reduce((sum, t) => sum + (Number(t.hours) || Number(t.total_hours) || 14), 0)
  const avgRating = totalCount > 0
    ? (tutors.reduce((sum, t) => sum + (Number(t.rating) || 5.0), 0) / totalCount).toFixed(1)
    : '5.0'

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

      {/* Screen Header & Action Bar (Matching Student Master) */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-3 rounded-md shadow-xs">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-light-primary text-[18px]">co_present</span>
            <h1 className="font-title text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface">
              {activeTab === 'wizard' ? 'Faculty Onboarding Wizard' : 'Tutor Management & Allocation'}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint font-mono text-[10px] font-bold">
              {totalCount} Total
            </span>
          </div>
          <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Master faculty directory, multi-step tutor onboarding wizard, and curriculum course/module allocations.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-1.5 shrink-0">
          {activeTab === 'directory' ? (
            <button
              type="button"
              onClick={() => {
                setActiveTab('wizard')
                setWizardStep(1)
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[15px]">add</span>
              <span>Onboard Tutor</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setActiveTab('directory')}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container font-label text-xs font-semibold shadow-xs transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined text-[15px]">arrow_back</span>
              <span>Back to Faculty Directory</span>
            </button>
          )}
        </div>
      </section>

      {/* 4 Compact Metric Cards (Matching Student Master Layout) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Certified Faculty</span>
            <span className="font-headline text-[18px] font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
              {totalCount}
            </span>
          </div>
          <span className="w-7 h-7 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">co_present</span>
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Active &amp; Available</span>
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
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Weekly Teaching Load</span>
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-[18px] font-bold text-light-primary dark:text-dark-primary tabular-nums">
                {totalWeeklyHours}h
              </span>
              <span className="text-[10px] text-light-on-surface-variant font-medium">Hours / week</span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-light-secondary-container text-light-on-secondary-container inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-center justify-between">
          <div>
            <span className="font-label text-[11px] text-light-on-surface-variant block font-medium">Faculty Rating</span>
            <div className="flex items-center gap-1.5">
              <span className="font-headline text-[18px] font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                {avgRating} ★
              </span>
              <span className="text-[10px] text-on-success-container bg-success-container px-1 py-0.2 rounded font-semibold">
                Student Verified
              </span>
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-pending-container text-on-pending-container inline-flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">star</span>
          </span>
        </article>
      </section>

      {/* ===================================================================== */}
      {/* VIEW 1: TUTOR DIRECTORY (HIGH DENSITY SINGLE-ROW TABLE)              */}
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
                placeholder="Search faculty name, ID, phone, email..."
                className="w-full pl-8 pr-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <select
                value={filterDomain}
                onChange={(e) => setFilterDomain(e.target.value)}
                className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
              >
                <option value="All">All Specializations</option>
                <option value="Engineering">Engineering / Programming</option>
                <option value="Design">UI/UX &amp; Graphic Design</option>
                <option value="Marketing">Digital Marketing</option>
                <option value="Data">Data Science &amp; AI</option>
                <option value="Infrastructure">Cloud &amp; DevOps</option>
                <option value="Security">Cybersecurity</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Available">Available</option>
                <option value="Partial">Partial</option>
                <option value="On Leave">On Leave</option>
              </select>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
              >
                <option value="All">All Faculty Roles</option>
                <option value="Senior Faculty Lead">Senior Faculty Lead</option>
                <option value="Associate Tutor">Associate Tutor</option>
                <option value="Visiting Specialist">Visiting Specialist</option>
                <option value="Lab Instructor">Lab Instructor</option>
              </select>

              {(search || filterDomain !== 'All' || filterStatus !== 'All' || filterRole !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setFilterDomain('All')
                    setFilterStatus('All')
                    setFilterRole('All')
                  }}
                  className="px-2 py-1 text-xs text-light-primary hover:underline font-medium"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* High Density Table */}
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-xs overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/70 dark:bg-dark-surface-container/70 text-[11px] font-semibold text-light-on-surface-variant dark:text-dark-on-surface-variant uppercase tracking-wider">
                  <th className="py-2 px-3 whitespace-nowrap">Tutor / Faculty Lead</th>
                  <th className="py-2 px-3 whitespace-nowrap">Staff ID</th>
                  <th className="py-2 px-3 whitespace-nowrap">Contact</th>
                  <th className="py-2 px-3 whitespace-nowrap">Specialization</th>
                  <th className="py-2 px-3 whitespace-nowrap">Assigned Track</th>
                  <th className="py-2 px-3 whitespace-nowrap">Workload</th>
                  <th className="py-2 px-3 whitespace-nowrap text-center">Rating</th>
                  <th className="py-2 px-3 whitespace-nowrap text-center">Status</th>
                  <th className="py-2 px-3 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant/60 dark:divide-dark-outline-variant/60 text-xs">
                {filteredTutors.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-light-on-surface-variant">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-[32px] opacity-40">co_present</span>
                        <span className="font-semibold text-xs">No faculty records found</span>
                        <span className="text-[11px] opacity-70">Try adjusting search query or onboard a new tutor</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTutors.map((t) => {
                    const tutorName = t.name || t.full_name || 'Faculty Lead'
                    const staffId = t.staff_id || t.tutor_id || `TUT-${t.id}`
                    const initials = getInitials(tutorName)
                    const statusText = t.status || t.availability || 'Active'

                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-light-surface-container-low/50 dark:hover:bg-dark-surface-container/50 transition-colors"
                      >
                        {/* Tutor / Faculty Lead */}
                        <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-light-primary text-light-on-primary font-bold text-[10px] flex items-center justify-center shrink-0">
                              {initials}
                            </div>
                            <span className="font-body text-xs font-semibold text-light-on-surface dark:text-dark-on-surface">
                              {tutorName}
                            </span>
                          </div>
                        </td>

                        {/* Staff ID */}
                        <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                          <span className="font-mono text-xs font-bold text-light-primary dark:text-dark-primary">
                            {staffId}
                          </span>
                        </td>

                        {/* Contact */}
                        <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                          <div className="flex flex-col">
                            <span className="font-mono text-xs text-light-on-surface dark:text-dark-on-surface">
                              {t.phone || '—'}
                            </span>
                            <span className="text-[10px] text-light-on-surface-variant truncate max-w-[140px]">
                              {t.email || `${tutorName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@bixcel.edu`}
                            </span>
                          </div>
                        </td>

                        {/* Specialization */}
                        <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                          <span className="px-2 py-0.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-[11px] font-medium text-light-on-surface-variant">
                            {t.expertise || t.specialization || 'General Faculty'}
                          </span>
                        </td>

                        {/* Assigned Track */}
                        <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                          <span className="font-body text-xs text-light-on-surface dark:text-dark-on-surface">
                            {t.courses || t.assigned_track || 'Institutional Faculty'}
                          </span>
                        </td>

                        {/* Workload */}
                        <td className="py-2.5 px-3 whitespace-nowrap align-middle">
                          <span className="font-mono text-xs font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                            {t.hours || t.total_hours || 14} / {t.max_hours || 24}h
                          </span>
                        </td>

                        {/* Rating */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-center align-middle">
                          <span className="font-bold text-pending text-xs">
                            ★ {t.rating || '5.0'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-center align-middle">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              statusText === 'Active' || statusText === 'Available'
                                ? 'bg-success-container text-on-success-container'
                                : 'bg-pending-container text-on-pending-container'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                statusText === 'Active' || statusText === 'Available' ? 'bg-success' : 'bg-pending'
                              }`}
                            />
                            <span>{statusText}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-2.5 px-3 whitespace-nowrap text-right align-middle">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => setEditingTutor({ ...t })}
                              title="Edit Faculty Record"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit</span>
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedTutor(t)}
                              title="View Detailed Faculty Profile"
                              className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setViewingPass(t)}
                              title="View Faculty Credential Pass"
                              className="p-1 rounded text-light-primary hover:text-light-primary-container hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">badge</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteTutor(t)}
                              title="Delete Faculty Record"
                              className="p-1 rounded text-overdue hover:bg-overdue-container/40 transition-colors cursor-pointer"
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
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: MULTI-STEP FACULTY ONBOARDING WIZARD                          */}
      {/* ===================================================================== */}
      {activeTab === 'wizard' && (
        <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-xs p-4 flex flex-col gap-4">
          {/* Wizard Header Progress */}
          <div className="flex flex-col gap-2 border-b border-light-outline-variant dark:border-dark-outline-variant pb-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label text-[11px] text-light-primary font-bold uppercase tracking-wider">
                  Step {wizardStep} of 5
                </span>
                <h2 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                  {wizardStep === 1 && 'Personal Information & Faculty Identification'}
                  {wizardStep === 2 && 'Academic Credentials & Industry Experience'}
                  {wizardStep === 3 && (wizardCourseMode === 'standard' ? 'Course Program & Batch Allocation' : 'Custom Modular Track & Batch Allocation')}
                  {wizardStep === 4 && (wizardCourseMode === 'standard' ? 'Course Program Curriculum & Modules' : 'Module Library & Teaching Scope Allocation')}
                  {wizardStep === 5 && 'Compensation Plan, Review & Confirm Appointment'}
                </h2>
              </div>
              <span className="text-xs text-light-on-surface-variant font-medium">
                Faculty ID:{' '}
                <strong className="font-mono text-light-primary font-bold">
                  {wizardForm.staffId || `TUT-2026-0${120 + tutors.length}`}
                </strong>
              </span>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[
                { s: 1, label: '1. Personal' },
                { s: 2, label: '2. Academic' },
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
            {/* STEP 1: PERSONAL INFORMATION & IDENTIFICATION                 */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in duration-150">
                <div className="md:col-span-2">
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Faculty Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={wizardForm.fullName}
                    onChange={(e) => setWizardForm({ ...wizardForm, fullName: e.target.value })}
                    placeholder="e.g. Dr. Marcus Vance"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Custom Staff ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={wizardForm.staffId}
                    onChange={(e) => setWizardForm({ ...wizardForm, staffId: e.target.value.toUpperCase() })}
                    placeholder={`TUT-2026-0${120 + tutors.length}`}
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
                    placeholder="+91 98765 43210"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Faculty Primary Email
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
                    Identity Proof Document
                  </label>
                  <select
                    value={wizardForm.idProofType}
                    onChange={(e) => setWizardForm({ ...wizardForm, idProofType: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="National ID">National ID / Aadhar</option>
                    <option value="Passport">International Passport</option>
                    <option value="Faculty License">Academic Faculty License</option>
                    <option value="PAN Card">PAN / Tax Identification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    ID Document Number / Reference
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
                    placeholder="e.g. 104 Faculty Enclave, Knowledge Park, Bengaluru"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 2: ACADEMIC CREDENTIALS & INDUSTRY EXPERIENCE            */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in duration-150">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Highest Educational Degree *
                  </label>
                  <select
                    value={wizardForm.qualification}
                    onChange={(e) => setWizardForm({ ...wizardForm, qualification: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="Ph.D / Doctorate">Ph.D / Doctorate in Field</option>
                    <option value="M.Tech / M.S. in Computer Science">M.Tech / M.S. in Computer Science</option>
                    <option value="M.Des / Master in Design">M.Des / Master in Product Design</option>
                    <option value="B.Tech / B.E. / MCA">B.Tech / B.E. / MCA</option>
                    <option value="Industry Certified Fellow">Industry Certified Fellow</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Primary Specialization Domain *
                  </label>
                  <input
                    type="text"
                    required
                    value={wizardForm.specialization}
                    onChange={(e) => setWizardForm({ ...wizardForm, specialization: e.target.value })}
                    placeholder="e.g. Full-Stack Web Development"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Years of Industry / Teaching Exp.
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="40"
                    value={wizardForm.experienceYears}
                    onChange={(e) => setWizardForm({ ...wizardForm, experienceYears: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Alma Mater / University Name
                  </label>
                  <input
                    type="text"
                    value={wizardForm.institution}
                    onChange={(e) => setWizardForm({ ...wizardForm, institution: e.target.value })}
                    placeholder="e.g. Indian Institute of Technology / Stanford"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    min="1980"
                    max="2030"
                    value={wizardForm.passingYear}
                    onChange={(e) => setWizardForm({ ...wizardForm, passingYear: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    LinkedIn / Portfolio URL
                  </label>
                  <input
                    type="url"
                    value={wizardForm.portfolioUrl}
                    onChange={(e) => setWizardForm({ ...wizardForm, portfolioUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/faculty-profile"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Faculty Bio &amp; Pedagogical Overview
                  </label>
                  <textarea
                    rows="2"
                    value={wizardForm.bio}
                    onChange={(e) => setWizardForm({ ...wizardForm, bio: e.target.value })}
                    placeholder="Brief overview of research papers, corporate engineering experience, and mentoring style..."
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
                    onClick={() => {
                      setWizardCourseMode('standard')
                      if (coursesList.length > 0) {
                        const first = coursesList.find((c) => String(c.id) === String(selectedCourseId)) || coursesList[0]
                        setWizardTrack(first.title)
                        if (first.code) setWizardForm((prev) => ({ ...prev, batch: `${first.code}-26A` }))
                      }
                    }}
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
                      <strong className="text-xs text-light-on-surface dark:text-dark-on-surface">Course</strong>
                    </div>
                    <p className="text-[11px] text-light-on-surface-variant mt-1 pl-6">
                      Assign faculty lead to a pre-framed course program created in Course Management.
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
                      <strong className="text-xs text-light-on-surface dark:text-dark-on-surface">Custom Modular</strong>
                    </div>
                    <p className="text-[11px] text-light-on-surface-variant mt-1 pl-6">
                      Allocate faculty teaching scope across specific modules from the Module Library.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
                  {wizardCourseMode === 'standard' ? (
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                        Select Course Program *
                      </label>
                      <select
                        value={selectedCourseId}
                        onChange={(e) => handleSelectCourse(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                      >
                        {coursesList.length === 0 ? (
                          <option value="">No courses created yet in Course Management</option>
                        ) : (
                          coursesList.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title} ({c.code || `CRS-${c.id}`}) — {c.days || 0} Days • {c.category || 'General'}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  ) : (
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                        Target Course Track Domain *
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
                  )}

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
                      Faculty Designation Role
                    </label>
                    <select
                      value={wizardForm.role}
                      onChange={(e) => setWizardForm({ ...wizardForm, role: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                    >
                      <option value="Senior Faculty Lead">Senior Faculty Lead</option>
                      <option value="Associate Tutor">Associate Tutor</option>
                      <option value="Visiting Specialist">Visiting Specialist</option>
                      <option value="Lab Instructor">Lab Instructor</option>
                    </select>
                  </div>
                </div>

                {/* Course Mode Details Preview Card */}
                {wizardCourseMode === 'standard' && selectedCourse && (
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded bg-light-surface-container dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-light-primary bg-light-primary-tint/40 px-1.5 py-0.5 rounded">
                        {selectedCourse.code || `CRS-${selectedCourse.id}`}
                      </span>
                      <strong className="text-light-on-surface dark:text-dark-on-surface">
                        {selectedCourse.title}
                      </strong>
                      <span className="text-[11px] text-light-on-surface-variant">
                        • {selectedCourse.category} • {selectedCourse.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-light-primary dark:text-dark-primary">
                        {cumulativeDays} Total Days
                      </span>
                      <span className="font-bold text-light-on-surface dark:text-dark-on-surface">
                        ₹{Number(selectedCourse.price || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 4: MODULAR CURRICULUM & CHUNK SELECTION                  */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 4 && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-150">
                {/* Header Banner */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-light-surface-container-low dark:bg-dark-surface-container p-3 rounded border border-light-outline-variant dark:border-dark-outline-variant">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                        {wizardCourseMode === 'standard' ? (selectedCourse?.title || wizardTrack) : 'Frame Teaching Scope from Module Library'}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint">
                        {wizardCourseMode === 'standard' ? 'Course Mode' : 'Custom Modular'}
                      </span>
                    </div>
                    <p className="text-[11px] text-light-on-surface-variant mt-0.5">
                      {wizardCourseMode === 'standard'
                        ? 'Standard pre-framed course program curriculum and its allocated module components.'
                        : 'Select individual modules from the Module Library that this faculty member is certified to instruct.'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-label text-sm font-bold text-light-primary dark:text-dark-primary block">
                      {cumulativeDays} Teaching Days
                    </span>
                    <span className="text-[10px] text-light-on-surface-variant">
                      {wizardCourseMode === 'standard'
                        ? `${effectiveModules.length} Modules in Course`
                        : `${selectedCustomModules.length} Modules Assigned`}
                    </span>
                  </div>
                </div>

                {/* COURSE MODE: Display Course Program Modules */}
                {wizardCourseMode === 'standard' && (
                  <div className="flex flex-col gap-2">
                    {effectiveModules.length === 0 ? (
                      <div className="p-4 rounded border border-dashed border-light-outline-variant dark:border-dark-outline-variant text-center text-xs text-light-on-surface-variant">
                        No linked modules found for this course program. Total duration is set to {cumulativeDays} days.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {effectiveModules.map((mod, idx) => (
                          <div
                            key={mod.id || mod.code || idx}
                            className="p-2.5 rounded border border-light-primary/40 bg-light-primary-tint/15 dark:bg-dark-primary-tint/15 flex items-start gap-2.5"
                          >
                            <span className="material-symbols-outlined text-light-primary text-[18px] mt-0.5">
                              check_circle
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono text-[10px] text-light-primary font-bold">
                                  {mod.code || mod.id}
                                </span>
                                <span className="font-label text-[10px] font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                                  {mod.days} Days
                                </span>
                              </div>
                              <span className="font-title text-xs font-semibold text-light-on-surface dark:text-dark-on-surface block mt-0.5">
                                {mod.title}
                              </span>
                              {mod.description && (
                                <p className="text-[10px] text-light-on-surface-variant line-clamp-1 mt-0.5">
                                  {mod.description}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* CUSTOM MODULAR MODE: Module Library Browser & Selection */}
                {wizardCourseMode === 'custom' && (
                  <div className="flex flex-col gap-2.5">
                    {/* Search & Domain Filter Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant">
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <div className="relative flex items-center flex-1">
                          <span className="material-symbols-outlined text-[15px] text-light-outline absolute left-2 pointer-events-none">
                            search
                          </span>
                          <input
                            type="search"
                            value={moduleSearch}
                            onChange={(e) => setModuleSearch(e.target.value)}
                            placeholder="Search Module Library by code, title, topic..."
                            className="w-full pl-7 pr-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
                          />
                        </div>

                        <select
                          value={moduleCategoryFilter}
                          onChange={(e) => setModuleCategoryFilter(e.target.value)}
                          className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                        >
                          {moduleCategories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat === 'All' ? 'All Domains' : cat}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const ids = filteredModulesForCustom.map((m) => m.id ?? m.code)
                            setSelectedModuleIds((prev) => Array.from(new Set([...prev, ...ids])))
                          }}
                          className="px-2 py-1 text-[11px] font-semibold rounded bg-light-surface-container hover:bg-light-surface-container-high border border-light-outline-variant text-light-on-surface dark:text-dark-on-surface"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const rem = new Set(filteredModulesForCustom.map((m) => m.id ?? m.code))
                            setSelectedModuleIds((prev) => prev.filter((id) => !rem.has(id)))
                          }}
                          className="px-2 py-1 text-[11px] font-semibold rounded bg-light-surface-container hover:bg-light-surface-container-high border border-light-outline-variant text-light-on-surface-variant"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* Modules Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1">
                      {filteredModulesForCustom.length === 0 ? (
                        <div className="col-span-2 p-6 text-center text-xs text-light-on-surface-variant">
                          No modules found matching "{moduleSearch}". Try adjusting your search or domain filter.
                        </div>
                      ) : (
                        filteredModulesForCustom.map((mod) => {
                          const isChecked = selectedModuleIds.includes(mod.id) || (mod.code && selectedModuleIds.includes(mod.code))
                          return (
                            <div
                              key={mod.id || mod.code}
                              onClick={() => handleToggleModule(mod)}
                              className={`p-2.5 rounded border transition-all cursor-pointer flex items-start gap-2.5 ${
                                isChecked
                                  ? 'border-light-primary bg-light-primary-tint/25 dark:bg-dark-primary-tint/25 shadow-xs'
                                  : 'border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low hover:border-light-primary/60'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleModule(mod)}
                                className="mt-0.5 rounded text-light-primary focus:ring-0 cursor-pointer"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="font-mono text-[10px] text-light-primary font-bold">
                                      {mod.code || `MOD-${mod.id}`}
                                    </span>
                                    {mod.category && (
                                      <span className="px-1.5 py-0.2 rounded bg-light-surface-container-high text-[9px] text-light-on-surface-variant truncate">
                                        {mod.category}
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-label text-[10px] font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums shrink-0">
                                    {mod.days} Days
                                  </span>
                                </div>
                                <span className="font-title text-xs font-semibold text-light-on-surface dark:text-dark-on-surface block mt-0.5 truncate">
                                  {mod.title}
                                </span>
                                {mod.description && (
                                  <p className="text-[10px] text-light-on-surface-variant line-clamp-1 mt-0.5">
                                    {mod.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* STEP 5: COMPENSATION PLAN, REVIEW & CONFIRM                   */}
            {/* ------------------------------------------------------------- */}
            {wizardStep === 5 && (
              <div className="flex flex-col gap-3 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Compensation Model
                    </label>
                    <select
                      value={wizardForm.payModel}
                      onChange={(e) => setWizardForm({ ...wizardForm, payModel: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                    >
                      <option value="Monthly Retainer">Monthly Retainer (₹ Fixed)</option>
                      <option value="Hourly Teaching Rate">Hourly Teaching Rate (₹ / Hr)</option>
                      <option value="Per-Module Contract">Per-Module Completion (₹ Contract)</option>
                      <option value="Honorarium / Visiting">Honorarium / Visiting Specialist</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Compensation Amount (₹)
                    </label>
                    <input
                      type="number"
                      value={wizardForm.compensationAmount}
                      onChange={(e) => setWizardForm({ ...wizardForm, compensationAmount: e.target.value })}
                      placeholder="85000"
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Weekly Workload Cap (Hrs)
                    </label>
                    <input
                      type="number"
                      min="4"
                      max="40"
                      value={wizardForm.weeklyHours}
                      onChange={(e) => setWizardForm({ ...wizardForm, weeklyHours: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Initial Faculty Status
                    </label>
                    <select
                      value={wizardForm.status}
                      onChange={(e) => setWizardForm({ ...wizardForm, status: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                    >
                      <option value="Active">Active Faculty</option>
                      <option value="On Probation">On Probation</option>
                      <option value="Visiting">Visiting Faculty</option>
                      <option value="On Leave">On Leave</option>
                    </select>
                  </div>
                </div>

                {/* Final Review Summary Card */}
                <div className="p-3 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/60 dark:bg-dark-surface-container/60 flex flex-col gap-2 mt-1">
                  <div className="flex items-center justify-between">
                    <span className="font-label text-xs font-bold text-light-primary dark:text-dark-primary">
                      Faculty Appointment Verification Summary
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint">
                      {wizardCourseMode === 'standard' ? 'Course Program Lead' : 'Modular Teaching Scope'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-light-on-surface-variant block">Faculty Name:</span>
                      <strong className="text-light-on-surface dark:text-dark-on-surface truncate block">{wizardForm.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-light-on-surface-variant block">Staff ID:</span>
                      <strong className="font-mono text-light-on-surface dark:text-dark-on-surface">{wizardForm.staffId || `TUT-2026-0${120 + tutors.length}`}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-light-on-surface-variant block">Specialization / Track:</span>
                      <strong className="text-light-on-surface dark:text-dark-on-surface">{wizardTrack}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-light-on-surface-variant block">Batch / Compensation:</span>
                      <strong className="text-light-on-surface dark:text-dark-on-surface">{wizardForm.batch} • ₹{Number(wizardForm.compensationAmount || 0).toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  {/* Modules framed overview */}
                  <div className="mt-1 pt-2 border-t border-light-outline-variant/60">
                    <span className="text-[10px] font-semibold text-light-on-surface-variant block mb-1">
                      Assigned Teaching Scope ({effectiveModules.length} Modules • {cumulativeDays} Teaching Days):
                    </span>
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {effectiveModules.map((m, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-light-surface-container dark:bg-dark-surface-container text-[10px] border border-light-outline-variant"
                        >
                          <span className="font-mono text-light-primary font-bold">{m.code || `M${idx + 1}`}</span>
                          <span className="truncate max-w-[150px]">{m.title}</span>
                          <span className="font-mono font-bold text-light-on-surface-variant">({m.days}d)</span>
                        </span>
                      ))}
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
                    <span>{isSubmitting ? 'Onboarding...' : 'Confirm & Complete Tutor Onboarding'}</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 1: VIEW DETAILED TUTOR PROFILE DRAWER                           */}
      {/* ===================================================================== */}
      {selectedTutor && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-xl p-4 flex flex-col gap-3 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-light-primary text-light-on-primary font-bold text-xs flex items-center justify-center">
                  {getInitials(selectedTutor.name || selectedTutor.full_name)}
                </div>
                <div>
                  <h3 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                    {selectedTutor.name || selectedTutor.full_name}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-light-on-surface-variant font-mono">
                    <span>{selectedTutor.staff_id || selectedTutor.tutor_id}</span>
                    <span>•</span>
                    <span className="text-light-primary font-semibold">{selectedTutor.expertise || selectedTutor.specialization || selectedTutor.role}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTutor(null)}
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
                    <strong className="text-light-on-surface dark:text-dark-on-surface font-mono">{selectedTutor.phone || '+91 98765 43210'}</strong>
                  </div>
                  <div>
                    <span className="text-light-on-surface-variant block">Email:</span>
                    <strong className="text-light-on-surface dark:text-dark-on-surface truncate block">{selectedTutor.email}</strong>
                  </div>
                  <div>
                    <span className="text-light-on-surface-variant block">Faculty Rating:</span>
                    <strong className="text-pending font-bold">★ {selectedTutor.rating || '5.0'} / 5.0</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-light-on-surface-variant block">Residential Address:</span>
                    <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedTutor.address || 'Academic Faculty Quarter, Bengaluru'}</strong>
                  </div>
                  <div>
                    <span className="text-light-on-surface-variant block">Workload Cap:</span>
                    <strong className="text-light-on-surface dark:text-dark-on-surface font-mono">{selectedTutor.hours || 14} / {selectedTutor.max_hours || 24}h weekly</strong>
                  </div>
                </div>
              </div>

              {/* Academic & Professional Credentials */}
              <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex flex-col gap-1.5">
                <span className="font-label text-[10px] font-bold uppercase tracking-wider text-light-primary">
                  Academic Credentials &amp; Industry Background
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-light-on-surface-variant block">Degree:</span>
                    <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedTutor.qualification || 'M.Tech Computer Science'}</strong>
                  </div>
                  <div>
                    <span className="text-light-on-surface-variant block">Specialization:</span>
                    <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedTutor.specialization || selectedTutor.expertise || 'Engineering'}</strong>
                  </div>
                  <div>
                    <span className="text-light-on-surface-variant block">Experience:</span>
                    <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedTutor.experience_years || '8'} Years</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-light-on-surface-variant block">Alma Mater:</span>
                    <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedTutor.institution || 'State Accredited University'}</strong>
                  </div>
                  <div>
                    <span className="text-light-on-surface-variant block">Status:</span>
                    <strong className="text-success font-bold">{selectedTutor.status || selectedTutor.availability || 'Active'}</strong>
                  </div>
                </div>
              </div>

              {/* Assigned Course & Curriculum Scope */}
              <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-label text-[10px] font-bold uppercase tracking-wider text-light-primary">
                    Teaching Scope: {selectedTutor.courses || selectedTutor.assigned_track || 'Institutional Curriculum'}
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint font-mono text-[10px] font-bold">
                    Batch: {Array.isArray(selectedTutor.assigned_batches) ? selectedTutor.assigned_batches.join(', ') : (selectedTutor.batch || 'BIX-2026-A')}
                  </span>
                </div>
                {selectedTutor.module_chunks && selectedTutor.module_chunks.length > 0 ? (
                  <ul className="space-y-1 text-[11px] text-light-on-surface dark:text-dark-on-surface">
                    {selectedTutor.module_chunks.map((m, i) => (
                      <li key={i} className="flex items-center justify-between py-0.5 border-b border-light-outline-variant/40 last:border-0">
                        <span>• {m.title}</span>
                        <span className="font-mono text-[10px] text-light-on-surface-variant font-bold">{m.days} Days</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-light-on-surface-variant">
                    Assigned to lead instruction for the full syllabus of {selectedTutor.courses || selectedTutor.assigned_track || 'Track'}.
                  </p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-light-outline-variant dark:border-dark-outline-variant pt-2.5 mt-1">
              <button
                type="button"
                onClick={() => {
                  setViewingPass(selectedTutor)
                  setSelectedTutor(null)
                }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded bg-light-primary-tint text-light-on-primary-tint text-xs font-semibold hover:bg-light-primary-tint/80"
              >
                <span className="material-symbols-outlined text-[15px]">badge</span>
                <span>View Faculty Credential Pass</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTutor(null)}
                className="px-3 py-1 rounded bg-light-surface-container-low text-xs font-semibold hover:bg-light-surface-container"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: EDIT TUTOR PROFILE                                           */}
      {/* ===================================================================== */}
      {editingTutor && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-lg p-4 flex flex-col gap-3 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2">
              <h3 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                Edit Faculty Profile: {editingTutor.name || editingTutor.full_name}
              </h3>
              <button type="button" onClick={() => setEditingTutor(null)} className="p-1 rounded text-light-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Faculty Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTutor.name || editingTutor.full_name || ''}
                    onChange={(e) => setEditingTutor({ ...editingTutor, name: e.target.value, full_name: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={editingTutor.phone || ''}
                    onChange={(e) => setEditingTutor({ ...editingTutor, phone: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editingTutor.email || ''}
                    onChange={(e) => setEditingTutor({ ...editingTutor, email: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Specialization Domain
                  </label>
                  <input
                    type="text"
                    value={editingTutor.expertise || editingTutor.specialization || ''}
                    onChange={(e) => setEditingTutor({ ...editingTutor, expertise: e.target.value, specialization: e.target.value })}
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
                    value={editingTutor.status || editingTutor.availability || 'Active'}
                    onChange={(e) => setEditingTutor({ ...editingTutor, status: e.target.value, availability: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  >
                    <option value="Active">Active</option>
                    <option value="Available">Available</option>
                    <option value="Partial">Partial</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Weekly Hours
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="40"
                    value={editingTutor.hours || editingTutor.total_hours || 14}
                    onChange={(e) => setEditingTutor({ ...editingTutor, hours: Number(e.target.value), total_hours: Number(e.target.value) })}
                    className="w-full px-2 py-1 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                    Rating (★)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={editingTutor.rating || 5.0}
                    onChange={(e) => setEditingTutor({ ...editingTutor, rating: Number(e.target.value) })}
                    className="w-full px-2 py-1 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-0.5">
                  Assigned Track / Course Program
                </label>
                <input
                  type="text"
                  value={editingTutor.courses || editingTutor.assigned_track || ''}
                  onChange={(e) => setEditingTutor({ ...editingTutor, courses: e.target.value, assigned_track: e.target.value })}
                  className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-light-outline-variant dark:border-dark-outline-variant pt-2 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingTutor(null)}
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
      {/* MODAL 3: FACULTY CREDENTIAL PASS / ID BADGE                          */}
      {/* ===================================================================== */}
      {viewingPass && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-md p-4 flex flex-col gap-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2">
              <span className="font-label text-xs font-bold text-light-primary">
                Official Faculty Credential Pass
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
                    {getInitials(viewingPass.name || viewingPass.full_name)}
                  </div>
                  <div>
                    <h4 className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                      {viewingPass.name || viewingPass.full_name}
                    </h4>
                    <span className="font-mono text-[10px] text-light-primary font-bold">
                      {viewingPass.staff_id || viewingPass.tutor_id}
                    </span>
                  </div>
                </div>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-success-container text-on-success-container">
                  FACULTY VERIFIED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block">Designation:</span>
                  <strong className="text-light-on-surface dark:text-dark-on-surface">{viewingPass.role || 'Senior Faculty Lead'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block">Specialization:</span>
                  <strong className="text-light-on-surface dark:text-dark-on-surface">{viewingPass.expertise || viewingPass.specialization || 'Engineering'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block">Assigned Track:</span>
                  <strong className="text-light-on-surface dark:text-dark-on-surface">{viewingPass.courses || viewingPass.assigned_track || 'Institutional'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block">Workload / Cap:</span>
                  <strong className="text-light-on-surface dark:text-dark-on-surface">{viewingPass.hours || 14} / {viewingPass.max_hours || 24}h weekly</strong>
                </div>
              </div>

              {/* Barcode Mock Visual */}
              <div className="flex flex-col items-center justify-center pt-2 border-t border-light-outline-variant/60 gap-1">
                <div className="font-mono text-[10px] tracking-widest text-light-on-surface dark:text-dark-on-surface font-bold">
                  ||| | |||| | ||| |||| | || |||
                </div>
                <span className="font-mono text-[9px] text-light-on-surface-variant">
                  SECURE FACULTY AUTHENTICATION CODE
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 px-3 py-1 rounded border border-light-outline-variant text-xs hover:bg-light-surface-container-low"
              >
                <span className="material-symbols-outlined text-[14px]">print</span>
                <span>Print Pass</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingPass(null)}
                className="px-3 py-1 rounded bg-light-primary text-light-on-primary text-xs font-semibold hover:bg-light-primary-container"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TutorManagement
