
from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    points = models.IntegerField(default=60)  # 1 point = 1 minute, 默认给 60 points
    REQUIRED_FIELDS = ["email"]

    def __str__(self):
        return self.username
