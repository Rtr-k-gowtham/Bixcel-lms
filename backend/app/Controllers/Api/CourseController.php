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
        $search = $this->request->getGet('search');
        $category = $this->request->getGet('category');
        $level = $this->request->getGet('level');

        $courseModel = new CourseModel();
        $query = $courseModel;

        if (!empty($search)) {
            $query = $query->groupStart()
                ->like('title', $search)
                ->orLike('code', $search)
                ->orLike('instructor', $search)
                ->groupEnd();
        }

        if (!empty($category) && $category !== 'all') {
            $query = $query->where('category', $category);
        }

        if (!empty($level) && $level !== 'all') {
            $query = $query->where('level', $level);
        }

        $dbCourses = $query->orderBy('id', 'DESC')->findAll();

        $courses = [];
        foreach ($dbCourses as $c) {
            $moduleIds = [];
            if (!empty($c['module_ids'])) {
                $moduleIds = is_string($c['module_ids'])
                    ? json_decode($c['module_ids'], true)
                    : $c['module_ids'];
                if (!is_array($moduleIds)) {
                    $moduleIds = [];
                }
            }

            $courses[] = [
                'id'          => (int) $c['id'],
                'title'       => $c['title'],
                'code'        => $c['code'] ?? ('CRS-' . str_pad($c['id'], 3, '0', STR_PAD_LEFT)),
                'category'    => $c['category'] ?? 'Engineering',
                'instructor'  => $c['instructor'] ?? 'Lead Instructor',
                'level'       => $c['level'] ?? 'Intermediate',
                'price'       => (float) ($c['price'] ?? 0.00),
                'days'        => (int) ($c['days'] ?? 0),
                'module_ids'  => $moduleIds,
                'status'      => $c['status'] ?? 'Published',
                'duration'    => $c['duration'] ?? (($c['days'] ?? 0) . ' Days'),
                'enrolled'    => 0,
                'description' => $c['description'] ?? '',
                'created_at'  => $c['created_at'],
                'updated_at'  => $c['updated_at'],
            ];
        }

        return $this->respond([
            'status' => 'success',
            'count'  => count($courses),
            'data'   => $courses,
        ]);
    }

    public function show($id = null)
    {
        $courseModel = new CourseModel();
        $c = $courseModel->where('id', $id)->orWhere('code', $id)->first();

        if (!$c) {
            return $this->failNotFound("Course with ID {$id} not found.");
        }

        $moduleIds = [];
        if (!empty($c['module_ids'])) {
            $moduleIds = is_string($c['module_ids'])
                ? json_decode($c['module_ids'], true)
                : $c['module_ids'];
            if (!is_array($moduleIds)) {
                $moduleIds = [];
            }
        }

        return $this->respond([
            'status' => 'success',
            'data'   => [
                'id'          => (int) $c['id'],
                'title'       => $c['title'],
                'code'        => $c['code'] ?? ('CRS-' . str_pad($c['id'], 3, '0', STR_PAD_LEFT)),
                'category'    => $c['category'] ?? 'Engineering',
                'instructor'  => $c['instructor'],
                'level'       => $c['level'],
                'price'       => (float) ($c['price'] ?? 0.00),
                'days'        => (int) ($c['days'] ?? 0),
                'module_ids'  => $moduleIds,
                'status'      => $c['status'] ?? 'Published',
                'duration'    => $c['duration'] ?? (($c['days'] ?? 0) . ' Days'),
                'enrolled'    => 0,
                'description' => $c['description'],
                'created_at'  => $c['created_at'],
                'updated_at'  => $c['updated_at'],
            ],
        ]);
    }

    public function create()
    {
        $input = $this->getRequestData();

        if (empty($input['title'])) {
            return $this->failValidationErrors(['title' => 'Title is required.']);
        }

        $moduleIds = $input['module_ids'] ?? [];
        if (is_array($moduleIds)) {
            $moduleIdsJson = json_encode(array_values($moduleIds));
        } else {
            $moduleIdsJson = is_string($moduleIds) ? $moduleIds : '[]';
        }

        $days = isset($input['days']) ? (int) $input['days'] : 0;
        $price = isset($input['price']) ? (float) $input['price'] : 0.00;

        $now = date('Y-m-d H:i:s');
        $courseData = [
            'title'       => trim((string) $input['title']),
            'code'        => !empty($input['code']) ? trim((string) $input['code']) : ('CRS-' . strtoupper(substr(uniqid(), -6))),
            'category'    => $input['category'] ?? 'Engineering',
            'instructor'  => $input['instructor'] ?? 'Lead Instructor',
            'level'       => $input['level'] ?? 'Intermediate',
            'price'       => $price,
            'days'        => $days,
            'module_ids'  => $moduleIdsJson,
            'status'      => $input['status'] ?? 'Published',
            'duration'    => !empty($input['duration']) ? $input['duration'] : ($days > 0 ? "{$days} Days" : 'Self-paced'),
            'description' => $input['description'] ?? '',
            'created_at'  => $now,
            'updated_at'  => $now,
        ];

        $courseModel = new CourseModel();
        $id = $courseModel->insert($courseData);

        $newCourse = [
            'id'          => (int) $id,
            'title'       => $courseData['title'],
            'code'        => $courseData['code'],
            'category'    => $courseData['category'],
            'instructor'  => $courseData['instructor'],
            'level'       => $courseData['level'],
            'price'       => $courseData['price'],
            'days'        => $courseData['days'],
            'module_ids'  => is_array($moduleIds) ? $moduleIds : json_decode($moduleIdsJson, true),
            'status'      => $courseData['status'],
            'duration'    => $courseData['duration'],
            'enrolled'    => 0,
            'description' => $courseData['description'],
            'created_at'  => $now,
            'updated_at'  => $now,
        ];

        return $this->respondCreated([
            'status'  => 'success',
            'message' => 'Course created successfully.',
            'data'    => $newCourse,
        ]);
    }

    public function update($id = null)
    {
        $courseModel = new CourseModel();
        $course = $courseModel->find($id);

        if (!$course) {
            return $this->failNotFound("Course with ID {$id} not found to update.");
        }

        $input = $this->getRequestData();

        $updateData = [];
        if (isset($input['title'])) $updateData['title'] = trim((string) $input['title']);
        if (isset($input['code'])) $updateData['code'] = trim((string) $input['code']);
        if (isset($input['category'])) $updateData['category'] = $input['category'];
        if (isset($input['instructor'])) $updateData['instructor'] = $input['instructor'];
        if (isset($input['level'])) $updateData['level'] = $input['level'];
        if (isset($input['price'])) $updateData['price'] = (float) $input['price'];
        if (isset($input['days'])) $updateData['days'] = (int) $input['days'];
        if (isset($input['status'])) $updateData['status'] = $input['status'];
        if (isset($input['duration'])) $updateData['duration'] = $input['duration'];
        if (isset($input['description'])) $updateData['description'] = $input['description'];

        if (isset($input['module_ids'])) {
            $updateData['module_ids'] = is_array($input['module_ids'])
                ? json_encode(array_values($input['module_ids']))
                : (string) $input['module_ids'];
        }

        $updateData['updated_at'] = date('Y-m-d H:i:s');

        $courseModel->update($id, $updateData);
        $refreshed = $courseModel->find($id);

        $moduleIds = [];
        if (!empty($refreshed['module_ids'])) {
            $moduleIds = is_string($refreshed['module_ids'])
                ? json_decode($refreshed['module_ids'], true)
                : $refreshed['module_ids'];
        }

        $refreshed['id'] = (int) $refreshed['id'];
        $refreshed['price'] = (float) ($refreshed['price'] ?? 0.00);
        $refreshed['days'] = (int) ($refreshed['days'] ?? 0);
        $refreshed['module_ids'] = is_array($moduleIds) ? $moduleIds : [];

        return $this->respond([
            'status'  => 'success',
            'message' => 'Course updated successfully.',
            'data'    => $refreshed,
        ]);
    }

    public function delete($id = null)
    {
        $courseModel = new CourseModel();
        $course = $courseModel->find($id);

        if (!$course) {
            return $this->failNotFound("Course with ID {$id} not found to delete.");
        }

        $courseModel->delete($id);

        return $this->respondDeleted([
            'status'  => 'success',
            'message' => 'Course deleted successfully.',
        ]);
    }
}
