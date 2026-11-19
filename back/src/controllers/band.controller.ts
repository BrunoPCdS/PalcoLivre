import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { CryptoService } from '../services/crypto.service';
import { MailService } from '../services/mail.service';
import { StorageService } from '../services/storage.service';
import { AppError } from '../middlewares/error.middleware';

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export class BandController {
  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Não autenticado', 401);

      const {
        name,
        genre,
        foundationYear,
        bio,
        members,
        contactPhone,
        contactEmail,
        profileImageUrl,
        bannerImageUrl,
        instagramUrl,
        spotifyUrl,
        youtubeUrl,
      } = req.body;

      // Gera slug único
      let baseSlug = generateSlug(name);
      let slug = baseSlug;
      let counter = 1;

      while (await prisma.band.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Criptografia simétrica AES-256-GCM do telefone de contato para segurança
      const encryptedPhone = CryptoService.encryptSensitive(contactPhone);

      // Garante que o role do usuário seja BAND_MANAGER
      await prisma.user.update({
        where: { id: req.user.userId },
        data: { role: 'BAND_MANAGER' },
      });

      const band = await prisma.band.create({
        data: {
          userId: req.user.userId,
          name,
          slug,
          genre,
          foundationYear,
          bio,
          members,
          contactPhone: encryptedPhone,
          contactEmail,
          profileImageUrl: profileImageUrl || null,
          bannerImageUrl: bannerImageUrl || null,
          instagramUrl: instagramUrl || null,
          spotifyUrl: spotifyUrl || null,
          youtubeUrl: youtubeUrl || null,
        },
      });

      res.status(201).json({
        status: 'success',
        message: 'Banda cadastrada com sucesso! Bem-vindo ao PalcoLivre.',
        data: {
          band: {
            ...band,
            contactPhone, // Retorna em texto claro na criação para confirmação
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const currentUserId = req.user?.userId;

      const band = await prisma.band.findUnique({
        where: { slug },
        include: {
          photos: {
            orderBy: { order: 'asc' },
          },
          albums: {
            orderBy: { releaseYear: 'desc' },
            include: {
              tracks: {
                orderBy: { trackNumber: 'asc' },
                include: {
                  _count: { select: { likes: true } },
                },
              },
              _count: { select: { likes: true, tracks: true } },
            },
          },
          _count: { select: { likes: true } },
        },
      });

      if (!band) {
        throw new AppError('Banda não encontrada.', 404);
      }

      // Incrementa visualização da banda em segundo plano
      prisma.band
        .update({
          where: { id: band.id },
          data: { viewCount: { increment: 1 } },
        })
        .catch((err) => console.error('Erro ao incrementar visualização da banda:', err));

      // Verifica se o usuário autenticado curtiu a banda
      let isLikedByCurrentUser = false;
      if (currentUserId) {
        const like = await prisma.bandLike.findUnique({
          where: {
            userId_bandId: {
              userId: currentUserId,
              bandId: band.id,
            },
          },
        });
        isLikedByCurrentUser = !!like;
      }

      // Descriptografa o telefone de contato para exibição pública
      const decryptedPhone = CryptoService.decryptSensitive(band.contactPhone);

      res.status(200).json({
        status: 'success',
        data: {
          band: {
            ...band,
            contactPhone: decryptedPhone,
            likeCount: band._count.likes,
            isLiked: isLikedByCurrentUser,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Não autenticado', 401);
      const { id } = req.params;

      const band = await prisma.band.findUnique({ where: { id } });
      if (!band) throw new AppError('Banda não encontrada.', 404);

      if (band.userId !== req.user.userId && req.user.role !== 'ADMIN') {
        throw new AppError('Você não tem permissão para editar esta banda.', 403);
      }

      const updateData: any = { ...req.body };
      if (updateData.contactPhone) {
        updateData.contactPhone = CryptoService.encryptSensitive(updateData.contactPhone);
      }

      // Evita sobreescrever id ou userId
      delete updateData.id;
      delete updateData.userId;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const updatedBand = await prisma.band.update({
        where: { id },
        data: updateData,
        include: {
          photos: { orderBy: { order: 'asc' } },
          albums: {
            orderBy: { releaseYear: 'desc' },
            include: {
              tracks: { orderBy: { trackNumber: 'asc' } },
              _count: { select: { likes: true, tracks: true } },
            },
          },
          _count: { select: { likes: true, albums: true } },
        },
      });

      res.status(200).json({
        status: 'success',
        message: 'Perfil da banda atualizado com sucesso.',
        data: {
          band: {
            ...updatedBand,
            contactPhone: CryptoService.decryptSensitive(updatedBand.contactPhone),
            likeCount: updatedBand._count.likes,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserBands(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Não autenticado', 401);
      const bands = await prisma.band.findMany({
        where: { userId: req.user.userId },
        include: {
          photos: { orderBy: { order: 'asc' } },
          albums: {
            orderBy: { releaseYear: 'desc' },
            include: {
              tracks: { orderBy: { trackNumber: 'asc' } },
              _count: { select: { likes: true, tracks: true } },
            },
          },
          _count: { select: { likes: true, albums: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({
        status: 'success',
        data: {
          bands: bands.map((b) => ({
            ...b,
            contactPhone: CryptoService.decryptSensitive(b.contactPhone),
            likeCount: b._count.likes,
            albumCount: b._count.albums,
          })),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Não autenticado', 401);
      const { id } = req.params;

      const band = await prisma.band.findUnique({
        where: { id },
        include: {
          albums: {
            include: { tracks: true },
          },
        },
      });
      if (!band) throw new AppError('Banda não encontrada.', 404);

      if (band.userId !== req.user.userId && req.user.role !== 'ADMIN') {
        throw new AppError('Você não tem permissão para excluir esta banda.', 403);
      }

      // Expurga arquivos de áudio associados no Cloudflare R2
      for (const album of band.albums) {
        for (const track of album.tracks) {
          if (track.r2Key) {
            StorageService.deleteFile(track.r2Key);
          }
        }
      }

      await prisma.band.delete({ where: { id } });

      res.status(200).json({
        status: 'success',
        message: 'Banda e todos os seus recursos excluídos com sucesso.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { genre, search, page = '1', limit = '12' } = req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 12;
      const skip = (pageNum - 1) * limitNum;

      const where: any = {};
      if (genre && genre !== 'ALL') {
        where.genre = genre;
      }
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { bio: { contains: search as string, mode: 'insensitive' } },
        ];
      }

      const [bands, total] = await Promise.all([
        prisma.band.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { likes: true, albums: true } },
          },
        }),
        prisma.band.count({ where }),
      ]);

      res.status(200).json({
        status: 'success',
        data: {
          bands: bands.map((b) => ({
            ...b,
            contactPhone: undefined, // Oculta na listagem geral para privacidade
            likeCount: b._count.likes,
            albumCount: b._count.albums,
          })),
          pagination: {
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async addPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Não autenticado', 401);
      const { id } = req.params;
      const { imageUrl, caption, order } = req.body;

      const band = await prisma.band.findUnique({ where: { id } });
      if (!band) throw new AppError('Banda não encontrada.', 404);

      if (band.userId !== req.user.userId && req.user.role !== 'ADMIN') {
        throw new AppError('Sem autorização para adicionar fotos nesta banda.', 403);
      }

      const photo = await prisma.bandPhoto.create({
        data: {
          bandId: id,
          imageUrl,
          caption,
          order: order || 0,
        },
      });

      res.status(201).json({
        status: 'success',
        message: 'Foto adicionada à galeria.',
        data: { photo },
      });
    } catch (error) {
      next(error);
    }
  }

  static async contact(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { slug } = req.params;
      const { name, email, message } = req.body;

      const band = await prisma.band.findUnique({
        where: { slug },
        select: { name: true, contactEmail: true },
      });

      if (!band) throw new AppError('Banda não encontrada.', 404);

      await MailService.sendBandContactNotification(
        band.contactEmail,
        band.name,
        name,
        email,
        message
      );

      res.status(200).json({
        status: 'success',
        message: 'Mensagem enviada com sucesso para a produção da banda!',
      });
    } catch (error) {
      next(error);
    }
  }
}
