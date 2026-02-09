// Dummy initial posts
let posts = [
  {
    name: "Devesh Dabhade",
    role: "Software Engineer",
    category: "software-engineer",
    experience: "I started as a junior dev and focused on Python and algorithms. Internships helped a lot."
  },
  {
    name: "Bhushan Badhe",
    role: "Web Developer",
    category: "web-developer",
    experience: "I built small projects using HTML/CSS/JS and contributed to open source. Networking helped me."
  },
  {
    name: "Shaunak Hawaldar",
    role: "Cybersecurity Analyst",
    category: "cybersecurity-analyst",
    experience: "Certifications in ethical hacking and hands-on labs were crucial for my career."
  },
  {
    name: "Saurabh Balagide",
    role: "Tester",
    category: "tester",
    experience: "Learning automation testing and practicing problem-solving were key steps."
  }
];

// Function to render posts
function renderPosts(filter = "all") {
  const postsContainer = document.getElementById("posts");
  postsContainer.innerHTML = "";
  const filtered = filter === "all" ? posts : posts.filter(p => p.category === filter);

  if(filtered.length === 0){
    postsContainer.innerHTML = "<p style='grid-column:1/-1; text-align:center;'>No posts found in this category.</p>";
    return;
  }

  filtered.forEach(post => {
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
renderPosts();

// Filter functionality
document.getElementById("category").addEventListener("change", (e) => {
  renderPosts(e.target.value);
});

// Form submission
document.getElementById("postForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const role = document.getElementById("role").value;
  const experience = document.getElementById("experience").value;
  const category = role.toLowerCase().replace(/\s+/g, '-'); // simple mapping

  posts.push({ name, role, experience, category });
  renderPosts(document.getElementById("category").value);

  // Reset form
  e.target.reset();
});
