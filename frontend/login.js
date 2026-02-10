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
                if (!value) return { isValid: false, message: 'Username is required' };
                return { isValid: true, message: '' };
            },
            password: FormUtils.validatePassword
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
    }
    
    setupFloatingLabels() {
        const inputs = this.form.querySelectorAll('input[type="text"], input[type="password"], input[type="email"]');
        inputs.forEach(input => {
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
        this.passwordToggle.addEventListener('click', () => {
            const type = this.passwordInput.type === 'password' ? 'text' : 'password';
            this.passwordInput.type = type;
            this.passwordToggle.querySelector('.eye-icon').textContent = type === 'password' ? '👁️' : '🙈';
        });
    }
    
    setupSocialButtons() {
        const googleBtn = document.getElementById('googleLogin');
        const appleBtn = document.getElementById('appleLogin');
        
        googleBtn.addEventListener('click', () => {
            FormUtils.showNotification('Google login is not yet implemented', 'info');
        });
        
        appleBtn.addEventListener('click', () => {
            FormUtils.showNotification('Apple login is not yet implemented', 'info');
        });
    }
    
    setupRoleSelector() {
        const roleTabs = document.querySelectorAll('.role-tab');
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
        const input = this.form.querySelector(`#${fieldName}`);
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
        const input = this.form.querySelector(`#${fieldName}`);
        const errorElement = document.getElementById(`${fieldName}Error`);
        
        input.classList.add('error');
        errorElement.textContent = message;
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 500);
    }
    
    clearError(fieldName) {
        const input = this.form.querySelector(`#${fieldName}`);
        const errorElement = document.getElementById(`${fieldName}Error`);
        
        input.classList.remove('error');
        errorElement.textContent = '';
    }
    
    async handleSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        // Validate all fields
        const usernameValid = this.validateField('username');
        const passwordValid = this.validateField('password');
        
        if (!usernameValid || !passwordValid) {
            return;
        }
        
        this.isSubmitting = true;
        this.submitBtn.classList.add('loading');
        this.submitBtn.disabled = true;
        
        const username = this.usernameInput.value;
        const password = this.passwordInput.value;
        
        try {
            // Call the API login
            const result = await FormUtils.apiLogin(username, password, this.selectedRole);
            
            if (result.success) {
                // Show success message
                this.showSuccess();
                
                // Redirect after 1.5 seconds
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            } else {
                // Show error
                const errorMessage = result.error.non_field_errors 
                    ? result.error.non_field_errors[0]
                    : result.error.message || 'Login failed. Please check your credentials.';
                
                FormUtils.showNotification(errorMessage, 'error');
                this.form.classList.add('shake');
                setTimeout(() => this.form.classList.remove('shake'), 500);
                
                this.isSubmitting = false;
                this.submitBtn.classList.remove('loading');
                this.submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Login error:', error);
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

// Initialize login form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginForm();
});
