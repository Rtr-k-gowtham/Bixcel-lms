<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use App\Models\AuditLogModel;

class AuditController extends BaseApiController
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
        $auditModel = new AuditLogModel();
        $builder = $auditModel->builder();

        $actionType = $this->request->getGet('action_type');
        $module = $this->request->getGet('module');
        $severity = $this->request->getGet('severity');

        if (!empty($actionType) && $actionType !== 'All') {
            $builder->where('action_type', $actionType);
        }

        if (!empty($module) && $module !== 'All') {
            $builder->where('module', $module);
        }

        if (!empty($severity) && $severity !== 'All') {
            $builder->where('severity', $severity);
        }

        $logs = $builder->orderBy('id', 'DESC')->get()->getResultArray();

        $formatted = [];
        foreach ($logs as $log) {
            $details = null;
            if (!empty($log['details_json'])) {
                $details = json_decode($log['details_json'], true);
            }

            $formatted[] = [
                'id'          => $log['log_code'],
                'db_id'       => (int)$log['id'],
                'timestamp'   => $log['created_at'],
                'relative'    => $log['relative'] ?? 'Recent',
                'actor_name'  => $log['actor_name'],
                'actor_email' => $log['actor_email'],
                'actor_role'  => $log['actor_role'],
                'action'      => $log['action'],
                'action_type' => $log['action_type'],
                'module'      => $log['module'],
                'ip_address'  => $log['ip_address'],
                'user_agent'  => $log['user_agent'],
                'severity'    => $log['severity'],
                'status'      => $log['status'],
                'summary'     => $log['summary'],
                'details'     => $details,
            ];
        }

        return $this->respond([
            'status' => 'success',
            'count'  => count($formatted),
            'data'   => $formatted,
        ]);
    }

    public function show($id = null)
    {
        $auditModel = new AuditLogModel();
        $log = is_numeric($id) ? $auditModel->find((int)$id) : null;
        if (!$log) {
            $log = $auditModel->where('log_code', $id)->first();
        }

        if (!$log) {
            return $this->failNotFound('Audit record not found: ' . $id);
        }

        $details = !empty($log['details_json']) ? json_decode($log['details_json'], true) : null;

        $formatted = [
            'id'          => $log['log_code'],
            'db_id'       => (int)$log['id'],
            'timestamp'   => $log['created_at'],
            'relative'    => $log['relative'] ?? 'Recent',
            'actor_name'  => $log['actor_name'],
            'actor_email' => $log['actor_email'],
            'actor_role'  => $log['actor_role'],
            'action'      => $log['action'],
            'action_type' => $log['action_type'],
            'module'      => $log['module'],
            'ip_address'  => $log['ip_address'],
            'user_agent'  => $log['user_agent'],
            'severity'    => $log['severity'],
            'status'      => $log['status'],
            'summary'     => $log['summary'],
            'details'     => $details,
        ];

        return $this->respond([
            'status' => 'success',
            'data'   => $formatted,
        ]);
    }

    public function create()
    {
        $data = $this->getRequestData();

        $auditModel = new AuditLogModel();
        $code = 'AUD-' . rand(8000, 9999);

        $newLog = [
            'log_code'     => $data['id'] ?? $code,
            'actor_name'   => $data['actor_name'] ?? 'System',
            'actor_email'  => $data['actor_email'] ?? 'system@bixcel.edu',
            'actor_role'   => $data['actor_role'] ?? 'System',
            'action'       => $data['action'] ?? 'GENERIC_ACTION',
            'action_type'  => $data['action_type'] ?? 'INFO',
            'module'       => $data['module'] ?? 'System',
            'ip_address'   => $data['ip_address'] ?? '127.0.0.1',
            'user_agent'   => $data['user_agent'] ?? 'Bixcel LMS Core',
            'severity'     => $data['severity'] ?? 'INFO',
            'status'       => $data['status'] ?? 'Success',
            'summary'      => $data['summary'] ?? '',
            'details_json' => isset($data['details']) ? json_encode($data['details']) : null,
            'relative'     => 'Just now',
            'created_at'   => date('Y-m-d H:i:s'),
        ];

        try {
            $auditModel->insert($newLog);
            return $this->respondCreated([
                'status'  => 'success',
                'message' => 'Audit log recorded',
                'data'    => $newLog,
            ]);
        } catch (\Throwable $e) {
            return $this->failServerError('Failed to record audit: ' . $e->getMessage());
        }
    }
}
