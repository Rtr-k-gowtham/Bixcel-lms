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
    <article
      data-component-id="card-elevated"
      data-component-type="card"
      data-component-variant="elevated"
      className={`bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm transition-colors duration-state-change flex flex-col ${className}`}
      {...props}
    >
      {(header || title) && (
        <header className="px-5 py-3.5 border-b border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between gap-4">
          <div>
            {title && (
              <h2 className="font-title text-title-lg text-light-on-surface dark:text-dark-on-surface">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">
                {subtitle}
              </p>
            )}
            {header}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </header>
      )}

      <div className={`flex-1 ${noPadding ? '' : 'p-5'}`}>{children}</div>

      {footer && (
        <footer className="px-5 py-3 border-t border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container-lowest">
          {footer}
        </footer>
      )}
    </article>
  )
}

export default Card
