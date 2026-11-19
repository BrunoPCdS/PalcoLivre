import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { r2Client } from '../config/r2';
import { env } from '../config/env';

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
  publicUrl: string;
}

export type StorageCategory = 'avatar' | 'banner' | 'gallery' | 'album-cover' | 'track-audio';

export class StorageService {
  /**
   * Mapeamento de tipos MIME permitidos por categoria
   */
  private static readonly ALLOWED_MIME_TYPES: Record<StorageCategory, string[]> = {
    avatar: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    banner: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    gallery: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    'album-cover': ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    'track-audio': ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/aac', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/x-m4a'],
  };

  /**
   * Limites de tamanho em bytes por categoria
   */
  private static readonly MAX_FILE_SIZES: Record<StorageCategory, number> = {
    avatar: 5 * 1024 * 1024,      // 5 MB
    banner: 10 * 1024 * 1024,    // 10 MB
    gallery: 8 * 1024 * 1024,     // 8 MB
    'album-cover': 8 * 1024 * 1024, // 8 MB
    'track-audio': 50 * 1024 * 1024, // 50 MB (alta qualidade MP3/WAV)
  };

  /**
   * Gera uma URL pré-assinada para upload seguro e direto do frontend para o Cloudflare R2
   */
  static async getPresignedUploadUrl(
    category: StorageCategory,
    contentType: string,
    fileSize: number,
    entityId: string
  ): Promise<PresignedUrlResponse> {
    // 1. Validar Tipo MIME
    const allowed = this.ALLOWED_MIME_TYPES[category];
    if (!allowed || !allowed.includes(contentType.toLowerCase())) {
      throw new Error(`Tipo de arquivo não permitido para ${category}. Formatos aceitos: ${allowed?.join(', ')}`);
    }

    // 2. Validar Tamanho Máximo
    const maxSize = this.MAX_FILE_SIZES[category];
    if (fileSize > maxSize) {
      throw new Error(`Arquivo excede o tamanho máximo permitido de ${(maxSize / (1024 * 1024)).toFixed(0)}MB.`);
    }

    // 3. Determinar extensão e chave única
    const ext = this.getExtensionFromMime(contentType);
    const uniqueId = crypto.randomUUID();
    const fileKey = `${category}/${entityId}/${uniqueId}.${ext}`;

    // 4. Criar comando PutObject para o R2
    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
      ContentLength: fileSize,
    });

    // 5. Assinar URL com validade de 15 minutos (900 segundos)
    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 });
    const publicUrl = `${env.R2_PUBLIC_URL}/${fileKey}`;

    return {
      uploadUrl,
      fileKey,
      publicUrl,
    };
  }

  /**
   * Remove arquivo do bucket Cloudflare R2
   */
  static async deleteFile(fileKey: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: fileKey,
      });
      await r2Client.send(command);
    } catch (error) {
      console.error(`Erro ao deletar arquivo ${fileKey} no R2:`, error);
    }
  }

  private static getExtensionFromMime(mime: string): string {
    const map: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
      'audio/wav': 'wav',
      'audio/x-wav': 'wav',
      'audio/aac': 'aac',
      'audio/ogg': 'ogg',
      'audio/webm': 'webm',
      'audio/mp4': 'm4a',
      'audio/x-m4a': 'm4a',
    };
    return map[mime.toLowerCase()] || 'bin';
  }
}
