<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use App\Models\FeeInvoiceModel;
use App\Models\FeePaymentModel;
use CodeIgniter\RESTful\ResourceController;

class FeeController extends BaseApiController
{
    protected $format = 'json';

    public function __construct()
    {
        DatabaseBootstrapper::ensureInitialized();
        $this->request ??= \Config\Services::request();
        $this->response ??= \Config\Services::response();
    }

    /**
     * List all fee records, transactions and overview KPIs
     */
    public function index()
    {
        $search = $this->request->getGet('search');
        $course = $this->request->getGet('course');
        $status = $this->request->getGet('status');

        $invoiceModel = new FeeInvoiceModel();
        $paymentModel = new FeePaymentModel();

        $invoices = $invoiceModel->findAll();
        $payments = $paymentModel->orderBy('id', 'DESC')->findAll();

        $ledgers = [];
        foreach ($invoices as $inv) {
            $ledgers[] = [
                'id' => (int) $inv['id'],
                'student_id' => $inv['student_code'],
                'student_name' => $inv['student_name'],
                'course' => $inv['track'] ?? 'Full-Stack Web Development',
                'batch' => $inv['batch_code'] ?? 'BIX-2026-A',
                'total_fee' => (float) $inv['total_amount'],
                'paid_amount' => (float) $inv['paid_amount'],
                'balance_due' => (float) $inv['balance_amount'],
                'due_date' => $inv['due_date'] ?? date('Y-m-d', strtotime('+30 days')),
                'status' => $inv['status'] ?? 'Pending',
                'email' => strtolower(str_replace(' ', '.', $inv['student_name'])) . '@student.bixcel.edu',
                'phone' => '+1 (555) 000-0000',
            ];
        }

        $transactions = [];
        foreach ($payments as $p) {
            $transactions[] = [
                'id' => (int) $p['id'],
                'txn_id' => $p['transaction_ref'] ?? ('TXN-2026-' . (8800 + (int) $p['id'])),
                'receipt_no' => $p['receipt_no'],
                'student_id' => 'STU-2026-' . str_pad((string) ($p['student_id'] ?? 1), 3, '0', STR_PAD_LEFT),
                'student_name' => $p['student_name'] ?? 'Student',
                'course' => 'Enrolled Curriculum Track',
                'batch' => 'BIX-2026-A',
                'payment_date' => $p['payment_date'] ?? date('Y-m-d H:i:s'),
                'method' => $p['payment_method'] ?? 'Bank Transfer',
                'amount' => (float) $p['amount'],
                'status' => 'Success',
                'notes' => $p['notes'] ?? 'Fee collection receipt.',
                'collected_by' => 'Finance Office',
            ];
        }

        $filtered = $ledgers;

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
            $filtered = array_values(array_filter($filtered, static fn($l) => str_contains(strtolower($l['course']), strtolower($course))));
        }

        if (!empty($status) && $status !== 'all') {
            $filtered = array_values(array_filter($filtered, static fn($l) => $l['status'] === $status));
        }

        $totalFee = array_sum(array_column($ledgers, 'total_fee'));
        $collected = array_sum(array_column($ledgers, 'paid_amount'));
        $pending = array_sum(array_column($ledgers, 'balance_due'));
        $overdue = array_sum(array_map(
            static fn($l) => $l['status'] === 'Overdue' ? $l['balance_due'] : 0,
            $ledgers
        ));

