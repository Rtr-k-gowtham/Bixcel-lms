<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $db = \Config\Database::connect();

        // 1. Seed Batches
        $db->table('batches')->emptyTable();
        $batches = [
            [
                'batch_code' => 'FSW-2026-A',
                'track' => 'Full-Stack Web Development',
                'tutor_id' => 'TUT-101',
                'tutor_name' => 'Dr. Elena Rostova',
                'start_date' => '2026-01-15',
                'end_date' => '2026-06-30',
                'timing' => '09:00 AM - 01:00 PM',
                'classroom' => 'Lab 304 - Turing Hall',
                'capacity' => 30,
                'enrolled_count' => 24,
                'status' => 'Active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'batch_code' => 'DMM-2026-B',
                'track' => 'Digital Marketing',
                'tutor_id' => 'TUT-102',
                'tutor_name' => 'Marcus Thorne',
                'start_date' => '2026-02-01',
                'end_date' => '2026-05-15',
                'timing' => '02:00 PM - 05:00 PM',
                'classroom' => 'Seminar Room 102',
                'capacity' => 25,
                'enrolled_count' => 19,
                'status' => 'Active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'batch_code' => 'UXD-2026-A',
                'track' => 'UI/UX Product Design',
                'tutor_id' => 'TUT-103',
                'tutor_name' => 'Aisha Patel',
                'start_date' => '2026-02-15',
                'end_date' => '2026-06-01',
                'timing' => '10:00 AM - 01:00 PM',
                'classroom' => 'Design Studio B',
                'capacity' => 20,
                'enrolled_count' => 18,
                'status' => 'Active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'batch_code' => 'DSA-2026-C',
                'track' => 'Data Science & Analytics',
                'tutor_id' => 'TUT-104',
                'tutor_name' => 'Devonte Wright',
                'start_date' => '2026-03-01',
                'end_date' => '2026-07-31',
                'timing' => '02:00 PM - 06:00 PM',
                'classroom' => 'Compute Cluster 108',
                'capacity' => 25,
                'enrolled_count' => 22,
                'status' => 'Active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ];
        $db->table('batches')->insertBatch($batches);

        // 2. Seed Tutors
        $db->table('tutors')->emptyTable();
        $tutors = [
            [
                'tutor_id' => 'TUT-101',
                'full_name' => 'Dr. Elena Rostova',
                'email' => 'elena.rostova@bixcel.edu',
                'phone' => '+1 (555) 234-5678',
                'specialization' => 'Distributed Systems & Cloud Architecture',
                'assigned_track' => 'Full-Stack Web Development',
                'status' => 'Active',
                'rating' => 4.95,
                'total_hours' => 320,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'tutor_id' => 'TUT-102',
                'full_name' => 'Marcus Thorne',
                'email' => 'marcus.thorne@bixcel.edu',
                'phone' => '+1 (555) 345-6789',
                'specialization' => 'Performance Marketing & MarTech Automation',
                'assigned_track' => 'Digital Marketing',
                'status' => 'Active',
                'rating' => 4.88,
                'total_hours' => 280,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'tutor_id' => 'TUT-103',
                'full_name' => 'Aisha Patel',
                'email' => 'aisha.patel@bixcel.edu',
                'phone' => '+1 (555) 456-7890',
                'specialization' => 'Design Systems & Component Architecture',
                'assigned_track' => 'UI/UX Product Design',
                'status' => 'Active',
                'rating' => 4.92,
                'total_hours' => 240,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'tutor_id' => 'TUT-104',
                'full_name' => 'Devonte Wright',
                'email' => 'devonte.wright@bixcel.edu',
                'phone' => '+1 (555) 567-8901',
                'specialization' => 'Predictive Modeling & Statistical Computing',
                'assigned_track' => 'Data Science & Analytics',
                'status' => 'Active',
                'rating' => 4.85,
                'total_hours' => 310,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ];
        $db->table('tutors')->insertBatch($tutors);

        // 3. Seed Students
        $db->table('students')->emptyTable();
        $students = [
            [
                'student_id' => 'STU-2026-0842',
                'full_name' => 'Marcus Vance',
                'email' => 'marcus.vance@student.bixcel.edu',
                'phone' => '+1 (555) 349-2194',
                'dob' => '2004-03-12',
                'gender' => 'Male',
                'blood_group' => 'O+',
                'address' => '742 Evergreen Terrace, Springfield, OR',
                'guardian_name' => 'Eleanor Vance',
                'guardian_relation' => 'Mother',
                'guardian_phone' => '+1 (555) 349-2190',
                'guardian_email' => 'eleanor.vance@gmail.com',
                'status' => 'Active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'student_id' => 'STU-2026-0843',
                'full_name' => 'Alena Rostova',
                'email' => 'alena.rostova@student.bixcel.edu',
                'phone' => '+1 (555) 672-8812',
                'dob' => '2003-08-25',
                'gender' => 'Female',
                'blood_group' => 'A+',
                'address' => '1088 Highland Ave, Austin, TX',
                'guardian_name' => 'Dmitri Rostov',
                'guardian_relation' => 'Father',
                'guardian_phone' => '+1 (555) 672-8800',
                'guardian_email' => 'dmitri.rostov@outlook.com',
                'status' => 'Active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'student_id' => 'STU-2026-0844',
                'full_name' => 'Kevin Chen',
                'email' => 'kevin.chen@student.bixcel.edu',
                'phone' => '+1 (555) 891-3421',
                'dob' => '2004-11-04',
                'gender' => 'Male',
                'blood_group' => 'B+',
                'address' => '350 Mission Blvd, San Jose, CA',
                'guardian_name' => 'Grace Chen',
                'guardian_relation' => 'Mother',
                'guardian_phone' => '+1 (555) 891-3400',
                'guardian_email' => 'grace.chen@yahoo.com',
                'status' => 'Active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'student_id' => 'STU-2026-0845',
                'full_name' => 'Sophia Reyes',
                'email' => 'sophia.reyes@student.bixcel.edu',
                'phone' => '+1 (555) 442-9901',
                'dob' => '2005-01-18',
                'gender' => 'Female',
                'blood_group' => 'AB+',
                'address' => '142 Ocean Drive, Miami, FL',
                'guardian_name' => 'Carlos Reyes',
                'guardian_relation' => 'Father',
                'guardian_phone' => '+1 (555) 442-9900',
                'guardian_email' => 'carlos.reyes@gmail.com',
                'status' => 'Active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ];
        $db->table('students')->insertBatch($students);

        // 4. Seed Enrollments
        $db->table('student_enrollments')->emptyTable();
        $enrollments = [
            [
                'student_code' => 'STU-2026-0842',
                'track' => 'Full-Stack Web Development',
                'category' => 'Engineering',
                'batch_id' => 'FSW-2026-A',
                'start_date' => '2026-01-15',
                'end_date' => '2026-06-30',
                'total_days' => 50,
                'total_modules' => 6,
                'status' => 'Active',
                'tuition_fee' => 4500.00,
                'plan' => 'Standard',
                'payment_method' => 'Bank Transfer',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'student_code' => 'STU-2026-0843',
                'track' => 'Digital Marketing',
                'category' => 'Marketing',
                'batch_id' => 'DMM-2026-B',
                'start_date' => '2026-02-01',
                'end_date' => '2026-05-15',
                'total_days' => 36,
                'total_modules' => 5,
                'status' => 'Active',
                'tuition_fee' => 3200.00,
                'plan' => 'Full',
                'payment_method' => 'Credit Card',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'student_code' => 'STU-2026-0844',
                'track' => 'UI/UX Product Design',
                'category' => 'Design',
                'batch_id' => 'UXD-2026-A',
                'start_date' => '2026-02-15',
                'end_date' => '2026-06-01',
                'total_days' => 36,
                'total_modules' => 5,
                'status' => 'Active',
                'tuition_fee' => 3600.00,
                'plan' => 'Installments',
                'payment_method' => 'UPI / NetBanking',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ];
        $db->table('student_enrollments')->insertBatch($enrollments);

        // 5. Seed Enrolled Modules for Marcus Vance
        $db->table('student_enrolled_modules')->emptyTable();
        $studentModules = [
            [
                'student_code' => 'STU-2026-0842',
                'module_code' => 'MOD-FS-01',
                'title' => 'Frontend Foundations & Semantic HTML/CSS',
                'days' => 10,
                'is_core' => 1,
                'status' => 'Completed',
                'grade' => 'A+',
                'score' => 96,
                'completion_pct' => 100,
                'instructor' => 'Dr. Elena Rostova',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'student_code' => 'STU-2026-0842',
                'module_code' => 'MOD-FS-02',
                'title' => 'Modern JavaScript ES6+ & TypeScript',
                'days' => 14,
                'is_core' => 1,
                'status' => 'Completed',
                'grade' => 'A',
                'score' => 92,
                'completion_pct' => 100,
                'instructor' => 'Dr. Elena Rostova',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'student_code' => 'STU-2026-0842',
                'module_code' => 'MOD-FS-03',
                'title' => 'React & Next.js Architecture',
                'days' => 14,
                'is_core' => 1,
                'status' => 'In Progress',
                'grade' => 'A-',
                'score' => 88,
                'completion_pct' => 74,
                'instructor' => 'Dr. Elena Rostova',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'student_code' => 'STU-2026-0842',
                'module_code' => 'MOD-FS-04',
                'title' => 'Node.js, Express & Microservices',
                'days' => 12,
                'is_core' => 0,
                'status' => 'Scheduled',
                'grade' => '—',
                'score' => 0,
                'completion_pct' => 0,
                'instructor' => 'Devonte Wright',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'student_code' => 'STU-2026-0842',
                'module_code' => 'MOD-FS-05',
                'title' => 'PostgreSQL, ORM & Database Optimization',
                'days' => 8,
                'is_core' => 0,
                'status' => 'Scheduled',
                'grade' => '—',
                'score' => 0,
                'completion_pct' => 0,
                'instructor' => 'Devonte Wright',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ];
        $db->table('student_enrolled_modules')->insertBatch($studentModules);

        // 6. Seed Fee Invoices & Payments
        $db->table('fee_invoices')->emptyTable();
        $invoices = [
            [
                'invoice_no' => 'INV-2026-001',
                'student_code' => 'STU-2026-0842',
                'student_name' => 'Marcus Vance',
                'track' => 'Full-Stack Web Development',
                'batch_code' => 'FSW-2026-A',
                'total_amount' => 4500.00,
                'paid_amount' => 3000.00,
                'balance_amount' => 1500.00,
                'due_date' => '2026-12-15',
                'status' => 'Partial',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'invoice_no' => 'INV-2026-002',
                'student_code' => 'STU-2026-0843',
                'student_name' => 'Alena Rostova',
                'track' => 'Digital Marketing',
                'batch_code' => 'DMM-2026-B',
                'total_amount' => 3200.00,
                'paid_amount' => 3200.00,
                'balance_amount' => 0.00,
                'due_date' => '2026-11-20',
                'status' => 'Paid',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'invoice_no' => 'INV-2026-003',
                'student_code' => 'STU-2026-0844',
                'student_name' => 'Kevin Chen',
                'track' => 'UI/UX Product Design',
                'batch_code' => 'UXD-2026-A',
                'total_amount' => 3600.00,
                'paid_amount' => 1200.00,
                'balance_amount' => 2400.00,
                'due_date' => '2026-12-01',
                'status' => 'Pending',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ];
        $db->table('fee_invoices')->insertBatch($invoices);

        $db->table('fee_payments')->emptyTable();
        $payments = [
            [
                'receipt_no' => 'REC-2026-101',
                'invoice_id' => 1,
                'student_name' => 'Marcus Vance',
                'amount' => 3000.00,
                'payment_method' => 'Bank Transfer',
                'transaction_ref' => 'TXN-WF-889211',
                'notes' => 'Semester 1 advance tuition payment',
                'payment_date' => '2026-01-14',
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'receipt_no' => 'REC-2026-102',
                'invoice_id' => 2,
                'student_name' => 'Alena Rostova',
                'amount' => 3200.00,
                'payment_method' => 'Credit Card',
                'transaction_ref' => 'STRIPE-CHG-99201',
                'notes' => 'Full course fee settlement with early bird discount',
                'payment_date' => '2026-01-28',
                'created_at' => date('Y-m-d H:i:s'),
            ],
        ];
        $db->table('fee_payments')->insertBatch($payments);

        // 7. Seed Calendar Events
        $db->table('calendar_events')->emptyTable();
        $events = [
            [
                'event_uid' => 'EVT-2026-1001',
                'title' => 'React Server Components Deep Dive',
                'event_type' => 'lecture',
                'date' => '2026-11-26',
                'start_time' => '09:00 AM',
                'end_time' => '11:30 AM',
                'track' => 'Full-Stack Web Development',
                'batch_code' => 'FSW-2026-A',
                'instructor' => 'Dr. Elena Rostova',
                'room' => 'Lab 304 - Turing Hall',
                'description' => 'Architectural exploration of streaming SSR and server actions.',
                'attendance_required' => 1,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'event_uid' => 'EVT-2026-1002',
                'title' => 'Hands-on State Management Lab',
                'event_type' => 'lab',
                'date' => '2026-11-27',
                'start_time' => '02:00 PM',
                'end_time' => '05:00 PM',
                'track' => 'Full-Stack Web Development',
                'batch_code' => 'FSW-2026-A',
                'instructor' => 'Devonte Wright',
                'room' => 'Software Studio 2',
                'description' => 'Implementation of Zustand and TanStack Query state caches.',
                'attendance_required' => 1,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'event_uid' => 'EVT-2026-1003',
                'title' => 'Midterm Microservices Examination',
                'event_type' => 'exam',
                'date' => '2026-12-02',
                'start_time' => '10:00 AM',
                'end_time' => '01:00 PM',
                'track' => 'Full-Stack Web Development',
                'batch_code' => 'FSW-2026-A',
                'instructor' => 'Dr. Elena Rostova',
                'room' => 'Examination Hall Alpha',
                'description' => 'Proctored practical coding exam on REST API resilience.',
                'attendance_required' => 1,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ];
        $db->table('calendar_events')->insertBatch($events);

        // 8. Seed Student Progress
        $db->table('student_progress')->emptyTable();
        $progress = [
            [
                'student_code' => 'STU-2026-0842',
                'track' => 'Full-Stack Web Development',
                'batch_code' => 'FSW-2026-A',
                'cumulative_gpa' => 3.82,
                'percentile' => 'Top 8%',
                'syllabus_completed_credits' => 38,
                'syllabus_total_credits' => 50,
                'average_score' => 91,
                'attendance_rate' => 94,
                'cleared_milestones' => 5,
                'total_milestones' => 6,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'student_code' => 'STU-2026-0843',
                'track' => 'Digital Marketing',
                'batch_code' => 'DMM-2026-B',
                'cumulative_gpa' => 3.94,
                'percentile' => 'Top 3%',
                'syllabus_completed_credits' => 30,
                'syllabus_total_credits' => 36,
                'average_score' => 95,
                'attendance_rate' => 98,
                'cleared_milestones' => 4,
                'total_milestones' => 4,
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ];
        $db->table('student_progress')->insertBatch($progress);

        // 9. Seed Student Transcripts
        $db->table('student_transcripts')->emptyTable();
        $transcripts = [
            [
                'student_code' => 'STU-2026-0842',
                'assessment_name' => 'Frontend Architecture & DOM Optimization',
                'assessment_type' => 'Practical Exam',
                'date' => '2026-02-18',
                'score' => 96,
                'weight' => '15%',
                'grade' => 'A+',
                'feedback' => 'Exceptional performance in browser rendering mechanics.',
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'student_code' => 'STU-2026-0842',
                'assessment_name' => 'TypeScript Generics & State Design',
                'assessment_type' => 'Code Defense',
                'date' => '2026-03-22',
                'score' => 92,
                'weight' => '20%',
                'grade' => 'A',
                'feedback' => 'Robust schema validations; well documented types.',
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'student_code' => 'STU-2026-0842',
                'assessment_name' => 'Midterm Full-Stack Monorepo Project',
                'assessment_type' => 'Project Capstone',
                'date' => '2026-04-10',
                'score' => 89,
                'weight' => '25%',
                'grade' => 'A-',
                'feedback' => 'Solid end-to-end flow with high unit test coverage.',
                'created_at' => date('Y-m-d H:i:s'),
            ],
        ];
        $db->table('student_transcripts')->insertBatch($transcripts);

        // 10. Seed Student Milestones
        $db->table('student_milestones')->emptyTable();
        $milestones = [
            [
                'student_code' => 'STU-2026-0842',
                'title' => 'Full-Stack Architecture Defense',
                'category' => 'Capstone Review',
                'status' => 'Completed',
                'due_date' => '2026-03-15',
                'completion_date' => '2026-03-14',
                'score' => '94 / 100',
                'evaluator' => 'Dr. Elena Rostova',
                'feedback' => 'Passed with honors. Excellent architectural clarity.',
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'student_code' => 'STU-2026-0842',
                'title' => 'Cloud Deployment & CI/CD Pipeline',
                'category' => 'DevOps Practical',
                'status' => 'Completed',
                'due_date' => '2026-04-01',
                'completion_date' => '2026-03-30',
                'score' => '90 / 100',
                'evaluator' => 'Devonte Wright',
                'feedback' => 'Clean Docker builds with secure environment handling.',
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'student_code' => 'STU-2026-0842',
                'title' => 'Enterprise System Production Readiness',
                'category' => 'Final Defense',
                'status' => 'In Review',
                'due_date' => '2026-06-15',
                'completion_date' => null,
                'score' => 'Pending Review',
                'evaluator' => 'Academic Committee',
                'feedback' => 'Defense scheduled for final graduation audit.',
                'created_at' => date('Y-m-d H:i:s'),
            ],
        ];
        $db->table('student_milestones')->insertBatch($milestones);

        // 11. Seed Student Attendance
        $db->table('student_attendance')->emptyTable();
        $attendance = [
            [
                'student_code' => 'STU-2026-0842',
                'date' => '2026-11-25',
                'session_title' => 'Next.js App Router Architecture',
                'type' => 'Lecture & Lab',
                'status' => 'Present',
                'remarks' => 'Active classroom contribution.',
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'student_code' => 'STU-2026-0842',
                'date' => '2026-11-24',
                'session_title' => 'PostgreSQL Query Plan Optimization',
                'type' => 'Hands-on Lab',
                'status' => 'Present',
                'remarks' => 'Completed query tuning exercises ahead of time.',
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'student_code' => 'STU-2026-0842',
                'date' => '2026-11-21',
                'session_title' => 'Microservices Event Streaming with Kafka',
                'type' => 'Workshop',
                'status' => 'Present',
                'remarks' => 'On-time attendance.',
                'created_at' => date('Y-m-d H:i:s'),
            ],
        ];
        $db->table('student_attendance')->insertBatch($attendance);

        // 12. Seed Student Remarks
        $db->table('student_remarks')->emptyTable();
        $remarks = [
            [
                'student_code' => 'STU-2026-0842',
                'advisor_name' => 'Dr. Elena Rostova',
                'advisor_role' => 'Lead Faculty Advisor',
                'category' => 'Academic Standing',
                'flag' => 'Positive',
                'date' => '2026-11-18',
                'notes' => 'Marcus demonstrates exceptional algorithmic problem solving. Recommended for peer mentoring.',
                'created_at' => date('Y-m-d H:i:s'),
            ],
            [
                'student_code' => 'STU-2026-0842',
                'advisor_name' => 'Prof. Julian Vance',
                'advisor_role' => 'Career Placement Coordinator',
                'category' => 'Industry Readiness',
                'flag' => 'Commendation',
                'date' => '2026-11-05',
                'notes' => 'Portfolio passed institutional benchmark for enterprise internship eligibility.',
                'created_at' => date('Y-m-d H:i:s'),
            ],
        ];
        $db->table('student_remarks')->insertBatch($remarks);

        // 13. Seed Modules Library
        $db->table('modules')->emptyTable();
        $modules = [
            [
                'code' => 'MOD-FS-01',
                'title' => 'Frontend Foundations & Semantic HTML/CSS',
                'category' => 'Engineering',
                'duration_days' => 10,
                'credits' => 4,
                'level' => 'Beginner',
                'description' => 'Semantic layout, responsive design systems, accessibility WCAG compliance.',
                'status' => 'Active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'code' => 'MOD-FS-02',
                'title' => 'Modern JavaScript ES6+ & TypeScript',
                'category' => 'Engineering',
                'duration_days' => 14,
                'credits' => 5,
                'level' => 'Intermediate',
                'description' => 'Event loop, asynchronous promises, strict type checking and interfaces.',
                'status' => 'Active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'code' => 'MOD-FS-03',
                'title' => 'React & Next.js Architecture',
                'category' => 'Engineering',
                'duration_days' => 14,
                'credits' => 5,
                'level' => 'Advanced',
                'description' => 'Server components, client hydration, state management, and edge caching.',
                'status' => 'Active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'code' => 'MOD-DM-01',
                'title' => 'SEO & Keyword Strategy',
                'category' => 'Marketing',
                'duration_days' => 8,
                'credits' => 3,
                'level' => 'Beginner',
                'description' => 'Technical search indexing, on-page optimization and SERP dominance.',
                'status' => 'Active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ];
        $db->table('modules')->insertBatch($modules);

        // 14. Seed Courses
        $db->table('courses')->emptyTable();
        $courses = [
            [
                'title' => 'Full-Stack Web Development',
                'instructor' => 'Dr. Elena Rostova',
                'level' => 'Advanced',
                'duration' => 'Lab 304 • 09:00 AM',
                'description' => 'Enterprise modern web development from UI components to distributed backend microservices.',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'title' => 'Data Science & Machine Learning',
                'instructor' => 'Devonte Wright',
                'level' => 'Intermediate',
                'duration' => 'Compute Cluster 108 • 02:00 PM',
                'description' => 'Statistical modeling, deep learning architectures, and scalable analytics.',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ];
        $db->table('courses')->insertBatch($courses);

        // 15. Seed Users
        $db->table('users')->emptyTable();
        $users = [
            [
                'name' => 'System Administrator',
                'email' => 'admin@bixcel.edu',
                'role' => 'Super Admin',
                'status' => 'Active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'name' => 'Dr. Elena Rostova',
                'email' => 'elena.rostova@bixcel.edu',
                'role' => 'Faculty Lead',
                'status' => 'Active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'name' => 'Marcus Vance',
                'email' => 'marcus.vance@student.bixcel.edu',
                'role' => 'Student',
                'status' => 'Active',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ];
        $db->table('users')->insertBatch($users);
    }
}
