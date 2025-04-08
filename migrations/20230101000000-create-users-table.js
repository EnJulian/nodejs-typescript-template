'use strict';

/**
 * Create users table and role_permissions table
 */
exports.up = function (db) {
  // Create UUID extension if it doesn't exist
  db.runSql('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
  
  // Create users table
  db.createTable('users', {
    id: { type: 'uuid', primaryKey: true, defaultValue: { function: 'uuid_generate_v4()' } },
    name: { type: 'string', notNull: true },
    email: { type: 'string', notNull: true, unique: true },
    password: { type: 'string', notNull: true },
    role: { type: 'string', notNull: true, defaultValue: 'user' },
    created_at: { type: 'timestamp', notNull: true, defaultValue: { function: 'NOW()' } },
    updated_at: { type: 'timestamp', notNull: true, defaultValue: { function: 'NOW()' } }
  });
  
  // Create role_permissions table
  return db.createTable('role_permissions', {
    id: { type: 'uuid', primaryKey: true, defaultValue: { function: 'uuid_generate_v4()' } },
    role: { type: 'string', notNull: true },
    permission: { type: 'string', notNull: true },
    created_at: { type: 'timestamp', notNull: true, defaultValue: { function: 'NOW()' } },
    updated_at: { type: 'timestamp', notNull: true, defaultValue: { function: 'NOW()' } }
  }).then(() => {
    // Add uniqueness constraint to role-permission combination
    return db.addIndex('role_permissions', 'role_permission_unique_idx', ['role', 'permission'], true);
  }).then(() => {
    // Add default permissions for roles
    return db.runSql(`
      -- Admin permissions
      INSERT INTO role_permissions (role, permission) VALUES 
      ('admin', 'create_user'),
      ('admin', 'read_user'),
      ('admin', 'update_user'),
      ('admin', 'delete_user'),
      ('admin', 'update_self'),
      ('admin', 'read_self'),
      ('admin', 'manage_roles'),
      ('admin', 'manage_permissions');
      
      -- User permissions
      INSERT INTO role_permissions (role, permission) VALUES 
      ('user', 'read_self'),
      ('user', 'update_self');
    `);
  });
};

/**
 * Drop users table and role_permissions table
 */
exports.down = function (db) {
  return db.dropTable('role_permissions')
    .then(() => {
      return db.dropTable('users');
    });
};

/**
 * Get filename of migration script
 */
exports._meta = {
  version: 1
}; 