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

