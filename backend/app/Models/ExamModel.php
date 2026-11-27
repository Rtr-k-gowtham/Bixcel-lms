<?php

namespace App\Models;

use CodeIgniter\Model;

class ExamModel extends Model
{
    protected $table = 'examinations';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $allowedFields = [
        'exam_uid',
        'title',
        'exam_type',
        'track',
        'batch_code',
        'exam_date',
        'start_time',
        'duration_mins',
        'total_marks',
        'passing_marks',
        'room',
        'examiner',
        'status',
        'student_results',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
}
