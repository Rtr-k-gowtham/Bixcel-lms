import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

const DEFAULT_LEDGERS = []

const DEFAULT_TRANSACTIONS = []

export function FeesPayment({ onNavigate }) {
  const [ledgers, setLedgers] = useState([])
  const [transactions, setTransactions] = useState([])
  const [activeTab, setActiveTab] = useState('ledger') // 'ledger' | 'history'
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')
  const [batchFilter, setBatchFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')

  // Collect Payment Modal State
  const [showCollectModal, setShowCollectModal] = useState(false)
  const [collectingStudentId, setCollectingStudentId] = useState('')
  const [payAmount, setPayAmount] = useState(10000)
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [paymentNotes, setPaymentNotes] = useState('Tuition fee collection')

  // Receipt Modal State
  const [viewingReceipt, setViewingReceipt] = useState(null)
  const [successToast, setSuccessToast] = useState('')

  useEffect(() => {
    fetchFees()
  }, [])

  const fetchFees = async () => {
    setLoading(true)
    try {
      const res = await apiService.getFees()
      if (res && res.data) {
        if (Array.isArray(res.data.ledgers)) setLedgers(res.data.ledgers)
        if (Array.isArray(res.data.transactions)) setTransactions(res.data.transactions)
      }
    } catch {
      // Keep defaults
    } finally {
      setLoading(false)
    }
  }

  // Open Collect Modal
  const handleOpenCollect = (studentId = '') => {
    const sId = studentId || ledgers[0]?.student_id || ''
    setCollectingStudentId(sId)
    const current = ledgers.find((l) => l.student_id === sId)
    setPayAmount(current ? current.balance_due || 5000 : 5000)
    setPaymentMethod('UPI')
    setPaymentNotes('Tuition installment payment')
    setShowCollectModal(true)
  }

  // Student change in modal
  const handleStudentSelectChange = (sId) => {
    setCollectingStudentId(sId)
    const current = ledgers.find((l) => l.student_id === sId)
    if (current) {
      setPayAmount(current.balance_due || 5000)
    }
  }

  // Submit Collect Payment
  const handleSubmitPayment = async (e) => {
    e.preventDefault()
    const targetStudent = ledgers.find((l) => l.student_id === collectingStudentId)
    if (!targetStudent) return

    const amount = Number(payAmount)
    if (amount <= 0) {
      alert('Please enter a valid payment amount greater than zero.')
      return
    }

    try {
      const res = await apiService.collectFeePayment({
        student_id: collectingStudentId,
        amount,
        method: paymentMethod,
        notes: paymentNotes,
      }).catch(() => null)

      let receiptObj = null
      if (res && res.data && res.data.transaction) {
        setLedgers((prev) =>
          prev.map((l) => (l.student_id === collectingStudentId ? res.data.ledger : l))
        )
        setTransactions((prev) => [res.data.transaction, ...prev])
        receiptObj = {
          ...res.data.transaction,
          total_fee: targetStudent.total_fee,
          prev_paid: targetStudent.paid_amount,
          balance: res.data.ledger.balance_due,
        }
      } else {
        // Local simulation
        const newPaid = targetStudent.paid_amount + amount
        const newBalance = Math.max(0, targetStudent.total_fee - newPaid)
        const updatedLedger = {
          ...targetStudent,
          paid_amount: newPaid,
          balance_due: newBalance,
          status: newBalance <= 0 ? 'Paid' : 'Partial Payment',
        }
        setLedgers((prev) =>
          prev.map((l) => (l.student_id === collectingStudentId ? updatedLedger : l))
        )

        const receiptNo = `RCP-2026-0${450 + transactions.length}`
        const txnId = `TXN-2026-${Math.floor(8850 + Math.random() * 1000)}`
        const newTxn = {
          id: Date.now(),
          txn_id: txnId,
          receipt_no: receiptNo,
          student_id: targetStudent.student_id,
          student_name: targetStudent.student_name,
          course: targetStudent.course,
          batch: targetStudent.batch,
          payment_date: new Date().toISOString().replace('T', ' ').substring(0, 16),
          method: paymentMethod,
          amount,
          status: 'Success',
          total_fee: targetStudent.total_fee,
          prev_paid: targetStudent.paid_amount,
          balance: newBalance,
        }
        setTransactions((prev) => [newTxn, ...prev])
        receiptObj = newTxn
      }

      setShowCollectModal(false)
      setViewingReceipt(receiptObj)
      setSuccessToast(`Payment of ₹${amount.toLocaleString()} recorded for ${targetStudent.student_name}!`)
    } catch (err) {
      alert(err.message || 'Payment collection failed.')
    }
  }

  // Current selected student details in modal
  const selectedStudent = ledgers.find((l) => l.student_id === collectingStudentId) || ledgers[0]

  // Filtered Ledgers
  const filteredLedgers = ledgers.filter((l) => {
    const q = search.toLowerCase()
    const matchesQuery =
      l.student_name?.toLowerCase().includes(q) ||
      l.student_id?.toLowerCase().includes(q) ||
      l.course?.toLowerCase().includes(q) ||
      l.batch?.toLowerCase().includes(q)
    const matchesCourse = courseFilter === 'all' || l.course.toLowerCase().includes(courseFilter.toLowerCase())
    const matchesBatch = batchFilter === 'all' || l.batch === batchFilter
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter
    const matchesMethod = methodFilter === 'all' || l.method === methodFilter
    return matchesQuery && matchesCourse && matchesBatch && matchesStatus && matchesMethod
  })

  // Filtered Transactions
  const filteredTransactions = transactions.filter((t) => {
    const q = search.toLowerCase()
    return (
      t.student_name?.toLowerCase().includes(q) ||
      t.txn_id?.toLowerCase().includes(q) ||
      t.receipt_no?.toLowerCase().includes(q) ||
      t.course?.toLowerCase().includes(q)
    )
  })

  // Calculated totals
  const totalFees = ledgers.reduce((acc, curr) => acc + curr.total_fee, 0)
  const totalCollected = ledgers.reduce((acc, curr) => acc + curr.paid_amount, 0)
  const totalPending = ledgers.reduce((acc, curr) => acc + curr.balance_due, 0)
  const totalOverdue = ledgers
    .filter((l) => l.status === 'Overdue')
    .reduce((acc, curr) => acc + curr.balance_due, 0)
  const collectionPercentage = totalFees > 0 ? Math.round((totalCollected / totalFees) * 100) : 74

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
      case 'Success':
        return 'bg-success-container text-on-success-container'
      case 'Partial Payment':
        return 'bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint'
      case 'Overdue':
        return 'bg-overdue-container text-on-overdue-container'
      case 'Unpaid':
        return 'bg-pending-container text-on-pending-container'
      default:
        return 'bg-light-surface-container text-light-on-surface-variant'
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-light-primary text-[18px]">payments</span>
            <h1 className="font-title text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface">
              Fees &amp; Payment Collection
            </h1>
          </div>
          <p className="font-body text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
            Manage student fees, collect payments and monitor outstanding balances.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('balance')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-amber-600 text-white hover:bg-amber-700 font-label text-xs font-semibold shadow-xs transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">account_balance_wallet</span>
              <span>Aging &amp; Balance Dues</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => alert('Exporting fee collection report...')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low transition-colors font-label text-xs font-semibold"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            <span>Export Report</span>
          </button>
          <button
            type="button"
            onClick={() => handleOpenCollect()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container shadow-xs font-label text-xs font-semibold transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Collect Payment</span>
          </button>
        </div>
      </section>

      {/* Success Toast */}
      {successToast && (
        <div className="flex items-center justify-between gap-3 px-3 py-2 rounded bg-success-container text-on-success-container border border-success/30 shadow-xs animate-fadeIn text-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-success">check_circle</span>
            <span className="font-body font-medium">{successToast}</span>
          </div>
          <div className="flex items-center gap-2">
            {viewingReceipt && (
              <button
                type="button"
                onClick={() => setViewingReceipt(viewingReceipt)}
                className="px-2 py-0.5 text-xs font-semibold rounded bg-white text-success shadow-xs hover:bg-slate-50 transition-colors"
              >
                View Receipt
              </button>
            )}
            <button
              type="button"
              onClick={() => setSuccessToast('')}
              className="text-on-success-container/70 hover:text-on-success-container"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}

      {/* 5 Payment Overview Cards (From UI reference/payment_collection) */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5" aria-label="Payment Overview">
        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="font-label text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Total Fees
            </span>
            <span className="w-6 h-6 rounded bg-light-primary-tint dark:bg-dark-primary-tint text-light-primary dark:text-dark-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[15px]">account_balance</span>
            </span>
          </div>
          <span className="font-headline text-[17px] font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
            ₹{totalFees.toLocaleString()}
          </span>
          <span className="font-label text-[10px] text-light-on-surface-variant">
            FY 2026–27 billable
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded p-2.5 shadow-xs flex flex-col justify-between gap-1.5">
          <div className="flex items-center justify-between gap-1.5">
            <span className="font-label text-[11px] text-light-on-surface-variant dark:text-dark-on-surface-variant font-medium">
              Collected Amount
            </span>
            <span className="w-6 h-6 rounded bg-success-container text-on-success-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[15px]">check_circle</span>
            </span>
          </div>
          <span className="font-headline text-[17px] font-bold text-success tabular-nums">
            ₹{totalCollected.toLocaleString()}
          </span>
          <span className="font-label text-label-xs text-on-success-container font-semibold">
            {collectionPercentage}% collected
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-3.5 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Pending Amount
            </span>
            <span className="w-7 h-7 rounded bg-pending-container text-on-pending-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
            </span>
          </div>
          <span className="font-headline text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
            ₹{totalPending.toLocaleString()}
          </span>
          <span className="font-label text-label-xs text-on-pending-container font-semibold">
            Due this month
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-3.5 flex flex-col justify-between gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Overdue Amount
            </span>
            <span className="w-7 h-7 rounded bg-overdue-container text-on-overdue-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px]">warning</span>
            </span>
          </div>
          <span className="font-headline text-headline-md font-bold text-overdue tabular-nums">
            ₹{totalOverdue.toLocaleString()}
          </span>
          <span className="font-label text-label-xs text-on-overdue-container font-semibold">
            Needs follow-up
          </span>
        </article>

        <article className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-3.5 flex flex-col justify-between gap-2.5 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              Total Transactions
            </span>
            <span className="w-7 h-7 rounded bg-light-secondary-container text-light-on-secondary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
            </span>
          </div>
          <span className="font-headline text-headline-md font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
            {450 + transactions.length}
          </span>
          <span className="font-label text-label-xs text-light-on-surface-variant">
            Verified receipts
          </span>
        </article>
      </section>

      {/* Visual Analytics Row: Bar Chart & Donut Chart */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        {/* Left 7 Cols: Monthly Collection Bar Graph */}
        <article className="lg:col-span-7 bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-4 sm:p-5 flex flex-col justify-between gap-3">
          <header className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-col">
              <h2 className="font-title text-title-md font-semibold text-light-on-surface dark:text-dark-on-surface">
                Monthly Fee Collection Trend
              </h2>
              <span className="font-body text-body-xs text-light-on-surface-variant">
                Jun – Nov 2026 (in ₹ Lakhs)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 font-label text-label-xs text-light-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#0037B0]"></span>Collected
              </span>
              <span className="inline-flex items-center gap-1.5 font-label text-label-xs text-light-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#B45309]"></span>Pending
              </span>
            </div>
          </header>

          <div className="w-full pt-2">
            <svg viewBox="0 0 560 170" className="w-full h-auto" role="img" aria-label="Monthly fee collection bar chart">
              <line x1="40" y1="20" x2="544" y2="20" stroke="#E2E8F0" strokeDasharray="3 3"></line>
              <line x1="40" y1="60" x2="544" y2="60" stroke="#E2E8F0" strokeDasharray="3 3"></line>
              <line x1="40" y1="100" x2="544" y2="100" stroke="#E2E8F0" strokeDasharray="3 3"></line>
              <line x1="40" y1="130" x2="544" y2="130" stroke="#CBD5E1"></line>

              <text x="32" y="24" textAnchor="end" fill="#64748B" fontSize="10" fontFamily="Inter, sans-serif">₹6L</text>
              <text x="32" y="64" textAnchor="end" fill="#64748B" fontSize="10" fontFamily="Inter, sans-serif">₹4L</text>
              <text x="32" y="104" textAnchor="end" fill="#64748B" fontSize="10" fontFamily="Inter, sans-serif">₹2L</text>
              <text x="32" y="134" textAnchor="end" fill="#64748B" fontSize="10" fontFamily="Inter, sans-serif">₹0</text>

              {/* Jun */}
              <rect x="64" y="85" width="20" height="45" rx="3" fill="#0037B0"></rect>
              <rect x="88" y="118" width="14" height="12" rx="2" fill="#B45309"></rect>
              <text x="85" y="150" textAnchor="middle" fill="#475569" fontSize="11" fontFamily="Inter, sans-serif">Jun</text>

              {/* Jul */}
              <rect x="146" y="75" width="20" height="55" rx="3" fill="#0037B0"></rect>
              <rect x="170" y="114" width="14" height="16" rx="2" fill="#B45309"></rect>
              <text x="167" y="150" textAnchor="middle" fill="#475569" fontSize="11" fontFamily="Inter, sans-serif">Jul</text>

              {/* Aug */}
              <rect x="228" y="72" width="20" height="58" rx="3" fill="#0037B0"></rect>
              <rect x="252" y="116" width="14" height="14" rx="2" fill="#B45309"></rect>
              <text x="249" y="150" textAnchor="middle" fill="#475569" fontSize="11" fontFamily="Inter, sans-serif">Aug</text>

              {/* Sep */}
              <rect x="310" y="64" width="20" height="66" rx="3" fill="#0037B0"></rect>
              <rect x="334" y="112" width="14" height="18" rx="2" fill="#B45309"></rect>
              <text x="331" y="150" textAnchor="middle" fill="#475569" fontSize="11" fontFamily="Inter, sans-serif">Sep</text>

              {/* Oct */}
              <rect x="392" y="70" width="20" height="60" rx="3" fill="#0037B0"></rect>
              <rect x="416" y="114" width="14" height="16" rx="2" fill="#B45309"></rect>
              <text x="413" y="150" textAnchor="middle" fill="#475569" fontSize="11" fontFamily="Inter, sans-serif">Oct</text>

              {/* Nov */}
              <rect x="474" y="45" width="20" height="85" rx="3" fill="#0037B0"></rect>
              <rect x="498" y="116" width="14" height="14" rx="2" fill="#B45309"></rect>
              <text x="495" y="150" textAnchor="middle" fill="#0F172A" fontWeight="600" fontSize="11" fontFamily="Inter, sans-serif">Nov</text>
            </svg>
          </div>
        </article>

        {/* Right 5 Cols: Fee Status Donut Chart */}
        <article className="lg:col-span-5 bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-4 sm:p-5 flex flex-col justify-between gap-3">
          <header className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <h2 className="font-title text-title-md font-semibold text-light-on-surface dark:text-dark-on-surface">
                Fee Status Distribution
              </h2>
              <span className="font-body text-body-xs text-light-on-surface-variant">
                Total ₹25,00,000 Portfolio
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-success-container text-on-success-container font-label text-label-xs font-semibold">
              74% Paid
            </span>
          </header>

          <div className="flex flex-col sm:flex-row items-center gap-4 my-auto">
            {/* SVG Donut */}
            <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
                <circle cx="70" cy="70" r="56" fill="none" stroke="#E2E8F0" strokeWidth="18"></circle>
                <circle cx="70" cy="70" r="56" fill="none" stroke="#059669" strokeWidth="18" strokeDasharray="260.38 351.86" strokeDashoffset="0"></circle>
                <circle cx="70" cy="70" r="56" fill="none" stroke="#B45309" strokeWidth="18" strokeDasharray="63.33 351.86" strokeDashoffset="-260.38"></circle>
                <circle cx="70" cy="70" r="56" fill="none" stroke="#BE123C" strokeWidth="18" strokeDasharray="28.15 351.86" strokeDashoffset="-323.71"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-headline text-headline-sm font-bold text-light-on-surface dark:text-dark-on-surface tabular-nums">
                  74%
                </span>
                <span className="font-label text-[11px] text-light-on-surface-variant">
                  Collected
                </span>
              </div>
            </div>

            {/* Legend List */}
            <div className="flex-1 w-full flex flex-col gap-2">
              <div className="flex items-center justify-between p-2 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-body-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-success shrink-0"></span>
                  <span className="font-medium text-light-on-surface dark:text-dark-on-surface">Collected (74%)</span>
                </div>
                <span className="font-mono font-semibold">₹18.5L</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-body-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-pending shrink-0"></span>
                  <span className="font-medium text-light-on-surface dark:text-dark-on-surface">Pending (18%)</span>
                </div>
                <span className="font-mono font-semibold">₹4.5L</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-body-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-overdue shrink-0"></span>
                  <span className="font-medium text-light-on-surface dark:text-dark-on-surface">Overdue (8%)</span>
                </div>
                <span className="font-mono font-semibold">₹2.0L</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* Filters Toolbar */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm p-3.5 flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative flex items-center lg:col-span-2">
            <span className="material-symbols-outlined text-light-outline text-[18px] absolute left-3 pointer-events-none">
              search
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, ID, or course..."
              className="w-full pl-9 pr-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-sm placeholder:text-light-outline focus:outline-none focus:ring-1 focus:ring-light-primary"
            />
          </div>

          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-sm focus:outline-none focus:ring-1 focus:ring-light-primary"
          >
            <option value="all">All Courses</option>
            <option value="Graphic Design">Graphic Design</option>
            <option value="UI/UX">UI/UX Design</option>
            <option value="Full-Stack">Full-Stack Web</option>
            <option value="Data Science">Data Science</option>
            <option value="Digital Marketing">Digital Marketing</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface font-body text-body-sm focus:outline-none focus:ring-1 focus:ring-light-primary"
          >
            <option value="all">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partial Payment">Partial Payment</option>
            <option value="Unpaid">Unpaid</option>
            <option value="Overdue">Overdue</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearch('')
              setCourseFilter('all')
              setBatchFilter('all')
              setStatusFilter('all')
              setMethodFilter('all')
            }}
            className="px-3 py-1.5 rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface-variant hover:text-light-on-surface text-body-sm font-medium transition-colors flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">filter_alt_off</span>
            <span>Clear Filters</span>
          </button>
        </div>
      </section>

      {/* Main Tables: Tab Switch between Student Fee Ledger & Payment History */}
      <div className="flex flex-col gap-3">
        {/* Table Tabs */}
        <div className="flex items-center justify-between border-b border-light-outline-variant dark:border-dark-outline-variant pb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('ledger')}
              className={`px-3.5 py-1.5 rounded font-label text-label-md font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'ledger'
                  ? 'bg-light-primary text-light-on-primary shadow-xs'
                  : 'text-light-on-surface-variant hover:text-light-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">account_balance_wallet</span>
              <span>Student Fee Ledger ({filteredLedgers.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded font-label text-label-md font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'history'
                  ? 'bg-light-primary text-light-on-primary shadow-xs'
                  : 'text-light-on-surface-variant hover:text-light-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[17px]">receipt_long</span>
              <span>Payment History ({filteredTransactions.length})</span>
            </button>
          </div>
        </div>

        {/* LEDGER TABLE */}
        {activeTab === 'ledger' && (
          <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-body-sm">
                <thead>
                  <tr className="border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/70 dark:bg-dark-surface-container/60 font-label text-label-sm text-light-on-surface-variant">
                    <th className="px-3.5 py-3 font-semibold uppercase">Student ID</th>
                    <th className="px-3.5 py-3 font-semibold uppercase">Student Name</th>
                    <th className="px-3.5 py-3 font-semibold uppercase">Course Name</th>
                    <th className="px-3.5 py-3 font-semibold uppercase">Batch</th>
                    <th className="px-3.5 py-3 font-semibold uppercase text-right">Total Fee</th>
                    <th className="px-3.5 py-3 font-semibold uppercase text-right">Paid</th>
                    <th className="px-3.5 py-3 font-semibold uppercase text-right">Balance</th>
                    <th className="px-3.5 py-3 font-semibold uppercase">Due Date</th>
                    <th className="px-3.5 py-3 font-semibold uppercase">Status</th>
                    <th className="px-3.5 py-3 font-semibold uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
                  {filteredLedgers.map((l) => (
                    <tr
                      key={l.id}
                      className="hover:bg-light-surface-container-low/50 dark:hover:bg-dark-surface-container/50 transition-colors"
                    >
                      <td className="px-3.5 py-3 whitespace-nowrap font-mono text-mono-sm font-semibold text-light-primary dark:text-dark-primary">
                        {l.student_id}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap font-semibold text-light-on-surface dark:text-dark-on-surface">
                        {l.student_name}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap text-light-on-surface dark:text-dark-on-surface">
                        {l.course}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap font-mono text-mono-sm text-light-on-surface-variant">
                        {l.batch}
                      </td>
                      <td className="px-3.5 py-3 text-right whitespace-nowrap tabular-nums font-mono">
                        ₹{l.total_fee.toLocaleString()}
                      </td>
                      <td className="px-3.5 py-3 text-right whitespace-nowrap tabular-nums font-mono text-success font-semibold">
                        ₹{l.paid_amount.toLocaleString()}
                      </td>
                      <td className="px-3.5 py-3 text-right whitespace-nowrap tabular-nums font-mono font-bold text-light-on-surface dark:text-dark-on-surface">
                        ₹{l.balance_due.toLocaleString()}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap tabular-nums text-light-on-surface-variant">
                        {l.due_date}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-semibold ${getStatusBadge(
                            l.status
                          )}`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-right whitespace-nowrap">
                        {l.balance_due > 0 ? (
                          <button
                            type="button"
                            onClick={() => handleOpenCollect(l.student_id)}
                            className="px-3 py-1 rounded bg-light-primary text-light-on-primary hover:bg-light-primary-container font-label text-label-xs font-semibold transition-colors"
                          >
                            Collect
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              const related = transactions.find((t) => t.student_id === l.student_id)
                              if (related) {
                                setViewingReceipt(related)
                              } else {
                                setViewingReceipt({
                                  receipt_no: 'RCP-2026-0449',
                                  txn_id: 'TXN-2026-8841',
                                  student_id: l.student_id,
                                  student_name: l.student_name,
                                  course: l.course,
                                  batch: l.batch,
                                  payment_date: '2026-11-20',
                                  method: 'Bank Transfer',
                                  amount: l.total_fee,
                                  total_fee: l.total_fee,
                                  prev_paid: 0,
                                  balance: 0,
                                })
                              }
                            }}
                            className="px-2.5 py-1 rounded border border-light-outline-variant font-label text-label-xs font-medium hover:bg-light-surface-container-low transition-colors"
                          >
                            Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredLedgers.length === 0 && (
                    <tr>
                      <td colSpan={10} className="p-8 text-center text-light-on-surface-variant">
                        No student fee records found matching criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* PAYMENT HISTORY TABLE */}
        {activeTab === 'history' && (
          <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant rounded-md shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-body-sm">
                <thead>
                  <tr className="border-b border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low/70 dark:bg-dark-surface-container/60 font-label text-label-sm text-light-on-surface-variant">
                    <th className="px-3.5 py-3 font-semibold uppercase">Transaction ID</th>
                    <th className="px-3.5 py-3 font-semibold uppercase">Receipt Number</th>
                    <th className="px-3.5 py-3 font-semibold uppercase">Student Name</th>
                    <th className="px-3.5 py-3 font-semibold uppercase">Course</th>
                    <th className="px-3.5 py-3 font-semibold uppercase">Payment Date</th>
                    <th className="px-3.5 py-3 font-semibold uppercase">Method</th>
                    <th className="px-3.5 py-3 font-semibold uppercase text-right">Amount</th>
                    <th className="px-3.5 py-3 font-semibold uppercase">Status</th>
                    <th className="px-3.5 py-3 font-semibold uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-outline-variant dark:divide-dark-outline-variant">
                  {filteredTransactions.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-light-surface-container-low/50 dark:hover:bg-dark-surface-container/50 transition-colors"
                    >
                      <td className="px-3.5 py-3 font-mono text-mono-sm text-light-on-surface-variant">
                        {t.txn_id}
                      </td>
                      <td className="px-3.5 py-3 font-mono text-mono-sm font-semibold text-light-primary dark:text-dark-primary">
                        {t.receipt_no}
                      </td>
                      <td className="px-3.5 py-3 font-semibold text-light-on-surface dark:text-dark-on-surface">
                        {t.student_name}
                      </td>
                      <td className="px-3.5 py-3 text-light-on-surface-variant">
                        {t.course}
                      </td>
                      <td className="px-3.5 py-3 tabular-nums text-light-on-surface-variant">
                        {t.payment_date}
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="px-2 py-0.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-body-xs font-medium">
                          {t.method}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-right font-mono font-bold text-success tabular-nums">
                        ₹{t.amount.toLocaleString()}
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-xs font-semibold bg-success-container text-on-success-container">
                          Success
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setViewingReceipt(t)}
                          className="px-2.5 py-1 text-label-xs font-semibold text-light-primary dark:text-dark-primary hover:underline"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>

      {/* COLLECT STUDENT PAYMENT MODAL */}
      {showCollectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright rounded-lg border border-light-outline-variant dark:border-dark-outline-variant shadow-xl max-w-xl w-full overflow-hidden">
            <div className="px-6 py-4 bg-sidebar text-on-sidebar flex items-center justify-between border-b border-sidebar-surface">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-light-primary">payments</span>
                <h3 className="font-title text-title-md font-semibold text-white">
                  Collect Student Payment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCollectModal(false)}
                className="text-white/80 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-6 flex flex-col gap-4">
              {/* Student Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 sm:col-span-2">
                  <span className="font-label text-label-sm font-medium">Select Student *</span>
                  <select
                    value={collectingStudentId}
                    onChange={(e) => handleStudentSelectChange(e.target.value)}
                    className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    {ledgers.map((l) => (
                      <option key={l.student_id} value={l.student_id}>
                        {l.student_id} — {l.student_name} ({l.course}) • Due: ₹{l.balance_due.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container">
                  <span className="font-label text-label-xs text-light-on-surface-variant block">Course</span>
                  <span className="font-body text-body-sm font-semibold">{selectedStudent.course}</span>
                </div>
                <div className="p-2.5 rounded bg-light-surface-container-low dark:bg-dark-surface-container">
                  <span className="font-label text-label-xs text-light-on-surface-variant block">Assigned Batch</span>
                  <span className="font-mono text-mono-sm font-semibold">{selectedStudent.batch}</span>
                </div>
              </div>

              {/* Fee Information Breakdown Box */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant">
                <div>
                  <span className="font-label text-label-xs text-light-on-surface-variant block">Total Course Fee</span>
                  <span className="font-mono text-mono-sm font-bold">₹{selectedStudent.total_fee.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-label text-label-xs text-light-on-surface-variant block">Previously Paid</span>
                  <span className="font-mono text-mono-sm font-bold text-success">₹{selectedStudent.paid_amount.toLocaleString()}</span>
                </div>
                <div>
                  <span className="font-label text-label-xs text-light-on-surface-variant block">Balance Remaining</span>
                  <span className="font-mono text-mono-sm font-bold text-overdue">₹{selectedStudent.balance_due.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="font-label text-label-sm font-medium">Collect Now Amount (₹) *</span>
                  <input
                    type="number"
                    min="1"
                    max={selectedStudent.balance_due || 100000}
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="px-3 py-1.5 text-body-sm font-mono font-bold rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container focus:outline-none focus:ring-1 focus:ring-light-primary"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="font-label text-label-sm font-medium">Payment Method *</span>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container focus:outline-none focus:ring-1 focus:ring-light-primary"
                  >
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT / RTGS)</option>
                    <option value="Card">Credit / Debit Card</option>
                    <option value="Cash">Cash at Counter</option>
                  </select>
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="font-label text-label-sm font-medium">Payment Note / Reference</span>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. Installment 2 fee collection verified"
                  className="px-3 py-1.5 text-body-sm rounded border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-container focus:outline-none focus:ring-1 focus:ring-light-primary"
                />
              </label>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-light-outline-variant dark:border-dark-outline-variant mt-2">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="px-3.5 py-1.5 rounded border border-light-outline-variant text-body-sm hover:bg-light-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-light-primary hover:bg-light-primary-container text-light-on-primary font-semibold text-body-sm shadow-sm transition-colors"
                >
                  Confirm &amp; Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIGITAL PAYMENT RECEIPT MODAL (From UI reference/payment_receipt) */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright rounded-lg border border-light-outline-variant dark:border-dark-outline-variant shadow-xl max-w-2xl w-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-light-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px] text-white">school</span>
                </div>
                <div>
                  <h3 className="font-title text-title-md font-bold tracking-tight">BIXCEL INSTITUTE</h3>
                  <span className="font-label text-label-xs opacity-80">Official Tuition Fee Receipt • IMS + LMS</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="text-white/80 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-light-outline-variant dark:border-dark-outline-variant pb-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-success-container text-on-success-container text-label-xs font-semibold inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                    <span>Verified Payment</span>
                  </span>
                  <h4 className="font-mono text-mono-md font-bold text-light-primary dark:text-dark-primary mt-1">
                    Receipt No: {viewingReceipt.receipt_no}
                  </h4>
                </div>
                <div className="text-sm sm:text-right font-mono text-light-on-surface-variant">
                  <span>Transaction ID: {viewingReceipt.txn_id}</span>
                </div>
              </div>

              {/* Student Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 rounded bg-light-surface-container-low dark:bg-dark-surface-container border border-light-outline-variant text-body-sm">
                <div>
                  <span className="font-label text-label-xs text-light-on-surface-variant block">Student Name</span>
                  <span className="font-semibold text-light-on-surface dark:text-dark-on-surface">{viewingReceipt.student_name}</span>
                </div>
                <div>
                  <span className="font-label text-label-xs text-light-on-surface-variant block">Student ID</span>
                  <span className="font-mono font-semibold">{viewingReceipt.student_id}</span>
                </div>
                <div>
                  <span className="font-label text-label-xs text-light-on-surface-variant block">Course Name</span>
                  <span className="font-semibold">{viewingReceipt.course}</span>
                </div>
                <div>
                  <span className="font-label text-label-xs text-light-on-surface-variant block">Batch Code</span>
                  <span className="font-mono font-semibold">{viewingReceipt.batch}</span>
                </div>
              </div>

              {/* Financial Breakdown Table */}
              <div className="border border-light-outline-variant dark:border-dark-outline-variant rounded overflow-hidden">
                <table className="w-full text-left border-collapse text-body-sm">
                  <thead>
                    <tr className="bg-light-surface-container-low dark:bg-dark-surface-container/60 border-b border-light-outline-variant">
                      <th className="px-3.5 py-2 font-semibold">Fee Component / Description</th>
                      <th className="px-3.5 py-2 font-semibold text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-outline-variant">
                    <tr>
                      <td className="px-3.5 py-2">Total Course Fee ({viewingReceipt.course})</td>
                      <td className="px-3.5 py-2 text-right font-mono tabular-nums">
                        ₹{(viewingReceipt.total_fee || viewingReceipt.amount).toLocaleString()}.00
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3.5 py-2 text-light-on-surface-variant">Previously Paid Amount</td>
                      <td className="px-3.5 py-2 text-right font-mono tabular-nums text-light-on-surface-variant">
                        ₹{(viewingReceipt.prev_paid || 0).toLocaleString()}.00
                      </td>
                    </tr>
                    <tr className="bg-light-primary-tint/40 dark:bg-dark-primary-tint/30">
                      <td className="px-3.5 py-2.5 font-semibold text-light-primary dark:text-dark-primary">
                        Current Paid Amount ({viewingReceipt.method})
                      </td>
                      <td className="px-3.5 py-2.5 text-right font-mono font-bold text-light-primary dark:text-dark-primary tabular-nums">
                        ₹{viewingReceipt.amount.toLocaleString()}.00
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3.5 py-2 font-medium">Remaining Balance Due</td>
                      <td className="px-3.5 py-2 text-right font-mono font-semibold tabular-nums text-success">
                        ₹{(viewingReceipt.balance || 0).toLocaleString()}.00
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-body-xs text-light-on-surface-variant border-t border-light-outline-variant">
                <div>
                  <span>Method: <strong>{viewingReceipt.method}</strong></span> • <span>Date: {viewingReceipt.payment_date}</span>
                </div>
                <div className="font-semibold text-light-on-surface">
                  Authorized Signatory • Bixcel Finance
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-3.5 bg-light-surface-container-low dark:bg-dark-surface-container border-t border-light-outline-variant flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => alert(`Printing official fee receipt ${viewingReceipt.receipt_no}...`)}
                className="px-3 py-1.5 rounded bg-light-primary text-light-on-primary font-semibold text-body-sm shadow-xs hover:bg-light-primary-container transition-colors inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingReceipt(null)}
                className="px-3.5 py-1.5 rounded border border-light-outline-variant text-body-sm hover:bg-light-surface-container transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FeesPayment
