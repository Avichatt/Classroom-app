// Production test - with delays to avoid rate limiting
const BASE = 'https://classroom-app-mpgb.onrender.com/api';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const req = async (method, path, body, token) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    try {
        const res = await fetch(`${BASE}${path}`, {
            method, headers,
            body: body ? JSON.stringify(body) : undefined,
        });
        const j = await res.json().catch(() => ({}));
        return { s: res.status, j };
    } catch (e) {
        return { s: 0, j: {} };
    }
};

const results = [];
const check = (name, pass, detail) => {
    const status = pass ? 'PASS' : 'FAIL';
    results.push({ name, status, detail: detail || '' });
    console.log(`  [${status}] ${name}  (${detail || ''})`);
};

console.log('\n=== CLASSROOM PRODUCTION API TESTS ===\n');
console.log('Waiting 15s for rate limit window to reset...');
await sleep(15000);

// ─── 1. Health ───────────────────────────────────────────────
console.log('\n[GROUP 1] Health & Auth');
const h = await req('GET', '/health');
check('Health endpoint returns OK', h.j.success === true && h.j.status === 'OK', `HTTP ${h.s}`);
await sleep(500);

// ─── 2. Auth ─────────────────────────────────────────────────
const al = await req('POST', '/auth/login', { email: 'admin@school.edu', password: 'password123' });
check('Admin login', al.j.success === true && !!al.j.data?.accessToken, `HTTP ${al.s}`);
const AT = al.j.data?.accessToken;
await sleep(500);

const fl = await req('POST', '/auth/login', { email: 'faculty@school.edu', password: 'password123' });
check('Faculty login', fl.j.success === true && !!fl.j.data?.accessToken, `HTTP ${fl.s}`);
const FT = fl.j.data?.accessToken;
await sleep(500);

const sl = await req('POST', '/auth/login', { email: 'student@school.edu', password: 'password123' });
check('Student login', sl.j.success === true && !!sl.j.data?.accessToken, `HTTP ${sl.s}`);
const ST = sl.j.data?.accessToken;
const SID = sl.j.data?.user?.id;
const RT = sl.j.data?.refreshToken;
await sleep(500);

const bl = await req('POST', '/auth/login', { email: 'hacker@evil.com', password: 'wrong' });
check('Invalid credentials rejected', bl.s === 401 || bl.j.success === false, `HTTP ${bl.s}`);
await sleep(500);

const me = await req('GET', '/auth/me', null, ST);
check('Auth /me returns student profile', me.j.success === true && me.j.data?.role === 'STUDENT', `role=${me.j.data?.role}`);
await sleep(500);

const ua = await req('GET', '/auth/me', null, null);
check('No token blocked (401)', ua.s === 401, `HTTP ${ua.s}`);
await sleep(500);

// ─── 3. Classes ──────────────────────────────────────────────
console.log('\n[GROUP 2] Classes');
const cls = await req('GET', '/classes', null, FT);
check('Faculty lists classes', cls.j.success === true && Array.isArray(cls.j.data), `count=${cls.j.data?.length}`);
await sleep(500);

const nc = await req('POST', '/classes', {
    name: 'AutoTest Class ' + Date.now(),
    section: 'AT01', subject: 'Automation', description: 'Test class'
}, FT);
check('Faculty creates new class', nc.j.success === true && !!nc.j.data?.id, `classId=${nc.j.data?.id}`);
const CID = nc.j.data?.id;
const JC = nc.j.data?.joinCode;
await sleep(800);

// ─── 4. Enrollment ───────────────────────────────────────────
console.log('\n[GROUP 3] Enrollment');
const jc = CID ? await req('POST', `/classes/${CID}/join`, { joinCode: JC }, ST) : { s: 0, j: {} };
check('Student joins class with join code', jc.j.success === true, `HTTP ${jc.s}, code=${JC}`);
await sleep(500);

const mb = CID ? await req('GET', `/classes/${CID}/members`, null, FT) : { s: 0, j: {} };
check('Faculty views class members', mb.j.success === true && Array.isArray(mb.j.data), `count=${mb.j.data?.length}`);
await sleep(500);

// ─── 5. Assignments ──────────────────────────────────────────
console.log('\n[GROUP 4] Assignments');
const na = CID ? await req('POST', `/assignments`, {
    classId: CID, title: 'AutoTest Assignment ' + Date.now(),
    description: 'Automated test', points: 100,
    dueDate: new Date(Date.now() + 604800000).toISOString(),
    allowLate: true, allowedFormats: ['.pdf', '.py']
}, FT) : { s: 0, j: {} };
check('Faculty creates assignment', na.j.success === true && !!na.j.data?.id, `assignId=${na.j.data?.id}`);
const AID = na.j.data?.id;
await sleep(800);

