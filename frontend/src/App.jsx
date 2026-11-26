import { useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Card from './components/Card'
import Badge from './components/Badge'
import Button from './components/Button'
import { apiService } from './services/api'

function DashboardContent() {
  const [currentTab, setCurrentTab] = useState('dashboard')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // API State
  const [health, setHealth] = useState(null)
  const [healthLoading, setHealthLoading] = useState(true)

  const [courses, setCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(true)
  const [coursesError, setCoursesError] = useState(null)

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
    fetchHealth()
    fetchCourses()
  }, [])

  const fetchHealth = async () => {
    setHealthLoading(true)
    try {
      const data = await apiService.checkHealth()
      setHealth(data)
    } catch {
      setHealth(null)
    } finally {
      setHealthLoading(false)
    }
  }

  const fetchCourses = async () => {
    setCoursesLoading(true)
    setCoursesError(null)
    try {
      const res = await apiService.getCourses()
      if (res && res.data) {
        setCourses(res.data)
      }
    } catch (err) {
      setCoursesError(err.message || 'Unable to connect to CodeIgniter 4 backend')
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
        setFormSuccess('Course successfully created in CodeIgniter 4 backend.')
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
    <div className="min-h-screen bg-light-background dark:bg-dark-background text-light-on-surface dark:text-dark-on-surface flex transition-colors duration-state-change">
      {/* Persistent Deep Navy Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Workspace Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-surface-enter ${
          sidebarCollapsed ? 'ml-20' : 'ml-sidebar-w'
        }`}
      >
        {/* Header */}
        <Header
          title={currentTab === 'courses' ? 'Course Catalog & Curriculum' : 'Executive Academic Dashboard'}
          subtitle="Bixcel Enterprise Academic IMS + LMS System"
          onRefresh={() => { fetchHealth(); fetchCourses(); }}
          health={health}
        />

        {/* Main Content Body */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* Executive KPI Metrics Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* KPI 1 */}
            <Card className="!p-5">
              <div className="flex items-center justify-between">
                <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
                  Total Active Students
                </span>
                <span className="w-8 h-8 rounded-full bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-display-lg-mobile md:text-display-lg font-bold tabular-nums">
                  1,480
                </span>
                <Badge variant="verified" dot>+12.4%</Badge>
              </div>
              <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1">
                Across 24 active academic batches
              </p>
            </Card>

            {/* KPI 2 */}
            <Card className="!p-5">
              <div className="flex items-center justify-between">
                <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
                  Active Courses
                </span>
                <span className="w-8 h-8 rounded-full bg-success-container text-on-success-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">menu_book</span>
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-display-lg-mobile md:text-display-lg font-bold tabular-nums">
                  {courses.length}
                </span>
                <Badge variant="primary">CI4 API</Badge>
              </div>
              <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1">
                Synced with backend REST API
              </p>
            </Card>

            {/* KPI 3 */}
            <Card className="!p-5">
              <div className="flex items-center justify-between">
                <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
                  Attendance & Attendance Rate
                </span>
                <span className="w-8 h-8 rounded-full bg-pending-container text-on-pending-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-display-lg-mobile md:text-display-lg font-bold tabular-nums">
                  94.2%
                </span>
                <Badge variant="verified">Optimal</Badge>
              </div>
              <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1">
                18 batches in session today
              </p>
            </Card>

            {/* KPI 4 */}
            <Card className="!p-5">
              <div className="flex items-center justify-between">
                <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
                  Fee Collection Ledger
                </span>
                <span className="w-8 h-8 rounded-full bg-light-surface-container dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-display-lg-mobile md:text-display-lg font-bold tabular-nums">
                  $184.5K
                </span>
                <Badge variant="pending" dot>8 Pending</Badge>
              </div>
              <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1">
                87% collected for Term 1
              </p>
            </Card>
          </section>

          {/* Backend Connection Status Banner */}
          <div className="bg-light-surface-bright dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-card">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full shrink-0 ${health ? 'bg-success animate-pulse' : 'bg-overdue'}`}></span>
              <div>
                <p className="text-label-lg font-semibold text-light-on-surface dark:text-dark-on-surface">
                  CodeIgniter 4 PHP Engine Status
                </p>
                <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  {health
                    ? `Connected to CI4 v${health.version} (${health.env} mode) • ${health.message}`
                    : 'Backend server offline. Run `npm run dev` or `php spark serve` to start.'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-mono-sm bg-light-surface-container-low dark:bg-dark-surface-container px-2.5 py-1 rounded text-light-on-surface-variant dark:text-dark-on-surface-variant">
                http://localhost:8080/api
              </span>
              <Button size="sm" variant="outline" icon="open_in_new" onClick={() => window.open('http://localhost:8080/api/health', '_blank')}>
                API Health
              </Button>
            </div>
          </div>

          {/* Courses Catalog Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline text-headline-sm md:text-headline-md font-semibold text-light-on-surface dark:text-dark-on-surface">
                  Curriculum & Course Offerings
                </h3>
                <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Active courses delivered by faculty, synced with CodeIgniter 4 database.
                </p>
              </div>
              <Button icon="add" variant="primary" onClick={() => setShowModal(true)}>
                Create New Course
              </Button>
            </div>

            {coursesLoading ? (
              <div className="text-center py-12 bg-light-surface-bright dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md">
                <div className="inline-block w-8 h-8 border-3 border-light-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant mt-3">
                  Fetching courses from CodeIgniter 4 backend...
                </p>
              </div>
            ) : coursesError ? (
              <div className="p-6 bg-overdue-container border border-overdue/20 rounded-md text-on-overdue-container flex items-center justify-between">
                <div>
                  <p className="font-semibold text-label-lg">Backend Connection Notice</p>
                  <p className="text-body-sm mt-0.5">{coursesError}</p>
                </div>
                <Button size="sm" variant="outline" onClick={fetchCourses}>Retry</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {courses.map((course) => (
                  <Card
                    key={course.id}
                    title={course.title}
                    header={
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            course.level?.toLowerCase() === 'beginner'
                              ? 'verified'
                              : course.level?.toLowerCase() === 'advanced'
                              ? 'overdue'
                              : 'primary'
                          }
                        >
                          {course.level || 'All Levels'}
                        </Badge>
                        <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                          ⏱ {course.duration || 'Flexible'}
                        </span>
                      </div>
                    }
                    footer={
                      <div className="flex items-center justify-between text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">school</span>
                          {course.instructor || 'Faculty'}
                        </span>
                        <span className="tabular-nums font-semibold text-light-on-surface dark:text-dark-on-surface">
                          👥 {course.enrolled || 0} Enrolled
                        </span>
                      </div>
                    }
                  >
                    <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant line-clamp-3">
                      {course.description || 'Comprehensive curriculum designed for institutional mastery and practical competence.'}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Academic Batch Management & Timetable Preview Section */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Batch Table Card (2 Cols) */}
            <Card
              title="Recent Academic Batches"
              subtitle="Current operational cohorts across departments"
              className="lg:col-span-2"
              action={
                <Button size="sm" variant="outline" icon="visibility">
                  View All Batches
                </Button>
              }
              noPadding
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-body-sm">
                  <thead>
                    <tr className="border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant font-semibold">
                      <th className="py-3 px-4">Batch Code</th>
                      <th className="py-3 px-4">Department / Program</th>
                      <th className="py-3 px-4">Lead Tutor</th>
                      <th className="py-3 px-4">Strength</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
                    <tr className="hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container-low transition-colors">
                      <td className="py-3 px-4 font-mono text-mono-sm font-semibold text-light-primary dark:text-dark-primary">
                        BTC-2026-CS1
                      </td>
                      <td className="py-3 px-4 font-medium">Computer Science & AI</td>
                      <td className="py-3 px-4">Prof. K. Gowtham</td>
                      <td className="py-3 px-4 tabular-nums">48 / 50</td>
                      <td className="py-3 px-4">
                        <Badge variant="verified" dot>In Progress</Badge>
                      </td>
                    </tr>
                    <tr className="hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container-low transition-colors">
                      <td className="py-3 px-4 font-mono text-mono-sm font-semibold text-light-primary dark:text-dark-primary">
                        BTC-2026-WD2
                      </td>
                      <td className="py-3 px-4 font-medium">Web & Cloud Systems</td>
                      <td className="py-3 px-4">Sophia Chen</td>
                      <td className="py-3 px-4 tabular-nums">42 / 45</td>
                      <td className="py-3 px-4">
                        <Badge variant="verified" dot>In Progress</Badge>
                      </td>
                    </tr>
                    <tr className="hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container-low transition-colors">
                      <td className="py-3 px-4 font-mono text-mono-sm font-semibold text-light-primary dark:text-dark-primary">
                        BTC-2026-DS3
                      </td>
                      <td className="py-3 px-4 font-medium">Data Engineering & Analytics</td>
                      <td className="py-3 px-4">David Miller</td>
                      <td className="py-3 px-4 tabular-nums">36 / 40</td>
                      <td className="py-3 px-4">
                        <Badge variant="pending" dot>Enrollment</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Quick Today's Timetable Card (1 Col) */}
            <Card
              title="Today's Timetable"
              subtitle="Live schedule & lecture occupancy"
              action={
                <span className="font-mono text-mono-sm text-light-primary dark:text-dark-primary font-semibold">
                  ROOM 302
                </span>
              }
            >
              <div className="space-y-4">
                <div className="p-3 rounded-DEFAULT bg-light-surface-container-low dark:bg-dark-surface-container border-l-4 border-light-primary">
                  <div className="flex justify-between items-center text-label-sm">
                    <span className="font-mono text-mono-sm font-semibold text-light-primary dark:text-dark-primary">
                      09:00 AM - 11:00 AM
                    </span>
                    <Badge variant="verified">Live Now</Badge>
                  </div>
                  <p className="font-semibold text-title-md mt-1">Full-Stack Architectures</p>
                  <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Tutor: Alex Morgan • Hall A-102
                  </p>
                </div>

                <div className="p-3 rounded-DEFAULT bg-light-surface-container-low dark:bg-dark-surface-container border-l-4 border-light-outline-variant">
                  <div className="flex justify-between items-center text-label-sm">
                    <span className="font-mono text-mono-sm font-medium text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      01:30 PM - 03:30 PM
                    </span>
                    <Badge variant="neutral">Upcoming</Badge>
                  </div>
                  <p className="font-semibold text-title-md mt-1">REST API Engineering (CI4)</p>
                  <p className="text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Tutor: David Miller • Lab 4
                  </p>
                </div>
              </div>
            </Card>
          </section>
        </main>
      </div>

      {/* Create New Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-light-surface-bright dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-lg shadow-modal w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-surface-enter">
            <div className="flex items-center justify-between pb-4 border-b border-light-outline-variant dark:border-dark-outline-variant mb-4">
              <div>
                <h3 className="font-headline text-headline-sm font-bold text-light-on-surface dark:text-dark-on-surface">
                  Create New Course
                </h3>
                <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  Adds new curriculum directly to the CodeIgniter 4 backend
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface p-1 rounded"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {formSuccess && (
              <div className="mb-4 p-3 rounded-DEFAULT bg-success-container text-on-success-container text-body-sm border border-success/20">
                ✓ {formSuccess}
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-label-md font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Enterprise Cloud Architecture"
                  className="w-full px-3 py-2 text-body-md rounded-DEFAULT border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-bright dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-2 focus:ring-light-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label-md font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Instructor / Faculty
                  </label>
                  <input
                    type="text"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    placeholder="e.g. Dr. K. Gowtham"
                    className="w-full px-3 py-2 text-body-md rounded-DEFAULT border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-bright dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-2 focus:ring-light-primary"
                  />
                </div>
                <div>
                  <label className="block text-label-md font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Level
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 text-body-md rounded-DEFAULT border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-bright dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-2 focus:ring-light-primary"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-label-md font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g. 8 Weeks (6 hrs/week)"
                  className="w-full px-3 py-2 text-body-md rounded-DEFAULT border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-bright dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-2 focus:ring-light-primary"
                />
              </div>

              <div>
                <label className="block text-label-md font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Course objectives, curriculum summary..."
                  className="w-full px-3 py-2 text-body-md rounded-DEFAULT border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-bright dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-2 focus:ring-light-primary"
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-light-outline-variant dark:border-dark-outline-variant">
                <Button variant="outline" onClick={() => setShowModal(false)} disabled={submitting}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={submitting}>
                  {submitting ? 'Submitting to CI4...' : 'Publish Course'}
                </Button>
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
      <DashboardContent />
    </ThemeProvider>
  )
}
