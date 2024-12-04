import { getConnection } from '../connection';
import { App } from '../../types';

export class AppRepository {
  async create(userId: string, app: Omit<App, 'id' | 'createdAt'>) {
    const db = getConnection();
    const id = crypto.randomUUID();
    
    await db.exec(`
      INSERT INTO apps (id, user_id, name, price)
      VALUES (?, ?, ?, ?)
    `, [id, userId, app.name, app.price]);

    return this.findById(userId, id);
  }

  async findById(userId: string, id: string): Promise<App | undefined> {
    const db = getConnection();
    const apps = await db.execO(`
      SELECT * FROM apps 
      WHERE user_id = ? AND id = ?
    `, [userId, id]);
    
    if (!apps.length) return undefined;
    return this.mapToApp(apps[0]);
  }

  async findAll(userId: string): Promise<App[]> {
    const db = getConnection();
    const apps = await db.execO(`
      SELECT * FROM apps 
      WHERE user_id = ?
      ORDER BY name ASC
    `, [userId]);
    
    return apps.map(this.mapToApp);
  }

  async update(userId: string, id: string, data: Partial<App>) {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (typeof data.price === 'number') {
      updates.push('price = ?');
      values.push(data.price);
    }

    if (updates.length === 0) return;

    values.push(userId, id);
    const db = getConnection();
    await db.exec(`
      UPDATE apps 
      SET ${updates.join(', ')}
      WHERE user_id = ? AND id = ?
    `, values);

    return this.findById(userId, id);
  }

  async delete(userId: string, id: string): Promise<void> {
    const db = getConnection();
    await db.exec(`
      DELETE FROM apps 
      WHERE user_id = ? AND id = ?
    `, [userId, id]);
  }

  private mapToApp(row: any): App {
    return {
      id: row.id,
      name: row.name,
      price: row.price,
      createdAt: new Date(row.created_at)
    };
  }
}