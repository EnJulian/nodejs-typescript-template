import winston, { format } from 'winston';
import 'winston-daily-rotate-file';
import fs from 'fs';
import path from 'path';
import { AppEnv } from '../../shared/enums';
import Env from '../../shared/utils/env';

// Ensure logs directory exists
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const { combine, timestamp, printf, colorize, align } = format;

// Custom log format
const logFormat = printf(({ timestamp, level, message, ...meta }) => {
  // Remove context from meta to avoid displaying it
  const { context, ...restMeta } = meta;
  const stringifiedMeta = restMeta && Object.keys(restMeta).length ? JSON.stringify(restMeta, null, 2) : '';
  return `[${timestamp}] [${level}] ${message} ${stringifiedMeta}`;
});

// Create file transport for daily rotation
const fileTransport = new winston.transports.DailyRotateFile({
  filename: path.join(logDir, '%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
});

// Create console transport
const consoleTransport = new winston.transports.Console({
  format: combine(
    colorize({ all: true }),
    timestamp(),
    align(),
    logFormat
  ),
});

// Custom logger class
class Logger {
  private logger: winston.Logger;

  constructor(context?: string) {
    this.logger = winston.createLogger({
      level: Env.get<string>('NODE_ENV') === AppEnv.PRODUCTION ? 'info' : 'debug',
      format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
      // Store context internally but don't display it in logs
      defaultMeta: context ? { context } : {},
      transports: [
        fileTransport,
        consoleTransport,
      ],
    });
  }

  /**
   * Log at debug level
   */
  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  /**
   * Log at info level
   */
  log(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  /**
   * Log at info level
   */
  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  /**
   * Log at warn level
   */
  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  /**
   * Log at error level
   */
  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }
}

export default Logger; 
