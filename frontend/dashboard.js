// API URL
const API_URL = "http://localhost:8000/api/posts/";

// Check authentication and show appropriate content
function checkAuthentication() {
  const authMessage = document.getElementById('authMessage');
  const dashboardContent = document.getElementById('dashboardContent');
  
  // Check if FormUtils is available
  if (typeof FormUtils !== 'undefined') {
    const user = FormUtils.getCurrentUser();
    
    if (user) {
      // User is logged in, show dashboard
      authMessage.style.display = 'none';
      dashboardContent.style.display = 'block';
      
      // Set user name
      const userName = document.getElementById('userName');
      if (userName) {
        userName.textContent = user.username;
      }
      
      // Load user's posts
      loadUserPosts(user.username);
    } else {
      // Not logged in, show message
      authMessage.style.display = 'block';
      dashboardContent.style.display = 'none';
    }
  } else {
    // FormUtils not available, show auth message
    authMessage.style.display = 'block';
    dashboardContent.style.display = 'none';
  }
}

// Load user's posts
async function loadUserPosts(username) {
  const postsContainer = document.getElementById('myPostsContainer');
  postsContainer.innerHTML = "<p style='text-align:center; padding: 40px;'>Loading your posts...</p>";
  
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const allPosts = await response.json();
    
    // Filter posts by user name (in a real app, this would be done server-side)
    const userPosts = allPosts.filter(post => post.name === username || post.name.toLowerCase() === username.toLowerCase());
    
    renderUserPosts(userPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    postsContainer.innerHTML = "<p style='text-align:center; padding: 40px; color:red;'>Error loading posts. Please make sure the Django server is running.</p>";
  }
}

// Render user's posts
function renderUserPosts(posts) {
  const postsContainer = document.getElementById('myPostsContainer');
  postsContainer.innerHTML = "";

  if (posts.length === 0) {
    postsContainer.innerHTML = "<p style='text-align:center; padding: 40px; color: #999;'>You haven't shared any career journeys yet. Use the form above to share your first post!</p>";
    return;
  }

  posts.forEach(post => {
    const div = document.createElement("div");
    div.classList.add("post-card");
    div.innerHTML = `
      <div class="post-header">
        <h3>${post.role}</h3>
        <span class="post-category">${post.category}</span>
      </div>
      <div class="post-content">
        <p>${post.experience}</p>
      </div>
      <div class="post-footer">
        <span class="post-date">Posted on ${new Date(post.created_at).toLocaleDateString()}</span>
        <span class="post-comments">${post.comments ? post.comments.length : 0} comments</span>
      </div>
    `;
    postsContainer.appendChild(div);
  });
}

// Handle form submission
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const name = document.getElementById('name').value.trim();
  const role = document.getElementById('role').value.trim();
  const experience = document.getElementById('experience').value.trim();
  const category = role.toLowerCase().replace(/\s+/g, '-');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        role,
        category,
        experience
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create post');
    }

    // Reset form
    e.target.reset();
    
    // Show success message
    alert('Your career journey has been shared successfully!');
    
    // Reload user's posts
    const user = FormUtils.getCurrentUser();
    if (user) {
      loadUserPosts(user.username);
    }
  } catch (error) {
    console.error('Error creating post:', error);
    alert('Error submitting post. Please try again.');
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Check authentication
  checkAuthentication();
  
  // Set up form submission
  const postForm = document.getElementById('postForm');
  if (postForm) {
    postForm.addEventListener('submit', handleFormSubmit);
  }
});
