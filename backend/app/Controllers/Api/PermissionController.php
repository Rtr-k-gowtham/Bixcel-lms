<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use App\Models\RoleModel;

class PermissionController extends BaseApiController
{
    protected $format = 'json';

    public function __construct()
    {
        DatabaseBootstrapper::ensureInitialized();
        $this->request ??= \Config\Services::request();
        $this->response ??= \Config\Services::response();
    }

    /**
     * Master matrix definitions with applicable actions per module
     */
    private static array $sections = [
        [
            'category' => 'ERP & LMS FOUNDATION',
            'icon'     => 'layers',
            'modules'  => [
                [
                    'id'      => 'activity_logs',
                    'name'    => 'Activity Logs',
                    'actions' => ['view', 'export'],
                ],
                [
                    'id'      => 'company_settings',
                    'name'    => 'Company Settings',
                    'actions' => ['view', 'edit', 'settings'],
                ],
                [
                    'id'      => 'dashboard',
                    'name'    => 'Dashboard',
                    'actions' => ['view'],
                ],
                [
                    'id'      => 'email',
                    'name'    => 'Email',
                    'actions' => ['view', 'edit', 'settings'],
                ],
                [
                    'id'      => 'notifications',
                    'name'    => 'Notifications',
                    'actions' => ['view', 'create', 'settings'],
                ],
                [
                    'id'      => 'permissions',
                    'name'    => 'Permissions',
                    'actions' => ['view', 'settings'],
                ],
                [
                    'id'      => 'roles',
                    'name'    => 'Roles',
                    'actions' => ['view', 'create', 'edit', 'delete', 'assign'],
                ],
                [
                    'id'      => 'users',
                    'name'    => 'Users',
                    'actions' => ['view', 'create', 'edit', 'delete', 'status', 'export'],
                ],
            ],
        ],
        [
            'category' => 'ACADEMIC BUSINESS MODULES',
            'icon'     => 'school',
            'modules'  => [
                [
                    'id'      => 'courses',
                    'name'    => 'Courses & Syllabus',
                    'actions' => ['view', 'create', 'edit', 'delete', 'approve', 'export', 'print', 'settings'],
                ],
                [
                    'id'      => 'batches',
                    'name'    => 'Batches & Cohorts',
                    'actions' => ['view', 'create', 'edit', 'delete', 'assign', 'status', 'export'],
                ],
                [
                    'id'      => 'curriculum',
                    'name'    => 'Day-Wise Curriculum',
                    'actions' => ['view', 'create', 'edit', 'delete', 'approve', 'export'],
                ],
                [
                    'id'      => 'attendance',
                    'name'    => 'Attendance Register',
                    'actions' => ['view', 'create', 'edit', 'approve', 'status', 'export', 'print'],
                ],
                [
                    'id'      => 'exams',
                    'name'    => 'Examination & Grading',
                    'actions' => ['view', 'create', 'edit', 'approve', 'reject', 'status', 'export', 'print'],
                ],
            ],
        ],
        [
            'category' => 'OPERATIONS & FINANCE',
            'icon'     => 'account_balance',
            'modules'  => [
                [
                    'id'      => 'admissions',
                    'name'    => 'Student Admissions',
                    'actions' => ['view', 'create', 'edit', 'approve', 'reject', 'assign', 'status', 'export'],
                ],
                [
                    'id'      => 'fee_ledger',
                    'name'    => 'Fee Structure & Invoices',
                    'actions' => ['view', 'create', 'edit', 'delete', 'approve', 'status', 'export', 'print', 'settings'],
                ],
                [
                    'id'      => 'room_alloc',
                    'name'    => 'Room & Lab Allocation',
                    'actions' => ['view', 'create', 'edit', 'delete', 'assign', 'status'],
                ],
            ],
        ],
    ];

    public function index()
    {
        $roleModel = new RoleModel();
        $roles = $roleModel->findAll();

        $rolePermissions = [];

        foreach ($roles as $r) {
            $name = $r['name'];
            $perm = $r['permissions_json'] ?? null;

            if (empty($perm)) {
                $rolePermissions[$name] = [];
            } elseif ($perm === 'ALL' || $r['code'] === 'ROLE_SUPER_ADMIN') {
                $rolePermissions[$name] = 'ALL';
            } else {
                $decoded = json_decode($perm, true);
                $rolePermissions[$name] = $decoded ?: [];
            }
        }

        return $this->respond([
            'status'           => 'success',
            'sections'         => self::$sections,
            'role_permissions' => $rolePermissions,
        ]);
    }

    public function update($id = null)
    {
        $payload = $this->getRequestData();
        $role = $payload['role'] ?? null;
        $matrix = $payload['matrix'] ?? null;

        if (!$role || $matrix === null) {
            return $this->failValidationErrors('Role and matrix payload required');
        }

        $roleModel = new RoleModel();
        $existing = $roleModel->where('name', $role)->first();

        if (!$existing) {
            // Also check by code or id if passed
            $existing = $roleModel->where('code', $role)->orWhere('id', $id)->first();
        }

        if (!$existing) {
            return $this->failNotFound('Role not found to update permissions');
        }

        $jsonValue = is_string($matrix) ? $matrix : json_encode($matrix);
        $roleModel->update($existing['id'], [
            'permissions_json' => $jsonValue,
        ]);

        return $this->respond([
            'status'  => 'success',
            'message' => 'Permissions matrix updated in database for role: ' . $role,
            'data'    => [
                'role'   => $role,
                'matrix' => $matrix,
            ],
        ]);
    }
}
