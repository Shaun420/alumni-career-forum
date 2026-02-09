# Alumni Career Forum

## Description

A forum-based website where college alumni can share their career paths and experiences to help current and prospective students make informed career decisions. Alumni can post about their journey toward different job roles, and students can explore these posts by category to gain real-world insights.

## Tech Stack

- **Backend**: Django 4.2, Django REST Framework
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Database**: SQLite (default Django database)
- **CORS**: django-cors-headers

## Features

- Browse alumni career pathways by category (Software Engineer, Web Developer, Cybersecurity Analyst, Tester, etc.)
- Filter posts by career category
- Submit your own career journey
- Clean, modern, and responsive UI
- RESTful API for posts management

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

### List/Create Posts
- **GET** `/api/posts/` - Get all posts
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

## Admin Panel

Access the Django admin panel at `http://localhost:8000/admin/` to manage posts directly.

## Project Structure

```
alumni-career-forum/
├── alumni_forum/          # Django project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── posts/                 # Posts app
│   ├── migrations/
│   ├── models.py         # Post model
│   ├── serializers.py    # DRF serializers
│   ├── views.py          # API views
│   ├── admin.py          # Admin configuration
│   └── urls.py           # App URLs
├── frontend/             # Frontend files
│   ├── index.html
│   ├── style.css
│   └── script.js
├── manage.py
└── requirements.txt
```

## Usage

1. Start the Django server (backend)
2. Open the frontend in a browser
3. Browse existing alumni posts or filter by category
4. Share your own career journey using the form
5. All data is stored in the Django database and persists between sessions

## Contributing

Feel free to fork this repository and submit pull requests for any improvements!

## License

MIT License
