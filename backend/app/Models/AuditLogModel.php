<?php

namespace App\Models;

use CodeIgniter\Model;

class AuditLogModel extends Model
{
    protected $table = 'audit_logs';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $allowedFields = [
        'log_code',
        'actor_name',
        'actor_email',
        'actor_role',
        'action',
        'action_type',
        'module',
        'ip_address',
        'user_agent',
        'severity',
        'status',
        'summary',
        'details_json',
        'relative',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = false;
}
