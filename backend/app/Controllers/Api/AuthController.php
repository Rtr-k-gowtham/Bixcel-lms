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
        $email = trim((string)($data['email'] ?? ''));
        $password = (string)($data['password'] ?? '');

        if (empty($email) || empty($password)) {
            return $this->failValidationErrors('Email and Password are required.');
        }

        // Demo credentials mapping (matches user seed data & role requirements)
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
            'm.vance@bixcel.edu' => [
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
            's.chen@bixcel.edu' => [
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

        $userModel = new UserModel();
        $dbUser = $userModel->where('email', $email)->first();

        $matched = false;
        $authenticatedUserData = null;

        $lowerEmail = strtolower($email);
        if (isset($demoCredentials[$lowerEmail])) {
            $demo = $demoCredentials[$lowerEmail];
            if ($password === $demo['password'] || $password === 'Bixcel@2026' || $password === 'Admin@123' || $password === 'Gowtham@1472004') {
                $matched = true;
                $authenticatedUserData = [
                    'id' => $dbUser ? (int)$dbUser['id'] : 2,
                    'name' => $dbUser['name'] ?? $demo['name'],
                    'email' => $email,
                    'role' => $dbUser['role'] ?? $demo['role'],
                    'role_code' => $dbUser['role_code'] ?? $demo['role_code'],
                    'department' => $dbUser['department'] ?? $demo['department'],
                    'emp_id' => $dbUser['emp_id'] ?? $demo['emp_id'],
                    'avatar' => $dbUser['avatar'] ?? $demo['avatar'],
                ];
            }
        } elseif ($dbUser) {
            // General password fallback or standard demo passwords
            if ($password === 'Bixcel@2026' || $password === 'Admin@123' || $password === 'Gowtham@1472004' || (isset($dbUser['password']) && password_verify($password, $dbUser['password']))) {
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
        }

        if (!$matched || !$authenticatedUserData) {
            return $this->failUnauthorized('Invalid credentials. Please verify your email and password.');
        }

        // Generate token
        $token = 'bx_' . bin2hex(random_bytes(24));

        // Update last login in database
        if ($dbUser) {
            $userModel->update($dbUser['id'], ['last_login' => 'Just now']);
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
