import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres').max(100),
  email: z.string().email('E-mail inválido').toLowerCase().trim(),
  password: z
    .string()
    .min(6, 'A senha deve ter no mínimo 6 caracteres')
    .max(100),
  role: z.enum(['LISTENER', 'BAND_MANAGER', 'USER', 'BAND']).default('LISTENER'),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido').toLowerCase().trim(),
  password: z.string().min(1, 'A senha é obrigatória'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('E-mail inválido').toLowerCase().trim(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(10, 'Token inválido'),
  password: z.string().min(6, 'A nova senha deve ter no mínimo 6 caracteres'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
