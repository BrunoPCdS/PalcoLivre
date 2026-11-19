import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';

export class ExploreController {
  /**
   * Seção "Em Evidência": Bandas mais acessadas, mais curtidas e álbuns em destaque
   */
  static async getFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Bandas mais acessadas e curtidas
      const topBands = await prisma.band.findMany({
        take: 6,
        orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
        include: {
          _count: { select: { likes: true, albums: true } },
          albums: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { id: true, title: true, coverImageUrl: true },
          },
        },
      });

      // 2. Álbuns mais curtidos / populares
      const topAlbums = await prisma.album.findMany({
        take: 6,
        include: {
          band: { select: { id: true, name: true, slug: true } },
          tracks: {
            take: 3,
            select: { id: true, title: true, duration: true, audioUrl: true, trackNumber: true },
          },
          _count: { select: { likes: true, tracks: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        status: 'success',
        data: {
          featuredBands: topBands.map((b) => ({
            ...b,
            contactPhone: undefined,
            likeCount: b._count.likes,
            albumCount: b._count.albums,
          })),
          featuredAlbums: topAlbums.map((a) => ({
            ...a,
            likeCount: a._count.likes,
            trackCount: a._count.tracks,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Seção "Adicionadas Recentemente": Novas bandas e novos álbuns no PalcoLivre
   */
  static async getRecent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [recentBands, recentAlbums] = await Promise.all([
        prisma.band.findMany({
          take: 8,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { likes: true, albums: true } },
          },
        }),
        prisma.album.findMany({
          take: 8,
          orderBy: { createdAt: 'desc' },
          include: {
            band: { select: { id: true, name: true, slug: true, profileImageUrl: true } },
            _count: { select: { likes: true, tracks: true } },
          },
        }),
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          recentBands: recentBands.map((b) => ({
            ...b,
            contactPhone: undefined,
            likeCount: b._count.likes,
            albumCount: b._count.albums,
          })),
          recentAlbums: recentAlbums.map((a) => ({
            ...a,
            likeCount: a._count.likes,
            trackCount: a._count.tracks,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Seção "Explorar por Estilos": Bandas e álbuns agrupados por gênero musical
   */
  static async getByGenre(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { genre } = req.params;

      const [bands, albums] = await Promise.all([
        prisma.band.findMany({
          where: { genre: genre.toUpperCase() as any },
          take: 12,
          orderBy: { viewCount: 'desc' },
          include: {
            _count: { select: { likes: true, albums: true } },
          },
        }),
        prisma.album.findMany({
          where: { genre: genre.toUpperCase() as any },
          take: 12,
          orderBy: { createdAt: 'desc' },
          include: {
            band: { select: { id: true, name: true, slug: true } },
            _count: { select: { likes: true, tracks: true } },
          },
        }),
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          genre: genre.toUpperCase(),
          bands: bands.map((b) => ({
            ...b,
            contactPhone: undefined,
            likeCount: b._count.likes,
            albumCount: b._count.albums,
          })),
          albums: albums.map((a) => ({
            ...a,
            likeCount: a._count.likes,
            trackCount: a._count.tracks,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
