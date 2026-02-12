/**
 * Dashboard Page Handler for CareerBridge Alumni Forum
 * 
 * Role-based access:
 * - Student: Can view comments, explore journeys, post comments
 * - Alumni: Can post journeys, view own posts and comments
 * - Admin: Full access (same as alumni + admin features)
 */

const POSTS_API = "http://localhost:8000/api/posts/";
const AUTH_API = "http://localhost:8000/api/auth/";

class Dashboard {
    constructor() {
        this.user = null;
        this.userPosts = [];
        this.userComments = [];
        
        this.init();
    }
    
    /**
     * Initialize dashboard
     */
    async init() {
        await this.waitForHeader();
        
        if (!this.checkAuth()) return;
        
        this.user = this.getUser();
        
        if (!this.user) {
            this.showAuthGate();
            return;
        }
        
        this.showDashboard();
        this.populateWelcome();
        this.setupRoleBasedUI();
        await this.loadData();
        this.setupFormHandlers();
    }
    
    /**
     * Wait for Header to be ready
     */
    async waitForHeader() {
        return new Promise(resolve => {
            const check = setInterval(() => {
                if (window.Header && Header.initialized) {
                    clearInterval(check);
                    resolve();
                }
            }, 50);
            setTimeout(() => { clearInterval(check); resolve(); }, 3000);
        });
    }
    
    // ============================================
    // AUTH & USER
    // ============================================
    
    getToken() {
        return localStorage.getItem('authToken');
    }
    
