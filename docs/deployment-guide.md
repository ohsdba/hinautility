# 部署与安装指南

## 概述

朝阳数据SQL查询工具支持多种部署方式，包括本地部署、容器化部署和云部署。本指南详细介绍了各种部署方式的步骤、配置要求和最佳实践。

## 系统要求

### 最低系统要求
- **操作系统**: Windows 10/11, Linux (Ubuntu 18.04+, CentOS 7+)
- **Python版本**: 3.7+
- **内存**: 2GB RAM（推荐4GB）
- **存储**: 1GB可用空间（推荐5GB）
- **网络**: 能够访问目标数据库

### 推荐系统配置
- **操作系统**: Linux (Ubuntu 20.04+)
- **Python版本**: 3.9+
- **内存**: 8GB RAM
- **存储**: 20GB SSD
- **CPU**: 4核
- **网络**: 千兆网络连接

## 本地部署

### 1. 环境准备

#### Python环境安装
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.9 python3.9-pip python3.9-venv

# CentOS/RHEL
sudo yum install epel-release
sudo yum install python39 python39-pip

# Windows
# 下载并安装Python 3.9+ from python.org
```

#### 创建虚拟环境
```bash
# 创建项目目录
mkdir chaoyang-data
cd chaoyang-data

# 创建虚拟环境
python3 -m venv venv

# 激活虚拟环境
# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 2. 依赖安装

#### 基础依赖
```bash
# 升级pip
pip install --upgrade pip

# 安装项目依赖
pip install -r requirements.txt
```

#### 数据库驱动安装
根据目标数据库类型安装相应驱动：

```bash
# PostgreSQL
pip install psycopg2-binary

# MySQL
pip install pymysql

# Oracle
pip install cx_Oracle

# 国产数据库（崖山）
pip install yasdb

# 国产数据库（达梦）
pip install dm-python
```

### 3. 配置文件

#### 应用配置 (conf/app_config.json)
```json
{
    "app_auto_lock_timeout_minutes": 30,
    "app_auto_lock_reminder_minutes": 25,
    "app_title": "朝阳数据",
    "db_statement_timeout": 30,
    "db_connect_timeout": 10,
    "app_password": "",
    "app_max_connections": 10,
    "app_theme_color": "default",
    "app_log_level": "INFO",
    "app_audit_logging_enabled": true
}
```

#### 数据库配置 (conf/db_config.json)
```json
{
    "databases": [
        {
            "id": "prod_db",
            "name": "生产数据库",
            "type": "postgresql",
            "host": "localhost",
            "port": "5432",
            "user": "postgres",
            "password": "enc:BQ==",
            "database": "production",
            "is_default": true
        }
    ]
}
```

### 4. 启动应用

#### 开发环境启动
```bash
# 激活虚拟环境
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate     # Windows

# 启动应用
python app.py

# 指定端口启动
python app.py --port=8080
```

#### 生产环境启动
```bash
# 使用Gunicorn启动（推荐）
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app

# 使用uWSGI启动
pip install uwsgi
uwsgi --http :5000 --module app:app --callable app
```

## 容器化部署

### 1. Docker部署

#### Dockerfile
```dockerfile
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装Python依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建必要的目录
RUN mkdir -p conf log

# 设置权限
RUN chmod +x app.py

# 暴露端口
EXPOSE 5000

# 启动命令
CMD ["python", "app.py", "--port=5000"]
```

#### Docker Compose配置
```yaml
version: '3.8'

services:
  chaoyang-data:
    build: .
    ports:
      - "5000:5000"
    volumes:
      - ./conf:/app/conf
      - ./log:/app/log
      - ./data:/app/data
    environment:
      - FLASK_ENV=production
      - PYTHONUNBUFFERED=1
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5000/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - chaoyang-data
    restart: unless-stopped
```

#### 构建和运行
```bash
# 构建镜像
docker build -t chaoyang-data:latest .

# 运行容器
docker run -d -p 5000:5000 --name chaoyang-data chaoyang-data:latest

# 使用Docker Compose
docker-compose up -d
```

### 2. Kubernetes部署

#### Deployment配置
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chaoyang-data
  labels:
    app: chaoyang-data
