import { Pool } from 'pg';
import Env from '../../shared/utils/env';
import Logger from '../logger';

let pool: Pool;
const logger = new Logger('Database');

/**
 * Initialize database connection
 */
export const connectDB = async () => {
  try {
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
    logger.error('Failed to connect to database', error);
    process.exit(1);
  }
};

/**
 * Get database pool
 */
export const getPool = () => {
  if (!pool) {
    throw new Error('Database not connected');
  }
  return pool;
};

/**
 * Execute database query
 */
export const query = async (text: string, params?: any[]) => {
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