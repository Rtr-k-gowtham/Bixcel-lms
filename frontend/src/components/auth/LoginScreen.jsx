import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { apiService } from '../../services/api'

export default function LoginScreen({ onLoginSuccess }) {
  const { theme, toggleTheme } = useTheme()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    if (e) e.preventDefault()
    if (!identifier.trim() || !password.trim()) {
      setError('Please provide your ID, Username, or Email, and your password.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await apiService.login({
        email: identifier.trim(),
        password: password.trim(),
        portal: 'all',
        rememberMe,
      })

      if (res && res.status === 'success' && res.user) {
        try {
          localStorage.setItem('bx_auth_token', res.token || 'bx_session')
          localStorage.setItem('bx_auth_user', JSON.stringify(res.user))
          localStorage.removeItem('bx_logged_out')
        } catch {
          // ignore
        }
        onLoginSuccess(res.user)
      } else {
        setError(res?.message || 'Invalid credentials. Please verify your ID/Email and password.')
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.messages?.error ||
        err.message ||
        'Authentication failed. Please verify your ID/Email and password.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface transition-colors duration-200 font-body">
      {/* Top Bar with Brand & Theme Toggle */}
      <header className="w-full px-6 py-3.5 flex items-center justify-between border-b border-light-outline-variant/60 dark:border-dark-outline-variant/60 bg-light-surface-container-lowest/80 dark:bg-dark-surface-bright/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <img
            src={theme === 'dark' ? '/bixcel-logo-negative.png' : '/bixcel-logo.png'}
            alt="Bixcel LMS Logo"
            className="h-9 w-auto object-contain"
          />
          <div className="hidden sm:block border-l border-light-outline-variant dark:border-dark-outline-variant pl-3">
            <span className="font-label text-label-sm font-semibold tracking-wider uppercase text-light-primary">
              Institutional LMS
            </span>
            <p className="text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant leading-none">
              Role-Protected Academic Portal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-label font-medium border bg-light-primary/10 text-light-primary border-light-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
            Unified Institutional Access
          </span>

          <button
            onClick={toggleTheme}
            type="button"
            className="p-2 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle color theme"
          >
            <span className="material-symbols-outlined text-[19px]">
              {theme === 'light' ? 'dark_mode' : 'light_mode'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Card Header */}
          <div className="p-6 pb-4 border-b border-light-outline-variant/60 dark:border-dark-outline-variant/60 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-light-primary/15 text-light-primary flex items-center justify-center shrink-0 shadow-inner">
              <span className="material-symbols-outlined text-[26px]">lock</span>
            </div>
            <div>
              <h1 className="font-title text-[19px] font-bold text-light-on-surface dark:text-dark-on-surface tracking-tight">
                Institutional Sign In
              </h1>
              <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1 leading-snug">
                Enter your authorized credentials to access your portal workspace.
              </p>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 space-y-4">
            {/* Error Banner */}
            {error && (
              <div
                role="alert"
                className="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-150"
              >
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                <div className="flex-1 font-body text-xs leading-snug">{error}</div>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Identifier Input */}
              <div>
                <label
                  htmlFor="portal-identifier"
                  className="block font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1.5"
                >
                  Username, Email, or ID <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined text-[18px] text-light-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    person
                  </span>
                  <input
                    id="portal-identifier"
                    type="text"
                    required
                    autoFocus
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. STU-2026-0843 or admin@bixceltech.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body placeholder:text-light-outline focus:outline-none focus:ring-2 focus:ring-light-primary focus:bg-light-surface-container-lowest transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="portal-password"
                  className="block font-label text-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1.5"
                >
                  Password <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined text-[18px] text-light-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    key
                  </span>
                  <input
                    id="portal-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-xs rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body placeholder:text-light-outline focus:outline-none focus:ring-2 focus:ring-light-primary focus:bg-light-surface-container-lowest transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-light-outline hover:text-light-on-surface dark:hover:text-dark-on-surface cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-light-outline-variant text-light-primary focus:ring-light-primary"
                  />
                  <span>Keep me signed in</span>
                </label>
                <span className="text-light-outline text-[11px] font-mono">TLS 1.3 / AES-256</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-light-primary text-light-on-primary font-label text-xs font-semibold hover:bg-light-primary-container shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] animate-spin">
                      progress_activity
                    </span>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-3 border-t border-light-outline-variant/60 dark:border-dark-outline-variant/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-light-outline">
        <div>&copy; 2026-2027 Bixcel LMS. All institutional rights reserved.</div>
        <div className="flex items-center gap-3">
          <span>Role-Based Access Control</span>
          <span>•</span>
          <span>Database Protected</span>
          <span>•</span>
          <span>React 19</span>
        </div>
      </footer>
    </div>
  )
}
