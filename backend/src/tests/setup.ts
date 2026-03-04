// ============================================================
// Test Setup - Local Environment
// Runs against local backend on http://localhost:3001/api
// ============================================================
import { beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Seed test data before all tests ─────────────────────────
beforeAll(async () => {
    console.log('\n🌱 Seeding local test database...');
    // Wipe and re-seed in test order
    await prisma.auditLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.rubricScore.deleteMany();
    await prisma.grade.deleteMany();
    await prisma.submissionFile.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.assignmentAttachment.deleteMany();
    await prisma.assignmentRubric.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.classMember.deleteMany();
    await prisma.class.deleteMany();
    await prisma.cohortMember.deleteMany();
    await prisma.cohort.deleteMany();
    await prisma.systemConfig.deleteMany();
    await prisma.user.deleteMany();
    console.log('✅ Test database cleaned and ready.\n');
});

// ── Cleanup after all tests ──────────────────────────────────
afterAll(async () => {
    await prisma.$disconnect();
    console.log('\n🧹 Test database disconnected.');
});

export { prisma };
