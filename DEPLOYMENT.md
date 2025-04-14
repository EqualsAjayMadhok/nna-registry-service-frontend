# NNA Registry Service Frontend Deployment Guide

This guide provides instructions for building and deploying the NNA Registry Service Frontend to various environments.

## Prerequisites

- Node.js (v14+)
- npm
- Access to the deployment target (GCP, Netlify, Vercel, or traditional web hosting)

## Building for Production

### 1. Update package.json Scripts

The following scripts are available in the `package.json` file:

```json
"scripts": {
  "start": "react-scripts start",
  "build": "react-scripts build",
  "test": "react-scripts test",
  "eject": "react-scripts eject",
  "analyze": "source-map-explorer 'build/static/js/*.js'",
  "lint": "eslint src --ext .ts,.tsx",
  "lint:fix": "eslint src --ext .ts,.tsx --fix"
}
```

For optimized production builds, we recommend adding the following:

```json
"scripts": {
  // ... existing scripts
  "build:prod": "GENERATE_SOURCEMAP=false react-scripts build"
}
```

### 2. Environment Configuration for Production

1. Create a `.env.production` file in the project root:

```
REACT_APP_API_URL=https://api.your-production-domain.com
REACT_APP_ENV=production
```

2. If using Sentry for error tracking, add:

```
REACT_APP_SENTRY_DSN=your-sentry-dsn
```

### 3. Building the Application

To create a production build, run:

```bash
npm run build:prod
```

This will create a `build` directory with optimized production files.

## Deployment Options

### 1. Google Cloud Storage

#### Prerequisites

- Google Cloud account
- `gcloud` CLI tool installed and configured
- A GCP project with billing enabled

#### Steps

1. Create a GCS bucket:

```bash
gsutil mb -l us-central1 gs://your-bucket-name
```

2. Set the bucket as a public website:

```bash
gsutil web set -m index.html -e 404.html gs://your-bucket-name
```

3. Make the bucket publicly readable:

```bash
gsutil iam ch allUsers:objectViewer gs://your-bucket-name
```

4. Upload the build files:

```bash
gsutil -m cp -r build/* gs://your-bucket-name/
```

5. Set Cache-Control metadata for static assets:

```bash
gsutil -m setmeta -h "Cache-Control:public, max-age=31536000" gs://your-bucket-name/static/**
gsutil -m setmeta -h "Cache-Control:no-cache, no-store" gs://your-bucket-name/index.html
```

6. Optional: Set up a custom domain with Cloud CDN for better performance.

### 2. Netlify Deployment

#### Prerequisites

- Netlify account
- Netlify CLI (optional)

#### Steps

1. Manual deployment:
   - Go to Netlify dashboard
   - Click "New site from Git" or drag and drop the `build` folder
   - Follow the prompts to complete deployment

2. Using Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy from build folder
netlify deploy --prod --dir=build
```

3. Environment variables:
   - Set environment variables in the Netlify dashboard under site settings

4. Create a `netlify.toml` file for more configuration:

```toml
[build]
  publish = "build"
  command = "npm run build:prod"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 3. Vercel Deployment (Updated April 2025)

#### Prerequisites

- Vercel account
- GitHub repository with your frontend code
- Vercel CLI (optional)

#### Steps for NNA Registry Service

1. **Updated vercel.json Configuration**:
   
   We've created an updated `vercel.json` configuration file with embedded environment variables:

   ```json
   {
     "framework": "create-react-app",
     "buildCommand": "npm run build",
     "installCommand": "npm install",
     "outputDirectory": "build",
     "env": {
       "REACT_APP_API_URL": "https://nna-registry-service-backend.vercel.app/api",
       "REACT_APP_ENV": "production",
       "REACT_APP_USE_MOCK_DATA": "true",
       "GENERATE_SOURCEMAP": "false"
     },
     "routes": [
       { "src": "/static/(.*)", "dest": "/static/$1" },
       { "src": "/favicon.ico", "dest": "/favicon.ico" },
       { "src": "/manifest.json", "dest": "/manifest.json" },
       { "src": "/demo.html", "dest": "/demo.html" },
       { "src": "/(.*)", "dest": "/index.html" }
     ]
   }
   ```

