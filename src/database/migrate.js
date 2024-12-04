import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'sistema',
  password: process.env.DB_PASSWORD || 'Bruno@@3905',
  database: process.env.DB_NAME || 'sistema',
  multipleStatements: true
};

async function migrate() {
  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connection successful');

    // Create tables
    console.log('Creating tables...');
    
    const tables = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') NOT NULL,
        status ENUM('pending', 'active', 'inactive') NOT NULL,
        phone VARCHAR(20),
        whatsapp_secret VARCHAR(255),
        whatsapp_account VARCHAR(255),
        mercadopago_token VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Customers table
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      -- Apps table
      CREATE TABLE IF NOT EXISTS apps (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      -- Recharge codes table
      CREATE TABLE IF NOT EXISTS recharge_codes (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        app_id VARCHAR(36) NOT NULL,
        code VARCHAR(255) NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (app_id) REFERENCES apps(id)
      );

      -- Orders table
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        customer_id VARCHAR(36) NOT NULL,
        total DECIMAL(10, 2) NOT NULL,
        status ENUM('pending', 'completed', 'cancelled') NOT NULL,
        payment_id VARCHAR(255),
        payment_status ENUM('pending', 'approved', 'rejected'),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );

      -- Order items table
      CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(36) PRIMARY KEY,
        order_id VARCHAR(36) NOT NULL,
        app_id VARCHAR(36) NOT NULL,
        quantity INT NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (app_id) REFERENCES apps(id)
      );

      -- Order codes table
      CREATE TABLE IF NOT EXISTS order_codes (
        order_id VARCHAR(36) NOT NULL,
        code_id VARCHAR(36) NOT NULL,
        PRIMARY KEY (order_id, code_id),
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (code_id) REFERENCES recharge_codes(id)
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
      CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
      CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
      CREATE INDEX IF NOT EXISTS idx_apps_user_id ON apps(user_id);
      CREATE INDEX IF NOT EXISTS idx_recharge_codes_user_id ON recharge_codes(user_id);
      CREATE INDEX IF NOT EXISTS idx_recharge_codes_app_id ON recharge_codes(app_id);
      CREATE INDEX IF NOT EXISTS idx_recharge_codes_is_used ON recharge_codes(is_used);
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
    `;
    
    await connection.query(tables);
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