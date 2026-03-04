// ============================================
// Upload Controller
// ============================================
import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { uploadService } from './upload.service';
import { AuthRequest } from '../../types';

const presignSchema = z.object({
    fileName: z.string().min(1),
    fileType: z.string().min(1),
    fileSize: z.number().min(1),
});

export const uploadController = {
    async presign(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const data = presignSchema.parse(req.body);
            const result = await uploadService.getPresignedUrl(data.fileName, data.fileType, data.fileSize);
            res.json({ success: true, data: result });
        } catch (err) { next(err); }
    },

    async deleteFile(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { fileKey } = req.body;
            if (!fileKey) return res.status(400).json({ success: false, error: 'fileKey is required' });
            const result = await uploadService.deleteFile(fileKey);
            res.json({ success: true, data: result });
        } catch (err) { next(err); }
    },
};
