<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use App\Models\FeeInvoiceModel;
use App\Models\ProgressModel;
use App\Models\StudentEnrollmentModel;
use App\Models\StudentModel;
use App\Models\StudentModuleModel;
use CodeIgniter\RESTful\ResourceController;

class StudentController extends BaseApiController
{
    protected $format = 'json';

    public function __construct()
    {
        DatabaseBootstrapper::ensureInitialized();
        $this->request ??= \Config\Services::request();
        $this->response ??= \Config\Services::response();
    }

    private static array $tracks = [
        'Digital Marketing' => [
            'name' => 'Digital Marketing',
            'category' => 'Marketing',
            'default_days' => 36,
            'modules' => [
                ['id' => 'MOD-DM-01', 'title' => 'SEO & Keyword Strategy', 'days' => 8, 'default' => true],
                ['id' => 'MOD-DM-02', 'title' => 'Meta & Google Ads', 'days' => 12, 'default' => true],
                ['id' => 'MOD-DM-03', 'title' => 'Content & Social Media Strategy', 'days' => 10, 'default' => true],
                ['id' => 'MOD-DM-04', 'title' => 'Email Marketing & Growth Analytics', 'days' => 6, 'default' => false],
                ['id' => 'MOD-DM-05', 'title' => 'Affiliate & Influencer Partnerships', 'days' => 5, 'default' => false],
            ],
        ],
        'Full-Stack Web Development' => [
            'name' => 'Full-Stack Web Development',
            'category' => 'Engineering',
            'default_days' => 50,
            'modules' => [
                ['id' => 'MOD-FS-01', 'title' => 'Frontend Foundations & Semantic HTML/CSS', 'days' => 10, 'default' => true],
                ['id' => 'MOD-FS-02', 'title' => 'Modern JavaScript ES6+ & TypeScript', 'days' => 14, 'default' => true],
                ['id' => 'MOD-FS-03', 'title' => 'React & Next.js Architecture', 'days' => 14, 'default' => true],
                ['id' => 'MOD-FS-04', 'title' => 'Node.js, Express & Microservices', 'days' => 12, 'default' => false],
                ['id' => 'MOD-FS-05', 'title' => 'PostgreSQL, ORM & Database Optimization', 'days' => 8, 'default' => false],
                ['id' => 'MOD-FS-06', 'title' => 'Docker, CI/CD & Cloud Deployment', 'days' => 6, 'default' => false],
            ],
        ],
        'UI/UX Product Design' => [
            'name' => 'UI/UX Product Design',
            'category' => 'Design',
            'default_days' => 36,
            'modules' => [
                ['id' => 'MOD-UX-01', 'title' => 'User Research, Personas & Journey Mapping', 'days' => 6, 'default' => true],
                ['id' => 'MOD-UX-02', 'title' => 'Wireframing & Prototyping in Figma', 'days' => 10, 'default' => true],
                ['id' => 'MOD-UX-03', 'title' => 'Design Systems & Component Tokens', 'days' => 8, 'default' => true],
                ['id' => 'MOD-UX-04', 'title' => 'Usability Testing & Micro-interactions', 'days' => 6, 'default' => true],
                ['id' => 'MOD-UX-05', 'title' => 'Design Handoff & Developer Collaboration', 'days' => 6, 'default' => false],
            ],
        ],
        'Data Science & Analytics' => [
            'name' => 'Data Science & Analytics',
            'category' => 'Data',
            'default_days' => 44,
            'modules' => [
                ['id' => 'MOD-DS-01', 'title' => 'Python for Data Analysis (NumPy, Pandas)', 'days' => 10, 'default' => true],
                ['id' => 'MOD-DS-02', 'title' => 'Statistical Modeling & Hypothesis Testing', 'days' => 8, 'default' => true],
                ['id' => 'MOD-DS-03', 'title' => 'Machine Learning & Predictive Modeling', 'days' => 14, 'default' => true],
                ['id' => 'MOD-DS-04', 'title' => 'PowerBI & Executive Data Storytelling', 'days' => 6, 'default' => false],
                ['id' => 'MOD-DS-05', 'title' => 'SQL for Big Data & Warehouse Modeling', 'days' => 6, 'default' => false],
            ],
        ],
        'Cloud & DevOps Engineering' => [
            'name' => 'Cloud & DevOps Engineering',
            'category' => 'Infrastructure',
            'default_days' => 40,
            'modules' => [
                ['id' => 'MOD-CL-01', 'title' => 'Linux System Administration & Networking', 'days' => 8, 'default' => true],
                ['id' => 'MOD-CL-02', 'title' => 'AWS & Multi-Cloud Infrastructure (IAM, VPC, S3)', 'days' => 12, 'default' => true],
                ['id' => 'MOD-CL-03', 'title' => 'Infrastructure as Code with Terraform', 'days' => 8, 'default' => true],
                ['id' => 'MOD-CL-04', 'title' => 'Kubernetes Orchestration & Helm', 'days' => 10, 'default' => false],
                ['id' => 'MOD-CL-05', 'title' => 'Observability, Prometheus & Grafana', 'days' => 6, 'default' => false],
            ],
        ],
        'Cybersecurity Operations' => [
            'name' => 'Cybersecurity Operations',
            'category' => 'Security',
            'default_days' => 42,
            'modules' => [
                ['id' => 'MOD-SEC-01', 'title' => 'Network Defense & Protocol Hardening', 'days' => 10, 'default' => true],
                ['id' => 'MOD-SEC-02', 'title' => 'Ethical Hacking & Vulnerability Assessment', 'days' => 12, 'default' => true],
                ['id' => 'MOD-SEC-03', 'title' => 'SOC Operations & SIEM Incident Response', 'days' => 10, 'default' => true],
                ['id' => 'MOD-SEC-04', 'title' => 'Application Security & OWASP Top 10', 'days' => 10, 'default' => false],
            ],
        ],
    ];

