import { z } from 'zod';

export const presignedUrlSchema = z.object({
  category: z.enum(['avatar', 'banner', 'gallery', 'album-cover', 'track-audio'], {
    errorMap: () => ({ message: 'Categoria inválida. Opções: avatar, banner, gallery, album-cover, track-audio' }),
  }),
  contentType: z.string().min(3, 'Content-Type é obrigatório'),
  fileSize: z.number().int().positive('O tamanho do arquivo deve ser maior que zero'),
  entityId: z.string().min(1, 'ID da entidade é obrigatório'),
});

export type PresignedUrlInput = z.infer<typeof presignedUrlSchema>;
