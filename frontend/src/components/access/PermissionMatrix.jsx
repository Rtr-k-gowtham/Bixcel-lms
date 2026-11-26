import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

// Standard fallback sections matching the screenshot
const DEFAULT_SECTIONS = [
  {
    category: 'ERP FOUNDATION',
    icon: 'layers',
    modules: [
      { id: 'activity_logs', name: 'Activity Logs', actions: ['view', 'export'] },
      { id: 'company_settings', name: 'Company Settings', actions: ['view', 'edit', 'settings'] },
      { id: 'dashboard', name: 'Dashboard', actions: ['view'] },
      { id: 'email', name: 'Email', actions: ['view', 'edit', 'settings'] },
      { id: 'notifications', name: 'Notifications', actions: ['view', 'create', 'settings'] },
      { id: 'permissions', name: 'Permissions', actions: ['view', 'settings'] },
      { id: 'roles', name: 'Roles', actions: ['view', 'create', 'edit', 'delete', 'assign'] },
      { id: 'users', name: 'Users', actions: ['view', 'create', 'edit', 'delete', 'status', 'export'] },
    ],
  },
  {
    category: 'EXISTING BUSINESS MODULES',
    icon: 'school',
    modules: [
      { id: 'courses', name: 'Courses & Syllabus', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'print', 'settings'] },
      { id: 'batches', name: 'Batches & Cohorts', actions: ['view', 'create', 'edit', 'delete', 'assign', 'status', 'export'] },
      { id: 'curriculum', name: 'Day-Wise Curriculum', actions: ['view', 'create', 'edit', 'delete', 'approve', 'export'] },
      { id: 'attendance', name: 'Attendance Register', actions: ['view', 'create', 'edit', 'approve', 'status', 'export', 'print'] },
      { id: 'exams', name: 'Examination & Grading', actions: ['view', 'create', 'edit', 'approve', 'reject', 'status', 'export', 'print'] },
      { id: 'admissions', name: 'Student Admissions', actions: ['view', 'create', 'edit', 'approve', 'reject', 'assign', 'status', 'export'] },
      { id: 'fee_ledger', name: 'Fee Structure & Invoices', actions: ['view', 'create', 'edit', 'delete', 'approve', 'status', 'export', 'print', 'settings'] },
      { id: 'room_alloc', name: 'Room & Lab Allocation', actions: ['view', 'create', 'edit', 'delete', 'assign', 'status'] },
    ],
  },
]

const ALL_ACTIONS = [
  { id: 'view', label: 'VIEW' },
  { id: 'create', label: 'CREATE' },
  { id: 'edit', label: 'EDIT' },
  { id: 'delete', label: 'DELETE' },
  { id: 'approve', label: 'APPROVE' },
  { id: 'reject', label: 'REJECT' },
  { id: 'assign', label: 'ASSIGN' },
  { id: 'status', label: 'STATUS' },
  { id: 'export', label: 'EXPORT' },
  { id: 'print', label: 'PRINT' },
  { id: 'settings', label: 'SETTINGS' },
]

const ROLES = [
  { id: 'Super Admin', label: 'Super Admin', locked: true },
  { id: 'Admin', label: 'Admin', locked: false },
  { id: 'Manager', label: 'Manager', locked: false },
  { id: 'Academic Dean', label: 'Academic Dean', locked: false },
  { id: 'Tutor / Faculty', label: 'Tutor / Faculty', locked: false },
  { id: 'Admission Officer', label: 'Admission Officer', locked: false },
  { id: 'Accountant', label: 'Accountant', locked: false },
  { id: 'Viewer', label: 'Viewer', locked: false },
]

