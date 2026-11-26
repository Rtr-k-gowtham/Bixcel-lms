<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class AuditController extends ResourceController
{
    protected $format = 'json';

    private static array $auditLogs = [
        [
            'id'          => 'AUD-8921',
            'timestamp'   => '2026-11-26 12:28:45',
            'relative'    => '4 mins ago',
            'actor_name'  => 'Elena Rostova',
            'actor_email' => 'e.rostova@bixcel.edu',
            'actor_role'  => 'Super Admin',
            'action'      => 'PERMISSION_MATRIX_UPDATE',
            'action_type' => 'UPDATE',
            'module'      => 'Access Control',
            'ip_address'  => '192.168.1.102',
            'user_agent'  => 'Chrome 128 (Windows 11 x64)',
            'severity'    => 'WARNING',
            'status'      => 'Success',
            'summary'     => 'Modified granular action permissions for role "Admin" across Academic Business Modules',
            'details'     => [
                'role'             => 'Admin',
                'modified_modules' => ['courses', 'exams', 'attendance'],
                'granted_actions'  => ['approve', 'reject'],
                'revoked_actions'  => ['delete'],
            ],
        ],
        [
            'id'          => 'AUD-8920',
            'timestamp'   => '2026-11-26 12:15:10',
            'relative'    => '18 mins ago',
            'actor_name'  => 'Dr. Marcus Vance',
            'actor_email' => 'm.vance@bixcel.edu',
            'actor_role'  => 'Academic Dean',
            'action'      => 'COURSE_STATUS_PUBLISHED',
            'action_type' => 'CREATE',
            'module'      => 'Courses & Syllabus',
            'ip_address'  => '192.168.1.114',
            'user_agent'  => 'Firefox 130 (macOS Sonoma)',
            'severity'    => 'INFO',
            'status'      => 'Success',
            'summary'     => 'Published curriculum for "Cloud DevOps & Kubernetes Orchestration" (CRS-104)',
            'details'     => [
                'course_id'    => 'CRS-104',
                'title'        => 'Cloud DevOps & Kubernetes Orchestration',
                'credits'      => 4,
                'target_cohort'=> 'Fall 2026',
            ],
        ],
        [
            'id'          => 'AUD-8919',
            'timestamp'   => '2026-11-26 11:42:30',
            'relative'    => '50 mins ago',
            'actor_name'  => 'Michael Sterling',
            'actor_email' => 'm.sterling@bixcel.edu',
            'actor_role'  => 'Accountant',
            'action'      => 'FEE_INSTALLMENT_RECONCILED',
            'action_type' => 'UPDATE',
            'module'      => 'Finance & Ledgers',
            'ip_address'  => '192.168.1.120',
            'user_agent'  => 'Chrome 128 (Windows 11)',
            'severity'    => 'INFO',
            'status'      => 'Success',
            'summary'     => 'Reconciled Term 1 batch tuition ledger totaling $42,500 across 28 student records',
            'details'     => [
                'batch_id'     => 'B26-FS-A',
                'amount'       => '$42,500',
                'records'      => 28,
                'receipt_mode' => 'ACH Wire Transfer',
            ],
        ],
        [
            'id'          => 'AUD-8918',
            'timestamp'   => '2026-11-26 10:14:02',
            'relative'    => '2 hours ago',
            'actor_name'  => 'System Security Guard',
            'actor_email' => 'security-daemon@bixcel.edu',
            'actor_role'  => 'Automated System',
            'action'      => 'AUTH_FAILED_LOCKOUT',
            'action_type' => 'SECURITY',
            'module'      => 'Authentication',
            'ip_address'  => '45.33.32.156',
            'user_agent'  => 'Python-Requests/2.31',
            'severity'    => 'CRITICAL',
            'status'      => 'Blocked',
            'summary'     => 'Temporarily blacklisted IP 45.33.32.156 after 5 consecutive failed login attempts on endpoint /api/auth',
            'details'     => [
                'ip'              => '45.33.32.156',
                'attempts'        => 5,
                'threat_level'    => 'High',
                'lockout_duration'=> '30 Minutes',
            ],
        ],
        [
            'id'          => 'AUD-8917',
            'timestamp'   => '2026-11-26 09:30:18',
            'relative'    => '3 hours ago',
            'actor_name'  => 'Sophia Chen',
            'actor_email' => 's.chen@bixcel.edu',
            'actor_role'  => 'Tutor / Faculty',
            'action'      => 'ATTENDANCE_REGISTER_SUBMITTED',
            'action_type' => 'CREATE',
            'module'      => 'Attendance & Timetable',
            'ip_address'  => '192.168.1.109',
            'user_agent'  => 'Chrome 128 (Windows 11)',
            'severity'    => 'INFO',
            'status'      => 'Success',
            'summary'     => 'Submitted lecture attendance register for CS-401 (34 Present, 2 Absent)',
            'details'     => [
                'cohort'   => 'CS-401',
                'session'  => '09:00 AM - 11:30 AM',
                'present'  => 34,
                'absent'   => 2,
            ],
        ],
        [
            'id'          => 'AUD-8916',
            'timestamp'   => '2026-11-25 18:05:44',
            'relative'    => 'Yesterday',
            'actor_name'  => 'Priya Sharma',
            'actor_email' => 'p.sharma@bixcel.edu',
            'actor_role'  => 'Admission Officer',
            'action'      => 'STUDENT_APPLICATION_APPROVED',
            'action_type' => 'UPDATE',
            'module'      => 'Student Admissions',
            'ip_address'  => '192.168.1.111',
            'user_agent'  => 'Edge 128 (Windows 11)',
            'severity'    => 'INFO',
            'status'      => 'Success',
            'summary'     => 'Verified credentials and approved admission for applicant Kevin Hart (BX-STU-1088)',
            'details'     => [
                'applicant_id' => 'BX-STU-1088',
                'program'      => 'UI / UX Design Masterclass',
                'scholarship'  => '15% Academic Merit',
            ],
        ],
    ];

    public function index()
    {
        return $this->respond([
            'status' => 'success',
            'count'  => count(self::$auditLogs),
            'data'   => self::$auditLogs,
        ]);
    }

    public function show($id = null)
    {
        foreach (self::$auditLogs as $log) {
            if ($log['id'] === $id) {
                return $this->respond([
                    'status' => 'success',
                    'data'   => $log,
                ]);
            }
        }
        return $this->failNotFound('Audit record not found: ' . $id);
    }
}