spec:
  replicas: 3
  selector:
    matchLabels:
      app: chaoyang-data
  template:
    metadata:
      labels:
        app: chaoyang-data
    spec:
      containers:
      - name: chaoyang-data
        image: chaoyang-data:latest
        ports:
        - containerPort: 5000
        env:
        - name: FLASK_ENV
          value: "production"
        volumeMounts:
        - name: config-volume
          mountPath: /app/conf
        - name: log-volume
          mountPath: /app/log
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 5000
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: config-volume
        configMap:
          name: chaoyang-data-config
      - name: log-volume
        emptyDir: {}
```

#### Service配置
```yaml
apiVersion: v1
kind: Service
metadata:
  name: chaoyang-data-service
spec:
  selector:
    app: chaoyang-data
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5000
  type: ClusterIP
```

#### ConfigMap配置
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: chaoyang-data-config
data:
  app_config.json: |
    {
      "app_auto_lock_timeout_minutes": 30,
      "app_auto_lock_reminder_minutes": 25,
      "app_title": "朝阳数据",
      "db_statement_timeout": 30,
      "db_connect_timeout": 10,
      "app_max_connections": 10,
      "app_theme_color": "default",
      "app_log_level": "INFO",
      "app_audit_logging_enabled": true
    }
  db_config.json: |
    {
      "databases": [
        {
          "id": "k8s_db",
          "name": "Kubernetes数据库",
          "type": "postgresql",
          "host": "postgres-service",
          "port": "5432",
          "user": "postgres",
          "password": "enc:BQ==",
          "database": "chaoyang_data",
          "is_default": true
        }
      ]
    }
```

#### Ingress配置
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: chaoyang-data-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - data.yourcompany.com
    secretName: chaoyang-data-tls
  rules:
  - host: data.yourcompany.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: chaoyang-data-service
            port:
              number: 80
