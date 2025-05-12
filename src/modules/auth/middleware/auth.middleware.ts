import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { ICustomError } from '../../../config/middleware/error-handler';
import Env from '../../../shared/utils/env';
import { UserService } from '../../user/services/user.service';

const userService = new UserService();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * Middleware to verify JWT token and add user to request
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('No token provided') as ICustomError;
      error.statusCode = StatusCodes.UNAUTHORIZED;
      return next(error);
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, Env.get<string>('SECRET')) as { id: string };

    // Get user from database
    const user = await userService.findById(decoded.id);

    if (!user) {
      const error = new Error('User not found') as ICustomError;
      error.statusCode = StatusCodes.UNAUTHORIZED;
      return next(error);
    }

    // Add user to request
    req.user = {
      id: user.id,
      role: user.role
    };

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      const customError = new Error('Invalid token') as ICustomError;
      customError.statusCode = StatusCodes.UNAUTHORIZED;
      return next(customError);
    }

    if (error.name === 'TokenExpiredError') {
      const customError = new Error('Token expired') as ICustomError;
      customError.statusCode = StatusCodes.UNAUTHORIZED;
      return next(customError);
    }

    next(error);
  }
}; 
