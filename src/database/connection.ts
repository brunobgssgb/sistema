import { DB } from '@vlcn.io/crsqlite-wasm';
import wasmUrl from '@vlcn.io/crsqlite-wasm/crsqlite.wasm?url';

let db: DB | null = null;
let initPromise: Promise<void> | null = null;

export async function initDatabase() {
  if (initPromise) return initPromise;

  initPromise = new Promise(async (resolve, reject) => {
    try {
      const sqlite = await import('@vlcn.io/crsqlite-wasm');
      await sqlite.default.init(wasmUrl);
      db = await sqlite.default.open('database.db');
      resolve();
    } catch (error) {
      console.error('Failed to initialize database:', error);
      reject(error);
    }
  });

  return initPromise;
}

export function getConnection() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function closeConnection() {
  if (db) {
    db.close();
    db = null;
  }
}

// Ensure connection is closed when the application exits
window.addEventListener('beforeunload', closeConnection);