import { UserRole } from '../../../shared/enums';

/**
 * Create user DTO
 */
export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
} 