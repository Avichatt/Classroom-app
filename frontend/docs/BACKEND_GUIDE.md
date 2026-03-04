# ⚙️ Backend Guide — Google Classroom Clone

## Overview

This guide covers the **full backend architecture** needed to power the Google Classroom clone. The recommended stack is **Node.js + Express + TypeScript + PostgreSQL + Redis + AWS S3**.

---

## 🏗️ Recommended Architecture

```
┌─────────────┐    ┌──────────────┐    ┌───────────────┐
│   Frontend   │───▶│   API Server  │───▶│  PostgreSQL    │
│  (React SPA) │    │  (Express/TS) │    │  (Primary DB)  │
└─────────────┘    └──────┬───────┘    └───────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
  ┌──────────┐    ┌──────────────┐    ┌───────────┐
  │  Redis    │    │   AWS S3      │    │  Socket.io │
  │ (Cache +  │    │  (File Store) │    │ (Real-time)│
  │  Sessions)│    └──────────────┘    └───────────┘
  └──────────┘
        │
        ▼
  ┌──────────────┐
  │  Bull Queue   │
  │ (Background   │
  │  jobs)        │
  └──────────────┘
```

---

## 📁 Backend Project Structure

```
server/
├── src/
│   ├── index.ts                    # Express app entry point
│   ├── app.ts                      # Express app setup + middleware
│   ├── config/
│   │   ├── database.ts             # PostgreSQL connection (TypeORM/Prisma)
│   │   ├── redis.ts                # Redis connection
│   │   ├── s3.ts                   # AWS S3 client
│   │   ├── env.ts                  # Environment variable validation
│   │   └── socket.ts               # Socket.io setup
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts   # POST /login, /signup, /logout, /refresh
│   │   │   ├── auth.service.ts      # Business logic: hash, verify, JWT
│   │   │   ├── auth.middleware.ts   # JWT verification middleware
│   │   │   ├── auth.routes.ts       # Router definitions
│   │   │   └── auth.dto.ts          # Input validation schemas (Zod)
│   │   │
│   │   ├── users/
│   │   │   ├── user.controller.ts   # GET /users, PATCH /users/:id, DELETE
│   │   │   ├── user.service.ts      # User CRUD, bulk import logic
│   │   │   ├── user.entity.ts       # User model/entity
│   │   │   └── user.routes.ts
│   │   │
│   │   ├── classes/
│   │   │   ├── class.controller.ts  # CRUD classes, join/leave
│   │   │   ├── class.service.ts
│   │   │   ├── class.entity.ts
│   │   │   └── class.routes.ts
│   │   │
│   │   ├── assignments/
│   │   │   ├── assignment.controller.ts # CRUD assignments
│   │   │   ├── assignment.service.ts
│   │   │   ├── assignment.entity.ts
│   │   │   └── assignment.routes.ts
│   │   │
│   │   ├── submissions/
│   │   │   ├── submission.controller.ts # Submit, list, grade
│   │   │   ├── submission.service.ts
│   │   │   ├── submission.entity.ts
│   │   │   └── submission.routes.ts
│   │   │
│   │   ├── grades/
│   │   │   ├── grade.controller.ts   # Grade assignments, get gradebook
│   │   │   ├── grade.service.ts
│   │   │   ├── grade.entity.ts
│   │   │   └── grade.routes.ts
│   │   │
│   │   ├── cohorts/
│   │   │   ├── cohort.controller.ts  # CRUD cohorts
│   │   │   ├── cohort.service.ts
│   │   │   ├── cohort.entity.ts
│   │   │   └── cohort.routes.ts
│   │   │
│   │   ├── notifications/
│   │   │   ├── notification.controller.ts
│   │   │   ├── notification.service.ts # Create + push via Socket.io
│   │   │   ├── notification.entity.ts
│   │   │   └── notification.routes.ts
│   │   │
│   │   ├── uploads/
│   │   │   ├── upload.controller.ts  # Presigned URLs, file validation
│   │   │   ├── upload.service.ts
│   │   │   └── upload.routes.ts
│   │   │
│   │   ├── analytics/
│   │   │   ├── analytics.controller.ts # System metrics, trends, reports
│   │   │   ├── analytics.service.ts
│   │   │   └── analytics.routes.ts
│   │   │
│   │   ├── audit/
│   │   │   ├── audit.controller.ts   # Audit log viewer
│   │   │   ├── audit.service.ts      # Log actions automatically
│   │   │   ├── audit.entity.ts
│   │   │   ├── audit.middleware.ts   # Auto-log middleware
│   │   │   └── audit.routes.ts
│   │   │
│   │   ├── plagiarism/
│   │   │   ├── plagiarism.controller.ts
│   │   │   ├── plagiarism.service.ts  # Compare submissions, flag
│   │   │   └── plagiarism.routes.ts
│   │   │
│   │   └── admin/
│   │       ├── admin.controller.ts   # System config, backups, risk
│   │       ├── admin.service.ts
│   │       └── admin.routes.ts
│   │
│   ├── jobs/                        # Background job processors
│   │   ├── emailJob.ts              # Send email notifications
│   │   ├── plagiarismJob.ts         # Async plagiarism scanning
│   │   ├── reminderJob.ts           # Deadline reminder scheduling
│   │   └── backupJob.ts            # Automated backup scheduler
│   │
│   ├── middleware/
│   │   ├── errorHandler.ts          # Global error handler
│   │   ├── rateLimiter.ts           # Rate limiting
│   │   ├── cors.ts                  # CORS configuration
│   │   ├── logger.ts                # Request logging (Morgan/Pino)
│   │   └── roleGuard.ts            # Role-based access control
│   │
│   ├── utils/
│   │   ├── jwt.ts                   # Token generation/verification
│   │   ├── hash.ts                  # Password hashing (bcrypt)
│   │   ├── csv.ts                   # CSV parsing/generation
│   │   └── validators.ts           # Shared validation helpers
│   │
│   └── types/
│       └── index.ts                 # Shared TypeScript types
│
├── prisma/                          # If using Prisma ORM
│   ├── schema.prisma                # Database schema
│   └── migrations/                  # Migration history
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── .env.example                     # Environment template
├── package.json
├── tsconfig.json
├── Dockerfile                       # Production Dockerfile
└── docker-compose.yml              # Local dev with PostgreSQL + Redis
```

