/**
 * Shared Header Component for CareerBridge Alumni Forum
 * Include this file in all pages for consistent navigation
 */

const Header = {
    // Configuration
    AUTH_URL: 'http://localhost:8000/api/auth/',
    
    // Current user state
    currentUser: null,
    
    // Track if initialization is complete
    initialized: false,
    
    // Navigation items
    navItems: [
        { href: 'index.html', text: 'Home' },
        { href: 'explore.html', text: 'Explore Journeys' },
        { href: 'about.html', text: 'About Us' },
        { href: 'dashboard.html', text: 'Dashboard', requiresAuth: true }
    ],
    
    /**
     * Initialize header
     */
    async init() {
        await this.checkAuth();
        this.render();
        this.setupEventListeners();
        this.initialized = true;
        console.log('Header initialized | User:', this.currentUser?.username || 'Guest');
    },
    
    // ============================================
    // TOKEN MANAGEMENT
    // ============================================
    
    getToken() {
        return localStorage.getItem('authToken');
    },
    
    getAuthHeaders() {
        const token = this.getToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Token ${token}`;
        return headers;
    },
    
    clearAuth() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        this.currentUser = null;
    },
    
    getCurrentUser() {
        if (this.currentUser) return this.currentUser;
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    },
    
    isLoggedIn() {
        return !!this.getToken() && !!this.currentUser;
    },
    
    // ============================================
    // AUTHENTICATION
    // ============================================
    
    async checkAuth() {
        const token = this.getToken();
        
        if (!token) {
            this.currentUser = null;
            return null;
        }
        
        try {
            const response = await fetch(`${this.AUTH_URL}profile/`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });
            
            if (response.ok) {
                this.currentUser = await response.json();
                localStorage.setItem('user', JSON.stringify(this.currentUser));
                return this.currentUser;
            } else {
                this.clearAuth();
                return null;
            }
        } catch (error) {
            console.error('Auth check error:', error);
            // Use cached user data on network error
            try {
                const cached = localStorage.getItem('user');
                if (cached) {
                    this.currentUser = JSON.parse(cached);
                    return this.currentUser;
                }
            } catch (e) {}
            return null;
        }
    },
    
    async logout() {
        const token = this.getToken();
        
        if (token) {
            try {
                await fetch(`${this.AUTH_URL}logout/`, {
                    method: 'POST',
                    headers: this.getAuthHeaders()
                });
            } catch (error) {
                console.error('Logout error:', error);
            }
        }
        
        this.clearAuth();
        this.showNotification('Logged out successfully');
        
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    },
    
    // ============================================
    // RENDER
    // ============================================
    
    render() {
        let headerEl = document.getElementById('app-header');
        
        if (!headerEl) {
            headerEl = document.createElement('div');
            headerEl.id = 'app-header';
            document.body.insertBefore(headerEl, document.body.firstChild);
        }
        
        const currentPage = this.getCurrentPage();
        
        headerEl.innerHTML = `
            <nav class="site-nav" id="siteNav">
                <div class="nav-container">
                    
                    <!-- Logo -->
                    <a href="index.html" class="nav-logo">
                        <span class="nav-logo-text">CareerBridge</span>
                    </a>
                    
                    <!-- Navigation Links -->
                    <div class="nav-links" id="navLinks">
                        ${this.renderNavLinks(currentPage)}
                    </div>
                    
                    <!-- Auth Section -->
                    <div class="nav-auth" id="navAuth">
                        ${this.renderAuthSection()}
                    </div>
                    
                    <!-- Mobile Toggle -->
                    <button class="nav-mobile-toggle" id="navMobileToggle" aria-label="Menu">
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                    
                </div>
            </nav>
        `;
        
        this.injectStyles();
    },
    
    getCurrentPage() {
        const path = window.location.pathname;
        return path.substring(path.lastIndexOf('/') + 1) || 'index.html';
    },
    
    renderNavLinks(currentPage) {
        return this.navItems
            .filter(item => !item.requiresAuth || this.isLoggedIn())
            .map(item => {
                const isActive = currentPage === item.href;
                return `<a href="${item.href}" class="nav-item ${isActive ? 'active' : ''}">${item.text}</a>`;
            })
            .join('');
    },
    
    renderAuthSection() {
        if (this.isLoggedIn()) {
            const user = this.currentUser;
            const role = user.role ? this.capitalizeFirst(user.role) : 'User';
            const isAdmin = user.is_staff;
            
            return `
                <div class="nav-user" id="navUser">
                    <button class="nav-user-btn" id="navUserBtn">
                        <span class="nav-user-avatar">${this.escapeHtml(user.username.charAt(0).toUpperCase())}</span>
                        <span class="nav-user-details">
                            <span class="nav-user-name">${this.escapeHtml(user.username)}${isAdmin ? ' ⭐' : ''}</span>
                            <span class="nav-user-role">${role}</span>
                        </span>
                        <span class="nav-user-caret">▾</span>
                    </button>
                    <div class="nav-dropdown" id="navDropdown">
                        <div class="nav-dropdown-header">
                            <div class="nav-dropdown-avatar">${this.escapeHtml(user.username.charAt(0).toUpperCase())}</div>
                            <div>
                                <div class="nav-dropdown-name">${this.escapeHtml(user.username)}</div>
                                <div class="nav-dropdown-role">${role}${isAdmin ? ' • Admin' : ''}</div>
                            </div>
                        </div>
                        <div class="nav-dropdown-divider"></div>
                        <a href="profile.html" class="nav-dropdown-item">👤 Profile</a>
                        <div class="nav-dropdown-divider"></div>
                        <button class="nav-dropdown-item nav-logout-btn" id="navLogoutBtn">🚪 Logout</button>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="nav-auth-buttons">
                <a href="login.html" class="nav-btn nav-btn-login">Login</a>
                <a href="register.html" class="nav-btn nav-btn-register">Register</a>
            </div>
        `;
    },
    
    // ============================================
    // EVENT LISTENERS
    // ============================================
    
    setupEventListeners() {
        // Mobile menu toggle
        const mobileToggle = document.getElementById('navMobileToggle');
        const navLinks = document.getElementById('navLinks');
        const navAuth = document.getElementById('navAuth');
        
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                mobileToggle.classList.toggle('open');
                navLinks.classList.toggle('mobile-open');
                navAuth.classList.toggle('mobile-open');
            });
        }
        
        // User dropdown
        const userBtn = document.getElementById('navUserBtn');
        const dropdown = document.getElementById('navDropdown');
        
        if (userBtn && dropdown) {
            userBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('open');
            });
            
            document.addEventListener('click', (e) => {
                if (!userBtn.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.remove('open');
                }
            });
            
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') dropdown.classList.remove('open');
            });
        }
        
        // Logout
        const logoutBtn = document.getElementById('navLogoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        // Close mobile menu on link click
        document.querySelectorAll('.nav-item').forEach(link => {
            link.addEventListener('click', () => {
                if (mobileToggle) mobileToggle.classList.remove('open');
                if (navLinks) navLinks.classList.remove('mobile-open');
                if (navAuth) navAuth.classList.remove('mobile-open');
            });
        });
    },
    
    // ============================================
    // UTILITIES
    // ============================================
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },
    
    showNotification(message, type = 'success') {
        const existing = document.querySelector('.site-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `site-notification ${type}`;
        notification.innerHTML = `
            <span class="site-notification-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
            <span class="site-notification-text">${this.escapeHtml(message)}</span>
            <button class="site-notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        requestAnimationFrame(() => notification.classList.add('visible'));
        
        setTimeout(() => {
            notification.classList.remove('visible');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    },
    
    // ============================================
    // STYLES
    // ============================================
    
    injectStyles() {
        if (document.getElementById('header-component-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'header-component-styles';
        style.textContent = `
            
            /* =============================================
               NAVIGATION BAR
               ============================================= */
            
            .site-nav {
                background: #2c3e50;
                position: sticky;
                padding: 15px 0;
                top: 0;
                z-index: 1000;
                box-shadow: 0 2px 15px rgba(0, 0, 0, 0.15);
            }
            
            .nav-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 24px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 70px;
                gap: 40px;
            }
            
            /* ---- Logo ---- */
            
            .nav-logo {
                display: flex;
                align-items: center;
                gap: 12px;
                text-decoration: none;
                color: white;
                flex-shrink: 0;
            }
            
            .nav-logo-text {
				content: url("images/logo2.png") / "CareerBridge";
				background-repeat: no-repeat;
				width: 300px;
                // font-size: 1.45rem;
                // font-weight: 700;
                // letter-spacing: -0.3px;
                // background: linear-gradient(135deg, #FF7E42, #FFB343);
                // -webkit-background-clip: text;
                // -webkit-text-fill-color: transparent;
                // background-clip: text;
            }

			// .nav-logo:hover {
			// 	background: none;
			// }
            
            /* ---- Nav Links ---- */
            
            .nav-links {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .nav-item {
                color: rgba(255, 255, 255, 0.8);
                text-decoration: none;
                padding: 10px 22px;
                border-radius: 8px;
                font-weight: 600;
                font-size: 0.95rem;
                transition: all 0.25s ease;
                white-space: nowrap;
                position: relative;
            }
            
            .nav-item:hover {
                color: #FFB343;
                background: rgba(255, 179, 67, 0.12);
            }
            
            .nav-item.active {
                color: #FFB343;
                background: rgba(255, 179, 67, 0.18);
            }
            
            .nav-item.active::after {
                content: '';
                position: absolute;
                bottom: -2px;
                left: 50%;
                transform: translateX(-50%);
                width: 24px;
                height: 3px;
                background: linear-gradient(135deg, #FF7E42, #FFB343);
                border-radius: 3px;
            }
            
            /* ---- Auth Section ---- */
            
            .nav-auth {
                display: flex;
                align-items: center;
                flex-shrink: 0;
            }
            
            /* Auth Buttons (Guest) */
            
            .nav-auth-buttons {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .nav-btn {
                padding: 10px 24px;
                font-size: 0.9rem;
                font-weight: 600;
                border-radius: 8px;
                text-decoration: none;
                transition: all 0.25s ease;
                cursor: pointer;
                border: none;
                display: inline-block;
            }
            
            .nav-btn-login {
                color: rgba(255, 255, 255, 0.9);
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.15);
            }
            
            .nav-btn-login:hover {
                background: rgba(255, 255, 255, 0.15);
                color: white;
                border-color: rgba(255, 255, 255, 0.3);
            }
            
            .nav-btn-register {
                color: #2c3e50;
                background: linear-gradient(135deg, #FF7E42, #FFB343);
                box-shadow: 0 2px 10px rgba(255, 126, 66, 0.3);
            }
            
            .nav-btn-register:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 20px rgba(255, 126, 66, 0.4);
            }
            
            /* ---- User Menu (Logged In) ---- */
            
            .nav-user {
                position: relative;
            }
            
            .nav-user-btn {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px 16px 8px 8px;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 50px;
                cursor: pointer;
                transition: all 0.25s ease;
                color: white;
                font-family: inherit;
            }
            
            .nav-user-btn:hover {
                background: rgba(255, 255, 255, 0.15);
                border-color: rgba(255, 179, 67, 0.3);
            }
            
            .nav-user-avatar {
                width: 36px;
                height: 36px;
                background: linear-gradient(135deg, #FF7E42, #FFB343);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 0.95rem;
                flex-shrink: 0;
            }
            
            .nav-user-details {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                line-height: 1.3;
            }
            
            .nav-user-name {
                font-weight: 600;
                font-size: 0.9rem;
                color: white;
            }
            
            .nav-user-role {
                font-size: 0.75rem;
                color: rgba(255, 255, 255, 0.65);
            }
            
            .nav-user-caret {
                font-size: 0.7rem;
                color: rgba(255, 255, 255, 0.5);
                transition: transform 0.2s ease;
            }
            
            .nav-user-btn:hover .nav-user-caret {
                transform: translateY(2px);
            }
            
            /* ---- User Dropdown ---- */
            
            .nav-dropdown {
                position: absolute;
                top: calc(100% + 12px);
                right: 0;
                min-width: 250px;
                background: white;
                border-radius: 14px;
                box-shadow: 0 15px 50px rgba(0, 0, 0, 0.18);
                opacity: 0;
                visibility: hidden;
                transform: translateY(-8px) scale(0.98);
                transition: all 0.2s ease;
                overflow: hidden;
                z-index: 1001;
            }
            
            .nav-dropdown.open {
                opacity: 1;
                visibility: visible;
                transform: translateY(0) scale(1);
            }
            
            .nav-dropdown-header {
                display: flex;
                align-items: center;
                gap: 14px;
                padding: 18px 20px;
                background: linear-gradient(135deg, rgba(255, 126, 66, 0.08), rgba(255, 179, 67, 0.08));
            }
            
            .nav-dropdown-avatar {
                width: 46px;
                height: 46px;
                background: linear-gradient(135deg, #FF7E42, #FFB343);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 1.2rem;
                flex-shrink: 0;
            }
            
            .nav-dropdown-name {
                font-weight: 700;
                color: #2c3e50;
                font-size: 1rem;
            }
            
            .nav-dropdown-role {
                font-size: 0.85rem;
                color: #888;
                margin-top: 2px;
            }
            
            .nav-dropdown-divider {
                height: 1px;
                background: #f0f0f0;
            }
            
            .nav-dropdown-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px 20px;
                color: #444;
                text-decoration: none;
                font-size: 0.95rem;
                transition: all 0.2s ease;
                cursor: pointer;
                border: none;
                background: none;
                width: 100%;
                text-align: left;
                font-family: inherit;
            }
            
            .nav-dropdown-item:hover {
                background: #f8f9fa;
                color: #FF7E42;
            }
            
            .nav-logout-btn {
                color: #e74c3c;
            }
            
            .nav-logout-btn:hover {
                background: #fff5f5;
                color: #c0392b;
            }
            
            /* ---- Mobile Menu Toggle ---- */
            
            .nav-mobile-toggle {
                display: none;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: 5px;
                width: 42px;
                height: 42px;
                padding: 0;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.25s ease;
            }
            
            .nav-mobile-toggle:hover {
                background: rgba(255, 255, 255, 0.15);
            }
            
            .nav-mobile-toggle span {
                display: block;
                width: 20px;
                height: 2px;
                background: white;
                border-radius: 2px;
                transition: all 0.3s ease;
            }
            
            .nav-mobile-toggle.open span:nth-child(1) {
                transform: rotate(45deg) translate(5px, 5px);
            }
            
            .nav-mobile-toggle.open span:nth-child(2) {
                opacity: 0;
                transform: scaleX(0);
            }
            
            .nav-mobile-toggle.open span:nth-child(3) {
                transform: rotate(-45deg) translate(5px, -5px);
            }
            
            /* =============================================
               NOTIFICATION
               ============================================= */
            
            .site-notification {
                position: fixed;
                top: 85px;
                right: 24px;
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px 20px;
                border-radius: 12px;
                font-size: 0.95rem;
                font-weight: 500;
                box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
                z-index: 10000;
                transform: translateX(120%);
                transition: transform 0.35s cubic-bezier(0.68, -0.3, 0.265, 1.2);
                max-width: 380px;
            }
            
            .site-notification.visible {
                transform: translateX(0);
            }
            
            .site-notification.success {
                background: linear-gradient(135deg, #27ae60, #2ecc71);
                color: white;
            }
            
            .site-notification.error {
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                color: white;
            }
            
            .site-notification.info {
                background: linear-gradient(135deg, #FF7E42, #FFB343);
                color: white;
            }
            
            .site-notification-icon {
                font-size: 1.2rem;
                font-weight: bold;
                flex-shrink: 0;
            }
            
            .site-notification-text {
                flex: 1;
                line-height: 1.4;
            }
            
            .site-notification-close {
                background: none;
                border: none;
                color: inherit;
                font-size: 1.3rem;
                cursor: pointer;
                opacity: 0.7;
                padding: 0;
                line-height: 1;
                flex-shrink: 0;
                transition: opacity 0.2s;
            }
            
            .site-notification-close:hover {
                opacity: 1;
            }
            
            /* =============================================
               RESPONSIVE
               ============================================= */
            
            @media (max-width: 950px) {
                .nav-container {
                    gap: 20px;
                }
                
                .nav-item {
                    padding: 10px 14px;
                    font-size: 0.9rem;
                }
            }
            
            @media (max-width: 768px) {
                .nav-container {
                    height: 64px;
                    padding: 0 16px;
                    flex-wrap: wrap;
                    gap: 0;
                }
                
                .nav-mobile-toggle {
                    display: flex;
                    order: 3;
                }
                
                /* Nav Links - Mobile */
                .nav-links {
                    display: none;
                    width: 100%;
                    flex-direction: column;
                    gap: 6px;
                    padding: 16px 0;
                    order: 4;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .nav-links.mobile-open {
                    display: flex;
                    background-color: slategray;
                    border-radius: 1rem;
                }
                
                .nav-item {
                    width: 100%;
                    text-align: left;
                    padding: 14px 18px;
                    border-radius: 10px;
                }
                
                .nav-item.active::after {
                    display: none;
                }
                
                /* Auth - Mobile */
                .nav-auth {
                    display: none;
                    width: 100%;
                    padding: 8px 0 16px;
                    order: 5;
                }
                
                .nav-auth.mobile-open {
                    display: flex;
                    background-color: slategray;
                    border-radius: 1rem;
                }
                .nav-auth-buttons {
                    width: 100%;
                    flex-direction: column;
                    gap: 10px;
                }
                
                .nav-btn {
                    width: 100%;
                    text-align: center;
                    padding: 14px 24px;
                }
                
                .nav-user {
                    width: 100%;
                }
                
                .nav-user-btn {
                    width: 100%;
                    border-radius: 12px;
                    padding: 12px 16px;
                }
                
                .nav-dropdown {
                    position: static;
                    width: 100%;
                    margin-top: 10px;
                    border-radius: 12px;
                    box-shadow: none;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    transform: none;
                    max-height: 0;
                    overflow: hidden;
                }
                
                .nav-dropdown.open {
                    max-height: 400px;
                    opacity: 1;
                    visibility: visible;
                }
                
                /* Notification - Mobile */
                .site-notification {
                    left: 16px;
                    right: 16px;
                    top: auto;
                    bottom: 24px;
                    max-width: none;
                }
            }
        `;
        
        document.head.appendChild(style);
    }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    Header.init();
});

// Make globally available
window.Header = Header;