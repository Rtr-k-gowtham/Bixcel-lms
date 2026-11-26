<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use App\Models\RoleModel;
use App\Models\UserModel;

class RoleController extends BaseApiController
{
    protected $format = 'json';

    public function __construct()
    {
        DatabaseBootstrapper::ensureInitialized();
        $this->request ??= \Config\Services::request();
        $this->response ??= \Config\Services::response();
    }

    public function index()
    {
        $roleModel = new RoleModel();
        $userModel = new UserModel();

        $roles = $roleModel->orderBy('id', 'ASC')->findAll();

        // Count users per role
        $allUsers = $userModel->select('role, role_code')->findAll();
        $counts = [];
        foreach ($allUsers as $u) {
            $code = $u['role_code'] ?? '';
            $name = $u['role'] ?? '';
            if ($code) $counts[$code] = ($counts[$code] ?? 0) + 1;
            if ($name) $counts[$name] = ($counts[$name] ?? 0) + 1;
        }

        foreach ($roles as &$role) {
            $role['id'] = (int) $role['id'];
            $role['is_system'] = (bool) $role['is_system'];
            $c = $counts[$role['code']] ?? ($counts[$role['name']] ?? 0);
            $role['users_count'] = $c > 0 ? $c : (int)($role['users_count'] ?? 0);
        }

        return $this->respond([
            'status' => 'success',
            'count'  => count($roles),
            'data'   => $roles,
        ]);
    }

    public function show($id = null)
    {
        $roleModel = new RoleModel();
        $role = is_numeric($id) ? $roleModel->find((int)$id) : $roleModel->where('code', $id)->first();

        if ($role) {
            $role['id'] = (int) $role['id'];
            $role['is_system'] = (bool) $role['is_system'];
            return $this->respond([
                'status' => 'success',
                'data'   => $role,
            ]);
        }

        return $this->failNotFound('Role not found');
    }

    public function create()
    {
        $data = $this->getRequestData();

        if (empty($data['name']) || empty($data['code'])) {
            return $this->failValidationErrors('Role Name and Code are required');
        }

        $roleModel = new RoleModel();

        $code = strtoupper(trim((string)$data['code']));
        if (!str_starts_with($code, 'ROLE_')) {
            $code = 'ROLE_' . $code;
        }

        $newRole = [
            'name'             => trim((string)$data['name']),
            'code'             => $code,
            'scope'            => $data['scope'] ?? 'Custom Scope',
            'is_system'        => 0,
            'description'      => $data['description'] ?? '',
            'status'           => $data['status'] ?? 'Active',
            'permissions_json' => isset($data['permissions']) ? json_encode($data['permissions']) : null,
        ];

        try {
            $id = $roleModel->insert($newRole);
            $created = $roleModel->find($id);
            $created['id'] = (int)$created['id'];
            $created['is_system'] = (bool)$created['is_system'];
            $created['users_count'] = 0;

            return $this->respondCreated([
                'status'  => 'success',
                'message' => 'Role created successfully',
                'data'    => $created,
            ]);
        } catch (\Throwable $e) {
            return $this->failServerError('Failed to create role: ' . $e->getMessage());
        }
    }

    public function update($id = null)
    {
        $id = (int)$id;
        $data = $this->getRequestData();

        $roleModel = new RoleModel();
        $role = $roleModel->find($id);

        if (!$role) {
            return $this->failNotFound('Role not found');
        }

        $updatable = ['name', 'scope', 'description', 'status', 'permissions_json'];
        $payload = [];
        foreach ($updatable as $field) {
            if (isset($data[$field])) {
                $payload[$field] = is_array($data[$field]) ? json_encode($data[$field]) : $data[$field];
            }
        }

        if (!empty($payload)) {
            $roleModel->update($id, $payload);
        }

        $updated = $roleModel->find($id);
        $updated['id'] = (int)$updated['id'];
        $updated['is_system'] = (bool)$updated['is_system'];

        return $this->respond([
            'status'  => 'success',
            'message' => 'Role updated successfully',
            'data'    => $updated,
        ]);
    }

    public function delete($id = null)
    {
        $id = (int)$id;
        $roleModel = new RoleModel();
        $role = $roleModel->find($id);

        if (!$role) {
            return $this->failNotFound('Role not found to delete');
        }

        if ($role['is_system']) {
            return $this->fail('System protected roles cannot be deleted', 403);
        }

        $roleModel->delete($id);

        return $this->respondDeleted([
            'status'  => 'success',
            'message' => 'Role deleted successfully',
        ]);
    }
}
