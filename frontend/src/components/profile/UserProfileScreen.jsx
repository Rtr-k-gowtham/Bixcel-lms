import React, { useState, useEffect } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { apiService } from '../../services/api'

const DEFAULT_PROFILE = {
  id: 2,
  name: 'Elena Rostova',
  first_name: 'Elena',
  last_name: 'Rostova',
  email: 'e.rostova@bixcel.edu',
  emp_id: 'BX-ADM-002',
  role: 'Super Admin',
  role_code: 'ROLE_SUPER_ADMIN',
  department: 'Executive Office',
  institution: 'Bixcel Institute of Technologies Private Limited',
  phone: '+1 (555) 876-5432',
  office: 'Suite 401, Tech Tower A',
  join_date: 'January 15, 2024',
  timezone: 'UTC+05:30 (Asia/Kolkata)',
  bio: 'Principal Executive Director overseeing institutional LMS architecture, academic compliance, and multi-tenant security operations at Bixcel Institute.',
  avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces',
  security: {
    two_factor_enabled: true,
    auth_app_synced: true,
    password_changed_at: 'October 12, 2026',
    failed_logins: 0,
  },
  sessions: [
    {
      id: 'SES-901',
      device: 'Windows 11 • Chrome 128',
      is_current: true,
      ip: '192.168.1.102',
      location: 'Chennai, India',
      started: 'Today at 08:30 AM',
      status: 'Active',
    },
    {
      id: 'SES-902',
      device: 'macOS Sonoma • Safari 17',
      is_current: false,
      ip: '192.168.1.115',
      location: 'Bangalore, India',
      started: 'Yesterday at 04:12 PM',
      status: 'Idle',
    },
    {
      id: 'SES-903',
      device: 'iPhone 15 Pro • Bixcel Mobile App',
      is_current: false,
      ip: '10.0.0.54',
      location: 'Chennai, India',
      started: 'Nov 24, 2026',
      status: 'Idle',
    },
  ],
  preferences: {
    theme: 'system',
    email_digest: 'daily',
    sms_critical_alerts: true,
    default_landing: 'dashboard',
    language: 'en-US',
  },
}

