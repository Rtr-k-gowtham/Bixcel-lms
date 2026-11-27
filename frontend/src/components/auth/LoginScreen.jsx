import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { apiService } from '../../services/api'

export default function LoginScreen({ onLoginSuccess }) {
  const { theme, toggleTheme } = useTheme()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please provide both institutional email and password.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await apiService.login({ email, password, rememberMe })
      if (res && res.status === 'success' && res.user) {
        onLoginSuccess(res.user)
      } else {
        setError(res?.message || 'Invalid credentials. Please verify your email and password.')
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.messages?.error ||
        'Authentication failed. Please verify your credentials or network connectivity.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface transition-colors duration-200">
      {/* Top Bar with Logo & Theme Toggle */}
      <header className="w-full px-6 py-4 flex items-center justify-between border-b border-light-outline-variant/60 dark:border-dark-outline-variant/60">
        <div className="flex items-center gap-3">
          <img
            src={theme === 'dark' ? '/bixcel-logo-negative.png' : '/bixcel-logo.png'}
            alt="Bixcel LMS Logo"
            className="h-9 w-auto object-contain"
          />
          <div className="hidden sm:block border-l border-light-outline-variant dark:border-dark-outline-variant pl-3">
            <span className="font-label text-label-sm font-semibold tracking-wider uppercase text-light-primary">
              Enterprise LMS
            </span>
            <p className="text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant leading-none">
              Institutional Academic Cloud
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-label font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            CI4 Production Cloud Active
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
          <div className="p-6 pb-5 text-center border-b border-light-outline-variant/60 dark:border-dark-outline-variant/60 bg-light-surface-container-low/40 dark:bg-dark-surface-container/20">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-light-primary/10 dark:bg-light-primary/20 text-light-primary flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[26px]">lock</span>
            </div>
            <h1 className="font-title text-[20px] font-bold text-light-on-surface dark:text-dark-on-surface tracking-tight">
              Sign In to Bixcel LMS
            </h1>
            <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1">
              Enter your institutional credentials to access your workspace
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Error Banner */}
            {error && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5 animate-in fade-in duration-150"
              >
                <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
                <div className="flex-1 font-body text-body-sm leading-snug">{error}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="login-email"
                  className="block font-label text-label-sm font-medium text-light-on-surface dark:text-dark-on-surface mb-1"
                >
                  Institutional Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined text-[18px] text-light-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    mail
                  </span>
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@bixcel.edu"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-sm placeholder:text-light-outline focus:outline-none focus:ring-2 focus:ring-light-primary focus:bg-light-surface-container-lowest"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="login-password"
                  className="block font-label text-label-sm font-medium text-light-on-surface dark:text-dark-on-surface mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined text-[18px] text-light-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    lock
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-sm placeholder:text-light-outline focus:outline-none focus:ring-2 focus:ring-light-primary focus:bg-light-surface-container-lowest"
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

              {/* Remember Me & Note */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none text-light-on-surface-variant dark:text-dark-on-surface-variant">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-light-outline-variant text-light-primary focus:ring-light-primary"
                  />
                  <span>Keep me signed in</span>
                </label>
                <span className="text-light-outline text-[11px]">TLS 1.3 256-bit</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-light-primary text-light-on-primary font-label text-label-md font-semibold hover:bg-light-primary-container shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
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
                    <span>Sign In to Bixcel LMS</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </>
                )}
              </button>

              {/* 1-Click Quick Demo Login Personas */}
              <div className="pt-3 border-t border-light-outline-variant/60 dark:border-dark-outline-variant/60">
                <span className="block text-[11px] font-semibold text-light-on-surface-variant dark:text-dark-on-surface-variant mb-2">
                  1-Click Quick Sign-In (Select Role):
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@bixcel.edu')
                      setPassword('Admin@123')
                      onLoginSuccess({
                        id: 1,
                        name: 'Elena Rostova',
                        email: 'admin@bixcel.edu',
                        role: 'Super Admin',
                        role_code: 'ROLE_SUPER_ADMIN',
                        emp_id: 'BX-ADM-002',
                        avatar: '',
                      })
                    }}
                    className="p-1.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container hover:bg-light-primary hover:text-white dark:hover:bg-dark-primary dark:hover:text-black transition-colors text-left flex items-center gap-1.5 text-[11px] font-medium border border-light-outline-variant"
                  >
                    <span className="material-symbols-outlined text-[15px] text-light-primary">admin_panel_settings</span>
                    <span className="truncate">Super Admin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('dean@bixcel.edu')
                      setPassword('Dean@123')
                      onLoginSuccess({
                        id: 2,
                        name: 'Dr. Marcus Vance',
                        email: 'dean@bixcel.edu',
                        role: 'Academic Dean',
                        role_code: 'ROLE_DEAN',
                        emp_id: 'BX-FAC-014',
                        avatar: '',
                      })
                    }}
                    className="p-1.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container hover:bg-light-primary hover:text-white dark:hover:bg-dark-primary dark:hover:text-black transition-colors text-left flex items-center gap-1.5 text-[11px] font-medium border border-light-outline-variant"
                  >
                    <span className="material-symbols-outlined text-[15px] text-purple-600">school</span>
                    <span className="truncate">Academic Dean</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('faculty@bixcel.edu')
                      setPassword('Faculty@123')
                      onLoginSuccess({
                        id: 3,
                        name: 'Sophia Chen',
                        email: 'faculty@bixcel.edu',
                        role: 'Tutor / Faculty',
                        role_code: 'ROLE_TUTOR',
                        emp_id: 'BX-TUT-089',
                        avatar: '',
                      })
                    }}
                    className="p-1.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container hover:bg-light-primary hover:text-white dark:hover:bg-dark-primary dark:hover:text-black transition-colors text-left flex items-center gap-1.5 text-[11px] font-medium border border-light-outline-variant"
                  >
                    <span className="material-symbols-outlined text-[15px] text-blue-600">co_present</span>
                    <span className="truncate">Faculty Tutor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('student@bixcel.edu')
                      setPassword('Student@123')
                      onLoginSuccess({
                        id: 4,
                        name: 'Marcus Vance',
                        email: 'student@bixcel.edu',
                        role: 'Student',
                        role_code: 'ROLE_STUDENT',
                        emp_id: 'STU-2026-0842',
                        avatar: '',
                      })
                    }}
                    className="p-1.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container hover:bg-light-primary hover:text-white dark:hover:bg-dark-primary dark:hover:text-black transition-colors text-left flex items-center gap-1.5 text-[11px] font-medium border border-light-outline-variant"
                  >
                    <span className="material-symbols-outlined text-[15px] text-green-600">person</span>
                    <span className="truncate">Student</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-3 border-t border-light-outline-variant/60 dark:border-dark-outline-variant/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-light-outline">
        <div>&copy; 2026-2027 Bixcel LMS. All institutional rights reserved.</div>
        <div className="flex items-center gap-4">
          <span>Version 2.4.0</span>
          <span>•</span>
          <span>CodeIgniter 4 Cloud Backend</span>
          <span>•</span>
          <span>React 19 Enterprise Client</span>
        </div>
      </footer>
    </div>
  )
}
