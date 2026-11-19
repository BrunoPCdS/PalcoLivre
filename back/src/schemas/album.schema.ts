import { z } from 'zod';
import { genreEnum } from './band.schema';

export const trackItemSchema = z.object({
  title: z.string().min(1, 'O título da música é obrigatório').max(150),
  trackNumber: z.number().int().min(1).max(10, 'O número da faixa deve ser entre 1 e 10').optional(),
  duration: z.number().int().min(1, 'A duração deve ser informada em segundos'),
  audioUrl: z.string().url('URL de áudio inválida'),
  r2Key: z.string().min(1, 'Chave do R2 é obrigatória'),
});

export const createAlbumSchema = z.object({
  bandId: z.string().uuid('ID da banda inválido'),
  title: z.string().min(1, 'Título do álbum obrigatório').max(150),
  coverImageUrl: z.string().url('URL da capa inválida'),
  releaseYear: z
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 1),
  genre: genreEnum,
  // Validação estrita Zod: no máximo 10 músicas por álbum
  tracks: z
    .array(trackItemSchema)
    .min(1, 'O álbum deve conter pelo menos 1 música')
    .max(10, 'Regra PalcoLivre: cada álbum pode conter no máximo 10 músicas.')
    .optional(),
});

export const addTrackSchema = trackItemSchema;

export type CreateAlbumInput = z.infer<typeof createAlbumSchema>;
export type TrackItemInput = z.infer<typeof trackItemSchema>;
