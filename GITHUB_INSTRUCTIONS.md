# GitHub Repository Setup Instructions

Follow these steps to create a new GitHub repository and push the NNA Registry Service Frontend code.

## 1. Create a New GitHub Repository

1. Go to [GitHub](https://github.com) and sign in to your account
2. Click the "+" icon in the top-right corner and select "New repository"
3. Repository name: `nna-registry-frontend`
4. Description: "Frontend application for the NNA Registry Service"
5. Choose visibility (Public or Private)
6. Don't initialize with README, .gitignore, or license (we already have these)
7. Click "Create repository"

## 2. Push Your Code to GitHub

After creating the repository, GitHub will show you commands to push existing code. Use these commands in your terminal:

```bash
# Navigate to your frontend directory
cd /Users/ajaymadhok/nna-registry-service/frontend

# Add the GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/nna-registry-frontend.git

# Push your code to GitHub
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## 3. Configure GitHub Repository Settings

After pushing your code:

1. Go to the repository Settings
2. Set up branch protection rules for `main` branch (optional but recommended)
3. Enable GitHub Pages for the `build` folder (if you want to deploy directly from GitHub)

## 4. CI/CD Setup (Optional)

To set up continuous integration and deployment:

1. Go to the Actions tab in your repository
2. Select a workflow template (Node.js is appropriate for this project)
3. Customize the workflow file to:
   - Install dependencies
   - Run linting and tests
   - Build the application
   - Deploy to your chosen platform

Example workflow file (`.github/workflows/main.yml`):

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    
    - name: Set up Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '16'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run linting
      run: npm run lint
      
    - name: Run tests
      run: npm test -- --watchAll=false
      
    - name: Build
      run: npm run build:prod
      env:
        REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
```

## 5. Managing Environment Variables

For environment variables needed in production or CI/CD:

1. Go to your repository Settings
2. Select Secrets and variables > Actions
3. Add your secrets (e.g., `REACT_APP_API_URL`, `REACT_APP_SENTRY_DSN`)

These secrets can be used in your GitHub Actions workflows.