2. **Vercel Dashboard Deployment (Recommended)**:

   a. Push your latest code to GitHub:
   ```bash
   git add .
   git commit -m "Update Vercel configuration"
   git push
   ```

   b. Go to [Vercel Dashboard](https://vercel.com/dashboard)
      - Click "Add New..." > "Project"
      - Import your GitHub repository
      - Select the repository containing the NNA Registry Service

   c. Configure project settings:
      - Framework Preset: Create React App
      - Root Directory: `./` (leave as default)
      - Build and Output Settings: (leave defaults)

   d. Environment Variables:
      Manually add these environment variables:
      - `REACT_APP_API_URL`: https://nna-registry-service-backend.vercel.app/api
      - `REACT_APP_ENV`: production
      - `REACT_APP_USE_MOCK_DATA`: true
      - `GENERATE_SOURCEMAP`: false

   e. Click "Deploy"
      - Vercel will build and deploy your application
      - Once complete, you'll get a deployment URL to share

3. **CLI Deployment (Alternative)**:

   ```bash
   # Install Vercel CLI
   npm install -g vercel

   # Login to Vercel
   vercel login

   # Deploy
   vercel --prod
   ```

   Follow the interactive prompts to complete the deployment.

4. **Post-Deployment Steps**:

   a. Test the application:
      - Verify all pages and components display correctly
      - Test the NNA taxonomy visualization functionality
      - Verify the asset registration workflow
      - Check that Upload Training Data button is working properly

   b. Share the URL with team members:
      - The URL will be in the format: https://nna-registry-service.vercel.app

   c. (Optional) Set up custom domain in Vercel Dashboard

### 4. Traditional Web Hosting

#### Prerequisites

- FTP or SSH access to your web server
- Web server (Apache, Nginx, etc.)

#### Steps

1. Build the application:

```bash
npm run build:prod
```

2. Upload the contents of the `build` directory to your web server's document root or designated folder.

3. Configure the web server:

   **Apache (.htaccess file):**

   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>

   # Cache static assets
   <FilesMatch "\.(js|css|jpg|jpeg|png|gif|svg)$">
     Header set Cache-Control "max-age=31536000, public"
   </FilesMatch>

   # Don't cache HTML
   <FilesMatch "\.(html)$">
     Header set Cache-Control "no-cache, no-store, must-revalidate"
   </FilesMatch>
   ```

   **Nginx (nginx.conf or site configuration):**

   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     root /path/to/build;
     index index.html;

     # Cache static assets
     location ~* \.(js|css|png|jpg|jpeg|gif|svg)$ {
       expires 1y;
       add_header Cache-Control "public, max-age=31536000";
     }

     # Don't cache HTML
     location ~* \.(html)$ {
       expires -1;
       add_header Cache-Control "no-cache, no-store, must-revalidate";
     }

     # Handle SPA routing
     location / {
       try_files $uri $uri/ /index.html;
     }
   }
   ```

## CI/CD Integration

For automated deployments, consider setting up CI/CD pipelines:

### GitHub Actions Example

Create a file at `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build:prod
        env:
          REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
          
      # Deploy to GCS example  
      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v0
        with:
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          
      - name: Deploy to GCS
        run: |
          gsutil -m cp -r build/* gs://your-bucket-name/
```

## Monitoring and Performance

For production deployments, consider adding:

1. **Monitoring tools**:
   - Google Analytics
   - Sentry for error tracking
   - Lighthouse for performance auditing

2. **Performance optimizations**:
   - Enable GZIP/Brotli compression
   - Use a CDN for static assets
   - Implement lazy loading for routes and components

## Security Considerations

1. Configure secure headers:
   - Content-Security-Policy
   - X-XSS-Protection
   - X-Content-Type-Options
   - Referrer-Policy

2. Ensure HTTPS is enforced

3. Implement proper CORS configuration on the backend API

4. Regularly audit dependencies for vulnerabilities with `npm audit`

## Troubleshooting

- **404 errors after page refresh**: Ensure your server is configured to serve the React app's index.html for all routes
- **API connection issues**: Verify CORS settings and API URL configuration
- **Authentication problems**: Check if the JWT token is being properly stored and transmitted