import { pool } from '../config/connection';
import { loadEnvConfig } from '../config/env';

const config = loadEnvConfig();

export async function createDatabase() {
  try {
    console.log('Creating database if not exists...');
    await pool.execute(`CREATE DATABASE IF NOT EXISTS ${config.database.name}`);
    await pool.execute(`USE ${config.database.name}`);
    console.log('✓ Database created/selected successfully');
    return true;
  } catch (error) {
    console.error('Failed to create database:', error);
    return false;
  }
}