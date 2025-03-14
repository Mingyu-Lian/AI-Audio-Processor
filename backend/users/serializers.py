from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "email"]  # 只返回 ID 和 email

class UserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["email", "password"]  # 只需要 email 和密码
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        # 解决缺少 username 的问题
        user = CustomUser.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            username=validated_data.get("email").split("@")[0]  # 使用邮箱前缀作为默认用户名
        )
        return user
    


from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from .models import CustomUser

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "email"]  # 只返回 ID 和 email

class UserCreateSerializer(serializers.ModelSerializer):
    """ 用于创建用户 """
    class Meta:
        model = CustomUser
        fields = ["email", "password"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        """ 处理创建用户逻辑 """
        if CustomUser.objects.filter(email=validated_data["email"]).exists():
            raise ValidationError({"email": "This email is already registered."})  # 邮箱已存在，抛出错误
        
        # 解决 username 缺失问题，自动使用 email 前缀作为 username
        user = CustomUser.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            username=validated_data["email"].split("@")[0]  # 使用 email 前缀作为 username
        )
        return user
    

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user = authenticate(username=email, password=password)  # 使用 authenticate 验证
        if not user:
            raise serializers.ValidationError("Invalid credentials")

        data["user"] = user
        return data