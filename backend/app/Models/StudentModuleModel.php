<?php

namespace App\Models;

use CodeIgniter\Model;

class StudentModuleModel extends Model
{
    protected $table = 'student_enrolled_modules';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $allowedFields = [
        'student_id',
        'student_code',
        'module_code',
        'title',
        'days',
        'is_core',
        'status',
        'grade',
        'score',
        'completion_pct',
        'instructor',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
}
