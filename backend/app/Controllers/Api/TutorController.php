<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use App\Models\TutorModel;
use CodeIgniter\RESTful\ResourceController;

class TutorController extends BaseApiController
{
    protected $format = 'json';

    public function __construct()
    {
        DatabaseBootstrapper::ensureInitialized();
        $this->request ??= \Config\Services::request();
        $this->response ??= \Config\Services::response();
    }

    /**
     * List tutors
     */
    public function index()
    {
        $search = $this->request->getGet('search');
        $avail = $this->request->getGet('availability');

        $tutorModel = new TutorModel();
        $dbTutors = $tutorModel->findAll();

        $tutors = [];
        foreach ($dbTutors as $t) {
            $tutors[] = [
                'id' => (int) $t['id'],
                'staff_id' => $t['tutor_id'],
                'name' => $t['full_name'],
                'role' => $t['specialization'] ?? 'Faculty Tutor',
                'expertise' => $t['specialization'] ?? 'Curriculum Instruction',
                'courses' => $t['assigned_track'] ?? 'General Engineering',
                'availability' => $t['status'] === 'Active' ? 'Available' : 'Partial',
                'hours' => 14,
                'max_hours' => 24,
                'rating' => (float) ($t['rating'] ?? 4.9),
                'email' => $t['email'] ?? '',
                'phone' => $t['phone'] ?? '',
                'assigned_batches' => ['BIX-2026-A'],
            ];
        }

        $filtered = $tutors;

        if (!empty($search)) {
            $q = strtolower(trim((string) $search));
            $filtered = array_values(array_filter($filtered, static function ($t) use ($q) {
                return str_contains(strtolower($t['name']), $q)
                    || str_contains(strtolower($t['staff_id']), $q)
                    || str_contains(strtolower($t['expertise']), $q)
                    || str_contains(strtolower($t['courses']), $q);
            }));
        }

        if (!empty($avail) && $avail !== 'all') {
            $filtered = array_values(array_filter($filtered, static fn($t) => $t['availability'] === $avail));
        }

        $totalHours = array_sum(array_column($tutors, 'hours'));
        $avgRating = count($tutors) > 0 ? round(array_sum(array_column($tutors, 'rating')) / count($tutors), 2) : 5.0;

        return $this->respond([
            'status' => 'success',
            'data' => $filtered,
            'meta' => [
                'total_tutors' => count($tutors),
                'available_count' => count(array_filter($tutors, static fn($t) => $t['availability'] === 'Available')),
                'partial_count' => count(array_filter($tutors, static fn($t) => $t['availability'] === 'Partial')),
                'full_capacity_count' => count(array_filter($tutors, static fn($t) => $t['availability'] === 'Full')),
                'total_weekly_hours' => $totalHours,
                'avg_faculty_rating' => $avgRating,
                'max_workload_cap' => 24,
            ],
        ]);
    }

    /**
     * Show single tutor
     */
    public function show($id = null)
    {
        $tutorModel = new TutorModel();
        $t = $tutorModel->where('id', $id)->orWhere('tutor_id', $id)->first();

        if (!$t) {
            return $this->failNotFound('Tutor record not found.');
        }

        $tutor = [
            'id' => (int) $t['id'],
            'staff_id' => $t['tutor_id'],
            'name' => $t['full_name'],
            'role' => $t['specialization'] ?? 'Faculty Tutor',
            'expertise' => $t['specialization'] ?? 'Curriculum Instruction',
            'courses' => $t['assigned_track'] ?? 'General Engineering',
            'availability' => $t['status'] === 'Active' ? 'Available' : 'Partial',
            'hours' => 14,
            'max_hours' => 24,
            'rating' => (float) ($t['rating'] ?? 4.9),
            'email' => $t['email'],
            'phone' => $t['phone'],
            'assigned_batches' => ['BIX-2026-A'],
        ];

        return $this->respond([
            'status' => 'success',
            'data' => $tutor,
        ]);
    }

