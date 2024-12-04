import { pool } from '../config/connection';

export class BaseRepository {
  protected async query<T>(sql: string, params?: any[]): Promise<T[]> {
    try {
      const [results] = await pool.execute(sql, params);
      return results as T[];
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  protected async execute(sql: string, params?: any[]): Promise<void> {
    try {
      await pool.execute(sql, params);
    } catch (error) {
      console.error('Execute error:', error);
      throw error;
    }
  }
}