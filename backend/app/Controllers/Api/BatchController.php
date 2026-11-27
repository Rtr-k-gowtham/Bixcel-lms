<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use App\Models\BatchModel;
use CodeIgniter\RESTful\ResourceController;

class BatchController extends BaseApiController
{
    protected $format = 'json';

    public function __construct()
    {
        DatabaseBootstrapper::ensureInitialized();
        $this->request ??= \Config\Services::request();
        $this->response ??= \Config\Services::response();
    }

    private static array $classrooms = [
        ['name' => 'Design Room 302', 'capacity' => 28, 'campus' => 'North Wing'],
        ['name' => 'Studio Lab 204', 'capacity' => 30, 'campus' => 'Creative Arts Campus'],
        ['name' => 'Lab 101', 'capacity' => 28, 'campus' => 'Main Engineering Block'],
        ['name' => 'Lab 102', 'capacity' => 25, 'campus' => 'Main Engineering Block'],
        ['name' => 'Analytics Hub 105', 'capacity' => 20, 'campus' => 'Data Science Center'],
        ['name' => 'Cybersecurity Lab 401', 'capacity' => 24, 'campus' => 'Security Operations'],
    ];

    /**
     * List batches with metrics
     */
    public function index()
    {
        $search = $this->request->getGet('search');
        $course = $this->request->getGet('course');
        $status = $this->request->getGet('status');

        $batchModel = new BatchModel();
        $dbBatches = $batchModel->findAll();

        if (empty($dbBatches)) {
            $now = date('Y-m-d H:i:s');
            $defaultBatches = [
                [
                    'batch_code' => 'BIX-DEV-24A',
                    'track' => 'Full-Stack Web Development',
                    'tutor_id' => 'TUT-101',
                    'tutor_name' => 'Dr. Elena Rostova',
                    'start_date' => date('Y-m-d', strtotime('-10 days')),
                    'end_date' => date('Y-m-d', strtotime('+80 days')),
                    'timing' => '09:00 AM - 01:00 PM',
                    'classroom' => 'Lab 101',
                    'capacity' => 28,
                    'enrolled_count' => 0,
                    'status' => 'Active',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'batch_code' => 'BIX-UX-26D',
                    'track' => 'UI/UX Product Design',
                    'tutor_id' => 'TUT-102',
                    'tutor_name' => 'Marcus Vance',
                    'start_date' => date('Y-m-d', strtotime('-5 days')),
                    'end_date' => date('Y-m-d', strtotime('+40 days')),
                    'timing' => '02:00 PM - 05:00 PM',
                    'classroom' => 'Design Room 302',
                    'capacity' => 28,
                    'enrolled_count' => 0,
                    'status' => 'Enrolling',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'batch_code' => 'BIX-DS-18C',
                    'track' => 'Data Science & Analytics',
                    'tutor_id' => 'TUT-103',
                    'tutor_name' => 'Prof. Anand Verma',
                    'start_date' => date('Y-m-d', strtotime('+7 days')),
                    'end_date' => date('Y-m-d', strtotime('+82 days')),
                    'timing' => '10:00 AM - 01:00 PM',
                    'classroom' => 'Analytics Hub 105',
                    'capacity' => 20,
                    'enrolled_count' => 0,
                    'status' => 'Upcoming',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'batch_code' => 'BIX-MKT-26B',
                    'track' => 'Digital Marketing',
                    'tutor_id' => 'TUT-104',
                    'tutor_name' => 'Sarah Jenkins',
                    'start_date' => date('Y-m-d', strtotime('-15 days')),
                    'end_date' => date('Y-m-d', strtotime('+21 days')),
                    'timing' => '11:00 AM - 02:00 PM',
                    'classroom' => 'Studio Lab 204',
                    'capacity' => 30,
                    'enrolled_count' => 0,
                    'status' => 'Active',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'batch_code' => 'BIX-CLD-12A',
                    'track' => 'Cloud & DevOps Engineering',
                    'tutor_id' => 'TUT-105',
                    'tutor_name' => 'Karthik Raja',
                    'start_date' => date('Y-m-d', strtotime('+14 days')),
                    'end_date' => date('Y-m-d', strtotime('+74 days')),
                    'timing' => '09:30 AM - 12:30 PM',
                    'classroom' => 'Lab 102',
                    'capacity' => 25,
                    'enrolled_count' => 0,
                    'status' => 'Upcoming',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
                [
                    'batch_code' => 'BIX-SEC-09F',
                    'track' => 'Cybersecurity Operations',
                    'tutor_id' => 'TUT-106',
                    'tutor_name' => 'Vikram Sethi',
                    'start_date' => date('Y-m-d', strtotime('-2 days')),
                    'end_date' => date('Y-m-d', strtotime('+68 days')),
                    'timing' => '02:00 PM - 06:00 PM',
                    'classroom' => 'Cybersecurity Lab 401',
                    'capacity' => 24,
                    'enrolled_count' => 0,
                    'status' => 'Enrolling',
                    'created_at' => $now,
                    'updated_at' => $now,
                ],
            ];
            foreach ($defaultBatches as $seedBatch) {
                $batchModel->insert($seedBatch);
            }
            $dbBatches = $batchModel->findAll();
        }

        $enrollmentModel = new \App\Models\StudentEnrollmentModel();
        $allEnrollments = $enrollmentModel->findAll();
        $studentCounts = [];
        foreach ($allEnrollments as $enr) {
            $bCode = $enr['batch_id'] ?? '';
            if (!empty($bCode)) {
                $studentCounts[$bCode] = ($studentCounts[$bCode] ?? 0) + 1;
            }
        }

        $batches = [];
        foreach ($dbBatches as $b) {
            $bCode = $b['batch_code'];
            $enrolled = isset($studentCounts[$bCode]) ? $studentCounts[$bCode] : (int) ($b['enrolled_count'] ?? 0);
            $batches[] = [
                'id' => (int) $b['id'],
                'code' => $bCode,
                'name' => $b['track'] . ' (' . $bCode . ')',
                'course' => $b['track'],
                'start' => $b['start_date'] ?? date('Y-m-d'),
                'end' => $b['end_date'] ?? date('Y-m-d', strtotime('+3 months')),
                'enrolled' => $enrolled,
                'capacity' => (int) ($b['capacity'] ?? 30),
                'primary_tutor' => $b['tutor_name'] ?? 'Unassigned',
                'co_tutor' => 'Unassigned',
                'room' => $b['classroom'] ?? 'Lab 101',
                'status' => $b['status'] ?? 'Active',
                'created_at' => $b['created_at'],
            ];
        }

        $filtered = $batches;

        if (!empty($search)) {
            $q = strtolower(trim((string) $search));
            $filtered = array_values(array_filter($filtered, static function ($b) use ($q) {
                return str_contains(strtolower($b['code']), $q)
                    || str_contains(strtolower($b['name']), $q)
                    || str_contains(strtolower($b['course']), $q)
                    || str_contains(strtolower($b['primary_tutor']), $q)
                    || str_contains(strtolower($b['room']), $q);
            }));
        }

        if (!empty($course) && $course !== 'all') {
            $filtered = array_values(array_filter($filtered, static fn($b) => $b['course'] === $course));
        }

        if (!empty($status) && $status !== 'all') {
            $filtered = array_values(array_filter($filtered, static fn($b) => $b['status'] === $status));
        }

        $totalBatches = count($batches);
        $activeBatches = count(array_filter($batches, static fn($b) => $b['status'] === 'Active'));
        $totalEnrolled = array_sum(array_column($batches, 'enrolled'));
        $totalCapacity = array_sum(array_column($batches, 'capacity'));
        $seatUtilization = $totalCapacity > 0 ? round(($totalEnrolled / $totalCapacity) * 100, 1) : 0;

        return $this->respond([
            'status' => 'success',
            'data' => $filtered,
            'meta' => [
                'total_batches' => $totalBatches,
                'active_batches' => $activeBatches,
                'enrolling_batches' => count(array_filter($batches, static fn($b) => $b['status'] === 'Enrolling')),
                'upcoming_batches' => count(array_filter($batches, static fn($b) => $b['status'] === 'Upcoming')),
                'total_enrolled' => $totalEnrolled,
                'total_capacity' => $totalCapacity,
                'remaining_seats' => max(0, $totalCapacity - $totalEnrolled),
                'seat_utilization' => $seatUtilization . '%',
                'schedule_alerts' => 2,
            ],
            'classrooms' => self::$classrooms,
        ]);
    }

    /**
     * Get single batch
     */
    public function show($id = null)
    {
        $batchModel = new BatchModel();
        $b = $batchModel->where('id', $id)->orWhere('batch_code', $id)->first();

        if (!$b) {
            return $this->failNotFound('Batch not found.');
        }

        $batch = [
            'id' => (int) $b['id'],
            'code' => $b['batch_code'],
            'name' => $b['track'] . ' (' . $b['batch_code'] . ')',
            'course' => $b['track'],
            'start' => $b['start_date'],
            'end' => $b['end_date'],
            'enrolled' => (int) $b['enrolled_count'],
            'capacity' => (int) $b['capacity'],
            'primary_tutor' => $b['tutor_name'],
            'co_tutor' => 'Unassigned',
            'room' => $b['classroom'],
            'status' => $b['status'],
            'created_at' => $b['created_at'],
        ];

        return $this->respond([
            'status' => 'success',
            'data' => $batch,
        ]);
    }

    /**
     * Create batch
     */
    public function create()
    {
        $input = $this->getRequestData();

        $courseName = !empty($input['course']) ? trim((string) $input['course']) : (!empty($input['name']) ? trim((string) $input['name']) : 'Web Development');
        $code = !empty($input['code']) ? trim((string) $input['code']) : 'BIX-' . strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $courseName), 0, 3)) . '-' . rand(10, 99);

        $now = date('Y-m-d H:i:s');
        $batchData = [
            'batch_code' => $code,
            'track' => $courseName,
            'tutor_id' => 'TUT-' . rand(101, 109),
            'tutor_name' => !empty($input['primary_tutor']) ? trim((string) $input['primary_tutor']) : 'Unassigned',
            'start_date' => !empty($input['start']) ? $input['start'] : date('Y-m-d'),
            'end_date' => !empty($input['end']) ? $input['end'] : date('Y-m-d', strtotime('+3 months')),
            'timing' => '09:00 AM - 01:00 PM',
            'classroom' => !empty($input['room']) ? trim((string) $input['room']) : 'Lab 101',
            'capacity' => (int) ($input['capacity'] ?? 25),
            'enrolled_count' => (int) ($input['enrolled'] ?? 0),
            'status' => $input['status'] ?? 'Active',
            'created_at' => $now,
            'updated_at' => $now,
        ];

        $batchModel = new BatchModel();
        $id = $batchModel->insert($batchData);

        $responseData = [
            'id' => (int) $id,
            'code' => $code,
            'name' => $courseName . ' (' . $code . ')',
            'course' => $courseName,
            'start' => $batchData['start_date'],
            'end' => $batchData['end_date'],
            'enrolled' => $batchData['enrolled_count'],
            'capacity' => $batchData['capacity'],
            'primary_tutor' => $batchData['tutor_name'],
            'co_tutor' => 'Unassigned',
            'room' => $batchData['classroom'],
            'status' => $batchData['status'],
            'created_at' => $now,
        ];

        return $this->respondCreated([
            'status' => 'success',
            'message' => "Batch {$responseData['name']} created successfully in database.",
            'data' => $responseData,
        ]);
    }

    /**
     * Update batch
     */
    public function update($id = null)
    {
        $input = $this->getRequestData();

        $batchModel = new BatchModel();
        $batch = $batchModel->where('id', $id)->orWhere('batch_code', $id)->first();

        if (!$batch) {
            return $this->failNotFound('Batch not found.');
        }

        $update = [];
        if (isset($input['course'])) $update['track'] = trim((string) $input['course']);
        if (isset($input['primary_tutor'])) $update['tutor_name'] = trim((string) $input['primary_tutor']);
        if (isset($input['start'])) $update['start_date'] = $input['start'];
        if (isset($input['end'])) $update['end_date'] = $input['end'];
        if (isset($input['capacity'])) $update['capacity'] = (int) $input['capacity'];
        if (isset($input['enrolled'])) $update['enrolled_count'] = (int) $input['enrolled'];
        if (isset($input['room'])) $update['classroom'] = trim((string) $input['room']);
        if (isset($input['status'])) $update['status'] = $input['status'];
        $update['updated_at'] = date('Y-m-d H:i:s');

        $batchModel->update($batch['id'], $update);

        $merged = array_merge($batch, $update);
        return $this->respond([
            'status' => 'success',
            'message' => "Batch updated successfully.",
            'data' => [
                'id' => (int) $merged['id'],
                'code' => $merged['batch_code'],
                'name' => $merged['track'] . ' (' . $merged['batch_code'] . ')',
                'course' => $merged['track'],
                'start' => $merged['start_date'],
                'end' => $merged['end_date'],
                'enrolled' => (int) $merged['enrolled_count'],
                'capacity' => (int) $merged['capacity'],
                'primary_tutor' => $merged['tutor_name'],
                'co_tutor' => 'Unassigned',
                'room' => $merged['classroom'],
                'status' => $merged['status'],
            ],
        ]);
    }

    /**
     * Delete batch
     */
    public function delete($id = null)
    {
        $batchModel = new BatchModel();
        $batch = $batchModel->where('id', $id)->orWhere('batch_code', $id)->first();

        if (!$batch) {
            return $this->failNotFound('Batch not found.');
        }

        $batchModel->delete($batch['id']);

        return $this->respondDeleted([
            'status' => 'success',
            'message' => 'Batch removed successfully from database.',
        ]);
    }

    /**
     * Assign onboarded students to batch
     */
    public function assignStudents()
    {
        $input = $this->getRequestData();
        $batchCode = $input['batch_code'] ?? null;
        $studentCodes = $input['student_codes'] ?? [];

        if (empty($batchCode) || empty($studentCodes) || !is_array($studentCodes)) {
            return $this->failValidationErrors(['error' => 'Batch code and student codes are required.']);
        }

        $enrollmentModel = new \App\Models\StudentEnrollmentModel();
        $updatedCount = 0;
        foreach ($studentCodes as $code) {
            $enr = $enrollmentModel->where('student_code', $code)->first();
            if ($enr) {
                $enrollmentModel->update($enr['id'], [
                    'batch_id' => $batchCode,
                    'updated_at' => date('Y-m-d H:i:s'),
                ]);
                $updatedCount++;
            }
        }

        // Synchronize batch enrolled_count
        $batchModel = new BatchModel();
        $batch = $batchModel->where('batch_code', $batchCode)->first();
        if ($batch) {
            $currentEnrolled = $enrollmentModel->where('batch_id', $batchCode)->countAllResults();
            $batchModel->update($batch['id'], ['enrolled_count' => $currentEnrolled]);
        }

        return $this->respond([
            'status' => 'success',
            'message' => "Successfully allocated {$updatedCount} students to batch {$batchCode}.",
            'batch_code' => $batchCode,
            'assigned_count' => $updatedCount,
        ]);
    }

    /**
     * Remove student from batch
     */
    public function removeStudent()
    {
        $input = $this->getRequestData();
        $batchCode = $input['batch_code'] ?? null;
        $studentCode = $input['student_code'] ?? null;

        if (empty($studentCode)) {
            return $this->failValidationErrors(['error' => 'Student code is required.']);
        }

        $enrollmentModel = new \App\Models\StudentEnrollmentModel();
        $enr = $enrollmentModel->where('student_code', $studentCode)->first();
        if ($enr) {
            $enrollmentModel->update($enr['id'], [
                'batch_id' => 'Unassigned',
                'updated_at' => date('Y-m-d H:i:s'),
            ]);
        }

        if ($batchCode) {
            $batchModel = new BatchModel();
            $batch = $batchModel->where('batch_code', $batchCode)->first();
            if ($batch) {
                $currentEnrolled = $enrollmentModel->where('batch_id', $batchCode)->countAllResults();
                $batchModel->update($batch['id'], ['enrolled_count' => $currentEnrolled]);
            }
        }

        return $this->respond([
            'status' => 'success',
            'message' => "Student {$studentCode} unassigned from batch.",
        ]);
    }
}
