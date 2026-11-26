<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateLmsTables extends Migration
{
    public function up()
    {
        // 1. Students Table
        $this->forge->addField([
            'id' => ['type' => 'INTEGER', 'auto_increment' => true],
            'student_id' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => false],
            'full_name' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => false],
            'email' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'phone' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => true],
            'dob' => ['type' => 'DATE', 'null' => true],
            'gender' => ['type' => 'VARCHAR', 'constraint' => 30, 'null' => true],
            'blood_group' => ['type' => 'VARCHAR', 'constraint' => 10, 'null' => true],
            'address' => ['type' => 'TEXT', 'null' => true],
            'guardian_name' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'guardian_relation' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => true],
            'guardian_phone' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => true],
            'guardian_email' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'status' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'Active'],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
            'deleted_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('student_id');
        $this->forge->createTable('students', true);

        // 2. Student Enrollments
        $this->forge->addField([
            'id' => ['type' => 'INTEGER', 'auto_increment' => true],
            'student_id' => ['type' => 'INTEGER', 'null' => true],
            'student_code' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => false],
            'track' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => false],
            'category' => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'batch_id' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => true],
            'start_date' => ['type' => 'DATE', 'null' => true],
            'end_date' => ['type' => 'DATE', 'null' => true],
            'total_days' => ['type' => 'INT', 'default' => 0],
            'total_modules' => ['type' => 'INT', 'default' => 0],
            'status' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'Active'],
            'tuition_fee' => ['type' => 'DECIMAL', 'constraint' => '10,2', 'default' => 0.00],
            'plan' => ['type' => 'VARCHAR', 'constraint' => 50, 'default' => 'Standard'],
            'payment_method' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('student_enrollments', true);

        // 3. Student Enrolled Modules
        $this->forge->addField([
            'id' => ['type' => 'INTEGER', 'auto_increment' => true],
            'student_id' => ['type' => 'INTEGER', 'null' => true],
            'student_code' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => false],
            'module_code' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => false],
            'title' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => false],
            'days' => ['type' => 'INT', 'default' => 0],
            'is_core' => ['type' => 'TINYINT', 'default' => 1],
            'status' => ['type' => 'VARCHAR', 'constraint' => 50, 'default' => 'Scheduled'],
            'grade' => ['type' => 'VARCHAR', 'constraint' => 10, 'null' => true],
            'score' => ['type' => 'INT', 'default' => 0],
            'completion_pct' => ['type' => 'INT', 'default' => 0],
            'instructor' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('student_enrolled_modules', true);

        // 4. Batches Table
        $this->forge->addField([
            'id' => ['type' => 'INTEGER', 'auto_increment' => true],
            'batch_code' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => false],
            'track' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => false],
            'tutor_id' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => true],
            'tutor_name' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'start_date' => ['type' => 'DATE', 'null' => true],
            'end_date' => ['type' => 'DATE', 'null' => true],
            'timing' => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'classroom' => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'capacity' => ['type' => 'INT', 'default' => 30],
            'enrolled_count' => ['type' => 'INT', 'default' => 0],
            'status' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'Active'],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('batch_code');
        $this->forge->createTable('batches', true);

        // 5. Tutors Table
        $this->forge->addField([
            'id' => ['type' => 'INTEGER', 'auto_increment' => true],
            'tutor_id' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => false],
            'full_name' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => false],
            'email' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'phone' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => true],
            'specialization' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'assigned_track' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'status' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'Active'],
            'rating' => ['type' => 'DECIMAL', 'constraint' => '3,2', 'default' => 5.00],
            'total_hours' => ['type' => 'INT', 'default' => 0],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('tutor_id');
        $this->forge->createTable('tutors', true);

        // 6. Fee Invoices Table
        $this->forge->addField([
            'id' => ['type' => 'INTEGER', 'auto_increment' => true],
            'invoice_no' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => false],
            'student_id' => ['type' => 'INTEGER', 'null' => true],
            'student_code' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => false],
            'student_name' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => false],
            'track' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'batch_code' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => true],
            'total_amount' => ['type' => 'DECIMAL', 'constraint' => '10,2', 'default' => 0.00],
            'paid_amount' => ['type' => 'DECIMAL', 'constraint' => '10,2', 'default' => 0.00],
            'balance_amount' => ['type' => 'DECIMAL', 'constraint' => '10,2', 'default' => 0.00],
            'due_date' => ['type' => 'DATE', 'null' => true],
            'status' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'Pending'],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('invoice_no');
        $this->forge->createTable('fee_invoices', true);

        // 7. Fee Payments Table
        $this->forge->addField([
            'id' => ['type' => 'INTEGER', 'auto_increment' => true],
            'receipt_no' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => false],
            'invoice_id' => ['type' => 'INTEGER', 'null' => true],
            'student_id' => ['type' => 'INTEGER', 'null' => true],
            'student_name' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'amount' => ['type' => 'DECIMAL', 'constraint' => '10,2', 'default' => 0.00],
            'payment_method' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => true],
            'transaction_ref' => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'notes' => ['type' => 'TEXT', 'null' => true],
            'payment_date' => ['type' => 'DATE', 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('receipt_no');
        $this->forge->createTable('fee_payments', true);

        // 8. Calendar Events Table
        $this->forge->addField([
            'id' => ['type' => 'INTEGER', 'auto_increment' => true],
            'event_uid' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => false],
            'title' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => false],
            'event_type' => ['type' => 'VARCHAR', 'constraint' => 50, 'default' => 'lecture'],
            'date' => ['type' => 'DATE', 'null' => false],
            'start_time' => ['type' => 'VARCHAR', 'constraint' => 20, 'null' => true],
            'end_time' => ['type' => 'VARCHAR', 'constraint' => 20, 'null' => true],
            'track' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'batch_code' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => true],
            'instructor' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'room' => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'description' => ['type' => 'TEXT', 'null' => true],
            'attendance_required' => ['type' => 'TINYINT', 'default' => 1],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('event_uid');
        $this->forge->createTable('calendar_events', true);

        // 9. Student Progress Summary Table
        $this->forge->addField([
            'id' => ['type' => 'INTEGER', 'auto_increment' => true],
            'student_id' => ['type' => 'INTEGER', 'null' => true],
            'student_code' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => false],
            'track' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'batch_code' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => true],
            'cumulative_gpa' => ['type' => 'DECIMAL', 'constraint' => '3,2', 'default' => 4.00],
            'percentile' => ['type' => 'VARCHAR', 'constraint' => 50, 'default' => 'Top 10%'],
            'syllabus_completed_credits' => ['type' => 'INT', 'default' => 0],
            'syllabus_total_credits' => ['type' => 'INT', 'default' => 0],
            'average_score' => ['type' => 'INT', 'default' => 0],
            'attendance_rate' => ['type' => 'INT', 'default' => 0],
            'cleared_milestones' => ['type' => 'INT', 'default' => 0],
            'total_milestones' => ['type' => 'INT', 'default' => 0],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('student_code');
        $this->forge->createTable('student_progress', true);

        // 10. Student Transcripts Table
        $this->forge->addField([
            'id' => ['type' => 'INTEGER', 'auto_increment' => true],
            'student_id' => ['type' => 'INTEGER', 'null' => true],
            'student_code' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => false],
            'assessment_name' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => false],
            'assessment_type' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => true],
            'date' => ['type' => 'DATE', 'null' => true],
            'score' => ['type' => 'INT', 'default' => 0],
            'weight' => ['type' => 'VARCHAR', 'constraint' => 20, 'null' => true],
            'grade' => ['type' => 'VARCHAR', 'constraint' => 10, 'null' => true],
            'feedback' => ['type' => 'TEXT', 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('student_transcripts', true);

        // 11. Student Milestones Table
        $this->forge->addField([
            'id' => ['type' => 'INTEGER', 'auto_increment' => true],
            'student_id' => ['type' => 'INTEGER', 'null' => true],
            'student_code' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => false],
            'title' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => false],
            'category' => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'status' => ['type' => 'VARCHAR', 'constraint' => 50, 'default' => 'Pending'],
            'due_date' => ['type' => 'DATE', 'null' => true],
            'completion_date' => ['type' => 'DATE', 'null' => true],
            'score' => ['type' => 'VARCHAR', 'constraint' => 20, 'null' => true],
            'evaluator' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'feedback' => ['type' => 'TEXT', 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('student_milestones', true);

        // 12. Student Attendance Table
        $this->forge->addField([
            'id' => ['type' => 'INTEGER', 'auto_increment' => true],
            'student_id' => ['type' => 'INTEGER', 'null' => true],
            'student_code' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => false],
            'date' => ['type' => 'DATE', 'null' => false],
            'session_title' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => false],
            'type' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => true],
            'status' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'Present'],
            'remarks' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('student_attendance', true);

        // 13. Student Remarks Table
        $this->forge->addField([
            'id' => ['type' => 'INTEGER', 'auto_increment' => true],
            'student_id' => ['type' => 'INTEGER', 'null' => true],
            'student_code' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => false],
            'advisor_name' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => false],
            'advisor_role' => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'category' => ['type' => 'VARCHAR', 'constraint' => 50, 'default' => 'Academic Standing'],
            'flag' => ['type' => 'VARCHAR', 'constraint' => 50, 'default' => 'Positive'],
            'date' => ['type' => 'DATE', 'null' => true],
            'notes' => ['type' => 'TEXT', 'null' => false],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('student_remarks', true);

        // 14. Modules Library Table
        $this->forge->addField([
            'id' => ['type' => 'INTEGER', 'auto_increment' => true],
            'code' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => false],
            'title' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => false],
            'category' => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'duration_days' => ['type' => 'INT', 'default' => 10],
            'credits' => ['type' => 'INT', 'default' => 3],
            'level' => ['type' => 'VARCHAR', 'constraint' => 50, 'default' => 'Intermediate'],
            'description' => ['type' => 'TEXT', 'null' => true],
            'status' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'Active'],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('code');
        $this->forge->createTable('modules', true);

        // 15. Courses Table
        $this->forge->addField([
            'id' => ['type' => 'INTEGER', 'auto_increment' => true],
            'title' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => false],
            'instructor' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => true],
            'level' => ['type' => 'VARCHAR', 'constraint' => 50, 'default' => 'Beginner'],
            'duration' => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'description' => ['type' => 'TEXT', 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('courses', true);

        // 16. Users Table
        $this->forge->addField([
            'id' => ['type' => 'INTEGER', 'auto_increment' => true],
            'name' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => false],
            'email' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => false],
            'role' => ['type' => 'VARCHAR', 'constraint' => 50, 'default' => 'Student'],
            'status' => ['type' => 'VARCHAR', 'constraint' => 30, 'default' => 'Active'],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
            'updated_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('email');
        $this->forge->createTable('users', true);

        // 17. Audit Logs Table
        $this->forge->addField([
            'id' => ['type' => 'INTEGER', 'auto_increment' => true],
            'user_name' => ['type' => 'VARCHAR', 'constraint' => 150, 'null' => false],
            'action' => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => false],
            'entity' => ['type' => 'VARCHAR', 'constraint' => 100, 'null' => true],
            'ip_address' => ['type' => 'VARCHAR', 'constraint' => 50, 'null' => true],
            'details' => ['type' => 'TEXT', 'null' => true],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('audit_logs', true);

        // 18. Notifications Table
        $this->forge->addField([
            'id' => ['type' => 'INTEGER', 'auto_increment' => true],
            'title' => ['type' => 'VARCHAR', 'constraint' => 255, 'null' => false],
            'message' => ['type' => 'TEXT', 'null' => false],
            'type' => ['type' => 'VARCHAR', 'constraint' => 50, 'default' => 'info'],
            'is_read' => ['type' => 'TINYINT', 'default' => 0],
            'created_at' => ['type' => 'DATETIME', 'null' => true],
        ]);
        $this->forge->addKey('id', true);
        $this->forge->createTable('notifications', true);
    }

    public function down()
    {
        $tables = [
            'notifications',
            'audit_logs',
            'users',
            'courses',
            'modules',
            'student_remarks',
            'student_attendance',
            'student_milestones',
            'student_transcripts',
            'student_progress',
            'calendar_events',
            'fee_payments',
            'fee_invoices',
            'tutors',
            'batches',
            'student_enrolled_modules',
            'student_enrollments',
            'students',
        ];

        foreach ($tables as $table) {
            $this->forge->dropTable($table, true);
        }
    }
}
