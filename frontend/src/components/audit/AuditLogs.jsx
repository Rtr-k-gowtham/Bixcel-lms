import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

const DEFAULT_LOGS = []

export function AuditLogs() {
  const [logs, setLogs] = useState([])
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
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[17px]">history</span>
          </span>
          <div className="flex flex-col gap-0.5">
            <h1 className="font-title text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface">
              Audit Logs &amp; Operational Telemetry
            </h1>
            <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Immutable activity ledger tracking administrative actions, authentication events, and data mutations
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright hover:bg-light-surface-container-low text-light-on-surface dark:text-dark-on-surface font-label text-xs font-semibold shadow-xs transition-colors duration-state-change shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">download</span>
          <span>Export Audit Trail</span>
        </button>
      </section>

      {/* 4 Stat Metric Tiles */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="p-2.5 rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between">
          <div>
            <span className="text-[10px] font-label text-light-on-surface-variant uppercase font-medium">Total Audit Events</span>
            <div className="text-[17px] font-bold tabular-nums text-light-on-surface dark:text-dark-on-surface mt-0.5">
              1,420
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-light-primary-tint text-light-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">receipt_long</span>
          </span>
        </div>

        <div className="p-2.5 rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between">
          <div>
            <span className="text-[10px] font-label text-light-on-surface-variant uppercase font-medium">Auth &amp; Access</span>
            <div className="text-[17px] font-bold tabular-nums text-on-success-container mt-0.5">
              38 Today
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-success-container text-on-success-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
          </span>
        </div>

        <div className="p-2.5 rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between">
          <div>
            <span className="text-[10px] font-label text-light-on-surface-variant uppercase font-medium">Data Mutations</span>
            <div className="text-[17px] font-bold tabular-nums text-light-primary mt-0.5">
              14 Logged
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-light-secondary-container text-light-on-secondary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">edit_note</span>
          </span>
        </div>

        <div className="p-2.5 rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant flex items-center justify-between">
          <div>
            <span className="text-[10px] font-label text-light-on-surface-variant uppercase font-medium">Security Alerts</span>
            <div className="text-[17px] font-bold tabular-nums text-on-overdue-container mt-0.5">
              1 Blocked
            </div>
          </div>
          <span className="w-7 h-7 rounded bg-overdue-container text-on-overdue-container flex items-center justify-center">
            <span className="material-symbols-outlined text-[16px]">gpp_bad</span>
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
