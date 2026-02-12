/**
 * Profile Page Handler for CareerBridge Alumni Forum
 * Handles profile viewing, editing, password change
 */

class ProfilePage {
    constructor() {
        this.user = null;
        this.originalData = {};
        this.isSubmitting = false;
        
        this.init();
    }
    
    async init() {
        // Wait for Header to initialize
        await this.waitForHeader();
        
        // Check authentication
        if (!this.checkAuth()) return;
        
        // Load profile data
        await this.loadProfile();
        
        // Setup form handlers
        this.setupEditProfileForm();
        this.setupChangePasswordForm();
        this.setupPasswordToggles();
        this.setupPasswordStrength();
        this.setupBioCounter();
        this.setupResetButton();
        this.setupDeleteAccount();
    }
    
    /**
     * Wait for Header component to initialize
     */
    async waitForHeader() {
        return new Promise(resolve => {
            const check = setInterval(() => {
                if (window.Header && Header.initialized) {
                    clearInterval(check);
                    resolve();
                }
            }, 50);
            
            setTimeout(() => {
                clearInterval(check);
                resolve();
            }, 3000);
        });
    }
    
    /**
     * Check if user is authenticated
     */
    checkAuth() {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
            this.showNotification('Please login to view your profile.', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
            return false;
        }
        
        return true;
    }
    
    /**
     * Get auth headers
     */
    getAuthHeaders() {
        const token = localStorage.getItem('authToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
        };
    }
    
