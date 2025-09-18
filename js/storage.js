// HopOn - Storage Management System

class StorageManager {
    constructor() {
        this.init();
    }

    // Initialize default data if not exists
    init() {
        // Initialize users if not exists
        if (!localStorage.getItem('hopOnUsers')) {
            localStorage.setItem('hopOnUsers', JSON.stringify({}));
        }

        // Initialize bikes if not exists
        if (!localStorage.getItem('hopOnBikes')) {
            this.initializeBikes();
        }

        // Initialize rides if not exists
        if (!localStorage.getItem('hopOnRides')) {
            localStorage.setItem('hopOnRides', JSON.stringify([]));
        }

        // Initialize current user session
        if (!localStorage.getItem('hopOnCurrentUser')) {
            localStorage.setItem('hopOnCurrentUser', null);
        }
    }

    // Initialize 25 bikes at AB1
    initializeBikes() {
        const locations = ['AB1', 'AB2', 'BOYS HOSTEL', 'GIRLS HOSTEL'];
        const bikes = {};

        // Add 25 bikes at AB1 (as requested)
        for (let i = 1; i <= 25; i++) {
            bikes[`BIKE${i.toString().padStart(3, '0')}`] = {
                id: `BIKE${i.toString().padStart(3, '0')}`,
                number: i,
                location: 'AB1',
                isAvailable: true,
                condition: this.getRandomCondition(),
                lastMaintenance: this.getRandomDate(),
                batteryLevel: 100,
                totalRides: Math.floor(Math.random() * 50),
                rating: (Math.random() * 2 + 3).toFixed(1) // 3.0 to 5.0
            };
        }

        localStorage.setItem('hopOnBikes', JSON.stringify(bikes));
        console.log('✅ Initialized 25 bikes at AB1');
    }

    // Helper method to generate random bike condition
    getRandomCondition() {
        const conditions = ['Excellent', 'Good', 'Fair'];
        const weights = [0.4, 0.5, 0.1]; // 40% excellent, 50% good, 10% fair
        
        const random = Math.random();
        if (random < weights[0]) return conditions[0];
        if (random < weights[0] + weights[1]) return conditions[1];
        return conditions[2];
    }

    // Helper method to generate random maintenance date
    getRandomDate() {
        const now = new Date();
        const daysAgo = Math.floor(Math.random() * 30); // 0-30 days ago
        const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
        return date.toISOString();
    }

    // User Management
    createUser(userData) {
        const users = this.getUsers();
        const userId = this.generateUserId();
        
        const newUser = {
            id: userId,
            loginId: userData.loginId,
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: userData.password, // In production, this should be hashed
            createdAt: new Date().toISOString(),
            totalRides: 0,
            profile: {
                avatar: null,
                preferences: {
                    notifications: true,
                    theme: 'auto'
                }
            }
        };

        users[userId] = newUser;
        localStorage.setItem('hopOnUsers', JSON.stringify(users));
        return { success: true, user: newUser };
    }

