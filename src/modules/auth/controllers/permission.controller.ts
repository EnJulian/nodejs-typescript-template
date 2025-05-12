import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { PermissionService } from '../services/permission.service';
import { ICustomError } from '../../../config/middleware/error-handler';
import { AddPermissionDto, RemovePermissionDto } from '../dtos/permission.dto';
import Joi from 'joi';
import { Permission, UserRole } from '../../../shared/enums';

const permissionService = new PermissionService();

/**
 * Permission controller for managing role permissions
 */
export class PermissionController {
  /**
   * Get all permissions for a role
   */
  async getPermissionsByRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { role } = req.params;

      // Validate role
      if (!Object.values(UserRole).includes(role as UserRole)) {
        const error = new Error(`Invalid role: ${role}`) as ICustomError;
        error.statusCode = StatusCodes.BAD_REQUEST;
        return next(error);
      }

      const permissions = await permissionService.getPermissionsByRole(role as UserRole);

      return res.status(StatusCodes.OK).json({
        status: 'success',
        data: { permissions },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all available permissions
   */
  getAllPermissions(_req: Request, res: Response) {
    const permissions = permissionService.getAllPermissions();

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: { permissions },
    });
  }

  /**
   * Add permission to role
   */
  async addPermission(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const schema = Joi.object({
        role: Joi.string()
          .valid(...Object.values(UserRole))
          .required(),
        permission: Joi.string()
          .valid(...Object.values(Permission))
          .required(),
      });

      const { error, value } = schema.validate(req.body);

      if (error) {
        const validationError = new Error(error.message) as ICustomError;
        validationError.statusCode = StatusCodes.BAD_REQUEST;
        return next(validationError);
      }

      const { role, permission } = value as AddPermissionDto;

      const success = await permissionService.addPermission(role, permission);

      if (!success) {
        const permissionError = new Error('Failed to add permission') as ICustomError;
        permissionError.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        return next(permissionError);
      }

      return res.status(StatusCodes.OK).json({
        status: 'success',
        message: `Permission ${permission} added to role ${role}`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove permission from role
   */
  async removePermission(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const schema = Joi.object({
        role: Joi.string()
          .valid(...Object.values(UserRole))
          .required(),
        permission: Joi.string()
          .valid(...Object.values(Permission))
          .required(),
      });

      const { error, value } = schema.validate(req.body);

      if (error) {
        const validationError = new Error(error.message) as ICustomError;
        validationError.statusCode = StatusCodes.BAD_REQUEST;
        return next(validationError);
      }

      const { role, permission } = value as RemovePermissionDto;

      const success = await permissionService.removePermission(role, permission);

      if (!success) {
        const permissionError = new Error('Failed to remove permission') as ICustomError;
        permissionError.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
        return next(permissionError);
      }

      return res.status(StatusCodes.OK).json({
        status: 'success',
        message: `Permission ${permission} removed from role ${role}`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all role permissions
   */
  async getAllRolePermissions(_req: Request, res: Response, next: NextFunction) {
    try {
      const rolePermissions = await permissionService.getAllRolePermissions();

      return res.status(StatusCodes.OK).json({
        status: 'success',
        data: { rolePermissions },
      });
    } catch (error) {
      return next(error);
    }
  }
} 
