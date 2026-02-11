# Alumni Career Forum

## Description

A forum-based website where college alumni can share their career paths and experiences to help current and prospective students make informed career decisions. Alumni can post about their journey toward different job roles, and students can explore these posts by category to gain real-world insights.

## Tech Stack

- **Backend**: Django 4.2, Django REST Framework
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Database**: SQLite (default Django database)
- **CORS**: django-cors-headers

## Features

- **Homepage Testimonials**: View inspiring career journey testimonials from alumni on the homepage
- **Explore Career Journeys**: Dedicated page for browsing all alumni career posts with category filtering
- **Comment System**: Students and alumni can comment on career journey posts to ask questions and share insights
- **Alumni Dashboard**: Secure dashboard for alumni to submit and manage their career journey posts
- **Category Filtering**: Filter career journeys by job role (Software Engineer, Web Developer, Cybersecurity Analyst, Tester, etc.)
- **User Authentication**: Login/register system for students and alumni
- **Clean, modern, and responsive UI**: Consistent color theme (#FFB343, #42EAFF, #4272FF, #FF7E42)
- **RESTful API**: Complete API for posts and comments management

## Setup Instructions

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Shaun420/alumni-career-forum.git
   cd alumni-career-forum
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run database migrations**
   ```bash
   python manage.py migrate
   ```

4. **Create a superuser (optional, for admin access)**
   ```bash
   python manage.py createsuperuser
   ```

5. **Start the Django development server**
   ```bash
   python manage.py runserver
   ```

   The API will be available at `http://localhost:8000`

6. **Open the frontend**
   
   Open `frontend/index.html` in your web browser, or serve it using a simple HTTP server:
   ```bash
   cd frontend
   python -m http.server 8080
   ```
   Then navigate to `http://localhost:8080` in your browser.

## API Endpoints

### Posts API
- **GET** `/api/posts/` - Get all posts with nested comments
- **GET** `/api/posts/?category=software-engineer` - Get posts filtered by category
- **POST** `/api/posts/` - Create a new post

#### POST Request Body Example:
```json
{
  "name": "John Doe",
  "role": "Data Scientist",
  "category": "data-scientist",
  "experience": "I started with Python and statistics..."
}
```

### Comments API
- **GET** `/api/posts/<post_id>/comments/` - Get all comments for a specific post
- **POST** `/api/posts/<post_id>/comments/` - Create a new comment on a post

#### POST Request Body Example:
```json
{
  "author_name": "Jane Smith",
  "author_role": "student",
  "content": "Thanks for sharing your experience!"
}
```

## Admin Panel

Access the Django admin panel at `http://localhost:8000/admin/` to manage posts and comments directly.

## Project Structure

```
alumni-career-forum/
├── alumni_forum/          # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── posts/                 # Posts app
│   ├── migrations/
│   ├── models.py         # Post and Comment models
│   ├── serializers.py    # DRF serializers
│   ├── views.py          # API views
│   ├── admin.py          # Admin configuration
│   └── urls.py           # App URLs
├── accounts/             # User authentication app
├── frontend/             # Frontend files
│   ├── index.html        # Homepage with testimonials
│   ├── explore.html      # Browse career journeys with comments
│   ├── dashboard.html    # Alumni dashboard for posting
│   ├── about.html        # About page
│   ├── login.html        # Login page
│   ├── register.html     # Registration page
│   ├── style.css         # Main styles
│   ├── explore.css       # Explore page styles
│   ├── dashboard.css     # Dashboard styles
│   ├── script.js         # Homepage JavaScript
│   ├── explore.js        # Explore page JavaScript
│   └── dashboard.js      # Dashboard JavaScript
├── manage.py
└── requirements.txt
```

## Usage

### For Students and Alumni
1. **Homepage**: View inspiring testimonials from successful alumni
2. **Explore Journeys**: Browse all career journeys, filter by category, and read comments
3. **Add Comments**: Share your thoughts, ask questions on any career journey post
4. **Register/Login**: Create an account to access personalized features

### For Alumni
1. **Dashboard**: Access your personalized dashboard after logging in
2. **Share Journey**: Submit your career journey to inspire students
3. **View Posts**: See all your published career journey posts
4. **Engage**: Respond to comments and help students
5. All data is stored in the Django database and persists between sessions

## Contributing

Feel free to fork this repository and submit pull requests for any improvements!

## License

MIT License
