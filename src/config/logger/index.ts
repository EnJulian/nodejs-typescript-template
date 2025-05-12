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
  const stringifiedMeta = meta && Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
  const contextStr = meta.context ? `[${meta.context}] ` : '';
  return `[${timestamp}] [${level}] ${contextStr}${message} ${stringifiedMeta}`;
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
