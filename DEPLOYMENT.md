# Deployment Documentation

## Current Setup

### Frontend Deployment (Vercel)
- **Repository**: https://github.com/EqualsAjayMadhok/nna-registry-service-frontend
- **Production Branch**: stable-frontend
- **Deployment URL**: https://nna-registry-service-frontend-stable.vercel.app
- **Vercel Project**: nna-registry-service-frontend-stable

#### Environment Variables
```
REACT_APP_API_URL=https://registry.reviz.dev/api
REACT_APP_REAL_API_URL=https://registry.reviz.dev/api
```

#### Deployment Methods
1. **Automatic Vercel Deployment**
   - Triggers on push to stable-frontend branch
   - Uses Vercel's built-in GitHub integration
   - No additional configuration needed

2. **GitHub Actions Workflow**
   - Located in `.github/workflows/auto-deploy.yml`
   - Triggers on push to stable-frontend branch
   - Uses following secrets:
     - VERCEL_TOKEN
     - VERCEL_ORG_ID
     - VERCEL_PROJECT_ID

## Recovery Procedures

### If Deployment Fails
1. Check GitHub Actions logs for errors
2. Verify Vercel deployment logs
3. Confirm environment variables are set correctly
4. Ensure all secrets are properly configured

### Rolling Back Changes
1. **Via Git**:
   ```bash
   git log  # Find the last working commit
   git checkout stable-frontend
   git reset --hard <last-working-commit>
   git push -f origin stable-frontend
   ```

2. **Via Vercel**:
   - Go to Vercel dashboard
   - Find last successful deployment
   - Click "..." → "Promote to Production"

### Verifying Deployment
1. Check frontend application:
   - Visit https://nna-registry-service-frontend-stable.vercel.app
   - Verify login functionality
   - Test asset management features

2. Check API connection:
   - Confirm API endpoints are accessible
   - Verify Swagger docs at /api/docs
   - Test authentication flow

## Backup and Recovery

### Important Configuration Files
1. `.env` files (not in repository)
2. `.github/workflows/auto-deploy.yml`
3. `vercel.json`

### Critical Tokens/Secrets
- Vercel deployment token
- GitHub secrets
- Environment variables

### Recovery Steps
1. **Complete Repository Recovery**:
   ```bash
   git clone https://github.com/EqualsAjayMadhok/nna-registry-service-frontend.git
   cd nna-registry-service-frontend
   git checkout stable-frontend
   ```

2. **Vercel Reconnection**:
   - Import project in Vercel
   - Configure environment variables
   - Set up GitHub integration

3. **GitHub Actions Setup**:
   - Add required secrets
   - Verify workflow file
   - Test deployment