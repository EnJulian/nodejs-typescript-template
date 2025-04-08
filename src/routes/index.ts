import { Router } from 'express';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import permissionRoutes from './permission.routes';

const router = Router();

/**
 * Main API Routes
 */

// Auth routes
router.use('/auth', authRoutes);

// User routes
router.use('/users', userRoutes);

// Permission routes
router.use('/permissions', permissionRoutes);

export default router; 