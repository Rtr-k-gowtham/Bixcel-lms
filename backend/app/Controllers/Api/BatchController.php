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

        $batches = [];
        foreach ($dbBatches as $b) {
            $batches[] = [
                'id' => (int) $b['id'],
                'code' => $b['batch_code'],
                'name' => $b['track'] . ' (' . $b['batch_code'] . ')',
                'course' => $b['track'],
                'start' => $b['start_date'] ?? date('Y-m-d'),
                'end' => $b['end_date'] ?? date('Y-m-d', strtotime('+3 months')),
                'enrolled' => (int) ($b['enrolled_count'] ?? 0),
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
}
