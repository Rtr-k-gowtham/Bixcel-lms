<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use App\Models\UserModel;

class UserController extends BaseApiController
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
        $userModel = new UserModel();
        $builder = $userModel->builder();

        $query = $this->request->getGet('q');
        $department = $this->request->getGet('department');
        $role = $this->request->getGet('role');
        $status = $this->request->getGet('status');

        if (!empty($query)) {
            $builder->groupStart()
                ->like('name', $query)
                ->orLike('email', $query)
                ->orLike('emp_id', $query)
                ->groupEnd();
        }

        if (!empty($department) && $department !== 'All') {
            $builder->where('department', $department);
        }

        if (!empty($role) && $role !== 'All') {
            $builder->groupStart()
                ->where('role', $role)
                ->orWhere('role_code', $role)
                ->groupEnd();
        }

        if (!empty($status) && $status !== 'All') {
            $builder->where('status', $status);
        }

        $users = $builder->orderBy('id', 'ASC')->get()->getResultArray();

        // Ensure IDs are integers
        foreach ($users as &$user) {
            $user['id'] = (int) $user['id'];
        }

        return $this->respond([
            'status' => 'success',
            'count'  => count($users),
            'data'   => $users,
        ]);
    }

    public function show($id = null)
    {
        $userModel = new UserModel();
        $user = is_numeric($id) ? $userModel->find((int)$id) : $userModel->where('emp_id', $id)->first();

        if ($user) {
            $user['id'] = (int) $user['id'];
            return $this->respond([
                'status' => 'success',
                'data'   => $user,
            ]);
        }

        return $this->failNotFound('User not found with ID: ' . $id);
    }

    public function create()
    {
        $data = $this->getRequestData();

        if (empty($data['name']) || empty($data['email'])) {
            return $this->failValidationErrors('Name and Email are mandatory');
        }

        $userModel = new UserModel();

        $empId = $data['emp_id'] ?? ('BX-USER-' . str_pad((string)($userModel->countAllResults() + 10), 3, '0', STR_PAD_LEFT));

        $newUser = [
            'name'        => trim((string)$data['name']),
            'email'       => trim((string)$data['email']),
            'emp_id'      => $empId,
            'role'        => $data['role'] ?? 'Tutor / Faculty',
            'role_code'   => $data['role_code'] ?? 'ROLE_TUTOR',
            'department'  => $data['department'] ?? 'General Academics',
            'phone'       => $data['phone'] ?? '+1 (555) 000-0000',
            'status'      => $data['status'] ?? 'Active',
            'last_login'  => $data['last_login'] ?? 'Never',
            'avatar'      => $data['avatar'] ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=faces',
            'bio'         => $data['bio'] ?? '',
            'office'      => $data['office'] ?? 'Main Campus',
            'timezone'    => $data['timezone'] ?? 'UTC+05:30 (Asia/Kolkata)',
            'institution' => $data['institution'] ?? 'Bixcel Institute of Technologies',
        ];

        try {
            $id = $userModel->insert($newUser);
            $created = $userModel->find($id);
            $created['id'] = (int)$created['id'];

            return $this->respondCreated([
                'status'  => 'success',
                'message' => 'User created successfully',
                'data'    => $created,
            ]);
        } catch (\Throwable $e) {
            return $this->failServerError('Failed to create user: ' . $e->getMessage());
        }
    }

    public function update($id = null)
    {
        $id = (int)$id;
        $data = $this->getRequestData();

        $userModel = new UserModel();
        $user = $userModel->find($id);

        if (!$user) {
            return $this->failNotFound('User not found to update with ID: ' . $id);
        }

        $updatable = ['name', 'email', 'role', 'role_code', 'department', 'phone', 'status', 'avatar', 'bio', 'office', 'timezone', 'institution'];
        $payload = [];
        foreach ($updatable as $field) {
            if (isset($data[$field])) {
                $payload[$field] = $data[$field];
            }
        }

        if (!empty($payload)) {
            $userModel->update($id, $payload);
        }

        $updated = $userModel->find($id);
        $updated['id'] = (int)$updated['id'];

        return $this->respond([
            'status'  => 'success',
            'message' => 'User updated successfully',
            'data'    => $updated,
        ]);
    }

    public function delete($id = null)
    {
        $id = (int)$id;
        $userModel = new UserModel();
        $user = $userModel->find($id);

        if (!$user) {
            return $this->failNotFound('User not found to delete');
        }

        $userModel->delete($id);

        return $this->respondDeleted([
            'status'  => 'success',
            'message' => 'User deleted successfully',
        ]);
    }
}
