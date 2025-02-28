from django.urls import path
from .views import test_api

urlpatterns = [
    path('test/', test_api),  # 访问 /voice/test/ 时返回测试信息
]