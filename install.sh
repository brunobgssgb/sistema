#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}Starting application setup...${NC}"

# Create .env file
echo -e "${YELLOW}Creating .env file...${NC}"

cat > .env << EOL
# Database Configuration
DB_HOST=localhost
DB_USER=sistema
DB_PASSWORD=Bruno@@3905
DB_NAME=sistema

# API Configuration
API_URL=https://app.recargasmax.com.br
CORS_ORIGIN=https://app.recargasmax.com.br

# Environment
NODE_ENV=production
PORT=3000
EOL

if [ $? -eq 0 ]; then
    echo -e "${GREEN}.env file created successfully!${NC}"
else
    echo -e "${RED}Error creating .env file${NC}"
    exit 1
fi

# Install Node.js dependencies
echo -e "${YELLOW}Installing Node.js dependencies...${NC}"
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Dependencies installed successfully!${NC}"
else
    echo -e "${RED}Error installing dependencies${NC}"
    exit 1
fi

# Build the application
echo -e "${YELLOW}Building the application...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}Application built successfully!${NC}"
else
    echo -e "${RED}Error building application${NC}"
    exit 1
fi

echo -e "${GREEN}Installation completed successfully!${NC}"
echo -e "${YELLOW}You can now start the application with:${NC}"
echo -e "npm start"