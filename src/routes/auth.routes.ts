import { Router } from 'express';
import { AuthController } from '../modules/auth/controllers/auth.controller';
import { authenticate } from '../modules/auth/middleware/auth.middleware';

const router = Router();
const authController = new AuthController();

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/v1/auth/login
 * @desc Login user and get token
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route GET /api/v1/auth/me
 * @desc Get current user
 * @access Private
 */
router.get('/me', authenticate, authController.getCurrentUser);

export default router; 