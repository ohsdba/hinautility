# 配置管理文档

## 概述

朝阳数据SQL查询工具采用分层配置管理策略，支持灵活的参数配置和运行时调整。配置系统分为应用配置、数据库配置和常用SQL配置三个主要部分。

## 配置文件结构

```
conf/
├── app_config.json      # 应用级配置
├── db_config.json       # 数据库配置（加密存储）
└── common_sql.json      # 常用SQL配置
```

## 应用配置 (app_config.json)

### 基本配置项

```json
{
    "app_auto_lock_timeout_minutes": 30,      // 自动锁定超时时间（分钟）
    "app_auto_lock_reminder_minutes": 25,     // 自动锁定提醒时间（分钟）
    "app_title": "朝阳数据",                   // 应用标题
    "db_statement_timeout": 30,               // 数据库语句超时时间（秒）
    "db_connect_timeout": 10,                 // 数据库连接超时时间（秒）
    "app_password": "",                       // 应用访问密码（加密存储）
    "app_max_connections": 10,                  // 最大连接数
    "app_min_connections": 1,                 // 最小连接数
    "app_connection_pool_timeout": 30,        // 连接池超时时间（秒）
    "app_result_cache_time": 3600,            // 结果缓存时间（秒）
    "app_max_result_size": 10000,             // 最大结果集大小
    "app_login_failures_limit": 5,            // 登录失败次数限制
    "app_account_lockout_minutes": 30,        // 账户锁定时间（分钟）
    "app_password_strength_required": false,  // 密码强度要求
    "app_log_level": "INFO",                  // 日志级别
    "app_log_retention_days": 30,             // 日志保留天数
    "app_audit_logging_enabled": true,        // 审计日志开关
    "app_theme_color": "default",             // 主题色彩
    "app_language": "zh-CN",                  // 界面语言
    "app_page_size": 50,                      // 页面大小
    "app_auto_save_interval": 300,            // 自动保存间隔（秒）
    "app_concurrent_queries": 5,              // 并发查询数
    "app_query_queue_size": 10,               // 查询队列大小
    "app_memory_limit_mb": 512,                 // 内存限制（MB）
    "app_batch_insert_size": 1000,            // 批量插入大小
    "app_transaction_timeout": 120,             // 事务超时时间（秒）
    "app_connection_retry_count": 3            // 连接重试次数
}
```

### 配置验证规则

#### 时间相关配置
- `app_auto_lock_timeout_minutes`: 1-1440分钟（24小时）
- `app_auto_lock_reminder_minutes`: 必须小于锁定时间且大于0
- `db_statement_timeout`: 必须为正数
- `db_connect_timeout`: 必须为正数

#### 数值范围配置
- `app_max_connections`: 必须为正数
- `app_min_connections`: 必须为非负数且小于最大连接数
- `app_max_result_size`: 必须为正数
- `app_login_failures_limit`: 必须为正数

#### 枚举值配置
- `app_log_level`: DEBUG, INFO, WARNING, ERROR, CRITICAL
- `app_theme_color`: default, blue, green, purple, red, orange, ocean, sunset, forest, night, sakura, ibm
- `app_language`: zh-CN, en-US

### 配置加载策略

```python
# 配置加载优先级
1. 默认配置 (DEFAULT_APP_CONFIG)
2. 文件配置 (app_config.json)
3. 运行时配置 (内存中的APP_CONFIG)
```

### 配置热重载

部分配置支持运行时更新，无需重启应用：
- 主题色彩 (`app_theme_color`)
- 页面大小 (`app_page_size`)
- 日志级别 (`app_log_level`)

## 数据库配置 (db_config.json)

### 配置格式

支持两种配置格式：

#### 单数据库配置（兼容旧版本）
```json
{
    "host": "localhost",
    "port": "5432",
    "user": "postgres",
    "password": "enc:加密后的密码",
    "database": "postgres",
    "type": "postgresql"
}
```

