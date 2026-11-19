import { mailerTransporter } from '../config/mailer';
import { env } from '../config/env';

export class MailService {
  /**
   * Envia e-mail de boas-vindas com estética dark mode de PalcoLivre
   */
  static async sendWelcomeEmail(to: string, name: string, isBand: boolean): Promise<void> {
    const roleMessage = isBand
      ? 'Seu perfil de banda está pronto para subir ao palco! Publique seus álbuns, faixas e conecte-se com novos fãs.'
      : 'Explore as melhores bandas e lançamentos independentes sem algoritmos limitadores.';

    const html = `
      <div style="background-color: #0F1014; color: #F8FAFC; font-family: sans-serif; padding: 40px; border-radius: 8px;">
        <h1 style="color: #FF5500; margin-bottom: 8px;">Bem-vindo ao PalcoLivre!</h1>
        <p style="color: #94A3B8; font-size: 16px;">A voz da música independente.</p>
        <hr style="border: 1px solid #1A1C23; margin: 24px 0;" />
        <p>Olá, <strong>${name}</strong>!</p>
        <p>${roleMessage}</p>
        <div style="margin: 32px 0;">
          <a href="${env.FRONTEND_URL}" style="background-color: #FF5500; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Acessar o Palco
          </a>
        </div>
        <p style="color: #94A3B8; font-size: 12px;">PalcoLivre &copy; 2026 - Conectando arte autêntica ao público real.</p>
      </div>
    `;

    try {
      await mailerTransporter.sendMail({
        from: env.MAIL_FROM,
        to,
        subject: 'Bem-vindo ao PalcoLivre - O palco é seu!',
        html,
      });
    } catch (error) {
      console.error('Erro ao enviar e-mail de boas-vindas:', error);
    }
  }

  /**
   * Envia e-mail com link de recuperação de senha
   */
  static async sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${token}`;

    const html = `
      <div style="background-color: #0F1014; color: #F8FAFC; font-family: sans-serif; padding: 40px; border-radius: 8px;">
        <h2 style="color: #FF5500;">Recuperação de Senha - PalcoLivre</h2>
        <p>Olá, <strong>${name}</strong>.</p>
        <p>Recebemos uma solicitação para redefinir a sua senha no PalcoLivre.</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #8B5CF6; color: #FFFFFF; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Redefinir Minha Senha
          </a>
        </div>
        <p style="color: #94A3B8; font-size: 13px;">Se você não solicitou esta alteração, ignore este e-mail. Este link expira em 1 hora.</p>
      </div>
    `;

    try {
      await mailerTransporter.sendMail({
        from: env.MAIL_FROM,
        to,
        subject: 'Recuperação de Senha - PalcoLivre',
        html,
      });
    } catch (error) {
      console.error('Erro ao enviar e-mail de recuperação de senha:', error);
    }
  }

  /**
   * Notificação quando um fã ou contratante envia mensagem para a banda
   */
  static async sendBandContactNotification(
    bandEmail: string,
    bandName: string,
    senderName: string,
    senderEmail: string,
    message: string
  ): Promise<void> {
    const html = `
      <div style="background-color: #0F1014; color: #F8FAFC; font-family: sans-serif; padding: 40px; border-radius: 8px;">
        <h2 style="color: #FF5500;">Novo Contato no PalcoLivre!</h2>
        <p>A sua banda <strong>${bandName}</strong> recebeu um novo contato através da página pública:</p>
        <div style="background-color: #1A1C23; padding: 16px; border-left: 4px solid #FF5500; margin: 20px 0;">
          <p><strong>De:</strong> ${senderName} (${senderEmail})</p>
          <p><strong>Mensagem:</strong></p>
          <p style="white-space: pre-wrap; color: #F8FAFC;">${message}</p>
        </div>
        <p style="color: #94A3B8; font-size: 13px;">Responda diretamente para ${senderEmail}.</p>
      </div>
    `;

    try {
      await mailerTransporter.sendMail({
        from: env.MAIL_FROM,
        to: bandEmail,
        replyTo: senderEmail,
        subject: `[PalcoLivre] Nova mensagem para ${bandName}`,
        html,
      });
    } catch (error) {
      console.error('Erro ao enviar e-mail de contato para a banda:', error);
    }
  }
}
