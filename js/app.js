// HopOn - Main Application Logic (API Integrated)

class HopOnApp {
    constructor() {
        this.currentUser = null;
        this.currentRide = null;
        this.locations = ['AB1', 'AB2', 'BOYS HOSTEL', 'GIRLS HOSTEL'];
        this.rideTimer = null;
        this.rideStartTime = null;

        this.init();
    }

    // Initialize the application
    async init() {
        await this.checkAuthAndInit();
        this.setupGlobalEventListeners();
        await this.loadUserData();
        console.log('🚀 HopOn App initialized');
    }

    // Check authentication and initialize appropriate page
    async checkAuthAndInit() {
        try {
            this.currentUser = await storage.getCurrentUser();
        } catch (error) {
            this.currentUser = null;
        }

        // If on login page and user is authenticated, redirect to dashboard
        if (this.isLoginPage() && this.currentUser) {
            window.location.href = 'pages/dashboard.html';
            return;
        }

        // If on protected pages and not authenticated, redirect to login
        if (!this.isLoginPage() && !this.currentUser) {
            window.location.href = '../login.html';
            return;
        }

        // Initialize page-specific functionality
        await this.initializePage();
    }

    // Check if current page is login page
    isLoginPage() {
        return window.location.pathname.includes('login.html') ||
               window.location.pathname === '/' ||
               window.location.pathname.endsWith('/');
    }

    // Initialize page-specific functionality
    async initializePage() {
        const path = window.location.pathname;

        if (path.includes('dashboard.html')) {
            await this.initializeDashboard();
        } else if (path.includes('booking.html')) {
            await this.initializeBooking();
        } else if (path.includes('history.html')) {
            await this.initializeHistory();
        }
    }

