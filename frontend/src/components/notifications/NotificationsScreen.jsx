import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'NOTIF-101',
    type: 'finance',
    priority: 'critical',
    title: '14 Fee Installments Overdue in Batch B26-FS-A',
    message: 'Tuition installment deadline expired 48 hours ago for 14 enrolled learners. Automated collection notices queued for dispatch.',
    category: 'Finance & Payments',
    timestamp: '18 mins ago',
    is_read: false,
    action_label: 'Review Fee Ledger',
    action_tab: 'fees',
    icon: 'payments',
  },
  {
    id: 'NOTIF-102',
    type: 'timetable',
    priority: 'warning',
    title: 'Room 204 Scheduling Conflict Detected for Nov 28',
    message: 'Simultaneous booking requested for Lab 204 by CS-401 (Dr. Vance) and UX-110 (Sophia Chen) at 02:00 PM.',
    category: 'Timetable & Rooms',
    timestamp: '1 hour ago',
    is_read: false,
    action_label: 'Resolve Room Conflict',
    action_tab: 'timetable',
    icon: 'meeting_room',
  },
  {
    id: 'NOTIF-103',
    type: 'security',
    priority: 'critical',
    title: 'IP Blacklist Action Triggered: 45.33.32.156',
    message: 'Automated rate-limiter blocked repeated brute-force authentication attempts targeting administrator portal.',
    category: 'Security & Audit',
    timestamp: '2 hours ago',
    is_read: false,
    action_label: 'Inspect Security Logs',
    action_tab: 'audit',
    icon: 'gpp_bad',
  },
  {
    id: 'NOTIF-104',
    type: 'academic',
    priority: 'info',
    title: 'Final Midterm Grades Submitted for DS-204',
    message: 'Dr. Marcus Vance published verified assessment evaluation for 32 students in Data Engineering cohort with 94% pass rate.',
    category: 'Academic & Exams',
    timestamp: '3 hours ago',
    is_read: false,
    action_label: 'View Grade Spread',
    action_tab: 'exams',
    icon: 'quiz',
  },
  {
    id: 'NOTIF-105',
    type: 'system',
    priority: 'info',
    title: 'CodeIgniter 4 REST API Auto-Backup Finished',
    message: 'Nightly snapshot of course catalog, permission matrices, and user registry completed without discrepancies.',
    category: 'System & Maintenance',
    timestamp: 'Yesterday at 03:00 AM',
    is_read: true,
    action_label: 'View System Diagnostics',
    action_tab: 'settings',
    icon: 'cloud_done',
  },
  {
    id: 'NOTIF-106',
    type: 'admissions',
    priority: 'info',
    title: '6 New Student Applications Pending Dean Review',
    message: 'Undergraduate admission candidates submitted credential portfolios for Spring 2027 intake cohort.',
    category: 'Student Admissions',
    timestamp: 'Yesterday',
    is_read: true,
    action_label: 'Review Applications',
    action_tab: 'students',
    icon: 'how_to_reg',
  },
]

