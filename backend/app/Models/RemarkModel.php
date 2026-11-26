<?php

namespace App\Models;

use CodeIgniter\Model;

class RemarkModel extends Model
{
    protected $table = 'student_remarks';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $allowedFields = [
        'student_id',
        'student_code',
        'advisor_name',
        'advisor_role',
        'category',
        'flag',
        'date',
        'notes',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = false;
}
