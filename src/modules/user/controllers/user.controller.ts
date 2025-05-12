import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { ICustomError } from '../../../config/middleware/error-handler';
import { PermissionService } from '../../auth/services/permission.service';
import { Permission } from '../../../shared/enums';

const userService = new UserService();
const permissionService = new PermissionService();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * User controller
 */
export class UserController {
  /**
   * Get all users
   */
  async getAllUsers(_req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.findAll();
      return res.status(StatusCodes.OK).json({
        status: 'success',
        data: { users },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await userService.findById(id);

      if (!user) {
        const error = new Error('User not found') as ICustomError;
        error.statusCode = StatusCodes.NOT_FOUND;
        return next(error);
      }

      // Check if the user is requesting their own data or has READ_USER permission
      const isOwnData = req.user?.id === id;
      const hasReadPermission = await permissionService.hasPermission(
        req.user?.role as any,
        Permission.READ_USER
      );

      if (!isOwnData && !hasReadPermission) {
        const error = new Error('Insufficient permissions') as ICustomError;
        error.statusCode = StatusCodes.FORBIDDEN;
        return next(error);
      }

      return res.status(StatusCodes.OK).json({
        status: 'success',
        data: { user },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Create a new user
   */
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const userData: CreateUserDto = req.body;
      const newUser = await userService.create(userData);

      return res.status(StatusCodes.CREATED).json({
        status: 'success',
        data: { user: newUser },
      });
    } catch (error: any) {
      if (error.message === 'User with this email already exists') {
        const customError = error as ICustomError;
        customError.statusCode = StatusCodes.CONFLICT;
      }
      return next(error);
    }
  }

  /**
   * Update a user
   */
  async updateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updateData: Partial<CreateUserDto> = req.body;

      // Check if user exists
      const existingUser = await userService.findById(id);
      if (!existingUser) {
        const error = new Error('User not found') as ICustomError;
        error.statusCode = StatusCodes.NOT_FOUND;
        return next(error);
      }

      // Check if the user is updating their own data or has UPDATE_USER permission
      const isOwnData = req.user?.id === id;
      const hasUpdatePermission = await permissionService.hasPermission(
        req.user?.role as any,
        Permission.UPDATE_USER
      );

      if (!isOwnData && !hasUpdatePermission) {
        const error = new Error('Insufficient permissions') as ICustomError;
        error.statusCode = StatusCodes.FORBIDDEN;
        return next(error);
      }

      // If the user is updating their own data but doesn't have MANAGE_ROLES permission,
      // prevent them from changing their role
      if (isOwnData && !hasUpdatePermission && updateData.role) {
        const error = new Error('You cannot change your own role') as ICustomError;
        error.statusCode = StatusCodes.FORBIDDEN;
        return next(error);
      }

      const updatedUser = await userService.update(id, updateData);

      return res.status(StatusCodes.OK).json({
        status: 'success',
        data: { user: updatedUser },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await userService.delete(id);

      if (!deleted) {
        const error = new Error('User not found') as ICustomError;
        error.statusCode = StatusCodes.NOT_FOUND;
        return next(error);
      }

      return res.status(StatusCodes.OK).json({
        status: 'success',
        message: 'User deleted successfully',
      });
    } catch (error) {
      return next(error);
    }
  }
}
