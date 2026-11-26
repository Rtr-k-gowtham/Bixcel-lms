import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

const DEFAULT_LOGS = [
  {
    id: 'AUD-8921',
    timestamp: '2026-11-26 12:28:45',
    relative: '4 mins ago',
    actor_name: 'Elena Rostova',
    actor_email: 'e.rostova@bixcel.edu',
    actor_role: 'Super Admin',
    action: 'PERMISSION_MATRIX_UPDATE',
    action_type: 'UPDATE',
    module: 'Access Control',
    ip_address: '192.168.1.102',
    user_agent: 'Chrome 128 (Windows 11 x64)',
    severity: 'WARNING',
    status: 'Success',
    summary: 'Modified granular action permissions for role "Admin" across Academic Business Modules',
    details: {
      role: 'Admin',
      modified_modules: ['courses', 'exams', 'attendance'],
      granted_actions: ['approve', 'reject'],
      revoked_actions: ['delete'],
    },
  },
  {
    id: 'AUD-8920',
    timestamp: '2026-11-26 12:15:10',
    relative: '18 mins ago',
    actor_name: 'Dr. Marcus Vance',
    actor_email: 'm.vance@bixcel.edu',
    actor_role: 'Academic Dean',
    action: 'COURSE_STATUS_PUBLISHED',
    action_type: 'CREATE',
    module: 'Courses & Syllabus',
    ip_address: '192.168.1.114',
    user_agent: 'Firefox 130 (macOS Sonoma)',
    severity: 'INFO',
    status: 'Success',
    summary: 'Published curriculum for "Cloud DevOps & Kubernetes Orchestration" (CRS-104)',
    details: {
      course_id: 'CRS-104',
      title: 'Cloud DevOps & Kubernetes Orchestration',
      credits: 4,
      target_cohort: 'Fall 2026',
    },
  },
  {
    id: 'AUD-8919',
    timestamp: '2026-11-26 11:42:30',
    relative: '50 mins ago',
    actor_name: 'Michael Sterling',
    actor_email: 'm.sterling@bixcel.edu',
    actor_role: 'Accountant',
    action: 'FEE_INSTALLMENT_RECONCILED',
    action_type: 'UPDATE',
    module: 'Finance & Ledgers',
    ip_address: '192.168.1.120',
    user_agent: 'Chrome 128 (Windows 11)',
    severity: 'INFO',
    status: 'Success',
    summary: 'Reconciled Term 1 batch tuition ledger totaling $42,500 across 28 student records',
    details: {
      batch_id: 'B26-FS-A',
      amount: '$42,500',
      records: 28,
      receipt_mode: 'ACH Wire Transfer',
    },
  },
  {
    id: 'AUD-8918',
    timestamp: '2026-11-26 10:14:02',
    relative: '2 hours ago',
    actor_name: 'System Security Guard',
    actor_email: 'security-daemon@bixcel.edu',
    actor_role: 'Automated System',
    action: 'AUTH_FAILED_LOCKOUT',
    action_type: 'SECURITY',
    module: 'Authentication',
    ip_address: '45.33.32.156',
    user_agent: 'Python-Requests/2.31',
    severity: 'CRITICAL',
    status: 'Blocked',
    summary: 'Temporarily blacklisted IP 45.33.32.156 after 5 consecutive failed login attempts on endpoint /api/auth',
    details: {
      ip: '45.33.32.156',
      attempts: 5,
      threat_level: 'High',
      lockout_duration: '30 Minutes',
    },
  },
  {
    id: 'AUD-8917',
    timestamp: '2026-11-26 09:30:18',
    relative: '3 hours ago',
    actor_name: 'Sophia Chen',
    actor_email: 's.chen@bixcel.edu',
    actor_role: 'Tutor / Faculty',
    action: 'ATTENDANCE_REGISTER_SUBMITTED',
    action_type: 'CREATE',
    module: 'Attendance & Timetable',
    ip_address: '192.168.1.109',
    user_agent: 'Chrome 128 (Windows 11)',
    severity: 'INFO',
    status: 'Success',
    summary: 'Submitted lecture attendance register for CS-401 (34 Present, 2 Absent)',
    details: {
      cohort: 'CS-401',
      session: '09:00 AM - 11:30 AM',
      present: 34,
      absent: 2,
    },
  },
  {
    id: 'AUD-8916',
    timestamp: '2026-11-25 18:05:44',
    relative: 'Yesterday',
    actor_name: 'Priya Sharma',
    actor_email: 'p.sharma@bixcel.edu',
    actor_role: 'Admission Officer',
    action: 'STUDENT_APPLICATION_APPROVED',
    action_type: 'UPDATE',
    module: 'Student Admissions',
    ip_address: '192.168.1.111',
    user_agent: 'Edge 128 (Windows 11)',
    severity: 'INFO',
    status: 'Success',
    summary: 'Verified credentials and approved admission for applicant Kevin Hart (BX-STU-1088)',
    details: {
      applicant_id: 'BX-STU-1088',
      program: 'UI / UX Design Masterclass',
      scholarship: '15% Academic Merit',
    },
  },
]

