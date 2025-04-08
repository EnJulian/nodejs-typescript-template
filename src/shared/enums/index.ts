/**
 * Application environment types
 */
export enum AppEnv {
  DEVELOPMENT = 'development',
  TEST = 'test',
  PRODUCTION = 'production',
}

/**
 * HTTP methods
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

/**
 * User roles
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

/**
 * Permission types for access control
 */
export enum Permission {
  // User management
  CREATE_USER = 'create_user',
  READ_USER = 'read_user',
  UPDATE_USER = 'update_user',
  DELETE_USER = 'delete_user',
  
  // User self-management
  UPDATE_SELF = 'update_self',
  READ_SELF = 'read_self',
  
  // Admin permissions
  MANAGE_ROLES = 'manage_roles',
  MANAGE_PERMISSIONS = 'manage_permissions',
} 