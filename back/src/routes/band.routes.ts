import { Router } from 'express';
import { BandController } from '../controllers/band.controller';
import { requireAuth, optionalAuth, requireRole } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import {
  createBandSchema,
  updateBandSchema,
  contactBandSchema,
  addBandPhotoSchema,
} from '../schemas/band.schema';

const router = Router();

// Rotas Específicas de Bandas do Usuário
router.get('/user/my-bands', requireAuth, BandController.getUserBands);

// Rotas Públicas
router.get('/', BandController.list);
router.get('/:slug', optionalAuth, BandController.getBySlug);
router.post('/:slug/contact', validateBody(contactBandSchema), BandController.contact);

// Rotas Protegidas (Apenas contas BAND_MANAGER ou ADMIN podem criar bandas)
router.post('/', requireAuth, requireRole(['BAND_MANAGER', 'ADMIN']), validateBody(createBandSchema), BandController.create);
router.put('/:id', requireAuth, validateBody(updateBandSchema), BandController.update);
router.delete('/:id', requireAuth, BandController.delete);
router.post('/:id/photos', requireAuth, validateBody(addBandPhotoSchema), BandController.addPhoto);

export default router;
