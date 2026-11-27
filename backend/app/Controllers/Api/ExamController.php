<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use App\Models\ExamModel;

class ExamController extends BaseApiController
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

        $model = new ExamModel();
        $builder = $model->orderBy('id', 'DESC');

        if (!empty($batch) && $batch !== 'All') {
            $builder->where('batch_code', $batch);
        }
        if (!empty($status) && $status !== 'All') {
            $builder->where('status', $status);
        }

        $records = $builder->findAll();

        $data = array_map(function ($item) {
            if (!empty($item['student_results']) && is_string($item['student_results'])) {
                $item['student_results'] = json_decode($item['student_results'], true) ?? [];
            } else {
                $item['student_results'] = $item['student_results'] ?? [];
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
        $model = new ExamModel();
        $item = $model->find($id);
        if (!$item) {
            return $this->failNotFound('Exam record not found.');
        }
        if (!empty($item['student_results']) && is_string($item['student_results'])) {
            $item['student_results'] = json_decode($item['student_results'], true) ?? [];
        }
        return $this->respond(['status' => 'success', 'data' => $item]);
    }

    public function create()
    {
        $input = $this->getRequestData();

        if (empty($input['title'])) {
            return $this->failValidationErrors(['title' => 'Examination title is required.']);
        }

        $uid = 'EXAM-2026-' . rand(100, 999);
        $now = date('Y-m-d H:i:s');

        $payload = [
            'exam_uid' => $input['exam_uid'] ?? $uid,
            'title' => trim((string) $input['title']),
            'exam_type' => $input['exam_type'] ?? 'Theory',
            'track' => $input['track'] ?? 'General Engineering',
            'batch_code' => $input['batch_code'] ?? ($input['batch'] ?? 'BIX-DEV-24A'),
            'exam_date' => $input['exam_date'] ?? date('Y-m-d', strtotime('+3 days')),
            'start_time' => $input['start_time'] ?? '10:00 AM',
            'duration_mins' => (int) ($input['duration_mins'] ?? 90),
            'total_marks' => (int) ($input['total_marks'] ?? 100),
            'passing_marks' => (int) ($input['passing_marks'] ?? 40),
            'room' => $input['room'] ?? 'Examination Hall A',
            'examiner' => $input['examiner'] ?? 'Academic Board',
            'status' => $input['status'] ?? 'Draft',
            'student_results' => isset($input['student_results'])
                ? (is_array($input['student_results']) ? json_encode($input['student_results']) : $input['student_results'])
                : null,
            'created_at' => $now,
            'updated_at' => $now,
        ];

        $model = new ExamModel();
        $id = $model->insert($payload);
        $payload['id'] = $id;

        if (!empty($payload['student_results']) && is_string($payload['student_results'])) {
            $payload['student_results'] = json_decode($payload['student_results'], true);
        }

        return $this->respondCreated([
            'status' => 'success',
            'message' => 'Examination created successfully.',
            'data' => $payload,
        ]);
    }

    public function update($id = null)
    {
        $input = $this->getRequestData();
        $model = new ExamModel();
        $existing = $model->find($id);

        if (!$existing) {
            return $this->failNotFound('Exam record not found.');
        }

        $update = [];
        foreach (['title', 'exam_type', 'track', 'batch_code', 'exam_date', 'start_time', 'duration_mins', 'total_marks', 'passing_marks', 'room', 'examiner', 'status'] as $f) {
            if (isset($input[$f])) {
                $update[$f] = $input[$f];
            }
        }

        if (isset($input['batch'])) {
            $update['batch_code'] = $input['batch'];
        }

        if (isset($input['student_results'])) {
            $update['student_results'] = is_array($input['student_results'])
                ? json_encode($input['student_results'])
                : $input['student_results'];
        }

        $update['updated_at'] = date('Y-m-d H:i:s');
        $model->update($id, $update);

        $merged = array_merge($existing, $update);
        if (!empty($merged['student_results']) && is_string($merged['student_results'])) {
            $merged['student_results'] = json_decode($merged['student_results'], true);
        }

        return $this->respond([
            'status' => 'success',
            'message' => 'Examination updated successfully.',
            'data' => $merged,
        ]);
    }

    public function delete($id = null)
    {
        $model = new ExamModel();
        if (!$model->find($id)) {
            return $this->failNotFound('Exam record not found.');
        }
        $model->delete($id);
        return $this->respondDeleted(['status' => 'success', 'message' => 'Examination deleted.']);
    }
}
