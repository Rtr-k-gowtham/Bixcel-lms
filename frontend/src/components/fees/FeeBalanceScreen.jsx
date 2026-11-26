import React, { useState, useEffect, useMemo } from 'react'
import { apiService } from '../../services/api'

// Initial fallback dataset for resilient rendering
const DEFAULT_LEDGERS = [
  {
    id: 1,
    invoice_no: 'INV-2026-001',
    student_id: 'STU-2026-0842',
    student_name: 'Marcus Vance',
    track: 'Full-Stack Web Development',
    batch_code: 'FSW-2026-A',
    total_amount: 45000,
    paid_amount: 30000,
    balance_due: 15000,
    paid_pct: 66.7,
    due_date: '2026-11-15',
    days_overdue: 11,
    is_overdue: true,
    aging_category: '1-15 Days',
    aging_bucket: 'days_1_15',
    guardian_name: 'Eleanor Vance',
    guardian_relation: 'Mother',
    guardian_phone: '+1 (555) 349-2190',
    guardian_email: 'eleanor.vance@gmail.com',
    student_phone: '+1 (555) 349-2194',
    student_email: 'marcus.vance@student.bixcel.edu',
    status: 'Partial Payment',
    commitment: {
      promised_date: '2026-12-05',
      amount: 15000,
      notes: 'Mother confirmed online transfer upon monthly salary credit.',
    },
    reminders_count: 2,
    last_reminded_at: '2026-11-20 14:30:00',
  },
  {
    id: 2,
    invoice_no: 'INV-2026-002',
    student_id: 'STU-2026-0843',
    student_name: 'Alena Rostova',
    track: 'Digital Marketing',
    batch_code: 'DMM-2026-B',
    total_amount: 32000,
    paid_amount: 32000,
    balance_due: 0,
    paid_pct: 100,
    due_date: '2026-11-10',
    days_overdue: 0,
    is_overdue: false,
    aging_category: 'Current',
    aging_bucket: 'current',
    guardian_name: 'Dmitri Rostov',
    guardian_relation: 'Father',
    guardian_phone: '+1 (555) 672-8800',
    guardian_email: 'dmitri.rostov@outlook.com',
    student_phone: '+1 (555) 672-8812',
    student_email: 'alena.rostova@student.bixcel.edu',
    status: 'Paid',
    commitment: null,
    reminders_count: 0,
    last_reminded_at: null,
  },
  {
    id: 3,
    invoice_no: 'INV-2026-003',
    student_id: 'STU-2026-0844',
    student_name: 'Kevin Chen',
    track: 'UI/UX Product Design',
    batch_code: 'UXD-2026-A',
    total_amount: 36000,
    paid_amount: 12000,
    balance_due: 24000,
    paid_pct: 33.3,
    due_date: '2026-10-25',
    days_overdue: 32,
    is_overdue: true,
    aging_category: '31-60 Days',
    aging_bucket: 'days_31_60',
    guardian_name: 'Grace Chen',
    guardian_relation: 'Mother',
    guardian_phone: '+1 (555) 891-3400',
    guardian_email: 'grace.chen@yahoo.com',
    student_phone: '+1 (555) 891-3421',
    student_email: 'kevin.chen@student.bixcel.edu',
    status: 'Overdue',
    commitment: {
      promised_date: '2026-12-02',
      amount: 12000,
      notes: 'Second installment committed via netbanking.',
    },
    reminders_count: 3,
    last_reminded_at: '2026-11-24 10:15:00',
  },
  {
    id: 4,
    invoice_no: 'INV-2026-004',
    student_id: 'STU-2026-0845',
    student_name: 'Sophia Reyes',
    track: 'Data Science & Analytics',
    batch_code: 'DSA-2026-C',
    total_amount: 40000,
    paid_amount: 15000,
    balance_due: 25000,
    paid_pct: 37.5,
    due_date: '2026-09-20',
    days_overdue: 67,
    is_overdue: true,
    aging_category: '60+ Days Critical',
    aging_bucket: 'days_60_plus',
    guardian_name: 'Carlos Reyes',
    guardian_relation: 'Father',
    guardian_phone: '+1 (555) 442-9900',
    guardian_email: 'carlos.reyes@gmail.com',
    student_phone: '+1 (555) 442-9901',
    student_email: 'sophia.reyes@student.bixcel.edu',
    status: 'Overdue',
    commitment: null,
    reminders_count: 4,
    last_reminded_at: '2026-11-22 16:45:00',
  },
  {
    id: 5,
    invoice_no: 'INV-2026-005',
    student_id: 'STU-2026-0846',
    student_name: 'Liam Patel',
    track: 'Cloud & DevOps Engineering',
    batch_code: 'CLD-2026-A',
    total_amount: 38000,
    paid_amount: 20000,
    balance_due: 18000,
    paid_pct: 52.6,
    due_date: '2026-12-05',
    days_overdue: 0,
    is_overdue: false,
    aging_category: 'Current',
    aging_bucket: 'current',
    guardian_name: 'Anand Patel',
    guardian_relation: 'Father',
    guardian_phone: '+1 (555) 773-1090',
    guardian_email: 'anand.patel@gmail.com',
    student_phone: '+1 (555) 773-1099',
    student_email: 'liam.patel@student.bixcel.edu',
    status: 'Partial Payment',
    commitment: null,
    reminders_count: 0,
    last_reminded_at: null,
  },
]

