import React, { useState, useEffect, useMemo } from 'react'
import { apiService } from '../../services/api'

// Fallback initial sample milestones
const FALLBACK_MILESTONES = [
  {
    id: 1,
    milestone_uid: 'MLS-2026-001',
    title: 'Production CI/CD Pipeline & Kubernetes Microservices Deployment',
    skill_domain: 'Cloud Architecture & DevOps',
    category: 'Live Production Deployment',
    track: 'Cloud Computing & DevOps',
    batch_code: 'BIX-CLD-26C',
    description: 'Deploy a multi-tier microservice architecture to an AWS EKS / GKE cluster with automated GitHub Actions CI/CD pipelines, SSL termination, and Grafana telemetry.',
    target_date: '2026-12-15',
    required_evidence: 'Production HTTPS Cluster URL, GitHub Actions YAML, Helm Charts & Grafana Dashboard Screenshot',
    status: 'In Progress',
    evaluator: 'Sarah Jenkins, Lead Cloud Architect',
    student_progress: [
      { student_id: 'STU-2026-0843', full_name: 'Marcus Vance', evidence_url: 'https://github.com/marcusvance/k8s-production-mesh', status: 'Cleared', score: 96, submission_date: '2026-11-26', verification_notes: 'Flawless ArgoCD GitOps pipeline and Helm chart structure.' },
      { student_id: 'STU-2026-0844', full_name: 'Priya Sharma', evidence_url: 'https://github.com/priyasharma/cloud-telemetry-infra', status: 'Cleared', score: 92, submission_date: '2026-11-26', verification_notes: 'Well instrumented Prometheus & Grafana alerts.' },
      { student_id: 'STU-2026-0845', full_name: 'David Kim', evidence_url: 'https://github.com/davidkim/eks-ingress-controller', status: 'Submitted', score: null, submission_date: '2026-11-27', verification_notes: 'Under review by evaluator.' },
      { student_id: 'STU-2026-0846', full_name: 'Ananya Verma', evidence_url: 'https://github.com/ananyaverma/docker-microservices-ci', status: 'Submitted', score: null, submission_date: '2026-11-27', verification_notes: 'Under review by evaluator.' },
      { student_id: 'STU-2026-0847', full_name: 'Rohan Mehta', evidence_url: '', status: 'In Progress', score: null, submission_date: null, verification_notes: 'Configuring ingress rules and ingress TLS secrets.' },
      { student_id: 'STU-2026-0848', full_name: 'Sophia Patel', evidence_url: '', status: 'In Progress', score: null, submission_date: null, verification_notes: 'Debugging GitHub Actions runners.' },
    ],
  },
  {
    id: 2,
    milestone_uid: 'MLS-2026-002',
    title: 'Design System Token Engine & Accessible WCAG AAA Component Kit',
    skill_domain: 'UI/UX & Design Systems',
    category: 'Capstone Project',
    track: 'UI/UX Product Design',
    batch_code: 'BIX-UX-26D',
    description: 'Construct a scalable multi-brand tokenized design architecture in Figma with Storybook component mappings and zero WCAG accessibility violations.',
    target_date: '2026-11-20',
    required_evidence: 'Figma Community Token Library URL, Interactive Storybook Playground, WCAG AAA Axe Audit Report',
    status: 'Completed',
    evaluator: 'Alena Rostova, Head of Design',
    student_progress: [
      { student_id: 'STU-2026-0849', full_name: 'Alena Rostova', evidence_url: 'https://figma.com/@alenarostova/design-system-tokens', status: 'Cleared', score: 98, submission_date: '2026-11-19', verification_notes: 'Exemplary design token architecture and documentation.' },
      { student_id: 'STU-2026-0850', full_name: 'Karthik Rao', evidence_url: 'https://storybook.karthikrao.design', status: 'Cleared', score: 92, submission_date: '2026-11-20', verification_notes: 'Clean interactive variants and keyboard navigation.' },
      { student_id: 'STU-2026-0851', full_name: 'Sneha Kulkarni', evidence_url: 'https://figma.com/@snehak/accessible-ui-kit', status: 'Cleared', score: 88, submission_date: '2026-11-20', verification_notes: 'All AAA contrast tests successfully validated.' },
      { student_id: 'STU-2026-0852', full_name: 'Liam Chen', evidence_url: 'https://github.com/liamchen/tokens-transformer', status: 'Cleared', score: 94, submission_date: '2026-11-19', verification_notes: 'Great Style Dictionary build script integration.' },
    ],
  },
  {
    id: 3,
    milestone_uid: 'MLS-2026-003',
    title: 'Enterprise RBAC & Zero-Trust Authentication Gateway',
    skill_domain: 'Full-Stack Engineering',
    category: 'Architecture Defense',
    track: 'Full-Stack Web Development',
    batch_code: 'BIX-DEV-24A',
    description: 'Design and defend an enterprise authentication perimeter utilizing asymmetric JWT rotation, Redis session blacklisting, rate-limited reverse proxies, and MFA.',
    target_date: '2026-12-28',
    required_evidence: 'GitHub Repo with Docker Compose, Swagger OpenAPI Specs, 5-Minute Video Architecture Defense',
    status: 'Draft',
    evaluator: 'Dr. Arvind Swaminathan',
    student_progress: [],
  },
]

