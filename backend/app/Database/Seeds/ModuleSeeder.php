<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class ModuleSeeder extends Seeder
{
    public function run()
    {
        $db = \Config\Database::connect();
        $builder = $db->table('modules');

        // Optional: Look up department by code to dynamically get its ID
        $dept = $db->table('departments')->where('code', 'DEP-001')->get()->getRowArray()
             ?? $db->table('departments')->where('code', 'DEP-FS')->get()->getRowArray();

        $departmentId = $dept['id'] ?? 1;
        $departmentName = $dept['name'] ?? 'Full Stack Development';

        // -------------------------------------------------------------
        // CURRICULUM LESSONS STRUCTURE (Days -> Lessons, Tasks, Quizzes)
        // -------------------------------------------------------------
        $curriculum = [
            [
                'day'       => 1,
                'day_title' => 'Day 1: Modern Frontend Architecture & Next.js',
                'lessons'   => [
                    [
                        'sno'         => 1,
                        'type'        => 'lesson',               // 'lesson' | 'task' | 'quiz' | 'test'
                        'title'       => 'React 19 Server Actions & Optimistic UI',
                        'duration'    => '90 mins',
                        'format'      => 'Live Interactive Lecture',
                        'description' => 'useOptimistic, useActionState, instant form submission feedback without spinners.',
                        'status'      => 'completed',            // 'completed' | 'current' | 'upcoming'
                        'live_link'   => 'https://meet.bixcel.edu/dev-session',
                        'doc_link'    => 'https://docs.bixcel.edu/handouts/day1-react19.pdf',
                    ],
                    [
                        'sno'         => 2,
                        'type'        => 'task',
                        'title'       => 'Hands-on Lab: Optimistic Like & Comment Feed',
                        'duration'    => '60 mins',
                        'format'      => 'Practical Lab Session',
                        'description' => 'Build a responsive feed component with instant state mutation and error rollback.',
                        'status'      => 'completed',
                        'live_link'   => '',
                        'doc_link'    => 'https://docs.bixcel.edu/labs/lab1-optimistic.pdf',
                    ],
                ],
            ],
            [
                'day'       => 2,
                'day_title' => 'Day 2: Backend REST APIs & Authentication',
                'lessons'   => [
                    [
                        'sno'         => 1,
                        'type'        => 'lesson',
                        'title'       => 'CodeIgniter 4 RESTful Routing & JWT Auth',
                        'duration'    => '90 mins',
                        'format'      => 'Interactive Lecture',
                        'description' => 'Bearer token verification, role-based access filters, and CORS headers.',
                        'status'      => 'current',
                        'live_link'   => 'https://meet.bixcel.edu/dev-session',
                        'doc_link'    => 'https://docs.bixcel.edu/handouts/day2-jwt.pdf',
                    ],
                    [
                        'sno'         => 2,
                        'type'        => 'quiz',
                        'title'       => 'Quiz: JWT Security & Token Lifecycle',
                        'duration'    => '30 mins',
                        'format'      => 'Online Assessment',
                        'description' => '15 multiple choice questions on token expiration, signature verification, and storage.',
                        'status'      => 'upcoming',
                        'live_link'   => '',
                        'doc_link'    => '',
                    ],
                ],
            ],
            [
                'day'       => 3,
                'day_title' => 'Day 3: Database Indexing & Cloud Deployment',
                'lessons'   => [
                    [
                        'sno'         => 1,
                        'type'        => 'lesson',
                        'title'       => 'MySQL & PostgreSQL Performance Indexing',
                        'duration'    => '90 mins',
                        'format'      => 'Interactive Lecture',
                        'description' => 'B-Tree indexes, composite keys, query execution plans, and slow query logging.',
                        'status'      => 'upcoming',
                        'live_link'   => 'https://meet.bixcel.edu/dev-session',
                        'doc_link'    => 'https://docs.bixcel.edu/handouts/day3-indexing.pdf',
                    ],
                    [
                        'sno'         => 2,
                        'type'        => 'test',
                        'title'       => 'Module Capstone Practical Evaluation',
                        'duration'    => '120 mins',
                        'format'      => 'Practical Exam',
                        'description' => 'Deploy full-stack micro-app with live database, authentication, and CI/CD.',
                        'status'      => 'upcoming',
                        'live_link'   => '',
                        'doc_link'    => 'https://docs.bixcel.edu/exams/capstone-spec.pdf',
                    ],
                ],
            ],
        ];

        // -------------------------------------------------------------
        // MODULE MASTER RECORD
        // -------------------------------------------------------------
        $module = [
            'code'               => 'MOD-FSD-101',
            'title'              => 'Full-Stack Software Engineering (React 19 & REST API)',
            'department_id'      => $departmentId,
            'category'           => $departmentName,
            'duration_days'      => count($curriculum),
            'credits'            => 4,
            'level'              => 'Intermediate',
            'tutor'              => 'Gowtham Tamilkathir',
            'description'        => 'Comprehensive full-stack engineering module covering modern frontend, secure REST APIs, and database performance.',
            'status'             => 'Published',
            'curriculum_lessons' => json_encode($curriculum, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
            'created_at'         => date('Y-m-d H:i:s'),
            'updated_at'         => date('Y-m-d H:i:s'),
        ];

        // Upsert by module code so re-running seeder does not create duplicates
        $existing = $builder->where('code', $module['code'])->get()->getRow();
        if ($existing) {
            $builder->where('code', $module['code'])->update($module);
            echo "Module [{$module['code']}] updated successfully.\n";
        } else {
            $builder->insert($module);
            echo "Module [{$module['code']}] inserted successfully.\n";
        }
    }
}
