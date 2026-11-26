import React from 'react'

export function Card({
  children,
  className = '',
  header,
  footer,
  action,
  title,
  subtitle,
  noPadding = false,
  ...props
}) {
  return (
    <div
      className={`bg-light-surface-bright dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-card hover:shadow-card-hover transition-all duration-surface-enter flex flex-col overflow-hidden ${className}`}
      {...props}
    >
      {(header || title) && (
        <div className="px-5 py-4 border-b border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="font-headline text-headline-sm md:text-title-lg font-semibold text-light-on-surface dark:text-dark-on-surface">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">
                {subtitle}
              </p>
            )}
            {header}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}

      <div className={`flex-1 ${noPadding ? '' : 'p-5'}`}>{children}</div>

      {footer && (
        <div className="px-5 py-3 border-t border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container-lowest">
          {footer}
        </div>
      )}
    </div>
  )
}

export default Card
