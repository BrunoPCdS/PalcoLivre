import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '../config/env';

export class CryptoService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12; // 96 bits recomendado para GCM
  private static readonly AUTH_TAG_LENGTH = 16;

  /**
   * Hasheia uma senha com bcrypt e salt rounds de segurança elevada
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  /**
   * Compara uma senha em texto claro com o hash armazenado
   */
  static async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }

  /**
   * Criptografia simétrica com AES-256-GCM para dados sensíveis (contato/documentos)
   */
  static encryptSensitive(text: string): string {
    if (!text) return text;
    // Garante chave de 32 bytes
    const key = crypto.createHash('sha256').update(env.ENCRYPTION_KEY).digest();
    const iv = crypto.randomBytes(this.IV_LENGTH);

    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Formato: iv:authTag:encrypted
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decifra o texto simétrico AES-256-GCM
   */
  static decryptSensitive(cipherText: string): string {
    if (!cipherText || !cipherText.includes(':')) return cipherText;

    try {
      const [ivHex, authTagHex, encryptedHex] = cipherText.split(':');
      if (!ivHex || !authTagHex || !encryptedHex) return cipherText;

      const key = crypto.createHash('sha256').update(env.ENCRYPTION_KEY).digest();
      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch {
      // Se já estava em texto claro ou falhar decifração
      return cipherText;
    }
  }

  /**
   * Gera token aleatório seguro para verificação ou recuperação
   */
  static generateRandomToken(bytes = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }
}
