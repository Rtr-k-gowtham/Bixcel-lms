<?php

namespace App\Models;

use CodeIgniter\Model;

class StudentEnrollmentModel extends Model
{
    protected $table = 'student_enrollments';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $allowedFields = [
        'student_id',
        'student_code',
        'track',
        'category',
        'batch_id',
        'start_date',
        'end_date',
        'total_days',
        'total_modules',
        'status',
        'tuition_fee',
        'plan',
        'payment_method',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
}
