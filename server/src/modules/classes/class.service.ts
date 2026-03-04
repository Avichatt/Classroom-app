// ============================================
// Class Service
// ============================================
import prisma from '../../config/database';
import { AppError } from '../../types';
import { v4 as uuidv4 } from 'uuid';

function generateJoinCode(): string {
    return uuidv4().slice(0, 7).toUpperCase();
}

export const classService = {
    async list(userId: string, role: string) {
        if (role === 'ADMIN') {
            return prisma.class.findMany({
                include: {
                    teacher: { select: { id: true, name: true, email: true } },
                    _count: { select: { members: true, assignments: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
        }

        if (role === 'FACULTY') {
            return prisma.class.findMany({
                where: { teacherId: userId },
                include: {
                    teacher: { select: { id: true, name: true, email: true } },
                    _count: { select: { members: true, assignments: true } },
                },
                orderBy: { createdAt: 'desc' },
            });
        }

        // Student — classes they're enrolled in
        const memberships = await prisma.classMember.findMany({
            where: { userId },
            include: {
                class: {
                    include: {
                        teacher: { select: { id: true, name: true, email: true } },
                        _count: { select: { members: true, assignments: true } },
                    },
                },
            },
        });
        return memberships.map((m) => m.class);
    },

    async getById(id: string) {
        const cls = await prisma.class.findUnique({
            where: { id },
            include: {
                teacher: { select: { id: true, name: true, email: true, avatarUrl: true } },
                members: {
                    include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } },
                },
                assignments: { orderBy: { createdAt: 'desc' } },
                announcements: { orderBy: { createdAt: 'desc' }, take: 20 },
                _count: { select: { members: true, assignments: true } },
            },
        });
        if (!cls) throw new AppError(404, 'Class not found');
        return cls;
    },

    async create(data: { name: string; section?: string; subject?: string; description?: string; colorTheme?: string }, teacherId: string) {
        const joinCode = generateJoinCode();

        const cls = await prisma.class.create({
            data: {
                name: data.name,
                section: data.section,
                subject: data.subject,
                description: data.description,
                colorTheme: data.colorTheme || '#1967d2',
                joinCode,
                teacherId,
            },
            include: { teacher: { select: { id: true, name: true, email: true } } },
        });

        return cls;
    },

    async update(id: string, data: { name?: string; section?: string; subject?: string; description?: string }, userId: string) {
        const cls = await prisma.class.findUnique({ where: { id } });
        if (!cls) throw new AppError(404, 'Class not found');
        if (cls.teacherId !== userId) throw new AppError(403, 'Only the teacher can update this class');

        return prisma.class.update({ where: { id }, data });
    },

    async join(joinCode: string, userId: string) {
        const cls = await prisma.class.findUnique({ where: { joinCode } });
        if (!cls) throw new AppError(404, 'Invalid class code');

        const existing = await prisma.classMember.findUnique({
            where: { classId_userId: { classId: cls.id, userId } },
        });
        if (existing) throw new AppError(409, 'Already enrolled in this class');

        await prisma.classMember.create({
            data: { classId: cls.id, userId, role: 'student' },
        });

        // Create notification for teacher
        await prisma.notification.create({
            data: {
                userId: cls.teacherId,
                type: 'class_join',
                title: 'New student joined',
                message: `A student has joined ${cls.name}`,
                link: `/class/${cls.id}`,
            },
        });

        return cls;
    },

    async leave(classId: string, userId: string) {
        await prisma.classMember.delete({
            where: { classId_userId: { classId, userId } },
        });
        return { success: true };
    },

    async getMembers(classId: string) {
        return prisma.classMember.findMany({
            where: { classId },
            include: { user: { select: { id: true, name: true, email: true, avatarUrl: true, role: true } } },
        });
    },

    async archive(id: string, userId: string) {
        const cls = await prisma.class.findUnique({ where: { id } });
        if (!cls) throw new AppError(404, 'Class not found');
        if (cls.teacherId !== userId) throw new AppError(403, 'Only the teacher can archive this class');

        return prisma.class.update({ where: { id }, data: { status: 'archived' } });
    },
};
