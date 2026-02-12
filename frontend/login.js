/**
 * Login Form Handler for CareerPath Alumni Forum
 */
class LoginForm {
    constructor() {
        this.form = document.getElementById('loginForm');
        this.submitBtn = this.form.querySelector('.login-btn');
        this.passwordToggle = document.getElementById('passwordToggle');
        this.passwordInput = document.getElementById('password');
        this.usernameInput = document.getElementById('username');
        this.successMessage = document.getElementById('successMessage');
        this.isSubmitting = false;
        this.selectedRole = 'student'; // Default role
        
        this.validators = {
            username: (value) => {
                if (!value || value.trim() === '') {
                    return { isValid: false, message: 'Username or email is required' };
                }
                return { isValid: true, message: '' };
            },
            password: (value) => {
                if (!value || value.trim() === '') {
                    return { isValid: false, message: 'Password is required' };
                }
                return { isValid: true, message: '' };
            }
        };
        
        this.init();
    }
    
    init() {
        this.addEventListeners();
        this.setupFloatingLabels();
        this.addInputAnimations();
        this.setupPasswordToggle();
        this.setupSocialButtons();
        this.setupRoleSelector();
        this.addBackgroundEffects();
        FormUtils.addSharedAnimations();
        
        // Check if already logged in
        if (FormUtils.isLoggedIn()) {
            window.location.href = 'index.html';
        }
    }
    
    addEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        this.usernameInput.addEventListener('blur', () => this.validateField('username'));
        this.passwordInput.addEventListener('blur', () => this.validateField('password'));
        
        // Clear errors on input
        this.usernameInput.addEventListener('input', () => this.clearError('username'));
        this.passwordInput.addEventListener('input', () => this.clearError('password'));
        
        // Submit on Enter key
        this.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.form.dispatchEvent(new Event('submit'));
            }
        });
    }
    
    setupFloatingLabels() {
        const inputs = this.form.querySelectorAll('input[type="text"], input[type="password"], input[type="email"]');
        inputs.forEach(input => {
            // Check initial value
            if (input.value) {
                input.parentElement.parentElement.classList.add('focused');
            }
            
            input.addEventListener('focus', () => {
                input.parentElement.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.parentElement.classList.remove('focused');
                }
            });
        });
    }
    
    addInputAnimations() {
        const inputs = this.form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('pulse');
                setTimeout(() => input.parentElement.classList.remove('pulse'), 300);
            });
        });
    }
    
    setupPasswordToggle() {
        if (!this.passwordToggle) return;
        
        this.passwordToggle.addEventListener('click', () => {
            const type = this.passwordInput.type === 'password' ? 'text' : 'password';
            this.passwordInput.type = type;
            const eyeIcon = this.passwordToggle.querySelector('.eye-icon');
            if (eyeIcon) {
                eyeIcon.textContent = type === 'password' ? '👁️' : '🙈';
            }
        });
    }
    
    setupSocialButtons() {
        const googleBtn = document.getElementById('googleLogin');
        const appleBtn = document.getElementById('appleLogin');
        
        if (googleBtn) {
            googleBtn.addEventListener('click', () => {
                FormUtils.showNotification('Google login is not yet implemented', 'info');
            });
        }
        
        if (appleBtn) {
            appleBtn.addEventListener('click', () => {
                FormUtils.showNotification('Apple login is not yet implemented', 'info');
            });
        }
    }
    
    setupRoleSelector() {
        const roleTabs = document.querySelectorAll('.role-tab');
        if (!roleTabs.length) return;
        
        roleTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                roleTabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                tab.classList.add('active');
                // Update selected role
                this.selectedRole = tab.dataset.role;
                
                // Add pulse animation
                tab.classList.add('pulse');
                setTimeout(() => tab.classList.remove('pulse'), 300);
            });
        });
    }
    
    addBackgroundEffects() {
        // Add parallax effect to orbs on mouse move
        document.addEventListener('mousemove', (e) => {
            const orbs = document.querySelectorAll('.orb');
            if (!orbs.length) return;
            
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            
            orbs.forEach((orb, index) => {
                const speed = (index + 1) * 20;
                const xOffset = (x - 0.5) * speed;
                const yOffset = (y - 0.5) * speed;
                orb.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
            });
        });
    }
    
    validateField(fieldName) {
        const input = document.getElementById(fieldName);
        const validator = this.validators[fieldName];
        
        if (!input || !validator) return true;
        
        const result = validator(input.value);
        if (!result.isValid) {
            this.showError(fieldName, result.message);
            return false;
        } else {
            this.clearError(fieldName);
            return true;
        }
    }
    
    showError(fieldName, message) {
        const input = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}Error`);
        
        if (input) {
            input.classList.add('error');
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
        }
        
        if (errorElement) {
            errorElement.textContent = message;
        }
    }
    
    clearError(fieldName) {
        const input = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}Error`);
        
        if (input) {
            input.classList.remove('error');
        }
        
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
    
    clearAllErrors() {
        this.clearError('username');
        this.clearError('password');
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        // Clear previous errors
        this.clearAllErrors();
        
        // Validate all fields
        const usernameValid = this.validateField('username');
        const passwordValid = this.validateField('password');
        
        if (!usernameValid || !passwordValid) {
            return;
        }
        
        this.isSubmitting = true;
        this.submitBtn.classList.add('loading');
        this.submitBtn.disabled = true;
        
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value;
        
        try {
            // Call the API login with role
            const result = await FormUtils.apiLogin(username, password, this.selectedRole);
            
            if (result.success) {
                // Show success notification
                FormUtils.showNotification(`Welcome back, ${result.user.username}!`, 'success');
                
                // Show success message if element exists
                this.showSuccess();
                
                // Redirect after animation
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                // Extract error message
                let errorMessage = 'Login failed. Please check your credentials.';
                
                if (result.error) {
                    if (typeof result.error === 'string') {
                        errorMessage = result.error;
                    } else if (result.error.message) {
                        errorMessage = result.error.message;
                    } else if (result.error.non_field_errors) {
                        errorMessage = Array.isArray(result.error.non_field_errors) 
                            ? result.error.non_field_errors[0] 
                            : result.error.non_field_errors;
                    } else if (result.error.error) {
                        errorMessage = typeof result.error.error === 'string'
                            ? result.error.error
                            : 'Invalid credentials';
                    }
                }
                
                FormUtils.showNotification(errorMessage, 'error');
                
                // Shake the form
                this.form.classList.add('shake');
                setTimeout(() => this.form.classList.remove('shake'), 500);
                
                this.resetSubmitState();
            }
        } catch (error) {
            console.error('Login error:', error);
            FormUtils.showNotification('An unexpected error occurred. Please try again.', 'error');
            this.resetSubmitState();
        }
    }
    
    resetSubmitState() {
        this.isSubmitting = false;
        this.submitBtn.classList.remove('loading');
        this.submitBtn.disabled = false;
    }
    
    showSuccess() {
        if (this.successMessage) {
            this.form.style.display = 'none';
            this.successMessage.classList.add('show');
        }
    }
}

// Initialize login form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginForm();
});