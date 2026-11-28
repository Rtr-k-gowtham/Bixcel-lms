import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

export function DepartmentMaster({ onNavigateToModules }) {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [showModal, setShowModal] = useState(false)
  const [editingDept, setEditingDept] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  const [deleteConfirmDept, setDeleteConfirmDept] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    head_of_dept: '',
    email: '',
    phone: '',
    status: 'Active',
  })

  const showNotification = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const loadDepartments = async () => {
    setLoading(true)
    try {
      const res = await apiService.getDepartments()
      if (res && res.data) {
        setDepartments(Array.isArray(res.data) ? res.data : [])
      } else {
        setDepartments([])
      }
    } catch (err) {
      console.error('Failed to load departments:', err)
      showNotification('Failed to fetch departments from server', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDepartments()
  }, [])

  const openCreateModal = () => {
    setEditingDept(null)
    setFormData({
      code: '',
      name: '',
      description: '',
      head_of_dept: '',
      email: '',
      phone: '',
      status: 'Active',
    })
    setShowModal(true)
  }

  const openEditModal = (dept) => {
    setEditingDept(dept)
    setFormData({
      code: dept.code || '',
      name: dept.name || '',
      description: dept.description || '',
      head_of_dept: dept.head_of_dept || '',
      email: dept.email || '',
      phone: dept.phone || '',
      status: dept.status || 'Active',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.code.trim()) {
      showNotification('Department Name and Code are required', 'error')
      return
    }

    setSubmitting(true)
    try {
      if (editingDept) {
        await apiService.updateDepartment(editingDept.id, formData)
        showNotification(`Department "${formData.name}" updated successfully`)
      } else {
        await apiService.createDepartment(formData)
        showNotification(`Department "${formData.name}" created successfully`)
      }
      setShowModal(false)
      loadDepartments()
    } catch (err) {
      console.error('Failed to save department:', err)
      const errorMsg = err?.response?.data?.messages?.error || err?.response?.data?.message || 'Failed to save department'
      showNotification(errorMsg, 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirmDept) return
    setDeleting(true)
    try {
      await apiService.deleteDepartment(deleteConfirmDept.id)
      showNotification(`Department "${deleteConfirmDept.name}" deleted successfully`)
      setDeleteConfirmDept(null)
      loadDepartments()
    } catch (err) {
      console.error('Failed to delete department:', err)
      showNotification('Failed to delete department', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleStatus = async (dept) => {
    const nextStatus = dept.status === 'Active' ? 'Inactive' : 'Active'
    try {
      await apiService.updateDepartment(dept.id, { status: nextStatus })
      showNotification(`Department ${dept.code} marked as ${nextStatus}`)
      loadDepartments()
    } catch (err) {
      showNotification('Failed to update department status', 'error')
    }
  }

  // Filtered departments
  const filteredDepartments = departments.filter((d) => {
    const matchSearch =
      (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.head_of_dept || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.email || '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchStatus = statusFilter === 'all' || (d.status || 'Active').toLowerCase() === statusFilter.toLowerCase()
    return matchSearch && matchStatus
  })

  // KPIs
  const totalCount = departments.length
  const activeCount = departments.filter((d) => (d.status || 'Active') === 'Active').length
  const totalModules = departments.reduce((acc, curr) => acc + (Number(curr.modules_count) || 0), 0)
  const totalHODs = new Set(departments.filter((d) => d.head_of_dept).map((d) => d.head_of_dept)).size

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded shadow-lg text-xs font-semibold text-white transition-all transform animate-fade-in ${
            toast.type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === 'error' ? 'error' : 'check_circle'}
          </span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Page Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-light-surface-container-lowest dark:bg-dark-surface-bright p-3.5 rounded border border-light-outline-variant/60 dark:border-dark-outline-variant/60 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-light-primary text-[22px]">corporate_fare</span>
            <h1 className="font-title text-base font-bold text-light-on-surface dark:text-dark-on-surface">
              Department Master
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-light-primary/10 text-light-primary dark:bg-dark-primary/20 dark:text-dark-primary">
              {totalCount} Total
            </span>
          </div>
          <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">
            Manage academic faculties, departmental governance, and course module domains.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToModules && (
            <button
              type="button"
              onClick={onNavigateToModules}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container-low text-light-on-surface dark:text-dark-on-surface text-xs font-semibold hover:bg-light-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">library_books</span>
              <span>Module Library</span>
            </button>
          )}

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-light-primary text-light-on-primary text-xs font-semibold shadow-xs hover:bg-light-primary-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3 bg-light-surface-container-lowest dark:bg-dark-surface-bright rounded border border-light-outline-variant/60 dark:border-dark-outline-variant/60 shadow-xs">
          <div className="flex items-center justify-between text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Departments</span>
            <span className="material-symbols-outlined text-[18px] text-light-primary">domain</span>
          </div>
          <div className="text-xl font-bold font-title text-light-on-surface dark:text-dark-on-surface">
            {totalCount}
          </div>
          <span className="text-[10px] text-light-on-surface-variant">Faculty divisions</span>
        </div>

        <div className="p-3 bg-light-surface-container-lowest dark:bg-dark-surface-bright rounded border border-light-outline-variant/60 dark:border-dark-outline-variant/60 shadow-xs">
          <div className="flex items-center justify-between text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Active Status</span>
            <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
          </div>
          <div className="text-xl font-bold font-title text-emerald-600 dark:text-emerald-400">
            {activeCount}
          </div>
          <span className="text-[10px] text-light-on-surface-variant">{totalCount - activeCount} inactive</span>
        </div>

        <div className="p-3 bg-light-surface-container-lowest dark:bg-dark-surface-bright rounded border border-light-outline-variant/60 dark:border-dark-outline-variant/60 shadow-xs">
          <div className="flex items-center justify-between text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Curriculum Modules</span>
            <span className="material-symbols-outlined text-[18px] text-blue-600">library_books</span>
          </div>
          <div className="text-xl font-bold font-title text-light-on-surface dark:text-dark-on-surface">
            {totalModules}
          </div>
          <span className="text-[10px] text-light-on-surface-variant">Active modules linked</span>
        </div>

        <div className="p-3 bg-light-surface-container-lowest dark:bg-dark-surface-bright rounded border border-light-outline-variant/60 dark:border-dark-outline-variant/60 shadow-xs">
          <div className="flex items-center justify-between text-light-on-surface-variant dark:text-dark-on-surface-variant mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Faculty Heads (HODs)</span>
            <span className="material-symbols-outlined text-[18px] text-purple-600">person_celebrate</span>
          </div>
          <div className="text-xl font-bold font-title text-light-on-surface dark:text-dark-on-surface">
            {totalHODs}
          </div>
          <span className="text-[10px] text-light-on-surface-variant">Governing academic leads</span>
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-light-surface-container-lowest dark:bg-dark-surface-bright p-2.5 rounded border border-light-outline-variant/60 dark:border-dark-outline-variant/60 shadow-xs">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-light-outline">
            search
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search departments by code, title, head, or email..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>

          <button
            type="button"
            onClick={loadDepartments}
            title="Refresh List"
            className="p-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant hover:bg-light-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-light-on-surface-variant">refresh</span>
          </button>
        </div>
      </div>

      {/* Departments Data Table */}
      <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright rounded border border-light-outline-variant/60 dark:border-dark-outline-variant/60 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-light-on-surface-variant">
            <span className="material-symbols-outlined text-2xl animate-spin">progress_activity</span>
            <span className="text-xs">Loading department master data...</span>
          </div>
        ) : filteredDepartments.length === 0 ? (
          <div className="py-12 text-center text-light-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 text-light-outline">domain_disabled</span>
            <p className="text-xs font-semibold">No departments found</p>
            <p className="text-[11px] text-light-outline mt-0.5">
              {searchTerm ? 'Try tweaking your search term' : 'Click "Add Department" above to create your first academic faculty'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-light-outline-variant/60 dark:border-dark-outline-variant/60 bg-light-surface-container-low/50 dark:bg-dark-surface-container-low/50 text-light-on-surface-variant dark:text-dark-on-surface-variant text-[11px] font-semibold uppercase tracking-wider">
                  <th className="py-2.5 px-3.5">Code</th>
                  <th className="py-2.5 px-3.5">Department Name & Scope</th>
                  <th className="py-2.5 px-3.5">Head of Dept (HOD)</th>
                  <th className="py-2.5 px-3.5">Official Contact</th>
                  <th className="py-2.5 px-3.5 text-center">Modules</th>
                  <th className="py-2.5 px-3.5 text-center">Status</th>
                  <th className="py-2.5 px-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant/30 dark:divide-dark-outline-variant/30">
                {filteredDepartments.map((dept) => (
                  <tr
                    key={dept.id}
                    className="hover:bg-light-surface-container-low/40 dark:hover:bg-dark-surface-container-low/40 transition-colors"
                  >
                    {/* Code */}
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-light-surface-container-high dark:bg-dark-surface-container-high text-light-primary dark:text-dark-primary border border-light-outline-variant/60 dark:border-dark-outline-variant/60">
                        {dept.code}
                      </span>
                    </td>

                    {/* Name & Description */}
                    <td className="py-2.5 px-3.5">
                      <div className="font-semibold text-light-on-surface dark:text-dark-on-surface">
                        {dept.name}
                      </div>
                      {dept.description && (
                        <div className="text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant line-clamp-1 mt-0.5">
                          {dept.description}
                        </div>
                      )}
                    </td>

                    {/* Head of Dept */}
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      {dept.head_of_dept ? (
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px] text-light-primary">
                            account_circle
                          </span>
                          <span className="font-medium text-light-on-surface dark:text-dark-on-surface">
                            {dept.head_of_dept}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-light-outline italic">Not Assigned</span>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="py-2.5 px-3.5 whitespace-nowrap">
                      <div className="flex flex-col text-[11px]">
                        {dept.email && (
                          <span className="text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            {dept.email}
                          </span>
                        )}
                        {dept.phone && (
                          <span className="text-light-outline">{dept.phone}</span>
                        )}
                        {!dept.email && !dept.phone && (
                          <span className="text-light-outline italic">No contact logged</span>
                        )}
                      </div>
                    </td>

                    {/* Modules Count */}
                    <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center justify-center min-w-6 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50">
                        {dept.modules_count || 0}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3.5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(dept)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold cursor-pointer transition-colors ${
                          dept.status === 'Active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700'
                        }`}
                        title="Click to toggle status"
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          {dept.status === 'Active' ? 'check_circle' : 'pause_circle'}
                        </span>
                        <span>{dept.status || 'Active'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(dept)}
                          className="p-1 rounded hover:bg-light-surface-container-high text-light-on-surface-variant hover:text-light-primary transition-colors cursor-pointer"
                          title="Edit Department"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteConfirmDept(dept)}
                          className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-light-on-surface-variant hover:text-red-600 transition-colors cursor-pointer"
                          title="Delete Department"
                        >
                          <span className="material-symbols-outlined text-[16px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Department Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright rounded border border-light-outline-variant dark:border-dark-outline-variant shadow-xl w-full max-w-lg overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-light-outline-variant/60 dark:border-dark-outline-variant/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-light-primary text-[20px]">
                  {editingDept ? 'edit_square' : 'add_business'}
                </span>
                <h3 className="font-title text-sm font-bold text-light-on-surface dark:text-dark-on-surface">
                  {editingDept ? `Edit Department • ${editingDept.code}` : 'Add New Department'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-light-outline hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Code */}
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface-variant mb-1">
                    Department Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. DEP-FSD"
                    className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface uppercase focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface-variant mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Department Name */}
              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface-variant mb-1">
                  Department Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Full-Stack Software Engineering"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              {/* Head of Department */}
              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface-variant mb-1">
                  Head of Department (HOD)
                </label>
                <input
                  type="text"
                  value={formData.head_of_dept}
                  onChange={(e) => setFormData({ ...formData, head_of_dept: e.target.value })}
                  placeholder="e.g. Dr. Marcus Vance or Gowtham Tamilkathir"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              {/* Contact Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface-variant mb-1">
                    Official Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="dept@bixcel.edu"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-light-on-surface-variant mb-1">
                    Phone / Extension
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 019-2831"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-semibold text-light-on-surface-variant mb-1">
                  Scope & Academic Objectives
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Outline the core academic technologies, competencies, and domain coverage..."
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-light-outline-variant/60 dark:border-dark-outline-variant/60">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant text-xs font-semibold text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-high transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-light-primary text-light-on-primary text-xs font-semibold shadow-xs hover:bg-light-primary-container transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submitting && <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>}
                  <span>{editingDept ? 'Update Department' : 'Create Department'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright rounded border border-light-outline-variant dark:border-dark-outline-variant shadow-xl w-full max-w-sm p-4 animate-scale-up">
            <div className="flex items-center gap-2.5 text-red-600 mb-2">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              <h4 className="font-title text-sm font-bold">Delete Department?</h4>
            </div>
            <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant mb-4">
              Are you sure you want to delete <strong>{deleteConfirmDept.name}</strong> ({deleteConfirmDept.code})?
              Any modules currently assigned to this department will remain in the database.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmDept(null)}
                className="px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant text-xs font-semibold hover:bg-light-surface-container-high"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="px-3.5 py-1.5 rounded bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DepartmentMaster
