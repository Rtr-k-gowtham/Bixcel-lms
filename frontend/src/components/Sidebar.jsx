import React from 'react'

export function Sidebar({ currentTab, onSelectTab, mobileOpen, onCloseMobile, currentUser, onLogout }) {
  const roleCode = currentUser?.role_code || (currentUser?.role === 'Student' ? 'ROLE_STUDENT' : (currentUser?.role?.includes('Tutor') ? 'ROLE_TUTOR' : 'ROLE_SUPER_ADMIN'))
  const isStudent = roleCode === 'ROLE_STUDENT' || currentUser?.role === 'Student'
  const isTutor = roleCode === 'ROLE_TUTOR' || (currentUser?.role && currentUser?.role.includes('Tutor'))
  const isAdmin = !isStudent && !isTutor

  // Navigation sections filtered strictly by active role
  const sections = []

  // 1. Dashboard Section
  sections.push({
    group: null,
    items: [
      {
        id: 'dashboard',
        label: isStudent ? 'Student Dashboard' : isTutor ? 'Faculty Dashboard' : 'Executive Dashboard',
        icon: 'dashboard',
        active: true,
      },
    ],
  })

  // 2. Academics Section
  if (isStudent) {
    sections.push({
      group: 'My Academics',
      items: [
        { id: 'courses', label: 'My Enrolled Courses', icon: 'menu_book' },
        { id: 'modules', label: 'Module Library', icon: 'library_books' },
        { id: 'curriculum', label: 'Day-Wise Curriculum', icon: 'timeline' },
      ],
    })
  } else if (isTutor) {
    sections.push({
      group: 'Instruction & Academics',
      items: [
        { id: 'courses', label: 'Course Management', icon: 'menu_book' },
        { id: 'modules', label: 'Module Library', icon: 'library_books' },
        { id: 'curriculum', label: 'Day-Wise Curriculum', icon: 'timeline' },
      ],
    })
  } else {
    // Admin Full
    sections.push({
      group: 'Academics',
      items: [
        { id: 'courses', label: 'Course Management', icon: 'menu_book' },
        { id: 'modules', label: 'Module Library', icon: 'library_books' },
        { id: 'curriculum', label: 'Day-Wise Curriculum', icon: 'timeline' },
      ],
    })
  }

  // 3. People / Cohorts Section
  if (isStudent) {
    // Students don't manage admissions or tutors
  } else if (isTutor) {
    sections.push({
      group: 'Students & Batches',
      items: [
        { id: 'students', label: 'Student Directory', icon: 'groups' },
        { id: 'batches', label: 'Assigned Batches', icon: 'workspaces' },
      ],
    })
  } else {
    // Admin Full
    sections.push({
      group: 'People',
      items: [
        { id: 'students', label: 'Student Management', icon: 'groups' },
        { id: 'tutors', label: 'Tutor Management', icon: 'co_present' },
      ],
    })
  }

  // 4. Operations & Evaluations Section
  if (isStudent) {
    sections.push({
      group: 'Schedule & Tasks',
      items: [
        { id: 'calendar', label: 'Academic Calendar', icon: 'calendar_month' },
        { id: 'feedback', label: 'Rate My Faculty', icon: 'star' },
      ],
    })
  } else if (isTutor) {
    sections.push({
      group: 'Faculty Operations',
      items: [
        { id: 'calendar', label: 'Student Calendar', icon: 'calendar_month' },
        { id: 'progress', label: 'Academic Progress', icon: 'monitoring' },
        { id: 'feedback', label: 'Student Ratings', icon: 'star' },
      ],
    })
  } else {
    // Admin Full
    sections.push({
      group: 'Operations',
      items: [
        { id: 'batches', label: 'Batch Management', icon: 'workspaces' },
        { id: 'calendar', label: 'Student Calendar', icon: 'calendar_month' },
        { id: 'progress', label: 'Academic Progress', icon: 'monitoring' },
        { id: 'feedback', label: 'Tutor Rating & Feedback', icon: 'star' },
      ],
    })
  }

  // 5. Finance Section
  if (isStudent) {
    sections.push({
      group: 'Fees & Account',
      items: [
        { id: 'fees', label: 'My Fee Receipts', icon: 'payments' },
        { id: 'balance', label: 'Outstanding Balance', icon: 'account_balance_wallet' },
      ],
    })
  } else if (isAdmin) {
    sections.push({
      group: 'Finance & Reports',
      items: [
        { id: 'fees', label: 'Fees & Payments', icon: 'payments' },
        { id: 'balance', label: 'Fee Balance & Dues', icon: 'account_balance_wallet' },
        { id: 'analytics', label: 'Institutional Analytics', icon: 'analytics' },
      ],
    })
  }

  // 6. Access Control Section (Super Admin only)
  if (isAdmin) {
    sections.push({
      group: 'Access Control',
      items: [
        { id: 'users', label: 'User Master', icon: 'manage_accounts' },
        { id: 'roles', label: 'Role Master', icon: 'badge' },
        { id: 'permissions', label: 'Permission Matrix', icon: 'security' },
      ],
    })
  }

  // 7. Settings & Profile
  sections.push({
    group: 'Account & Settings',
    items: [
      { id: 'notifications', label: 'Notifications', icon: 'notifications_active' },
      ...(isAdmin ? [{ id: 'audit', label: 'Audit Logs', icon: 'history' }] : []),
      { id: 'profile', label: isStudent ? 'Student Profile' : isTutor ? 'Faculty Profile' : 'User Profile', icon: 'account_circle' },
      ...(isAdmin ? [{ id: 'settings', label: 'Institute Settings', icon: 'settings' }] : []),
    ],
  })

  const sidebarContent = (
    <div className="flex flex-col h-full bg-sidebar text-on-sidebar">
      {/* Brand Header with Negative Logo */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-sidebar-surface shrink-0">
        <a
          href="#dashboard"
          onClick={(e) => {
            e.preventDefault()
            onSelectTab('dashboard')
          }}
          className="flex items-center overflow-hidden"
          title="Bixcel Institute of Technologies"
        >
          <img
            src="/bixcel-logo-negative.png"
            alt="Bixcel Institute of Technologies"
            className="h-10 max-h-10 w-auto object-contain"
          />
        </a>

        {/* Role Pill */}
        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase ${
          isStudent
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            : isTutor
            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
        }`}>
          {isStudent ? 'STUDENT' : isTutor ? 'FACULTY' : 'ADMIN'}
        </span>
      </div>

      {/* Main Navigation Menu */}
      <nav className="flex-1 px-3 py-3.5 flex flex-col gap-4 overflow-y-auto" aria-label="Main Navigation">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="flex flex-col gap-0.5">
            {section.group && (
              <span className="px-3 pt-1 pb-1 font-label text-[10px] font-bold text-sidebar-muted uppercase tracking-wider">
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
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded text-left transition-colors text-xs ${isActive
                    ? 'bg-sidebar-active text-on-sidebar font-semibold'
                    : 'text-sidebar-muted hover:bg-sidebar-surface hover:text-on-sidebar'
                    }`}
                >
                  <span className="material-symbols-outlined text-[17px] shrink-0">
                    {item.icon}
                  </span>
                  <span className="font-body text-xs truncate">{item.label}</span>
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Logged in User Footer Card */}
      {currentUser && (
        <div className="p-3 border-t border-sidebar-surface bg-sidebar-surface/40 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              isStudent ? 'bg-emerald-700 text-white' : isTutor ? 'bg-blue-700 text-white' : 'bg-purple-700 text-white'
            }`}>
              {(currentUser.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-xs text-white truncate leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-sidebar-muted truncate">
                {currentUser.role || 'Member'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onLogout && onLogout()}
            title="Sign out of current account"
            className="p-1 rounded text-sidebar-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">logout</span>
          </button>
        </div>
      )}
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