#### 多数据库配置（推荐）
```json
{
    "databases": [
        {
            "id": "db1",
            "name": "生产数据库",
            "type": "postgresql",
            "host": "localhost",
            "port": "5432",
            "user": "postgres",
            "password": "enc:加密后的密码",
            "database": "production",
            "is_default": true
        },
        {
            "id": "db2",
            "name": "测试数据库",
            "type": "mysql",
            "host": "localhost",
            "port": "3306",
            "user": "root",
            "password": "enc:加密后的密码",
            "database": "test",
            "is_default": false
        }
    ]
}
```

### 数据库类型支持

| 数据库类型 | 驱动名称 | 连接函数 | 备注 |
|-----------|----------|----------|------|
| postgresql | psycopg2 | get_postgresql_connection | PostgreSQL原生 |
| mysql | pymysql | get_mysql_connection | MySQL原生 |
| oracle | cx_Oracle | get_oracle_connection | Oracle原生 |
| kingbase | psycopg2 | get_postgresql_connection | 人大金仓，兼容PostgreSQL |
| tidb | pymysql | get_tidb_connection | TiDB，兼容MySQL |
| oceanbase | pymysql | get_oceanbase_connection | OceanBase，兼容MySQL |
| highgo | psycopg2 | get_postgresql_connection | 瀚高，兼容PostgreSQL |
| gauss | psycopg2 | get_postgresql_connection | 华为高斯，兼容PostgreSQL |
| uxdb | psycopg2 | get_postgresql_connection | 优图，兼容PostgreSQL |
| vastbase | psycopg2 | get_postgresql_connection | 海量，兼容PostgreSQL |
| yashandb | yasdb | get_yashandb_connection | 崖山，专用驱动 |
| dm | dm_python | get_dm_connection | 达梦，专用驱动 |
| shentong | cx_Oracle | get_oracle_connection | 神通，兼容Oracle |
| greatdb | pymysql | get_mysql_connection | 巨杉，兼容MySQL |
| gbase | psycopg2 | get_postgresql_connection | 南大通用，兼容PostgreSQL |
| vanward | psycopg2 | get_postgresql_connection | 万里，兼容PostgreSQL |

### 密码加密机制

#### 加密算法
```python
# 简单异或 + Base64加密
SECRET_KEY = b'data_check_sql_tool_key'

def encrypt_password(plain_password: str) -> str:
    data = plain_password.encode('utf-8')
    xored = bytes([b ^ SECRET_KEY[i % len(SECRET_KEY)] for i, b in enumerate(data)])
    return "enc:" + base64.b64encode(xored).decode('ascii')
```

#### 安全特性
- 本地加密存储，不传输明文密码
- 兼容旧版本明文密码（自动识别）
- 加密标识前缀 `enc:` 便于识别
- 支持解密验证和错误处理

### 连接参数配置

#### 超时参数
```json
{
    "db_statement_timeout": 30,     // 语句超时（秒）
    "db_connect_timeout": 10        // 连接超时（秒）
}
```

#### 连接池参数
```json
{
    "app_max_connections": 10,        // 最大连接数
    "app_min_connections": 1,         // 最小连接数
    "app_connection_pool_timeout": 30  // 连接池超时（秒）
}
```

## 常用SQL配置 (common_sql.json)

### 配置格式

```json
[
    {
        "id": "uuid-generated-id",
        "title": "查询版本信息",
        "sql": "SELECT version();"
    },
    {
        "id": "uuid-generated-id",
        "title": "查询活跃连接",
        "sql": "SELECT count(*) as active_connections FROM pg_stat_activity;"
    }
]
```

### 管理功能

#### 导入导出
- **导入**: 支持JSON格式的SQL列表导入
- **导出**: 导出当前保存的常用SQL列表
- **备份**: 自动备份机制，防止数据丢失

#### 编辑功能
- **新增**: 添加新的常用SQL语句
- **修改**: 编辑现有SQL语句的标题和内容
- **删除**: 删除不需要的SQL语句
- **搜索**: 按标题搜索常用SQL

### 使用场景

#### 数据库维护
```sql
-- 查询数据库大小
SELECT pg_database_size(current_database()) / 1024 / 1024 AS size_mb;

-- 查询表空间使用情况
SELECT spcname, pg_size_pretty(pg_tablespace_size(oid)) 
FROM pg_tablespace;
```

