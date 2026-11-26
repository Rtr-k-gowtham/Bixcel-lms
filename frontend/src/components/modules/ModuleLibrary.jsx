import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

// Helper to generate rich quiz questions supporting multiple choice, multi-select, short answer, true/false, and code
export function createDefaultQuizQuestions(topicTitle = 'Curriculum Knowledge Check') {
  return [
    {
      id: 1,
      type: 'multiple_choice',
      question: `What is the primary role of architectural design tokens in ${topicTitle}?`,
      options: [
        { id: 'opt_1', text: 'Store atomic design decisions (color, typography, spacing) that scale across platforms', isCorrect: true },
        { id: 'opt_2', text: 'Render final static HTML without CSS variables', isCorrect: false },
        { id: 'opt_3', text: 'Replace relational database schemas', isCorrect: false },
        { id: 'opt_4', text: 'Generate random unverified style palettes', isCorrect: false },
      ],
      explanation: 'Design tokens encapsulate platform-agnostic design decisions that transform into CSS, iOS, and Android variables.',
      points: 10,
    },
    {
      id: 2,
      type: 'short_answer',
      question: 'State the minimum contrast ratio required by WCAG 2.1 AA for regular body text.',
      expected_answer: '4.5:1',
      explanation: 'WCAG 2.1 AA mandates a 4.5:1 contrast ratio against the background for body text.',
      points: 10,
    },
    {
      id: 3,
      type: 'true_false',
      question: 'True or False: Design tokens can be synchronized directly between Figma and version-controlled repositories.',
      is_true: true,
      explanation: 'Modern design token pipelines support bidirectional synchronization between design tools and Git repos.',
      points: 5,
    },
    {
      id: 4,
      type: 'multi_select',
      question: 'Select ALL key attributes of responsive layout architecture (Choose all that apply):',
      options: [
        { id: 'opt_ms_1', text: 'Fluid typography scales using rem and clamp() units', isCorrect: true },
        { id: 'opt_ms_2', text: 'Flexible CSS grid tracks and adaptive flexbox wrapping', isCorrect: true },
        { id: 'opt_ms_3', text: 'Hardcoded pixel widths locked to desktop resolutions only', isCorrect: false },
        { id: 'opt_ms_4', text: 'Touch targets meeting 44x44 CSS pixel accessibility requirements', isCorrect: true },
      ],
      explanation: 'Fluid units, adaptive tracks, and accessible touch target sizes are essential for responsiveness.',
      points: 15,
    },
    {
      id: 5,
      type: 'code',
      question: 'Write a CSS custom property declaration for a primary brand color variable.',
      language: 'css',
      starter_code: ':root {\n  /* Declare brand color variable here */\n}',
      sample_solution: ':root {\n  --color-primary: #2563eb;\n}',
      explanation: 'CSS custom properties are defined with double-dash prefixes (--name: value) on root or selector scope.',
      points: 10,
    },
  ]
}

