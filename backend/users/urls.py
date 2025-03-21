from django.urls import path
from .views import RegisterView, LoginView, ChangePasswordView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("users/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),  #  Token refresh API
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),  # 修改密码 API
]
