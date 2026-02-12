from django.contrib import admin
from .models import Post, Comment


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['name', 'role', 'category', 'company', 'is_approved', 'likes', 'created_at']
    list_filter = ['category', 'is_approved', 'created_at']
    search_fields = ['name', 'role', 'experience', 'company', 'skills']
    list_editable = ['is_approved']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['user', 'post', 'author_role', 'content_preview', 'is_edited', 'created_at']
    list_filter = ['author_role', 'is_edited', 'created_at']
    search_fields = ['user__username', 'content']
    date_hierarchy = 'created_at'
    readonly_fields = ['created_at', 'updated_at']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'