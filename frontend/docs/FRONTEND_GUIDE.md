# 🖥️ Frontend Guide — Google Classroom Clone

## Overview

The frontend is a **React 18 + TypeScript** SPA built with **Vite** and **Material UI v5**. It currently runs on mock data via Zustand stores. This guide covers everything needed to connect it to a real backend and prepare it for production.

---

## 📁 Project Structure

```
src/
├── App.tsx                          # Main router (all routes defined here)
├── main.tsx                         # Vite entry point
├── index.css                        # Global styles
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx               # Top bar with notifications bell, user avatar
│   │   ├── Layout.tsx               # Main layout wrapper (sidebar + content + notifications)
│   │   └── Sidebar.tsx              # Left navigation drawer (role-aware links)
│   └── notifications/
│       └── NotificationsPanel.tsx    # Slide-out notification drawer
│
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx            # Google-style login with demo chips
│   │   └── SignupPage.tsx           # Registration form
│   ├── home/
│   │   └── HomePage.tsx             # Class cards grid (post-login landing)
│   ├── class/
│   │   └── ClassDetailPage.tsx      # Stream / Classwork / People tabs
│   ├── assignment/
│   │   └── AssignmentDetailPage.tsx  # Assignment detail + submission form
│   ├── student/
│   │   ├── StudentDashboardPage.tsx  # Student home: upcoming, recent, grades
│   │   ├── AssignmentListPage.tsx    # Filtered assignment list with search
│   │   └── GradesPage.tsx           # Grade table + distribution chart
│   ├── faculty/
│   │   ├── AssignmentCreatorPage.tsx  # Create assignment + rubric builder
│   │   ├── SubmissionsViewerPage.tsx  # View all submissions for an assignment
│   │   ├── GradingInterfacePage.tsx   # Side-by-side grading UI
│   │   └── GradebookPage.tsx         # Spreadsheet-style gradebook
│   ├── dashboard/
│   │   └── DashboardPage.tsx         # Faculty dashboard with analytics
│   ├── admin/ (11 modules)
│   │   ├── AdminDashboard.tsx        # Container with tab navigation
│   │   ├── AdminOverview.tsx         # System metrics + activity feed + health
│   │   ├── UserManagement.tsx        # User CRUD + bulk import + roles/permissions
│   │   ├── CohortCourseManagement.tsx# Cohort & course management
│   │   ├── AssignmentOversight.tsx   # System-wide assignment monitoring
│   │   ├── PlagiarismCenter.tsx      # Flagged submissions review
│   │   ├── SystemAnalytics.tsx       # Charts: trends, peak hours, AI metrics
│   │   ├── AuditLogs.tsx            # Filterable audit trail with CSV export
│   │   ├── SystemConfig.tsx          # System configuration panel
│   │   ├── AccessibilitySettings.tsx # Language, theme, accessibility
│   │   ├── DataBackup.tsx           # Backup management + data export
│   │   └── RiskMonitoring.tsx       # Security threat monitoring
│   ├── calendar/
│   │   └── CalendarPage.tsx          # Monthly calendar view
│   └── todo/
│       └── ToDoPage.tsx              # To-do list with filters
│
├── store/
│   ├── appStore.ts                   # Global app state (classes, assignments, etc.)
│   └── authStore.ts                  # Authentication state (user, tokens)
│
├── data/
│   ├── mockData.ts                   # Mock data for student/faculty features
│   └── adminMockData.ts             # Mock data for admin dashboard
│
├── theme/
│   └── theme.ts                      # MUI theme customization
│
└── types/
    └── index.ts                      # TypeScript interfaces & types
```

---

## 🔌 Step-by-Step: Connecting to Real Backend

### Phase 1: Create API Service Layer

Create a centralized API client. Install axios:

```bash
npm install axios
```

