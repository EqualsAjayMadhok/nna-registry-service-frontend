#!/bin/bash
# Script to directly deploy to Vercel

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Deploying to Vercel                            ${NC}"
echo -e "${BLUE}==================================================${NC}"
echo

# Function to check if a command exists
command_exists() {
  command -v "$1" &> /dev/null
}

# Check dependencies
if ! command_exists vercel; then
  echo -e "${RED}Error: Vercel CLI not found. Please install it:${NC}"
  echo -e "${BLUE}  npm install -g vercel${NC}"
  exit 1
fi

# First, login to Vercel if needed
if ! vercel whoami &> /dev/null; then
  echo -e "${YELLOW}Please login to Vercel:${NC}"
  vercel login
fi

# Generate build timestamp
BUILD_TIMESTAMP=$(date +%s)
echo -e "${YELLOW}Generated build timestamp: ${BUILD_TIMESTAMP}${NC}"

# Create .env.production with correct API URLs
cat > .env.production << EOL
REACT_APP_BUILD_TIMESTAMP=${BUILD_TIMESTAMP}
REACT_APP_API_URL=https://registry.reviz.dev/api
REACT_APP_REAL_API_URL=https://registry.reviz.dev
REACT_APP_ENV=production
REACT_APP_USE_MOCK_DATA=false
EOL

echo -e "${GREEN}Created .env.production with production settings${NC}"

# Clean the build directory first
rm -rf build
echo -e "${YELLOW}Building project for production...${NC}"
GENERATE_SOURCEMAP=false npm run build
echo -e "${GREEN}Build complete!${NC}"

# Force deploy to Vercel with production environment
echo -e "${YELLOW}Deploying to Vercel...${NC}"
vercel deploy --prod --force

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}  Deployment to Vercel complete!                 ${NC}"
echo -e "${BLUE}==================================================${NC}"
echo
echo -e "${BLUE}Your app should be accessible at:${NC}"
echo -e "${GREEN}https://nna-registry-service-frontend.vercel.app${NC}"