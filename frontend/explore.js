// API URLs
const API_URL = "http://localhost:8000/api/posts/";

// Fetch and render posts with comments
async function fetchAndRenderPosts(filter = "all") {
  const postsContainer = document.getElementById("postsContainer");
  postsContainer.innerHTML = "<p style='text-align:center; padding: 40px;'>Loading...</p>";
  
  try {
    const url = filter === "all" ? API_URL : `${API_URL}?category=${filter}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const posts = await response.json();
    renderPosts(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    postsContainer.innerHTML = "<p style='text-align:center; padding: 40px; color:red;'>Error loading posts. Please make sure the Django server is running.</p>";
  }
}

// Render posts to DOM
function renderPosts(posts) {
  const postsContainer = document.getElementById("postsContainer");
  postsContainer.innerHTML = "";

  if (posts.length === 0) {
    postsContainer.innerHTML = "<p style='text-align:center; padding: 40px;'>No posts found in this category.</p>";
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
  
  card.innerHTML = `
    <div class="post-header">
      <div class="post-author-avatar">${post.name.charAt(0)}</div>
      <div class="post-author-info">
        <h3>${post.name}</h3>
        <p class="post-role">${post.role}</p>
      </div>
    </div>
    <div class="post-content">
      <p>${post.experience}</p>
    </div>
    <div class="comments-section">
      <h4>Comments (${post.comments ? post.comments.length : 0})</h4>
      <div class="comments-list" id="comments-${post.id}">
        ${renderComments(post.comments || [])}
      </div>
      <div class="comment-form-container">
        <h5>Add a Comment</h5>
        <form class="comment-form" data-post-id="${post.id}">
          <input type="text" class="comment-name" placeholder="Your Name" required>
          <select class="comment-role" required>
            <option value="">Select Role</option>
            <option value="student">Student</option>
            <option value="alumni">Alumni</option>
          </select>
          <textarea class="comment-content" placeholder="Share your thoughts..." required></textarea>
          <button type="submit">Post Comment</button>
        </form>
      </div>
    </div>
  `;
  
  // Add event listener for comment form submission
  const form = card.querySelector('.comment-form');
  form.addEventListener('submit', handleCommentSubmit);
  
  return card;
}

// Render comments HTML
function renderComments(comments) {
  if (comments.length === 0) {
    return '<p class="no-comments">No comments yet. Be the first to comment!</p>';
  }
  
  return comments.map(comment => `
    <div class="comment">
      <div class="comment-author">
        <span class="comment-name">${comment.author_name}</span>
        <span class="comment-role-badge ${comment.author_role}">${comment.author_role}</span>
      </div>
      <p class="comment-text">${comment.content}</p>
      <span class="comment-date">${new Date(comment.created_at).toLocaleDateString()}</span>
    </div>
  `).join('');
}

// Handle comment submission
async function handleCommentSubmit(e) {
  e.preventDefault();
  
  const form = e.target;
  const postId = form.dataset.postId;
  const nameInput = form.querySelector('.comment-name');
  const roleSelect = form.querySelector('.comment-role');
  const contentTextarea = form.querySelector('.comment-content');
  
  const commentData = {
    author_name: nameInput.value.trim(),
    author_role: roleSelect.value,
    content: contentTextarea.value.trim()
  };
  
  try {
    const response = await fetch(`${API_URL}${postId}/comments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData)
    });

    if (!response.ok) {
      throw new Error('Failed to post comment');
    }

    const newComment = await response.json();
    
    // Refresh comments for this post
    await refreshPostComments(postId);
    
    // Reset form
    form.reset();
    
    // Show success message
    alert('Comment posted successfully!');
  } catch (error) {
    console.error('Error posting comment:', error);
    alert('Error posting comment. Please try again.');
  }
}

// Refresh comments for a specific post
async function refreshPostComments(postId) {
  try {
    const response = await fetch(`${API_URL}${postId}/comments/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    
    const comments = await response.json();
    const commentsContainer = document.getElementById(`comments-${postId}`);
    
    if (commentsContainer) {
      commentsContainer.innerHTML = renderComments(comments);
      
      // Update comment count
      const postCard = document.querySelector(`[data-post-id="${postId}"]`);
      const commentHeader = postCard.querySelector('.comments-section h4');
      commentHeader.textContent = `Comments (${comments.length})`;
    }
  } catch (error) {
    console.error('Error refreshing comments:', error);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Initial render
  fetchAndRenderPosts();
  
  // Filter functionality
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      fetchAndRenderPosts(e.target.value);
    });
  }
});
