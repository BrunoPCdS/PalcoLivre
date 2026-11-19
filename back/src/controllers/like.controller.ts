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

  /**
   * Listar bandas favoritadas pelo usuário logado
   */
  static async getMyLikedBands(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Não autenticado', 401);
      const likes = await prisma.bandLike.findMany({
        where: { userId: req.user.userId },
        include: {
          band: {
            include: {
              _count: { select: { likes: true, albums: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const bands = likes.map((item) => ({
        ...item.band,
        contactPhone: undefined,
        likeCount: item.band._count.likes,
        albumCount: item.band._count.albums,
        isLiked: true,
      }));

      res.status(200).json({
        status: 'success',
        data: { bands },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Listar faixas favoritadas pelo usuário logado
   */
  static async getMyLikedTracks(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Não autenticado', 401);
      const likes = await prisma.trackLike.findMany({
        where: { userId: req.user.userId },
        include: {
          track: {
            include: {
              album: {
                include: {
                  band: {
                    select: { id: true, name: true, slug: true, profileImageUrl: true },
                  },
                },
              },
              _count: { select: { likes: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const tracks = likes.map((item) => ({
        id: item.track.id,
        albumId: item.track.albumId,
        title: item.track.title,
        trackNumber: item.track.trackNumber,
        duration: item.track.duration,
        audioUrl: item.track.audioUrl,
        r2Key: item.track.r2Key,
        playCount: item.track.playCount,
        likesCount: item.track._count.likes,
        isLiked: true,
        bandName: item.track.album.band.name,
        bandSlug: item.track.album.band.slug,
        coverImageUrl: item.track.album.coverImageUrl,
      }));

      res.status(200).json({
        status: 'success',
        data: { tracks },
      });
    } catch (error) {
      next(error);
    }
  }
}
