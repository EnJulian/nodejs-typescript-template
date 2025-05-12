-- Migration: create-users-table (up)
-- Created at: 2023-01-01T00:00:00.000Z

-- Create UUID extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create role_permissions table
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role VARCHAR(255) NOT NULL,
  permission VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add uniqueness constraint to role-permission combination
CREATE UNIQUE INDEX role_permission_unique_idx ON role_permissions (role, permission);

-- Add default permissions for roles
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