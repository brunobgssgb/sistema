import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  name: string;
}

export interface Config {
  isProduction: boolean;
  database: DatabaseConfig;
  api: {
    url: string;
    corsOrigin: string;
  };
}

export function loadEnvConfig(): Config {
  return {
    isProduction: process.env.NODE_ENV === 'production',
    database: {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      name: process.env.DB_NAME || 'recharge_system'
    },
    api: {
      url: process.env.API_URL || 'https://app.recargasmax.com.br',
      corsOrigin: process.env.CORS_ORIGIN || 'https://app.recargasmax.com.br'
    }
  };
}