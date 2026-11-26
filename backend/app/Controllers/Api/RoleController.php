<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class RoleController extends ResourceController
{
    protected $format = 'json';

    private static array $roles = [
        [
            'id'          => 1,
            'name'        => 'Super Admin',
            'code'        => 'ROLE_SUPER_ADMIN',
            'users_count' => 2,
            'scope'       => 'Full Enterprise Scope',
            'is_system'   => true,
            'description' => 'Unrestricted master access across all ERP foundations, academic telemetry, and financial ledgers.',
            'status'      => 'Active',
        ],
        [
            'id'          => 2,
            'name'        => 'Admin',
            'code'        => 'ROLE_ADMIN',
            'users_count' => 4,
            'scope'       => 'System & Operational Scope',
            'is_system'   => true,
            'description' => 'Configures courses, timetables, batch assignments, and standard platform operational settings.',
            'status'      => 'Active',
        ],
        [
            'id'          => 3,
            'name'        => 'Academic Dean',
            'code'        => 'ROLE_DEAN',
            'users_count' => 3,
            'scope'       => 'Departmental Governance',
            'is_system'   => false,
            'description' => 'Authorizes curriculum modifications, oversees faculty evaluations, and approves student certifications.',
            'status'      => 'Active',
        ],
        [
            'id'          => 4,
            'name'        => 'Tutor / Faculty',
            'code'        => 'ROLE_TUTOR',
            'users_count' => 38,
            'scope'       => 'Instructional Delivery',
            'is_system'   => false,
            'description' => 'Conducts lectures, marks student attendance, reviews assignments, and publishes examination scores.',
            'status'      => 'Active',
        ],
        [
            'id'          => 5,
            'name'        => 'Admission Officer',
            'code'        => 'ROLE_ADMISSIONS',
            'users_count' => 6,
            'scope'       => 'Student Intake Operations',
            'is_system'   => false,
            'description' => 'Processes enrollment applications, verifies academic credentials, and assigns students to active cohorts.',
            'status'      => 'Active',
        ],
        [
            'id'          => 6,
            'name'        => 'Accountant',
            'code'        => 'ROLE_FINANCE',
            'users_count' => 5,
            'scope'       => 'Bursar & Financial Ledgers',
            'is_system'   => false,
            'description' => 'Generates tuition invoices, tracks installment reconciliations, audits overdue balances, and prints receipts.',
            'status'      => 'Active',
        ],
        [
            'id'          => 7,
            'name'        => 'Student / Learner',
            'code'        => 'ROLE_STUDENT',
            'users_count' => 2840,
            'scope'       => 'Self-Service Academic Portal',
            'is_system'   => true,
            'description' => 'Accesses enrolled courses, attends live lectures, submits assignments, and reviews personal grade cards.',
            'status'      => 'Active',
        ],
    ];

    public function index()
    {
        return $this->respond([
            'status' => 'success',
            'count'  => count(self::$roles),
            'data'   => self::$roles,
        ]);
    }

    public function show($id = null)
    {
        $id = (int)$id;
        foreach (self::$roles as $role) {
            if ($role['id'] === $id) {
                return $this->respond([
                    'status' => 'success',
                    'data'   => $role,
                ]);
            }
        }
        return $this->failNotFound('Role not found');
    }

    public function create()
    {
        $data = $this->request->getJSON(true) ?? $this->request->getPost();

        if (empty($data['name']) || empty($data['code'])) {
            return $this->failValidationErrors('Role Name and Code are required');
        }

        $newRole = [
            'id'          => count(self::$roles) + 1,
            'name'        => $data['name'],
            'code'        => strtoupper($data['code']),
            'users_count' => 0,
            'scope'       => $data['scope'] ?? 'Custom Scope',
            'is_system'   => false,
            'description' => $data['description'] ?? '',
            'status'      => 'Active',
        ];

        self::$roles[] = $newRole;

        return $this->respondCreated([
            'status'  => 'success',
            'message' => 'Role created successfully',
            'data'    => $newRole,
        ]);
    }

    public function update($id = null)
    {
        $id = (int)$id;
        $data = $this->request->getJSON(true) ?? $this->request->getRawInput();

        foreach (self::$roles as &$role) {
            if ($role['id'] === $id) {
                if (isset($data['name'])) $role['name'] = $data['name'];
                if (isset($data['scope'])) $role['scope'] = $data['scope'];
                if (isset($data['description'])) $role['description'] = $data['description'];
                if (isset($data['status'])) $role['status'] = $data['status'];

                return $this->respond([
                    'status'  => 'success',
                    'message' => 'Role updated successfully',
                    'data'    => $role,
                ]);
            }
        }

        return $this->failNotFound('Role not found');
    }

    public function delete($id = null)
    {
        $id = (int)$id;
        foreach (self::$roles as $idx => $role) {
            if ($role['id'] === $id) {
                if ($role['is_system']) {
                    return $this->fail('System protected roles cannot be deleted', 403);
                }
                array_splice(self::$roles, $idx, 1);
                return $this->respondDeleted([
                    'status'  => 'success',
                    'message' => 'Role deleted successfully',
                ]);
            }
        }

        return $this->failNotFound('Role not found to delete');
    }
}
