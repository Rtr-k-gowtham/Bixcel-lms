<?php

namespace App\Models;

use CodeIgniter\Model;

class FeeInvoiceModel extends Model
{
    protected $table = 'fee_invoices';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $allowedFields = [
        'invoice_no',
        'student_id',
        'student_code',
        'student_name',
        'track',
        'batch_code',
        'total_amount',
        'paid_amount',
        'balance_amount',
        'due_date',
        'fee_schedule',
        'status',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
}
