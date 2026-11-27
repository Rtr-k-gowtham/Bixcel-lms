import React, { useState, useEffect } from 'react'
import { apiService } from '../../services/api'

// Comprehensive Student Personas with Module Syllabus and Report Cards
const STUDENT_DATA = {
  gowtham: {
    id: 'gowtham',
    student_id: 'STU-2026-0843',
    reg_no: 'REG-2026-DEV-084',
    name: 'Gowtham Tamilkathir',
    email: 'gowtham@bixcel.edu',
    track: 'Full-Stack Web Development',
    course_name: 'Professional Diploma in Full-Stack Software Engineering',
    batch: 'BIX-DEV-24A',
    term: 'Semester 2 • Fall Term 2026',
    admission_date: '2026-08-15',
    attendance_pct: 96.4,
    attendance_present: 48,
    attendance_total: 50,
    gpa: 3.86,
    letter_grade: 'A+',
    standing: 'Honors Distinction',
    fee_status: 'Paid in Full',
    fee_receipt: 'RCP-2026-9041',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    faculty_advisor: 'Dr. Marcus Vance (Software Architect Lead)',
    advisor_remarks: 'Gowtham exhibits exceptional software architecture aptitude and database indexing mastery. His CodeIgniter 4 RESTful API design achieved top marks in the cohort examination.',
    dean_name: 'Dr. Marcus Vance',
    dean_title: 'Dean of Engineering & Computing',

    // Course Modules & Detailed Lesson Syllabus
    modules: [
      {
        id: 'mod-dev-01',
        code: 'MOD-DEV-01',
        title: 'Modern Frontend Architecture (React 19 & Next.js)',
        instructor: 'Dr. Marcus Vance',
        credits: 4,
        total_days: 12,
        completed_days: 9,
        progress_pct: 75,
        status: 'In Progress',
        current_grade: 'A+',
        lessons: [
          {
            day: 1,
            title: 'Modern Component Hierarchy & Props Contracts',
            status: 'completed',
            date: '2026-11-10',
            time: '09:30 AM - 12:30 PM',
            format: 'Interactive Lecture',
            objectives: 'Component decomposition, TypeScript prop interfaces, pure functions.',
            materials: 'Lecture Slides & Code Sandbox',
          },
          {
            day: 2,
            title: 'Advanced State Management & Context API Patterns',
            status: 'completed',
            date: '2026-11-12',
            time: '09:30 AM - 12:30 PM',
            format: 'Lab Practicum',
            objectives: 'Reducer patterns, avoid unnecessary re-renders, Context memoization.',
            materials: 'Lab Repository & Exercise 2',
          },
          {
            day: 8,
            title: 'Server-Side Rendering (SSR) & Streaming Suspense',
            status: 'completed',
            date: '2026-11-24',
            time: '09:30 AM - 12:30 PM',
            format: 'Hands-on Coding',
            objectives: 'Next.js App Router, React Server Components boundaries, streaming HTML.',
            materials: 'SSR Architecture Whitepaper',
          },
          {
            day: 9,
            title: 'React 19 Server Actions & Optimistic UI Updates',
            status: 'current',
            date: '2026-11-26 (Today)',
            time: '09:30 AM - 12:30 PM',
            format: 'Live Lab Session',
            location: 'Software Lab Room 302',
            objectives: 'useOptimistic, useActionState, instant form submission feedback without spinners.',
            materials: 'Live Stream Link & Starter Repo',
            live_link: 'https://meet.bixcel.edu/dev-24a',
          },
          {
            day: 10,
            title: 'Client-Side Caching, RTK Query & Mutation Invalidation',
            status: 'upcoming',
            date: '2026-11-28',
            time: '09:30 AM - 12:30 PM',
            format: 'Interactive Lecture',
            location: 'Software Lab Room 302',
            objectives: 'Normalized caching, tag invalidation, optimistic query cache updates.',
            materials: 'RTK Query Slide Deck',
          },
          {
            day: 11,
            title: 'Enterprise Micro-Frontend Architecture & Module Federation',
            status: 'upcoming',
            date: '2026-12-01',
            time: '09:30 AM - 12:30 PM',
            format: 'System Design Seminar',
            location: 'Main Auditorium Hall B',
            objectives: 'Independent deployment pipelines, runtime module sharing, version isolation.',
            materials: 'Micro-frontend Architecture PDF',
          },
          {
            day: 12,
            title: 'Frontend Production Performance Profiling & Lighthouse 100',
            status: 'upcoming',
            date: '2026-12-03',
            time: '09:30 AM - 12:30 PM',
            format: 'Practical Audit Lab',
            location: 'Computer Center 1',
            objectives: 'Core Web Vitals (LCP, INP, CLS), bundle size budget, code splitting.',
            materials: 'Audit Checklist & Tools Guide',
          },
        ],
      },
      {
        id: 'mod-dev-02',
        code: 'MOD-DEV-02',
        title: 'Backend Systems & CodeIgniter 4 REST API Engineering',
        instructor: 'Elena Rostova',
        credits: 4,
        total_days: 10,
        completed_days: 8,
        progress_pct: 80,
        status: 'In Progress',
        current_grade: 'A',
        lessons: [
          {
            day: 1,
            title: 'REST Architecture, Routing & HTTP Verbs Standards',
            status: 'completed',
            date: '2026-11-05',
            time: '02:00 PM - 04:30 PM',
            format: 'Architecture Lecture',
            objectives: 'Idempotency, resource URI naming, HTTP status codes.',
            materials: 'REST Guidelines PDF',
          },
          {
            day: 8,
            title: 'JWT Authentication & Role-Based Access Control Filters',
            status: 'completed',
            date: '2026-11-25',
            time: '02:00 PM - 04:30 PM',
            format: 'Security Workshop',
            objectives: 'Token signing, refresh token rotation, CI4 Auth Filters.',
            materials: 'RBAC Security Checklist',
          },
          {
            day: 9,
            title: 'Database Transactions, ACID Guarantees & Repository Pattern',
            status: 'upcoming',
            date: '2026-11-29',
            time: '02:00 PM - 04:30 PM',
            format: 'Live Lab Session',
            location: 'Computer Center Hall B',
            objectives: 'Isolation levels, rollbacks on error, decoupling business logic from models.',
            materials: 'Transaction Architecture Repo',
          },
          {
            day: 10,
            title: 'API Rate Limiting, CORS & Swagger OpenAPI 3.0 Documentation',
            status: 'upcoming',
            date: '2026-12-02',
            time: '02:00 PM - 04:30 PM',
            format: 'Lab Practicum',
            location: 'Computer Center Hall B',
            objectives: 'Redis token bucket rate limiter, automated swagger.json generation.',
            materials: 'Swagger Setup Instructions',
          },
        ],
      },
      {
        id: 'mod-dev-03',
        code: 'MOD-DEV-03',
        title: 'PostgreSQL Database Indexing & Query Optimization',
        instructor: 'Dr. Marcus Vance',
        credits: 3,
        total_days: 8,
        completed_days: 8,
        progress_pct: 100,
        status: 'Completed',
        current_grade: 'A+',
        lessons: [
          {
            day: 7,
            title: 'B-Tree, GIN & GiST Indexing Strategies',
            status: 'completed',
            date: '2026-11-18',
            time: '10:00 AM - 01:00 PM',
            format: 'Database Lab',
            objectives: 'Composite indexes, partial indexing, JSONB full-text search.',
            materials: 'Indexing Lab Solutions',
          },
          {
            day: 8,
            title: 'Query Plan Analysis with EXPLAIN ANALYZE & Buffer Pools',
            status: 'completed',
            date: '2026-11-20',
            time: '10:00 AM - 01:00 PM',
            format: 'Performance Lab',
            objectives: 'Eliminate sequential table scans, optimize joins, memory tuning.',
            materials: 'Query Tuning Cheatsheet',
          },
        ],
      },
      {
        id: 'mod-dev-04',
        code: 'MOD-DEV-04',
        title: 'Containerization, Docker & CI/CD Cloud Pipelines',
        instructor: 'Alan Wright',
        credits: 3,
        total_days: 6,
        completed_days: 1,
        progress_pct: 16,
        status: 'Upcoming',
        current_grade: 'In Progress',
        lessons: [
          {
            day: 1,
            title: 'Multi-Stage Dockerfiles for Production Node & PHP',
            status: 'completed',
            date: '2026-11-22',
            time: '02:00 PM - 05:00 PM',
            format: 'Hands-on Lab',
            objectives: 'Slim base images, non-root user execution, layer caching.',
            materials: 'Production Dockerfile Templates',
          },
          {
            day: 2,
            title: 'Docker Compose Orchestration & Volume Networking',
            status: 'upcoming',
            date: '2026-12-04',
            time: '02:00 PM - 05:00 PM',
            format: 'Hands-on Lab',
            location: 'Cloud Computing Lab 4',
            objectives: 'Multi-container backend + database + frontend networks, secrets management.',
            materials: 'Compose Spec Reference',
          },
          {
            day: 3,
            title: 'GitHub Actions Automated Testing & Production Deployment',
            status: 'upcoming',
            date: '2026-12-06',
            time: '02:00 PM - 05:00 PM',
            format: 'CI/CD Lab',
            location: 'Cloud Computing Lab 4',
            objectives: 'Continuous integration workflows, SSH deploy keys, zero-downtime reloads.',
            materials: 'CI/CD Pipeline YAML Guide',
          },
        ],
      },
    ],

    // Report Card Subject Grades Table
    report_card_subjects: [
      {
        code: 'MOD-DEV-01',
        title: 'Modern Frontend Architecture (React 19)',
        credits: 4,
        attendance_pct: 98,
        practical_score: 96,
        exam_score: 94,
        total_score: 95,
        grade: 'A+',
        grade_points: 4.0,
        status: 'Passed (Distinction)',
      },
      {
        code: 'MOD-DEV-02',
        title: 'Backend Systems & CodeIgniter 4 REST API',
        credits: 4,
        attendance_pct: 95,
        practical_score: 92,
        exam_score: 90,
        total_score: 91,
        grade: 'A',
        grade_points: 3.8,
        status: 'Passed',
      },
      {
        code: 'MOD-DEV-03',
        title: 'PostgreSQL Database Indexing & Query Tuning',
        credits: 3,
        attendance_pct: 100,
        practical_score: 98,
        exam_score: 96,
        total_score: 97,
        grade: 'A+',
        grade_points: 4.0,
        status: 'Passed (Distinction)',
      },
      {
        code: 'MOD-DEV-04',
        title: 'Containerization, Docker & CI/CD Pipelines',
        credits: 3,
        attendance_pct: 92,
        practical_score: 88,
        exam_score: 86,
        total_score: 87,
        grade: 'A-',
        grade_points: 3.6,
        status: 'In Progress',
      },
      {
        code: 'CORE-ARCH-05',
        title: 'Software Design Patterns & Clean Code',
        credits: 2,
        attendance_pct: 97,
        practical_score: 94,
        exam_score: 92,
        total_score: 93,
        grade: 'A',
        grade_points: 3.9,
        status: 'Passed',
      },
    ],
  },

  marcus: {
    id: 'marcus',
    student_id: 'STU-2026-0842',
    reg_no: 'REG-2026-MKT-042',
    name: 'Marcus Vance',
    email: 'student@bixcel.edu',
    track: 'Digital Marketing & Growth',
    course_name: 'Executive Masterclass in Performance Marketing & SEO',
    batch: 'BIX-MKT-26B',
    term: 'Fall Term 2026 • Term 1',
    admission_date: '2026-09-01',
    attendance_pct: 98.0,
    attendance_present: 49,
    attendance_total: 50,
    gpa: 3.92,
    letter_grade: 'A+',
    standing: 'Summa Cum Laude',
    fee_status: 'Paid in Full',
    fee_receipt: 'RCP-2026-9043',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    faculty_advisor: 'Sophia Chen (Chief Growth Officer)',
    advisor_remarks: 'Marcus demonstrated stellar performance in attribution modeling and SEO keyword intent clustering. Recognized with top Honors in Digital Growth.',
    dean_name: 'Elena Rostova',
    dean_title: 'Dean of Business & Marketing Programs',

    modules: [
      {
        id: 'mod-mkt-01',
        code: 'MOD-DM-01',
        title: 'Technical SEO & Keyword Clustering Architecture',
        instructor: 'Sophia Chen',
        credits: 4,
        total_days: 10,
        completed_days: 8,
        progress_pct: 80,
        status: 'In Progress',
        current_grade: 'A+',
        lessons: [
          {
            day: 7,
            title: 'Technical Schema Markup & Core Web Vitals Auditing',
            status: 'completed',
            date: '2026-11-22',
            time: '11:00 AM - 01:30 PM',
            format: 'Audit Practicum',
            objectives: 'JSON-LD structured data, crawl budget optimization.',
            materials: 'Schema Audit Template',
          },
          {
            day: 8,
            title: 'Programmatic SEO & Content Matrix Generation',
            status: 'current',
            date: '2026-11-26 (Today)',
            time: '11:00 AM - 01:30 PM',
            format: 'Live Workshop',
            location: 'Marketing Growth Lab 101',
            objectives: 'Scaling long-tail landing pages using dynamic datasets.',
            materials: 'Spreadsheet Template & Python Scripts',
            live_link: 'https://meet.bixcel.edu/mkt-26b',
          },
          {
            day: 9,
            title: 'Backlink Velocity, Digital PR & Outreach Automation',
            status: 'upcoming',
            date: '2026-11-28',
            time: '11:00 AM - 01:30 PM',
            format: 'Case Study Seminar',
            location: 'Marketing Growth Lab 101',
            objectives: 'HARO pitches, unlinked brand mentions, high-DR outreach.',
            materials: 'PR Outreach Pitch Deck',
          },
          {
            day: 10,
            title: 'Enterprise Rank Tracking & Revenue Attribution Analytics',
            status: 'upcoming',
            date: '2026-11-30',
            time: '11:00 AM - 01:30 PM',
            format: 'Analytics Lab',
            location: 'Marketing Growth Lab 101',
            objectives: 'GA4 Multi-touch attribution, Looker Studio reporting dashboards.',
            materials: 'Looker Studio Dashboard Template',
          },
        ],
      },
      {
        id: 'mod-mkt-02',
        code: 'MOD-DM-02',
        title: 'Meta & Google Search Ads Performance Funnels',
        instructor: 'Marcus Vance Sr.',
        credits: 4,
        total_days: 12,
        completed_days: 12,
        progress_pct: 100,
        status: 'Completed',
        current_grade: 'A+',
        lessons: [
          {
            day: 11,
            title: 'Target CPA & Value-Based Smart Bidding Algorithms',
            status: 'completed',
            date: '2026-11-15',
            time: '02:00 PM - 04:30 PM',
            format: 'Live Ad Lab',
            objectives: 'Conversion tracking pixel setup, offline conversion import.',
            materials: 'Ad Setup Checklist',
          },
          {
            day: 12,
            title: 'Creative Fatigue Elimination & High-Velocity A/B Testing',
            status: 'completed',
            date: '2026-11-18',
            time: '02:00 PM - 04:30 PM',
            format: 'Lab Practicum',
            objectives: 'UGC creative frameworks, hook testing, statistical significance.',
            materials: 'Testing Matrix Spreadsheet',
          },
        ],
      },
    ],

    report_card_subjects: [
      {
        code: 'MOD-DM-01',
        title: 'Technical SEO & Keyword Clustering',
        credits: 4,
        attendance_pct: 100,
        practical_score: 97,
        exam_score: 95,
        total_score: 96,
        grade: 'A+',
        grade_points: 4.0,
        status: 'Passed (Distinction)',
      },
      {
        code: 'MOD-DM-02',
        title: 'Meta & Google Performance Funnels',
        credits: 4,
        attendance_pct: 98,
        practical_score: 94,
        exam_score: 92,
        total_score: 93,
        grade: 'A',
        grade_points: 3.9,
        status: 'Passed (Distinction)',
      },
      {
        code: 'MOD-DM-03',
        title: 'Content Strategy & Organic Distribution',
        credits: 3,
        attendance_pct: 96,
        practical_score: 91,
        exam_score: 89,
        total_score: 90,
        grade: 'A',
        grade_points: 3.8,
        status: 'Passed',
      },
    ],
  },
}

