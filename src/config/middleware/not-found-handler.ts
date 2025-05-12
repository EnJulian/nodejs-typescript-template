import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ICustomError } from './error-handler';

/**
 * Handle 404 Not Found errors
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const error = new Error(`Route not found: ${req.originalUrl}`) as ICustomError;
  error.statusCode = StatusCodes.NOT_FOUND;

  next(error);
}; 
