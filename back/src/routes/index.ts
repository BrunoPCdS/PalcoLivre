import { Router } from 'express';
import authRoutes from './auth.routes';
import bandRoutes from './band.routes';
import albumRoutes from './album.routes';
import uploadRoutes from './upload.routes';
import exploreRoutes from './explore.routes';
import likeRoutes from './like.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/bands', bandRoutes);
router.use('/albums', albumRoutes);
router.use('/uploads', uploadRoutes);
router.use('/explore', exploreRoutes);
router.use('/likes', likeRoutes);

export default router;
