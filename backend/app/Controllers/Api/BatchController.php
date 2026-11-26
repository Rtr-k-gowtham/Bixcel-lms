<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class BatchController extends ResourceController
{
    protected $format = 'json';

    private static array $classrooms = [
        ['name' => 'Design Room 302', 'capacity' => 28, 'campus' => 'North Wing'],
        ['name' => 'Studio Lab 204', 'capacity' => 30, 'campus' => 'Creative Arts Campus'],
        ['name' => 'Lab 101', 'capacity' => 28, 'campus' => 'Main Engineering Block'],
        ['name' => 'Lab 102', 'capacity' => 25, 'campus' => 'Main Engineering Block'],
        ['name' => 'Analytics Hub 105', 'capacity' => 20, 'campus' => 'Data Science Center'],
        ['name' => 'Cybersecurity Lab 401', 'capacity' => 24, 'campus' => 'Security Operations'],
    ];

    private static array $batches = [
        [
            'id' => 1,
            'code' => 'BIX-GD-26A',
            'name' => 'Graphic Design Morning',
            'course' => 'Graphic Design Master Course',
            'start' => '2026-11-02',
            'end' => '2027-01-15',
            'enrolled' => 26,
            'capacity' => 30,
            'primary_tutor' => 'Marcus Vance',
            'co_tutor' => 'Priya Nair',
            'room' => 'Studio Lab 204',
            'status' => 'Active',
            'created_at' => '2026-10-15 09:30:00',
        ],
        [
            'id' => 2,
            'code' => 'BIX-FS-26C',
            'name' => 'Full-Stack Cohort C',
            'course' => 'Full-Stack Web Engineering',
            'start' => '2026-11-10',
            'end' => '2027-03-24',
            'enrolled' => 28,
            'capacity' => 28,
            'primary_tutor' => 'Dr. Aris Thorne',
            'co_tutor' => 'Liam Chen',
            'room' => 'Lab 101',
            'status' => 'Active',
            'created_at' => '2026-10-20 11:15:00',
        ],
        [
            'id' => 3,
            'code' => 'BIX-UX-26D',
            'name' => 'UI/UX Product Evening',
            'course' => 'UI/UX Product Design',
            'start' => '2026-12-01',
            'end' => '2027-02-18',
            'enrolled' => 19,
            'capacity' => 25,
            'primary_tutor' => 'Sofia Alvarez',
            'co_tutor' => 'Unassigned',
            'room' => 'Design Room 302',
            'status' => 'Enrolling',
            'created_at' => '2026-11-01 14:00:00',
        ],
        [
            'id' => 4,
            'code' => 'BIX-DS-26E',
            'name' => 'Data Science Weekend',
            'course' => 'Data Science & Analytics',
            'start' => '2026-12-07',
            'end' => '2027-04-04',
            'enrolled' => 14,
            'capacity' => 30,
            'primary_tutor' => 'Dr. Aris Thorne',
            'co_tutor' => 'Maya Lin',
            'room' => 'Analytics Hub 105',
            'status' => 'Upcoming',
            'created_at' => '2026-11-05 16:45:00',
        ],
        [
            'id' => 5,
            'code' => 'BIX-GD-26B',
            'name' => 'Graphic Design Afternoon',
            'course' => 'Graphic Design Master Course',
            'start' => '2026-08-18',
            'end' => '2026-10-30',
            'enrolled' => 24,
            'capacity' => 24,
            'primary_tutor' => 'Priya Nair',
            'co_tutor' => 'Marcus Vance',
            'room' => 'Studio Lab 204',
            'status' => 'Completed',
            'created_at' => '2026-07-20 10:00:00',
        ],
        [
            'id' => 6,
            'code' => 'BIX-CLD-26F',
            'name' => 'Cloud & DevOps Accelerated',
            'course' => 'Cloud & DevOps Engineering',
            'start' => '2026-12-15',
            'end' => '2027-03-30',
            'enrolled' => 12,
            'capacity' => 25,
            'primary_tutor' => 'Tariq Al-Mansoor',
            'co_tutor' => 'Chen Wei',
            'room' => 'Lab 102',
            'status' => 'Enrolling',
            'created_at' => '2026-11-12 13:20:00',
        ],
    ];

    /**
     * List batches with metrics
     */
    public function index()
    {
        $search = $this->request->getGet('search');
        $course = $this->request->getGet('course');
        $status = $this->request->getGet('status');

        $filtered = self::$batches;

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
            $filtered = array_values(array_filter($filtered, static function ($b) use ($course) {
                return $b['course'] === $course;
            }));
        }

        if (!empty($status) && $status !== 'all') {
            $filtered = array_values(array_filter($filtered, static function ($b) use ($status) {
                return $b['status'] === $status;
            }));
        }

        $totalBatches = count(self::$batches);
        $activeBatches = count(array_filter(self::$batches, static fn($b) => $b['status'] === 'Active'));
        $totalEnrolled = array_sum(array_column(self::$batches, 'enrolled'));
        $totalCapacity = array_sum(array_column(self::$batches, 'capacity'));
        $seatUtilization = $totalCapacity > 0 ? round(($totalEnrolled / $totalCapacity) * 100, 1) : 0;

        return $this->respond([
            'status' => 'success',
            'data' => $filtered,
            'meta' => [
                'total_batches' => $totalBatches,
                'active_batches' => $activeBatches,
                'enrolling_batches' => count(array_filter(self::$batches, static fn($b) => $b['status'] === 'Enrolling')),
                'upcoming_batches' => count(array_filter(self::$batches, static fn($b) => $b['status'] === 'Upcoming')),
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
        $batch = null;
        foreach (self::$batches as $b) {
            if ($b['id'] == $id || $b['code'] === $id) {
                $batch = $b;
                break;
            }
        }

        if (!$batch) {
            return $this->failNotFound('Batch not found.');
        }

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
        $input = $this->request->getJSON(true) ?? $this->request->getPost();

        if (empty($input['name'])) {
            return $this->failValidationErrors(['name' => 'Batch Name is required.']);
        }

        if (empty($input['course'])) {
            return $this->failValidationErrors(['course' => 'Course selection is required.']);
        }

        $newId = count(self::$batches) + 1;
        $code = !empty($input['code']) ? trim((string) $input['code']) : 'BIX-BAT-26' . chr(64 + $newId);

        $newBatch = [
            'id' => $newId,
            'code' => $code,
            'name' => trim((string) $input['name']),
            'course' => trim((string) $input['course']),
            'start' => !empty($input['start']) ? $input['start'] : date('Y-m-d'),
            'end' => !empty($input['end']) ? $input['end'] : date('Y-m-d', strtotime('+3 months')),
            'enrolled' => (int) ($input['enrolled'] ?? 0),
            'capacity' => (int) ($input['capacity'] ?? 25),
            'primary_tutor' => !empty($input['primary_tutor']) ? trim((string) $input['primary_tutor']) : 'Unassigned',
            'co_tutor' => !empty($input['co_tutor']) ? trim((string) $input['co_tutor']) : 'Unassigned',
            'room' => !empty($input['room']) ? trim((string) $input['room']) : 'Design Room 302',
            'status' => $input['status'] ?? 'Enrolling',
            'created_at' => date('Y-m-d H:i:s'),
        ];

        array_unshift(self::$batches, $newBatch);

        return $this->respondCreated([
            'status' => 'success',
            'message' => "Batch {$newBatch['name']} ({$code}) created successfully.",
            'data' => $newBatch,
        ]);
    }

    /**
     * Update batch
     */
    public function update($id = null)
    {
        $input = $this->request->getJSON(true) ?? $this->request->getRawInput();

        $foundIdx = null;
        foreach (self::$batches as $idx => $b) {
            if ($b['id'] == $id || $b['code'] === $id) {
                $foundIdx = $idx;
                break;
            }
        }

        if ($foundIdx === null) {
            return $this->failNotFound('Batch not found.');
        }

        $batch = &self::$batches[$foundIdx];
        if (isset($input['name'])) $batch['name'] = trim((string) $input['name']);
        if (isset($input['course'])) $batch['course'] = trim((string) $input['course']);
        if (isset($input['start'])) $batch['start'] = $input['start'];
        if (isset($input['end'])) $batch['end'] = $input['end'];
        if (isset($input['capacity'])) $batch['capacity'] = (int) $input['capacity'];
        if (isset($input['enrolled'])) $batch['enrolled'] = (int) $input['enrolled'];
        if (isset($input['primary_tutor'])) $batch['primary_tutor'] = trim((string) $input['primary_tutor']);
        if (isset($input['co_tutor'])) $batch['co_tutor'] = trim((string) $input['co_tutor']);
        if (isset($input['room'])) $batch['room'] = trim((string) $input['room']);
        if (isset($input['status'])) $batch['status'] = $input['status'];

        return $this->respond([
            'status' => 'success',
            'message' => "Batch {$batch['name']} updated successfully.",
            'data' => $batch,
        ]);
    }

    /**
     * Delete batch
     */
    public function delete($id = null)
    {
        $found = false;
        foreach (self::$batches as $idx => $b) {
            if ($b['id'] == $id || $b['code'] === $id) {
                array_splice(self::$batches, $idx, 1);
                $found = true;
                break;
            }
        }

        if (!$found) {
            return $this->failNotFound('Batch not found.');
        }

        return $this->respondDeleted([
            'status' => 'success',
            'message' => 'Batch removed successfully.',
        ]);
    }
}
