from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
from .serializers import UserSerializer, UserCreateSerializer

# 生成 Token
def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}

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

# 登录 API
class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        user = authenticate(email=email, password=password)
        if user:
            update_last_login(None, user)
            return Response({"user": UserSerializer(user).data, "tokens": get_tokens_for_user(user)})
        return Response({"error": "Invalid Credentials"}, status=400)

# Create your views here.
