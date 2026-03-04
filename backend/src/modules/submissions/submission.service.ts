// ============================================
// Submission Service
// ============================================
import prisma from '../../config/database';
import { AppError } from '../../types';

export const submissionService = {
    async submit(assignmentId: string, studentId: string, data: { textEntry?: string; files?: Array<{ fileName: string; fileKey: string; fileUrl?: string; fileSize: number; fileType: string }> }) {
        const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId } });
        if (!assignment) throw new AppError(404, 'Assignment not found');

        const now = new Date();
        const isLate = assignment.dueDate ? now > assignment.dueDate : false;

        // Check if late submissions are allowed
        if (isLate && !assignment.allowLate) {
            throw new AppError(400, 'Late submissions are disabled for this assignment');
        }

        const submission = await prisma.submission.upsert({
            where: { assignmentId_studentId: { assignmentId, studentId } },
            update: {
                textEntry: data.textEntry,
                isLate,
                status: 'submitted',
                submittedAt: now,
            },
            create: {
                assignmentId,
                studentId,
                textEntry: data.textEntry,
                isLate,
                status: 'submitted',
                submittedAt: now,
            },
        });

        if (data.files && data.files.length > 0) {
            // Clear old files for this submission and replace
            await prisma.submissionFile.deleteMany({ where: { submissionId: submission.id } });
            await prisma.submissionFile.createMany({
                data: data.files.map(f => ({ ...f, submissionId: submission.id })),
            });
        }

        // Notify teacher
        await prisma.notification.create({
            data: {
                userId: assignment.createdById,
                type: 'new_submission',
                title: 'New submission',
                message: `A new submission was made for ${assignment.title}`,
                link: `/class/${assignment.classId}/assignment/${assignment.id}/submissions`,
            },
        });

        return submission;
    },

    async getForAssignment(assignmentId: string, teacherId: string, role: string) {
        const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId }, include: { class: true } });
        if (!assignment) throw new AppError(404, 'Assignment not found');

        if (role === 'FACULTY' && assignment.class.teacherId !== teacherId) {
            throw new AppError(403, 'Permission denied');
        }

        return prisma.submission.findMany({
            where: { assignmentId },
            include: {
                student: { select: { id: true, name: true, email: true, avatarUrl: true } },
                files: true,
                grade: true,
                plagiarismReportsA: true,
            },
            orderBy: { submittedAt: 'desc' },
        });
    },

    async getById(id: string, userId: string, role: string) {
        const submission = await prisma.submission.findUnique({
            where: { id },
            include: {
                student: { select: { id: true, name: true, email: true, avatarUrl: true } },
                files: true,
                grade: { include: { rubricScores: true } },
                assignment: { include: { class: true, rubrics: true } },
            },
        });

        if (!submission) throw new AppError(404, 'Submission not found');

        if (role === 'STUDENT' && submission.studentId !== userId) {
            throw new AppError(403, 'Permission denied');
        }
        if (role === 'FACULTY' && submission.assignment.class.teacherId !== userId) {
            throw new AppError(403, 'Permission denied');
        }

        return submission;
    },
};