export function UserProfileScreen() {
  const { theme, toggleTheme } = useTheme()
  const [profile, setProfile] = useState(DEFAULT_PROFILE)
  const [activeTab, setActiveTab] = useState('INFO')
  const [toast, setToast] = useState('')
  const [saving, setSaving] = useState(false)

  // Password state
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirm: '',
  })

  // Load profile from CI4 API
  useEffect(() => {
    let isMounted = true
    const loadProfile = async () => {
      try {
        const res = await apiService.getProfile()
        if (res && res.status === 'success' && res.data && isMounted) {
          setProfile(res.data)
        }
      } catch (err) {
        console.warn('Using local fallback for Profile:', err)
      }
    }
    loadProfile()
    return () => { isMounted = false }
  }, [])

  const handleInfoSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await apiService.updateProfile(profile)
      setToast('Profile details updated successfully')
      setTimeout(() => setToast(''), 3000)
    } catch (err) {
      console.warn(err)
      setToast('Profile updated locally')
      setTimeout(() => setToast(''), 3000)
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    if (passwords.newPass !== passwords.confirm) {
      alert('New password and confirm password do not match')
      return
    }
    setToast('Security credentials updated successfully')
    setPasswords({ current: '', newPass: '', confirm: '' })
    setTimeout(() => setToast(''), 3000)
  }

  const handleRevokeSession = async (sessId) => {
    try {
      await apiService.revokeSession(sessId)
    } catch (err) {
      console.warn(err)
    }
    setProfile((prev) => ({
      ...prev,
      sessions: prev.sessions.filter((s) => s.id !== sessId),
    }))
    setToast('Session revoked')
    setTimeout(() => setToast(''), 3000)
  }

  const toggle2FA = () => {
    const newState = !profile.security.two_factor_enabled
    setProfile((prev) => ({
      ...prev,
      security: { ...prev.security, two_factor_enabled: newState },
    }))
    setToast(`Two-Factor Authentication ${newState ? 'enabled' : 'disabled'}`)
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Toast */}
      {toast && (
        <div className="p-3 rounded-md bg-success-container text-on-success-container font-label text-label-md font-semibold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{toast}</span>
          </div>
          <button type="button" onClick={() => setToast('')}>
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Profile Header Hero Card */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start justify-between gap-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-light-primary text-white flex items-center justify-center font-bold text-2xl shadow-md border-2 border-light-surface-container-lowest dark:border-dark-surface-bright overflow-hidden">
              {profile.name.charAt(0)}
            </div>
            <span className="w-5 h-5 rounded-full bg-success border-2 border-light-surface-container-lowest dark:border-dark-surface-bright absolute bottom-0 right-0" title="Online" />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="font-title text-title-lg font-bold text-light-on-surface dark:text-dark-on-surface">
                {profile.name}
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200">
                {profile.role}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant font-mono">
              <span>{profile.email}</span>
              <span>•</span>
              <span>{profile.emp_id}</span>
              <span>•</span>
              <span className="font-body">{profile.department}</span>
            </div>

            <p className="font-body text-body-xs text-light-on-surface-variant max-w-xl mt-1">
              {profile.bio}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('INFO')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-light-primary hover:bg-light-primary-container text-light-on-primary font-label text-label-md font-semibold shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[17px]">edit</span>
            <span>Edit Profile</span>
          </button>
        </div>
      </section>

      {/* Sub Tabs */}
      <section className="flex flex-wrap items-center gap-2 border-b border-light-outline-variant dark:border-dark-outline-variant pb-2">
        {[
          { id: 'INFO', label: 'Personal Information', icon: 'person' },
          { id: 'SECURITY', label: 'Security & Credentials', icon: 'shield' },
          { id: 'SESSIONS', label: `Active Sessions (${profile.sessions.length})`, icon: 'devices' },
          { id: 'PREFERENCES', label: 'Preferences & Appearance', icon: 'tune' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded font-label text-label-sm font-semibold transition-all ${
              activeTab === t.id
                ? 'bg-light-primary text-light-on-primary shadow-sm'
                : 'bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant hover:text-light-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </section>

      {/* TAB 1: Personal Information */}
      {activeTab === 'INFO' && (
        <form onSubmit={handleInfoSubmit} className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-5 shadow-sm space-y-4">
          <header className="pb-3 border-b border-light-outline-variant dark:border-dark-outline-variant">
            <h2 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
              Personal &amp; Departmental Records
            </h2>
            <p className="font-body text-body-xs text-light-on-surface-variant">
              Official institutional credentials associated with your account
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                First Name
              </label>
              <input
                type="text"
                value={profile.first_name}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value, name: `${e.target.value} ${profile.last_name}` })}
                className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
              />
            </div>
            <div>
              <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={profile.last_name}
                onChange={(e) => setProfile({ ...profile, last_name: e.target.value, name: `${profile.first_name} ${e.target.value}` })}
                className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
              />
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                Official Email (Read-only)
              </label>
              <input
                type="email"
                readOnly
                value={profile.email}
                className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/60 text-light-on-surface-variant font-mono text-mono-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
              />
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                Assigned Department
              </label>
              <input
                type="text"
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
              />
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                Office Location
              </label>
              <input
                type="text"
                value={profile.office}
                onChange={(e) => setProfile({ ...profile, office: e.target.value })}
                className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                Executive Bio
              </label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-light-outline-variant dark:border-dark-outline-variant">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-light-primary hover:bg-light-primary-container text-light-on-primary font-semibold text-label-md shadow-sm transition-colors"
            >
              {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Security & Passwords */}
      {activeTab === 'SECURITY' && (
        <div className="space-y-4">
          {/* 2FA Card */}
          <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-5 shadow-sm flex items-center justify-between">
            <div className="flex items-start gap-3">
              <span className="w-9 h-9 rounded bg-success-container text-on-success-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">security</span>
              </span>
              <div>
                <h3 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                  Two-Factor Authentication (2FA)
                </h3>
                <p className="font-body text-body-xs text-light-on-surface-variant">
                  Protect institutional admin privileges with TOTP Authenticator apps
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggle2FA}
              className={`px-3.5 py-1.5 rounded font-label text-label-sm font-semibold transition-colors ${
                profile.security.two_factor_enabled
                  ? 'bg-success-container text-on-success-container'
                  : 'bg-light-surface-container-low text-light-on-surface-variant'
              }`}
            >
              {profile.security.two_factor_enabled ? '✓ 2FA Enabled' : 'Enable 2FA'}
            </button>
          </section>

          {/* Change Password Form */}
          <form onSubmit={handlePasswordSubmit} className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-5 shadow-sm space-y-4">
            <header className="pb-3 border-b border-light-outline-variant dark:border-dark-outline-variant">
              <h3 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                Update Account Password
              </h3>
              <p className="font-body text-body-xs text-light-on-surface-variant">
                Last changed on {profile.security.password_changed_at}
              </p>
            </header>

            <div className="max-w-md space-y-3">
              <div>
                <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwords.newPass}
                  onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                  placeholder="Minimum 8 characters with numbers"
                  className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>
            </div>

            <div className="flex justify-start pt-3 border-t border-light-outline-variant dark:border-dark-outline-variant">
              <button
                type="submit"
                className="px-4 py-2 rounded bg-light-primary hover:bg-light-primary-container text-light-on-primary font-semibold text-label-md shadow-sm transition-colors"
              >
                Change Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Active Sessions */}
      {activeTab === 'SESSIONS' && (
        <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-5 shadow-sm space-y-4">
          <header className="pb-3 border-b border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between">
            <div>
              <h3 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                Recognized Devices &amp; Active Logins
              </h3>
              <p className="font-body text-body-xs text-light-on-surface-variant">
                If you notice suspicious activity, revoke the session immediately
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setProfile((prev) => ({
                  ...prev,
                  sessions: prev.sessions.filter((s) => s.is_current),
                }))
                setToast('All other devices logged out')
                setTimeout(() => setToast(''), 3000)
              }}
              className="font-label text-label-sm font-semibold text-overdue hover:underline"
            >
              Sign out other devices
            </button>
          </header>

          <div className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
            {profile.sessions.map((sess) => (
              <div key={sess.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex items-center justify-center shrink-0 mt-0.5">
                    <span className="material-symbols-outlined text-[18px]">
                      {sess.device.includes('iPhone') ? 'smartphone' : 'laptop_mac'}
                    </span>
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-label-md text-light-on-surface dark:text-dark-on-surface font-semibold">
                        {sess.device}
                      </strong>
                      {sess.is_current && (
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-success-container text-on-success-container">
                          Current Device
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-light-on-surface-variant block mt-0.5">
                      {sess.ip} • {sess.location} • Started {sess.started}
                    </span>
                  </div>
                </div>

                {!sess.is_current && (
                  <button
                    type="button"
                    onClick={() => handleRevokeSession(sess.id)}
                    className="self-end sm:self-center px-3 py-1 rounded text-label-xs font-semibold text-overdue border border-overdue/20 hover:bg-overdue-container transition-colors"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 4: Preferences & Appearance */}
      {activeTab === 'PREFERENCES' && (
        <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-5 shadow-sm space-y-4">
          <header className="pb-3 border-b border-light-outline-variant dark:border-dark-outline-variant">
            <h3 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
              Appearance &amp; Notification Preferences
            </h3>
            <p className="font-body text-body-xs text-light-on-surface-variant">
              Customize interface display density, theme modes, and dispatch channels
            </p>
          </header>

          <div className="max-w-lg space-y-4">
            <div>
              <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                Visual Theme Mode
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => theme === 'dark' && toggleTheme()}
                  className={`px-4 py-2 rounded text-label-sm font-semibold border ${
                    theme === 'light'
                      ? 'bg-light-primary text-white border-light-primary shadow-sm'
                      : 'bg-light-surface-container-low text-light-on-surface-variant border-light-outline-variant'
                  }`}
                >
                  Light Mode
                </button>
                <button
                  type="button"
                  onClick={() => theme === 'light' && toggleTheme()}
                  className={`px-4 py-2 rounded text-label-sm font-semibold border ${
                    theme === 'dark'
                      ? 'bg-light-primary text-white border-light-primary shadow-sm'
                      : 'bg-light-surface-container-low text-light-on-surface-variant border-light-outline-variant'
                  }`}
                >
                  Dark Mode
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-light-outline-variant dark:border-dark-outline-variant">
              <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                Default Landing Workspace
              </label>
              <select
                value={profile.preferences.default_landing}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, default_landing: e.target.value },
                  })
                }
                className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
              >
                <option value="dashboard">Executive Dashboard</option>
                <option value="courses">Course Management</option>
                <option value="users">User Master</option>
                <option value="permissions">Permission Matrix</option>
                <option value="audit">Audit Logs</option>
              </select>
            </div>

            <div className="pt-2 border-t border-light-outline-variant dark:border-dark-outline-variant">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface">
                    Critical SMS Alerts
                  </span>
                  <span className="block text-body-xs text-light-on-surface-variant">
                    Receive urgent SMS notifications for security lockouts and server fails
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={profile.preferences.sms_critical_alerts}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      preferences: {
                        ...profile.preferences,
                        sms_critical_alerts: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 rounded accent-light-primary"
                />
              </label>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default UserProfileScreen
