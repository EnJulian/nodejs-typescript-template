-- Migration: create-users-table (down)
-- Created at: 2023-01-01T00:00:00.000Z

-- Drop tables in reverse order
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS users;