import { Router } from 'express';
import { LikeController } from '../controllers/like.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Todas as rotas de like exigem autenticação obrigatória (regra de negócio PalcoLivre)
router.post('/band/:bandId', requireAuth, LikeController.toggleBandLike);
router.post('/album/:albumId', requireAuth, LikeController.toggleAlbumLike);
router.post('/track/:trackId', requireAuth, LikeController.toggleTrackLike);

export default router;
