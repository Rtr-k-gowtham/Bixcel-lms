import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

// Helper to generate rich day-by-day lessons with sno, title, description, and duration
export function generateDefaultCurriculum(title, days = 7) {
  const dCount = Math.max(1, Math.min(60, Number(days) || 7))
  const curriculum = []

  const seedTopics = [
    {
      title: 'Foundations & Visual Core Principles',
      lessons: [
        { sno: 1, title: 'Introduction & Core Conceptual Principles', duration: '45 mins', description: 'Theoretical foundations, fundamental terminology, and industry standard mental models.' },
        { sno: 2, title: 'Tooling, Scaffolding & Initial Setup', duration: '60 mins', description: 'Environment setup, project workspace configuration, shortcuts, and boilerplate architectures.' },
      ],
    },
    {
      title: 'Structural Architecture & Component Design',
      lessons: [
        { sno: 1, title: 'Component Hierarchy & Composition', duration: '50 mins', description: 'Breaking complex workflows into modular, reusable, and maintainable building blocks.' },
        { sno: 2, title: 'Design Constraints & Spatial Layouts', duration: '55 mins', description: 'Grid systems, adaptive sizing, flex structures, and responsive boundaries.' },
        { sno: 3, title: 'Hands-on Practice: Blueprint Assembly', duration: '40 mins', description: 'Guided exercise translating requirements into production-ready component prototypes.' },
      ],
    },
    {
      title: 'Data Flow, State & Async Interactions',
      lessons: [
        { sno: 1, title: 'Unidirectional Data Flow & State Hooks', duration: '55 mins', description: 'Managing local state, derived computations, and predictable state transitions.' },
        { sno: 2, title: 'Consuming External APIs & Handling Side Effects', duration: '60 mins', description: 'Async/await requests, loading skeletons, error boundaries, and cache validation.' },
      ],
    },
    {
      title: 'Advanced Patterns & Design Systems',
      lessons: [
        { sno: 1, title: 'Scalable Token Architecture & Theme Variables', duration: '45 mins', description: 'Atomic tokens, semantic color mappings, dark/light aliases, and WCAG AAA compliance.' },
        { sno: 2, title: 'Micro-interactions & Accessible Feedback', duration: '50 mins', description: 'Subtle hover states, focus rings, keyboard navigation, and screen reader labels.' },
      ],
    },
    {
      title: 'Testing, QA & Performance Optimization',
      lessons: [
        { sno: 1, title: 'Automated Unit Verification & Test Cases', duration: '50 mins', description: 'Testing critical paths, assertions, mock adapters, and regression prevention.' },
        { sno: 2, title: 'Runtime Performance & Bundle Auditing', duration: '45 mins', description: 'Profiling rendering bottlenecks, tree shaking, asset minification, and latency reduction.' },
      ],
    },
  ]

  for (let d = 1; d <= dCount; d++) {
    const template = seedTopics[(d - 1) % seedTopics.length]
    curriculum.push({
      day: d,
      day_title: `Day ${d}: ${template.title}`,
      lessons: template.lessons.map((l) => ({
        sno: l.sno,
        title: `${l.title} (${title.slice(0, 20)})`,
        duration: l.duration,
        description: l.description,
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
    lessons: 15,
    tasks: 6,
    assignments: 3,
    tests: 2,
    milestones: 1,
    updated_at: '2026-11-18',
    description: 'Fundamental principles of color theory, typography, grid layouts, and visual hierarchy using industry tools.',
    curriculum_lessons: [
      {
        day: 1,
        day_title: 'Day 1: Foundations of Visual Design & Hierarchy',
        lessons: [
          { sno: 1, title: 'Principles of Visual Hierarchy & Balance', duration: '45 mins', description: 'Rule of thirds, optical center, focal points, scale contrast, and cognitive visual flow.' },
          { sno: 2, title: 'Color Theory & Harmonious Palettes', duration: '50 mins', description: 'Color wheel relationships, RGB vs CMYK, psychological tints, and WCAG AAA contrast compliance.' },
        ],
      },
      {
        day: 2,
        day_title: 'Day 2: Typography & Composition Layouts',
        lessons: [
          { sno: 1, title: 'Anatomy of Type & Font Pairings', duration: '45 mins', description: 'Serif vs sans-serif, kerning, leading, tracking, hierarchy pairing display titles with body text.' },
          { sno: 2, title: 'Modular Grid Systems & 8pt Rhythm', duration: '60 mins', description: 'Baseline grids, column margins, gutters, and effective utilization of white space.' },
        ],
      },
      {
        day: 3,
        day_title: 'Day 3: Vector Graphics & Pen Tool Mastery',
        lessons: [
          { sno: 1, title: 'Bézier Curves & Path Geometries', duration: '55 mins', description: 'Vector control handles, node points, boolean operations (union, subtract, intersect).' },
          { sno: 2, title: 'Iconography Construction & Scalability', duration: '50 mins', description: 'Designing cohesive 24px icon sets with consistent stroke weights and optical sizing.' },
        ],
      },
      {
        day: 4,
        day_title: 'Day 4: Image Masking & Raster Editing',
        lessons: [
          { sno: 1, title: 'Non-Destructive Layer Masking', duration: '45 mins', description: 'Clipping masks, alpha channels, blend modes, and isolating complex edges.' },
          { sno: 2, title: 'Color Correction & Tone Curves', duration: '50 mins', description: 'Histogram balancing, selective color adjustment, and high-fidelity retouching.' },
        ],
      },
      {
        day: 5,
        day_title: 'Day 5: Digital Branding & Identity Assets',
        lessons: [
          { sno: 1, title: 'Brand Guidelines & Style Guides', duration: '45 mins', description: 'Logo clear-space specifications, primary/secondary palette documentation, and voice.' },
          { sno: 2, title: 'Social Media Asset Pack Workshop', duration: '60 mins', description: 'Building multi-ratio promotional banners across Instagram, LinkedIn, and YouTube standards.' },
        ],
      },
      {
        day: 6,
        day_title: 'Day 6: Print Production & Prepress Standards',
        lessons: [
          { sno: 1, title: 'Bleed, Slug, & CMYK Color Separations', duration: '50 mins', description: '300 DPI resolution requirements, crop marks, rich black vs 100K black, and paper stock.' },
          { sno: 2, title: 'PDF/X Export & Preflight Verification', duration: '40 mins', description: 'Font embedding, vector flattening, ink limit verification, and printer proofing.' },
        ],
      },
      {
        day: 7,
        day_title: 'Day 7: Capstone Portfolio Presentation & Critique',
        lessons: [
          { sno: 1, title: 'Case Study Storytelling & Mockups', duration: '50 mins', description: 'Presenting design solutions in realistic 3D isometric mockups with clear rationale.' },
          { sno: 2, title: 'Peer Review & Design Critique Session', duration: '60 mins', description: 'Structured rubric evaluation, iteration feedback, and final portfolio publishing.' },
          { sno: 3, title: 'Industry Handoff & Asset Archiving', duration: '35 mins', description: 'File naming taxonomies, layered PSD/AI archiving, and SVG optimization.' },
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
    days: 10,
    lessons: 18,
    tasks: 10,
    assignments: 4,
    tests: 3,
    milestones: 2,
    updated_at: '2026-11-20',
    description: 'Hands-on interactive prototyping, responsive auto-layouts, micro-animations, and user flow architectures.',
    curriculum_lessons: [
      {
        day: 1,
        day_title: 'Day 1: Figma Canvas, Frames & Constraints',
        lessons: [
          { sno: 1, title: 'Figma Workspace & Nested Frames', duration: '45 mins', description: 'Frame mechanics vs groups, artboard presets, layout grids, and pixel snapping.' },
          { sno: 2, title: 'Responsive Pinning & Constraints', duration: '50 mins', description: 'Left/Right, Center, Scale, and Top/Bottom pinning across multi-device screens.' },
        ],
      },
      {
        day: 2,
        day_title: 'Day 2: Low-Fidelity Wireframing & User Flows',
        lessons: [
          { sno: 1, title: 'Information Architecture & Site Maps', duration: '45 mins', description: 'Card sorting results, navigation hierarchies, and high-level user journey flows.' },
          { sno: 2, title: 'Rapid Graybox Screen Mapping', duration: '60 mins', description: 'Constructing 8 primary application screens using standardized wireframe UI kits.' },
        ],
      },
      {
        day: 3,
        day_title: 'Day 3: Auto-Layout 5.0 Mechanics',
        lessons: [
          { sno: 1, title: 'Flex Direction, Gaps & Hug vs Fill', duration: '50 mins', description: 'Horizontal and vertical layouts, uniform padding, and responsive container bounds.' },
          { sno: 2, title: 'Auto-Layout Wrapping & Min/Max Widths', duration: '55 mins', description: 'Multi-line wrapping tags, sticky action bars, and container fluidity.' },
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'Modern JavaScript & TypeScript Architecture',
    code: 'MOD-DEV-301',
    version: 'v3.0',
    category: 'Programming',
    status: 'Published',
    days: 14,
    lessons: 24,
    tasks: 16,
    assignments: 6,
    tests: 4,
    milestones: 3,
    updated_at: '2026-11-22',
    description: 'ES6+, functional programming paradigms, asynchronous patterns, TypeScript interfaces, and unit testing.',
    curriculum_lessons: [
      {
        day: 1,
        day_title: 'Day 1: Modern ECMAScript Syntax & Scope',
        lessons: [
          { sno: 1, title: 'Block Scoping, Closures & Execution Context', duration: '50 mins', description: 'Lexical environments, hoisting, closures, and garbage collection mechanisms.' },
          { sno: 2, title: 'Destructuring, Rest & Spread Patterns', duration: '45 mins', description: 'Object and array pattern matching, shallow vs deep copying, and immutability.' },
        ],
      },
      {
        day: 2,
        day_title: 'Day 2: Asynchronous Event Loop & Promises',
        lessons: [
          { sno: 1, title: 'Microtasks vs Macrotasks in V8', duration: '55 mins', description: 'Call stack, task queues, promise microtask ordering, and render cycle syncing.' },
          { sno: 2, title: 'Async/Await & Resilient Error Handling', duration: '50 mins', description: 'Try/catch blocks, Promise.allSettled, timeout aborts, and circuit breakers.' },
        ],
      },
      {
        day: 3,
        day_title: 'Day 3: TypeScript Foundations & Structural Typing',
        lessons: [
          { sno: 1, title: 'Primitive Types, Interfaces & Type Aliases', duration: '50 mins', description: 'Type inference, union types, intersection types, and strict null checks.' },
          { sno: 2, title: 'Generics & Advanced Utility Types', duration: '60 mins', description: 'Generic constraints, Partial, Pick, Omit, Record, and conditional inference.' },
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'Responsive Layouts & Tailwind CSS',
    code: 'MOD-CSS-102',
    version: 'v2.0',
    category: 'Programming',
    status: 'Published',
    days: 5,
    lessons: 10,
    tasks: 8,
    assignments: 2,
    tests: 1,
    milestones: 1,
    updated_at: '2026-11-15',
    description: 'Utility-first CSS styling, mobile-first responsive breakpoints, dark mode tokens, and custom animation curves.',
    curriculum_lessons: [
      {
        day: 1,
        day_title: 'Day 1: Tailwind JIT Engine & Utility Philosophy',
        lessons: [
          { sno: 1, title: 'Utility-First vs Semantic CSS Trade-offs', duration: '45 mins', description: 'Build footprint, CSS purging, arbitrary values, and design token enforcement.' },
          { sno: 2, title: 'Typography Scales & Spacing Systems', duration: '50 mins', description: 'Fluid typography, proportional padding/margin, and line-height balance.' },
        ],
      },
      {
        day: 2,
        day_title: 'Day 2: Mobile-First Breakpoints & Fluid Grids',
        lessons: [
          { sno: 1, title: 'Responsive Modifiers (sm, md, lg, xl, 2xl)', duration: '45 mins', description: 'Mobile viewport testing, breakpoint overrides, and container queries.' },
          { sno: 2, title: 'CSS Grid & Flexbox Alignment Utilities', duration: '55 mins', description: 'Auto-fit columns, minmax grid sizing, item positioning, and alignment.' },
        ],
      },
    ],
  },
  {
    id: 5,
    title: 'RESTful API Integration & Async State',
    code: 'MOD-API-402',
    version: 'v1.2',
    category: 'Programming',
    status: 'Draft',
    days: 8,
    lessons: 12,
    tasks: 8,
    assignments: 3,
    tests: 2,
    milestones: 1,
    updated_at: '2026-11-24',
    description: 'Axios client configurations, token authentication workflows, optimistic mutations, and preflight CORS handling.',
    curriculum_lessons: [
      {
        day: 1,
        day_title: 'Day 1: HTTP Protocol & REST Architectural Constraints',
        lessons: [
          { sno: 1, title: 'HTTP Verbs, Headers, & Status Codes', duration: '45 mins', description: 'Idempotency, content negotiation, cache-control headers, and standard error payloads.' },
          { sno: 2, title: 'Configuring Axios & Fetch Interceptors', duration: '50 mins', description: 'Base URLs, Bearer token injection, automatic refresh token loops, and timeout configs.' },
        ],
      },
    ],
  },
  {
    id: 6,
    title: 'Design Systems & Component Tokens',
    code: 'MOD-UIX-305',
    version: 'v1.0',
    category: 'UI/UX',
    status: 'Draft',
    days: 6,
    lessons: 12,
    tasks: 6,
    assignments: 2,
    tests: 2,
    milestones: 1,
    updated_at: '2026-11-25',
    description: 'Building scalable design systems with atomic design tokens, accessibility standards (WCAG AAA), and Figma variables.',
    curriculum_lessons: [
      {
        day: 1,
        day_title: 'Day 1: Atomic Design Methodology & Token Taxonomy',
        lessons: [
          { sno: 1, title: 'Atoms, Molecules, Organisms & Templates', duration: '45 mins', description: 'Hierarchical component architecture, breaking down user interfaces systematically.' },
          { sno: 2, title: 'Design Tokens: Global, Semantic, & Component Scopes', duration: '55 mins', description: 'Color, spacing, radius, and elevation tokens using JSON specifications.' },
        ],
      },
    ],
  },
]

export function ModuleLibrary() {
  const [modules, setModules] = useState(DEFAULT_MODULES)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortOption, setSortOption] = useState('updated')
  const [addedModules, setAddedModules] = useState({})
  const [toast, setToast] = useState('')

  // Modals
  const [showModal, setShowModal] = useState(false)
  const [editingModule, setEditingModule] = useState(null)
  const [inspectModule, setInspectModule] = useState(null)

  // Day-Wise Curriculum & Multiple Lessons Builder State
  const [curriculumModule, setCurriculumModule] = useState(null)
  const [curriculumDays, setCurriculumDays] = useState([])
  const [activeDayNumber, setActiveDayNumber] = useState(1)
  const [showAddLessonForm, setShowAddLessonForm] = useState(false)
  const [editingLessonSno, setEditingLessonSno] = useState(null)
  const [lessonFormData, setLessonFormData] = useState({
    sno: 1,
    title: '',
    duration: '45 mins',
    description: '',
  })

  // Create/Edit Form state
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    category: 'UI/UX',
    version: 'v1.0',
    status: 'Published',
    days: 7,
    lessons: 12,
    tasks: 6,
    assignments: 3,
    tests: 2,
    milestones: 1,
    description: '',
  })

  // Fetch from backend
  useEffect(() => {
    let isMounted = true
    const fetchModules = async () => {
      try {
        const res = await apiService.getModules()
        if (res && res.status === 'success' && res.data && isMounted) {
          // Normalize modules to have curriculum_lessons
          const normalized = res.data.map((m) => {
            const days = Number(m.days) || 7
            const cur = (m.curriculum_lessons && Array.isArray(m.curriculum_lessons) && m.curriculum_lessons.length > 0)
              ? m.curriculum_lessons
              : generateDefaultCurriculum(m.title, days)
            const totalLessons = cur.reduce((acc, d) => acc + (d.lessons ? d.lessons.length : 0), 0)
            return {
              ...m,
              curriculum_lessons: cur,
              days: cur.length,
              lessons: totalLessons > 0 ? totalLessons : (Number(m.lessons) || days * 2),
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

  const openCreateModal = () => {
    setEditingModule(null)
    setFormData({
      title: '',
      code: `MOD-ACC-${100 + modules.length + 1}`,
      category: 'UI/UX',
      version: 'v1.0',
      status: 'Published',
      days: 7,
      lessons: 14,
      tasks: 6,
      assignments: 3,
      tests: 2,
      milestones: 1,
      description: '',
    })
    setShowModal(true)
  }

  const openEditModal = (m) => {
    setEditingModule(m)
    setFormData({ ...m })
    setShowModal(true)
  }

  // Open Curriculum & Day-Wise Lessons Builder
  const openCurriculumModal = (m) => {
    setCurriculumModule(m)
    const initialDays = (m.curriculum_lessons && m.curriculum_lessons.length > 0)
      ? JSON.parse(JSON.stringify(m.curriculum_lessons))
      : generateDefaultCurriculum(m.title, m.days || 7)
    setCurriculumDays(initialDays)
    setActiveDayNumber(initialDays[0] ? initialDays[0].day : 1)
    setShowAddLessonForm(false)
    setEditingLessonSno(null)
    setLessonFormData({
      sno: 1,
      title: '',
      duration: '45 mins',
      description: '',
    })
  }

  // Active day object in curriculum builder
  const activeDay = curriculumDays.find((d) => d.day === activeDayNumber) || curriculumDays[0] || {
    day: 1,
    day_title: 'Day 1: Curriculum Overview',
    lessons: [],
  }

  // Start adding a lesson into the active day
  const handleStartAddLesson = () => {
    const nextSno = activeDay.lessons && activeDay.lessons.length > 0
      ? Math.max(...activeDay.lessons.map((l) => Number(l.sno) || 0)) + 1
      : 1
    setLessonFormData({
      sno: nextSno,
      title: '',
      duration: '45 mins',
      description: '',
    })
    setEditingLessonSno(null)
    setShowAddLessonForm(true)
  }

  // Start editing an existing lesson in active day
  const handleStartEditLesson = (lesson) => {
    setLessonFormData({ ...lesson })
    setEditingLessonSno(lesson.sno)
    setShowAddLessonForm(true)
  }

  // Delete a lesson from active day
  const handleDeleteLesson = (snoToDelete) => {
    setCurriculumDays((prevDays) =>
      prevDays.map((d) => {
        if (d.day !== activeDay.day) return d
        const updated = d.lessons.filter((l) => l.sno !== snoToDelete)
        return { ...d, lessons: updated }
      })
    )
    setToast(`Lesson #${snoToDelete} removed from Day ${activeDay.day}`)
    setTimeout(() => setToast(''), 2500)
  }

  // Save lesson (new or edited) into active day
  const handleSaveLesson = (e) => {
    e.preventDefault()
    if (!lessonFormData.title.trim()) return

    const newLesson = {
      sno: Number(lessonFormData.sno) || 1,
      title: lessonFormData.title.trim(),
      duration: lessonFormData.duration.trim() || '45 mins',
      description: lessonFormData.description.trim() || 'Core instructional syllabus topics and exercises.',
    }

    setCurriculumDays((prevDays) =>
      prevDays.map((d) => {
        if (d.day !== activeDay.day) return d
        const currentLessons = d.lessons || []
        if (editingLessonSno !== null) {
          // Editing existing lesson
          const updated = currentLessons.map((l) =>
            l.sno === editingLessonSno ? newLesson : l
          )
          return { ...d, lessons: updated }
        } else {
          // Adding new lesson (supports multiple lessons in day 1, 2, etc.)
          const updated = [...currentLessons, newLesson]
          return { ...d, lessons: updated }
        }
      })
    )

    setShowAddLessonForm(false)
    setEditingLessonSno(null)
    setToast(
      editingLessonSno !== null
        ? `Lesson #${newLesson.sno} updated for Day ${activeDay.day}`
        : `Added Lesson #${newLesson.sno} to Day ${activeDay.day}`
    )
    setTimeout(() => setToast(''), 2500)
  }

  // Add a new day to the module
  const handleAddNewDay = () => {
    const nextDayNum = curriculumDays.length + 1
    const newDay = {
      day: nextDayNum,
      day_title: `Day ${nextDayNum}: In-Depth Practical Topics & Labs`,
      lessons: [
        {
          sno: 1,
          title: `Day ${nextDayNum} Core Lecture: Advanced Implementation`,
          duration: '45 mins',
          description: `Key conceptual lecture and practical walk-through for day ${nextDayNum}.`,
        },
      ],
    }
    setCurriculumDays([...curriculumDays, newDay])
    setActiveDayNumber(nextDayNum)
    setToast(`Day ${nextDayNum} added with 1 initial lesson`)
    setTimeout(() => setToast(''), 2500)
  }

  // Delete day from curriculum
  const handleDeleteDay = (dayToDelete) => {
    if (curriculumDays.length <= 1) {
      alert('A module must contain at least 1 day.')
      return
    }
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

  // Update Day Title
  const handleUpdateDayTitle = (newTitle) => {
    setCurriculumDays((prev) =>
      prev.map((d) => (d.day === activeDay.day ? { ...d, day_title: newTitle } : d))
    )
  }

  // Save the entire curriculum back to module & API
  const handleSaveCurriculum = async () => {
    if (!curriculumModule) return

    const totalDays = curriculumDays.length
    const totalLessons = curriculumDays.reduce(
      (sum, d) => sum + (d.lessons ? d.lessons.length : 0),
      0
    )

    const updatedModule = {
      ...curriculumModule,
      curriculum_lessons: curriculumDays,
      days: totalDays,
      lessons: totalLessons,
    }

    setModules((prev) =>
      prev.map((m) => (m.id === curriculumModule.id ? updatedModule : m))
    )

    try {
      await apiService.updateModule(curriculumModule.id, {
        curriculum_lessons: curriculumDays,
        days: totalDays,
        lessons: totalLessons,
      })
    } catch (err) {
      console.warn('API update module curriculum:', err)
    }

    setCurriculumModule(null)
    setToast(`Curriculum saved: ${totalDays} Days, ${totalLessons} Lessons for "${updatedModule.title}"`)
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

  const toggleAddedToCourse = (id, title) => {
    const newState = !addedModules[id]
    setAddedModules((prev) => ({ ...prev, [id]: newState }))
    setToast(newState ? `"${title}" added to active course curriculum` : `Removed "${title}" from course`)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.code) return

    if (editingModule) {
      const updatedCurriculum = (editingModule.curriculum_lessons && editingModule.curriculum_lessons.length > 0)
        ? editingModule.curriculum_lessons
        : generateDefaultCurriculum(formData.title, formData.days)

      const totalLessons = updatedCurriculum.reduce((acc, d) => acc + (d.lessons ? d.lessons.length : 0), 0)

      const payload = {
        ...formData,
        curriculum_lessons: updatedCurriculum,
        days: updatedCurriculum.length,
        lessons: totalLessons > 0 ? totalLessons : formData.lessons,
      }

      try {
        await apiService.updateModule(editingModule.id, payload)
      } catch (err) {
        console.warn('API update failed:', err)
      }
      setModules((prev) =>
        prev.map((item) => (item.id === editingModule.id ? { ...item, ...payload } : item))
      )
      setToast(`Module "${formData.title}" updated`)
    } else {
      const newCurriculum = generateDefaultCurriculum(formData.title, formData.days || 7)
      const totalLessons = newCurriculum.reduce((acc, d) => acc + (d.lessons ? d.lessons.length : 0), 0)

      const newMod = {
        id: Date.now(),
        ...formData,
        curriculum_lessons: newCurriculum,
        days: newCurriculum.length,
        lessons: totalLessons,
        updated_at: new Date().toISOString().slice(0, 10),
      }
      try {
        await apiService.createModule(newMod)
      } catch (err) {
        console.warn('API create failed:', err)
      }
      setModules([newMod, ...modules])
      setToast(`Module "${formData.title}" created with ${newMod.days} Days & ${newMod.lessons} Lessons`)
    }

    setShowModal(false)
    setTimeout(() => setToast(''), 3500)
  }

  // Filter & Sort
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
      if (sortOption === 'days-desc') return b.days - a.days
      if (sortOption === 'title-asc') return a.title.localeCompare(b.title)
      return b.id - a.id
    })

  const publishedCount = modules.filter((m) => m.status === 'Published').length
  const draftCount = modules.filter((m) => m.status === 'Draft').length
  const categoriesCount = new Set(modules.map((m) => m.category)).size

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
            Manage standardized modules, configure multiple lessons per day (S.No, Title, Description, Duration), and sync with course curricula.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setToast('Curriculum import dialogue opened')
              setTimeout(() => setToast(''), 3000)
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright hover:bg-light-surface-container-low text-light-on-surface dark:text-dark-on-surface font-label text-xs font-semibold shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">file_download</span>
            <span>Import Module</span>
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-xs font-semibold shadow-xs transition-colors"
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
              <span>Ready for active courses</span>
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
              <span>Under curriculum review</span>
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
          {/* Category Filter */}
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

      {/* Module Directory: List View Table */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/60 dark:bg-dark-surface-container/60 text-light-on-surface-variant dark:text-dark-on-surface-variant font-label text-[11px] uppercase tracking-wider">
                <th className="py-2.5 px-3">Module Identifier</th>
                <th className="py-2.5 px-3">Title &amp; Learning Scope</th>
                <th className="py-2.5 px-3">Duration &amp; Lessons</th>
                <th className="py-2.5 px-3">Curriculum Breakdown</th>
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
                  const isAdded = addedModules[m.id]
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

                      {/* Title & Description */}
                      <td className="py-2.5 px-3 max-w-sm align-top">
                        <div className="flex flex-col gap-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-title text-[13.5px] font-bold text-light-on-surface dark:text-dark-on-surface">
                              {m.title}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint font-label text-[10px] font-semibold">
                              {m.category}
                            </span>
                          </div>
                          <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant line-clamp-2 leading-relaxed">
                            {m.description}
                          </p>
                        </div>
                      </td>

                      {/* Duration & Lessons (Clickable to open Day-wise lessons manager) */}
                      <td className="py-2.5 px-3 whitespace-nowrap align-top">
                        <div className="flex flex-col gap-1">
                          <span className="font-label text-xs font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                            {m.days} Days
                          </span>
                          <button
                            type="button"
                            onClick={() => openCurriculumModal(m)}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary hover:bg-light-primary hover:text-white dark:hover:bg-dark-primary transition-colors text-left"
                            title="Manage Day-wise Multiple Lessons"
                          >
                            <span className="material-symbols-outlined text-[13px]">view_timeline</span>
                            <span>{lessonsCount} Lessons (Day-wise)</span>
                          </button>
                        </div>
                      </td>

                      {/* Curriculum Components Breakdown */}
                      <td className="py-2.5 px-3 align-top">
                        <div className="grid grid-cols-2 gap-1 min-w-[170px]">
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant text-[10px] font-medium">
                            <span className="font-bold text-light-on-surface dark:text-dark-on-surface">{m.tasks}</span> Tasks
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant text-[10px] font-medium">
                            <span className="font-bold text-light-on-surface dark:text-dark-on-surface">{m.assignments}</span> Assign.
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant text-[10px] font-medium">
                            <span className="font-bold text-light-on-surface dark:text-dark-on-surface">{m.tests}</span> Tests
                          </span>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant text-[10px] font-medium">
                            <span className="font-bold text-light-on-surface dark:text-dark-on-surface">{m.milestones}</span> Milestones
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

                      {/* Actions */}
                      <td className="py-2.5 px-3 whitespace-nowrap text-right align-top">
                        <div className="flex items-center justify-end gap-1">
                          {/* Manage Curriculum & Lessons button */}
                          <button
                            type="button"
                            onClick={() => openCurriculumModal(m)}
                            title="Manage Day-Wise Lessons (S.No, Title, Description, Duration)"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-light-primary hover:bg-light-primary-tint hover:text-light-primary font-label text-[11px] font-semibold transition-colors"
                          >
                            <span className="material-symbols-outlined text-[15px]">menu_book</span>
                            <span>Lessons</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleAddedToCourse(m.id, m.title)}
                            title={isAdded ? 'Remove from Course' : 'Add to Course'}
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded font-label text-[11px] font-semibold transition-colors ${
                              isAdded
                                ? 'bg-success text-white'
                                : 'bg-light-primary text-light-on-primary hover:bg-light-primary-container'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {isAdded ? 'check' : 'add'}
                            </span>
                            <span>{isAdded ? 'Added' : 'Course'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setInspectModule(m)}
                            title="View Details"
                            className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">visibility</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditModal(m)}
                            title="Edit Module Details"
                            className="p-1 rounded text-light-on-surface-variant hover:text-light-primary hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDuplicate(m)}
                            title="Duplicate Module"
                            className="p-1 rounded text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(m.id, m.title)}
                            title="Delete Module"
                            className="p-1 rounded text-light-on-surface-variant hover:text-overdue hover:bg-overdue-container/20 transition-colors"
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
      {/* MODAL 1: DAY-WISE MULTIPLE LESSONS MANAGER & BUILDER                  */}
      {/* ===================================================================== */}
      {curriculumModule && (
        <div className="fixed inset-0 z-50 bg-sidebar/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-3.5 border-b border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between gap-3 bg-light-surface-container-low/50 dark:bg-dark-surface-container/50">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                </span>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-light-primary dark:text-dark-primary">
                      {curriculumModule.code}
                    </span>
                    <span className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                      {curriculumModule.title}
                    </span>
                  </div>
                  <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Configure Day-by-Day Lessons. Add multiple lessons per day with Serial Number (S.No), Title, Description, and Duration.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleAddNewDay}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container hover:bg-light-surface-container text-light-on-surface dark:text-dark-on-surface font-label text-xs font-semibold border border-light-outline-variant dark:border-dark-outline-variant shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                  <span>Add Day</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurriculumModule(null)}
                  className="text-light-on-surface-variant hover:text-light-on-surface p-1 rounded"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Sub-header metric banner */}
            <div className="px-4 py-2 border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright flex flex-wrap items-center justify-between text-xs text-light-on-surface-variant gap-2">
              <div className="flex items-center gap-3">
                <span>
                  Total Days: <strong className="text-light-on-surface dark:text-dark-on-surface font-bold">{curriculumDays.length}</strong>
                </span>
                <span>•</span>
                <span>
                  Total Lessons across module: <strong className="text-light-primary dark:text-dark-primary font-bold">
                    {curriculumDays.reduce((acc, d) => acc + (d.lessons ? d.lessons.length : 0), 0)}
                  </strong>
                </span>
              </div>
              <span className="text-[11px] text-light-on-surface-variant italic">
                Active: Day {activeDay.day} ({activeDay.lessons ? activeDay.lessons.length : 0} lessons configured)
              </span>
            </div>

            {/* Body: Two Column Layout */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[380px]">
              {/* Left Sidebar: Days List */}
              <div className="w-full md:w-64 border-r border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/30 dark:bg-dark-surface-container/20 flex flex-col shrink-0">
                <div className="p-2.5 border-b border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between">
                  <span className="font-label text-[11px] font-bold text-light-on-surface-variant uppercase tracking-wider">
                    Days Schedule ({curriculumDays.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddNewDay}
                    className="p-1 rounded text-light-primary hover:bg-light-primary-tint"
                    title="Add a new Day"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_circle</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[220px] md:max-h-none">
                  {curriculumDays.map((d) => {
                    const isSelected = d.day === activeDay.day
                    const lCount = d.lessons ? d.lessons.length : 0

                    return (
                      <div
                        key={d.day}
                        onClick={() => {
                          setActiveDayNumber(d.day)
                          setShowAddLessonForm(false)
                        }}
                        className={`p-2 rounded cursor-pointer transition-colors border text-left flex items-center justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-light-primary text-light-on-primary border-light-primary shadow-xs'
                            : 'bg-light-surface-container-lowest dark:bg-dark-surface-bright border-light-outline-variant dark:border-dark-outline-variant hover:bg-light-surface-container'
                        }`}
                      >
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-mono text-[11px] font-bold ${isSelected ? 'text-white' : 'text-light-primary'}`}>
                              Day {d.day}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                                isSelected
                                  ? 'bg-white/20 text-white'
                                  : 'bg-light-surface-container text-light-on-surface-variant'
                              }`}
                            >
                              {lCount} {lCount === 1 ? 'lesson' : 'lessons'}
                            </span>
                          </div>
                          <span
                            className={`text-[11px] truncate mt-0.5 ${
                              isSelected ? 'text-white/90' : 'text-light-on-surface-variant'
                            }`}
                          >
                            {d.day_title.replace(/^Day \d+:\s*/, '')}
                          </span>
                        </div>

                        {curriculumDays.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteDay(d.day)
                            }}
                            title={`Delete Day ${d.day}`}
                            className={`p-1 rounded opacity-60 hover:opacity-100 ${
                              isSelected ? 'hover:bg-white/20 text-white' : 'hover:bg-overdue-container/30 text-overdue'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Right Content: Active Day Multiple Lessons Manager */}
              <div className="flex-1 flex flex-col overflow-y-auto p-4 gap-3 bg-light-surface-container-lowest dark:bg-dark-surface-bright">
                {/* Active Day Title Bar */}
                <div className="p-3 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/40 dark:bg-dark-surface-container/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex-1">
                    <span className="font-label text-[10px] text-light-primary dark:text-dark-primary font-bold uppercase tracking-wider block">
                      Active Day Header &amp; Theme
                    </span>
                    <input
                      type="text"
                      value={activeDay.day_title}
                      onChange={(e) => handleUpdateDayTitle(e.target.value)}
                      placeholder={`e.g. Day ${activeDay.day}: Visual Hierarchy & Layouts`}
                      className="w-full mt-0.5 px-2.5 py-1 text-xs font-bold rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleStartAddLesson}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-xs font-semibold shadow-xs shrink-0 self-start sm:self-auto"
                  >
                    <span className="material-symbols-outlined text-[15px]">add</span>
                    <span>Add Lesson to Day {activeDay.day}</span>
                  </button>
                </div>

                {/* Inline Add / Edit Lesson Form */}
                {showAddLessonForm && (
                  <form
                    onSubmit={handleSaveLesson}
                    className="p-3.5 rounded border-2 border-light-primary/40 dark:border-dark-primary/40 bg-light-primary-tint/15 dark:bg-dark-primary-tint/15 flex flex-col gap-3 animate-in fade-in duration-200"
                  >
                    <div className="flex items-center justify-between border-b border-light-outline-variant/60 pb-2">
                      <span className="font-title text-xs font-bold text-light-on-surface dark:text-dark-on-surface flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-light-primary">
                          {editingLessonSno !== null ? 'edit_note' : 'post_add'}
                        </span>
                        <span>
                          {editingLessonSno !== null
                            ? `Edit Lesson #${editingLessonSno} (Day ${activeDay.day})`
                            : `Add New Lesson to Day ${activeDay.day}`}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddLessonForm(false)}
                        className="text-light-on-surface-variant hover:text-light-on-surface"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      {/* S.No Input */}
                      <div>
                        <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                          S.No # *
                        </label>
                        <input
                          type="number"
                          min="1"
                          required
                          value={lessonFormData.sno}
                          onChange={(e) => setLessonFormData({ ...lessonFormData, sno: Number(e.target.value) })}
                          className="w-full px-2.5 py-1 text-xs font-mono font-bold rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                        />
                      </div>

                      {/* Lesson Title Input */}
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                          Lesson Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={lessonFormData.title}
                          onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                          placeholder="e.g. Color Harmonies & Contrast Ratios"
                          className="w-full px-2.5 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                        />
                      </div>

                      {/* Duration Input */}
                      <div>
                        <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                          Duration *
                        </label>
                        <input
                          type="text"
                          required
                          value={lessonFormData.duration}
                          onChange={(e) => setLessonFormData({ ...lessonFormData, duration: e.target.value })}
                          placeholder="e.g. 45 mins"
                          className="w-full px-2.5 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                        />
                      </div>
                    </div>

                    {/* Quick Duration Preset Pills */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-light-on-surface-variant font-medium">Quick Duration:</span>
                      {['30 mins', '45 mins', '60 mins', '90 mins', '2 hours'].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setLessonFormData({ ...lessonFormData, duration: dur })}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold border transition-colors ${
                            lessonFormData.duration === dur
                              ? 'bg-light-primary text-light-on-primary border-light-primary'
                              : 'bg-light-surface-container-low dark:bg-dark-surface-container border-light-outline-variant text-light-on-surface-variant hover:text-light-on-surface'
                          }`}
                        >
                          {dur}
                        </button>
                      ))}
                    </div>

                    {/* Description Textarea */}
                    <div>
                      <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                        Lesson Syllabus &amp; Description *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={lessonFormData.description}
                        onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                        placeholder="Detail the core syllabus concepts, practical examples, exercises, and takeaways..."
                        className="w-full px-2.5 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddLessonForm(false)}
                        className="px-2.5 py-1 rounded border border-light-outline-variant text-xs font-semibold hover:bg-light-surface-container-low"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-light-primary text-light-on-primary text-xs font-semibold shadow-xs hover:bg-light-primary-container"
                      >
                        <span className="material-symbols-outlined text-[14px]">save</span>
                        <span>{editingLessonSno !== null ? 'Update Lesson' : 'Add Lesson'}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Lessons List in Active Day */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-label text-[11px] font-bold text-light-on-surface-variant uppercase tracking-wider">
                      Day {activeDay.day} Lessons ({activeDay.lessons ? activeDay.lessons.length : 0})
                    </span>
                    {(!activeDay.lessons || activeDay.lessons.length === 0) && (
                      <span className="text-[11px] text-pending font-medium">No lessons added yet for this day</span>
                    )}
                  </div>

                  {(!activeDay.lessons || activeDay.lessons.length === 0) ? (
                    <div className="p-6 border border-dashed border-light-outline-variant dark:border-dark-outline-variant rounded-md text-center flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[32px] text-light-outline">
                        post_add
                      </span>
                      <p className="text-xs text-light-on-surface-variant">
                        Day {activeDay.day} currently has no lessons. Click the button below to add multiple lessons.
                      </p>
                      <button
                        type="button"
                        onClick={handleStartAddLesson}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-light-primary text-light-on-primary font-label text-xs font-semibold shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">add</span>
                        <span>Add First Lesson to Day {activeDay.day}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activeDay.lessons.map((lesson) => (
                        <div
                          key={lesson.sno}
                          className="p-3 rounded-md border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/30 dark:bg-dark-surface-container/30 hover:border-light-primary/60 transition-colors flex flex-col gap-1.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* S.No badge */}
                              <span className="w-6 h-6 rounded bg-light-primary text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                                {lesson.sno}
                              </span>

                              {/* Title */}
                              <h4 className="font-title text-[13px] font-bold text-light-on-surface dark:text-dark-on-surface">
                                {lesson.title}
                              </h4>

                              {/* Duration Badge */}
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-light-surface-container dark:bg-dark-surface-container border border-light-outline-variant/60 font-mono text-[10px] font-bold text-light-on-surface-variant">
                                <span className="material-symbols-outlined text-[12px] text-light-primary">schedule</span>
                                <span>{lesson.duration}</span>
                              </span>
                            </div>

                            {/* Lesson Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleStartEditLesson(lesson)}
                                title="Edit Lesson"
                                className="p-1 rounded text-light-on-surface-variant hover:text-light-primary hover:bg-light-surface-container transition-colors"
                              >
                                <span className="material-symbols-outlined text-[15px]">edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLesson(lesson.sno)}
                                title="Delete Lesson"
                                className="p-1 rounded text-light-on-surface-variant hover:text-overdue hover:bg-overdue-container/20 transition-colors"
                              >
                                <span className="material-symbols-outlined text-[15px]">delete</span>
                              </button>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant leading-relaxed pl-8">
                            {lesson.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Quick Add Another Lesson button at the bottom of the list */}
                  {activeDay.lessons && activeDay.lessons.length > 0 && !showAddLessonForm && (
                    <button
                      type="button"
                      onClick={handleStartAddLesson}
                      className="mt-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded border border-dashed border-light-primary/50 text-light-primary hover:bg-light-primary-tint/20 text-xs font-semibold transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      <span>+ Add Another Lesson to Day {activeDay.day}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/40 dark:bg-dark-surface-container/40 flex items-center justify-between gap-3">
              <span className="text-[11px] text-light-on-surface-variant">
                Configured: <strong>{curriculumDays.length} Days</strong> with <strong>{curriculumDays.reduce((acc, d) => acc + (d.lessons ? d.lessons.length : 0), 0)} Total Lessons</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurriculumModule(null)}
                  className="px-3.5 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant text-xs font-semibold hover:bg-light-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCurriculum}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-light-primary hover:bg-light-primary-container text-light-on-primary text-xs font-bold shadow-xs transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Save Curriculum &amp; Lessons</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: VIEW DETAILS & DAY-WISE LESSONS INSPECTION                  */}
      {/* ===================================================================== */}
      {inspectModule && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-light-outline-variant dark:border-dark-outline-variant mb-3">
              <div>
                <span className="font-mono text-mono-xs text-light-primary font-bold">
                  {inspectModule.code} • {inspectModule.version}
                </span>
                <h3 className="font-title text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface">
                  {inspectModule.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectModule(null)}
                className="text-light-on-surface-variant hover:text-light-on-surface p-1 rounded"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 font-body text-xs overflow-y-auto pr-1 flex-1">
              <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant leading-relaxed">
                {inspectModule.description}
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
                  <strong className="text-light-on-surface dark:text-dark-on-surface">{inspectModule.status}</strong>
                </div>
              </div>

              {/* Day-Wise Lessons Explorer inside View Details */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label text-xs font-bold text-light-on-surface dark:text-dark-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-light-primary">menu_book</span>
                    <span>Day-by-Day Lessons Breakdown</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const mod = inspectModule
                      setInspectModule(null)
                      openCurriculumModal(mod)
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-light-primary hover:underline"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    <span>Manage / Add Lessons</span>
                  </button>
                </div>

                {/* List of Days & Multiple Lessons */}
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {(inspectModule.curriculum_lessons && inspectModule.curriculum_lessons.length > 0
                    ? inspectModule.curriculum_lessons
                    : generateDefaultCurriculum(inspectModule.title, inspectModule.days)
                  ).map((dayObj) => (
                    <div
                      key={dayObj.day}
                      className="p-2.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/40 dark:bg-dark-surface-container/30 flex flex-col gap-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-label text-xs font-bold text-light-on-surface dark:text-dark-on-surface">
                          {dayObj.day_title}
                        </span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] font-semibold bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary">
                          {dayObj.lessons ? dayObj.lessons.length : 0} lessons
                        </span>
                      </div>

                      <div className="space-y-1.5 pl-2">
                        {dayObj.lessons && dayObj.lessons.map((l) => (
                          <div
                            key={l.sno}
                            className="p-1.5 rounded bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant/60 flex flex-col gap-0.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium text-[11px] text-light-on-surface dark:text-dark-on-surface">
                                <strong className="font-mono text-light-primary mr-1">#{l.sno}</strong>
                                {l.title}
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

            <div className="flex justify-end pt-3 border-t border-light-outline-variant dark:border-dark-outline-variant mt-3">
              <button
                type="button"
                onClick={() => setInspectModule(null)}
                className="px-4 py-1.5 rounded bg-light-surface-container-low text-xs font-semibold hover:bg-light-surface-container transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: CREATE / EDIT MODULE MODAL                                  */}
      {/* ===================================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-xl w-full max-w-lg p-4 sm:p-5">
            <div className="flex items-center justify-between pb-3 border-b border-light-outline-variant dark:border-dark-outline-variant mb-3">
              <h3 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                {editingModule ? 'Edit Module' : 'Create Custom Module'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-light-on-surface-variant hover:text-light-on-surface p-1 rounded"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Module Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Introduction to Graphic Design"
                  className="w-full px-2.5 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Module Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="MOD-DES-101"
                    className="w-full px-2.5 py-1 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="v1.0"
                    className="w-full px-2.5 py-1 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="Design">Design</option>
                    <option value="UI/UX">UI/UX</option>
                    <option value="Programming">Programming</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Days Duration
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.days}
                    onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
                    className="w-full px-2.5 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Lessons (Day-wise)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.lessons}
                    onChange={(e) => setFormData({ ...formData, lessons: Number(e.target.value) })}
                    className="w-full px-2.5 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Practical Tasks
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.tasks}
                    onChange={(e) => setFormData({ ...formData, tasks: Number(e.target.value) })}
                    className="w-full px-2.5 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Module Summary &amp; Learning Objectives
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline core competency targets, practical projects, and prerequisites..."
                  className="w-full px-2.5 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-light-outline-variant dark:border-dark-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1 rounded border border-light-outline-variant dark:border-dark-outline-variant text-xs hover:bg-light-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 rounded bg-light-primary hover:bg-light-primary-container text-light-on-primary font-semibold text-xs shadow-xs transition-colors"
                >
                  {editingModule ? 'Save Changes' : 'Create Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ModuleLibrary