const la = CID ? await req('GET', `/assignments?classId=${CID}`, null, ST) : { s: 0, j: {} };
check('Student lists class assignments', la.j.success === true && Array.isArray(la.j.data), `count=${la.j.data?.length}`);
await sleep(500);

const sa = AID ? await req('GET', `/assignments/${AID}`, null, ST) : { s: 0, j: {} };
check('Student views assignment detail', sa.j.success === true && sa.j.data?.id === AID, `id=${sa.j.data?.id}`);
await sleep(500);

// ─── 6. Submissions ──────────────────────────────────────────
console.log('\n[GROUP 5] Submissions');
const ns = AID ? await req('POST', `/submissions`, {
    assignmentId: AID, files: [], note: 'Auto test submission'
}, ST) : { s: 0, j: {} };
check('Student submits assignment', ns.j.success === true && !!ns.j.data?.id, `subId=${ns.j.data?.id}`);
const NSID = ns.j.data?.id;
await sleep(800);

const ls = AID ? await req('GET', `/submissions?assignmentId=${AID}`, null, FT) : { s: 0, j: {} };
check('Faculty views submissions', ls.j.success === true, `count=${ls.j.data?.length}`);
await sleep(500);

// ─── 7. Grading ──────────────────────────────────────────────
console.log('\n[GROUP 6] Grading');
const gr = NSID ? await req('POST', `/grades`, {
    submissionId: NSID, score: 95, feedback: 'Excellent automated test!'
}, FT) : { s: 0, j: {} };
check('Faculty grades a submission', gr.j.success === true && !!gr.j.data?.id, `gradeId=${gr.j.data?.id}`);
await sleep(500);

const gg = NSID ? await req('GET', `/grades?submissionId=${NSID}`, null, FACULTY_TOKEN) : { s: 0, j: {} };
await sleep(300);

// ─── 8. Admin ────────────────────────────────────────────────
console.log('\n[GROUP 7] Admin');
const aus = await req('GET', '/admin/users', null, AT);
check('Admin lists all users', aus.j.success === true && Array.isArray(aus.j.data), `count=${aus.j.data?.length}`);
await sleep(500);

const ast = await req('GET', '/admin/stats', null, AT);
check('Admin views system stats', ast.j.success === true && ast.j.data?.totalUsers > 0, `totalUsers=${ast.j.data?.totalUsers}`);
await sleep(500);

const sfb = await req('GET', '/admin/users', null, ST);
check('Student forbidden from admin (403)', sfb.s === 403, `HTTP ${sfb.s}`);
await sleep(300);

const ffb = await req('GET', '/admin/users', null, FT);
check('Faculty forbidden from admin (403)', ffb.s === 403, `HTTP ${ffb.s}`);
await sleep(500);

// ─── 9. User Management ──────────────────────────────────────
console.log('\n[GROUP 8] User Management');
const up = SID ? await req('PATCH', `/users/${SID}`, { name: 'Alice Updated ' + Date.now() }, ST) : { s: 0, j: {} };
check('Student updates own profile', up.j.success === true, `HTTP ${up.s}`);
await sleep(500);

const aup = SID ? await req('PATCH', `/users/${SID}`, { name: 'Alice Student' }, AT) : { s: 0, j: {} };
check('Admin updates any user profile', aup.j.success === true, `HTTP ${aup.s}`);
await sleep(500);

// ─── 10. Token Refresh & Logout ──────────────────────────────
console.log('\n[GROUP 9] Security');
const rf = RT ? await req('POST', '/auth/refresh', { refreshToken: RT }) : { s: 0, j: {} };
check('JWT refresh token works', rf.j.success === true && !!rf.j.data?.accessToken, `HTTP ${rf.s}`);
await sleep(500);

const lo = await req('POST', '/auth/logout', null, ST);
check('Student logout succeeds', lo.s === 200 || lo.j.success === true, `HTTP ${lo.s}`);
await sleep(300);

const afterLogout = await req('POST', '/auth/logout', null, ST);
check('Expired token rejected after logout', afterLogout.s === 401 || afterLogout.j.success === false, `HTTP ${afterLogout.s}`);

// ─── Summary ─────────────────────────────────────────────────
const passed = results.filter(r => r.status === 'PASS').length;
const failed = results.filter(r => r.status === 'FAIL').length;
const total = results.length;
const score = Math.round(passed / total * 100);

console.log('\n' + '='.repeat(50));
console.log('  FINAL RESULTS');
console.log('='.repeat(50));
console.log(`  PASSED : ${passed} / ${total}`);
console.log(`  FAILED : ${failed} / ${total}`);
console.log(`  SCORE  : ${score}%`);
console.log('='.repeat(50));

if (failed > 0) {
    console.log('\n  FAILURES:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  - ${r.name}  (${r.detail})`);
    });
}
console.log('');
