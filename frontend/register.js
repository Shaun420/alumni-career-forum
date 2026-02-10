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
    }
    
    setupPasswordToggles() {
        const togglePassword = (toggleBtn, passwordField) => {
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
            if (strength === 'weak') {
                this.passwordStrengthBar.classList.add('weak');
            } else if (strength === 'medium') {
                this.passwordStrengthBar.classList.add('medium');
            } else if (strength === 'strong') {
                this.passwordStrengthBar.classList.add('strong');
            }
        });
    }
    
    calculatePasswordStrength(password) {
        if (!password) return '';
        
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.match(/[a-z]+/)) strength++;
        if (password.match(/[A-Z]+/)) strength++;
        if (password.match(/[0-9]+/)) strength++;
        if (password.match(/[$@#&!]+/)) strength++;
        
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
        const errorElement = document.getElementById(`${fieldName}Error`);
        const validator = this.validators[fieldName];
        
        if (validator) {
            const result = validator(input.value);
            if (!result.isValid) {
                this.showError(fieldName, result.message);
                return false;
            } else {
                this.clearError(fieldName);
                return true;
            }
        }
        return true;
    }
    
    showError(fieldName, message) {
        const input = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}Error`);
        
        input.classList.add('error');
        errorElement.textContent = message;
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
    }
    
    clearError(fieldName) {
        const input = document.getElementById(fieldName);
        const errorElement = document.getElementById(`${fieldName}Error`);
        
        input.classList.remove('error');
        if (errorElement) {
            errorElement.textContent = '';
        }
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        // Validate all required fields
        const validations = [
            this.validateField('username'),
            this.validateField('email'),
            this.validateField('password'),
            this.validateField('confirmPassword'),
            this.validateField('role')
        ];
        
        if (!validations.every(v => v)) {
            return;
        }
        
        this.isSubmitting = true;
        this.submitBtn.classList.add('loading');
        this.submitBtn.disabled = true;
        
        // Prepare user data
        const userData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            role: document.getElementById('role').value,
            first_name: document.getElementById('firstName').value || '',
            last_name: document.getElementById('lastName').value || '',
        };
        
        // Add optional fields if provided
        const graduationYear = document.getElementById('graduationYear').value;
        const department = document.getElementById('department').value;
        const bio = document.getElementById('bio').value;
        
        if (graduationYear) userData.graduation_year = parseInt(graduationYear);
        if (department) userData.department = department;
        if (bio) userData.bio = bio;
        
        try {
            // Call the API register
            const result = await FormUtils.apiRegister(userData);
            
            if (result.success) {
                // Show success message
                this.showSuccess();
                
                // Redirect after 1.5 seconds
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                // Show error
                let errorMessage = 'Registration failed. Please try again.';
                
                // Handle specific field errors
                if (result.error.username) {
                    this.showError('username', result.error.username[0]);
                }
                if (result.error.email) {
                    this.showError('email', result.error.email[0]);
                }
                if (result.error.password) {
                    this.showError('password', result.error.password[0]);
                }
                if (result.error.message) {
                    errorMessage = result.error.message;
                }
                
                FormUtils.showNotification(errorMessage, 'error');
                this.form.classList.add('shake');
                setTimeout(() => this.form.classList.remove('shake'), 500);
                
                this.isSubmitting = false;
                this.submitBtn.classList.remove('loading');
                this.submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Registration error:', error);
            FormUtils.showNotification('An error occurred. Please try again.', 'error');
            
            this.isSubmitting = false;
            this.submitBtn.classList.remove('loading');
            this.submitBtn.disabled = false;
        }
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