// Helper to generate rich day-by-day lessons with sno, title, description, and duration
export function generateDefaultCurriculum(title, days = 7) {
  const dCount = Math.max(1, Math.min(60, Number(days) || 7))
  const curriculum = []

  const seedTopics = [
    {
      title: 'Foundations & Visual Core Principles',
      items: [
        { sno: 1, type: 'lesson', title: 'Introduction & Core Conceptual Principles', duration: '45 mins', description: 'Theoretical foundations, fundamental terminology, and industry standard mental models.', format: 'Video Lecture' },
        { sno: 2, type: 'task', title: 'Project Scaffolding & Design Tokens Setup', duration: '60 mins', description: 'Configure workspace, import token libraries, and verify color contrast ratios.', doc_link: 'https://bixcel.edu/docs/foundations-setup.pdf', image_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500' },
      ],
    },
    {
      title: 'Structural Architecture & Component Design',
      items: [
        { sno: 1, type: 'lesson', title: 'Component Hierarchy & Composition', duration: '50 mins', description: 'Breaking complex workflows into modular, reusable, and maintainable building blocks.', format: 'Interactive Lab' },
        { sno: 2, type: 'task', title: 'Atomic Buttons & Form Inputs Exercise', duration: '55 mins', description: 'Construct atomic button states (hover, focus, disabled) matching WCAG AAA specs.', doc_link: 'https://figma.com/@bixcel-design-system', image_url: '' },
        { sno: 3, type: 'quiz', title: 'Component Anatomy Checkpoint', duration: '20 mins', description: 'Verify understanding of props, slots, and design constraints.', questions_count: 5, pass_score: '80%', quiz_questions: createDefaultQuizQuestions('Component Architecture') },
      ],
    },
    {
      title: 'Data Flow, State & Async Interactions',
      items: [
        { sno: 1, type: 'lesson', title: 'Unidirectional Data Flow & State Hooks', duration: '55 mins', description: 'Managing local state, derived computations, and predictable state transitions.', format: 'Video Lecture' },
        { sno: 2, type: 'task', title: 'Async API Data Binding Assignment', duration: '60 mins', description: 'Implement fetch hooks with loading skeletons and robust error boundaries.', doc_link: 'https://github.com/bixcel-lms/api-specs', image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500' },
      ],
    },
    {
      title: 'Advanced Patterns & Design Systems',
      items: [
        { sno: 1, type: 'lesson', title: 'Scalable Token Architecture & Theme Variables', duration: '45 mins', description: 'Atomic tokens, semantic color mappings, dark/light aliases, and WCAG AAA compliance.', format: 'Live Workshop' },
        { sno: 2, type: 'test', title: 'Design System Practical Milestone Test', duration: '90 mins', description: 'Comprehensive practical benchmark creating an enterprise component suite.', total_marks: 100, passing_marks: 50 },
      ],
    },
  ]

  for (let d = 1; d <= dCount; d++) {
    const template = seedTopics[(d - 1) % seedTopics.length]
    curriculum.push({
      day: d,
      day_title: `Day ${d}: ${template.title}`,
      lessons: template.items.map((item) => ({
        ...item,
        sno: item.sno,
        title: item.title,
        duration: item.duration,
        description: item.description,
      })),
    })
  }

  return curriculum
}

const DEFAULT_MODULES = [
  {
    id: 1,
    title: 'Introduction to Graphic Design',
    code: 'MOD-DES-101',
    version: 'v2.1',
    category: 'Design',
    status: 'Published',
    days: 7,
    lessons: 10,
    tasks: 4,
    assignments: 3,
    tests: 1,
    milestones: 1,
    updated_at: '2026-11-18',
    description: 'Fundamental principles of color theory, typography, grid layouts, and visual hierarchy using industry tools.',
    curriculum_lessons: [
      {
        day: 1,
        day_title: 'Day 1: Foundations of Visual Design & Hierarchy',
        lessons: [
          { sno: 1, type: 'lesson', title: 'Principles of Visual Hierarchy & Balance', duration: '45 mins', description: 'Rule of thirds, optical center, focal points, scale contrast, and cognitive visual flow.', format: 'Video Lecture' },
          { sno: 2, type: 'task', title: 'Layout Balance & Alignment Exercise', duration: '50 mins', description: 'Create 3 layout compositions following the rule of thirds and optical balancing.', doc_link: 'https://bixcel.edu/resources/visual-hierarchy.pdf', image_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500' },
        ],
      },
      {
        day: 2,
        day_title: 'Day 2: Typography & Composition Layouts',
        lessons: [
          { sno: 1, type: 'lesson', title: 'Anatomy of Type & Font Pairings', duration: '45 mins', description: 'Serif vs sans-serif, kerning, leading, tracking, hierarchy pairing display titles with body text.', format: 'Interactive Lab' },
          { sno: 2, type: 'quiz', title: 'Typography Fundamentals Quiz', duration: '15 mins', description: 'Evaluation of font scales, line heights, and readability principles.', questions_count: 5, pass_score: '80%' },
        ],
      },
      {
        day: 3,
        day_title: 'Day 3: Vector Graphics & Pen Tool Mastery',
        lessons: [
          { sno: 1, type: 'lesson', title: 'Bézier Curves & Path Geometries', duration: '55 mins', description: 'Vector control handles, node points, boolean operations (union, subtract, intersect).', format: 'Live Workshop' },
          { sno: 2, type: 'task', title: 'Vector Icon Set Construction', duration: '60 mins', description: 'Design a cohesive 6-piece icon set on a 24x24 pixel grid with 2px uniform stroke.', doc_link: 'https://figma.com/@bixcel-icons', image_url: '' },
        ],
      },
      {
        day: 4,
        day_title: 'Day 4: Image Masking & Raster Editing',
        lessons: [
          { sno: 1, type: 'lesson', title: 'Non-Destructive Layer Masking', duration: '45 mins', description: 'Clipping masks, alpha channels, blend modes, and isolating complex edges.', format: 'Video Lecture' },
          { sno: 2, type: 'task', title: 'Selective Color Grading & Retouching', duration: '50 mins', description: 'Perform tone curves and histogram balancing on provided RAW photographic assets.', doc_link: '', image_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500' },
        ],
      },
      {
        day: 5,
        day_title: 'Day 5: Digital Branding & Identity Assets',
        lessons: [
          { sno: 1, type: 'lesson', title: 'Brand Guidelines & Style Guides', duration: '45 mins', description: 'Logo clear-space specifications, primary/secondary palette documentation, and voice.', format: 'Interactive Lab' },
          { sno: 2, type: 'quiz', title: 'Brand Identity Standards Quiz', duration: '20 mins', description: 'Assessment of trademark clearance, asset ratios, and typography specifications.', questions_count: 6, pass_score: '85%' },
        ],
      },
      {
        day: 6,
        day_title: 'Day 6: Print Production & Prepress Standards',
        lessons: [
          { sno: 1, type: 'lesson', title: 'Bleed, Slug, & CMYK Color Separations', duration: '50 mins', description: '300 DPI resolution requirements, crop marks, rich black vs 100K black, and paper stock.', format: 'Video Lecture' },
          { sno: 2, type: 'task', title: 'Print-Ready PDF Preflight Export', duration: '40 mins', description: 'Export PDF/X-1a files verifying embedded fonts, ink limits, and bleed borders.', doc_link: 'https://bixcel.edu/print-specs.pdf', image_url: '' },
        ],
      },
      {
        day: 7,
        day_title: 'Day 7: Capstone Portfolio Evaluation & Benchmark Test',
        lessons: [
          { sno: 1, type: 'lesson', title: 'Case Study Storytelling & Mockups', duration: '50 mins', description: 'Presenting design solutions in realistic 3D isometric mockups with clear rationale.', format: 'Live Workshop' },
          { sno: 2, type: 'test', title: 'Final Graphic Design Benchmark Examination', duration: '90 mins', description: 'Comprehensive design assessment covering branding, typography, vector assets, and preflight.', total_marks: 100, passing_marks: 60 },
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'UI Wireframing & Prototyping in Figma',
    code: 'MOD-UIX-204',
    version: 'v1.4',
    category: 'UI/UX',
    status: 'Published',
    days: 5,
    lessons: 8,
    tasks: 4,
    assignments: 2,
    tests: 1,
    milestones: 1,
    updated_at: '2026-11-20',
    description: 'Rapid low-fidelity to high-fidelity wireframing, auto-layout mastery, interactive component prototyping, and user testing.',
    curriculum_lessons: generateDefaultCurriculum('UI Wireframing in Figma', 5),
  },
  {
    id: 3,
    title: 'Full-Stack JavaScript & Node.js Runtime',
    code: 'MOD-DEV-301',
    version: 'v3.0',
    category: 'Programming',
    status: 'Published',
    days: 6,
    lessons: 10,
    tasks: 5,
    assignments: 3,
    tests: 2,
    milestones: 2,
    updated_at: '2026-11-22',
    description: 'Asynchronous event loops, REST API design, Express middleware architecture, database integration, and deployment pipelines.',
    curriculum_lessons: generateDefaultCurriculum('Full-Stack JavaScript & Node.js', 6),
  },
  {
    id: 4,
    title: 'Cloud Architecture & DevOps Deployment',
    code: 'MOD-CLD-402',
    version: 'v1.1',
    category: 'Cloud Computing',
    status: 'Draft',
    days: 5,
    lessons: 8,
    tasks: 3,
    assignments: 2,
    tests: 1,
    milestones: 1,
    updated_at: '2026-11-24',
    description: 'Containerization with Docker, Kubernetes orchestration, CI/CD pipelines, SSL automation, and cloud server provisioning.',
    curriculum_lessons: generateDefaultCurriculum('Cloud Architecture & DevOps', 5),
  },
]

export function ModuleLibrary() {
  const [modules, setModules] = useState(DEFAULT_MODULES)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOption, setSortOption] = useState('updated')
  const [toast, setToast] = useState('')

  // Modals & Full-Screen Studio
  const [fullScreenStudio, setFullScreenStudio] = useState(false)
  const [editingModule, setEditingModule] = useState(null)
  const [inspectModule, setInspectModule] = useState(null)
  const [lightboxImage, setLightboxImage] = useState(null)

  // Full-Screen Studio Form & Curriculum State
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    category: 'UI/UX',
    version: 'v1.0',
    status: 'Published',
    days: 7,
    description: '',
  })
  const [curriculumDays, setCurriculumDays] = useState([])
  const [activeDayNumber, setActiveDayNumber] = useState(1)
  const [daySearchQuery, setDaySearchQuery] = useState('')
  const [expandedQuizSno, setExpandedQuizSno] = useState(null)
  const [showModuleInfo, setShowModuleInfo] = useState(false)

  // Item Form State (inside Full-Screen Studio)
  const [showItemForm, setShowItemForm] = useState(false)
  const [editingItemSno, setEditingItemSno] = useState(null)
  const [itemFormData, setItemFormData] = useState({
    type: 'lesson', // 'lesson' | 'task' | 'quiz' | 'test'
    sno: 1,
    title: '',
    duration: '45 mins',
    description: '',
    format: 'Video Lecture',
    doc_link: '',
    image_url: '',
    questions_count: 5,
    pass_score: '80%',
    total_marks: 100,
    passing_marks: 50,
    quiz_questions: [],
  })

  // Fetch from backend
  useEffect(() => {
    let isMounted = true
    const fetchModules = async () => {
      try {
        const res = await apiService.getModules()
        if (res && res.status === 'success' && res.data && isMounted) {
          const normalized = res.data.map((m) => {
            const days = Number(m.days) || 7
            const cur = (m.curriculum_lessons && Array.isArray(m.curriculum_lessons) && m.curriculum_lessons.length > 0)
              ? m.curriculum_lessons
              : generateDefaultCurriculum(m.title, days)
            
            let lCount = 0
            let tCount = 0
            cur.forEach((d) => {
              (d.lessons || []).forEach((item) => {
                if (item.type === 'task') tCount++
                else lCount++
              })
            })

            return {
              ...m,
              curriculum_lessons: cur,
              days: cur.length,
              lessons: lCount > 0 ? lCount : (Number(m.lessons) || days * 2),
              tasks: tCount > 0 ? tCount : (Number(m.tasks) || 4),
            }
          })
          setModules(normalized)
        }
      } catch (err) {
        console.warn('Using fallback modules:', err)
      }
    }
    fetchModules()
    return () => { isMounted = false }
  }, [])

  // Open Full-Screen Studio for creating a new module
  const openCreateModal = () => {
    setEditingModule(null)
    setFormData({
      title: '',
      code: `MOD-ACC-${100 + modules.length + 1}`,
      category: 'UI/UX',
      version: 'v1.0',
      status: 'Published',
      days: 7,
      description: '',
    })
    const initialDays = generateDefaultCurriculum('New Module', 7)
    setCurriculumDays(initialDays)
    setActiveDayNumber(1)
    setShowItemForm(false)
    setEditingItemSno(null)
    setShowModuleInfo(true)
    setFullScreenStudio(true)
  }

  // Open Full-Screen Studio for editing an existing module
  const openEditModal = (m) => {
    setEditingModule(m)
    setFormData({
      title: m.title,
      code: m.code,
      category: m.category || 'UI/UX',
      version: m.version || 'v1.0',
      status: m.status || 'Published',
      days: m.days || 7,
      description: m.description || '',
    })
    const initialDays = (m.curriculum_lessons && m.curriculum_lessons.length > 0)
      ? JSON.parse(JSON.stringify(m.curriculum_lessons))
      : generateDefaultCurriculum(m.title, m.days || 7)
    setCurriculumDays(initialDays)
    setActiveDayNumber(initialDays[0]?.day || 1)
    setShowItemForm(false)
    setEditingItemSno(null)
    setShowModuleInfo(false)
    setFullScreenStudio(true)
  }

  // Active day object in curriculum builder
  const activeDay = curriculumDays.find((d) => d.day === activeDayNumber) || curriculumDays[0] || {
    day: 1,
    day_title: 'Day 1: Curriculum Overview',
    lessons: [],
  }

  // Add a new Day to the module
  const handleAddNewDay = () => {
    const nextDayNum = curriculumDays.length + 1
    const newDay = {
      day: nextDayNum,
      day_title: `Day ${nextDayNum}: In-Depth Practical Topics & Activities`,
      lessons: [
        {
          sno: 1,
          type: 'lesson',
          title: `Day ${nextDayNum} Core Lecture: Advanced Implementation`,
          duration: '45 mins',
          format: 'Video Lecture',
          description: `Key conceptual lecture and practical walk-through for day ${nextDayNum}.`,
        },
      ],
    }
    setCurriculumDays([...curriculumDays, newDay])
    setActiveDayNumber(nextDayNum)
    setToast(`Day ${nextDayNum} added`)
    setTimeout(() => setToast(''), 2500)
  }

  // Delete a Day from the module
  const handleDeleteDay = (dayToDelete) => {
    if (curriculumDays.length <= 1) {
      alert('A module must contain at least 1 day.')
      return
    }
    if (window.confirm(`Delete Day ${dayToDelete} and all its activities?`)) {
      const filtered = curriculumDays
        .filter((d) => d.day !== dayToDelete)
        .map((d, idx) => ({
          ...d,
          day: idx + 1,
          day_title: d.day_title.replace(/Day \d+:/, `Day ${idx + 1}:`),
        }))
      setCurriculumDays(filtered)
      setActiveDayNumber(1)
      setToast(`Day ${dayToDelete} deleted. Days re-indexed.`)
      setTimeout(() => setToast(''), 2500)
    }
  }

  // Update Day Title
  const handleUpdateDayTitle = (newTitle) => {
    setCurriculumDays((prev) =>
      prev.map((d) => (d.day === activeDay.day ? { ...d, day_title: newTitle } : d))
    )
  }

  // Quiz Questions Management Handlers
  const handleAddQuizQuestion = () => {
    const currentQuestions = itemFormData.quiz_questions || []
    const newQ = {
      id: Date.now(),
      type: 'multiple_choice',
      question: '',
      options: [
        { id: 'opt_1', text: '', isCorrect: true },
        { id: 'opt_2', text: '', isCorrect: false },
        { id: 'opt_3', text: '', isCorrect: false },
        { id: 'opt_4', text: '', isCorrect: false },
      ],
      expected_answer: '',
      is_true: true,
      language: 'javascript',
      starter_code: '',
      sample_solution: '',
      explanation: '',
      points: 10,
    }
    const updated = [...currentQuestions, newQ]
    setItemFormData((prev) => ({
      ...prev,
      quiz_questions: updated,
      questions_count: updated.length,
    }))
  }

  const handleUpdateQuizQuestion = (qIdx, field, value) => {
    const currentQuestions = [...(itemFormData.quiz_questions || [])]
    if (!currentQuestions[qIdx]) return
    const target = { ...currentQuestions[qIdx], [field]: value }

    if ((value === 'multiple_choice' || value === 'multi_select') && (!target.options || target.options.length < 2)) {
      target.options = [
        { id: 'opt_1', text: 'Option A', isCorrect: true },
        { id: 'opt_2', text: 'Option B', isCorrect: false },
        { id: 'opt_3', text: 'Option C', isCorrect: false },
        { id: 'opt_4', text: 'Option D', isCorrect: false },
      ]
    }

    currentQuestions[qIdx] = target
    setItemFormData((prev) => ({
      ...prev,
      quiz_questions: currentQuestions,
    }))
  }

  const handleDeleteQuizQuestion = (qIdx) => {
    const currentQuestions = (itemFormData.quiz_questions || []).filter((_, idx) => idx !== qIdx)
    setItemFormData((prev) => ({
      ...prev,
      quiz_questions: currentQuestions,
      questions_count: currentQuestions.length,
    }))
  }

  const handleAddQuestionOption = (qIdx) => {
    const currentQuestions = [...(itemFormData.quiz_questions || [])]
    const q = currentQuestions[qIdx]
    if (!q) return
    const currentOpts = q.options || []
    const nextChar = String.fromCharCode(65 + currentOpts.length)
    const newOpt = {
      id: `opt_${Date.now()}_${currentOpts.length}`,
      text: `Option ${nextChar}`,
      isCorrect: false,
    }
    currentQuestions[qIdx] = {
      ...q,
      options: [...currentOpts, newOpt],
    }
    setItemFormData((prev) => ({
      ...prev,
      quiz_questions: currentQuestions,
    }))
  }

  const handleUpdateQuestionOption = (qIdx, optIdx, field, value) => {
    const currentQuestions = [...(itemFormData.quiz_questions || [])]
    const q = currentQuestions[qIdx]
    if (!q || !q.options || !q.options[optIdx]) return

    let updatedOptions = [...q.options]
    if (field === 'isCorrect' && q.type === 'multiple_choice') {
      updatedOptions = updatedOptions.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === optIdx,
      }))
    } else {
      updatedOptions[optIdx] = {
        ...updatedOptions[optIdx],
        [field]: value,
      }
    }

    currentQuestions[qIdx] = {
      ...q,
      options: updatedOptions,
    }
    setItemFormData((prev) => ({
      ...prev,
      quiz_questions: currentQuestions,
    }))
  }

  const handleDeleteQuestionOption = (qIdx, optIdx) => {
    const currentQuestions = [...(itemFormData.quiz_questions || [])]
    const q = currentQuestions[qIdx]
    if (!q || !q.options || q.options.length <= 2) {
      alert('A multiple choice question must contain at least 2 options.')
      return
    }
    const updatedOptions = q.options.filter((_, idx) => idx !== optIdx)
    currentQuestions[qIdx] = {
      ...q,
      options: updatedOptions,
    }
    setItemFormData((prev) => ({
      ...prev,
      quiz_questions: currentQuestions,
    }))
  }
  // Open item form for creating a new item
  const handleStartAddItem = (type = 'lesson') => {
    const currentItems = activeDay.lessons || []
    const nextSno = currentItems.length > 0
      ? Math.max(...currentItems.map((l) => Number(l.sno) || 0)) + 1
      : 1

    const defaultQuestions = type === 'quiz' ? createDefaultQuizQuestions(`Day ${activeDay.day} Quiz`) : []

    setItemFormData({
      type,
      sno: nextSno,
      title: '',
      duration: type === 'quiz' ? '20 mins' : type === 'test' ? '90 mins' : '45 mins',
      description: '',
      format: 'Video Lecture',
      doc_link: '',
      image_url: '',
      questions_count: defaultQuestions.length || 5,
      pass_score: '80%',
      total_marks: 100,
      passing_marks: 50,
      quiz_questions: defaultQuestions,
    })
    setEditingItemSno(null)
    setShowItemForm(true)
  }

  // Open item form for editing an existing item
  const handleStartEditItem = (item) => {
    let questions = item.quiz_questions
    if (item.type === 'quiz' && (!questions || questions.length === 0)) {
      questions = createDefaultQuizQuestions(item.title || `Day ${activeDay.day} Quiz`)
    }

    setItemFormData({
      type: item.type || 'lesson',
      sno: item.sno || 1,
      title: item.title || '',
      duration: item.duration || '45 mins',
      description: item.description || '',
      format: item.format || 'Video Lecture',
      doc_link: item.doc_link || '',
      image_url: item.image_url || '',
      questions_count: questions?.length || item.questions_count || 5,
      pass_score: item.pass_score || '80%',
      total_marks: item.total_marks || 100,
      passing_marks: item.passing_marks || 50,
      quiz_questions: questions || [],
    })
    setEditingItemSno(item.sno)
    setShowItemForm(true)
  }

  // Delete an item from active day
  const handleDeleteItem = (snoToDelete) => {
    setCurriculumDays((prevDays) =>
      prevDays.map((d) => {
        if (d.day !== activeDay.day) return d
        const updated = (d.lessons || []).filter((l) => l.sno !== snoToDelete)
        return { ...d, lessons: updated }
      })
    )
    setToast(`Item #${snoToDelete} removed from Day ${activeDay.day}`)
    setTimeout(() => setToast(''), 2500)
  }

  // Handle local image file upload for Task
  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setItemFormData((prev) => ({ ...prev, image_url: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Save Item (Lesson, Task, Quiz, Test) into active day
  const handleSaveItem = (e) => {
    e.preventDefault()
    if (!itemFormData.title.trim()) {
      alert('Please provide a title for the activity.')
      return
    }

    const qCount = itemFormData.type === 'quiz' && itemFormData.quiz_questions?.length
      ? itemFormData.quiz_questions.length
      : (Number(itemFormData.questions_count) || 5)

    const newItem = {
      sno: Number(itemFormData.sno) || 1,
      type: itemFormData.type,
      title: itemFormData.title.trim(),
      duration: itemFormData.duration.trim() || '45 mins',
      description: itemFormData.description.trim() || 'Instructional agenda and criteria.',
      format: itemFormData.format,
      doc_link: itemFormData.doc_link?.trim() || '',
      image_url: itemFormData.image_url || '',
      questions_count: qCount,
      pass_score: itemFormData.pass_score || '80%',
      total_marks: Number(itemFormData.total_marks) || 100,
      passing_marks: Number(itemFormData.passing_marks) || 50,
      quiz_questions: itemFormData.type === 'quiz' ? (itemFormData.quiz_questions || []) : [],
    }

    setCurriculumDays((prevDays) =>
      prevDays.map((d) => {
        if (d.day !== activeDay.day) return d
        const currentItems = d.lessons || []
        if (editingItemSno !== null) {
          const updated = currentItems.map((l) =>
            l.sno === editingItemSno ? newItem : l
          )
          return { ...d, lessons: updated }
        } else {
          return { ...d, lessons: [...currentItems, newItem] }
        }
      })
    )

    setShowItemForm(false)
    setEditingItemSno(null)
    setToast(`${newItem.type.toUpperCase()} #${newItem.sno} saved to Day ${activeDay.day}`)
    setTimeout(() => setToast(''), 2500)
  }

  // Save Entire Module in Full-Screen Studio
  const handleSaveFullScreenModule = async (e) => {
    if (e) e.preventDefault()
    if (!formData.title.trim() || !formData.code.trim()) {
      alert('Module Title and Module Code are required.')
      return
    }

    const totalDays = curriculumDays.length
    let totalLessons = 0
    let totalTasks = 0
    let totalTests = 0

    curriculumDays.forEach((d) => {
      (d.lessons || []).forEach((item) => {
        const t = item.type || 'lesson'
        if (t === 'task') totalTasks++
        else if (t === 'test' || t === 'quiz') totalTests++
        else totalLessons++
      })
    })

    const payload = {
      ...formData,
      days: totalDays,
      lessons: totalLessons,
      tasks: totalTasks,
      tests: totalTests,
      curriculum_lessons: curriculumDays,
      updated_at: new Date().toISOString().slice(0, 10),
    }

    try {
      if (editingModule) {
        const res = await apiService.updateModule(editingModule.id, payload)
        const updated = res?.data ? { ...editingModule, ...res.data, curriculum_lessons: curriculumDays, days: totalDays, lessons: totalLessons, tasks: totalTasks } : { ...editingModule, ...payload }
        setModules((prev) => prev.map((m) => (m.id === editingModule.id ? updated : m)))
        setToast(`Module "${payload.title}" updated successfully!`)
      } else {
        const res = await apiService.createModule(payload)
        const created = res?.data || { ...payload, id: Date.now() }
        setModules([created, ...modules])
        setToast(`Module "${payload.title}" created successfully!`)
      }
    } catch (err) {
      console.warn('API error saving module:', err)
      // Optimistic local update
      if (editingModule) {
        setModules((prev) => prev.map((m) => (m.id === editingModule.id ? { ...editingModule, ...payload } : m)))
      } else {
        setModules([{ ...payload, id: Date.now() }, ...modules])
      }
      setToast(`Saved locally: "${payload.title}"`)
    }

    setFullScreenStudio(false)
    setEditingModule(null)
    setTimeout(() => setToast(''), 3500)
  }

  const handleDuplicate = (m) => {
    const duplicated = {
      ...m,
      id: Date.now(),
      title: `${m.title} (Copy)`,
      code: `${m.code}-COPY`,
      version: 'v1.0',
      status: 'Draft',
      curriculum_lessons: JSON.parse(JSON.stringify(m.curriculum_lessons || generateDefaultCurriculum(m.title, m.days))),
    }
    setModules([duplicated, ...modules])
    setToast(`Module duplicated as "${duplicated.title}"`)
    setTimeout(() => setToast(''), 3000)
  }

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete module "${title}"?`)) {
      setModules((prev) => prev.filter((m) => m.id !== id))
      try {
        apiService.deleteModule(id)
      } catch (err) {
        console.warn('API delete:', err)
      }
      setToast(`Module "${title}" deleted successfully`)
      setTimeout(() => setToast(''), 3000)
    }
  }

  // Filtered curriculum days for sidebar search
  const filteredCurriculumDays = curriculumDays.filter((d) => {
    if (!daySearchQuery.trim()) return true
    const q = daySearchQuery.toLowerCase()
    return (
      `day ${d.day}`.includes(q) ||
      d.day_title.toLowerCase().includes(q) ||
      (d.lessons && d.lessons.some((l) => l.title.toLowerCase().includes(q)))
    )
  })

  // Filter and Sort logic
  const filteredModules = modules
    .filter((m) => {
      const matchSearch =
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.code.toLowerCase().includes(search.toLowerCase())
      const matchCategory = categoryFilter === 'all' || m.category === categoryFilter
      const matchStatus = statusFilter === 'all' || m.status === statusFilter
      return matchSearch && matchCategory && matchStatus
    })
    .sort((a, b) => {
      if (sortOption === 'title-asc') return a.title.localeCompare(b.title)
      if (sortOption === 'days-desc') return b.days - a.days
      return (b.id || 0) - (a.id || 0)
    })

  const publishedCount = modules.filter((m) => m.status === 'Published').length
  const draftCount = modules.filter((m) => m.status === 'Draft').length
  const categoriesCount = new Set(modules.map((m) => m.category)).size

  // Summary counts for current studio
  const studioTotalLessons = curriculumDays.reduce(
    (acc, d) => acc + (d.lessons ? d.lessons.filter((l) => l.type === 'lesson' || !l.type).length : 0),
    0
  )
  const studioTotalTasks = curriculumDays.reduce(
    (acc, d) => acc + (d.lessons ? d.lessons.filter((l) => l.type === 'task').length : 0),
    0
  )
  const studioTotalQuizzes = curriculumDays.reduce(
    (acc, d) => acc + (d.lessons ? d.lessons.filter((l) => l.type === 'quiz').length : 0),
    0
  )
  const studioTotalTests = curriculumDays.reduce(
    (acc, d) => acc + (d.lessons ? d.lessons.filter((l) => l.type === 'test').length : 0),
    0
  )

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Toast Notification */}
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

      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-title text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface">
            Module Library &amp; Day-Wise Lessons
          </h1>
          <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Standardized academic curriculum units with full-screen authoring for Lessons, Tasks, Quizzes, and Tests.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Create Custom Module</span>
          </button>
        </div>
      </section>

      {/* Metric Tiles */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-start justify-between gap-2.5">
          <div className="flex flex-col gap-0.5">
            <span className="font-label text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Total Modules
            </span>
            <span className="font-headline text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
              {modules.length < 10 ? `0${modules.length}` : modules.length}
            </span>
            <span className="inline-flex items-center gap-1 text-light-primary text-[10px] font-medium">
              <span className="material-symbols-outlined text-[12px]">library_books</span>
              <span>Across all disciplines</span>
            </span>
          </div>
          <div className="w-7 h-7 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px]">folder</span>
          </div>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-start justify-between gap-2.5">
          <div className="flex flex-col gap-0.5">
            <span className="font-label text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Published Modules
            </span>
            <span className="font-headline text-[17px] font-bold text-success tabular-nums">
              {publishedCount < 10 ? `0${publishedCount}` : publishedCount}
            </span>
            <span className="inline-flex items-center gap-1 text-on-success-container text-[10px] font-medium">
              <span className="material-symbols-outlined text-[12px]">verified</span>
              <span>Active in batches</span>
            </span>
          </div>
          <div className="w-7 h-7 rounded bg-success-container text-on-success-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px]">check_circle</span>
          </div>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-start justify-between gap-2.5">
          <div className="flex flex-col gap-0.5">
            <span className="font-label text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Draft Modules
            </span>
            <span className="font-headline text-[17px] font-bold text-pending tabular-nums">
              {draftCount < 10 ? `0${draftCount}` : draftCount}
            </span>
            <span className="inline-flex items-center gap-1 text-pending text-[10px] font-medium">
              <span className="material-symbols-outlined text-[12px]">pending</span>
              <span>Under review</span>
            </span>
          </div>
          <div className="w-7 h-7 rounded bg-pending-container text-on-pending-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
          </div>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex items-start justify-between gap-2.5">
          <div className="flex flex-col gap-0.5">
            <span className="font-label text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Subject Domains
            </span>
            <span className="font-headline text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
              {categoriesCount < 10 ? `0${categoriesCount}` : categoriesCount}
            </span>
            <span className="inline-flex items-center gap-1 text-light-on-surface-variant text-[10px] font-medium">
              <span className="material-symbols-outlined text-[12px]">category</span>
              <span>Design, Dev &amp; Cloud</span>
            </span>
          </div>
          <div className="w-7 h-7 rounded bg-light-surface-container-high dark:bg-dark-surface-container text-light-on-surface-variant flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[16px]">domain</span>
          </div>
        </article>
      </section>

      {/* Filter and Search Bar */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5">
        <div className="relative flex items-center w-full lg:w-80">
          <span className="material-symbols-outlined text-light-outline text-[16px] absolute left-2.5 pointer-events-none">
            search
          </span>
          <input
            type="search"
            placeholder="Search modules by title or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Domain Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium text-light-on-surface-variant">Domain:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
            >
              <option value="all">All Disciplines</option>
              <option value="Design">Design</option>
              <option value="UI/UX">UI/UX</option>
              <option value="Programming">Programming</option>
              <option value="Cloud Computing">Cloud Computing</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium text-light-on-surface-variant">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
            >
              <option value="all">All Statuses</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* Sort Option */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-medium text-light-on-surface-variant">Sort:</span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
            >
              <option value="updated">Recently Added</option>
              <option value="days-desc">Longest Duration</option>
              <option value="title-asc">Title (A-Z)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Module Directory: Clean Table View */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/60 dark:bg-dark-surface-container/60 text-light-on-surface-variant dark:text-dark-on-surface-variant font-label text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Module Identifier</th>
                <th className="py-2.5 px-3">Module Title</th>
                <th className="py-2.5 px-3">Duration &amp; Activities</th>
                <th className="py-2.5 px-3">Components Breakdown</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-outline-variant/60 dark:divide-dark-outline-variant/60 font-body">
              {filteredModules.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-light-on-surface-variant">
                    <span className="material-symbols-outlined text-[36px] text-light-outline mb-1 block">
                      search_off
                    </span>
                    <span>No curriculum modules found matching your query.</span>
                  </td>
                </tr>
              ) : (
                filteredModules.map((m) => {
                  const lessonsCount = m.lessons || (m.curriculum_lessons ? m.curriculum_lessons.reduce((acc, d) => acc + (d.lessons ? d.lessons.length : 0), 0) : m.days * 2)

                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-light-surface-container-low/40 dark:hover:bg-dark-surface-container/30 transition-colors"
                    >
                      {/* Code & Version */}
                      <td className="py-2.5 px-3 whitespace-nowrap align-top">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-mono text-xs font-bold text-light-primary dark:text-dark-primary">
                            {m.code}
                          </span>
                          <span className="font-mono text-[10px] text-light-on-surface-variant">
                            {m.version}
                          </span>
                        </div>
                      </td>

                      {/* Clean Title Only (No UI/UX tag, no description snippet) */}
                      <td className="py-2.5 px-3 align-top">
                        <span className="font-body text-xs font-medium text-light-on-surface dark:text-dark-on-surface">
                          {m.title}
                        </span>
                      </td>

                      {/* Duration & Lessons (Click opens Full Screen Studio) */}
                      <td className="py-2.5 px-3 whitespace-nowrap align-top">
                        <div className="flex flex-col gap-1">
                          <span className="font-label text-xs font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                            {m.days} Days
                          </span>
                          <button
                            type="button"
                            onClick={() => openEditModal(m)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary hover:bg-light-primary hover:text-white dark:hover:bg-dark-primary transition-colors text-left cursor-pointer"
                            title="Open Full Screen Studio"
                          >
                            <span className="material-symbols-outlined text-[13px]">view_timeline</span>
                            <span>{lessonsCount} Activities</span>
                          </button>
                        </div>
                      </td>

                      {/* Curriculum Breakdown */}
                      <td className="py-2.5 px-3 align-top">
                        <div className="grid grid-cols-2 gap-1 min-w-[170px]">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant text-[10px] font-medium">
                            <span className="font-bold text-light-on-surface dark:text-dark-on-surface">{m.tasks || 4}</span> Tasks
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant text-[10px] font-medium">
                            <span className="font-bold text-light-on-surface dark:text-dark-on-surface">{m.assignments || 2}</span> Assign.
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant text-[10px] font-medium">
                            <span className="font-bold text-light-on-surface dark:text-dark-on-surface">{m.tests || 1}</span> Tests
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant text-[10px] font-medium">
                            <span className="font-bold text-light-on-surface dark:text-dark-on-surface">{m.milestones || 1}</span> Milestone
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-center align-top">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            m.status === 'Published'
                              ? 'bg-success-container text-on-success-container'
                              : 'bg-pending-container text-on-pending-container'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              m.status === 'Published' ? 'bg-success' : 'bg-pending'
                            }`}
                          />
                          <span>{m.status}</span>
                        </span>
                      </td>

                      {/* Actions (+ Course Button REMOVED) */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-right align-top">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(m)}
                            title="Edit Module & Activities in Full Screen Studio"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                            <span>Edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setInspectModule(m)}
                            title="View Details"
                            className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(m)}
                            title="Duplicate Module"
                            className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(m.id, m.title)}
                            title="Delete Module"
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
        <div className="p-2.5 border-t border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/40 dark:bg-dark-surface-container/40 flex items-center justify-between text-[11px] text-light-on-surface-variant">
          <span>Showing <strong>{filteredModules.length}</strong> of <strong>{modules.length}</strong> modules</span>
          <div className="flex items-center gap-2">
            <span>Standardized enterprise curriculum units with day-wise lessons</span>
          </div>
        </div>
      </section>

      {/* ===================================================================== */}
      {/* FULL SCREEN STUDIO: SIDEBAR DAYS + WORKSPACE + RICH QUIZ BUILDER    */}
      {/* ===================================================================== */}
      {fullScreenStudio && (
        <div className="fixed inset-0 z-50 bg-light-surface-container-lowest dark:bg-dark-surface-bright flex flex-col overflow-hidden animate-in fade-in duration-200">
          {/* Studio Top Navigation Bar */}
          <header className="h-14 border-b border-light-outline-variant dark:border-dark-outline-variant px-4 sm:px-6 flex items-center justify-between gap-4 bg-light-surface-container-lowest dark:bg-dark-surface-bright sticky top-0 z-30 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setFullScreenStudio(false)}
                className="p-1.5 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors cursor-pointer"
                title="Exit Full Screen Studio"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </button>

              <div className="w-8 h-8 rounded-lg bg-light-primary text-light-on-primary flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[18px]">edit_square</span>
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-light-primary dark:text-dark-primary">
                    {formData.code || 'MOD-NEW'}
                  </span>
                  <span className="text-light-outline text-[12px]">•</span>
                  <h2 className="font-title text-xs font-semibold text-light-on-surface dark:text-dark-on-surface truncate">
                    {formData.title ? formData.title : 'New Module Curriculum Studio'}
                  </h2>
                </div>
                <span className="text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                  Full Screen Course Studio • Day-Wise Schedule &amp; Comprehensive Activity Builder
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Toggle Module Basic Info */}
              <button
                type="button"
                onClick={() => setShowModuleInfo(!showModuleInfo)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  showModuleInfo
                    ? 'border-light-primary text-light-primary bg-light-primary-tint/20 dark:bg-dark-primary-tint/20'
                    : 'border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container'
                }`}
                title="Toggle basic module metadata"
              >
                <span className="material-symbols-outlined text-[16px]">info</span>
                <span className="hidden sm:inline">{showModuleInfo ? 'Hide Details' : 'Module Details'}</span>
                <span className="material-symbols-outlined text-[14px]">
                  {showModuleInfo ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFullScreenStudio(false)}
                className="px-3 py-1.5 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant hover:bg-light-surface-container-low text-xs font-semibold transition-colors cursor-pointer"
              >
                Discard
              </button>

              <button
                type="button"
                onClick={handleSaveFullScreenModule}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-light-primary hover:bg-light-primary-container text-light-on-primary text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                <span>Save Module</span>
              </button>
            </div>
          </header>

          {/* Studio Split-Pane Body: Left Days Sidebar + Right Workspace Canvas */}
          <div className="flex-1 flex overflow-hidden">
            {/* ================================================================= */}
            {/* LEFT COLUMN: CURRICULUM DAYS SIDEBAR (MODERN ENTERPRISE UI)      */}
            {/* ================================================================= */}
            <aside className="w-72 sm:w-80 lg:w-84 shrink-0 border-r border-light-outline-variant/80 dark:border-dark-outline-variant/80 bg-light-surface-container-low/30 dark:bg-dark-surface-container/20 flex flex-col h-full overflow-hidden">
              {/* Sidebar Header with Add Day Button */}
              <div className="p-3.5 sm:p-4 border-b border-light-outline-variant/60 dark:border-dark-outline-variant/60 flex items-center justify-between shrink-0 bg-light-surface-container-lowest/90 dark:bg-dark-surface-bright/80 backdrop-blur-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-light-primary-tint/25 dark:bg-dark-primary-tint/20 text-light-primary dark:text-dark-primary flex items-center justify-center shrink-0 border border-light-primary/20">
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-light-on-surface dark:text-dark-on-surface tracking-tight uppercase">
                        Course Days
                      </h3>
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-light-surface-container-high dark:bg-dark-surface-container-high text-light-on-surface-variant font-mono">
                        {curriculumDays.length}
                      </span>
                    </div>
                    <p className="text-[10px] text-light-on-surface-variant">
                      Structured curriculum schedule
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddNewDay}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-light-primary text-light-on-primary hover:bg-light-primary-container text-xs font-bold shadow-xs transition-all cursor-pointer"
                  title="Add Next Day"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                  <span>Add Day</span>
                </button>
              </div>

              {/* Day Search / Filter */}
              <div className="p-3 border-b border-light-outline-variant/40 shrink-0 bg-light-surface-container-low/40">
                <div className="relative">
                  <span className="material-symbols-outlined text-[15px] text-light-outline absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    search
                  </span>
                  <input
                    type="text"
                    value={daySearchQuery}
                    onChange={(e) => setDaySearchQuery(e.target.value)}
                    placeholder="Search days or topics..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-light-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary shadow-2xs transition-all"
                  />
                </div>
              </div>

              {/* Days List Scrollable */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
                {filteredCurriculumDays.map((d) => {
                  const isSelected = d.day === activeDay.day
                  const totalItems = d.lessons ? d.lessons.length : 0
                  const lessonCount = (d.lessons || []).filter((l) => l.type === 'lesson' || !l.type).length
                  const taskCount = (d.lessons || []).filter((l) => l.type === 'task').length
                  const quizCount = (d.lessons || []).filter((l) => l.type === 'quiz').length
                  const testCount = (d.lessons || []).filter((l) => l.type === 'test').length

                  const displayTitle = d.day_title ? d.day_title.replace(/^Day\s*\d+:\s*/i, '').trim() : `Curriculum Plan`

                  return (
                    <div
                      key={d.day}
                      onClick={() => {
                        setActiveDayNumber(d.day)
                        setShowItemForm(false)
                      }}
                      className={`group p-3 rounded-xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? 'bg-light-surface-container-lowest dark:bg-dark-surface-bright border-light-primary/60 dark:border-dark-primary/60 shadow-sm ring-1 ring-light-primary/20'
                          : 'bg-light-surface-container-lowest/60 dark:bg-dark-surface-bright/40 border-light-outline-variant/60 dark:border-dark-outline-variant/60 hover:border-light-outline-variant hover:bg-light-surface-container-lowest'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {/* Elegant Numbered Day Badge */}
                        <div
                          className={`w-9 h-9 rounded-lg font-mono flex flex-col items-center justify-center shrink-0 transition-colors shadow-2xs ${
                            isSelected
                              ? 'bg-light-primary text-light-on-primary font-bold'
                              : 'bg-light-surface-container-high dark:bg-dark-surface-container-high text-light-on-surface-variant group-hover:bg-light-primary-tint/20 group-hover:text-light-primary'
                          }`}
                        >
                          <span className="text-[8px] uppercase tracking-wider font-sans opacity-75 leading-none">DAY</span>
                          <span className="text-[13px] font-bold leading-none mt-0.5">{d.day}</span>
                        </div>

                        {/* Title & Activities */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4
                              className={`text-xs font-semibold leading-snug line-clamp-2 ${
                                isSelected
                                  ? 'text-light-primary dark:text-dark-primary font-bold'
                                  : 'text-light-on-surface dark:text-dark-on-surface group-hover:text-light-primary'
                              }`}
                              title={d.day_title}
                            >
                              {displayTitle || `Day ${d.day}`}
                            </h4>

                            {curriculumDays.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteDay(d.day)
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded text-light-on-surface-variant hover:text-overdue hover:bg-overdue-container/20 transition-all shrink-0 cursor-pointer"
                                title={`Delete Day ${d.day}`}
                              >
                                <span className="material-symbols-outlined text-[15px]">delete</span>
                              </button>
                            )}
                          </div>

                          {/* Refined Activity Chips */}
                          <div className="flex items-center gap-1 text-[10px] text-light-on-surface-variant flex-wrap mt-2">
                            {totalItems === 0 ? (
                              <span className="text-[10px] text-light-outline italic">0 activities</span>
                            ) : (
                              <>
                                {lessonCount > 0 && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium border border-blue-500/20">
                                    <span className="material-symbols-outlined text-[11px]">menu_book</span>
                                    <span>{lessonCount}</span>
                                  </span>
                                )}
                                {taskCount > 0 && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium border border-amber-500/20">
                                    <span className="material-symbols-outlined text-[11px]">assignment</span>
                                    <span>{taskCount}</span>
                                  </span>
                                )}
                                {quizCount > 0 && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 font-medium border border-purple-500/20">
                                    <span className="material-symbols-outlined text-[11px]">quiz</span>
                                    <span>{quizCount}</span>
                                  </span>
                                )}
                                {testCount > 0 && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 font-medium border border-rose-500/20">
                                    <span className="material-symbols-outlined text-[11px]">military_tech</span>
                                    <span>{testCount}</span>
                                  </span>
                                )}
                                <span className="font-mono text-[9px] text-light-outline ml-auto">
                                  {totalItems} total
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Sidebar Bottom: Sleek Add Day Button */}
              <div className="p-3 border-t border-light-outline-variant/60 dark:border-dark-outline-variant/60 shrink-0 bg-light-surface-container-lowest/90 dark:bg-dark-surface-bright/80 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={handleAddNewDay}
                  className="w-full py-2 px-3 rounded-xl border border-light-outline-variant hover:border-light-primary bg-light-surface-container-low dark:bg-dark-surface-container hover:bg-light-primary-tint/20 text-light-on-surface dark:text-dark-on-surface hover:text-light-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  <span>Add Day {curriculumDays.length + 1}</span>
                </button>
              </div>
            </aside>

            {/* ================================================================= */}
            {/* RIGHT COLUMN: MAIN WORKSPACE CANVAS                               */}
            {/* ================================================================= */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-light-surface-container-lowest dark:bg-dark-surface-bright">
              {/* Optional Collapsible Basic Module Details */}
              {showModuleInfo && (
                <section className="bg-light-surface-container-low/40 dark:bg-dark-surface-container/20 border border-light-outline-variant dark:border-dark-outline-variant rounded-xl p-4 shadow-xs animate-in fade-in duration-150 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-light-outline-variant/60 dark:border-dark-outline-variant/60">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-light-primary/10 text-light-primary flex items-center justify-center font-bold text-xs">
                        1
                      </span>
                      <h3 className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface uppercase tracking-wider">
                        Basic Module Metadata
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowModuleInfo(false)}
                      className="text-[11px] text-light-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Collapse</span>
                      <span className="material-symbols-outlined text-[13px]">expand_less</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6">
                      <label className="block text-[11px] font-medium text-light-on-surface-variant mb-1">
                        Module Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Advanced UI/UX Design Systems & Component Tokens"
                        className="w-full px-2.5 py-1.5 text-xs font-medium rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-light-on-surface-variant mb-1">
                        Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        placeholder="MOD-UIX-204"
                        className="w-full px-2 py-1.5 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface uppercase focus:outline-none focus:ring-1 focus:ring-light-primary"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-light-on-surface-variant mb-1">
                        Domain
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                      >
                        <option value="UI/UX">UI/UX Design</option>
                        <option value="Design">Graphic & Brand</option>
                        <option value="Programming">Programming</option>
                        <option value="Cloud Computing">Cloud Computing</option>
                        <option value="Data Science">Data Science & AI</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-light-on-surface-variant mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-2 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                      >
                        <option value="Published">Published</option>
                        <option value="Draft">Draft</option>
                        <option value="Under Review">Under Review</option>
                      </select>
                    </div>

                    <div className="sm:col-span-12">
                      <label className="block text-[11px] font-semibold text-light-on-surface-variant mb-1">
                        Curriculum Objectives & Overview
                      </label>
                      <textarea
                        rows={2}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detail target learning competencies, prerequisite concepts, and real-world outcomes..."
                        className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary leading-relaxed"
                      />
                    </div>
                  </div>
                </section>
              )}

              {/* Active Day Section */}
              <section className="bg-light-surface-container-low/20 dark:bg-dark-surface-container/10 border border-light-outline-variant/80 dark:border-dark-outline-variant/80 rounded-xl p-4 sm:p-5 space-y-4">
                {/* Active Day Header with Editable Title & Quick Add Buttons */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-light-outline-variant/60 dark:border-dark-outline-variant/60">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="px-2.5 py-1 rounded-lg bg-light-primary text-light-on-primary font-mono text-xs font-bold shrink-0 shadow-xs">
                      Day {activeDay.day}
                    </span>
                    <input
                      type="text"
                      value={activeDay.day_title}
                      onChange={(e) => handleUpdateDayTitle(e.target.value)}
                      placeholder={`e.g. Day ${activeDay.day}: Practical Paradigms & Implementation`}
                      className="flex-1 px-3 py-1.5 text-xs font-bold rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                    />
                  </div>

                  {/* Add Activity Buttons (Blue Lesson, Amber Task, Purple Quiz, Rose Test) */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleStartAddItem('lesson')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-bold border border-blue-500/20 transition-all cursor-pointer shadow-2xs"
                      title="Add a Lesson to this day"
                    >
                      <span className="material-symbols-outlined text-[15px]">menu_book</span>
                      <span>+ Lesson</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartAddItem('task')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white text-xs font-bold border border-amber-500/20 transition-all cursor-pointer shadow-2xs"
                      title="Add a Task with Doc Link & Image attachment"
                    >
                      <span className="material-symbols-outlined text-[15px]">assignment</span>
                      <span>+ Task</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartAddItem('quiz')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white text-xs font-bold border border-purple-500/20 transition-all cursor-pointer shadow-2xs"
                      title="Add a Quiz with Multiple Choice, Short Answer, True/False, and Code"
                    >
                      <span className="material-symbols-outlined text-[15px]">quiz</span>
                      <span>+ Quiz</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartAddItem('test')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white text-xs font-bold border border-rose-500/20 transition-all cursor-pointer shadow-2xs"
                      title="Add a Test / Exam to this day"
                    >
                      <span className="material-symbols-outlined text-[15px]">military_tech</span>
                      <span>+ Test</span>
                    </button>

                    {curriculumDays.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDay(activeDay.day)}
                        className="p-1.5 rounded-lg text-light-on-surface-variant hover:text-overdue hover:bg-overdue-container/20 transition-colors cursor-pointer"
                        title={`Delete Day ${activeDay.day}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Inline Activity Form (When creating or editing an item) */}
                {showItemForm && (
                  <form
                    onSubmit={handleSaveItem}
                    className="p-4 sm:p-5 rounded-xl border-2 border-light-primary/30 bg-light-surface-container-lowest dark:bg-dark-surface-bright shadow-md space-y-4 animate-in fade-in zoom-in-95 duration-150"
                  >
                    {/* Activity Type Selector Tabs */}
                    <div className="flex items-center justify-between pb-3 border-b border-light-outline-variant/60">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-light-on-surface dark:text-dark-on-surface mr-2">
                          Activity Type:
                        </span>
                        {[
                          { id: 'lesson', label: 'Lesson', icon: 'menu_book', color: 'blue' },
                          { id: 'task', label: 'Task', icon: 'assignment', color: 'amber' },
                          { id: 'quiz', label: 'Quiz (All Options)', icon: 'quiz', color: 'purple' },
                          { id: 'test', label: 'Test / Exam', icon: 'military_tech', color: 'rose' },
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setItemFormData((prev) => {
                                const nextState = { ...prev, type: t.id }
                                if (t.id === 'quiz' && (!nextState.quiz_questions || nextState.quiz_questions.length === 0)) {
                                  nextState.quiz_questions = createDefaultQuizQuestions(prev.title || `Day ${activeDay.day} Quiz`)
                                }
                                return nextState
                              })
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                              itemFormData.type === t.id
                                ? 'bg-light-primary text-light-on-primary shadow-xs'
                                : 'bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant hover:bg-light-surface-container'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[15px]">{t.icon}</span>
                            <span>{t.label}</span>
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowItemForm(false)}
                        className="text-light-on-surface-variant hover:text-light-on-surface p-1 rounded cursor-pointer"
                        title="Cancel"
                      >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                      </button>
                    </div>

                    {/* Common Row: S.No, Title, Duration */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-light-on-surface-variant mb-1">
                          S.No *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={itemFormData.sno}
                          onChange={(e) => setItemFormData({ ...itemFormData, sno: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                        />
                      </div>

                      <div className="sm:col-span-7">
                        <label className="block text-[11px] font-bold text-light-on-surface dark:text-dark-on-surface mb-1">
                          {itemFormData.type === 'task'
                            ? 'Task Title *'
                            : itemFormData.type === 'quiz'
                            ? 'Quiz Title *'
                            : itemFormData.type === 'test'
                            ? 'Test / Exam Title *'
                            : 'Lesson Title *'}
                        </label>
                        <input
                          type="text"
                          required
                          value={itemFormData.title}
                          onChange={(e) => setItemFormData({ ...itemFormData, title: e.target.value })}
                          placeholder={
                            itemFormData.type === 'task'
                              ? 'e.g. Build Responsive Component Token Library'
                              : itemFormData.type === 'quiz'
                              ? 'e.g. CSS Grid & Flexbox Knowledge Assessment'
                              : itemFormData.type === 'test'
                              ? 'e.g. Mid-Term Practical Evaluation'
                              : 'e.g. Deep Dive into Component Architecture'
                          }
                          className="w-full px-3 py-1.5 text-xs font-semibold rounded border border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-light-on-surface-variant mb-1">
                          Duration
                        </label>
                        <input
                          type="text"
                          value={itemFormData.duration}
                          onChange={(e) => setItemFormData({ ...itemFormData, duration: e.target.value })}
                          placeholder="e.g. 45 mins"
                          className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                        />
                      </div>
                    </div>

                    {/* TYPE SPECIFIC FIELDS: TASK (Doc Link & Image) */}
                    {itemFormData.type === 'task' && (
                      <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                        <span className="font-label text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px]">attach_file</span>
                          Task Resources: Document Link &amp; Visual Attachment
                        </span>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Document Link */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface">
                                Uploaded Document Link (URL)
                              </label>
                              {itemFormData.doc_link && (
                                <a
                                  href={itemFormData.doc_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-light-primary hover:underline flex items-center gap-0.5"
                                >
                                  <span>Test Link</span>
                                  <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                </a>
                              )}
                            </div>
                            <div className="relative">
                              <span className="material-symbols-outlined text-light-outline text-[16px] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                link
                              </span>
                              <input
                                type="url"
                                value={itemFormData.doc_link}
                                onChange={(e) => setItemFormData({ ...itemFormData, doc_link: e.target.value })}
                                placeholder="https://drive.google.com/... or Figma / Notion / PDF link"
                                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded border border-light-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-amber-500"
                              />
                            </div>
                            <p className="text-[10px] text-light-on-surface-variant mt-0.5">
                              Paste link to briefing sheets, starter templates, Figma files, or cloud documents.
                            </p>
                          </div>

                          {/* Image Attachment (URL or Local File) */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface">
                                Task Reference Image
                              </label>
                              {itemFormData.image_url && (
                                <button
                                  type="button"
                                  onClick={() => setItemFormData({ ...itemFormData, image_url: '' })}
                                  className="text-[11px] text-overdue hover:underline flex items-center gap-0.5 cursor-pointer"
                                >
                                  <span>Remove Image</span>
                                </button>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="relative flex-1">
                                <span className="material-symbols-outlined text-light-outline text-[16px] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                  image
                                </span>
                                <input
                                  type="text"
                                  value={itemFormData.image_url}
                                  onChange={(e) => setItemFormData({ ...itemFormData, image_url: e.target.value })}
                                  placeholder="Paste Image URL (https://...)"
                                  className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded border border-light-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                              </div>

                              <label className="px-2.5 py-1.5 rounded border border-light-outline-variant hover:bg-light-surface-container text-xs font-semibold cursor-pointer shrink-0 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[15px]">upload_file</span>
                                <span>Upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageFileUpload}
                                  className="hidden"
                                />
                              </label>
                            </div>

                            {/* Live Thumbnail Preview */}
                            {itemFormData.image_url && (
                              <div className="mt-2 flex items-center gap-2 p-1.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant/60">
                                <img
                                  src={itemFormData.image_url}
                                  alt="Task visual preview"
                                  className="w-12 h-12 rounded object-cover border border-light-outline-variant shrink-0"
                                />
                                <div className="text-[10px] text-light-on-surface-variant flex-1 min-w-0">
                                  <span className="font-semibold text-light-on-surface block truncate">Image Attachment Active</span>
                                  <span className="truncate block opacity-80">{itemFormData.image_url.slice(0, 45)}...</span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* TYPE SPECIFIC FIELDS: QUIZ (RICH QUESTION BUILDER WITH ALL OPTIONS) */}
                    {itemFormData.type === 'quiz' && (
                      <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-purple-500/20 gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                              <span className="material-symbols-outlined text-[15px]">quiz</span>
                            </span>
                            <div>
                              <span className="font-title text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
                                Quiz Question Builder &amp; All Options
                              </span>
                              <span className="text-[11px] text-light-on-surface-variant">
                                Configure Multiple Choice, Multi-Select Checkboxes, Short Answer, True/False, and Code Challenge
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-[11px] font-semibold text-light-on-surface-variant">Passing Score:</span>
                              <input
                                type="text"
                                value={itemFormData.pass_score}
                                onChange={(e) => setItemFormData({ ...itemFormData, pass_score: e.target.value })}
                                placeholder="80%"
                                className="w-16 px-2 py-1 text-xs font-semibold rounded border border-light-outline-variant bg-light-surface-container-lowest text-light-on-surface focus:outline-none focus:ring-1 focus:ring-purple-500 text-center"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={handleAddQuizQuestion}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[15px]">add</span>
                              <span>Add Question</span>
                            </button>
                          </div>
                        </div>

                        {/* Quiz Questions List */}
                        <div className="space-y-3.5">
                          {(!itemFormData.quiz_questions || itemFormData.quiz_questions.length === 0) ? (
                            <div className="py-6 text-center text-light-on-surface-variant border border-dashed border-purple-500/30 rounded-lg bg-light-surface-container-lowest/60">
                              <p className="text-xs font-semibold mb-2">No questions added to this quiz yet.</p>
                              <button
                                type="button"
                                onClick={handleAddQuizQuestion}
                                className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-600 font-bold text-xs hover:bg-purple-500 hover:text-white transition-all cursor-pointer"
                              >
                                + Add First Question
                              </button>
                            </div>
                          ) : (
                            itemFormData.quiz_questions.map((q, qIdx) => (
                              <div
                                key={q.id || qIdx}
                                className="p-3.5 rounded-xl border border-purple-500/25 bg-light-surface-container-lowest dark:bg-dark-surface-bright space-y-3 shadow-2xs"
                              >
                                {/* Question Top Row: Badge, Type Selector, Points, Delete */}
                                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-light-outline-variant/60 dark:border-dark-outline-variant/60">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 font-mono text-[11px] font-bold">
                                      Question #{qIdx + 1}
                                    </span>

                                    <select
                                      value={q.type || 'multiple_choice'}
                                      onChange={(e) => handleUpdateQuizQuestion(qIdx, 'type', e.target.value)}
                                      className="px-2.5 py-1 text-xs rounded border border-light-outline-variant bg-light-surface-container-low text-light-on-surface font-semibold focus:outline-none focus:ring-1 focus:ring-purple-500"
                                    >
                                      <option value="multiple_choice">Multiple Choice (Single Answer)</option>
                                      <option value="multi_select">Multiple Select (Checkboxes)</option>
                                      <option value="short_answer">Short Answer / Fill in Blank</option>
                                      <option value="true_false">True / False</option>
                                      <option value="code">Code Challenge / Technical</option>
                                    </select>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 text-[11px]">
                                      <span className="font-semibold text-light-on-surface-variant">Points:</span>
                                      <input
                                        type="number"
                                        min="1"
                                        value={q.points || 10}
                                        onChange={(e) => handleUpdateQuizQuestion(qIdx, 'points', Number(e.target.value) || 10)}
                                        className="w-14 px-1.5 py-0.5 text-xs text-center rounded border border-light-outline-variant bg-light-surface-container-low text-light-on-surface"
                                      />
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleDeleteQuizQuestion(qIdx)}
                                      className="p-1 rounded text-light-on-surface-variant hover:text-overdue hover:bg-overdue-container/20 transition-colors cursor-pointer"
                                      title="Delete Question"
                                    >
                                      <span className="material-symbols-outlined text-[16px]">delete</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Question Prompt */}
                                <div>
                                  <label className="block text-[11px] font-bold text-light-on-surface-variant mb-1">
                                    Question Prompt / Statement *
                                  </label>
                                  <textarea
                                    rows={2}
                                    value={q.question || ''}
                                    onChange={(e) => handleUpdateQuizQuestion(qIdx, 'question', e.target.value)}
                                    placeholder="e.g. Which CSS unit is relative to the root element font size?"
                                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant bg-light-surface-container-low text-light-on-surface focus:outline-none focus:ring-1 focus:ring-purple-500"
                                  />
                                </div>

                                {/* TYPE SPECIFIC QUESTION OPTIONS */}
                                {/* 1. MULTIPLE CHOICE (SINGLE ANSWER) */}
                                {q.type === 'multiple_choice' && (
                                  <div className="space-y-2 pt-1">
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="font-semibold text-light-on-surface-variant">
                                        Answer Options (Select radio button for the correct answer):
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleAddQuestionOption(qIdx)}
                                        className="text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[13px]">add</span>
                                        <span>Add Option</span>
                                      </button>
                                    </div>

                                    <div className="space-y-1.5">
                                      {(q.options || []).map((opt, optIdx) => (
                                        <div key={opt.id || optIdx} className="flex items-center gap-2">
                                          <input
                                            type="radio"
                                            name={`quiz_q_${qIdx}_correct`}
                                            checked={Boolean(opt.isCorrect)}
                                            onChange={() => handleUpdateQuestionOption(qIdx, optIdx, 'isCorrect', true)}
                                            className="w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer"
                                            title="Mark as correct answer"
                                          />
                                          <span className="font-mono text-xs font-bold text-light-on-surface-variant w-5">
                                            {String.fromCharCode(65 + optIdx)}.
                                          </span>
                                          <input
                                            type="text"
                                            value={opt.text}
                                            onChange={(e) => handleUpdateQuestionOption(qIdx, optIdx, 'text', e.target.value)}
                                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                            className={`flex-1 px-2.5 py-1 text-xs rounded border bg-light-surface-container-low text-light-on-surface focus:outline-none focus:ring-1 ${
                                              opt.isCorrect
                                                ? 'border-emerald-500/80 bg-emerald-500/5 font-medium'
                                                : 'border-light-outline-variant'
                                            }`}
                                          />
                                          {(q.options || []).length > 2 && (
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteQuestionOption(qIdx, optIdx)}
                                              className="p-1 rounded text-light-on-surface-variant hover:text-overdue cursor-pointer"
                                              title="Remove Option"
                                            >
                                              <span className="material-symbols-outlined text-[15px]">close</span>
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* 2. MULTI SELECT (CHECKBOXES) */}
                                {q.type === 'multi_select' && (
                                  <div className="space-y-2 pt-1">
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="font-semibold text-light-on-surface-variant">
                                        Answer Options (Check all valid correct options):
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => handleAddQuestionOption(qIdx)}
                                        className="text-purple-600 dark:text-purple-400 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                                      >
                                        <span className="material-symbols-outlined text-[13px]">add</span>
                                        <span>Add Option</span>
                                      </button>
                                    </div>

                                    <div className="space-y-1.5">
                                      {(q.options || []).map((opt, optIdx) => (
                                        <div key={opt.id || optIdx} className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            checked={Boolean(opt.isCorrect)}
                                            onChange={(e) => handleUpdateQuestionOption(qIdx, optIdx, 'isCorrect', e.target.checked)}
                                            className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                                            title="Toggle correct option"
                                          />
                                          <span className="font-mono text-xs font-bold text-light-on-surface-variant w-5">
                                            {String.fromCharCode(65 + optIdx)}.
                                          </span>
                                          <input
                                            type="text"
                                            value={opt.text}
                                            onChange={(e) => handleUpdateQuestionOption(qIdx, optIdx, 'text', e.target.value)}
                                            placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                                            className={`flex-1 px-2.5 py-1 text-xs rounded border bg-light-surface-container-low text-light-on-surface focus:outline-none focus:ring-1 ${
                                              opt.isCorrect
                                                ? 'border-emerald-500/80 bg-emerald-500/5 font-medium'
                                                : 'border-light-outline-variant'
                                            }`}
                                          />
                                          {(q.options || []).length > 2 && (
                                            <button
                                              type="button"
                                              onClick={() => handleDeleteQuestionOption(qIdx, optIdx)}
                                              className="p-1 rounded text-light-on-surface-variant hover:text-overdue cursor-pointer"
                                              title="Remove Option"
                                            >
                                              <span className="material-symbols-outlined text-[15px]">close</span>
                                            </button>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* 3. SHORT ANSWER / FILL IN THE BLANK */}
                                {q.type === 'short_answer' && (
                                  <div className="pt-1">
                                    <label className="block text-[11px] font-semibold text-light-on-surface-variant mb-1">
                                      Expected Correct Answer Key / Required Keywords:
                                    </label>
                                    <input
                                      type="text"
                                      value={q.expected_answer || ''}
                                      onChange={(e) => handleUpdateQuizQuestion(qIdx, 'expected_answer', e.target.value)}
                                      placeholder="e.g. rem or 4.5:1 or flex-direction"
                                      className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant bg-light-surface-container-low text-light-on-surface focus:outline-none focus:ring-1 focus:ring-purple-500 font-mono"
                                    />
                                  </div>
                                )}

                                {/* 4. TRUE / FALSE */}
                                {q.type === 'true_false' && (
                                  <div className="pt-1">
                                    <label className="block text-[11px] font-semibold text-light-on-surface-variant mb-1.5">
                                      Designated Correct Answer:
                                    </label>
                                    <div className="flex items-center gap-3">
                                      <label className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                                        q.is_true === true
                                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 shadow-xs'
                                          : 'border-light-outline-variant bg-light-surface-container-low text-light-on-surface-variant'
                                      }`}>
                                        <input
                                          type="radio"
                                          name={`tf_${qIdx}`}
                                          checked={q.is_true === true}
                                          onChange={() => handleUpdateQuizQuestion(qIdx, 'is_true', true)}
                                          className="hidden"
                                        />
                                        <span className="material-symbols-outlined text-[15px]">check_circle</span>
                                        <span>TRUE</span>
                                      </label>

                                      <label className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                                        q.is_true === false
                                          ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 shadow-xs'
                                          : 'border-light-outline-variant bg-light-surface-container-low text-light-on-surface-variant'
                                      }`}>
                                        <input
                                          type="radio"
                                          name={`tf_${qIdx}`}
                                          checked={q.is_true === false}
                                          onChange={() => handleUpdateQuizQuestion(qIdx, 'is_true', false)}
                                          className="hidden"
                                        />
                                        <span className="material-symbols-outlined text-[15px]">cancel</span>
                                        <span>FALSE</span>
                                      </label>
                                    </div>
                                  </div>
                                )}

                                {/* 5. CODE / TECHNICAL CHALLENGE */}
                                {q.type === 'code' && (
                                  <div className="space-y-2 pt-1">
                                    <div className="flex items-center justify-between">
                                      <label className="text-[11px] font-semibold text-light-on-surface-variant">
                                        Code Challenge Language &amp; Templates:
                                      </label>
                                      <select
                                        value={q.language || 'javascript'}
                                        onChange={(e) => handleUpdateQuizQuestion(qIdx, 'language', e.target.value)}
                                        className="px-2 py-0.5 text-[11px] font-mono rounded border border-light-outline-variant bg-light-surface-container-low"
                                      >
                                        <option value="javascript">JavaScript (ES6)</option>
                                        <option value="typescript">TypeScript</option>
                                        <option value="css">CSS / Tailwind</option>
                                        <option value="python">Python</option>
                                        <option value="sql">SQL</option>
                                      </select>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-[10px] text-light-on-surface-variant block mb-0.5">Starter Code:</span>
                                        <textarea
                                          rows={3}
                                          value={q.starter_code || ''}
                                          onChange={(e) => handleUpdateQuizQuestion(qIdx, 'starter_code', e.target.value)}
                                          placeholder="// Starter template..."
                                          className="w-full p-2 text-xs font-mono rounded border border-light-outline-variant bg-light-surface-container-low"
                                        />
                                      </div>
                                      <div>
                                        <span className="text-[10px] text-light-on-surface-variant block mb-0.5">Sample Solution / Expected Output:</span>
                                        <textarea
                                          rows={3}
                                          value={q.sample_solution || ''}
                                          onChange={(e) => handleUpdateQuizQuestion(qIdx, 'sample_solution', e.target.value)}
                                          placeholder="// Expected answer snippet..."
                                          className="w-full p-2 text-xs font-mono rounded border border-light-outline-variant bg-light-surface-container-low"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Explanation / Answer Rational */}
                                <div>
                                  <label className="block text-[10px] font-semibold text-light-on-surface-variant mb-0.5">
                                    Answer Explanation / Solution Hint (Shown to learners after submission):
                                  </label>
                                  <input
                                    type="text"
                                    value={q.explanation || ''}
                                    onChange={(e) => handleUpdateQuizQuestion(qIdx, 'explanation', e.target.value)}
                                    placeholder="Explain why the solution is correct..."
                                    className="w-full px-2.5 py-1 text-xs rounded border border-light-outline-variant bg-light-surface-container-low text-light-on-surface focus:outline-none focus:ring-1 focus:ring-purple-500"
                                  />
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {/* TYPE SPECIFIC FIELDS: TEST */}
                    {itemFormData.type === 'test' && (
                      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
                        <div>
                          <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                            Total Marks
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={itemFormData.total_marks}
                            onChange={(e) => setItemFormData({ ...itemFormData, total_marks: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant bg-light-surface-container-lowest text-light-on-surface focus:outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                            Passing Marks
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={itemFormData.passing_marks}
                            onChange={(e) => setItemFormData({ ...itemFormData, passing_marks: e.target.value })}
                            className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant bg-light-surface-container-lowest text-light-on-surface focus:outline-none focus:ring-1 focus:ring-rose-500"
                          />
                        </div>
                      </div>
                    )}

                    {/* Description / Instructions */}
                    <div>
                      <label className="block text-[11px] font-semibold text-light-on-surface-variant mb-1">
                        {itemFormData.type === 'task'
                          ? 'Task Instructions & Deliverables *'
                          : itemFormData.type === 'quiz'
                          ? 'Quiz Topics & Coverage Scope'
                          : itemFormData.type === 'test'
                          ? 'Examination Syllabus & Assessment Rules'
                          : 'Lesson Curriculum Summary & Agenda'}
                      </label>
                      <textarea
                        rows={2}
                        value={itemFormData.description}
                        onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                        placeholder="Detail the activities, topics, steps to complete, or instructions..."
                        className="w-full px-3 py-2 text-xs rounded border border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                      />
                    </div>

                    {/* Form Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-light-outline-variant/60">
                      <button
                        type="button"
                        onClick={() => setShowItemForm(false)}
                        className="px-3 py-1.5 rounded text-xs font-semibold hover:bg-light-surface-container-low cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded bg-light-primary hover:bg-light-primary-container text-light-on-primary text-xs font-bold shadow-xs transition-colors cursor-pointer"
                      >
                        {editingItemSno !== null ? 'Update Item' : `Save ${itemFormData.type.toUpperCase()} to Day ${activeDay.day}`}
                      </button>
                    </div>
                  </form>
                )}

                {/* Items List for Active Day - SLEEK, PROFESSIONAL, NO BORDER-L-4 */}
                <div className="space-y-3">
                  {(!activeDay.lessons || activeDay.lessons.length === 0) ? (
                    <div className="py-8 text-center text-light-on-surface-variant border border-dashed border-light-outline-variant rounded-xl bg-light-surface-container-lowest/50 dark:bg-dark-surface-bright/50">
                      <span className="material-symbols-outlined text-[32px] text-light-outline mb-1 block">
                        event_note
                      </span>
                      <p className="font-semibold text-xs text-light-on-surface dark:text-dark-on-surface">
                        No activities scheduled for Day {activeDay.day} yet.
                      </p>
                      <p className="text-[11px] text-light-on-surface-variant mt-0.5 mb-3">
                        Use the buttons above to create Lessons, Tasks with document &amp; image links, Quizzes, or Tests.
                      </p>
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartAddItem('lesson')}
                          className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-xs border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all cursor-pointer"
                        >
                          + Add Lesson
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartAddItem('task')}
                          className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold text-xs border border-amber-500/20 hover:bg-amber-500 hover:text-white transition-all cursor-pointer"
                        >
                          + Add Task
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartAddItem('quiz')}
                          className="px-3 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold text-xs border border-purple-500/20 hover:bg-purple-500 hover:text-white transition-all cursor-pointer"
                        >
                          + Add Quiz
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStartAddItem('test')}
                          className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold text-xs border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                        >
                          + Add Test
                        </button>
                      </div>
                    </div>
                  ) : (
                    activeDay.lessons.map((item) => {
                      const itemType = item.type || 'lesson'
                      const isTask = itemType === 'task'
                      const isQuiz = itemType === 'quiz'
                      const isTest = itemType === 'test'

                      const typeConfig = {
                        lesson: {
                          label: 'LESSON',
                          icon: 'menu_book',
                          iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
                          badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20',
                        },
                        task: {
                          label: 'TASK',
                          icon: 'assignment',
                          iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                          badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20',
                        },
                        quiz: {
                          label: 'QUIZ',
                          icon: 'quiz',
                          iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
                          badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20',
                        },
                        test: {
                          label: 'TEST / EXAM',
                          icon: 'military_tech',
                          iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
                          badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20',
                        },
                      }[itemType] || {
                        label: 'LESSON',
                        icon: 'menu_book',
                        iconBg: 'bg-blue-500/10 text-blue-600',
                        badge: 'bg-blue-500/10 text-blue-700 border border-blue-500/20',
                      }

                      // Breakdown of quiz question types
                      const quizQuestions = item.quiz_questions || []
                      const mcqCount = quizQuestions.filter((q) => q.type === 'multiple_choice' || !q.type).length
                      const msCount = quizQuestions.filter((q) => q.type === 'multi_select').length
                      const saCount = quizQuestions.filter((q) => q.type === 'short_answer').length
                      const tfCount = quizQuestions.filter((q) => q.type === 'true_false').length
                      const codeCount = quizQuestions.filter((q) => q.type === 'code').length

                      return (
                        <div
                          key={item.sno}
                          className="p-4 rounded-xl border border-light-outline-variant/80 dark:border-dark-outline-variant/80 bg-light-surface-container-lowest dark:bg-dark-surface-bright hover:border-light-primary/40 dark:hover:border-dark-primary/40 shadow-xs hover:shadow-sm transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <span className={`w-8 h-8 rounded-lg ${typeConfig.iconBg} flex items-center justify-center shrink-0`}>
                                <span className="material-symbols-outlined text-[18px]">
                                  {typeConfig.icon}
                                </span>
                              </span>

                              <div className="flex flex-col min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider font-mono ${typeConfig.badge}`}>
                                    {typeConfig.label} • #{item.sno}
                                  </span>

                                  <span className="font-title text-[13.5px] font-bold text-light-on-surface dark:text-dark-on-surface">
                                    {item.title}
                                  </span>

                                  {item.duration && (
                                    <span className="font-mono text-[10px] text-light-outline font-semibold">
                                      • {item.duration}
                                    </span>
                                  )}

                                  {isQuiz && (
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 font-semibold border border-purple-500/20">
                                      {quizQuestions.length > 0 ? quizQuestions.length : (item.questions_count || 5)} Questions • Pass: {item.pass_score || '80%'}
                                    </span>
                                  )}

                                  {isTest && item.total_marks && (
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold border border-rose-500/20">
                                      {item.total_marks} Marks (Passing: {item.passing_marks || 50})
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1 leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditItem(item)}
                                title="Edit Activity"
                                className="p-1.5 rounded-lg text-light-on-surface-variant hover:text-light-primary hover:bg-light-surface-container-low transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[17px]">edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteItem(item.sno)}
                                title="Delete Activity"
                                className="p-1.5 rounded-lg text-light-on-surface-variant hover:text-overdue hover:bg-overdue-container/20 transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[17px]">delete</span>
                              </button>
                            </div>
                          </div>

                          {/* TASK RESOURCES: DOCUMENT LINK & IMAGE THUMBNAIL */}
                          {isTask && (item.doc_link || item.image_url) && (
                            <div className="pt-2 border-t border-light-outline-variant/60 dark:border-dark-outline-variant/60 flex flex-wrap items-center gap-3">
                              {item.doc_link && (
                                <a
                                  href={item.doc_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 text-[11px] font-semibold border border-amber-500/30 transition-colors"
                                  title="Open attached task document"
                                >
                                  <span className="material-symbols-outlined text-[14px]">description</span>
                                  <span>Attached Document: {item.doc_link.replace(/^https?:\/\//, '').slice(0, 32)}...</span>
                                  <span className="material-symbols-outlined text-[12px]">open_in_new</span>
                                </a>
                              )}

                              {item.image_url && (
                                <div
                                  onClick={() => setLightboxImage(item.image_url)}
                                  className="inline-flex items-center gap-2 p-1 pr-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant/60 cursor-pointer hover:border-light-primary transition-colors"
                                  title="Click to view full image preview"
                                >
                                  <img
                                    src={item.image_url}
                                    alt="Task visual attachment"
                                    className="w-7 h-7 rounded object-cover border border-black/10 shrink-0"
                                  />
                                  <span className="text-[11px] font-medium text-light-on-surface flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px]">zoom_in</span>
                                    <span>Task Reference Image</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* QUIZ QUESTIONS PREVIEW ACCORDION */}
                          {isQuiz && (
                            <div className="pt-2 border-t border-light-outline-variant/60 dark:border-dark-outline-variant/60 space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5 text-[10px] text-light-on-surface-variant flex-wrap">
                                  {mcqCount > 0 && <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300">{mcqCount} MCQ</span>}
                                  {msCount > 0 && <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300">{msCount} Multi-Select</span>}
                                  {saCount > 0 && <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300">{saCount} Short Answer</span>}
                                  {tfCount > 0 && <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300">{tfCount} True/False</span>}
                                  {codeCount > 0 && <span className="px-1.5 py-0.2 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300">{codeCount} Code</span>}
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setExpandedQuizSno(expandedQuizSno === item.sno ? null : item.sno)}
                                  className="inline-flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-semibold hover:underline cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[14px]">
                                    {expandedQuizSno === item.sno ? 'expand_less' : 'quiz'}
                                  </span>
                                  <span>
                                    {expandedQuizSno === item.sno ? 'Hide Questions' : `Preview ${(quizQuestions.length > 0 ? quizQuestions : createDefaultQuizQuestions(item.title)).length} Questions`}
                                  </span>
                                </button>
                              </div>

                              {/* Expanded Questions Inline List */}
                              {expandedQuizSno === item.sno && (
                                <div className="mt-2 space-y-2 p-3 rounded-lg bg-light-surface-container-low/50 dark:bg-dark-surface-container/30 border border-purple-500/20 animate-in fade-in duration-150">
                                  {(quizQuestions.length > 0 ? quizQuestions : createDefaultQuizQuestions(item.title)).map((q, qIdx) => (
                                    <div
                                      key={q.id || qIdx}
                                      className="p-2.5 rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant/60 text-xs space-y-1.5"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-mono text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase">
                                          Q{qIdx + 1} • {q.type ? q.type.replace('_', ' ') : 'MULTIPLE CHOICE'} ({q.points || 10} pts)
                                        </span>
                                        {q.expected_answer && (
                                          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                            Key: {q.expected_answer}
                                          </span>
                                        )}
                                      </div>
                                      <p className="font-medium text-light-on-surface dark:text-dark-on-surface">
                                        {q.question}
                                      </p>
                                      {q.options && q.options.length > 0 && (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                                          {q.options.map((opt, oIdx) => (
                                            <div
                                              key={opt.id || oIdx}
                                              className={`px-2 py-1 rounded text-[11px] flex items-center gap-1.5 ${
                                                opt.isCorrect
                                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/30'
                                                  : 'bg-light-surface-container-low text-light-on-surface-variant'
                                              }`}
                                            >
                                              <span className="material-symbols-outlined text-[13px]">
                                                {opt.isCorrect ? 'check_circle' : 'radio_button_unchecked'}
                                              </span>
                                              <span>{opt.text}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      {q.explanation && (
                                        <p className="text-[10px] text-light-on-surface-variant italic pt-0.5">
                                          Explanation: {q.explanation}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </section>
            </main>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* LIGHTBOX MODAL FOR TASK REFERENCE IMAGES                             */}
      {/* ===================================================================== */}
      {lightboxImage && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="relative max-w-3xl max-h-[90vh] bg-black/40 rounded-xl overflow-hidden p-2 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors z-10 cursor-pointer"
              title="Close Preview"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
            <img
              src={lightboxImage}
              alt="Full resolution task attachment"
              className="max-w-full max-h-[82vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: VIEW DETAILS & INSPECT MODULE                                  */}
      {/* ===================================================================== */}
      {inspectModule && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-light-outline-variant dark:border-dark-outline-variant mb-3">
              <div>
                <span className="font-mono text-mono-xs text-light-primary font-bold">
                  {inspectModule.code} • {inspectModule.version}
                </span>
                <h3 className="font-title text-[13px] font-semibold text-light-on-surface dark:text-dark-on-surface">
                  {inspectModule.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectModule(null)}
                className="text-light-on-surface-variant hover:text-light-on-surface p-1 rounded cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 font-body text-xs overflow-y-auto pr-1 flex-1">
              <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant leading-relaxed">
                {inspectModule.description || 'No detailed summary provided.'}
              </p>

              <div className="grid grid-cols-3 gap-2 p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-xs">
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block uppercase font-medium">Duration:</span>
                  <strong className="text-light-on-surface dark:text-dark-on-surface">{inspectModule.days} Days</strong>
                </div>
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block uppercase font-medium">Category:</span>
                  <strong className="text-light-on-surface dark:text-dark-on-surface">{inspectModule.category}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-light-on-surface-variant block uppercase font-medium">Status:</span>
                  <strong className="text-success font-semibold">{inspectModule.status}</strong>
                </div>
              </div>

              {/* Day-Wise Activities Inspection */}
              <div className="mt-3">
                <h4 className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface mb-2">
                  Curriculum Structure ({inspectModule.curriculum_lessons?.length || inspectModule.days} Days)
                </h4>
                <div className="space-y-2">
                  {(inspectModule.curriculum_lessons || []).map((dayObj) => (
                    <div
                      key={dayObj.day}
                      className="p-2.5 rounded border border-light-outline-variant/60 bg-light-surface-container-low/40 dark:bg-dark-surface-container/30 space-y-1.5"
                    >
                      <span className="font-label text-xs font-bold text-light-primary block">
                        {dayObj.day_title}
                      </span>
                      <div className="space-y-1.5 pl-1">
                        {dayObj.lessons && dayObj.lessons.map((l) => (
                          <div
                            key={l.sno}
                            className="p-1.5 rounded bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant/60 flex flex-col gap-0.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-[11px] text-light-on-surface dark:text-dark-on-surface">
                                <strong className="font-mono text-light-primary mr-1">#{l.sno}</strong>
                                [{l.type ? l.type.toUpperCase() : 'LESSON'}] {l.title}
                              </span>
                              <span className="font-mono text-[10px] text-light-on-surface-variant font-bold shrink-0">
                                {l.duration}
                              </span>
                            </div>
                            <p className="text-[10px] text-light-on-surface-variant line-clamp-2">
                              {l.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-light-outline-variant dark:border-dark-outline-variant mt-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  const m = inspectModule
                  setInspectModule(null)
                  openEditModal(m)
                }}
                className="px-3.5 py-1.5 rounded bg-light-primary text-light-on-primary text-xs font-bold hover:bg-light-primary-container transition-colors cursor-pointer"
              >
                Open in Studio
              </button>
              <button
                type="button"
                onClick={() => setInspectModule(null)}
                className="px-4 py-1.5 rounded bg-light-surface-container-low text-xs font-semibold hover:bg-light-surface-container transition-colors cursor-pointer"
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

export default ModuleLibrary
