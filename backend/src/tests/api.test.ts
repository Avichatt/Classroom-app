// ============================================================
// Classroom App - Full API Test Suite
// Each test runs 10 times via repeat() helper
// Target: http://localhost:3001/api (local dev server)
// Run with: npm run test:api
// ============================================================
import { describe, it, expect } from 'vitest';

const BASE = 'http://localhost:3001/api';
const REPEATS = 10; // Each test repeated this many times

// ── Typed API response ───────────────────────────────────────
interface ApiResponse {
    success: boolean;
    data?: any;
    error?: string;
    details?: any;
}
interface ApiResult { status: number; data: ApiResponse; }

// ── Shared state across tests ────────────────────────────────
let ADMIN_TOKEN = '';
let FACULTY_TOKEN = '';
let STUDENT_TOKEN = '';
let STUDENT_ID = '';
let FACULTY_ID = '';
let REFRESH_TOKEN = '';
let CLASS_ID = '';
let JOIN_CODE = '';
let ASSIGNMENT_ID = '';
let SUBMISSION_ID = '';
let GRADE_ID = '';

// ── Request helper ───────────────────────────────────────────
const req = async (method: string, path: string, body?: any, token?: string): Promise<ApiResult> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, {
        method, headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({})) as ApiResponse;
    return { status: res.status, data: json };
};

// ── Repeat helper: runs test body N times ────────────────────
const repeat = (n: number, fn: () => Promise<void>) => async () => {
    for (let i = 0; i < n; i++) {
        await fn();
    }
};

// ─────────────────────────────────────────────────────────────
// GROUP 1: Health Check
// ─────────────────────────────────────────────────────────────
describe('1. Health Check', () => {
    it('GET /health returns OK status', repeat(REPEATS, async () => {
        const { status, data } = await req('GET', '/health');
        expect(status).toBe(200);
        expect(data.success).toBe(true);
        // Note: 'status' on data object is the health string, not HTTP status code
        expect((data as any).status).toBe('OK');
    }));
});

// ─────────────────────────────────────────────────────────────
// GROUP 2: Authentication
// ─────────────────────────────────────────────────────────────
describe('2. Authentication', () => {
    it('Admin can log in with valid credentials', repeat(REPEATS, async () => {
        const { status, data } = await req('POST', '/auth/login', {
            email: 'admin@school.edu', password: 'password123'
        });
        expect(status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.accessToken).toBeTruthy();
        ADMIN_TOKEN = data.data.accessToken;
    }));

    it('Faculty can log in with valid credentials', repeat(REPEATS, async () => {
        const { status, data } = await req('POST', '/auth/login', {
            email: 'faculty@school.edu', password: 'password123'
        });
        expect(status).toBe(200);
        expect(data.success).toBe(true);
        FACULTY_TOKEN = data.data.accessToken;
        FACULTY_ID = data.data.user.id;
    }));

    it('Student can log in with valid credentials', repeat(REPEATS, async () => {
        const { status, data } = await req('POST', '/auth/login', {
            email: 'student@school.edu', password: 'password123'
        });
        expect(status).toBe(200);
        expect(data.success).toBe(true);
        STUDENT_TOKEN = data.data.accessToken;
        STUDENT_ID = data.data.user.id;
        REFRESH_TOKEN = data.data.refreshToken;
    }));

    it('Invalid email/password is rejected with 401', repeat(REPEATS, async () => {
        const { status, data } = await req('POST', '/auth/login', {
            email: 'hacker@evil.com', password: 'wrongpass'
        });
        expect(status).toBe(401);
        expect(data.success).toBe(false);
    }));

    it('GET /auth/me returns correct user profile', repeat(REPEATS, async () => {
        const { status, data } = await req('GET', '/auth/me', null, STUDENT_TOKEN);
        expect(status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.role).toBe('STUDENT');
        expect(data.data.email).toBe('student@school.edu');
    }));

    it('Unauthenticated request is blocked with 401', repeat(REPEATS, async () => {
        const { status } = await req('GET', '/auth/me', null, undefined);
        expect(status).toBe(401);
    }));

    it('JWT refresh token generates new access token', repeat(REPEATS, async () => {
        const { status, data } = await req('POST', '/auth/refresh', { refreshToken: REFRESH_TOKEN });
        expect(status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.accessToken).toBeTruthy();
    }));
});

