<?php

namespace App\Controllers\Api;

use App\Libraries\DatabaseBootstrapper;
use App\Models\CalendarEventModel;
use CodeIgniter\RESTful\ResourceController;

class CalendarController extends BaseApiController
{
    protected $format = 'json';

    public function __construct()
    {
        DatabaseBootstrapper::ensureInitialized();
        $this->request ??= \Config\Services::request();
        $this->response ??= \Config\Services::response();
    }

    /**
     * Get all calendar events with optional filters
     */
    public function index()
    {
        $batch = $this->request->getGet('batch');
        $type = $this->request->getGet('type');
        $month = $this->request->getGet('month'); // YYYY-MM
        $track = $this->request->getGet('track');

        $eventModel = new CalendarEventModel();
        $dbEvents = $eventModel->orderBy('date', 'ASC')->findAll();

        $events = [];
        foreach ($dbEvents as $e) {
            $events[] = [
                'id' => (int) $e['id'],
                'title' => $e['title'],
                'type' => $e['event_type'] ?? 'lecture',
                'track' => $e['track'] ?? 'Full-Stack Web Development',
                'batch' => $e['batch_code'] ?? 'BIX-DEV-24A',
                'instructor' => $e['instructor'] ?? 'Dr. Aris Thorne',
                'date' => $e['date'],
                'start_time' => $e['start_time'] ?? '09:00',
                'end_time' => $e['end_time'] ?? '11:00',
                'location' => $e['room'] ?? 'Lab 304 / Online',
                'link' => 'https://meet.bixcel.edu/room',
                'status' => 'Scheduled',
                'description' => $e['description'] ?? '',
                'materials' => 'Lecture-Notes.pdf',
            ];
        }

        $filtered = $events;

        if (!empty($batch) && $batch !== 'All') {
            $filtered = array_values(array_filter($filtered, static fn($e) => $e['batch'] === $batch || $e['batch'] === 'All Cohorts'));
        }

        if (!empty($type) && $type !== 'All') {
            $filtered = array_values(array_filter($filtered, static fn($e) => $e['type'] === $type));
        }

        if (!empty($track) && $track !== 'All') {
            $filtered = array_values(array_filter($filtered, static fn($e) => $e['track'] === $track || $e['track'] === 'All Tracks'));
        }

        if (!empty($month)) {
            $filtered = array_values(array_filter($filtered, static fn($e) => str_starts_with($e['date'], $month)));
        }

        return $this->respond([
            'status' => 'success',
            'data' => $filtered,
            'meta' => [
                'total_events' => count($filtered),
                'live_now' => 1,
                'today_date' => date('Y-m-d'),
            ],
        ]);
    }

    /**
     * Get today's agenda & summary
     */
    public function today()
    {
        $todayDate = date('Y-m-d');
        $eventModel = new CalendarEventModel();
        $dbEvents = $eventModel->where('date', $todayDate)->findAll();

        $todayEvents = [];
        foreach ($dbEvents as $e) {
            $todayEvents[] = [
                'id' => (int) $e['id'],
                'title' => $e['title'],
                'type' => $e['event_type'],
                'track' => $e['track'],
                'batch' => $e['batch_code'],
                'instructor' => $e['instructor'],
                'date' => $e['date'],
                'start_time' => $e['start_time'],
                'end_time' => $e['end_time'],
                'location' => $e['room'],
                'link' => 'https://meet.bixcel.edu/room',
                'status' => 'Scheduled',
                'description' => $e['description'],
                'materials' => 'Class-Notes.pdf',
            ];
        }

        return $this->respond([
            'status' => 'success',
            'data' => [
                'date' => $todayDate,
                'events' => $todayEvents,
                'active_batch' => 'FSW-2026-A',
                'enrolled_track' => 'Full-Stack Web Development',
                'attendance_pct' => 96.4,
                'upcoming_assignment' => 'Assignment 3: E-Commerce REST API Handoff',
                'upcoming_assignment_due' => 'Tomorrow, 23:59',
            ],
        ]);
    }

