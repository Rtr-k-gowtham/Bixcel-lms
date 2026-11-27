<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use App\Models\CompetencyMilestoneModel;

class MilestoneController extends BaseApiController
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
        $batch = $this->request->getGet('batch');
        $status = $this->request->getGet('status');

        $model = new CompetencyMilestoneModel();
        $builder = $model->orderBy('id', 'DESC');

        if (!empty($batch) && $batch !== 'All') {
            $builder->where('batch_code', $batch);
        }
        if (!empty($status) && $status !== 'All') {
            $builder->where('status', $status);
        }

        $records = $builder->findAll();

        $data = array_map(function ($item) {
            if (!empty($item['student_progress']) && is_string($item['student_progress'])) {
                $item['student_progress'] = json_decode($item['student_progress'], true) ?? [];
            } else {
                $item['student_progress'] = $item['student_progress'] ?? [];
            }
            return $item;
        }, $records);

        return $this->respond([
            'status' => 'success',
            'data' => $data,
        ]);
    }

    public function show($id = null)
    {
        $model = new CompetencyMilestoneModel();
        $item = $model->find($id);
        if (!$item) {
            return $this->failNotFound('Milestone record not found.');
        }
        if (!empty($item['student_progress']) && is_string($item['student_progress'])) {
            $item['student_progress'] = json_decode($item['student_progress'], true) ?? [];
        }
        return $this->respond(['status' => 'success', 'data' => $item]);
    }

    public function create()
    {
        $input = $this->getRequestData();

        if (empty($input['title'])) {
            return $this->failValidationErrors(['title' => 'Milestone title is required.']);
        }

        $uid = 'MLS-2026-' . rand(100, 999);
        $now = date('Y-m-d H:i:s');

        $payload = [
            'milestone_uid' => $input['milestone_uid'] ?? $uid,
            'title' => trim((string) $input['title']),
            'skill_domain' => $input['skill_domain'] ?? ($input['track'] ?? 'Technical Engineering'),
            'category' => $input['category'] ?? 'Capstone Project',
            'track' => $input['track'] ?? 'General Engineering',
            'batch_code' => $input['batch_code'] ?? ($input['batch'] ?? 'BIX-DEV-24A'),
            'description' => $input['description'] ?? '',
            'target_date' => $input['target_date'] ?? date('Y-m-d', strtotime('+14 days')),
            'required_evidence' => $input['required_evidence'] ?? 'Production Repository, Architecture Diagram & Video Demo',
            'status' => $input['status'] ?? 'Draft',
            'evaluator' => $input['evaluator'] ?? 'Faculty Evaluation Committee',
            'student_progress' => isset($input['student_progress'])
                ? (is_array($input['student_progress']) ? json_encode($input['student_progress']) : $input['student_progress'])
                : null,
            'created_at' => $now,
            'updated_at' => $now,
        ];

        $model = new CompetencyMilestoneModel();
        $id = $model->insert($payload);
        $payload['id'] = $id;

        if (!empty($payload['student_progress']) && is_string($payload['student_progress'])) {
            $payload['student_progress'] = json_decode($payload['student_progress'], true);
        }

        return $this->respondCreated([
            'status' => 'success',
            'message' => 'Competency Milestone created successfully.',
            'data' => $payload,
        ]);
    }

    public function update($id = null)
    {
        $input = $this->getRequestData();
        $model = new CompetencyMilestoneModel();
        $existing = $model->find($id);

        if (!$existing) {
            return $this->failNotFound('Milestone record not found.');
        }

        $update = [];
        foreach (['title', 'skill_domain', 'category', 'track', 'batch_code', 'description', 'target_date', 'required_evidence', 'status', 'evaluator'] as $f) {
            if (isset($input[$f])) {
                $update[$f] = $input[$f];
            }
        }

        if (isset($input['batch'])) {
            $update['batch_code'] = $input['batch'];
        }

        if (isset($input['student_progress'])) {
            $update['student_progress'] = is_array($input['student_progress'])
                ? json_encode($input['student_progress'])
                : $input['student_progress'];
        }

        $update['updated_at'] = date('Y-m-d H:i:s');
        $model->update($id, $update);

        $merged = array_merge($existing, $update);
        if (!empty($merged['student_progress']) && is_string($merged['student_progress'])) {
            $merged['student_progress'] = json_decode($merged['student_progress'], true);
        }

        return $this->respond([
            'status' => 'success',
            'message' => 'Competency Milestone updated successfully.',
            'data' => $merged,
        ]);
    }

    public function delete($id = null)
    {
        $model = new CompetencyMilestoneModel();
        if (!$model->find($id)) {
            return $this->failNotFound('Milestone record not found.');
        }
        $model->delete($id);
        return $this->respondDeleted(['status' => 'success', 'message' => 'Milestone deleted.']);
    }
}
