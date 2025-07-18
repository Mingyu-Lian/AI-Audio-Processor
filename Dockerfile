# 1. 使用 Python 3.10 作为基础镜像
FROM python:3.10

# 2. 设置工作目录
WORKDIR /app

# 3. 复制 Python 依赖文件
COPY requirements.txt .

# 4. 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt

# 5. 复制所有代码到容器
COPY . .

# 6. 设置环境变量
ENV PYTHONPATH=/app

# 7. 运行数据库迁移
RUN python backend/manage.py migrate

# 8. 运行 Django 服务器
CMD ["python", "backend/manage.py", "runserver", "0.0.0.0:8000"]