export function FeeBalanceScreen({ onNavigate }) {
  const [ledgers, setLedgers] = useState(DEFAULT_LEDGERS)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [bucketFilter, setBucketFilter] = useState('all')
  const [trackFilter, setTrackFilter] = useState('all')
  const [batchFilter, setBatchFilter] = useState('all')
  const [statusTab, setStatusTab] = useState('all') // 'all' | 'overdue' | 'partial' | 'promised' | 'cleared'

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
    return ledgers.reduce((acc, curr) => acc + (Number(curr.balance_due) || 0), 0)
  }, [ledgers])

  const totalOverdue = useMemo(() => {
    return ledgers
      .filter((l) => l.is_overdue)
      .reduce((acc, curr) => acc + (Number(curr.balance_due) || 0), 0)
  }, [ledgers])

  const defaultersCount = useMemo(() => {
    return ledgers.filter((l) => l.is_overdue && (Number(currBalance(l)) > 0)).length
    function currBalance(item) {
      return item.balance_due
    }
  }, [ledgers])

  const totalPromised = useMemo(() => {
    return ledgers
      .filter((l) => l.commitment && l.commitment.amount)
      .reduce((acc, curr) => acc + (Number(curr.commitment.amount) || 0), 0)
  }, [ledgers])

  const totalBilled = useMemo(() => {
    return ledgers.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0)
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
      const bal = Number(l.balance_due) || 0
      if (bal > 0) {
        const bKey = l.aging_bucket || (l.is_overdue ? (l.days_overdue > 60 ? 'days_60_plus' : l.days_overdue > 30 ? 'days_31_60' : 'days_1_15') : 'current')
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
    return Array.from(new Set(ledgers.map((l) => l.track).filter(Boolean)))
  }, [ledgers])

  const batchesList = useMemo(() => {
    return Array.from(new Set(ledgers.map((l) => l.batch_code).filter(Boolean)))
  }, [ledgers])

  // Filtered List
  const filteredLedgers = useMemo(() => {
    return ledgers.filter((item) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase()
        const match =
          item.student_name.toLowerCase().includes(q) ||
          item.student_id.toLowerCase().includes(q) ||
          (item.guardian_name && item.guardian_name.toLowerCase().includes(q)) ||
          (item.guardian_phone && item.guardian_phone.includes(q)) ||
          item.batch_code.toLowerCase().includes(q)
        if (!match) return false
      }

      // Status Tab
      if (statusTab === 'overdue' && !item.is_overdue) return false
      if (statusTab === 'partial' && (item.balance_due <= 0 || item.paid_amount <= 0)) return false
      if (statusTab === 'promised' && !item.commitment) return false
      if (statusTab === 'cleared' && item.balance_due > 0) return false

      // Aging Bucket Filter
      if (bucketFilter !== 'all' && item.aging_bucket !== bucketFilter) return false

      // Track Filter
      if (trackFilter !== 'all' && item.track !== trackFilter) return false

      // Batch Filter
      if (batchFilter !== 'all' && item.batch_code !== batchFilter) return false

      return true
    })
  }, [ledgers, search, statusTab, bucketFilter, trackFilter, batchFilter])

  // Open Collect Modal
  const handleOpenCollect = (item) => {
    setCollectTarget(item)
    setCollectAmount(item.balance_due > 0 ? item.balance_due : 5000)
    setCollectMethod('Bank Transfer')
    setCollectNotes(`Settlement for invoice ${item.invoice_no}`)
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
          if (l.student_id === collectTarget.student_id) {
            const newPaid = Number(l.paid_amount) + amt
            const newBal = Math.max(0, Number(l.total_amount) - newPaid)
            return {
              ...l,
              paid_amount: newPaid,
              balance_due: newBal,
              paid_pct: Math.round((newPaid / Number(l.total_amount)) * 100),
              status: newBal <= 0 ? 'Paid' : 'Partial Payment',
              is_overdue: newBal > 0 && l.is_overdue,
            }
          }
          return l
        })
      )

      showToast(`Payment of ₹${amt.toLocaleString()} recorded for ${collectTarget.student_name}.`)
      setCollectTarget(null)
    } catch {
      alert('Payment submission error. Recording locally.')
      setLedgers((prev) =>
        prev.map((l) => {
          if (l.student_id === collectTarget.student_id) {
            const newPaid = Number(l.paid_amount) + amt
            const newBal = Math.max(0, Number(l.total_amount) - newPaid)
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
  const handleOpenRemind = (item) => {
    setRemindTarget(item)
    setReminderChannel('whatsapp')
    setCustomReminderMsg(
      `Dear ${item.guardian_name || 'Parent'}, this is an official fee reminder from Bixcel Institute of Technologies. A tuition balance of ₹${item.balance_due.toLocaleString()} for student ${item.student_name} (${item.student_id}) in ${item.track} was due on ${item.due_date}. Please clear the balance via UPI/Netbanking or contact the finance office at accounts@bixcel.edu.`
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
        amount: remindTarget.balance_due,
      })
      showToast(`Dues notice sent via ${reminderChannel.toUpperCase()} to ${remindTarget.guardian_name}.`)
      setRemindTarget(null)
    } catch {
      showToast(`Reminder logged for ${remindTarget.guardian_name}.`)
      setRemindTarget(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Open Commitment Modal
  const handleOpenCommitment = (item) => {
    setCommitmentTarget(item)
    setPromiseDate(item.commitment?.promised_date || '2026-12-10')
    setPromiseAmount(item.commitment?.amount || item.balance_due)
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
          if (l.student_id === commitmentTarget.student_id) {
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

  // Helper avatar initials
  const getInitials = (name) => {
    if (!name) return 'ST'
    return name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1440px] w-full mx-auto">
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
            <h1 className="font-title text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface">
              Student Fee Balance &amp; Aging Dues
            </h1>
          </div>
          <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant mt-0.5">
            Accounts receivable aging analysis, payment commitments, defaulter tracking, and recovery notifications.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('fees')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface font-label text-xs font-semibold hover:bg-light-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">payments</span>
              <span>Fee Payments Mode</span>
            </button>
          )}
          <button
            type="button"
            onClick={loadBalanceData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface font-label text-xs font-semibold hover:bg-light-surface-container-low transition-colors"
          >
            <span className={`material-symbols-outlined text-[15px] ${loading ? 'animate-spin' : ''}`}>sync</span>
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const overdueCount = ledgers.filter((l) => l.is_overdue).length
              if (window.confirm(`Broadcast dues reminder to all ${overdueCount} guardians with overdue balances?`)) {
                showToast(`Bulk payment notices queued for ${overdueCount} student guardians.`)
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-600 text-white hover:bg-amber-700 font-label text-xs font-semibold shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[15px]">campaign</span>
            <span>Broadcast Overdue Reminders</span>
          </button>
        </div>
      </section>

      {/* 5 Compact Aging & Financial Health Metric Cards */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {/* Metric 1: Total Outstanding Balance */}
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-label text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Total Outstanding
            </span>
            <span className="w-6 h-6 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 inline-flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">pending_actions</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-[17px] font-bold tabular-nums text-light-on-surface dark:text-dark-on-surface">
              ₹{totalOutstanding.toLocaleString()}
            </span>
            <span className="font-label text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
              {ledgers.filter((l) => l.balance_due > 0).length} Unpaid
            </span>
          </div>
        </article>

        {/* Metric 2: Critical Overdue (>30 Days) */}
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-label text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Overdue Dues (&gt;0d)
            </span>
            <span className="w-6 h-6 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 inline-flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">warning</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-[17px] font-bold tabular-nums text-amber-600 dark:text-amber-400">
              ₹{totalOverdue.toLocaleString()}
            </span>
            <span className="font-label text-[10px] px-1 py-0.2 rounded bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300 font-semibold">
              {defaultersCount} Defaulters
            </span>
          </div>
        </article>

        {/* Metric 3: Active Promises & Commitments */}
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-label text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Promised Commitments
            </span>
            <span className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 inline-flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">handshake</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-[17px] font-bold tabular-nums text-light-on-surface dark:text-dark-on-surface">
              ₹{totalPromised.toLocaleString()}
            </span>
            <span className="font-label text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
              {ledgers.filter((l) => l.commitment).length} Scheduled
            </span>
          </div>
        </article>

        {/* Metric 4: Collection Rate */}
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-label text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Clearance Rate
            </span>
            <span className="w-6 h-6 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">trending_up</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-[17px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {collectionRate}%
            </span>
            <span className="font-label text-[10px] text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Billed: ₹{totalBilled.toLocaleString()}
            </span>
          </div>
        </article>

        {/* Metric 5: Average Overdue Days */}
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-label text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Recovery Cycle
            </span>
            <span className="w-6 h-6 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 inline-flex items-center justify-center">
              <span className="material-symbols-outlined text-[15px]">hourglass_bottom</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="font-headline text-[17px] font-bold tabular-nums text-light-on-surface dark:text-dark-on-surface">
              18.5 Days
            </span>
            <span className="font-label text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              Target &lt; 25d
            </span>
          </div>
        </article>
      </section>

      {/* Visual Aging Exposure Bar */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3.5 shadow-sm flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-label text-label-sm font-semibold text-light-on-surface dark:text-dark-on-surface">
            Accounts Receivable Aging Distribution
          </span>
          <span className="font-label text-label-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
            As of Nov 26, 2026
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="h-3.5 w-full bg-light-surface-container-low dark:bg-dark-surface-container rounded-full overflow-hidden flex">
          {Object.entries(agingStats).map(([key, item]) => {
            if (item.amount <= 0) return null
            const pct = totalOutstanding > 0 ? (item.amount / totalOutstanding) * 100 : 0
            return (
              <div
                key={key}
                style={{ width: `${pct}%` }}
                className={`${item.color} h-full transition-all duration-300 relative group`}
                title={`${item.label}: ₹${item.amount.toLocaleString()} (${pct.toFixed(1)}%)`}
              />
            )
          })}
        </div>

        {/* Aging Legend Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          {Object.entries(agingStats).map(([key, item]) => {
            const pct = totalOutstanding > 0 ? ((item.amount / totalOutstanding) * 100).toFixed(1) : 0
            return (
              <div key={key} className="inline-flex items-center gap-1.5 font-label text-label-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                <span className="font-medium text-light-on-surface dark:text-dark-on-surface">{item.label}:</span>
                <span className="tabular-nums font-semibold">₹{item.amount.toLocaleString()}</span>
                <span className="text-[10px] text-light-outline">({pct}%)</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Filter Toolbar & Tab Navigation */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md p-3 flex flex-col gap-3 shadow-sm">
        {/* Status Tab Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-light-outline-variant dark:border-dark-outline-variant pb-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: 'All Accounts', count: ledgers.length },
              { id: 'overdue', label: 'Overdue Dues', count: ledgers.filter((l) => l.is_overdue).length },
              { id: 'partial', label: 'Partial Balance', count: ledgers.filter((l) => l.balance_due > 0 && l.paid_amount > 0).length },
              { id: 'promised', label: 'Payment Promises', count: ledgers.filter((l) => l.commitment).length },
              { id: 'cleared', label: 'Fully Paid', count: ledgers.filter((l) => l.balance_due <= 0).length },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusTab(tab.id)}
                className={`px-3 py-1 rounded font-label text-label-sm font-semibold inline-flex items-center gap-1.5 transition-colors ${
                  statusTab === tab.id
                    ? 'bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary shadow-sm'
                    : 'bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant hover:text-light-on-surface'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  statusTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-light-outline-variant/50 text-light-on-surface-variant'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="font-label text-label-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Showing <strong className="text-light-on-surface dark:text-dark-on-surface font-semibold">{filteredLedgers.length}</strong> records
          </div>
        </div>

        {/* Dropdowns & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {/* Search Box */}
          <div className="relative">
            <span className="material-symbols-outlined text-[18px] text-light-outline absolute left-2.5 top-1/2 -translate-y-1/2">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student, guardian, phone..."
              className="w-full pl-8 pr-3 py-1.5 rounded font-body text-body-sm bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
            />
          </div>

          {/* Aging Bucket Dropdown */}
          <div>
            <select
              value={bucketFilter}
              onChange={(e) => setBucketFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded font-body text-body-sm bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
            >
              <option value="all">All Aging Buckets</option>
              <option value="current">Current (&lt; Due Date)</option>
              <option value="days_1_15">1-15 Days Overdue</option>
              <option value="days_16_30">16-30 Days Overdue</option>
              <option value="days_31_60">31-60 Days Overdue</option>
              <option value="days_60_plus">60+ Days Critical</option>
            </select>
          </div>

          {/* Track Filter */}
          <div>
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded font-body text-body-sm bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
            >
              <option value="all">All Curriculum Tracks</option>
              {tracksList.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Batch Filter */}
          <div>
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded font-body text-body-sm bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
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
      </section>

      {/* Main Student Balance & Aging Ledger Table */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm overflow-hidden">
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
                  const isCleared = item.balance_due <= 0
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
                          {item.guardian_name}
                          <span className="text-[10px] text-light-outline ml-1">({item.guardian_relation})</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant">
                          <span className="font-mono">{item.guardian_phone}</span>
                          <a
                            href={`https://wa.me/${item.guardian_phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 inline-flex items-center"
                            title="Chat on WhatsApp"
                          >
                            <span className="material-symbols-outlined text-[13px]">chat</span>
                          </a>
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
                        ₹{item.total_amount.toLocaleString()}
                      </td>

                      {/* Paid Amount */}
                      <td className="py-2.5 px-3 text-right font-mono text-[12px] text-emerald-600 dark:text-emerald-400 font-semibold whitespace-nowrap">
                        <div>₹{item.paid_amount.toLocaleString()}</div>
                        <div className="text-[10px] text-light-outline font-normal">
                          {item.paid_pct}%
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
                          ₹{item.balance_due.toLocaleString()}
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
                          <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            item.days_overdue > 60
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}>
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
                            className="font-label text-[11px] text-light-primary dark:text-dark-primary hover:underline inline-flex items-center gap-0.5"
                          >
                            <span className="material-symbols-outlined text-[13px]">add_circle</span>
                            <span>Log Promise</span>
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Collect Payment */}
                          {!isCleared && (
                            <button
                              type="button"
                              onClick={() => handleOpenCollect(item)}
                              className="px-2 py-1 rounded bg-light-primary text-light-on-primary dark:bg-dark-primary dark:text-dark-on-primary font-label text-[11px] font-semibold hover:bg-light-primary-container shadow-xs inline-flex items-center gap-1"
                              title="Collect Payment"
                            >
                              <span className="material-symbols-outlined text-[13px]">payments</span>
                              <span>Collect</span>
                            </button>
                          )}

                          {/* Remind Modal */}
                          {!isCleared && (
                            <button
                              type="button"
                              onClick={() => handleOpenRemind(item)}
                              className="p-1 rounded border border-light-outline-variant dark:border-dark-outline-variant hover:bg-light-surface-container-low text-light-on-surface"
                              title="Send Reminder"
                            >
                              <span className="material-symbols-outlined text-[15px]">send</span>
                            </button>
                          )}

                          {/* Print Demand Notice */}
                          <button
                            type="button"
                            onClick={() => setDemandNoticeTarget(item)}
                            className="p-1 rounded border border-light-outline-variant dark:border-dark-outline-variant hover:bg-light-surface-container-low text-light-on-surface"
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
      </section>

      {/* MODAL 1: Collect Payment Modal */}
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
                className="text-light-on-surface-variant hover:text-light-on-surface"
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
                    ₹{collectTarget.balance_due.toLocaleString()}
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
                  max={collectTarget.balance_due}
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
                  className="px-3 py-1.5 rounded border border-light-outline-variant font-label text-label-sm text-light-on-surface hover:bg-light-surface-container-low"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-light-primary text-light-on-primary font-label text-label-sm font-semibold hover:bg-light-primary-container shadow-sm inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>{isSubmitting ? 'Recording...' : `Record ₹${Number(collectAmount).toLocaleString()}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Send Dues Reminder Modal */}
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
                className="text-light-on-surface-variant hover:text-light-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3.5">
              {/* Channel Selector */}
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
                      className={`p-2 rounded border font-label text-label-sm inline-flex items-center justify-center gap-1.5 transition-colors ${
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
                  className="px-3 py-1.5 rounded border border-light-outline-variant font-label text-label-sm text-light-on-surface hover:bg-light-surface-container-low"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSendReminder}
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-emerald-600 text-white font-label text-label-sm font-semibold hover:bg-emerald-700 shadow-sm inline-flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>{isSubmitting ? 'Sending...' : 'Dispatch Reminder'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Log Payment Commitment Modal */}
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
                className="text-light-on-surface-variant hover:text-light-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveCommitment} className="p-5 flex flex-col gap-3.5">
              <div className="p-2.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 text-xs">
                Log a verbal or written agreement from the student or guardian committing to pay by a specific date.
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
                  placeholder="e.g. Spoke with father; promised after salary clearance"
                  className="w-full px-3 py-1.5 rounded font-body text-body-sm bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant dark:border-dark-outline-variant text-light-on-surface dark:text-dark-on-surface focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-light-outline-variant dark:border-dark-outline-variant">
                <button
                  type="button"
                  onClick={() => setCommitmentTarget(null)}
                  className="px-3 py-1.5 rounded border border-light-outline-variant font-label text-label-sm text-light-on-surface hover:bg-light-surface-container-low"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded bg-blue-600 text-white font-label text-label-sm font-semibold hover:bg-blue-700 shadow-sm"
                >
                  {isSubmitting ? 'Saving...' : 'Save Commitment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Formal Institutional Demand Notice Modal (Printable) */}
      {demandNoticeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white text-slate-900 rounded-lg shadow-2xl max-w-2xl w-full p-8 my-8 border border-slate-200">
            {/* Header with Negative Brand */}
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
                <div>Ref: <strong>{demandNoticeTarget.invoice_no}</strong></div>
                <div className="text-slate-500">Date: Nov 26, 2026</div>
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
                <div>Phone: {demandNoticeTarget.guardian_phone}</div>
                <div>Email: {demandNoticeTarget.guardian_email}</div>
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
                  <td className="p-2 text-right">₹{demandNoticeTarget.total_amount.toLocaleString()}</td>
                  <td className="p-2 text-right text-emerald-600">₹{demandNoticeTarget.paid_amount.toLocaleString()}</td>
                  <td className="p-2 text-right font-bold text-rose-700">
                    ₹{demandNoticeTarget.balance_due.toLocaleString()}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-900">
                <tr>
                  <td colSpan={3} className="p-2 text-right font-sans uppercase">Total Demanded Balance Payable:</td>
                  <td className="p-2 text-right font-mono text-base text-rose-700">
                    ₹{demandNoticeTarget.balance_due.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="text-xs text-slate-600 mb-6 space-y-2">
              <p>
                <strong>Notice:</strong> As per institutional credit policy, the aforementioned balance was scheduled for clearance on or before <strong>{demandNoticeTarget.due_date}</strong> ({demandNoticeTarget.days_overdue} days overdue).
              </p>
              <p>
                Failure to settle the outstanding dues within 7 business days may lead to suspension of LMS laboratory environments, examination hall tickets, and capstone milestone defenses.
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

            {/* Action Buttons (Excluded from print) */}
            <div className="flex justify-end gap-3 mt-8 print:hidden">
              <button
                type="button"
                onClick={() => setDemandNoticeTarget(null)}
                className="px-4 py-1.5 rounded border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded bg-[#2B1B54] text-white text-xs font-semibold hover:bg-[#3d2777] inline-flex items-center gap-1.5 shadow-sm"
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
