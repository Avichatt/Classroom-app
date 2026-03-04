// ============================================
// Prisma Database Seed Script
// ============================================
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Database...');

    // Reset entirely
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

    const passwordHash = await bcrypt.hash('password123', 12);

    // Users
    const student1 = await prisma.user.create({ data: { name: 'Alice Student', email: 'student@school.edu', passwordHash, role: 'STUDENT', avatarUrl: 'https://ui-avatars.com/api/?name=Alice+Student&background=random' } });
    const student2 = await prisma.user.create({ data: { name: 'Bob Scholar', email: 'bob@school.edu', passwordHash, role: 'STUDENT', avatarUrl: 'https://ui-avatars.com/api/?name=Bob+Scholar&background=random' } });
    const faculty1 = await prisma.user.create({ data: { name: 'Dr. Jane Smith', email: 'faculty@school.edu', passwordHash, role: 'FACULTY', avatarUrl: 'https://ui-avatars.com/api/?name=Jane+Smith&background=random' } });
    const admin1 = await prisma.user.create({ data: { name: 'Super Admin', email: 'admin@school.edu', passwordHash, role: 'ADMIN', avatarUrl: 'https://ui-avatars.com/api/?name=Super+Admin&background=random' } });

    // Class
    const class1 = await prisma.class.create({
        data: {
            name: 'Introduction to Computer Science',
            section: 'CS101',
            subject: 'Computer Science',
            description: 'Fundamentals of programming and problem solving.',
            teacherId: faculty1.id,
            joinCode: 'CS101XX',
            colorTheme: '#0F9D58'
        }
    });

    // Memberships
    await prisma.classMember.createMany({
        data: [
            { classId: class1.id, userId: student1.id, role: 'student' },
            { classId: class1.id, userId: student2.id, role: 'student' }
        ]
    });

    // Assignment
    const assignment1 = await prisma.assignment.create({
        data: {
            classId: class1.id,
            title: 'Project 1: Python Basics',
            description: 'Write a calculator program in Python.',
            instructions: 'Please upload a single .py file. Due by Friday.',
            points: 100,
            createdById: faculty1.id,
            dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
            allowLate: true,
            allowedFormats: JSON.stringify(['.py']),
        }
    });

    // Rubrics
    await prisma.assignmentRubric.createMany({
        data: [
            { assignmentId: assignment1.id, criterion: 'Correctness', maxPoints: 50, sortOrder: 0 },
            { assignmentId: assignment1.id, criterion: 'Code Quality', maxPoints: 30, sortOrder: 1 },
            { assignmentId: assignment1.id, criterion: 'Documentation', maxPoints: 20, sortOrder: 2 },
        ]
    });

    // Submission
    const sub1 = await prisma.submission.create({
        data: {
            assignmentId: assignment1.id,
            studentId: student1.id,
            status: 'submitted',
            isLate: false,
        }
    });

    await prisma.submissionFile.create({
        data: {
            submissionId: sub1.id,
            fileName: 'calculator.py',
            fileKey: 'seed/calculator.py',
            fileSize: 1024,
            fileType: 'text/x-python',
        }
    });

    // System Config
    await prisma.systemConfig.createMany({
        data: [
            { key: 'MAX_FILE_SIZE_MB', value: JSON.stringify(50) },
            { key: 'ALLOW_LATE_DEFAULT', value: JSON.stringify(true) },
            { key: 'DEFAULT_LATE_PENALTY_PCT', value: JSON.stringify(10) },
        ]
    });

    console.log('✅ Seed complete!');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
