import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

const DEFAULT_ROLES = [
  {
    id: 1,
    name: 'Super Admin',
    code: 'ROLE_SUPER_ADMIN',
    users_count: 2,
    scope: 'Full Enterprise Scope',
    is_system: true,
    description: 'Unrestricted master access across all ERP foundations, academic telemetry, and financial ledgers.',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Admin',
    code: 'ROLE_ADMIN',
    users_count: 4,
    scope: 'System & Operational Scope',
    is_system: true,
    description: 'Configures courses, timetables, batch assignments, and standard platform operational settings.',
    status: 'Active',
  },
  {
    id: 3,
    name: 'Academic Dean',
    code: 'ROLE_DEAN',
    users_count: 3,
    scope: 'Departmental Governance',
    is_system: false,
    description: 'Authorizes curriculum modifications, oversees faculty evaluations, and approves student certifications.',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Tutor / Faculty',
    code: 'ROLE_TUTOR',
    users_count: 38,
    scope: 'Instructional Delivery',
    is_system: false,
    description: 'Conducts lectures, marks student attendance, reviews assignments, and publishes examination scores.',
    status: 'Active',
  },
  {
    id: 5,
    name: 'Admission Officer',
    code: 'ROLE_ADMISSIONS',
    users_count: 6,
    scope: 'Student Intake Operations',
    is_system: false,
    description: 'Processes enrollment applications, verifies academic credentials, and assigns students to active cohorts.',
    status: 'Active',
  },
  {
    id: 6,
    name: 'Accountant',
    code: 'ROLE_FINANCE',
    users_count: 5,
    scope: 'Bursar & Financial Ledgers',
    is_system: false,
    description: 'Generates tuition invoices, tracks installment reconciliations, audits overdue balances, and prints receipts.',
    status: 'Active',
  },
  {
    id: 7,
    name: 'Student / Learner',
    code: 'ROLE_STUDENT',
    users_count: 2840,
    scope: 'Self-Service Academic Portal',
    is_system: true,
    description: 'Accesses enrolled courses, attends live lectures, submits assignments, and reviews personal grade cards.',
    status: 'Active',
  },
]

