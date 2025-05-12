#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get migration name from command line arguments
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Error: Migration name is required');
  console.log('Usage: node scripts/create-migration.js <migration-name>');
  process.exit(1);
}

const migrationName = args[0];
const timestamp = new Date().toISOString().replace(/[-T:.Z]/g, '').slice(0, 14);
const migrationId = `${timestamp}-${migrationName}`;

// Paths
const migrationsDir = path.join(process.cwd(), 'migrations');
const sqlsDir = path.join(migrationsDir, 'sqls');

// Create sqls directory if it doesn't exist
if (!fs.existsSync(sqlsDir)) {
  fs.mkdirSync(sqlsDir, { recursive: true });
}

// Create SQL files
const upSqlPath = path.join(sqlsDir, `${migrationId}-up.sql`);
const downSqlPath = path.join(sqlsDir, `${migrationId}-down.sql`);

// Create SQL files with placeholders
fs.writeFileSync(upSqlPath, `-- Migration: ${migrationName} (up)
-- Created at: ${new Date().toISOString()}
-- Write your UP SQL migration here

`);

fs.writeFileSync(downSqlPath, `-- Migration: ${migrationName} (down)
-- Created at: ${new Date().toISOString()}
-- Write your DOWN SQL migration here

`);

// Create JS file that references the SQL files
const jsFilePath = path.join(migrationsDir, `${migrationId}.js`);
const jsContent = `'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Migration: ${migrationName}
 * Created at: ${new Date().toISOString()}
 */

const sqlUp = fs.readFileSync(path.join(__dirname, 'sqls', '${migrationId}-up.sql'), 'utf8');
const sqlDown = fs.readFileSync(path.join(__dirname, 'sqls', '${migrationId}-down.sql'), 'utf8');

exports.up = function(db) {
  return db.runSql(sqlUp);
};

exports.down = function(db) {
  return db.runSql(sqlDown);
};

exports._meta = {
  version: 1
};
`;

fs.writeFileSync(jsFilePath, jsContent);

console.log(`Migration created successfully!`);
console.log(`- JS file: ${jsFilePath}`);
console.log(`- Up SQL: ${upSqlPath}`);
console.log(`- Down SQL: ${downSqlPath}`);
console.log('\nYou can now edit the SQL files to define your migration.');