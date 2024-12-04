import mysql from 'mysql2/promise';
import { loadEnvConfig } from './env';

const config = loadEnvConfig();

export const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,
  ssl: config.isProduction ? {
    rejectUnauthorized: false
  } : undefined
});

export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection successful');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Ensure connection is properly closed when the application exits
process.on('SIGINT', async () => {
  try {
    await pool.end();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (err) {
    console.error('Error closing database connection:', err);
    process.exit(1);
  }
});