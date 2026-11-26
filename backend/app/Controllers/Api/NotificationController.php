<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class NotificationController extends ResourceController
{
    protected $format = 'json';

    private static array $notifications = [
        [
            'id'          => 'NOTIF-101',
            'type'        => 'finance',
            'priority'    => 'critical',
            'title'       => '14 Fee Installments Overdue in Batch B26-FS-A',
            'message'     => 'Tuition installment deadline expired 48 hours ago for 14 enrolled learners. Automated collection notices queued for dispatch.',
            'category'    => 'Finance & Payments',
            'timestamp'   => '18 mins ago',
            'is_read'     => false,
            'action_label'=> 'Review Fee Ledger',
            'action_link' => '#fees',
            'icon'        => 'payments',
        ],
        [
            'id'          => 'NOTIF-102',
            'type'        => 'timetable',
            'priority'    => 'warning',
            'title'       => 'Room 204 Scheduling Conflict Detected for Nov 28',
            'message'     => 'Simultaneous booking requested for Lab 204 by CS-401 (Dr. Vance) and UX-110 (Sophia Chen) at 02:00 PM.',
            'category'    => 'Timetable & Rooms',
            'timestamp'   => '1 hour ago',
            'is_read'     => false,
            'action_label'=> 'Resolve Room Conflict',
            'action_link' => '#timetable',
            'icon'        => 'meeting_room',
        ],
        [
            'id'          => 'NOTIF-103',
            'type'        => 'security',
            'priority'    => 'critical',
            'title'       => 'IP Blacklist Action Triggered: 45.33.32.156',
            'message'     => 'Automated rate-limiter blocked repeated brute-force authentication attempts targeting administrator portal.',
            'category'    => 'Security & Audit',
            'timestamp'   => '2 hours ago',
            'is_read'     => false,
            'action_label'=> 'Inspect Security Logs',
            'action_link' => '#audit',
            'icon'        => 'gpp_bad',
        ],
        [
            'id'          => 'NOTIF-104',
            'type'        => 'academic',
            'priority'    => 'info',
            'title'       => 'Final Midterm Grades Submitted for DS-204',
            'message'     => 'Dr. Marcus Vance published verified assessment evaluation for 32 students in Data Engineering cohort with 94% pass rate.',
            'category'    => 'Academic & Exams',
            'timestamp'   => '3 hours ago',
            'is_read'     => false,
            'action_label'=> 'View Grade Spread',
            'action_link' => '#exams',
            'icon'        => 'quiz',
        ],
        [
            'id'          => 'NOTIF-105',
            'type'        => 'system',
            'priority'    => 'info',
            'title'       => 'CodeIgniter 4 REST API Auto-Backup Finished',
            'message'     => 'Nightly snapshot of course catalog, permission matrices, and user registry completed without discrepancies.',
            'category'    => 'System & Maintenance',
            'timestamp'   => 'Yesterday at 03:00 AM',
            'is_read'     => true,
            'action_label'=> 'View System Diagnostics',
            'action_link' => '#settings',
            'icon'        => 'cloud_done',
        ],
        [
            'id'          => 'NOTIF-106',
            'type'        => 'admissions',
            'priority'    => 'info',
            'title'       => '6 New Student Applications Pending Dean Review',
            'message'     => 'Undergraduate admission candidates submitted credential portfolios for Spring 2027 intake cohort.',
            'category'    => 'Student Admissions',
            'timestamp'   => 'Yesterday',
            'is_read'     => true,
            'action_label'=> 'Review Applications',
            'action_link' => '#admissions',
            'icon'        => 'how_to_reg',
        ],
    ];

    public function index()
    {
        $unreadCount = count(array_filter(self::$notifications, fn($n) => !$n['is_read']));

        return $this->respond([
            'status'       => 'success',
            'total'        => count(self::$notifications),
            'unread_count' => $unreadCount,
            'data'         => self::$notifications,
        ]);
    }

    public function readAll()
    {
        foreach (self::$notifications as &$notif) {
            $notif['is_read'] = true;
        }

        return $this->respond([
            'status'  => 'success',
            'message' => 'All notifications marked as read',
        ]);
    }

    public function update($id = null)
    {
        foreach (self::$notifications as &$notif) {
            if ($notif['id'] === $id) {
                $notif['is_read'] = true;
                return $this->respond([
                    'status' => 'success',
                    'data'   => $notif,
                ]);
            }
        }
        return $this->failNotFound('Notification not found');
    }

    public function delete($id = null)
    {
        foreach (self::$notifications as $idx => $notif) {
            if ($notif['id'] === $id) {
                array_splice(self::$notifications, $idx, 1);
                return $this->respondDeleted([
                    'status'  => 'success',
                    'message' => 'Notification cleared',
                ]);
            }
        }
        return $this->failNotFound('Notification not found');
    }
}
