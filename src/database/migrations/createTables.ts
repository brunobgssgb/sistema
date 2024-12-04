import { pool } from '../config/connection';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createTables() {
  try {
    console.log('Reading schema file...');
    const schemaPath = path.join(__dirname, '../schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf8');
    
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));

    console.log('Executing schema statements...');
    for (const statement of statements) {
      if (!statement) continue;
      try {
        await pool.execute(statement);
        console.log('✓ Executed statement successfully');
      } catch (error) {
        if (error.code !== 'ER_TABLE_EXISTS_ERROR') {
          console.error('Error executing statement:', error);
          throw error;
        }
      }
    }
    return true;
  } catch (error) {
    console.error('Failed to create tables:', error);
    return false;
  }
}