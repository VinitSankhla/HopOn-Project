// HopOn API Service Layer
class APIService {
    constructor() {
        this.baseURL = 'http://localhost:3001/api';
        this.token = localStorage.getItem('hopOnToken');
    }

    // Set authentication token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('hopOnToken', token);
        } else {
            localStorage.removeItem('hopOnToken');
        }
    }

    // Get authentication headers
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Authentication API calls
    async register(userData) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async login(credentials) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        if (response.success && response.token) {
            this.setToken(response.token);
        }

        return response;
    }

    async getCurrentUser() {
        try {
            return await this.request('/auth/me');
        } catch (error) {
            this.setToken(null); // Clear invalid token
            throw error;
        }
    }

    async checkLoginIdAvailability(loginId) {
        return await this.request(`/auth/check-login-id/${encodeURIComponent(loginId)}`);
    }

    async checkEmailAvailability(email) {
        return await this.request(`/auth/check-email/${encodeURIComponent(email)}`);
    }

    logout() {
        this.setToken(null);
        return { success: true };
    }

    // Bike API calls
    async getAllBikes() {
        return await this.request('/bikes');
    }

    async getAvailableBikes(location) {
        return await this.request(`/bikes/location/${encodeURIComponent(location)}`);
    }

    async getBikeById(bikeId) {
        return await this.request(`/bikes/${encodeURIComponent(bikeId)}`);
    }

    async bookBike(bikeId, userId) {
        return await this.request(`/bikes/${encodeURIComponent(bikeId)}/book`, {
            method: 'POST',
            body: JSON.stringify({ userId })
        });
    }

    async returnBike(bikeId, newLocation, condition = null) {
        return await this.request(`/bikes/${encodeURIComponent(bikeId)}/return`, {
            method: 'POST',
            body: JSON.stringify({ newLocation, condition })
        });
    }

    async getBikeStats() {
        return await this.request('/bikes/stats');
    }

    // Ride API calls
    async createRide(rideData) {
        return await this.request('/rides', {
            method: 'POST',
            body: JSON.stringify(rideData)
        });
    }

    async getAllRides() {
        return await this.request('/rides');
    }

    async getUserRides(userId) {
        return await this.request(`/rides/user/${encodeURIComponent(userId)}`);
    }

    async getActiveRide(userId) {
        return await this.request(`/rides/user/${encodeURIComponent(userId)}/active`);
    }

    async completeRide(rideId, endLocation, rating = null, feedback = null) {
        return await this.request(`/rides/${encodeURIComponent(rideId)}/complete`, {
            method: 'PUT',
            body: JSON.stringify({ endLocation, rating, feedback })
        });
    }

    async cancelRide(rideId) {
        return await this.request(`/rides/${encodeURIComponent(rideId)}/cancel`, {
            method: 'PUT'
        });
    }

    async getRideStats() {
        return await this.request('/rides/stats');
    }

    // Health check
    async healthCheck() {
        return await this.request('/health');
    }
}

// Create global API instance
const api = new APIService();

// Export for use in other files
window.APIService = APIService;
window.api = api;

console.log('🔗 HopOn API Service initialized');