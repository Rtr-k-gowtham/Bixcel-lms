<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class ModuleController extends ResourceController
{
    protected $format = 'json';

    private static array $modules = [
        [
            'id'          => 1,
            'title'       => 'Introduction to Graphic Design',
            'code'        => 'MOD-DES-101',
            'version'     => 'v2.1',
            'category'    => 'Design',
            'status'      => 'Published',
            'days'        => 7,
            'lessons'     => 14,
            'tasks'       => 6,
            'assignments' => 3,
            'tests'       => 2,
            'milestones'  => 1,
            'updated_at'  => '2026-11-18',
            'description' => 'Fundamental principles of color theory, typography, grid layouts, and visual hierarchy using industry tools.',
        ],
        [
            'id'          => 2,
            'title'       => 'UI Wireframing & Prototyping in Figma',
            'code'        => 'MOD-UIX-204',
            'version'     => 'v1.4',
            'category'    => 'UI/UX',
            'status'      => 'Published',
            'days'        => 10,
            'lessons'     => 18,
            'tasks'       => 10,
            'assignments' => 4,
            'tests'       => 3,
            'milestones'  => 2,
            'updated_at'  => '2026-11-20',
            'description' => 'Hands-on interactive prototyping, responsive auto-layouts, micro-animations, and user flow architectures.',
        ],
        [
            'id'          => 3,
            'title'       => 'Modern JavaScript & TypeScript Architecture',
            'code'        => 'MOD-DEV-301',
            'version'     => 'v3.0',
            'category'    => 'Programming',
            'status'      => 'Published',
            'days'        => 14,
            'lessons'     => 24,
            'tasks'       => 16,
            'assignments' => 6,
            'tests'       => 4,
            'milestones'  => 3,
            'updated_at'  => '2026-11-22',
            'description' => 'ES6+, functional programming paradigms, asynchronous patterns, TypeScript interfaces, and unit testing.',
        ],
        [
            'id'          => 4,
            'title'       => 'Responsive Layouts & Tailwind CSS',
            'code'        => 'MOD-CSS-102',
            'version'     => 'v2.0',
            'category'    => 'Programming',
            'status'      => 'Published',
            'days'        => 5,
            'lessons'     => 10,
            'tasks'       => 8,
            'assignments' => 2,
            'tests'       => 1,
            'milestones'  => 1,
            'updated_at'  => '2026-11-15',
            'description' => 'Utility-first CSS styling, mobile-first responsive breakpoints, dark mode tokens, and custom animation curves.',
        ],
        [
            'id'          => 5,
            'title'       => 'RESTful API Integration & Async State',
            'code'        => 'MOD-API-402',
            'version'     => 'v1.2',
            'category'    => 'Programming',
            'status'      => 'Draft',
            'days'        => 8,
            'lessons'     => 12,
            'tasks'       => 8,
            'assignments' => 3,
            'tests'       => 2,
            'milestones'  => 1,
            'updated_at'  => '2026-11-24',
            'description' => 'Axios client configurations, token authentication workflows, optimistic mutations, and preflight CORS handling.',
        ],
        [
            'id'          => 6,
            'title'       => 'Design Systems & Component Tokens',
            'code'        => 'MOD-UIX-305',
            'version'     => 'v1.0',
            'category'    => 'UI/UX',
            'status'      => 'Draft',
            'days'        => 6,
            'lessons'     => 12,
            'tasks'       => 6,
            'assignments' => 2,
            'tests'       => 2,
            'milestones'  => 1,
            'updated_at'  => '2026-11-25',
            'description' => 'Building scalable design systems with atomic design tokens, accessibility standards (WCAG AAA), and Figma variables.',
        ],
    ];

    public function index()
    {
        return $this->respond([
            'status' => 'success',
            'count'  => count(self::$modules),
            'data'   => self::$modules,
        ]);
    }

    public function show($id = null)
    {
        $id = (int)$id;
        foreach (self::$modules as $mod) {
            if ($mod['id'] === $id) {
                return $this->respond([
                    'status' => 'success',
                    'data'   => $mod,
                ]);
            }
        }
        return $this->failNotFound('Module not found: ' . $id);
    }

    public function create()
    {
        $data = $this->request->getJSON(true) ?? $this->request->getPost();

        if (empty($data['title']) || empty($data['code'])) {
            return $this->failValidationErrors('Title and Code are required');
        }

        $newModule = [
            'id'          => count(self::$modules) + 1,
            'title'       => $data['title'],
            'code'        => strtoupper($data['code']),
            'version'     => $data['version'] ?? 'v1.0',
            'category'    => $data['category'] ?? 'General',
            'status'      => $data['status'] ?? 'Draft',
            'days'        => (int)($data['days'] ?? 5),
            'lessons'     => (int)($data['lessons'] ?? 10),
            'tasks'       => (int)($data['tasks'] ?? 4),
            'assignments' => (int)($data['assignments'] ?? 2),
            'tests'       => (int)($data['tests'] ?? 1),
            'milestones'  => (int)($data['milestones'] ?? 1),
            'updated_at'  => date('Y-m-d'),
            'description' => $data['description'] ?? '',
        ];

        self::$modules[] = $newModule;

        return $this->respondCreated([
            'status'  => 'success',
            'message' => 'Module created successfully',
            'data'    => $newModule,
        ]);
    }

    public function update($id = null)
    {
        $id = (int)$id;
        $data = $this->request->getJSON(true) ?? $this->request->getRawInput();

        foreach (self::$modules as &$mod) {
            if ($mod['id'] === $id) {
                foreach ($data as $key => $val) {
                    $mod[$key] = $val;
                }
                $mod['updated_at'] = date('Y-m-d');
                return $this->respond([
                    'status'  => 'success',
                    'message' => 'Module updated',
                    'data'    => $mod,
                ]);
            }
        }
        return $this->failNotFound('Module not found to update');
    }

    public function delete($id = null)
    {
        $id = (int)$id;
        foreach (self::$modules as $idx => $mod) {
            if ($mod['id'] === $id) {
                array_splice(self::$modules, $idx, 1);
                return $this->respondDeleted([
                    'status'  => 'success',
                    'message' => 'Module deleted',
                ]);
            }
        }
        return $this->failNotFound('Module not found to delete');
    }
}
