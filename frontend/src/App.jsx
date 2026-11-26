import { useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Badge from './components/Badge'
import Button from './components/Button'
import { apiService } from './services/api'

function Dashboard() {
  const [currentTab, setCurrentTab] = useState('dashboard')
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // API State
  const [health, setHealth] = useState(null)
  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)

  // Create Course Modal State
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    instructor: '',
    level: 'Beginner',
    duration: '',
    description: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setCoursesLoading(true)
    try {
      const [healthData, coursesData] = await Promise.allSettled([
        apiService.checkHealth(),
        apiService.getCourses(),
      ])

      if (healthData.status === 'fulfilled') {
        setHealth(healthData.value)
      } else {
        setHealth(null)
      }

      if (coursesData.status === 'fulfilled' && coursesData.value?.data) {
        setCourses(coursesData.value.data)
      }
    } catch {
      // Handled silently
    } finally {
      setCoursesLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateCourse = async (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    setSubmitting(true)
    setFormSuccess('')
    try {
      const res = await apiService.createCourse(formData)
      if (res && res.data) {
        setCourses((prev) => [res.data, ...prev])
        setFormSuccess('Course created and published in CodeIgniter 4 backend.')
        setFormData({
          title: '',
          instructor: '',
          level: 'Beginner',
          duration: '',
          description: '',
        })
        setTimeout(() => {
          setShowModal(false)
          setFormSuccess('')
        }, 1200)
      }
    } catch (err) {
      alert(err.response?.data?.messages?.title || err.message || 'Failed to create course')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-light-surface dark:bg-dark-surface text-light-on-surface dark:text-dark-on-surface font-body antialiased transition-colors duration-state-change">
      {/* Persistent Deep Navy Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Header */}
        <Header
          breadcrumbCurrent={
            currentTab === 'courses'
              ? 'Course Management'
              : currentTab === 'batches'
              ? 'Batch Management'
              : 'Executive Overview'
          }
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          health={health}
          onRefresh={fetchData}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-8 flex flex-col gap-6 max-w-[1440px] w-full mx-auto">
          {/* Page Header */}
          <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="font-headline text-headline-lg font-semibold text-light-on-surface dark:text-dark-on-surface">
                Executive Dashboard
              </h1>
              <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Overview of institute performance and academic operations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {/* Date pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface whitespace-nowrap">
                <span className="material-symbols-outlined text-[18px] text-light-outline">calendar_today</span>
                <span className="font-label text-label-md tabular-nums">Nov 26, 2026</span>
              </div>

              {/* Add Course Button */}
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary shadow-sm hover:bg-light-primary-container transition-colors duration-state-change whitespace-nowrap font-label text-label-lg"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Create Course</span>
              </button>

              {/* Export Report Button */}
              <button
                type="button"
                onClick={() => alert('Exporting executive report...')}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface shadow-sm hover:bg-light-surface-container-low transition-colors duration-state-change whitespace-nowrap font-label text-label-lg"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Export Report</span>
              </button>
            </div>
          </section>

          {/* 5 KPI Cards Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-stretch">
            {/* KPI 1 */}
            <article className="h-full bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-5 shadow-sm flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant whitespace-nowrap">
                  Total Enrolled Students
                </span>
                <span className="w-8 h-8 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary inline-flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">groups</span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-headline text-headline-lg tabular-nums text-light-on-surface dark:text-dark-on-surface">
                  2,840
                </span>
                <span className="font-label text-label-sm text-on-success-container bg-success-container px-2.5 py-0.5 rounded-full tabular-nums whitespace-nowrap font-semibold">
                  +8.4%
                </span>
              </div>
            </article>

            {/* KPI 2 */}
            <article className="h-full bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-5 shadow-sm flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant whitespace-nowrap">
                  Active Tutors
                </span>
                <span className="w-8 h-8 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary inline-flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">co_present</span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-headline text-headline-lg tabular-nums text-light-on-surface dark:text-dark-on-surface">
                  64
                </span>
                <span className="font-label text-label-sm text-on-success-container bg-success-container px-2.5 py-0.5 rounded-full tabular-nums whitespace-nowrap font-semibold">
                  +3 this term
                </span>
              </div>
            </article>

            {/* KPI 3 (Live Backend Synced) */}
            <article className="h-full bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-5 shadow-sm flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant whitespace-nowrap">
                  Published Courses
                </span>
                <span className="w-8 h-8 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary inline-flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-headline text-headline-lg tabular-nums text-light-on-surface dark:text-dark-on-surface">
                  {courses.length}
                </span>
                <span className="font-label text-label-sm text-on-pending-container bg-pending-container px-2.5 py-0.5 rounded-full tabular-nums whitespace-nowrap font-semibold">
                  {health ? 'CI4 Synced' : 'Connecting'}
                </span>
              </div>
            </article>

            {/* KPI 4 */}
            <article className="h-full bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-5 shadow-sm flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant whitespace-nowrap">
                  Running Batches
                </span>
                <span className="w-8 h-8 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary inline-flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">workspaces</span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-headline text-headline-lg tabular-nums text-light-on-surface dark:text-dark-on-surface">
                  24
                </span>
                <span className="font-label text-label-sm text-on-success-container bg-success-container px-2.5 py-0.5 rounded-full whitespace-nowrap font-semibold">
                  On schedule
                </span>
              </div>
            </article>

            {/* KPI 5 */}
            <article className="h-full bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-5 shadow-sm flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-label text-label-md text-light-on-surface-variant dark:text-dark-on-surface-variant whitespace-nowrap">
                  Classroom Utilization
                </span>
                <span className="w-8 h-8 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary inline-flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">meeting_room</span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="font-headline text-headline-lg tabular-nums text-light-on-surface dark:text-dark-on-surface">
                  86.5%
                </span>
                <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums whitespace-nowrap font-medium">
                  18/20 rooms
                </span>
              </div>
            </article>
          </section>

          {/* Primary Analytics & Live Classes Row */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
            {/* Student Performance Analytics Chart (7 cols) */}
            <article className="xl:col-span-7 bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-6 shadow-sm flex flex-col justify-between gap-5">
              <header className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-title text-title-lg text-light-on-surface dark:text-dark-on-surface font-semibold">
                    Student Performance Analytics
                  </h2>
                  <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Average assessment score vs. curriculum completion across active cohorts
                  </p>
                </div>
                <span className="font-label text-label-md text-light-on-primary-tint bg-light-primary-tint px-3 py-1 rounded-full shrink-0 whitespace-nowrap font-medium">
                  Fall 2026
                </span>
              </header>

              <div className="grid grid-cols-6 gap-4 items-end h-44 pt-4 border-b border-light-outline-variant dark:border-dark-outline-variant pb-3">
                {[
                  { cohort: 'CS-401', score: 82, completion: 74 },
                  { cohort: 'DS-204', score: 88, completion: 91 },
                  { cohort: 'CA-302', score: 76, completion: 68 },
                  { cohort: 'UX-110', score: 92, completion: 86 },
                  { cohort: 'SE-215', score: 79, completion: 81 },
                  { cohort: 'AI-501', score: 85, completion: 79 },
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                    <div className="w-full max-w-[40px] flex items-end gap-1 h-32">
                      <div
                        className="flex-1 bg-light-primary rounded-t"
                        style={{ height: `${item.score}%` }}
                        title={`Academic Score: ${item.score}%`}
                      />
                      <div
                        className="flex-1 bg-light-secondary-container dark:bg-dark-secondary-container rounded-t"
                        style={{ height: `${item.completion}%` }}
                        title={`Curriculum Completion: ${item.completion}%`}
                      />
                    </div>
                    <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
                      {item.cohort}
                    </span>
                  </div>
                ))}
              </div>

              <footer className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-light-primary"></span>
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Academic Score (83.7% avg)
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm bg-light-secondary-container"></span>
                    <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Curriculum Completion (79.8% avg)
                    </span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Opening full cohort analytics view...')}
                  className="font-label text-label-md text-light-primary hover:underline whitespace-nowrap font-semibold"
                >
                  View Analytics →
                </button>
              </footer>
            </article>

            {/* Attendance Summary & Smart Notifications (5 cols) */}
            <div className="xl:col-span-5 flex flex-col gap-6">
              {/* Attendance Card */}
              <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-6 shadow-sm flex flex-col gap-4">
                <header className="flex items-center justify-between gap-2">
                  <h2 className="font-title text-title-lg text-light-on-surface dark:text-dark-on-surface font-semibold">
                    Attendance Summary
                  </h2>
                  <span className="font-label text-label-md text-on-success-container bg-success-container px-2.5 py-0.5 rounded-full tabular-nums whitespace-nowrap font-semibold">
                    92.4% Today
                  </span>
                </header>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex flex-col gap-1">
                    <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Present
                    </span>
                    <span className="font-title text-title-lg tabular-nums text-on-success-container font-semibold">
                      1,412
                    </span>
                  </div>
                  <div className="p-3 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex flex-col gap-1">
                    <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Late / Leave
                    </span>
                    <span className="font-title text-title-lg tabular-nums text-on-pending-container font-semibold">
                      74
                    </span>
                  </div>
                  <div className="p-3 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex flex-col gap-1">
                    <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      Absent
                    </span>
                    <span className="font-title text-title-lg tabular-nums text-on-overdue-container font-semibold">
                      42
                    </span>
                  </div>
                </div>
              </article>

              {/* Smart Notifications */}
              <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-6 shadow-sm flex-1 flex flex-col gap-3">
                <header className="flex items-center justify-between gap-2">
                  <h2 className="font-title text-title-lg text-light-on-surface dark:text-dark-on-surface font-semibold">
                    Smart Notifications
                  </h2>
                  <span className="font-label text-label-sm text-light-primary font-semibold whitespace-nowrap">
                    4 Active
                  </span>
                </header>
                <ul className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
                  <li className="py-2.5 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-overdue shrink-0"></span>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface font-medium">
                        14 fee installments overdue in Batch B26-FS-A
                      </span>
                      <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        Finance • 18 mins ago
                      </span>
                    </div>
                  </li>
                  <li className="py-2.5 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-pending shrink-0"></span>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface font-medium">
                        Room 204 scheduling conflict detected for Nov 28
                      </span>
                      <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        Timetable • 1 hour ago
                      </span>
                    </div>
                  </li>
                </ul>
              </article>
            </div>
          </section>

          {/* Today's Live Classes & CI4 Course Catalog Row */}
          <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Today's Live Classes Table (7 cols) */}
            <div className="xl:col-span-7 bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm overflow-hidden flex flex-col">
              <header className="px-6 py-4 border-b border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-title text-title-lg text-light-on-surface dark:text-dark-on-surface font-semibold">
                    Today's Live Classes &amp; CI4 Courses
                  </h2>
                  <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Real-time schedule connected to CodeIgniter 4 REST API
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="font-label text-label-md text-light-primary hover:underline whitespace-nowrap shrink-0 font-semibold"
                >
                  + Add Course
                </button>
              </header>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-light-surface-container-low dark:bg-dark-surface-container border-b border-light-outline-variant dark:border-dark-outline-variant">
                      <th scope="col" className="px-5 py-3 text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        <span className="font-label text-label-md whitespace-nowrap font-medium">Course / Title</span>
                      </th>
                      <th scope="col" className="px-5 py-3 text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        <span className="font-label text-label-md whitespace-nowrap font-medium">Faculty Tutor</span>
                      </th>
                      <th scope="col" className="px-5 py-3 text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        <span className="font-label text-label-md whitespace-nowrap font-medium">Duration / Level</span>
                      </th>
                      <th scope="col" className="px-5 py-3 text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        <span className="font-label text-label-md whitespace-nowrap font-medium">Status</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
                    {courses.map((course, idx) => (
                      <tr key={course.id || idx} className="hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors">
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface whitespace-nowrap font-medium">
                              {course.title}
                            </span>
                            <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                              CRS-{100 + Number(course.id || idx + 1)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface">
                            {course.instructor || 'Dr. Marcus Vance'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 tabular-nums whitespace-nowrap">
                          <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            {course.duration || '6 Weeks'} • {course.level || 'Intermediate'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success-container text-on-success-container whitespace-nowrap font-label text-label-md font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                            <span>Active (CI4)</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Grading & Upcoming Exams (5 cols) */}
            <div className="xl:col-span-5 flex flex-col gap-6">
              <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-6 shadow-sm flex flex-col gap-4">
                <header className="flex items-center justify-between gap-2">
                  <h2 className="font-title text-title-lg text-light-on-surface dark:text-dark-on-surface whitespace-nowrap font-semibold">
                    Pending Grading &amp; Exams
                  </h2>
                  <span className="font-label text-label-md text-on-pending-container bg-pending-container px-2.5 py-0.5 rounded-full tabular-nums whitespace-nowrap shrink-0 font-semibold">
                    38 Pending
                  </span>
                </header>

                <div className="space-y-3">
                  <div className="p-3 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex items-center justify-between">
                    <div>
                      <p className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface font-semibold">
                        CS-401 Mid-Term Evaluation
                      </p>
                      <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        Batch B26-FS-A • 48 Submissions
                      </p>
                    </div>
                    <Badge variant="pending" dot>Due in 2 days</Badge>
                  </div>

                  <div className="p-3 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex items-center justify-between">
                    <div>
                      <p className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface font-semibold">
                        DS-204 Neural Network Project
                      </p>
                      <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        Batch B26-DS-B • 42 Submissions
                      </p>
                    </div>
                    <Badge variant="verified">Graded</Badge>
                  </div>
                </div>
              </article>
            </div>
          </section>
        </main>
      </div>

      {/* Create Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-md p-5 animate-in fade-in zoom-in-95 duration-state-change">
            <div className="flex items-center justify-between pb-3 border-b border-light-outline-variant dark:border-dark-outline-variant mb-4">
              <div>
                <h3 className="font-title text-title-lg font-bold text-light-on-surface dark:text-dark-on-surface">
                  Create New Course
                </h3>
                <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Saves directly to CodeIgniter 4 backend
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-light-on-surface-variant hover:text-light-on-surface p-1 rounded"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {formSuccess && (
              <div className="mb-3 p-2.5 rounded bg-success-container text-on-success-container text-body-sm font-medium">
                ✓ {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-3">
              <div>
                <label className="block font-label text-label-md font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Full-Stack Web Engineering"
                  className="w-full px-3 py-1.5 font-body text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label text-label-md font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Faculty Tutor
                  </label>
                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    placeholder="e.g. Dr. Marcus Vance"
                    className="w-full px-3 py-1.5 font-body text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
                <div>
                  <label className="block font-label text-label-md font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Level
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-1.5 font-body text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-label text-label-md font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Duration &amp; Schedule
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g. Lab 304 • 09:00 AM"
                  className="w-full px-3 py-1.5 font-body text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div>
                <label className="block font-label text-label-md font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="2"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Curriculum summary..."
                  className="w-full px-3 py-1.5 font-body text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-light-outline-variant dark:border-dark-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="px-3 py-1.5 font-label text-label-md rounded border border-light-outline-variant text-light-on-surface hover:bg-light-surface-container-low"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 font-label text-label-md rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container shadow-sm font-semibold"
                >
                  {submitting ? 'Publishing...' : 'Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <Dashboard />
    </ThemeProvider>
  )
}
