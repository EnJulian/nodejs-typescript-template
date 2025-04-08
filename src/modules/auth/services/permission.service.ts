import { query } from '../../../config/database';
import { Permission, UserRole } from '../../../shared/enums';
import { RolePermission } from '../entities/role-permission.entity';
import Logger from '../../../config/logger';

/**
 * Permission service for role-based access control
 */
export class PermissionService {
  private logger = new Logger('PermissionService');
  private permissionCache: Map<string, Permission[]> = new Map();

  /**
   * Get all permissions for a specific role
   */
  async getPermissionsByRole(role: UserRole): Promise<Permission[]> {
    // Check if permissions are in cache
    const cacheKey = `role:${role}`;
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey) || [];
    }

    try {
      const result = await query(
        'SELECT permission FROM role_permissions WHERE role = $1',
        [role]
      );

      const permissions = result.rows.map((row) => row.permission as Permission);
      
      // Cache the permissions
      this.permissionCache.set(cacheKey, permissions);
      
      return permissions;
    } catch (error) {
      this.logger.error(`Failed to get permissions for role ${role}`, error);
      return [];
    }
  }

  /**
   * Check if a role has a specific permission
   */
  async hasPermission(role: UserRole, permission: Permission): Promise<boolean> {
    const permissions = await this.getPermissionsByRole(role);
    return permissions.includes(permission);
  }

  /**
   * Add a permission to a role
   */
  async addPermission(role: UserRole, permission: Permission): Promise<boolean> {
    try {
      // Check if permission already exists
      const existingResult = await query(
        'SELECT id FROM role_permissions WHERE role = $1 AND permission = $2',
        [role, permission]
      );

      if (existingResult.rowCount > 0) {
        return true; // Permission already exists
      }

      // Add the permission
      await query(
        'INSERT INTO role_permissions (role, permission) VALUES ($1, $2)',
        [role, permission]
      );

      // Clear cache for this role
      this.permissionCache.delete(`role:${role}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to add permission ${permission} to role ${role}`, error);
      return false;
    }
  }

  /**
   * Remove a permission from a role
   */
  async removePermission(role: UserRole, permission: Permission): Promise<boolean> {
    try {
      await query(
        'DELETE FROM role_permissions WHERE role = $1 AND permission = $2',
        [role, permission]
      );

      // Clear cache for this role
      this.permissionCache.delete(`role:${role}`);
      
      return true;
    } catch (error) {
      this.logger.error(`Failed to remove permission ${permission} from role ${role}`, error);
      return false;
    }
  }

  /**
   * Get all permissions
   */
  getAllPermissions(): Permission[] {
    return Object.values(Permission);
  }

  /**
   * Get all role permissions
   */
  async getAllRolePermissions(): Promise<RolePermission[]> {
    try {
      const result = await query(
        'SELECT id, role, permission, created_at as "createdAt", updated_at as "updatedAt" FROM role_permissions'
      );
      return result.rows;
    } catch (error) {
      this.logger.error('Failed to get all role permissions', error);
      return [];
    }
  }

  /**
   * Clear permission cache
   */
  clearCache(): void {
    this.permissionCache.clear();
  }
} 