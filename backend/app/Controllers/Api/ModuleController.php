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

        // Ensure rich modules with curriculum exist
        $hasDevModule = false;
        foreach ($dbModules as $m) {
            if (isset($m['code']) && str_starts_with($m['code'], 'MOD-DEV')) {
                $hasDevModule = true;
                break;
            }
        }

        if (!$hasDevModule) {
            $defaultDevModules = [
                [
                    'code' => 'MOD-DEV-01',
                    'title' => 'Modern Frontend Architecture (React 19 & Next.js)',
                    'category' => 'Full-Stack Web Development',
                    'tutor' => 'Dr. Marcus Vance',
                    'status' => 'Published',
                    'duration_days' => 12,
                    'description' => 'Advanced component patterns, React 19 server actions, Suspense streaming, and Lighthouse 100 performance.',
                    'curriculum_lessons' => json_encode([
                        [
                            'day' => 1,
                            'day_title' => 'Day 1: Component Hierarchy & Props Contracts',
                            'lessons' => [
                                ['sno' => 1, 'type' => 'lesson', 'title' => 'Modern Component Hierarchy & Props Contracts', 'duration' => '90 mins', 'format' => 'Interactive Lecture', 'description' => 'Component decomposition, TypeScript prop interfaces, pure rendering functions.']
                            ]
                        ],
                        [
                            'day' => 2,
                            'day_title' => 'Day 2: State Management & Context API Patterns',
                            'lessons' => [
                                ['sno' => 1, 'type' => 'lesson', 'title' => 'Advanced State Management & Context API Patterns', 'duration' => '90 mins', 'format' => 'Lab Practicum', 'description' => 'Reducer patterns, avoid unnecessary re-renders, Context memoization.']
                            ]
                        ],
                        [
                            'day' => 8,
                            'day_title' => 'Day 8: Server-Side Rendering (SSR) & Streaming',
                            'lessons' => [
                                ['sno' => 1, 'type' => 'lesson', 'title' => 'Server-Side Rendering (SSR) & Streaming Suspense', 'duration' => '90 mins', 'format' => 'Hands-on Coding', 'description' => 'Next.js App Router, React Server Components boundaries, streaming HTML.']
                            ]
                        ],
                        [
                            'day' => 9,
                            'day_title' => 'Day 9: React 19 Server Actions & Optimistic UI',
                            'lessons' => [
                                ['sno' => 1, 'type' => 'lesson', 'title' => 'React 19 Server Actions & Optimistic UI Updates', 'duration' => '120 mins', 'format' => 'Live Lab Session', 'description' => 'useOptimistic, useActionState, instant form submission feedback without spinners.']
                            ]
                        ],
                        [
                            'day' => 10,
                            'day_title' => 'Day 10: Client Caching & RTK Query',
                            'lessons' => [
                                ['sno' => 1, 'type' => 'lesson', 'title' => 'Client-Side Caching, RTK Query & Mutation Invalidation', 'duration' => '90 mins', 'format' => 'Interactive Lecture', 'description' => 'Normalized caching, tag invalidation, optimistic query cache updates.']
                            ]
                        ],
                        [
                            'day' => 11,
                            'day_title' => 'Day 11: Enterprise Micro-Frontends',
                            'lessons' => [
                                ['sno' => 1, 'type' => 'lesson', 'title' => 'Enterprise Micro-Frontend Architecture & Module Federation', 'duration' => '90 mins', 'format' => 'System Design Seminar', 'description' => 'Independent deployment pipelines, runtime module sharing, version isolation.']
                            ]
                        ],
                        [
                            'day' => 12,
                            'day_title' => 'Day 12: Production Performance Profiling',
                            'lessons' => [
                                ['sno' => 1, 'type' => 'lesson', 'title' => 'Frontend Production Performance Profiling & Lighthouse 100', 'duration' => '90 mins', 'format' => 'Practical Audit Lab', 'description' => 'Core Web Vitals (LCP, INP, CLS), bundle size budget, code splitting.']
                            ]
                        ]
                    ]),
                ],
                [
                    'code' => 'MOD-DEV-02',
                    'title' => 'Backend Systems & CodeIgniter 4 REST API Engineering',
                    'category' => 'Full-Stack Web Development',
                    'tutor' => 'Elena Rostova',
                    'status' => 'Published',
                    'duration_days' => 10,
                    'description' => 'RESTful endpoints, JWT authentication filters, CORS, transaction management, and automated Swagger specs.',
                    'curriculum_lessons' => json_encode([
                        [
                            'day' => 1,
                            'day_title' => 'Day 1: REST Architecture & Routing',
                            'lessons' => [
                                ['sno' => 1, 'type' => 'lesson', 'title' => 'REST Architecture, Routing & HTTP Verbs Standards', 'duration' => '90 mins', 'format' => 'Architecture Lecture', 'description' => 'Idempotency, resource URI naming, HTTP status codes.']
                            ]
                        ],
                        [
                            'day' => 8,
                            'day_title' => 'Day 8: JWT Auth & RBAC Security',
                            'lessons' => [
                                ['sno' => 1, 'type' => 'lesson', 'title' => 'JWT Authentication & Role-Based Access Control Filters', 'duration' => '120 mins', 'format' => 'Security Workshop', 'description' => 'Token signing, refresh token rotation, CI4 Auth Filters.']
                            ]
                        ],
                        [
                            'day' => 9,
                            'day_title' => 'Day 9: Database Transactions & ACID',
                            'lessons' => [
                                ['sno' => 1, 'type' => 'lesson', 'title' => 'Database Transactions, ACID Guarantees & Repository Pattern', 'duration' => '90 mins', 'format' => 'Live Lab Session', 'description' => 'Isolation levels, rollbacks on error, decoupling business logic from models.']
                            ]
                        ],
                        [
                            'day' => 10,
                            'day_title' => 'Day 10: API Rate Limiting & Swagger Specs',
                            'lessons' => [
                                ['sno' => 1, 'type' => 'lesson', 'title' => 'API Rate Limiting, CORS & Swagger OpenAPI 3.0 Documentation', 'duration' => '90 mins', 'format' => 'Lab Practicum', 'description' => 'Redis token bucket rate limiter, automated swagger.json generation.']
                            ]
                        ]
                    ]),
                ],
                [
                    'code' => 'MOD-DEV-03',
                    'title' => 'PostgreSQL Database Indexing & Query Optimization',
                    'category' => 'Full-Stack Web Development',
                    'tutor' => 'Dr. Marcus Vance',
                    'status' => 'Published',
                    'duration_days' => 8,
                    'description' => 'B-Tree, GIN, GiST indexing strategies, EXPLAIN ANALYZE query planning, and connection pooling.',
                    'curriculum_lessons' => json_encode([
                        [
                            'day' => 7,
                            'day_title' => 'Day 7: Indexing Strategies',
                            'lessons' => [
                                ['sno' => 1, 'type' => 'lesson', 'title' => 'B-Tree, GIN & GiST Indexing Strategies', 'duration' => '90 mins', 'format' => 'Database Lab', 'description' => 'Composite indexes, partial indexing, JSONB full-text search.']
                            ]
                        ],
                        [
                            'day' => 8,
                            'day_title' => 'Day 8: EXPLAIN ANALYZE & Buffer Pools',
                            'lessons' => [
                                ['sno' => 1, 'type' => 'lesson', 'title' => 'Query Plan Analysis with EXPLAIN ANALYZE & Buffer Pools', 'duration' => '90 mins', 'format' => 'Performance Lab', 'description' => 'Eliminate sequential table scans, optimize joins, memory tuning.']
                            ]
                        ]
                    ]),
                ],
                [
                    'code' => 'MOD-DEV-04',
                    'title' => 'Containerization, Docker & CI/CD Cloud Pipelines',
                    'category' => 'Full-Stack Web Development',
                    'tutor' => 'Alan Wright',
                    'status' => 'Published',
                    'duration_days' => 6,
                    'description' => 'Multi-stage Docker builds, Docker Compose service orchestration, GitHub Actions CI/CD.',
                    'curriculum_lessons' => json_encode([
                        [
                            'day' => 1,
                            'day_title' => 'Day 1: Multi-Stage Dockerfiles',
                            'lessons' => [
                                ['sno' => 1, 'type' => 'lesson', 'title' => 'Multi-Stage Dockerfiles for Production Node & PHP', 'duration' => '90 mins', 'format' => 'Hands-on Lab', 'description' => 'Slim base images, non-root user execution, layer caching.']
                            ]
                        ],
                        [
                            'day' => 2,
                            'day_title' => 'Day 2: Docker Compose Orchestration',
                            'lessons' => [
                                ['sno' => 1, 'type' => 'lesson', 'title' => 'Docker Compose Orchestration & Volume Networking', 'duration' => '90 mins', 'format' => 'Hands-on Lab', 'description' => 'Multi-container backend + database + frontend networks, secrets management.']
                            ]
                        ],
                        [
                            'day' => 3,
                            'day_title' => 'Day 3: GitHub Actions CI/CD',
                            'lessons' => [
                                ['sno' => 1, 'type' => 'lesson', 'title' => 'GitHub Actions Automated Testing & Production Deployment', 'duration' => '90 mins', 'format' => 'CI/CD Lab', 'description' => 'Continuous integration workflows, SSH deploy keys, zero-downtime reloads.']
                            ]
                        ]
                    ]),
                ]
            ];

            foreach ($defaultDevModules as $dm) {
                try {
                    $moduleModel->insert($dm);
                } catch (\Throwable $e) {}
            }
            $dbModules = $moduleModel->findAll();
        }

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