    /**
     * Get single event
     */
    public function show($id = null)
    {
        $eventModel = new CalendarEventModel();
        $e = $eventModel->find($id);

        if (!$e) {
            return $this->failNotFound('Calendar event not found.');
        }

        return $this->respond([
            'status' => 'success',
            'data' => [
                'id' => (int) $e['id'],
                'title' => $e['title'],
                'type' => $e['event_type'],
                'track' => $e['track'],
                'batch' => $e['batch_code'],
                'instructor' => $e['instructor'],
                'date' => $e['date'],
                'start_time' => $e['start_time'],
                'end_time' => $e['end_time'],
                'location' => $e['room'],
                'link' => 'https://meet.bixcel.edu/room',
                'status' => 'Scheduled',
                'description' => $e['description'],
                'materials' => 'Class-Notes.pdf',
            ],
        ]);
    }

    /**
     * Create event / study reminder
     */
    public function create()
    {
        $input = $this->getRequestData();

        if (empty($input['title'])) {
            return $this->failValidationErrors(['title' => 'Event title is required.']);
        }

        $now = date('Y-m-d H:i:s');
        $eventUid = 'EVT-2026-' . rand(1000, 9999);
        $eventData = [
            'event_uid' => $eventUid,
            'title' => trim((string) $input['title']),
            'event_type' => $input['type'] ?? 'lecture',
            'date' => $input['date'] ?? date('Y-m-d'),
            'start_time' => $input['start_time'] ?? '10:00',
            'end_time' => $input['end_time'] ?? '11:00',
            'track' => $input['track'] ?? 'Full-Stack Web Development',
            'batch_code' => $input['batch'] ?? 'FSW-2026-A',
            'instructor' => $input['instructor'] ?? 'Lead Instructor',
            'room' => $input['location'] ?? 'Lab 304',
            'description' => $input['description'] ?? '',
            'attendance_required' => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ];

        $eventModel = new CalendarEventModel();
        $id = $eventModel->insert($eventData);

        $newEvent = [
            'id' => (int) $id,
            'title' => $eventData['title'],
            'type' => $eventData['event_type'],
            'track' => $eventData['track'],
            'batch' => $eventData['batch_code'],
            'instructor' => $eventData['instructor'],
            'date' => $eventData['date'],
            'start_time' => $eventData['start_time'],
            'end_time' => $eventData['end_time'],
            'location' => $eventData['room'],
            'link' => 'https://meet.bixcel.edu/room',
            'status' => 'Scheduled',
            'description' => $eventData['description'],
            'materials' => '',
        ];

        return $this->respondCreated([
            'status' => 'success',
            'message' => 'Event added to student calendar in database successfully.',
            'data' => $newEvent,
        ]);
    }

    /**
     * Update event
     */
    public function update($id = null)
    {
        $input = $this->getRequestData();

        $eventModel = new CalendarEventModel();
        $event = $eventModel->find($id);

        if (!$event) {
            return $this->failNotFound('Event not found.');
        }

        $update = [];
        if (isset($input['title'])) $update['title'] = trim((string) $input['title']);
        if (isset($input['type'])) $update['event_type'] = $input['type'];
        if (isset($input['date'])) $update['date'] = $input['date'];
        if (isset($input['start_time'])) $update['start_time'] = $input['start_time'];
        if (isset($input['end_time'])) $update['end_time'] = $input['end_time'];
        if (isset($input['location'])) $update['room'] = $input['location'];
        if (isset($input['description'])) $update['description'] = $input['description'];
        $update['updated_at'] = date('Y-m-d H:i:s');

        $eventModel->update($id, $update);

        return $this->respond([
            'status' => 'success',
            'message' => 'Event updated successfully in database.',
            'data' => array_merge($event, $update),
        ]);
    }

    /**
     * Delete event
     */
    public function delete($id = null)
    {
        $eventModel = new CalendarEventModel();
        $event = $eventModel->find($id);

        if (!$event) {
            return $this->failNotFound('Event not found.');
        }

        $eventModel->delete($id);

        return $this->respondDeleted([
            'status' => 'success',
            'message' => 'Event removed from calendar database.',
        ]);
    }
}
