import { Permission, UserRole } from '../../../shared/enums';

/**
 * Add permission to role DTO
 */
export interface AddPermissionDto {
  role: UserRole;
  permission: Permission;
}

/**
 * Remove permission from role DTO
 */
export interface RemovePermissionDto {
  role: UserRole;
  permission: Permission;
} 