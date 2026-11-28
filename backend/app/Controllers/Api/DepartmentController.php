<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use App\Models\DepartmentModel;
use App\Models\ModuleModel;

class DepartmentController extends BaseApiController
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
        $deptModel = new DepartmentModel();
        $moduleModel = new ModuleModel();

        $departments = $deptModel->orderBy('id', 'ASC')->findAll();

        // Get module counts per department
        $modules = $moduleModel->select('id, department_id, category')->findAll();
        $deptModuleCounts = [];
        $catModuleCounts = [];

        foreach ($modules as $mod) {
            if (!empty($mod['department_id'])) {
                $dId = (int)$mod['department_id'];
                $deptModuleCounts[$dId] = ($deptModuleCounts[$dId] ?? 0) + 1;
            }
            if (!empty($mod['category'])) {
                $cat = trim((string)$mod['category']);
                $catModuleCounts[$cat] = ($catModuleCounts[$cat] ?? 0) + 1;
            }
        }

        foreach ($departments as &$dept) {
            $dept['id'] = (int) $dept['id'];
            $id = $dept['id'];
            $name = $dept['name'];
            $count = $deptModuleCounts[$id] ?? ($catModuleCounts[$name] ?? 0);
            $dept['modules_count'] = $count;
        }

        return $this->respond([
            'status' => 'success',
            'count'  => count($departments),
            'data'   => $departments,
        ]);
    }

    public function show($id = null)
    {
        $deptModel = new DepartmentModel();
        $dept = is_numeric($id) ? $deptModel->find((int)$id) : $deptModel->where('code', $id)->first();

        if (!$dept) {
            return $this->failNotFound('Department not found: ' . $id);
        }

        $dept['id'] = (int) $dept['id'];

        // Fetch associated modules
        $moduleModel = new ModuleModel();
        $modules = $moduleModel->where('department_id', $dept['id'])
            ->orWhere('category', $dept['name'])
            ->findAll();

        $dept['modules_count'] = count($modules);
        $dept['modules'] = $modules;

        return $this->respond([
            'status' => 'success',
            'data'   => $dept,
        ]);
    }

    public function create()
    {
        $data = $this->getRequestData();

        if (empty($data['name']) || empty($data['code'])) {
            return $this->failValidationErrors('Department Name and Code are required');
        }

        $deptModel = new DepartmentModel();
        $code = strtoupper(trim((string)$data['code']));

        // Check if code exists
        if ($deptModel->where('code', $code)->first()) {
            return $this->failResourceExists("Department with code '{$code}' already exists");
        }

        $now = date('Y-m-d H:i:s');
        $insertData = [
            'code'         => $code,
            'name'         => trim((string)$data['name']),
            'description'  => $data['description'] ?? '',
            'head_of_dept' => $data['head_of_dept'] ?? '',
            'email'        => $data['email'] ?? '',
            'phone'        => $data['phone'] ?? '',
            'status'       => $data['status'] ?? 'Active',
            'created_at'   => $now,
            'updated_at'   => $now,
        ];

        $id = $deptModel->insert($insertData);
        $created = $deptModel->find($id);
        $created['id'] = (int)$created['id'];
        $created['modules_count'] = 0;

        return $this->respondCreated([
            'status'  => 'success',
            'message' => 'Department created successfully',
            'data'    => $created,
        ]);
    }

    public function update($id = null)
    {
        if (!$id) {
            return $this->failValidationErrors('Department ID is required');
        }

        $deptModel = new DepartmentModel();
        $dept = $deptModel->find((int)$id);

        if (!$dept) {
            return $this->failNotFound('Department not found');
        }

        $data = $this->getRequestData();
        $updateFields = [];

        if (isset($data['name'])) {
            $updateFields['name'] = trim((string)$data['name']);
        }
        if (isset($data['code'])) {
            $code = strtoupper(trim((string)$data['code']));
            $existing = $deptModel->where('code', $code)->where('id !=', (int)$id)->first();
            if ($existing) {
                return $this->failResourceExists("Department code '{$code}' is already used by another department");
            }
            $updateFields['code'] = $code;
        }
        if (isset($data['description'])) {
            $updateFields['description'] = $data['description'];
        }
        if (isset($data['head_of_dept'])) {
            $updateFields['head_of_dept'] = $data['head_of_dept'];
        }
        if (isset($data['email'])) {
            $updateFields['email'] = $data['email'];
        }
        if (isset($data['phone'])) {
            $updateFields['phone'] = $data['phone'];
        }
        if (isset($data['status'])) {
            $updateFields['status'] = $data['status'];
        }

        $updateFields['updated_at'] = date('Y-m-d H:i:s');
        $deptModel->update((int)$id, $updateFields);

        $updated = $deptModel->find((int)$id);
        $updated['id'] = (int)$updated['id'];

        return $this->respond([
            'status'  => 'success',
            'message' => 'Department updated successfully',
            'data'    => $updated,
        ]);
    }

    public function delete($id = null)
    {
        if (!$id) {
            return $this->failValidationErrors('Department ID is required');
        }

        $deptModel = new DepartmentModel();
        $dept = $deptModel->find((int)$id);

        if (!$dept) {
            return $this->failNotFound('Department not found');
        }

        $deptModel->delete((int)$id);

        return $this->respondDeleted([
            'status'  => 'success',
            'message' => 'Department deleted successfully',
        ]);
    }
}
