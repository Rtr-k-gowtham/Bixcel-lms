<?php

namespace App\Controllers\Api;

use App\Models\StudentModel;
use App\Models\StudentEnrollmentModel;
use App\Models\StudentModuleModel;
use App\Models\CourseModel;
use App\Models\ProgressModel;

class EnrollmentController extends BaseApiController
{
    /**
     * List all student course onboardings / enrollments
     */
    public function index()
    {
        $search = $this->request->getGet('search');
        $trackFilter = $this->request->getGet('track');
        $statusFilter = $this->request->getGet('status');
        $batchFilter = $this->request->getGet('batch');

        $enrollmentModel = new StudentEnrollmentModel();
        $studentModel = new StudentModel();
        $moduleModel = new StudentModuleModel();
        $courseModel = new CourseModel();

        $enrollments = $enrollmentModel->orderBy('id', 'DESC')->findAll();
        $students = $studentModel->findAll();
        $allModules = $moduleModel->findAll();
        $courses = $courseModel->findAll();

        $studentMap = [];
        foreach ($students as $s) {
            $studentMap[$s['student_id']] = $s;
            $studentMap[$s['id']] = $s;
        }

        $courseMap = [];
        foreach ($courses as $c) {
            $courseMap[$c['title']] = $c;
            $courseMap[$c['id']] = $c;
            if (!empty($c['code'])) {
                $courseMap[$c['code']] = $c;
            }
        }

        $modulesMap = [];
        foreach ($allModules as $m) {
            $code = $m['student_code'];
            $modulesMap[$code][] = [
                'id' => $m['module_code'],
                'module_code' => $m['module_code'],
                'title' => $m['title'],
                'days' => (int) $m['days'],
                'status' => $m['status'],
                'instructor' => $m['instructor'] ?? null,
            ];
        }

        $result = [];
        foreach ($enrollments as $enr) {
            $stu = $studentMap[$enr['student_code']] ?? ($studentMap[$enr['student_id']] ?? null);
            $crs = $courseMap[$enr['track']] ?? null;

            $enrolledMods = $modulesMap[$enr['student_code']] ?? [];

            $item = [
                'id' => (int) $enr['id'],
                'student_id' => $enr['student_id'],
                'student_code' => $enr['student_code'],
                'student_name' => $stu['full_name'] ?? ('Student ' . $enr['student_code']),
                'student_phone' => $stu['phone'] ?? '',
                'student_email' => $stu['email'] ?? '',
                'student_avatar' => $stu['avatar'] ?? null,
                'track' => $enr['track'],
                'course_title' => $enr['track'],
                'course_code' => $crs['code'] ?? 'CRS',
                'course_category' => $enr['category'] ?? ($crs['category'] ?? 'Engineering'),
                'batch_id' => $enr['batch_id'],
                'batch' => $enr['batch_id'],
                'start_date' => $enr['start_date'] ?? date('Y-m-d'),
                'end_date' => $enr['end_date'] ?? date('Y-m-d', strtotime('+4 months')),
                'total_days' => (int) ($enr['total_days'] ?? 30),
                'total_modules' => (int) ($enr['total_modules'] ?? count($enrolledMods)),
                'status' => $enr['status'] ?? 'Active',
                'tuition_fee' => (float) ($enr['tuition_fee'] ?? 4500.00),
                'plan' => $enr['plan'] ?? 'Standard',
                'payment_method' => $enr['payment_method'] ?? 'Bank Transfer',
                'modules' => $enrolledMods,
                'created_at' => $enr['created_at'],
                'updated_at' => $enr['updated_at'],
            ];

            $result[] = $item;
        }

        // Filtering
        if (!empty($search)) {
            $q = strtolower(trim((string) $search));
            $result = array_values(array_filter($result, static function ($row) use ($q) {
                return str_contains(strtolower($row['student_name']), $q)
                    || str_contains(strtolower($row['student_code']), $q)
                    || str_contains(strtolower($row['course_title']), $q)
                    || str_contains(strtolower($row['batch']), $q);
            }));
        }

        if (!empty($trackFilter) && $trackFilter !== 'All') {
            $result = array_values(array_filter($result, static fn($r) => $r['track'] === $trackFilter));
        }

        if (!empty($statusFilter) && $statusFilter !== 'All') {
            $result = array_values(array_filter($result, static fn($r) => $r['status'] === $statusFilter));
        }

        if (!empty($batchFilter) && $batchFilter !== 'All') {
            $result = array_values(array_filter($result, static fn($r) => $r['batch'] === $batchFilter));
        }

        return $this->respond([
            'status' => 'success',
            'data' => $result,
            'count' => count($result),
        ]);
    }