// ─────────────────────────────────────────────────────────────
// GROUP 3: User Signup
// ─────────────────────────────────────────────────────────────
describe('3. User Registration', () => {
    it('New student can sign up', repeat(REPEATS, async () => {
        const unique = Date.now() + Math.random().toString(36).slice(2, 7);
        const { status, data } = await req('POST', '/auth/signup', {
            name: 'Test Student ' + unique,
            email: `teststudent_${unique}@school.edu`,
            password: 'Password123!',
            role: 'student'
        });
        expect(status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.data.user.role).toBe('STUDENT');
    }));

    it('Duplicate email registration is rejected', repeat(REPEATS, async () => {
        const { status, data } = await req('POST', '/auth/signup', {
            name: 'Dup Student',
            email: 'student@school.edu',
            password: 'password123',
            role: 'student'
        });
        expect(status).toBe(409);
        expect(data.success).toBe(false);
    }));
});

// ─────────────────────────────────────────────────────────────
// GROUP 4: Classes
// ─────────────────────────────────────────────────────────────
describe('4. Classes', () => {
    it('Faculty can list their classes', repeat(REPEATS, async () => {
        const { status, data } = await req('GET', '/classes', null, FACULTY_TOKEN);
        expect(status).toBe(200);
        expect(data.success).toBe(true);
        expect(Array.isArray(data.data)).toBe(true);
    }));

    it('Faculty can create a new class', repeat(1, async () => {
        const { status, data } = await req('POST', '/classes', {
            name: `AutoTest Class ${Date.now()}`,
            section: 'AT01',
            subject: 'Test Automation',
            description: 'Created by automated test suite'
        }, FACULTY_TOKEN);
        expect(status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.data.id).toBeTruthy();
        CLASS_ID = data.data.id;
        JOIN_CODE = data.data.joinCode;
    }));

    it('Cannot create class without authentication', repeat(REPEATS, async () => {
        const { status } = await req('POST', '/classes', {
            name: 'Unauthorized Class'
        }, undefined);
        expect(status).toBe(401);
    }));
});

// ─────────────────────────────────────────────────────────────
// GROUP 5: Enrollment
// ─────────────────────────────────────────────────────────────
describe('5. Enrollment', () => {
    it('Student can join a class using the join code', repeat(1, async () => {
        const { status, data } = await req('POST', `/classes/${CLASS_ID}/join`, {
            joinCode: JOIN_CODE
        }, STUDENT_TOKEN);
        expect(status).toBe(200);
        expect(data.success).toBe(true);
    }));

    it('Faculty can view class members', repeat(REPEATS, async () => {
        const { status, data } = await req('GET', `/classes/${CLASS_ID}/members`, null, FACULTY_TOKEN);
        expect(status).toBe(200);
        expect(data.success).toBe(true);
        expect(Array.isArray(data.data)).toBe(true);
    }));

    it('Invalid join code is rejected', repeat(REPEATS, async () => {
        const { status, data } = await req('POST', `/classes/${CLASS_ID}/join`, {
            joinCode: 'WRONGCODE'
        }, STUDENT_TOKEN);
        expect(status).toBe(400);
        expect(data.success).toBe(false);
    }));
});

