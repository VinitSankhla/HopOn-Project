// HopOn - Storage Management System (API Wrapper)
// This file provides backward compatibility while using the new API backend

class StorageManager {
    constructor() {
        this.api = window.api;
        console.log('📦 HopOn Storage System (API wrapper) initialized');
    }

    // User Management Methods (maintaining compatibility)
    async createUser(userData) {
        try {
            return await this.api.register(userData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async authenticateUser(loginId, password) {
        try {
            return await this.api.login({ loginId, password });
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getCurrentUser() {
        try {
            const response = await this.api.getCurrentUser();
            return response.success ? response.user : null;
        } catch (error) {
            return null;
        }
    }

    setCurrentUser(user) {
        // This is handled by the API service through JWT tokens
        console.log('User session managed by JWT tokens');
    }

    logout() {
        this.api.logout();
    }

    async isLoginIdAvailable(loginId) {
        try {
            const response = await this.api.checkLoginIdAvailability(loginId);
            return response.available;
        } catch (error) {
            return false;
        }
    }

    async isEmailAvailable(email) {
        try {
            const response = await this.api.checkEmailAvailability(email);
            return response.available;
        } catch (error) {
            return false;
        }
    }

    // Bike Management Methods
    async getBikes() {
        try {
            const response = await this.api.getAllBikes();
            return response.success ? response.bikes : {};
        } catch (error) {
            console.error('Error getting bikes:', error);
            return {};
        }
    }

    async getAvailableBikes(location) {
        try {
            const response = await this.api.getAvailableBikes(location);
            return response.success ? response.bikes : [];
        } catch (error) {
            console.error('Error getting available bikes:', error);
            return [];
        }
    }

    async getBikeById(bikeId) {
        try {
            const response = await this.api.getBikeById(bikeId);
            return response.success ? response.bike : null;
        } catch (error) {
            console.error('Error getting bike:', error);
            return null;
        }
    }

    async bookBike(bikeId, userId) {
        try {
            return await this.api.bookBike(bikeId, userId);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async returnBike(bikeId, newLocation, condition = null) {
        try {
            return await this.api.returnBike(bikeId, newLocation, condition);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Ride Management Methods
    async createRide(rideData) {
        try {
            return await this.api.createRide(rideData);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    async getRides() {
        try {
            const response = await this.api.getAllRides();
            return response.success ? response.rides : [];
        } catch (error) {
            console.error('Error getting rides:', error);
            return [];
        }
    }

    async getUserRides(userId) {
        try {
            const response = await this.api.getUserRides(userId);
            return response.success ? response.rides : [];
        } catch (error) {
            console.error('Error getting user rides:', error);
            return [];
        }
    }

    async getActiveRide(userId) {
        try {
            const response = await this.api.getActiveRide(userId);
            return response.success ? response.ride : null;
        } catch (error) {
            console.error('Error getting active ride:', error);
            return null;
        }
    }

    async completeRide(rideId, endLocation, rating = null, feedback = null) {
        try {
            return await this.api.completeRide(rideId, endLocation, rating, feedback);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Utility methods for backward compatibility
    generateUserId() {
        return 'USER_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateRideId() {
        return 'RIDE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    calculateDuration(startTime, endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        return Math.round((end - start) / (1000 * 60)); // in minutes
    }

    // Debug methods (for development)
    async clearAllData() {
        console.warn('⚠️ clearAllData() not implemented in API mode');
        return false;
    }

    async exportData() {
        try {
            const [users, bikes, rides] = await Promise.all([
                this.api.getAllUsers?.() || { success: false },
                this.api.getAllBikes(),
                this.api.getAllRides()
            ]);

            return {
                users: users.success ? users.users : {},
                bikes: bikes.success ? bikes.bikes : {},
                rides: rides.success ? rides.rides : [],
                currentUser: await this.getCurrentUser()
            };
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    }

    async getStats() {
        try {
            const [bikeStats, rideStats] = await Promise.all([
                this.api.getBikeStats(),
                this.api.getRideStats()
            ]);

            return {
                totalUsers: rideStats.success ? rideStats.stats.totalUsers || 0 : 0,
                totalBikes: bikeStats.success ? bikeStats.stats.totalBikes || 0 : 0,
                totalRides: rideStats.success ? rideStats.stats.totalRides || 0 : 0,
                activeRides: rideStats.success ? rideStats.stats.activeRides || 0 : 0
            };
        } catch (error) {
            console.error('Error getting stats:', error);
            return {
                totalUsers: 0,
                totalBikes: 0,
                totalRides: 0,
                activeRides: 0
            };
        }
    }
}

// Initialize storage manager
let storage;

// Wait for API to be available
if (typeof api !== 'undefined') {
    storage = new StorageManager();
} else {
    // Wait for API to load
    document.addEventListener('DOMContentLoaded', () => {
        if (typeof api !== 'undefined') {
            storage = new StorageManager();
        } else {
            console.error('API service not available. Storage manager cannot initialize.');
        }
    });
}

// Export for use in other files
window.StorageManager = StorageManager;
window.storage = storage;