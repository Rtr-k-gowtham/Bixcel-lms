<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class CalendarController extends ResourceController
{
    protected $format = 'json';

    private static array $events = [
        [
            'id' => 1,
            'title' => 'React & Next.js Architecture: Server Components',
            'type' => 'lecture', // lecture | lab | assignment | exam | milestone | holiday
            'track' => 'Full-Stack Web Development',
            'batch' => 'BIX-DEV-24A',
            'instructor' => 'Dr. Aris Thorne',
            'date' => '2026-11-26',
            'start_time' => '09:30',
            'end_time' => '11:30',
            'location' => 'Room 302 / Virtual Lab',
            'link' => 'https://meet.bixcel.edu/dev-24a',
            'status' => 'Live Now',
            'description' => 'Hands-on exploration of React 19 server actions, streaming SSR, and edge runtime optimization.',
            'materials' => 'NextJS-15-Architecture-Deck.pdf',
        ],
        [
            'id' => 2,
            'title' => 'Hands-On Lab: TypeScript Generic Interfaces',
            'type' => 'lab',
            'track' => 'Full-Stack Web Development',
            'batch' => 'BIX-DEV-24A',
            'instructor' => 'Sarah Jenkins',
            'date' => '2026-11-26',
            'start_time' => '14:00',
            'end_time' => '16:30',
            'location' => 'Engineering Lab B',
            'link' => 'https://meet.bixcel.edu/lab-b',
            'status' => 'Upcoming',
            'description' => 'Practical code challenges applying advanced generic constraints and strict type inference.',
            'materials' => 'Lab-TypeScript-Starter.zip',
        ],
        [
            'id' => 3,
            'title' => 'Assignment 3: E-Commerce REST API Handoff',
            'type' => 'assignment',
            'track' => 'Full-Stack Web Development',
            'batch' => 'BIX-DEV-24A',
            'instructor' => 'David Chen',
            'date' => '2026-11-27',
            'start_time' => '23:59',
            'end_time' => '23:59',
            'location' => 'Bixcel Portal Submission',
            'link' => '#',
            'status' => 'Pending Submission',
            'description' => 'Submit Postman collection, database schema migration, and GitHub repo with passing test suites.',
            'materials' => 'Project3-Rubric.pdf',
        ],
        [
            'id' => 4,
            'title' => 'SEO & Google Ads Conversion Funnel Masterclass',
            'type' => 'lecture',
            'track' => 'Digital Marketing',
            'batch' => 'BIX-MKT-26B',
            'instructor' => 'Eleanor Vance',
            'date' => '2026-11-26',
            'start_time' => '11:00',
            'end_time' => '13:00',
            'location' => 'Auditorium 1 / Zoom',
            'link' => 'https://meet.bixcel.edu/mkt-26b',
            'status' => 'Upcoming',
            'description' => 'Target CPA bidding models, landing page optimization, and multi-touch attribution analysis.',
            'materials' => 'Ad-Funnels-CaseStudy.pdf',
        ],
        [
            'id' => 5,
            'title' => 'Design Systems & Component Tokens Workshop',
            'type' => 'lecture',
            'track' => 'UI/UX Product Design',
            'batch' => 'BIX-UX-26D',
            'instructor' => 'Elena Rostova',
            'date' => '2026-11-28',
            'start_time' => '10:00',
            'end_time' => '12:30',
            'location' => 'Design Studio 4',
            'link' => 'https://meet.bixcel.edu/ux-26d',
            'status' => 'Scheduled',
            'description' => 'Structuring design tokens in Figma with variables, dark mode aliases, and WCAG AAA compliance.',
            'materials' => 'Figma-Tokens-Template.fig',
        ],
        [
            'id' => 6,
            'title' => 'Statistical Modeling & Hypothesis Testing Quiz',
            'type' => 'exam',
            'track' => 'Data Science & Analytics',
            'batch' => 'BIX-DS-18C',
            'instructor' => 'Dr. Viktor Vance',
            'date' => '2026-11-29',
            'start_time' => '15:00',
            'end_time' => '16:30',
            'location' => 'Exam Hall 2 / Safe Browser',
            'link' => '#',
            'status' => 'Mandatory Assessment',
            'description' => 'Proctored online quiz covering p-values, ANOVA, linear regressions, and statistical inferences.',
            'materials' => 'Quiz-Guidelines.pdf',
        ],
        [
            'id' => 7,
            'title' => 'Milestone 2 Defense: Production Cloud Architecture',
            'type' => 'milestone',
            'track' => 'Cloud & DevOps Engineering',
            'batch' => 'BIX-CLD-12A',
            'instructor' => 'Tariq Al-Mansoor',
            'date' => '2026-11-30',
            'start_time' => '14:00',
            'end_time' => '16:00',
            'location' => 'Boardroom B & Review Panel',
            'link' => 'https://meet.bixcel.edu/cloud-defense',
            'status' => 'Scheduled Defense',
            'description' => 'Live demonstration of high-availability Kubernetes cluster, Terraform state, and Grafana telemetry.',
            'materials' => 'Milestone2-Checklist.pdf',
        ],
        [
            'id' => 8,
            'title' => 'Network Defense & Protocol Hardening Lab',
            'type' => 'lab',
            'track' => 'Cybersecurity Operations',
            'batch' => 'BIX-SEC-09F',
            'instructor' => 'Priya Sharma',
            'date' => '2026-11-25',
            'start_time' => '10:00',
            'end_time' => '12:30',
            'location' => 'Cyber Range 1',
            'link' => 'https://meet.bixcel.edu/sec-range',
            'status' => 'Completed',
            'description' => 'Configured pfSense firewall rules, snort IDS signatures, and encrypted site-to-site VPN tunnels.',
            'materials' => 'CyberRange-LabNotes.pdf',
        ],
        [
            'id' => 9,
            'title' => 'Institutional Tech Symposium & Project Expo',
            'type' => 'holiday',
            'track' => 'All Tracks',
            'batch' => 'All Cohorts',
            'instructor' => 'Academic Council',
            'date' => '2026-12-04',
            'start_time' => '09:00',
            'end_time' => '18:00',
            'location' => 'Main Convention Center',
            'link' => 'https://bixcel.edu/expo2026',
            'status' => 'Campus Event',
            'description' => 'Annual student capstone showcase, guest keynotes from tech industry leaders, and recruitment booths.',
            'materials' => 'Expo-Catalog-2026.pdf',
        ],
        [
            'id' => 10,
            'title' => 'Docker & Microservices Architecture Deep Dive',
            'type' => 'lecture',
            'track' => 'Full-Stack Web Development',
            'batch' => 'BIX-DEV-24A',
            'instructor' => 'Dr. Aris Thorne',
            'date' => '2026-12-02',
            'start_time' => '10:00',
            'end_time' => '12:00',
            'location' => 'Room 302',
            'link' => 'https://meet.bixcel.edu/dev-24a',
            'status' => 'Scheduled',
            'description' => 'Multi-stage Dockerfiles, docker-compose orchestration, and environment variables security.',
            'materials' => 'Microservices-Guide.pdf',
        ],
        [
            'id' => 11,
            'title' => 'Figma Interactive Auto-Layouts & Variants',
            'type' => 'lab',
            'track' => 'UI/UX Product Design',
            'batch' => 'BIX-UX-26D',
            'instructor' => 'Elena Rostova',
            'date' => '2026-12-03',
            'start_time' => '14:00',
            'end_time' => '16:00',
            'location' => 'Studio 4',
            'link' => 'https://meet.bixcel.edu/ux-26d',
            'status' => 'Scheduled',
            'description' => 'Building responsive mobile/desktop wireframes with interactive component property sets.',
            'materials' => 'AutoLayout-Exercise.fig',
        ],
        [
            'id' => 12,
            'title' => 'Final Capstone Project Draft Review',
            'type' => 'assignment',
            'track' => 'Full-Stack Web Development',
            'batch' => 'BIX-DEV-24A',
            'instructor' => 'Dr. Aris Thorne',
            'date' => '2026-12-08',
            'start_time' => '18:00',
            'end_time' => '18:00',
            'location' => 'Bixcel Portal',
            'link' => '#',
            'status' => 'Upcoming Deadline',
            'description' => 'Submit full architecture blueprint and database schema for final enterprise graduation project.',
            'materials' => 'Capstone-Spec-V2.pdf',
        ],
    ];

    /**
     * Get all calendar events with optional filters
     */
    public function index()
    {
        $batch = $this->request->getGet('batch');
        $type = $this->request->getGet('type');
        $month = $this->request->getGet('month'); // YYYY-MM
        $track = $this->request->getGet('track');

        $filtered = self::$events;

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
                'live_now' => count(array_filter($filtered, static fn($e) => $e['status'] === 'Live Now')),
                'today_date' => '2026-11-26',
            ],
        ]);
    }

    /**
     * Get today's agenda & summary
     */
    public function today()
    {
        $todayDate = '2026-11-26';
        $todayEvents = array_values(array_filter(self::$events, static fn($e) => $e['date'] === $todayDate));

        return $this->respond([
            'status' => 'success',
            'data' => [
                'date' => $todayDate,
                'events' => $todayEvents,
                'active_batch' => 'BIX-DEV-24A',
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
        foreach (self::$events as $e) {
            if ($e['id'] == $id) {
                return $this->respond(['status' => 'success', 'data' => $e]);
            }
        }

        return $this->failNotFound('Calendar event not found.');
    }

    /**
     * Create event / study reminder
     */
    public function create()
    {
        $input = $this->request->getJSON(true) ?? $this->request->getPost();

        if (empty($input['title'])) {
            return $this->failValidationErrors(['title' => 'Event title is required.']);
        }

        $newEvent = [
            'id' => count(self::$events) + 1,
            'title' => trim((string) $input['title']),
            'type' => $input['type'] ?? 'lecture',
            'track' => $input['track'] ?? 'General',
            'batch' => $input['batch'] ?? 'My Schedule',
            'instructor' => $input['instructor'] ?? 'Self / Instructor',
            'date' => $input['date'] ?? date('Y-m-d'),
            'start_time' => $input['start_time'] ?? '10:00',
            'end_time' => $input['end_time'] ?? '11:00',
            'location' => $input['location'] ?? 'Online / Campus',
            'link' => $input['link'] ?? '#',
            'status' => $input['status'] ?? 'Scheduled',
            'description' => $input['description'] ?? '',
            'materials' => $input['materials'] ?? '',
        ];

        array_unshift(self::$events, $newEvent);

        return $this->respondCreated([
            'status' => 'success',
            'message' => 'Event added to student calendar successfully.',
            'data' => $newEvent,
        ]);
    }

    /**
     * Update event
     */
    public function update($id = null)
    {
        $input = $this->request->getJSON(true) ?? $this->request->getRawInput();

        $eventIdx = null;
        foreach (self::$events as $idx => $e) {
            if ($e['id'] == $id) {
                $eventIdx = $idx;
                break;
            }
        }

        if ($eventIdx === null) {
            return $this->failNotFound('Event not found.');
        }

        $updated = array_merge(self::$events[$eventIdx], array_filter((array) $input, static fn($v) => $v !== null));
        self::$events[$eventIdx] = $updated;

        return $this->respond([
            'status' => 'success',
            'message' => 'Event updated successfully.',
            'data' => $updated,
        ]);
    }

    /**
     * Delete event
     */
    public function delete($id = null)
    {
        $found = false;
        foreach (self::$events as $idx => $e) {
            if ($e['id'] == $id) {
                array_splice(self::$events, $idx, 1);
                $found = true;
                break;
            }
        }

        if (!$found) {
            return $this->failNotFound('Event not found.');
        }

        return $this->respondDeleted([
            'status' => 'success',
            'message' => 'Event removed from calendar.',
        ]);
    }
}
