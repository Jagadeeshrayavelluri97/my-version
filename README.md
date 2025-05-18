# PG Hostel Management System

A complete solution for managing PG (Paying Guest) hostels. This system allows PG admins to manage their rooms, tenants, and rent payments.

## Project Structure

This project consists of two main parts:

1. **Backend**: A Node.js + Express.js API with MongoDB database
2. **Frontend**: A React application built with Vite and Tailwind CSS

## Features

- Admin registration and login with JWT authentication
- Dashboard with key metrics
- Room management (add, edit, delete rooms)
- Tenant management (add, edit, delete tenants)
- Rent payment tracking (mark rent as paid/unpaid)
- Data isolation per admin using adminId reference
- Profile management

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Async/await patterns

### Frontend

- React with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API requests
- React Icons for icons
- React Toastify for notifications

## Installation

You can install all dependencies with a single command:

```
npm run install-all
```

Or install them separately:

### Backend

```
cd backend
npm install
```

### Frontend

```
cd frontend
npm install
```

## Running the Application

### Running Both Frontend and Backend Concurrently

```
npm run dev
```

This will start both the backend server and the frontend development server concurrently.

### Running Backend Only

```
npm run server
```

The backend API will be available at `http://localhost:5000`.

### Running Frontend Only

```
npm run client
```

The frontend application will be available at `http://localhost:5173`.

### Testing the Connection

To test if the frontend can connect to the backend:

```
npm run test-connection
```

This will check if the backend server is running and if the API endpoints are accessible.

## API Documentation

See the [backend README](backend/README.md) for detailed API documentation.

## Frontend Documentation

See the [frontend README](frontend/README.md) for detailed frontend documentation.

## Troubleshooting Connection Issues

If you encounter issues connecting the frontend to the backend, try the following:

1. **Check if both servers are running**

   - Backend should be running on port 5000
   - Frontend should be running on port 5173

2. **CORS Issues**

   - The backend is configured to allow all origins (`*`) for development
   - If you see CORS errors in the browser console, make sure the backend CORS settings are correct

3. **API URL Configuration**

   - Check that the frontend is using the correct API URL
   - In development, it should be `http://localhost:5000`
   - In production, it should be your deployed backend URL

4. **Environment Variables**

   - Make sure the `.env` file in the frontend directory has the correct `VITE_API_URL` value
   - For local development: `VITE_API_URL=http://localhost:5000`

5. **Network Issues**
   - Check if your firewall is blocking the connections
   - Try disabling any VPN or proxy services temporarily

## Future Enhancements

- Staff role management
- Rent notifications
- Dashboard with analytics
- Mobile app integration