---

## 🗄️ Database Schema (PostgreSQL)

### Core Tables

```sql
-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
    avatar_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- COHORTS
CREATE TABLE cohorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cohort_members (
    cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'student' or 'faculty'
    PRIMARY KEY (cohort_id, user_id)
);

-- CLASSES
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    section VARCHAR(100),
    description TEXT,
    color_theme VARCHAR(50) DEFAULT '#1967d2',
    cover_image TEXT,
    join_code VARCHAR(10) UNIQUE,
    teacher_id UUID REFERENCES users(id),
    cohort_id UUID REFERENCES cohorts(id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE class_members (
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'student',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (class_id, user_id)
);

-- ASSIGNMENTS
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    instructions TEXT,
    points INT DEFAULT 100,
    due_date TIMESTAMPTZ,
    due_time VARCHAR(10),
    topic VARCHAR(255),
    status VARCHAR(20) DEFAULT 'draft',
    allow_late BOOLEAN DEFAULT true,
    late_penalty_pct INT DEFAULT 0,
    allowed_formats TEXT[], -- ['.pdf', '.zip', '.py']
    max_file_size_mb INT DEFAULT 50,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assignment_rubrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    criterion VARCHAR(255) NOT NULL,
    max_points INT NOT NULL,
    sort_order INT DEFAULT 0
);

CREATE TABLE assignment_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    file_name VARCHAR(500),
    file_url TEXT,
    file_size BIGINT,
    file_type VARCHAR(100)
);

-- SUBMISSIONS
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'submitted',
    text_entry TEXT,
    is_late BOOLEAN DEFAULT false,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

CREATE TABLE submission_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
    file_name VARCHAR(500),
    file_key TEXT NOT NULL, -- S3 key
    file_url TEXT,
    file_size BIGINT,
    file_type VARCHAR(100),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- GRADES
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE UNIQUE,
    graded_by UUID REFERENCES users(id),
    score DECIMAL(5,2),
    max_score INT,
    feedback TEXT,
    graded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE rubric_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_id UUID REFERENCES grades(id) ON DELETE CASCADE,
    rubric_id UUID REFERENCES assignment_rubrics(id),
    score DECIMAL(5,2)
);

-- PLAGIARISM
CREATE TABLE plagiarism_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID REFERENCES submissions(id),
    compared_with_id UUID REFERENCES submissions(id),
    similarity_score DECIMAL(5,2),
    status VARCHAR(30) DEFAULT 'pending',
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    detected_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(500),
    message TEXT,
    link VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address INET,
    user_agent TEXT,
    severity VARCHAR(20) DEFAULT 'info',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SYSTEM CONFIG
CREATE TABLE system_config (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BACKUPS
CREATE TABLE backup_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'in_progress',
    size_bytes BIGINT,
    file_key TEXT,
    duration_seconds INT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_grades_submission ON grades(submission_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_assignments_class ON assignments(class_id);
```

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/auth/signup` | Register new user |
| POST   | `/api/auth/login` | Login, returns JWT |
| POST   | `/api/auth/logout` | Invalidate tokens |
| POST   | `/api/auth/refresh` | Refresh access token |
| GET    | `/api/auth/me` | Get current user profile |

### Classes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/classes` | List user's classes |
| POST   | `/api/classes` | Create new class (faculty) |
| GET    | `/api/classes/:id` | Get class detail |
| PUT    | `/api/classes/:id` | Update class |
| DELETE | `/api/classes/:id` | Archive/delete class |
| POST   | `/api/classes/join` | Join class by code |
| GET    | `/api/classes/:id/members` | List class members |

