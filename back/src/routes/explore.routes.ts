import { Router } from 'express';
import { ExploreController } from '../controllers/explore.controller';

const router = Router();

router.get('/featured', ExploreController.getFeatured);
router.get('/recent', ExploreController.getRecent);
router.get('/by-genre/:genre', ExploreController.getByGenre);

export default router;
