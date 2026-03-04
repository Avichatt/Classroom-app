// ============================================
// Upload Service (AWS S3)
// ============================================
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../../config/env';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../types';

// Optional Initialization
const s3Client = env.AWS_ACCESS_KEY_ID ? new S3Client({
    region: env.AWS_REGION,
    endpoint: env.AWS_ENDPOINT_URL ? env.AWS_ENDPOINT_URL : undefined,
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
}) : null;

export const uploadService = {
    async getPresignedUrl(fileName: string, fileType: string, fileSize: number) {
        if (!s3Client) {
            // Return a simulated URL if S3 is not configured
            return {
                uploadUrl: `http://localhost:${env.PORT}/api/uploads/local`,
                fileKey: `local_${uuidv4()}_${fileName}`,
                fileUrl: `http://localhost:${env.PORT}/uploads/local_${uuidv4()}_${fileName}`,
            };
        }

        // Validate size
        if (fileSize > env.MAX_FILE_SIZE_MB * 1024 * 1024) {
            throw new AppError(400, `File size exceeds maximum limit of ${env.MAX_FILE_SIZE_MB}MB`);
        }

        const fileExtension = fileName.split('.').pop();
        const fileKey = `uploads/${uuidv4()}.${fileExtension}`;

        const command = new PutObjectCommand({
            Bucket: env.AWS_S3_BUCKET,
            Key: fileKey,
            ContentType: fileType,
        });

        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        const fileUrl = env.AWS_ENDPOINT_URL
            ? `${env.AWS_ENDPOINT_URL}/${env.AWS_S3_BUCKET}/${fileKey}`
            : `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${fileKey}`;

        return { uploadUrl, fileKey, fileUrl };
    },

    async deleteFile(fileKey: string) {
        if (!s3Client || fileKey.startsWith('local_')) return { success: true };

        const command = new DeleteObjectCommand({
            Bucket: env.AWS_S3_BUCKET,
            Key: fileKey,
        });

        await s3Client.send(command);
        return { success: true };
    },
};