        return $this->respond([
            'status' => 'success',
            'data' => [
                'ledgers' => $filtered,
                'transactions' => $transactions,
            ],
            'meta' => [
                'total_fees' => $totalFee ?: 2500000,
                'collected_amount' => $collected ?: 1850000,
                'pending_amount' => $pending ?: 450000,
                'overdue_amount' => $overdue ?: 0,
                'collection_percentage' => $totalFee > 0 ? round(($collected / $totalFee) * 100, 1) . '%' : '100%',
                'total_transactions' => count($transactions),
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
        $invoiceModel = new FeeInvoiceModel();
        $inv = $invoiceModel->where('id', $id)->orWhere('student_code', $id)->orWhere('invoice_no', $id)->first();

        if (!$inv) {
            return $this->failNotFound('Student fee ledger not found.');
        }

        $ledger = [
            'id' => (int) $inv['id'],
            'student_id' => $inv['student_code'],
            'student_name' => $inv['student_name'],
            'course' => $inv['track'],
            'batch' => $inv['batch_code'],
            'total_fee' => (float) $inv['total_amount'],
            'paid_amount' => (float) $inv['paid_amount'],
            'balance_due' => (float) $inv['balance_amount'],
            'due_date' => $inv['due_date'],
            'status' => $inv['status'],
            'email' => strtolower(str_replace(' ', '.', $inv['student_name'])) . '@student.bixcel.edu',
            'phone' => '+1 (555) 000-0000',
        ];

        return $this->respond([
            'status' => 'success',
            'data' => $ledger,
        ]);
    }

    /**
     * Collect payment from student and persist to database
     */
    public function collect()
    {
        $input = $this->getRequestData();

        if (empty($input['student_id'])) {
            return $this->failValidationErrors(['student_id' => 'Student ID is required.']);
        }

        $amount = (float) ($input['amount'] ?? 0);
        if ($amount <= 0) {
            return $this->failValidationErrors(['amount' => 'Payment amount must be greater than zero.']);
        }

        $invoiceModel = new FeeInvoiceModel();
        $inv = $invoiceModel->where('student_code', $input['student_id'])->orWhere('id', $input['student_id'])->first();

        if (!$inv) {
            return $this->failNotFound('Student fee ledger not found.');
        }

        $newPaid = (float) $inv['paid_amount'] + $amount;
        $newBalance = max(0, (float) $inv['total_amount'] - $newPaid);
        $newStatus = $newBalance <= 0 ? 'Paid' : 'Partial Payment';

        $invoiceModel->update($inv['id'], [
            'paid_amount' => $newPaid,
            'balance_amount' => $newBalance,
            'status' => $newStatus,
            'updated_at' => date('Y-m-d H:i:s'),
        ]);

        $paymentModel = new FeePaymentModel();
        $totalPayments = $paymentModel->countAllResults();
        $receiptNo = 'RCP-2026-0' . (450 + $totalPayments + 1);
        $txnId = 'TXN-2026-' . rand(8850, 9999);
        $now = date('Y-m-d H:i:s');

        $paymentId = $paymentModel->insert([
            'receipt_no' => $receiptNo,
            'invoice_id' => $inv['id'],
            'student_id' => $inv['student_id'],
            'student_name' => $inv['student_name'],
            'amount' => $amount,
            'payment_method' => $input['method'] ?? 'Bank Transfer',
            'transaction_ref' => $txnId,
            'notes' => $input['notes'] ?? 'Fee collection receipt.',
            'payment_date' => date('Y-m-d'),
            'created_at' => $now,
        ]);

        $newTxn = [
            'id' => (int) $paymentId,
            'txn_id' => $txnId,
            'receipt_no' => $receiptNo,
            'student_id' => $inv['student_code'],
            'student_name' => $inv['student_name'],
            'course' => $inv['track'],
            'batch' => $inv['batch_code'],
            'payment_date' => $now,
            'method' => $input['method'] ?? 'Bank Transfer',
            'amount' => $amount,
            'status' => 'Success',
            'notes' => $input['notes'] ?? 'Fee collection receipt.',
            'collected_by' => 'Finance Office',
        ];

        return $this->respondCreated([
            'status' => 'success',
            'message' => "Payment of ₹" . number_format($amount) . " collected and recorded in database for {$inv['student_name']}.",
            'data' => [
                'ledger' => [
                    'id' => (int) $inv['id'],
                    'student_id' => $inv['student_code'],
                    'student_name' => $inv['student_name'],
                    'total_fee' => (float) $inv['total_amount'],
                    'paid_amount' => $newPaid,
                    'balance_due' => $newBalance,
                    'status' => $newStatus,
                ],
                'transaction' => $newTxn,
            ],
        ]);
    }

    /**
     * Get receipt details
     */
    public function receipt($receiptNo = null)
    {
        $paymentModel = new FeePaymentModel();
        $p = $paymentModel->where('receipt_no', $receiptNo)->orWhere('transaction_ref', $receiptNo)->first();

        if (!$p) {
            return $this->failNotFound('Receipt not found.');
        }

        return $this->respond([
            'status' => 'success',
            'data' => $p,
        ]);
    }
}
