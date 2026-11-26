<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use App\Models\ModuleModel;
use CodeIgniter\RESTful\ResourceController;

class ModuleController extends BaseApiController
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
        $moduleModel = new ModuleModel();
        $dbModules = $moduleModel->findAll();

        $modules = [];
        foreach ($dbModules as $mod) {
            $modules[] = [
                'id'          => (int) $mod['id'],
                'title'       => $mod['title'],
                'code'        => $mod['code'],
                'version'     => 'v2.0',
                'category'    => $mod['category'] ?? 'Engineering',
                'status'      => $mod['status'] ?? 'Published',
                'days'        => (int) ($mod['duration_days'] ?? 10),
                'lessons'     => (int) (($mod['duration_days'] ?? 10) * 2),
                'tasks'       => 6,
                'assignments' => 3,
                'tests'       => 2,
                'milestones'  => 1,
                'updated_at'  => substr($mod['updated_at'] ?? date('Y-m-d'), 0, 10),
                'description' => $mod['description'] ?? '',
            ];
        }

        return $this->respond([
            'status' => 'success',
            'count'  => count($modules),
            'data'   => $modules,
        ]);
    }

    public function show($id = null)
    {
        $moduleModel = new ModuleModel();
        $mod = $moduleModel->where('id', $id)->orWhere('code', $id)->first();

        if (!$mod) {
            return $this->failNotFound('Module not found: ' . $id);
        }

        return $this->respond([
            'status' => 'success',
            'data'   => [
                'id'          => (int) $mod['id'],
                'title'       => $mod['title'],
                'code'        => $mod['code'],
                'version'     => 'v2.0',
                'category'    => $mod['category'],
                'status'      => $mod['status'],
                'days'        => (int) $mod['duration_days'],
                'lessons'     => (int) ($mod['duration_days'] * 2),
                'tasks'       => 6,
                'assignments' => 3,
                'tests'       => 2,
                'milestones'  => 1,
                'updated_at'  => substr($mod['updated_at'] ?? date('Y-m-d'), 0, 10),
                'description' => $mod['description'],
            ],
        ]);
    }

    public function create()
    {
        $data = $this->getRequestData();

        if (empty($data['title']) || empty($data['code'])) {
            return $this->failValidationErrors('Title and Code are required');
        }

        $now = date('Y-m-d H:i:s');
        $moduleModel = new ModuleModel();
        $code = strtoupper(trim((string) $data['code']));

        $id = $moduleModel->insert([
            'code'          => $code,
            'title'         => trim((string) $data['title']),
            'category'      => $data['category'] ?? 'Engineering',
            'duration_days' => (int) ($data['days'] ?? 10),
            'credits'       => (int) ($data['credits'] ?? 3),
            'level'         => $data['level'] ?? 'Intermediate',
            'description'   => $data['description'] ?? '',
            'status'        => $data['status'] ?? 'Active',
            'created_at'    => $now,
            'updated_at'    => $now,
        ]);

        $newModule = [
            'id'          => (int) $id,
            'title'       => trim((string) $data['title']),
            'code'        => $code,
            'version'     => $data['version'] ?? 'v1.0',
            'category'    => $data['category'] ?? 'General',
            'status'      => $data['status'] ?? 'Draft',
            'days'        => (int) ($data['days'] ?? 5),
            'lessons'     => (int) ($data['lessons'] ?? 10),
            'tasks'       => 4,
            'assignments' => 2,
            'tests'       => 1,
            'milestones'  => 1,
            'updated_at'  => date('Y-m-d'),
            'description' => $data['description'] ?? '',
        ];

        return $this->respondCreated([
            'status'  => 'success',
            'message' => 'Module created successfully in database',
            'data'    => $newModule,
        ]);
    }

    public function update($id = null)
    {
        $data = $this->getRequestData();

        $moduleModel = new ModuleModel();
        $mod = $moduleModel->find($id);

        if (!$mod) {
            return $this->failNotFound('Module not found to update');
        }

        $update = [];
        if (isset($data['title'])) $update['title'] = trim((string) $data['title']);
        if (isset($data['code'])) $update['code'] = strtoupper(trim((string) $data['code']));
        if (isset($data['category'])) $update['category'] = $data['category'];
        if (isset($data['days'])) $update['duration_days'] = (int) $data['days'];
        if (isset($data['description'])) $update['description'] = $data['description'];
        if (isset($data['status'])) $update['status'] = $data['status'];
        $update['updated_at'] = date('Y-m-d H:i:s');

        $moduleModel->update($id, $update);

        return $this->respond([
            'status'  => 'success',
            'message' => 'Module updated in database',
            'data'    => array_merge($mod, $update),
        ]);
    }

    public function delete($id = null)
    {
        $moduleModel = new ModuleModel();
        $mod = $moduleModel->find($id);

        if (!$mod) {
            return $this->failNotFound('Module not found to delete');
        }

        $moduleModel->delete($id);

        return $this->respondDeleted([
            'status'  => 'success',
            'message' => 'Module deleted from database',
        ]);
    }
}
