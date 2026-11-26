<?php

namespace App\Models;

use CodeIgniter\Model;

class TranscriptModel extends Model
{
    protected $table = 'student_transcripts';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $allowedFields = [
        'student_id',
        'student_code',
        'assessment_name',
        'assessment_type',
        'date',
        'score',
        'weight',
        'grade',
        'feedback',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = false;
}
