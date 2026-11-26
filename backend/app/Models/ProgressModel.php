<?php

namespace App\Models;

use CodeIgniter\Model;

class ProgressModel extends Model
{
    protected $table = 'student_progress';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $allowedFields = [
        'student_id',
        'student_code',
        'track',
        'batch_code',
        'cumulative_gpa',
        'percentile',
        'syllabus_completed_credits',
        'syllabus_total_credits',
        'average_score',
        'attendance_rate',
        'cleared_milestones',
        'total_milestones',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
}