#### 性能监控
```sql
-- 查询慢查询
SELECT query, calls, total_time, mean_time 
FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- 查询锁信息
SELECT * FROM pg_locks 
WHERE NOT granted;
```

#### 数据查询
```sql
-- 查询最近更新的记录
SELECT * FROM your_table 
ORDER BY updated_at DESC 
LIMIT 100;

-- 查询表结构
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'your_table';
```

## 配置管理API

### 获取应用配置
```http
GET /get_app_config
Response: {
    "status": "success",
    "config": { ... }
}
```

### 保存应用配置
```http
POST /save_app_config
Content-Type: application/json
Body: { ...配置对象... }
Response: {
    "status": "success",
    "message": "配置保存成功"
}
```

### 获取数据库配置
```http
GET /get_saved_db_config
Response: [ ...数据库配置列表... ]
```

### 保存数据库配置
```http
POST /save_db_config
Content-Type: application/json
Body: { ...数据库配置对象... }
Response: {
    "status": "success",
    "message": "配置保存成功"
}
```

### 测试数据库连接
```http
POST /test_db_connection
Content-Type: application/json
Body: { ...数据库配置对象... }
Response: {
    "status": "success",
    "message": "数据库连接成功！使用驱动: PostgreSQL (psycopg2)"
}
```

## 配置最佳实践

### 1. 安全配置
- **密码强度**: 启用密码强度验证
- **访问控制**: 设置合理的自动锁定时间
- **日志审计**: 启用审计日志记录
- **连接安全**: 使用加密连接

### 2. 性能配置
- **连接池**: 根据数据库负载调整连接池大小
- **超时设置**: 设置合理的查询和连接超时
- **缓存策略**: 启用结果缓存提高性能
- **并发控制**: 限制并发查询数量

### 3. 维护配置
- **日志级别**: 生产环境使用INFO级别
- **日志保留**: 设置合理的日志保留时间
- **自动清理**: 启用过期数据自动清理
- **监控告警**: 配置性能监控和告警

### 4. 备份策略
- **配置备份**: 定期备份配置文件
- **版本控制**: 使用版本控制管理配置变更
- **回滚机制**: 准备配置回滚方案
- **文档更新**: 及时更新配置文档

## 故障排除

### 常见配置问题

#### 1. 数据库连接失败
```
问题: 连接超时或认证失败
解决: 
- 检查网络连接
- 验证用户名密码
- 确认数据库服务状态
- 检查防火墙设置
```

#### 2. 配置加载失败
```
问题: 配置文件格式错误或权限问题
解决:
- 验证JSON格式
- 检查文件权限
- 查看错误日志
- 恢复默认配置
```

#### 3. 性能问题
```
问题: 查询缓慢或内存不足
解决:
- 调整查询超时时间
- 增加内存限制
- 优化查询语句
- 启用结果缓存
```

### 调试工具

#### 1. 配置验证
```python
# 验证配置文件格式
def validate_config():
    try:
        with open('conf/app_config.json', 'r') as f:
            config = json.load(f)
        print("配置格式正确")
    except json.JSONDecodeError as e:
        print(f"JSON格式错误: {e}")
```

#### 2. 连接测试
```python
# 测试数据库连接
def test_connection():
    try:
        conn = psycopg2.connect(**db_config)
        print("数据库连接成功")
        conn.close()
    except Exception as e:
        print(f"连接失败: {e}")
```

#### 3. 性能监控
```python
# 监控查询性能
def monitor_performance():
    start_time = time.time()
    # 执行查询
    cursor.execute(sql)
    results = cursor.fetchall()
    end_time = time.time()
    print(f"查询耗时: {end_time - start_time}秒")
```

## 总结

配置管理系统是朝阳数据SQL查询工具的核心组件，提供了灵活、安全、可维护的配置管理能力。通过合理的配置管理，可以确保系统的稳定运行、性能优化和安全防护。建议定期审查和优化配置，以适应不断变化的业务需求和技术环境。