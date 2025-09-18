# HopOn Backend API

Express.js backend API for the HopOn Campus Bike Sharing platform with TypeORM and PostgreSQL integration.

## 🚀 Features

- **User Authentication**: JWT-based authentication with registration and login
- **Bike Management**: Real-time bike availability and booking system
- **Ride Management**: Complete ride lifecycle from booking to completion
- **PostgreSQL Database**: Robust data persistence with TypeORM
- **API Validation**: Request validation with class-validator
- **CORS Enabled**: Cross-origin requests support for frontend integration

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── entities/        # TypeORM database entities
│   ├── middleware/      # Authentication middleware
│   ├── routes/          # API route definitions
│   ├── utils/           # Validation DTOs and utilities
│   └── server.ts        # Main application entry point
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── .env.example         # Environment variables template
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` file with your configuration:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_DATABASE=hopon_db
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=24h
   FRONTEND_URL=http://localhost:3000
   ```

4. **Create PostgreSQL database:**
   ```sql
   CREATE DATABASE hopon_db;
   ```

5. **Build the project:**
   ```bash
   npm run build
   ```

6. **Start the server:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (requires auth)
- `GET /api/auth/check-login-id/:loginId` - Check login ID availability
- `GET /api/auth/check-email/:email` - Check email availability

### Bikes
- `GET /api/bikes` - Get all bikes
- `GET /api/bikes/location/:location` - Get available bikes at location
- `GET /api/bikes/stats` - Get bike statistics
- `GET /api/bikes/:bikeId` - Get bike by ID
- `POST /api/bikes/:bikeId/book` - Book a bike (requires auth)
- `POST /api/bikes/:bikeId/return` - Return a bike (requires auth)

### Rides
- `GET /api/rides` - Get all rides
- `GET /api/rides/stats` - Get ride statistics
- `POST /api/rides` - Create new ride (requires auth)
- `GET /api/rides/user/:userId` - Get user rides (requires auth)
- `GET /api/rides/user/:userId/active` - Get active ride (requires auth)
- `PUT /api/rides/:rideId/complete` - Complete ride (requires auth)
- `PUT /api/rides/:rideId/cancel` - Cancel ride (requires auth)

### Health Check
- `GET /api/health` - API health status

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in requests:

```bash
Authorization: Bearer <your_jwt_token>
```

## 📊 Database Schema

### Users Table
- `id` (PK) - Unique user identifier
- `loginId` - Unique login identifier
- `name` - User's full name
- `email` - User's email address
- `phone` - User's phone number
- `password` - Hashed password
- `totalRides` - Total completed rides count
- `profile` - JSON profile data (avatar, preferences)
- `createdAt` - Account creation timestamp
- `updatedAt` - Last update timestamp

### Bikes Table
- `id` (PK) - Unique bike identifier (e.g., BIKE001)
- `number` - Bike number
- `location` - Current location
- `isAvailable` - Availability status
- `condition` - Bike condition (Excellent/Good/Fair)
- `lastMaintenance` - Last maintenance date
- `batteryLevel` - Battery level (0-100)
- `totalRides` - Total rides completed
- `rating` - Average user rating
- `currentUser` - Current user (if booked)
- `bookedAt` - Booking timestamp
- `returnedAt` - Return timestamp

### Rides Table
- `id` (PK) - Unique ride identifier
- `userId` (FK) - User who booked the ride
- `bikeId` (FK) - Bike used for the ride
- `startLocation` - Pickup location
- `endLocation` - Drop-off location
- `startTime` - Ride start timestamp
- `endTime` - Ride end timestamp
- `status` - Ride status (active/completed/cancelled)
- `timerDuration` - Planned duration in minutes
- `actualDuration` - Actual duration in minutes
- `rating` - User's rating for the ride
- `feedback` - User's feedback
- `cost` - Ride cost (currently free)

## 🔄 API Response Format

All API responses follow this consistent format:

```json
{
  "success": boolean,
  "message": "string (optional)",
  "data": "object/array (response data)",
  "error": "string (only in development mode)"
}
```

### Example Responses

**Success Response:**
```json
{
  "success": true,
  "user": {
    "id": "USER_1699123456789_abc123",
    "loginId": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "totalRides": 5
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid login credentials"
}
```

## 🗄️ Initial Data

The application automatically initializes with:
- 25 bikes at location "AB1"
- Random bike conditions and ratings
- Battery levels set to 100%

## 🚀 Development

**Available Scripts:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run typeorm` - Run TypeORM CLI commands

## 🐛 Troubleshooting

**Common Issues:**

1. **Database Connection Failed**
   - Check PostgreSQL is running
   - Verify database credentials in `.env`
   - Ensure database `hopon_db` exists

2. **Port Already in Use**
   - Change `PORT` in `.env` file
   - Kill existing process: `kill -9 $(lsof -ti:3001)`

3. **JWT Secret Error**
   - Set a strong `JWT_SECRET` in `.env`
   - Restart the server after changes

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | - |
| `DB_DATABASE` | Database name | `hopon_db` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | Token expiration | `24h` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |

## 🤝 Integration with Frontend

This backend maintains the exact same API response format as the localStorage implementation in the frontend. To integrate:

1. Start the backend server on port 3001
2. Update frontend API calls to use `http://localhost:3001/api`
3. Add authentication headers for protected endpoints
4. Handle JWT tokens for session management

The response format is designed to be a drop-in replacement for the existing localStorage system.