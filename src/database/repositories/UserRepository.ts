import { getConnection } from '../connection';
import { User } from '../../types/auth';

export class UserRepository {
  async create(user: Omit<User, 'createdAt'>) {
    const db = getConnection();
    return db.exec(`
      INSERT INTO users (
        id, name, email, password, role, status, phone,
        whatsapp_secret, whatsapp_account, mercadopago_token
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      user.id,
      user.name,
      user.email,
      user.password,
      user.role,
      user.status,
      user.phone,
      user.whatsappConfig?.secret,
      user.whatsappConfig?.account,
      user.paymentConfig?.accessToken
    ]);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const db = getConnection();
    const users = await db.execO('SELECT * FROM users WHERE email = ?', [email]);
    if (!users.length) return undefined;
    
    return this.mapToUser(users[0]);
  }

  async findById(id: string): Promise<User | undefined> {
    const db = getConnection();
    const users = await db.execO('SELECT * FROM users WHERE id = ?', [id]);
    if (!users.length) return undefined;
    
    return this.mapToUser(users[0]);
  }

  async update(id: string, data: Partial<User>) {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.email) {
      updates.push('email = ?');
      values.push(data.email);
    }
    if (data.password) {
      updates.push('password = ?');
      values.push(data.password);
    }
    if (data.status) {
      updates.push('status = ?');
      values.push(data.status);
    }
    if (data.phone) {
      updates.push('phone = ?');
      values.push(data.phone);
    }
    if (data.whatsappConfig) {
      updates.push('whatsapp_secret = ?');
      updates.push('whatsapp_account = ?');
      values.push(data.whatsappConfig.secret);
      values.push(data.whatsappConfig.account);
    }
    if (data.paymentConfig) {
      updates.push('mercadopago_token = ?');
      values.push(data.paymentConfig.accessToken);
    }

    if (updates.length === 0) return;

    values.push(id);
    const db = getConnection();
    return db.exec(`
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, values);
  }

  private mapToUser(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role,
      status: row.status,
      phone: row.phone,
      createdAt: new Date(row.created_at),
      whatsappConfig: row.whatsapp_secret ? {
        secret: row.whatsapp_secret,
        account: row.whatsapp_account
      } : undefined,
      paymentConfig: row.mercadopago_token ? {
        accessToken: row.mercadopago_token,
        webhookUrl: `${process.env.API_URL}/api/webhooks/mercadopago/${row.id}`
      } : undefined
    };
  }
}