```

## 云部署

### 1. AWS部署

#### ECS部署
```json
{
  "family": "chaoyang-data-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "chaoyang-data",
      "image": "your-account.dkr.ecr.region.amazonaws.com/chaoyang-data:latest",
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "FLASK_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/chaoyang-data",
          "awslogs-region": "us-west-2",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### RDS数据库配置
```bash
# 创建RDS PostgreSQL实例
aws rds create-db-instance \
    --db-instance-identifier chaoyang-data-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username postgres \
    --master-user-password YourPassword123 \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-xxxxxxxx \
    --db-subnet-group-name default-vpc-xxxxxxxx
```

### 2. 阿里云部署

#### 容器服务ACK
```yaml
# 使用阿里云容器服务
apiVersion: apps/v1
kind: Deployment
metadata:
  name: chaoyang-data
  namespace: default
spec:
  replicas: 2
  selector:
    matchLabels:
      app: chaoyang-data
  template:
    spec:
      containers:
      - name: chaoyang-data
        image: registry.cn-hangzhou.aliyuncs.com/your-repo/chaoyang-data:latest
        ports:
        - containerPort: 5000
        env:
        - name: ALICLOUD_ACCESS_KEY_ID
          valueFrom:
            secretKeyRef:
              name: alicloud-credentials
              key: access-key-id
        - name: ALICLOUD_ACCESS_KEY_SECRET
          valueFrom:
            secretKeyRef:
              name: alicloud-credentials
              key: access-key-secret
```

#### RDS配置
```bash
# 创建RDS PostgreSQL实例
aliyun rds CreateDBInstance \
    --RegionId cn-hangzhou \
    --Engine PostgreSQL \
    --EngineVersion 13.0 \
    --DBInstanceClass rds.pg.s1.small \
    --DBInstanceStorage 20 \
    --DBInstanceNetType Intranet \
    --SecurityIPList 0.0.0.0/0
```

### 3. 腾讯云部署

#### 云托管部署
```yaml
# app.yaml for Tencent Cloud
runtime: python39
entrypoint: gunicorn -b :$PORT app:app

env_variables:
  FLASK_ENV: production
  
automatic_scaling:
  min_instances: 1
  max_instances: 10
  target_cpu_utilization: 0.6

resources:
  cpu: 1
  memory_gb: 2
  disk_size_gb: 10
```

## 高可用部署

### 1. 负载均衡配置

#### Nginx负载均衡
```nginx
upstream chaoyang_data_backend {
    least_conn;
    server app1.example.com:5000 weight=3 max_fails=3 fail_timeout=30s;
    server app2.example.com:5000 weight=2 max_fails=3 fail_timeout=30s;
    server app3.example.com:5000 weight=1 max_fails=3 fail_timeout=30s;
    
    keepalive 32;
}

server {
    listen 80;
    server_name data.example.com;
    
    location / {
        proxy_pass http://chaoyang_data_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
        
        # 缓冲区设置
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
        proxy_busy_buffers_size 8k;
    }
    
    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 2. 数据库高可用

#### PostgreSQL主从配置
```bash
# 主库配置 (postgresql.conf)
wal_level = replica
max_wal_senders = 3
wal_keep_segments = 64
hot_standby = on

# 从库配置 (recovery.conf)
standby_mode = 'on'
primary_conninfo = 'host=master_ip port=5432 user=replica_user'
trigger_file = '/tmp/postgresql.trigger'
```

#### MySQL主从配置
```sql
-- 主库配置
CHANGE MASTER TO
MASTER_HOST='master_ip',
MASTER_USER='replica_user',
MASTER_PASSWORD='password',
MASTER_LOG_FILE='mysql-bin.000001',
MASTER_LOG_POS=107;

START SLAVE;
```

## 安全配置

### 1. HTTPS配置

#### Nginx SSL配置
```nginx
server {
    listen 443 ssl http2;
    server_name data.yourcompany.com;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    
    location / {
        proxy_pass http://chaoyang_data_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name data.yourcompany.com;
    return 301 https://$server_name$request_uri;
}
```

### 2. 防火墙配置

#### Linux防火墙（iptables）
```bash
# 允许SSH
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# 允许HTTP/HTTPS
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT

# 允许应用端口（仅对特定IP）
iptables -A INPUT -p tcp -s 192.168.1.0/24 --dport 5000 -j ACCEPT

# 拒绝其他所有连接
iptables -A INPUT -j DROP

# 保存规则
iptables-save > /etc/iptables/rules.v4
```

#### 云安全组配置
```bash
# AWS Security Group
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxx \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxx \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxx \
    --protocol tcp \
    --port 5000 \
    --cidr 10.0.0.0/8
```

## 监控与运维

### 1. 应用监控

#### Prometheus监控配置
```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'chaoyang-data'
    static_configs:
      - targets: ['localhost:5000']
    metrics_path: '/metrics'
    scrape_interval: 5s
```

#### 自定义监控指标
```python
# 在app.py中添加监控指标
from prometheus_client import Counter, Histogram, Gauge

# 请求计数器
request_count = Counter('chaoyang_data_requests_total', 'Total requests', ['method', 'endpoint'])

# 请求延迟
request_latency = Histogram('chaoyang_data_request_duration_seconds', 'Request latency')

# 活跃连接数
active_connections = Gauge('chaoyang_data_active_connections', 'Active database connections')

@app.before_request
def before_request():
    request.start_time = time.time()

@app.after_request
def after_request(response):
    request_latency.observe(time.time() - request.start_time)
    request_count.labels(method=request.method, endpoint=request.endpoint).inc()
    return response
```

### 2. 日志管理

#### 日志轮转配置
```bash
# /etc/logrotate.d/chaoyang-data
/app/log/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 app app
    postrotate
        # 重新打开日志文件
        kill -USR1 $(cat /var/run/chaoyang-data.pid)
    endscript
}
```

#### 集中式日志（ELK Stack）
```yaml
# filebeat.yml
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /app/log/*.log
  fields:
    service: chaoyang-data
    environment: production

output.elasticsearch:
  hosts: ["elasticsearch:9200"]
  index: "chaoyang-data-%{+yyyy.MM.dd}"

logging.level: info
```

## 备份与恢复

### 1. 配置备份

#### 自动备份脚本
```bash
#!/bin/bash
# backup-config.sh

BACKUP_DIR="/backup/chaoyang-data"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR/$DATE

# 备份配置文件
cp -r /app/conf $BACKUP_DIR/$DATE/
cp -r /app/log $BACKUP_DIR/$DATE/

# 压缩备份
tar -czf $BACKUP_DIR/chaoyang-data-config-$DATE.tar.gz -C $BACKUP_DIR $DATE

# 删除7天前的备份
find $BACKUP_DIR -name "chaoyang-data-config-*.tar.gz" -mtime +7 -delete

# 上传到云存储（可选）
aws s3 cp $BACKUP_DIR/chaoyang-data-config-$DATE.tar.gz s3://your-backup-bucket/
```

#### 定时任务
```bash
# 添加到crontab
0 2 * * * /app/scripts/backup-config.sh >> /var/log/backup.log 2>&1
```

### 2. 数据库备份

#### PostgreSQL备份
```bash
#!/bin/bash
# backup-database.sh

DB_HOST="localhost"
DB_USER="postgres"
DB_NAME="chaoyang_data"
BACKUP_DIR="/backup/database"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -f $BACKUP_DIR/chaoyang-data-$DATE.sql

# 压缩备份
gzip $BACKUP_DIR/chaoyang-data-$DATE.sql

# 删除30天前的备份
find $BACKUP_DIR -name "chaoyang-data-*.sql.gz" -mtime +30 -delete
```

## 性能优化

### 1. 应用性能优化

#### Gunicorn配置优化
```bash
# gunicorn_config.py
import multiprocessing

# 工作进程数
workers = multiprocessing.cpu_count() * 2 + 1

# 工作模式
worker_class = 'gevent'

# 最大并发数
worker_connections = 1000

# 超时时间
timeout = 30

# 保持连接
keepalive = 2

# 最大请求数
max_requests = 1000
max_requests_jitter = 50

# 预加载应用
preload_app = True

# 绑定地址
bind = '0.0.0.0:5000'

# 日志配置
accesslog = '/app/log/gunicorn-access.log'
errorlog = '/app/log/gunicorn-error.log'
loglevel = 'info'
```

#### 数据库连接池优化
```python
# 在数据库连接配置中优化连接池参数
DATABASE_CONFIG = {
    'pool_size': 10,           # 连接池大小
    'max_overflow': 20,        # 最大溢出连接数
    'pool_timeout': 30,        # 连接超时时间
    'pool_recycle': 3600,      # 连接回收时间
    'pool_pre_ping': True,     # 连接健康检查
}
```

### 2. 系统性能优化

#### Linux内核参数优化
```bash
# /etc/sysctl.conf
# 网络优化
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.ip_local_port_range = 1024 65535

# 文件描述符优化
fs.file-max = 6553560
fs.nr_open = 6553560

# 内存优化
vm.swappiness = 10
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
```

#### Nginx性能优化
```nginx
# nginx.conf
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    use epoll;
    worker_connections 65535;
    multi_accept on;
}

http {
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    keepalive_requests 1000;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # 缓存配置
    open_file_cache max=200000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
}
```

## 故障排除

### 1. 常见启动问题

#### 端口占用
```bash
# 检查端口占用
netstat -tlnp | grep :5000
lsof -i :5000

# 终止占用进程
kill -9 <PID>

# 或更换端口
python app.py --port=8080
```

#### 依赖缺失
```bash
# 检查缺失的依赖
pip check

# 重新安装依赖
pip install -r requirements.txt --force-reinstall

# 安装系统依赖
# Ubuntu/Debian
sudo apt install build-essential python3-dev

# CentOS/RHEL
sudo yum groupinstall "Development Tools"
sudo yum install python3-devel
```

#### 数据库连接失败
```bash
# 检查数据库服务
systemctl status postgresql
systemctl status mysql

# 测试连接
psql -h localhost -U postgres -d testdb
mysql -h localhost -u root -p

# 检查防火墙
sudo ufw status
sudo iptables -L
```

### 2. 性能问题

#### 内存使用过高
```bash
# 监控内存使用
htop
top -o %MEM

# 检查内存泄漏
pip install memory_profiler
python -m memory_profiler app.py

# 优化建议
# 1. 减少查询结果集大小
# 2. 启用结果缓存
# 3. 优化数据库查询
# 4. 增加服务器内存
```

#### CPU使用过高
```bash
# 监控CPU使用
top -o %CPU

# 分析性能瓶颈
pip install py-spy
py-spy top --pid <PID>

# 优化建议
# 1. 优化SQL查询
# 2. 增加数据库索引
# 3. 启用连接池
# 4. 增加服务器CPU
```

## 总结

朝阳数据SQL查询工具支持多种部署方式，具有以下特点：

1. **部署灵活**: 支持本地、容器、云等多种部署方式
2. **配置简单**: 标准化的配置流程和模板
3. **高可用**: 支持负载均衡和故障转移
4. **安全**: 完善的HTTPS和安全配置
5. **可监控**: 集成Prometheus等监控工具
6. **易维护**: 完善的日志和备份策略

选择合适的部署方式，按照最佳实践进行配置，可以确保系统的稳定运行和高性能表现。