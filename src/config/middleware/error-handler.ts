import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Logger from '../logger';
import { AppEnv } from '../../shared/enums';
import Env from '../../shared/utils/env';

/**
 * Custom error interface
 */
export interface ICustomError extends Error {
  statusCode?: number;
  errorData?: unknown;
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: ICustomError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) => {
  const logger = new Logger('ErrorHandler');
  const nodeEnv = Env.get<string>('NODE_ENV');

  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Something went wrong';

  // Log the error
  logger.error(`${req.method} ${req.path} - ${err.message}`, err);

  // Send error response based on environment
  if (nodeEnv === AppEnv.PRODUCTION) {
    res.status(statusCode).json({
      status: 'error',
      message: statusCode === StatusCodes.INTERNAL_SERVER_ERROR ? 'Internal Server Error' : message,
    });
  } else {
    res.status(statusCode).json({
      status: 'error',
      message,
      stack: err.stack,
      errorData: err.errorData,
    });
  }
}; 
