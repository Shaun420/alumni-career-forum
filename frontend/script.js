// API URL
const API_URL = "http://localhost:8000/api/posts/";

// Fetch and render posts
async function fetchAndRenderPosts(filter = "all") {
  const postsContainer = document.getElementById("posts");
  postsContainer.innerHTML = "<p style='grid-column:1/-1; text-align:center;'>Loading...</p>";
  
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
    postsContainer.innerHTML = "<p style='grid-column:1/-1; text-align:center; color:red;'>Error loading posts. Please make sure the Django server is running.</p>";
  }
}

// Render posts to DOM
function renderPosts(posts) {
  const postsContainer = document.getElementById("posts");
  postsContainer.innerHTML = "";

  if (posts.length === 0) {
    postsContainer.innerHTML = "<p style='grid-column:1/-1; text-align:center;'>No posts found in this category.</p>";
    return;
  }

  posts.forEach(post => {
    const div = document.createElement("div");
    div.classList.add("post");
    div.innerHTML = `
      <h3>${post.role}</h3>
      <h4>by ${post.name}</h4>
      <p>${post.experience}</p>
    `;
    postsContainer.appendChild(div);
  });
}

// Initial render
fetchAndRenderPosts();

// Filter functionality
document.getElementById("category").addEventListener("change", (e) => {
  fetchAndRenderPosts(e.target.value);
});

// Form submission
document.getElementById("postForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const name = document.getElementById("name").value;
  const role = document.getElementById("role").value;
  const experience = document.getElementById("experience").value;
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
    
    // Re-fetch and render posts with current filter
    const currentFilter = document.getElementById("category").value;
    await fetchAndRenderPosts(currentFilter);
    
    // Show success message (optional)
    alert('Your career journey has been shared successfully!');
  } catch (error) {
    console.error('Error creating post:', error);
    alert('Error submitting post. Please try again.');
  }
});