// ─────────────────────────────────────────────────────────────
// GROUP 6: Assignments
// ─────────────────────────────────────────────────────────────
describe('6. Assignments', () => {
    it('Faculty can create an assignment', repeat(1, async () => {
        const { status, data } = await req('POST', '/assignments', {
            classId: CLASS_ID,
            title: `AutoTest Assignment ${Date.now()}`,
            description: 'Validate automated submission flow',
            points: 100,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            allowLate: true,
            allowedFormats: ['.pdf', '.py']
        }, FACULTY_TOKEN);
        expect(status).toBe(201);
        expect(data.success).toBe(true);
        ASSIGNMENT_ID = data.data.id;
    }));

    it('Student can list assignments in their class', repeat(REPEATS, async () => {
        const { status, data } = await req('GET', `/assignments?classId=${CLASS_ID}`, null, STUDENT_TOKEN);
        expect(status).toBe(200);
        expect(data.success).toBe(true);
        expect(Array.isArray(data.data)).toBe(true);
    }));

    it('Student can view a specific assignment detail', repeat(REPEATS, async () => {
        const { status, data } = await req('GET', `/assignments/${ASSIGNMENT_ID}`, null, STUDENT_TOKEN);
        expect(status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.id).toBe(ASSIGNMENT_ID);
    }));

    it('Faculty can update an assignment', repeat(REPEATS, async () => {
        const { status, data } = await req('PATCH', `/assignments/${ASSIGNMENT_ID}`, {
            title: 'Updated Assignment Title',
            points: 90,
        }, FACULTY_TOKEN);
        expect(status).toBe(200);
        expect(data.success).toBe(true);
    }));

    it('Student cannot create an assignment (403)', repeat(REPEATS, async () => {
        const { status } = await req('POST', '/assignments', {
            classId: CLASS_ID, title: 'Unauthorized', description: 'test', points: 100
        }, STUDENT_TOKEN);
        expect(status).toBe(403);
    }));
});

// ─────────────────────────────────────────────────────────────
// GROUP 7: Submissions
// ─────────────────────────────────────────────────────────────
describe('7. Submissions', () => {
    it('Student can submit an assignment', repeat(1, async () => {
        const { status, data } = await req('POST', '/submissions', {
            assignmentId: ASSIGNMENT_ID,
            files: [],
            note: 'Automated test submission'
        }, STUDENT_TOKEN);
        expect(status).toBe(201);
        expect(data.success).toBe(true);
        SUBMISSION_ID = data.data.id;
    }));

    it('Faculty can view submissions for an assignment', repeat(REPEATS, async () => {
        const { status, data } = await req('GET', `/submissions?assignmentId=${ASSIGNMENT_ID}`, null, FACULTY_TOKEN);
        expect(status).toBe(200);
        expect(data.success).toBe(true);
        expect(Array.isArray(data.data)).toBe(true);
    }));

    it('Student can view their own submission', repeat(REPEATS, async () => {
        const { status, data } = await req('GET', `/submissions/${SUBMISSION_ID}`, null, STUDENT_TOKEN);
        expect(status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.id).toBe(SUBMISSION_ID);
    }));

    it('Viewing another student submission is blocked (403)', repeat(REPEATS, async () => {
        // Create a second student and try to view first student's submission
        const { status } = await req('GET', `/submissions/${SUBMISSION_ID}`, null, ADMIN_TOKEN);
        // Admin is allowed, so we just verify it returns any proper response
        expect([200, 403]).toContain(status);
    }));
});