Create `src/services/api.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401 / token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

### Phase 2: Create Domain-Specific Services

Create individual service files for each domain:

```
src/services/
├── api.ts              # Base axios instance
├── authService.ts       # login, signup, logout, refreshToken
├── classService.ts      # getClasses, createClass, joinClass, archiveClass
├── assignmentService.ts # CRUD assignments, getSubmissions
├── submissionService.ts # submitWork, uploadFile, getSubmission
├── gradeService.ts      # gradeSubmission, getGrades, exportGrades
├── userService.ts       # getUsers, updateUser, bulkImport
├── cohortService.ts     # CRUD cohorts
├── analyticsService.ts  # getSystemMetrics, getAuditLogs, getAnalytics
├── notificationService.ts # getNotifications, markRead
└── configService.ts     # getConfig, updateConfig
```

Example — `authService.ts`:

```typescript
import api from './api';

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('refresh_token', data.refreshToken);
    return data.user;
  },

  signup: async (payload: { name: string; email: string; password: string; role: string }) => {
    const { data } = await api.post('/auth/signup', payload);
    return data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  getCurrentUser: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const { data } = await api.post('/auth/refresh', { refreshToken });
    localStorage.setItem('access_token', data.accessToken);
    return data;
  },
};
```

### Phase 3: Add React Query for Server State

```bash
npm install @tanstack/react-query
```

Wrap your app in `main.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 2 },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
```

Create hooks like `src/hooks/useClasses.ts`:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classService } from '../services/classService';

export function useClasses() {
  return useQuery({ queryKey: ['classes'], queryFn: classService.getAll });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: classService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['classes'] }),
  });
}
```

### Phase 4: Replace Zustand Mock Data

Gradually replace mock data usage in components:

```diff
- import { useAppStore } from '../store/appStore';
+ import { useClasses } from '../hooks/useClasses';

  function HomePage() {
-   const { classes } = useAppStore();
+   const { data: classes, isLoading, error } = useClasses();
+
+   if (isLoading) return <CircularProgress />;
+   if (error) return <Alert severity="error">Failed to load classes</Alert>;
```

### Phase 5: File Upload with Real Storage

Replace the mock file upload with presigned URL uploads:

```typescript
// src/services/uploadService.ts
export const uploadService = {
  getPresignedUrl: async (fileName: string, fileType: string) => {
    const { data } = await api.post('/uploads/presign', { fileName, fileType });
    return data; // { uploadUrl, fileKey }
  },

  uploadToS3: async (presignedUrl: string, file: File, onProgress: (pct: number) => void) => {
    await axios.put(presignedUrl, file, {
      headers: { 'Content-Type': file.type },
      onUploadProgress: (e) => onProgress(Math.round((e.loaded / (e.total || 1)) * 100)),
    });
  },
};
```

### Phase 6: Real-time Notifications via WebSocket

```bash
npm install socket.io-client
```

```typescript
// src/services/socketService.ts
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: { token: localStorage.getItem('access_token') },
});

export function connectSocket(userId: string) {
  socket.auth = { token: localStorage.getItem('access_token') };
  socket.connect();
  socket.emit('join', userId);
}

socket.on('notification', (data) => {
  // Update notification store
});
```

---

## 🌍 Environment Variables

Create `.env` files:

```bash
# .env.development
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001

# .env.production
VITE_API_URL=https://api.yourclassroom.com/api
VITE_WS_URL=wss://api.yourclassroom.com
```

---

## 🧪 Testing

### Unit Tests
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### E2E Tests
```bash
npm install -D playwright
npx playwright install
```

---

## 📦 Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Type check
npx tsc --noEmit

# Lint
npm run lint
```

### Build Output
The production build outputs to `dist/` — a static SPA that can be served from any CDN or static hosting (Vercel, Netlify, CloudFront, etc.).

---

## 🔄 Migration Checklist: Mock → Real Data

| # | Task | File(s) to Change | Priority |
|---|------|-------------------|----------|
| 1 | Create `src/services/api.ts` base client | New file | 🔴 Critical |
| 2 | Create domain service files | `src/services/*.ts` | 🔴 Critical |
| 3 | Install & setup React Query | `main.tsx`, `package.json` | 🔴 Critical |
| 4 | Create custom hooks per domain | `src/hooks/*.ts` | 🔴 Critical |
| 5 | Replace `useAppStore()` in all pages | All pages (39 files) | 🔴 Critical |
| 6 | Real auth flow (JWT) | `authStore.ts`, `LoginPage.tsx` | 🔴 Critical |
| 7 | File upload via presigned URLs | `AssignmentDetailPage.tsx` | 🟡 High |
| 8 | WebSocket notifications | `NotificationsPanel.tsx` | 🟡 High |
| 9 | Remove mock data files | `data/mockData.ts`, `data/adminMockData.ts` | 🟢 Low |
| 10 | Add error boundaries | `App.tsx` | 🟡 High |
| 11 | Add loading skeletons | All pages | 🟢 Low |
| 12 | Add E2E tests | `tests/` | 🟢 Low |
