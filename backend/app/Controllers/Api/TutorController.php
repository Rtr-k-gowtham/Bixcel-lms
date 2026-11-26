<?php

namespace App\Controllers\Api;

use CodeIgniter\RESTful\ResourceController;

class TutorController extends ResourceController
{
    protected $format = 'json';

    private static array $tutors = [
        [
            'id' => 1,
            'staff_id' => 'TUT-101',
            'name' => 'Sofia Alvarez',
            'role' => 'Lead Product Designer',
            'expertise' => 'UI/UX Design, Figma, Design Systems',
            'courses' => 'UI/UX Product Design, Design Systems',
            'availability' => 'Available',
            'hours' => 12,
            'max_hours' => 24,
            'rating' => 4.9,
            'email' => 'sofia.alvarez@bixcel.edu',
            'phone' => '+1 (555) 234-8901',
            'assigned_batches' => ['BIX-UX-26D', 'BIX-UX-26A'],
        ],
        [
            'id' => 2,
            'staff_id' => 'TUT-104',
            'name' => 'Marcus Vance',
            'role' => 'Senior Brand & Visual Tutor',
            'expertise' => 'Graphic Design, Typography, Branding',
            'courses' => 'Graphic Design Master Course',
            'availability' => 'Partial',
            'hours' => 18,
            'max_hours' => 24,
            'rating' => 4.8,
            'email' => 'marcus.vance@bixcel.edu',
            'phone' => '+1 (555) 345-9012',
            'assigned_batches' => ['BIX-GD-26A', 'BIX-GD-26B'],
        ],
        [
            'id' => 3,
            'staff_id' => 'TUT-109',
            'name' => 'Priya Nair',
            'role' => 'Creative Studio Mentor',
            'expertise' => 'Photoshop, UI Prototyping, Accessibility',
            'courses' => 'Graphic Design, UI/UX Product Design',
            'availability' => 'Available',
            'hours' => 10,
            'max_hours' => 24,
            'rating' => 4.7,
            'email' => 'priya.nair@bixcel.edu',
            'phone' => '+1 (555) 456-0123',
            'assigned_batches' => ['BIX-GD-26A', 'BIX-UX-26D'],
        ],
        [
            'id' => 4,
            'staff_id' => 'TUT-112',
            'name' => 'Dr. Aris Thorne',
            'role' => 'Principal Engineering Tutor',
            'expertise' => 'Full-Stack Web, Data Science, Cloud',
            'courses' => 'Full-Stack Web, Data Science',
            'availability' => 'Full',
            'hours' => 24,
            'max_hours' => 24,
            'rating' => 4.95,
            'email' => 'aris.thorne@bixcel.edu',
            'phone' => '+1 (555) 567-1234',
            'assigned_batches' => ['BIX-FS-26C', 'BIX-DS-26E'],
        ],
        [
            'id' => 5,
            'staff_id' => 'TUT-115',
            'name' => 'Tariq Al-Mansoor',
            'role' => 'Cloud Solutions Architect',
            'expertise' => 'AWS, Terraform, Kubernetes, DevOps',
            'courses' => 'Cloud & DevOps Engineering',
            'availability' => 'Available',
            'hours' => 14,
            'max_hours' => 24,
            'rating' => 4.85,
            'email' => 'tariq.mansoor@bixcel.edu',
            'phone' => '+1 (555) 678-2345',
            'assigned_batches' => ['BIX-CLD-26F'],
        ],
        [
            'id' => 6,
            'staff_id' => 'TUT-118',
            'name' => 'Elena Rostova',
            'role' => 'Cybersecurity & Cryptography Specialist',
            'expertise' => 'Network Defense, SOC Operations, Ethical Hacking',
            'courses' => 'Cybersecurity Operations',
            'availability' => 'Partial',
            'hours' => 16,
            'max_hours' => 24,
            'rating' => 4.9,
            'email' => 'elena.rostova@bixcel.edu',
            'phone' => '+1 (555) 789-3456',
            'assigned_batches' => ['BIX-SEC-09F'],
        ],
    ];

    /**
     * List tutors
     */
    public function index()
    {
        $search = $this->request->getGet('search');
        $avail = $this->request->getGet('availability');

        $filtered = self::$tutors;

        if (!empty($search)) {
            $q = strtolower(trim((string) $search));
            $filtered = array_values(array_filter($filtered, static function ($t) use ($q) {
                return str_contains(strtolower($t['name']), $q)
                    || str_contains(strtolower($t['staff_id']), $q)
                    || str_contains(strtolower($t['expertise']), $q)
                    || str_contains(strtolower($t['courses']), $q);
            }));
        }

        if (!empty($avail) && $avail !== 'all') {
            $filtered = array_values(array_filter($filtered, static function ($t) use ($avail) {
                return $t['availability'] === $avail;
            }));
        }

        $totalHours = array_sum(array_column(self::$tutors, 'hours'));
        $avgRating = count(self::$tutors) > 0 ? round(array_sum(array_column(self::$tutors, 'rating')) / count(self::$tutors), 2) : 5.0;

        return $this->respond([
            'status' => 'success',
            'data' => $filtered,
            'meta' => [
                'total_tutors' => count(self::$tutors),
                'available_count' => count(array_filter(self::$tutors, static fn($t) => $t['availability'] === 'Available')),
                'partial_count' => count(array_filter(self::$tutors, static fn($t) => $t['availability'] === 'Partial')),
                'full_capacity_count' => count(array_filter(self::$tutors, static fn($t) => $t['availability'] === 'Full')),
                'total_weekly_hours' => $totalHours,
                'avg_faculty_rating' => $avgRating,
                'max_workload_cap' => 24,
            ],
        ]);
    }

