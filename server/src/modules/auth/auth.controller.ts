// ============================================
// Auth Controller
// ============================================
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { authService } from './auth.service';
import { AuthRequest } from '../../types';

const signupSchema = z.object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(100),
    role: z.enum(['student', 'faculty', 'admin']).optional().default('student'),
});

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

export const authController = {
    async signup(req: Request, res: Response, next: NextFunction) {
        try {
            const data = signupSchema.parse(req.body);
            const result = await authService.signup(data);
            res.status(201).json({ success: true, data: result });
        } catch (err) { next(err); }
    },

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const data = loginSchema.parse(req.body);
            const ipAddress = req.ip || req.socket.remoteAddress;
            const result = await authService.login(data.email, data.password, ipAddress);
            res.json({ success: true, data: result });
        } catch (err) { next(err); }
    },

    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken) return res.status(400).json({ success: false, error: 'Refresh token required' });
            const result = await authService.refreshToken(refreshToken);
            res.json({ success: true, data: result });
        } catch (err) { next(err); }
    },

    async me(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const user = await authService.getProfile(req.user!.sub);
            res.json({ success: true, data: user });
        } catch (err) { next(err); }
    },

    async logout(_req: Request, res: Response) {
        // Client-side token removal; server can blacklist token if needed
        res.json({ success: true, message: 'Logged out successfully' });
    },
};
