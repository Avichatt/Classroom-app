// ============================================
// Grade Service
// ============================================
import prisma from '../../config/database';
import { AppError } from '../../types';

export const gradeService = {
    async gradeSubmission(submissionId: string, teacherId: string, data: { score: number; feedback?: string; rubricScores?: Array<{ rubricId: string; score: number }> }) {
        const submission = await prisma.submission.findUnique({
            where: { id: submissionId },
            include: { assignment: { include: { class: true } } },
        });

        if (!submission) throw new AppError(404, 'Submission not found');
        if (submission.assignment.class.teacherId !== teacherId) throw new AppError(403, 'Permission denied');

        const grade = await prisma.grade.upsert({
            where: { submissionId },
            update: {
                score: data.score,
                maxScore: submission.assignment.points,
                feedback: data.feedback,
                gradedById: teacherId,
                gradedAt: new Date(),
            },
            create: {
                submissionId,
                score: data.score,
                maxScore: submission.assignment.points,
                feedback: data.feedback,
                gradedById: teacherId,
            },
        });

        if (data.rubricScores && data.rubricScores.length > 0) {
            await prisma.rubricScore.deleteMany({ where: { gradeId: grade.id } });
            await prisma.rubricScore.createMany({
                data: data.rubricScores.map((rs) => ({ gradeId: grade.id, rubricId: rs.rubricId, score: rs.score })),
            });
        }

        await prisma.submission.update({ where: { id: submissionId }, data: { status: 'graded' } });

        // Notify student
        await prisma.notification.create({
            data: {
                userId: submission.studentId,
                type: 'grade_posted',
                title: 'Assignment Graded',
                message: `Your instructor has graded "${submission.assignment.title}"`,
                link: `/class/${submission.assignment.classId}/assignment/${submission.assignment.id}`,
            },
        });

        return grade;
    },

    async getGradebook(classId: string, teacherId: string, role: string) {
        if (role === 'FACULTY') {
            const cls = await prisma.class.findUnique({ where: { id: classId } });
            if (cls?.teacherId !== teacherId) throw new AppError(403, 'Permission denied');
        }

        const students = await prisma.classMember.findMany({
            where: { classId, role: 'student' },
            include: {
                user: { select: { id: true, name: true, email: true, avatarUrl: true } },
            },
        });

        const assignments = await prisma.assignment.findMany({
            where: { classId },
            include: {
                submissions: {
                    include: { grade: true },
                },
            },
            orderBy: { dueDate: 'asc' },
        });

        return { students: students.map(s => s.user), assignments };
    },
};
