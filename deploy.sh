#!/bin/bash

# Create production build
npm run build

# Create deployment package
mkdir -p deploy
cp -r dist deploy/
cp package.json deploy/
cp .env deploy/
cp nginx.conf deploy/
cp server.js deploy/

# Create database setup script
cat > deploy/setup-db.sql << EOL
-- Create database
CREATE DATABASE IF NOT EXISTS recharge_system;
USE recharge_system;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL,
  status ENUM('pending', 'active', 'inactive') NOT NULL,
  phone VARCHAR(20),
  whatsapp_secret VARCHAR(255),
  whatsapp_account VARCHAR(255),
  mercadopago_token VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Apps table
CREATE TABLE IF NOT EXISTS apps (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Recharge codes table
CREATE TABLE IF NOT EXISTS recharge_codes (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  app_id VARCHAR(36) NOT NULL,
  code VARCHAR(255) NOT NULL,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (app_id) REFERENCES apps(id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  customer_id VARCHAR(36) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'completed', 'cancelled') NOT NULL,
  payment_id VARCHAR(255),
  payment_status ENUM('pending', 'approved', 'rejected'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(36) PRIMARY KEY,
  order_id VARCHAR(36) NOT NULL,
  app_id VARCHAR(36) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (app_id) REFERENCES apps(id)
);

-- Order codes table
CREATE TABLE IF NOT EXISTS order_codes (
  order_id VARCHAR(36) NOT NULL,
  code_id VARCHAR(36) NOT NULL,
  PRIMARY KEY (order_id, code_id),
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (code_id) REFERENCES recharge_codes(id)
);

-- Create default admin user
INSERT INTO users (id, name, email, password, role, status, phone)
VALUES (
  UUID(),
  'Admin',
  'admin@admin.com',
  '$2a$10$YourHashedPasswordHere',
  'admin',
  'active',
  '5511999999999'
);
EOL

# Create deployment instructions
cat > deploy/README.md << EOL
# Sistema de Recargas - Instruções de Implantação

## Requisitos
- Node.js 18+ 
- MySQL 8+
- Nginx

## Passos para Implantação

1. Configure o banco de dados:
   \`\`\`bash
   mysql -u root -p < setup-db.sql
   \`\`\`

2. Instale as dependências:
   \`\`\`bash
   npm install --production
   \`\`\`

3. Configure as variáveis de ambiente no arquivo .env

4. Configure o Nginx:
   \`\`\`bash
   sudo cp nginx.conf /etc/nginx/sites-available/app.recargasmax.com.br
   sudo ln -s /etc/nginx/sites-available/app.recargasmax.com.br /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   \`\`\`

5. Inicie o servidor:
   \`\`\`bash
   node server.js
   \`\`\`

## Acesso Inicial
- URL: https://app.recargasmax.com.br
- Email: admin@admin.com
- Senha: admin123
EOL

# Create zip package
zip -r deploy.zip deploy/

echo "Deployment package created: deploy.zip"