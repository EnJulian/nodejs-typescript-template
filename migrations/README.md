# Database Migrations

This project uses SQL-based migrations for database schema changes. The migration system is built on top of [db-migrate](https://db-migrate.readthedocs.io/en/latest/) but uses SQL files for better readability and simplicity.

## Creating a New Migration

To create a new migration, run:

```bash
npm run migrate:create <migration-name>
```

This will create:
1. A JavaScript file in the `migrations` directory
2. Two SQL files in the `migrations/sqls` directory:
   - `<timestamp>-<migration-name>-up.sql` - Contains SQL to apply the migration
   - `<timestamp>-<migration-name>-down.sql` - Contains SQL to revert the migration

## Writing Migrations

Edit the generated SQL files to define your migration:

### Up Migration

The up migration should contain SQL statements to make the desired changes to the database schema:

```sql
-- Example: Create a new table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX products_name_idx ON products (name);
```

### Down Migration

The down migration should contain SQL statements to revert the changes made in the up migration:

```sql
-- Example: Drop the table created in the up migration
DROP TABLE IF EXISTS products;
```

## Running Migrations

- To apply all pending migrations: `npm run migrate:up`
- To revert the most recent migration: `npm run migrate:down`
- To reset the database (revert all migrations and apply them again): `npm run db:reset`

## Migration Best Practices

1. **Keep migrations small and focused** - Each migration should make a specific change to the database schema.
2. **Always provide a down migration** - Ensure that each migration can be reverted.
3. **Test migrations** - Test both the up and down migrations to ensure they work as expected.
4. **Use transactions** - Wrap complex migrations in transactions to ensure atomicity.
5. **Be careful with data migrations** - When migrating data, consider the volume and performance implications.