### Assignments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/classes/:classId/assignments` | List assignments |
| POST   | `/api/classes/:classId/assignments` | Create assignment |
| GET    | `/api/assignments/:id` | Get assignment detail |
| PUT    | `/api/assignments/:id` | Update assignment |
| DELETE | `/api/assignments/:id` | Delete assignment |

### Submissions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/assignments/:id/submissions` | List all submissions (faculty) |
| POST   | `/api/assignments/:id/submit` | Submit work (student) |
| GET    | `/api/submissions/:id` | Get submission detail |
| PUT    | `/api/submissions/:id/grade` | Grade a submission |

### File Uploads
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/uploads/presign` | Get presigned S3 upload URL |
| DELETE | `/api/uploads/:fileKey` | Delete uploaded file |

### Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/admin/users` | List all users |
| PATCH  | `/api/admin/users/:id` | Update user |
| DELETE | `/api/admin/users/:id` | Delete user |
| POST   | `/api/admin/users/:id/suspend` | Suspend user |
| POST   | `/api/admin/users/bulk-import` | CSV bulk import |

### Analytics & Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/admin/metrics` | System metrics dashboard |
| GET    | `/api/admin/audit-logs` | Query audit logs |
| GET    | `/api/admin/analytics` | Analytics data |
| GET    | `/api/admin/config` | Get system config |
| PUT    | `/api/admin/config` | Update system config |
| POST   | `/api/admin/backup` | Trigger manual backup |
| GET    | `/api/admin/backups` | List backup history |
| GET    | `/api/admin/risk-alerts` | Risk monitoring |
| GET    | `/api/admin/plagiarism` | Plagiarism cases |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/notifications` | Get user notifications |
| PATCH  | `/api/notifications/:id/read` | Mark notification read |
| PATCH  | `/api/notifications/read-all` | Mark all as read |

---

## 🔐 Authentication Flow

```
1. User POSTs credentials to /api/auth/login
2. Server validates credentials, returns:
   - accessToken (JWT, 15min expiry)
   - refreshToken (JWT, 7day expiry, stored in httpOnly cookie)
3. Frontend stores accessToken in memory/localStorage
4. All API requests include Authorization: Bearer <accessToken>
5. On 401, frontend calls /api/auth/refresh with refreshToken
6. Server returns new accessToken
```

### JWT Payload
```json
{
  "sub": "user-uuid",
  "email": "user@school.edu",
  "role": "student",
  "iat": 1709337600,
  "exp": 1709338500
}
```

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Clone and install
cd server
npm install

# 2. Start PostgreSQL + Redis (Docker)
docker-compose up -d postgres redis

# 3. Setup environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Run migrations
npx prisma migrate dev

# 5. Seed database
npm run seed

# 6. Start dev server
npm run dev
# Server runs on http://localhost:3001
```

### docker-compose.yml (for local dev)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: classroom_db
      POSTGRES_USER: classroom
      POSTGRES_PASSWORD: classroom_secret
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

### .env.example

```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://classroom:classroom_secret@localhost:5432/classroom_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-256-bit-secret-key-change-in-production
JWT_REFRESH_SECRET=separate-refresh-token-secret
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# AWS S3
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=classroom-uploads

# CORS
CORS_ORIGIN=http://localhost:5173

# Email (SendGrid / SES)
EMAIL_FROM=notifications@yourclassroom.com
SENDGRID_API_KEY=your-sendgrid-key

# LLM / AI (optional)
OPENAI_API_KEY=your-openai-key
```

---

## 📋 Implementation Priority

| Phase | Tasks | Timeline |
|-------|-------|----------|
| **1. Core** | Auth + Users + Classes + basic CRUD | Week 1-2 |
| **2. Assignments** | Assignments + Submissions + File Upload (S3) | Week 3-4 |
| **3. Grading** | Grades + Rubrics + Gradebook | Week 5 |
| **4. Notifications** | Notification system + Socket.io real-time | Week 6 |
| **5. Admin** | Admin APIs: users, config, audit, analytics | Week 7-8 |
| **6. Advanced** | Plagiarism detection, AI summaries, risk monitoring | Week 9-10 |
| **7. Polish** | Rate limiting, caching, error handling, testing | Week 11-12 |
