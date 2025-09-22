// HopOn - Authentication System with API Integration

class AuthManager {
    constructor() {
        this.loadingStates = {
            login: false,
            register: false,
            validation: false
        };

        this.init();
    }

    // Initialize authentication system
    async init() {
        await this.checkAuthStatus();
        this.setupEventListeners();
        console.log('🔐 HopOn Authentication System initialized');
    }

    // Initialize all event listeners for auth forms
    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form submission
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }

        // Real-time validation
        this.setupRealTimeValidation();
    }

    // Check if user is already logged in
    async checkAuthStatus() {
        try {
            const response = await api.getCurrentUser();
            if (response.success && window.location.pathname.includes('login.html')) {
                // User is logged in but on login page, redirect to dashboard
                this.redirectToDashboard();
            }
        } catch (error) {
            // User not authenticated or token invalid, stay on login page
            console.log('User not authenticated');
        }
    }

    // Handle login form submission
    async handleLogin(event) {
        event.preventDefault();

        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        // Show loading state
        this.showLoading(true);
        this.clearMessages();

        // Validate inputs
        if (!this.validateLoginForm(email, password)) {
            this.showLoading(false);
            return;
        }

        try {
            // Authenticate user via API using email
            const result = await api.login({ email, password });

            if (result.success) {
                this.showMessage('Login successful! Redirecting...', 'success');

                // Redirect after short delay
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1000);
            } else {
                this.showMessage(result.message || 'Invalid login credentials', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Something went wrong. Please try again.', 'error');
        }

        this.showLoading(false);
    }

    // Handle register form submission
    async handleRegister(event) {
        event.preventDefault();

        const formData = {
            name: document.getElementById('registerName').value.trim(),
            email: document.getElementById('registerEmail').value.trim(),
            phone: document.getElementById('registerPhone').value.trim(),
            gender: document.getElementById('registerGender').value,
            password: document.getElementById('registerPassword').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };

        // Show loading state
        this.showLoading(true);
        this.clearMessages();

        // Validate inputs
        const isValid = await this.validateRegisterForm(formData);
        if (!isValid) {
            this.showLoading(false);
            return;
        }

        try {
            // Create user account via API
            const result = await api.register({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                gender: formData.gender,
                password: formData.password
            });

            if (result.success) {
                this.showMessage('Account created successfully! Please login to continue.', 'success');

                // Show login form after short delay
                setTimeout(() => {
                    showLogin();
                    // Pre-fill email
                    document.getElementById('loginEmail').value = formData.email;
                }, 1500);
            } else {
                this.showMessage(result.message || 'Failed to create account', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage(error.message || 'Something went wrong. Please try again.', 'error');
        }

        this.showLoading(false);
    }

    // Validate login form
    validateLoginForm(email, password) {
        let isValid = true;

        // Clear previous errors
        this.clearFieldErrors();

        // Validate email
        if (!email) {
            this.showFieldError('loginEmail', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showFieldError('loginEmail', 'Please enter a valid email address');
            isValid = false;
        }

        // Validate password
        if (!password) {
            this.showFieldError('loginPassword', 'Password is required');
            isValid = false;
        } else if (password.length < 6) {
            this.showFieldError('loginPassword', 'Password must be at least 6 characters');
            isValid = false;
        }

        return isValid;
    }

    // Validate registration form
    async validateRegisterForm(data) {
        let isValid = true;
        this.clearFieldErrors();

        // Validate name
        if (!data.name) {
            this.showFieldError('registerName', 'Full name is required');
            isValid = false;
        } else if (data.name.length < 2) {
            this.showFieldError('registerName', 'Name must be at least 2 characters');
            isValid = false;
        }

        // Validate gender
        if (!data.gender) {
            this.showFieldError('registerGender', 'Please select your gender');
            isValid = false;
        }

        // Validate email
        if (!data.email) {
            this.showFieldError('registerEmail', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(data.email)) {
            this.showFieldError('registerEmail', 'Please enter a valid email address');
            isValid = false;
        } else {
            // Check availability via API
            try {
                const response = await api.checkEmailAvailability(data.email);
                if (!response.available) {
                    this.showFieldError('registerEmail', 'This email is already registered');
                    isValid = false;
                }
            } catch (error) {
                console.error('Email check error:', error);
            }
        }

        // Validate phone
        if (!data.phone) {
            this.showFieldError('registerPhone', 'Phone number is required');
            isValid = false;
        } else if (!/^[6-9]\d{9}$/.test(data.phone)) {
            this.showFieldError('registerPhone', 'Please enter a valid 10-digit phone number');
            isValid = false;
        }

        // Validate password
        if (!data.password) {
            this.showFieldError('registerPassword', 'Password is required');
            isValid = false;
        } else if (data.password.length < 6) {
            this.showFieldError('registerPassword', 'Password must be at least 6 characters');
            isValid = false;
        }

        // Validate confirm password
        if (!data.confirmPassword) {
            this.showFieldError('confirmPassword', 'Please confirm your password');
            isValid = false;
        } else if (data.password !== data.confirmPassword) {
            this.showFieldError('confirmPassword', 'Passwords do not match');
            isValid = false;
        }

        return isValid;
    }

    // Setup real-time validation for better UX
    setupRealTimeValidation() {
        // Email availability check
        const registerEmail = document.getElementById('registerEmail');
        if (registerEmail) {
            let debounceTimer;
            registerEmail.addEventListener('blur', async () => {
                const value = registerEmail.value.trim();
                if (this.isValidEmail(value)) {
                    try {
                        const response = await api.checkEmailAvailability(value);
                        if (response.available) {
                            this.showFieldSuccess('registerEmail');
                        } else {
                            this.showFieldError('registerEmail', 'This email is already registered');
                        }
                    } catch (error) {
                        console.error('Email check error:', error);
                    }
                }
            });
        }

        // Password strength indicator
        const registerPassword = document.getElementById('registerPassword');
        if (registerPassword) {
            registerPassword.addEventListener('input', () => {
                const strength = this.getPasswordStrength(registerPassword.value);
                this.showPasswordStrength('registerPassword', strength);
            });
        }

        // Confirm password match check
        const confirmPassword = document.getElementById('confirmPassword');
        if (confirmPassword && registerPassword) {
            confirmPassword.addEventListener('input', () => {
                if (confirmPassword.value && registerPassword.value) {
                    if (confirmPassword.value === registerPassword.value) {
                        this.showFieldSuccess('confirmPassword');
                    } else {
                        this.showFieldError('confirmPassword', 'Passwords do not match');
                    }
                }
            });
        }
    }

    // Utility Functions
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    getPasswordStrength(password) {
        if (password.length < 6) return { level: 'weak', text: 'Too short' };
        if (password.length < 8) return { level: 'medium', text: 'Good' };
        if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(password)) {
            return { level: 'strong', text: 'Strong' };
        }
        return { level: 'medium', text: 'Good' };
    }

    // UI Helper Functions
    showMessage(message, type = 'info') {
        const container = document.getElementById('message-container');
        if (!container) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;

        const icon = this.getMessageIcon(type);
        messageElement.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;

        container.appendChild(messageElement);

        // Remove message after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.style.animation = 'slideOutRight 0.3s ease-out';
                setTimeout(() => {
                    container.removeChild(messageElement);
                }, 300);
            }
        }, 5000);
    }

    getMessageIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const inputGroup = field.closest('.input-group');
        if (inputGroup) {
            inputGroup.classList.add('error');
            inputGroup.classList.remove('success');

            // Remove existing error message
            const existingError = inputGroup.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }

            // Add new error message
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
            inputGroup.appendChild(errorElement);
        }
    }

    showFieldSuccess(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const inputGroup = field.closest('.input-group');
        if (inputGroup) {
            inputGroup.classList.add('success');
            inputGroup.classList.remove('error');

            // Remove error message
            const existingError = inputGroup.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
        }
    }

    showPasswordStrength(fieldId, strength) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        const inputGroup = field.closest('.input-group');
        let strengthIndicator = inputGroup.querySelector('.password-strength');

        if (!strengthIndicator) {
            strengthIndicator = document.createElement('div');
            strengthIndicator.className = 'password-strength';
            inputGroup.appendChild(strengthIndicator);
        }

        strengthIndicator.className = `password-strength ${strength.level}`;
        strengthIndicator.textContent = strength.text;
    }

    clearFieldErrors() {
        document.querySelectorAll('.input-group.error').forEach(group => {
            group.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(error => {
            error.remove();
        });
    }

    clearMessages() {
        const container = document.getElementById('message-container');
        if (container) {
            container.innerHTML = '';
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

    redirectToDashboard() {
        window.location.href = 'pages/dashboard.html';
    }

    // Logout function
    logout() {
        api.logout();
        this.showMessage('Logged out successfully', 'info');
        setTimeout(() => {
            window.location.href = '../login.html';
        }, 1000);
    }
}

// Form toggle functions (called from HTML)
function showRegister() {
    document.getElementById('loginForm').classList.remove('active');
    document.getElementById('registerForm').classList.add('active');

    // Clear any existing errors
    if (window.auth) {
        window.auth.clearFieldErrors();
        window.auth.clearMessages();
    }
}

function showLogin() {
    document.getElementById('registerForm').classList.remove('active');
    document.getElementById('loginForm').classList.add('active');

    // Clear any existing errors
    if (window.auth) {
        window.auth.clearFieldErrors();
        window.auth.clearMessages();
    }
}

// Password visibility toggle
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const icon = field.parentNode.querySelector('.toggle-password');

    if (field.type === 'password') {
        field.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        field.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Ensure API service is loaded before initializing auth
    if (typeof api !== 'undefined') {
        window.auth = new AuthManager();
    } else {
        console.error('API service not loaded. Please include api.js before auth.js');
    }
});