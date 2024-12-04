import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import { dbConfig } from './config.js';
import { schema } from './schema.js';

async function migrate() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connection successful');

    // Create tables
    console.log('Creating tables...');
    await connection.query(schema);
    console.log('✓ Tables created successfully');

    // Check for admin user
    console.log('Checking for admin user...');
    const [adminRows] = await connection.query(
      'SELECT 1 FROM users WHERE email = ?',
      ['admin@admin.com']
    );

    if (!adminRows.length) {
      console.log('Creating default admin user...');
      await connection.query(`
        INSERT INTO users (id, name, email, password, role, status, phone)
        VALUES (UUID(), ?, ?, ?, ?, ?, ?)
      `, [
        'Admin',
        'admin@admin.com',
        bcrypt.hashSync('admin123', 10),
        'admin',
        'active',
        '5511999999999'
      ]);
      console.log('✓ Created default admin user');
    }

    console.log('✓ Database migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

migrate();