<?php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table = 'users';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $allowedFields = [
        'name',
        'email',
        'emp_id',
        'role',
        'role_code',
        'department',
        'phone',
        'status',
        'avatar',
        'last_login',
        'bio',
        'office',
        'timezone',
        'institution',
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';
}
