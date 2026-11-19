import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { requireAuth } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { presignedUrlSchema } from '../schemas/upload.schema';

const router = Router();

// Rota protegida para geração de Presigned URL no Cloudflare R2
router.post('/presigned-url', requireAuth, validateBody(presignedUrlSchema), UploadController.getPresignedUrl);

export default router;
