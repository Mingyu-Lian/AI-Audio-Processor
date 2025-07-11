from django.shortcuts import render
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from rest_framework_simplejwt.tokens import RefreshToken
from .models import CustomUser
from .serializers import UserSerializer, UserCreateSerializer, LoginSerializer, ChangePasswordSerializer
from django.contrib.auth import get_user_model

from rest_framework.decorators import api_view, permission_classes
import requests
from django.conf import settings
import uuid

# Azure Blob Storage
from azure.storage.blob import generate_blob_sas, BlobSasPermissions
from datetime import datetime, timedelta


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

# 修改密码 API
class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)


# Azure Token 获取 API（实时识别用） 目前不适用，这个可以忽略
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def get_azure_token(request):
    AZURE_REGION = getattr(settings, "AZURE_SPEECH_REGION", "australiaeast")
    AZURE_KEY = getattr(settings, "AZURE_SPEECH_KEY", None)
    if not AZURE_KEY:
        return Response({"error": "Azure key not configured."}, status=500)

    token_url = f"https://{AZURE_REGION}.api.cognitive.microsoft.com/sts/v1.0/issueToken"
    headers = {
        "Ocp-Apim-Subscription-Key": AZURE_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
    }

    try:
        response = requests.post(token_url, headers=headers)
        if response.status_code == 200:
            return Response({"token": response.text})
        return Response({"error": "Failed to get token from Azure."}, status=response.status_code)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# 获取 Azure Blob Storage 上传 URL
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def get_upload_url(request):
    filename = request.data.get("filename")
    if not filename:
        return Response({"error": "Missing filename"}, status=400)

    account_name = settings.AZURE_STORAGE_ACCOUNT_NAME
    account_key = settings.AZURE_STORAGE_ACCOUNT_KEY
    container_name = settings.AZURE_STORAGE_CONTAINER

    try:
        sas_token = generate_blob_sas(
            account_name=account_name,
            container_name=container_name,
            blob_name=filename,
            account_key=account_key,
            permission=BlobSasPermissions(write=True, create=True),
            expiry=datetime.utcnow() + timedelta(minutes=30)
        )

        blob_url = f"https://{account_name}.blob.core.windows.net/{container_name}/{filename}"
        upload_url = f"{blob_url}?{sas_token}"

        return Response({
            "upload_url": upload_url,  # 前端 PUT 上传用
            "blob_url": blob_url       # 提交 batch job 用
        })
    except Exception as e:
        return Response({"error": str(e)}, status=500)
    
# 提交 Azure Batch Job API
@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def submit_batch_job(request):
    audio_url = request.data.get("audio_url")
    if not audio_url:
        return Response({"error": "Missing audio_url"}, status=400)

    AZURE_REGION = settings.AZURE_SPEECH_REGION
    AZURE_KEY = settings.AZURE_SPEECH_KEY
    endpoint = f"https://{AZURE_REGION}.api.cognitive.microsoft.com/speechtotext/v3.1/transcriptions"

    headers = {
        "Ocp-Apim-Subscription-Key": AZURE_KEY,
        "Content-Type": "application/json"
    }

    job_name = f"sentriscribe-job-{uuid.uuid4().hex[:8]}"
    body = {
        "contentUrls": [audio_url],
        "locale": "en-US",
        "displayName": job_name,
        "properties": {
            "wordLevelTimestampsEnabled": True,
            "punctuationMode": "DictatedAndAutomatic"
        }
    }

    try:
        res = requests.post(endpoint, headers=headers, json=body)
        if res.status_code == 202:
            job_url = res.headers.get("Location")
            return Response({"job_url": job_url}, status=202)
        return Response({"error": "Failed to submit batch job", "detail": res.text}, status=res.status_code)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

# 获取转写结果
@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def get_transcription_result(request):
    job_url = request.query_params.get("job_url")
    if not job_url:
        return Response({"error": "Missing job_url"}, status=400)

    AZURE_KEY = settings.AZURE_SPEECH_KEY
    headers = {
        "Ocp-Apim-Subscription-Key": AZURE_KEY
    }

    try:
        status_response = requests.get(job_url, headers=headers).json()
        status = status_response.get("status")

        if status != "Succeeded":
            return Response({"status": status})

        result_url = status_response.get("resultsUrls", {}).get("channel_0")
        if not result_url:
            return Response({"error": "No result URL found"}, status=500)

        result_data = requests.get(result_url).json()

        segments = []
        for phrase in result_data.get("recognizedPhrases", []):
            offset = phrase.get("offset", 0) / 10**7
            duration = phrase.get("duration", 0) / 10**7
            text = phrase.get("nBest", [{}])[0].get("display", "")
            segments.append({
                "start": round(offset, 2),
                "end": round(offset + duration, 2),
                "text": text
            })

        return Response({"status": "Succeeded", "segments": segments})
    except Exception as e:
        return Response({"error": str(e)}, status=500)
