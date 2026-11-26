import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

const DEFAULT_USERS = [
  {
    id: 1,
    name: 'Dr. Marcus Vance',
    email: 'm.vance@bixcel.edu',
    emp_id: 'BX-FAC-014',
    role: 'Academic Dean',
    role_code: 'ROLE_DEAN',
    department: 'Computer Science',
    phone: '+1 (555) 234-8901',
    status: 'Active',
    last_login: '10 mins ago',
  },
  {
    id: 2,
    name: 'Elena Rostova',
    email: 'e.rostova@bixcel.edu',
    emp_id: 'BX-ADM-002',
    role: 'Super Admin',
    role_code: 'ROLE_SUPER_ADMIN',
    department: 'Executive Office',
    phone: '+1 (555) 876-5432',
    status: 'Active',
    last_login: 'Just now',
  },
  {
    id: 3,
    name: 'Sophia Chen',
    email: 's.chen@bixcel.edu',
    emp_id: 'BX-TUT-089',
    role: 'Tutor / Faculty',
    role_code: 'ROLE_TUTOR',
    department: 'UI / UX Design',
    phone: '+1 (555) 345-6789',
    status: 'Active',
    last_login: '2 hours ago',
  },
  {
    id: 4,
    name: 'David Miller',
    email: 'd.miller@bixcel.edu',
    emp_id: 'BX-TUT-092',
    role: 'Tutor / Faculty',
    role_code: 'ROLE_TUTOR',
    department: 'Cloud & DevOps',
    phone: '+1 (555) 456-7890',
    status: 'Active',
    last_login: 'Yesterday',
  },
  {
    id: 5,
    name: 'Priya Sharma',
    email: 'p.sharma@bixcel.edu',
    emp_id: 'BX-OPS-031',
    role: 'Admission Officer',
    role_code: 'ROLE_ADMISSIONS',
    department: 'Student Affairs',
    phone: '+1 (555) 567-8901',
    status: 'Active',
    last_login: '3 hours ago',
  },
  {
    id: 6,
    name: 'Michael Sterling',
    email: 'm.sterling@bixcel.edu',
    emp_id: 'BX-FIN-019',
    role: 'Accountant',
    role_code: 'ROLE_FINANCE',
    department: 'Bursar & Finance',
    phone: '+1 (555) 678-9012',
    status: 'Active',
    last_login: '1 day ago',
  },
  {
    id: 7,
    name: 'Alex Vance',
    email: 'a.vance@student.bixcel.edu',
    emp_id: 'BX-STU-1044',
    role: 'Student / Learner',
    role_code: 'ROLE_STUDENT',
    department: 'Full-Stack Web Dev',
    phone: '+1 (555) 789-0123',
    status: 'Active',
    last_login: '45 mins ago',
  },
  {
    id: 8,
    name: 'Robert Langdon',
    email: 'r.langdon@bixcel.edu',
    emp_id: 'BX-ADM-005',
    role: 'Admin',
    role_code: 'ROLE_ADMIN',
    department: 'Academic Operations',
    phone: '+1 (555) 890-1234',
    status: 'Inactive',
    last_login: '3 weeks ago',
  },
]

const ROLES_LIST = [
  'Super Admin',
  'Admin',
  'Academic Dean',
  'Tutor / Faculty',
  'Admission Officer',
  'Accountant',
  'Student / Learner',
]

const DEPARTMENTS = [
  'Computer Science',
  'UI / UX Design',
  'Cloud & DevOps',
  'Executive Office',
  'Student Affairs',
  'Bursar & Finance',
  'Full-Stack Web Dev',
  'General Academics',
]