    /**
     * Create / Onboard new tutor
     */
    public function create()
    {
        $input = $this->getRequestData();
        $name = trim((string) ($input['name'] ?? ($input['full_name'] ?? '')));

        if (empty($name)) {
            return $this->failValidationErrors(['name' => 'Tutor Full Name is required.']);
        }

        $tutorModel = new TutorModel();
        $count = $tutorModel->countAllResults();
        $staffId = !empty($input['staff_id']) ? trim((string) $input['staff_id']) : (!empty($input['tutor_id']) ? trim((string) $input['tutor_id']) : 'TUT-' . (120 + $count));

        $now = date('Y-m-d H:i:s');
        $tutorData = [
            'tutor_id' => $staffId,
            'full_name' => $name,
            'email' => !empty($input['email']) ? trim((string) $input['email']) : strtolower(str_replace(' ', '.', $name)) . '@bixcel.edu',
            'phone' => !empty($input['phone']) ? trim((string) $input['phone']) : '+91 98765 43210',
            'specialization' => $input['expertise'] ?? ($input['specialization'] ?? ($input['role'] ?? 'Specialist')),
            'assigned_track' => $input['courses'] ?? ($input['assigned_track'] ?? 'General Engineering'),
            'status' => $input['status'] ?? 'Active',
            'rating' => (float) ($input['rating'] ?? 4.9),
            'total_hours' => (int) ($input['hours'] ?? ($input['total_hours'] ?? 14)),
            'created_at' => $now,
            'updated_at' => $now,
        ];

        $id = $tutorModel->insert($tutorData);

        $responseData = [
            'id' => (int) $id,
            'staff_id' => $staffId,
            'name' => $tutorData['full_name'],
            'role' => $tutorData['specialization'],
            'expertise' => $tutorData['specialization'],
            'courses' => $tutorData['assigned_track'],
            'availability' => 'Available',
            'hours' => $tutorData['total_hours'],
            'max_hours' => 24,
            'rating' => $tutorData['rating'],
            'email' => $tutorData['email'],
            'phone' => $tutorData['phone'],
            'assigned_batches' => !empty($input['batch']) ? [$input['batch']] : ['BIX-2026-A'],
        ];

        return $this->respondCreated([
            'status' => 'success',
            'message' => "Tutor {$responseData['name']} ({$staffId}) onboarded successfully in database.",
            'data' => $responseData,
        ]);
    }

    /**
     * Update tutor details
     */
    public function update($id = null)
    {
        $input = $this->getRequestData();

        $tutorModel = new TutorModel();
        $tutor = $tutorModel->where('id', $id)->orWhere('tutor_id', $id)->first();

        if (!$tutor) {
            return $this->failNotFound('Tutor record not found.');
        }

        $update = [];
        if (isset($input['name'])) $update['full_name'] = trim((string) $input['name']);
        if (isset($input['full_name'])) $update['full_name'] = trim((string) $input['full_name']);
        if (isset($input['email'])) $update['email'] = trim((string) $input['email']);
        if (isset($input['phone'])) $update['phone'] = trim((string) $input['phone']);
        if (isset($input['role'])) $update['specialization'] = trim((string) $input['role']);
        if (isset($input['expertise'])) $update['specialization'] = trim((string) $input['expertise']);
        if (isset($input['specialization'])) $update['specialization'] = trim((string) $input['specialization']);
        if (isset($input['courses'])) $update['assigned_track'] = trim((string) $input['courses']);
        if (isset($input['assigned_track'])) $update['assigned_track'] = trim((string) $input['assigned_track']);
        if (isset($input['status'])) $update['status'] = trim((string) $input['status']);
        if (isset($input['hours'])) $update['total_hours'] = (int) $input['hours'];
        if (isset($input['rating'])) $update['rating'] = (float) $input['rating'];
        $update['updated_at'] = date('Y-m-d H:i:s');

        $tutorModel->update($tutor['id'], $update);

        $merged = array_merge($tutor, $update);
        return $this->respond([
            'status' => 'success',
            'message' => "Tutor {$merged['full_name']} updated successfully.",
            'data' => [
                'id' => (int) $merged['id'],
                'staff_id' => $merged['tutor_id'],
                'name' => $merged['full_name'],
                'role' => $merged['specialization'],
                'expertise' => $merged['specialization'],
                'courses' => $merged['assigned_track'],
                'availability' => 'Available',
                'hours' => 14,
                'max_hours' => 24,
                'rating' => (float) $merged['rating'],
                'email' => $merged['email'],
                'phone' => $merged['phone'],
                'assigned_batches' => ['BIX-2026-A'],
            ],
        ]);
    }

    /**
     * Delete tutor
     */
    public function delete($id = null)
    {
        $tutorModel = new TutorModel();
        $tutor = $tutorModel->where('id', $id)->orWhere('tutor_id', $id)->first();

        if (!$tutor) {
            return $this->failNotFound('Tutor record not found.');
        }

        $tutorModel->delete($tutor['id']);

        return $this->respondDeleted([
            'status' => 'success',
            'message' => 'Tutor record archived successfully from database.',
        ]);
    }
}
