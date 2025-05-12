'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Create users table and role_permissions table
 */
const sqlUp = fs.readFileSync(path.join(__dirname, 'sqls', '20230101000000-create-users-table-up.sql'), 'utf8');
const sqlDown = fs.readFileSync(path.join(__dirname, 'sqls', '20230101000000-create-users-table-down.sql'), 'utf8');

exports.up = function (db) {
  return db.runSql(sqlUp);
};

/**
 * Drop users table and role_permissions table
 */
exports.down = function (db) {
  return db.runSql(sqlDown);
};

/**
 * Get filename of migration script
 */
exports._meta = {
  version: 1
}; 
