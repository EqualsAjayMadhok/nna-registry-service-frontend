#!/bin/bash
# Simple direct deploy script

# Set the timestamp
TIMESTAMP=$(date +%s)
echo "Using build timestamp: $TIMESTAMP"

# Create .env.production with the correct settings
cat > .env.production << EOL
REACT_APP_BUILD_TIMESTAMP=$TIMESTAMP
REACT_APP_API_URL=https://registry.reviz.dev/api
REACT_APP_REAL_API_URL=https://registry.reviz.dev
REACT_APP_ENV=production
REACT_APP_USE_MOCK_DATA=false
GENERATE_SOURCEMAP=false
EOL

echo "Created .env.production with production settings"

# Deploy directly to Vercel
echo "Deploying to Vercel..."
npx vercel --prod --force

echo "Deployment complete!"