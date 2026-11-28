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

    /**
     * Lists all modules directly from the database without hardcoded fallbacks or auto-seeding.
     */
    public function index()
    {
        $moduleModel = new ModuleModel();
        $dbModules = $moduleModel->findAll();

        $modules = [];
        foreach ($dbModules as $mod) {
            $curriculum = null;
            if (!empty($mod['curriculum_lessons'])) {
                $curriculum = is_string($mod['curriculum_lessons'])
                    ? json_decode($mod['curriculum_lessons'], true)
                    : $mod['curriculum_lessons'];
            }
            if (empty($curriculum) || !is_array($curriculum)) {
                $curriculum = [];
            }

            $totalLessons = 0;
            $totalTasks = 0;
            $totalTests = 0;
            foreach ($curriculum as $dayItem) {
                foreach ($dayItem['lessons'] ?? [] as $item) {
                    $itemType = strtolower((string)($item['type'] ?? 'lesson'));
                    if ($itemType === 'task') {
                        $totalTasks++;
                    } elseif ($itemType === 'test' || $itemType === 'quiz') {
                        $totalTests++;
                    } else {
                        $totalLessons++;
                    }
                }
            }

            $modules[] = [
                'id'                 => (int) $mod['id'],
                'title'              => $mod['title'],
                'code'               => $mod['code'],
                'category'           => $mod['category'] ?? 'Engineering',
                'tutor'              => $mod['tutor'] ?? '',
                'status'             => $mod['status'] ?? 'Published',
                'days'               => count($curriculum) > 0 ? count($curriculum) : (int) ($mod['duration_days'] ?? 1),
                'lessons'            => $totalLessons,
                'curriculum_lessons' => $curriculum,
                'tasks'              => $totalTasks,
                'assignments'        => 0,
                'tests'              => $totalTests,
                'milestones'         => 1,
                'updated_at'         => substr($mod['updated_at'] ?? date('Y-m-d'), 0, 10),
                'description'        => $mod['description'] ?? '',
                'credits'            => (int) ($mod['credits'] ?? 3),
                'level'              => $mod['level'] ?? 'Intermediate',
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

        $curriculum = null;
        if (!empty($mod['curriculum_lessons'])) {
            $curriculum = is_string($mod['curriculum_lessons'])
                ? json_decode($mod['curriculum_lessons'], true)
                : $mod['curriculum_lessons'];
        }
        if (empty($curriculum) || !is_array($curriculum)) {
            $curriculum = [];
        }

        $totalLessons = 0;
        $totalTasks = 0;
        $totalTests = 0;
        foreach ($curriculum as $dayItem) {
            foreach ($dayItem['lessons'] ?? [] as $item) {
                $itemType = strtolower((string)($item['type'] ?? 'lesson'));
                if ($itemType === 'task') {
                    $totalTasks++;
                } elseif ($itemType === 'test' || $itemType === 'quiz') {
                    $totalTests++;
                } else {
                    $totalLessons++;
                }
            }
        }

        return $this->respond([
            'status' => 'success',
            'data'   => [
                'id'                 => (int) $mod['id'],
                'title'              => $mod['title'],
                'code'               => $mod['code'],
                'category'           => $mod['category'],
                'tutor'              => $mod['tutor'] ?? '',
                'status'             => $mod['status'],
                'days'               => count($curriculum) > 0 ? count($curriculum) : (int) ($mod['duration_days'] ?? 1),
                'lessons'            => $totalLessons,
                'curriculum_lessons' => $curriculum,
                'tasks'              => $totalTasks,
                'assignments'        => 0,
                'tests'              => $totalTests,
                'milestones'         => 0,
                'updated_at'         => substr($mod['updated_at'] ?? date('Y-m-d'), 0, 10),
                'description'        => $mod['description'],
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

        $curriculum = null;
        if (!empty($data['curriculum_lessons'])) {
            $curriculum = is_string($data['curriculum_lessons'])
                ? json_decode($data['curriculum_lessons'], true)
                : $data['curriculum_lessons'];
        }
        if (empty($curriculum) || !is_array($curriculum)) {
            $curriculum = $this->generateDefaultCurriculum((string) $data['title'], (int) ($data['days'] ?? 7));
        }

        $totalDays = count($curriculum);
        $totalLessons = 0;
        foreach ($curriculum as $dayItem) {
            $totalLessons += count($dayItem['lessons'] ?? []);
        }

        $id = $moduleModel->insert([
            'code'               => $code,
            'title'              => trim((string) $data['title']),
            'category'           => $data['category'] ?? 'Engineering',
            'tutor'              => !empty($data['tutor']) ? trim((string) $data['tutor']) : null,
            'duration_days'      => $totalDays > 0 ? $totalDays : (int) ($data['days'] ?? 10),
            'credits'            => (int) ($data['credits'] ?? 3),
            'level'              => $data['level'] ?? 'Intermediate',
            'description'        => $data['description'] ?? '',
            'status'             => $data['status'] ?? 'Active',
            'curriculum_lessons' => json_encode($curriculum),
            'created_at'         => $now,
            'updated_at'         => $now,
        ]);

        $newModule = [
            'id'                 => (int) $id,
            'title'              => trim((string) $data['title']),
            'code'               => $code,
            'category'           => $data['category'] ?? 'General',
            'tutor'              => $data['tutor'] ?? '',
            'status'             => $data['status'] ?? 'Draft',
            'days'               => $totalDays > 0 ? $totalDays : (int) ($data['days'] ?? 5),
            'lessons'            => $totalLessons > 0 ? $totalLessons : (int) ($data['lessons'] ?? 10),
            'curriculum_lessons' => $curriculum,
            'tasks'              => 4,
            'assignments'        => 2,
            'tests'              => 1,
            'milestones'         => 1,
            'updated_at'         => date('Y-m-d'),
            'description'        => $data['description'] ?? '',
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
        if (isset($data['tutor'])) $update['tutor'] = trim((string) $data['tutor']);
        if (isset($data['days'])) $update['duration_days'] = (int) $data['days'];
        if (isset($data['description'])) $update['description'] = $data['description'];
        if (isset($data['status'])) $update['status'] = $data['status'];
        if (isset($data['curriculum_lessons'])) {
            $curriculum = is_string($data['curriculum_lessons'])
                ? json_decode($data['curriculum_lessons'], true)
                : $data['curriculum_lessons'];
            $update['curriculum_lessons'] = json_encode($curriculum);
            if (!empty($curriculum) && is_array($curriculum)) {
                $update['duration_days'] = count($curriculum);
            }
        }
        $update['updated_at'] = date('Y-m-d H:i:s');

        $moduleModel->update($id, $update);

        return $this->respond([
            'status'  => 'success',
            'message' => 'Module updated in database',
            'data'    => array_merge($mod, $update),
        ]);
    }

    private function generateDefaultCurriculum(string $title, int $days): array
    {
        $curriculum = [];
        $days = max(1, min(60, $days));

        for ($d = 1; $d <= $days; $d++) {
            $curriculum[] = [
                'day'       => $d,
                'day_title' => "Day {$d}: Course Topics",
                'lessons'   => [],
            ];
        }

        return $curriculum;
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
