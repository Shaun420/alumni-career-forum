// API URLs
const API_URL = "http://localhost:8000/api/posts/";
const AUTH_API_URL = "http://localhost:8000/api/auth/";

// Current user state
let currentUser = null;

// ============================================
// TOKEN MANAGEMENT
// ============================================

// Get token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Get authorization headers for API requests
function getAuthHeaders() {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
    };
    
    if (token) {
        headers['Authorization'] = `Token ${token}`;
    }
    
    return headers;
}

// Clear authentication data
function clearAuth() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    currentUser = null;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show notification message
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) existingNotification.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${getNotificationIcon(type)}</span>
            <span class="notification-message">${escapeHtml(message)}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    // Add notification styles if not present
    addNotificationStyles();
    
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => notification.classList.add('show'));
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 5000);
}

function getNotificationIcon(type) {
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
    return icons[type] || icons.info;
}

function addNotificationStyles() {
    if (document.getElementById('notification-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            transform: translateX(120%);
            transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            max-width: 400px;
        }
        .notification.show {
            transform: translateX(0);
        }
        .notification-content {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            color: white;
        }
        .notification.success .notification-content {
            background: linear-gradient(135deg, #28a745, #20c997);
        }
        .notification.error .notification-content {
            background: linear-gradient(135deg, #dc3545, #c82333);
        }
        .notification.warning .notification-content {
            background: linear-gradient(135deg, #ffc107, #e0a800);
            color: #333;
        }
        .notification.info .notification-content {
            background: linear-gradient(135deg, #17a2b8, #138496);
        }
        .notification-icon { font-size: 1.3rem; font-weight: bold; }
        .notification-message { flex: 1; font-size: 0.95rem; }
        .notification-close {
            background: none;
            border: none;
            color: inherit;
            font-size: 1.4rem;
            cursor: pointer;
            opacity: 0.8;
            padding: 0;
        }
        .notification-close:hover { opacity: 1; }
        @media (max-width: 480px) {
            .notification { left: 15px; right: 15px; max-width: none; }
        }
    `;
    document.head.appendChild(style);
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

// Check if user is logged in using token
async function checkAuthStatus() {
    const token = getAuthToken();
    
    if (!token) {
        console.log('No token found, user not authenticated');
        currentUser = null;
        updateAuthUI();
        return null;
    }
    
    console.log('Token found, verifying...');
    
    try {
        const response = await fetch(`${AUTH_API_URL}profile/`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            currentUser = await response.json();
            console.log('User authenticated:', currentUser.username);
            // Update localStorage with fresh user data
            localStorage.setItem('user', JSON.stringify(currentUser));
            updateAuthUI();
            return currentUser;
        } else if (response.status === 401) {
            console.log('Token invalid or expired');
            clearAuth();
            updateAuthUI();
            return null;
        }
    } catch (error) {
        console.error('Auth check error:', error);
    }
    
    currentUser = null;
    updateAuthUI();
    return null;
}

// Update authentication UI in navigation
function updateAuthUI() {
    const authLinks = document.getElementById('authLinks');
    if (!authLinks) return;
    
    if (currentUser) {
        const isAdmin = currentUser.is_staff ? ' <span class="admin-badge">(Admin)</span>' : '';
        const roleDisplay = currentUser.role ? ` • ${capitalizeFirst(currentUser.role)}` : '';
        
        authLinks.innerHTML = `
            <div class="user-menu">
                <span class="user-info">
                    <span class="user-avatar">${escapeHtml(currentUser.username.charAt(0).toUpperCase())}</span>
                    <span class="user-details">
                        <span class="user-name">${escapeHtml(currentUser.username)}${isAdmin}</span>
                        <span class="user-role">${roleDisplay}</span>
                    </span>
                </span>
                <div class="user-actions">
                    <a href="dashboard.html" class="nav-btn">Dashboard</a>
                    <button id="logoutBtn" class="nav-btn logout-btn">Logout</button>
                </div>
            </div>
        `;
        
        // Add logout handler
        document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    } else {
        authLinks.innerHTML = `
            <a href="login.html" class="nav-btn">Login</a>
            <a href="register.html" class="nav-btn btn-primary">Register</a>
        `;
    }
    
    // Update comment forms based on auth status
    updateCommentFormsVisibility();
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Update comment forms visibility based on auth status
function updateCommentFormsVisibility() {
    const postCards = document.querySelectorAll('.post-card');
    
    postCards.forEach(card => {
        const postId = card.dataset.postId;
        const existingForm = card.querySelector('.comment-form-container, .comment-login-prompt');
        
        if (existingForm && postId) {
            existingForm.outerHTML = createCommentFormHtml(postId);
            
            // Re-attach form listener
            const newForm = card.querySelector('.comment-form');
            if (newForm) {
                newForm.addEventListener('submit', handleCommentSubmit);
            }
        }
    });
}

// Handle logout
async function handleLogout(e) {
    if (e) e.preventDefault();
    
    const token = getAuthToken();
    
    if (token) {
        try {
            await fetch(`${AUTH_API_URL}logout/`, {
                method: 'POST',
                headers: getAuthHeaders()
            });
            console.log('Logout request sent');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    
    // Clear auth regardless of API response
    clearAuth();
    showNotification('Logged out successfully', 'success');
    updateAuthUI();
    
    // Refresh posts to update comment UI
    fetchAndRenderPosts();
}

// ============================================
// POSTS FUNCTIONS
// ============================================

// Fetch and render posts with comments
async function fetchAndRenderPosts(filter = "all") {
    const postsContainer = document.getElementById("postsContainer");
    
    if (!postsContainer) return;
    
    postsContainer.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading posts...</p>
        </div>
    `;
    
    try {
        const url = filter === "all" ? API_URL : `${API_URL}?category=${filter}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const posts = await response.json();
        renderPosts(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        postsContainer.innerHTML = `
            <div class="error-container">
                <div class="error-icon">⚠️</div>
                <h3>Error loading posts</h3>
                <p>Please make sure the Django server is running at ${API_URL}</p>
                <button onclick="fetchAndRenderPosts()" class="retry-btn">🔄 Retry</button>
            </div>
        `;
    }
}

// Render posts to DOM
function renderPosts(posts) {
    const postsContainer = document.getElementById("postsContainer");
    postsContainer.innerHTML = "";

    if (!posts || posts.length === 0) {
        postsContainer.innerHTML = `
            <div class="no-posts">
                <div class="no-posts-icon">📝</div>
                <h3>No posts found</h3>
                <p>Be the first to share your career experience!</p>
            </div>
        `;
        return;
    }

    posts.forEach(post => {
        const postCard = createPostCard(post);
        postsContainer.appendChild(postCard);
    });
}

// Create a post card with comments
function createPostCard(post) {
    const card = document.createElement("div");
    card.classList.add("post-card");
    card.dataset.postId = post.id;
    
    const commentsHtml = renderComments(post.comments || [], post.id);
    const commentFormHtml = createCommentFormHtml(post.id);
    
    // Skills tags
    const skillsHtml = post.skills_list && post.skills_list.length > 0
        ? `<div class="post-skills">
            ${post.skills_list.map(skill => `<span class="skill-tag">${escapeHtml(skill)}</span>`).join('')}
           </div>`
        : '';
    
    card.innerHTML = `
        <div class="post-header">
            <div class="post-author-avatar">${escapeHtml(post.name.charAt(0).toUpperCase())}</div>
            <div class="post-author-info">
                <h3>${escapeHtml(post.name)}</h3>
                <p class="post-role">${escapeHtml(post.role)}${post.company ? ` at ${escapeHtml(post.company)}` : ''}</p>
                <span class="post-category-badge">${escapeHtml(post.category_display || post.category)}</span>
            </div>
        </div>
        <div class="post-content">
            <p>${escapeHtml(post.experience)}</p>
            ${skillsHtml}
        </div>
        <div class="post-actions">
            <button class="like-btn" onclick="likePost(${post.id})" title="Like this post">
                ❤️ <span id="likes-${post.id}">${post.likes || 0}</span>
            </button>
            <span class="post-date">📅 ${formatDate(post.created_at)}</span>
        </div>
        <div class="comments-section">
            <h4>💬 Comments (<span id="comment-count-${post.id}">${post.comments ? post.comments.length : 0}</span>)</h4>
            <div class="comments-list" id="comments-${post.id}">
                ${commentsHtml}
            </div>
            ${commentFormHtml}
        </div>
    `;
    
    // Add event listener for comment form submission
    const form = card.querySelector('.comment-form');
    if (form) {
        form.addEventListener('submit', handleCommentSubmit);
    }
    
    return card;
}

// Like a post
async function likePost(postId) {
    try {
        const response = await fetch(`${API_URL}${postId}/like/`, {
            method: 'POST',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            const likesElement = document.getElementById(`likes-${postId}`);
            if (likesElement) {
                likesElement.textContent = data.likes;
                // Add animation
                likesElement.parentElement.classList.add('liked');
                setTimeout(() => likesElement.parentElement.classList.remove('liked'), 300);
            }
        }
    } catch (error) {
        console.error('Error liking post:', error);
        showNotification('Error liking post', 'error');
    }
}

// ============================================
// COMMENTS FUNCTIONS
// ============================================

// Create comment form HTML
function createCommentFormHtml(postId) {
    if (!currentUser) {
        return `
            <div class="comment-login-prompt">
                <p>🔒 Please <a href="login.html">login</a> to post a comment.</p>
            </div>
        `;
    }
    
    // Pre-select user's role if available
    const userRole = currentUser.role || '';
    
    return `
        <div class="comment-form-container">
            <h5>💭 Add a Comment</h5>
            <form class="comment-form" data-post-id="${postId}">
                <div class="comment-user-info">
                    <span class="comment-avatar">${escapeHtml(currentUser.username.charAt(0).toUpperCase())}</span>
                    <span class="comment-as">Commenting as <strong>${escapeHtml(currentUser.username)}</strong></span>
                    ${currentUser.is_staff ? '<span class="admin-indicator">👑 Admin</span>' : ''}
                </div>
                <div class="form-group">
                    <select class="comment-role" required>
                        <option value="">Select Your Role</option>
                        <option value="student" ${userRole === 'student' ? 'selected' : ''}>Student</option>
                        <option value="alumni" ${userRole === 'alumni' ? 'selected' : ''}>Alumni</option>
                    </select>
                </div>
                <div class="form-group">
                    <textarea class="comment-content" placeholder="Share your thoughts, ask questions..." required minlength="5" rows="3"></textarea>
                </div>
                <button type="submit" class="submit-comment-btn">
                    <span class="btn-text">Post Comment</span>
                    <span class="btn-loading" style="display: none;">Posting...</span>
                </button>
            </form>
        </div>
    `;
}

// Render comments HTML
function renderComments(comments, postId) {
    if (!comments || comments.length === 0) {
        return '<p class="no-comments">No comments yet. Be the first to share your thoughts!</p>';
    }
    
    return comments.map(comment => createCommentHtml(comment, postId)).join('');
}

// Create single comment HTML
function createCommentHtml(comment, postId) {
    const isOwner = currentUser && comment.is_owner;
    const canDelete = currentUser && comment.can_delete;
    const editedBadge = comment.is_edited ? '<span class="edited-badge">(edited)</span>' : '';
    
    let actionButtons = '';
    
    if (isOwner || canDelete) {
        actionButtons = '<div class="comment-actions">';
        
        if (isOwner) {
            actionButtons += `
                <button class="edit-comment-btn" onclick="showEditForm(${postId}, ${comment.id})" title="Edit your comment">
                    ✏️ Edit
                </button>
            `;
        }
        
        if (canDelete) {
            const deleteLabel = currentUser.is_staff && !isOwner ? '🗑️ Admin Delete' : '🗑️ Delete';
            actionButtons += `
                <button class="delete-comment-btn" onclick="deleteComment(${postId}, ${comment.id})" title="Delete comment">
                    ${deleteLabel}
                </button>
            `;
        }
        
        actionButtons += '</div>';
    }
    
    return `
        <div class="comment" id="comment-${comment.id}" data-comment-id="${comment.id}">
            <div class="comment-header">
                <div class="comment-author">
                    <span class="comment-avatar">${escapeHtml(comment.author_name.charAt(0).toUpperCase())}</span>
                    <span class="comment-name">${escapeHtml(comment.author_name)}</span>
                    <span class="comment-role-badge ${comment.author_role}">${escapeHtml(comment.author_role)}</span>
                    ${editedBadge}
                </div>
                ${actionButtons}
            </div>
            <div class="comment-body" id="comment-body-${comment.id}">
                <p class="comment-text">${escapeHtml(comment.content)}</p>
            </div>
            <div class="comment-footer">
                <span class="comment-date">📅 ${formatDate(comment.created_at)}</span>
            </div>
        </div>
    `;
}

// Handle comment submission
async function handleCommentSubmit(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showNotification('Please login to post a comment.', 'error');
        window.location.href = 'login.html';
        return;
    }
    
    const form = e.target;
    const postId = form.dataset.postId;
    const roleSelect = form.querySelector('.comment-role');
    const contentTextarea = form.querySelector('.comment-content');
    const submitBtn = form.querySelector('.submit-comment-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // Validate
    if (!roleSelect.value) {
        showNotification('Please select your role.', 'error');
        roleSelect.focus();
        return;
    }
    
    if (contentTextarea.value.trim().length < 5) {
        showNotification('Comment must be at least 5 characters.', 'error');
        contentTextarea.focus();
        return;
    }
    
    // Disable button during submission
    submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'inline';
    
    const commentData = {
        author_role: roleSelect.value,
        content: contentTextarea.value.trim()
    };
    
    try {
        const response = await fetch(`${API_URL}${postId}/comments/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(commentData)
        });

        if (response.status === 401) {
            showNotification('Session expired. Please login again.', 'error');
            clearAuth();
            updateAuthUI();
            window.location.href = 'login.html';
            return;
        }

        if (response.status === 403) {
            showNotification('You do not have permission to post comments.', 'error');
            return;
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || error.detail || 'Failed to post comment');
        }

        // Success - refresh comments
        await refreshPostComments(postId);
        
        // Reset form
        form.reset();
        
        showNotification('Comment posted successfully! 🎉', 'success');
        
    } catch (error) {
        console.error('Error posting comment:', error);
        showNotification(error.message || 'Error posting comment. Please try again.', 'error');
    } finally {
        submitBtn.disabled = false;
        if (btnText) btnText.style.display = 'inline';
        if (btnLoading) btnLoading.style.display = 'none';
    }
}

// Show edit form for a comment
function showEditForm(postId, commentId) {
    const commentElement = document.getElementById(`comment-${commentId}`);
    const commentBody = document.getElementById(`comment-body-${commentId}`);
    const currentContent = commentBody.querySelector('.comment-text').textContent;
    const currentRoleBadge = commentElement.querySelector('.comment-role-badge');
    const currentRole = currentRoleBadge ? currentRoleBadge.textContent.toLowerCase() : 'student';
    
    // Store original values for cancel
    commentBody.dataset.originalContent = currentContent;
    commentBody.dataset.originalRole = currentRole;
    
    commentBody.innerHTML = `
        <form class="edit-comment-form" id="edit-form-${commentId}">
            <div class="form-group">
                <select class="comment-role" required>
                    <option value="student" ${currentRole === 'student' ? 'selected' : ''}>Student</option>
                    <option value="alumni" ${currentRole === 'alumni' ? 'selected' : ''}>Alumni</option>
                </select>
            </div>
            <div class="form-group">
                <textarea class="comment-content" required minlength="5" rows="3">${escapeHtml(currentContent)}</textarea>
            </div>
            <div class="edit-form-buttons">
                <button type="submit" class="save-edit-btn">💾 Save</button>
                <button type="button" class="cancel-edit-btn" onclick="cancelEdit(${postId}, ${commentId})">❌ Cancel</button>
            </div>
        </form>
    `;
    
    // Focus on textarea
    commentBody.querySelector('.comment-content').focus();
    
    // Add submit handler
    document.getElementById(`edit-form-${commentId}`).addEventListener('submit', (e) => {
        e.preventDefault();
        updateComment(postId, commentId);
    });
}

// Cancel edit and restore original content
function cancelEdit(postId, commentId) {
    const commentBody = document.getElementById(`comment-body-${commentId}`);
    const originalContent = commentBody.dataset.originalContent || '';
    
    commentBody.innerHTML = `<p class="comment-text">${escapeHtml(originalContent)}</p>`;
}

// Update a comment
async function updateComment(postId, commentId) {
    const form = document.getElementById(`edit-form-${commentId}`);
    const roleSelect = form.querySelector('.comment-role');
    const contentTextarea = form.querySelector('.comment-content');
    const saveBtn = form.querySelector('.save-edit-btn');
    
    // Validate
    if (contentTextarea.value.trim().length < 5) {
        showNotification('Comment must be at least 5 characters.', 'error');
        contentTextarea.focus();
        return;
    }
    
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    
    const updateData = {
        author_role: roleSelect.value,
        content: contentTextarea.value.trim()
    };
    
    try {
        const response = await fetch(`${API_URL}${postId}/comments/${commentId}/`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updateData)
        });

        if (response.status === 401) {
            showNotification('Session expired. Please login again.', 'error');
            clearAuth();
            updateAuthUI();
            return;
        }

        if (response.status === 403) {
            showNotification('You can only edit your own comments.', 'error');
            cancelEdit(postId, commentId);
            return;
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update comment');
        }

        await refreshPostComments(postId);
        showNotification('Comment updated successfully! ✏️', 'success');
        
    } catch (error) {
        console.error('Error updating comment:', error);
        showNotification(error.message || 'Error updating comment.', 'error');
        saveBtn.disabled = false;
        saveBtn.textContent = '💾 Save';
    }
}

