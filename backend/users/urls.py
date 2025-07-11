from django.urls import path
from .views import RegisterView, LoginView, ChangePasswordView, get_azure_token, submit_batch_job, get_transcription_result, get_upload_url
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("users/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),  #  Token refresh API
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),  # 修改密码 API
    path("azure-token/", get_azure_token, name="azure-token"),# 获取 Azure OpenAI Token API
    path("submit-batch-job/", submit_batch_job, name="submit-batch-job"),  # batch job submission API
    path("get-transcription-result/", get_transcription_result, name="get-transcription-result"),  # 获取转录结果 API
    path("get-upload-url/", get_upload_url, name="get-upload-url"),  # 获取 SAS 上传链接
]
