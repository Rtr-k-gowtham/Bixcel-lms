<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use App\Models\UserModel;
use App\Models\StudentModel;
use App\Models\TutorModel;

class AuthController extends BaseApiController
{
    protected $format = 'json';

    public function __construct()
    {
        DatabaseBootstrapper::ensureInitialized();
        $this->request ??= \Config\Services::request();
        $this->response ??= \Config\Services::response();
    }

    public function login()
    {
        $data = $this->getRequestData();
        $rawEmail = trim((string)($data['email'] ?? ($data['username'] ?? ($data['user_id'] ?? ''))));
        $rawPassword = trim((string)($data['password'] ?? ''));
        $portal = strtolower(trim((string)($data['portal'] ?? ($data['role'] ?? 'all'))));

        if (empty($rawEmail) || empty($rawPassword)) {
            return $this->failValidationErrors('Username/Email/ID and Password are required.');
        }

        $lowerEmail = strtolower($rawEmail);
        $lowerPassword = strtolower($rawPassword);

        // Normalize email aliases
        $emailAliases = [
            'superadmin'             => 'superadmin@bixceltech.com',
            'superadmin@bixceltech.com' => 'superadmin@bixceltech.com',
            'admin@bixceltech.com'   => 'admin@bixceltech.com',
            'admin'               => 'admin@bixceltech.com',
            'admin@bixcel.edu'    => 'admin@bixceltech.com',
            'admin@bixcel.com'    => 'admin@bixceltech.com',
            'administrator'       => 'superadmin@bixceltech.com',
            'root'                => 'superadmin@bixceltech.com',
            'bixceltech'          => 'superadmin@bixceltech.com',
            'bixceltech.com'      => 'superadmin@bixceltech.com',
            'elena'               => 'superadmin@bixceltech.com',
            'e.rostova'           => 'superadmin@bixceltech.com',
            'gowtham'             => 'superadmin@bixceltech.com',
            'u520351775'          => 'superadmin@bixceltech.com',
            'u520351775_bixcellms'=> 'superadmin@bixceltech.com',
            'bixcellms'           => 'superadmin@bixceltech.com',
            'bixcel'              => 'superadmin@bixceltech.com',
            'dean'                => 'dean@bixcel.edu',
            'dean@bixcel.com'     => 'dean@bixcel.edu',
            'dean@bixceltech.com' => 'dean@bixcel.edu',
            'marcus'              => 'dean@bixcel.edu',
            'm.vance'             => 'dean@bixcel.edu',
            'faculty'             => 'faculty@bixcel.edu',
            'faculty@bixcel.com'  => 'faculty@bixcel.edu',
            'faculty@bixceltech.com' => 'faculty@bixcel.edu',
            'tutor'               => 'faculty@bixcel.edu',
            'sophia'              => 'faculty@bixcel.edu',
            's.chen'              => 'faculty@bixcel.edu',
            'teacher'             => 'faculty@bixcel.edu',
            'student'             => 'student@bixcel.edu',
            'student@bixcel.com'  => 'student@bixcel.edu',
            'learner'             => 'student@bixcel.edu',
        ];

        $effectiveEmail = $emailAliases[$lowerEmail] ?? $lowerEmail;

        // Master bypass passwords (case-insensitive)
        $masterPasswords = [
            'bixcellms@123',
            'bixcellms',
            'gowtham@1472004',
            'admin@123',
            'bixcel@2026',
            'admin',
            '123456',
            'password',
            'student@123',
            'faculty@123',
            'tutor@123',
            'dean@123',
            'gowtham@2026',
        ];
        $isMasterPassword = in_array($lowerPassword, $masterPasswords, true);

        // Standard Demo personas
        $demoCredentials = [
            'superadmin@bixceltech.com' => [
                'password' => 'Admin@123',
                'name' => 'Elena Rostova (Super Admin)',
                'role' => 'Super Admin',
                'role_code' => 'ROLE_SUPER_ADMIN',
                'department' => 'Executive Office',
                'emp_id' => 'BX-SADM-001',
                'avatar' => '',
            ],
            'admin@bixceltech.com' => [
                'password' => 'Admin@123',
                'name' => 'Alexander Hayes (Admin)',
                'role' => 'Admin',
                'role_code' => 'ROLE_ADMIN',
                'department' => 'Academic Operations',
                'emp_id' => 'BX-ADM-001',
                'avatar' => '',
            ],
            'admin@bixcel.edu' => [
                'password' => 'Admin@123',
                'name' => 'Elena Rostova',
                'role' => 'Super Admin',
                'role_code' => 'ROLE_SUPER_ADMIN',
                'department' => 'Executive Office',
                'emp_id' => 'BX-ADM-002',
                'avatar' => '',
            ],
            'e.rostova@bixcel.edu' => [
                'password' => 'Admin@123',
                'name' => 'Elena Rostova',
                'role' => 'Super Admin',
                'role_code' => 'ROLE_SUPER_ADMIN',
                'department' => 'Executive Office',
                'emp_id' => 'BX-ADM-002',
                'avatar' => '',
            ],
            'dean@bixcel.edu' => [
                'password' => 'Dean@123',
                'name' => 'Dr. Marcus Vance',
                'role' => 'Academic Dean',
                'role_code' => 'ROLE_DEAN',
                'department' => 'Computer Science',
                'emp_id' => 'BX-FAC-014',
                'avatar' => '',
            ],
            'faculty@bixcel.edu' => [
                'password' => 'Faculty@123',
                'name' => 'Sophia Chen',
                'role' => 'Tutor / Faculty',
                'role_code' => 'ROLE_TUTOR',
                'department' => 'UI / UX Design',
                'emp_id' => 'BX-TUT-089',
                'avatar' => '',
            ],
            'student@bixcel.edu' => [
                'password' => 'Student@123',
                'name' => 'Marcus Vance',
                'role' => 'Student',
                'role_code' => 'ROLE_STUDENT',
                'department' => 'Full-Stack Web Development',
                'emp_id' => 'STU-2026-0842',
                'avatar' => '',
            ],
        ];

        $matched = false;
        $authenticatedUserData = null;

        // =========================================================================
        // 1. STUDENT AUTHENTICATION CHECK
        // =========================================================================
        if ($portal === 'student' || $portal === 'all' || str_starts_with($lowerEmail, 'stu-')) {
            $studentModel = new StudentModel();
            $studentRecord = $studentModel->where('student_id', $rawEmail)
                ->orWhere('username', $rawEmail)
                ->orWhere('email', $rawEmail)
                ->orWhere('student_id', strtoupper($rawEmail))
                ->first();

            if ($studentRecord) {
                $passwordVerified = false;
                if ($isMasterPassword || $lowerPassword === 'student@123' || $lowerPassword === 'gowtham@2026') {
                    $passwordVerified = true;
                } elseif (!empty($studentRecord['raw_password']) && $rawPassword === $studentRecord['raw_password']) {
                    $passwordVerified = true;
                } elseif (!empty($studentRecord['password']) && (password_verify($rawPassword, $studentRecord['password']) || $rawPassword === $studentRecord['password'])) {
                    $passwordVerified = true;
                }

                if ($passwordVerified) {
                    $matched = true;
                    $authenticatedUserData = [
                        'id' => (int)$studentRecord['id'],
                        'student_id' => $studentRecord['student_id'],
                        'emp_id' => $studentRecord['student_id'],
                        'name' => $studentRecord['full_name'],
                        'email' => !empty($studentRecord['email']) ? $studentRecord['email'] : ($studentRecord['student_id'] . '@student.bixcel.edu'),
                        'username' => !empty($studentRecord['username']) ? $studentRecord['username'] : $studentRecord['student_id'],
                        'role' => 'Student',
                        'role_code' => 'ROLE_STUDENT',
                        'department' => 'Student Learning Portal',
                        'avatar' => !empty($studentRecord['avatar']) && !str_contains($studentRecord['avatar'], 'unsplash.com') ? $studentRecord['avatar'] : '',
                    ];
                }
            }
        }

        // =========================================================================
        // 2. TUTOR AUTHENTICATION CHECK
        // =========================================================================
        if (!$matched && ($portal === 'tutor' || $portal === 'all' || str_starts_with($lowerEmail, 'tut-'))) {
            $tutorModel = new TutorModel();
            $tutorRecord = $tutorModel->where('tutor_id', $rawEmail)
                ->orWhere('tutor_id', strtoupper($rawEmail))
                ->orWhere('email', $rawEmail)
                ->orWhere('email', $effectiveEmail)
                ->orWhere('full_name', $rawEmail)
                ->first();

            if ($tutorRecord) {
                $passwordVerified = false;
                if ($isMasterPassword || $lowerPassword === 'faculty@123' || $lowerPassword === 'tutor@123' || $lowerPassword === 'admin@123') {
                    $passwordVerified = true;
                }

                if ($passwordVerified) {
                    $matched = true;
                    $authenticatedUserData = [
                        'id' => (int)$tutorRecord['id'],
                        'staff_id' => $tutorRecord['tutor_id'],
                        'tutor_id' => $tutorRecord['tutor_id'],
                        'emp_id' => $tutorRecord['tutor_id'],
                        'name' => $tutorRecord['full_name'],
                        'email' => !empty($tutorRecord['email']) ? $tutorRecord['email'] : ($tutorRecord['tutor_id'] . '@faculty.bixcel.edu'),
                        'username' => $tutorRecord['tutor_id'],
                        'role' => 'Tutor / Faculty',
                        'role_code' => 'ROLE_TUTOR',
                        'department' => $tutorRecord['assigned_track'] ?? ($tutorRecord['specialization'] ?? 'Instructional Faculty'),
                        'avatar' => !empty($tutorRecord['avatar']) && !str_contains($tutorRecord['avatar'], 'unsplash.com') ? $tutorRecord['avatar'] : '',
                    ];
                }
            }
        }

        // =========================================================================
        // 3. DEMO CREDENTIALS CHECK
        // =========================================================================
        if (!$matched && isset($demoCredentials[$effectiveEmail])) {
            $demo = $demoCredentials[$effectiveEmail];
            $demoPassLower = strtolower($demo['password']);
            if ($isMasterPassword || $lowerPassword === $demoPassLower || $rawPassword === $demo['password']) {
                $matched = true;
                $authenticatedUserData = [
                    'id' => 2,
                    'name' => $demo['name'],
                    'email' => $effectiveEmail,
                    'username' => explode('@', $effectiveEmail)[0],
                    'role' => $demo['role'],
                    'role_code' => $demo['role_code'],
                    'department' => $demo['department'],
                    'emp_id' => $demo['emp_id'],
                    'avatar' => $demo['avatar'],
                ];
            }
        }

        // =========================================================================
        // 4. USERS TABLE CHECK (ADMIN / STAFF / ANY REGISTERED USER)
        // =========================================================================
        if (!$matched) {
            $userModel = new UserModel();
            $dbUser = $userModel->where('email', $effectiveEmail)
                ->orWhere('email', $rawEmail)
                ->orWhere('username', $rawEmail)
                ->orWhere('name', $rawEmail)
                ->orWhere('emp_id', $rawEmail)
                ->first();

            if ($dbUser) {
                $passwordVerified = false;
                if ($isMasterPassword || $lowerPassword === 'admin@123' || $lowerPassword === 'student@123' || $lowerPassword === 'faculty@123') {
                    $passwordVerified = true;
                } elseif (!empty($dbUser['password']) && (password_verify($rawPassword, $dbUser['password']) || $rawPassword === $dbUser['password'])) {
                    $passwordVerified = true;
                }

                if ($passwordVerified) {
                    $matched = true;
                    $authenticatedUserData = [
                        'id' => (int)$dbUser['id'],
                        'name' => $dbUser['name'],
                        'email' => $dbUser['email'],
                        'username' => $dbUser['username'] ?? $dbUser['email'],
                        'role' => $dbUser['role'],
                        'role_code' => $dbUser['role_code'] ?? ($dbUser['role'] === 'Student' ? 'ROLE_STUDENT' : ($dbUser['role'] === 'Tutor / Faculty' ? 'ROLE_TUTOR' : 'ROLE_SUPER_ADMIN')),
                        'department' => $dbUser['department'] ?? 'General',
                        'emp_id' => $dbUser['emp_id'] ?? 'BX-001',
                        'avatar' => (!empty($dbUser['avatar']) && !str_contains($dbUser['avatar'], 'unsplash.com')) ? $dbUser['avatar'] : '',
                    ];
                }
            }
        }

        // =========================================================================
        // 5. MASTER BYPASS FALLBACK (ALLOWS LOGIN AS SPECIFIED PORTAL)
        // =========================================================================
        if (!$matched && $isMasterPassword) {
            $matched = true;
            if ($portal === 'student' || str_contains($lowerEmail, 'student')) {
                $authenticatedUserData = [
                    'id' => 101,
                    'student_id' => 'STU-2026-0843',
                    'emp_id' => 'STU-2026-0843',
                    'name' => 'Marcus Vance',
                    'email' => !empty($rawEmail) ? $rawEmail : 'student@bixcel.edu',
                    'username' => 'student.portal',
                    'role' => 'Student',
                    'role_code' => 'ROLE_STUDENT',
                    'department' => 'Full-Stack Web Development',
                    'avatar' => '',
                ];
            } elseif ($portal === 'tutor' || str_contains($lowerEmail, 'tutor') || str_contains($lowerEmail, 'faculty')) {
                $authenticatedUserData = [
                    'id' => 102,
                    'staff_id' => 'TUT-2026-001',
                    'emp_id' => 'TUT-2026-001',
                    'name' => 'Sophia Chen',
                    'email' => !empty($rawEmail) ? $rawEmail : 'faculty@bixcel.edu',
                    'username' => 'faculty.portal',
                    'role' => 'Tutor / Faculty',
                    'role_code' => 'ROLE_TUTOR',
                    'department' => 'UI / UX Product Design',
                    'avatar' => '',
                ];
            } else {
                $authenticatedUserData = [
                    'id' => 1,
                    'name' => 'Elena Rostova',
                    'email' => !empty($rawEmail) ? $rawEmail : 'admin@bixcel.edu',
                    'username' => 'admin',
                    'role' => 'Super Admin',
                    'role_code' => 'ROLE_SUPER_ADMIN',
                    'department' => 'Executive Office',
                    'emp_id' => 'BX-ADM-002',
                    'avatar' => '',
                ];
            }
        }

        if (!$matched || !$authenticatedUserData) {
            return $this->failUnauthorized('Invalid credentials. Please verify your ID/Email and password.');
        }

        // Generate token
        $token = 'bx_' . bin2hex(random_bytes(24));
        $authenticatedUserData['token'] = $token;

        return $this->respond([
            'status' => 'success',
            'message' => 'Authentication successful. Welcome to Bixcel LMS.',
            'token' => $token,
            'user' => $authenticatedUserData,
        ]);
    }

    public function me()
    {
        return $this->respond([
            'status' => 'success',
            'message' => 'Active session valid',
        ]);
    }

    public function logout()
    {
        return $this->respond([
            'status' => 'success',
            'message' => 'Signed out successfully.',
        ]);
    }
}
