<?php

namespace App\Models;

use CodeIgniter\Model;

class FeePaymentModel extends Model
{
    protected $table = 'fee_payments';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $allowedFields = [
        'receipt_no',
        'invoice_id',
        'student_id',
        'student_name',
        'amount',
        'payment_method',
        'transaction_ref',
        'notes',
        'payment_date',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = false;
}
