import React, { useState } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { apiService } from '../../services/api'

export default function LoginScreen({ onLoginSuccess }) {
  const { theme, toggleTheme } = useTheme()
  const [email, setEmail] = useState('admin@bixcel.edu')
  const [password, setPassword] = useState('Admin@123')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activePreset, setActivePreset] = useState('admin')

  const demoAccounts = [
    {
      id: 'admin',
      role: 'Super Admin',
      name: 'Elena Rostova',
      email: 'admin@bixcel.edu',
      password: 'Admin@123',
      badge: 'Full Access',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces',
      icon: 'admin_panel_settings',
      color: 'border-light-primary text-light-primary bg-light-primary/5 dark:bg-light-primary/10',
    },
    {
      id: 'dean',
      role: 'Academic Dean',
      name: 'Dr. Marcus Vance',
      email: 'dean@bixcel.edu',
      password: 'Dean@123',
      badge: 'Academic Lead',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      icon: 'school',
      color: 'border-purple-500 text-purple-600 dark:text-purple-400 bg-purple-500/5 dark:bg-purple-500/10',
    },
    {
      id: 'faculty',
      role: 'Faculty / Tutor',
      name: 'Sophia Chen',
      email: 'faculty@bixcel.edu',
      password: 'Faculty@123',
      badge: 'Instructor',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
      icon: 'co_present',
      color: 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-500/5 dark:bg-blue-500/10',
    },
    {
      id: 'student',
      role: 'Student',
      name: 'Marcus Vance',
      email: 'student@bixcel.edu',
      password: 'Student@123',
      badge: 'Learner',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces',
      icon: 'person',
      color: 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 dark:bg-emerald-500/10',
    },
  ]

  const handleSelectDemo = (acc) => {
    setActivePreset(acc.id)
    setEmail(acc.email)
    setPassword(acc.password)
    setError('')
  }

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
        setError(res?.message || 'Invalid credentials. Please verify your details.')
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.messages?.error ||
        'Authentication failed. Please check credentials or connectivity.'
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
            className="p-2 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors"
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
          <div className="p-6 pb-4 text-center border-b border-light-outline-variant/60 dark:border-dark-outline-variant/60 bg-light-surface-container-low/40 dark:bg-dark-surface-container/20">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-light-primary/10 dark:bg-light-primary/20 text-light-primary flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[26px]">lock</span>
            </div>
            <h1 className="font-title text-[20px] font-bold text-light-on-surface dark:text-dark-on-surface tracking-tight">
              Sign In to Bixcel LMS
            </h1>
            <p className="font-body text-body-sm text-light-on-surface-variant dark:text-dark-on-surface-variant mt-1">
              Select a quick demo persona or enter institutional credentials
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Quick Demo Credentials Switcher */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-label text-label-xs font-semibold uppercase tracking-wider text-light-on-surface-variant dark:text-dark-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-light-primary">bolt</span>
                  Quick Demo Credentials (1-Click Fill)
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((acc) => {
                  const isSelected = activePreset === acc.id
                  return (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleSelectDemo(acc)}
                      className={`text-left p-2.5 rounded-lg border transition-all text-xs flex flex-col justify-between ${
                        isSelected
                          ? `${acc.color} border-2 shadow-sm font-semibold`
                          : 'border-light-outline-variant dark:border-dark-outline-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container text-light-on-surface-variant'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <img
                          src={acc.avatar}
                          alt={acc.name}
                          className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-black/10"
                        />
                        <div className="min-w-0">
                          <p className="font-label text-[12px] font-semibold truncate leading-tight text-light-on-surface dark:text-dark-on-surface">
                            {acc.role}
                          </p>
                          <p className="text-[10px] text-light-outline truncate">{acc.badge}</p>
                        </div>
                      </div>
                      <div className="text-[10px] opacity-80 font-mono truncate">{acc.email}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-start gap-2.5"
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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setActivePreset('')
                    }}
                    placeholder="name@bixcel.edu"
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-sm placeholder:text-light-outline focus:outline-none focus:ring-2 focus:ring-light-primary focus:bg-light-surface-container-lowest"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="login-password"
                    className="block font-label text-label-sm font-medium text-light-on-surface dark:text-dark-on-surface"
                  >
                    Password
                  </label>
                  <span className="text-[11px] font-mono text-light-outline">
                    Default:{' '}
                    <code className="text-light-primary font-bold">Admin@123</code>
                  </span>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined text-[18px] text-light-outline absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    lock
                  </span>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setActivePreset('')
                    }}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-sm placeholder:text-light-outline focus:outline-none focus:ring-2 focus:ring-light-primary focus:bg-light-surface-container-lowest"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-light-outline hover:text-light-on-surface dark:hover:text-dark-on-surface"
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
                className="w-full py-2.5 px-4 rounded-lg bg-light-primary text-light-on-primary font-label text-label-md font-semibold hover:bg-light-primary-container shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
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
            </form>
          </div>

          {/* Footer Credentials Reminder */}
          <div className="p-4 bg-light-surface-container-low/60 dark:bg-dark-surface-container/40 border-t border-light-outline-variant/60 dark:border-dark-outline-variant/60 text-center">
            <p className="text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Master credentials also accepted:{' '}
              <span className="font-mono font-semibold text-light-on-surface dark:text-dark-on-surface">
                Gowtham@1472004
              </span>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-3 border-t border-light-outline-variant/60 dark:border-dark-outline-variant/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-light-outline">
        <div>&copy; 2026-2027 Bixcel LMS. All institutional rights reserved.</div>
        <div className="flex items-center gap-4">
          <span>Version 2.4.0</span>
          <span>•</span>
          <span>CodeIgniter 4 Backend</span>
          <span>•</span>
          <span>React 19 Frontend</span>
        </div>
      </footer>
    </div>
  )
}