export function UserMaster() {
  const [users, setUsers] = useState(DEFAULT_USERS)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [toast, setToast] = useState('')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    emp_id: '',
    role: 'Tutor / Faculty',
    department: 'Computer Science',
    phone: '',
    status: 'Active',
  })

  // Fetch users from CI4 API
  useEffect(() => {
    let isMounted = true
    const fetchUsers = async () => {
      try {
        const res = await apiService.getUsers()
        if (res && res.status === 'success' && res.data && isMounted) {
          setUsers(res.data)
        }
      } catch (err) {
        console.warn('Using local fallback for Users:', err)
      }
    }
    fetchUsers()
    return () => { isMounted = false }
  }, [])

  // Open modal for Create or Edit
  const openCreateModal = () => {
    setEditingUser(null)
    setFormData({
      name: '',
      email: '',
      emp_id: `BX-USR-0${users.length + 12}`,
      role: 'Tutor / Faculty',
      department: 'Computer Science',
      phone: '',
      status: 'Active',
    })
    setShowModal(true)
  }

  const openEditModal = (u) => {
    setEditingUser(u)
    setFormData({
      name: u.name,
      email: u.email,
      emp_id: u.emp_id,
      role: u.role,
      department: u.department,
      phone: u.phone,
      status: u.status,
    })
    setShowModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email) return

    if (editingUser) {
      // Update existing
      try {
        await apiService.updateUser(editingUser.id, formData)
      } catch (err) {
        console.warn('API update failed, updating locally:', err)
      }
      setUsers((prev) =>
        prev.map((item) => (item.id === editingUser.id ? { ...item, ...formData } : item))
      )
      setToast(`User "${formData.name}" updated successfully`)
    } else {
      // Create new
      const newUser = {
        id: Date.now(),
        ...formData,
        last_login: 'Never',
      }
      try {
        await apiService.createUser(formData)
      } catch (err) {
        console.warn('API create failed, saving locally:', err)
      }
      setUsers((prev) => [newUser, ...prev])
      setToast(`User "${formData.name}" created successfully`)
    }

    setShowModal(false)
    setTimeout(() => setToast(''), 3500)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to remove user "${name}"?`)) return
    try {
      await apiService.deleteUser(id)
    } catch (err) {
      console.warn('API delete failed, removing locally:', err)
    }
    setUsers((prev) => prev.filter((u) => u.id !== id))
    setToast(`User "${name}" removed`)
    setTimeout(() => setToast(''), 3000)
  }

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Inactive' : 'Active'
    try {
      await apiService.updateUser(user.id, { status: newStatus })
    } catch (err) {
      console.warn('API status toggle failed, toggling locally:', err)
    }
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    )
  }

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.emp_id.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  // Role pill color styling
  const getRoleBadge = (role) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200'
      case 'Admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200'
      case 'Academic Dean':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200'
      case 'Tutor / Faculty':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200'
      case 'Admission Officer':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200'
      case 'Accountant':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200'
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200'
    }
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

      {/* Top Header Card */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="w-7 h-7 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[17px]">manage_accounts</span>
          </span>
          <div className="flex flex-col gap-0.5">
            <h1 className="font-title text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface">
              User Master
            </h1>
            <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Manage platform users, faculty members, administrative staff, and student accounts
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-light-primary hover:bg-light-primary-container text-light-on-primary font-label text-xs font-semibold shadow-xs transition-colors duration-state-change shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          <span>Add New User</span>
        </button>
      </section>

      {/* 4 Quick Stat Tiles */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="p-2.5 rounded bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10.5px] font-label text-light-on-surface-variant uppercase font-medium">Total Users</span>
            <div className="text-[17px] font-bold tabular-nums text-light-on-surface dark:text-dark-on-surface mt-0.5">
              {users.length}
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-light-primary-tint text-light-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">group</span>
          </span>
        </div>

        <div className="p-2.5 rounded bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10.5px] font-label text-light-on-surface-variant uppercase font-medium">Active Staff</span>
            <div className="text-[17px] font-bold tabular-nums text-on-success-container mt-0.5">
              {users.filter((u) => u.status === 'Active' && u.role !== 'Student / Learner').length}
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-success-container text-on-success-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">badge</span>
          </span>
        </div>

        <div className="p-2.5 rounded bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10.5px] font-label text-light-on-surface-variant uppercase font-medium">Faculty Tutors</span>
            <div className="text-[17px] font-bold tabular-nums text-light-primary mt-0.5">
              {users.filter((u) => u.role === 'Tutor / Faculty').length}
            </div>
          </div>
          <span className="w-8 h-8 rounded bg-light-secondary-container text-light-on-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">co_present</span>
          </span>
        </div>

        <div className="p-3.5 rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between">
          <div>
            <span className="text-[11px] font-label text-light-on-surface-variant uppercase">Inactive Accounts</span>
            <div className="text-title-lg font-bold tabular-nums text-light-on-surface-variant mt-0.5">
              {users.filter((u) => u.status === 'Inactive').length}
            </div>
          </div>
          <span className="w-8 h-8 rounded bg-light-surface-container-low text-light-on-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">person_off</span>
          </span>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined text-light-outline text-[18px] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search by name, email, or employee/student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
          />
        </div>

        {/* Role Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-label-sm font-medium text-light-on-surface-variant whitespace-nowrap">
            Role:
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
          >
            <option value="ALL">All Roles ({users.length})</option>
            {ROLES_LIST.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-label-sm font-medium text-light-on-surface-variant whitespace-nowrap">
            Status:
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </section>

      {/* Users Table */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-light-surface-container-low dark:bg-dark-surface-container border-b border-light-outline-variant dark:border-dark-outline-variant text-[11px] font-label font-bold text-light-on-surface-variant dark:text-dark-on-surface-variant uppercase tracking-wider">
                <th scope="col" className="px-5 py-3">
                  User / Contact
                </th>
                <th scope="col" className="px-4 py-3">
                  ID
                </th>
                <th scope="col" className="px-4 py-3">
                  Assigned Role
                </th>
                <th scope="col" className="px-4 py-3">
                  Department
                </th>
                <th scope="col" className="px-4 py-3">
                  Status
                </th>
                <th scope="col" className="px-4 py-3">
                  Last Login
                </th>
                <th scope="col" className="px-5 py-3 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-light-on-surface-variant">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-light-surface-container-low/50 dark:hover:bg-dark-surface-container transition-colors"
                  >
                    {/* User Profile */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-light-primary text-white flex items-center justify-center font-bold text-label-md shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label text-label-md font-semibold text-light-on-surface dark:text-dark-on-surface">
                            {u.name}
                          </span>
                          <span className="font-body text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant">
                            {u.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Emp ID */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface">
                        {u.emp_id}
                      </span>
                    </td>

                    {/* Role Badge */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getRoleBadge(
                          u.role
                        )}`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-body text-body-sm text-light-on-surface dark:text-dark-on-surface">
                        {u.department}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => toggleStatus(u)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-all ${
                          u.status === 'Active'
                            ? 'bg-success-container text-on-success-container'
                            : 'bg-light-surface-container text-light-on-surface-variant'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            u.status === 'Active' ? 'bg-success' : 'bg-light-outline'
                          }`}
                        />
                        <span>{u.status}</span>
                      </button>
                    </td>

                    {/* Last Login */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-body text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        {u.last_login}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          title="Edit User"
                          className="p-1 rounded text-light-on-surface-variant hover:text-light-primary hover:bg-light-surface-container-low transition-colors"
                        >
                          <span className="material-symbols-outlined text-[17px]">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u.id, u.name)}
                          title="Delete User"
                          className="p-1 rounded text-light-on-surface-variant hover:text-overdue hover:bg-light-surface-container-low transition-colors"
                        >
                          <span className="material-symbols-outlined text-[17px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add / Edit User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-md p-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-light-outline-variant dark:border-dark-outline-variant mb-4">
              <h3 className="font-title text-[16px] font-bold text-light-on-surface dark:text-dark-on-surface">
                {editingUser ? 'Edit User Details' : 'Add New User'}
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
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Marcus Vance"
                  className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@bixcel.edu"
                  className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Employee / Student ID
                  </label>
                  <input
                    type="text"
                    value={formData.emp_id}
                    onChange={(e) => setFormData({ ...formData, emp_id: e.target.value })}
                    placeholder="BX-FAC-099"
                    className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary font-mono text-mono-sm"
                  />
                </div>
                <div>
                  <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Role
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    {ROLES_LIST.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Status
                </label>
                <div className="flex items-center gap-4 pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-body-sm">
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={formData.status === 'Active'}
                      onChange={() => setFormData({ ...formData, status: 'Active' })}
                      className="accent-light-primary"
                    />
                    <span>Active</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-body-sm">
                    <input
                      type="radio"
                      name="status"
                      value="Inactive"
                      checked={formData.status === 'Inactive'}
                      onChange={() => setFormData({ ...formData, status: 'Inactive' })}
                      className="accent-light-primary"
                    />
                    <span>Inactive</span>
                  </label>
                </div>
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
                  {editingUser ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMaster
