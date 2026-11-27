import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

const DEFAULT_USERS = [
  {
    id: 101,
    name: 'Elena Rostova (Super Admin)',
    username: 'superadmin',
    email: 'superadmin@bixceltech.com',
    emp_id: 'BX-SADM-001',
    role: 'Super Admin',
    role_code: 'ROLE_SUPER_ADMIN',
    department: 'Executive Office',
    phone: '+1 (555) 876-5432',
    status: 'Active',
    last_login: 'Just now',
    raw_password: 'Admin@123',
    institution: 'Bixcel Technologies (bixceltech.com)',
  },
  {
    id: 102,
    name: 'Alexander Hayes (Admin)',
    username: 'admin',
    email: 'admin@bixceltech.com',
    emp_id: 'BX-ADM-001',
    role: 'Admin',
    role_code: 'ROLE_ADMIN',
    department: 'Academic Operations',
    phone: '+1 (555) 890-1234',
    status: 'Active',
    last_login: '5 mins ago',
    raw_password: 'Admin@123',
    institution: 'Bixcel Technologies (bixceltech.com)',
  },
  {
    id: 1,
    name: 'Dr. Marcus Vance',
    username: 'm.vance',
    email: 'dean@bixcel.edu',
    emp_id: 'BX-FAC-014',
    role: 'Academic Dean',
    role_code: 'ROLE_DEAN',
    department: 'Computer Science',
    phone: '+1 (555) 234-8901',
    status: 'Active',
    last_login: '10 mins ago',
    raw_password: 'Dean@123',
    institution: 'Bixcel Technologies (bixceltech.com)',
  },
  {
    id: 3,
    name: 'Sophia Chen',
    username: 's.chen',
    email: 'faculty@bixcel.edu',
    emp_id: 'BX-TUT-089',
    role: 'Tutor / Faculty',
    role_code: 'ROLE_TUTOR',
    department: 'UI / UX Design',
    phone: '+1 (555) 345-6789',
    status: 'Active',
    last_login: '2 hours ago',
    raw_password: 'Faculty@123',
    institution: 'Bixcel Technologies (bixceltech.com)',
  },
  {
    id: 4,
    name: 'David Miller',
    username: 'd.miller',
    email: 'd.miller@bixceltech.com',
    emp_id: 'BX-TUT-092',
    role: 'Tutor / Faculty',
    role_code: 'ROLE_TUTOR',
    department: 'Cloud & DevOps',
    phone: '+1 (555) 456-7890',
    status: 'Active',
    last_login: 'Yesterday',
    raw_password: 'Admin@123',
    institution: 'Bixcel Technologies (bixceltech.com)',
  },
  {
    id: 5,
    name: 'Priya Sharma',
    username: 'p.sharma',
    email: 'p.sharma@bixceltech.com',
    emp_id: 'BX-OPS-031',
    role: 'Admission Officer',
    role_code: 'ROLE_ADMISSIONS',
    department: 'Student Affairs',
    phone: '+1 (555) 567-8901',
    status: 'Active',
    last_login: '3 hours ago',
    raw_password: 'Admin@123',
    institution: 'Bixcel Technologies (bixceltech.com)',
  },
  {
    id: 6,
    name: 'Michael Sterling',
    username: 'm.sterling',
    email: 'm.sterling@bixceltech.com',
    emp_id: 'BX-FIN-019',
    role: 'Accountant',
    role_code: 'ROLE_FINANCE',
    department: 'Bursar & Finance',
    phone: '+1 (555) 678-9012',
    status: 'Active',
    last_login: '1 day ago',
    raw_password: 'Admin@123',
    institution: 'Bixcel Technologies (bixceltech.com)',
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
  'Executive Office',
  'Academic Operations',
  'Computer Science',
  'UI / UX Design',
  'Cloud & DevOps',
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

  // Credentials Management Modal State
  const [selectedCredentialUser, setSelectedCredentialUser] = useState(null)
  const [credentialNewPass, setCredentialNewPass] = useState('')
  const [showPassInModal, setShowPassInModal] = useState(false)

  // Delete User Confirmation Modal State
  const [userToDelete, setUserToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form state for creating / editing user
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: 'Admin@123',
    emp_id: '',
    role: 'Admin',
    department: 'Academic Operations',
    phone: '',
    status: 'Active',
  })
  const [showFormPassword, setShowFormPassword] = useState(false)

  // Helper to generate secure password
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%'
    let pass = 'Bixcel@'
    for (let i = 0; i < 4; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData((prev) => ({ ...prev, password: pass }))
  }

  // Fetch users from CI4 API
  useEffect(() => {
    let isMounted = true
    const fetchUsers = async () => {
      try {
        const res = await apiService.getUsers()
        if (res && res.status === 'success' && res.data && isMounted) {
          // Merge API users with bixceltech demo users if not present
          const apiUsers = res.data
          const merged = [...apiUsers]
          DEFAULT_USERS.forEach((def) => {
            if (!merged.some((u) => u.email.toLowerCase() === def.email.toLowerCase())) {
              merged.push(def)
            }
          })
          setUsers(merged)
        }
      } catch (err) {
        console.warn('Using local fallback for Users:', err)
      }
    }
    fetchUsers()
    return () => { isMounted = false }
  }, [])

  // Open modal for Create
  const openCreateModal = () => {
    setEditingUser(null)
    const empId = `BX-ADM-0${users.length + 10}`
    setFormData({
      name: '',
      username: '',
      email: '',
      password: 'Admin@123',
      emp_id: empId,
      role: 'Admin',
      department: 'Academic Operations',
      phone: '+1 (555) 000-0000',
      status: 'Active',
    })
    setShowFormPassword(false)
    setShowModal(true)
  }

  // Open modal for Edit
  const openEditModal = (u) => {
    setEditingUser(u)
    setFormData({
      name: u.name,
      username: u.username || u.email.split('@')[0],
      email: u.email,
      password: u.raw_password || 'Admin@123',
      emp_id: u.emp_id,
      role: u.role,
      department: u.department,
      phone: u.phone || '',
      status: u.status,
    })
    setShowFormPassword(false)
    setShowModal(true)
  }

  // Save (Create or Update)
  const handleSave = async (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.email.trim()) return

    const roleCode =
      formData.role === 'Super Admin'
        ? 'ROLE_SUPER_ADMIN'
        : formData.role === 'Admin'
        ? 'ROLE_ADMIN'
        : formData.role === 'Academic Dean'
        ? 'ROLE_DEAN'
        : 'ROLE_TUTOR'

    const payload = {
      ...formData,
      role_code: roleCode,
      raw_password: formData.password,
    }

    if (editingUser) {
      // Update existing
      try {
        await apiService.updateUser(editingUser.id, payload)
      } catch (err) {
        console.warn('API update failed, updating locally:', err)
      }
      setUsers((prev) =>
        prev.map((item) => (item.id === editingUser.id ? { ...item, ...payload } : item))
      )
      setToast(`User "${formData.name}" credentials and details updated successfully!`)
    } else {
      // Create new user with credentials
      const newUser = {
        id: Date.now(),
        ...payload,
        last_login: 'Never',
      }
      try {
        const createdRes = await apiService.createUser(payload)
        if (createdRes && createdRes.data && createdRes.data.id) {
          newUser.id = createdRes.data.id
        }
      } catch (err) {
        console.warn('API create failed, saving locally:', err)
      }
      setUsers((prev) => [newUser, ...prev])
      setToast(`User "${formData.name}" created with login access (${formData.email})!`)
    }

    setShowModal(false)
    setTimeout(() => setToast(''), 3500)
  }

  // Open Delete Confirmation Modal
  const confirmDeleteUser = (user) => {
    setUserToDelete(user)
  }

  // Execute Deletion
  const handleExecuteDelete = async () => {
    if (!userToDelete) return
    setIsDeleting(true)
    const targetId = userToDelete.id
    const targetName = userToDelete.name

    try {
      await apiService.deleteUser(targetId)
    } catch (err) {
      console.warn('API delete failed, removing locally:', err)
    }

    setUsers((prev) => prev.filter((u) => u.id !== targetId))
    setIsDeleting(false)
    setUserToDelete(null)
    setToast(`User "${targetName}" was permanently deleted from the platform.`)
    setTimeout(() => setToast(''), 3500)
  }

  // Toggle user active status
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

  // Open Credentials modal
  const openCredentialsModal = (user) => {
    setSelectedCredentialUser(user)
    setCredentialNewPass(user.raw_password || 'Admin@123')
    setShowPassInModal(false)
  }

  // Save Updated Password in Credentials modal
  const handleSaveCredentialPass = async () => {
    if (!selectedCredentialUser || !credentialNewPass.trim()) return
    const userId = selectedCredentialUser.id

    try {
      await apiService.updateUser(userId, {
        password: credentialNewPass,
        raw_password: credentialNewPass,
      })
    } catch (err) {
      console.warn('Update password failed:', err)
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, raw_password: credentialNewPass } : u))
    )
    setToast(`Password updated for ${selectedCredentialUser.name} to: ${credentialNewPass}`)
    setSelectedCredentialUser(null)
    setTimeout(() => setToast(''), 3500)
  }

  // Copy credentials to clipboard
  const handleCopyCredentials = (user, pass) => {
    const text = `Bixcel Technologies Login Credentials\nPortal: https://adept-slategray-moose-59.hostingersite.com/\nUsername: ${user.username || user.email}\nEmail: ${user.email}\nPassword: ${pass}\nRole: ${user.role}`
    navigator.clipboard.writeText(text)
    setToast(`Credentials for "${user.name}" copied to clipboard!`)
    setTimeout(() => setToast(''), 3000)
  }

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase()
    const matchSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.emp_id && u.emp_id.toLowerCase().includes(q))
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

  // Role badge color helper
  const getRoleBadge = (role) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300 border-purple-300 dark:border-purple-800'
      case 'Admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-blue-300 dark:border-blue-800'
      case 'Academic Dean':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800'
      case 'Tutor / Faculty':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
      case 'Admission Officer':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-300 dark:border-amber-800'
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200'
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in duration-200">
      {/* Toast Notification */}
      {toast && (
        <div className="p-3 rounded-md bg-emerald-600 text-white font-label text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">verified</span>
            <span>{toast}</span>
          </div>
          <button type="button" onClick={() => setToast('')} className="opacity-80 hover:opacity-100">
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Screen Header */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h1 className="font-title text-base sm:text-lg font-bold text-light-on-surface dark:text-dark-on-surface">
                User Master &amp; Credentials Management
              </h1>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300">
                bixceltech.com
              </span>
            </div>
            <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Manage Admin, Super Admin, and Faculty accounts, generate login credentials, and delete users from the platform.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-light-primary hover:bg-light-primary-container text-light-on-primary font-label text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">person_add</span>
          <span>Add Admin / User</span>
        </button>
      </section>

      {/* 4 Stat Cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-label text-light-on-surface-variant uppercase font-semibold">Total Accounts</span>
            <div className="text-xl font-bold tabular-nums text-light-on-surface dark:text-dark-on-surface mt-0.5">
              {users.length}
            </div>
          </div>
          <span className="w-8 h-8 rounded-lg bg-light-primary-tint text-light-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">group</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-label text-light-on-surface-variant uppercase font-semibold">Admin &amp; Super Admin</span>
            <div className="text-xl font-bold tabular-nums text-purple-600 dark:text-purple-400 mt-0.5">
              {users.filter((u) => u.role === 'Super Admin' || u.role === 'Admin').length}
            </div>
          </div>
          <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">shield_person</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-label text-light-on-surface-variant uppercase font-semibold">Active Status</span>
            <div className="text-xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
              {users.filter((u) => u.status === 'Active').length}
            </div>
          </div>
          <span className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[11px] font-label text-light-on-surface-variant uppercase font-semibold">bixceltech.com Domain</span>
            <div className="text-xl font-bold tabular-nums text-blue-600 dark:text-blue-400 mt-0.5">
              {users.filter((u) => u.email.toLowerCase().includes('bixceltech.com')).length}
            </div>
          </div>
          <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">domain</span>
          </span>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-light-outline">
            search
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email (e.g. bixceltech.com), username, ID..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
          />
        </div>

        {/* Role & Status Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Admin">Admin</option>
            <option value="Academic Dean">Academic Dean</option>
            <option value="Tutor / Faculty">Tutor / Faculty</option>
            <option value="Admission Officer">Admission Officer</option>
            <option value="Accountant">Accountant</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none"
          >
            <option value="ALL">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </section>

      {/* Users Table */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-light-surface-container-low dark:bg-dark-surface-container border-b border-light-outline-variant dark:border-dark-outline-variant text-[11px] font-bold text-light-on-surface-variant uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">User &amp; Identifiers</th>
                <th className="px-4 py-3">Login Username / Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Credentials &amp; Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-outline-variant/60 dark:divide-dark-outline-variant/60">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-xs text-light-on-surface-variant">
                    No users found matching &quot;{search}&quot;.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-light-surface-container-low/40 transition-colors">
                    {/* User & Identifiers */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-light-primary-tint text-light-primary flex items-center justify-center font-bold text-xs uppercase shrink-0">
                          {u.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-light-on-surface dark:text-dark-on-surface">
                            {u.name}
                          </span>
                          <span className="font-mono text-[10px] text-light-on-surface-variant">
                            {u.emp_id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Login Username & Email */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-light-primary dark:text-dark-primary font-bold">
                          {u.email}
                        </span>
                        <span className="font-mono text-[10px] text-light-on-surface-variant">
                          Username: {u.username || u.email.split('@')[0]}
                        </span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    </td>

                    {/* Department */}
                    <td className="px-4 py-3 whitespace-nowrap text-light-on-surface-variant">
                      {u.department}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => toggleStatus(u)}
                        title="Click to toggle status"
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                          u.status === 'Active'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        <span>{u.status}</span>
                      </button>
                    </td>

                    {/* Actions: View Credentials, Edit, Delete */}
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1. View / Manage Credentials */}
                        <button
                          type="button"
                          onClick={() => openCredentialsModal(u)}
                          title="View / Manage Login Credentials"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-bold hover:bg-purple-100 transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">key</span>
                          <span>Credentials</span>
                        </button>

                        {/* 2. Edit User */}
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          title="Edit User Details"
                          className="p-1 rounded text-light-on-surface-variant hover:text-light-primary hover:bg-light-surface-container-low transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[17px]">edit</span>
                        </button>

                        {/* 3. Delete User */}
                        <button
                          type="button"
                          onClick={() => confirmDeleteUser(u)}
                          title="Delete User Permanently"
                          className="p-1 rounded text-light-on-surface-variant hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
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

      {/* MODAL 1: ADD / EDIT USER & CREDENTIALS */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-2xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-light-outline-variant/70">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-[20px]">
                  {editingUser ? 'manage_accounts' : 'person_add'}
                </span>
                <h3 className="font-title text-base font-bold text-light-on-surface dark:text-dark-on-surface">
                  {editingUser ? 'Edit User Credentials & Profile' : 'Add New User with Credentials'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-light-on-surface-variant hover:text-light-on-surface p-1 rounded-full"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              {/* Full Name & Username */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Alexander Hayes"
                    className="w-full px-3 py-2 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Username (Login ID)
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="e.g. alexander.admin"
                    className="w-full px-3 py-2 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary font-mono"
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Official Email * (bixceltech.com)
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@bixceltech.com"
                    className="w-full px-3 py-2 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-light-on-surface dark:text-dark-on-surface">
                      Password *
                    </label>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="text-[10px] text-light-primary font-bold hover:underline"
                    >
                      Generate Secure
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showFormPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="e.g. Admin@123"
                      className="w-full pl-3 pr-8 py-2 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword(!showFormPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-light-on-surface-variant hover:text-light-on-surface"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {showFormPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    System Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary font-semibold"
                  >
                    {ROLES_LIST.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Department
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Employee ID & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Employee / Staff ID
                  </label>
                  <input
                    type="text"
                    value={formData.emp_id}
                    onChange={(e) => setFormData({ ...formData, emp_id: e.target.value })}
                    placeholder="BX-ADM-001"
                    className="w-full px-3 py-2 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface"
                  />
                </div>
              </div>

              {/* Status Radio */}
              <div>
                <label className="block font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Account Status
                </label>
                <div className="flex items-center gap-4 pt-0.5">
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={formData.status === 'Active'}
                      onChange={() => setFormData({ ...formData, status: 'Active' })}
                      className="accent-light-primary"
                    />
                    <span>Active (Permit Login)</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Inactive"
                      checked={formData.status === 'Inactive'}
                      onChange={() => setFormData({ ...formData, status: 'Inactive' })}
                      className="accent-light-primary"
                    />
                    <span>Inactive (Suspended)</span>
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-light-outline-variant/70 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-light-outline-variant text-xs font-semibold hover:bg-light-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-light-primary hover:bg-light-primary-container text-light-on-primary font-bold text-xs shadow-xs transition-colors"
                >
                  {editingUser ? 'Save User Changes' : 'Create & Issue Credentials'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW & MANAGE CREDENTIALS */}
      {selectedCredentialUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4 relative">
            <button
              type="button"
              onClick={() => setSelectedCredentialUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-light-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                <span className="material-symbols-outlined text-[20px]">key</span>
              </div>
              <div>
                <h3 className="font-title text-base font-bold text-light-on-surface dark:text-dark-on-surface">
                  Login Credentials Card
                </h3>
                <span className="text-xs text-light-on-surface-variant">
                  {selectedCredentialUser.name} • {selectedCredentialUser.role}
                </span>
              </div>
            </div>

            {/* Credentials Card Box */}
            <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/50 dark:bg-purple-950/20 flex flex-col gap-3 text-xs">
              <div className="flex justify-between border-b border-purple-200/60 pb-2">
                <span className="text-light-on-surface-variant">Portal URL:</span>
                <span className="font-mono font-bold text-purple-700 dark:text-purple-300">
                  bixceltech.com / Institutional Portal
                </span>
              </div>

              <div className="flex justify-between border-b border-purple-200/60 pb-2">
                <span className="text-light-on-surface-variant">Official Email:</span>
                <span className="font-mono font-bold text-light-on-surface dark:text-dark-on-surface">
                  {selectedCredentialUser.email}
                </span>
              </div>

              <div className="flex justify-between border-b border-purple-200/60 pb-2">
                <span className="text-light-on-surface-variant">Username (ID):</span>
                <span className="font-mono font-bold text-light-on-surface dark:text-dark-on-surface">
                  {selectedCredentialUser.username || selectedCredentialUser.email.split('@')[0]}
                </span>
              </div>

              <div className="flex justify-between border-b border-purple-200/60 pb-2">
                <span className="text-light-on-surface-variant">System Role:</span>
                <span className="font-bold text-purple-700 dark:text-purple-400">
                  {selectedCredentialUser.role}
                </span>
              </div>

              {/* Password & Update */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-light-on-surface-variant">Account Password:</span>
                  <button
                    type="button"
                    onClick={() => setShowPassInModal(!showPassInModal)}
                    className="text-[10px] text-light-primary font-bold hover:underline"
                  >
                    {showPassInModal ? 'Hide Password' : 'Show Password'}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type={showPassInModal ? 'text' : 'password'}
                    value={credentialNewPass}
                    onChange={(e) => setCredentialNewPass(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-purple-300 dark:border-purple-800 bg-white dark:bg-dark-surface-bright font-mono font-bold text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleSaveCredentialPass}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors shrink-0 cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-light-outline-variant/60">
              <button
                type="button"
                onClick={() => handleCopyCredentials(selectedCredentialUser, credentialNewPass)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-light-primary text-light-on-primary font-bold text-xs hover:bg-light-primary-container shadow-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">content_copy</span>
                <span>Copy Credentials</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE USER CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-red-300 dark:border-red-900 rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-4 relative">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-xl shadow-inner shrink-0">
                <span className="material-symbols-outlined text-[24px]">person_remove</span>
              </div>
              <div>
                <h3 className="font-title text-base font-bold text-red-700 dark:text-red-400">
                  Confirm User Deletion
                </h3>
                <span className="text-xs text-light-on-surface-variant">
                  Permanent removal from Bixcel LMS database
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 text-xs text-red-900 dark:text-red-200 leading-relaxed">
              Are you sure you want to delete user <strong>{userToDelete.name}</strong> (<code>{userToDelete.email}</code> • Role: <strong>{userToDelete.role}</strong>)?
              <p className="mt-1.5 font-semibold text-red-700 dark:text-red-400">
                ⚠️ This will permanently remove their user record and revoke all portal login permissions immediately.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-light-outline-variant/60">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-lg border border-light-outline-variant text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">delete_forever</span>
                <span>{isDeleting ? 'Deleting User...' : 'Permanently Delete User'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMaster
