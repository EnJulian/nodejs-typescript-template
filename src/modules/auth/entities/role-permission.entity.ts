import { Permission, UserRole } from '../../../shared/enums';

/**
 * Role Permission entity
 */
export interface RolePermission {
  id: string;
  role: UserRole;
  permission: Permission;
  createdAt: Date;
  updatedAt: Date;
} 