// API URL
const API_URL = "http://localhost:8000/api/posts/";

// Fetch and render testimonials
async function fetchAndRenderTestimonials() {
  const testimonialsContainer = document.getElementById("testimonialsGrid");
  
  if (!testimonialsContainer) {
    // Not on homepage, skip
    return;
  }
  
  testimonialsContainer.innerHTML = "<p style='grid-column:1/-1; text-align:center;'>Loading...</p>";
  
  try {
    const response = await fetch(API_URL);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const posts = await response.json();
    renderTestimonials(posts);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    testimonialsContainer.innerHTML = "<p style='grid-column:1/-1; text-align:center; color:red;'>Error loading testimonials. Please make sure the Django server is running.</p>";
  }
}

// Render testimonials to DOM
function renderTestimonials(posts) {
  const testimonialsContainer = document.getElementById("testimonialsGrid");
  testimonialsContainer.innerHTML = "";

  if (posts.length === 0) {
    testimonialsContainer.innerHTML = "<p style='grid-column:1/-1; text-align:center;'>No testimonials available.</p>";
    return;
  }

  posts.forEach(post => {
    const div = document.createElement("div");
    div.classList.add("testimonial-card");
    div.innerHTML = `
      <div class="quote-icon">"</div>
      <p class="testimonial-text">${post.experience}</p>
      <div class="testimonial-author">
        <div class="author-avatar">${post.name.charAt(0)}</div>
        <div class="author-info">
          <h4>${post.name}</h4>
          <p>${post.role}</p>
        </div>
      </div>
    `;
    testimonialsContainer.appendChild(div);
  });
}

// Initial render
fetchAndRenderTestimonials();
