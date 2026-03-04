# 📚 Classroom — Google Classroom Clone

A production-grade **Learning Management System (LMS)** inspired by Google Classroom, built with React, TypeScript, and Material UI. Features role-based dashboards for Students, Faculty, and Admins with 40+ pages and 11 admin modules.

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/MUI-5-purple?logo=mui" />
  <img src="https://img.shields.io/badge/Vite-5-yellow?logo=vite" />
  <img src="https://img.shields.io/badge/Zustand-4-orange" />
</p>

---

## 🎯 Features

### 🎓 Student Features
- **Home Page** — Class cards grid, join class with code
- **Student Dashboard** — Upcoming assignments with countdown timers, grade summary, announcements
- **Assignment List** — Filter (All/Due Soon/Submitted/Graded/Late/Missing), sort, search
- **Assignment Detail** — Description, attachments, submission form with drag-and-drop file upload
- **Grades** — Gradebook table with scores, distribution chart, per-class breakdown

### 🧑‍🏫 Faculty Features
- **Faculty Dashboard** — Pending submissions, assignment status, class analytics
- **Assignment Creator** — Rich form with rubric builder, file attachments, scheduling
- **Submissions Viewer** — Student table with status chips, plagiarism scores, CSV export
- **Grading Interface** — Side-by-side view: student work + rubric sliders + feedback
- **Gradebook** — Spreadsheet-style with color-coded cells, per-student averages

### 🛡️ Admin Dashboard (11 Modules)
- **Overview** — 8 system metric cards, activity feed, system health monitoring
- **User Management** — CRUD table, bulk CSV import, role/permission matrix
- **Cohort & Course Management** — Create/manage cohorts, course table
- **Assignment Oversight** — System-wide monitoring with submission/late/plagiarism rates
- **Plagiarism Control Center** — Flagged submissions, review/confirm/escalate workflow
- **System Analytics** — Canvas charts: trends, peak hours, grading time, AI metrics
- **Audit Logs** — Filterable trail with severity badges, CSV export
- **System Configuration** — File limits, late penalties, AI toggles, security settings
- **Accessibility** — Language, timezone, dark mode, high contrast
- **Data & Backup** — Backup history, manual trigger, data export
- **Risk Monitoring** — Threat alerts with severity levels, investigate/block/resolve

### 🔔 Communication
- **Notification Panel** — Slide-out drawer with typed notifications
- **Calendar** — Monthly calendar with assignment due dates
- **To-Do List** — Task management with filters

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ 
- npm 9+

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/classroom-app.git
cd classroom-app

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at **http://localhost:5173**

### Demo Accounts

The login page includes demo chips for quick access:

| Role | Email | Password |
|------|-------|----------|
| Student | student@school.edu | password |
| Faculty | faculty@school.edu | password |
| Admin | admin@school.edu | password |

---

## 📁 Project Structure

```
classroom-app/
├── src/
│   ├── App.tsx                    # Router with all routes
│   ├── components/
│   │   ├── layout/                # Header, Sidebar, Layout
│   │   └── notifications/         # NotificationsPanel
│   ├── pages/
│   │   ├── auth/                  # Login, Signup
│   │   ├── home/                  # Class cards grid
│   │   ├── class/                 # Class detail (Stream/Classwork/People)
│   │   ├── assignment/            # Assignment detail + submission
│   │   ├── student/               # Student Dashboard, Assignments, Grades
│   │   ├── faculty/               # Creator, Submissions, Grading, Gradebook
│   │   ├── admin/                 # 11-module admin dashboard
│   │   ├── dashboard/             # Faculty dashboard
│   │   ├── calendar/              # Monthly calendar
│   │   └── todo/                  # To-do list
│   ├── store/                     # Zustand state management
│   ├── data/                      # Mock data (to be replaced with API)
│   ├── theme/                     # MUI theme customization
│   └── types/                     # TypeScript interfaces
├── docs/
│   ├── FRONTEND_GUIDE.md          # Frontend architecture & migration guide
│   ├── BACKEND_GUIDE.md           # Backend architecture & API spec
│   └── DEVOPS_GUIDE.md            # Infrastructure & deployment guide
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 18 | UI rendering |
| **Language** | TypeScript 5 | Type safety |
| **Build Tool** | Vite 5 | Fast dev server & bundling |
| **UI Library** | Material UI 5 | Google-style components |
| **Routing** | React Router 6 | Client-side routing |
| **State** | Zustand 4 | Lightweight global state |
| **Charts** | HTML5 Canvas | Custom-drawn analytics charts |
| **Dates** | date-fns | Date formatting & manipulation |
| **IDs** | uuid | Unique ID generation |

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (port 5173) |
| `npm run build` | Create production build in `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npx tsc --noEmit` | TypeScript type checking |

---

## 🗺️ Route Map

| Path | Page | Role |
|------|------|------|
| `/login` | Login Page | Public |
| `/signup` | Signup Page | Public |
| `/` | Home (Class Cards) | All |
| `/class/:classId` | Class Detail | All |
| `/class/:classId/assignment/:assignmentId` | Assignment Detail | All |
| `/student-dashboard` | Student Dashboard | Student |
| `/assignments` | Assignment List | Student |
| `/grades` | Grades Page | Student |
| `/dashboard` | Faculty Dashboard | Faculty |
| `/class/:classId/create-assignment` | Assignment Creator | Faculty |
| `/class/:classId/assignment/:id/submissions` | Submissions Viewer | Faculty |
| `/class/:classId/assignment/:id/grade/:subId` | Grading Interface | Faculty |
| `/gradebook` | Faculty Gradebook | Faculty |
| `/admin` | Admin Dashboard (11 tabs) | Admin |
| `/calendar` | Calendar | All |
| `/to-do` | To-Do List | All |

---

## 🔌 Going Live

The app currently runs on **mock data**. To connect to a real backend:

1. **Read** [`docs/FRONTEND_GUIDE.md`](docs/FRONTEND_GUIDE.md) — API service layer, React Query setup
2. **Read** [`docs/BACKEND_GUIDE.md`](docs/BACKEND_GUIDE.md) — Express API, PostgreSQL schema, endpoints
3. **Read** [`docs/DEVOPS_GUIDE.md`](docs/DEVOPS_GUIDE.md) — Docker, CI/CD, AWS deployment

See the [Implementation Plan](docs/IMPLEMENTATION_PLAN.md) for the phased roadmap.

---

## 📊 Stats

- **39 TypeScript files** (0 compilation errors)
- **40+ pages and modules**
- **11 admin dashboard tabs**
- **3 role-based experiences** (Student, Faculty, Admin)
- **Canvas-drawn charts** (no chart library dependency)
- **CSV export** in multiple modules
- **Real-time notification system** (ready for WebSocket)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ using React, TypeScript, and Material UI