    getAuthHeaders() {
        const token = this.getToken();
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Token ${token}`;
        return headers;
    }
    
    getUser() {
        // Try Header first
        if (window.Header && Header.currentUser) return Header.currentUser;
        // Then localStorage
        try {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        } catch (e) {
            return null;
        }
    }
    
    checkAuth() {
        const token = this.getToken();
        if (!token) {
            this.showAuthGate();
            return false;
        }
        return true;
    }
    
    /**
     * Check if user can post journeys (alumni or admin only)
     */
    canPostJourney() {
        if (!this.user) return false;
        const role = (this.user.role || '').toLowerCase();
        return role === 'alumni' || role === 'admin' || this.user.is_staff;
    }
    
    /**
     * Check if user is a student
     */
    isStudent() {
        if (!this.user) return false;
        const role = (this.user.role || '').toLowerCase();
        return role === 'student';
    }
    
    // ============================================
    // UI VISIBILITY
    // ============================================
    
    showAuthGate() {
        document.getElementById('authGate').style.display = 'flex';
        document.getElementById('dashboardContent').style.display = 'none';
    }
    
    showDashboard() {
        document.getElementById('authGate').style.display = 'none';
        document.getElementById('dashboardContent').style.display = 'block';
    }
    
    /**
     * Setup role-based UI visibility
     */
    setupRoleBasedUI() {
        const postJourneyCard = document.getElementById('postJourneyCard');
        const studentInfoCard = document.getElementById('studentInfoCard');
        const myPostsCard = document.getElementById('myPostsCard');
        
        if (this.canPostJourney()) {
            // Alumni / Admin - show post form and my posts
            postJourneyCard.style.display = 'block';
            myPostsCard.style.display = 'block';
            studentInfoCard.style.display = 'none';
            
            // Pre-fill name
            const nameInput = document.getElementById('postName');
            if (nameInput) {
                const fullName = [this.user.first_name, this.user.last_name].filter(Boolean).join(' ');
                nameInput.value = fullName || this.user.username;
            }
        } else {
            // Student - show student info, hide post form and my posts
            postJourneyCard.style.display = 'none';
            myPostsCard.style.display = 'none';
            studentInfoCard.style.display = 'block';
        }
    }
    
    // ============================================
    // WELCOME BANNER
    // ============================================
    
    populateWelcome() {
        const user = this.user;
        
        // Avatar
        const avatar = document.getElementById('welcomeAvatar');
        if (avatar) avatar.textContent = user.username.charAt(0).toUpperCase();
        
        // Name
        const name = document.getElementById('welcomeName');
        if (name) {
            const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
            name.textContent = fullName || user.username;
        }
        
        // Role
        const role = document.getElementById('welcomeRole');
        if (role) {
            let roleText = this.capitalizeFirst(user.role || 'User');
            if (user.is_staff) roleText += ' • Admin';
            role.textContent = roleText;
        }
        
        // Subtitle
        const subtitle = document.getElementById('welcomeSubtitle');
        if (subtitle) {
            if (this.canPostJourney()) {
                subtitle.textContent = 'Share your career journey to inspire and guide students.';
            } else {
                subtitle.textContent = 'Explore career journeys and connect with alumni through comments.';
            }
        }
    }
    
    /**
     * Render stats in welcome banner
     */
    renderStats() {
        const statsContainer = document.getElementById('welcomeStats');
        if (!statsContainer) return;
        
        if (this.canPostJourney()) {
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <span class="stat-number">${this.userPosts.length}</span>
                    <span class="stat-label">Journey Posts</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${this.userComments.length}</span>
                    <span class="stat-label">Comments</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${this.getTotalLikes()}</span>
                    <span class="stat-label">Total Likes</span>
                </div>
            `;
        } else {
            statsContainer.innerHTML = `
                <div class="stat-item">
                    <span class="stat-number">${this.userComments.length}</span>
                    <span class="stat-label">Comments</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number">—</span>
                    <span class="stat-label">Keep Exploring!</span>
                </div>
            `;
        }
    }
    
    getTotalLikes() {
        return this.userPosts.reduce((total, post) => total + (post.likes || 0), 0);
    }
    
    // ============================================
    // LOAD DATA
    // ============================================
    
    async loadData() {
        await Promise.all([
            this.loadUserPosts(),
            this.loadUserComments()
        ]);
        
        this.renderStats();
    }
    
    /**
     * Load posts created by the current user
     */
    async loadUserPosts() {
        if (!this.canPostJourney()) return;
        
        try {
            const response = await fetch(POSTS_API, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });
            
            if (!response.ok) throw new Error('Failed to fetch posts');
            
            const allPosts = await response.json();
            
            // Filter by current user
            const username = this.user.username.toLowerCase();
            this.userPosts = allPosts.filter(post => {
                // Match by user ID if available, otherwise by name
                if (post.user === this.user.id) return true;
                if (post.name && post.name.toLowerCase() === username) return true;
                return false;
            });
            
            this.renderUserPosts();
            
            // Update badge
            const badge = document.getElementById('postCountBadge');
            if (badge) badge.textContent = this.userPosts.length;
            
        } catch (error) {
            console.error('Error loading posts:', error);
            const container = document.getElementById('myPostsList');
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">⚠️</div>
                        <h4>Error loading posts</h4>
                        <p>Please check your connection and try again.</p>
                    </div>
                `;
            }
        }
    }
    
    /**
     * Load comments made by the current user
     */
    async loadUserComments() {
        try {
            const response = await fetch(`${POSTS_API}my-comments/`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });
            
            if (response.ok) {
                this.userComments = await response.json();
            } else if (response.status === 401) {
                this.showAuthGate();
                return;
            } else {
                // Fallback: load all posts and extract user's comments
                await this.loadCommentsFromPosts();
            }
            
            this.renderUserComments();
            
            // Update badge
            const badge = document.getElementById('commentCountBadge');
            if (badge) badge.textContent = this.userComments.length;
            
        } catch (error) {
            console.error('Error loading comments:', error);
            const container = document.getElementById('myCommentsList');
            if (container) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">⚠️</div>
                        <h4>Error loading comments</h4>
                        <p>Please check your connection and try again.</p>
                    </div>
                `;
            }
        }
    }
    
    /**
     * Fallback: Extract user comments from all posts
     */
    async loadCommentsFromPosts() {
        try {
            const response = await fetch(POSTS_API, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });
            
            if (!response.ok) throw new Error('Failed to fetch posts');
            
            const allPosts = await response.json();
            const username = this.user.username.toLowerCase();
            
            this.userComments = [];
            
            allPosts.forEach(post => {
                if (post.comments && Array.isArray(post.comments)) {
                    post.comments.forEach(comment => {
                        if (comment.author_name && comment.author_name.toLowerCase() === username) {
                            this.userComments.push({
                                ...comment,
                                post_title: post.role,
                                post_id: post.id,
                                post_author: post.name
                            });
                        }
                    });
                }
            });
        } catch (error) {
            console.error('Error in fallback comment loading:', error);
            this.userComments = [];
        }
    }
    
    // ============================================
    // RENDER POSTS
    // ============================================
    
    renderUserPosts() {
        const container = document.getElementById('myPostsList');
        if (!container) return;
        
        if (this.userPosts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <h4>No journey posts yet</h4>
                    <p>Share your first career journey to help students!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.userPosts.map(post => `
            <div class="my-post-item">
                <div class="my-post-header">
                    <span class="my-post-role">${this.escapeHtml(post.role)}</span>
                    <span class="my-post-category">${this.escapeHtml(post.category_display || post.category || '')}</span>
                </div>
                <p class="my-post-excerpt">${this.escapeHtml(post.experience)}</p>
                <div class="my-post-footer">
                    <div class="my-post-stats">
                        <span class="my-post-stat">❤️ ${post.likes || 0}</span>
                        <span class="my-post-stat">💬 ${post.comments ? post.comments.length : (post.comments_count || 0)}</span>
                        <span class="my-post-stat">📅 ${this.formatDate(post.created_at)}</span>
                    </div>
                    <a href="explore.html" class="my-post-link">View →</a>
                </div>
            </div>
        `).join('');
    }
    
    // ============================================
    // RENDER COMMENTS
    // ============================================
    
    renderUserComments() {
        const container = document.getElementById('myCommentsList');
        if (!container) return;
        
        if (this.userComments.length === 0) {
            const isStudentUser = this.isStudent();
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💬</div>
                    <h4>No comments yet</h4>
                    <p>${isStudentUser
                        ? 'Explore career journeys and share your thoughts!'
                        : 'Start engaging with the community by commenting on posts.'
                    }</p>
                    <a href="explore.html">🔍 Explore Journeys</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.userComments.map(comment => {
            const postTitle = comment.post_title || 'a journey post';
            const postId = comment.post_id || comment.post;
            
            return `
                <div class="my-comment-item">
                    <div class="my-comment-context">
                        💬 On <a href="explore.html">${this.escapeHtml(postTitle)}</a>
                        ${comment.post_author ? ` by ${this.escapeHtml(comment.post_author)}` : ''}
                    </div>
                    <p class="my-comment-text">${this.escapeHtml(comment.content)}</p>
                    <div class="my-comment-footer">
                        <span class="my-comment-date">📅 ${this.formatDate(comment.created_at)}</span>
                        ${comment.is_edited ? '<span class="my-comment-edited">(edited)</span>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // ============================================
    // FORM HANDLERS
    // ============================================
    
    setupFormHandlers() {
        // Post form (Alumni & Admin only)
        const postForm = document.getElementById('postForm');
        if (postForm && this.canPostJourney()) {
            postForm.addEventListener('submit', (e) => this.handlePostSubmit(e));
        }
        
        // Experience character counter
        const expTextarea = document.getElementById('postExperience');
        if (expTextarea) {
            expTextarea.setAttribute('maxlength', '2000');
            expTextarea.addEventListener('input', () => {
                const count = expTextarea.value.length;
                const counter = document.getElementById('expCharCount');
                const counterParent = counter?.parentElement;
                
                if (counter) counter.textContent = count;
                if (counterParent) {
                    counterParent.className = 'char-count';
                    if (count >= 1800) counterParent.classList.add('at-limit');
                    else if (count >= 1500) counterParent.classList.add('near-limit');
                }
            });
        }
    }
    
    async handlePostSubmit(e) {
        e.preventDefault();
        
        // Double check permission
        if (!this.canPostJourney()) {
            this.showNotification('Only alumni and admins can post career journeys.', 'error');
            return;
        }
        
        const submitBtn = document.getElementById('submitPostBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        const name = document.getElementById('postName').value.trim();
        const role = document.getElementById('postRole').value.trim();
        const company = document.getElementById('postCompany').value.trim();
        const category = document.getElementById('postCategory').value;
        const skills = document.getElementById('postSkills').value.trim();
        const experience = document.getElementById('postExperience').value.trim();
        
        // Validate
        if (!name || !role || !category || !experience) {
            this.showNotification('Please fill in all required fields.', 'error');
            return;
        }
        
        if (experience.length < 20) {
            this.showNotification('Please write at least 20 characters for your experience.', 'error');
            return;
        }
        
        // Disable button
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-flex';
        
        const postData = {
            name: name,
            role: role,
            company: company,
            category: category,
            skills: skills,
            experience: experience
        };
        
        try {
            const response = await fetch(POSTS_API, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(postData)
            });
            
            if (response.status === 401) {
                this.showNotification('Session expired. Please login again.', 'error');
                this.showAuthGate();
                return;
            }
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || error.detail || 'Failed to create post');
            }
            
            const newPost = await response.json();
            
            // Reset form
            e.target.reset();
            
            // Re-fill the name
            const fullName = [this.user.first_name, this.user.last_name].filter(Boolean).join(' ');
            document.getElementById('postName').value = fullName || this.user.username;
            
            // Reset character counter
            const counter = document.getElementById('expCharCount');
            if (counter) counter.textContent = '0';
            
            // Reload posts
            await this.loadUserPosts();
            this.renderStats();
            
            this.showNotification('Career journey shared successfully! 🎉', 'success');
            
        } catch (error) {
            console.error('Error creating post:', error);
            this.showNotification(error.message || 'Error submitting post. Please try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }
    
    // ============================================
    // UTILITIES
    // ============================================
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    
    formatDate(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
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
    new Dashboard();
});