import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'LISTENER' | 'BAND_MANAGER' | 'ADMIN';
}

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware obrigatório: Exige que o usuário esteja autenticado via Bearer JWT.
 * Bloqueia visitantes não logados com 401 Unauthorized.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      status: 'error',
      code: 'AUTH_REQUIRED',
      message: 'Acesso restrito: Faça login ou crie sua conta no PalcoLivre para interagir.',
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      status: 'error',
      code: 'INVALID_TOKEN',
      message: 'Sessão expirada ou token inválido. Faça login novamente.',
    });
  }
};

/**
 * Middleware opcional: Identifica o usuário se o token estiver presente,
 * mas NÃO bloqueia visitantes anônimos (permite audição e navegação pública).
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
      req.user = decoded;
    } catch {
      // Ignora erro e continua como visitante anônimo
    }
  }
  next();
};

/**
 * Middleware de autorização por papel (Role-based Access Control)
 */
export const requireRole = (roles: Array<'LISTENER' | 'BAND_MANAGER' | 'ADMIN'>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ status: 'error', message: 'Não autenticado.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        status: 'error',
        message: 'Acesso negado: Você não possui permissão para realizar esta ação.',
      });
      return;
    }

    next();
  };
};
