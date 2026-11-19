import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { CryptoService } from '../services/crypto.service';
import { MailService } from '../services/mail.service';
import { AppError } from '../middlewares/error.middleware';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, role } = req.body;
      const mappedRole = (role === 'BAND' || role === 'BAND_MANAGER') ? 'BAND_MANAGER' : 'LISTENER';

      // Verifica se o e-mail já existe
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new AppError('Este e-mail já está cadastrado no PalcoLivre.', 409);
      }

      const passwordHash = await CryptoService.hashPassword(password);
      const verificationToken = CryptoService.generateRandomToken();

      const user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: mappedRole,
          verificationToken,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          createdAt: true,
        },
      });

      // Dispara e-mail de boas-vindas assíncrono via Mailtrap
      MailService.sendWelcomeEmail(user.email, user.name, user.role === 'BAND_MANAGER');

      // Gera token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      res.status(201).json({
        status: 'success',
        message: 'Conta criada com sucesso no PalcoLivre!',
        data: {
          user,
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          bands: {
            select: { id: true, name: true, slug: true, profileImageUrl: true },
          },
        },
      });

      if (!user) {
        throw new AppError('Credenciais inválidas. Verifique seu e-mail e senha.', 401);
      }

      const isPasswordValid = await CryptoService.comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new AppError('Credenciais inválidas. Verifique seu e-mail e senha.', 401);
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        env.JWT_SECRET,
        { expiresIn: env.JWT_EXPIRES_IN as any }
      );

      res.status(200).json({
        status: 'success',
        message: 'Login realizado com sucesso! Bem-vindo de volta ao palco.',
        data: {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
            bands: user.bands,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Não autenticado', 401);
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatarUrl: true,
          isVerified: true,
          createdAt: true,
          bands: {
            select: {
              id: true,
              name: true,
              slug: true,
              genre: true,
              profileImageUrl: true,
            },
          },
        },
      });

      if (!user) {
        throw new AppError('Usuário não encontrado', 404);
      }

      res.status(200).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const user = await prisma.user.findUnique({ where: { email } });

      if (user) {
        const resetToken = CryptoService.generateRandomToken();
        const resetExpires = new Date(Date.now() + 3600000); // 1 hora

        await prisma.user.update({
          where: { id: user.id },
          data: {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetExpires,
          },
        });

        await MailService.sendPasswordResetEmail(user.email, user.name, resetToken);
      }

      // Resposta genérica para evitar enumeração de usuários
      res.status(200).json({
        status: 'success',
        message: 'Se o e-mail estiver cadastrado, as instruções para redefinição foram enviadas.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;

      const user = await prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { gt: new Date() },
        },
      });

      if (!user) {
        throw new AppError('Token inválido ou expirado. Solicite uma nova redefinição.', 400);
      }

      const passwordHash = await CryptoService.hashPassword(password);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });

      res.status(200).json({
        status: 'success',
        message: 'Senha alterada com sucesso! Você já pode entrar com a nova credencial.',
      });
    } catch (error) {
      next(error);
    }
  }
}
