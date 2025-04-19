#!/bin/bash
# Script to check Vercel deployment status

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Checking Vercel deployment status...${NC}"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "Vercel CLI not found. Installing..."
  npm install -g vercel
fi

# List recent deployments
echo -e "${YELLOW}Recent deployments:${NC}"
vercel ls

echo -e "${GREEN}To check a specific deployment, visit:${NC}"
echo "https://vercel.com/equalsajaymadhoks-projects/nna-registry-service-frontend/deployments"
echo
echo -e "${YELLOW}Deployment URLs:${NC}"
echo "Production: https://nna-registry-service-frontend.vercel.app"