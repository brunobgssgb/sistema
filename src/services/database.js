import { query, transaction } from '../database/connection.js';

export async function createUser(userData) {
  try {
    const { id } = await query(
      `INSERT INTO users (id, name, email, password, role, status, phone)
       VALUES (UUID(), ?, ?, ?, ?, ?, ?)`,
      [userData.name, userData.email, userData.password, userData.role || 'user', 'pending', userData.phone || null]
    );
    return { success: true, id };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: error.message };
  }
}

export async function findUserByEmail(email) {
  try {
    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    return users[0];
  } catch (error) {
    console.error('Error finding user:', error);
    return null;
  }
}

export async function updateUser(id, data) {
  try {
    const updates = [];
    const values = [];

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

    if (updates.length === 0) return { success: true };

    values.push(id);
    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    return { success: true };
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error: error.message };
  }
}