import React from 'react'

export function Sidebar({ currentTab, onSelectTab, collapsed, onToggleCollapse }) {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: 'dashboard', badge: null },
    { id: 'courses', label: 'Course Catalog', icon: 'auto_stories', badge: 'Active' },
    { id: 'batches', label: 'Batch Management', icon: 'groups', badge: null },
    { id: 'timetable', label: 'Timetable & Classrooms', icon: 'calendar_month', badge: null },
    { id: 'enrollment', label: 'Student Admissions', icon: 'person_add', badge: null },
    { id: 'tutors', label: 'Tutor Assignment', icon: 'school', badge: null },
    { id: 'fees', label: 'Fee Collection Ledger', icon: 'payments', badge: null },
  ]

  const adminItems = [
    { id: 'users', label: 'User Master Directory', icon: 'manage_accounts' },
    { id: 'settings', label: 'System Configuration', icon: 'settings' },
  ]

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-30 bg-sidebar text-on-sidebar flex flex-col transition-all duration-surface-enter ${
        collapsed ? 'w-20' : 'w-sidebar-w'
      }`}
    >
      {/* Brand Header */}
      <div className="h-header-h px-5 flex items-center justify-between border-b border-sidebar-surface">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-DEFAULT bg-sidebar-active flex items-center justify-center font-bold text-lg text-white shadow-md shrink-0">
            B
          </div>
          {!collapsed && (
            <div className="truncate">
              <h1 className="font-display font-bold text-title-md leading-tight tracking-tight text-white">
                Bixcel IMS
              </h1>
              <p className="text-label-sm text-sidebar-muted font-medium">Academic Portal</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="text-sidebar-muted hover:text-white p-1 rounded hover:bg-sidebar-surface transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <span className="material-symbols-outlined text-[20px]">
            {collapsed ? 'chevron_right' : 'menu_open'}
          </span>
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-label-sm font-semibold tracking-wider text-sidebar-muted uppercase">
              Academic Operations
            </p>
          )}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = currentTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-DEFAULT text-label-lg transition-all duration-state-change text-left ${
                    active
                      ? 'bg-sidebar-active text-white font-semibold shadow-sm'
                      : 'text-sidebar-muted hover:text-white hover:bg-sidebar-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] shrink-0">
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <span className="flex-1 truncate">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="bg-success text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        <div>
          {!collapsed && (
            <p className="px-3 mb-2 text-label-sm font-semibold tracking-wider text-sidebar-muted uppercase">
              Administration
            </p>
          )}
          <nav className="space-y-1">
            {adminItems.map((item) => {
              const active = currentTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-DEFAULT text-label-lg transition-all duration-state-change text-left ${
                    active
                      ? 'bg-sidebar-active text-white font-semibold shadow-sm'
                      : 'text-sidebar-muted hover:text-white hover:bg-sidebar-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] shrink-0">
                    {item.icon}
                  </span>
                  {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* User Shell Profile */}
      <div className="p-3 border-t border-sidebar-surface bg-sidebar">
        <div className="flex items-center gap-3 p-2 rounded-DEFAULT hover:bg-sidebar-surface transition-colors cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-light-primary text-white flex items-center justify-center font-semibold text-sm shrink-0">
            SA
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-label-md font-semibold text-white truncate">Super Admin</p>
              <p className="text-label-sm text-sidebar-muted truncate">admin@bixcel.edu</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