    /**
     * Onboard / Enroll Student into Course
     */
    public function create()
    {
        $input = $this->getRequestData();

        if (empty($input['student_code']) && empty($input['student_id'])) {
            return $this->failValidationErrors(['student' => 'Student selection is required.']);
        }

        if (empty($input['track']) && empty($input['course_title'])) {
            return $this->failValidationErrors(['track' => 'Course program selection is required.']);
        }

        $studentModel = new StudentModel();
        $student = null;
        if (!empty($input['student_code'])) {
            $student = $studentModel->where('student_id', $input['student_code'])->first();
        }
        if (!$student && !empty($input['student_id'])) {
            $student = $studentModel->find($input['student_id']) ?: $studentModel->where('student_id', $input['student_id'])->first();
        }

        if (!$student) {
            return $this->failNotFound('Selected student record not found.');
        }

        $studentId = (int) $student['id'];
        $studentCode = $student['student_id'];
        $track = trim((string) ($input['track'] ?? $input['course_title']));
        $batch = !empty($input['batch']) ? trim((string) $input['batch']) : 'BIX-2026-A';
        $category = !empty($input['category']) ? trim((string) $input['category']) : 'Engineering';
        $startDate = !empty($input['start_date']) ? $input['start_date'] : date('Y-m-d');
        $endDate = !empty($input['end_date']) ? $input['end_date'] : date('Y-m-d', strtotime('+4 months'));
        $totalDays = !empty($input['total_days']) ? (int) $input['total_days'] : 30;
        $plan = !empty($input['plan']) ? $input['plan'] : 'Standard';
        $status = !empty($input['status']) ? $input['status'] : 'Active';
        $now = date('Y-m-d H:i:s');

        $modules = $input['modules'] ?? [];
        $totalModules = !empty($modules) ? count($modules) : 1;

        $enrollmentModel = new StudentEnrollmentModel();
        $enrollmentData = [
            'student_id' => $studentId,
            'student_code' => $studentCode,
            'track' => $track,
            'category' => $category,
            'batch_id' => $batch,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_days' => $totalDays,
            'total_modules' => $totalModules,
            'status' => $status,
            'tuition_fee' => (float) ($input['tuition_fee'] ?? 4500.00),
            'plan' => $plan,
            'payment_method' => $input['payment_method'] ?? 'Bank Transfer',
            'created_at' => $now,
            'updated_at' => $now,
        ];

        $enrollmentId = $enrollmentModel->insert($enrollmentData);

        // Enrolled Modules
        if (!empty($modules) && is_array($modules)) {
            $modModel = new StudentModuleModel();
            foreach ($modules as $idx => $m) {
                $modModel->insert([
                    'student_id' => $studentId,
                    'student_code' => $studentCode,
                    'module_code' => $m['module_code'] ?? ($m['id'] ?? ('MOD-' . ($idx + 1))),
                    'title' => $m['title'] ?? 'Module',
                    'days' => (int) ($m['days'] ?? 1),
                    'is_core' => 1,
                    'status' => 'Scheduled',
                    'instructor' => $m['instructor'] ?? null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        // Initialize / update progress
        try {
            $progressModel = new ProgressModel();
            $existing = $progressModel->where('student_code', $studentCode)->first();
            $progData = [
                'student_id' => $studentId,
                'student_code' => $studentCode,
                'track' => $track,
                'batch_code' => $batch,
                'cumulative_gpa' => 4.00,
                'percentile' => 'Top 10%',
                'syllabus_completed_credits' => 0,
                'syllabus_total_credits' => $totalDays,
                'average_score' => 100,
                'attendance_rate' => 100,
                'cleared_milestones' => 0,
                'total_milestones' => 5,
                'created_at' => $now,
                'updated_at' => $now,
            ];
            if ($existing) {
                $progressModel->update($existing['id'], $progData);
            } else {
                $progressModel->insert($progData);
            }
        } catch (\Throwable $e) {
            log_message('error', 'Error syncing progress: ' . $e->getMessage());
        }

        return $this->respondCreated([
            'status' => 'success',
            'message' => 'Student successfully onboarded to course!',
            'data' => array_merge($enrollmentData, [
                'id' => (int) $enrollmentId,
                'student_name' => $student['full_name'],
                'student_phone' => $student['phone'],
                'student_email' => $student['email'],
                'student_avatar' => $student['avatar'],
                'modules' => $modules,
            ]),
        ]);
    }

    /**
     * Update Course Onboarding record
     */
    public function update($id = null)
    {
        $enrollmentModel = new StudentEnrollmentModel();
        $enrollment = $enrollmentModel->find($id);
        if (!$enrollment) {
            return $this->failNotFound('Course onboarding record not found.');
        }

        $input = $this->getRequestData();
        $updateData = [];

        if (isset($input['status'])) $updateData['status'] = $input['status'];
        if (isset($input['batch_id']) || isset($input['batch'])) $updateData['batch_id'] = $input['batch_id'] ?? $input['batch'];
        if (isset($input['track']) || isset($input['course_title'])) $updateData['track'] = $input['track'] ?? $input['course_title'];
        if (isset($input['start_date'])) $updateData['start_date'] = $input['start_date'];
        if (isset($input['end_date'])) $updateData['end_date'] = $input['end_date'];
        if (isset($input['plan'])) $updateData['plan'] = $input['plan'];
        if (isset($input['total_days'])) $updateData['total_days'] = (int) $input['total_days'];

        $updateData['updated_at'] = date('Y-m-d H:i:s');
        $enrollmentModel->update($id, $updateData);

        return $this->respond([
            'status' => 'success',
            'message' => 'Course onboarding updated successfully.',
            'data' => array_merge($enrollment, $updateData),
        ]);
    }

    /**
     * Delete / Drop Course Onboarding
     */
    public function delete($id = null)
    {
        $enrollmentModel = new StudentEnrollmentModel();
        $enrollment = $enrollmentModel->find($id);
        if (!$enrollment) {
            return $this->failNotFound('Course onboarding record not found.');
        }

        $enrollmentModel->delete($id);

        return $this->respondDeleted([
            'status' => 'success',
            'message' => 'Course onboarding dropped successfully.',
        ]);
    }
}
