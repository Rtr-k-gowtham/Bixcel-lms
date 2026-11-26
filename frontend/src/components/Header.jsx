import React from 'react'
import { useTheme } from '../context/ThemeContext'
import Badge from './Badge'

export function Header({ title = 'Executive Dashboard', subtitle = 'Academic Overview & Analytics', onRefresh, health }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="h-header-h bg-light-surface-bright dark:bg-dark-surface-bright border-b border-light-outline-variant dark:border-dark-outline-variant px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-state-change">
      {/* Title & Context */}
      <div>
        <h2 className="font-headline font-semibold text-headline-md text-light-on-surface dark:text-dark-on-surface leading-tight">
          {title}
        </h2>
        <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
          {subtitle}
        </p>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-3">
        {/* CI4 Backend Health Indicator */}
        <Badge
          variant={health ? 'verified' : 'pending'}
          dot
          className="hidden sm:inline-flex"
        >
          {health ? `CI4 v${health.version || '4.7'} API Online` : 'CI4 Connecting...'}
        </Badge>

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface rounded hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
            title="Refresh API Data"
          >
            <span className="material-symbols-outlined text-[20px]">refresh</span>
          </button>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface rounded hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors flex items-center justify-center"
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {theme === 'light' ? 'dark_mode' : 'light_mode'}
          </span>
        </button>

        {/* Notifications Icon */}
        <button
          className="relative p-2 text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface rounded hover:bg-light-surface-container dark:hover:bg-dark-surface-container transition-colors"
          title="Notifications"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-overdue ring-2 ring-white dark:ring-dark-surface-bright"></span>
        </button>

        {/* Institutional Academic Badge */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-light-outline-variant dark:border-dark-outline-variant">
          <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
            AY 2026-27
          </span>
        </div>
      </div>
    </header>
  )
}

export default Header
