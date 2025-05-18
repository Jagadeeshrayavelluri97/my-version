# PG Hostel Management System Frontend

A React-based frontend for the PG Hostel Management System. This application allows PG admins to manage their rooms, tenants, and rent payments.

## Features

- Admin registration and login
- Dashboard with key metrics
- Room management (add, edit, delete rooms)
- Tenant management (add, edit, delete tenants)
- Rent payment tracking (mark rent as paid/unpaid)
- Profile management

## Tech Stack

- React with Vite
- React Router for navigation
- Tailwind CSS for styling
- Axios for API requests
- React Icons for icons
- React Toastify for notifications

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd frontend
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. Register as an admin
2. Login to access the dashboard
3. Manage rooms, tenants, and rent payments
4. Update your profile settings

## Project Structure

- `src/components`: Reusable UI components
- `src/pages`: Page components for different routes
- `src/utils`: Utility functions and API calls
- `src/App.jsx`: Main application component with routing
- `src/main.jsx`: Entry point for the application

## API Integration

The frontend is designed to work with the PG Hostel Management System API. It uses Axios for API requests and includes proxy configuration for development.

## Deployment

To build the application for production:

```
npm run build
```

This will create a `dist` folder with the production-ready files.
