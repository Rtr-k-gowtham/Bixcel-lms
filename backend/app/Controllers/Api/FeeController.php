<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class FeeController extends ResourceController
{
    protected $format = 'json';

    private static array $ledgers = [
        [
            'id' => 1,
            'student_id' => 'STU-2026-001',
            'student_name' => 'Arjun Kumar',
            'course' => 'Graphic Design Master Course',
            'batch' => 'GD-2026-M1',
            'total_fee' => 25000,
            'paid_amount' => 15000,
            'balance_due' => 10000,
            'due_date' => '2026-11-25',
            'status' => 'Partial Payment',
            'email' => 'arjun.kumar@student.bixcel.edu',
            'phone' => '+91 98765 43210',
        ],
        [
            'id' => 2,
            'student_id' => 'STU-2026-002',
            'student_name' => 'Priya Sharma',
            'course' => 'UI/UX Product Design',
            'batch' => 'UX-2026-M1',
            'total_fee' => 30000,
            'paid_amount' => 30000,
            'balance_due' => 0,
            'due_date' => '2026-11-20',
            'status' => 'Paid',
            'email' => 'priya.sharma@student.bixcel.edu',
            'phone' => '+91 98765 43211',
        ],
        [
            'id' => 3,
            'student_id' => 'STU-2026-003',
            'student_name' => 'Rahul Kumar',
            'course' => 'Full-Stack Web Engineering',
            'batch' => 'FS-2026-M1',
            'total_fee' => 45000,
            'paid_amount' => 10000,
            'balance_due' => 35000,
            'due_date' => '2026-11-15',
            'status' => 'Overdue',
            'email' => 'rahul.kumar@student.bixcel.edu',
            'phone' => '+91 98765 43212',
        ],
        [
            'id' => 4,
            'student_id' => 'STU-2026-004',
            'student_name' => 'Divya S',
            'course' => 'Graphic Design Master Course',
            'batch' => 'GD-2026-M1',
            'total_fee' => 25000,
            'paid_amount' => 0,
            'balance_due' => 25000,
            'due_date' => '2026-11-30',
            'status' => 'Unpaid',
            'email' => 'divya.s@student.bixcel.edu',
            'phone' => '+91 98765 43213',
        ],
        [
            'id' => 5,
            'student_id' => 'STU-2026-005',
            'student_name' => 'Marcus Vance',
            'course' => 'Digital Marketing Specialization',
            'batch' => 'BIX-MKT-26B',
            'total_fee' => 35000,
            'paid_amount' => 35000,
            'balance_due' => 0,
            'due_date' => '2026-11-10',
            'status' => 'Paid',
            'email' => 'marcus.v@student.bixcel.edu',
            'phone' => '+91 98765 43214',
        ],
        [
            'id' => 6,
            'student_id' => 'STU-2026-006',
            'student_name' => 'Sophia Martinez',
            'course' => 'Data Science & Analytics',
            'batch' => 'BIX-DS-18C',
            'total_fee' => 40000,
            'paid_amount' => 20000,
            'balance_due' => 20000,
            'due_date' => '2026-12-05',
            'status' => 'Partial Payment',
            'email' => 'sophia.m@student.bixcel.edu',
            'phone' => '+91 98765 43215',
        ],
    ];

    private static array $transactions = [
        [
            'id' => 1,
            'txn_id' => 'TXN-2026-8841',
            'receipt_no' => 'RCP-2026-0449',
            'student_id' => 'STU-2026-002',
            'student_name' => 'Priya Sharma',
            'course' => 'UI/UX Product Design',
            'batch' => 'UX-2026-M1',
            'payment_date' => '2026-11-20 11:42:00',
            'method' => 'Bank Transfer',
            'amount' => 30000,
            'status' => 'Success',
            'notes' => 'Full tuition fee payment verified via NEFT.',
            'collected_by' => 'Elena Rostova',
        ],
        [
            'id' => 2,
            'txn_id' => 'TXN-2026-8839',
            'receipt_no' => 'RCP-2026-0448',
            'student_id' => 'STU-2026-001',
            'student_name' => 'Arjun Kumar',
            'course' => 'Graphic Design Master Course',
            'batch' => 'GD-2026-M1',
            'payment_date' => '2026-11-18 14:15:00',
            'method' => 'UPI',
            'amount' => 15000,
            'status' => 'Success',
            'notes' => 'First installment via GPay.',
            'collected_by' => 'Elena Rostova',
        ],
        [
            'id' => 3,
            'txn_id' => 'TXN-2026-8835',
            'receipt_no' => 'RCP-2026-0447',
            'student_id' => 'STU-2026-005',
            'student_name' => 'Marcus Vance',
            'course' => 'Digital Marketing Specialization',
            'batch' => 'BIX-MKT-26B',
            'payment_date' => '2026-11-10 10:20:00',
            'method' => 'Card',
            'amount' => 35000,
            'status' => 'Success',
            'notes' => 'Complete enrollment fee payment.',
            'collected_by' => 'Finance Office',
        ],
        [
            'id' => 4,
            'txn_id' => 'TXN-2026-8830',
            'receipt_no' => 'RCP-2026-0446',
            'student_id' => 'STU-2026-006',
            'student_name' => 'Sophia Martinez',
            'course' => 'Data Science & Analytics',
            'batch' => 'BIX-DS-18C',
            'payment_date' => '2026-11-05 16:30:00',
            'method' => 'UPI',
            'amount' => 20000,
            'status' => 'Success',
            'notes' => 'Module chunk payment installment 1.',
            'collected_by' => 'Finance Office',
        ],
    ];

    /**
     * List all fee records, transactions and overview KPIs
     */
    public function index()
    {
        $search = $this->request->getGet('search');
        $course = $this->request->getGet('course');
        $status = $this->request->getGet('status');

        $filtered = self::$ledgers;

        if (!empty($search)) {
            $q = strtolower(trim((string) $search));
            $filtered = array_values(array_filter($filtered, static function ($l) use ($q) {
                return str_contains(strtolower($l['student_name']), $q)
                    || str_contains(strtolower($l['student_id']), $q)
                    || str_contains(strtolower($l['course']), $q)
                    || str_contains(strtolower($l['batch']), $q);
            }));
        }

        if (!empty($course) && $course !== 'all') {
            $filtered = array_values(array_filter($filtered, static function ($l) use ($course) {
                return str_contains($l['course'], $course);
            }));
        }

        if (!empty($status) && $status !== 'all') {
            $filtered = array_values(array_filter($filtered, static function ($l) use ($status) {
                return $l['status'] === $status;
            }));
        }

        $totalFee = array_sum(array_column(self::$ledgers, 'total_fee'));
        $collected = array_sum(array_column(self::$ledgers, 'paid_amount'));
        $pending = array_sum(array_column(self::$ledgers, 'balance_due'));
        $overdue = array_sum(array_map(
            static fn($l) => $l['status'] === 'Overdue' ? $l['balance_due'] : 0,
            self::$ledgers
        ));

        return $this->respond([
            'status' => 'success',
            'data' => [
                'ledgers' => $filtered,
                'transactions' => self::$transactions,
            ],
            'meta' => [
                'total_fees' => $totalFee ?: 2500000,
                'collected_amount' => $collected ?: 1850000,
                'pending_amount' => $pending ?: 450000,
                'overdue_amount' => $overdue ?: 200000,
                'collection_percentage' => '74%',
                'total_transactions' => 450 + count(self::$transactions),
            ],
            'monthly_trend' => [
                ['month' => 'Jun', 'collected' => 2.4, 'pending' => 0.6],
                ['month' => 'Jul', 'collected' => 2.9, 'pending' => 0.8],
                ['month' => 'Aug', 'collected' => 3.1, 'pending' => 0.7],
                ['month' => 'Sep', 'collected' => 3.5, 'pending' => 0.9],
                ['month' => 'Oct', 'collected' => 3.2, 'pending' => 0.8],
                ['month' => 'Nov', 'collected' => 4.4, 'pending' => 0.7],
            ],
        ]);
    }

    /**
     * Show single student ledger or receipt
     */
    public function show($id = null)
    {
        $ledger = null;
        foreach (self::$ledgers as $l) {
            if ($l['id'] == $id || $l['student_id'] === $id) {
                $ledger = $l;
                break;
            }
        }

        if (!$ledger) {
            return $this->failNotFound('Student fee ledger not found.');
        }

        return $this->respond([
            'status' => 'success',
            'data' => $ledger,
        ]);
    }

    /**
     * Collect payment from student
     */
    public function collect()
    {
        $input = $this->request->getJSON(true) ?? $this->request->getPost();

        if (empty($input['student_id'])) {
            return $this->failValidationErrors(['student_id' => 'Student ID is required.']);
        }

        $amount = (float) ($input['amount'] ?? 0);
        if ($amount <= 0) {
            return $this->failValidationErrors(['amount' => 'Payment amount must be greater than zero.']);
        }

        // Find student ledger
        $targetIdx = null;
        foreach (self::$ledgers as $idx => $l) {
            if ($l['student_id'] === $input['student_id'] || $l['id'] == $input['student_id']) {
                $targetIdx = $idx;
                break;
            }
        }

        if ($targetIdx === null) {
            return $this->failNotFound('Student record not found.');
        }

        $ledger = &self::$ledgers[$targetIdx];
        $ledger['paid_amount'] += $amount;
        $ledger['balance_due'] = max(0, $ledger['total_fee'] - $ledger['paid_amount']);

        if ($ledger['balance_due'] <= 0) {
            $ledger['status'] = 'Paid';
        } else {
            $ledger['status'] = 'Partial Payment';
        }

        $nextNum = 450 + count(self::$transactions);
        $receiptNo = 'RCP-2026-0' . $nextNum;
        $txnId = 'TXN-2026-' . rand(8850, 9999);

        $newTxn = [
            'id' => count(self::$transactions) + 1,
            'txn_id' => $txnId,
            'receipt_no' => $receiptNo,
            'student_id' => $ledger['student_id'],
            'student_name' => $ledger['student_name'],
            'course' => $ledger['course'],
            'batch' => $ledger['batch'],
            'payment_date' => date('Y-m-d H:i:s'),
            'method' => $input['method'] ?? 'UPI',
            'amount' => $amount,
            'status' => 'Success',
            'notes' => $input['notes'] ?? 'Fee collection receipt.',
            'collected_by' => 'Elena Rostova',
        ];

        array_unshift(self::$transactions, $newTxn);

        return $this->respondCreated([
            'status' => 'success',
            'message' => "Payment of ₹" . number_format($amount) . " collected successfully for {$ledger['student_name']}.",
            'data' => [
                'ledger' => $ledger,
                'transaction' => $newTxn,
            ],
        ]);
    }

    /**
     * Get receipt details
     */
    public function receipt($receiptNo = null)
    {
        $txn = null;
        foreach (self::$transactions as $t) {
            if ($t['receipt_no'] === $receiptNo || $t['txn_id'] === $receiptNo) {
                $txn = $t;
                break;
            }
        }

        if (!$txn) {
            return $this->failNotFound('Receipt not found.');
        }

        return $this->respond([
            'status' => 'success',
            'data' => $txn,
        ]);
    }
}
