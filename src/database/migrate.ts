import { testConnection, pool } from './config/connection';
import { createDatabase } from './migrations/createDatabase';
import { createTables } from './migrations/createTables';
import { createAdminUser } from './migrations/createAdmin';

async function migrate() {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Failed to connect to database');
      process.exit(1);
    }

    // Run migrations in sequence
    const dbCreated = await createDatabase();
    if (!dbCreated) {
      throw new Error('Failed to create database');
    }

    const tablesCreated = await createTables();
    if (!tablesCreated) {
      throw new Error('Failed to create tables');
    }

    const adminCreated = await createAdminUser();
    if (!adminCreated) {
      throw new Error('Failed to create admin user');
    }

    console.log('✓ Database migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();