export function NotificationsScreen({ onNavigate }) {
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS)
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [toast, setToast] = useState('')

  useEffect(() => {
    let isMounted = true
    const fetchNotifs = async () => {
      try {
        const res = await apiService.getNotifications()
        if (res && res.status === 'success' && res.data && isMounted) {
          setNotifications(res.data)
        }
      } catch (err) {
        console.warn('Using local fallback for notifications:', err)
      }
    }
    fetchNotifs()
    return () => { isMounted = false }
  }, [])

  const markAllRead = async () => {
    try {
      await apiService.markAllNotificationsRead()
    } catch (err) {
      console.warn('API mark all read fallback:', err)
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setToast('All notifications marked as read')
    setTimeout(() => setToast(''), 3000)
  }

  const toggleRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: !n.is_read } : n))
    )
    try {
      await apiService.markNotificationRead(id)
    } catch (err) {
      console.warn(err)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await apiService.deleteNotification(id)
    } catch (err) {
      console.warn(err)
    }
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    setToast('Notification dismissed')
    setTimeout(() => setToast(''), 3000)
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const filteredNotifs = notifications.filter((n) => {
    if (activeFilter === 'UNREAD') return !n.is_read
    if (activeFilter === 'FINANCE') return n.type === 'finance'
    if (activeFilter === 'TIMETABLE') return n.type === 'timetable'
    if (activeFilter === 'SECURITY') return n.type === 'security'
    if (activeFilter === 'ACADEMIC') return n.type === 'academic' || n.type === 'admissions'
    return true
  })

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'critical':
        return {
          dot: 'bg-overdue',
          border: 'border-l-4 border-l-overdue',
          pill: 'bg-overdue-container text-on-overdue-container',
        }
      case 'warning':
        return {
          dot: 'bg-pending',
          border: 'border-l-4 border-l-pending',
          pill: 'bg-pending-container text-on-pending-container',
        }
      default:
        return {
          dot: 'bg-light-primary',
          border: 'border-l-4 border-l-light-primary',
          pill: 'bg-light-primary-tint text-light-primary',
        }
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

      {/* Header Card */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[17px]">notifications_active</span>
          </span>
          <div className="flex flex-col gap-0.5">
            <h1 className="font-title text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface flex items-center gap-2">
              <span>Notifications &amp; System Alerts</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-overdue text-white tabular-nums">
                  {unreadCount} Unread
                </span>
              )}
            </h1>
            <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Real-time operational alerts, academic timetable conflicts, fee installments, and security notices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright hover:bg-light-surface-container-low text-light-on-surface dark:text-dark-on-surface font-label text-xs font-semibold shadow-xs transition-colors duration-state-change disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[15px]">done_all</span>
            <span>Mark All Read</span>
          </button>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="flex flex-wrap items-center gap-1.5">
        {[
          { id: 'ALL', label: `All Alerts (${notifications.length})` },
          { id: 'UNREAD', label: `Unread (${unreadCount})` },
          { id: 'FINANCE', label: 'Finance' },
          { id: 'TIMETABLE', label: 'Timetable' },
          { id: 'SECURITY', label: 'Security' },
          { id: 'ACADEMIC', label: 'Academic & Admissions' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id)}
            className={`px-2.5 py-1 rounded font-label text-xs font-semibold transition-all ${
              activeFilter === tab.id
                ? 'bg-light-primary text-light-on-primary shadow-xs'
                : 'bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface-variant hover:text-light-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {/* Notifications List */}
      <section className="flex flex-col gap-3">
        {filteredNotifs.length === 0 ? (
          <div className="p-8 text-center bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md text-light-on-surface-variant font-body text-body-sm">
            No notifications in this category.
          </div>
        ) : (
          filteredNotifs.map((n) => {
            const style = getPriorityStyle(n.priority)
            return (
              <article
                key={n.id}
                className={`bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-4 shadow-sm flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all ${
                  style.border
                } ${!n.is_read ? 'bg-light-primary-tint/20 dark:bg-dark-primary-tint/10' : ''}`}
              >
                <div className="flex items-start gap-3.5 flex-1">
                  <div className="w-8 h-8 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex items-center justify-center shrink-0 mt-0.5 text-light-on-surface">
                    <span className="material-symbols-outlined text-[18px]">{n.icon}</span>
                  </div>

                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                      <span className="font-label text-label-md font-bold text-light-on-surface dark:text-dark-on-surface">
                        {n.title}
                      </span>
                      <span className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider ${style.pill}`}>
                        {n.category}
                      </span>
                      <span className="text-[11px] text-light-on-surface-variant font-medium ml-auto sm:ml-0">
                        {n.timestamp}
                      </span>
                    </div>

                    <p className="font-body text-body-xs text-light-on-surface-variant dark:text-dark-on-surface-variant leading-relaxed">
                      {n.message}
                    </p>

                    {/* Action buttons inside notification */}
                    <div className="flex flex-wrap items-center gap-2 pt-2">
                      {n.action_label && (
                        <button
                          type="button"
                          onClick={() => onNavigate && onNavigate(n.action_tab || 'dashboard')}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-light-primary dark:text-dark-primary hover:bg-light-primary hover:text-white font-label text-label-sm font-semibold transition-colors"
                        >
                          <span>{n.action_label}</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleRead(n.id)}
                        className="px-2.5 py-1 text-label-xs font-medium text-light-on-surface-variant hover:text-light-on-surface transition-colors"
                      >
                        {n.is_read ? 'Mark unread' : 'Mark as read'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 self-end sm:self-start">
                  <button
                    type="button"
                    onClick={() => deleteNotification(n.id)}
                    title="Dismiss Notification"
                    className="p-1 rounded text-light-on-surface-variant hover:text-overdue hover:bg-light-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </article>
            )
          })
        )}
      </section>
    </div>
  )
}

export default NotificationsScreen
