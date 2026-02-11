from django.db import models


class Post(models.Model):
    name = models.CharField(max_length=200)
    role = models.CharField(max_length=200)
    category = models.SlugField(max_length=200)
    experience = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.role}"

    class Meta:
        ordering = ['-created_at']


class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    author_name = models.CharField(max_length=200)
    author_role = models.CharField(max_length=20, choices=[('student', 'Student'), ('alumni', 'Alumni')], default='student')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author_name} on {self.post.role}"

    class Meta:
        ordering = ['created_at']

