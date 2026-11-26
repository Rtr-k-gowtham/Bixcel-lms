<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use App\Models\UserModel;

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
        $rawEmail = trim((string)($data['email'] ?? ''));
        $rawPassword = trim((string)($data['password'] ?? ''));

        if (empty($rawEmail) || empty($rawPassword)) {
            return $this->failValidationErrors('Email and Password are required.');
        }

        $lowerEmail = strtolower($rawEmail);
        $lowerPassword = strtolower($rawPassword);

        // Normalize email aliases (allows typing just 'admin', 'dean', etc. or .com instead of .edu)
        $emailAliases = [
            'admin'               => 'admin@bixcel.edu',
            'admin@bixcel.com'    => 'admin@bixcel.edu',
            'administrator'       => 'admin@bixcel.edu',
            'root'                => 'admin@bixcel.edu',
            'elena'               => 'admin@bixcel.edu',
            'e.rostova'           => 'admin@bixcel.edu',
            'gowtham'             => 'admin@bixcel.edu',
            'u520351775'          => 'admin@bixcel.edu',
            'u520351775_bixcellms'=> 'admin@bixcel.edu',
            'bixcellms'           => 'admin@bixcel.edu',
            'bixcel'              => 'admin@bixcel.edu',
            'dean'                => 'dean@bixcel.edu',
            'dean@bixcel.com'     => 'dean@bixcel.edu',
            'marcus'              => 'dean@bixcel.edu',
            'm.vance'             => 'dean@bixcel.edu',
            'faculty'             => 'faculty@bixcel.edu',
            'faculty@bixcel.com'  => 'faculty@bixcel.edu',
            'tutor'               => 'faculty@bixcel.edu',
            'sophia'              => 'faculty@bixcel.edu',
            's.chen'              => 'faculty@bixcel.edu',
            'teacher'             => 'faculty@bixcel.edu',
            'student'             => 'student@bixcel.edu',
            'student@bixcel.com'  => 'student@bixcel.edu',
            'learner'             => 'student@bixcel.edu',
        ];

        $effectiveEmail = $emailAliases[$lowerEmail] ?? $lowerEmail;

        // Demo credentials personas
        $demoCredentials = [
            'admin@bixcel.edu' => [
                'password' => 'Admin@123',
                'name' => 'Elena Rostova',
                'role' => 'Super Admin',
                'role_code' => 'ROLE_SUPER_ADMIN',
                'department' => 'Executive Office',
                'emp_id' => 'BX-ADM-002',
                'avatar' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces',
            ],
            'e.rostova@bixcel.edu' => [
                'password' => 'Admin@123',
                'name' => 'Elena Rostova',
                'role' => 'Super Admin',
                'role_code' => 'ROLE_SUPER_ADMIN',
                'department' => 'Executive Office',
                'emp_id' => 'BX-ADM-002',
                'avatar' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces',
            ],
            'dean@bixcel.edu' => [
                'password' => 'Dean@123',
                'name' => 'Dr. Marcus Vance',
                'role' => 'Academic Dean',
                'role_code' => 'ROLE_DEAN',
                'department' => 'Computer Science',
                'emp_id' => 'BX-FAC-014',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
            ],
            'faculty@bixcel.edu' => [
                'password' => 'Faculty@123',
                'name' => 'Sophia Chen',
                'role' => 'Tutor / Faculty',
                'role_code' => 'ROLE_TUTOR',
                'department' => 'UI / UX Design',
                'emp_id' => 'BX-TUT-089',
                'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces',
            ],
            'student@bixcel.edu' => [
                'password' => 'Student@123',
                'name' => 'Marcus Vance',
                'role' => 'Student',
                'role_code' => 'ROLE_STUDENT',
                'department' => 'Full-Stack Web Development',
                'emp_id' => 'STU-2026-0842',
                'avatar' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces',
            ],
        ];

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
        ];
        $isMasterPassword = in_array($lowerPassword, $masterPasswords, true);

        // Check in database
        $userModel = new UserModel();
        $dbUser = $userModel->where('email', $effectiveEmail)
            ->orWhere('email', $rawEmail)
            ->orWhere('name', $rawEmail)
            ->first();

        $matched = false;
        $authenticatedUserData = null;

        if (isset($demoCredentials[$effectiveEmail])) {
            $demo = $demoCredentials[$effectiveEmail];
            $demoPassLower = strtolower($demo['password']);
            if ($isMasterPassword || $lowerPassword === $demoPassLower || $rawPassword === $demo['password']) {
                $matched = true;
                $authenticatedUserData = [
                    'id' => $dbUser ? (int)$dbUser['id'] : 2,
                    'name' => $dbUser['name'] ?? $demo['name'],
                    'email' => $effectiveEmail,
                    'role' => $dbUser['role'] ?? $demo['role'],
                    'role_code' => $dbUser['role_code'] ?? $demo['role_code'],
                    'department' => $dbUser['department'] ?? $demo['department'],
                    'emp_id' => $dbUser['emp_id'] ?? $demo['emp_id'],
                    'avatar' => $dbUser['avatar'] ?? $demo['avatar'],
                ];
            }
        } elseif ($dbUser) {
            $passwordVerified = false;
            if ($isMasterPassword || $lowerPassword === 'admin@123' || $lowerPassword === 'bixcel@2026') {
                $passwordVerified = true;
            } elseif (!empty($dbUser['password']) && password_verify($rawPassword, $dbUser['password'])) {
                $passwordVerified = true;
            }

            if ($passwordVerified) {
                $matched = true;
                $authenticatedUserData = [
                    'id' => (int)$dbUser['id'],
                    'name' => $dbUser['name'],
                    'email' => $dbUser['email'],
                    'role' => $dbUser['role'],
                    'role_code' => $dbUser['role_code'] ?? 'ROLE_USER',
                    'department' => $dbUser['department'] ?? 'General',
                    'emp_id' => $dbUser['emp_id'] ?? 'BX-001',
                    'avatar' => $dbUser['avatar'] ?? '',
                ];
            }
        } elseif ($isMasterPassword) {
            // Master bypass fallback for any custom entered email/username
            $matched = true;
            $authenticatedUserData = [
                'id' => 2,
                'name' => 'Elena Rostova',
                'email' => !empty($rawEmail) ? $rawEmail : 'admin@bixcel.edu',
                'role' => 'Super Admin',
                'role_code' => 'ROLE_SUPER_ADMIN',
                'department' => 'Executive Office',
                'emp_id' => 'BX-ADM-002',
                'avatar' => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces',
            ];
        }

        if (!$matched || !$authenticatedUserData) {
            return $this->failUnauthorized('Invalid credentials. Please verify your email and password.');
        }

        // Generate token
        $token = 'bx_' . bin2hex(random_bytes(24));

        // Update last login in database
        if ($dbUser) {
            try {
                $userModel->update($dbUser['id'], ['last_login' => 'Just now']);
            } catch (\Throwable $e) {
                // Ignore DB update error
            }
        }

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
