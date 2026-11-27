<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use App\Models\AssignmentModel;

class AssignmentController extends BaseApiController
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

        $model = new AssignmentModel();
        $builder = $model->orderBy('id', 'DESC');

        if (!empty($batch) && $batch !== 'All') {
            $builder->where('batch_code', $batch);
        }
        if (!empty($status) && $status !== 'All') {
            $builder->where('status', $status);
        }

        $records = $builder->findAll();

        $data = array_map(function ($item) {
            if (!empty($item['student_submissions']) && is_string($item['student_submissions'])) {
                $item['student_submissions'] = json_decode($item['student_submissions'], true) ?? [];
            } else {
                $item['student_submissions'] = $item['student_submissions'] ?? [];
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
        $model = new AssignmentModel();
        $item = $model->find($id);
        if (!$item) {
            return $this->failNotFound('Assignment record not found.');
        }
        if (!empty($item['student_submissions']) && is_string($item['student_submissions'])) {
            $item['student_submissions'] = json_decode($item['student_submissions'], true) ?? [];
        }
        return $this->respond(['status' => 'success', 'data' => $item]);
    }

    public function create()
    {
        $input = $this->getRequestData();

        if (empty($input['title'])) {
            return $this->failValidationErrors(['title' => 'Assignment title is required.']);
        }

        $uid = 'ASN-2026-' . rand(100, 999);
        $now = date('Y-m-d H:i:s');

        $payload = [
            'assignment_uid' => $input['assignment_uid'] ?? $uid,
            'title' => trim((string) $input['title']),
            'track' => $input['track'] ?? 'General Engineering',
            'batch_code' => $input['batch_code'] ?? ($input['batch'] ?? 'BIX-DEV-24A'),
            'description' => $input['description'] ?? '',
            'total_marks' => (int) ($input['total_marks'] ?? 100),
            'passing_marks' => (int) ($input['passing_marks'] ?? 50),
            'due_date' => $input['due_date'] ?? date('Y-m-d', strtotime('+7 days')),
            'status' => $input['status'] ?? 'Draft',
            'sent_to_count' => (int) ($input['sent_to_count'] ?? 0),
            'submitted_count' => (int) ($input['submitted_count'] ?? 0),
            'evaluated_count' => (int) ($input['evaluated_count'] ?? 0),
            'student_submissions' => isset($input['student_submissions'])
                ? (is_array($input['student_submissions']) ? json_encode($input['student_submissions']) : $input['student_submissions'])
                : null,
            'created_at' => $now,
            'updated_at' => $now,
        ];

        $model = new AssignmentModel();
        $id = $model->insert($payload);
        $payload['id'] = $id;

        if (!empty($payload['student_submissions']) && is_string($payload['student_submissions'])) {
            $payload['student_submissions'] = json_decode($payload['student_submissions'], true);
        }

        return $this->respondCreated([
            'status' => 'success',
            'message' => 'Assignment created successfully.',
            'data' => $payload,
        ]);
    }

    public function update($id = null)
    {
        $input = $this->getRequestData();
        $model = new AssignmentModel();
        $existing = $model->find($id);

        if (!$existing) {
            return $this->failNotFound('Assignment record not found.');
        }

        $update = [];
        foreach (['title', 'track', 'batch_code', 'description', 'total_marks', 'passing_marks', 'due_date', 'status', 'sent_to_count', 'submitted_count', 'evaluated_count'] as $f) {
            if (isset($input[$f])) {
                $update[$f] = $input[$f];
            }
        }

        if (isset($input['batch'])) {
            $update['batch_code'] = $input['batch'];
        }

        if (isset($input['student_submissions'])) {
            $update['student_submissions'] = is_array($input['student_submissions'])
                ? json_encode($input['student_submissions'])
                : $input['student_submissions'];
        }

        $update['updated_at'] = date('Y-m-d H:i:s');
        $model->update($id, $update);

        $merged = array_merge($existing, $update);
        if (!empty($merged['student_submissions']) && is_string($merged['student_submissions'])) {
            $merged['student_submissions'] = json_decode($merged['student_submissions'], true);
        }

        return $this->respond([
            'status' => 'success',
            'message' => 'Assignment updated successfully.',
            'data' => $merged,
        ]);
    }

    public function delete($id = null)
    {
        $model = new AssignmentModel();
        if (!$model->find($id)) {
            return $this->failNotFound('Assignment record not found.');
        }
        $model->delete($id);
        return $this->respondDeleted(['status' => 'success', 'message' => 'Assignment deleted.']);
    }
}
