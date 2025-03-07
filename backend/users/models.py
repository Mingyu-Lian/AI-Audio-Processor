from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid  # 用于生成唯一 ID


class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)  # 邮箱必须唯一
    username = models.CharField(max_length=150, blank=True, null=True)  # 用户名可重复
    points = models.IntegerField(default=60)
    register_time = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"  # 用 email 作为登录字段
    REQUIRED_FIELDS = ["username"]  # 注册时仍然需要 username

    def __str__(self):
        return self.email