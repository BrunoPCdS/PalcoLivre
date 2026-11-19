import { Router } from 'express';
import { AlbumController } from '../controllers/album.controller';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { createAlbumSchema, addTrackSchema } from '../schemas/album.schema';

const router = Router();

// Rotas Públicas
router.get('/:id', optionalAuth, AlbumController.getById);

// Rotas Protegidas (Gestores)
router.post('/', requireAuth, validateBody(createAlbumSchema), AlbumController.create);
router.post('/:id/tracks', requireAuth, validateBody(addTrackSchema), AlbumController.addTrack);
router.delete('/tracks/:trackId', requireAuth, AlbumController.deleteTrack);

export default router;
