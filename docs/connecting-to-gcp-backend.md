# Connecting the NNA Registry Service Frontend to GCP Backend

This guide provides step-by-step instructions for connecting the NNA Registry Service frontend deployed on Vercel to the backend deployed on Google Cloud Run.

## Step 1: Verify GCP Backend Deployment

Before connecting the frontend, ensure the backend is properly deployed to Google Cloud Run.

```bash
# Run the GCP deployment check script
cd /Users/ajaymadhok/nna-registry-service
./scripts/check-gcp-deployment.sh
```

This script will:
- Verify GCP authentication
- Check if the Cloud Run service exists
- Get the service URL
- Test if the service is accessible
- Test if the Swagger documentation is available

If you're not authenticated with GCP, run:

```bash
gcloud auth login
```

## Step 2: Check CORS Configuration

The backend needs to allow cross-origin requests from the Vercel frontend domain.

```bash
# Run the CORS test script
cd /Users/ajaymadhok/nna-registry-service
./scripts/test-cors.sh
```

This script will:
- Test if the backend allows requests from the Vercel frontend
- Check the CORS headers in the backend response
- Provide guidance if there are CORS issues

## Step 3: Deploy Backend with Updated CORS Configuration

If the CORS test shows issues, we need to deploy the updated backend with the correct CORS configuration:

```bash
# Authenticate with GCP if not already done
gcloud auth login

# Set the active project
gcloud config set project nna-registry-service

# Build and deploy to Cloud Run
gcloud builds submit --config=cloudbuild.yaml
```

## Step 4: Update Vercel Environment Variables

After verifying the GCP backend is accessible, update the Vercel environment variables.

1. Log in to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your NNA Registry Service frontend project
3. Go to "Settings" → "Environment Variables"
4. Add or update the following environment variables:
   - REACT_APP_REAL_API_URL: `https://nna-registry-service-us-central1.run.app/api`
   - REACT_APP_USE_MOCK_DATA: `true` (keep mock data enabled by default)

5. Redeploy your frontend by clicking "Deployments" and then "Redeploy"

## Step 5: Test API Switching in the Frontend

Once deployed, you can test switching between mock data and the real API:

1. Open your Vercel-deployed frontend
2. Login to the application
3. Open the sidebar menu
4. Click on "API Configuration"
5. Toggle "Use Mock Data" off to use the real GCP backend
6. Click "Save Configuration"

The application will reload and connect to the GCP backend instead of using mock data.

## Troubleshooting

### Authentication Issues

If you experience authentication issues when connecting to the GCP backend:

1. Ensure the JWT secret is properly set up in both the GCP backend and the Vercel frontend
2. Check the browser console for JWT-related errors
3. Try with a new user registration to generate a fresh token

### CORS Issues

If you encounter CORS errors:

1. Check your browser console for specific CORS error messages
2. Verify that the correct frontend domain is included in the backend CORS configuration
3. Redeploy the backend with updated CORS settings
4. Clear your browser cache and try again

### API Access Issues

If the API returns unexpected errors:

1. Check the GCP Cloud Run logs for backend errors
2. Verify the API URL is correctly configured in the Vercel environment variables
3. Test the API endpoints directly using the Swagger UI at `https://nna-registry-service-us-central1.run.app/api/docs`

## Advanced: Adding Custom Domains

For production use, you may want to use custom domains:

1. For the frontend:
   - In Vercel dashboard, go to "Settings" → "Domains"
   - Add your custom domain (e.g., `app.nna-registry.com`)

2. For the backend:
   - In GCP console, go to Cloud Run
   - Select your service
   - Click "Domain Mappings"
   - Add your custom domain (e.g., `api.nna-registry.com`)

3. Update CORS configuration in the backend to include your custom domain
4. Update the `REACT_APP_REAL_API_URL` in Vercel to use your custom API domain