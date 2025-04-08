import Joi from 'joi';
import { AppEnv } from '../enums';

/**
 * Environment variables validation schema
 */
export const envValidatorSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid(AppEnv.DEVELOPMENT, AppEnv.TEST, AppEnv.PRODUCTION)
    .default(AppEnv.DEVELOPMENT),
  PORT: Joi.number().default(8080),
  DATABASE_URL: Joi.string().required(),
  API_VERSION: Joi.string().default('1.0'),
  SECRET: Joi.string().required(),
  SALT_ROUNDS: Joi.number().default(10),
  DOMAIN: Joi.string().default('localhost'),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
}); 