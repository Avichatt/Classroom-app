// ============================================
// Assignment Service
// ============================================
import prisma from '../../config/database';
import { AppError } from '../../types';

export const assignmentService = {
    async listByClass(classId: string) {
        return prisma.assignment.findMany({
            where: { classId },
            include: {
                createdBy: { select: { id: true, name: true } },
                rubrics: { orderBy: { sortOrder: 'asc' } },
                attachments: true,
                _count: { select: { submissions: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    },

    async listForStudent(studentId: string) {
        // Get all classes the student is enrolled in
        const memberships = await prisma.classMember.findMany({ where: { userId: studentId }, select: { classId: true } });
        const classIds = memberships.map((m) => m.classId);

        const assignments = await prisma.assignment.findMany({
            where: { classId: { in: classIds }, status: 'published' },
            include: {
                class: { select: { id: true, name: true, colorTheme: true } },
                createdBy: { select: { id: true, name: true } },
                submissions: { where: { studentId }, select: { id: true, status: true, submittedAt: true, grade: true } },
                _count: { select: { submissions: true } },
            },
            orderBy: { dueDate: 'asc' },
        });

        return assignments.map((a) => ({
            ...a,
            mySubmission: a.submissions[0] || null,
            submissions: undefined,
        }));
    },

    async getById(id: string) {
        const assignment = await prisma.assignment.findUnique({
            where: { id },
            include: {
                class: { select: { id: true, name: true, teacherId: true, colorTheme: true } },
                createdBy: { select: { id: true, name: true } },
                rubrics: { orderBy: { sortOrder: 'asc' } },
                attachments: true,
                _count: { select: { submissions: true } },
            },
        });
        if (!assignment) throw new AppError(404, 'Assignment not found');
        return assignment;
    },

    async create(classId: string, data: {
        title: string; description?: string; instructions?: string; points?: number;
        dueDate?: string; dueTime?: string; topic?: string; allowLate?: boolean;
        latePenaltyPct?: number; allowedFormats?: string[]; maxFileSizeMb?: number;
        rubrics?: Array<{ criterion: string; maxPoints: number }>;
    }, createdById: string) {
        // Verify teacher owns the class
        const cls = await prisma.class.findUnique({ where: { id: classId } });
        if (!cls) throw new AppError(404, 'Class not found');
        if (cls.teacherId !== createdById) throw new AppError(403, 'Only the class teacher can create assignments');

        const assignment = await prisma.assignment.create({
            data: {
                classId,
                title: data.title,
                description: data.description,
                instructions: data.instructions,
                points: data.points || 100,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                dueTime: data.dueTime,
                topic: data.topic,
                allowLate: data.allowLate ?? true,
                latePenaltyPct: data.latePenaltyPct || 0,
                allowedFormats: data.allowedFormats ? JSON.stringify(data.allowedFormats) : "[]",
                maxFileSizeMb: data.maxFileSizeMb || 50,
                createdById,
                status: 'published',
                rubrics: data.rubrics ? {
                    create: data.rubrics.map((r, i) => ({ criterion: r.criterion, maxPoints: r.maxPoints, sortOrder: i })),
                } : undefined,
            },
            include: { rubrics: true, class: { select: { id: true, name: true } } },
        });

        // Notify all students in the class
        const members = await prisma.classMember.findMany({ where: { classId, role: 'student' } });
        if (members.length > 0) {
            await prisma.notification.createMany({
                data: members.map((m) => ({
                    userId: m.userId,
                    type: 'assignment_created',
                    title: 'New Assignment',
                    message: `"${data.title}" posted in ${cls.name}`,
                    link: `/class/${classId}/assignment/${assignment.id}`,
                })),
            });
        }

        return assignment;
    },

    async update(id: string, data: any, userId: string) {
        const assignment = await prisma.assignment.findUnique({ where: { id }, include: { class: true } });
        if (!assignment) throw new AppError(404, 'Assignment not found');
        if (assignment.class.teacherId !== userId) throw new AppError(403, 'Only the teacher can update this assignment');

        const updateData: any = {};
        if (data.title !== undefined) updateData.title = data.title;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.instructions !== undefined) updateData.instructions = data.instructions;
        if (data.points !== undefined) updateData.points = data.points;
        if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
        if (data.dueTime !== undefined) updateData.dueTime = data.dueTime;
        if (data.topic !== undefined) updateData.topic = data.topic;
        if (data.status !== undefined) updateData.status = data.status;
        if (data.allowLate !== undefined) updateData.allowLate = data.allowLate;
        if (data.latePenaltyPct !== undefined) updateData.latePenaltyPct = data.latePenaltyPct;

        return prisma.assignment.update({ where: { id }, data: updateData });
    },

    async remove(id: string, userId: string) {
        const assignment = await prisma.assignment.findUnique({ where: { id }, include: { class: true } });
        if (!assignment) throw new AppError(404, 'Assignment not found');
        if (assignment.class.teacherId !== userId) throw new AppError(403, 'Only the teacher can delete this assignment');

        await prisma.assignment.delete({ where: { id } });
        return { success: true };
    },

    async getOverview() {
        const [total, published, withSubmissions] = await Promise.all([
            prisma.assignment.count(),
            prisma.assignment.count({ where: { status: 'published' } }),
            prisma.assignment.count({ where: { submissions: { some: {} } } }),
        ]);

        const assignments = await prisma.assignment.findMany({
            where: { status: 'published' },
            include: {
                class: { select: { id: true, name: true } },
                createdBy: { select: { name: true } },
                _count: { select: { submissions: true } },
                submissions: {
                    select: { isLate: true, grade: { select: { score: true } } },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return { total, published, withSubmissions, assignments };
    },
};
