<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class ProfileController extends ResourceController
{
    protected $format = 'json';

    private static array $profile = [
        'id'            => 2,
        'name'          => 'Elena Rostova',
        'first_name'    => 'Elena',
        'last_name'     => 'Rostova',
        'email'         => 'e.rostova@bixcel.edu',
        'emp_id'        => 'BX-ADM-002',
        'role'          => 'Super Admin',
        'role_code'     => 'ROLE_SUPER_ADMIN',
        'department'    => 'Executive Office',
        'institution'   => 'Bixcel Institute of Technologies Private Limited',
        'phone'         => '+1 (555) 876-5432',
        'office'        => 'Suite 401, Tech Tower A',
        'join_date'     => 'January 15, 2024',
        'timezone'      => 'UTC+05:30 (Asia/Kolkata)',
        'bio'           => 'Principal Executive Director overseeing institutional LMS architecture, academic compliance, and multi-tenant security operations at Bixcel Institute.',
        'avatar'        => 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces',
        'security'      => [
            'two_factor_enabled' => true,
            'auth_app_synced'    => true,
            'password_changed_at'=> 'October 12, 2026',
            'failed_logins'      => 0,
        ],
        'sessions'      => [
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
        ],
        'preferences'   => [
            'theme'               => 'system',
            'email_digest'        => 'daily',
            'sms_critical_alerts' => true,
            'default_landing'     => 'dashboard',
            'language'            => 'en-US',
        ],
    ];

    public function index()
    {
        return $this->respond([
            'status' => 'success',
            'data'   => self::$profile,
        ]);
    }

    public function update($id = null)
    {
        $payload = $this->request->getJSON(true) ?? $this->request->getRawInput();

        foreach ($payload as $key => $val) {
            if ($key === 'security' || $key === 'preferences') {
                self::$profile[$key] = array_merge(self::$profile[$key], $val);
            } else {
                self::$profile[$key] = $val;
            }
        }

        return $this->respond([
            'status'  => 'success',
            'message' => 'Profile preferences updated successfully',
            'data'    => self::$profile,
        ]);
    }

    public function revokeSession($sessionId = null)
    {
        foreach (self::$profile['sessions'] as $idx => $sess) {
            if ($sess['id'] === $sessionId) {
                if ($sess['is_current']) {
                    return $this->fail('Cannot revoke your active session', 400);
                }
                array_splice(self::$profile['sessions'], $idx, 1);
                return $this->respond([
                    'status'  => 'success',
                    'message' => 'Session revoked',
                ]);
            }
        }
        return $this->failNotFound('Session not found');
    }
}
