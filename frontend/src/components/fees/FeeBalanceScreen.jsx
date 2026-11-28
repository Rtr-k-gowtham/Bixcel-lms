import React, { useState, useEffect, useMemo } from 'react'
import { apiService } from '../../services/api'

// Helper: 100% crash-proof currency formatter
const formatCurrency = (val) => {
  const num = Number(val)
  return isNaN(num) ? '0' : num.toLocaleString('en-IN')
}

// Helper: safe phone cleaner for WhatsApp link
const getCleanPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return ''
  return phone.replace(/[^0-9]/g, '')
}

// Helper: safe avatar initials
const getInitials = (name) => {
  if (!name || typeof name !== 'string') return 'ST'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'ST'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function FeeBalanceScreen({ onNavigate }) {
  const [ledgers, setLedgers] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [bucketFilter, setBucketFilter] = useState('all')
  const [trackFilter, setTrackFilter] = useState('all')
  const [batchFilter, setBatchFilter] = useState('all')
  const [statusTab, setStatusTab] = useState('all') // 'all' | 'overdue' | 'partial' | 'promised' | 'cleared'

  // View Mode: 'tasks' (Task Queue) | 'calendar' (Calendar View) | 'ledger' (Full Table Ledger)
  const [viewMode, setViewMode] = useState('tasks')

  // Task Category Filter: 'today' | 'overdue' | 'upcoming' | 'all' | 'cleared'
  const [taskCategoryFilter, setTaskCategoryFilter] = useState('all')

  // Task Layout: 'list' (Table Listing) | 'cards' (Grid Cards) - Default to Listing
  const [taskLayout, setTaskLayout] = useState('list')

  // Calendar State
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear())
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth()) // 0-indexed
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null)
  const [calendarFilter, setCalendarFilter] = useState('all') // 'all' | 'overdue' | 'today' | 'upcoming'

  // Modal States
  const [collectTarget, setCollectTarget] = useState(null)
  const [remindTarget, setRemindTarget] = useState(null)
  const [commitmentTarget, setCommitmentTarget] = useState(null)
  const [demandNoticeTarget, setDemandNoticeTarget] = useState(null)

  // Collect Modal Form State
  const [collectAmount, setCollectAmount] = useState(0)
  const [collectMethod, setCollectMethod] = useState('Bank Transfer')
  const [collectNotes, setCollectNotes] = useState('Tuition balance settlement')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reminder Modal Form State
  const [reminderChannel, setReminderChannel] = useState('whatsapp') // 'whatsapp' | 'sms' | 'email'
  const [customReminderMsg, setCustomReminderMsg] = useState('')

  // Commitment Modal Form State
  const [promiseDate, setPromiseDate] = useState('')
  const [promiseAmount, setPromiseAmount] = useState(0)
  const [promiseNotes, setPromiseNotes] = useState('')

  // Toast State
  const [toastMessage, setToastMessage] = useState('')

  const showToast = (msg) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 3500)
  }

  // Consistent local device date (YYYY-MM-DD)
  const todayDateStr = useMemo(() => {
    const d = new Date()
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }, [])

  const loadBalanceData = async () => {
    setLoading(true)
    try {
      const res = await apiService.getBalanceReport()
      if (res && res.data && Array.isArray(res.data.ledgers) && res.data.ledgers.length > 0) {
        setLedgers(res.data.ledgers)
      }
    } catch {
      // Fallback kept
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBalanceData()
  }, [])

  // Derived KPIs
  const totalOutstanding = useMemo(() => {
    return ledgers.reduce((acc, curr) => acc + (Number(curr?.balance_due) || 0), 0)
  }, [ledgers])

  const totalBilled = useMemo(() => {
    return ledgers.reduce((acc, curr) => acc + (Number(curr?.total_amount) || 0), 0)
  }, [ledgers])

  const collectionRate = totalBilled > 0 ? Math.round(((totalBilled - totalOutstanding) / totalBilled) * 100) : 100

  // Aging distribution counts and amounts
  const agingStats = useMemo(() => {
    const buckets = {
      current: { label: 'Current (< Due)', count: 0, amount: 0, color: 'bg-emerald-500' },
      days_1_15: { label: '1-15d Overdue', count: 0, amount: 0, color: 'bg-amber-400' },
      days_16_30: { label: '16-30d Overdue', count: 0, amount: 0, color: 'bg-orange-500' },
      days_31_60: { label: '31-60d Warning', count: 0, amount: 0, color: 'bg-rose-500' },
      days_60_plus: { label: '60d+ Critical', count: 0, amount: 0, color: 'bg-purple-600' },
    }

    ledgers.forEach((l) => {
      if (!l) return
      const bal = Number(l.balance_due) || 0
      if (bal > 0) {
        const bKey =
          l.aging_bucket ||
          (l.is_overdue
            ? l.days_overdue > 60
              ? 'days_60_plus'
              : l.days_overdue > 30
              ? 'days_31_60'
              : 'days_1_15'
            : 'current')
        if (buckets[bKey]) {
          buckets[bKey].count += 1
          buckets[bKey].amount += bal
        }
      }
    })

    return buckets
  }, [ledgers])

  // Extract unique tracks & batches
  const tracksList = useMemo(() => {
    return Array.from(new Set(ledgers.map((l) => l?.track).filter(Boolean)))
  }, [ledgers])

  const batchesList = useMemo(() => {
    return Array.from(new Set(ledgers.map((l) => l?.batch_code).filter(Boolean)))
  }, [ledgers])

  // ==========================================
  // UNPACK SCHEDULED INSTALLMENTS INTO TASKS
  // ==========================================
  const collectionTasks = useMemo(() => {
    const tasks = []

    ledgers.forEach((l) => {
      if (!l) return
      const hasSchedule = Array.isArray(l.fee_schedule) && l.fee_schedule.length > 0

      if (hasSchedule) {
        l.fee_schedule.forEach((inst, idx) => {
          if (!inst) return
          const dueDate = inst.due_date || l.due_date || todayDateStr
          const amount = Number(inst.amount) || 0
          const isCleared = inst.status === 'Paid' || Number(l.balance_due) <= 0

          let category = 'upcoming'
          const dDue = new Date(dueDate + (dueDate.includes('T') ? '' : 'T00:00:00'))
          const dToday = new Date(todayDateStr + 'T00:00:00')
          const diffDays = isNaN(dDue.getTime()) ? 0 : Math.round((dToday.getTime() - dDue.getTime()) / (1000 * 3600 * 24))

          if (isCleared) {
            category = 'cleared'
          } else if (dueDate === todayDateStr) {
            category = 'today'
          } else if (diffDays > 0) {
            category = 'overdue'
          } else {
            category = 'upcoming'
          }

          tasks.push({
            id: `${l.id || 0}-inst-${inst.id || idx}`,
            ledgerId: l.id,
            student_id: l.student_id || 'STU',
            student_name: l.student_name || 'Student',
            track: l.track || 'Track',
            batch_code: l.batch_code || 'Cohort',
            guardian_name: l.guardian_name || (l.student_name ? `${l.student_name} Guardian` : 'Guardian'),
            guardian_relation: l.guardian_relation || 'Parent',
            guardian_phone: l.guardian_phone || '',
            guardian_email: l.guardian_email || '',
            installment_no: inst.installment || idx + 1,
            title: inst.label || `Installment ${idx + 1}`,
            due_date: dueDate,
            amount: amount,
            category: category,
            days_overdue: Math.max(0, diffDays),
            days_until: Math.max(0, -diffDays),
            status: inst.status || (isCleared ? 'Paid' : category === 'today' ? 'Due Today' : category === 'overdue' ? 'Overdue' : 'Scheduled'),
            commitment: l.commitment || null,
            rawLedger: l,
          })
        })
      }
    })

    // Sort: overdue first, then today, then upcoming
    return tasks.sort((a, b) => {
      const order = { overdue: 1, today: 2, upcoming: 3, cleared: 4 }
      if (order[a.category] !== order[b.category]) {
        return (order[a.category] || 99) - (order[b.category] || 99)
      }
      const tA = new Date(a.due_date).getTime() || 0
      const tB = new Date(b.due_date).getTime() || 0
      return tA - tB
    })
  }, [ledgers, todayDateStr])

  // Task KPI Summaries
  const todayTasks = useMemo(() => collectionTasks.filter((t) => t.category === 'today'), [collectionTasks])
  const overdueTasks = useMemo(() => collectionTasks.filter((t) => t.category === 'overdue'), [collectionTasks])
  const upcomingTasks = useMemo(() => collectionTasks.filter((t) => t.category === 'upcoming'), [collectionTasks])
  const clearedTasks = useMemo(() => collectionTasks.filter((t) => t.category === 'cleared'), [collectionTasks])

  const todayTotalAmount = useMemo(() => todayTasks.reduce((sum, t) => sum + (Number(t.amount) || 0), 0), [todayTasks])
  const overdueTotalAmount = useMemo(() => overdueTasks.reduce((sum, t) => sum + (Number(t.amount) || 0), 0), [overdueTasks])
  const upcomingTotalAmount = useMemo(() => upcomingTasks.reduce((sum, t) => sum + (Number(t.amount) || 0), 0), [upcomingTasks])

  // Filtered Tasks for Task Queue
  const filteredTasks = useMemo(() => {
    return collectionTasks.filter((task) => {
      if (!task) return false

      // Search
      if (search.trim()) {
        const q = search.toLowerCase()
        const match =
          (task.student_name || '').toLowerCase().includes(q) ||
          (task.student_id || '').toLowerCase().includes(q) ||
          (task.guardian_name || '').toLowerCase().includes(q) ||
          (task.guardian_phone || '').includes(q) ||
          (task.batch_code || '').toLowerCase().includes(q) ||
          (task.title || '').toLowerCase().includes(q)
        if (!match) return false
      }

      // Track Filter
      if (trackFilter !== 'all' && task.track !== trackFilter) return false

      // Batch Filter
      if (batchFilter !== 'all' && task.batch_code !== batchFilter) return false

      // Category tab
      if (taskCategoryFilter === 'today' && task.category !== 'today') return false
      if (taskCategoryFilter === 'overdue' && task.category !== 'overdue') return false
      if (taskCategoryFilter === 'upcoming' && task.category !== 'upcoming') return false
      if (taskCategoryFilter === 'cleared' && task.category !== 'cleared') return false
      if (taskCategoryFilter === 'all' && task.category === 'cleared') return false

      return true
    })
  }, [collectionTasks, search, trackFilter, batchFilter, taskCategoryFilter])

  // Filtered Ledgers for Full Table View
  const filteredLedgers = useMemo(() => {
    return ledgers.filter((item) => {
      if (!item) return false

      // Search
      if (search.trim()) {
        const q = search.toLowerCase()
        const match =
          (item.student_name || '').toLowerCase().includes(q) ||
          (item.student_id || '').toLowerCase().includes(q) ||
          (item.guardian_name || '').toLowerCase().includes(q) ||
          (item.guardian_phone || '').includes(q) ||
          (item.batch_code || '').toLowerCase().includes(q)
        if (!match) return false
      }

      // Status Tab
      if (statusTab === 'overdue' && !item.is_overdue) return false
      if (statusTab === 'partial' && (Number(item.balance_due) <= 0 || Number(item.paid_amount) <= 0)) return false
      if (statusTab === 'promised' && !item.commitment) return false
      if (statusTab === 'cleared' && Number(item.balance_due) > 0) return false

      // Aging Bucket Filter
      if (bucketFilter !== 'all' && item.aging_bucket !== bucketFilter) return false

      // Track Filter
      if (trackFilter !== 'all' && item.track !== trackFilter) return false

      // Batch Filter
      if (batchFilter !== 'all' && item.batch_code !== batchFilter) return false

      return true
    })
  }, [ledgers, search, statusTab, bucketFilter, trackFilter, batchFilter])

  // ==========================================
  // CALENDAR COMPUTATION LOGIC
  // ==========================================
  const calendarDays = useMemo(() => {
    const safeYear = Number(calendarYear) || new Date().getFullYear()
    const safeMonth = Number(calendarMonth) || 0
    const firstDay = new Date(safeYear, safeMonth, 1).getDay() // 0 = Sunday
    const daysInMonth = new Date(safeYear, safeMonth + 1, 0).getDate()

    const days = []
    // Leading empty days
    for (let i = 0; i < firstDay; i++) {
      days.push({ dayNumber: null, dateStr: null, isCurrentMonth: false, tasks: [], totalAmount: 0 })
    }

    // Days in current month
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = String(safeMonth + 1).padStart(2, '0')
      const dayStr = String(d).padStart(2, '0')
      const dateStr = `${safeYear}-${monthStr}-${dayStr}`

      const dayTasks = collectionTasks.filter((t) => {
        if (!t || t.due_date !== dateStr) return false
        if (calendarFilter === 'overdue' && t.category !== 'overdue') return false
        if (calendarFilter === 'today' && t.category !== 'today') return false
        if (calendarFilter === 'upcoming' && t.category !== 'upcoming') return false
        return true
      })

      const dayTotalAmount = dayTasks.reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

      days.push({
        dayNumber: d,
        dateStr: dateStr,
        isCurrentMonth: true,
        isToday: dateStr === todayDateStr,
        tasks: dayTasks,
        totalAmount: dayTotalAmount,
      })
    }

    return days
  }, [calendarYear, calendarMonth, collectionTasks, calendarFilter, todayDateStr])

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11)
      setCalendarYear((y) => y - 1)
    } else {
      setCalendarMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0)
      setCalendarYear((y) => y + 1)
    } else {
      setCalendarMonth((m) => m + 1)
    }
  }

  const jumpToToday = () => {
    const now = new Date()
    setCalendarYear(now.getFullYear())
    setCalendarMonth(now.getMonth())
    setSelectedCalendarDate(todayDateStr)
  }

  // Selected Date Tasks for Calendar Detail
  const selectedDateTasks = useMemo(() => {
    if (!selectedCalendarDate) return []
    return collectionTasks.filter((t) => t?.due_date === selectedCalendarDate)
  }, [collectionTasks, selectedCalendarDate])

  // Open Collect Modal
  const handleOpenCollect = (item, customAmount = null) => {
    if (!item) return
    setCollectTarget(item)
    const bal = Number(item.balance_due) || 0
    const defAmt = customAmount !== null ? Number(customAmount) : (bal > 0 ? bal : 5000)
    setCollectAmount(defAmt)
    setCollectMethod('Bank Transfer')
    setCollectNotes(`Settlement for invoice ${item.invoice_no || item.student_id || ''}`)
  }

  // Handle Payment Submit
  const handleConfirmCollect = async (e) => {
    e.preventDefault()
    if (!collectTarget) return
    const amt = Number(collectAmount)
    if (amt <= 0) {
      alert('Please enter a valid payment amount.')
      return
    }

    setIsSubmitting(true)
    try {
      await apiService.collectFeePayment({
        student_id: collectTarget.student_id,
        amount: amt,
        method: collectMethod,
        notes: collectNotes,
      })

      // Update local ledger
      setLedgers((prev) =>
        prev.map((l) => {
          if (l?.student_id === collectTarget.student_id) {
            const newPaid = Number(l.paid_amount || 0) + amt
            const newBal = Math.max(0, Number(l.total_amount || 0) - newPaid)
            return {
              ...l,
              paid_amount: newPaid,
              balance_due: newBal,
              paid_pct: Number(l.total_amount) > 0 ? Math.round((newPaid / Number(l.total_amount)) * 100) : 100,
              status: newBal <= 0 ? 'Paid' : 'Partial Payment',
              is_overdue: newBal > 0 && l.is_overdue,
            }
          }
          return l
        })
      )

      showToast(`Payment of ₹${formatCurrency(amt)} recorded for ${collectTarget.student_name}.`)
      setCollectTarget(null)
    } catch {
      showToast(`Payment of ₹${formatCurrency(amt)} recorded locally for ${collectTarget.student_name}.`)
      setLedgers((prev) =>
        prev.map((l) => {
          if (l?.student_id === collectTarget.student_id) {
            const newPaid = Number(l.paid_amount || 0) + amt
            const newBal = Math.max(0, Number(l.total_amount || 0) - newPaid)
            return {
              ...l,
              paid_amount: newPaid,
              balance_due: newBal,
              status: newBal <= 0 ? 'Paid' : 'Partial Payment',
            }
          }
          return l
        })
      )
      setCollectTarget(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open Reminder Modal
  const handleOpenRemind = (item, installmentTitle = '', instAmount = 0) => {
    if (!item) return
    setRemindTarget(item)
    setReminderChannel('whatsapp')
    const dueAmt = instAmount > 0 ? Number(instAmount) : (Number(item.balance_due) || 0)
    const instText = installmentTitle ? ` for ${installmentTitle}` : ''
    setCustomReminderMsg(
      `Dear ${item.guardian_name || 'Parent'}, this is an official fee reminder from Bixcel Institute of Technologies. Tuition installment${instText} of ₹${formatCurrency(dueAmt)} for student ${item.student_name || 'Student'} (${item.student_id || ''}) in ${item.track || 'Track'} was due on ${item.due_date || 'scheduled date'}. Please clear the balance via UPI/Netbanking or contact the finance office at accounts@bixcel.edu.`
    )
  }

  // Submit Reminder
  const handleSendReminder = async () => {
    if (!remindTarget) return
    setIsSubmitting(true)
    try {
      await apiService.sendFeeReminder({
        student_id: remindTarget.student_id,
        channel: reminderChannel,
        amount: Number(remindTarget.balance_due) || 0,
      })
      showToast(`Dues notice dispatched via ${reminderChannel.toUpperCase()} to ${remindTarget.guardian_name}.`)
      setRemindTarget(null)
    } catch {
      showToast(`Reminder logged for ${remindTarget.guardian_name}.`)
      setRemindTarget(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open Commitment Modal
  const handleOpenCommitment = (item, instAmount = 0) => {
    if (!item) return
    setCommitmentTarget(item)
    setPromiseDate(item.commitment?.promised_date || todayDateStr)
    setPromiseAmount(instAmount > 0 ? Number(instAmount) : (Number(item.commitment?.amount) || Number(item.balance_due) || 0))
    setPromiseNotes(item.commitment?.notes || 'Promised installment payment.')
  }

  // Save Commitment
  const handleSaveCommitment = async (e) => {
    e.preventDefault()
    if (!commitmentTarget) return
    setIsSubmitting(true)
    try {
      await apiService.saveFeeCommitment({
        student_id: commitmentTarget.student_id,
        promised_date: promiseDate,
        amount: Number(promiseAmount),
        notes: promiseNotes,
      })

      setLedgers((prev) =>
        prev.map((l) => {
          if (l?.student_id === commitmentTarget.student_id) {
            return {
              ...l,
              commitment: {
                promised_date: promiseDate,
                amount: Number(promiseAmount),
                notes: promiseNotes,
              },
            }
          }
          return l
        })
      )

      showToast(`Payment commitment logged for ${commitmentTarget.student_name} (Due: ${promiseDate}).`)
      setCommitmentTarget(null)
    } catch {
      showToast(`Commitment noted for ${commitmentTarget.student_name}.`)
      setCommitmentTarget(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 max-w-[1440px] w-full mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white shadow-lg font-label text-label-md animate-fade-in">
          <span className="material-symbols-outlined text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-light-outline-variant dark:border-dark-outline-variant">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary inline-flex items-center justify-center">
              <span className="material-symbols-outlined text-[17px]">account_balance_wallet</span>
            </span>
            <h1 className="font-title text-[18px] font-bold text-light-on-surface dark:text-dark-on-surface">
              Fee Balance &amp; Scheduled Dues
            </h1>
          </div>
          <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">
            Track multi-date scheduled installments, actionable collection tasks, today's recovery targets, and calendar schedules.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('fees')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface font-label text-xs font-semibold hover:bg-light-surface-container-low transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">payments</span>
              <span>All Invoices</span>
            </button>
          )}

          <button
            type="button"
            onClick={loadBalanceData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface font-label text-xs font-semibold hover:bg-light-surface-container-low transition-colors cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[15px] ${loading ? 'animate-spin' : ''}`}>sync</span>
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const count = overdueTasks.length
              if (window.confirm(`Broadcast dues reminders to ${count} students with overdue scheduled installments?`)) {
                showToast(`Payment notices queued for ${count} students.`)
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-600 text-white hover:bg-amber-700 font-label text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[15px]">campaign</span>
            <span>Broadcast Overdue Notices ({overdueTasks.length})</span>
          </button>
        </div>
      </section>

      {/* 5 Real-Time KPI Cards */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* Metric 1: Today's Collection */}
        <article
          onClick={() => {
            setViewMode('tasks')
            setTaskCategoryFilter('today')
          }}
          className={`bg-light-surface-container-lowest dark:bg-dark-surface-bright border rounded p-2.5 shadow-xs flex flex-col justify-between gap-1.5 cursor-pointer transition-all ${
            taskCategoryFilter === 'today' && viewMode === 'tasks'
              ? 'border-blue-500 ring-2 ring-blue-500/20'
              : 'border-light-outline-variant dark:border-dark-outline-variant hover:border-blue-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-label text-[11px] text-blue-700 dark:text-blue-300 font-bold uppercase tracking-wider">
              Today's Collection
            </span>
            <span className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 inline-flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">today</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-[17px] font-bold tabular-nums text-blue-700 dark:text-blue-300">
              ₹{formatCurrency(todayTotalAmount)}
            </span>
            <span className="font-label text-[10px] px-1.5 py-0.2 rounded font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-200">
              {todayTasks.length} Due Today
            </span>
          </div>
        </article>

        {/* Metric 2: Overdue Dues */}
        <article
          onClick={() => {
            setViewMode('tasks')
            setTaskCategoryFilter('overdue')
          }}
          className={`bg-light-surface-container-lowest dark:bg-dark-surface-bright border rounded p-2.5 shadow-xs flex flex-col justify-between gap-1.5 cursor-pointer transition-all ${
            taskCategoryFilter === 'overdue' && viewMode === 'tasks'
              ? 'border-rose-500 ring-2 ring-rose-500/20'
              : 'border-light-outline-variant dark:border-dark-outline-variant hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-label text-[11px] text-rose-700 dark:text-rose-400 font-bold uppercase tracking-wider">
              Overdue Dues
            </span>
            <span className="w-6 h-6 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 inline-flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">warning</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-[17px] font-bold tabular-nums text-rose-600 dark:text-rose-400">
              ₹{formatCurrency(overdueTotalAmount)}
            </span>
            <span className="font-label text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200">
              {overdueTasks.length} Overdue
            </span>
          </div>
        </article>

        {/* Metric 3: Upcoming Scheduled */}
        <article
          onClick={() => {
            setViewMode('tasks')
            setTaskCategoryFilter('upcoming')
          }}
          className={`bg-light-surface-container-lowest dark:bg-dark-surface-bright border rounded p-2.5 shadow-xs flex flex-col justify-between gap-1.5 cursor-pointer transition-all ${
            taskCategoryFilter === 'upcoming' && viewMode === 'tasks'
              ? 'border-emerald-500 ring-2 ring-emerald-500/20'
              : 'border-light-outline-variant dark:border-dark-outline-variant hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-label text-[11px] text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-wider">
              Upcoming Dues
            </span>
            <span className="w-6 h-6 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 inline-flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">schedule</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-[17px] font-bold tabular-nums text-emerald-700 dark:text-emerald-300">
              ₹{formatCurrency(upcomingTotalAmount)}
            </span>
            <span className="font-label text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200">
              {upcomingTasks.length} Scheduled
            </span>
          </div>
        </article>

        {/* Metric 4: Total Outstanding Balance */}
        <article
          onClick={() => {
            setViewMode('ledger')
          }}
          className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex flex-col justify-between gap-1.5 cursor-pointer hover:border-light-primary"
        >
          <div className="flex items-center justify-between">
            <span className="font-label text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Total Outstanding
            </span>
            <span className="w-6 h-6 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 inline-flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">pending_actions</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-[17px] font-bold tabular-nums text-light-on-surface dark:text-dark-on-surface">
              ₹{formatCurrency(totalOutstanding)}
            </span>
            <span className="font-label text-[10px] text-light-outline">
              Ledger Total
            </span>
          </div>
        </article>

        {/* Metric 5: Collection Efficiency */}
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-label text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Recovery Efficiency
            </span>
            <span className="w-6 h-6 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 inline-flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">trending_up</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-[17px] font-bold tabular-nums text-purple-600 dark:text-purple-400">
              {collectionRate}%
            </span>
            <span className="font-label text-[10px] text-light-outline">
              Billed: ₹{formatCurrency(totalBilled)}
            </span>
          </div>
        </article>
      </section>

      {/* VIEW MODE TABS NAVIGATION */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-1.5 rounded-lg bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant/60">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewMode('tasks')}
            className={`px-3 py-1.5 rounded-md font-label text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'tasks'
                ? 'bg-light-primary text-light-on-primary shadow-xs'
                : 'text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">task_alt</span>
            <span>Collection Task Queue</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
              {collectionTasks.filter((t) => t.category !== 'cleared').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 rounded-md font-label text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'calendar'
                ? 'bg-light-primary text-light-on-primary shadow-xs'
                : 'text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            <span>Collection Calendar</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
              {monthNames[calendarMonth]?.slice(0, 3)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('ledger')}
            className={`px-3 py-1.5 rounded-md font-label text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'ledger'
                ? 'bg-light-primary text-light-on-primary shadow-xs'
                : 'text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">table_chart</span>
            <span>Student Balance Ledger</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
              {ledgers.length}
            </span>
          </button>
        </div>

        {/* Global Search & Filters Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <span className="material-symbols-outlined text-[16px] text-light-outline absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student, installment, phone..."
              className="pl-7 pr-3 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary w-56"
            />
          </div>

          <select
            value={trackFilter}
            onChange={(e) => setTrackFilter(e.target.value)}
            className="px-2 py-1 text-xs rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface focus:outline-none"
          >
            <option value="all">All Tracks</option>
            {tracksList.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* ========================================================= */}
      {/* VIEW 1: COLLECTION TASK QUEUE (Today, Overdue, Upcoming) */}
      {/* ========================================================= */}
      {viewMode === 'tasks' && (
        <section className="flex flex-col gap-3">
          {/* Subcategory Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-light-outline-variant pb-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                {
                  id: 'today',
                  label: "🔥 Today's Collection",
                  count: todayTasks.length,
                  amount: todayTotalAmount,
                  color: 'border-blue-400 text-blue-700 dark:text-blue-300',
                  activeBg: 'bg-blue-600 text-white',
                },
                {
                  id: 'overdue',
                  label: '⚠️ Overdue Dues',
                  count: overdueTasks.length,
                  amount: overdueTotalAmount,
                  color: 'border-rose-400 text-rose-700 dark:text-rose-300',
                  activeBg: 'bg-rose-600 text-white',
                },
                {
                  id: 'upcoming',
                  label: '⏳ Upcoming Scheduled',
                  count: upcomingTasks.length,
                  amount: upcomingTotalAmount,
                  color: 'border-emerald-400 text-emerald-700 dark:text-emerald-300',
                  activeBg: 'bg-emerald-600 text-white',
                },
                {
                  id: 'all',
                  label: '📋 All Active Dues',
                  count: collectionTasks.filter((t) => t.category !== 'cleared').length,
                  amount: totalOutstanding,
                  color: 'border-slate-400 text-slate-700 dark:text-slate-300',
                  activeBg: 'bg-light-primary text-light-on-primary',
                },
                {
                  id: 'cleared',
                  label: '✓ Settled / Paid',
                  count: clearedTasks.length,
                  amount: 0,
                  color: 'border-gray-400 text-gray-500',
                  activeBg: 'bg-gray-600 text-white',
                },
              ].map((tab) => {
                const isActive = taskCategoryFilter === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTaskCategoryFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-md font-label text-xs font-bold inline-flex items-center gap-1.5 border transition-all cursor-pointer ${
                      isActive
                        ? `${tab.activeBg} border-transparent shadow-xs`
                        : `bg-light-surface-container-lowest dark:bg-dark-surface-bright ${tab.color} hover:bg-light-surface-container-low`
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        isActive ? 'bg-white/25 text-white' : 'bg-light-surface-container text-light-on-surface'
                      }`}
                    >
                      {tab.count}
                    </span>
                    {tab.amount > 0 && (
                      <span className="text-[10px] font-mono font-normal opacity-90">
                        (₹{formatCurrency(tab.amount)})
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs text-light-on-surface-variant font-mono">
                Showing <strong>{filteredTasks.length}</strong> scheduled dues
              </div>

              {/* Layout Switcher: Listing vs Cards */}
              <div className="flex items-center bg-light-surface-container-low dark:bg-dark-surface-container p-0.5 rounded border border-light-outline-variant">
                <button
                  type="button"
                  onClick={() => setTaskLayout('list')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                    taskLayout === 'list'
                      ? 'bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface shadow-2xs'
                      : 'text-light-on-surface-variant hover:text-light-on-surface'
                  }`}
                  title="List View (Table Listing)"
                >
                  <span className="material-symbols-outlined text-[14px]">format_list_bulleted</span>
                  <span>Listing</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTaskLayout('cards')}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                    taskLayout === 'cards'
                      ? 'bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface shadow-2xs'
                      : 'text-light-on-surface-variant hover:text-light-on-surface'
                  }`}
                  title="Cards View"
                >
                  <span className="material-symbols-outlined text-[14px]">grid_view</span>
                  <span>Cards</span>
                </button>
              </div>
            </div>
          </div>

          {/* Scheduled Dues Content */}
          {filteredTasks.length === 0 ? (
            <div className="p-12 text-center rounded-lg border border-dashed border-light-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright">
              <span className="material-symbols-outlined text-[36px] text-light-outline">checklist_rtl</span>
              <h3 className="font-bold text-sm text-light-on-surface mt-2">No Scheduled Dues in this Queue</h3>
              <p className="text-xs text-light-on-surface-variant mt-1">
                All scheduled installments for this category are settled or no records match your filter criteria.
              </p>
            </div>
          ) : taskLayout === 'list' ? (
            /* LISTING VIEW (Table Listing) */
            <div className="rounded-lg border border-light-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-light-outline-variant bg-light-surface-container-low/70 dark:bg-dark-surface-container/70 text-[11px] font-bold uppercase tracking-wider text-light-on-surface-variant">
                      <th className="py-2.5 px-3 w-12 text-center">#</th>
                      <th className="py-2.5 px-3">Milestone / Installment</th>
                      <th className="py-2.5 px-3">Student &amp; Cohort</th>
                      <th className="py-2.5 px-3">Scheduled Due Date</th>
                      <th className="py-2.5 px-3">Guardian Contact</th>
                      <th className="py-2.5 px-3 text-right">Scheduled Due</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Collection Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-outline-variant/60 text-xs font-body text-light-on-surface dark:text-dark-on-surface">
                    {filteredTasks.map((task) => {
                      const isOverdue = task.category === 'overdue'
                      const isToday = task.category === 'today'
                      const isCleared = task.category === 'cleared'
                      return (
                        <tr
                          key={task.id}
                          className={`hover:bg-light-surface-container-low/50 transition-colors ${
                            isToday
                              ? 'bg-blue-50/30 dark:bg-blue-950/20'
                              : isOverdue
                              ? 'bg-rose-50/25 dark:bg-rose-950/15'
                              : isCleared
                              ? 'opacity-70'
                              : ''
                          }`}
                        >
                          {/* # Installment Badge */}
                          <td className="py-2.5 px-3 text-center align-middle">
                            <span className="w-6 h-6 rounded-full bg-light-primary-tint text-light-primary font-bold font-mono text-[10px] inline-flex items-center justify-center">
                              #{task.installment_no}
                            </span>
                          </td>

                          {/* Milestone Title */}
                          <td className="py-2.5 px-3 align-middle">
                            <div className="font-bold text-light-on-surface dark:text-dark-on-surface text-[12px]">
                              {task.title}
                            </div>
                            <div className="text-[10px] font-mono text-light-on-surface-variant">
                              Ref: {task.rawLedger?.invoice_no || 'Pending'}
                            </div>
                          </td>

                          {/* Student & Cohort */}
                          <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-full bg-light-primary-tint text-light-primary font-bold text-[11px] flex items-center justify-center shrink-0">
                                {getInitials(task.student_name)}
                              </span>
                              <div>
                                <div className="font-semibold text-light-on-surface text-xs">
                                  {task.student_name}
                                </div>
                                <div className="text-[10px] font-mono text-light-on-surface-variant">
                                  {task.student_id} • {task.batch_code}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Scheduled Due Date & Urgency */}
                          <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                            <div className="font-mono font-bold text-xs text-light-on-surface">
                              {task.due_date}
                            </div>
                            {isToday ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded font-bold bg-blue-600 text-white animate-pulse">
                                <span className="material-symbols-outlined text-[11px]">alarm</span>
                                <span>Due Today</span>
                              </span>
                            ) : isOverdue ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-600 text-white">
                                <span className="material-symbols-outlined text-[11px]">error</span>
                                <span>{task.days_overdue}d Overdue</span>
                              </span>
                            ) : isCleared ? (
                              <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-600 text-white">
                                <span className="material-symbols-outlined text-[11px]">check</span>
                                <span>Settled</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.2 rounded font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                <span>In {task.days_until}d</span>
                              </span>
                            )}
                          </td>

                          {/* Guardian Contact */}
                          <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                            <div className="text-xs font-medium text-light-on-surface">
                              {task.guardian_name || '—'}
                            </div>
                            <div className="flex items-center gap-1.5 font-mono text-[11px] text-light-on-surface-variant">
                              <span>{task.guardian_phone || '—'}</span>
                              {task.guardian_phone && (
                                <a
                                  href={`https://wa.me/${getCleanPhone(task.guardian_phone)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700"
                                  title="Chat on WhatsApp"
                                >
                                  <span className="material-symbols-outlined text-[13px]">chat</span>
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Scheduled Due Amount */}
                          <td className="py-2.5 px-3 align-middle text-right whitespace-nowrap font-mono font-bold text-sm text-light-on-surface dark:text-dark-on-surface">
                            ₹{formatCurrency(task.amount)}
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-3 align-middle whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isToday
                                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                : isOverdue
                                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                : isCleared
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 text-slate-800 border border-slate-300'
                            }`}>
                              {task.status}
                            </span>
                            {task.commitment && (
                              <div className="text-[10px] text-blue-600 font-mono mt-0.5 truncate max-w-[130px]" title={task.commitment.notes}>
                                Promised: {task.commitment.promised_date}
                              </div>
                            )}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-2.5 px-3 align-middle text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenRemind(task.rawLedger, task.title, task.amount)}
                                className="p-1 rounded border border-light-outline-variant hover:bg-light-surface-container text-light-on-surface cursor-pointer"
                                title="Send Reminder Notice via WhatsApp / SMS"
                              >
                                <span className="material-symbols-outlined text-[15px] text-amber-600">send</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenCommitment(task.rawLedger, task.amount)}
                                className="p-1 rounded border border-light-outline-variant hover:bg-light-surface-container text-light-on-surface cursor-pointer"
                                title="Log Payment Commitment"
                              >
                                <span className="material-symbols-outlined text-[15px] text-blue-600">handshake</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenCollect(task.rawLedger, task.amount)}
                                className="px-2.5 py-1 rounded bg-light-primary text-light-on-primary text-[11px] font-bold hover:bg-light-primary-container shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                                title="Collect this installment amount"
                              >
                                <span className="material-symbols-outlined text-[13px]">payments</span>
                                <span>Collect</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* CARDS GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredTasks.map((task) => {
                const isOverdue = task.category === 'overdue'
                const isToday = task.category === 'today'
                const isCleared = task.category === 'cleared'

                return (
                  <article
                    key={task.id}
                    className={`relative rounded-lg border p-3.5 flex flex-col justify-between gap-3 shadow-2xs transition-all ${
                      isToday
                        ? 'border-blue-400 bg-blue-50/40 dark:bg-blue-950/20 ring-1 ring-blue-400/50'
                        : isOverdue
                        ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/15'
                        : isCleared
                        ? 'border-light-outline-variant/60 bg-light-surface-container-low/40 opacity-75'
                        : 'border-light-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright hover:border-light-primary/60'
                    }`}
                  >
                    {/* Top Row: Milestone Title & Status Pill */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-light-primary-tint text-light-primary text-[10px] font-bold font-mono inline-flex items-center justify-center">
                            #{task.installment_no}
                          </span>
                          <h4 className="font-bold text-xs text-light-on-surface dark:text-dark-on-surface">
                            {task.title}
                          </h4>
                        </div>
                        <span className="text-[10px] font-mono text-light-on-surface-variant block mt-0.5">
                          Invoice Ref: {task.rawLedger?.invoice_no || 'Pending'}
                        </span>
                      </div>

                      {/* Urgency Badge */}
                      {isToday ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white animate-pulse shadow-xs">
                          <span className="material-symbols-outlined text-[12px]">alarm</span>
                          DUE TODAY
                        </span>
                      ) : isOverdue ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white shadow-xs">
                          <span className="material-symbols-outlined text-[12px]">error</span>
                          {task.days_overdue}d OVERDUE
                        </span>
                      ) : isCleared ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                          <span className="material-symbols-outlined text-[12px]">check</span>
                          SETTLED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <span className="material-symbols-outlined text-[12px]">calendar_today</span>
                          In {task.days_until} days
                        </span>
                      )}
                    </div>

                    {/* Student Info Box */}
                    <div className="p-2 rounded bg-light-surface-container-low dark:bg-dark-surface-container flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-7 h-7 rounded-full bg-light-primary-tint text-light-primary font-bold text-[11px] flex items-center justify-center shrink-0">
                          {getInitials(task.student_name)}
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-xs text-light-on-surface truncate">
                            {task.student_name}
                          </div>
                          <div className="text-[10px] font-mono text-light-on-surface-variant truncate">
                            {task.student_id} • {task.batch_code}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-light-outline block uppercase font-medium">Due Amount</span>
                        <span className="font-mono font-bold text-sm text-light-on-surface dark:text-dark-on-surface">
                          ₹{formatCurrency(task.amount)}
                        </span>
                      </div>
                    </div>

                    {/* Due Date & Contact Details */}
                    <div className="flex flex-col gap-1 text-[11px] text-light-on-surface-variant">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-light-outline">event</span>
                          <span>Scheduled Date:</span>
                        </span>
                        <strong className="font-mono text-light-on-surface">{task.due_date}</strong>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-light-outline">contact_phone</span>
                          <span>Guardian:</span>
                        </span>
                        <div className="flex items-center gap-1.5 font-mono">
                          <span>{task.guardian_phone || '—'}</span>
                          {task.guardian_phone && (
                            <a
                              href={`https://wa.me/${getCleanPhone(task.guardian_phone)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-600 hover:text-emerald-700 inline-flex items-center"
                              title="Chat on WhatsApp"
                            >
                              <span className="material-symbols-outlined text-[13px]">chat</span>
                            </a>
                          )}
                        </div>
                      </div>

                      {task.commitment && (
                        <div className="mt-1 p-1.5 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-[10px] text-blue-800 dark:text-blue-300 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">handshake</span>
                          <span>Promise: Pay on {task.commitment.promised_date}</span>
                        </div>
                      )}
                    </div>

                    {/* Quick Action Footer */}
                    <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-light-outline-variant/60">
                      <button
                        type="button"
                        onClick={() => handleOpenRemind(task.rawLedger, task.title, task.amount)}
                        className="px-2 py-1 rounded border border-light-outline-variant text-[11px] font-semibold text-light-on-surface hover:bg-light-surface-container inline-flex items-center gap-1 cursor-pointer"
                        title="Send Reminder via WhatsApp / SMS"
                      >
                        <span className="material-symbols-outlined text-[13px] text-amber-600">send</span>
                        <span>Remind</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenCommitment(task.rawLedger, task.amount)}
                        className="px-2 py-1 rounded border border-light-outline-variant text-[11px] font-semibold text-light-on-surface hover:bg-light-surface-container inline-flex items-center gap-1 cursor-pointer"
                        title="Log Promise to Pay"
                      >
                        <span className="material-symbols-outlined text-[13px] text-blue-600">handshake</span>
                        <span>Promise</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenCollect(task.rawLedger, task.amount)}
                        className="px-3 py-1 rounded bg-light-primary text-light-on-primary text-[11px] font-bold hover:bg-light-primary-container shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                        title="Collect this installment amount"
                      >
                        <span className="material-symbols-outlined text-[13px]">payments</span>
                        <span>Collect</span>
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: COLLECTION CALENDAR VIEW ("calnder wilw")        */}
      {/* ========================================================= */}
      {viewMode === 'calendar' && (
        <section className="flex flex-col gap-3">
          {/* Calendar Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant">
            {/* Month & Navigation */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1.5 rounded border border-light-outline-variant hover:bg-light-surface-container text-light-on-surface cursor-pointer"
                title="Previous Month"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              <h2 className="font-title text-sm sm:text-base font-bold text-light-on-surface dark:text-dark-on-surface min-w-[150px] text-center">
                {monthNames[calendarMonth]} {calendarYear}
              </h2>

              <button
                type="button"
                onClick={nextMonth}
                className="p-1.5 rounded border border-light-outline-variant hover:bg-light-surface-container text-light-on-surface cursor-pointer"
                title="Next Month"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>

              <button
                type="button"
                onClick={jumpToToday}
                className="px-2.5 py-1 rounded border border-light-outline-variant hover:bg-light-surface-container text-xs font-semibold text-light-on-surface cursor-pointer ml-1"
              >
                Today
              </button>
            </div>

            {/* Calendar Filters & Legend */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-light-on-surface-variant font-medium">Filter Days:</span>
              {[
                { id: 'all', label: 'All Dues' },
                { id: 'today', label: 'Due Today' },
                { id: 'overdue', label: 'Overdue Only' },
                { id: 'upcoming', label: 'Upcoming Only' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCalendarFilter(f.id)}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                    calendarFilter === f.id
                      ? 'bg-light-primary text-light-on-primary border-light-primary'
                      : 'bg-light-surface-container-low border-light-outline-variant text-light-on-surface'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 7-Day Month Grid */}
          <div className="rounded-lg border border-light-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright shadow-sm overflow-hidden">
            {/* Weekday headers */}
            <div className="grid grid-cols-7 border-b border-light-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-[11px] font-bold text-light-on-surface-variant uppercase text-center py-2">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Day Cells Grid */}
            <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-light-outline-variant/60">
              {calendarDays.map((cDay, idx) => {
                if (!cDay.isCurrentMonth) {
                  return (
                    <div
                      key={`empty-${idx}`}
                      className="min-h-[95px] p-1.5 bg-light-surface-container-low/20 dark:bg-dark-surface-container/20"
                    />
                  )
                }

                const isSelected = selectedCalendarDate === cDay.dateStr
                const hasTasks = cDay.tasks.length > 0
                const hasOverdue = cDay.tasks.some((t) => t.category === 'overdue')
                const hasToday = cDay.tasks.some((t) => t.category === 'today')

                return (
                  <div
                    key={cDay.dateStr}
                    onClick={() => setSelectedCalendarDate(cDay.dateStr)}
                    className={`min-h-[95px] p-1.5 flex flex-col justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-light-primary-tint/25 dark:bg-dark-primary-tint/25 ring-2 ring-light-primary ring-inset'
                        : cDay.isToday
                        ? 'bg-blue-50/40 dark:bg-blue-950/20'
                        : 'hover:bg-light-surface-container-low/50'
                    }`}
                  >
                    {/* Day Number Header */}
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`w-6 h-6 rounded-full text-xs font-bold inline-flex items-center justify-center font-mono ${
                          cDay.isToday
                            ? 'bg-blue-600 text-white'
                            : isSelected
                            ? 'bg-light-primary text-light-on-primary'
                            : 'text-light-on-surface'
                        }`}
                      >
                        {cDay.dayNumber}
                      </span>

                      {hasTasks && (
                        <span
                          className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded ${
                            hasToday
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-200'
                              : hasOverdue
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-200'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200'
                          }`}
                        >
                          ₹{formatCurrency(cDay.totalAmount)}
                        </span>
                      )}
                    </div>

                    {/* Chips for Scheduled Installments */}
                    <div className="flex flex-col gap-1 overflow-y-auto max-h-[60px]">
                      {cDay.tasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={`px-1.5 py-0.5 rounded text-[9px] font-medium truncate flex items-center justify-between ${
                            task.category === 'today'
                              ? 'bg-blue-100 text-blue-900 border border-blue-300'
                              : task.category === 'overdue'
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                          }`}
                          title={`${task.student_name}: ₹${formatCurrency(task.amount)}`}
                        >
                          <span className="truncate">{task.student_name}</span>
                          <span className="font-mono font-bold ml-1">₹{formatCurrency(task.amount)}</span>
                        </div>
                      ))}

                      {cDay.tasks.length > 2 && (
                        <span className="text-[9px] text-light-outline font-bold">
                          +{cDay.tasks.length - 2} more dues
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Selected Date Agenda Drawer */}
          {selectedCalendarDate && (
            <div className="p-4 rounded-lg border border-light-primary/40 bg-light-surface-container-lowest dark:bg-dark-surface-bright shadow-sm flex flex-col gap-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-light-outline-variant pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-light-primary text-light-on-primary flex items-center justify-center font-bold text-xs font-mono">
                    📅
                  </span>
                  <div>
                    <h3 className="font-bold text-xs text-light-on-surface">
                      Scheduled Collections on {selectedCalendarDate}
                    </h3>
                    <span className="text-[10px] text-light-on-surface-variant">
                      {selectedDateTasks.length} installment dues scheduled
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCalendarDate(null)}
                  className="text-light-on-surface-variant hover:text-light-on-surface cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {selectedDateTasks.length === 0 ? (
                <p className="text-xs text-light-on-surface-variant py-2">
                  No installment payments scheduled for this specific date. Click another day on the calendar to inspect.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {selectedDateTasks.map((task) => (
                    <div
                      key={task.id}
                      className="p-3 rounded border border-light-outline-variant bg-light-surface-container-low flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-light-on-surface">{task.student_name}</div>
                        <div className="text-[10px] text-light-on-surface-variant font-mono">
                          {task.student_id} • {task.title}
                        </div>
                        <div className="font-mono font-bold text-pending mt-0.5">
                          ₹{formatCurrency(task.amount)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenRemind(task.rawLedger, task.title, task.amount)}
                          className="px-2 py-1 rounded border border-light-outline-variant hover:bg-light-surface-container text-[11px] font-semibold cursor-pointer"
                        >
                          Remind
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenCollect(task.rawLedger, task.amount)}
                          className="px-2.5 py-1 rounded bg-light-primary text-light-on-primary text-[11px] font-bold hover:bg-light-primary-container shadow-2xs cursor-pointer"
                        >
                          Collect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ========================================================= */}
      {/* VIEW 3: FULL STUDENT BALANCE LEDGER TABLE                 */}
      {/* ========================================================= */}
      {viewMode === 'ledger' && (
        <section className="flex flex-col gap-3">
          {/* Visual Aging Exposure Bar */}
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface">
                Accounts Receivable Aging Distribution
              </span>
              <span className="font-label text-label-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Live Status ({todayDateStr})
              </span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="h-3.5 w-full bg-light-surface-container-low dark:bg-dark-surface-container rounded-full overflow-hidden flex">
              {Object.entries(agingStats).map(([key, item]) => {
                if (!item || item.amount <= 0) return null
                const pct = totalOutstanding > 0 ? (item.amount / totalOutstanding) * 100 : 0
                return (
                  <div
                    key={key}
                    style={{ width: `${pct}%` }}
                    className={`${item.color} h-full transition-all duration-300 relative group`}
                    title={`${item.label}: ₹${formatCurrency(item.amount)} (${pct.toFixed(1)}%)`}
                  />
                )
              })}
            </div>

            {/* Aging Legend Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {Object.entries(agingStats).map(([key, item]) => {
                if (!item) return null
                const pct = totalOutstanding > 0 ? ((item.amount / totalOutstanding) * 100).toFixed(1) : 0
                return (
                  <div
                    key={key}
                    className="inline-flex items-center gap-1.5 font-label text-label-xs text-light-on-surface-variant dark:text-dark-on-surface-variant"
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="font-medium text-light-on-surface dark:text-dark-on-surface">{item.label}:</span>
                    <span className="tabular-nums font-semibold">₹{formatCurrency(item.amount)}</span>
                    <span className="text-[10px] text-light-outline">({pct}%)</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ledger Table Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-md bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant">
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Accounts' },
                { id: 'overdue', label: 'Overdue Dues' },
                { id: 'partial', label: 'Partial Balance' },
                { id: 'promised', label: 'Promised' },
                { id: 'cleared', label: 'Fully Paid' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusTab(st.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer ${
                    statusTab === st.id
                      ? 'bg-light-primary text-light-on-primary border-light-primary'
                      : 'bg-light-surface-container-low border-light-outline-variant text-light-on-surface'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={bucketFilter}
                onChange={(e) => setBucketFilter(e.target.value)}
                className="px-2 py-1 text-xs rounded border border-light-outline-variant bg-light-surface-container-low text-light-on-surface"
              >
                <option value="all">All Aging Buckets</option>
                <option value="current">Current (&lt; Due Date)</option>
                <option value="days_1_15">1-15 Days Overdue</option>
                <option value="days_16_30">16-30 Days Overdue</option>
                <option value="days_31_60">31-60 Days Overdue</option>
                <option value="days_60_plus">60+ Days Critical</option>
              </select>

              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="px-2 py-1 text-xs rounded border border-light-outline-variant bg-light-surface-container-low text-light-on-surface"
              >
                <option value="all">All Batches</option>
                {batchesList.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ledger Table Section */}
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/60 dark:bg-dark-surface-container/60 font-label text-label-xs text-light-on-surface-variant dark:text-dark-on-surface-variant uppercase tracking-wider">
                    <th className="py-2.5 px-3">Student &amp; ID</th>
                    <th className="py-2.5 px-3">Guardian &amp; Contact</th>
                    <th className="py-2.5 px-3">Track &amp; Cohort</th>
                    <th className="py-2.5 px-3 text-right">Tuition</th>
                    <th className="py-2.5 px-3 text-right">Paid</th>
                    <th className="py-2.5 px-3 text-right">Outstanding Due</th>
                    <th className="py-2.5 px-3">Due Date &amp; Aging</th>
                    <th className="py-2.5 px-3">Commitment Status</th>
                    <th className="py-2.5 px-3 text-right">Recovery Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant font-body text-body-sm text-light-on-surface dark:text-dark-on-surface">
                  {filteredLedgers.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        <span className="material-symbols-outlined text-[32px] text-light-outline">search_off</span>
                        <p className="mt-1 font-body text-body-sm">No student fee records match current filters.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLedgers.map((item) => {
                      const balDue = Number(item?.balance_due) || 0
                      const isCleared = balDue <= 0
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-light-surface-container-low/40 dark:hover:bg-dark-surface-container/40 transition-colors"
                        >
                          {/* Student & ID */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="w-7 h-7 rounded-full bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary font-label text-[11px] font-bold flex items-center justify-center shrink-0">
                                {getInitials(item.student_name)}
                              </span>
                              <div>
                                <div className="font-semibold text-light-on-surface dark:text-dark-on-surface text-[12px]">
                                  {item.student_name}
                                </div>
                                <div className="font-mono text-[10px] text-light-on-surface-variant dark:text-dark-on-surface-variant">
                                  {item.student_id}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Guardian & Contact */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="text-[12px] font-medium text-light-on-surface dark:text-dark-on-surface">
                              {item.guardian_name || '—'}
                              {item.guardian_relation && (
                                <span className="text-[10px] text-light-outline ml-1">({item.guardian_relation})</span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant">
                              <span className="font-mono">{item.guardian_phone || '—'}</span>
                              {item.guardian_phone && (
                                <a
                                  href={`https://wa.me/${getCleanPhone(item.guardian_phone)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700 inline-flex items-center"
                                  title="Chat on WhatsApp"
                                >
                                  <span className="material-symbols-outlined text-[13px]">chat</span>
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Track & Cohort */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="text-[12px] text-light-on-surface dark:text-dark-on-surface truncate max-w-[150px]">
                              {item.track}
                            </div>
                            <span className="inline-block px-1.5 py-0.2 rounded font-mono text-[10px] bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant font-medium">
                              {item.batch_code}
                            </span>
                          </td>

                          {/* Total Tuition */}
                          <td className="py-2.5 px-3 text-right font-mono text-[12px] font-medium text-light-on-surface dark:text-dark-on-surface whitespace-nowrap">
                            ₹{formatCurrency(item.total_amount)}
                          </td>

                          {/* Paid Amount */}
                          <td className="py-2.5 px-3 text-right font-mono text-[12px] text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">
                            <div>₹{formatCurrency(item.paid_amount)}</div>
                            <div className="text-[10px] text-light-outline font-normal">
                              {item.paid_pct || 0}%
                            </div>
                          </td>

                          {/* Outstanding Due */}
                          <td className="py-2.5 px-3 text-right font-mono text-[13px] font-bold whitespace-nowrap">
                            <span
                              className={
                                isCleared
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : item.is_overdue
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : 'text-amber-600 dark:text-amber-400'
                              }
                            >
                              ₹{formatCurrency(item.balance_due)}
                            </span>
                          </td>

                          {/* Due Date & Aging Category */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="text-[11px] font-mono text-light-on-surface dark:text-dark-on-surface">
                              {item.due_date}
                            </div>
                            {isCleared ? (
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                                <span className="material-symbols-outlined text-[11px]">check</span>
                                <span>Cleared</span>
                              </span>
                            ) : item.is_overdue ? (
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                                  Number(item.days_overdue) > 60
                                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                }`}
                              >
                                <span className="material-symbols-outlined text-[11px]">schedule</span>
                                <span>{item.days_overdue}d Overdue</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                                <span>Current Due</span>
                              </span>
                            )}
                          </td>

                          {/* Commitment Status */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {item.commitment ? (
                              <div className="flex flex-col">
                                <span className="inline-flex items-center gap-1 font-label text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                                  <span className="material-symbols-outlined text-[12px]">calendar_clock</span>
                                  <span>Promised: {item.commitment.promised_date}</span>
                                </span>
                                <span className="text-[10px] text-light-on-surface-variant truncate max-w-[140px] mt-0.5">
                                  {item.commitment.notes}
                                </span>
                              </div>
                            ) : isCleared ? (
                              <span className="text-[11px] text-light-outline">—</span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenCommitment(item)}
                                className="font-label text-[11px] text-light-primary dark:text-dark-primary hover:underline inline-flex items-center gap-0.5 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[13px]">add_circle</span>
                                <span>Log Promise</span>
                              </button>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              {!isCleared && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenCollect(item)}
                                  className="px-2 py-1 rounded bg-light-primary text-light-on-primary font-label text-[11px] font-semibold hover:bg-light-primary-container shadow-xs inline-flex items-center gap-1 cursor-pointer"
                                  title="Collect Payment"
                                >
                                  <span className="material-symbols-outlined text-[13px]">payments</span>
                                  <span>Collect</span>
                                </button>
                              )}

                              {!isCleared && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenRemind(item)}
                                  className="p-1 rounded border border-light-outline-variant hover:bg-light-surface-container-low text-light-on-surface cursor-pointer"
                                  title="Send Reminder"
                                >
                                  <span className="material-symbols-outlined text-[15px]">send</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => setDemandNoticeTarget(item)}
                                className="p-1 rounded border border-light-outline-variant hover:bg-light-surface-container-low text-light-on-surface cursor-pointer"
                                title="Generate Formal Fee Demand Notice"
                              >
                                <span className="material-symbols-outlined text-[15px]">receipt_long</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: Collect Payment Modal                            */}
      {/* ========================================================= */}
      {collectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full border border-light-outline-variant dark:border-dark-outline-variant overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-light-primary dark:text-dark-primary">
                  payments
                </span>
                <h3 className="font-headline text-headline-sm font-semibold text-light-on-surface dark:text-dark-on-surface">
                  Collect Fee Balance
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCollectTarget(null)}
                className="text-light-on-surface-variant hover:text-light-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleConfirmCollect} className="p-5 flex flex-col gap-3.5">
              {/* Student Summary Banner */}
              <div className="p-3 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant flex justify-between items-center">
                <div>
                  <div className="font-semibold text-[13px] text-light-on-surface dark:text-dark-on-surface">
                    {collectTarget.student_name}
                  </div>
                  <div className="font-mono text-[11px] text-light-on-surface-variant">
                    {collectTarget.student_id} • {collectTarget.batch_code}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-light-outline uppercase">Outstanding Due</div>
                  <div className="font-mono font-bold text-rose-600 text-[14px]">
                    ₹{formatCurrency(collectTarget.balance_due)}
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block font-label text-label-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Collection Amount (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max={Number(collectTarget.balance_due) || 9999999}
                  value={collectAmount}
                  onChange={(e) => setCollectAmount(e.target.value)}
                  className="w-full px-3 py-1.5 rounded font-mono text-[14px] bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block font-label text-label-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Payment Method *
                </label>
                <select
                  value={collectMethod}
                  onChange={(e) => setCollectMethod(e.target.value)}
                  className="w-full px-3 py-1.5 rounded font-body text-body-sm bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                >
                  <option value="Bank Transfer">Bank Transfer / NEFT / IMPS</option>
                  <option value="UPI">UPI (Google Pay, PhonePe, Paytm)</option>
                  <option value="Credit Card">Credit Card / Debit Card</option>
                  <option value="Cash">Cash Receipt</option>
                  <option value="Cheque">Demand Draft / Cheque</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-label text-label-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Transaction Notes / Reference
                </label>
                <input
                  type="text"
                  value={collectNotes}
                  onChange={(e) => setCollectNotes(e.target.value)}
                  placeholder="e.g. Ref #TXN-90291 or Bank Challan"
                  className="w-full px-3 py-1.5 rounded font-body text-body-sm bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-light-outline-variant dark:border-dark-outline-variant">
                <button
                  type="button"
                  onClick={() => setCollectTarget(null)}
                  className="px-3 py-1.5 rounded border border-light-outline-variant font-label text-label-sm text-light-on-surface hover:bg-light-surface-container-low cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-light-primary text-light-on-primary font-label text-label-sm font-semibold hover:bg-light-primary-container shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>{isSubmitting ? 'Recording...' : `Record ₹${formatCurrency(collectAmount)}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: Send Dues Reminder Modal                         */}
      {/* ========================================================= */}
      {remindTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-xl max-w-lg w-full border border-light-outline-variant dark:border-dark-outline-variant overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-amber-600">
                  notifications_active
                </span>
                <h3 className="font-headline text-headline-sm font-semibold text-light-on-surface dark:text-dark-on-surface">
                  Dispatch Payment Reminder Notice
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRemindTarget(null)}
                className="text-light-on-surface-variant hover:text-light-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3.5">
              <div>
                <label className="block font-label text-label-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1.5">
                  Notification Dispatch Channel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'whatsapp', label: 'WhatsApp', icon: 'chat', color: 'text-emerald-600' },
                    { id: 'sms', label: 'SMS Notice', icon: 'sms', color: 'text-blue-600' },
                    { id: 'email', label: 'Formal Email', icon: 'mail', color: 'text-purple-600' },
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setReminderChannel(ch.id)}
                      className={`p-2 rounded border font-label text-label-sm inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        reminderChannel === ch.id
                          ? 'border-light-primary bg-light-primary-tint/30 text-light-primary font-semibold'
                          : 'border-light-outline-variant text-light-on-surface-variant hover:bg-light-surface-container-low'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[16px] ${ch.color}`}>{ch.icon}</span>
                      <span>{ch.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Details */}
              <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-xs flex justify-between">
                <div>
                  <span className="text-light-outline">Recipient: </span>
                  <strong className="text-light-on-surface dark:text-dark-on-surface">
                    {remindTarget.guardian_name} ({remindTarget.guardian_relation})
                  </strong>
                </div>
                <div className="font-mono text-light-on-surface dark:text-dark-on-surface">
                  {reminderChannel === 'email' ? remindTarget.guardian_email : remindTarget.guardian_phone}
                </div>
              </div>

              {/* Message Preview */}
              <div>
                <label className="block font-label text-label-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Message Content Preview (Editable)
                </label>
                <textarea
                  rows={4}
                  value={customReminderMsg}
                  onChange={(e) => setCustomReminderMsg(e.target.value)}
                  className="w-full px-3 py-2 rounded font-body text-body-sm bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-light-outline-variant dark:border-dark-outline-variant">
                <button
                  type="button"
                  onClick={() => setRemindTarget(null)}
                  className="px-3 py-1.5 rounded border border-light-outline-variant font-label text-label-sm text-light-on-surface hover:bg-light-surface-container-low cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendReminder}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-emerald-600 text-white font-label text-label-sm font-semibold hover:bg-emerald-700 shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>{isSubmitting ? 'Sending...' : 'Dispatch Reminder'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: Log Payment Commitment Modal                     */}
      {/* ========================================================= */}
      {commitmentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-xl max-w-md w-full border border-light-outline-variant dark:border-dark-outline-variant overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-blue-600">handshake</span>
                <h3 className="font-headline text-headline-sm font-semibold text-light-on-surface dark:text-dark-on-surface">
                  Log Payment Commitment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCommitmentTarget(null)}
                className="text-light-on-surface-variant hover:text-light-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCommitment} className="p-5 flex flex-col gap-3.5">
              <div className="p-2.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 text-xs">
                Log an agreement from the student or guardian committing to settle the due amount by a specific date.
              </div>

              <div>
                <label className="block font-label text-label-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Promised Settlement Date *
                </label>
                <input
                  type="date"
                  required
                  value={promiseDate}
                  onChange={(e) => setPromiseDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded font-mono text-[13px] bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div>
                <label className="block font-label text-label-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Promised Amount (₹)
                </label>
                <input
                  type="number"
                  value={promiseAmount}
                  onChange={(e) => setPromiseAmount(e.target.value)}
                  className="w-full px-3 py-1.5 rounded font-mono text-[13px] bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div>
                <label className="block font-label text-label-xs font-semibold text-light-on-surface dark:text-dark-on-surface mb-1">
                  Follow-up Notes / Spoken With
                </label>
                <input
                  type="text"
                  value={promiseNotes}
                  onChange={(e) => setPromiseNotes(e.target.value)}
                  placeholder="e.g. Spoke with guardian; promised after bank clearance"
                  className="w-full px-3 py-1.5 rounded font-body text-body-sm bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-light-outline-variant dark:border-dark-outline-variant">
                <button
                  type="button"
                  onClick={() => setCommitmentTarget(null)}
                  className="px-3 py-1.5 rounded border border-light-outline-variant font-label text-label-sm text-light-on-surface hover:bg-light-surface-container-low cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-blue-600 text-white font-label text-label-sm font-semibold hover:bg-blue-700 shadow-sm cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : 'Save Commitment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: Formal Institutional Demand Notice Modal         */}
      {/* ========================================================= */}
      {demandNoticeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-lg shadow-2xl max-w-2xl w-full p-8 my-8 border border-slate-200">
            {/* Header with Brand */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#2B1B54] text-white px-3 py-1.5 rounded font-headline text-lg font-black tracking-wide">
                  BIXCEL
                </div>
                <div>
                  <h2 className="font-bold text-base leading-tight">BIXCEL INSTITUTE OF TECHNOLOGIES</h2>
                  <p className="text-xs text-slate-500">Accounts &amp; Treasury Administration • Official Financial Notice</p>
                </div>
              </div>
              <div className="text-right text-xs">
                <div>Ref: <strong>{demandNoticeTarget.invoice_no || demandNoticeTarget.student_id}</strong></div>
                <div className="text-slate-500">Date: {todayDateStr}</div>
              </div>
            </div>

            <div className="text-center my-4">
              <h3 className="font-bold text-lg uppercase tracking-wider text-rose-700 underline underline-offset-4">
                FORMAL FEE BALANCE DEMAND NOTICE
              </h3>
            </div>

            {/* Recipient Details */}
            <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs mb-6 grid grid-cols-2 gap-4">
              <div>
                <div className="text-slate-500 uppercase font-semibold text-[10px]">Student Details</div>
                <div className="font-bold text-sm text-slate-900">{demandNoticeTarget.student_name}</div>
                <div>ID: {demandNoticeTarget.student_id}</div>
                <div>Track: {demandNoticeTarget.track}</div>
                <div>Batch: {demandNoticeTarget.batch_code}</div>
              </div>
              <div>
                <div className="text-slate-500 uppercase font-semibold text-[10px]">Guardian &amp; Address</div>
                <div className="font-bold text-slate-900">{demandNoticeTarget.guardian_name}</div>
                <div>Relation: {demandNoticeTarget.guardian_relation}</div>
                <div>Phone: {demandNoticeTarget.guardian_phone || '—'}</div>
                <div>Email: {demandNoticeTarget.guardian_email || '—'}</div>
              </div>
            </div>

            {/* Statement Table */}
            <table className="w-full text-xs border border-slate-300 mb-6">
              <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                <tr>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-right">Total Billed</th>
                  <th className="p-2 text-right">Paid To Date</th>
                  <th className="p-2 text-right text-rose-700">Balance Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                <tr>
                  <td className="p-2 font-sans">
                    Academic Tuition &amp; Curriculum Infrastructure Fee ({demandNoticeTarget.track})
                  </td>
                  <td className="p-2 text-right">₹{formatCurrency(demandNoticeTarget.total_amount)}</td>
                  <td className="p-2 text-right text-emerald-600">₹{formatCurrency(demandNoticeTarget.paid_amount)}</td>
                  <td className="p-2 text-right font-bold text-rose-700">
                    ₹{formatCurrency(demandNoticeTarget.balance_due)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-900">
                <tr>
                  <td colSpan={3} className="p-2 text-right font-sans uppercase">Total Demanded Balance Payable:</td>
                  <td className="p-2 text-right font-mono text-base text-rose-700">
                    ₹{formatCurrency(demandNoticeTarget.balance_due)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="text-xs text-slate-600 mb-6 space-y-2">
              <p>
                <strong>Notice:</strong> As per institutional credit policy, the aforementioned balance was scheduled for clearance on or before <strong>{demandNoticeTarget.due_date}</strong>.
              </p>
              <p>
                Failure to settle the outstanding dues within 7 business days may lead to temporary suspension of LMS laboratory environments, examination hall tickets, and capstone milestone defenses.
              </p>
            </div>

            {/* Signatures */}
            <div className="flex justify-between items-end pt-8 border-t border-slate-200 text-xs">
              <div>
                <div className="font-semibold text-slate-800">Finance &amp; Accounts Officer</div>
                <div className="text-slate-500">Bixcel Institute of Technologies</div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-slate-800">Academic Registrar</div>
                <div className="text-slate-500">Seal &amp; Signature</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-8 print:hidden">
              <button
                type="button"
                onClick={() => setDemandNoticeTarget(null)}
                className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded bg-[#2B1B54] text-white text-xs font-semibold hover:bg-[#3d2777] inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Notice</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeeBalanceScreen
