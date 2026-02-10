from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = [
        ('alumni', 'Alumni'),
        ('student', 'Student'),
        ('admin', 'Admin'),
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    graduation_year = models.IntegerField(null=True, blank=True)
    department = models.CharField(max_length=200, null=True, blank=True)
    bio = models.TextField(null=True, blank=True)
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
