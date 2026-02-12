/**
 * Register Form Handler
 */
class RegisterForm {
    constructor() {
        this.form = document.getElementById('registerForm');
        this.submitBtn = this.form.querySelector('.register-btn');
        this.passwordInput = document.getElementById('password');
        this.confirmPasswordInput = document.getElementById('confirmPassword');
        this.passwordStrengthBar = document.getElementById('passwordStrengthBar');
        this.successMessage = document.getElementById('successMessage');
        this.isSubmitting = false;
        
        this.validators = {
            username: FormUtils.validateUsername,
            email: FormUtils.validateEmail,
            password: FormUtils.validatePassword,
            confirmPassword: (value) => {
                if (!value || value.trim() === '') {
                    return { isValid: false, message: 'Please confirm your password' };
                }
                if (value !== this.passwordInput.value) {
                    return { isValid: false, message: 'Passwords do not match' };
                }
                return { isValid: true, message: '' };
            },
            role: (value) => {
                if (!value) {
                    return { isValid: false, message: 'Please select a role' };
                }
                return { isValid: true, message: '' };
            }
        };
        
        this.init();
    }
    
    init() {
        this.addEventListeners();
        this.setupPasswordToggles();
        this.setupPasswordStrength();
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
        const fields = ['username', 'email', 'password', 'confirmPassword', 'role'];
        fields.forEach(fieldName => {
            const input = document.getElementById(fieldName);
            if (input) {
                input.addEventListener('blur', () => this.validateField(fieldName));
                input.addEventListener('input', () => this.clearError(fieldName));
            }
        });
        
        // Re-validate confirm password when password changes
        this.passwordInput.addEventListener('input', () => {
            if (this.confirmPasswordInput.value) {
                this.validateField('confirmPassword');
            }
        });
    }
    
    setupPasswordToggles() {
        const togglePassword = (toggleBtn, passwordField) => {
            if (!toggleBtn || !passwordField) return;
            
            toggleBtn.addEventListener('click', () => {
                const type = passwordField.type === 'password' ? 'text' : 'password';
                passwordField.type = type;
                toggleBtn.querySelector('.eye-icon').textContent = type === 'password' ? '👁️' : '🙈';
            });
        };
        
        const passwordToggle = document.getElementById('passwordToggle');
        const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
        
        togglePassword(passwordToggle, this.passwordInput);
        togglePassword(confirmPasswordToggle, this.confirmPasswordInput);
    }
    
    setupPasswordStrength() {
        this.passwordInput.addEventListener('input', () => {
            const password = this.passwordInput.value;
            const strength = this.calculatePasswordStrength(password);
            
            this.passwordStrengthBar.className = 'password-strength-bar';
            if (password.length > 0) {
                this.passwordStrengthBar.classList.add(strength);
            }
        });
    }
    
    calculatePasswordStrength(password) {
        if (!password) return '';
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (password.match(/[a-z]+/)) strength++;
        if (password.match(/[A-Z]+/)) strength++;
        if (password.match(/[0-9]+/)) strength++;
        if (password.match(/[$@#&!%^*()]+/)) strength++;
        
        if (strength <= 2) return 'weak';
        if (strength <= 4) return 'medium';
        return 'strong';
    }
    
    addBackgroundEffects() {
        // Add parallax effect to orbs on mouse move
        document.addEventListener('mousemove', (e) => {
            const orbs = document.querySelectorAll('.orb');
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
        const fields = ['username', 'email', 'password', 'confirmPassword', 'role'];
        fields.forEach(fieldName => this.clearError(fieldName));
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        // Clear previous errors
        this.clearAllErrors();
        
        // Validate all required fields
        const validations = [
            this.validateField('username'),
            this.validateField('email'),
            this.validateField('password'),
            this.validateField('confirmPassword'),
            this.validateField('role')
        ];
        
        if (!validations.every(v => v)) {
            FormUtils.showNotification('Please fix the errors above', 'error');
            return;
        }
        
        this.isSubmitting = true;
        this.submitBtn.classList.add('loading');
        this.submitBtn.disabled = true;
        
        // Prepare user data
        const userData = {
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            role: document.getElementById('role').value,
            first_name: document.getElementById('firstName').value.trim() || '',
            last_name: document.getElementById('lastName').value.trim() || '',
        };
        
        // Add optional fields if provided
        const graduationYear = document.getElementById('graduationYear').value;
        const department = document.getElementById('department').value.trim();
        const bio = document.getElementById('bio').value.trim();
        
        if (graduationYear) {
            userData.graduation_year = parseInt(graduationYear);
        }
        if (department) {
            userData.department = department;
        }
        if (bio) {
            userData.bio = bio;
        }
        
        try {
            const result = await FormUtils.apiRegister(userData);
            
            if (result.success) {
                // Show success message
                this.showSuccess();
                
                FormUtils.showNotification('Registration successful!', 'success');
                
                // Redirect after 1.5 seconds
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                // Handle errors
                this.handleRegistrationErrors(result.error);
                
                this.isSubmitting = false;
                this.submitBtn.classList.remove('loading');
                this.submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Registration error:', error);
            FormUtils.showNotification('An unexpected error occurred. Please try again.', 'error');
            
            this.isSubmitting = false;
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;
        }
    }
    
    handleRegistrationErrors(errors) {
        let hasFieldError = false;
        
        // Handle specific field errors
        if (errors.username) {
            const msg = Array.isArray(errors.username) ? errors.username[0] : errors.username;
            this.showError('username', msg);
            hasFieldError = true;
        }
        
        if (errors.email) {
            const msg = Array.isArray(errors.email) ? errors.email[0] : errors.email;
            this.showError('email', msg);
            hasFieldError = true;
        }
        
        if (errors.password) {
            const msg = Array.isArray(errors.password) ? errors.password[0] : errors.password;
            this.showError('password', msg);
            hasFieldError = true;
        }
        
        if (errors.role) {
            const msg = Array.isArray(errors.role) ? errors.role[0] : errors.role;
            this.showError('role', msg);
            hasFieldError = true;
        }
        
        // Show general error notification
        let errorMessage = 'Registration failed. Please check the form and try again.';
        
        if (errors.message) {
            errorMessage = errors.message;
        } else if (errors.non_field_errors) {
            errorMessage = Array.isArray(errors.non_field_errors) 
                ? errors.non_field_errors[0] 
                : errors.non_field_errors;
        } else if (errors.error) {
            errorMessage = typeof errors.error === 'string' 
                ? errors.error 
                : 'Registration failed.';
        }
        
        FormUtils.showNotification(errorMessage, 'error');
        
        // Shake the form
        this.form.classList.add('shake');
        setTimeout(() => this.form.classList.remove('shake'), 500);
    }
    
    showSuccess() {
        this.form.style.display = 'none';
        this.successMessage.classList.add('show');
    }
}

// Initialize register form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RegisterForm();
});