// ============================================================
// Classroom App - Production API Test Suite
// Target: https://classroom-app-mpgb.onrender.com/api
// ============================================================
const BASE_URL = 'https://classroom-app-mpgb.onrender.com/api';

let passed = 0;
let failed = 0;
const results = [];

// ─── Helpers ────────────────────────────────────────────────
async function req(method, path, body, token) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${path}`, {
        method, headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    const json = await res.json().catch(() => ({}));
    return { status: res.status, json };
}

function test(name, condition, detail = '') {
    if (condition) {
        passed++;
        results.push({ status: '✅ PASS', name, detail });
    } else {
        failed++;
        results.push({ status: '❌ FAIL', name, detail });
    }
}

// ─── Main Test Runner ────────────────────────────────────────
async function runTests() {
    console.log('\n🚀 Starting Classroom Production Test Suite...\n');
    console.log(`Target: ${BASE_URL}\n`);
    console.log('─'.repeat(65));

    // ── FEATURE 1: Health Check ──────────────────────────────
    console.log('\n📋 [1] Health Check');
    const health = await req('GET', '/health');
    test('Backend health endpoint returns OK', health.json.success === true && health.json.status === 'OK', `status=${health.status}`);

    // ── FEATURE 2: Admin Login ───────────────────────────────
    console.log('\n📋 [2] Authentication');
    const adminLogin = await req('POST', '/auth/login', { email: 'admin@school.edu', password: 'password123' });
    test('Admin login succeeds', adminLogin.json.success === true && !!adminLogin.json.data?.accessToken, `status=${adminLogin.status}`);
    const ADMIN_TOKEN = adminLogin.json.data?.accessToken;
    const ADMIN_ID = adminLogin.json.data?.user?.id;

    // ── FEATURE 3: Faculty Login ─────────────────────────────
    const facultyLogin = await req('POST', '/auth/login', { email: 'faculty@school.edu', password: 'password123' });
    test('Faculty login succeeds', facultyLogin.json.success === true && !!facultyLogin.json.data?.accessToken, `status=${facultyLogin.status}`);
    const FACULTY_TOKEN = facultyLogin.json.data?.accessToken;
    const FACULTY_ID = facultyLogin.json.data?.user?.id;

    // ── FEATURE 4: Student Login ─────────────────────────────
    const studentLogin = await req('POST', '/auth/login', { email: 'student@school.edu', password: 'password123' });
    test('Student login succeeds', studentLogin.json.success === true && !!studentLogin.json.data?.accessToken, `status=${studentLogin.status}`);
    const STUDENT_TOKEN = studentLogin.json.data?.accessToken;
    const STUDENT_ID = studentLogin.json.data?.user?.id;

    // ── FEATURE 5: Bad Login rejected ───────────────────────
    const badLogin = await req('POST', '/auth/login', { email: 'hacker@evil.com', password: 'wrongpassword' });
    test('Invalid login is rejected', badLogin.json.success === false || badLogin.status === 401, `status=${badLogin.status}`);

    // ── FEATURE 6: Auth /me endpoint ────────────────────────
    const me = await req('GET', '/auth/me', null, STUDENT_TOKEN);
    test('Auth /me returns student profile', me.json.success === true && me.json.data?.role === 'STUDENT', `role=${me.json.data?.role}`);

    // ── FEATURE 7: Unauthenticated access blocked ────────────
    const unauth = await req('GET', '/auth/me', null, null);
    test('Unauthenticated request is blocked (401)', unauth.status === 401, `status=${unauth.status}`);

    // ─── FEATURE 8: Class Listing (Faculty) ─────────────────
    console.log('\n📋 [3] Classes');
    const classes = await req('GET', '/classes', null, FACULTY_TOKEN);
    test('Faculty can list classes', classes.json.success === true && Array.isArray(classes.json.data), `count=${classes.json.data?.length}`);
    const CLASS_ID = classes.json.data?.[0]?.id;

    // ── FEATURE 9: Create a new Class ───────────────────────
    const newClass = await req('POST', '/classes', {
        name: 'Test Class ' + Date.now(),
        section: 'TC999',
        subject: 'Testing',
        description: 'Automated test class'
    }, FACULTY_TOKEN);
    test('Faculty can create a new class', newClass.json.success === true && !!newClass.json.data?.id, `classId=${newClass.json.data?.id}`);
    const NEW_CLASS_ID = newClass.json.data?.id;
    const JOIN_CODE = newClass.json.data?.joinCode;

    // ── FEATURE 10: Student joins class via Join Code ────────
    console.log('\n📋 [4] Class Enrollment');
    const joinClass = await req('POST', `/classes/${NEW_CLASS_ID}/join`, { joinCode: JOIN_CODE }, STUDENT_TOKEN);
    test('Student can join a class using join code', joinClass.json.success === true, `status=${joinClass.status}`);

    // ── FEATURE 11: Get class members ───────────────────────
    const members = await req('GET', `/classes/${NEW_CLASS_ID}/members`, null, FACULTY_TOKEN);
    test('Faculty can view class members', members.json.success === true && Array.isArray(members.json.data), `count=${members.json.data?.length}`);

    // ── FEATURE 12: Create Assignment ───────────────────────
    console.log('\n📋 [5] Assignments');
    const newAssignment = await req('POST', `/assignments`, {
        classId: NEW_CLASS_ID,
        title: 'Test Assignment ' + Date.now(),
        description: 'Automated test assignment',
        points: 100,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        allowLate: true,
        allowedFormats: ['.pdf', '.py']
    }, FACULTY_TOKEN);
    test('Faculty can create an assignment', newAssignment.json.success === true && !!newAssignment.json.data?.id, `assignmentId=${newAssignment.json.data?.id}`);
    const ASSIGNMENT_ID = newAssignment.json.data?.id;

    // ── FEATURE 13: List Assignments (Student) ───────────────
    const assignmentsList = await req('GET', `/assignments?classId=${NEW_CLASS_ID}`, null, STUDENT_TOKEN);
    test('Student can list assignments in their class', assignmentsList.json.success === true && Array.isArray(assignmentsList.json.data), `count=${assignmentsList.json.data?.length}`);

    // ── FEATURE 14: Get single Assignment ───────────────────
    if (ASSIGNMENT_ID) {
        const singleAssignment = await req('GET', `/assignments/${ASSIGNMENT_ID}`, null, STUDENT_TOKEN);
        test('Student can view assignment detail', singleAssignment.json.success === true && singleAssignment.json.data?.id === ASSIGNMENT_ID, `id=${singleAssignment.json.data?.id}`);
    } else {
        test('Student can view assignment detail', false, 'Skipped - no assignment created');
    }

    // ── FEATURE 15: Create Submission ───────────────────────
    console.log('\n📋 [6] Submissions');
    let SUBMISSION_ID = null;
    if (ASSIGNMENT_ID) {
        const newSubmission = await req('POST', `/submissions`, {
            assignmentId: ASSIGNMENT_ID,
            files: [],
            note: 'Automated test submission'
        }, STUDENT_TOKEN);
        test('Student can submit an assignment', newSubmission.json.success === true && !!newSubmission.json.data?.id, `submissionId=${newSubmission.json.data?.id}`);
        SUBMISSION_ID = newSubmission.json.data?.id;
    } else {
        test('Student can submit an assignment', false, 'Skipped - no assignment created');
    }

    // ── FEATURE 16: Faculty views submissions ────────────────
    if (ASSIGNMENT_ID) {
        const submissions = await req('GET', `/submissions?assignmentId=${ASSIGNMENT_ID}`, null, FACULTY_TOKEN);
        test('Faculty can view submissions for assignment', submissions.json.success === true && Array.isArray(submissions.json.data), `count=${submissions.json.data?.length}`);
    } else {
        test('Faculty can view submissions for assignment', false, 'Skipped');
    }

    // ── FEATURE 17: Grade a submission ──────────────────────
    console.log('\n📋 [7] Grading');
    if (SUBMISSION_ID) {
        const grade = await req('POST', `/grades`, {
            submissionId: SUBMISSION_ID,
            score: 92,
            feedback: 'Excellent automated test submission!',
        }, FACULTY_TOKEN);
        test('Faculty can grade a student submission', grade.json.success === true && !!grade.json.data?.id, `gradeId=${grade.json.data?.id}`);
    } else {
        test('Faculty can grade a student submission', false, 'Skipped - no submission created');
    }

    // ── FEATURE 18: Admin user listing ──────────────────────
    console.log('\n📋 [8] Admin');
    const users = await req('GET', '/admin/users', null, ADMIN_TOKEN);
    test('Admin can list all users', users.json.success === true && Array.isArray(users.json.data), `count=${users.json.data?.length}`);

    // ── FEATURE 19: Admin dashboard stats ───────────────────
    const stats = await req('GET', '/admin/stats', null, ADMIN_TOKEN);
    test('Admin can view system dashboard stats', stats.json.success === true && stats.json.data?.totalUsers > 0, `totalUsers=${stats.json.data?.totalUsers}`);

    // ── FEATURE 20: Student cannot access Admin routes ──────
    const forbiddenAdmin = await req('GET', '/admin/users', null, STUDENT_TOKEN);
    test('Student is forbidden from admin routes (403)', forbiddenAdmin.status === 403, `status=${forbiddenAdmin.status}`);

    // ── FEATURE 21: Faculty cannot access Admin routes ──────
    const forbiddenFaculty = await req('GET', '/admin/users', null, FACULTY_TOKEN);
    test('Faculty is forbidden from admin routes (403)', forbiddenFaculty.status === 403, `status=${forbiddenFaculty.status}`);

    // ── FEATURE 22: User profile update ─────────────────────
    console.log('\n📋 [9] User Management');
    const updateProfile = await req('PATCH', `/users/${STUDENT_ID}`, { name: 'Alice Updated ' + Date.now() }, STUDENT_TOKEN);
    test('Student can update their own profile', updateProfile.json.success === true, `status=${updateProfile.status}`);

    // ── FEATURE 23: Admin can update any user ────────────────
    if (STUDENT_ID) {
        const adminUpdateUser = await req('PATCH', `/users/${STUDENT_ID}`, { name: 'Alice Student' }, ADMIN_TOKEN);
        test('Admin can update any user profile', adminUpdateUser.json.success === true, `status=${adminUpdateUser.status}`);
    } else {
        test('Admin can update any user profile', false, 'Skipped');
    }

    // ── FEATURE 24: Token Refresh ────────────────────────────
    console.log('\n📋 [10] JWT Refresh');
    const refreshToken = studentLogin.json.data?.refreshToken;
    if (refreshToken) {
        const refresh = await req('POST', '/auth/refresh', { refreshToken });
        test('Student token refresh works', refresh.json.success === true && !!refresh.json.data?.accessToken, `status=${refresh.status}`);
    } else {
        test('Student token refresh works', false, 'Skipped - no refresh token');
    }

    // ── FEATURE 25: Logout ───────────────────────────────────
    const logout = await req('POST', '/auth/logout', null, STUDENT_TOKEN);
    test('Student can logout successfully', logout.status === 200 || logout.json.success === true, `status=${logout.status}`);

    // ─── Print Results ───────────────────────────────────────
    console.log('\n' + '═'.repeat(65));
    console.log('📊 TEST RESULTS');
    console.log('═'.repeat(65));
    results.forEach(r => {
        console.log(`${r.status} ${r.name}`);
        if (r.detail) console.log(`         └─ ${r.detail}`);
    });
    console.log('\n' + '─'.repeat(65));
    console.log(`✅ PASSED: ${passed}/${passed + failed}`);
    console.log(`❌ FAILED: ${failed}/${passed + failed}`);
    console.log(`📈 Score:  ${Math.round(passed / (passed + failed) * 100)}%`);
    console.log('─'.repeat(65) + '\n');

    if (failed > 0) {
        console.log('⚠️  Some tests failed. Check details above.\n');
        process.exit(1);
    } else {
        console.log('🎉 ALL TESTS PASSED! Production is healthy.\n');
    }
}

runTests().catch(err => {
    console.error('💥 Test runner crashed:', err);
    process.exit(1);
});
