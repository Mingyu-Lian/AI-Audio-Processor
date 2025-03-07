from rest_framework import serializers
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "username", "email"]  # 只返回这三个字段

class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["username", "email", "password"]  # 允许 POST 创建用户
        extra_kwargs = {"password": {"write_only": True}}  # 确保密码不会被返回

    def create(self, validated_data):
        user = CustomUser.objects.create_user(**validated_data)  # Django 内置创建用户方法
        return user
