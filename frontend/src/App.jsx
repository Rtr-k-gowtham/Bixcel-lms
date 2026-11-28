import { useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Card from './components/Card'
import {
  PerformanceBarChart,
  EnrollmentAreaChart,
  FeeCollectionDonutChart,
  DepartmentPieChart,
  ClassroomOccupancyHeatmap,
  CourseCompletionFunnel,
} from './components/charts'
import { UserMaster, RoleMaster, PermissionMatrix } from './components/access'
import { AuditLogs } from './components/audit/AuditLogs'
import { NotificationsScreen } from './components/notifications/NotificationsScreen'
import { UserProfileScreen } from './components/profile/UserProfileScreen'
import CourseManagement from './components/courses/CourseManagement'
import ModuleLibrary from './components/modules/ModuleLibrary'
import StudentManagement from './components/students/StudentManagement'
import CourseOnboarding from './components/courses/CourseOnboarding'
import BatchManagement from './components/batches/BatchManagement'
import TutorManagement from './components/tutors/TutorManagement'
import FeesPayment from './components/fees/FeesPayment'
import StudentCalendar from './components/calendar/StudentCalendar'
import StudentDashboard from './components/dashboard/StudentDashboard'
import TimetableScheduling from './components/timetable/TimetableScheduling'
import AssignmentManagement from './components/assignments/AssignmentManagement'
import ExamManagement from './components/exams/ExamManagement'
import MilestoneManagement from './components/milestones/MilestoneManagement'
import DepartmentMaster from './components/departments/DepartmentMaster'
import LoginScreen from './components/auth/LoginScreen'
import { apiService } from './services/api'

const VALID_TABS = new Set([
  'dashboard', 'courses', 'departments', 'modules', 'builder', 'curriculum',
  'students', 'onboarding', 'tutors', 'batches', 'timetable', 'attendance',
  'assignments', 'exams', 'milestones', 'calendar', 'progress', 'feedback',
  'fees', 'balance', 'analytics', 'users', 'roles', 'permissions',
  'notifications', 'audit', 'profile', 'settings'
])

function getInitialTab() {
  if (typeof window === 'undefined') return 'dashboard'

  // 1. Check URL hash (e.g. #modules or #/modules)
  const hash = window.location.hash.replace(/^#\/?/, '').trim().toLowerCase()
  if (hash && VALID_TABS.has(hash)) {
    return hash
  }

  // 2. Check query parameter (?tab=modules)
  try {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')?.toLowerCase()
    if (tabParam && VALID_TABS.has(tabParam)) {
      return tabParam
    }
  } catch (e) {
    // ignore
  }

  // 3. Check pathname (e.g. /modules)
  const path = window.location.pathname.replace(/^\//, '').split('/')[0].trim().toLowerCase()
  if (path && VALID_TABS.has(path)) {
    return path
  }

  // 4. Check localStorage
  try {
    const saved = localStorage.getItem('bx_active_tab')?.trim().toLowerCase()
    if (saved && VALID_TABS.has(saved)) {
      return saved
    }
  } catch (e) {
    // ignore
  }

  return 'dashboard'
}

function Dashboard({ currentUser, onLogout }) {
  const [currentTab, setCurrentTab] = useState(getInitialTab)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [matrixPreselectedRole, setMatrixPreselectedRole] = useState('Super Admin')

  const userRole = currentUser?.role || 'Super Admin'
  const isStudent = userRole === 'Student' || currentUser?.role_code === 'ROLE_STUDENT'
  const isTutor = userRole.includes('Tutor') || userRole.includes('Faculty') || currentUser?.role_code === 'ROLE_TUTOR'

  const STUDENT_FORBIDDEN_TABS = new Set([
    'users', 'roles', 'permissions', 'audit', 'settings',
    'tutors', 'students', 'onboarding', 'batches', 'builder', 'attendance', 'analytics'
  ])

  const TUTOR_FORBIDDEN_TABS = new Set([
    'users', 'roles', 'permissions', 'audit', 'settings',
    'fees', 'balance', 'analytics', 'tutors', 'onboarding'
  ])

  const isAccessForbidden = (isStudent && STUDENT_FORBIDDEN_TABS.has(currentTab)) || (isTutor && TUTOR_FORBIDDEN_TABS.has(currentTab))

  // Keep URL Hash and localStorage synchronized whenever currentTab changes
  useEffect(() => {
    if (!currentTab) return
    try {
      localStorage.setItem('bx_active_tab', currentTab)
      if (window.location.hash.replace(/^#\/?/, '') !== currentTab) {
        window.history.replaceState(null, '', `#${currentTab}`)
      }
    } catch (e) {
      // ignore
    }
  }, [currentTab])

  // Listen to browser Back / Forward buttons & Hash changes
  useEffect(() => {
    const handleUrlChange = () => {
      const active = getInitialTab()
      if (active && active !== currentTab) {
        setCurrentTab(active)
      }
    }

    window.addEventListener('popstate', handleUrlChange)
    window.addEventListener('hashchange', handleUrlChange)
    return () => {
      window.removeEventListener('popstate', handleUrlChange)
      window.removeEventListener('hashchange', handleUrlChange)
    }
  }, [currentTab])

  const handleTabChange = (newTab) => {
    if (!newTab) return
    setCurrentTab(newTab)
    try {
      localStorage.setItem('bx_active_tab', newTab)
      if (window.location.hash.replace(/^#\/?/, '') !== newTab) {
        window.history.pushState(null, '', `#${newTab}`)
      }
    } catch (e) {
      // ignore
    }
  }

  // API State
  const [health, setHealth] = useState(null)
  const [courses, setCourses] = useState([])
  const [_coursesLoading, setCoursesLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    students: 0,
    tutors: 0,
    batches: 0,
  })

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
      const [healthData, coursesData, studentsData, tutorsData, batchesData] = await Promise.allSettled([
        apiService.checkHealth(),
        apiService.getCourses(),
        apiService.getStudents(),
        apiService.getTutors(),
        apiService.getBatches(),
      ])

      if (healthData.status === 'fulfilled') {
        setHealth(healthData.value)
      } else {
        setHealth(null)
      }

      if (coursesData.status === 'fulfilled' && coursesData.value?.data) {
        setCourses(coursesData.value.data)
      } else {
        setCourses([])
      }

      setMetrics({
        students: studentsData.status === 'fulfilled' && Array.isArray(studentsData.value?.data) ? studentsData.value.data.length : 0,
        tutors: tutorsData.status === 'fulfilled' && Array.isArray(tutorsData.value?.data) ? tutorsData.value.data.length : 0,
        batches: batchesData.status === 'fulfilled' && Array.isArray(batchesData.value?.data) ? batchesData.value.data.length : 0,
      })
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
      {/* Persistent Deep Navy Sidebar with Negative Bixcel Logo */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleTabChange}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Header */}
        <Header
          breadcrumbCurrent={
            currentTab === 'assignments'
              ? 'Assignment Management'
              : currentTab === 'exams'
                ? 'Examination Management'
                : currentTab === 'milestones'
                  ? 'Competency Milestones'
                  : currentTab === 'courses'
                    ? 'Course Management'
              : currentTab === 'modules'
                ? 'Module Library'
                : currentTab === 'students'
                  ? 'Student Master'
                  : currentTab === 'onboarding'
                    ? 'Course Onboarding'
                    : currentTab === 'tutors'
                      ? 'Tutor Management & Allocation'
                      : currentTab === 'batches'
                        ? 'Batch Management'
                        : currentTab === 'timetable'
                          ? 'Timetable & Daily Scheduling'
                          : currentTab === 'calendar'
                            ? 'Student Environment & Calendar'
                            : currentTab === 'fees'
                            ? 'Fees & Payment Collection'
                            : currentTab === 'users'
                              ? 'User Master'
                              : currentTab === 'roles'
                                ? 'Role Master'
                                : currentTab === 'permissions'
                                  ? 'Permission Matrix'
                                  : currentTab === 'audit'
                                    ? 'Audit Logs'
                                    : currentTab === 'notifications'
                                      ? 'Notifications & Alerts'
                                      : currentTab === 'profile'
                                        ? 'User Profile & Settings'
                                        : 'Dashboard'
          }
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          health={health}
          onRefresh={fetchData}
          onNavigate={(tab) => handleTabChange(tab)}
          currentUser={currentUser}
          onLogout={onLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-3.5 sm:p-4 lg:p-5 flex flex-col gap-3.5 max-w-[1480px] w-full mx-auto">
          {/* Sub-navigation Tab Pills for Access Control Suite */}
          {['users', 'roles', 'permissions'].includes(currentTab) && (
            <div className="flex flex-wrap items-center gap-2 border-b border-light-outline-variant dark:border-dark-outline-variant pb-3 mb-1">
              <button
                type="button"
                onClick={() => handleTabChange('users')}
                className={`px-3.5 py-1.5 rounded font-label text-label-md font-semibold inline-flex items-center gap-2 transition-colors ${currentTab === 'users'
                  ? 'bg-light-primary text-light-on-primary shadow-sm'
                  : 'bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant hover:text-light-on-surface'
                  }`}
              >
                <span className="material-symbols-outlined text-[17px]">manage_accounts</span>
                <span>User Master</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('roles')}
                className={`px-3.5 py-1.5 rounded font-label text-label-md font-semibold inline-flex items-center gap-2 transition-colors ${currentTab === 'roles'
                  ? 'bg-light-primary text-light-on-primary shadow-sm'
                  : 'bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant hover:text-light-on-surface'
                  }`}
              >
                <span className="material-symbols-outlined text-[17px]">badge</span>
                <span>Role Master</span>
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('permissions')}
                className={`px-3.5 py-1.5 rounded font-label text-label-md font-semibold inline-flex items-center gap-2 transition-colors ${currentTab === 'permissions'
                  ? 'bg-[#2B1B54] text-white shadow-sm'
                  : 'bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant hover:text-light-on-surface'
                  }`}
              >
                <span className="material-symbols-outlined text-[17px]">security</span>
                <span>Permission Matrix</span>
              </button>
            </div>
          )}

          {/* Conditional Screen Rendering */}
          {isAccessForbidden ? (
            <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-8 rounded-lg text-center flex flex-col items-center justify-center gap-3 animate-fade-in shadow-xs my-4">
              <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-[28px]">shield_lock</span>
              </div>
              <h2 className="font-title text-base font-bold text-light-on-surface dark:text-dark-on-surface">
                Access Restricted • {isStudent ? 'Student Portal' : 'Faculty Workspace'}
              </h2>
              <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant max-w-md">
                Your current account ({currentUser?.name || 'User'} • {currentUser?.role || 'Member'}) does not have administrative privileges to access this operational screen.
              </p>
              <button
                type="button"
                onClick={() => handleTabChange('dashboard')}
                className="mt-2 px-4 py-1.5 bg-light-primary text-light-on-primary rounded text-xs font-semibold shadow-xs hover:bg-light-primary-container transition-colors cursor-pointer"
              >
                Return to {isStudent ? 'Student Dashboard' : 'Faculty Dashboard'}
              </button>
            </div>
          ) : currentTab === 'assignments' ? (
            <AssignmentManagement />
          ) : currentTab === 'exams' ? (
            <ExamManagement />
          ) : currentTab === 'milestones' ? (
            <MilestoneManagement />
          ) : currentTab === 'timetable' ? (
            <TimetableScheduling />
          ) : currentTab === 'calendar' ? (
            <StudentCalendar currentUser={currentUser} />
          ) : ['courses', 'builder', 'curriculum'].includes(currentTab) ? (
            <CourseManagement onNavigateToModules={() => handleTabChange('modules')} />
          ) : currentTab === 'fees' ? (
            <FeesPayment />
          ) : currentTab === 'tutors' ? (
            <TutorManagement />
          ) : currentTab === 'batches' ? (
            <BatchManagement />
          ) : currentTab === 'students' ? (
            <StudentManagement initialTab="directory" />
          ) : currentTab === 'onboarding' ? (
            <CourseOnboarding />
          ) : currentTab === 'departments' ? (
            <DepartmentMaster onNavigateToModules={() => handleTabChange('modules')} />
          ) : currentTab === 'modules' ? (
            <ModuleLibrary />
          ) : currentTab === 'users' ? (
            <UserMaster />
          ) : currentTab === 'roles' ? (
            <RoleMaster
              onNavigateToMatrix={(roleName) => {
                setMatrixPreselectedRole(roleName)
                handleTabChange('permissions')
              }}
            />
          ) : currentTab === 'permissions' ? (
            <PermissionMatrix initialRole={matrixPreselectedRole} />
          ) : currentTab === 'audit' ? (
            <AuditLogs />
          ) : currentTab === 'notifications' ? (
            <NotificationsScreen onNavigate={(tab) => handleTabChange(tab)} />
          ) : currentTab === 'profile' ? (
            <UserProfileScreen currentUser={currentUser} />
          ) : isStudent ? (
            <StudentDashboard
              currentUser={currentUser}
              onNavigate={(tab) => handleTabChange(tab)}
            />
          ) : (
            <>
              {/* Page Header */}
              <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex flex-col gap-0.5">
                  <h1 className="font-title text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface">
                    Dashboard
                  </h1>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Date pill */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface whitespace-nowrap text-xs">
                    <span className="material-symbols-outlined text-[16px] text-light-outline">calendar_today</span>
                    <span className="font-label tabular-nums font-medium">Nov 26, 2026</span>
                  </div>

                  {/* Add Course Button */}
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary shadow-xs hover:bg-light-primary-container transition-colors duration-state-change whitespace-nowrap font-label text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    <span>Create Course</span>
                  </button>

                  {/* Export Report Button */}
                  <button
                    type="button"
                    onClick={() => alert('Exporting executive telemetry report...')}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface shadow-xs hover:bg-light-surface-container-low transition-colors duration-state-change whitespace-nowrap font-label text-xs font-semibold"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Export Report</span>
                  </button>
                </div>
              </section>

              {/* 6 Compact KPI Cards Grid */}
              <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 items-stretch">
                {/* KPI 1 */}
                <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col justify-between gap-2.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                      Students
                    </span>
                    <span className="w-7 h-7 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary inline-flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">groups</span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="font-headline text-headline-sm tabular-nums font-bold text-light-on-surface dark:text-dark-on-surface">
                      {metrics.students}
                    </span>
                    <span className="font-label text-[11px] text-on-success-container bg-success-container px-1.5 py-0.5 rounded tabular-nums font-semibold">
                      {metrics.students > 0 ? 'Active' : 'Empty'}
                    </span>
                  </div>
                </article>

                {/* KPI 2 */}
                <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col justify-between gap-2.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                      Tutors
                    </span>
                    <span className="w-7 h-7 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary inline-flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">co_present</span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="font-headline text-headline-sm tabular-nums font-bold text-light-on-surface dark:text-dark-on-surface">
                      {metrics.tutors}
                    </span>
                    <span className="font-label text-[11px] text-on-success-container bg-success-container px-1.5 py-0.5 rounded tabular-nums font-semibold">
                      {metrics.tutors > 0 ? 'Active' : 'Unassigned'}
                    </span>
                  </div>
                </article>

                {/* KPI 3 (Live Backend Synced) */}
                <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col justify-between gap-2.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                      Courses
                    </span>
                    <span className="w-7 h-7 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary inline-flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">menu_book</span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="font-headline text-headline-sm tabular-nums font-bold text-light-on-surface dark:text-dark-on-surface">
                      {courses.length}
                    </span>
                    <span className="font-label text-[11px] text-on-pending-container bg-pending-container px-1.5 py-0.5 rounded tabular-nums font-semibold">
                      {health ? 'CI4 Synced' : 'Syncing'}
                    </span>
                  </div>
                </article>

                {/* KPI 4 */}
                <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col justify-between gap-2.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                      Batches
                    </span>
                    <span className="w-7 h-7 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary inline-flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">workspaces</span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="font-headline text-headline-sm tabular-nums font-bold text-light-on-surface dark:text-dark-on-surface">
                      {metrics.batches}
                    </span>
                    <span className="font-label text-[11px] text-on-success-container bg-success-container px-1.5 py-0.5 rounded font-semibold">
                      {metrics.batches > 0 ? 'Active' : 'No Batches'}
                    </span>
                  </div>
                </article>

                {/* KPI 5 */}
                <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col justify-between gap-2.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                      Occupancy
                    </span>
                    <span className="w-7 h-7 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary inline-flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">meeting_room</span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="font-headline text-headline-sm tabular-nums font-bold text-light-on-surface dark:text-dark-on-surface">
                      86.5%
                    </span>
                    <span className="font-label text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant tabular-nums font-medium">
                      18/20 rms
                    </span>
                  </div>
                </article>

                {/* KPI 6 */}
                <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col justify-between gap-2.5">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                      Collection
                    </span>
                    <span className="w-7 h-7 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary inline-flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-1">
                    <span className="font-headline text-headline-sm tabular-nums font-bold text-light-on-surface dark:text-dark-on-surface">
                      94.2%
                    </span>
                    <span className="font-label text-[11px] text-on-success-container bg-success-container px-1.5 py-0.5 rounded font-semibold">
                      Audited
                    </span>
                  </div>
                </article>
              </section>

              {/* ========================================================================= */}
              {/* 6 COMPACT ENTERPRISE CARDS (3x2 GRID LAYOUT)                             */}
              {/* ========================================================================= */}
              <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
                {/* Card 1: Student Performance */}
                <Card
                  title="Student Performance"
                  action={<span className="font-label text-[11px] text-light-primary font-semibold">Fall 2026</span>}
                >
                  <PerformanceBarChart />
                </Card>

                {/* Card 2: Admissions Trend */}
                <Card
                  title="Admissions Trend"
                  action={<span className="font-mono text-[11px] text-on-success-container font-semibold">Target: 600/mo</span>}
                >
                  <EnrollmentAreaChart />
                </Card>

                {/* Card 3: Fee Collection */}
                <Card
                  title="Fee Collection"
                  action={<span className="font-mono text-[11px] text-success font-semibold">68% Reconciled</span>}
                >
                  <FeeCollectionDonutChart />
                </Card>

                {/* Card 4: Faculty Share */}
                <Card
                  title="Faculty Share"
                  action={<span className="font-mono text-[11px] text-light-primary font-semibold">2,840 Students</span>}
                >
                  <DepartmentPieChart />
                </Card>

                {/* Card 5: Room Occupancy */}
                <Card
                  title="Room Occupancy"
                  action={<span className="font-mono text-[11px] text-light-primary font-semibold">20 Rooms</span>}
                >
                  <ClassroomOccupancyHeatmap />
                </Card>

                {/* Card 6: Retention Funnel */}
                <Card
                  title="Retention Funnel"
                  action={<span className="font-mono text-[11px] text-success font-semibold">5.7% Attrition</span>}
                >
                  <CourseCompletionFunnel />
                </Card>
              </section>

              {/* ========================================================================= */}
              {/* OPERATIONAL TABLES & CODEIGNITER 4 INTEGRATION                            */}
              {/* ========================================================================= */}

              {/* Today's Live Classes & CI4 Courses Row */}
              <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                {/* Table (7 cols) */}
                <div className="xl:col-span-7 bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm overflow-hidden flex flex-col">
                  <header className="px-4 py-2.5 border-b border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between gap-4">
                    <div>
                      <h2 className="font-title text-[15px] text-light-on-surface dark:text-dark-on-surface font-semibold">
                        Live Classes
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      className="font-label text-label-sm text-light-primary hover:underline whitespace-nowrap shrink-0 font-semibold"
                    >
                      + Add Course
                    </button>
                  </header>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-light-surface-container-low dark:bg-dark-surface-container border-b border-light-outline-variant dark:border-dark-outline-variant">
                          <th scope="col" className="px-4 py-2 text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            <span className="font-label text-label-sm whitespace-nowrap font-medium">Course / Title</span>
                          </th>
                          <th scope="col" className="px-4 py-2 text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            <span className="font-label text-label-sm whitespace-nowrap font-medium">Faculty Tutor</span>
                          </th>
                          <th scope="col" className="px-4 py-2 text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            <span className="font-label text-label-sm whitespace-nowrap font-medium">Duration / Level</span>
                          </th>
                          <th scope="col" className="px-4 py-2 text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            <span className="font-label text-label-sm whitespace-nowrap font-medium">Status</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
                        {courses.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="px-4 py-12 text-center text-light-on-surface-variant dark:text-dark-on-surface-variant">
                              <span className="material-symbols-outlined text-[36px] opacity-40 block mb-1">school</span>
                              <p className="font-semibold text-xs">No active courses registered</p>
                              <p className="text-[11px] opacity-70 mt-0.5">Click &quot;+ Create Course&quot; to add your first curriculum program</p>
                            </td>
                          </tr>
                        ) : (
                          courses.map((course, idx) => (
                            <tr key={course.id || idx} className="hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors">
                              <td className="px-4 py-2.5 whitespace-nowrap">
                                <div className="flex flex-col">
                                  <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface whitespace-nowrap font-medium">
                                    {course.title}
                                  </span>
                                  <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                                    CRS-{100 + Number(course.id || idx + 1)}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-2.5 whitespace-nowrap">
                                <span className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface">
                                  {course.instructor || 'Unassigned'}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 tabular-nums whitespace-nowrap">
                                <span className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                                  {course.duration || '6 Weeks'} • {course.level || 'Intermediate'}
                                </span>
                              </td>
                              <td className="px-4 py-2.5 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success-container text-on-success-container whitespace-nowrap font-label text-label-sm font-semibold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                                  <span>Active (CI4)</span>
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Attendance & Smart Alerts (5 cols) */}
                <div className="xl:col-span-5 flex flex-col gap-4">
                  {/* Attendance Card */}
                  <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-4 shadow-sm flex flex-col gap-3">
                    <header className="flex items-center justify-between gap-2">
                      <h2 className="font-title text-[15px] text-light-on-surface dark:text-dark-on-surface font-semibold">
                        Attendance
                      </h2>
                      <span className="font-label text-label-sm text-on-success-container bg-success-container px-2 py-0.5 rounded-full tabular-nums whitespace-nowrap font-semibold">
                        92.4% Today
                      </span>
                    </header>
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex flex-col gap-0.5">
                        <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                          Present
                        </span>
                        <span className="font-title text-title-md tabular-nums text-on-success-container font-semibold">
                          1,412
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex flex-col gap-0.5">
                        <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                          Late / Leave
                        </span>
                        <span className="font-title text-title-md tabular-nums text-on-pending-container font-semibold">
                          74
                        </span>
                      </div>
                      <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex flex-col gap-0.5">
                        <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                          Absent
                        </span>
                        <span className="font-title text-title-md tabular-nums text-on-overdue-container font-semibold">
                          42
                        </span>
                      </div>
                    </div>
                  </article>

                  {/* Smart Notifications */}
                  <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-4 shadow-sm flex-1 flex flex-col gap-2.5">
                    <header className="flex items-center justify-between gap-2">
                      <h2 className="font-title text-[15px] text-light-on-surface dark:text-dark-on-surface font-semibold">
                        Notifications
                      </h2>
                      <span className="font-label text-label-sm text-light-on-surface-variant font-medium whitespace-nowrap">
                        0 Active
                      </span>
                    </header>
                    <div className="py-6 text-center text-light-on-surface-variant dark:text-dark-on-surface-variant text-xs">
                      <span className="material-symbols-outlined text-[24px] opacity-40 block mb-1">notifications_paused</span>
                      <span>No pending system alerts or notifications</span>
                    </div>
                  </article>
                </div>
              </section>
            </>
          )}
        </main>
      </div>

      {/* Create Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-md p-5 animate-in fade-in zoom-in-95 duration-state-change">
            <div className="flex items-center justify-between pb-3 border-b border-light-outline-variant dark:border-dark-outline-variant mb-4">
              <div>
                <h3 className="font-title text-title-lg font-bold text-light-on-surface dark:text-dark-on-surface">
                  New Course
                </h3>
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
  const [currentUser, setCurrentUser] = useState(() => apiService.getCurrentUser())

  const handleLogout = async () => {
    await apiService.logout()
    try {
      localStorage.setItem('bx_logged_out', 'true')
      localStorage.removeItem('bx_auth_user')
      localStorage.removeItem('bx_auth_token')
      localStorage.removeItem('bx_active_tab')
      window.history.replaceState(null, '', window.location.pathname)
    } catch {
      // ignore
    }
    setCurrentUser(null)
  }

  const handleLoginSuccess = (user) => {
    try {
      localStorage.removeItem('bx_logged_out')
      localStorage.setItem('bx_active_tab', 'dashboard')
    } catch {
      // ignore
    }
    setCurrentUser(user)
  }

  return (
    <ThemeProvider>
      {!currentUser ? (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Dashboard currentUser={currentUser} onLogout={handleLogout} />
      )}
    </ThemeProvider>
  )
}