export function MilestoneManagement() {
  const [milestones, setMilestones] = useState([])
  const [batchesList, setBatchesList] = useState([])
  const [studentsList, setStudentsList] = useState([])
  const [toast, setToast] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [selectedBatch, setSelectedBatch] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All') // 'All' | 'Draft' | 'In Progress' | 'Completed'
  const [selectedDomain, setSelectedDomain] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [evaluatingMilestone, setEvaluatingMilestone] = useState(null)
  const [viewingMilestone, setViewingMilestone] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [newMilestoneForm, setNewMilestoneForm] = useState({
    title: '',
    skill_domain: 'Full-Stack Engineering',
    category: 'Capstone Project',
    batch_code: 'BIX-DEV-24A',
    track: 'Full-Stack Web Development',
    description: '',
    target_date: '2026-12-30',
    required_evidence: 'GitHub Repository URL, Production HTTPS Demo & Architecture Documentation',
    evaluator: 'Dr. Arvind Swaminathan',
    status: 'Draft',
  })

  // Load Data
  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [mlsRes, batchRes, stuRes] = await Promise.allSettled([
          apiService.getMilestones(),
          apiService.getBatches ? apiService.getBatches() : Promise.resolve([]),
          apiService.getStudents ? apiService.getStudents() : Promise.resolve([]),
        ])

        if (!isMounted) return

        if (mlsRes.status === 'fulfilled' && mlsRes.value && mlsRes.value.data) {
          const list = Array.isArray(mlsRes.value.data) ? mlsRes.value.data : []
          if (list.length > 0) {
            setMilestones(list)
          } else {
            setMilestones(FALLBACK_MILESTONES)
          }
        } else {
          setMilestones(FALLBACK_MILESTONES)
        }

        if (batchRes.status === 'fulfilled' && batchRes.value) {
          const bList = Array.isArray(batchRes.value) ? batchRes.value : (batchRes.value.data || [])
          setBatchesList(bList)
        }

        if (stuRes.status === 'fulfilled' && stuRes.value) {
          const sList = Array.isArray(stuRes.value) ? stuRes.value : (stuRes.value.data || [])
          setStudentsList(sList)
        }
      } catch (e) {
        console.error('Failed to load milestones:', e)
        if (isMounted) setMilestones(FALLBACK_MILESTONES)
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
    const total = milestones.length
    const inProgress = milestones.filter((m) => m.status === 'In Progress').length
    const completed = milestones.filter((m) => m.status === 'Completed').length
    const drafts = milestones.filter((m) => m.status === 'Draft').length

    let totalStudentsAssigned = 0
    let clearedStudents = 0

    milestones.forEach((m) => {
      if (Array.isArray(m.student_progress)) {
        m.student_progress.forEach((s) => {
          totalStudentsAssigned++
          if (s.status === 'Cleared') {
            clearedStudents++
          }
        })
      }
    })

    const clearanceRate =
      totalStudentsAssigned > 0
        ? Math.round((clearedStudents / totalStudentsAssigned) * 100)
        : 88

    return { total, inProgress, completed, drafts, totalStudentsAssigned, clearedStudents, clearanceRate }
  }, [milestones])

  // Filtered List
  const filteredMilestones = useMemo(() => {
    return milestones.filter((item) => {
      const matchBatch = selectedBatch === 'All' || item.batch_code === selectedBatch
      const matchStatus = selectedStatus === 'All' || item.status === selectedStatus
      const matchDomain = selectedDomain === 'All' || item.skill_domain === selectedDomain
      const matchSearch =
        !searchQuery.trim() ||
        (item.title && item.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.milestone_uid && item.milestone_uid.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.batch_code && item.batch_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.evaluator && item.evaluator.toLowerCase().includes(searchQuery.toLowerCase()))
      return matchBatch && matchStatus && matchDomain && matchSearch
    })
  }, [milestones, selectedBatch, selectedStatus, selectedDomain, searchQuery])

  // Distinct batch options
  const batchOptions = useMemo(() => {
    const set = new Set(['BIX-DEV-24A', 'BIX-UX-26D', 'BIX-CLD-26C', 'BIX-MKT-26B'])
    milestones.forEach((m) => m.batch_code && set.add(m.batch_code))
    batchesList.forEach((b) => (b.batch_code || b.name) && set.add(b.batch_code || b.name))
    return Array.from(set)
  }, [milestones, batchesList])

  // Get enrolled students for a batch
  const getBatchStudents = (batchCode) => {
    const matched = studentsList.filter((s) => {
      const b = s.batch_code || s.cohort || s.batch
      return b && b.toLowerCase() === batchCode.toLowerCase()
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
  // STAGE 1: CREATE MILESTONE
  // =========================================================================
  const handleCreateMilestone = async (e) => {
    e.preventDefault()
    if (!newMilestoneForm.title.trim()) {
      alert('Please enter a milestone title.')
      return
    }

    setIsSubmitting(true)
    const uid = 'MLS-2026-' + Math.floor(100 + Math.random() * 900)
    const payload = {
      ...newMilestoneForm,
      milestone_uid: uid,
      student_progress: [],
    }

    try {
      const res = await apiService.createMilestone(payload)
      const createdItem = res && res.data ? res.data : { ...payload, id: Date.now() }
      setMilestones((prev) => [createdItem, ...prev])
      showNotification(`Competency Milestone "${payload.title}" created successfully!`)
      setShowCreateModal(false)
      setNewMilestoneForm({
        title: '',
        skill_domain: 'Full-Stack Engineering',
        category: 'Capstone Project',
        batch_code: 'BIX-DEV-24A',
        track: 'Full-Stack Web Development',
        description: '',
        target_date: '2026-12-30',
        required_evidence: 'GitHub Repository URL, Production HTTPS Demo & Architecture Documentation',
        evaluator: 'Dr. Arvind Swaminathan',
        status: 'Draft',
      })
    } catch (err) {
      console.warn('API create milestone failed, adding locally:', err)
      const fallbackItem = { ...payload, id: Date.now() }
      setMilestones((prev) => [fallbackItem, ...prev])
      showNotification(`Milestone created locally as draft.`)
      setShowCreateModal(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  // =========================================================================
  // STAGE 2: SEND TO STUDENTS (ASSIGN & ACTIVATE MILESTONE)
  // =========================================================================
  const handleSendToStudents = async (milestone) => {
    const batchStudents = getBatchStudents(milestone.batch_code)
    const assignedStudents = batchStudents.map((s, idx) => {
      const slug = (s.full_name || 'student').toLowerCase().replace(/[^a-z0-9]/g, '')
      return {
        student_id: s.student_id || `STU-2026-08${40 + idx}`,
        full_name: s.full_name || s.name || `Student ${idx + 1}`,
        evidence_url: `https://github.com/bixcel-${slug}/capstone-deliverable`,
        status: 'In Progress', // In Progress | Submitted | Cleared | Needs Revision
        score: null,
        submission_date: null,
        verification_notes: 'Requirements dispatched. Candidate building deliverable.',
      }
    })

    const updatedMilestone = {
      ...milestone,
      status: 'In Progress',
      student_progress: assignedStudents,
    }

    try {
      await apiService.updateMilestone(milestone.id, updatedMilestone)
      setMilestones((prev) => prev.map((item) => (item.id === milestone.id ? updatedMilestone : item)))
      showNotification(
        `Milestone requirements assigned & dispatched to ${assignedStudents.length} students in ${milestone.batch_code}!`
      )
    } catch (err) {
      console.warn('API update failed, updating locally:', err)
      setMilestones((prev) => prev.map((item) => (item.id === milestone.id ? updatedMilestone : item)))
      showNotification(
        `Assigned to ${assignedStudents.length} students in ${milestone.batch_code} (local mode).`
      )
    }
  }

  // =========================================================================
  // STAGE 3: COMPLETE IT (VERIFY EVIDENCE, SIGN OFF & CERTIFY)
  // =========================================================================
  const openVerificationModal = (milestone) => {
    let currentProgress = Array.isArray(milestone.student_progress) && milestone.student_progress.length > 0
      ? [...milestone.student_progress]
      : []

    if (currentProgress.length === 0) {
      const batchStudents = getBatchStudents(milestone.batch_code)
      currentProgress = batchStudents.map((s, idx) => {
        const slug = (s.full_name || 'student').toLowerCase().replace(/[^a-z0-9]/g, '')
        return {
          student_id: s.student_id || `STU-2026-08${40 + idx}`,
          full_name: s.full_name || s.name || `Student ${idx + 1}`,
          evidence_url: `https://github.com/bixcel-${slug}/production-capstone`,
          status: 'Submitted',
          score: null,
          submission_date: new Date().toISOString().split('T')[0],
          verification_notes: 'Evidence submitted for faculty evaluation.',
        }
      })
    }

    setEvaluatingMilestone({
      ...milestone,
      student_progress: currentProgress,
    })
  }

  const handleStudentStatusChange = (idx, statusVal) => {
    if (!evaluatingMilestone) return
    const updated = [...evaluatingMilestone.student_progress]
    const current = updated[idx]
    let newScore = current.score
    if (statusVal === 'Cleared' && (!newScore || newScore < 80)) {
      newScore = 90
    }

    updated[idx] = {
      ...current,
      status: statusVal,
      score: statusVal === 'Cleared' ? newScore : current.score,
      submission_date: current.submission_date || new Date().toISOString().split('T')[0],
      verification_notes:
        statusVal === 'Cleared'
          ? 'Competency criteria verified and certified.'
          : statusVal === 'Needs Revision'
          ? 'Requires revision on architecture security guidelines.'
          : current.verification_notes,
    }
    setEvaluatingMilestone({ ...evaluatingMilestone, student_progress: updated })
  }

  const handleStudentScoreChange = (idx, scoreVal) => {
    if (!evaluatingMilestone) return
    const updated = [...evaluatingMilestone.student_progress]
    const score = scoreVal === '' ? null : Math.min(100, Math.max(0, Number(scoreVal)))
    updated[idx] = { ...updated[idx], score }
    setEvaluatingMilestone({ ...evaluatingMilestone, student_progress: updated })
  }

  const handleStudentEvidenceChange = (idx, evidenceVal) => {
    if (!evaluatingMilestone) return
    const updated = [...evaluatingMilestone.student_progress]
    updated[idx] = { ...updated[idx], evidence_url: evidenceVal }
    setEvaluatingMilestone({ ...evaluatingMilestone, student_progress: updated })
  }

  const handleStudentNoteChange = (idx, noteVal) => {
    if (!evaluatingMilestone) return
    const updated = [...evaluatingMilestone.student_progress]
    updated[idx] = { ...updated[idx], verification_notes: noteVal }
    setEvaluatingMilestone({ ...evaluatingMilestone, student_progress: updated })
  }

  // Quick helper: mark all students cleared with sample scores
  const handleMarkAllCleared = () => {
    if (!evaluatingMilestone) return
    const sampleScores = [96, 92, 88, 94, 91, 89]
    const updated = evaluatingMilestone.student_progress.map((st, i) => ({
      ...st,
      status: 'Cleared',
      score: sampleScores[i % sampleScores.length],
      submission_date: st.submission_date || new Date().toISOString().split('T')[0],
      verification_notes: 'All competency deliverables validated and signed off by lead evaluator.',
    }))
    setEvaluatingMilestone({ ...evaluatingMilestone, student_progress: updated })
  }

  // Finalize & Sign Off Milestone
  const handleCompleteMilestoneAndCertify = async () => {
    if (!evaluatingMilestone) return
    setIsSubmitting(true)

    const finalMilestone = {
      ...evaluatingMilestone,
      status: 'Completed',
    }

    try {
      await apiService.updateMilestone(finalMilestone.id, finalMilestone)
      setMilestones((prev) => prev.map((item) => (item.id === finalMilestone.id ? finalMilestone : item)))
      showNotification(`Milestone marked Completed and certified for ${finalMilestone.batch_code}!`)
      setEvaluatingMilestone(null)
    } catch (err) {
      console.warn('API update failed, updating state locally:', err)
      setMilestones((prev) => prev.map((item) => (item.id === finalMilestone.id ? finalMilestone : item)))
      showNotification(`Milestone completed & certified (saved locally).`)
      setEvaluatingMilestone(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete Milestone
  const handleDeleteMilestone = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete milestone "${title}"?`)) return
    try {
      await apiService.deleteMilestone(id)
      setMilestones((prev) => prev.filter((item) => item.id !== id))
      showNotification(`Milestone deleted successfully.`)
    } catch (e) {
      console.warn('API delete failed, removing locally:', e)
      setMilestones((prev) => prev.filter((item) => item.id !== id))
      showNotification(`Milestone removed.`)
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
              <span className="material-symbols-outlined text-[20px]">flag</span>
            </span>
            <h1 className="font-title text-[18px] font-bold text-light-on-surface dark:text-dark-on-surface">
              Competency Milestones
            </h1>
          </div>
          <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1">
            Define industry-ready capstone milestones, assign deliverables to cohorts, verify student evidence, and sign off certifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary font-label text-xs font-semibold shadow-xs hover:bg-light-primary-container transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Define New Milestone</span>
          </button>
        </div>
      </section>

      {/* 4 KPI Cards Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Total Milestones
            </span>
            <span className="w-6 h-6 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 inline-flex items-center justify-center text-xs">
              <span className="material-symbols-outlined text-[15px]">flag</span>
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
              Active / In Progress
            </span>
            <span className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 inline-flex items-center justify-center text-xs">
              <span className="material-symbols-outlined text-[15px]">pending_actions</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-2xl font-bold tabular-nums text-light-on-surface dark:text-dark-on-surface">
              {kpis.inProgress}
            </span>
            <span className="font-label text-[11px] text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded font-semibold">
              Assigned to Cohorts
            </span>
          </div>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Completed & Certified
            </span>
            <span className="w-6 h-6 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 inline-flex items-center justify-center text-xs">
              <span className="material-symbols-outlined text-[15px]">military_tech</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-2xl font-bold tabular-nums text-light-on-surface dark:text-dark-on-surface">
              {kpis.completed}
            </span>
            <span className="font-label text-[11px] text-green-600 bg-green-50 dark:bg-green-900/30 px-1.5 py-0.5 rounded font-semibold">
              Signed Off
            </span>
          </div>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Competency Clearance
            </span>
            <span className="w-6 h-6 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 inline-flex items-center justify-center text-xs">
              <span className="material-symbols-outlined text-[15px]">verified_user</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-2xl font-bold tabular-nums text-light-on-surface dark:text-dark-on-surface">
              {kpis.clearanceRate}%
            </span>
            <span className="font-label text-[11px] text-amber-700 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded font-semibold">
              {kpis.clearedStudents} Certified
            </span>
          </div>
        </article>
      </section>

      {/* Filter and Search Bar */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-3 rounded-md shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Tabs */}
          <div className="flex items-center border border-light-outline-variant dark:border-dark-outline-variant rounded p-0.5 bg-light-surface-container-low dark:bg-dark-surface-container text-xs">
            {['All', 'Draft', 'In Progress', 'Completed'].map((st) => (
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

          {/* Domain Selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-light-on-surface-variant font-medium">Domain:</span>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="px-2.5 py-1 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-light-primary"
            >
              <option value="All">All Domains</option>
              <option value="Cloud Architecture & DevOps">Cloud Architecture & DevOps</option>
              <option value="Full-Stack Engineering">Full-Stack Engineering</option>
              <option value="UI/UX & Design Systems">UI/UX & Design Systems</option>
              <option value="Data Science & AI">Data Science & AI</option>
              <option value="Cyber Security">Cyber Security</option>
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
            placeholder="Search milestone, category, evaluator..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
          />
        </div>
      </section>

      {/* Main Milestones Table */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-light-surface-container-low dark:bg-dark-surface-container border-b border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant font-semibold">
                <th className="px-4 py-2.5">Milestone & Category</th>
                <th className="px-3 py-2.5">Batch & Domain</th>
                <th className="px-3 py-2.5">Target & Required Evidence</th>
                <th className="px-3 py-2.5">Candidate Progress</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-4 py-2.5 text-right">3-Stage Lifecycle Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-outline-variant/60 dark:divide-dark-outline-variant/60 font-body">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-light-on-surface-variant">
                    <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                    <p className="mt-1">Loading competency milestones...</p>
                  </td>
                </tr>
              ) : filteredMilestones.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-light-on-surface-variant">
                    <span className="material-symbols-outlined text-[32px] text-light-outline">flag</span>
                    <p className="mt-1 font-medium">No milestones found matching your filter criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredMilestones.map((mls) => {
                  const studentList = Array.isArray(mls.student_progress) ? mls.student_progress : []
                  const clearedCount = studentList.filter((s) => s.status === 'Cleared').length
                  const submittedCount = studentList.filter((s) => s.status === 'Submitted' || s.status === 'Cleared').length

                  return (
                    <tr
                      key={mls.id}
                      className="hover:bg-light-surface-container-low/50 dark:hover:bg-dark-surface-container/50 transition-colors"
                    >
                      {/* Milestone Title & Category */}
                      <td className="px-4 py-3 align-top max-w-[280px]">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-light-primary dark:text-dark-primary bg-light-primary-tint/60 dark:bg-dark-primary-tint/40 px-1.5 py-0.5 rounded">
                            {mls.milestone_uid || `MLS-${mls.id}`}
                          </span>
                          <span className="text-[11px] text-light-on-surface-variant border border-light-outline-variant dark:border-dark-outline-variant px-1.5 py-0.5 rounded font-medium">
                            {mls.category || 'Capstone Project'}
                          </span>
                        </div>
                        <h3 className="font-title text-[13px] font-semibold text-light-on-surface dark:text-dark-on-surface mt-1 line-clamp-2">
                          {mls.title}
                        </h3>
                        <p className="font-body text-[11px] text-light-on-surface-variant mt-0.5 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">verified_user</span>
                          <span>Evaluator: {mls.evaluator || 'Faculty Lead'}</span>
                        </p>
                      </td>

                      {/* Batch & Domain */}
                      <td className="px-3 py-3 align-top whitespace-nowrap">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                          {mls.batch_code}
                        </span>
                        <div className="text-[11px] text-light-on-surface-variant mt-1 max-w-[150px] truncate">
                          {mls.skill_domain || mls.track}
                        </div>
                      </td>

                      {/* Target & Required Evidence */}
                      <td className="px-3 py-3 align-top max-w-[220px]">
                        <div className="flex items-center gap-1 text-xs font-semibold text-light-on-surface dark:text-dark-on-surface">
                          <span className="material-symbols-outlined text-[14px] text-light-primary">calendar_clock</span>
                          <span>Target: {mls.target_date || '2026-12-30'}</span>
                        </div>
                        <div className="text-[11px] text-light-outline mt-1 line-clamp-2 font-mono">
                          {mls.required_evidence || 'GitHub Repo, Docker container & live demo URL'}
                        </div>
                      </td>

                      {/* Candidate Progress */}
                      <td className="px-3 py-3 align-top whitespace-nowrap">
                        <div className="text-xs">
                          {studentList.length > 0 ? (
                            <>
                              <span className="font-bold text-light-on-surface dark:text-dark-on-surface">
                                {clearedCount}/{studentList.length}
                              </span>{' '}
                              <span className="text-green-600 font-semibold">Cleared</span>
                              <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1.5 overflow-hidden">
                                <div
                                  className="bg-green-600 h-1.5 rounded-full"
                                  style={{ width: `${studentList.length > 0 ? (clearedCount / studentList.length) * 100 : 0}%` }}
                                ></div>
                              </div>
                              <span className="text-[10px] text-light-outline mt-0.5 block">
                                {submittedCount} submissions in review
                              </span>
                            </>
                          ) : (
                            <span className="italic text-light-outline">No candidates assigned</span>
                          )}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-3 py-3 align-top whitespace-nowrap">
                        {mls.status === 'Draft' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                            Draft
                          </span>
                        )}
                        {mls.status === 'In Progress' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                            In Progress / Active
                          </span>
                        )}
                        {mls.status === 'Completed' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300">
                            <span className="material-symbols-outlined text-[13px]">military_tech</span>
                            Certified & Completed
                          </span>
                        )}
                      </td>

                      {/* 3-Stage Lifecycle Actions */}
                      <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* STAGE 2: SEND TO STUDENTS */}
                          {mls.status === 'Draft' ? (
                            <button
                              type="button"
                              onClick={() => handleSendToStudents(mls)}
                              title="Assign Milestone & Notify Batch Students"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#2B1B54] text-white hover:bg-[#3b2575] font-label text-[11px] font-semibold shadow-xs transition-colors"
                            >
                              <span className="material-symbols-outlined text-[14px]">send</span>
                              <span>Send to Students</span>
                            </button>
                          ) : (
                            /* STAGE 3: EVALUATE & COMPLETE */
                            <button
                              type="button"
                              onClick={() => openVerificationModal(mls)}
                              title={mls.status === 'Completed' ? 'Review Milestone Evidence' : 'Verify Deliverables & Sign Off'}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded font-label text-[11px] font-semibold shadow-xs transition-colors ${
                                mls.status === 'Completed'
                                  ? 'bg-green-700 text-white hover:bg-green-800'
                                  : 'bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary hover:bg-light-primary-container'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {mls.status === 'Completed' ? 'verified' : 'fact_check'}
                              </span>
                              <span>{mls.status === 'Completed' ? 'Review Evidence' : 'Complete It'}</span>
                            </button>
                          )}

                          {/* View Details */}
                          <button
                            type="button"
                            onClick={() => setViewingMilestone(mls)}
                            title="View Milestone Details"
                            className="p-1 rounded text-light-on-surface-variant hover:bg-light-surface-container-low transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>

                          {/* Delete Milestone */}
                          <button
                            type="button"
                            onClick={() => handleDeleteMilestone(mls.id, mls.title)}
                            title="Delete Milestone"
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
      {/* MODAL 1: CREATE MILESTONE                                                 */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-5 py-4 border-b border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary inline-flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">flag</span>
                </span>
                <h2 className="font-title text-base font-bold text-light-on-surface dark:text-dark-on-surface">
                  Define Competency Milestone
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

            <form onSubmit={handleCreateMilestone} className="p-5 flex flex-col gap-3.5 text-xs">
              <div>
                <label className="block font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Milestone Title <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newMilestoneForm.title}
                  onChange={(e) => setNewMilestoneForm({ ...newMilestoneForm, title: e.target.value })}
                  placeholder="e.g. Zero-Downtime Microservice Mesh & Automated Canaries"
                  className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Skill Domain
                  </label>
                  <select
                    value={newMilestoneForm.skill_domain}
                    onChange={(e) => setNewMilestoneForm({ ...newMilestoneForm, skill_domain: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="Full-Stack Engineering">Full-Stack Engineering</option>
                    <option value="Cloud Architecture & DevOps">Cloud Architecture & DevOps</option>
                    <option value="UI/UX & Design Systems">UI/UX & Design Systems</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="Cyber Security">Cyber Security</option>
                  </select>
                </div>

                <div>
                  <label className="block font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Category
                  </label>
                  <select
                    value={newMilestoneForm.category}
                    onChange={(e) => setNewMilestoneForm({ ...newMilestoneForm, category: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="Capstone Project">Capstone Project</option>
                    <option value="Live Production Deployment">Live Production Deployment</option>
                    <option value="Architecture Defense">Architecture Defense</option>
                    <option value="Code Audit Benchmark">Code Audit Benchmark</option>
                    <option value="Client Deliverable">Client Deliverable</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Target Cohort / Batch <span className="text-error">*</span>
                  </label>
                  <select
                    value={newMilestoneForm.batch_code}
                    onChange={(e) => setNewMilestoneForm({ ...newMilestoneForm, batch_code: e.target.value })}
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
                    Evaluator / Certifying Lead
                  </label>
                  <input
                    type="text"
                    value={newMilestoneForm.evaluator}
                    onChange={(e) => setNewMilestoneForm({ ...newMilestoneForm, evaluator: e.target.value })}
                    placeholder="e.g. Dr. Arvind Swaminathan"
                    className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Description & Deliverable Guidelines
                </label>
                <textarea
                  rows="2"
                  value={newMilestoneForm.description}
                  onChange={(e) => setNewMilestoneForm({ ...newMilestoneForm, description: e.target.value })}
                  placeholder="Outline the architecture expectations and professional standards required..."
                  className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Target Completion Date
                  </label>
                  <input
                    type="date"
                    value={newMilestoneForm.target_date}
                    onChange={(e) => setNewMilestoneForm({ ...newMilestoneForm, target_date: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Required Evidence Items
                  </label>
                  <input
                    type="text"
                    value={newMilestoneForm.required_evidence}
                    onChange={(e) => setNewMilestoneForm({ ...newMilestoneForm, required_evidence: e.target.value })}
                    placeholder="e.g. GitHub Repo URL, Live HTTPS URL, Video Walkthrough"
                    className="w-full px-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Initial Status
                </label>
                <div className="flex items-center gap-4">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="m_status"
                      value="Draft"
                      checked={newMilestoneForm.status === 'Draft'}
                      onChange={() => setNewMilestoneForm({ ...newMilestoneForm, status: 'Draft' })}
                      className="text-light-primary focus:ring-0"
                    />
                    <span>Draft (Ready to dispatch later)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="m_status"
                      value="In Progress"
                      checked={newMilestoneForm.status === 'In Progress'}
                      onChange={() => setNewMilestoneForm({ ...newMilestoneForm, status: 'In Progress' })}
                      className="text-light-primary focus:ring-0"
                    />
                    <span>In Progress (Assign to students now)</span>
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
                  {isSubmitting ? 'Creating...' : 'Create Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: STAGE 3 - VERIFY EVIDENCE & COMPLETE MILESTONE                   */}
      {/* ========================================================================= */}
      {evaluatingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-lg shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between bg-light-surface-container-low dark:bg-dark-surface-container">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-light-primary bg-light-primary-tint px-1.5 py-0.5 rounded">
                    {evaluatingMilestone.milestone_uid}
                  </span>
                  <h2 className="font-title text-base font-bold text-light-on-surface dark:text-dark-on-surface">
                    Milestone Evidence Evaluation & Certification
                  </h2>
                </div>
                <p className="font-body text-xs text-light-on-surface-variant mt-0.5">
                  {evaluatingMilestone.title} • Cohort: <span className="font-semibold">{evaluatingMilestone.batch_code}</span> • Evaluator: {evaluatingMilestone.evaluator}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllCleared}
                  className="px-2.5 py-1 rounded border border-light-outline-variant text-[11px] font-semibold text-green-700 bg-green-50 hover:bg-green-100 transition-colors inline-flex items-center gap-1"
                  title="Mark all candidate submissions cleared and certified"
                >
                  <span className="material-symbols-outlined text-[14px]">done_all</span>
                  <span>Mark All Cleared</span>
                </button>

                <button
                  type="button"
                  onClick={() => setEvaluatingMilestone(null)}
                  className="p-1 rounded text-light-on-surface-variant hover:bg-light-surface-container"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            </div>

            {/* Candidate Evidence Table */}
            <div className="flex-1 overflow-y-auto p-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-light-surface-container-low dark:bg-dark-surface-container border-b border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant font-semibold">
                    <th className="px-3 py-2">Candidate</th>
                    <th className="px-3 py-2">Submitted Evidence (Repo / URL)</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Score %</th>
                    <th className="px-3 py-2">Evaluator Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-outline-variant/50 font-body">
                  {evaluatingMilestone.student_progress.map((st, idx) => (
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

                      {/* Evidence Link */}
                      <td className="px-3 py-2.5 min-w-[200px]">
                        <input
                          type="text"
                          value={st.evidence_url || ''}
                          onChange={(e) => handleStudentEvidenceChange(idx, e.target.value)}
                          placeholder="https://github.com/... or https://demo..."
                          className="w-full px-2 py-1 text-[11px] font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                        />
                      </td>

                      {/* Status */}
                      <td className="px-2 py-2.5 whitespace-nowrap">
                        <select
                          value={st.status || 'In Progress'}
                          onChange={(e) => handleStudentStatusChange(idx, e.target.value)}
                          className={`px-2 py-1 text-xs rounded font-semibold border ${
                            st.status === 'Cleared'
                              ? 'bg-green-50 text-green-700 border-green-300'
                              : st.status === 'Submitted'
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : st.status === 'Needs Revision'
                              ? 'bg-red-50 text-red-700 border-red-300'
                              : 'bg-gray-50 text-gray-700 border-gray-300'
                          }`}
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="Submitted">Submitted</option>
                          <option value="Cleared">Cleared (Certified)</option>
                          <option value="Needs Revision">Needs Revision</option>
                        </select>
                      </td>

                      {/* Score % */}
                      <td className="px-2 py-2.5 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={st.score !== null && st.score !== undefined ? st.score : ''}
                          onChange={(e) => handleStudentScoreChange(idx, e.target.value)}
                          placeholder="%"
                          className="w-16 px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-light-primary"
                        />
                      </td>

                      {/* Remarks */}
                      <td className="px-3 py-2.5">
                        <input
                          type="text"
                          value={st.verification_notes || ''}
                          onChange={(e) => handleStudentNoteChange(idx, e.target.value)}
                          placeholder="Evaluator feedback..."
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
                  Candidates: <strong className="text-light-on-surface dark:text-dark-on-surface">{evaluatingMilestone.student_progress.length}</strong>
                </span>
                <span>
                  Cleared: <strong className="text-green-600">{evaluatingMilestone.student_progress.filter((s) => s.status === 'Cleared').length}</strong>
                </span>
                <span>
                  In Review: <strong className="text-blue-600">{evaluatingMilestone.student_progress.filter((s) => s.status === 'Submitted').length}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setEvaluatingMilestone(null)}
                  disabled={isSubmitting}
                  className="px-3 py-1.5 rounded border border-light-outline-variant text-light-on-surface hover:bg-light-surface font-label text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCompleteMilestoneAndCertify}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-green-700 text-white hover:bg-green-800 font-label text-xs font-semibold shadow-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">military_tech</span>
                  <span>{isSubmitting ? 'Signing Off...' : 'Sign Off & Complete Milestone'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: VIEW MILESTONE DETAILS                                           */}
      {/* ========================================================================= */}
      {viewingMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-lg shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-5 py-4 border-b border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-light-primary bg-light-primary-tint px-1.5 py-0.5 rounded">
                  {viewingMilestone.milestone_uid}
                </span>
                <h2 className="font-title text-base font-bold text-light-on-surface dark:text-dark-on-surface mt-1">
                  {viewingMilestone.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingMilestone(null)}
                className="p-1 rounded text-light-on-surface-variant hover:bg-light-surface-container-low"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto text-xs flex flex-col gap-3.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-light-surface-container-low dark:bg-dark-surface-container p-3 rounded">
                <div>
                  <span className="text-light-on-surface-variant">Cohort:</span>
                  <p className="font-bold text-light-on-surface dark:text-dark-on-surface">{viewingMilestone.batch_code}</p>
                </div>
                <div>
                  <span className="text-light-on-surface-variant">Domain:</span>
                  <p className="font-bold text-light-on-surface dark:text-dark-on-surface">{viewingMilestone.skill_domain}</p>
                </div>
                <div>
                  <span className="text-light-on-surface-variant">Category:</span>
                  <p className="font-bold text-light-on-surface dark:text-dark-on-surface">{viewingMilestone.category}</p>
                </div>
                <div>
                  <span className="text-light-on-surface-variant">Target Date:</span>
                  <p className="font-bold text-light-on-surface dark:text-dark-on-surface">{viewingMilestone.target_date}</p>
                </div>
              </div>

              <div>
                <h4 className="font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Required Evidence Items
                </h4>
                <p className="font-mono text-[11px] bg-light-surface-container-low dark:bg-dark-surface-container p-2.5 rounded border border-light-outline-variant">
                  {viewingMilestone.required_evidence}
                </p>
              </div>

              <div>
                <h4 className="font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-2">
                  Assigned Candidates & Progress ({Array.isArray(viewingMilestone.student_progress) ? viewingMilestone.student_progress.length : 0})
                </h4>
                {Array.isArray(viewingMilestone.student_progress) && viewingMilestone.student_progress.length > 0 ? (
                  <div className="divide-y divide-light-outline-variant/60 border border-light-outline-variant rounded">
                    {viewingMilestone.student_progress.map((st, i) => (
                      <div key={i} className="px-3 py-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-semibold text-light-on-surface dark:text-dark-on-surface">{st.full_name}</span>
                          <span className="font-mono text-light-outline ml-2">({st.student_id})</span>
                          {st.evidence_url && (
                            <a
                              href={st.evidence_url}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-2 font-mono text-[11px] text-light-primary hover:underline"
                            >
                              [Evidence Link]
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            st.status === 'Cleared'
                              ? 'bg-green-100 text-green-700'
                              : st.status === 'Submitted'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {st.status} {st.score ? `(${st.score}%)` : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-light-on-surface-variant italic">No students assigned yet. Click "Send to Students" to assign this milestone.</p>
                )}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-light-outline-variant dark:border-dark-outline-variant flex justify-end">
              <button
                type="button"
                onClick={() => setViewingMilestone(null)}
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

export default MilestoneManagement
