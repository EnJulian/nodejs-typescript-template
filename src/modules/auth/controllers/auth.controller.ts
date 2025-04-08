import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AuthService } from '../services/auth.service';
import { ICustomError } from '../../../config/middleware/error-handler';
import Joi from 'joi';

const authService = new AuthService();

/**
 * Authentication controller
 */
export class AuthController {
  /**
   * Login user
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
      });

      const { error, value } = schema.validate(req.body);
      
      if (error) {
        const validationError = new Error(error.message) as ICustomError;
        validationError.statusCode = StatusCodes.BAD_REQUEST;
        return next(validationError);
      }

      const { email, password } = value;

      // Login user
      const result = await authService.login(email, password);
      
      if (!result) {
        const authError = new Error('Invalid email or password') as ICustomError;
        authError.statusCode = StatusCodes.UNAUTHORIZED;
        return next(authError);
      }

      return res.status(StatusCodes.OK).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register user
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate request body
      const schema = Joi.object({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
      });

      const { error, value } = schema.validate(req.body);
      
      if (error) {
        const validationError = new Error(error.message) as ICustomError;
        validationError.statusCode = StatusCodes.BAD_REQUEST;
        return next(validationError);
      }

      const { name, email, password } = value;

      // Register user
      const result = await authService.register(name, email, password);
      
      if (!result) {
        const authError = new Error('Failed to register user') as ICustomError;
        authError.statusCode = StatusCodes.BAD_REQUEST;
        return next(authError);
      }

      return res.status(StatusCodes.CREATED).json({
        status: 'success',
        data: result,
      });
    } catch (error: any) {
      if (error.message === 'User with this email already exists') {
        const customError = error as ICustomError;
        customError.statusCode = StatusCodes.CONFLICT;
      }
      next(error);
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(req: Request, res: Response) {
    // The user is added to the request by the authentication middleware
    const user = (req as any).user;

    return res.status(StatusCodes.OK).json({
      status: 'success',
      data: { user },
    });
  }
} 