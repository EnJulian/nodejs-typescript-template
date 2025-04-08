import { Schema } from 'joi';
import { APP_PREFIX } from '../constants';

class Env {
  /**
   * Get environment variable value
   * @param key Environment variable name (without prefix)
   * @param defaultValue Default value if environment variable is not set
   * @returns Environment variable value
   */
  static get<T>(key: string, defaultValue?: T): T {
    const envKey = `${APP_PREFIX}${key}`;
    const value = process.env[envKey];

    if (!value && defaultValue === undefined) {
      throw new Error(`Environment variable ${envKey} is not set`);
    }

    if (!value && defaultValue !== undefined) {
      return defaultValue;
    }

    try {
      // Handle boolean values
      if (value?.toLowerCase() === 'true') return true as unknown as T;
      if (value?.toLowerCase() === 'false') return false as unknown as T;

      // Handle numeric values
      if (value && !isNaN(Number(value)) && !isNaN(parseFloat(value))) {
        return Number(value) as unknown as T;
      }

      // Return as string
      return value as unknown as T;
    } catch (error) {
      return value as unknown as T;
    }
  }

  /**
   * Validate environment variables against schema
   * @param schema Joi validation schema
   * @returns Validation result
   */
  static async validateEnv(schema: Schema) {
    try {
      const envVars: Record<string, unknown> = {};

      // Extract all environment variables with APP_ prefix
      Object.keys(process.env).forEach((key) => {
        if (key.startsWith(APP_PREFIX)) {
          const newKey = key.replace(APP_PREFIX, '');
          envVars[newKey] = this.get(newKey);
        }
      });

      await schema.validateAsync(envVars);
      return true;
    } catch (error) {
      console.error('Environment validation error:', error);
      process.exit(1);
    }
  }
}

export default Env; 