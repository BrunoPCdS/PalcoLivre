import { z } from 'zod';

export const genreEnum = z.enum([
  'ROCK',
  'INDIE',
  'METAL',
  'MPB',
  'POP',
  'PUNK',
  'HIP_HOP',
  'REGGAE',
  'BLUES',
  'ELECTRONIC',
  'OTHER',
]);

export const createBandSchema = z.object({
  name: z.string().min(2, 'O nome da banda deve ter no mínimo 2 caracteres').max(100),
  genre: genreEnum,
  foundationYear: z
    .number()
    .int()
    .min(1950, 'Ano de fundação deve ser maior ou igual a 1950')
    .max(new Date().getFullYear(), 'Ano de fundação não pode ser no futuro'),
  bio: z.string().min(10, 'A biografia deve conter pelo menos 10 caracteres').max(3000),
  members: z.string().min(3, 'Informe a lista de integrantes e instrumentos').max(1000),
  contactPhone: z.string().min(8, 'Telefone de contato inválido').max(25),
  contactEmail: z.string().email('E-mail de contato inválido').toLowerCase().trim(),
  profileImageUrl: z.string().url('URL inválida').optional().nullable(),
  bannerImageUrl: z.string().url('URL inválida').optional().nullable(),
});

export const updateBandSchema = createBandSchema.partial();

export const contactBandSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório'),
  email: z.string().email('E-mail inválido'),
  message: z.string().min(10, 'A mensagem deve ter pelo menos 10 caracteres').max(2000),
});

export const addBandPhotoSchema = z.object({
  imageUrl: z.string().url('URL da imagem inválida'),
  caption: z.string().max(200).optional(),
  order: z.number().int().default(0),
});

export type CreateBandInput = z.infer<typeof createBandSchema>;
export type UpdateBandInput = z.infer<typeof updateBandSchema>;
