<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class StudentController extends ResourceController
{
    protected $format = 'json';

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

    private static array $students = [
        [
            'id' => 1,
            'student_id' => 'STU-2026-0842',
            'full_name' => 'Marcus Vance',
            'guardian_name' => 'Eleanor Vance',
            'guardian_relation' => 'Mother',
            'guardian_phone' => '+1 (555) 349-2190',
            'guardian_email' => 'eleanor.vance@gmail.com',
            'phone' => '+1 (555) 349-2194',
            'email' => 'marcus.vance@student.bixcel.edu',
            'dob' => '2004-03-12',
            'gender' => 'Male',
            'blood_group' => 'O+',
            'address' => '742 Evergreen Terrace, Springfield, OR',
            'qualification' => 'B.Sc Marketing',
            'institution' => 'Oregon State University',
            'passing_year' => '2025',
            'id_proof_type' => 'National ID',
            'id_proof_number' => 'NID-9482014',
            'fee_plan' => 'Full Payment',
            'fee_status' => 'Paid',
            'attendance_pct' => 96,
            'status' => 'Active',
            'course_mode' => 'custom',
            'track' => 'Digital Marketing',
            'batch' => 'BIX-MKT-26B',
            'instructional_days' => 30,
            'module_chunks' => [
                ['title' => 'SEO & Keyword Strategy', 'days' => 8],
                ['title' => 'Meta & Google Ads', 'days' => 12],
                ['title' => 'Content & Social Media Strategy', 'days' => 10],
            ],
            'last_login_at' => '2026-11-26 09:15:22',
            'created_at' => '2026-11-24 14:20:00',
            'updated_at' => '2026-11-25 11:10:00',
        ],
        [
            'id' => 2,
            'student_id' => 'STU-2026-0841',
            'full_name' => 'Alena Rostova',
            'guardian_name' => 'Mikhail Rostov',
            'guardian_relation' => 'Father',
            'guardian_phone' => '+1 (555) 781-4400',
            'guardian_email' => 'm.rostov@gmail.com',
            'phone' => '+1 (555) 781-4402',
            'email' => 'alena.rostova@student.bixcel.edu',
            'dob' => '2003-08-22',
            'gender' => 'Female',
            'blood_group' => 'A+',
            'address' => '42 Pine Crest Ave, Seattle, WA',
            'qualification' => 'B.Des Industrial Design',
            'institution' => 'University of Washington',
            'passing_year' => '2024',
            'id_proof_type' => 'Passport',
            'id_proof_number' => 'PASS-US-892104',
            'fee_plan' => '3-Installment EMI',
            'fee_status' => 'Paid',
            'attendance_pct' => 98,
            'status' => 'Active',
            'course_mode' => 'standard',
            'track' => 'UI/UX Product Design',
            'batch' => 'BIX-UX-26D',
            'instructional_days' => 60,
            'module_chunks' => [
                ['title' => 'Full Curriculum UI/UX Standard Program', 'days' => 60],
            ],
            'last_login_at' => '2026-11-25 17:40:11',
            'created_at' => '2026-11-23 10:12:00',
            'updated_at' => '2026-11-24 09:30:00',
        ],
        [
            'id' => 3,
            'student_id' => 'STU-2026-0840',
            'full_name' => 'Kevin Chen',
            'guardian_name' => 'David Chen',
            'guardian_relation' => 'Father',
            'guardian_phone' => '+1 (555) 912-3340',
            'guardian_email' => 'david.chen@gmail.com',
            'phone' => '+1 (555) 912-3341',
            'email' => 'kevin.chen@student.bixcel.edu',
            'dob' => '2002-11-05',
            'gender' => 'Male',
            'blood_group' => 'B+',
            'address' => '108 Silicon Valley Blvd, San Jose, CA',
            'qualification' => 'B.Tech Computer Science',
            'institution' => 'San Jose State University',
            'passing_year' => '2024',
            'id_proof_type' => 'Driver License',
            'id_proof_number' => 'DL-CA-4029108',
            'fee_plan' => '2-Installment',
            'fee_status' => 'Paid',
            'attendance_pct' => 94,
            'status' => 'Active',
            'course_mode' => 'custom',
            'track' => 'Full-Stack Web Development',
            'batch' => 'BIX-DEV-24A',
            'instructional_days' => 38,
            'module_chunks' => [
                ['title' => 'Frontend Foundations & Semantic HTML/CSS', 'days' => 10],
                ['title' => 'Modern JavaScript ES6+ & TypeScript', 'days' => 14],
                ['title' => 'React & Next.js Architecture', 'days' => 14],
            ],
            'last_login_at' => '2026-11-26 11:02:44',
            'created_at' => '2026-11-21 08:30:00',
            'updated_at' => '2026-11-22 16:15:00',
        ],
        [
            'id' => 4,
            'student_id' => 'STU-2026-0839',
            'full_name' => 'Sophia Martinez',
            'guardian_name' => 'Carlos Martinez',
            'guardian_relation' => 'Father',
            'guardian_phone' => '+1 (555) 203-8870',
            'guardian_email' => 'carlos.m@gmail.com',
            'phone' => '+1 (555) 203-8877',
            'email' => 'sophia.m@student.bixcel.edu',
            'dob' => '2004-06-18',
            'gender' => 'Female',
            'blood_group' => 'AB+',
            'address' => '312 Ocean Dr, Miami, FL',
            'qualification' => 'B.Sc Statistics & Math',
            'institution' => 'University of Miami',
            'passing_year' => '2026',
            'id_proof_type' => 'National ID',
            'id_proof_number' => 'NID-8109283',
            'fee_plan' => 'Full Payment',
            'fee_status' => 'Partial',
            'attendance_pct' => 84,
            'status' => 'On Leave',
            'course_mode' => 'standard',
            'track' => 'Data Science & Analytics',
            'batch' => 'BIX-DS-18C',
            'instructional_days' => 45,
            'module_chunks' => [
                ['title' => 'Full Curriculum Data Science Standard Program', 'days' => 45],
            ],
            'last_login_at' => '2026-11-19 14:12:09',
            'created_at' => '2026-11-18 11:00:00',
            'updated_at' => '2026-11-20 08:45:00',
        ],
        [
            'id' => 5,
            'student_id' => 'STU-2026-0838',
            'full_name' => 'Tariq Al-Mansoor',
            'guardian_name' => 'Rashid Al-Mansoor',
            'guardian_relation' => 'Father',
            'guardian_phone' => '+1 (555) 604-5100',
            'guardian_email' => 'rashid.m@gmail.com',
            'phone' => '+1 (555) 604-5120',
            'email' => 'tariq.mansoor@student.bixcel.edu',
            'dob' => '2001-09-30',
            'gender' => 'Male',
            'blood_group' => 'O-',
            'address' => '89 Innovation Way, Austin, TX',
            'qualification' => 'B.Tech Information Technology',
            'institution' => 'UT Austin',
            'passing_year' => '2023',
            'id_proof_type' => 'Passport',
            'id_proof_number' => 'PASS-TX-902341',
            'fee_plan' => 'Full Payment',
            'fee_status' => 'Paid',
            'attendance_pct' => 97,
            'status' => 'Active',
            'course_mode' => 'custom',
            'track' => 'Cloud & DevOps Engineering',
            'batch' => 'BIX-CLD-12A',
            'instructional_days' => 28,
            'module_chunks' => [
                ['title' => 'Linux System Administration & Networking', 'days' => 8],
                ['title' => 'AWS & Multi-Cloud Infrastructure (IAM, VPC, S3)', 'days' => 12],
                ['title' => 'Infrastructure as Code with Terraform', 'days' => 8],
            ],
            'last_login_at' => '2026-11-26 08:30:19',
            'created_at' => '2026-11-16 15:45:00',
            'updated_at' => '2026-11-17 14:20:00',
        ],
        [
            'id' => 6,
            'student_id' => 'STU-2026-0837',
            'full_name' => 'Priya Sharma',
            'guardian_name' => 'Rajesh Sharma',
            'guardian_relation' => 'Father',
            'guardian_phone' => '+1 (555) 472-9900',
            'guardian_email' => 'rajesh.sharma@gmail.com',
            'phone' => '+1 (555) 472-9901',
            'email' => 'priya.sharma@student.bixcel.edu',
            'dob' => '2003-01-15',
            'gender' => 'Female',
            'blood_group' => 'B+',
            'address' => '55 Tech Park Road, Boston, MA',
            'qualification' => 'B.Sc Computer Science',
            'institution' => 'Boston University',
            'passing_year' => '2025',
            'id_proof_type' => 'National ID',
            'id_proof_number' => 'NID-7729104',
            'fee_plan' => '3-Installment EMI',
            'fee_status' => 'Paid',
            'attendance_pct' => 95,
            'status' => 'Active',
            'course_mode' => 'custom',
            'track' => 'Cybersecurity Operations',
            'batch' => 'BIX-SEC-09F',
            'instructional_days' => 32,
            'module_chunks' => [
                ['title' => 'Network Defense & Protocol Hardening', 'days' => 10],
                ['title' => 'Ethical Hacking & Vulnerability Assessment', 'days' => 12],
                ['title' => 'SOC Operations & SIEM Incident Response', 'days' => 10],
            ],
            'last_login_at' => '2026-11-25 10:45:00',
            'created_at' => '2026-11-15 09:10:00',
            'updated_at' => '2026-11-15 16:30:00',
        ],
    ];

    /**
     * Return list of students with metrics and tracks
     */
    public function index()
    {
        $search = $this->request->getGet('search');
        $track = $this->request->getGet('track');
        $status = $this->request->getGet('status');
        $mode = $this->request->getGet('mode');

        $filtered = self::$students;

        if (!empty($search)) {
            $q = strtolower(trim((string) $search));
            $filtered = array_values(array_filter($filtered, static function ($s) use ($q) {
                return str_contains(strtolower($s['full_name']), $q)
                    || str_contains(strtolower($s['student_id']), $q)
                    || str_contains(strtolower($s['guardian_name']), $q)
                    || str_contains(strtolower($s['email']), $q);
            }));
        }

        if (!empty($track) && $track !== 'All') {
            $filtered = array_values(array_filter($filtered, static function ($s) use ($track) {
                return $s['track'] === $track;
            }));
        }

        if (!empty($status) && $status !== 'All') {
            $filtered = array_values(array_filter($filtered, static function ($s) use ($status) {
                return $s['status'] === $status;
            }));
        }

        if (!empty($mode) && $mode !== 'All') {
            $filtered = array_values(array_filter($filtered, static function ($s) use ($mode) {
                return $s['course_mode'] === $mode;
            }));
        }

        $totalStudents = count(self::$students);
        $activeCount = count(array_filter(self::$students, static fn($s) => $s['status'] === 'Active'));
        $customCount = count(array_filter(self::$students, static fn($s) => $s['course_mode'] === 'custom'));
        $standardCount = count(array_filter(self::$students, static fn($s) => $s['course_mode'] === 'standard'));

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
        $student = null;
        foreach (self::$students as $s) {
            if ($s['id'] == $id || $s['student_id'] === $id) {
                $student = $s;
                break;
            }
        }

        if (!$student) {
            return $this->failNotFound('Student record not found.');
        }

        return $this->respond([
            'status' => 'success',
            'data' => $student,
        ]);
    }

    /**
     * Onboard new student
     */
    public function create()
    {
        $input = $this->request->getJSON(true) ?? $this->request->getPost();

        if (empty($input['full_name'])) {
            return $this->failValidationErrors(['full_name' => 'Student Full Name is required.']);
        }

        if (empty($input['guardian_name'])) {
            return $this->failValidationErrors(['guardian_name' => 'Guardian Name is required.']);
        }

        if (empty($input['phone'])) {
            return $this->failValidationErrors(['phone' => 'Phone number is required.']);
        }

        // Generate next auto-increment student ID
        $nextNum = 843 + count(self::$students);
        $generatedId = 'STU-2026-0' . $nextNum;

        $now = date('Y-m-d H:i:s');
        $newStudent = [
            'id' => count(self::$students) + 1,
            'student_id' => !empty($input['student_id']) ? trim((string) $input['student_id']) : $generatedId,
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
            'qualification' => $input['qualification'] ?? 'High School',
            'institution' => $input['institution'] ?? '',
            'passing_year' => $input['passing_year'] ?? '2025',
            'id_proof_type' => $input['id_proof_type'] ?? 'National ID',
            'id_proof_number' => $input['id_proof_number'] ?? 'NID-' . rand(1000000, 9999999),
            'fee_plan' => $input['fee_plan'] ?? 'Full Payment',
            'fee_status' => $input['fee_status'] ?? 'Paid',
            'attendance_pct' => (int) ($input['attendance_pct'] ?? 100),
            'status' => $input['status'] ?? 'Active',
            'course_mode' => $input['course_mode'] ?? 'custom',
            'track' => $input['track'] ?? 'Digital Marketing',
            'batch' => $input['batch'] ?? 'BIX-AUT-26',
            'instructional_days' => (int) ($input['instructional_days'] ?? 30),
            'module_chunks' => $input['module_chunks'] ?? [
                ['title' => 'SEO & Keyword Strategy', 'days' => 8],
                ['title' => 'Meta & Google Ads', 'days' => 12],
                ['title' => 'Content & Social Media Strategy', 'days' => 10],
            ],
            'last_login_at' => 'Never',
            'created_at' => $now,
            'updated_at' => $now,
        ];

        array_unshift(self::$students, $newStudent);

        return $this->respondCreated([
            'status' => 'success',
            'message' => "Student {$newStudent['full_name']} onboarded successfully with registration ID {$newStudent['student_id']}.",
            'data' => $newStudent,
        ]);
    }

    /**
     * Update student details
     */
    public function update($id = null)
    {
        $input = $this->request->getJSON(true) ?? $this->request->getRawInput();

        $studentIdx = null;
        foreach (self::$students as $idx => $s) {
            if ($s['id'] == $id || $s['student_id'] === $id) {
                $studentIdx = $idx;
                break;
            }
        }

        if ($studentIdx === null) {
            return $this->failNotFound('Student record not found.');
        }

        $now = date('Y-m-d H:i:s');
        $current = self::$students[$studentIdx];

        $updated = array_merge($current, array_filter((array) $input, static fn($v) => $v !== null));
        $updated['updated_at'] = $now;

        self::$students[$studentIdx] = $updated;

        return $this->respond([
            'status' => 'success',
            'message' => "Student {$updated['full_name']} details updated successfully.",
            'data' => $updated,
        ]);
    }

    /**
     * Delete student
     */
    public function delete($id = null)
    {
        $found = false;
        foreach (self::$students as $idx => $s) {
            if ($s['id'] == $id || $s['student_id'] === $id) {
                array_splice(self::$students, $idx, 1);
                $found = true;
                break;
            }
        }

        if (!$found) {
            return $this->failNotFound('Student record not found.');
        }

        return $this->respondDeleted([
            'status' => 'success',
            'message' => 'Student enrollment record archived successfully.',
        ]);
    }
}
