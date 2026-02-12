from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'department', 'graduation_year', 'is_staff', 'date_joined']
    list_filter = ['role', 'is_staff', 'is_active', 'graduation_year']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'department']
    ordering = ['-date_joined']
    
    # Add custom fields to the admin form
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('role', 'graduation_year', 'department', 'bio')
        }),
    )
    
    # Fields shown when creating a new user in admin
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('Additional Info', {
            'fields': ('email', 'role', 'graduation_year', 'department', 'bio')
        }),
    )