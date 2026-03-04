// ============================================
// User Service
// ============================================
import prisma from '../../config/database';
import { hashPassword } from '../../utils/hash';
import { AppError } from '../../types';
import { createAuditLog } from '../../middleware/auditLogger';

export const userService = {
    async list(params: { page?: number; limit?: number; role?: string; status?: string; search?: string }) {
        const { page = 1, limit = 20, role, status, search } = params;
        const where: any = {};
        if (role) where.role = role.toUpperCase();
        if (status) where.status = status.toUpperCase();
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: { id: true, name: true, email: true, role: true, status: true, avatarUrl: true, lastLogin: true, createdAt: true },
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where }),
        ]);

        return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
    },

    async getById(id: string) {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true, name: true, email: true, role: true, status: true,
                avatarUrl: true, lastLogin: true, createdAt: true,
                classMemberships: { include: { class: { select: { id: true, name: true } } } },
                cohortMembers: { include: { cohort: { select: { id: true, name: true } } } },
            },
        });
        if (!user) throw new AppError(404, 'User not found');
        return user;
    },

    async update(id: string, data: { name?: string; email?: string; role?: string; status?: string }, adminId: string) {
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.email) updateData.email = data.email;
        if (data.role) updateData.role = data.role.toUpperCase();
        if (data.status) updateData.status = data.status.toUpperCase();

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, name: true, email: true, role: true, status: true },
        });

        await createAuditLog(adminId, 'User Updated', 'user_management', `Updated user ${user.email}: ${JSON.stringify(data)}`);
        return user;
    },

    async suspend(id: string, adminId: string) {
        const user = await prisma.user.update({
            where: { id },
            data: { status: 'SUSPENDED' },
            select: { id: true, name: true, email: true, status: true },
        });
        await createAuditLog(adminId, 'User Suspended', 'user_management', `Suspended user ${user.email}`, undefined, 'critical');
        return user;
    },

    async reactivate(id: string, adminId: string) {
        const user = await prisma.user.update({
            where: { id },
            data: { status: 'ACTIVE' },
            select: { id: true, name: true, email: true, status: true },
        });
        await createAuditLog(adminId, 'User Reactivated', 'user_management', `Reactivated user ${user.email}`);
        return user;
    },

    async resetPassword(id: string, newPassword: string, adminId: string) {
        const passwordHash = await hashPassword(newPassword);
        await prisma.user.update({ where: { id }, data: { passwordHash } });
        await createAuditLog(adminId, 'Password Reset', 'user_management', `Reset password for user ${id}`, undefined, 'warning');
        return { success: true };
    },

    async remove(id: string, adminId: string) {
        const user = await prisma.user.findUnique({ where: { id }, select: { email: true } });
        await prisma.user.delete({ where: { id } });
        await createAuditLog(adminId, 'User Deleted', 'user_management', `Deleted user ${user?.email}`, undefined, 'critical');
        return { success: true };
    },

    async bulkImport(users: Array<{ name: string; email: string; role: string; password?: string }>, adminId: string) {
        const results = { created: 0, skipped: 0, errors: [] as string[] };

        for (const u of users) {
            try {
                const existing = await prisma.user.findUnique({ where: { email: u.email } });
                if (existing) { results.skipped++; continue; }

                const passwordHash = await hashPassword(u.password || 'ChangeMe123!');
                await prisma.user.create({
                    data: { name: u.name, email: u.email, passwordHash, role: u.role.toUpperCase() as any },
                });
                results.created++;
            } catch (err: any) {
                results.errors.push(`Failed to import ${u.email}: ${err.message}`);
            }
        }

        await createAuditLog(adminId, 'Bulk Import', 'user_management', `Imported ${results.created} users, skipped ${results.skipped}`);
        return results;
    },

    async getStats() {
        const [totalStudents, totalFaculty, totalAdmins, activeUsers, suspendedUsers] = await Promise.all([
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.user.count({ where: { role: 'FACULTY' } }),
            prisma.user.count({ where: { role: 'ADMIN' } }),
            prisma.user.count({ where: { status: 'ACTIVE' } }),
            prisma.user.count({ where: { status: 'SUSPENDED' } }),
        ]);
        return { totalStudents, totalFaculty, totalAdmins, activeUsers, suspendedUsers };
    },
};
