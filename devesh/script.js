// Expanded Mock Data (5 Alumni)
const alumniData = [
    {
        id: 1, name: "Shaunak Hawaldar", year: 1992, role: "Principal Cloud Architect @ AWS",
        path: "Spent 20 years mastering virtualization before leading AWS architecture teams.",
        skills: ["Cloud Arch", "Python", "Kubernetes", "Microservices", "Terraform", "Security"],
        certs: [
            { n: "AWS Certified Solutions Architect", u: "https://aws.amazon.com/certification" },
            { n: "Google Professional Cloud Architect", u: "https://cloud.google.com/certification" },
            { n: "HashiCorp Certified: Terraform Associate", u: "https://www.hashicorp.com/certification" }
        ]
    },
    {
        id: 2, name: "Devesh Dabhade", year: 2013, role: "Machine Learning Lead @ OpenAI",
        path: "Published 5 papers on LLMs before heading the research team at OpenAI.",
        skills: ["PyTorch", "NLP", "Data Strategy", "Research", "Vector DBs", "C++", "AI & ML"],
        certs: [
            { n: "DeepLearning.AI TensorFlow Developer", u: "https://www.coursera.org" },
            { n: "Microsoft Certified: Azure AI Engineer", u: "https://learn.microsoft.com" },
            { n: "NVIDIA Graduate AI Specialization", u: "https://www.nvidia.com" }
        ]
    },
    {
        id: 3, name: "Saurabh Balagide", year: 1985, role: "CTO of Global FinTech Corp",
        path: "Rose from Cobol developer to CTO of a multi-billion dollar banking system.",
        skills: ["Leadership", "Legacy Migration", "Scala", "Java", "Strategic Planning", "Blockchain"],
        certs: [
            { n: "Certified Information Systems Auditor", u: "https://www.isaca.org" },
            { n: "PMP Professional Certification", u: "https://www.pmi.org" },
            { n: "MIT Executive Management Program", u: "https://executive.mit.edu" }
        ]
    },
    {
        id: 4, name: "Gauresh Aher", year: 2018, role: "Senior UX Researcher @ Adobe",
        path: "Transformed from a graphic designer to a lead researcher via behavioral science.",
        skills: ["User Testing", "Figma", "Interaction Design", "Prototyping", "Analytics", "Workshops"],
        certs: [
            { n: "Google UX Design Professional", u: "https://grow.google/uxdesign" },
            { n: "NN/g UX Certification", u: "https://www.nngroup.com" },
            { n: "HCI Graduate Certificate", u: "https://www.interaction-design.org" }
        ]
    },
    {
        id: 5, name: "Bhushan Badhe", year: 2010, role: "VP of Product @ Unicorn Startup",
        path: "Engineering background turned product leader. Expert in scaling B2B SaaS.",
        skills: ["Product Strategy", "Market Analysis", "SQL", "Agile", "Stakeholder Mgmt", "Go-To-Market"],
        certs: [
            { n: "Pragmatic Institute Product Cert", u: "https://www.pragmaticinstitute.com" },
            { n: "Reforge Growth Series", u: "https://www.reforge.com" },
            { n: "Scrum Alliance CSPO", u: "https://www.scrumalliance.org" }
        ]
    },

    {
        id: 6, name: "Parth Jain", year: 2015, role: "VP of Product @ SmartAI",
        path: "Engineering background turned me into an enterprenaur. Expert in scaling B2B SaaS.",
        skills: ["Product Strategy", "Market Analysis", "SQL", "Agile", "Stakeholder Mgmt", "Go-To-Market"],
        certs: [
            { n: "Pragmatic Institute Product Cert", u: "https://www.pragmaticinstitute.com" },
            { n: "Reforge Growth Series", u: "https://www.reforge.com" },
            { n: "Scrum Alliance CSPO", u: "https://www.scrumalliance.org" }
        ]
    }
];

// 1. Auth Toggle Logic (Sign Up / Login)
const authBtn = document.getElementById('toggle-auth');
let isSignUp = false;

authBtn?.addEventListener('click', () => {
    isSignUp = !isSignUp;
    document.getElementById('auth-title').innerText = isSignUp ? "Create Account" : "Student Login";
    document.getElementById('submit-btn').innerText = isSignUp ? "Sign Up" : "Sign In";
    document.getElementById('toggle-label').innerText = isSignUp ? "Already a user?" : "New user?";
    authBtn.innerText = isSignUp ? "Log In" : "Sign Up";
});

// 2. Theme Toggle Logic
const themeBtn = document.getElementById('theme-toggle');
themeBtn?.addEventListener('click', () => {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
});

// 3. Password Validation & Login
document.getElementById('auth-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');
    
    // Regex: Min 8 chars, 1 number, 1 special char
    const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

    if (!regex.test(pass)) {
        errorMsg.innerText = "Requires: 8+ characters, 1 number, 1 special symbol.";
        return;
    }
    
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('dashboard-container').classList.remove('hidden');
    renderCards();
});

// 4. Render Alumni Cards
function renderCards() {
    const list = document.getElementById('alumni-list');
    if (!list) return;
    
    list.innerHTML = ''; // Clear previous content
    const currYear = new Date().getFullYear();

    alumniData.forEach(person => {
        const years = currYear - person.year;
        let badge = years >= 25 ? '<span class="badge badge-gold">GOLD ALUMNI</span>' : 
                    years >= 10 ? '<span class="badge badge-silver">SILVER ALUMNI</span>' : '';

        list.innerHTML += `
            <div class="alumni-card" onclick="openModal(${person.id})">
                ${badge}
                <h3>${person.name}</h3>
                <p class="role">${person.role}</p>
                <div class="skills-list">
                    ${person.skills.slice(0, 3).map(s => `<span class="skill-tag">${s}</span>`).join('')}
                    <span class="skill-tag">+${person.skills.length - 3}</span>
                </div>
            </div>
        `;
    });
}

