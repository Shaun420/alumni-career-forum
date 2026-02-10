// ===============================
// Alumni Career Dashboard Script
// ===============================

// Get elements
const filterSelect = document.querySelector(".filters select");
const postsContainer = document.querySelector(".posts");
const form = document.querySelector(".submit form");

// -------------------------------
// FILTER BY DESIGNATION
// -------------------------------
filterSelect.addEventListener("change", () => {
  const selectedRole = filterSelect.value.toLowerCase();
  const posts = document.querySelectorAll(".post-card");

  posts.forEach(post => {
    const role = post.querySelector("h3").innerText.toLowerCase();

    if (selectedRole === "all" || role.includes(selectedRole)) {
      post.style.display = "block";
    } else {
      post.style.display = "none";
    }
  });
});

// -------------------------------
// ADD NEW ROADMAP (ALUMNI POST)
// -------------------------------
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = form.querySelector("input[placeholder='Your Name']").value;
  const role = form.querySelector("input[placeholder='Current Designation']").value;
  const company = form.querySelector("input[placeholder='Company Name']").value;
  const roadmap = form.querySelector("textarea").value;

  // Create post card
  const postCard = document.createElement("div");
  postCard.classList.add("post-card");

  postCard.innerHTML = `
    <h3>${role}</h3>
    <h4>${name} – ${company}</h4>
    <p>${roadmap}</p>
  `;

  // Add post to top
  postsContainer.prepend(postCard);

  // Reset form
  form.reset();

  // Optional success feedback
  alert("✅ Roadmap shared successfully!");
});