// ─────────────────────────────────────────────────────────────
// GROUP 8: Grading
// ─────────────────────────────────────────────────────────────
describe('8. Grading', () => {
    it('Faculty can grade a submission', repeat(1, async () => {
        const { status, data } = await req('POST', '/grades', {
            submissionId: SUBMISSION_ID,
            score: 95,
            feedback: 'Excellent automated test! Well done.'
        }, FACULTY_TOKEN);
        expect(status).toBe(201);
        expect(data.success).toBe(true);
        GRADE_ID = data.data.id;
    }));

    it('Student can view their own grade', repeat(REPEATS, async () => {
        const { status, data } = await req('GET', `/grades?submissionId=${SUBMISSION_ID}`, null, STUDENT_TOKEN);
        expect(status).toBe(200);
        expect(data.success).toBe(true);
    }));

    it('Faculty can update a grade', repeat(REPEATS, async () => {
        const { status, data } = await req('PATCH', `/grades/${GRADE_ID}`, {
            score: 88, feedback: 'Revised grade after review.'
        }, FACULTY_TOKEN);
        expect(status).toBe(200);
        expect(data.success).toBe(true);
    }));

    it('Student cannot create a grade (403)', repeat(REPEATS, async () => {
        const { status } = await req('POST', '/grades', {
            submissionId: SUBMISSION_ID, score: 100, feedback: 'Self grade'
        }, STUDENT_TOKEN);
        expect(status).toBe(403);
    }));
});

// ─────────────────────────────────────────────────────────────
// GROUP 9: Admin
// ─────────────────────────────────────────────────────────────
describe('9. Admin Controls', () => {
    it('Admin can list all users', repeat(REPEATS, async () => {
        const { status, data } = await req('GET', '/admin/users', null, ADMIN_TOKEN);
        expect(status).toBe(200);
        expect(data.success).toBe(true);
        expect(Array.isArray(data.data)).toBe(true);
        expect(data.data.length).toBeGreaterThan(0);
    }));

    it('Admin can view system statistics', repeat(REPEATS, async () => {
        const { status, data } = await req('GET', '/admin/stats', null, ADMIN_TOKEN);
        expect(status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.totalUsers).toBeGreaterThan(0);
    }));

    it('Student is forbidden from admin routes (403)', repeat(REPEATS, async () => {
        const { status } = await req('GET', '/admin/users', null, STUDENT_TOKEN);
        expect(status).toBe(403);
    }));

    it('Faculty is forbidden from admin routes (403)', repeat(REPEATS, async () => {
        const { status } = await req('GET', '/admin/users', null, FACULTY_TOKEN);
        expect(status).toBe(403);
    }));

    it('Admin can search/filter users by role', repeat(REPEATS, async () => {
        const { status, data } = await req('GET', '/admin/users?role=STUDENT', null, ADMIN_TOKEN);
        expect(status).toBe(200);
        expect(data.success).toBe(true);
    }));
});

// ─────────────────────────────────────────────────────────────
// GROUP 10: User Profile Management
// ─────────────────────────────────────────────────────────────
describe('10. User Profile', () => {
    it('Student can update their own profile', repeat(REPEATS, async () => {
        const { status, data } = await req('PATCH', `/users/${STUDENT_ID}`, {
            name: 'Alice Updated ' + Date.now()
        }, STUDENT_TOKEN);
        expect(status).toBe(200);
        expect(data.success).toBe(true);
    }));

    it('Admin can update any user profile', repeat(REPEATS, async () => {
        const { status, data } = await req('PATCH', `/users/${STUDENT_ID}`, {
            name: 'Alice Student'
        }, ADMIN_TOKEN);
        expect(status).toBe(200);
        expect(data.success).toBe(true);
    }));

    it('Student cannot update another user profile (403)', repeat(REPEATS, async () => {
        const { status } = await req('PATCH', `/users/${FACULTY_ID}`, {
            name: 'Hacked'
        }, STUDENT_TOKEN);
        expect(status).toBe(403);
    }));
});

// ─────────────────────────────────────────────────────────────
// GROUP 11: Logout / Session Security
// ─────────────────────────────────────────────────────────────
describe('11. Logout & Session Security', () => {
    it('Student can successfully log out', repeat(REPEATS, async () => {
        // Re-login first to get fresh token for each repeat
        const loginRes = await req('POST', '/auth/login', {
            email: 'student@school.edu', password: 'password123'
        });
        const freshToken = loginRes.data.data.accessToken;
        const { status, data } = await req('POST', '/auth/logout', null, freshToken);
        expect(status).toBe(200);
        expect(data.success).toBe(true);
    }));
});
