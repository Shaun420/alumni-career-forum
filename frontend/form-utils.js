// Form Utilities for Login and Registration
const FormUtils = {
    // Email validation
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            return { isValid: false, message: 'Email is required' };
        }
        if (!emailRegex.test(email)) {
            return { isValid: false, message: 'Please enter a valid email address' };
        }
        return { isValid: true, message: '' };
    },

    // Password validation
    validatePassword(password) {
        if (!password) {
            return { isValid: false, message: 'Password is required' };
        }
        if (password.length < 6) {
            return { isValid: false, message: 'Password must be at least 6 characters' };
        }
        return { isValid: true, message: '' };
    },

    // Username validation
    validateUsername(username) {
        if (!username) {
            return { isValid: false, message: 'Username is required' };
        }
        if (username.length < 3) {
            return { isValid: false, message: 'Username must be at least 3 characters' };
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            return { isValid: false, message: 'Username can only contain letters, numbers, and underscores' };
        }
        return { isValid: true, message: '' };
    },

    // API call to login endpoint
    async apiLogin(username, password, role = null) {
        try {
            const response = await fetch('http://localhost:8000/api/auth/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
			console.log('Login response:', response.status);

            if (response.ok) {
                // IMPORTANT: Store token and user data immediately
                if (data.token) {
                    this.setToken(data.token);
                    console.log('Token saved successfully');
                } else {
                    console.error('No token in login response!');
                }
                
                if (data.user) {
                    this.setCurrentUser(data.user);
                    console.log('User saved:', data.user.username);
                }
                return {
					success: true,
					user: data.user,
					token: data.token,
					message: data.message || 'Login successful',
				};
            } else {
                let errorMessage = 'Invalid credentials';
                
                if (data.error) {
                    errorMessage = typeof data.error === 'string' ? data.error : 'Login failed';
                } else if (data.non_field_errors) {
                    errorMessage = Array.isArray(data.non_field_errors) 
                        ? data.non_field_errors[0] 
                        : data.non_field_errors;
                }
                
                return {
                    success: false,
                    error: { message: errorMessage, ...data }
                };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: { message: 'Network error. Please try again.' } };
        }
    },

    // API call to register endpoint
    async apiRegister(userData) {
        try {
            const response = await fetch('http://localhost:8000/api/auth/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();
			console.log('Register response:', response.status, data);

            if (response.ok) {
                // Store token and user data
                if (data.token) {
                    this.setToken(data.token);
                }
                if (data.user) {
                    this.setCurrentUser(data.user);
                }
                return {
					success: true,
					user: data.user,
					token: data.token,
					message: data.message || 'Registration successful'
				};
            } else {
                return { success: false, error: data };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: { message: 'Network error. Please try again.' } };
        }
    },

    // API call to logout endpoint
    async apiLogout() {
        try {
            const token = this.getToken();
            if (token) {
                await fetch('http://localhost:8000/api/auth/logout/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Token ${token}`,
                    },
                });
            }
            // Clear local storage
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);
            // Clear local storage even on error
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            return { success: false, error };
        }
    },

	    /**
     * Get current user profile from API
     * FIXED: Now properly sends Authorization header
     */
    async apiGetProfile() {
        try {
            const headers = this.getAuthHeaders();
            console.log('Fetching profile with headers:', headers);
            
            const response = await fetch(`${this.AUTH_URL}/profile/`, {
                method: 'GET',
                headers: headers  // This includes the Authorization token
            });
            
            console.log('Profile response status:', response.status);
            
            if (response.ok) {
                const user = await response.json();
                this.setCurrentUser(user);
                return { success: true, user: user };
            } else if (response.status === 401) {
                console.log('Token invalid, clearing auth');
                this.clearAuth();
                return { success: false, error: 'Session expired' };
            } else {
                return { success: false, error: 'Failed to get profile' };
            }
        } catch (error) {
            console.error('Get profile API error:', error);
            return { success: false, error: 'Network error' };
        }
    },
    
    /**
     * Check authentication status
     */
    async checkAuth() {
        const token = this.getToken();
        
        if (!token) {
            console.log('No token, not authenticated');
            return { isAuthenticated: false, user: null };
        }
        
        console.log('Checking auth with token...');
        
        try {
            const response = await fetch(`${this.AUTH_URL}/check/`, {
                method: 'GET',
                headers: this.getAuthHeaders()  // Include Authorization token
            });
            
            console.log('Auth check response:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                if (data.isAuthenticated && data.user) {
                    this.setCurrentUser(data.user);
                    return { isAuthenticated: true, user: data.user };
                }
            }
        } catch (error) {
            console.error('Auth check error:', error);
        }
        
        this.clearAuth();
        return { isAuthenticated: false, user: null };
    },
    
    /**
     * Verify token is still valid
     */
    async verifyToken() {
        const token = this.getToken();
        
        if (!token) {
            return false;
        }
        
        try {
            const response = await fetch(`${this.AUTH_URL}/profile/`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });
            
            if (response.ok) {
                const user = await response.json();
                this.setCurrentUser(user);
                return true;
            }
        } catch (error) {
            console.error('Token verification error:', error);
        }
        
        this.clearAuth();
        return false;
    },
    /**
     * Update user profile
     */
    async apiUpdateProfile(profileData) {
        try {
            const response = await fetch(`${this.AUTH_URL}/profile/`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),  // Include token!
                body: JSON.stringify(profileData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                const user = data.user || data;
                this.setCurrentUser(user);
                return { success: true, user: user };
            } else {
                return { success: false, error: data };
            }
        } catch (error) {
            console.error('Update profile API error:', error);
            return { success: false, error: { message: 'Network error' } };
        }
    },

	/**
     * Change password
     */
    async apiChangePassword(oldPassword, newPassword) {
        try {
            const response = await fetch(`${this.AUTH_URL}/change-password/`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword,
                    new_password2: newPassword
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Update token if returned
                if (data.token) {
                    this.setToken(data.token);
                }
                return {
                    success: true,
                    message: data.message || 'Password changed successfully'
                };
            } else {
                return {
                    success: false,
                    error: data
                };
            }
        } catch (error) {
            console.error('Change password API error:', error);
            return {
                success: false,
                error: { message: 'Network error' }
            };
        }
    },
    
	getToken() {
        return localStorage.getItem('authToken');
    },
    
    setToken(token) {
        if (token) {
            localStorage.setItem('authToken', token);
            console.log('Token stored:', token.substring(0, 10) + '...');
        }
    },
    
    clearAuth() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        console.log('Auth cleared');
    },
    // Get current user data
    getCurrentUser() {
        try {
            const user = localStorage.getItem('userData');
            return user ? JSON.parse(user) : null;
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    },

	setCurrentUser(user) {
        if (user) {
            localStorage.setItem('userData', JSON.stringify(user));
        }
    },

    // Check if user is logged in
    isLoggedIn() {
        const token = this.getToken();
        console.log('isLoggedIn check, token exists:', !!token);
        return !!token;
    },

	getAuthHeaders() {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (token) {
            headers['Authorization'] = `Token ${token}`;
            console.log('Auth header set with token');
        } else {
            console.warn('No token available for auth header');
        }
        
        return headers;
    },

    // Show notification
    showNotification(message, type = 'info', container = null) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        if (container) {
            container.appendChild(notification);
        } else {
            document.body.appendChild(notification);
        }
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    },

    // Add shared animations
    addSharedAnimations() {
        if (document.getElementById('shared-animations')) return;
        
        const style = document.createElement('style');
        style.id = 'shared-animations';
        style.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
                20%, 40%, 60%, 80% { transform: translateX(10px); }
            }
            
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            @keyframes glow {
                0%, 100% { box-shadow: 0 0 20px rgba(0, 255, 136, 0.3); }
                50% { box-shadow: 0 0 40px rgba(0, 255, 136, 0.6); }
            }
            
            .shake {
                animation: shake 0.5s;
            }
            
            .pulse {
                animation: pulse 0.3s ease-in-out;
            }
            
            .fade-in {
                animation: fadeIn 0.5s ease-out;
            }
            
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 25px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 10000;
                animation: fadeIn 0.3s ease-out;
                max-width: 300px;
            }
            
            .notification-success {
                background: linear-gradient(135deg, #00ff88, #00cc70);
            }
            
            .notification-error {
                background: linear-gradient(135deg, #ff4444, #cc0000);
            }
            
            .notification-info {
                background: linear-gradient(135deg, #0099ff, #0066cc);
            }
            
            .notification.fade-out {
                animation: fadeIn 0.3s ease-out reverse;
            }
        `;
        document.head.appendChild(style);
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormUtils;
}