    /**
     * Load user profile from API
     */
    async loadProfile() {
        try {
            const response = await fetch('http://localhost:8000/api/auth/profile/', {
                method: 'GET',
                headers: this.getAuthHeaders()
            });
            
            if (response.ok) {
                this.user = await response.json();
                this.originalData = { ...this.user };
                this.populateProfile();
                this.populateEditForm();
            } else if (response.status === 401) {
                this.showNotification('Session expired. Please login again.', 'error');
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
            } else {
                throw new Error('Failed to load profile');
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            this.showNotification('Error loading profile. Please try again.', 'error');
        }
    }
    
    /**
     * Populate profile display sections
     */
    populateProfile() {
        const user = this.user;
        
        // Hero section
        const avatar = document.getElementById('profileAvatar');
        const fullName = document.getElementById('profileFullName');
        const username = document.getElementById('profileUsername');
        const roleBadge = document.getElementById('profileRoleBadge');
        
        if (avatar) avatar.textContent = user.username.charAt(0).toUpperCase();
        
        if (fullName) {
            const name = [user.first_name, user.last_name].filter(Boolean).join(' ');
            fullName.textContent = name || user.username;
        }
        
        if (username) username.textContent = `@${user.username}`;
        
        if (roleBadge) {
            roleBadge.textContent = this.capitalizeFirst(user.role || 'User');
        }
        
        // Account info card
        this.setText('infoUsername', user.username);
        this.setText('infoEmail', user.email);
        
        const infoRole = document.getElementById('infoRole');
        if (infoRole) {
            infoRole.textContent = this.capitalizeFirst(user.role || 'User');
        }
        
        const joinedDate = document.getElementById('infoJoined');
        if (joinedDate && user.date_joined) {
            joinedDate.textContent = new Date(user.date_joined).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        // Academic info card
        this.setText('infoDepartment', user.department || 'Not set');
        this.setText('infoGraduationYear', user.graduation_year || 'Not set');
    }
    
    /**
     * Populate edit form with current data
     */
    populateEditForm() {
        const user = this.user;
        
        this.setInputValue('editFirstName', user.first_name || '');
        this.setInputValue('editLastName', user.last_name || '');
        this.setInputValue('editEmail', user.email || '');
        this.setInputValue('editRole', this.capitalizeFirst(user.role || 'User'));
        this.setInputValue('editDepartment', user.department || '');
        this.setInputValue('editGraduationYear', user.graduation_year || '');
        this.setInputValue('editBio', user.bio || '');
        
        // Update bio counter
        this.updateBioCounter();
    }
    
    // ============================================
    // EDIT PROFILE FORM
    // ============================================
    
    setupEditProfileForm() {
        const form = document.getElementById('editProfileForm');
        if (!form) return;
        
        form.addEventListener('submit', (e) => this.handleProfileSubmit(e));
    }
    
    async handleProfileSubmit(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        const saveBtn = document.getElementById('saveProfileBtn');
        const btnText = saveBtn.querySelector('.btn-text');
        const btnSpinner = saveBtn.querySelector('.btn-spinner');
        
        // Validate email
        const email = document.getElementById('editEmail').value.trim();
        if (!email || !this.isValidEmail(email)) {
            this.showNotification('Please enter a valid email address.', 'error');
            document.getElementById('editEmail').focus();
            return;
        }
        
        // Validate graduation year if provided
        const gradYear = document.getElementById('editGraduationYear').value;
        if (gradYear) {
            const year = parseInt(gradYear);
            const currentYear = new Date().getFullYear();
            if (year < 1950 || year > currentYear + 10) {
                this.showNotification(`Graduation year must be between 1950 and ${currentYear + 10}.`, 'error');
                document.getElementById('editGraduationYear').focus();
                return;
            }
        }
        
        // Validate bio length
        const bio = document.getElementById('editBio').value;
        if (bio.length > 500) {
            this.showNotification('Bio must be 500 characters or less.', 'error');
            document.getElementById('editBio').focus();
            return;
        }
        
        // Prepare data (exclude role - cannot be changed)
        const profileData = {
            first_name: document.getElementById('editFirstName').value.trim(),
            last_name: document.getElementById('editLastName').value.trim(),
            email: email,
            department: document.getElementById('editDepartment').value.trim(),
            bio: bio.trim()
        };
        
        // Add graduation year only if provided
        if (gradYear) {
            profileData.graduation_year = parseInt(gradYear);
        } else {
            profileData.graduation_year = null;
        }
        
        // Show loading state
        this.isSubmitting = true;
        saveBtn.disabled = true;
        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline-flex';
        
        try {
            const response = await fetch('http://localhost:8000/api/auth/profile/', {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(profileData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Update local data
                this.user = data.user || data;
                this.originalData = { ...this.user };
                
                // Update localStorage
                localStorage.setItem('user', JSON.stringify(this.user));
                
                // Update display
                this.populateProfile();
                
                // Update header if available
                if (window.Header) {
                    Header.currentUser = this.user;
                    Header.render();
                    Header.setupEventListeners();
                }
                
                // Success animation on the card
                const card = document.getElementById('editProfileForm').closest('.profile-card');
                card.classList.add('save-success');
                setTimeout(() => card.classList.remove('save-success'), 600);
                
                this.showNotification('Profile updated successfully! ✓', 'success');
            } else {
                // Handle errors
                let errorMsg = 'Failed to update profile.';
                
                if (data.email) {
                    errorMsg = `Email: ${Array.isArray(data.email) ? data.email[0] : data.email}`;
                } else if (data.error) {
                    errorMsg = data.error;
                } else {
                    // Collect all field errors
                    const errors = [];
                    for (const [field, msgs] of Object.entries(data)) {
                        const fieldName = field.replace(/_/g, ' ');
                        const msg = Array.isArray(msgs) ? msgs[0] : msgs;
                        errors.push(`${fieldName}: ${msg}`);
                    }
                    if (errors.length > 0) errorMsg = errors.join(' | ');
                }
                
                this.showNotification(errorMsg, 'error');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            this.isSubmitting = false;
            saveBtn.disabled = false;
            btnText.style.display = 'inline';
            btnSpinner.style.display = 'none';
        }
    }
    
    // ============================================
    // CHANGE PASSWORD FORM
    // ============================================
    
    setupChangePasswordForm() {
        const form = document.getElementById('changePasswordForm');
        if (!form) return;
        
        form.addEventListener('submit', (e) => this.handlePasswordChange(e));
    }
    
    async handlePasswordChange(e) {
        e.preventDefault();
        
        if (this.isSubmitting) return;
        
        // Clear previous errors
        this.clearPasswordErrors();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;
        
        // Validate
        let hasError = false;
        
        if (!currentPassword) {
            this.showFieldError('currentPasswordError', 'Current password is required');
            hasError = true;
        }
        
        if (!newPassword) {
            this.showFieldError('newPasswordError', 'New password is required');
            hasError = true;
        } else if (newPassword.length < 8) {
            this.showFieldError('newPasswordError', 'Password must be at least 8 characters');
            hasError = true;
        }
        
        if (!confirmPassword) {
            this.showFieldError('confirmNewPasswordError', 'Please confirm your new password');
            hasError = true;
        } else if (newPassword !== confirmPassword) {
            this.showFieldError('confirmNewPasswordError', 'Passwords do not match');
            hasError = true;
        }
        
        if (currentPassword === newPassword) {
            this.showFieldError('newPasswordError', 'New password must be different from current password');
            hasError = true;
        }
        
        if (hasError) return;
        
        const changeBtn = document.getElementById('changePasswordBtn');
        const btnText = changeBtn.querySelector('.btn-text');
        const btnSpinner = changeBtn.querySelector('.btn-spinner');
        
        this.isSubmitting = true;
        changeBtn.disabled = true;
        btnText.style.display = 'none';
        btnSpinner.style.display = 'inline-flex';
        
        try {
            const response = await fetch('http://localhost:8000/api/auth/change-password/', {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    old_password: currentPassword,
                    new_password: newPassword,
                    new_password2: confirmPassword
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Update token if returned
                if (data.token) {
                    localStorage.setItem('authToken', data.token);
                }
                
                // Reset form
                document.getElementById('changePasswordForm').reset();
                
                // Reset password strength
                const fill = document.getElementById('passwordStrengthFill');
                const text = document.getElementById('passwordStrengthText');
                if (fill) {
                    fill.className = 'password-strength-fill';
                    fill.style.width = '0';
                }
                if (text) {
                    text.textContent = '';
                    text.className = 'password-strength-text';
                }
                
                this.showNotification('Password changed successfully! 🔐', 'success');
            } else {
                if (data.old_password) {
                    const msg = Array.isArray(data.old_password) ? data.old_password[0] : data.old_password;
                    this.showFieldError('currentPasswordError', msg);
                }
                if (data.new_password) {
                    const msg = Array.isArray(data.new_password) ? data.new_password[0] : data.new_password;
                    this.showFieldError('newPasswordError', msg);
                }
                if (data.error) {
                    this.showNotification(data.error, 'error');
                }
                if (!data.old_password && !data.new_password && !data.error) {
                    this.showNotification('Failed to change password. Please try again.', 'error');
                }
            }
        } catch (error) {
            console.error('Password change error:', error);
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            this.isSubmitting = false;
            changeBtn.disabled = false;
            btnText.style.display = 'inline';
            btnSpinner.style.display = 'none';
        }
    }
    
    // ============================================
    // PASSWORD TOGGLES
    // ============================================
    
    setupPasswordToggles() {
        const toggles = document.querySelectorAll('.password-toggle');
        
        toggles.forEach(toggle => {
            toggle.addEventListener('click', () => {
                const targetId = toggle.getAttribute('data-target');
                const input = document.getElementById(targetId);
                
                if (!input) return;
                
                if (input.type === 'password') {
                    input.type = 'text';
                    toggle.textContent = '🙈';
                } else {
                    input.type = 'password';
                    toggle.textContent = '👁️';
                }
            });
        });
    }
    
    // ============================================
    // PASSWORD STRENGTH
    // ============================================
    
    setupPasswordStrength() {
        const newPasswordInput = document.getElementById('newPassword');
        if (!newPasswordInput) return;
        
        newPasswordInput.addEventListener('input', () => {
            const password = newPasswordInput.value;
            const strength = this.calculatePasswordStrength(password);
            
            const fill = document.getElementById('passwordStrengthFill');
            const text = document.getElementById('passwordStrengthText');
            
            if (!fill || !text) return;
            
            fill.className = 'password-strength-fill';
            text.className = 'password-strength-text';
            
            if (!password) {
                fill.style.width = '0';
                text.textContent = '';
                return;
            }
            
            fill.classList.add(strength.level);
            text.classList.add(strength.level);
            text.textContent = strength.text;
        });
    }
    
    calculatePasswordStrength(password) {
        if (!password) return { level: '', text: '' };
        
        let score = 0;
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;
        
        if (score <= 2) return { level: 'weak', text: 'Weak password' };
        if (score <= 4) return { level: 'medium', text: 'Moderate password' };
        return { level: 'strong', text: 'Strong password' };
    }
    
    // ============================================
    // BIO CHARACTER COUNTER
    // ============================================
    
    setupBioCounter() {
        const bioInput = document.getElementById('editBio');
        if (!bioInput) return;
        
        bioInput.addEventListener('input', () => this.updateBioCounter());
        
        // Set max length
        bioInput.setAttribute('maxlength', '500');
    }
    
    updateBioCounter() {
        const bioInput = document.getElementById('editBio');
        const counter = document.getElementById('bioCharCount');
        const counterParent = counter?.parentElement;
        
        if (!bioInput || !counter) return;
        
        const length = bioInput.value.length;
        counter.textContent = length;
        
        if (counterParent) {
            counterParent.className = 'char-counter';
            if (length >= 450) counterParent.classList.add('at-limit');
            else if (length >= 400) counterParent.classList.add('near-limit');
        }
    }
    
    // ============================================
    // RESET BUTTON
    // ============================================
    
    setupResetButton() {
        const resetBtn = document.getElementById('resetProfileBtn');
        if (!resetBtn) return;
        
        resetBtn.addEventListener('click', () => {
            this.user = { ...this.originalData };
            this.populateEditForm();
            this.showNotification('Form reset to saved values.', 'info');
        });
    }
    
    // ============================================
    // DELETE ACCOUNT
    // ============================================
    
    setupDeleteAccount() {
        const deleteBtn = document.getElementById('deleteAccountBtn');
        if (!deleteBtn) return;
        
        deleteBtn.addEventListener('click', () => {
            const username = this.user?.username || '';
            const confirmation = prompt(
                `This action is PERMANENT and cannot be undone.\n\nTo confirm, type your username: "${username}"`
            );
            
            if (confirmation === username) {
                this.showNotification('Account deletion is not implemented yet.', 'info');
                // In production, you would call the delete API here
                // this.deleteAccount();
            } else if (confirmation !== null) {
                this.showNotification('Username did not match. Account was NOT deleted.', 'error');
            }
        });
    }
    
    // ============================================
    // UTILITY METHODS
    // ============================================
    
    setText(elementId, text) {
        const el = document.getElementById(elementId);
        if (el) el.textContent = text;
    }
    
    setInputValue(elementId, value) {
        const el = document.getElementById(elementId);
        if (el) el.value = value;
    }
    
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    showFieldError(elementId, message) {
        const el = document.getElementById(elementId);
        if (el) el.textContent = message;
    }
    
    clearPasswordErrors() {
        this.showFieldError('currentPasswordError', '');
        this.showFieldError('newPasswordError', '');
        this.showFieldError('confirmNewPasswordError', '');
    }
    
    showNotification(message, type = 'success') {
        if (window.Header) {
            Header.showNotification(message, type);
        } else if (window.FormUtils) {
            FormUtils.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ProfilePage();
});