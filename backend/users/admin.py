from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    list_display = ("id", "username", "email", "credits", "is_staff", "is_superuser", "register_time")
    search_fields = ("username", "email")
    list_filter = ("is_staff", "is_superuser", "credits")
    ordering = ("id",)
    fieldsets = (
        ("User Information", {"fields": ("username", "email", "password", "register_time")}),
        ("Permissions", {"fields": ("is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Credits", {"fields": ("credits",)}),
    )
    add_fieldsets = (
        (
            "Create New User",
            {
                "classes": ("wide",),
                "fields": ("username", "email", "password1", "password2", "is_staff", "is_superuser"),
            },
        ),
    )

admin.site.register(CustomUser, CustomUserAdmin)
