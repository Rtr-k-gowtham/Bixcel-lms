<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class ProgressController extends ResourceController
{
    protected $format = 'json';

    private static array $progressReports = [
        [
            'id' => 1,
            'student_id' => 'STU-2026-0842',
            'full_name' => 'Marcus Vance',
            'email' => 'marcus.vance@student.bixcel.edu',
            'phone' => '+1 (555) 349-2194',
            'guardian_name' => 'Eleanor Vance (Mother)',
            'track' => 'Digital Marketing',
            'batch' => 'BIX-MKT-26B',
            'admission_date' => '2026-10-15',
            'term' => 'Fall Term 2026',
            'gpa' => 3.82,
            'letter_grade' => 'A',
            'standing' => 'Honors Distinction',
            'overall_completion_pct' => 83,
            'instructional_days_done' => 25,
            'instructional_days_total' => 30,
            'attendance_pct' => 96.0,
            'attendance_days_present' => 24,
            'attendance_days_total' => 25,
            'assignments_submitted' => 5,
            'assignments_total' => 5,
            'assignments_avg' => 91.4,
            'quizzes_avg' => 89.0,
            'milestones_cleared' => 2,
            'milestones_total' => 2,
            'modules_progress' => [
                [
                    'code' => 'MOD-DM-01',
                    'title' => 'SEO & Keyword Strategy',
                    'days' => 8,
                    'days_done' => 8,
                    'status' => 'Completed',
                    'pct' => 100,
                    'score' => 94,
                    'grade' => 'A+',
                    'practical_tasks' => '6/6 Passed',
                ],
                [
                    'code' => 'MOD-DM-02',
                    'title' => 'Meta & Google Ads Conversion Funnels',
                    'days' => 12,
                    'days_done' => 12,
                    'status' => 'Completed',
                    'pct' => 100,
                    'score' => 90,
                    'grade' => 'A',
                    'practical_tasks' => '8/8 Passed',
                ],
                [
                    'code' => 'MOD-DM-03',
                    'title' => 'Content & Social Media Strategy',
                    'days' => 10,
                    'days_done' => 5,
                    'status' => 'In Progress',
                    'pct' => 50,
                    'score' => 88,
                    'grade' => 'A-',
                    'practical_tasks' => '3/6 In Progress',
                ],
            ],
            'assessments' => [
                [
                    'name' => 'Comprehensive SEO Technical Audit Case',
                    'type' => 'Assignment',
                    'date' => '2026-10-28',
                    'max_marks' => 100,
                    'marks_obtained' => 95,
                    'grade' => 'A+',
                    'feedback' => 'Exceptional schema markup analysis and Semrush audit recommendations.',
                ],
                [
                    'name' => 'Keyword Intent & Clustering Assessment',
                    'type' => 'Quiz',
                    'date' => '2026-11-04',
                    'max_marks' => 50,
                    'marks_obtained' => 46,
                    'grade' => 'A',
                    'feedback' => 'Solid understanding of commercial vs informational search patterns.',
                ],
                [
                    'name' => 'Google Search Ads Live Campaign Setup',
                    'type' => 'Practical Lab',
                    'date' => '2026-11-12',
                    'max_marks' => 100,
                    'marks_obtained' => 92,
                    'grade' => 'A',
                    'feedback' => 'Configured target CPA bidding with tight negative keyword lists.',
                ],
                [
                    'name' => 'Meta Retargeting Custom Audiences Project',
                    'type' => 'Project',
                    'date' => '2026-11-19',
                    'max_marks' => 100,
                    'marks_obtained' => 88,
                    'grade' => 'A-',
                    'feedback' => 'Great pixel event mapping; consider refining lookalike ratios.',
                ],
                [
                    'name' => 'Mid-Term Digital Attribution Examination',
                    'type' => 'Examination',
                    'date' => '2026-11-23',
                    'max_marks' => 100,
                    'marks_obtained' => 91,
                    'grade' => 'A',
                    'feedback' => 'Thorough analysis of first-click vs linear attribution models.',
                ],
            ],
            'milestones' => [
                [
                    'title' => 'Milestone 1: Organic Growth & Search Dominance',
                    'status' => 'Verified Cleared',
                    'date' => '2026-11-02',
                    'mentor' => 'Eleanor Vance',
                    'notes' => 'Achieved top 3 SERP simulation ranking and resolved 15 technical crawler errors.',
                ],
                [
                    'title' => 'Milestone 2: Paid Acquisition & ROAS Profitability',
                    'status' => 'Verified Cleared',
                    'date' => '2026-11-20',
                    'mentor' => 'Sarah Jenkins',
                    'notes' => 'Demonstrated 3.8x ROAS model in mock conversion pipeline with zero budget leakage.',
                ],
            ],
            'attendance_monthly' => [
                ['month' => 'October 2026', 'total' => 11, 'present' => 11, 'late' => 0, 'absent' => 0, 'pct' => 100.0],
                ['month' => 'November 2026', 'total' => 14, 'present' => 13, 'late' => 1, 'absent' => 0, 'pct' => 92.8],
            ],
            'advisor_remarks' => [
                [
                    'advisor' => 'Dr. Aris Thorne (Academic Dean)',
                    'date' => '2026-11-24',
                    'note' => 'Marcus demonstrates exemplary aptitude for data-driven performance marketing. Consistently delivers rigorous analytics in group case studies.',
                    'recommendation' => 'Recommended for Advanced Programmatic Bidding certification.',
                ],
            ],
        ],
        [
            'id' => 2,
            'student_id' => 'STU-2026-0841',
            'full_name' => 'Alena Rostova',
            'email' => 'alena.rostova@student.bixcel.edu',
            'phone' => '+1 (555) 781-4402',
            'guardian_name' => 'Mikhail Rostov (Father)',
            'track' => 'UI/UX Product Design',
            'batch' => 'BIX-UX-26D',
            'admission_date' => '2026-09-20',
            'term' => 'Fall Term 2026',
            'gpa' => 3.94,
            'letter_grade' => 'A+',
            'standing' => 'Top 1% Cohort Ranking',
            'overall_completion_pct' => 75,
            'instructional_days_done' => 45,
            'instructional_days_total' => 60,
            'attendance_pct' => 97.8,
            'attendance_days_present' => 44,
            'attendance_days_total' => 45,
            'assignments_submitted' => 8,
            'assignments_total' => 8,
            'assignments_avg' => 96.2,
            'quizzes_avg' => 94.0,
            'milestones_cleared' => 3,
            'milestones_total' => 4,
            'modules_progress' => [
                [
                    'code' => 'MOD-UX-01',
                    'title' => 'User Research, Personas & Journey Mapping',
                    'days' => 12,
                    'days_done' => 12,
                    'status' => 'Completed',
                    'pct' => 100,
                    'score' => 98,
                    'grade' => 'A+',
                    'practical_tasks' => '8/8 Passed',
                ],
                [
                    'code' => 'MOD-UX-02',
                    'title' => 'Wireframing & Prototyping in Figma',
                    'days' => 15,
                    'days_done' => 15,
                    'status' => 'Completed',
                    'pct' => 100,
                    'score' => 97,
                    'grade' => 'A+',
                    'practical_tasks' => '10/10 Passed',
                ],
                [
                    'code' => 'MOD-UX-03',
                    'title' => 'Design Systems & Component Tokens',
                    'days' => 18,
                    'days_done' => 18,
                    'status' => 'Completed',
                    'pct' => 100,
                    'score' => 95,
                    'grade' => 'A+',
                    'practical_tasks' => '12/12 Passed',
                ],
                [
                    'code' => 'MOD-UX-04',
                    'title' => 'Usability Testing & Micro-interactions',
                    'days' => 15,
                    'days_done' => 0,
                    'status' => 'Upcoming',
                    'pct' => 0,
                    'score' => 0,
                    'grade' => 'Pending',
                    'practical_tasks' => '0/8 Pending',
                ],
            ],
            'assessments' => [
                [
                    'name' => 'Generative User Research Synthesis & Persona Deck',
                    'type' => 'Project',
                    'date' => '2026-10-05',
                    'max_marks' => 100,
                    'marks_obtained' => 99,
                    'grade' => 'A+',
                    'feedback' => 'Masterful empathy mapping and qualitative interview coding.',
                ],
                [
                    'name' => 'Figma Interactive Mobile Banking Prototype',
                    'type' => 'Practical Lab',
                    'date' => '2026-10-22',
                    'max_marks' => 100,
                    'marks_obtained' => 97,
                    'grade' => 'A+',
                    'feedback' => 'Flawless auto-layout components and micro-interaction states.',
                ],
                [
                    'name' => 'Atomic Design System & WCAG AAA Audit',
                    'type' => 'Project',
                    'date' => '2026-11-15',
                    'max_marks' => 100,
                    'marks_obtained' => 96,
                    'grade' => 'A+',
                    'feedback' => 'Enterprise token architecture ready for production front-end handoff.',
                ],
                [
                    'name' => 'Mid-Term Design Theory & Heuristic Assessment',
                    'type' => 'Examination',
                    'date' => '2026-11-18',
                    'max_marks' => 100,
                    'marks_obtained' => 94,
                    'grade' => 'A',
                    'feedback' => 'Comprehensive critique of Nielsen Norman heuristics.',
                ],
            ],
            'milestones' => [
                [
                    'title' => 'Milestone 1: Empathy & Research Discovery',
                    'status' => 'Verified Cleared',
                    'date' => '2026-10-08',
                    'mentor' => 'Elena Rostova',
                    'notes' => 'Conducted 12 user interviews and established validated problem statements.',
                ],
                [
                    'title' => 'Milestone 2: Wireframe Architecture & Usability Baseline',
                    'status' => 'Verified Cleared',
                    'date' => '2026-10-25',
                    'mentor' => 'Elena Rostova',
                    'notes' => 'Built high-fidelity 48-screen interactive user flow with zero dead ends.',
                ],
                [
                    'title' => 'Milestone 3: Scalable Design System Token Library',
                    'status' => 'Verified Cleared',
                    'date' => '2026-11-16',
                    'mentor' => 'David Chen',
                    'notes' => 'Published 140+ component tokens with full dark/light theme aliases.',
                ],
            ],
            'attendance_monthly' => [
                ['month' => 'September 2026', 'total' => 9, 'present' => 9, 'late' => 0, 'absent' => 0, 'pct' => 100.0],
                ['month' => 'October 2026', 'total' => 22, 'present' => 22, 'late' => 0, 'absent' => 0, 'pct' => 100.0],
                ['month' => 'November 2026', 'total' => 14, 'present' => 13, 'late' => 1, 'absent' => 0, 'pct' => 92.8],
            ],
            'advisor_remarks' => [
                [
                    'advisor' => 'Elena Rostova (Lead Design Director)',
                    'date' => '2026-11-20',
                    'note' => 'Alena is performing at an exceptional senior product designer caliber. Outstanding attention to typographic scales and user ergonomics.',
                    'recommendation' => 'Recommended for institutional design team leadership and industry portfolio spotlight.',
                ],
            ],
        ],
        [
            'id' => 3,
            'student_id' => 'STU-2026-0840',
            'full_name' => 'Kevin Chen',
            'email' => 'kevin.chen@student.bixcel.edu',
            'phone' => '+1 (555) 912-3341',
            'guardian_name' => 'David Chen (Father)',
            'track' => 'Full-Stack Web Development',
            'batch' => 'BIX-DEV-24A',
            'admission_date' => '2026-10-01',
            'term' => 'Fall Term 2026',
            'gpa' => 3.78,
            'letter_grade' => 'A',
            'standing' => 'Distinction',
            'overall_completion_pct' => 71,
            'instructional_days_done' => 27,
            'instructional_days_total' => 38,
            'attendance_pct' => 94.4,
            'attendance_days_present' => 25,
            'attendance_days_total' => 27,
            'assignments_submitted' => 6,
            'assignments_total' => 7,
            'assignments_avg' => 89.8,
            'quizzes_avg' => 91.0,
            'milestones_cleared' => 2,
            'milestones_total' => 3,
            'modules_progress' => [
                [
                    'code' => 'MOD-FS-01',
                    'title' => 'Frontend Foundations & Semantic HTML/CSS',
                    'days' => 10,
                    'days_done' => 10,
                    'status' => 'Completed',
                    'pct' => 100,
                    'score' => 94,
                    'grade' => 'A',
                    'practical_tasks' => '8/8 Passed',
                ],
                [
                    'code' => 'MOD-FS-02',
                    'title' => 'Modern JavaScript ES6+ & TypeScript',
                    'days' => 14,
                    'days_done' => 14,
                    'status' => 'Completed',
                    'pct' => 100,
                    'score' => 91,
                    'grade' => 'A',
                    'practical_tasks' => '12/12 Passed',
                ],
                [
                    'code' => 'MOD-FS-03',
                    'title' => 'React & Next.js Architecture',
                    'days' => 14,
                    'days_done' => 3,
                    'status' => 'In Progress',
                    'pct' => 21,
                    'score' => 85,
                    'grade' => 'B+',
                    'practical_tasks' => '2/10 In Progress',
                ],
            ],
            'assessments' => [
                [
                    'name' => 'Responsive Enterprise Landing Page Build',
                    'type' => 'Assignment',
                    'date' => '2026-10-14',
                    'max_marks' => 100,
                    'marks_obtained' => 96,
                    'grade' => 'A+',
                    'feedback' => 'Pixel-perfect mobile breakpoint handling and semantic tags.',
                ],
                [
                    'name' => 'TypeScript Strict Interfaces & Generic Utilities',
                    'type' => 'Practical Lab',
                    'date' => '2026-10-28',
                    'max_marks' => 100,
                    'marks_obtained' => 91,
                    'grade' => 'A',
                    'feedback' => 'Good generic type constraints; minor inference warning in state handler.',
                ],
                [
                    'name' => 'Asynchronous Event Loop & Promise Concurrency Quiz',
                    'type' => 'Quiz',
                    'date' => '2026-11-08',
                    'max_marks' => 50,
                    'marks_obtained' => 46,
                    'grade' => 'A',
                    'feedback' => 'Demonstrated clear mental model of microtasks vs macrotasks.',
                ],
                [
                    'name' => 'RESTful Express Backend with JWT Auth',
                    'type' => 'Project',
                    'date' => '2026-11-20',
                    'max_marks' => 100,
                    'marks_obtained' => 87,
                    'grade' => 'B+',
                    'feedback' => 'Solid token refresh strategy; optimize bcrypt round workload.',
                ],
            ],
            'milestones' => [
                [
                    'title' => 'Milestone 1: Web Fundamentals & Semantic Standards',
                    'status' => 'Verified Cleared',
                    'date' => '2026-10-18',
                    'mentor' => 'David Chen',
                    'notes' => 'Passed automated Lighthouse accessibility and performance audits (>95 score).',
                ],
                [
                    'title' => 'Milestone 2: Strong Typing & Data Structures Verification',
                    'status' => 'Verified Cleared',
                    'date' => '2026-11-10',
                    'mentor' => 'Dr. Aris Thorne',
                    'notes' => 'Implemented custom Redux-like state store in strict TypeScript with zero any casts.',
                ],
            ],
            'attendance_monthly' => [
                ['month' => 'October 2026', 'total' => 16, 'present' => 15, 'late' => 1, 'absent' => 0, 'pct' => 93.7],
                ['month' => 'November 2026', 'total' => 11, 'present' => 10, 'late' => 0, 'absent' => 1, 'pct' => 90.9],
            ],
            'advisor_remarks' => [
                [
                    'advisor' => 'Dr. Aris Thorne (Lead Engineering Tutor)',
                    'date' => '2026-11-21',
                    'note' => 'Kevin is making steady, dependable progress in full-stack engineering. Strong algorithmic comprehension.',
                    'recommendation' => 'Focus on Next.js 15 App Router caching mechanisms in current module.',
                ],
            ],
        ],
    ];

    /**
     * Get all student progress cards
     */
    public function index()
    {
        $search = $this->request->getGet('search');
        $track = $this->request->getGet('track');
        $batch = $this->request->getGet('batch');

        $filtered = self::$progressReports;

        if (!empty($search)) {
            $q = strtolower(trim((string) $search));
            $filtered = array_values(array_filter($filtered, static fn($r) =>
                str_contains(strtolower($r['full_name']), $q) ||
                str_contains(strtolower($r['student_id']), $q) ||
                str_contains(strtolower($r['batch']), $q)
            ));
        }

        if (!empty($track) && $track !== 'All') {
            $filtered = array_values(array_filter($filtered, static fn($r) => $r['track'] === $track));
        }

        if (!empty($batch) && $batch !== 'All') {
            $filtered = array_values(array_filter($filtered, static fn($r) => $r['batch'] === $batch));
        }

        return $this->respond([
            'status' => 'success',
            'data' => $filtered,
            'meta' => [
                'total_students' => count($filtered),
                'avg_gpa' => 3.85,
                'avg_attendance' => '96.1%',
                'active_term' => 'Fall Term 2026',
            ],
        ]);
    }

    /**
     * Get single student detailed progress report
     */
    public function show($id = null)
    {
        foreach (self::$progressReports as $r) {
            if ($r['id'] == $id || $r['student_id'] === $id) {
                return $this->respond(['status' => 'success', 'data' => $r]);
            }
        }

        return $this->failNotFound('Student progress report not found.');
    }

    /**
     * Add advisor / tutor remark
     */
    public function remark()
    {
        $input = $this->request->getJSON(true) ?? $this->request->getPost();

        if (empty($input['student_id']) || empty($input['note'])) {
            return $this->failValidationErrors(['note' => 'Student ID and remark note are required.']);
        }

        $studentId = $input['student_id'];
        $found = false;

        foreach (self::$progressReports as &$r) {
            if ($r['student_id'] === $studentId || $r['id'] == $studentId) {
                $r['advisor_remarks'][] = [
                    'advisor' => $input['advisor'] ?? 'Academic Advisor',
                    'date' => date('Y-m-d'),
                    'note' => trim((string) $input['note']),
                    'recommendation' => trim((string) ($input['recommendation'] ?? 'Continue active coursework.')),
                ];
                $found = true;
                break;
            }
        }

        if (!$found) {
            return $this->failNotFound('Student record not found.');
        }

        return $this->respondCreated([
            'status' => 'success',
            'message' => 'Advisor remark recorded successfully in student progress report.',
        ]);
    }
}
