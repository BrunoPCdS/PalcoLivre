import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_URL: z.string().url().default('http://localhost:3333'),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  // Neon Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  DIRECT_URL: z.string().optional(),

  // Auth & Security
  JWT_SECRET: z.string().min(16, 'JWT_SECRET deve ter no mínimo 16 caracteres').default('palcolivre_secret_jwt_key_default_2026'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  ENCRYPTION_KEY: z.string().min(32, 'ENCRYPTION_KEY deve ter 32 bytes (64 caracteres hex ou 32 chars)').default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),

  // Cloudflare R2
  CLOUDFLARE_ACCOUNT_ID: z.string().default('sample_account_id'),
  R2_ACCESS_KEY_ID: z.string().default('sample_access_key'),
  R2_SECRET_ACCESS_KEY: z.string().default('sample_secret_key'),
  R2_BUCKET_NAME: z.string().default('palcolivre-media'),
  R2_PUBLIC_URL: z.string().url().default('https://pub-sample.r2.dev'),

  // Mailtrap
  MAILTRAP_HOST: z.string().default('sandbox.smtp.mailtrap.io'),
  MAILTRAP_PORT: z.coerce.number().default(2525),
  MAILTRAP_USER: z.string().default('sample_mailtrap_user'),
  MAILTRAP_PASS: z.string().default('sample_mailtrap_pass'),
  MAIL_FROM: z.string().default('PalcoLivre <nao-responda@palcolivre.com.br>'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Erro de validação das variáveis de ambiente:');
  console.error(_env.error.format());
  // Em desenvolvimento podemos prosseguir com defaults se não for estritamente fatal
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Falha crítica nas variáveis de ambiente em produção.');
  }
}

export const env = _env.success ? _env.data : (process.env as unknown as z.infer<typeof envSchema>);
