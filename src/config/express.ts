import express, { Express } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import session from 'express-session';
import Env from '../shared/utils/env';
import { errorHandler } from './middleware/error-handler';
import { notFoundHandler } from './middleware/not-found-handler';
import apiRoutes from '../routes';

/**
 * Initialize Express application
 */
export default function (): Express {
  const app = express();
  const apiVersion = Env.get<string>('API_VERSION');

  // Middlewares
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Session configuration
  app.use(
    session({
      secret: Env.get<string>('SECRET'),
      resave: false,
      saveUninitialized: false,
    })
  );

  // Request logging
  app.use(morgan('dev'));

  // Health check endpoint
  app.get('/health', (_, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // API routes
  app.use(`/api/v${apiVersion}`, apiRoutes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
} 