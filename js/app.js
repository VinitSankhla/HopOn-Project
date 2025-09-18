// HopOn - Main Application Logic

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
    init() {
        this.checkAuthAndInit();
        this.setupGlobalEventListeners();
        this.loadUserData();
        console.log('🚀 HopOn App initialized');
    }

    // Check authentication and initialize appropriate page
    checkAuthAndInit() {
        this.currentUser = storage.getCurrentUser();
        
        // If on login page and user is authenticated, redirect to dashboard
        if (this.isLoginPage() && this.currentUser) {
            window.location.href = 'pages/dashboard.html';
            return;
        }
        
        // If on protected pages and not authenticated, redirect to login
        if (!this.isLoginPage() && !this.currentUser) {
            window.location.href = '../index.html';
            return;
        }

        // Initialize page-specific functionality
        this.initializePage();
    }

    // Check if current page is login page
    isLoginPage() {
        return window.location.pathname.includes('index.html') || 
               window.location.pathname === '/' || 
               window.location.pathname.endsWith('/');
    }

    // Initialize page-specific functionality
    initializePage() {
        const path = window.location.pathname;
        
        if (path.includes('dashboard.html')) {
            this.initializeDashboard();
        } else if (path.includes('booking.html')) {
            this.initializeBooking();
        } else if (path.includes('history.html')) {
            this.initializeHistory();
        }
    }

    // Load user data and check for active rides
    loadUserData() {
        if (this.currentUser) {
            // Check for any active rides
            this.currentRide = storage.getActiveRide(this.currentUser.id);
            if (this.currentRide) {
                console.log('🚴‍♂️ Active ride found:', this.currentRide);
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
    initializeDashboard() {
        console.log('📊 Initializing Dashboard');
        this.displayUserInfo();
        this.displayRideHistory();
        this.checkActiveRide();
        this.setupDashboardEvents();
    }

    // Display user information on dashboard
    displayUserInfo() {
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
    displayRideHistory() {
        const historyContainer = document.getElementById('recentRides');
        if (!historyContainer) return;

        const rides = storage.getUserRides(this.currentUser.id);
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
    }

    // Check for active ride and display timer
    checkActiveRide() {
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
    autoEndRide() {
        if (this.rideTimer) {
            clearInterval(this.rideTimer);
            this.rideTimer = null;
        }

        // End the ride automatically
        this.completeRide(this.currentRide.endLocation, null, 'Timer expired');
        
        this.showMessage('Your ride has ended automatically due to timer expiry!', 'warning');
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
    submitEndRide() {
        const endLocation = document.getElementById('endLocation').value;
        const rating = document.getElementById('rideRating').value;
        const feedback = document.getElementById('rideFeedback').value.trim();

        if (!endLocation) {
            this.showMessage('Please select where you parked the bike', 'error');
            return;
        }

        // Close modal
        document.getElementById('endRideModal').classList.remove('active');
        
        // Complete the ride
        this.completeRide(endLocation, rating || null, feedback || null);
    }

    // Complete ride
    completeRide(endLocation, rating, feedback) {
        if (!this.currentRide) return;

        const result = storage.completeRide(this.currentRide.id, endLocation, rating, feedback);
        
        if (result.success) {
            this.showMessage('Ride completed successfully!', 'success');
            
            // Clear current ride
            this.currentRide = null;
            if (this.rideTimer) {
                clearInterval(this.rideTimer);
                this.rideTimer = null;
            }
            
            // Refresh dashboard
            this.checkActiveRide();
            this.displayRideHistory();
            this.displayUserInfo();
        } else {
            this.showMessage('Failed to complete ride. Please try again.', 'error');
        }
    }

    // Handle logout
    handleLogout() {
        if (this.currentRide) {
            if (confirm('You have an active ride. Are you sure you want to logout?')) {
                // Auto-end the current ride
                this.autoEndRide();
            } else {
                return;
            }
        }

        storage.logout();
        this.showMessage('Logged out successfully', 'info');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    }

    // Handle navigation
    handleNavigation() {
        this.checkAuthAndInit();
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
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if not on login page or if storage/auth are loaded
    if (typeof storage !== 'undefined') {
        window.app = new HopOnApp();
    } else {
        console.warn('Storage system not loaded. App initialization delayed.');
    }
});