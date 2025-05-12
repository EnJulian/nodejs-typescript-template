import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Permission } from '../../../shared/enums';
import { ICustomError } from '../../../config/middleware/error-handler';
import { PermissionService } from '../services/permission.service';

const permissionService = new PermissionService();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * Middleware to check if user has required permission
 * @param requiredPermission The permission required to access the resource
 */
export const requirePermission = (requiredPermission: Permission) => {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
      // Check if user exists in request (should be added by authentication middleware)
      if (!req.user) {
        const error = new Error('Authentication required') as ICustomError;
        error.statusCode = StatusCodes.UNAUTHORIZED;
        return next(error);
      }

      // Check if user has the required permission
      const hasPermission = await permissionService.hasPermission(
        req.user.role as any, // Cast to any as UserRole type
        requiredPermission
      );

      if (!hasPermission) {
        const error = new Error('Insufficient permissions') as ICustomError;
        error.statusCode = StatusCodes.FORBIDDEN;
        return next(error);
      }

      // User has permission, proceed to next middleware
      next();
    } catch (error) {
      next(error);
    }
  };
}; 
