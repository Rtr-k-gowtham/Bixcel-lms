import React from 'react'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-label rounded transition-colors duration-state-change focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none whitespace-nowrap'

  const sizeStyles = {
    sm: 'text-label-md px-3 py-1.5 gap-1.5 rounded',
    md: 'text-label-lg px-4 py-2 gap-2 rounded',
    lg: 'text-label-lg px-4 py-2.5 gap-2 rounded',
    icon: 'p-1.5 rounded',
  }

  const variantStyles = {
    primary:
      'bg-light-primary hover:bg-light-primary-container text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary dark:hover:bg-dark-primary-container shadow-sm active:scale-[0.99] focus:ring-light-primary',
    secondary:
      'bg-light-secondary hover:bg-light-secondary-container text-light-on-secondary dark:bg-dark-secondary dark:text-dark-on-secondary shadow-sm active:scale-[0.99] focus:ring-light-secondary',
    outline:
      'border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container-low shadow-sm active:scale-[0.99] focus:ring-light-primary',
    ghost:
      'text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container hover:text-light-on-surface dark:hover:text-dark-on-surface focus:ring-light-outline',
    danger:
      'bg-overdue hover:bg-on-overdue-container text-on-overdue shadow-sm active:scale-[0.99] focus:ring-overdue',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className="material-symbols-outlined text-[18px] shrink-0">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="material-symbols-outlined text-[18px] shrink-0">{icon}</span>
      )}
    </button>
  )
}

export default Button
