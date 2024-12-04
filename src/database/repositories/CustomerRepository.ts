import { getConnection } from '../connection';
import { Customer } from '../../types';

export class CustomerRepository {
  async create(userId: string, customer: Omit<Customer, 'id' | 'createdAt'>) {
    const db = getConnection();
    const id = crypto.randomUUID();
    
    await db.exec(`
      INSERT INTO customers (id, user_id, name, email, phone)
      VALUES (?, ?, ?, ?, ?)
    `, [id, userId, customer.name, customer.email, customer.phone]);

    return this.findById(userId, id);
  }

  async findById(userId: string, id: string): Promise<Customer | undefined> {
    const db = getConnection();
    const customers = await db.execO(`
      SELECT * FROM customers 
      WHERE user_id = ? AND id = ?
    `, [userId, id]);
    
    if (!customers.length) return undefined;
    return this.mapToCustomer(customers[0]);
  }

  async findByEmail(userId: string, email: string): Promise<Customer | undefined> {
    const db = getConnection();
    const customers = await db.execO(`
      SELECT * FROM customers 
      WHERE user_id = ? AND email = ?
    `, [userId, email]);
    
    if (!customers.length) return undefined;
    return this.mapToCustomer(customers[0]);
  }

  async findAll(userId: string): Promise<Customer[]> {
    const db = getConnection();
    const customers = await db.execO(`
      SELECT * FROM customers 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userId]);
    
    return customers.map(this.mapToCustomer);
  }

  async update(userId: string, id: string, data: Partial<Customer>) {
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
    if (data.phone) {
      updates.push('phone = ?');
      values.push(data.phone);
    }

    if (updates.length === 0) return;

    values.push(userId, id);
    const db = getConnection();
    await db.exec(`
      UPDATE customers 
      SET ${updates.join(', ')}
      WHERE user_id = ? AND id = ?
    `, values);

    return this.findById(userId, id);
  }

  async delete(userId: string, id: string): Promise<void> {
    const db = getConnection();
    await db.exec(`
      DELETE FROM customers 
      WHERE user_id = ? AND id = ?
    `, [userId, id]);
  }

  private mapToCustomer(row: any): Customer {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      createdAt: new Date(row.created_at)
    };
  }
}