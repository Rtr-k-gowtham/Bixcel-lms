<?php

namespace App\Models;

use CodeIgniter\Model;

class CompetencyMilestoneModel extends Model
{
    protected $table = 'competency_milestones';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $allowedFields = [
        'milestone_uid',
        'title',
        'skill_domain',
        'category',
        'track',
        'batch_code',
        'description',
        'target_date',
        'required_evidence',
        'status',
        'evaluator',
        'student_progress',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
}
