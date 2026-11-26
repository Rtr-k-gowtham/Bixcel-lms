<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use App\Models\NotificationModel;

class NotificationController extends BaseApiController
{
    protected $format = 'json';

    public function __construct()
    {
        DatabaseBootstrapper::ensureInitialized();
        $this->request ??= \Config\Services::request();
        $this->response ??= \Config\Services::response();
    }

    public function index()
    {
        $notifModel = new NotificationModel();
        $notifications = $notifModel->orderBy('id', 'ASC')->findAll();

        $unreadCount = 0;
        $formatted = [];

        foreach ($notifications as $n) {
            $isRead = (bool)$n['is_read'];
            if (!$isRead) {
                $unreadCount++;
            }

            $formatted[] = [
                'id'           => $n['notif_code'],
                'db_id'        => (int)$n['id'],
                'type'         => $n['type'],
                'priority'     => $n['priority'],
                'title'        => $n['title'],
                'message'      => $n['message'],
                'category'     => $n['category'],
                'timestamp'    => $n['timestamp_label'] ?? 'Recent',
                'is_read'      => $isRead,
                'action_label' => $n['action_label'],
                'action_link'  => $n['action_link'],
                'icon'         => $n['icon'],
            ];
        }

        return $this->respond([
            'status'       => 'success',
            'total'        => count($formatted),
            'unread_count' => $unreadCount,
            'data'         => $formatted,
        ]);
    }

    public function readAll()
    {
        $notifModel = new NotificationModel();
        $notifModel->where('is_read', 0)->set(['is_read' => 1])->update();

        return $this->respond([
            'status'  => 'success',
            'message' => 'All notifications marked as read',
        ]);
    }

    public function update($id = null)
    {
        $notifModel = new NotificationModel();
        $notif = is_numeric($id) ? $notifModel->find((int)$id) : null;
        if (!$notif) {
            $notif = $notifModel->where('notif_code', $id)->first();
        }

        if (!$notif) {
            return $this->failNotFound('Notification not found');
        }

        $notifModel->update($notif['id'], ['is_read' => 1]);

        $notif['is_read'] = true;
        $notif['id'] = $notif['notif_code'];

        return $this->respond([
            'status' => 'success',
            'data'   => $notif,
        ]);
    }

    public function delete($id = null)
    {
        $notifModel = new NotificationModel();
        $notif = is_numeric($id) ? $notifModel->find((int)$id) : null;
        if (!$notif) {
            $notif = $notifModel->where('notif_code', $id)->first();
        }

        if (!$notif) {
            return $this->failNotFound('Notification not found');
        }

        $notifModel->delete($notif['id']);

        return $this->respondDeleted([
            'status'  => 'success',
            'message' => 'Notification cleared',
        ]);
    }
}
