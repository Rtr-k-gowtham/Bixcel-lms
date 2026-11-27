import React from 'react'

export function Sidebar({ currentTab, onSelectTab, mobileOpen, onCloseMobile }) {
  const sections = [
    {
      group: null,
      items: [{ id: 'dashboard', label: 'Dashboard', icon: 'dashboard', active: true }],
    },
    {
      group: 'Academics',
      items: [
        { id: 'courses', label: 'Course Management', icon: 'menu_book' },
        { id: 'modules', label: 'Module Library', icon: 'library_books' },
        { id: 'builder', label: 'Custom Course Builder', icon: 'view_quilt' },
        { id: 'curriculum', label: 'Day-Wise Curriculum', icon: 'timeline' },
      ],
    },
    {
      group: 'People',
      items: [
        { id: 'students', label: 'Student Management', icon: 'groups' },
        { id: 'tutors', label: 'Tutor Management', icon: 'co_present' },
      ],
    },
    {
      group: 'Operations',
      items: [
        { id: 'batches', label: 'Batch Management', icon: 'workspaces' },
        { id: 'timetable', label: 'Timetable & Scheduling', icon: 'schedule' },
        { id: 'attendance', label: 'Attendance Management', icon: 'how_to_reg' },
        { id: 'assignments', label: 'Assignment Management', icon: 'assignment' },
        { id: 'exams', label: 'Examination Management', icon: 'quiz' },
        { id: 'milestones', label: 'Competency Milestones', icon: 'flag' },
        { id: 'calendar', label: 'Student Calendar', icon: 'calendar_month' },
        { id: 'progress', label: 'Academic Progress', icon: 'monitoring' },
        { id: 'feedback', label: 'Tutor Rating & Feedback', icon: 'star' },
      ],
    },
    {
      group: 'Finance & Reports',
      items: [
        { id: 'fees', label: 'Fees & Payments', icon: 'payments' },
        { id: 'balance', label: 'Fee Balance & Dues', icon: 'account_balance_wallet' },
        { id: 'analytics', label: 'Institutional Analytics', icon: 'analytics' },
      ],
    },
    {
      group: 'Access Control',
      items: [
        { id: 'users', label: 'User Master', icon: 'manage_accounts' },
        { id: 'roles', label: 'Role Master', icon: 'badge' },
        { id: 'permissions', label: 'Permission Matrix', icon: 'security' },
      ],
    },
    {
      group: 'Settings',
      items: [
        { id: 'notifications', label: 'Notifications', icon: 'notifications_active' },
        { id: 'audit', label: 'Audit Logs', icon: 'history' },
        { id: 'profile', label: 'User Profile', icon: 'account_circle' },
        { id: 'settings', label: 'Institute Settings', icon: 'settings' },
      ],
    },
  ]

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar text-on-sidebar">
      {/* Brand Header with Negative Logo */}
      <div className="h-16 px-5 flex items-center border-b border-sidebar-surface shrink-0">
        <a
          href="#dashboard"
          onClick={(e) => {
            e.preventDefault()
            onSelectTab('dashboard')
          }}
          className="flex items-center w-full overflow-hidden"
          title="Bixcel Institute of Technologies"
        >
          <img
            src="/bixcel-logo-negative.png"
            alt="Bixcel Institute of Technologies"
            className="h-10.5 max-h-11 w-auto object-contain"
          />
        </a>
      </div>

      {/* Main Navigation Menu */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-5 overflow-y-auto" aria-label="Main Navigation">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="flex flex-col gap-1">
            {section.group && (
              <span className="px-3 font-label text-label-sm text-sidebar-muted uppercase tracking-wider">
                {section.group}
              </span>
            )}
            {section.items.map((item) => {
              const isActive = currentTab === item.id || (currentTab === 'dashboard' && item.id === 'dashboard')
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id)
                    if (onCloseMobile) onCloseMobile()
                  }}
                  className={`flex items-center gap-3 px-3 py-1.5 rounded text-left transition-colors ${isActive
                    ? 'bg-sidebar-active text-on-sidebar font-semibold'
                    : 'text-sidebar-muted hover:bg-sidebar-surface hover:text-on-sidebar'
                    }`}
                >
                  <span className="material-symbols-outlined text-[18px] shrink-0">
                    {item.icon}
                  </span>
                  <span className="font-body text-body-sm truncate">{item.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </nav>
    </div>
  )

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside
        id="appSidebar"
        className="hidden lg:flex lg:w-[260px] lg:shrink-0 bg-sidebar text-on-sidebar flex-col border-r border-sidebar-surface min-h-screen sticky top-0 h-screen"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-sidebar/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-[260px] max-w-full z-10 shadow-xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
