# PG Hostel Management System API

A RESTful API for managing PG (Paying Guest) hostels. This system allows PG admins to manage their rooms, tenants, and rent payments.

## Features

- Admin registration and login with JWT authentication
- Room management (add, edit, delete rooms)
- Tenant management (add, edit, delete tenants)
- Rent payment tracking (mark rent as paid/unpaid)
- Data isolation per admin using adminId reference

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Async/await patterns

## API Endpoints

### Admin Routes

- `POST /api/v1/admin/register` - Register a new admin
- `POST /api/v1/admin/login` - Login admin
- `GET /api/v1/admin/me` - Get current admin profile
- `PUT /api/v1/admin/updatedetails` - Update admin details
- `PUT /api/v1/admin/updatepassword` - Update admin password

### Room Routes

- `GET /api/v1/rooms` - Get all rooms for logged in admin
- `GET /api/v1/rooms/:id` - Get single room
- `POST /api/v1/rooms` - Create new room
- `PUT /api/v1/rooms/:id` - Update room
- `DELETE /api/v1/rooms/:id` - Delete room

### Tenant Routes

- `GET /api/v1/tenants` - Get all tenants for logged in admin
- `GET /api/v1/tenants/:id` - Get single tenant
- `POST /api/v1/tenants` - Create new tenant
- `PUT /api/v1/tenants/:id` - Update tenant
- `DELETE /api/v1/tenants/:id` - Delete tenant

### Rent Routes

- `GET /api/v1/rents` - Get all rent records for logged in admin
- `GET /api/v1/rents/:id` - Get single rent record
- `POST /api/v1/rents` - Create new rent record
- `PUT /api/v1/rents/:id` - Update rent record (mark as paid/unpaid)
- `DELETE /api/v1/rents/:id` - Delete rent record

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```
4. Run the server: `npm run dev`

## Usage

1. Register as an admin
2. Login to get JWT token
3. Use the token in the Authorization header for protected routes:
   ```
   Authorization: Bearer your_jwt_token
   ```
4. Manage rooms, tenants, and rent payments

## Future Enhancements

- Staff role management
- Rent notifications
- Dashboard with analytics
- Mobile app integration