export function AuditLogs() {
  const [logs, setLogs] = useState(DEFAULT_LOGS)
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('ALL')
  const [severityFilter, setSeverityFilter] = useState('ALL')
  const [selectedLog, setSelectedLog] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    let isMounted = true
    const fetchLogs = async () => {
      try {
        const res = await apiService.getAuditLogs()
        if (res && res.status === 'success' && res.data && isMounted) {
          setLogs(res.data)
        }
      } catch (err) {
        console.warn('Using local fallback for Audit Logs:', err)
      }
    }
    fetchLogs()
    return () => { isMounted = false }
  }, [])

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `bixcel_audit_trail_${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    setToast('Audit trail exported successfully as JSON')
    setTimeout(() => setToast(''), 3500)
  }

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 border-red-200'
      case 'WARNING':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200'
    }
  }

  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      log.actor_name.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.summary.toLowerCase().includes(search.toLowerCase()) ||
      log.ip_address.includes(search)
    const matchModule = moduleFilter === 'ALL' || log.module === moduleFilter
    const matchSeverity = severityFilter === 'ALL' || log.severity === severityFilter
    return matchSearch && matchModule && matchSeverity
  })

  const modulesList = Array.from(new Set(logs.map((l) => l.module)))

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

      {/* Header Banner */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="w-9 h-9 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary flex items-center justify-center shrink-0 mt-0.5">
            <span className="material-symbols-outlined text-[20px]">history</span>
          </span>
          <div className="flex flex-col gap-0.5">
            <h1 className="font-title text-title-lg font-bold text-light-on-surface dark:text-dark-on-surface">
              Audit Logs &amp; Operational Telemetry
            </h1>
            <p className="font-body text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Immutable activity ledger tracking administrative actions, authentication events, and data mutations
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright hover:bg-light-surface-container-low text-light-on-surface dark:text-dark-on-surface font-label text-label-md font-semibold shadow-sm transition-colors duration-state-change shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Export Audit Trail</span>
        </button>
      </section>

      {/* 4 Stat Metric Tiles */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between">
          <div>
            <span className="text-[11px] font-label text-light-on-surface-variant uppercase">Total Audit Events</span>
            <div className="text-title-lg font-bold tabular-nums text-light-on-surface dark:text-dark-on-surface mt-0.5">
              1,420
            </div>
          </div>
          <span className="w-8 h-8 rounded bg-light-primary-tint text-light-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          </span>
        </div>

        <div className="p-3.5 rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between">
          <div>
            <span className="text-[11px] font-label text-light-on-surface-variant uppercase">Auth &amp; Access</span>
            <div className="text-title-lg font-bold tabular-nums text-on-success-container mt-0.5">
              38 Today
            </div>
          </div>
          <span className="w-8 h-8 rounded bg-success-container text-on-success-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">verified_user</span>
          </span>
        </div>

        <div className="p-3.5 rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between">
          <div>
            <span className="text-[11px] font-label text-light-on-surface-variant uppercase">Data Mutations</span>
            <div className="text-title-lg font-bold tabular-nums text-light-primary mt-0.5">
              14 Logged
            </div>
          </div>
          <span className="w-8 h-8 rounded bg-light-secondary-container text-light-on-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">edit_note</span>
          </span>
        </div>

        <div className="p-3.5 rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between">
          <div>
            <span className="text-[11px] font-label text-light-on-surface-variant uppercase">Security Alerts</span>
            <div className="text-title-lg font-bold tabular-nums text-on-overdue-container mt-0.5">
              1 Blocked
            </div>
          </div>
          <span className="w-8 h-8 rounded bg-overdue-container text-on-overdue-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">gpp_bad</span>
          </span>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <span className="material-symbols-outlined text-light-outline text-[18px] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search audit trail by actor, IP address, action code, or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
          />
        </div>

        {/* Module Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-label-sm font-medium text-light-on-surface-variant whitespace-nowrap">
            Module:
          </label>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
          >
            <option value="ALL">All Modules</option>
            {modulesList.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-label-sm font-medium text-light-on-surface-variant whitespace-nowrap">
            Severity:
          </label>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
          >
            <option value="ALL">All Severities</option>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </section>

      {/* Audit Trail Table */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-light-surface-container-low dark:bg-dark-surface-container border-b border-light-outline-variant dark:border-dark-outline-variant text-[11px] font-label font-bold text-light-on-surface-variant dark:text-dark-on-surface-variant uppercase tracking-wider">
                <th scope="col" className="px-5 py-3">
                  Timestamp / ID
                </th>
                <th scope="col" className="px-4 py-3">
                  Actor &amp; Role
                </th>
                <th scope="col" className="px-4 py-3">
                  Action Event
                </th>
                <th scope="col" className="px-4 py-3">
                  Module
                </th>
                <th scope="col" className="px-4 py-3">
                  IP &amp; Client
                </th>
                <th scope="col" className="px-4 py-3">
                  Severity
                </th>
                <th scope="col" className="px-5 py-3 text-right">
                  Payload
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-light-on-surface-variant">
                    No audit records matching query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-light-surface-container-low/50 dark:hover:bg-dark-surface-container transition-colors"
                  >
                    {/* Timestamp */}
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-mono-sm font-semibold tabular-nums text-light-on-surface dark:text-dark-on-surface">
                          {log.timestamp}
                        </span>
                        <span className="font-body text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant">
                          {log.relative} • {log.id}
                        </span>
                      </div>
                    </td>

                    {/* Actor */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-label text-label-md font-semibold text-light-on-surface dark:text-dark-on-surface">
                          {log.actor_name}
                        </span>
                        <span className="font-body text-[11px] text-light-on-surface-variant">
                          {log.actor_role}
                        </span>
                      </div>
                    </td>

                    {/* Action Code */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-mono text-[11px] font-bold text-light-primary dark:text-dark-primary">
                          {log.action}
                        </span>
                        <span className="font-body text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant max-w-xs truncate">
                          {log.summary}
                        </span>
                      </div>
                    </td>

                    {/* Module */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-light-surface-container dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface">
                        {log.module}
                      </span>
                    </td>

                    {/* IP & Client */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-mono-xs text-light-on-surface dark:text-dark-on-surface">
                          {log.ip_address}
                        </span>
                        <span className="font-body text-[10px] text-light-on-surface-variant max-w-[140px] truncate">
                          {log.user_agent}
                        </span>
                      </div>
                    </td>

                    {/* Severity */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadge(
                          log.severity
                        )}`}
                      >
                        {log.severity}
                      </span>
                    </td>

                    {/* Inspect Button */}
                    <td className="px-5 py-3 whitespace-nowrap text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold text-light-primary hover:bg-light-primary-tint dark:hover:bg-dark-primary-tint transition-colors"
                      >
                        <span className="material-symbols-outlined text-[15px]">data_object</span>
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Inspect Log Details Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-sidebar/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-modal w-full max-w-xl p-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-light-outline-variant dark:border-dark-outline-variant mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-light-primary">receipt_long</span>
                <h3 className="font-title text-[16px] font-bold text-light-on-surface dark:text-dark-on-surface">
                  Audit Telemetry Event ({selectedLog.id})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-light-on-surface-variant hover:text-light-on-surface p-1 rounded"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-3 font-body text-body-sm">
              <div className="grid grid-cols-2 gap-2 p-3 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-[12px]">
                <div>
                  <span className="text-light-on-surface-variant block">Actor:</span>
                  <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedLog.actor_name} ({selectedLog.actor_role})</strong>
                </div>
                <div>
                  <span className="text-light-on-surface-variant block">IP &amp; Timestamp:</span>
                  <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedLog.ip_address} @ {selectedLog.timestamp}</strong>
                </div>
                <div className="col-span-2 pt-1 border-t border-light-outline-variant dark:border-dark-outline-variant mt-1">
                  <span className="text-light-on-surface-variant block">Action Summary:</span>
                  <span className="text-light-on-surface dark:text-dark-on-surface font-medium">{selectedLog.summary}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-label font-bold text-light-on-surface-variant uppercase tracking-wider mb-1.5">
                  Structured Payload Data (JSON)
                </label>
                <pre className="p-3 rounded bg-sidebar text-on-sidebar text-[11px] font-mono overflow-x-auto max-h-56 leading-relaxed">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>

              <div>
                <label className="block text-[11px] font-label text-light-on-surface-variant uppercase tracking-wider mb-0.5">
                  Client User-Agent
                </label>
                <span className="font-mono text-mono-xs text-light-on-surface-variant block break-all">
                  {selectedLog.user_agent}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-light-outline-variant dark:border-dark-outline-variant mt-4">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-body-sm font-semibold hover:bg-light-surface-container transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AuditLogs
