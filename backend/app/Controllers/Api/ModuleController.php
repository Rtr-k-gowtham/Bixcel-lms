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
                'version'            => 'v2.0',
                'category'           => $mod['category'] ?? 'Engineering',
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
                'version'            => 'v2.0',
                'category'           => $mod['category'],
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
            'version'            => $data['version'] ?? 'v1.0',
            'category'           => $data['category'] ?? 'General',
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

        $lessonTemplates = [
            1 => [
                'day_title' => 'Foundations & Architecture Overview',
                'lessons' => [
                    [
                        'sno' => 1,
                        'title' => 'Core Concepts & Domain Foundations',
                        'description' => 'Introduction to core principles, terminology, design patterns, and environment configuration.',
                        'duration' => '45 mins',
                    ],
                    [
                        'sno' => 2,
                        'title' => 'Workflow Tooling & Component Setup',
                        'description' => 'Hands-on project scaffolding, repository structure, and linting rules setup.',
                        'duration' => '60 mins',
                    ],
                ],
            ],
            2 => [
                'day_title' => 'Deep Dive & Practical Implementation',
                'lessons' => [
                    [
                        'sno' => 1,
                        'title' => 'Practical Paradigms & Syntax Mastery',
                        'description' => 'Exploration of functional mechanics, data structures, and edge-case error boundaries.',
                        'duration' => '50 mins',
                    ],
                    [
                        'sno' => 2,
                        'title' => 'Guided Code-Along & Component Prototyping',
                        'description' => 'Interactive coding session building robust and reusable modules.',
                        'duration' => '60 mins',
                    ],
                ],
            ],
            3 => [
                'day_title' => 'Integration & Asynchronous Data Flows',
                'lessons' => [
                    [
                        'sno' => 1,
                        'title' => 'State Synchronization & API Contracts',
                        'description' => 'Consuming RESTful payloads, request lifecycle management, and optimistic UI updating.',
                        'duration' => '55 mins',
                    ],
                    [
                        'sno' => 2,
                        'title' => 'Validation, Sanitation & Error Handling',
                        'description' => 'Defensive validation strategies, user feedback toasts, and rollback hooks.',
                        'duration' => '45 mins',
                    ],
                ],
            ],
        ];

        for ($d = 1; $d <= $days; $d++) {
            if (isset($lessonTemplates[$d])) {
                $curriculum[] = [
                    'day'       => $d,
                    'day_title' => "Day {$d}: " . $lessonTemplates[$d]['day_title'],
                    'lessons'   => $lessonTemplates[$d]['lessons'],
                ];
            } else {
                $curriculum[] = [
                    'day'       => $d,
                    'day_title' => "Day {$d}: Advanced Application & Assessment",
                    'lessons'   => [
                        [
                            'sno'         => 1,
                            'title'       => "Lecture: Advanced Topics in {$title} (Part {$d})",
                            'description' => "Detailed theoretical and structural exploration of topics for day {$d}.",
                            'duration'    => '45 mins',
                        ],
                        [
                            'sno'         => 2,
                            'title'       => "Practical Lab: Hands-On Exercise {$d}",
                            'description' => "Real-world engineering challenge applying lessons learned in day {$d}.",
                            'duration'    => '60 mins',
                        ],
                    ],
                ];
            }
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
