from django.db import models
from django.conf import settings
#from django.contrib.auth.models import User


class Post(models.Model):
    """Alumni career experience post"""
    CATEGORY_CHOICES = [
        ('software-engineer', 'Software Engineer'),
        ('web-developer', 'Web Developer'),
        ('cybersecurity-analyst', 'Cybersecurity Analyst'),
        ('tester', 'Tester'),
        ('data-scientist', 'Data Scientist'),
        ('devops-engineer', 'DevOps Engineer'),
        ('mobile-developer', 'Mobile Developer'),
        ('other', 'Other'),
    ]
    
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE, 
        related_name='posts',
        null=True,
        blank=True
    )
    name = models.CharField(max_length=200, help_text="Alumni name")
    email = models.EmailField(blank=True, null=True)
    role = models.CharField(max_length=200, help_text="Current job role")
    category = models.CharField(
        max_length=50, 
        choices=CATEGORY_CHOICES, 
        default='other'
    )
    company = models.CharField(max_length=200, blank=True)
    experience = models.TextField(help_text="Career journey and advice")
    skills = models.TextField(blank=True, help_text="Key skills (comma-separated)")
    graduation_year = models.PositiveIntegerField(blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    likes = models.PositiveIntegerField(default=0)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} - {self.role}"

    def get_skills_list(self):
        if self.skills:
            return [skill.strip() for skill in self.skills.split(',')]
        return []


class Comment(models.Model):
    """Comments on posts - requires authentication"""
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('alumni', 'Alumni'),
    ]
    
    post = models.ForeignKey(
        Post, 
        on_delete=models.CASCADE, 
        related_name='comments'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='comments'
    )
    author_role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES,
        default='student'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_edited = models.BooleanField(default=False)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.user.username} on {self.post}"

    @property
    def author_name(self):
        """Return the username as author_name for API compatibility"""
        return self.user.username

class Like(models.Model):
    """Likes on posts - requires authentication"""
    post = models.ForeignKey(
        Post, 
        on_delete=models.CASCADE, 
        related_name='Like_likes'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='Like_likes'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return str(self.user.username)