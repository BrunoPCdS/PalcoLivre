import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { StorageService } from '../services/storage.service';
import { AppError } from '../middlewares/error.middleware';

export class AlbumController {
  /**
   * Criação de álbum com validação estrita de até 10 músicas
   */
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Não autenticado', 401);

      const { bandId, title, coverImageUrl, releaseYear, genre, tracks } = req.body;

      // Validação de limite de 10 músicas por álbum
      if (tracks && tracks.length > 10) {
        throw new AppError(
          'Regra PalcoLivre: Cada álbum pode conter no máximo 10 músicas.',
          400
        );
      }

      // Verifica posse da banda
      const band = await prisma.band.findUnique({ where: { id: bandId } });
      if (!band) throw new AppError('Banda não encontrada.', 404);

      if (band.userId !== req.user.userId && req.user.role !== 'ADMIN') {
        throw new AppError('Você não tem permissão para adicionar álbuns nesta banda.', 403);
      }

      // Criação transacional do álbum e faixas
      const album = await prisma.$transaction(async (tx) => {
        const createdAlbum = await tx.album.create({
          data: {
            bandId,
            title,
            coverImageUrl,
            releaseYear,
            genre,
          },
        });

        if (tracks && tracks.length > 0) {
          const trackData = tracks.map((t: any, index: number) => ({
            albumId: createdAlbum.id,
            title: t.title,
            trackNumber: t.trackNumber || index + 1,
            duration: t.duration,
            audioUrl: t.audioUrl,
            r2Key: t.r2Key,
          }));

          await tx.track.createMany({
            data: trackData,
          });
        }

        return tx.album.findUnique({
          where: { id: createdAlbum.id },
          include: {
            tracks: { orderBy: { trackNumber: 'asc' } },
            band: { select: { name: true, slug: true } },
          },
        });
      });

      res.status(201).json({
        status: 'success',
        message: 'Álbum publicado com sucesso!',
        data: { album },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Adiciona uma faixa individual a um álbum existente (respeitando o teto de 10 faixas)
   */
  static async addTrack(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Não autenticado', 401);
      const { id: albumId } = req.params;
      const { title, trackNumber, duration, audioUrl, r2Key } = req.body;

      const album = await prisma.album.findUnique({
        where: { id: albumId },
        include: {
          band: true,
          _count: { select: { tracks: true } },
        },
      });

      if (!album) throw new AppError('Álbum não encontrado.', 404);

      if (album.band.userId !== req.user.userId && req.user.role !== 'ADMIN') {
        throw new AppError('Sem permissão para alterar este álbum.', 403);
      }

      // Validação estrita do limite de 10 faixas
      if (album._count.tracks >= 10) {
        throw new AppError(
          'Limite atingido: Cada álbum no PalcoLivre pode conter no máximo 10 músicas.',
          400
        );
      }

      const assignedTrackNumber = trackNumber || album._count.tracks + 1;

      const track = await prisma.track.create({
        data: {
          albumId,
          title,
          trackNumber: assignedTrackNumber,
          duration,
          audioUrl,
          r2Key,
        },
      });

      res.status(201).json({
        status: 'success',
        message: 'Música adicionada ao álbum com sucesso!',
        data: { track },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove uma faixa e expurga o arquivo de áudio do Cloudflare R2
   */
  static async deleteTrack(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Não autenticado', 401);
      const { trackId } = req.params;

      const track = await prisma.track.findUnique({
        where: { id: trackId },
        include: {
          album: {
            include: { band: true },
          },
        },
      });

      if (!track) throw new AppError('Faixa não encontrada.', 404);

      if (track.album.band.userId !== req.user.userId && req.user.role !== 'ADMIN') {
        throw new AppError('Sem permissão para remover esta faixa.', 403);
      }

      // Remove do banco de dados
      await prisma.track.delete({ where: { id: trackId } });

      // Remove arquivo do Cloudflare R2 de forma assíncrona
      StorageService.deleteFile(track.r2Key);

      res.status(200).json({
        status: 'success',
        message: 'Música removida do álbum com sucesso.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Busca detalhes do álbum com faixas e estatísticas
   */
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.userId;

      const album = await prisma.album.findUnique({
        where: { id },
        include: {
          band: {
            select: { id: true, name: true, slug: true, profileImageUrl: true, genre: true },
          },
          tracks: {
            orderBy: { trackNumber: 'asc' },
            include: {
              _count: { select: { likes: true } },
            },
          },
          _count: { select: { likes: true } },
        },
      });

      if (!album) throw new AppError('Álbum não encontrado.', 404);

      let isLiked = false;
      if (currentUserId) {
        const like = await prisma.albumLike.findUnique({
          where: {
            userId_albumId: {
              userId: currentUserId,
              albumId: album.id,
            },
          },
        });
        isLiked = !!like;
      }

      res.status(200).json({
        status: 'success',
        data: {
          album: {
            ...album,
            likeCount: album._count.likes,
            isLiked,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
