import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AppError } from '../middlewares/error.middleware';

export class LikeController {
  /**
   * Curtir / Descurtir Banda (Exige autenticação)
   */
  static async toggleBandLike(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Acesso restrito: Cadastre-se ou faça login para curtir bandas.', 401);
      const { bandId } = req.params;
      const userId = req.user.userId;

      const existingLike = await prisma.bandLike.findUnique({
        where: {
          userId_bandId: { userId, bandId },
        },
      });

      let isLiked = false;
      if (existingLike) {
        await prisma.bandLike.delete({ where: { id: existingLike.id } });
        isLiked = false;
      } else {
        await prisma.bandLike.create({
          data: { userId, bandId },
        });
        isLiked = true;
      }

      const totalLikes = await prisma.bandLike.count({ where: { bandId } });

      res.status(200).json({
        status: 'success',
        data: {
          isLiked,
          likeCount: totalLikes,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Curtir / Descurtir Álbum (Exige autenticação)
   */
  static async toggleAlbumLike(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Acesso restrito: Cadastre-se ou faça login para curtir álbuns.', 401);
      const { albumId } = req.params;
      const userId = req.user.userId;

      const existingLike = await prisma.albumLike.findUnique({
        where: {
          userId_albumId: { userId, albumId },
        },
      });

      let isLiked = false;
      if (existingLike) {
        await prisma.albumLike.delete({ where: { id: existingLike.id } });
        isLiked = false;
      } else {
        await prisma.albumLike.create({
          data: { userId, albumId },
        });
        isLiked = true;
      }

      const totalLikes = await prisma.albumLike.count({ where: { albumId } });

      res.status(200).json({
        status: 'success',
        data: {
          isLiked,
          likeCount: totalLikes,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Curtir / Descurtir Faixa (Exige autenticação)
   */
  static async toggleTrackLike(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Acesso restrito: Cadastre-se para favoritar faixas.', 401);
      const { trackId } = req.params;
      const userId = req.user.userId;

      const existingLike = await prisma.trackLike.findUnique({
        where: {
          userId_trackId: { userId, trackId },
        },
      });

      let isLiked = false;
      if (existingLike) {
        await prisma.trackLike.delete({ where: { id: existingLike.id } });
        isLiked = false;
      } else {
        await prisma.trackLike.create({
          data: { userId, trackId },
        });
        isLiked = true;
      }

      const totalLikes = await prisma.trackLike.count({ where: { trackId } });

      res.status(200).json({
        status: 'success',
        data: {
          isLiked,
          likeCount: totalLikes,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
