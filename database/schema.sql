-- ==============================================================================
-- BIXCEL LEARNING MANAGEMENT SYSTEM (LMS) - COMPLETE DATABASE SCHEMA
-- Compatible with: MySQL 5.7+, MySQL 8.0+, MariaDB 10.3+, SQLite 3
-- Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Total Tables: 19 Operational Business Entities
-- Generated at: 2026-11-26
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------------------------
-- 1. ROLES TABLE (RBAC Foundation)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `scope` VARCHAR(100) DEFAULT 'Operational Scope',
  `is_system` TINYINT(1) DEFAULT 0,
  `status` VARCHAR(30) DEFAULT 'Active',
  `permissions_json` TEXT NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  UNIQUE KEY `idx_roles_name` (`name`),
  UNIQUE KEY `idx_roles_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. USERS TABLE (Enterprise Accounts & Profiles)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `emp_id` VARCHAR(50) NULL,
  `role` VARCHAR(100) DEFAULT 'Student',
  `role_code` VARCHAR(100) NULL,
  `department` VARCHAR(100) NULL,
  `phone` VARCHAR(50) NULL,
  `status` VARCHAR(30) DEFAULT 'Active',
  `avatar` TEXT NULL,
  `last_login` VARCHAR(100) NULL,
  `bio` TEXT NULL,
  `office` VARCHAR(150) NULL,
  `timezone` VARCHAR(100) NULL,
  `institution` VARCHAR(200) NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  UNIQUE KEY `idx_users_email` (`email`),
  KEY `idx_users_emp_id` (`emp_id`),
  KEY `idx_users_role_code` (`role_code`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. STUDENTS TABLE (Demographics & Primary Dossiers)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `students`;
CREATE TABLE `students` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` VARCHAR(50) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NULL,
  `phone` VARCHAR(50) NULL,
  `dob` DATE NULL,
  `gender` VARCHAR(30) NULL,
  `blood_group` VARCHAR(10) NULL,
  `address` TEXT NULL,
  `guardian_name` VARCHAR(150) NULL,
  `guardian_relation` VARCHAR(50) NULL,
  `guardian_phone` VARCHAR(50) NULL,
  `guardian_email` VARCHAR(150) NULL,
  `status` VARCHAR(30) DEFAULT 'Active',
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  `deleted_at` DATETIME NULL,
  UNIQUE KEY `idx_students_student_id` (`student_id`),
  KEY `idx_students_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. STUDENT ENROLLMENTS (Academic Program & Batch Contracts)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `student_enrollments`;
CREATE TABLE `student_enrollments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NULL,
  `student_code` VARCHAR(50) NOT NULL,
  `track` VARCHAR(150) NOT NULL,
  `category` VARCHAR(100) NULL,
  `batch_id` VARCHAR(50) NULL,
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  `total_days` INT DEFAULT 0,
  `total_modules` INT DEFAULT 0,
  `status` VARCHAR(30) DEFAULT 'Active',
  `tuition_fee` DECIMAL(10,2) DEFAULT 0.00,
  `plan` VARCHAR(50) DEFAULT 'Standard',
  `payment_method` VARCHAR(50) NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  KEY `idx_enrollments_student_code` (`student_code`),
  KEY `idx_enrollments_batch_id` (`batch_id`),
  KEY `idx_enrollments_track` (`track`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. STUDENT ENROLLED MODULES (Granular Module Level Tracking)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `student_enrolled_modules`;
CREATE TABLE `student_enrolled_modules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NULL,
  `student_code` VARCHAR(50) NOT NULL,
  `module_code` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `days` INT DEFAULT 0,
  `is_core` TINYINT(1) DEFAULT 1,
  `status` VARCHAR(50) DEFAULT 'Scheduled',
  `grade` VARCHAR(10) NULL,
  `score` INT DEFAULT 0,
  `completion_pct` INT DEFAULT 0,
  `instructor` VARCHAR(150) NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  KEY `idx_sem_student_code` (`student_code`),
  KEY `idx_sem_module_code` (`module_code`),
  KEY `idx_sem_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. BATCHES (Cohorts & Timetable Schedules)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `batches`;
CREATE TABLE `batches` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `batch_code` VARCHAR(50) NOT NULL,
  `track` VARCHAR(150) NOT NULL,
  `tutor_id` VARCHAR(50) NULL,
  `tutor_name` VARCHAR(150) NULL,
  `start_date` DATE NULL,
  `end_date` DATE NULL,
  `timing` VARCHAR(100) NULL,
  `classroom` VARCHAR(100) NULL,
  `capacity` INT DEFAULT 30,
  `enrolled_count` INT DEFAULT 0,
  `status` VARCHAR(30) DEFAULT 'Active',
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  UNIQUE KEY `idx_batches_batch_code` (`batch_code`),
  KEY `idx_batches_track` (`track`),
  KEY `idx_batches_tutor_id` (`tutor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. TUTORS (Faculty Roster & Workload Distribution)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `tutors`;
CREATE TABLE `tutors` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tutor_id` VARCHAR(50) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NULL,
  `phone` VARCHAR(50) NULL,
  `specialization` VARCHAR(150) NULL,
  `assigned_track` VARCHAR(150) NULL,
  `status` VARCHAR(30) DEFAULT 'Active',
  `rating` DECIMAL(3,2) DEFAULT 5.00,
  `total_hours` INT DEFAULT 0,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  UNIQUE KEY `idx_tutors_tutor_id` (`tutor_id`),
  KEY `idx_tutors_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. COURSES (Catalog & Curriculum Definitions)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `instructor` VARCHAR(150) NULL,
  `level` VARCHAR(50) DEFAULT 'Beginner',
  `duration` VARCHAR(100) NULL,
  `description` TEXT NULL,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  KEY `idx_courses_title` (`title`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. MODULES (Modular Course Units & Credit Values)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `modules`;
CREATE TABLE `modules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NULL,
  `duration_days` INT DEFAULT 10,
  `credits` INT DEFAULT 3,
  `level` VARCHAR(50) DEFAULT 'Intermediate',
  `description` TEXT NULL,
  `status` VARCHAR(30) DEFAULT 'Active',
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  UNIQUE KEY `idx_modules_code` (`code`),
  KEY `idx_modules_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. FEE INVOICES (Student Tuition Ledger Accounts)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `fee_invoices`;
CREATE TABLE `fee_invoices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `invoice_no` VARCHAR(50) NOT NULL,
  `student_id` INT NULL,
  `student_code` VARCHAR(50) NOT NULL,
  `student_name` VARCHAR(150) NOT NULL,
  `track` VARCHAR(150) NULL,
  `batch_code` VARCHAR(50) NULL,
  `total_amount` DECIMAL(10,2) DEFAULT 0.00,
  `paid_amount` DECIMAL(10,2) DEFAULT 0.00,
  `balance_amount` DECIMAL(10,2) DEFAULT 0.00,
  `due_date` DATE NULL,
  `status` VARCHAR(30) DEFAULT 'Pending',
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  UNIQUE KEY `idx_invoices_invoice_no` (`invoice_no`),
  KEY `idx_invoices_student_code` (`student_code`),
  KEY `idx_invoices_status` (`status`),
  KEY `idx_invoices_due_date` (`due_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 11. FEE PAYMENTS (Bursar Receipts & Settlement Transactions)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `fee_payments`;
CREATE TABLE `fee_payments` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `receipt_no` VARCHAR(50) NOT NULL,
  `invoice_id` INT NULL,
  `student_id` INT NULL,
  `student_name` VARCHAR(150) NULL,
  `amount` DECIMAL(10,2) DEFAULT 0.00,
  `payment_method` VARCHAR(50) NULL,
  `transaction_ref` VARCHAR(100) NULL,
  `notes` TEXT NULL,
  `payment_date` DATE NULL,
  `created_at` DATETIME NULL,
  UNIQUE KEY `idx_payments_receipt_no` (`receipt_no`),
  KEY `idx_payments_invoice_id` (`invoice_id`),
  KEY `idx_payments_date` (`payment_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 12. CALENDAR EVENTS (Lectures, Labs, Defenses & Milestones)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `calendar_events`;
CREATE TABLE `calendar_events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `event_uid` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `event_type` VARCHAR(50) DEFAULT 'lecture',
  `date` DATE NOT NULL,
  `start_time` VARCHAR(20) NULL,
  `end_time` VARCHAR(20) NULL,
  `track` VARCHAR(150) NULL,
  `batch_code` VARCHAR(50) NULL,
  `instructor` VARCHAR(150) NULL,
  `room` VARCHAR(100) NULL,
  `description` TEXT NULL,
  `attendance_required` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  UNIQUE KEY `idx_calendar_event_uid` (`event_uid`),
  KEY `idx_calendar_date` (`date`),
  KEY `idx_calendar_batch` (`batch_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 13. STUDENT PROGRESS (Performance Indices & Cumulative Telemetry)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `student_progress`;
CREATE TABLE `student_progress` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NULL,
  `student_code` VARCHAR(50) NOT NULL,
  `track` VARCHAR(150) NULL,
  `batch_code` VARCHAR(50) NULL,
  `cumulative_gpa` DECIMAL(3,2) DEFAULT 4.00,
  `percentile` VARCHAR(50) DEFAULT 'Top 10%',
  `syllabus_completed_credits` INT DEFAULT 0,
  `syllabus_total_credits` INT DEFAULT 0,
  `average_score` INT DEFAULT 0,
  `attendance_rate` INT DEFAULT 0,
  `cleared_milestones` INT DEFAULT 0,
  `total_milestones` INT DEFAULT 0,
  `created_at` DATETIME NULL,
  `updated_at` DATETIME NULL,
  UNIQUE KEY `idx_progress_student_code` (`student_code`),
  KEY `idx_progress_batch` (`batch_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 14. STUDENT TRANSCRIPTS (Assessments, Quizzes & Examinations)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `student_transcripts`;
CREATE TABLE `student_transcripts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NULL,
  `student_code` VARCHAR(50) NOT NULL,
  `assessment_name` VARCHAR(255) NOT NULL,
  `assessment_type` VARCHAR(50) NULL,
  `date` DATE NULL,
  `score` INT DEFAULT 0,
  `weight` VARCHAR(20) NULL,
  `grade` VARCHAR(10) NULL,
  `feedback` TEXT NULL,
  `created_at` DATETIME NULL,
  KEY `idx_transcripts_student_code` (`student_code`),
  KEY `idx_transcripts_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 15. STUDENT MILESTONES (Capstone Defenses & Practical Reviews)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `student_milestones`;
CREATE TABLE `student_milestones` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NULL,
  `student_code` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100) NULL,
  `status` VARCHAR(50) DEFAULT 'Pending',
  `due_date` DATE NULL,
  `completion_date` DATE NULL,
  `score` VARCHAR(20) NULL,
  `evaluator` VARCHAR(150) NULL,
  `feedback` TEXT NULL,
  `created_at` DATETIME NULL,
  KEY `idx_milestones_student_code` (`student_code`),
  KEY `idx_milestones_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 16. STUDENT ATTENDANCE (Lecture Attendance Register)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `student_attendance`;
CREATE TABLE `student_attendance` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NULL,
  `student_code` VARCHAR(50) NOT NULL,
  `date` DATE NOT NULL,
  `session_title` VARCHAR(255) NOT NULL,
  `type` VARCHAR(50) NULL,
  `status` VARCHAR(30) DEFAULT 'Present',
  `remarks` VARCHAR(255) NULL,
  `created_at` DATETIME NULL,
  KEY `idx_attendance_student_code` (`student_code`),
  KEY `idx_attendance_date` (`date`),
  KEY `idx_attendance_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 17. STUDENT REMARKS (Academic Advisor & Faculty Observational Notes)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `student_remarks`;
CREATE TABLE `student_remarks` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NULL,
  `student_code` VARCHAR(50) NOT NULL,
  `advisor_name` VARCHAR(150) NOT NULL,
  `advisor_role` VARCHAR(100) NULL,
  `category` VARCHAR(50) DEFAULT 'Academic Standing',
  `flag` VARCHAR(50) DEFAULT 'Positive',
  `date` DATE NULL,
  `notes` TEXT NOT NULL,
  `created_at` DATETIME NULL,
  KEY `idx_remarks_student_code` (`student_code`),
  KEY `idx_remarks_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 18. AUDIT LOGS (Security, Authentication & Entity Modification Telemetry)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `log_code` VARCHAR(50) NOT NULL,
  `actor_name` VARCHAR(150) NOT NULL,
  `actor_email` VARCHAR(150) NULL,
  `actor_role` VARCHAR(100) NULL,
  `action` VARCHAR(100) NOT NULL,
  `action_type` VARCHAR(50) NULL,
  `module` VARCHAR(100) NULL,
  `ip_address` VARCHAR(50) NULL,
  `user_agent` VARCHAR(255) NULL,
  `severity` VARCHAR(50) DEFAULT 'INFO',
  `status` VARCHAR(50) DEFAULT 'Success',
  `summary` TEXT NULL,
  `details_json` TEXT NULL,
  `relative` VARCHAR(50) NULL,
  `created_at` DATETIME NULL,
  KEY `idx_audit_log_code` (`log_code`),
  KEY `idx_audit_action_type` (`action_type`),
  KEY `idx_audit_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 19. NOTIFICATIONS (Real-Time Notification Dispatch & Inbox)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `notif_code` VARCHAR(50) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) DEFAULT 'info',
  `priority` VARCHAR(50) DEFAULT 'medium',
  `category` VARCHAR(100) NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `action_label` VARCHAR(100) NULL,
  `action_link` VARCHAR(255) NULL,
  `icon` VARCHAR(50) DEFAULT 'notifications',
  `timestamp_label` VARCHAR(50) NULL,
  `created_at` DATETIME NULL,
  KEY `idx_notif_code` (`notif_code`),
  KEY `idx_notif_is_read` (`is_read`),
  KEY `idx_notif_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- DEFAULT SEED DATA
-- ==============================================================================

-- 1. Insert Default Roles
INSERT INTO `roles` (`id`, `name`, `code`, `description`, `scope`, `is_system`, `status`, `permissions_json`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'ROLE_SUPER_ADMIN', 'Unrestricted master access across all ERP foundations, academic telemetry, and financial ledgers.', 'Full Enterprise Scope', 1, 'Active', 'ALL', NOW(), NOW()),
(2, 'Admin', 'ROLE_ADMIN', 'Configures courses, timetables, batch assignments, and standard platform operational settings.', 'System & Operational Scope', 1, 'Active', '{\"courses\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true,\"export\":true,\"print\":true,\"settings\":true},\"batches\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"assign\":true,\"status\":true,\"export\":true},\"curriculum\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"approve\":true,\"export\":true},\"attendance\":{\"view\":true,\"create\":true,\"edit\":true,\"approve\":true,\"status\":true,\"export\":true,\"print\":true},\"exams\":{\"view\":true,\"create\":true,\"edit\":true,\"approve\":true,\"reject\":true,\"status\":true,\"export\":true,\"print\":true},\"admissions\":{\"view\":true,\"create\":true,\"edit\":true,\"approve\":true,\"reject\":true,\"assign\":true,\"status\":true,\"export\":true},\"fee_ledger\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":false,\"approve\":true,\"status\":true,\"export\":true,\"print\":true,\"settings\":false},\"room_alloc\":{\"view\":true,\"create\":true,\"edit\":true,\"delete\":true,\"assign\":true,\"status\":true}}', NOW(), NOW()),
(3, 'Academic Dean', 'ROLE_DEAN', 'Authorizes curriculum modifications, oversees faculty evaluations, and approves student certifications.', 'Departmental Governance', 0, 'Active', '{\"dashboard\":{\"view\":true},\"activity_logs\":{\"view\":true},\"courses\":{\"view\":true,\"create\":true,\"edit\":true,\"approve\":true,\"export\":true,\"print\":true},\"batches\":{\"view\":true,\"create\":true,\"edit\":true,\"assign\":true,\"status\":true},\"curriculum\":{\"view\":true,\"create\":true,\"edit\":true,\"approve\":true},\"attendance\":{\"view\":true,\"approve\":true,\"export\":true},\"exams\":{\"view\":true,\"approve\":true,\"reject\":true,\"export\":true,\"print\":true},\"users\":{\"view\":true,\"export\":true}}', NOW(), NOW()),
(4, 'Tutor / Faculty', 'ROLE_TUTOR', 'Conducts lectures, marks student attendance, reviews assignments, and publishes examination scores.', 'Instructional Delivery', 0, 'Active', '{\"dashboard\":{\"view\":true},\"courses\":{\"view\":true,\"print\":true},\"batches\":{\"view\":true},\"curriculum\":{\"view\":true,\"edit\":true},\"attendance\":{\"view\":true,\"create\":true,\"edit\":true},\"exams\":{\"view\":true,\"create\":true,\"edit\":true}}', NOW(), NOW()),
(5, 'Admission Officer', 'ROLE_ADMISSIONS', 'Processes enrollment applications, verifies academic credentials, and assigns students to active cohorts.', 'Student Intake Operations', 0, 'Active', '{\"dashboard\":{\"view\":true},\"admissions\":{\"view\":true,\"create\":true,\"edit\":true,\"assign\":true,\"status\":true,\"export\":true},\"courses\":{\"view\":true},\"batches\":{\"view\":true,\"assign\":true},\"users\":{\"view\":true,\"create\":true}}', NOW(), NOW()),
(6, 'Accountant', 'ROLE_FINANCE', 'Generates tuition invoices, tracks installment reconciliations, audits overdue balances, and prints receipts.', 'Bursar & Financial Ledgers', 0, 'Active', '{\"dashboard\":{\"view\":true},\"fee_ledger\":{\"view\":true,\"create\":true,\"edit\":true,\"status\":true,\"export\":true,\"print\":true},\"admissions\":{\"view\":true},\"activity_logs\":{\"view\":true,\"export\":true}}', NOW(), NOW()),
(7, 'Student / Learner', 'ROLE_STUDENT', 'Accesses enrolled courses, attends live lectures, submits assignments, and reviews personal grade cards.', 'Self-Service Academic Portal', 1, 'Active', '{\"dashboard\":{\"view\":true},\"courses\":{\"view\":true},\"curriculum\":{\"view\":true},\"attendance\":{\"view\":true},\"exams\":{\"view\":true}}', NOW(), NOW()),
(8, 'Work Order In-charge', 'ROLE_WORK_ORDER', 'Manages laboratory infrastructure scheduling, room equipment, and technical maintenance work orders.', 'Campus Operations Scope', 0, 'Active', '{\"view\":true,\"assign\":true}', NOW(), NOW());

-- 2. Insert Default Users
INSERT INTO `users` (`id`, `name`, `email`, `emp_id`, `role`, `role_code`, `department`, `phone`, `status`, `avatar`, `last_login`, `bio`, `office`, `timezone`, `institution`, `created_at`, `updated_at`) VALUES
(1, 'Dr. Marcus Vance', 'm.vance@bixcel.edu', 'BX-FAC-014', 'Academic Dean', 'ROLE_DEAN', 'Computer Science', '+1 (555) 234-8901', 'Active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces', '10 mins ago', 'Dean of Computing and Director of Distributed Curriculum.', 'Room 402, Engineering Block', 'UTC+05:30 (Asia/Kolkata)', 'Bixcel Institute of Technologies', NOW(), NOW()),
(2, 'Elena Rostova', 'e.rostova@bixcel.edu', 'BX-ADM-002', 'Super Admin', 'ROLE_SUPER_ADMIN', 'Executive Office', '+1 (555) 876-5432', 'Active', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces', 'Just now', 'Principal Executive Director overseeing institutional LMS architecture, academic compliance, and multi-tenant security operations at Bixcel Institute.', 'Suite 401, Tech Tower A', 'UTC+05:30 (Asia/Kolkata)', 'Bixcel Institute of Technologies Private Limited', NOW(), NOW()),
(3, 'Sophia Chen', 's.chen@bixcel.edu', 'BX-TUT-089', 'Tutor / Faculty', 'ROLE_TUTOR', 'UI / UX Design', '+1 (555) 345-6789', 'Active', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces', '2 hours ago', 'Senior UX Lead and Design Systems Specialist.', 'Studio 3B, Design Block', 'UTC+05:30 (Asia/Kolkata)', 'Bixcel Institute of Technologies', NOW(), NOW()),
(4, 'David Miller', 'd.miller@bixcel.edu', 'BX-TUT-092', 'Tutor / Faculty', 'ROLE_TUTOR', 'Cloud & DevOps', '+1 (555) 456-7890', 'Active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces', 'Yesterday', 'Cloud Infrastructure Engineer and Kubernetes Certified Instructor.', 'Lab 102, Server Annex', 'UTC+05:30 (Asia/Kolkata)', 'Bixcel Institute of Technologies', NOW(), NOW()),
(5, 'Priya Sharma', 'p.sharma@bixcel.edu', 'BX-OPS-031', 'Admission Officer', 'ROLE_ADMISSIONS', 'Student Affairs', '+1 (555) 567-8901', 'Active', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces', '3 hours ago', 'Admissions Lead coordinating international cohort onboarding and credential checks.', 'Admissions Desk 2', 'UTC+05:30 (Asia/Kolkata)', 'Bixcel Institute of Technologies', NOW(), NOW()),
(6, 'Michael Sterling', 'm.sterling@bixcel.edu', 'BX-FIN-019', 'Accountant', 'ROLE_FINANCE', 'Bursar & Finance', '+1 (555) 678-9012', 'Active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces', '1 day ago', 'Head of Bursar & Accounts Receivable auditing fee collection compliance.', 'Finance Suite 201', 'UTC+05:30 (Asia/Kolkata)', 'Bixcel Institute of Technologies', NOW(), NOW()),
(7, 'Alex Vance', 'a.vance@student.bixcel.edu', 'BX-STU-1044', 'Student / Learner', 'ROLE_STUDENT', 'Full-Stack Web Dev', '+1 (555) 789-0123', 'Active', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop&crop=faces', '45 mins ago', 'Student representative and Full-Stack Engineering scholar.', 'Main Library', 'UTC+05:30 (Asia/Kolkata)', 'Bixcel Institute of Technologies', NOW(), NOW()),
(8, 'Robert Langdon', 'r.langdon@bixcel.edu', 'BX-ADM-005', 'Admin', 'ROLE_ADMIN', 'Academic Operations', '+1 (555) 890-1234', 'Inactive', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces', '3 weeks ago', 'Systems Administrator on research sabbatical.', 'Annex Room 10', 'UTC+05:30 (Asia/Kolkata)', 'Bixcel Institute of Technologies', NOW(), NOW());

-- 3. Insert Default Courses & Modules
INSERT INTO `courses` (`id`, `title`, `instructor`, `level`, `duration`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Full-Stack Web Development', 'Dr. Elena Rostova', 'Advanced', 'Lecture Hall 304 • 09:00 AM', 'Comprehensive full-stack engineering masterclass covering modern React, CodeIgniter 4, PostgreSQL, and scalable microservices.', NOW(), NOW()),
(2, 'Data Science & Machine Learning', 'Devonte Wright', 'Intermediate', 'Compute Cluster 108 • 02:00 PM', 'Statistical modeling, deep learning architectures, and scalable analytics.', NOW(), NOW());

INSERT INTO `modules` (`id`, `code`, `title`, `category`, `duration_days`, `credits`, `level`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'MOD-FS-01', 'Modern JavaScript Engine & TypeScript Fundamentals', 'Programming', 10, 3, 'Intermediate', 'Deep dive into V8 engine mechanics, event loops, TypeScript type theory, and closures.', 'Active', NOW(), NOW()),
(2, 'MOD-FS-02', 'React Architecture & Server-Driven UI Systems', 'Frontend', 12, 4, 'Advanced', 'Component tree reconciliation, Concurrent Mode, Virtual DOM performance tuning, and SSR.', 'Active', NOW(), NOW()),
(3, 'MOD-FS-03', 'RESTful API Engineering with CodeIgniter 4', 'Backend', 10, 3, 'Advanced', 'Database migrations, model validations, CORS governance, and REST controllers.', 'Active', NOW(), NOW()),
(4, 'MOD-FS-04', 'Cloud Infrastructure & Docker Containerization', 'DevOps', 8, 2, 'Intermediate', 'Container lifecycle, Dockerfile hardening, multi-stage pipelines, and orchestration.', 'Active', NOW(), NOW());

-- 4. Insert Default Batches & Tutors
INSERT INTO `batches` (`id`, `batch_code`, `track`, `tutor_id`, `tutor_name`, `start_date`, `end_date`, `timing`, `classroom`, `capacity`, `enrolled_count`, `status`, `created_at`, `updated_at`) VALUES
(1, 'FSW-2026-A', 'Full-Stack Web Development', 'TUT-101', 'Dr. Elena Rostova', '2026-10-15', '2027-04-15', '09:00 AM - 12:00 PM', 'Lab 304 - Turing Hall', 30, 24, 'Active', NOW(), NOW()),
(2, 'DMM-2026-B', 'Digital Marketing Masterclass', 'TUT-102', 'Marcus Sterling', '2026-11-01', '2027-02-28', '02:00 PM - 05:00 PM', 'Studio Alpha', 25, 18, 'Active', NOW(), NOW()),
(3, 'UXD-2026-A', 'UI/UX Product Design', 'TUT-103', 'Sophia Chen', '2026-09-01', '2027-03-30', '10:00 AM - 01:00 PM', 'Design Loft 2', 20, 15, 'Active', NOW(), NOW()),
(4, 'CLD-2026-C', 'Cloud Architecture & DevOps', 'TUT-104', 'Devonte Wright', '2026-10-01', '2027-04-30', '03:00 PM - 06:00 PM', 'Server Annex Lab', 25, 20, 'Active', NOW(), NOW());

INSERT INTO `tutors` (`id`, `tutor_id`, `full_name`, `email`, `phone`, `specialization`, `assigned_track`, `status`, `rating`, `total_hours`, `created_at`, `updated_at`) VALUES
(1, 'TUT-101', 'Dr. Elena Rostova', 'e.rostova@bixcel.edu', '+1 (555) 876-5432', 'Distributed Systems & Web Architecture', 'Full-Stack Web Development', 'Active', 4.95, 340, NOW(), NOW()),
(2, 'TUT-102', 'Marcus Sterling', 'm.sterling@bixcel.edu', '+1 (555) 234-8901', 'Growth Hacking & Conversion Science', 'Digital Marketing Masterclass', 'Active', 4.88, 280, NOW(), NOW()),
(3, 'TUT-103', 'Sophia Chen', 's.chen@bixcel.edu', '+1 (555) 345-6789', 'Design Systems & Behavioral UX', 'UI/UX Product Design', 'Active', 4.92, 310, NOW(), NOW()),
(4, 'TUT-104', 'Devonte Wright', 'd.wright@bixcel.edu', '+1 (555) 456-7890', 'Kubernetes, Cloud Infrastructure & Observability', 'Cloud Architecture & DevOps', 'Active', 4.90, 260, NOW(), NOW());

-- 5. Insert Default Students
INSERT INTO `students` (`id`, `student_id`, `full_name`, `email`, `phone`, `dob`, `gender`, `blood_group`, `address`, `guardian_name`, `guardian_relation`, `guardian_phone`, `guardian_email`, `status`, `created_at`, `updated_at`) VALUES
(1, 'STU-2026-0842', 'Marcus Vance', 'marcus.vance@student.bixcel.edu', '+1 (555) 349-2194', '2004-03-15', 'Male', 'O+', '42 Academic Way, Suite 12B, Boston, MA', 'Eleanor Vance', 'Mother', '+1 (555) 349-2190', 'e.vance@family.org', 'Active', NOW(), NOW()),
(2, 'STU-2026-0843', 'Alena Rostova', 'alena.rostova@student.bixcel.edu', '+1 (555) 412-8831', '2003-08-22', 'Female', 'A+', '88 Silicon Boulevard, Tech District, Austin, TX', 'Dmitri Rostov', 'Father', '+1 (555) 412-8830', 'd.rostov@telecom.org', 'Active', NOW(), NOW()),
(3, 'STU-2026-0844', 'Kevin Chen', 'kevin.chen@student.bixcel.edu', '+1 (555) 902-1144', '2004-11-05', 'Male', 'B+', '104 Innovation Drive, Seattle, WA', 'Mei Chen', 'Mother', '+1 (555) 902-1140', 'mei.chen@chem.edu', 'Active', NOW(), NOW()),
(4, 'STU-2026-0845', 'Sarah Jenkins', 'sarah.j@student.bixcel.edu', '+1 (555) 782-3901', '2002-05-19', 'Female', 'AB+', '12 Elm Street, Cambridge, MA', 'Thomas Jenkins', 'Father', '+1 (555) 782-3900', 't.jenkins@bio.org', 'Active', NOW(), NOW());

-- 6. Insert Student Enrollments
INSERT INTO `student_enrollments` (`id`, `student_id`, `student_code`, `track`, `category`, `batch_id`, `start_date`, `end_date`, `total_days`, `total_modules`, `status`, `tuition_fee`, `plan`, `payment_method`, `created_at`, `updated_at`) VALUES
(1, 1, 'STU-2026-0842', 'Full-Stack Web Development', 'Information Technology', 'FSW-2026-A', '2026-10-15', '2027-04-15', 50, 6, 'Active', 4500.00, 'Two Installments', 'Bank Transfer', NOW(), NOW()),
(2, 2, 'STU-2026-0843', 'Digital Marketing', 'Business & Growth', 'DMM-2026-B', '2026-11-01', '2027-02-28', 36, 4, 'Active', 3200.00, 'Full Upfront', 'Credit Card', NOW(), NOW()),
(3, 3, 'STU-2026-0844', 'UI/UX Product Design', 'Creative & Design', 'UXD-2026-A', '2026-09-01', '2027-03-30', 40, 5, 'Active', 3600.00, 'Monthly Plan', 'Stripe Online', NOW(), NOW()),
(4, 4, 'STU-2026-0845', 'Cloud Architecture & DevOps', 'Infrastructure', 'CLD-2026-C', '2026-10-01', '2027-04-30', 45, 5, 'Active', 4200.00, 'Three Installments', 'ACH Wire', NOW(), NOW());

-- 7. Insert Enrolled Modules
INSERT INTO `student_enrolled_modules` (`id`, `student_id`, `student_code`, `module_code`, `title`, `days`, `is_core`, `status`, `grade`, `score`, `completion_pct`, `instructor`, `created_at`, `updated_at`) VALUES
(1, 1, 'STU-2026-0842', 'MOD-FS-01', 'Modern JavaScript Engine & TypeScript Fundamentals', 10, 1, 'Completed', 'A+', 94, 100, 'Dr. Elena Rostova', NOW(), NOW()),
(2, 1, 'STU-2026-0842', 'MOD-FS-02', 'React Architecture & Server-Driven UI Systems', 12, 1, 'Completed', 'A', 90, 100, 'Dr. Elena Rostova', NOW(), NOW()),
(3, 1, 'STU-2026-0842', 'MOD-FS-03', 'RESTful API Engineering with CodeIgniter 4', 10, 1, 'In Progress', 'A-', 88, 50, 'Dr. Elena Rostova', NOW(), NOW());

-- 8. Insert Fee Invoices & Payments
INSERT INTO `fee_invoices` (`id`, `invoice_no`, `student_id`, `student_code`, `student_name`, `track`, `batch_code`, `total_amount`, `paid_amount`, `balance_amount`, `due_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 'INV-2026-001', 1, 'STU-2026-0842', 'Marcus Vance', 'Full-Stack Web Development', 'FSW-2026-A', 4500.00, 3000.00, 1500.00, '2026-12-15', 'Partial', NOW(), NOW()),
(2, 'INV-2026-002', 2, 'STU-2026-0843', 'Alena Rostova', 'Digital Marketing', 'DMM-2026-B', 3200.00, 3200.00, 0.00, '2026-11-20', 'Paid', NOW(), NOW()),
(3, 'INV-2026-003', 3, 'STU-2026-0844', 'Kevin Chen', 'UI/UX Product Design', 'UXD-2026-A', 3600.00, 1200.00, 2400.00, '2026-12-01', 'Pending', NOW(), NOW());

INSERT INTO `fee_payments` (`id`, `receipt_no`, `invoice_id`, `student_id`, `student_name`, `amount`, `payment_method`, `transaction_ref`, `notes`, `payment_date`, `created_at`) VALUES
(1, 'REC-2026-101', 1, 1, 'Marcus Vance', 3000.00, 'Bank Transfer', 'TXN-WF-889211', 'Semester 1 advance tuition payment', '2026-01-14', NOW()),
(2, 'REC-2026-102', 2, 2, 'Alena Rostova', 3200.00, 'Credit Card', 'STRIPE-CHG-99201', 'Full course fee settlement with early bird discount', '2026-01-28', NOW());

-- 9. Insert Calendar Events
INSERT INTO `calendar_events` (`id`, `event_uid`, `title`, `event_type`, `date`, `start_time`, `end_time`, `track`, `batch_code`, `instructor`, `room`, `description`, `attendance_required`, `created_at`, `updated_at`) VALUES
(1, 'EVT-2026-1001', 'React Server Components Deep Dive', 'lecture', '2026-11-26', '09:00 AM', '11:30 AM', 'Full-Stack Web Development', 'FSW-2026-A', 'Dr. Elena Rostova', 'Lab 304 - Turing Hall', 'Architectural exploration of streaming SSR and server actions.', 1, NOW(), NOW()),
(2, 'EVT-2026-1002', 'Hands-on State Management Lab', 'lab', '2026-11-27', '02:00 PM', '05:00 PM', 'Full-Stack Web Development', 'FSW-2026-A', 'Devonte Wright', 'Software Studio 2', 'Implementation of Zustand and TanStack Query state caches.', 1, NOW(), NOW()),
(3, 'EVT-2026-1003', 'Midterm Microservices Examination', 'exam', '2026-12-02', '10:00 AM', '01:00 PM', 'Full-Stack Web Development', 'FSW-2026-A', 'Dr. Elena Rostova', 'Examination Hall Alpha', 'Proctored practical coding exam on REST API resilience.', 1, NOW(), NOW());

-- 10. Insert Student Progress Telemetry
INSERT INTO `student_progress` (`id`, `student_id`, `student_code`, `track`, `batch_code`, `cumulative_gpa`, `percentile`, `syllabus_completed_credits`, `syllabus_total_credits`, `average_score`, `attendance_rate`, `cleared_milestones`, `total_milestones`, `created_at`, `updated_at`) VALUES
(1, 1, 'STU-2026-0842', 'Full-Stack Web Development', 'FSW-2026-A', 3.82, 'Top 8%', 38, 50, 91, 94, 5, 6, NOW(), NOW()),
(2, 2, 'STU-2026-0843', 'Digital Marketing', 'DMM-2026-B', 3.94, 'Top 3%', 30, 36, 95, 98, 4, 4, NOW(), NOW());

-- 11. Insert Transcripts, Milestones, Attendance & Remarks
INSERT INTO `student_transcripts` (`id`, `student_id`, `student_code`, `assessment_name`, `assessment_type`, `date`, `score`, `weight`, `grade`, `feedback`, `created_at`) VALUES
(1, 1, 'STU-2026-0842', 'Frontend Architecture & DOM Optimization', 'Practical Exam', '2026-02-18', 96, '15%', 'A+', 'Exceptional performance in browser rendering mechanics.', NOW()),
(2, 1, 'STU-2026-0842', 'TypeScript Generics & State Design', 'Code Defense', '2026-03-22', 92, '20%', 'A', 'Robust schema validations; well documented types.', NOW()),
(3, 1, 'STU-2026-0842', 'Midterm Full-Stack Monorepo Project', 'Project Capstone', '2026-04-10', 89, '25%', 'A-', 'Solid end-to-end flow with high unit test coverage.', NOW());

INSERT INTO `student_milestones` (`id`, `student_id`, `student_code`, `title`, `category`, `status`, `due_date`, `completion_date`, `score`, `evaluator`, `feedback`, `created_at`) VALUES
(1, 1, 'STU-2026-0842', 'Full-Stack Architecture Defense', 'Capstone Review', 'Completed', '2026-03-15', '2026-03-14', '94 / 100', 'Dr. Elena Rostova', 'Passed with honors. Excellent architectural clarity.', NOW()),
(2, 1, 'STU-2026-0842', 'Cloud Deployment & CI/CD Pipeline', 'DevOps Practical', 'Completed', '2026-04-01', '2026-03-30', '90 / 100', 'Devonte Wright', 'Clean Docker builds with secure environment handling.', NOW());

INSERT INTO `student_attendance` (`id`, `student_id`, `student_code`, `date`, `session_title`, `type`, `status`, `remarks`, `created_at`) VALUES
(1, 1, 'STU-2026-0842', '2026-11-25', 'Next.js App Router Architecture', 'Lecture & Lab', 'Present', 'Active classroom contribution.', NOW()),
(2, 1, 'STU-2026-0842', '2026-11-24', 'PostgreSQL Query Plan Optimization', 'Hands-on Lab', 'Present', 'Completed query tuning exercises ahead of time.', NOW());

INSERT INTO `student_remarks` (`id`, `student_id`, `student_code`, `advisor_name`, `advisor_role`, `category`, `flag`, `date`, `notes`, `created_at`) VALUES
(1, 1, 'STU-2026-0842', 'Dr. Elena Rostova', 'Lead Faculty Advisor', 'Academic Standing', 'Positive', '2026-11-18', 'Marcus demonstrates exceptional algorithmic problem solving. Recommended for peer mentoring.', NOW());

-- 12. Insert Audit Logs
INSERT INTO `audit_logs` (`id`, `log_code`, `actor_name`, `actor_email`, `actor_role`, `action`, `action_type`, `module`, `ip_address`, `user_agent`, `severity`, `status`, `summary`, `details_json`, `relative`, `created_at`) VALUES
(1, 'AUD-8921', 'Elena Rostova', 'e.rostova@bixcel.edu', 'Super Admin', 'PERMISSION_MATRIX_UPDATE', 'UPDATE', 'Access Control', '192.168.1.102', 'Chrome 128 (Windows 11 x64)', 'WARNING', 'Success', 'Modified granular action permissions for role \"Admin\" across Academic Business Modules', '{\"role\":\"Admin\",\"modified_modules\":[\"courses\",\"exams\",\"attendance\"],\"granted_actions\":[\"approve\",\"reject\"]}', '4 mins ago', NOW()),
(2, 'AUD-8920', 'Dr. Marcus Vance', 'm.vance@bixcel.edu', 'Academic Dean', 'COURSE_STATUS_PUBLISHED', 'CREATE', 'Courses & Syllabus', '192.168.1.114', 'Firefox 130 (macOS Sonoma)', 'INFO', 'Success', 'Published curriculum for \"Cloud DevOps & Kubernetes Orchestration\" (CRS-104)', '{\"course_id\":\"CRS-104\",\"title\":\"Cloud DevOps & Kubernetes Orchestration\",\"credits\":4}', '18 mins ago', NOW()),
(3, 'AUD-8919', 'Michael Sterling', 'm.sterling@bixcel.edu', 'Accountant', 'FEE_INSTALLMENT_RECONCILED', 'UPDATE', 'Finance & Ledgers', '192.168.1.120', 'Chrome 128 (Windows 11)', 'INFO', 'Success', 'Reconciled Term 1 batch tuition ledger totaling $42,500 across 28 student records', '{\"batch_id\":\"B26-FS-A\",\"amount\":\"$42,500\"}', '50 mins ago', NOW());

-- 13. Insert Notifications
INSERT INTO `notifications` (`id`, `notif_code`, `title`, `message`, `type`, `priority`, `category`, `is_read`, `action_label`, `action_link`, `icon`, `timestamp_label`, `created_at`) VALUES
(1, 'NOTIF-101', '14 Fee Installments Overdue in Batch B26-FS-A', 'Tuition installment deadline expired 48 hours ago for 14 enrolled learners. Automated collection notices queued for dispatch.', 'finance', 'critical', 'Finance & Payments', 0, 'Review Fee Ledger', '#fees', 'payments', '18 mins ago', NOW()),
(2, 'NOTIF-102', 'Room 204 Scheduling Conflict Detected for Nov 28', 'Simultaneous booking requested for Lab 204 by CS-401 (Dr. Vance) and UX-110 (Sophia Chen) at 02:00 PM.', 'timetable', 'warning', 'Timetable & Rooms', 0, 'Resolve Room Conflict', '#timetable', 'meeting_room', '1 hour ago', NOW()),
(3, 'NOTIF-103', 'IP Blacklist Action Triggered: 45.33.32.156', 'Automated rate-limiter blocked repeated brute-force authentication attempts targeting administrator portal.', 'security', 'critical', 'Security & Audit', 0, 'Inspect Security Logs', '#audit', 'gpp_bad', '2 hours ago', NOW()),
(4, 'NOTIF-104', 'Final Midterm Grades Submitted for DS-204', 'Dr. Marcus Vance published verified assessment evaluation for 32 students in Data Engineering cohort with 94% pass rate.', 'academic', 'info', 'Academic & Exams', 0, 'View Grade Spread', '#exams', 'quiz', '3 hours ago', NOW()),
(5, 'NOTIF-105', 'CodeIgniter 4 REST API Auto-Backup Finished', 'Nightly snapshot of course catalog, permission matrices, and user registry completed without discrepancies.', 'system', 'info', 'System & Maintenance', 1, 'View System Diagnostics', '#settings', 'cloud_done', 'Yesterday at 03:00 AM', NOW()),
(6, 'NOTIF-106', '6 New Student Applications Pending Dean Review', 'Undergraduate admission candidates submitted credential portfolios for Spring 2027 intake cohort.', 'admissions', 'info', 'Student Admissions', 1, 'Review Applications', '#admissions', 'how_to_reg', 'Yesterday', NOW());
