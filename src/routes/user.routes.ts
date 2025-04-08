import { Router } from 'express';
import { UserController } from '../modules/user/controllers/user.controller';
import { authenticate } from '../modules/auth/middleware/auth.middleware';
import { requirePermission } from '../modules/auth/middleware/permission.middleware';
import { Permission } from '../shared/enums';

const router = Router();
const userController = new UserController();

/**
 * @route GET /api/v1/users
 * @desc Get all users
 * @access Admin only
 */
router.get(
  '/',
  authenticate,
  requirePermission(Permission.READ_USER),
  userController.getAllUsers
);

/**
 * @route GET /api/v1/users/:id
 * @desc Get user by ID
 * @access Admin or own user
 */
router.get(
  '/:id',
  authenticate,
  userController.getUserById
);

/**
 * @route POST /api/v1/users
 * @desc Create a new user
 * @access Admin only
 */
router.post(
  '/',
  authenticate,
  requirePermission(Permission.CREATE_USER),
  userController.createUser
);

/**
 * @route PUT /api/v1/users/:id
 * @desc Update a user
 * @access Admin or own user
 */
router.put(
  '/:id',
  authenticate,
  userController.updateUser
);

/**
 * @route DELETE /api/v1/users/:id
 * @desc Delete a user
 * @access Admin only
 */
router.delete(
  '/:id',
  authenticate,
  requirePermission(Permission.DELETE_USER),
  userController.deleteUser
);

export default router; 