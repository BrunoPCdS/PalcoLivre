import { Router } from 'express';
import { LikeController } from '../controllers/like.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Rotas de listagem de curtidas do usuário logado
router.get('/my-bands', requireAuth, LikeController.getMyLikedBands);
router.get('/my-tracks', requireAuth, LikeController.getMyLikedTracks);

// Todas as rotas de like exigem autenticação obrigatória (regra de negócio PalcoLivre)
router.post('/band/:bandId', requireAuth, LikeController.toggleBandLike);
router.post('/album/:albumId', requireAuth, LikeController.toggleAlbumLike);
router.post('/track/:trackId', requireAuth, LikeController.toggleTrackLike);

export default router;
