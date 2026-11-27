<?php

namespace App\Models;

use CodeIgniter\Model;

class AssignmentModel extends Model
{
    protected $table = 'assignments';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $allowedFields = [
        'assignment_uid',
        'title',
        'track',
        'batch_code',
        'description',
        'total_marks',
        'passing_marks',
        'due_date',
        'status',
        'sent_to_count',
        'submitted_count',
        'evaluated_count',
        'student_submissions',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
}
