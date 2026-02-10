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

            if (response.ok) {
                // Store token and user data
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                return { success: true, data };
            } else {
                return { success: false, error: data };
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

            if (response.ok) {
                // Store token and user data
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userData', JSON.stringify(data.user));
                return { success: true, data };
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
            const token = localStorage.getItem('authToken');
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

    // Get current user data
    getCurrentUser() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    },

    // Check if user is logged in
    isLoggedIn() {
        return !!localStorage.getItem('authToken');
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