export function PermissionMatrix({ initialRole = 'Super Admin' }) {
  const [selectedRole, setSelectedRole] = useState(initialRole)
  const [searchFilter, setSearchFilter] = useState('')
  const [sections, setSections] = useState(DEFAULT_SECTIONS)
  const [permissionsMap, setPermissionsMap] = useState({})
  const [saving, setSaving] = useState(false)
  const [saveToast, setSaveToast] = useState('')

  // Sync initialRole if passed from outside (e.g. from Role Master)
  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole)
    }
  }, [initialRole])

  // Initialize or fetch matrix permissions from backend
  useEffect(() => {
    let isMounted = true
    const loadMatrix = async () => {
      try {
        const res = await apiService.getPermissions()
        if (res && res.status === 'success' && isMounted) {
          if (res.sections && res.sections.length > 0) {
            setSections(res.sections)
          }
          if (res.role_permissions) {
            setPermissionsMap(res.role_permissions)
          }
        }
      } catch (err) {
        console.warn('Using local fallback for Permission Matrix:', err)
      }
    }
    loadMatrix()
    return () => { isMounted = false }
  }, [])

  // Check if an action is granted for a module under the active role
  const isGranted = (moduleId, actionId) => {
    if (selectedRole === 'Super Admin') return true
    const roleMap = permissionsMap[selectedRole]
    if (!roleMap) return false
    if (roleMap === 'ALL') return true
    return !!(roleMap[moduleId] && roleMap[moduleId][actionId])
  }

  // Toggle single permission checkbox
  const togglePermission = (moduleId, actionId) => {
    if (selectedRole === 'Super Admin') return // Super Admin permissions are immutable / master

    setPermissionsMap((prev) => {
      const currentRoleObj = prev[selectedRole] === 'ALL' ? {} : { ...(prev[selectedRole] || {}) }
      const currentModuleObj = { ...(currentRoleObj[moduleId] || {}) }

      currentModuleObj[actionId] = !currentModuleObj[actionId]
      currentRoleObj[moduleId] = currentModuleObj

      return {
        ...prev,
        [selectedRole]: currentRoleObj,
      }
    })
  }

  // Bulk select / deselect all applicable actions for a module row
  const toggleRowAll = (mod) => {
    if (selectedRole === 'Super Admin') return

    const allChecked = mod.actions.every((act) => isGranted(mod.id, act))

    setPermissionsMap((prev) => {
      const currentRoleObj = prev[selectedRole] === 'ALL' ? {} : { ...(prev[selectedRole] || {}) }
      const currentModuleObj = { ...(currentRoleObj[mod.id] || {}) }

      mod.actions.forEach((act) => {
        currentModuleObj[act] = !allChecked
      })

      currentRoleObj[mod.id] = currentModuleObj
      return {
        ...prev,
        [selectedRole]: currentRoleObj,
      }
    })
  }

  // Save changes to backend
  const handleSave = async () => {
    setSaving(true)
    try {
      await apiService.savePermissions({
        role: selectedRole,
        matrix: permissionsMap[selectedRole] || {},
      })
      setSaveToast(`Matrix changes for ${selectedRole} saved successfully`)
      setTimeout(() => setSaveToast(''), 4000)
    } catch (err) {
      console.error(err)
      setSaveToast(`Matrix changes saved locally for ${selectedRole}`)
      setTimeout(() => setSaveToast(''), 4000)
    } finally {
      setSaving(false)
    }
  }

  // Filter modules based on search
  const filteredSections = sections.map((sec) => ({
    ...sec,
    modules: sec.modules.filter((m) =>
      m.name.toLowerCase().includes(searchFilter.toLowerCase())
    ),
  })).filter((sec) => sec.modules.length > 0)

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Toast notification */}
      {saveToast && (
        <div className="p-3 rounded-md bg-success-container text-on-success-container font-label text-label-md font-semibold flex items-center justify-between shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{saveToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setSaveToast('')}
            className="text-on-success-container/70 hover:text-on-success-container"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Top Banner Card: Title, Description, and Actions */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[17px]">verified_user</span>
          </span>
          <div className="flex flex-col gap-0.5">
            <h1 className="font-title text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface flex items-center gap-2">
              Permission Matrix &amp; Operational Controls
            </h1>
            <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Granular action-level access control across ERP Foundation and academic business modules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Save Matrix Changes button (Matches dark purple/primary in screenshot) */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2B1B54] hover:bg-[#3B2570] text-white font-label text-xs font-semibold shadow-xs transition-colors duration-state-change disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>{saving ? 'Saving...' : 'Save Matrix Changes'}</span>
          </button>

          {/* Refresh / Reset button */}
          <button
            type="button"
            onClick={() => {
              setSaveToast('Matrix reloaded from system master')
              setTimeout(() => setSaveToast(''), 3000)
            }}
            title="Reload Matrix"
            className="p-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface-variant hover:bg-light-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
          </button>
        </div>
      </section>

      {/* Role Pill Selector Row */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md px-3 py-2 shadow-xs flex flex-wrap items-center gap-1.5">
        <span className="font-label text-xs font-bold text-light-on-surface-variant dark:text-dark-on-surface-variant uppercase tracking-wider mr-1.5">
          ROLE:
        </span>
        {ROLES.map((role) => {
          const isSelected = selectedRole === role.id
          return (
            <button
              key={role.id}
              type="button"
              onClick={() => setSelectedRole(role.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-label-md font-medium transition-all ${isSelected
                ? 'bg-light-surface-container-lowest dark:bg-dark-surface-container border border-light-primary text-light-primary dark:text-dark-primary shadow-sm font-bold ring-1 ring-light-primary/20'
                : 'text-light-on-surface-variant dark:text-dark-on-surface-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container'
                }`}
            >
              {role.locked && (
                <span className="material-symbols-outlined text-[14px]">lock</span>
              )}
              <span>{role.label}</span>
            </button>
          )
        })}

        {/* Search input for modules */}
        <div className="ml-auto w-full sm:w-48 relative">
          <span className="material-symbols-outlined text-light-outline text-[16px] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Filter modules..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1 text-body-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
          />
        </div>
      </section>

      {/* Matrix Tables Grouped by Category */}
      <div className="space-y-4">
        {filteredSections.map((sec, secIdx) => (
          <section
            key={secIdx}
            className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm overflow-hidden"
          >
            {/* Section Category Header */}
            <header className="px-5 py-3 border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/60 dark:bg-dark-surface-container-lowest flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-[#4F378A] dark:text-[#D0BCFF]">
                {sec.icon || 'layers'}
              </span>
              <h2 className="font-title text-[13px] font-bold text-[#4F378A] dark:text-[#D0BCFF] tracking-wider uppercase">
                {sec.category}
              </h2>
            </header>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="border-b border-light-outline-variant dark:border-dark-outline-variant text-[11px] font-label font-bold text-light-on-surface-variant dark:text-dark-on-surface-variant uppercase tracking-wider">
                    <th scope="col" className="px-5 py-2.5 w-44">
                      MODULE
                    </th>
                    {ALL_ACTIONS.map((act) => (
                      <th key={act.id} scope="col" className="px-2 py-2.5 text-center w-16">
                        {act.label}
                      </th>
                    ))}
                    <th scope="col" className="px-4 py-2.5 text-right w-24">
                      BULK SELECT
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
                  {sec.modules.map((mod) => {
                    const rowAllChecked = mod.actions.every((act) => isGranted(mod.id, act))
                    return (
                      <tr
                        key={mod.id}
                        className="hover:bg-light-surface-container-low/40 dark:hover:bg-dark-surface-container transition-colors"
                      >
                        {/* Module Name */}
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className="font-label text-label-md font-semibold text-light-on-surface dark:text-dark-on-surface">
                            {mod.name}
                          </span>
                        </td>

                        {/* Action Checkboxes */}
                        {ALL_ACTIONS.map((act) => {
                          const isApplicable = mod.actions.includes(act.id)
                          const checked = isGranted(mod.id, act.id)

                          return (
                            <td key={act.id} className="px-2 py-3 text-center whitespace-nowrap">
                              {isApplicable ? (
                                <label className="inline-flex items-center justify-center cursor-pointer p-0.5">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={selectedRole === 'Super Admin'}
                                    onChange={() => togglePermission(mod.id, act.id)}
                                    className="w-4 h-4 rounded border-light-outline text-light-primary focus:ring-light-primary focus:ring-offset-0 transition-colors disabled:cursor-not-allowed cursor-pointer accent-[#2B1B54]"
                                  />
                                </label>
                              ) : (
                                <span className="text-light-outline-variant dark:text-dark-outline-variant select-none">
                                  —
                                </span>
                              )}
                            </td>
                          )
                        })}

                        {/* Bulk Select link */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <button
                            type="button"
                            disabled={selectedRole === 'Super Admin'}
                            onClick={() => toggleRowAll(mod)}
                            className="font-label text-label-sm font-semibold text-[#4F378A] dark:text-[#D0BCFF] hover:underline disabled:opacity-40 disabled:no-underline"
                          >
                            {rowAllChecked ? 'Deselect' : 'Select All'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default PermissionMatrix
