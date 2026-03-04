// ============================================
// Auth Service — Business Logic
// ============================================
import prisma from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/hash';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from '../../utils/jwt';
import { AppError } from '../../types';
import { createAuditLog } from '../../middleware/auditLogger';

export const authService = {
    async signup(data: { name: string; email: string; password: string; role?: string }) {
        const existing = await prisma.user.findUnique({ where: { email: data.email } });
        if (existing) throw new AppError(409, 'Email already registered');

        const passwordHash = await hashPassword(data.password);
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
                role: (data.role?.toUpperCase() === 'FACULTY' ? 'FACULTY' : data.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'STUDENT') as any,
            },
            select: { id: true, name: true, email: true, role: true, avatarUrl: true, status: true },
        });

        await createAuditLog(user.id, 'User Registered', 'registration', `New ${user.role} registered: ${user.email}`);

        const payload: TokenPayload = { sub: user.id, email: user.email, role: user.role };
        return {
            user,
            accessToken: generateAccessToken(payload),
            refreshToken: generateRefreshToken(payload),
        };
    },

    async login(email: string, password: string, ipAddress?: string) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new AppError(401, 'Invalid email or password');
        if (user.status === 'SUSPENDED') throw new AppError(403, 'Account suspended. Contact administrator.');

        const isValid = await comparePassword(password, user.passwordHash);
        if (!isValid) {
            await createAuditLog(user.id, 'Failed Login', 'login', `Failed login attempt for ${email}`, ipAddress, 'warning');
            throw new AppError(401, 'Invalid email or password');
        }

        // Update last login
        await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });
        await createAuditLog(user.id, 'Login', 'login', `Successful login from ${ipAddress || 'unknown'}`, ipAddress);

        const payload: TokenPayload = { sub: user.id, email: user.email, role: user.role };
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
                status: user.status,
            },
            accessToken: generateAccessToken(payload),
            refreshToken: generateRefreshToken(payload),
        };
    },

    async refreshToken(refreshToken: string) {
        const payload = verifyRefreshToken(refreshToken);
        const user = await prisma.user.findUnique({ where: { id: payload.sub } });
        if (!user) throw new AppError(401, 'User not found');
        if (user.status === 'SUSPENDED') throw new AppError(403, 'Account suspended');

        const newPayload: TokenPayload = { sub: user.id, email: user.email, role: user.role };
        return {
            accessToken: generateAccessToken(newPayload),
            refreshToken: generateRefreshToken(newPayload),
        };
    },

    async getProfile(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true, avatarUrl: true, status: true, createdAt: true, lastLogin: true },
        });
        if (!user) throw new AppError(404, 'User not found');
        return user;
    },
};
