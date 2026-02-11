from django.contrib import admin
from .models import Post, Comment


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('name', 'role', 'category', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('name', 'role', 'experience')


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('author_name', 'author_role', 'post', 'created_at')
    list_filter = ('author_role', 'created_at')
    search_fields = ('author_name', 'content')

