// HopOn - Authentication System

class AuthManager {
    constructor() {
        this.initializeEventListeners();
        this.checkAuthStatus();
    }

    // Initialize all event listeners for auth forms
    initializeEventListeners() {
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
    checkAuthStatus() {
        const currentUser = storage.getCurrentUser();
        if (currentUser && window.location.pathname.includes('index.html')) {
            // User is logged in but on login page, redirect to dashboard
            this.redirectToDashboard();
        }
    }

    // Handle login form submission
    async handleLogin(event) {
        event.preventDefault();
        
        const loginId = document.getElementById('loginId').value.trim();
        const password = document.getElementById('loginPassword').value;

        // Show loading state
        this.showLoading(true);
        this.clearMessages();

        // Validate inputs
        if (!this.validateLoginForm(loginId, password)) {
            this.showLoading(false);
            return;
        }

        // Simulate API delay for better UX
        await this.delay(800);

        try {
            // Authenticate user
            const result = storage.authenticateUser(loginId, password);
            
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
            loginId: document.getElementById('registerLoginId').value.trim(),
            email: document.getElementById('registerEmail').value.trim(),
            phone: document.getElementById('registerPhone').value.trim(),
            password: document.getElementById('registerPassword').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };

        // Show loading state
        this.showLoading(true);
        this.clearMessages();

        // Validate inputs
        if (!this.validateRegisterForm(formData)) {
            this.showLoading(false);
            return;
        }

        // Simulate API delay
        await this.delay(1000);

        try {
            // Create user account
            const result = storage.createUser({
                name: formData.name,
                loginId: formData.loginId,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });

            if (result.success) {
                this.showMessage('Account created successfully! Redirecting...', 'success');
                
                // Auto-login the user
                storage.setCurrentUser(result.user);
                
                // Redirect after short delay
                setTimeout(() => {
                    this.redirectToDashboard();
                }, 1500);
            } else {
                this.showMessage(result.message || 'Failed to create account', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage('Something went wrong. Please try again.', 'error');
        }

        this.showLoading(false);
    }

    // Validate login form
    validateLoginForm(loginId, password) {
        let isValid = true;

        // Clear previous errors
        this.clearFieldErrors();

        // Validate login ID
        if (!loginId) {
            this.showFieldError('loginId', 'Login ID is required');
            isValid = false;
        } else if (loginId.length < 3) {
            this.showFieldError('loginId', 'Login ID must be at least 3 characters');
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
    validateRegisterForm(data) {
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

        // Validate login ID
        if (!data.loginId) {
            this.showFieldError('registerLoginId', 'Login ID is required');
            isValid = false;
        } else if (data.loginId.length < 3) {
            this.showFieldError('registerLoginId', 'Login ID must be at least 3 characters');
            isValid = false;
        } else if (!/^[a-zA-Z0-9_]+$/.test(data.loginId)) {
            this.showFieldError('registerLoginId', 'Login ID can only contain letters, numbers and underscore');
            isValid = false;
        } else if (!storage.isLoginIdAvailable(data.loginId)) {
            this.showFieldError('registerLoginId', 'This Login ID is already taken');
            isValid = false;
        }

        // Validate email
        if (!data.email) {
            this.showFieldError('registerEmail', 'Email is required');
            isValid = false;
        } else if (!this.isValidEmail(data.email)) {
            this.showFieldError('registerEmail', 'Please enter a valid email address');
            isValid = false;
        } else if (!storage.isEmailAvailable(data.email)) {
            this.showFieldError('registerEmail', 'This email is already registered');
            isValid = false;
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
        // Login ID availability check for registration
        const registerLoginId = document.getElementById('registerLoginId');
        if (registerLoginId) {
            registerLoginId.addEventListener('blur', () => {
                const value = registerLoginId.value.trim();
                if (value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value)) {
                    if (storage.isLoginIdAvailable(value)) {
                        this.showFieldSuccess('registerLoginId');
                    } else {
                        this.showFieldError('registerLoginId', 'This Login ID is already taken');
                    }
                }
            });
        }

        // Email availability check
        const registerEmail = document.getElementById('registerEmail');
        if (registerEmail) {
            registerEmail.addEventListener('blur', () => {
                const value = registerEmail.value.trim();
                if (this.isValidEmail(value)) {
                    if (storage.isEmailAvailable(value)) {
                        this.showFieldSuccess('registerEmail');
                    } else {
                        this.showFieldError('registerEmail', 'This email is already registered');
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

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    redirectToDashboard() {
        window.location.href = 'pages/dashboard.html';
    }

    // Logout function
    logout() {
        storage.logout();
        this.showMessage('Logged out successfully', 'info');
        setTimeout(() => {
            window.location.href = '../index.html';
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
    window.auth = new AuthManager();
    console.log('🔐 HopOn Authentication System initialized');
});