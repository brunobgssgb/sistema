import { pool } from '../config/connection';
import bcrypt from 'bcryptjs';

export async function createAdminUser() {
  try {
    console.log('Checking for admin user...');
    const [adminRows] = await pool.execute(
      'SELECT 1 FROM users WHERE email = ?',
      ['admin@admin.com']
    );

    if (!adminRows || (adminRows as any[]).length === 0) {
      console.log('Creating default admin user...');
      await pool.execute(`
        INSERT INTO users (id, name, email, password, role, status, phone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        crypto.randomUUID(),
        'Admin',
        'admin@admin.com',
        bcrypt.hashSync('admin123', 10),
        'admin',
        'active',
        '5511999999999'
      ]);
      console.log('✓ Created default admin user');
    }
    return true;
  } catch (error) {
    console.error('Failed to create admin user:', error);
    return false;
  }
}