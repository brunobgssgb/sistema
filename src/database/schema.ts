export const schema = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL,
      phone TEXT,
      whatsapp_secret TEXT,
      whatsapp_account TEXT,
      mercadopago_token TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `,

  customers: `
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `,

  apps: `
    CREATE TABLE IF NOT EXISTS apps (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `,

  recharge_codes: `
    CREATE TABLE IF NOT EXISTS recharge_codes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      app_id TEXT NOT NULL,
      code TEXT NOT NULL,
      is_used BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (app_id) REFERENCES apps(id)
    )
  `,

  orders: `
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT NOT NULL,
      payment_id TEXT,
      payment_status TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `,

  order_items: `
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      app_id TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      unit_price REAL NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (app_id) REFERENCES apps(id)
    )
  `,

  order_codes: `
    CREATE TABLE IF NOT EXISTS order_codes (
      order_id TEXT NOT NULL,
      code_id TEXT NOT NULL,
      PRIMARY KEY (order_id, code_id),
      FOREIGN KEY (order_id) REFERENCES orders(id),
      FOREIGN KEY (code_id) REFERENCES recharge_codes(id)
    )
  `
};