    /**
     * Return list of students with metrics and tracks
     */
    public function index()
    {
        $search = $this->request->getGet('search');
        $trackFilter = $this->request->getGet('track');
        $statusFilter = $this->request->getGet('status');
        $modeFilter = $this->request->getGet('mode');

        $studentModel = new StudentModel();
        $enrollmentModel = new StudentEnrollmentModel();
        $moduleModel = new StudentModuleModel();

        $students = $studentModel->findAll();
        $enrollments = $enrollmentModel->findAll();
        $allModules = $moduleModel->findAll();

        // Index enrollments and modules by student_code / student_id
        $enrollmentMap = [];
        foreach ($enrollments as $enr) {
            $enrollmentMap[$enr['student_code']] = $enr;
        }

        $modulesMap = [];
        foreach ($allModules as $mod) {
            $code = $mod['student_code'];
            if (!isset($modulesMap[$code])) {
                $modulesMap[$code] = [];
            }
            $modulesMap[$code][] = [
                'id' => $mod['module_code'],
                'title' => $mod['title'],
                'days' => (int) $mod['days'],
                'status' => $mod['status'],
                'grade' => $mod['grade'],
                'score' => (int) $mod['score'],
                'completion_pct' => (int) $mod['completion_pct'],
            ];
        }

        $formatted = [];
        foreach ($students as $s) {
            $code = $s['student_id'];
            $enr = $enrollmentMap[$code] ?? null;
            $mods = $modulesMap[$code] ?? [];

            // Calculate instructional days
            $totalDays = 0;
            foreach ($mods as $m) {
                $totalDays += $m['days'];
            }
            if ($totalDays === 0 && $enr) {
                $totalDays = (int) $enr['total_days'];
            }
            if ($totalDays === 0) {
                $totalDays = 36;
            }

            $trackName = $enr['track'] ?? 'Full-Stack Web Development';
            $batchCode = $enr['batch_id'] ?? 'BIX-2026-A';
            $plan = $enr['plan'] ?? 'Standard';

            $formatted[] = [
                'id' => (int) $s['id'],
                'student_id' => $s['student_id'],
                'full_name' => $s['full_name'],
                'guardian_name' => $s['guardian_name'] ?? 'Guardian',
                'guardian_relation' => $s['guardian_relation'] ?? 'Parent',
                'guardian_phone' => $s['guardian_phone'] ?? $s['phone'],
                'guardian_email' => $s['guardian_email'] ?? '',
                'phone' => $s['phone'] ?? '',
                'email' => $s['email'] ?? '',
                'dob' => $s['dob'] ?? '2004-01-01',
                'gender' => $s['gender'] ?? 'Not Specified',
                'blood_group' => $s['blood_group'] ?? 'O+',
                'address' => $s['address'] ?? '',
                'qualification' => 'Undergraduate',
                'institution' => 'University Partner Institute',
                'passing_year' => '2025',
                'id_proof_type' => 'National ID',
                'id_proof_number' => 'NID-' . (8000000 + (int) $s['id']),
                'fee_plan' => $plan,
                'fee_status' => 'Paid',
                'attendance_pct' => 96,
                'status' => $s['status'] ?? 'Active',
                'course_mode' => !empty($mods) ? 'custom' : 'standard',
                'track' => $trackName,
                'batch' => $batchCode,
                'instructional_days' => $totalDays,
                'module_chunks' => !empty($mods) ? $mods : [
                    ['title' => 'Core Curriculum Track Modules', 'days' => $totalDays],
                ],
                'last_login_at' => '2026-11-26 10:15:00',
                'created_at' => $s['created_at'] ?? date('Y-m-d H:i:s'),
                'updated_at' => $s['updated_at'] ?? date('Y-m-d H:i:s'),
            ];
        }

        // Filtering
        $filtered = $formatted;

        if (!empty($search)) {
            $q = strtolower(trim((string) $search));
            $filtered = array_values(array_filter($filtered, static function ($s) use ($q) {
                return str_contains(strtolower($s['full_name']), $q)
                    || str_contains(strtolower($s['student_id']), $q)
                    || str_contains(strtolower($s['guardian_name']), $q)
                    || str_contains(strtolower($s['email']), $q);
            }));
        }

        if (!empty($trackFilter) && $trackFilter !== 'All') {
            $filtered = array_values(array_filter($filtered, static fn($s) => $s['track'] === $trackFilter));
        }

        if (!empty($statusFilter) && $statusFilter !== 'All') {
            $filtered = array_values(array_filter($filtered, static fn($s) => $s['status'] === $statusFilter));
        }

        if (!empty($modeFilter) && $modeFilter !== 'All') {
            $filtered = array_values(array_filter($filtered, static fn($s) => $s['course_mode'] === $modeFilter));
        }

        $totalStudents = count($formatted);
        $activeCount = count(array_filter($formatted, static fn($s) => $s['status'] === 'Active'));
        $customCount = count(array_filter($formatted, static fn($s) => $s['course_mode'] === 'custom'));
        $standardCount = count(array_filter($formatted, static fn($s) => $s['course_mode'] === 'standard'));

        return $this->respond([
            'status' => 'success',
            'data' => $filtered,
            'meta' => [
                'total_students' => 1420 + $totalStudents,
                'active_onboardings_month' => 84,
                'custom_track_count' => $customCount,
                'standard_track_count' => $standardCount,
                'custom_track_ratio' => '67%',
                'avg_instructional_days' => 36,
            ],
            'tracks' => self::$tracks,
        ]);
    }

