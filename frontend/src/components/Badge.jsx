import React from 'react'

export function Badge({ variant = 'neutral', dot = false, children, className = '' }) {
  const variantStyles = {
    verified: 'bg-success-container text-on-success-container',
    success: 'bg-success-container text-on-success-container',
    pending: 'bg-pending-container text-on-pending-container',
    warning: 'bg-pending-container text-on-pending-container',
    overdue: 'bg-overdue-container text-on-overdue-container',
    error: 'bg-overdue-container text-on-overdue-container',
    primary: 'bg-light-primary-tint text-light-on-primary-tint dark:bg-dark-primary-tint dark:text-dark-on-primary-tint',
    neutral: 'bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant dark:text-dark-on-surface-variant',
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-label text-label-sm whitespace-nowrap tabular-nums ${
        variantStyles[variant] || variantStyles.neutral
      } ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${
            dotColors[variant] || dotColors.neutral
          }`}
        />
      )}
      <span>{children}</span>
    </span>
  )
}

export default Badge
