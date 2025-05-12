import { Pool } from 'pg';
import Env from '../../shared/utils/env';
import Logger from '../logger';

let pool: Pool;
let logger: Logger;

/**
 * Initialize database connection
 */
export const connectDB = async () => {
  try {
    // Initialize logger here after dotenv is configured
    if (!logger) {
      logger = new Logger('Database');
    }

    const connectionString = Env.get<string>('DATABASE_URL');

    pool = new Pool({
      connectionString,
    });

    // Test connection
    const client = await pool.connect();
    client.release();

    logger.log('Database connection established');
    return pool;
  } catch (error) {
    // Initialize logger here if it wasn't initialized before the error
    if (!logger) {
      logger = new Logger('Database');
    }
    logger.error('Failed to connect to database', error);
    process.exit(1);
  }
};

/**
 * Get database pool
 */
export const getPool = () => {
  // Initialize logger if not already initialized
  if (!logger) {
    logger = new Logger('Database');
  }

  if (!pool) {
    throw new Error('Database not connected');
  }
  return pool;
};

/**
 * Execute database query
 */
export const query = async (text: string, params?: any[]) => {
  // Initialize logger if not already initialized
  if (!logger) {
    logger = new Logger('Database');
  }

  const start = Date.now();
  try {
    const result = await getPool().query(text, params);
    const duration = Date.now() - start;

    logger.debug(`Executed query in ${duration}ms: ${text}`);
    return result;
  } catch (error) {
    logger.error(`Query error: ${text}`, error);
    throw error;
  }
};