export function RoleMaster({ onNavigateToMatrix }) {
  const [roles, setRoles] = useState(DEFAULT_ROLES)
  const [showModal, setShowModal] = useState(false)
  const [editingRole, setEditingRole] = useState(null)
  const [toast, setToast] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    scope: 'Departmental Scope',
    description: '',
    status: 'Active',
  })

  // Load roles from backend
  useEffect(() => {
    let isMounted = true
    const fetchRoles = async () => {
      try {
        const res = await apiService.getRoles()
        if (res && res.status === 'success' && res.data && isMounted) {
          setRoles(res.data)
        }
      } catch (err) {
        console.warn('Using local fallback for Roles:', err)
      }
    }
    fetchRoles()
    return () => { isMounted = false }
  }, [])

  const openCreateModal = () => {
    setEditingRole(null)
    setFormData({
      name: '',
      code: '',
      scope: 'Departmental Scope',
      description: '',
      status: 'Active',
    })
    setShowModal(true)
  }

  const openEditModal = (r) => {
    setEditingRole(r)
    setFormData({
      name: r.name,
      code: r.code,
      scope: r.scope,
      description: r.description,
      status: r.status,
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.code) return

    if (editingRole) {
      try {
        await apiService.updateRole(editingRole.id, formData)
      } catch (err) {
        console.warn('API update failed, updating locally:', err)
      }
      setRoles((prev) =>
        prev.map((item) => (item.id === editingRole.id ? { ...item, ...formData } : item))
      )
      setToast(`Role "${formData.name}" updated successfully`)
    } else {
      const newRole = {
        id: Date.now(),
        ...formData,
        code: formData.code.toUpperCase(),
        users_count: 0,
        is_system: false,
      }
      try {
        await apiService.createRole(formData)
      } catch (err) {
        console.warn('API create failed, saving locally:', err)
      }
      setRoles((prev) => [...prev, newRole])
      setToast(`Role "${formData.name}" created successfully`)
    }

    setShowModal(false)
    setTimeout(() => setToast(''), 3500)
  }

  const handleDelete = async (id, name, isSystem) => {
    if (isSystem) {
      alert('System-protected roles cannot be removed.')
      return
    }
    if (!confirm(`Are you sure you want to remove role "${name}"?`)) return
    try {
      await apiService.deleteRole(id)
    } catch (err) {
      console.warn('API delete failed, removing locally:', err)
    }
    setRoles((prev) => prev.filter((r) => r.id !== id))
    setToast(`Role "${name}" removed`)
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

      {/* Top Banner Card */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[20px]">badge</span>
          </span>
          <div className="flex flex-col gap-0.5">
            <h1 className="font-title text-title-lg font-bold text-light-on-surface dark:text-dark-on-surface">
              Role Master
            </h1>
            <p className="font-body text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Define authority tiers, departmental responsibilities, and operational scope boundaries
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-light-primary hover:bg-light-primary-container text-light-on-primary font-label text-label-md font-semibold shadow-sm transition-colors duration-state-change shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add_moderator</span>
          <span>Create New Role</span>
        </button>
      </section>

      {/* Role Cards Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((r) => (
          <article
            key={r.id}
            className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-4 shadow-sm flex flex-col justify-between gap-3 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h3 className="font-title text-[15px] font-bold text-light-on-surface dark:text-dark-on-surface">
                      {r.name}
                    </h3>
                    {r.is_system && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        System
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-mono-xs text-light-primary font-semibold mt-0.5">
                    {r.code}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-light-surface-container-low dark:bg-dark-surface-container text-label-sm font-semibold tabular-nums text-light-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]">groups</span>
                  <span>{r.users_count.toLocaleString()}</span>
                </span>
              </div>

              <p className="font-body text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant line-clamp-2">
                {r.description}
              </p>
            </div>

            <div className="pt-2 border-t border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => onNavigateToMatrix && onNavigateToMatrix(r.name)}
                className="inline-flex items-center gap-1.5 text-label-sm font-semibold text-[#4F378A] dark:text-[#D0BCFF] hover:underline"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                <span>Configure Matrix</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => openEditModal(r)}
                  title="Edit Role"
                  className="p-1 rounded text-light-on-surface-variant hover:text-light-primary hover:bg-light-surface-container-low transition-colors"
                >
                  <span className="material-symbols-outlined text-[17px]">edit</span>
                </button>
                {!r.is_system && (
                  <button
                    type="button"
                    onClick={() => handleDelete(r.id, r.name, r.is_system)}
                    title="Delete Role"
                    className="p-1 rounded text-light-on-surface-variant hover:text-overdue hover:bg-light-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[17px]">delete</span>
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Create / Edit Role Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-md p-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-light-outline-variant dark:border-dark-outline-variant mb-4">
              <h3 className="font-title text-[16px] font-bold text-light-on-surface dark:text-dark-on-surface">
                {editingRole ? 'Edit Role' : 'Create New Role'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-light-on-surface-variant hover:text-light-on-surface p-1 rounded"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5">
              <div>
                <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Role Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Lab Coordinator"
                  className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Role Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="ROLE_LAB_COORD"
                  className="w-full px-3 py-1.5 text-body-sm font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary uppercase"
                />
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Scope Tier
                </label>
                <input
                  type="text"
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                  placeholder="e.g. Departmental Labs"
                  className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summarize the core operational responsibilities of this role..."
                  className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-light-outline-variant dark:border-dark-outline-variant mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant text-body-sm hover:bg-light-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-light-primary hover:bg-light-primary-container text-light-on-primary font-semibold text-body-sm shadow-sm transition-colors"
                >
                  {editingRole ? 'Save Changes' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoleMaster
