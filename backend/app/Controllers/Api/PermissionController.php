<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class PermissionController extends ResourceController
{
    protected $format = 'json';

    /**
     * Master matrix definitions with applicable actions per module
     * Matches user's screenshot layout and headers
     */
    private static array $sections = [
        [
            'category' => 'ERP & LMS FOUNDATION',
            'icon'     => 'layers',
            'modules'  => [
                [
                    'id'          => 'activity_logs',
                    'name'        => 'Activity Logs',
                    'actions'     => ['view', 'export'],
                ],
                [
                    'id'          => 'company_settings',
                    'name'        => 'Company Settings',
                    'actions'     => ['view', 'edit', 'settings'],
                ],
                [
                    'id'          => 'dashboard',
                    'name'        => 'Dashboard',
                    'actions'     => ['view'],
                ],
                [
                    'id'          => 'email',
                    'name'        => 'Email',
                    'actions'     => ['view', 'edit', 'settings'],
                ],
                [
                    'id'          => 'notifications',
                    'name'        => 'Notifications',
                    'actions'     => ['view', 'create', 'settings'],
                ],
                [
                    'id'          => 'permissions',
                    'name'        => 'Permissions',
                    'actions'     => ['view', 'settings'],
                ],
                [
                    'id'          => 'roles',
                    'name'        => 'Roles',
                    'actions'     => ['view', 'create', 'edit', 'delete', 'assign'],
                ],
                [
                    'id'          => 'users',
                    'name'        => 'Users',
                    'actions'     => ['view', 'create', 'edit', 'delete', 'status', 'export'],
                ],
            ],
        ],
        [
            'category' => 'ACADEMIC BUSINESS MODULES',
            'icon'     => 'school',
            'modules'  => [
                [
                    'id'          => 'courses',
                    'name'        => 'Courses & Syllabus',
                    'actions'     => ['view', 'create', 'edit', 'delete', 'approve', 'export', 'print', 'settings'],
                ],
                [
                    'id'          => 'batches',
                    'name'        => 'Batches & Cohorts',
                    'actions'     => ['view', 'create', 'edit', 'delete', 'assign', 'status', 'export'],
                ],
                [
                    'id'          => 'curriculum',
                    'name'        => 'Day-Wise Curriculum',
                    'actions'     => ['view', 'create', 'edit', 'delete', 'approve', 'export'],
                ],
                [
                    'id'          => 'attendance',
                    'name'        => 'Attendance Register',
                    'actions'     => ['view', 'create', 'edit', 'approve', 'status', 'export', 'print'],
                ],
                [
                    'id'          => 'exams',
                    'name'        => 'Examination & Grading',
                    'actions'     => ['view', 'create', 'edit', 'approve', 'reject', 'status', 'export', 'print'],
                ],
            ],
        ],
        [
            'category' => 'OPERATIONS & FINANCE',
            'icon'     => 'account_balance',
            'modules'  => [
                [
                    'id'          => 'admissions',
                    'name'        => 'Student Admissions',
                    'actions'     => ['view', 'create', 'edit', 'approve', 'reject', 'assign', 'status', 'export'],
                ],
                [
                    'id'          => 'fee_ledger',
                    'name'        => 'Fee Structure & Invoices',
                    'actions'     => ['view', 'create', 'edit', 'delete', 'approve', 'status', 'export', 'print', 'settings'],
                ],
                [
                    'id'          => 'room_alloc',
                    'name'        => 'Room & Lab Allocation',
                    'actions'     => ['view', 'create', 'edit', 'delete', 'assign', 'status'],
                ],
            ],
        ],
    ];

    /**
     * Default role permissions mapping
     */
    private static array $rolePermissions = [
        'Super Admin' => 'ALL', // Full privileges on all applicable
        'Admin' => [
            'activity_logs' => ['view' => true, 'export' => true],
            'company_settings' => ['view' => true, 'edit' => true, 'settings' => false],
            'dashboard' => ['view' => true],
            'email' => ['view' => true, 'edit' => true, 'settings' => false],
            'notifications' => ['view' => true, 'create' => true, 'settings' => true],
            'permissions' => ['view' => true, 'settings' => false],
            'roles' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => false, 'assign' => true],
            'users' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => false, 'status' => true, 'export' => true],
            'courses' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => true, 'approve' => true, 'export' => true, 'print' => true, 'settings' => true],
            'batches' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => true, 'assign' => true, 'status' => true, 'export' => true],
            'curriculum' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => true, 'approve' => true, 'export' => true],
            'attendance' => ['view' => true, 'create' => true, 'edit' => true, 'approve' => true, 'status' => true, 'export' => true, 'print' => true],
            'exams' => ['view' => true, 'create' => true, 'edit' => true, 'approve' => true, 'reject' => true, 'status' => true, 'export' => true, 'print' => true],
            'admissions' => ['view' => true, 'create' => true, 'edit' => true, 'approve' => true, 'reject' => true, 'assign' => true, 'status' => true, 'export' => true],
            'fee_ledger' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => false, 'approve' => true, 'status' => true, 'export' => true, 'print' => true, 'settings' => false],
            'room_alloc' => ['view' => true, 'create' => true, 'edit' => true, 'delete' => true, 'assign' => true, 'status' => true],
        ],
        'Academic Dean' => [
            'dashboard' => ['view' => true],
            'activity_logs' => ['view' => true],
            'courses' => ['view' => true, 'create' => true, 'edit' => true, 'approve' => true, 'export' => true, 'print' => true],
            'batches' => ['view' => true, 'create' => true, 'edit' => true, 'assign' => true, 'status' => true],
            'curriculum' => ['view' => true, 'create' => true, 'edit' => true, 'approve' => true],
            'attendance' => ['view' => true, 'approve' => true, 'export' => true],
            'exams' => ['view' => true, 'approve' => true, 'reject' => true, 'export' => true, 'print' => true],
            'users' => ['view' => true, 'export' => true],
        ],
        'Tutor / Faculty' => [
            'dashboard' => ['view' => true],
            'courses' => ['view' => true, 'print' => true],
            'batches' => ['view' => true],
            'curriculum' => ['view' => true, 'edit' => true],
            'attendance' => ['view' => true, 'create' => true, 'edit' => true],
            'exams' => ['view' => true, 'create' => true, 'edit' => true],
        ],
        'Admission Officer' => [
            'dashboard' => ['view' => true],
            'admissions' => ['view' => true, 'create' => true, 'edit' => true, 'assign' => true, 'status' => true, 'export' => true],
            'courses' => ['view' => true],
            'batches' => ['view' => true, 'assign' => true],
            'users' => ['view' => true, 'create' => true],
        ],
        'Accountant' => [
            'dashboard' => ['view' => true],
            'fee_ledger' => ['view' => true, 'create' => true, 'edit' => true, 'status' => true, 'export' => true, 'print' => true],
            'admissions' => ['view' => true],
            'activity_logs' => ['view' => true, 'export' => true],
        ],
        'Student / Learner' => [
            'dashboard' => ['view' => true],
            'courses' => ['view' => true],
            'curriculum' => ['view' => true],
            'attendance' => ['view' => true],
            'exams' => ['view' => true],
        ],
    ];

    public function index()
    {
        return $this->respond([
            'status'           => 'success',
            'sections'         => self::$sections,
            'role_permissions' => self::$rolePermissions,
        ]);
    }

    public function update($id = null)
    {
        $payload = $this->request->getJSON(true);
        $role = $payload['role'] ?? null;
        $matrix = $payload['matrix'] ?? null;

        if (!$role || !$matrix) {
            return $this->failValidationErrors('Role and matrix payload required');
        }

        self::$rolePermissions[$role] = $matrix;

        return $this->respond([
            'status'  => 'success',
            'message' => 'Permissions matrix updated for role: ' . $role,
            'data'    => [
                'role'   => $role,
                'matrix' => self::$rolePermissions[$role],
            ],
        ]);
    }
}
