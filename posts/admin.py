from django.contrib import admin
from .models import Post


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'category', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('name', 'role', 'experience')