export function StudentDashboard({ currentUser, onNavigate }) {
  // Select active student profile
  const [activePersonaKey, setActivePersonaKey] = useState(() => {
    if (currentUser?.email) {
      if (currentUser.email.toLowerCase().includes('marcus') || currentUser.email.toLowerCase().includes('student@bixcel.edu')) {
        return 'marcus'
      }
    }
    return 'gowtham'
  })

  const student = STUDENT_DATA[activePersonaKey] || STUDENT_DATA.gowtham

  // Active Selected Module for Syllabus View
  const [selectedModuleId, setSelectedModuleId] = useState(student.modules[0]?.id || '')

  // Filter lessons in module: 'all' | 'upcoming' | 'completed'
  const [lessonFilter, setLessonFilter] = useState('upcoming') // default to user request: UPCOMING LESSONS

  // Dashboard Main View Tab: 'syllabus' (Upcoming Lessons & Syllabus) | 'reportcard' (Academic Report Card) | 'both'
  const [activeTab, setActiveTab] = useState('syllabus') // 'syllabus' | 'reportcard' | 'both'

  // Sync selected module when student persona switches
  useEffect(() => {
    if (student.modules && student.modules.length > 0) {
      setSelectedModuleId(student.modules[0].id)
    }
  }, [activePersonaKey])

  const selectedModule = student.modules.find((m) => m.id === selectedModuleId) || student.modules[0]

  // Filtered lessons for selected module
  const displayedLessons = (selectedModule?.lessons || []).filter((l) => {
    if (lessonFilter === 'upcoming') return l.status === 'upcoming' || l.status === 'current'
    if (lessonFilter === 'completed') return l.status === 'completed'
    return true
  })

  // Upcoming lessons count across all modules
  const totalUpcomingCount = student.modules.reduce((acc, m) => {
    return acc + m.lessons.filter((l) => l.status === 'upcoming' || l.status === 'current').length
  }, 0)

  return (
    <div className="flex flex-col gap-4 w-full animate-in fade-in duration-200">
      {/* 1. STUDENT PROFILE CARD (STUDENT PROFIRL) */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-4 rounded-xl shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Left: Avatar & Identity Details */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="relative shrink-0">
            <img
              src={student.avatar}
              alt={student.name}
              className="w-16 h-16 rounded-full object-cover ring-2 ring-light-primary/40 dark:ring-dark-primary/40 shadow-xs"
            />
            <span
              className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-dark-surface-bright bg-emerald-500"
              title="Active Enrolled Student"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-title text-base sm:text-lg font-bold text-light-on-surface dark:text-dark-on-surface">
                {student.name}
              </h1>
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-light-primary-tint dark:bg-dark-primary-tint text-light-on-primary-tint dark:text-dark-on-primary-tint border border-light-primary/20">
                {student.student_id}
              </span>
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                {student.batch}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{student.standing} • GPA {student.gpa}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
              <span className="font-medium text-light-on-surface dark:text-dark-on-surface">
                {student.course_name}
              </span>
              <span>•</span>
              <span className="font-mono">{student.reg_no}</span>
              <span>•</span>
              <span className="font-medium text-emerald-700 dark:text-emerald-400">
                Attendance: {student.attendance_pct}% ({student.attendance_present}/{student.attendance_total} Days)
              </span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {student.fee_status} ({student.fee_receipt})
              </span>
            </div>
          </div>
        </div>

        {/* Right: Persona Switcher & Print / Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start xl:self-center">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container">
            <span className="material-symbols-outlined text-[16px] text-light-outline">account_circle</span>
            <select
              value={activePersonaKey}
              onChange={(e) => setActivePersonaKey(e.target.value)}
              className="bg-transparent text-xs font-semibold text-light-on-surface dark:text-dark-on-surface focus:outline-none cursor-pointer"
              title="Switch enrolled student persona"
            >
              <option value="gowtham">Gowtham Tamilkathir (Full-Stack Dev • BIX-DEV-24A)</option>
              <option value="marcus">Marcus Vance (Digital Marketing • BIX-MKT-26B)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-lowest dark:bg-dark-surface-bright text-light-on-surface dark:text-dark-on-surface text-xs font-semibold hover:bg-light-surface-container-low transition-colors cursor-pointer"
            title="Print Official Document"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
            <span>Print Report</span>
          </button>
        </div>
      </section>

      {/* 2. DEDICATED VIEW NAVIGATION TABS (Strictly: Upcoming Lessons & Syllabus vs Academic Report Card) */}
      <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-2 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {/* Tab 1: Upcoming Lessons & Syllabus */}
          <button
            type="button"
            onClick={() => setActiveTab('syllabus')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'syllabus'
                ? 'bg-light-primary text-light-on-primary shadow-xs'
                : 'text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">menu_book</span>
            <span>Upcoming Lessons &amp; Syllabus (Module / Course)</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'syllabus' ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              {totalUpcomingCount} Upcoming
            </span>
          </button>

          {/* Tab 2: Student Report Card */}
          <button
            type="button"
            onClick={() => setActiveTab('reportcard')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'reportcard'
                ? 'bg-light-primary text-light-on-primary shadow-xs'
                : 'text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
            <span>Official Academic Report Card</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
              GPA {student.gpa}
            </span>
          </button>

          {/* Tab 3: Combined Full View */}
          <button
            type="button"
            onClick={() => setActiveTab('both')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'both'
                ? 'bg-light-primary text-light-on-primary shadow-xs'
                : 'text-light-on-surface-variant hover:text-light-on-surface hover:bg-light-surface-container-low'
            }`}
            title="Display both Upcoming Lessons & Syllabus and Report Card together"
          >
            <span className="material-symbols-outlined text-[16px]">splitscreen</span>
            <span>Combined View</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-light-on-surface-variant pr-2">
          <span className="font-mono font-medium">{student.batch}</span>
          <span>•</span>
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {student.term}
          </span>
        </div>
      </section>

      {/* 3. SECTION A: UPCOMING LESSONS & SYLLABUS (BASED ON THE MODULE OR COURSE) */}
      {(activeTab === 'syllabus' || activeTab === 'both') && (
        <section className="flex flex-col gap-3">
          {/* Module Selector & Header Banner */}
          <div className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-4 rounded-xl shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-light-primary text-[20px]">import_contacts</span>
                <h2 className="font-title text-sm sm:text-base font-bold text-light-on-surface dark:text-dark-on-surface">
                  Course Syllabus &amp; Upcoming Lessons
                </h2>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                  {student.track}
                </span>
              </div>
              <p className="text-xs text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Select your enrolled course module to view upcoming daily lessons, live classroom links, and syllabus objectives.
              </p>
            </div>

            {/* Module Dropdown Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-light-on-surface-variant shrink-0">
                Select Module:
              </span>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-light-outline-variant dark:border-dark-outline-variant bg-light-surface-container-low dark:bg-dark-surface-container text-xs font-bold text-light-on-surface dark:text-dark-on-surface focus:outline-none cursor-pointer max-w-xs sm:max-w-md"
              >
                {student.modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.code}: {m.title} ({m.progress_pct}% Done)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Module Metadata Card */}
          {selectedModule && (
            <div className="bg-gradient-to-r from-light-primary-tint/40 to-light-surface-container-lowest dark:from-dark-primary-tint/30 dark:to-dark-surface-bright border border-light-primary/30 dark:border-dark-primary/30 p-4 rounded-xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-light-primary dark:text-dark-primary">
                    {selectedModule.code}
                  </span>
                  <span className="text-xs text-light-on-surface-variant">•</span>
                  <h3 className="font-title text-sm sm:text-base font-bold text-light-on-surface dark:text-dark-on-surface">
                    {selectedModule.title}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-light-on-surface-variant">
                  <span>Instructor: <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedModule.instructor}</strong></span>
                  <span>•</span>
                  <span>Credits: <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedModule.credits} Credits</strong></span>
                  <span>•</span>
                  <span>Duration: <strong className="text-light-on-surface dark:text-dark-on-surface">{selectedModule.total_days} Instructional Days</strong></span>
                  <span>•</span>
                  <span>Status: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{selectedModule.status} ({selectedModule.current_grade})</strong></span>
                </div>
              </div>

              {/* Progress Bar & Filter Pills */}
              <div className="flex flex-col gap-2 min-w-[220px]">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-light-on-surface-variant font-medium">Syllabus Completion</span>
                  <span className="font-bold font-mono text-light-primary dark:text-dark-primary">
                    {selectedModule.progress_pct}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-light-primary dark:bg-dark-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${selectedModule.progress_pct}%` }}
                  />
                </div>
                {/* Filter Pills for Lessons */}
                <div className="flex items-center gap-1.5 self-end mt-1">
                  <button
                    type="button"
                    onClick={() => setLessonFilter('upcoming')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                      lessonFilter === 'upcoming'
                        ? 'bg-light-primary text-light-on-primary'
                        : 'bg-slate-100 dark:bg-slate-800 text-light-on-surface-variant'
                    }`}
                  >
                    Upcoming Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setLessonFilter('all')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                      lessonFilter === 'all'
                        ? 'bg-light-primary text-light-on-primary'
                        : 'bg-slate-100 dark:bg-slate-800 text-light-on-surface-variant'
                    }`}
                  >
                    All Lessons
                  </button>
                  <button
                    type="button"
                    onClick={() => setLessonFilter('completed')}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                      lessonFilter === 'completed'
                        ? 'bg-light-primary text-light-on-primary'
                        : 'bg-slate-100 dark:bg-slate-800 text-light-on-surface-variant'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lesson Syllabus Cards List */}
          <div className="space-y-3">
            {displayedLessons.length === 0 ? (
              <div className="p-8 rounded-xl bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant text-center text-xs text-light-on-surface-variant">
                <span className="material-symbols-outlined text-[32px] text-light-outline block mb-1">
                  task_alt
                </span>
                No lessons found matching filter &quot;{lessonFilter}&quot;.
              </div>
            ) : (
              displayedLessons.map((lesson) => {
                const isUpcoming = lesson.status === 'upcoming'
                const isCurrent = lesson.status === 'current'
                const isCompleted = lesson.status === 'completed'

                return (
                  <article
                    key={lesson.day}
                    className={`p-4 rounded-xl border transition-all shadow-xs flex flex-col gap-3 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-purple-500/10 via-light-surface-container-lowest to-light-surface-container-lowest dark:from-purple-950/40 dark:via-dark-surface-bright dark:to-dark-surface-bright border-purple-400 dark:border-purple-800 ring-1 ring-purple-400/40'
                        : isUpcoming
                        ? 'bg-light-surface-container-lowest dark:bg-dark-surface-bright border-blue-200 dark:border-blue-900/60 hover:border-blue-400'
                        : 'bg-light-surface-container-lowest/70 dark:bg-dark-surface-bright/70 border-light-outline-variant dark:border-dark-outline-variant opacity-85'
                    }`}
                  >
                    {/* Top Row: Day badge, Status Badge & Schedule */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-light-outline-variant/60 dark:border-dark-outline-variant/60 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-light-surface-container dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface border border-light-outline-variant/80">
                          Day {lesson.day} of {selectedModule.total_days}
                        </span>

                        {isCurrent && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 font-bold text-xs border border-purple-300 dark:border-purple-800">
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                            <span>TODAY&apos;S ACTIVE LESSON</span>
                          </span>
                        )}

                        {isUpcoming && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-300 dark:border-blue-800">
                            <span className="material-symbols-outlined text-[14px]">event</span>
                            <span>UPCOMING LESSON</span>
                          </span>
                        )}

                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px] border border-emerald-300 dark:border-emerald-800">
                            <span className="material-symbols-outlined text-[13px]">check_circle</span>
                            <span>Completed</span>
                          </span>
                        )}

                        <span className="text-xs font-semibold text-light-on-surface-variant font-mono">
                          • {lesson.format}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-bold text-light-on-surface dark:text-dark-on-surface font-mono">
                          📅 {lesson.date}
                        </span>
                        <span className="font-mono text-light-primary dark:text-dark-primary font-semibold">
                          ⏰ {lesson.time}
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: Lesson Title & Objectives */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex flex-col gap-1.5 max-w-3xl">
                        <h4 className="font-title text-sm sm:text-base font-bold text-light-on-surface dark:text-dark-on-surface">
                          {lesson.title}
                        </h4>
                        <div className="p-3 rounded-lg bg-light-surface-container-low/60 dark:bg-dark-surface-container/60 border border-light-outline-variant/60 text-xs">
                          <span className="font-bold text-light-on-surface dark:text-dark-on-surface block mb-0.5">
                            Syllabus Objectives &amp; Topics:
                          </span>
                          <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant leading-relaxed">
                            {lesson.objectives}
                          </p>
                        </div>
                      </div>

                      {/* Right Action: Join Classroom or Download Materials */}
                      <div className="flex flex-col items-end gap-2 shrink-0 self-end sm:self-center">
                        {lesson.live_link ? (
                          <a
                            href={lesson.live_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">videocam</span>
                            <span>Join Live Classroom</span>
                          </a>
                        ) : isUpcoming ? (
                          <button
                            type="button"
                            onClick={() => alert(`Pre-session notes for "${lesson.title}" available 24 hours prior to class.`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-light-outline-variant bg-light-surface-container-lowest text-xs font-semibold hover:bg-light-surface-container-low transition-colors"
                          >
                            <span className="material-symbols-outlined text-[15px] text-light-primary">download</span>
                            <span>Lesson Handout</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-200">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            <span>Attendance Verified</span>
                          </span>
                        )}

                        <span className="text-[11px] text-light-on-surface-variant font-mono">
                          📁 {lesson.materials}
                        </span>
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </section>
      )}

      {/* 4. SECTION B: OFFICIAL STUDENT REPORT CARD (REPORCAD) */}
      {(activeTab === 'reportcard' || activeTab === 'both') && (
        <section className="bg-light-surface-container-lowest dark:bg-dark-surface-bright border border-light-outline-variant dark:border-dark-outline-variant p-5 sm:p-6 rounded-xl shadow-md flex flex-col gap-5">
          {/* Institutional Header & Report Card Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-outline-variant/80 dark:border-dark-outline-variant/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-light-primary text-light-on-primary flex items-center justify-center font-bold text-xl shadow-xs">
                BX
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-light-primary dark:text-dark-primary block">
                  OFFICIAL INSTITUTIONAL TRANSCRIPT &amp; ASSESSMENT REPORT
                </span>
                <h2 className="font-title text-base sm:text-lg font-bold text-light-on-surface dark:text-dark-on-surface">
                  Student Academic Report Card
                </h2>
                <span className="text-xs text-light-on-surface-variant">
                  Bixcel Learning Management System • Academic Term: {student.term}
                </span>
              </div>
            </div>

            {/* Standing Pill */}
            <div className="flex flex-col items-end gap-1">
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-300 dark:border-emerald-800">
                {student.standing} • Grade {student.letter_grade}
              </span>
              <span className="text-[11px] text-light-on-surface-variant font-mono">
                Date Issued: November 26, 2026
              </span>
            </div>
          </div>

          {/* Student & Program Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-light-surface-container-low/60 dark:bg-dark-surface-container/60 border border-light-outline-variant/60 text-xs">
            <div>
              <span className="text-light-on-surface-variant block text-[11px]">Student Full Name</span>
              <strong className="text-light-on-surface dark:text-dark-on-surface font-title text-xs sm:text-sm">
                {student.name}
              </strong>
            </div>
            <div>
              <span className="text-light-on-surface-variant block text-[11px]">Student ID / Reg No</span>
              <strong className="text-light-on-surface dark:text-dark-on-surface font-mono">
                {student.student_id} / {student.reg_no}
              </strong>
            </div>
            <div>
              <span className="text-light-on-surface-variant block text-[11px]">Enrolled Cohort</span>
              <strong className="text-light-on-surface dark:text-dark-on-surface font-mono">
                {student.batch} ({student.track})
              </strong>
            </div>
            <div>
              <span className="text-light-on-surface-variant block text-[11px]">Cumulative GPA</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-headline text-sm font-bold">
                {student.gpa} / 4.00 ({student.letter_grade})
              </strong>
            </div>
          </div>

          {/* Core Report Card Table: Subject / Module Grades */}
          <div className="overflow-x-auto rounded-lg border border-light-outline-variant dark:border-dark-outline-variant">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-light-surface-container-low dark:bg-dark-surface-container border-b border-light-outline-variant dark:border-dark-outline-variant text-[11px] font-bold text-light-on-surface-variant uppercase tracking-wider">
                <tr>
                  <th className="p-3">Module Code &amp; Title</th>
                  <th className="p-3 text-center">Credits</th>
                  <th className="p-3 text-center">Attendance</th>
                  <th className="p-3 text-center">Practical (100)</th>
                  <th className="p-3 text-center">Exam (100)</th>
                  <th className="p-3 text-center">Total Score</th>
                  <th className="p-3 text-center">Grade</th>
                  <th className="p-3 text-center">Grade Pt</th>
                  <th className="p-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-outline-variant/60 dark:divide-dark-outline-variant/60 bg-light-surface-container-lowest dark:bg-dark-surface-bright">
                {student.report_card_subjects.map((subj) => (
                  <tr key={subj.code} className="hover:bg-light-surface-container-low/40 transition-colors">
                    <td className="p-3 font-semibold text-light-on-surface dark:text-dark-on-surface">
                      <span className="font-mono text-light-primary dark:text-dark-primary mr-1.5 font-bold">
                        {subj.code}
                      </span>
                      <span>{subj.title}</span>
                    </td>
                    <td className="p-3 text-center font-mono">{subj.credits}</td>
                    <td className="p-3 text-center font-mono font-medium text-emerald-700 dark:text-emerald-400">
                      {subj.attendance_pct}%
                    </td>
                    <td className="p-3 text-center font-mono">{subj.practical_score}</td>
                    <td className="p-3 text-center font-mono">{subj.exam_score}</td>
                    <td className="p-3 text-center font-mono font-bold text-light-on-surface dark:text-dark-on-surface">
                      {subj.total_score}%
                    </td>
                    <td className="p-3 text-center">
                      <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                        {subj.grade}
                      </span>
                    </td>
                    <td className="p-3 text-center font-mono font-bold">{subj.grade_points.toFixed(1)}</td>
                    <td className="p-3 text-right">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        <span>{subj.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Academic Dean & Advisor Remarks */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex flex-col gap-1 max-w-xl">
              <span className="font-bold text-light-on-surface dark:text-dark-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-light-primary">recommend</span>
                <span>Faculty Advisor &amp; Dean Assessment Remarks:</span>
              </span>
              <p className="text-light-on-surface-variant dark:text-dark-on-surface-variant italic">
                &quot;{student.advisor_remarks}&quot;
              </p>
            </div>

            {/* Signature & Seal */}
            <div className="flex flex-col items-end text-right shrink-0 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-2 sm:pt-0 sm:pl-4">
              <span className="font-serif italic text-base font-bold text-light-on-surface dark:text-dark-on-surface">
                {student.dean_name}
              </span>
              <span className="text-[11px] text-light-on-surface-variant">
                {student.dean_title}
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                ✔ Digitally Verified &amp; Signed
              </span>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default StudentDashboard
