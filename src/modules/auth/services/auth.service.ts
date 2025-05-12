import jwt from 'jsonwebtoken';
import { UserService } from '../../user/services/user.service';
import Env from '../../../shared/utils/env';
import { User } from '../../user/entities/user.entity';
import Logger from '../../../config/logger';

/**
 * Authentication service
 */
export class AuthService {
  private userService: UserService;
  private logger: Logger;

  constructor() {
    this.userService = new UserService();
    this.logger = new Logger('AuthService');
  }

  /**
   * Login user and generate JWT token
   */
  async login(email: string, password: string): Promise<{ user: Partial<User>; token: string } | null> {
    try {
      // Validate user credentials
      const user = await this.userService.validateUser(email, password);

      if (!user) {
        return null;
      }

      // Generate JWT token
      const token = this.generateToken(user);

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;

      return { 
        user: userWithoutPassword,
        token 
      };
    } catch (error) {
      this.logger.error('Login error', error);
      return null;
    }
  }

  /**
   * Generate JWT token
   */
  private generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const secret = Env.get<string>('SECRET');
    const expiresIn = '24h'; // Token expires in 24 hours

    return jwt.sign(payload, secret, { expiresIn });
  }

  /**
   * Register a new user
   */
  async register(name: string, email: string, password: string): Promise<{ user: Partial<User>; token: string } | null> {
    try {
      // Create user
      const user = await this.userService.create({
        name,
        email,
        password
      });

      // Generate JWT token
      const token = this.generateToken(user);

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;

      return { 
        user: userWithoutPassword,
        token 
      };
    } catch (error) {
      this.logger.error('Registration error', error);
      return null;
    }
  }

  /**
   * Verify token and return user
   */
  async verifyToken(token: string): Promise<Partial<User> | null> {
    try {
      const decoded = jwt.verify(token, Env.get<string>('SECRET')) as { id: string };
      const user = await this.userService.findById(decoded.id);

      if (!user) {
        return null;
      }

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch (error) {
      this.logger.error('Token verification error', error);
      return null;
    }
  }
} 
