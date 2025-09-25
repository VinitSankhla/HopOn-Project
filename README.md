# HopOn 🚴‍♂️

## Campus Bike Sharing Application

HopOn is a smart campus bike-sharing solution designed to solve short-duration travel problems within college campuses.

### 🎯 Problem Statement
Students often need to travel short distances within campus for:
- Picking up parcels
- Retrieving forgotten items from hostel
- Moving between academic blocks (AB1 to AB2)
- Rushing to classes when running late
- Quick trips between hostel and classes

### 💡 Solution
HopOn provides a smart bike-sharing system with:
- Real-time bike availability tracking
- Location-based booking system
- Timer-based ride management
- User-friendly mobile-responsive interface

### 🚀 Features (Implemented)
- [x] Comprehensive landing page with marketing content
- [x] User authentication system (registration and login)
- [x] Real-time form validation and email availability checking
- [x] Password strength indicators
- [x] Responsive design optimized for mobile and desktop
- [x] User dashboard (partial implementation)
- [x] Ride booking interface (partial implementation)
- [x] Backend API with PostgreSQL database
- [x] JWT-based authentication
- [x] RESTful API endpoints for users, bikes, and rides
- [x] Multiple campus locations support (AB1, AB2, Boys Hostel, Girls Hostel)

### 🏗️ Tech Stack

#### Frontend
- **Languages**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Custom CSS with modern design patterns
- **Fonts**: Inter, Poppins (Google Fonts)
- **Icons**: Font Awesome
- **Design**: Mobile-first responsive approach

#### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM with entity-based architecture
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing
- **API**: RESTful API with comprehensive error handling

### 📁 Project Structure
```
HopOn/
├── index.html              # Marketing/Landing page
├── login.html              # Authentication page
├── css/
│   ├── styles.css         # Main stylesheet
│   ├── components.css     # Component styles
│   └── select-styles.css  # Custom form styling
├── js/
│   ├── app.js            # Main application logic
│   ├── auth.js           # Authentication handling
│   ├── api.js            # API service layer
│   └── storage.js        # Data management wrapper
├── pages/
│   ├── dashboard.html    # User dashboard
│   ├── booking.html      # Ride booking interface
│   └── history.html      # Ride history page
├── backend/              # Full TypeScript backend
│   ├── src/
│   │   ├── entities/     # Database entities (User, Bike, Ride)
│   │   ├── controllers/  # API route controllers
│   │   ├── routes/       # Express routes
│   │   ├── middleware/   # Authentication middleware
│   │   ├── config/       # Database configuration
│   │   └── server.ts     # Main server file
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

### 🎨 Design Philosophy
- **Gen Z Appeal**: Modern, colorful, and intuitive interface
- **Mobile First**: Optimized for smartphone usage
- **Quick Access**: Minimal clicks to book a ride

### 🛠️ Setup & Installation

#### Frontend (Development)
1. Clone or download the project
2. Open `index.html` in your web browser for the landing page
3. Open `login.html` for the authentication interface
4. No build process required - pure HTML/CSS/JavaScript

#### Backend (Development)
1. Navigate to the `backend` directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (create `.env` file):
   ```
   DATABASE_URL=your_postgresql_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   PORT=3002
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

#### Production Deployment
- **Frontend**: Deployed on AWS Amplify
- **Backend**: Deployed on Vercel
- **Database**: PostgreSQL (cloud-hosted)
- **API Base URL**: `https://hop-on-project-8uw1kifgp-vinitsankhlas-projects.vercel.app/api`

### 📱 Current Usage
1. **Landing Page**: Visit `index.html` to see the complete marketing website with features, testimonials, and FAQ
2. **Authentication**: Go to `login.html` to create an account or login
   - Real-time email validation
   - Password strength checking
   - Form validation with helpful error messages
3. **Dashboard**: After login, access the user dashboard (work in progress)
4. **Booking Interface**: Navigate to the booking page for ride management (work in progress)

### 🔧 API Endpoints Available
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/check-email/:email` - Check email availability
- `GET /api/bikes` - Get all bikes
- `GET /api/bikes/location/:location` - Get bikes by location
- `POST /api/rides` - Create new ride
- `GET /api/rides/user/:userId` - Get user's rides

### 👨‍💻 Development Team
Built with ❤️ for campus mobility solutions

---

### 📊 Project Status
- **Version**: 1.0.0 (MVP - Minimum Viable Product)
- **Status**: Active Development
- **Last Updated**: September 2025
- **Frontend**: Fully functional landing page and authentication
- **Backend**: Complete API with database integration
- **Deployment**: Live on AWS Amplify (Frontend) and Vercel (Backend)

### 🚧 In Development
- Complete dashboard functionality
- Ride booking and management system
- Real-time bike tracking
- Payment integration (future scope)
- Mobile app (future scope)
