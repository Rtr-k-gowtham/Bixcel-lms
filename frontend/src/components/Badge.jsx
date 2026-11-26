import React from 'react'

export function Badge({ variant = 'neutral', dot = false, children, className = '' }) {
  const variantStyles = {
    verified: 'bg-success-container text-on-success-container border border-success/20',
    success: 'bg-success-container text-on-success-container border border-success/20',
    pending: 'bg-pending-container text-on-pending-container border border-pending/20',
    warning: 'bg-pending-container text-on-pending-container border border-pending/20',
    overdue: 'bg-overdue-container text-on-overdue-container border border-overdue/20',
    error: 'bg-overdue-container text-on-overdue-container border border-overdue/20',
    primary: 'bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint border border-light-primary/20',
    neutral: 'bg-light-surface-container dark:bg-dark-surface-container text-light-on-surface-variant dark:text-dark-on-surface-variant border border-light-outline-variant dark:border-dark-outline-variant',
  }

  const dotColors = {
    verified: 'bg-success',
    success: 'bg-success',
    pending: 'bg-pending',
    warning: 'bg-pending',
    overdue: 'bg-overdue',
    error: 'bg-overdue',
    primary: 'bg-light-primary dark:bg-dark-primary',
    neutral: 'bg-light-outline dark:bg-dark-outline',
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-label-sm font-semibold transition-colors duration-state-change ${variantStyles[variant] || variantStyles.neutral} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant] || dotColors.neutral}`}
        />
      )}
      {children}
    </span>
  )
}

export default Badge
