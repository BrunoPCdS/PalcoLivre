import { Request, Response, NextFunction } from 'express';
import { StorageService } from '../services/storage.service';
import { AppError } from '../middlewares/error.middleware';

export class UploadController {
  /**
   * Gera uma presigned URL no Cloudflare R2 para upload direto pelo cliente
   */
  static async getPresignedUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Não autenticado', 401);

      const { category, contentType, fileSize, entityId } = req.body;

      const result = await StorageService.getPresignedUploadUrl(
        category,
        contentType,
        fileSize,
        entityId
      );

      res.status(200).json({
        status: 'success',
        message: 'URL pré-assinada gerada com sucesso. Realize o PUT direto no Cloudflare R2.',
        data: result,
      });
    } catch (error: any) {
      next(new AppError(error.message || 'Falha ao gerar URL de upload.', 400));
    }
  }
}