    /**
     * Show single tutor
     */
    public function show($id = null)
    {
        $tutor = null;
        foreach (self::$tutors as $t) {
            if ($t['id'] == $id || $t['staff_id'] === $id) {
                $tutor = $t;
                break;
            }
        }

        if (!$tutor) {
            return $this->failNotFound('Tutor record not found.');
        }

        return $this->respond([
            'status' => 'success',
            'data' => $tutor,
        ]);
    }

    /**
     * Create / Onboard new tutor
     */
    public function create()
    {
        $input = $this->request->getJSON(true) ?? $this->request->getPost();

        if (empty($input['name'])) {
            return $this->failValidationErrors(['name' => 'Tutor Full Name is required.']);
        }

        $nextNum = 120 + count(self::$tutors);
        $staffId = !empty($input['staff_id']) ? trim((string) $input['staff_id']) : "TUT-{$nextNum}";

        $newTutor = [
            'id' => count(self::$tutors) + 1,
            'staff_id' => $staffId,
            'name' => trim((string) $input['name']),
            'role' => !empty($input['role']) ? trim((string) $input['role']) : 'Subject Matter Instructor',
            'expertise' => !empty($input['expertise']) ? trim((string) $input['expertise']) : 'General Curriculum',
            'courses' => !empty($input['courses']) ? trim((string) $input['courses']) : 'General Academics',
            'availability' => $input['availability'] ?? 'Available',
            'hours' => (int) ($input['hours'] ?? 8),
            'max_hours' => 24,
            'rating' => 5.0,
            'email' => !empty($input['email']) ? trim((string) $input['email']) : strtolower(str_replace(' ', '.', trim((string) $input['name']))) . '@bixcel.edu',
            'phone' => !empty($input['phone']) ? trim((string) $input['phone']) : '+1 (555) 000-0000',
            'assigned_batches' => $input['assigned_batches'] ?? [],
        ];

        array_unshift(self::$tutors, $newTutor);

        return $this->respondCreated([
            'status' => 'success',
            'message' => "Certified tutor {$newTutor['name']} onboarded successfully with ID {$staffId}.",
            'data' => $newTutor,
        ]);
    }

    /**
     * Update tutor
     */
    public function update($id = null)
    {
        $input = $this->request->getJSON(true) ?? $this->request->getRawInput();

        $foundIdx = null;
        foreach (self::$tutors as $idx => $t) {
            if ($t['id'] == $id || $t['staff_id'] === $id) {
                $foundIdx = $idx;
                break;
            }
        }

        if ($foundIdx === null) {
            return $this->failNotFound('Tutor not found.');
        }

        $tutor = &self::$tutors[$foundIdx];
        if (isset($input['name'])) $tutor['name'] = trim((string) $input['name']);
        if (isset($input['role'])) $tutor['role'] = trim((string) $input['role']);
        if (isset($input['expertise'])) $tutor['expertise'] = trim((string) $input['expertise']);
        if (isset($input['courses'])) $tutor['courses'] = trim((string) $input['courses']);
        if (isset($input['availability'])) $tutor['availability'] = $input['availability'];
        if (isset($input['hours'])) $tutor['hours'] = (int) $input['hours'];
        if (isset($input['email'])) $tutor['email'] = trim((string) $input['email']);
        if (isset($input['phone'])) $tutor['phone'] = trim((string) $input['phone']);
        if (isset($input['assigned_batches'])) $tutor['assigned_batches'] = (array) $input['assigned_batches'];

        return $this->respond([
            'status' => 'success',
            'message' => "Tutor {$tutor['name']} updated successfully.",
            'data' => $tutor,
        ]);
    }

    /**
     * Assign tutor to batch
     */
    public function assign()
    {
        $input = $this->request->getJSON(true) ?? $this->request->getPost();
        $batchCode = $input['batch_code'] ?? 'BIX-UX-26D';
        $primaryId = $input['primary_id'] ?? null;
        $additionalIds = (array) ($input['additional_ids'] ?? []);

        return $this->respond([
            'status' => 'success',
            'message' => "Tutor allocation for batch {$batchCode} updated successfully.",
            'data' => [
                'batch_code' => $batchCode,
                'primary_tutor_id' => $primaryId,
                'additional_tutor_ids' => $additionalIds,
            ],
        ]);
    }

    /**
     * Delete tutor
     */
    public function delete($id = null)
    {
        $found = false;
        foreach (self::$tutors as $idx => $t) {
            if ($t['id'] == $id || $t['staff_id'] === $id) {
                array_splice(self::$tutors, $idx, 1);
                $found = true;
                break;
            }
        }

        if (!$found) {
            return $this->failNotFound('Tutor not found.');
        }

        return $this->respondDeleted([
            'status' => 'success',
            'message' => 'Tutor record archived successfully.',
        ]);
    }
}
