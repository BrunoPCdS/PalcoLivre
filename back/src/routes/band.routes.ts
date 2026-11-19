import { Router } from 'express';
import { BandController } from '../controllers/band.controller';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import {
  createBandSchema,
  updateBandSchema,
  contactBandSchema,
  addBandPhotoSchema,
} from '../schemas/band.schema';

const router = Router();

// Rotas Públicas
router.get('/', BandController.list);
router.get('/:slug', optionalAuth, BandController.getBySlug);
router.post('/:slug/contact', validateBody(contactBandSchema), BandController.contact);

// Rotas Protegidas (Gestores de Banda / Autenticados)
router.post('/', requireAuth, validateBody(createBandSchema), BandController.create);
router.put('/:id', requireAuth, validateBody(updateBandSchema), BandController.update);
router.post('/:id/photos', requireAuth, validateBody(addBandPhotoSchema), BandController.addPhoto);

export default router;