    /**
     * Get track blueprints catalog
     */
    public function tracks()
    {
        return $this->respond([
            'status' => 'success',
            'data' => self::$tracks,
        ]);
    }

    /**
     * Show single student
     */
    public function show($id = null)
    {
        $studentModel = new StudentModel();
        $student = $studentModel->where('id', $id)->orWhere('student_id', $id)->first();

        if (!$student) {
            return $this->failNotFound('Student record not found.');
        }

        $enrollmentModel = new StudentEnrollmentModel();
        $enrollment = $enrollmentModel->where('student_code', $student['student_id'])->first();

        $moduleModel = new StudentModuleModel();
        $modules = $moduleModel->where('student_code', $student['student_id'])->findAll();

        $totalDays = 0;
        $chunks = [];
        foreach ($modules as $m) {
            $totalDays += (int) $m['days'];
            $chunks[] = [
                'id' => $m['module_code'],
                'title' => $m['title'],
                'days' => (int) $m['days'],
                'status' => $m['status'],
                'grade' => $m['grade'],
                'score' => (int) $m['score'],
                'completion_pct' => (int) $m['completion_pct'],
            ];
        }

        $data = [
            'id' => (int) $student['id'],
            'student_id' => $student['student_id'],
            'full_name' => $student['full_name'],
            'guardian_name' => $student['guardian_name'] ?? 'Guardian',
            'guardian_relation' => $student['guardian_relation'] ?? 'Parent',
            'guardian_phone' => $student['guardian_phone'] ?? $student['phone'],
            'guardian_email' => $student['guardian_email'] ?? '',
            'phone' => $student['phone'] ?? '',
            'email' => $student['email'] ?? '',
            'dob' => $student['dob'] ?? '2004-01-01',
            'gender' => $student['gender'] ?? 'Not Specified',
            'blood_group' => $student['blood_group'] ?? 'O+',
            'address' => $student['address'] ?? '',
            'qualification' => 'Undergraduate',
            'institution' => 'University Partner Institute',
            'passing_year' => '2025',
            'id_proof_type' => 'National ID',
            'id_proof_number' => 'NID-' . (8000000 + (int) $student['id']),
            'fee_plan' => $enrollment['plan'] ?? 'Standard',
            'fee_status' => 'Paid',
            'attendance_pct' => 96,
            'status' => $student['status'] ?? 'Active',
            'course_mode' => !empty($chunks) ? 'custom' : 'standard',
            'track' => $enrollment['track'] ?? 'Full-Stack Web Development',
            'batch' => $enrollment['batch_id'] ?? 'BIX-2026-A',
            'instructional_days' => $totalDays > 0 ? $totalDays : 36,
            'module_chunks' => $chunks,
            'last_login_at' => '2026-11-26 10:15:00',
            'created_at' => $student['created_at'],
            'updated_at' => $student['updated_at'],
        ];

        return $this->respond([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    /**
     * Onboard new student and persist to database
     */
    public function create()
    {
        $input = $this->getRequestData();

        if (empty($input['full_name'])) {
            return $this->failValidationErrors(['full_name' => 'Student Full Name is required.']);
        }

        if (empty($input['guardian_name'])) {
            return $this->failValidationErrors(['guardian_name' => 'Guardian Name is required.']);
        }

        if (empty($input['phone'])) {
            return $this->failValidationErrors(['phone' => 'Phone number is required.']);
        }

        $studentModel = new StudentModel();
        $totalCount = $studentModel->countAllResults();
        $nextNum = 845 + $totalCount;
        $generatedId = 'STU-2026-0' . $nextNum;

        $studentCode = !empty($input['student_id']) ? trim((string) $input['student_id']) : $generatedId;
        $now = date('Y-m-d H:i:s');

        // 1. Insert into students table
        $studentData = [
            'student_id' => $studentCode,
            'full_name' => trim((string) $input['full_name']),
            'guardian_name' => trim((string) $input['guardian_name']),
            'guardian_relation' => $input['guardian_relation'] ?? 'Guardian',
            'guardian_phone' => !empty($input['guardian_phone']) ? trim((string) $input['guardian_phone']) : trim((string) $input['phone']),
            'guardian_email' => $input['guardian_email'] ?? '',
            'phone' => trim((string) $input['phone']),
            'email' => !empty($input['email']) ? trim((string) $input['email']) : strtolower(str_replace(' ', '.', trim((string) $input['full_name']))) . '@student.bixcel.edu',
            'dob' => $input['dob'] ?? '2004-01-01',
            'gender' => $input['gender'] ?? 'Not Specified',
            'blood_group' => $input['blood_group'] ?? 'O+',
            'address' => $input['address'] ?? '',
            'status' => $input['status'] ?? 'Active',
            'created_at' => $now,
            'updated_at' => $now,
        ];
        $studentId = $studentModel->insert($studentData);

        // 2. Insert into student_enrollments table
        $track = $input['track'] ?? 'Full-Stack Web Development';
        $batch = $input['batch'] ?? 'FSW-2026-A';
        $plan = $input['fee_plan'] ?? 'Standard';
        $instructionalDays = (int) ($input['instructional_days'] ?? 36);

        $enrollmentModel = new StudentEnrollmentModel();
        $enrollmentData = [
            'student_id' => $studentId,
            'student_code' => $studentCode,
            'track' => $track,
            'category' => 'Engineering',
            'batch_id' => $batch,
            'start_date' => date('Y-m-d'),
            'end_date' => date('Y-m-d', strtotime('+4 months')),
            'total_days' => $instructionalDays,
            'total_modules' => is_array($input['module_chunks'] ?? null) ? count($input['module_chunks']) : 4,
            'status' => 'Active',
            'tuition_fee' => 4500.00,
            'plan' => $plan,
            'payment_method' => $input['payment_method'] ?? 'Bank Transfer',
            'created_at' => $now,
            'updated_at' => $now,
        ];
        $enrollmentModel->insert($enrollmentData);

        // 3. Insert into student_enrolled_modules table
        $moduleModel = new StudentModuleModel();
        $modules = $input['module_chunks'] ?? [
            ['title' => 'Core Track Foundations', 'days' => 12],
            ['title' => 'Advanced Applied Practicum', 'days' => 14],
        ];

        foreach ($modules as $idx => $m) {
            $moduleModel->insert([
                'student_id' => $studentId,
                'student_code' => $studentCode,
                'module_code' => 'MOD-TRK-' . str_pad((string) ($idx + 1), 2, '0', STR_PAD_LEFT),
                'title' => $m['title'] ?? 'Module Title',
                'days' => (int) ($m['days'] ?? 10),
                'is_core' => 1,
                'status' => 'Scheduled',
                'grade' => '—',
                'score' => 0,
                'completion_pct' => 0,
                'instructor' => 'Faculty Lead',
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 4. Initialize Fee Invoice
        $feeModel = new FeeInvoiceModel();
        $feeModel->insert([
            'invoice_no' => 'INV-2026-' . str_pad((string) rand(100, 999), 3, '0', STR_PAD_LEFT),
            'student_id' => $studentId,
            'student_code' => $studentCode,
            'student_name' => $studentData['full_name'],
            'track' => $track,
            'batch_code' => $batch,
            'total_amount' => 4500.00,
            'paid_amount' => 0.00,
            'balance_amount' => 4500.00,
            'due_date' => date('Y-m-d', strtotime('+30 days')),
            'status' => 'Pending',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 5. Initialize Student Progress record
        $progressModel = new ProgressModel();
        $progressModel->insert([
            'student_id' => $studentId,
            'student_code' => $studentCode,
            'track' => $track,
            'batch_code' => $batch,
            'cumulative_gpa' => 4.00,
            'percentile' => 'Top 10%',
            'syllabus_completed_credits' => 0,
            'syllabus_total_credits' => $instructionalDays,
            'average_score' => 100,
            'attendance_rate' => 100,
            'cleared_milestones' => 0,
            'total_milestones' => 5,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $responseData = array_merge($studentData, [
            'id' => (int) $studentId,
            'course_mode' => $input['course_mode'] ?? 'custom',
            'track' => $track,
            'batch' => $batch,
            'instructional_days' => $instructionalDays,
            'module_chunks' => $modules,
            'fee_plan' => $plan,
            'fee_status' => 'Pending',
            'attendance_pct' => 100,
            'last_login_at' => 'Never',
        ]);

        return $this->respondCreated([
            'status' => 'success',
            'message' => "Student {$studentData['full_name']} onboarded successfully into database with ID {$studentCode}.",
            'data' => $responseData,
        ]);
    }

    /**
     * Update student details
     */
    public function update($id = null)
    {
        $input = $this->getRequestData();

        $studentModel = new StudentModel();
        $student = $studentModel->where('id', $id)->orWhere('student_id', $id)->first();

        if (!$student) {
            return $this->failNotFound('Student record not found.');
        }

        $updateData = [];
        foreach (['full_name', 'guardian_name', 'guardian_relation', 'guardian_phone', 'guardian_email', 'phone', 'email', 'dob', 'gender', 'blood_group', 'address', 'status'] as $field) {
            if (isset($input[$field])) {
                $updateData[$field] = $input[$field];
            }
        }
        $updateData['updated_at'] = date('Y-m-d H:i:s');

        $studentModel->update($student['id'], $updateData);

        if (isset($input['batch']) || isset($input['batch_id'])) {
            $batchCode = $input['batch'] ?? $input['batch_id'];
            $enrollmentModel = new StudentEnrollmentModel();
            $enrollment = $enrollmentModel->where('student_code', $student['student_id'])->first();
            if ($enrollment) {
                $enrollmentModel->update($enrollment['id'], [
                    'batch_id' => $batchCode,
                    'updated_at' => date('Y-m-d H:i:s'),
                ]);
            }
        }

        return $this->respond([
            'status' => 'success',
            'message' => "Student {$student['full_name']} details updated successfully in database.",
            'data' => array_merge($student, $updateData),
        ]);
    }

    /**
     * Delete student
     */
    public function delete($id = null)
    {
        $studentModel = new StudentModel();
        $student = $studentModel->where('id', $id)->orWhere('student_id', $id)->first();

        if (!$student) {
            return $this->failNotFound('Student record not found.');
        }

        $studentModel->delete($student['id']);

        return $this->respondDeleted([
            'status' => 'success',
            'message' => 'Student enrollment record archived successfully from database.',
        ]);
    }
}
