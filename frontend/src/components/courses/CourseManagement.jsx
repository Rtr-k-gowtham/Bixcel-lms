import React, { useState, useEffect, useMemo } from 'react'
import { apiService } from '../../services/api'

export function CourseManagement({ onNavigateToModules }) {
  const [courses, setCourses] = useState([])
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')
  const [viewMode, setViewMode] = useState('table') // Default to 'table' (list view)

  // Modal / Drawer state for Create / Edit
  const [showModal, setShowModal] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Module picker filter inside studio
  const [moduleSearch, setModuleSearch] = useState('')
  const [moduleCategoryFilter, setModuleCategoryFilter] = useState('all')

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    code: '',
    category: 'Engineering',
    instructor: '',
    level: 'Intermediate',
    price: '',
    currency: '₹',
    status: 'Published',
    description: '',
    selectedModuleIds: [],
  })

  // Load Courses and Modules on mount
  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      setLoading(true)
      try {
        const [coursesRes, modulesRes] = await Promise.allSettled([
          apiService.getCourses(),
          apiService.getModules(),
        ])

        if (isMounted) {
          if (coursesRes.status === 'fulfilled' && coursesRes.value?.data) {
            setCourses(coursesRes.value.data)
          } else {
            setCourses([])
          }

          if (modulesRes.status === 'fulfilled' && modulesRes.value?.data) {
            setModules(modulesRes.value.data)
          } else {
            setModules([])
          }
        }
      } catch (err) {
        console.warn('Error loading courses/modules:', err)
        if (isMounted) {
          setCourses([])
          setModules([])
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    return () => { isMounted = false }
  }, [])

  // Map of modules by ID for quick lookup
  const moduleMap = useMemo(() => {
    const map = new Map()
    modules.forEach((m) => {
      map.set(Number(m.id), m)
    })
    return map
  }, [modules])

  // Automatically calculate total days & total lessons from selected modules
  const calculatedDays = useMemo(() => {
    return formData.selectedModuleIds.reduce((total, id) => {
      const m = moduleMap.get(Number(id))
      return total + (m ? (Number(m.days) || 0) : 0)
    }, 0)
  }, [formData.selectedModuleIds, moduleMap])

  const calculatedLessons = useMemo(() => {
    return formData.selectedModuleIds.reduce((total, id) => {
      const m = moduleMap.get(Number(id))
      return total + (m ? (Number(m.lessons) || (m.days ? m.days * 2 : 0)) : 0)
    }, 0)
  }, [formData.selectedModuleIds, moduleMap])

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingCourse(null)
    setFormData({
      title: '',
      code: `CRS-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(100 + Math.random() * 900)}`,
      category: 'Engineering',
      instructor: '',
      level: 'Intermediate',
      price: '',
      currency: '₹',
      status: 'Published',
      description: '',
      selectedModuleIds: [],
    })
    setModuleSearch('')
    setModuleCategoryFilter('all')
    setShowModal(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (course) => {
    setEditingCourse(course)
    const rawIds = Array.isArray(course.module_ids) ? course.module_ids.map(Number) : []
    setFormData({
      title: course.title || '',
      code: course.code || `CRS-${course.id}`,
      category: course.category || 'Engineering',
      instructor: course.instructor || '',
      level: course.level || 'Intermediate',
      price: course.price ? String(course.price) : '',
      currency: '₹',
      status: course.status || 'Published',
      description: course.description || '',
      selectedModuleIds: rawIds,
    })
    setModuleSearch('')
    setModuleCategoryFilter('all')
    setShowModal(true)
  }

  // Toggle Module Selection
  const handleToggleModule = (modId) => {
    const idNum = Number(modId)
    setFormData((prev) => {
      const exists = prev.selectedModuleIds.includes(idNum)
      return {
        ...prev,
        selectedModuleIds: exists
          ? prev.selectedModuleIds.filter((id) => id !== idNum)
          : [...prev.selectedModuleIds, idNum],
      }
    })
  }

  // Remove single selected module chip
  const handleRemoveModule = (modId) => {
    const idNum = Number(modId)
    setFormData((prev) => ({
      ...prev,
      selectedModuleIds: prev.selectedModuleIds.filter((id) => id !== idNum),
    }))
  }

  // Form submit (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      alert('Course title is required.')
      return
    }

    setSubmitting(true)

    const payload = {
      title: formData.title.trim(),
      code: formData.code.trim(),
      category: formData.category,
      instructor: formData.instructor.trim() || 'Lead Faculty',
      level: formData.level,
      price: formData.price ? parseFloat(formData.price) : 0.00,
      days: calculatedDays, // Automatically detected/calculated days!
      module_ids: formData.selectedModuleIds,
      status: formData.status,
      duration: calculatedDays > 0 ? `${calculatedDays} Instructional Days` : 'Self-paced',
      description: formData.description.trim(),
    }

    try {
      if (editingCourse) {
        const res = await apiService.updateCourse(editingCourse.id, payload)
        const updatedCourse = res?.data || { ...editingCourse, ...payload }
        setCourses((prev) => prev.map((c) => (c.id === editingCourse.id ? updatedCourse : c)))
        setToast(`Course "${payload.title}" updated successfully!`)
      } else {
        const res = await apiService.createCourse(payload)
        const newCourse = res?.data || { ...payload, id: Date.now() }
        setCourses((prev) => [newCourse, ...prev])
        setToast(`Course "${payload.title}" created successfully!`)
      }
      setShowModal(false)
      setEditingCourse(null)
    } catch (err) {
      console.warn('API course save error:', err)
      // Fallback local update
      if (editingCourse) {
        setCourses((prev) => prev.map((c) => (c.id === editingCourse.id ? { ...editingCourse, ...payload } : c)))
      } else {
        setCourses((prev) => [{ ...payload, id: Date.now() }, ...prev])
      }
      setToast(`Saved course: "${payload.title}"`)
      setShowModal(false)
    } finally {
      setSubmitting(false)
      setTimeout(() => setToast(''), 3000)
    }
  }

  // Delete Course
  const handleDelete = async (course) => {
    if (window.confirm(`Are you sure you want to delete course "${course.title}"?`)) {
      setCourses((prev) => prev.filter((c) => c.id !== course.id))
      try {
        await apiService.deleteCourse(course.id)
      } catch (err) {
        console.warn('Delete error:', err)
      }
      setToast(`Course "${course.title}" deleted`)
      setTimeout(() => setToast(''), 2500)
    }
  }

  // Duplicate Course
  const handleDuplicate = (course) => {
    const duplicated = {
      ...course,
      id: Date.now(),
      title: `${course.title} (Copy)`,
      code: `${course.code || 'CRS'}-COPY`,
      status: 'Draft',
    }
    setCourses((prev) => [duplicated, ...prev])
    setToast(`Duplicated as "${duplicated.title}"`)
    setTimeout(() => setToast(''), 2500)
  }

  // Filtered Courses
  const filteredCourses = courses.filter((c) => {
    const matchSearch =
      (c.title || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.code || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.instructor || '').toLowerCase().includes(search.toLowerCase())

    const matchCategory =
      categoryFilter === 'all' ||
      (c.category || '').toLowerCase() === categoryFilter.toLowerCase()

    const matchLevel =
      levelFilter === 'all' ||
      (c.level || '').toLowerCase() === levelFilter.toLowerCase()

    return matchSearch && matchCategory && matchLevel
  })

  // Filtered Modules inside modal module picker
  const filteredModulesForPicker = modules.filter((m) => {
    const matchSearch =
      (m.title || '').toLowerCase().includes(moduleSearch.toLowerCase()) ||
      (m.code || '').toLowerCase().includes(moduleSearch.toLowerCase())

    const matchCat =
      moduleCategoryFilter === 'all' ||
      (m.category || '').toLowerCase() === moduleCategoryFilter.toLowerCase()

    return matchSearch && matchCat
  })

  // Categories list
  const categories = ['all', 'Engineering', 'UI/UX Design', 'Programming', 'Cloud Computing', 'Data Science & AI', 'Digital Marketing']

  // Summary Metrics
  const totalCoursesCount = courses.length
  const totalAssembledDays = courses.reduce((acc, c) => acc + (Number(c.days) || 0), 0)
  const avgCourseDays = totalCoursesCount > 0 ? Math.round(totalAssembledDays / totalCoursesCount) : 0
  const totalFees = courses.reduce((acc, c) => acc + (Number(c.price) || 0), 0)

  return (
    <div className="flex-1 flex flex-col gap-5 p-4 sm:p-6 bg-light-surface-container-lowest/40 dark:bg-dark-surface-container-lowest/30 min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-light-surface-container-highest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface px-4 py-2.5 rounded-lg shadow-lg border border-light-outline-variant dark:border-dark-outline-variant font-label text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary">
            check_circle
          </span>
          <span>{toast}</span>
        </div>
      )}

      {/* Header & Page Title */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-title text-xl sm:text-2xl font-bold text-light-on-surface dark:text-dark-on-surface tracking-tight">
              Course Management
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-light-primary-tint/30 text-light-primary dark:text-dark-primary font-mono">
              {courses.length} Programs
            </span>
          </div>
          <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">
            Frame courses from multiple modular units, configure tuition pricing, and automatically calculate instructional duration.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>+ Create Course</span>
          </button>
        </div>
      </section>

      {/* Top Program Metrics Row */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-xl border border-light-outline-variant/60 dark:border-dark-outline-variant/60 bg-light-surface-container-lowest dark:bg-dark-surface-bright shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-light-on-surface-variant dark:text-dark-on-surface-variant mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider font-label">Total Programs</span>
            <span className="w-7 h-7 rounded-lg bg-light-primary-tint/20 dark:bg-dark-primary-tint/20 text-light-primary dark:text-dark-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">school</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-light-on-surface dark:text-dark-on-surface font-headline tabular-nums">
              {totalCoursesCount}
            </span>
            <span className="text-[11px] text-light-primary font-semibold">Active Catalog</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-light-outline-variant/60 dark:border-dark-outline-variant/60 bg-light-surface-container-lowest dark:bg-dark-surface-bright shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-light-on-surface-variant dark:text-dark-on-surface-variant mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider font-label">Available Modules</span>
            <span className="w-7 h-7 rounded-lg bg-light-primary-tint/20 dark:bg-dark-primary-tint/20 text-light-primary dark:text-dark-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">view_module</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-light-on-surface dark:text-dark-on-surface font-headline tabular-nums">
              {modules.length}
            </span>
            <button
              type="button"
              onClick={onNavigateToModules}
              className="text-[11px] text-light-primary hover:underline font-semibold cursor-pointer"
            >
              Module Library →
            </button>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-light-outline-variant/60 dark:border-dark-outline-variant/60 bg-light-surface-container-lowest dark:bg-dark-surface-bright shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-light-on-surface-variant dark:text-dark-on-surface-variant mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider font-label">Avg. Program Duration</span>
            <span className="w-7 h-7 rounded-lg bg-light-primary-tint/20 dark:bg-dark-primary-tint/20 text-light-primary dark:text-dark-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-light-on-surface dark:text-dark-on-surface font-headline tabular-nums">
              {avgCourseDays} <span className="text-xs font-normal text-light-on-surface-variant">Days</span>
            </span>
            <span className="text-[11px] text-on-success-container bg-success-container px-1.5 py-0.5 rounded font-semibold">
              Auto-Calculated
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-light-outline-variant/60 dark:border-dark-outline-variant/60 bg-light-surface-container-lowest dark:bg-dark-surface-bright shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-light-on-surface-variant dark:text-dark-on-surface-variant mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider font-label">Total Portfolio Tuition</span>
            <span className="w-7 h-7 rounded-lg bg-light-primary-tint/20 dark:bg-dark-primary-tint/20 text-light-primary dark:text-dark-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[16px]">payments</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-light-on-surface dark:text-dark-on-surface font-headline tabular-nums">
              ₹{totalFees.toLocaleString()}
            </span>
            <span className="text-[11px] text-light-on-surface-variant font-medium">Standard Pricing</span>
          </div>
        </div>
      </section>

      {/* Filter and View Controls */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant/70 dark:border-dark-outline-variant/70 rounded-xl p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined text-[18px] text-light-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, code, or faculty lead..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Category */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-label focus:outline-none focus:ring-1 focus:ring-light-primary"
          >
            <option value="all">All Domains</option>
            <option value="Engineering">Engineering</option>
            <option value="UI/UX Design">UI/UX Design</option>
            <option value="Programming">Programming</option>
            <option value="Cloud Computing">Cloud Computing</option>
            <option value="Data Science & AI">Data Science & AI</option>
            <option value="Digital Marketing">Digital Marketing</option>
          </select>

          {/* Level */}
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-label focus:outline-none focus:ring-1 focus:ring-light-primary"
          >
            <option value="all">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {/* View mode toggle */}
          <div className="flex items-center rounded-lg border border-light-outline-variant/80 bg-light-surface-container-low p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${viewMode === 'grid' ? 'bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-primary shadow-xs' : 'text-light-outline hover:text-light-on-surface'}`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-[16px] block">grid_view</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1 rounded ${viewMode === 'table' ? 'bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-primary shadow-xs' : 'text-light-outline hover:text-light-on-surface'}`}
              title="Table View"
            >
              <span className="material-symbols-outlined text-[16px] block">view_list</span>
            </button>
          </div>
        </div>
      </section>

      {/* Course List / Cards Display */}
      {loading ? (
        <div className="py-20 text-center text-light-on-surface-variant flex flex-col items-center justify-center">
          <span className="material-symbols-outlined text-[36px] animate-spin text-light-primary mb-2">progress_activity</span>
          <p className="text-xs font-semibold">Loading courses catalog...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        /* Empty State */
        <div className="py-16 text-center border-2 border-dashed border-light-outline-variant/60 dark:border-dark-outline-variant/60 rounded-2xl bg-light-surface-container-lowest/50 dark:bg-dark-surface-bright/30 flex flex-col items-center justify-center p-6">
          <div className="w-16 h-16 rounded-2xl bg-light-primary-tint/25 text-light-primary flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-[32px]">school</span>
          </div>
          <h3 className="text-base font-bold text-light-on-surface dark:text-dark-on-surface">
            {courses.length === 0 ? 'No Courses Created Yet' : 'No Courses Match Criteria'}
          </h3>
          <p className="text-xs text-light-on-surface-variant max-w-md mt-1 mb-4">
            {courses.length === 0
              ? 'Begin by assembling a multi-module course program. Select modules from your library, set the course fee, and the system will automatically calculate the total instructional days.'
              : 'Try clearing your search query or adjusting the domain and level filters.'}
          </p>
          {courses.length === 0 ? (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-light-primary text-light-on-primary hover:bg-light-primary-container text-xs font-bold shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
              <span>Frame Your First Course</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { setSearch(''); setCategoryFilter('all'); setLevelFilter('all') }}
              className="px-3 py-1.5 rounded-lg border border-light-outline-variant text-xs font-semibold text-light-primary hover:bg-light-surface-container-low cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((c) => {
            const rawIds = Array.isArray(c.module_ids) ? c.module_ids.map(Number) : []
            const selectedModules = rawIds.map((id) => moduleMap.get(id)).filter(Boolean)
            const daysCount = c.days || selectedModules.reduce((acc, m) => acc + (Number(m.days) || 0), 0)

            return (
              <div
                key={c.id}
                className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant/70 dark:border-dark-outline-variant/70 rounded-xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
              >
                <div>
                  {/* Top Bar: Code, Category, Level */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-[11px] font-bold text-light-primary dark:text-dark-primary px-2 py-0.5 rounded bg-light-primary-tint/20 dark:bg-dark-primary-tint/20">
                      {c.code || `CRS-${c.id}`}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-light-surface-container-high dark:bg-dark-surface-container-high text-light-on-surface-variant font-label">
                        {c.level || 'Intermediate'}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === 'Draft' ? 'bg-pending-container text-on-pending-container' : 'bg-success-container text-on-success-container'}`}>
                        {c.status || 'Published'}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="font-title text-base font-bold text-light-on-surface dark:text-dark-on-surface leading-snug group-hover:text-light-primary transition-colors">
                    {c.title}
                  </h3>

                  {/* Category & Faculty Lead */}
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-light-on-surface-variant">
                    <span className="inline-flex items-center gap-1 text-[11px]">
                      <span className="material-symbols-outlined text-[14px] text-light-outline">category</span>
                      {c.category || 'General'}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1 text-[11px] truncate">
                      <span className="material-symbols-outlined text-[14px] text-light-outline">person</span>
                      {c.instructor || 'Faculty Lead'}
                    </span>
                  </div>

                  {/* Description */}
                  {c.description && (
                    <p className="text-xs text-light-on-surface-variant/80 line-clamp-2 mt-2 leading-relaxed">
                      {c.description}
                    </p>
                  )}

                  {/* Assembled Modules Chips */}
                  <div className="mt-3.5 pt-3 border-t border-light-outline-variant/40">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-light-on-surface-variant mb-1.5">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-light-primary">layers</span>
                        Assembled Modules ({rawIds.length})
                      </span>
                      <span className="text-light-primary font-mono text-[10px]">
                        {daysCount} Days Total
                      </span>
                    </div>

                    {selectedModules.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto scrollbar-thin">
                        {selectedModules.map((m) => (
                          <span
                            key={m.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-light-surface-container-high dark:bg-dark-surface-container-high text-light-on-surface font-medium truncate max-w-[200px]"
                            title={`${m.title} (${m.days} days)`}
                          >
                            <span className="font-mono text-light-primary">{m.code || 'MOD'}</span>
                            <span className="truncate">{m.title}</span>
                            <span className="opacity-70 font-mono">({m.days}d)</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-light-outline italic">No modules linked to this course.</span>
                    )}
                  </div>
                </div>

                {/* Bottom Bar: Price & Action Buttons */}
                <div className="pt-3 border-t border-light-outline-variant/60 flex items-center justify-between gap-2">
                  {/* Tuition Price Badge */}
                  <div>
                    <span className="text-[10px] text-light-on-surface-variant uppercase font-bold tracking-wider block">
                      Course Tuition
                    </span>
                    <span className="text-base font-black text-light-on-surface dark:text-dark-on-surface font-headline tabular-nums">
                      {Number(c.price) > 0 ? `₹${Number(c.price).toLocaleString()}` : 'Free / Open'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicate(c)}
                      className="p-1.5 rounded-lg border border-light-outline-variant/60 hover:bg-light-surface-container-high text-light-on-surface-variant hover:text-light-on-surface transition-colors cursor-pointer"
                      title="Duplicate Course"
                    >
                      <span className="material-symbols-outlined text-[16px] block">content_copy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(c)}
                      className="px-2.5 py-1.5 rounded-lg bg-light-surface-container-high hover:bg-light-primary-tint/30 text-light-primary dark:text-dark-primary font-label text-xs font-bold transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c)}
                      className="p-1.5 rounded-lg hover:bg-overdue-container text-light-outline hover:text-overdue transition-colors cursor-pointer"
                      title="Delete Course"
                    >
                      <span className="material-symbols-outlined text-[16px] block">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant/70 dark:border-dark-outline-variant/70 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-light-surface-container-low dark:bg-dark-surface-container border-b border-light-outline-variant dark:border-dark-outline-variant font-label text-light-on-surface-variant uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Course / Title</th>
                  <th className="px-4 py-3">Domain</th>
                  <th className="px-4 py-3">Faculty Lead</th>
                  <th className="px-4 py-3">Modules Assembled</th>
                  <th className="px-4 py-3 text-center">Auto-Detected Days</th>
                  <th className="px-4 py-3">Tuition Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant/50 dark:divide-dark-outline-variant/50 font-body">
                {filteredCourses.map((c) => {
                  const rawIds = Array.isArray(c.module_ids) ? c.module_ids.map(Number) : []
                  const selectedModules = rawIds.map((id) => moduleMap.get(id)).filter(Boolean)
                  const daysCount = c.days || selectedModules.reduce((acc, m) => acc + (Number(m.days) || 0), 0)

                  return (
                    <tr key={c.id} className="hover:bg-light-surface-container-low/60 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-bold text-light-on-surface dark:text-dark-on-surface">
                            {c.title}
                          </span>
                          <span className="font-mono text-[11px] text-light-primary">
                            {c.code || `CRS-${c.id}`} • {c.level}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-light-on-surface-variant">
                        {c.category || 'Engineering'}
                      </td>
                      <td className="px-4 py-3 text-light-on-surface-variant">
                        {c.instructor || 'Lead Instructor'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 font-semibold text-light-on-surface">
                          <span className="material-symbols-outlined text-[14px] text-light-primary">layers</span>
                          {rawIds.length} Modules
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full font-bold font-mono text-[11px] bg-light-primary-tint/25 text-light-primary">
                          {daysCount} Days
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold font-mono text-light-on-surface tabular-nums">
                        {Number(c.price) > 0 ? `₹${Number(c.price).toLocaleString()}` : 'Free'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${c.status === 'Draft' ? 'bg-pending-container text-on-pending-container' : 'bg-success-container text-on-success-container'}`}>
                          {c.status || 'Published'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(c)}
                          className="px-2 py-1 rounded bg-light-surface-container-high hover:bg-light-primary-tint/30 text-light-primary font-bold mr-1.5 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          className="p-1 rounded hover:bg-overdue-container text-light-outline hover:text-overdue cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px] block">delete</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COURSE STUDIO MODAL: FRAME COURSE, MULTI-MODULE PICKER & PRICE SETTER     */}
      {/* ========================================================================= */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright rounded-2xl border border-light-outline-variant dark:border-dark-outline-variant shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-light-outline-variant/70 dark:border-dark-outline-variant/70 flex items-center justify-between shrink-0 bg-light-surface-container-low/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-light-primary text-light-on-primary flex items-center justify-center font-bold">
                  <span className="material-symbols-outlined text-[20px]">school</span>
                </div>
                <div>
                  <h2 className="font-title text-base font-bold text-light-on-surface dark:text-dark-on-surface">
                    {editingCourse ? `Edit Course: ${editingCourse.title}` : 'Frame New Course Program'}
                  </h2>
                  <p className="font-body text-xs text-light-on-surface-variant">
                    Assemble modules, set tuition fee, and auto-detect total instructional days.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg text-light-outline hover:text-light-on-surface hover:bg-light-surface-container-high flex items-center justify-center transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Form Scrollable */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* SECTION 1: Course Identity */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-light-primary dark:text-dark-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                  1. Course Identity & Basic Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Master Full-Stack Web Engineering"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Course Code *
                    </label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g. CRS-FSW-101"
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Domain / Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary font-label"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                      <option value="Programming">Programming</option>
                      <option value="Cloud Computing">Cloud Computing</option>
                      <option value="Data Science & AI">Data Science & AI</option>
                      <option value="Digital Marketing">Digital Marketing</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Faculty Lead / Instructor
                    </label>
                    <input
                      type="text"
                      value={formData.instructor}
                      onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                      placeholder="e.g. Dr. Marcus Vance"
                      className="w-full px-3 py-2 text-xs rounded-lg border border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Target Level
                    </label>
                    <select
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary font-label"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Publication Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary font-label"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: Course Pricing / Tuition */}
              <div className="p-4 rounded-xl border border-light-outline-variant/70 dark:border-dark-outline-variant/70 bg-light-surface-container-low/30 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-light-primary dark:text-dark-primary flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">payments</span>
                  2. Course Pricing & Tuition Fee
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Tuition Fee / Course Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold font-mono text-light-primary">
                        ₹
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="e.g. 25000"
                        className="w-full pl-8 pr-3 py-2 text-xs font-mono font-bold rounded-lg border border-light-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                      Currency
                    </label>
                    <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border border-light-outline-variant bg-light-surface-container-lowest text-light-primary">
                      <span>₹ INR (Indian Rupees)</span>
                    </div>
                  </div>

                  <div className="text-xs text-light-on-surface-variant/80 pb-1">
                    {formData.price ? (
                      <span className="font-semibold text-light-primary">
                        Total Course Tuition: ₹{Number(formData.price).toLocaleString()}
                      </span>
                    ) : (
                      <span>Enter 0 or leave blank for a complimentary open course.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 3: Multi-Module Selection & Automatic Day Detection */}
              <div className="p-4 rounded-xl border-2 border-light-primary/30 dark:border-dark-primary/30 bg-light-primary-tint/10 dark:bg-dark-primary-tint/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-light-primary dark:text-dark-primary flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">view_module</span>
                      3. Frame Curriculum: Multi-Module Selection &amp; Auto-Detected Days
                    </h3>
                    <p className="text-[11px] text-light-on-surface-variant mt-0.5">
                      Select one or multiple modules. The total course days are automatically calculated from the chosen modules.
                    </p>
                  </div>

                  {/* AUTO-CALCULATED DURATION BANNER */}
                  <div className="flex items-center gap-2 bg-light-surface-container-lowest dark:bg-dark-surface-bright px-3 py-2 rounded-xl border border-light-primary/40 shadow-xs shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-light-primary">timelapse</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-light-on-surface-variant">Auto-Detected:</span>
                        <span className="text-sm font-black text-light-primary font-headline tabular-nums">
                          {calculatedDays} Days
                        </span>
                      </div>
                      <span className="text-[10px] text-light-on-surface-variant">
                        {formData.selectedModuleIds.length} Modules • {calculatedLessons} Lessons
                      </span>
                    </div>
                  </div>
                </div>

                {/* Selected Modules Sequence List */}
                {formData.selectedModuleIds.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-light-on-surface-variant block mb-1.5">
                      Framed Course Modules Sequence ({formData.selectedModuleIds.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {formData.selectedModuleIds.map((id, idx) => {
                        const m = moduleMap.get(id)
                        if (!m) return null
                        return (
                          <div
                            key={id}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-light-primary-tint/25 text-light-on-surface border border-light-primary/30 text-xs font-medium"
                          >
                            <span className="w-4 h-4 rounded-full bg-light-primary text-light-on-primary text-[10px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="font-mono text-light-primary font-bold">{m.code || 'MOD'}</span>
                            <span className="font-semibold truncate max-w-[150px]">{m.title}</span>
                            <span className="font-mono text-[11px] text-light-primary font-bold">({m.days}d)</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveModule(id)}
                              className="text-light-outline hover:text-overdue ml-1 cursor-pointer"
                              title="Remove module"
                            >
                              <span className="material-symbols-outlined text-[14px] block">close</span>
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Module Search & Category Filter for Picker */}
                <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                  <div className="relative flex-1 w-full">
                    <span className="material-symbols-outlined text-[16px] text-light-outline absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      search
                    </span>
                    <input
                      type="text"
                      value={moduleSearch}
                      onChange={(e) => setModuleSearch(e.target.value)}
                      placeholder="Search available modules to add..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-light-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
                    />
                  </div>
                  <select
                    value={moduleCategoryFilter}
                    onChange={(e) => setModuleCategoryFilter(e.target.value)}
                    className="w-full sm:w-auto px-2.5 py-1.5 text-xs rounded-lg border border-light-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface font-label focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="all">All Module Categories</option>
                    <option value="Engineering">Engineering</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Programming">Programming</option>
                    <option value="Cloud Computing">Cloud Computing</option>
                    <option value="Data Science & AI">Data Science & AI</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                  </select>
                </div>

                {/* Modules Grid with Checkboxes */}
                {modules.length === 0 ? (
                  <div className="p-6 text-center bg-light-surface-container-lowest dark:bg-dark-surface-bright rounded-xl border border-dashed border-light-outline-variant">
                    <span className="material-symbols-outlined text-[28px] text-light-outline mb-1 block">library_add</span>
                    <p className="text-xs font-semibold text-light-on-surface">No modules found in Module Library</p>
                    <p className="text-[11px] text-light-on-surface-variant mt-0.5 mb-2.5">
                      Create your course modules first in the Module Library to compose full academic tracks.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); onNavigateToModules?.() }}
                      className="px-3 py-1.5 rounded-lg bg-light-primary text-light-on-primary text-xs font-bold shadow-xs cursor-pointer"
                    >
                      Go to Module Library →
                    </button>
                  </div>
                ) : filteredModulesForPicker.length === 0 ? (
                  <div className="p-4 text-center text-xs text-light-on-surface-variant bg-light-surface-container-lowest rounded-lg">
                    No modules match the filter query.
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto p-1 scrollbar-thin">
                    {filteredModulesForPicker.map((m) => {
                      const idNum = Number(m.id)
                      const isSelected = formData.selectedModuleIds.includes(idNum)

                      return (
                        <div
                          key={m.id}
                          onClick={() => handleToggleModule(idNum)}
                          className={`px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between gap-3 select-none ${
                            isSelected
                              ? 'bg-light-primary-tint/25 dark:bg-dark-primary-tint/25 border-light-primary shadow-xs ring-1 ring-light-primary/30'
                              : 'bg-light-surface-container-lowest/90 dark:bg-dark-surface-bright/70 border-light-outline-variant/60 hover:border-light-outline-variant hover:bg-light-surface-container-lowest'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // handled by parent div
                              className="rounded text-light-primary focus:ring-light-primary cursor-pointer shrink-0"
                            />
                            <span className="font-mono text-[10px] font-bold text-light-primary px-1.5 py-0.5 rounded bg-light-primary-tint/20 shrink-0">
                              {m.code || `MOD-${m.id}`}
                            </span>
                            <span className="font-semibold text-light-on-surface dark:text-dark-on-surface truncate">
                              {m.title}
                            </span>
                            <span className="text-[10px] text-light-on-surface-variant px-1.5 py-0.5 rounded bg-light-surface-container-low shrink-0 hidden sm:inline">
                              {m.category || 'General'}
                            </span>
                            {m.tutor && (
                              <span className="text-[10px] text-light-primary font-medium shrink-0 hidden md:inline">
                                Tutor: {m.tutor}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-light-on-surface-variant font-mono">
                              {m.lessons || (m.days ? m.days * 2 : 2)} Lessons
                            </span>
                            <span className="font-mono text-[11px] font-bold text-light-primary px-2 py-0.5 rounded bg-light-primary/10">
                              {m.days || 1} Days
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* SECTION 4: Description */}
              <div>
                <label className="block text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Course Overview &amp; Learning Outcomes
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline syllabus highlights, prerequisites, career pathways, and certification criteria..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
                ></textarea>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-light-outline-variant/70 shrink-0">
                <div className="text-xs text-light-on-surface-variant">
                  {calculatedDays > 0 ? (
                    <span className="font-semibold text-light-primary">
                      ✓ Program duration: {calculatedDays} Days ({formData.selectedModuleIds.length} modules selected)
                    </span>
                  ) : (
                    <span>Select modules above to auto-detect program duration.</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg border border-light-outline-variant text-xs font-semibold text-light-on-surface hover:bg-light-surface-container-low transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-light-primary text-light-on-primary hover:bg-light-primary-container text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[16px]">save</span>
                    <span>{submitting ? 'Saving Course...' : editingCourse ? 'Save Changes' : 'Publish Course'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseManagement
