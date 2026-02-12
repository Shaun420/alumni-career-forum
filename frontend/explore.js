/**
 * Explore Page - Journey Cards + Detail View
 * 
 * Features:
 * - Grid of journey cards with search and filter
 * - Click card to open detail view
 * - Comments with auto role from user account
 * - Edit/Delete own comments, Admin can delete any
 */

const API_URL = "http://localhost:8000/api/posts/";

// State
let allPosts = [];
let currentFilter = 'all';
let currentSearch = '';
let currentDetailPost = null;

// ============================================
// HELPERS
// ============================================

function getCurrentUser() {
    return window.Header ? Header.currentUser : null;
}

function getAuthHeaders() {
    return window.Header ? Header.getAuthHeaders() : { 'Content-Type': 'application/json' };
}

function isLoggedIn() {
    return window.Header ? Header.isLoggedIn() : false;
}

function showNotification(message, type) {
    if (window.Header) Header.showNotification(message, type);
    else alert(message);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
    });
}

function formatDateTime(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function truncateText(text, maxLength = 120) {
    if (!text || text.length <= maxLength) return text || '';
    return text.substring(0, maxLength).trim() + '...';
}

function getSkillsList(post) {
    if (post.skills_list && Array.isArray(post.skills_list) && post.skills_list.length > 0) {
        return post.skills_list;
    }
    if (post.skills && typeof post.skills === 'string' && post.skills.trim()) {
        return post.skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
}

// ============================================
// VIEW SWITCHING
// ============================================

function showListView() {
    document.getElementById('exploreView').style.display = 'block';
    document.getElementById('detailView').style.display = 'none';
    currentDetailPost = null;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showDetailView(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) {
        showNotification('Post not found.', 'error');
        return;
    }

    currentDetailPost = post;

    document.getElementById('exploreView').style.display = 'none';
    document.getElementById('detailView').style.display = 'block';

    renderDetailView(post);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================
// FETCH POSTS
// ============================================

async function fetchPosts() {
    const grid = document.getElementById('journeyGrid');
    grid.innerHTML = `
        <div class="loading-container">
            <div class="loading-spinner"></div>
            <p>Loading journeys...</p>
        </div>
    `;

    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error('Failed to fetch');

        allPosts = await response.json();
        renderGrid();

    } catch (error) {
        console.error('Error fetching posts:', error);
        grid.innerHTML = `
            <div class="error-container">
                <p>⚠️ Error loading journeys.</p>
                <p>Make sure the server is running.</p>
                <button class="retry-btn" onclick="fetchPosts()">Retry</button>
            </div>
        `;
    }
}

// ============================================
// RENDER GRID (Card List)
// ============================================

function renderGrid() {
    const grid = document.getElementById('journeyGrid');
    let filtered = allPosts;

    // Apply category filter
    if (currentFilter && currentFilter !== 'all') {
        filtered = filtered.filter(p => p.category === currentFilter);
    }

    // Apply search
    if (currentSearch) {
        const q = currentSearch.toLowerCase();
        filtered = filtered.filter(p =>
            (p.name && p.name.toLowerCase().includes(q)) ||
            (p.role && p.role.toLowerCase().includes(q)) ||
            (p.experience && p.experience.toLowerCase().includes(q)) ||
            (p.company && p.company.toLowerCase().includes(q)) ||
            (p.skills && p.skills.toLowerCase().includes(q))
        );
    }

    // Update results count
    const countEl = document.getElementById('resultsCount');
    if (countEl) {
        countEl.textContent = `${filtered.length} journey${filtered.length !== 1 ? 's' : ''} found`;
    }

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div class="empty-grid">
                <div class="empty-grid-icon">🔍</div>
                <h3>No journeys found</h3>
                <p>Try a different filter or search term.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filtered.map(post => createCardHtml(post)).join('');

    // Add click handlers
    grid.querySelectorAll('.journey-card').forEach(card => {
        card.addEventListener('click', () => {
            const postId = parseInt(card.dataset.postId);
            showDetailView(postId);
        });
    });
}

function createCardHtml(post) {
    const skills = getSkillsList(post);
    const skillsHtml = skills.length > 0
        ? `<div class="card-skills">${skills.slice(0, 4).map(s => `<span class="card-skill-tag">${escapeHtml(s)}</span>`).join('')}${skills.length > 4 ? `<span class="card-skill-tag">+${skills.length - 4}</span>` : ''}</div>`
        : '';

    const commentsCount = post.comments ? post.comments.length : (post.comments_count || 0);

    return `
        <div class="journey-card" data-post-id="${post.id}">
            <div class="journey-card-header">
                <div class="card-avatar">${escapeHtml(post.name.charAt(0).toUpperCase())}</div>
                <div class="card-author-info">
                    <div class="card-author-name">${escapeHtml(post.name)}</div>
                    <div class="card-author-company">${post.company ? escapeHtml(post.company) : ''}</div>
                </div>
                <span class="card-category">${escapeHtml(post.category_display || capitalizeFirst(post.category || ''))}</span>
            </div>
            <div class="card-role">${escapeHtml(post.role)}</div>
            <p class="card-excerpt">${escapeHtml(truncateText(post.experience, 140))}</p>
            ${skillsHtml}
            <div class="card-footer">
                <div class="card-stats">
                    <span class="card-stat">❤️ ${post.likes || 0}</span>
                    <span class="card-stat">💬 ${commentsCount}</span>
                </div>
                <span class="card-read-more">Read more →</span>
            </div>
        </div>
    `;
}

// ============================================
// RENDER DETAIL VIEW
// ============================================

function renderDetailView(post) {
    const container = document.getElementById('detailContent');
    const skills = getSkillsList(post);
    const user = getCurrentUser();
    const comments = post.comments || [];

    const skillsHtml = skills.length > 0
        ? `<div class="detail-section">
                <h3 class="detail-section-title">🛠️ Key Skills</h3>
                <div class="detail-skills-list">
                    ${skills.map(s => `<span class="detail-skill">${escapeHtml(s)}</span>`).join('')}
                </div>
           </div>`
        : '';

    container.innerHTML = `
        <div class="detail-card">
            <div class="detail-hero">
                <div class="detail-author-row">
                    <div class="detail-avatar">${escapeHtml(post.name.charAt(0).toUpperCase())}</div>
                    <div class="detail-author-info">
                        <h2>${escapeHtml(post.role)}</h2>
                        <p class="detail-author-company">by ${escapeHtml(post.name)}${post.company ? ` at ${escapeHtml(post.company)}` : ''}</p>
                    </div>
                </div>
                <div class="detail-meta">
                    <span class="detail-meta-tag">${escapeHtml(post.category_display || capitalizeFirst(post.category || ''))}</span>
                    <span class="detail-meta-tag">📅 ${formatDate(post.created_at)}</span>
                    <span class="detail-meta-tag">❤️ ${post.likes || 0} likes</span>
                    <span class="detail-meta-tag">💬 ${comments.length} comments</span>
                </div>
            </div>

            <div class="detail-body">
                <div class="detail-section">
                    <h3 class="detail-section-title">➤ Career Journey</h3>
                    <div class="detail-experience">${escapeHtml(post.experience)}</div>
                </div>

                ${skillsHtml}

                <div class="detail-actions">
                    <button class="detail-like-btn" onclick="likePost(${post.id})">
                        ❤️ Like <span id="detail-likes-${post.id}">${post.likes || 0}</span>
                    </button>
                    <span class="detail-date">Posted on ${formatDateTime(post.created_at)}</span>
                </div>
            </div>
        </div>

        <!-- Comments -->
        <div class="comments-card">
            <div class="comments-header">
                <h3>Comments</h3>
                <span class="comments-count-badge" id="detail-comment-count">${comments.length}</span>
            </div>
            <div class="comments-body">
                <div class="comment-list" id="detail-comment-list">
                    ${renderCommentList(comments, post.id)}
                </div>
                <div class="comment-form-section">
                    ${renderCommentForm(post.id)}
                </div>
            </div>
        </div>
    `;

    // Attach comment form handler
    const commentForm = container.querySelector('.comment-compose-form');
    if (commentForm) {
        commentForm.addEventListener('submit', (e) => handleCommentSubmit(e, post.id));
    }
}

// ============================================
// COMMENTS
// ============================================

function renderCommentList(comments, postId) {
    if (!comments || comments.length === 0) {
        return `
            <div class="comment-empty">
                <div class="comment-empty-icon">💬</div>
                <p>No comments yet. Be the first to share your thoughts!</p>
            </div>
        `;
    }

    return comments.map(comment => renderCommentItem(comment, postId)).join('');
}

function renderCommentItem(comment, postId) {
    const user = getCurrentUser();
    const isOwner = user && comment.is_owner;
    const canDelete = user && comment.can_delete;
    const editedBadge = comment.is_edited ? '<span class="comment-edited-badge">(edited)</span>' : '';

    // Determine role badge
    const role = comment.author_role || 'student';
    const roleBadgeClass = role === 'admin' ? 'admin' : role;

    let actions = '';
    if (isOwner || canDelete) {
        actions = '<div class="comment-actions-group">';
        if (isOwner) {
            actions += `<button class="comment-action-btn" onclick="showEditComment(${postId}, ${comment.id})">✏️ Edit</button>`;
        }
        if (canDelete) {
            const label = user.is_staff && !isOwner ? '🗑️ Admin' : '🗑️';
            actions += `<button class="comment-action-btn delete-btn" onclick="deleteComment(${postId}, ${comment.id})">${label}</button>`;
        }
        actions += '</div>';
    }

    return `
        <div class="comment-item" id="comment-${comment.id}">
            <div class="comment-item-header">
                <div class="comment-author-info">
                    <span class="comment-avatar">${escapeHtml(comment.author_name.charAt(0).toUpperCase())}</span>
                    <span class="comment-author-name">${escapeHtml(comment.author_name)}</span>
                    <span class="comment-role-badge ${roleBadgeClass}">${capitalizeFirst(role)}</span>
                    ${editedBadge}
                </div>
                ${actions}
            </div>
            <div class="comment-body-content" id="comment-body-${comment.id}">
                <p class="comment-text">${escapeHtml(comment.content)}</p>
            </div>
            <div class="comment-item-footer">
                📅 ${formatDateTime(comment.created_at)}
            </div>
        </div>
    `;
}

function renderCommentForm(postId) {
    const user = getCurrentUser();

    if (!user) {
        return `
            <div class="comment-login-prompt">
                🔒 Please <a href="login.html">login</a> to post a comment.
            </div>
        `;
    }

    const userRole = user.role || 'student';
    const roleBadgeClass = userRole === 'admin' ? 'admin' : userRole;

    return `
        <div class="comment-form-title">✏️ Add a Comment</div>
        <form class="comment-compose comment-compose-form" data-post-id="${postId}">
            <div class="comment-compose-header">
                <span class="comment-avatar" style="width:28px;height:28px;font-size:0.75rem;">${escapeHtml(user.username.charAt(0).toUpperCase())}</span>
                <span>Commenting as <strong>${escapeHtml(user.username)}</strong></span>
                <span class="compose-role ${roleBadgeClass}">${capitalizeFirst(userRole)}</span>
            </div>
            <textarea placeholder="Share your thoughts, ask questions, or offer advice..." required minlength="5" rows="3"></textarea>
            <button type="submit" class="comment-submit-btn" id="comment-submit-${postId}">
                Post Comment
            </button>
        </form>
    `;
}

// Submit Comment
async function handleCommentSubmit(e, postId) {
    e.preventDefault();

    const user = getCurrentUser();
    if (!user) {
        showNotification('Please login to comment.', 'error');
        return;
    }

    const form = e.target;
    const textarea = form.querySelector('textarea');
    const submitBtn = form.querySelector('.comment-submit-btn');
    const content = textarea.value.trim();

    if (content.length < 5) {
        showNotification('Comment must be at least 5 characters.', 'error');
        textarea.focus();
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Posting...';

    // Role is taken from user's account, not from a select
    const commentData = {
        author_role: user.role || 'student',
        content: content
    };

    try {
        const response = await fetch(`${API_URL}${postId}/comments/`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(commentData)
        });

        if (response.status === 401) {
            showNotification('Session expired. Please login again.', 'error');
            return;
        }

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || err.detail || 'Failed to post');
        }

        // Refresh comments
        await refreshDetailComments(postId);
        textarea.value = '';
        showNotification('Comment posted! 🎉', 'success');

    } catch (error) {
        console.error('Error posting comment:', error);
        showNotification(error.message || 'Error posting comment.', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Post Comment';
    }
}

// Edit Comment
function showEditComment(postId, commentId) {
    const bodyEl = document.getElementById(`comment-body-${commentId}`);
    const currentText = bodyEl.querySelector('.comment-text').textContent;

    bodyEl.innerHTML = `
        <form class="edit-comment-form" id="edit-form-${commentId}">
            <textarea required minlength="5" rows="3">${escapeHtml(currentText)}</textarea>
            <div class="edit-comment-actions">
                <button type="button" class="edit-cancel-btn" onclick="refreshDetailComments(${postId})">Cancel</button>
                <button type="submit" class="edit-save-btn" id="edit-save-${commentId}">Save</button>
            </div>
        </form>
    `;

    bodyEl.querySelector('textarea').focus();

    document.getElementById(`edit-form-${commentId}`).addEventListener('submit', async (e) => {
        e.preventDefault();
        const textarea = e.target.querySelector('textarea');
        const saveBtn = document.getElementById(`edit-save-${commentId}`);
        const content = textarea.value.trim();

        if (content.length < 5) {
            showNotification('Comment must be at least 5 characters.', 'error');
            return;
        }

        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        const user = getCurrentUser();

        try {
            const response = await fetch(`${API_URL}${postId}/comments/${commentId}/`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    author_role: user?.role || 'student',
                    content: content
                })
            });

            if (response.status === 403) {
                showNotification('You can only edit your own comments.', 'error');
                return;
            }

            if (!response.ok) throw new Error('Failed to update');

            await refreshDetailComments(postId);
            showNotification('Comment updated!', 'success');

        } catch (error) {
            console.error('Error updating:', error);
            showNotification('Error updating comment.', 'error');
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save';
        }
    });
}

// Delete Comment
async function deleteComment(postId, commentId) {
    if (!confirm('Delete this comment?')) return;

    try {
        const response = await fetch(`${API_URL}${postId}/comments/${commentId}/`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.status === 403) {
            showNotification('Permission denied.', 'error');
            return;
        }

        if (!response.ok && response.status !== 204) throw new Error('Failed to delete');

        await refreshDetailComments(postId);
        showNotification('Comment deleted.', 'success');

    } catch (error) {
        console.error('Error deleting:', error);
        showNotification('Error deleting comment.', 'error');
    }
}

// Refresh comments in detail view
async function refreshDetailComments(postId) {
    try {
        const response = await fetch(`${API_URL}${postId}/comments/`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) throw new Error('Failed to fetch comments');

        const comments = await response.json();

        // Update comment list
        const listEl = document.getElementById('detail-comment-list');
        if (listEl) listEl.innerHTML = renderCommentList(comments, postId);

        // Update count
        const countEl = document.getElementById('detail-comment-count');
        if (countEl) countEl.textContent = comments.length;

        // Update the post in allPosts
        const postIndex = allPosts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
            allPosts[postIndex].comments = comments;
        }

    } catch (error) {
        console.error('Error refreshing comments:', error);
    }
}

// Like Post
async function likePost(postId) {
    try {
        const response = await fetch(`${API_URL}${postId}/like/`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            const data = await response.json();

            // Update detail view
            const likesEl = document.getElementById(`detail-likes-${postId}`);
            if (likesEl) {
                likesEl.textContent = data.likes;
                likesEl.parentElement.classList.add('liked');
                setTimeout(() => likesEl.parentElement.classList.remove('liked'), 300);
            }

            // Update allPosts
            const postIndex = allPosts.findIndex(p => p.id === postId);
            if (postIndex !== -1) {
                allPosts[postIndex].likes = data.likes;
            }
        }
    } catch (error) {
        console.error('Error liking post:', error);
    }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    // Wait for Header
    await new Promise(resolve => {
        const check = setInterval(() => {
            if (window.Header && Header.initialized) { clearInterval(check); resolve(); }
        }, 50);
        setTimeout(() => { clearInterval(check); resolve(); }, 3000);
    });

    // Fetch posts
    await fetchPosts();

    // Back button
    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', showListView);
    }

    // Filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentFilter = e.target.value;
            renderGrid();
        });
    }

    // Search with debounce
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        let debounce;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounce);
            debounce = setTimeout(() => {
                currentSearch = e.target.value.trim();
                renderGrid();
            }, 300);
        });
    }

    // Handle browser back button
    window.addEventListener('popstate', () => {
        if (currentDetailPost) {
            showListView();
        }
    });
});

// Global functions for onclick handlers
window.likePost = likePost;
window.showEditComment = showEditComment;
window.deleteComment = deleteComment;
window.refreshDetailComments = refreshDetailComments;
window.showDetailView = showDetailView;
window.fetchPosts = fetchPosts;