// 5. Modal Controls
function openModal(id) {
    const p = alumniData.find(x => x.id === id);
    const body = document.getElementById('modal-body');
    
    body.innerHTML = `
        <h2 class="accent">${p.name}</h2>
        <p class="role" style="margin-top:-10px; margin-bottom:20px;">${p.role}</p>
        <p><strong>Career Path:</strong><br><span style="color:var(--text-secondary); font-size:0.9rem;">${p.path}</span></p>
        <p><strong>All Skills:</strong></p>
        <div class="skills-list">${p.skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}</div>
        <p><strong>Verified Certifications:</strong></p>
        <ul style="padding-left: 20px;">
            ${p.certs.map(c => `<li style="margin-bottom:8px;"><a href="${c.u}" target="_blank" class="cert-link">${c.n}</a></li>`).join('')}
        </ul>
    `;
    document.getElementById('modal-overlay').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
}

// 6. Feedback Form Handler
document.getElementById('feedback-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const btn = e.target.querySelector('button');
    const originalText = btn.innerText;
    
    // Simulate API Call
    btn.innerText = "✓ Submitted Successfully";
    btn.style.background = "#22c55e"; 
    
    setTimeout(() => {
        this.reset();
        btn.innerText = originalText;
        btn.style.background = "var(--accent-color)";
    }, 2500);
});

// --- Real-time Filter Logic ---

const searchInput = document.getElementById('skill-search');
const resultsCount = document.getElementById('results-count');

searchInput?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    
    const filteredAlumni = alumniData.filter(person => {
        const nameMatch = person.name.toLowerCase().includes(term);
        const roleMatch = person.role.toLowerCase().includes(term);
        const skillMatch = person.skills.some(skill => skill.toLowerCase().includes(term));
        
        return nameMatch || roleMatch || skillMatch;
    });

    updateResultsUI(filteredAlumni);
});

// Helper function to re-render the list based on filter
function updateResultsUI(data) {
    const list = document.getElementById('alumni-list');
    list.innerHTML = ''; // Clear current grid

    if (data.length === 0) {
        list.innerHTML = `<div class="no-results">🚀 No alumni found matching those skills. Try another search!</div>`;
        resultsCount.innerText = "Showing 0 results";
        return;
    }

    const currYear = new Date().getFullYear();
    resultsCount.innerText = `Showing ${data.length} alumni profile(s)`;

    data.forEach(person => {
        const years = currYear - person.year;
        let badge = years >= 25 ? '<span class="badge badge-gold">GOLD ALUMNI</span>' : 
                    years >= 10 ? '<span class="badge badge-silver">SILVER ALUMNI</span>' : '';

        list.innerHTML += `
            <div class="alumni-card" onclick="openModal(${person.id})">
                ${badge}
                <h3>${person.name}</h3>
                <p class="role">${person.role}</p>
                <div class="skills-list">
                    ${person.skills.slice(0, 3).map(s => `<span class="skill-tag">${s}</span>`).join('')}
                    <span class="skill-tag">+${person.skills.length - 3}</span>
                </div>
            </div>
        `;
    });
}

// --- Advanced Filtering Logic ---

const fieldButtons = document.querySelectorAll('.tag-btn');
let currentField = 'all';

// Handle Category Button Clicks
fieldButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update Active UI
        document.querySelector('.tag-btn.active').classList.remove('active');
        btn.classList.add('active');
        
        // Update Filter State
        currentField = btn.getAttribute('data-field');
        runCombinedFilter();
    });
});

// Update Search Input to use the combined filter
document.getElementById('skill-search').addEventListener('input', runCombinedFilter);

function runCombinedFilter() {
    const searchTerm = document.getElementById('skill-search').value.toLowerCase();
    
    const filteredData = alumniData.filter(person => {
        // 1. Check Field Match
        const fieldMatch = (currentField === 'all') || 
                           person.role.includes(currentField) || 
                           person.skills.some(s => s.includes(currentField));
        
        // 2. Check Search Text Match
        const textMatch = person.name.toLowerCase().includes(searchTerm) ||
                          person.role.toLowerCase().includes(searchTerm) ||
                          person.skills.some(s => s.toLowerCase().includes(searchTerm));
        
        return fieldMatch && textMatch;
    });

    updateResultsUI(filteredData);
}

// Ensure results count is accurate on initial load
function updateResultsUI(data) {
    const list = document.getElementById('alumni-list');
    const resultsCount = document.getElementById('results-count');
    list.innerHTML = '';

    if (data.length === 0) {
        list.innerHTML = `<div class="no-results">🚀 No alumni found in this field. Try a different category!</div>`;
        resultsCount.innerText = "Showing 0 results";
        return;
    }

    resultsCount.innerText = `Showing ${data.length} alumni profile(s)`;
    const currYear = new Date().getFullYear();

    data.forEach(person => {
        const years = currYear - person.year;
        let badge = years >= 25 ? '<span class="badge badge-gold">GOLD ALUMNI</span>' : 
                    years >= 10 ? '<span class="badge badge-silver">SILVER ALUMNI</span>' : '';

        list.innerHTML += `
            <div class="alumni-card" onclick="openModal(${person.id})">
                ${badge}
                <h3>${person.name}</h3>
                <p class="role">${person.role}</p>
                <div class="skills-list">
                    ${person.skills.slice(0, 3).map(s => `<span class="skill-tag">${s}</span>`).join('')}
                    <span class="skill-tag">+${person.skills.length - 3}</span>
                </div>
            </div>
        `;
    });
}