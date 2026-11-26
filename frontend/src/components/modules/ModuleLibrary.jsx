import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

const DEFAULT_MODULES = [
  {
    id: 1,
    title: 'Introduction to Graphic Design',
    code: 'MOD-DES-101',
    version: 'v2.1',
    category: 'Design',
    status: 'Published',
    days: 7,
    lessons: 14,
    tasks: 6,
    assignments: 3,
    tests: 2,
    milestones: 1,
    updated_at: '2026-11-18',
    description: 'Fundamental principles of color theory, typography, grid layouts, and visual hierarchy using industry tools.',
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

  // Form state
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
          setModules(res.data)
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
      lessons: 12,
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

  const handleDuplicate = (m) => {
    const duplicated = {
      ...m,
      id: Date.now(),
      title: `${m.title} (Copy)`,
      code: `${m.code}-COPY`,
      version: 'v1.0',
      status: 'Draft',
    }
    setModules([duplicated, ...modules])
    setToast(`Module duplicated as "${duplicated.title}"`)
    setTimeout(() => setToast(''), 3000)
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
      try {
        await apiService.updateModule(editingModule.id, formData)
      } catch (err) {
        console.warn('API update failed:', err)
      }
      setModules((prev) =>
        prev.map((item) => (item.id === editingModule.id ? { ...item, ...formData } : item))
      )
      setToast(`Module "${formData.title}" updated`)
    } else {
      const newMod = {
        id: Date.now(),
        ...formData,
        updated_at: new Date().toISOString().slice(0, 10),
      }
      try {
        await apiService.createModule(formData)
      } catch (err) {
        console.warn('API create failed:', err)
      }
      setModules([newMod, ...modules])
      setToast(`Module "${formData.title}" created successfully`)
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
    <div className="flex flex-col gap-6 w-full">
      {/* Toast Notification */}
      {toast && (
        <div className="p-3 rounded-md bg-success-container text-on-success-container font-label text-label-md font-semibold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{toast}</span>
          </div>
          <button type="button" onClick={() => setToast('')}>
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline text-headline-lg font-semibold text-light-on-surface dark:text-dark-on-surface">
            Module Library
          </h1>
          <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Manage and reuse standardized curriculum modules across active courses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setToast('Import curriculum dialog opened')
              setTimeout(() => setToast(''), 3000)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low transition-colors whitespace-nowrap font-label text-label-lg"
          >
            <span className="material-symbols-outlined text-[18px]">upload_file</span>
            <span>Import Module</span>
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container shadow-sm transition-colors whitespace-nowrap font-label text-label-lg"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Create Custom Module</span>
          </button>
        </div>
      </section>

      {/* 4 Statistics Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Module Statistics">
        {/* Total Modules */}
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-4.5 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Total Modules
            </span>
            <span className="font-headline text-headline-lg font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
              {modules.length < 10 ? `0${modules.length}` : modules.length}
            </span>
            <span className="inline-flex items-center gap-1 text-light-primary text-label-sm font-medium">
              <span className="material-symbols-outlined text-[14px]">layers</span>
              <span>Versioned blocks</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">library_books</span>
          </div>
        </article>

        {/* Published Modules */}
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-4.5 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Published Modules
            </span>
            <span className="font-headline text-headline-lg font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
              {publishedCount < 10 ? `0${publishedCount}` : publishedCount}
            </span>
            <span className="inline-flex items-center gap-1.5 text-on-success-container text-label-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
              <span>Ready for courses</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded bg-success-container text-on-success-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
          </div>
        </article>

        {/* Draft Modules */}
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-4.5 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Draft Modules
            </span>
            <span className="font-headline text-headline-lg font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
              {draftCount < 10 ? `0${draftCount}` : draftCount}
            </span>
            <span className="inline-flex items-center gap-1.5 text-on-pending-container text-label-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-pending"></span>
              <span>In curriculum QA</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded bg-pending-container text-on-pending-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">edit_note</span>
          </div>
        </article>

        {/* Categories */}
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-4.5 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Categories
            </span>
            <span className="font-headline text-headline-lg font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
              {categoriesCount < 10 ? `0${categoriesCount}` : categoriesCount}
            </span>
            <span className="inline-flex items-center gap-1 text-light-on-surface-variant text-label-sm font-medium">
              <span className="material-symbols-outlined text-[14px]">category</span>
              <span>Departmental tags</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded bg-light-secondary-container text-light-on-secondary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[20px]">folder_copy</span>
          </div>
        </article>
      </section>

      {/* Filter and Search Bar */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="relative flex items-center w-full lg:w-80">
          <span className="material-symbols-outlined text-light-outline text-[18px] absolute left-3 pointer-events-none">
            search
          </span>
          <input
            type="search"
            placeholder="Search modules by title or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-sm placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface font-body text-body-sm focus:outline-none focus:ring-1 focus:ring-light-primary"
          >
            <option value="all">All Categories</option>
            <option value="Design">Design</option>
            <option value="UI/UX">UI/UX</option>
            <option value="Programming">Programming</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface font-body text-body-sm focus:outline-none focus:ring-1 focus:ring-light-primary"
          >
            <option value="all">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface font-body text-body-sm focus:outline-none focus:ring-1 focus:ring-light-primary"
          >
            <option value="updated">Sort: Recently Updated</option>
            <option value="days-desc">Sort: Instructional Days</option>
            <option value="title-asc">Sort: Title (A–Z)</option>
          </select>
        </div>
      </section>

      {/* Module Cards Grid (2-columns matching reference) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
        {filteredModules.map((m) => {
          const isAdded = addedModules[m.id]
          return (
            <article
              key={m.id}
              className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-5 flex flex-col justify-between gap-4 h-full hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col gap-4">
                {/* Header Tag Bar */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant font-semibold">
                        {m.code}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant font-mono text-[11px]">
                        {m.version}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint font-label text-[11px] font-semibold">
                        {m.category}
                      </span>
                    </div>
                    <h2 className="font-title text-[16px] font-bold text-light-on-surface dark:text-dark-on-surface mt-0.5">
                      {m.title}
                    </h2>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-semibold shrink-0 ${
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
                </div>

                {/* 6 Metric Boxes */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex flex-col gap-0.5">
                    <span className="font-label text-[11px] text-light-on-surface-variant">Duration</span>
                    <span className="font-label text-label-md font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                      {m.days} Days
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex flex-col gap-0.5">
                    <span className="font-label text-[11px] text-light-on-surface-variant">Lessons</span>
                    <span className="font-label text-label-md font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                      {m.lessons} Lessons
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex flex-col gap-0.5">
                    <span className="font-label text-[11px] text-light-on-surface-variant">Practical Tasks</span>
                    <span className="font-label text-label-md font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                      {m.tasks} Tasks
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex flex-col gap-0.5">
                    <span className="font-label text-[11px] text-light-on-surface-variant">Assignments</span>
                    <span className="font-label text-label-md font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                      {m.assignments}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex flex-col gap-0.5">
                    <span className="font-label text-[11px] text-light-on-surface-variant">Tests</span>
                    <span className="font-label text-label-md font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                      {m.tests}
                    </span>
                  </div>
                  <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex flex-col gap-0.5">
                    <span className="font-label text-[11px] text-light-on-surface-variant">Milestones</span>
                    <span className="font-label text-label-md font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                      {m.milestones}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <footer className="pt-3 border-t border-light-outline-variant dark:border-dark-outline-variant flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setInspectModule(m)}
                    className="px-2.5 py-1.5 rounded text-light-on-surface-variant hover:bg-light-surface-container-low font-label text-label-sm font-medium transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(m)}
                    className="px-2.5 py-1.5 rounded text-light-on-surface-variant hover:bg-light-surface-container-low font-label text-label-sm font-medium transition-colors"
                  >
                    Edit Module
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicate(m)}
                    className="px-2.5 py-1.5 rounded text-light-on-surface-variant hover:bg-light-surface-container-low font-label text-label-sm font-medium transition-colors"
                  >
                    Duplicate
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => toggleAddedToCourse(m.id, m.title)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded font-label text-label-sm font-semibold transition-colors whitespace-nowrap ${
                    isAdded
                      ? 'bg-success text-white'
                      : 'bg-light-primary text-light-on-primary hover:bg-light-primary-container'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isAdded ? 'check' : 'add'}
                  </span>
                  <span>{isAdded ? 'Added to Course' : 'Add to Course'}</span>
                </button>
              </footer>
            </article>
          )
        })}
      </section>

      {/* View Details Drawer / Modal */}
      {inspectModule && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-lg p-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-light-outline-variant dark:border-dark-outline-variant mb-4">
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

            <div className="space-y-3 font-body text-body-sm">
              <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant leading-relaxed">
                {inspectModule.description}
              </p>

              <div className="grid grid-cols-3 gap-2 p-3 rounded bg-light-surface-container-low dark:bg-dark-surface-container">
                <div>
                  <span className="text-[11px] text-light-on-surface-variant block">Duration:</span>
                  <strong className="text-light-on-surface dark:text-dark-on-surface">{inspectModule.days} Days</strong>
                </div>
                <div>
                  <span className="text-[11px] text-light-on-surface-variant block">Category:</span>
                  <strong className="text-light-on-surface dark:text-dark-on-surface">{inspectModule.category}</strong>
                </div>
                <div>
                  <span className="text-[11px] text-light-on-surface-variant block">Status:</span>
                  <strong className="text-light-on-surface dark:text-dark-on-surface">{inspectModule.status}</strong>
                </div>
              </div>

              <div className="pt-2">
                <span className="font-label text-label-sm font-bold text-light-on-surface dark:text-dark-on-surface block mb-1">
                  Curriculum Components
                </span>
                <ul className="text-body-xs space-y-1 text-light-on-surface-variant">
                  <li>• {inspectModule.lessons} Standardized Instructional Lectures</li>
                  <li>• {inspectModule.tasks} Hands-On Guided Lab Exercises</li>
                  <li>• {inspectModule.assignments} Graded Project Submissions</li>
                  <li>• {inspectModule.milestones} Verified Competency Milestone</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-light-outline-variant dark:border-dark-outline-variant mt-4">
              <button
                type="button"
                onClick={() => setInspectModule(null)}
                className="px-4 py-1.5 rounded bg-light-surface-container-low text-body-sm font-semibold hover:bg-light-surface-container transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Module Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-lg p-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-light-outline-variant dark:border-dark-outline-variant mb-4">
              <h3 className="font-title text-[16px] font-bold text-light-on-surface dark:text-dark-on-surface">
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

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Module Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Introduction to Graphic Design"
                  className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Module Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="MOD-DES-101"
                    className="w-full px-3 py-1.5 text-body-sm font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary uppercase"
                  />
                </div>
                <div>
                  <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    placeholder="v1.0"
                    className="w-full px-3 py-1.5 text-body-sm font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
                <div>
                  <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="Design">Design</option>
                    <option value="UI/UX">UI/UX</option>
                    <option value="Programming">Programming</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Days Duration
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.days}
                    onChange={(e) => setFormData({ ...formData, days: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
                <div>
                  <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Lessons Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.lessons}
                    onChange={(e) => setFormData({ ...formData, lessons: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
                <div>
                  <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Practical Tasks
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.tasks}
                    onChange={(e) => setFormData({ ...formData, tasks: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Module Summary &amp; Learning Objectives
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline core competency targets, practical projects, and prerequisites..."
                  className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-light-outline-variant dark:border-dark-outline-variant mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant text-body-sm hover:bg-light-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-light-primary hover:bg-light-primary-container text-light-on-primary font-semibold text-body-sm shadow-sm transition-colors"
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
