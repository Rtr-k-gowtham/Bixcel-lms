<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class CourseController extends ResourceController
{
    protected $format = 'json';

    /**
     * In-memory sample courses for initial integration & testing
     */
    private static array $sampleCourses = [
        [
            'id'          => 1,
            'title'       => 'Introduction to Full-Stack Web Development',
            'instructor'  => 'Alex Morgan',
            'level'       => 'Beginner',
            'duration'    => '8 Weeks',
            'enrolled'    => 142,
            'description' => 'Master modern frontend and backend architectures with React and CodeIgniter 4.',
        ],
        [
            'id'          => 2,
            'title'       => 'Modern React with Vite & Tailwind CSS',
            'instructor'  => 'Sophia Chen',
            'level'       => 'Intermediate',
            'duration'    => '6 Weeks',
            'enrolled'    => 98,
            'description' => 'Build high-performance, reactive user interfaces with modern React paradigms.',
        ],
        [
            'id'          => 3,
            'title'       => 'RESTful API Development with PHP CodeIgniter 4',
            'instructor'  => 'David Miller',
            'level'       => 'Intermediate',
            'duration'    => '5 Weeks',
            'enrolled'    => 115,
            'description' => 'Design secure, scalable RESTful APIs, manage databases, authentication, and CORS.',
        ],
    ];

    public function index()
    {
        return $this->respond([
            'status'  => 'success',
            'count'   => count(self::$sampleCourses),
            'data'    => self::$sampleCourses,
        ]);
    }

    public function show($id = null)
    {
        foreach (self::$sampleCourses as $course) {
            if ($course['id'] == $id) {
                return $this->respond([
                    'status' => 'success',
                    'data'   => $course,
                ]);
            }
        }

        return $this->failNotFound("Course with ID {$id} not found.");
    }

    public function create()
    {
        $input = $this->request->getJSON(true) ?? $this->request->getPost();

        if (empty($input['title'])) {
            return $this->failValidationErrors(['title' => 'Title is required.']);
        }

        $newCourse = [
            'id'          => time(),
            'title'       => $input['title'] ?? 'Untitled Course',
            'instructor'  => $input['instructor'] ?? 'Anonymous',
            'level'       => $input['level'] ?? 'All Levels',
            'duration'    => $input['duration'] ?? 'Self-paced',
            'enrolled'    => 1,
            'description' => $input['description'] ?? '',
        ];

        return $this->respondCreated([
            'status'  => 'success',
            'message' => 'Course created successfully.',
            'data'    => $newCourse,
        ]);
    }
}