// Delete a comment
async function deleteComment(postId, commentId) {
    const isAdmin = currentUser && currentUser.is_staff;
    const confirmMessage = isAdmin 
        ? 'Are you sure you want to delete this comment? (Admin action)'
        : 'Are you sure you want to delete your comment?';
    
    if (!confirm(confirmMessage)) return;
    
    try {
        const response = await fetch(`${API_URL}${postId}/comments/${commentId}/`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.status === 401) {
            showNotification('Session expired. Please login again.', 'error');
            clearAuth();
            updateAuthUI();
            return;
        }

        if (response.status === 403) {
            showNotification('You do not have permission to delete this comment.', 'error');
            return;
        }

        if (!response.ok && response.status !== 204) {
            throw new Error('Failed to delete comment');
        }

        await refreshPostComments(postId);
        showNotification('Comment deleted successfully! 🗑️', 'success');
        
    } catch (error) {
        console.error('Error deleting comment:', error);
        showNotification('Error deleting comment. Please try again.', 'error');
    }
}

// Refresh comments for a specific post
async function refreshPostComments(postId) {
    try {
        const response = await fetch(`${API_URL}${postId}/comments/`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch comments');
        }
        
        const comments = await response.json();
        const commentsContainer = document.getElementById(`comments-${postId}`);
        
        if (commentsContainer) {
            commentsContainer.innerHTML = renderComments(comments, postId);
            
            // Update comment count
            const commentCount = document.getElementById(`comment-count-${postId}`);
            if (commentCount) {
                commentCount.textContent = comments.length;
            }
        }
    } catch (error) {
        console.error('Error refreshing comments:', error);
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Explore page loaded');
    console.log('Token exists:', !!getAuthToken());
    
    // Check auth status first
    await checkAuthStatus();
    
    // Then fetch and render posts
    await fetchAndRenderPosts();
    
    // Filter functionality
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            fetchAndRenderPosts(e.target.value);
        });
    }
});

// Make functions globally available for onclick handlers
window.likePost = likePost;
window.showEditForm = showEditForm;
window.cancelEdit = cancelEdit;
window.deleteComment = deleteComment;