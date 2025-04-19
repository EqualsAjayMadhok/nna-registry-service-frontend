#!/bin/bash
# Script to set up direct Vercel deployment from GitHub

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}==================================================${NC}"
echo -e "${BLUE}   Setting Up Vercel Auto-Deployment               ${NC}"
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

if ! command_exists git; then
  echo -e "${RED}Error: git not found. Please install git.${NC}"
  exit 1
fi

# First, login to Vercel if needed
if ! vercel whoami &> /dev/null; then
  echo -e "${YELLOW}Please login to Vercel:${NC}"
  vercel login
fi

# Get the git repository information
REPO_URL=$(git config --get remote.origin.url)
if [[ "$REPO_URL" =~ github.com[:/]([^/]+)/([^/.]+)(.git)? ]]; then
  OWNER="${BASH_REMATCH[1]}"
  REPO="${BASH_REMATCH[2]}"
else
  echo -e "${YELLOW}Could not detect GitHub repository from git config.${NC}"
  read -p "Enter GitHub username/organization: " OWNER
  read -p "Enter repository name: " REPO
fi

echo -e "${BLUE}Repository: ${OWNER}/${REPO}${NC}"

# Link the project to Vercel
echo -e "${YELLOW}Linking project to Vercel...${NC}"
vercel link

# Enable GitHub integration
echo -e "${YELLOW}Configuring Vercel for GitHub integration...${NC}"
vercel git connect

# Set up production deployments for main branch
echo -e "${YELLOW}Setting up automatic production deployments for main branch...${NC}"
# Skip adding environment variables
# vercel env add VERCEL_GIT_COMMIT_MESSAGE

# Create a new deployment to trigger the integration
echo -e "${YELLOW}Creating initial deployment to activate the integration...${NC}"
BUILD_TIMESTAMP=$(date +%s)

# Create .env.production with correct API URLs
cat > .env.production << EOL
REACT_APP_BUILD_TIMESTAMP=$BUILD_TIMESTAMP
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
vercel deploy --prod --force

echo -e "${BLUE}==================================================${NC}"
echo -e "${GREEN}  Vercel auto-deployment setup complete!          ${NC}"
echo -e "${BLUE}==================================================${NC}"
echo
echo -e "${BLUE}Now, every push to the main branch will automatically deploy to Vercel.${NC}"
echo -e "${BLUE}You can view your deployments at: https://vercel.com/${OWNER}/${REPO}/deployments${NC}"