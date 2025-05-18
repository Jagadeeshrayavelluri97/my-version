# PG Management System Deployment Guide

This guide provides step-by-step instructions for deploying the PG Management System, with the frontend on Vercel and the backend on Render.

## Prerequisites

- GitHub account
- Vercel account
- Render account
- MongoDB Atlas account (for the database)

## Backend Deployment (Render)

### 1. Prepare Your Backend Code

Make sure your backend code is ready for deployment:

- The CORS configuration is set up to allow requests from your Vercel frontend
- Environment variables are properly configured
- The Procfile is created

### 2. Create a New Web Service on Render

1. Log in to your Render account
2. Click on "New" and select "Web Service"
3. Connect your GitHub repository or upload your code directly
4. Configure the service with the following settings:
   - **Name**: pg-management-system-api
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 3. Configure Environment Variables

Add the following environment variables in the Render dashboard:

- `NODE_ENV`: production
- `PORT`: 10000 (or any port Render assigns)
- `MONGO_URI`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret key
- `JWT_EXPIRE`: 30d

### 4. Deploy the Backend

Click "Create Web Service" and wait for the deployment to complete. Render will provide you with a URL for your backend API (e.g., https://pg-management-system-api.onrender.com).

### 5. Test the Backend

Visit your backend URL to ensure it's running correctly. You should see the message "PG Management System API is running...".

You can also test the debug endpoint at `/api/v1/debug` to verify the CORS configuration and environment variables.

## Frontend Deployment (Vercel)

### 1. Prepare Your Frontend Code

Make sure your frontend code is ready for deployment:

- The API URL is correctly configured to point to your Render backend
- Environment variables are properly set up
- The vercel.json file is created

### 2. Deploy to Vercel

#### Option 1: Using the Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure the project:
   - Framework Preset: Vite
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: dist
4. Add environment variables:
   - `VITE_API_URL`: Your Render backend URL (e.g., https://pg-management-system-api.onrender.com)
5. Click "Deploy" and wait for the deployment to complete

#### Option 2: Using the Vercel CLI

1. Install the Vercel CLI: `npm install -g vercel`
2. Navigate to your frontend directory: `cd frontend`
3. Run `vercel login` and follow the prompts to log in
4. Run `vercel` to deploy your project
5. Follow the prompts:
   - Set up and deploy: Yes
   - Link to existing project: No
   - Project name: pg-management-system
   - Directory: ./
   - Override settings: No

### 3. Configure Environment Variables in Vercel

If you need to update environment variables after deployment:

1. Go to your project in the Vercel dashboard
2. Navigate to the "Settings" tab
3. Click on "Environment Variables"
4. Add or update the `VITE_API_URL` variable with your Render backend URL
5. Click "Save" and redeploy if necessary

## Troubleshooting

### API Calls Failing

If your frontend can't connect to the backend, check the following:

1. **CORS Issues**: 
   - Verify that your backend CORS configuration includes your Vercel frontend URL
   - Check for typos in the URL (e.g., "management" vs "mangement")
   - Make sure the protocol (http/https) is correct

2. **Environment Variables**:
   - Check that `VITE_API_URL` is correctly set in Vercel
   - Verify the value doesn't have a trailing slash
   - Make sure the URL is accessible (try visiting it in a browser)

3. **Network Issues**:
   - Check browser console for network errors
   - Use the debug endpoint (`/api/v1/debug`) to verify connectivity
   - Check if your backend is actually running on Render

4. **Authentication Issues**:
   - Verify that JWT tokens are being properly sent and received
   - Check for token expiration issues

### Backend Not Starting

If your backend fails to start on Render:

1. Check the build logs for errors
2. Verify that all required environment variables are set
3. Make sure your MongoDB connection string is correct and the IP is whitelisted
4. Check that the start command in the Procfile matches your package.json

## Maintenance

### Updating Your Deployment

#### Backend (Render)

Render automatically deploys when you push changes to your connected repository. You can also manually deploy from the Render dashboard.

#### Frontend (Vercel)

Vercel automatically deploys when you push changes to your connected repository. You can also manually deploy from the Vercel dashboard or using the Vercel CLI.

### Monitoring

- Use the Render dashboard to monitor your backend service
- Use the Vercel dashboard to monitor your frontend deployment
- Set up logging and error tracking for production monitoring
