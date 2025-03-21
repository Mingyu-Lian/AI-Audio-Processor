from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)  # 邮箱必须唯一
    credits = models.IntegerField(default=60)
    register_time = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"  # 用 email 作为唯一登录字段
    REQUIRED_FIELDS = ["username"]  # 仍然需要 username 但允许前端传入

    def __str__(self):
        return self.email