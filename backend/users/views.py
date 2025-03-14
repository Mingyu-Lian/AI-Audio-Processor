from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
from .serializers import UserSerializer, UserCreateSerializer, LoginSerializer
from django.contrib.auth import get_user_model

# 生成 JWT Token
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }

# 注册 API
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()  # 查询所有用户
    serializer_class = UserCreateSerializer     # 使用 UserCreateSerializer
    permission_classes = [permissions.AllowAny] # 允许任何人注册

    def post(self, request, *args, **kwargs): # 重写 post 方法
        serializer = self.get_serializer(data=request.data) # 获取请求数据
        serializer.is_valid(raise_exception=True)  # 验证数据
        user = serializer.save()  # 保存用户
        #这个save 方法是在serializers.py中定义的，实际上是调用了CustomUser.objects.create_user(**validated_data)方法
        return Response(UserSerializer(user).data)  # 返回用户 ID、用户名、邮箱


# login API
class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        # 获取用户对象
        user_model = get_user_model()
        try:
            user = user_model.objects.get(email=email)  # 使用 email 查找用户
        except user_model.DoesNotExist:
            return Response({"detail": "The User does not Exist"}, status=400)

        # 检查密码是否匹配
        if not user.check_password(password):
            return Response({"detail": "Wrong Password"}, status=400)

        update_last_login(None, user)  # 更新 last_login 时间
        tokens = get_tokens_for_user(user)  # 生成 JWT

        return Response({"user": UserSerializer(user).data, "tokens": tokens})

# Create your views here.
