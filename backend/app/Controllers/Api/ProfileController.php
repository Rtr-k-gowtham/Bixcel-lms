<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use App\Models\UserModel;

class ProfileController extends BaseApiController
{
    protected $format = 'json';

    public function __construct()
    {
        DatabaseBootstrapper::ensureInitialized();
        $this->request ??= \Config\Services::request();
        $this->response ??= \Config\Services::response();
    }

    private static array $mockSessions = [
        [
            'id'         => 'SES-901',
            'device'     => 'Windows 11 • Chrome 128',
            'is_current' => true,
            'ip'         => '192.168.1.102',
            'location'   => 'Chennai, India',
            'started'    => 'Today at 08:30 AM',
            'status'     => 'Active',
        ],
        [
            'id'         => 'SES-902',
            'device'     => 'macOS Sonoma • Safari 17',
            'is_current' => false,
            'ip'         => '192.168.1.115',
            'location'   => 'Bangalore, India',
            'started'    => 'Yesterday at 04:12 PM',
            'status'     => 'Idle',
        ],
        [
            'id'         => 'SES-903',
            'device'     => 'iPhone 15 Pro • Bixcel Mobile App',
            'is_current' => false,
            'ip'         => '10.0.0.54',
            'location'   => 'Chennai, India',
            'started'    => 'Nov 24, 2026',
            'status'     => 'Idle',
        ],
    ];

    private static array $mockSecurity = [
        'two_factor_enabled'  => true,
        'auth_app_synced'     => true,
        'password_changed_at' => 'October 12, 2026',
        'failed_logins'       => 0,
    ];

    private static array $mockPreferences = [
        'theme'               => 'system',
        'email_digest'        => 'daily',
        'sms_critical_alerts' => true,
        'default_landing'     => 'dashboard',
        'language'            => 'en-US',
    ];

    public function index()
    {
        $userModel = new UserModel();
        // Get active profile (Elena Rostova or first user)
        $user = $userModel->where('email', 'e.rostova@bixcel.edu')->first() ?? $userModel->first();

        if (!$user) {
            return $this->failNotFound('Profile record not found');
        }

        $names = explode(' ', (string)$user['name'], 2);
        $firstName = $names[0] ?? '';
        $lastName = $names[1] ?? '';

        $profile = [
            'id'          => (int)$user['id'],
            'name'        => $user['name'],
            'first_name'  => $firstName,
            'last_name'   => $lastName,
            'email'       => $user['email'],
            'emp_id'      => $user['emp_id'],
            'role'        => $user['role'],
            'role_code'   => $user['role_code'],
            'department'  => $user['department'],
            'institution' => $user['institution'] ?? 'Bixcel Institute of Technologies Private Limited',
            'phone'       => $user['phone'],
            'office'      => $user['office'] ?? 'Suite 401, Tech Tower A',
            'join_date'   => 'January 15, 2024',
            'timezone'    => $user['timezone'] ?? 'UTC+05:30 (Asia/Kolkata)',
            'bio'         => $user['bio'] ?? '',
            'avatar'      => (!empty($user['avatar']) && !str_contains($user['avatar'], 'unsplash.com')) ? $user['avatar'] : '',
            'security'    => self::$mockSecurity,
            'sessions'    => self::$mockSessions,
            'preferences' => self::$mockPreferences,
        ];

        return $this->respond([
            'status' => 'success',
            'data'   => $profile,
        ]);
    }

    public function update($id = null)
    {
        $payload = $this->getRequestData();
        $userModel = new UserModel();

        $user = $userModel->where('email', 'e.rostova@bixcel.edu')->first() ?? $userModel->first();
        if (!$user) {
            return $this->failNotFound('Profile not found to update');
        }

        $updatable = ['name', 'phone', 'office', 'timezone', 'bio', 'institution', 'department'];
        $dbData = [];
        foreach ($updatable as $f) {
            if (isset($payload[$f])) {
                $dbData[$f] = $payload[$f];
            }
        }

        if (isset($payload['first_name']) && isset($payload['last_name'])) {
            $dbData['name'] = trim($payload['first_name'] . ' ' . $payload['last_name']);
        }

        if (!empty($dbData)) {
            $userModel->update($user['id'], $dbData);
        }

        if (isset($payload['preferences']) && is_array($payload['preferences'])) {
            self::$mockPreferences = array_merge(self::$mockPreferences, $payload['preferences']);
        }

        if (isset($payload['security']) && is_array($payload['security'])) {
            self::$mockSecurity = array_merge(self::$mockSecurity, $payload['security']);
        }

        return $this->index();
    }

    public function revokeSession($sessionId = null)
    {
        foreach (self::$mockSessions as $idx => $sess) {
            if ($sess['id'] === $sessionId) {
                if ($sess['is_current']) {
                    return $this->fail('Cannot revoke your active session', 400);
                }
                array_splice(self::$mockSessions, $idx, 1);
                return $this->respond([
                    'status'  => 'success',
                    'message' => 'Session revoked',
                ]);
            }
        }
        return $this->failNotFound('Session not found');
    }
}