    // Generate unique user ID
    generateUserId() {
        return 'USER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get all users
    getUsers() {
        return JSON.parse(localStorage.getItem('hopOnUsers') || '{}');
    }

    // Get user by login ID
    getUserByLoginId(loginId) {
        const users = this.getUsers();
        return Object.values(users).find(user => user.loginId === loginId);
    }

    // Authenticate user
    authenticateUser(loginId, password) {
        const user = this.getUserByLoginId(loginId);
        if (user && user.password === password) {
            this.setCurrentUser(user);
            return { success: true, user: user };
        }
        return { success: false, message: 'Invalid login credentials' };
    }

    // Set current logged-in user
    setCurrentUser(user) {
        localStorage.setItem('hopOnCurrentUser', JSON.stringify(user));
    }

    // Get current logged-in user
    getCurrentUser() {
        const userData = localStorage.getItem('hopOnCurrentUser');
        return userData ? JSON.parse(userData) : null;
    }

    // Logout current user
    logout() {
        localStorage.setItem('hopOnCurrentUser', null);
    }

    // Bike Management
    getBikes() {
        return JSON.parse(localStorage.getItem('hopOnBikes') || '{}');
    }

    // Get available bikes at a location
    getAvailableBikes(location) {
        const bikes = this.getBikes();
        return Object.values(bikes).filter(bike => 
            bike.location === location && bike.isAvailable
        );
    }

    // Get bike by ID
    getBikeById(bikeId) {
        const bikes = this.getBikes();
        return bikes[bikeId];
    }

    // Book a bike
    bookBike(bikeId, userId) {
        const bikes = this.getBikes();
        if (bikes[bikeId] && bikes[bikeId].isAvailable) {
            bikes[bikeId].isAvailable = false;
            bikes[bikeId].currentUser = userId;
            bikes[bikeId].bookedAt = new Date().toISOString();
            
            localStorage.setItem('hopOnBikes', JSON.stringify(bikes));
            return { success: true, bike: bikes[bikeId] };
        }
        return { success: false, message: 'Bike not available' };
    }

    // Return a bike
    returnBike(bikeId, newLocation, condition = null) {
        const bikes = this.getBikes();
        if (bikes[bikeId]) {
            bikes[bikeId].isAvailable = true;
            bikes[bikeId].location = newLocation;
            bikes[bikeId].currentUser = null;
            bikes[bikeId].bookedAt = null;
            bikes[bikeId].returnedAt = new Date().toISOString();
            bikes[bikeId].totalRides += 1;
            
            if (condition) {
                bikes[bikeId].condition = condition;
            }

            localStorage.setItem('hopOnBikes', JSON.stringify(bikes));
            return { success: true, bike: bikes[bikeId] };
        }
        return { success: false, message: 'Bike not found' };
    }

    // Ride Management
    createRide(rideData) {
        const rides = this.getRides();
        const rideId = this.generateRideId();
        
        const newRide = {
            id: rideId,
            userId: rideData.userId,
            bikeId: rideData.bikeId,
            startLocation: rideData.startLocation,
            endLocation: rideData.endLocation,
            duration: rideData.duration, // in minutes
            startTime: new Date().toISOString(),
            endTime: null,
            status: 'active', // active, completed, cancelled
            timerDuration: rideData.timerDuration || 15, // default 15 minutes
            actualDuration: null,
            rating: null,
            feedback: null,
            cost: 0 // Free for now
        };

        rides.push(newRide);
        localStorage.setItem('hopOnRides', JSON.stringify(rides));
        return { success: true, ride: newRide };
    }

    // Generate unique ride ID
    generateRideId() {
        return 'RIDE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    // Get all rides
    getRides() {
        return JSON.parse(localStorage.getItem('hopOnRides') || '[]');
    }

    // Get rides by user ID
    getUserRides(userId) {
        const rides = this.getRides();
        return rides.filter(ride => ride.userId === userId)
                   .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
    }

    // Get active ride for user
    getActiveRide(userId) {
        const rides = this.getRides();
        return rides.find(ride => ride.userId === userId && ride.status === 'active');
    }

    // Complete a ride
    completeRide(rideId, endLocation, rating = null, feedback = null) {
        const rides = this.getRides();
        const rideIndex = rides.findIndex(ride => ride.id === rideId);
        
        if (rideIndex !== -1) {
            const ride = rides[rideIndex];
            ride.endTime = new Date().toISOString();
            ride.status = 'completed';
            ride.endLocation = endLocation;
            ride.actualDuration = this.calculateDuration(ride.startTime, ride.endTime);
            ride.rating = rating;
            ride.feedback = feedback;

            localStorage.setItem('hopOnRides', JSON.stringify(rides));
            
            // Return the bike
            this.returnBike(ride.bikeId, endLocation);
            
            // Update user stats
            this.updateUserStats(ride.userId, 1);
            
            return { success: true, ride: ride };
        }
        return { success: false, message: 'Ride not found' };
    }

    // Calculate duration between two timestamps
    calculateDuration(startTime, endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        return Math.round((end - start) / (1000 * 60)); // in minutes
    }

    // Update user statistics
    updateUserStats(userId, ridesCompleted) {
        const users = this.getUsers();
        const user = Object.values(users).find(u => u.id === userId);
        
        if (user) {
            user.totalRides += ridesCompleted;
            
            users[user.id] = user;
            localStorage.setItem('hopOnUsers', JSON.stringify(users));
            
            // Update current user session if it's the same user
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                this.setCurrentUser(user);
            }
        }
    }

    // Validation methods
    isLoginIdAvailable(loginId) {
        return !this.getUserByLoginId(loginId);
    }

    isEmailAvailable(email) {
        const users = this.getUsers();
        return !Object.values(users).some(user => user.email === email);
    }

    // Debug methods
    clearAllData() {
        localStorage.removeItem('hopOnUsers');
        localStorage.removeItem('hopOnBikes');
        localStorage.removeItem('hopOnRides');
        localStorage.removeItem('hopOnCurrentUser');
        this.init();
        console.log('🗑️ All HopOn data cleared and reinitialized');
    }

    exportData() {
        return {
            users: this.getUsers(),
            bikes: this.getBikes(),
            rides: this.getRides(),
            currentUser: this.getCurrentUser()
        };
    }

    getStats() {
        const users = Object.keys(this.getUsers()).length;
        const bikes = Object.keys(this.getBikes()).length;
        const rides = this.getRides().length;
        const activeRides = this.getRides().filter(r => r.status === 'active').length;
        
        return {
            totalUsers: users,
            totalBikes: bikes,
            totalRides: rides,
            activeRides: activeRides
        };
    }
}

// Initialize storage manager
const storage = new StorageManager();

// Export for use in other files
window.StorageManager = StorageManager;
window.storage = storage;

console.log('📦 HopOn Storage System initialized');