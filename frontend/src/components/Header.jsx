import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import Badge from './Badge'

export function Header({
  breadcrumbCurrent = 'Executive Overview',
  onOpenMobileSidebar,
  health,
  onRefresh,
  onNavigate,
  currentUser,
  onLogout,
}) {
  const { theme, toggleTheme } = useTheme()
  const [profileOpen, setProfileOpen] = useState(false)

  const userName = currentUser?.name || 'Elena Rostova'
  const userRole = currentUser?.role || 'Super Admin'
  const userEmail = currentUser?.email || 'admin@bixcel.edu'
  const userEmpId = currentUser?.emp_id || 'BX-ADM-002'
  const userAvatar = currentUser?.avatar || ''

  // Compute initials
  const initials = userName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ER'

  return (
    <header className="h-16 bg-light-surface-container-lowest dark:bg-dark-surface-bright border-b border-light-outline-variant dark:border-dark-outline-variant px-6 flex items-center justify-between gap-4 sticky top-0 z-20 transition-colors duration-state-change">
      {/* Left: Mobile trigger & Breadcrumbs */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          aria-label="Toggle menu"
          className="lg:hidden p-2 rounded text-light-on-surface-variant hover:bg-light-surface-container-low"
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <div className="flex items-center gap-2 lg:hidden">
          <img
            src={theme === 'dark' ? '/bixcel-logo-negative.png' : '/bixcel-logo.png'}
            alt="Bixcel"
            className="h-8.5 w-auto object-contain"
          />
        </div>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-light-on-surface-variant whitespace-nowrap">
          <span className="font-body text-body-sm">Bixcel</span>
          <span className="material-symbols-outlined text-[16px] text-light-outline">chevron_right</span>
          <span className="font-body text-body-sm">Dashboard</span>
          <span className="material-symbols-outlined text-[16px] text-light-outline">chevron_right</span>
          <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface font-semibold">
            {breadcrumbCurrent}
          </span>
        </nav>
      </div>

      {/* Right: Actions, CI4 Status, Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Backend Status indicator */}
        <div className="hidden md:flex items-center">
          <Badge variant={health ? 'verified' : 'pending'} dot>
            {health ? `CI4 Online` : 'CI4 Connecting...'}
          </Badge>
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden md:flex items-center w-64">
          <span className="material-symbols-outlined text-light-outline text-[18px] absolute left-3 pointer-events-none">
            search
          </span>
          <input
            type="search"
            placeholder="Search students, courses, batches..."
            className="w-full pl-9 pr-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-sm placeholder:text-light-outline focus:bg-light-surface-container-lowest focus:border-light-primary focus:ring-2 focus:ring-light-primary-tint focus:outline-none"
          />
        </div>

        {/* Refresh API Data */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            type="button"
            className="p-2 rounded text-light-on-surface-variant hover:bg-light-surface-container-low transition-colors"
            title="Refresh Data"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
          </button>
        )}

        {/* Dark/Light Mode Toggle */}
        <button
          onClick={toggleTheme}
          type="button"
          className="p-2 rounded text-light-on-surface-variant hover:bg-light-surface-container-low transition-colors flex items-center justify-center"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {theme === 'light' ? 'dark_mode' : 'light_mode'}
          </span>
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('notifications')}
          aria-label="4 unread notifications"
          title="View Notifications"
          className="relative p-2 rounded text-light-on-surface-variant hover:bg-light-surface-container-low transition-colors shrink-0"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-overdue text-on-overdue tabular-nums font-label text-label-sm">
            4
          </span>
        </button>

        {/* User Profile */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-3 pl-2 pr-1.5 py-1 rounded hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors whitespace-nowrap"
          >
            {userAvatar ? (
              <img
                src={userAvatar}
                alt={userName}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-light-outline-variant dark:ring-dark-outline-variant shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-light-primary text-light-on-primary flex items-center justify-center font-semibold text-sm shrink-0">
                {initials}
              </div>
            )}
            <div className="hidden sm:flex flex-col items-start text-left">
              <span className="font-label text-label-md text-light-on-surface dark:text-dark-on-surface leading-tight whitespace-nowrap">
                {userName}
              </span>
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant whitespace-nowrap">
                {userRole}
              </span>
            </div>
            <span className="material-symbols-outlined text-light-outline text-[18px]">
              {profileOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-60 bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-xl py-1.5 z-30 animate-in fade-in zoom-in-95 duration-state-change">
              <div className="px-4 py-2.5 border-b border-light-outline-variant dark:border-dark-outline-variant">
                <p className="font-label text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface truncate">
                  {userName}
                </p>
                <p className="font-body text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant truncate">
                  {userEmail}
                </p>
                <div className="mt-1 flex items-center justify-between text-[10px] text-light-outline">
                  <span>ID: {userEmpId}</span>
                  <span className="px-1.5 py-0.2 rounded bg-light-surface-container-high dark:bg-dark-surface-container font-medium text-light-primary">
                    {userRole}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  if (onNavigate) onNavigate('profile')
                }}
                className="w-full text-left px-4 py-2 font-body text-body-sm text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container flex items-center gap-2 font-medium"
              >
                <span className="material-symbols-outlined text-[16px]">account_circle</span>
                <span>My Profile &amp; Settings</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  if (onNavigate) onNavigate('notifications')
                }}
                className="w-full text-left px-4 py-2 font-body text-body-sm text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[16px]">notifications</span>
                <span>System Notifications</span>
              </button>
              <div className="my-1 border-t border-light-outline-variant dark:border-dark-outline-variant" />
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false)
                  if (onLogout) onLogout()
                }}
                className="w-full text-left px-4 py-2 font-body text-body-sm text-overdue hover:bg-overdue-container flex items-center gap-2 cursor-pointer font-medium"
              >
                <span className="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
