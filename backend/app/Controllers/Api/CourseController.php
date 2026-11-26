<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use App\Models\CourseModel;
use CodeIgniter\RESTful\ResourceController;

class CourseController extends BaseApiController
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
        $courseModel = new CourseModel();
        $dbCourses = $courseModel->findAll();

        $courses = [];
        foreach ($dbCourses as $c) {
            $courses[] = [
                'id' => (int) $c['id'],
                'title' => $c['title'],
                'instructor' => $c['instructor'] ?? 'Lead Instructor',
                'level' => $c['level'] ?? 'Intermediate',
                'duration' => $c['duration'] ?? '8 Weeks',
                'enrolled' => 0,
                'description' => $c['description'] ?? '',
            ];
        }

        return $this->respond([
            'status' => 'success',
            'count' => count($courses),
            'data' => $courses,
        ]);
    }

    public function show($id = null)
    {
        $courseModel = new CourseModel();
        $c = $courseModel->find($id);

        if (!$c) {
            return $this->failNotFound("Course with ID {$id} not found.");
        }

        return $this->respond([
            'status' => 'success',
            'data' => [
                'id' => (int) $c['id'],
                'title' => $c['title'],
                'instructor' => $c['instructor'],
                'level' => $c['level'],
                'duration' => $c['duration'],
                'enrolled' => 0,
                'description' => $c['description'],
            ],
        ]);
    }

    public function create()
    {
        $input = $this->getRequestData();

        if (empty($input['title'])) {
            return $this->failValidationErrors(['title' => 'Title is required.']);
        }

        $now = date('Y-m-d H:i:s');
        $courseData = [
            'title' => trim((string) $input['title']),
            'instructor' => $input['instructor'] ?? 'Anonymous',
            'level' => $input['level'] ?? 'All Levels',
            'duration' => $input['duration'] ?? 'Self-paced',
            'description' => $input['description'] ?? '',
            'created_at' => $now,
            'updated_at' => $now,
        ];

        $courseModel = new CourseModel();
        $id = $courseModel->insert($courseData);

        $newCourse = [
            'id' => (int) $id,
            'title' => $courseData['title'],
            'instructor' => $courseData['instructor'],
            'level' => $courseData['level'],
            'duration' => $courseData['duration'],
            'enrolled' => 1,
            'description' => $courseData['description'],
        ];

        return $this->respondCreated([
            'status' => 'success',
            'message' => 'Course created successfully in database.',
            'data' => $newCourse,
        ]);
    }
}
