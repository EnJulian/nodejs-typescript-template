import { Router } from 'express';
import { PermissionController } from '../modules/auth/controllers/permission.controller';
import { authenticate } from '../modules/auth/middleware/auth.middleware';
import { requirePermission } from '../modules/auth/middleware/permission.middleware';
import { Permission } from '../shared/enums';

const router = Router();
const permissionController = new PermissionController();

/**
 * @route GET /api/v1/permissions
 * @desc Get all available permissions
 * @access Admin only
 */
router.get(
  '/', 
  authenticate, 
  requirePermission(Permission.MANAGE_PERMISSIONS), 
  permissionController.getAllPermissions
);

/**
 * @route GET /api/v1/permissions/role/:role
 * @desc Get all permissions for a role
 * @access Admin only
 */
router.get(
  '/role/:role', 
  authenticate, 
  requirePermission(Permission.MANAGE_PERMISSIONS), 
  permissionController.getPermissionsByRole
);

/**
 * @route GET /api/v1/permissions/all
 * @desc Get all role permissions
 * @access Admin only
 */
router.get(
  '/all', 
  authenticate, 
  requirePermission(Permission.MANAGE_PERMISSIONS), 
  permissionController.getAllRolePermissions
);

/**
 * @route POST /api/v1/permissions/add
 * @desc Add permission to role
 * @access Admin only
 */
router.post(
  '/add', 
  authenticate, 
  requirePermission(Permission.MANAGE_PERMISSIONS), 
  permissionController.addPermission
);

/**
 * @route POST /api/v1/permissions/remove
 * @desc Remove permission from role
 * @access Admin only
 */
router.post(
  '/remove', 
  authenticate, 
  requirePermission(Permission.MANAGE_PERMISSIONS), 
  permissionController.removePermission
);

export default router; 