    // Load user data and check for active rides
    async loadUserData() {
        if (this.currentUser) {
            try {
                // Check for any active rides
                this.currentRide = await storage.getActiveRide(this.currentUser.id);
                if (this.currentRide) {
                    console.log('🚴‍♂️ Active ride found:', this.currentRide);
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        }
    }

    // Setup global event listeners
    setupGlobalEventListeners() {
        // Handle browser back/forward navigation
        window.addEventListener('popstate', () => {
            this.handleNavigation();
        });

        // Handle page visibility change (for timer management)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });

        // Handle window beforeunload (warn about active rides)
        window.addEventListener('beforeunload', (e) => {
            if (this.currentRide && this.currentRide.status === 'active') {
                e.preventDefault();
                e.returnValue = 'You have an active ride. Are you sure you want to leave?';
                return e.returnValue;
            }
        });
    }

    // Dashboard initialization
    async initializeDashboard() {
        console.log('📊 Initializing Dashboard');
        await this.displayUserInfo();
        await this.displayRideHistory();
        await this.checkActiveRide();
        this.setupDashboardEvents();
    }

    // Display user information on dashboard
    async displayUserInfo() {
        const userNameEl = document.getElementById('userName');
        const totalRidesEl = document.getElementById('totalRides');
        const welcomeMessageEl = document.getElementById('welcomeMessage');

        if (this.currentUser) {
            if (userNameEl) userNameEl.textContent = this.currentUser.name;
            if (totalRidesEl) totalRidesEl.textContent = this.currentUser.totalRides || 0;
            if (welcomeMessageEl) {
                const hour = new Date().getHours();
                let greeting = 'Good morning';
                if (hour >= 12 && hour < 17) greeting = 'Good afternoon';
                else if (hour >= 17) greeting = 'Good evening';

                welcomeMessageEl.textContent = `${greeting}, ${this.currentUser.name.split(' ')[0]}!`;
            }
        }
    }

    // Display recent ride history on dashboard
    async displayRideHistory() {
        const historyContainer = document.getElementById('recentRides');
        if (!historyContainer) return;

        try {
            const rides = await storage.getUserRides(this.currentUser.id);
            const recentRides = rides.slice(0, 3); // Show last 3 rides

            if (recentRides.length === 0) {
                historyContainer.innerHTML = `
                    <div class="no-rides">
                        <i class="fas fa-bicycle"></i>
                        <p>No rides yet. Start your first HopOn adventure!</p>
                    </div>
                `;
                return;
            }

            const ridesHTML = recentRides.map(ride => `
                <div class="ride-item ${ride.status}">
                    <div class="ride-info">
                        <div class="ride-route">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${ride.startLocation}</span>
                            <i class="fas fa-arrow-right"></i>
                            <span>${ride.endLocation || 'In Progress'}</span>
                        </div>
                        <div class="ride-meta">
                            <span class="ride-date">${this.formatDate(ride.startTime)}</span>
                            <span class="ride-duration">${this.formatDuration(ride.actualDuration)}</span>
                            <span class="ride-status badge ${ride.status}">${ride.status}</span>
                        </div>
                    </div>
                    <div class="bike-info">
                        <span class="bike-id">${ride.bikeId}</span>
                    </div>
                </div>
            `).join('');

            historyContainer.innerHTML = ridesHTML;
        } catch (error) {
            console.error('Error displaying ride history:', error);
            historyContainer.innerHTML = `
                <div class="no-rides">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Unable to load ride history</p>
                </div>
            `;
        }
    }

    // Check for active ride and display timer
    async checkActiveRide() {
        if (this.currentRide) {
            this.showActiveRideUI();
            this.startRideTimer();
        } else {
            this.hideActiveRideUI();
        }
    }

    // Show active ride UI elements
    showActiveRideUI() {
        const activeRideSection = document.getElementById('activeRide');
        const startRideBtn = document.getElementById('startRideBtn');

        if (activeRideSection) {
            activeRideSection.style.display = 'block';
            this.updateActiveRideDisplay();
        }

        if (startRideBtn) {
            startRideBtn.style.display = 'none';
        }
    }

    // Hide active ride UI elements
    hideActiveRideUI() {
        const activeRideSection = document.getElementById('activeRide');
        const startRideBtn = document.getElementById('startRideBtn');

        if (activeRideSection) {
            activeRideSection.style.display = 'none';
        }

        if (startRideBtn) {
            startRideBtn.style.display = 'block';
        }
    }

    // Update active ride display
    updateActiveRideDisplay() {
        if (!this.currentRide) return;

        const bikeIdEl = document.getElementById('activeBikeId');
        const routeEl = document.getElementById('activeRoute');
        const timerEl = document.getElementById('rideTimer');

        if (bikeIdEl) bikeIdEl.textContent = this.currentRide.bikeId;
        if (routeEl) {
            routeEl.innerHTML = `
                <i class="fas fa-map-marker-alt"></i>
                ${this.currentRide.startLocation}
                <i class="fas fa-arrow-right"></i>
                ${this.currentRide.endLocation}
            `;
        }
    }

    // Start ride timer
    startRideTimer() {
        if (this.rideTimer) clearInterval(this.rideTimer);

        const startTime = new Date(this.currentRide.startTime);
        const timerDuration = this.currentRide.timerDuration * 60 * 1000; // Convert to milliseconds

        this.rideTimer = setInterval(() => {
            const now = new Date();
            const elapsed = now - startTime;
            const remaining = Math.max(0, timerDuration - elapsed);

            this.updateTimerDisplay(remaining);

            // Auto-end ride when timer expires
            if (remaining <= 0) {
                this.autoEndRide();
            }
        }, 1000);
    }

    // Update timer display
    updateTimerDisplay(remainingMs) {
        const timerEl = document.getElementById('rideTimer');
        if (!timerEl) return;

        const minutes = Math.floor(remainingMs / (1000 * 60));
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        timerEl.textContent = timeString;

        // Change color when time is running low
        if (remainingMs < 2 * 60 * 1000) { // Less than 2 minutes
            timerEl.classList.add('warning');
        } else if (remainingMs < 5 * 60 * 1000) { // Less than 5 minutes
            timerEl.classList.add('caution');
        }
    }

    // Auto-end ride when timer expires
    async autoEndRide() {
        if (this.rideTimer) {
            clearInterval(this.rideTimer);
            this.rideTimer = null;
        }

        try {
            // End the ride automatically
            await this.completeRide(this.currentRide.endLocation, null, 'Timer expired');
            this.showMessage('Your ride has ended automatically due to timer expiry!', 'warning');
        } catch (error) {
            console.error('Error auto-ending ride:', error);
            this.showMessage('Error ending ride automatically. Please end manually.', 'error');
        }
    }

    // Setup dashboard event listeners
    setupDashboardEvents() {
        // Start ride button
        const startRideBtn = document.getElementById('startRideBtn');
        if (startRideBtn) {
            startRideBtn.addEventListener('click', () => {
                window.location.href = 'booking.html';
            });
        }

        // End ride button
        const endRideBtn = document.getElementById('endRideBtn');
        if (endRideBtn) {
            endRideBtn.addEventListener('click', () => {
                this.showEndRideModal();
            });
        }

        // View all history button
        const viewHistoryBtn = document.getElementById('viewHistoryBtn');
        if (viewHistoryBtn) {
            viewHistoryBtn.addEventListener('click', () => {
                window.location.href = 'history.html';
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }

    // Show end ride modal
    showEndRideModal() {
        // Create modal dynamically if it doesn't exist
        let modal = document.getElementById('endRideModal');
        if (!modal) {
            modal = this.createEndRideModal();
            document.body.appendChild(modal);
        }

        // Populate destination options
        this.populateDestinationOptions();

        // Show modal
        modal.classList.add('active');
    }

    // Create end ride modal
    createEndRideModal() {
        const modal = document.createElement('div');
        modal.id = 'endRideModal';
        modal.className = 'modal-overlay';

        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-title">End Your Ride</h3>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').classList.remove('active')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Where are you parking the bike?</label>
                        <select id="endLocation" required>
                            <option value="">Select destination</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Rate your ride (optional)</label>
                        <div class="rating-input">
                            ${[1,2,3,4,5].map(star => `
                                <i class="fas fa-star rating-star" data-rating="${star}"></i>
                            `).join('')}
                        </div>
                        <input type="hidden" id="rideRating" value="">
                    </div>
                    <div class="form-group">
                        <label>Any feedback? (optional)</label>
                        <textarea id="rideFeedback" placeholder="How was your ride?"></textarea>
                    </div>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').classList.remove('active')">
                            Cancel
                        </button>
                        <button class="btn btn-primary" onclick="app.submitEndRide()">
                            <i class="fas fa-check"></i>
                            End Ride
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add rating functionality
        modal.addEventListener('click', (e) => {
            if (e.target.classList.contains('rating-star')) {
                const rating = e.target.dataset.rating;
                const stars = modal.querySelectorAll('.rating-star');

                stars.forEach((star, index) => {
                    if (index < rating) {
                        star.classList.add('active');
                    } else {
                        star.classList.remove('active');
                    }
                });

                document.getElementById('rideRating').value = rating;
            }
        });

        return modal;
    }

    // Populate destination options in end ride modal
    populateDestinationOptions() {
        const endLocationSelect = document.getElementById('endLocation');
        if (!endLocationSelect || !this.currentRide) return;

        // Clear existing options except first
        endLocationSelect.innerHTML = '<option value="">Select destination</option>';

        // Add all locations except current start location
        this.locations.forEach(location => {
            if (location !== this.currentRide.startLocation) {
                const option = document.createElement('option');
                option.value = location;
                option.textContent = location;
                endLocationSelect.appendChild(option);
            }
        });
    }

    // Submit end ride
    async submitEndRide() {
        const endLocation = document.getElementById('endLocation').value;
        const rating = document.getElementById('rideRating').value;
        const feedback = document.getElementById('rideFeedback').value.trim();

        if (!endLocation) {
            this.showMessage('Please select where you parked the bike', 'error');
            return;
        }

        // Show loading
        this.showLoading(true);

        try {
            // Close modal
            document.getElementById('endRideModal').classList.remove('active');

            // Complete the ride
            await this.completeRide(endLocation, rating || null, feedback || null);
        } catch (error) {
            console.error('Error submitting end ride:', error);
            this.showMessage('Failed to end ride. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Complete ride
    async completeRide(endLocation, rating, feedback) {
        if (!this.currentRide) return;

        try {
            const result = await storage.completeRide(this.currentRide.id, endLocation, rating, feedback);

            if (result.success) {
                this.showMessage('Ride completed successfully!', 'success');

                // Clear current ride
                this.currentRide = null;
                if (this.rideTimer) {
                    clearInterval(this.rideTimer);
                    this.rideTimer = null;
                }

                // Refresh dashboard
                await this.checkActiveRide();
                await this.displayRideHistory();
                await this.displayUserInfo();
            } else {
                this.showMessage('Failed to complete ride. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error completing ride:', error);
            this.showMessage('Failed to complete ride. Please try again.', 'error');
        }
    }

    // Handle logout
    async handleLogout() {
        if (this.currentRide) {
            if (confirm('You have an active ride. Are you sure you want to logout?')) {
                // Auto-end the current ride
                await this.autoEndRide();
            } else {
                return;
            }
        }

        storage.logout();
        this.showMessage('Logged out successfully', 'info');
        setTimeout(() => {
            window.location.href = '../login.html';
        }, 1000);
    }

    // Handle navigation
    async handleNavigation() {
        await this.checkAuthAndInit();
    }

    // Handle visibility change
    handleVisibilityChange() {
        if (document.hidden && this.rideTimer) {
            // Page is hidden, save the current state
            localStorage.setItem('hopOnRideTimerState', JSON.stringify({
                rideId: this.currentRide.id,
                hidden: true,
                hiddenAt: new Date().toISOString()
            }));
        } else if (!document.hidden && this.currentRide) {
            // Page is visible again, restore timer if needed
            const timerState = localStorage.getItem('hopOnRideTimerState');
            if (timerState) {
                localStorage.removeItem('hopOnRideTimerState');
                // Restart timer (it will calculate correct remaining time)
                this.startRideTimer();
            }
        }
    }

    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString();
    }

    formatDuration(minutes) {
        if (!minutes) return 'N/A';
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    }

    showMessage(message, type = 'info') {
        // Reuse the message system from auth.js if available
        if (window.auth && typeof window.auth.showMessage === 'function') {
            window.auth.showMessage(message, type);
        } else {
            // Fallback alert
            alert(message);
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            if (show) {
                loading.classList.add('active');
            } else {
                loading.classList.remove('active');
            }
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Only initialize if storage/api are loaded
    if (typeof storage !== 'undefined' && typeof api !== 'undefined') {
        window.app = new HopOnApp();
    } else {
        console.warn('Storage or API system not loaded. App initialization delayed.');
        // Retry after a short delay
        setTimeout(() => {
            if (typeof storage !== 'undefined' && typeof api !== 'undefined') {
                window.app = new HopOnApp();
            } else {
                console.error('Unable to initialize app: Storage or API not available');
            }
        }, 1000);
    }
});