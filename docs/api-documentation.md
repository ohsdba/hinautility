# API接口文档

## 概述

朝阳数据SQL查询工具提供RESTful API接口，支持数据库管理、SQL查询、数据导出等核心功能。所有API接口统一返回JSON格式数据，采用标准的HTTP状态码。

## 接口规范

### 通用规范

#### 请求格式
- **Content-Type**: `application/json`（POST/PUT请求）
- **字符编码**: UTF-8
- **请求方式**: GET、POST、PUT、DELETE

#### 响应格式
```json
{
    "status": "success|error",
    "message": "操作结果描述",
    "data": {},      // 响应数据（可选）
    "timestamp": "2024-01-01T12:00:00Z"
}
```

#### 状态码
| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未认证或认证失败 |
| 403 | 权限不足 |
| 404 | 资源不存在 |
| 429 | 请求频率超限 |
| 500 | 服务器内部错误 |

### 认证机制

#### 会话令牌
```http
GET /api/endpoint
X-Session-Token: {session_token}
```

#### Cookie认证
```http
GET /api/endpoint
Cookie: session_token={session_token}
```

## 数据库管理接口

### 获取数据库配置列表

#### 接口信息
- **URL**: `/databases`
- **方法**: `GET`
- **认证**: 需要

#### 请求参数
无

#### 响应示例
```json
{
    "status": "success",
    "data": [
        {
            "id": "db1",
            "name": "生产数据库",
            "type": "postgresql",
            "host": "localhost",
            "port": "5432",
            "user": "postgres",
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
            "database": "test",
            "is_default": false
        }
    ]
}
```

### 新增数据库配置

#### 接口信息
- **URL**: `/databases`
- **方法**: `POST`
- **认证**: 需要

#### 请求参数
```json
{
    "name": "新数据库",
    "type": "postgresql",
    "host": "localhost",
    "port": "5432",
    "user": "postgres",
    "password": "password123",
    "database": "newdb"
}
```

#### 响应示例
```json
{
    "status": "success",
    "message": "数据库配置新增成功！",
    "data": {
        "id": "db3",
        "name": "新数据库",
        "is_default": false
    }
}
```

### 更新数据库配置

#### 接口信息
- **URL**: `/databases`
- **方法**: `PUT`
- **认证**: 需要

#### 请求参数
```json
{
    "id": "db3",
    "name": "更新后的数据库",
    "type": "postgresql",
    "host": "localhost",
    "port": "5432",
    "user": "postgres",
    "password": "newpassword123",
    "database": "updatedb"
}
```

#### 响应示例
```json
{
    "status": "success",
    "message": "数据库配置更新成功！"
}
```

### 删除数据库配置

#### 接口信息
- **URL**: `/databases?id={db_id}`
- **方法**: `DELETE`
- **认证**: 需要

#### 请求参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 数据库配置ID |

#### 响应示例
```json
{
    "status": "success",
    "message": "数据库配置删除成功！"
}
```

### 测试数据库连接

#### 接口信息
- **URL**: `/test_db_connection`
- **方法**: `POST`
- **认证**: 需要

#### 请求参数
```json
{
    "host": "localhost",
    "port": "5432",
    "user": "postgres",
    "password": "password123",
    "database": "testdb",
    "type": "postgresql"
}
```

#### 响应示例
```json
{
    "status": "success",
    "message": "数据库连接成功！使用驱动: PostgreSQL (psycopg2)",
    "version": "PostgreSQL 13.0 on x86_64-pc-linux-gnu..."
}
```

### 设置默认数据库

#### 接口信息
- **URL**: `/set_default_db`
- **方法**: `POST`
- **认证**: 需要

#### 请求参数
```json
{
    "db_id": "db3"
}
```

#### 响应示例
```json
{
    "status": "success",
    "message": "默认数据库设置成功！"
}
```

## SQL查询接口

### 执行SQL查询

#### 接口信息
- **URL**: `/execute_sql`
- **方法**: `POST`
- **认证**: 需要

#### 请求参数（表单数据）
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sql | string | 是 | SQL语句 |
| page | integer | 否 | 页码，默认1 |
| page_size | integer | 否 | 每页条数，默认50 |
| db_id | string | 否 | 数据库ID |

#### 响应示例（查询成功）
```json
{
    "status": "success",
    "columns": ["id", "name", "email", "created_at"],
    "results": [
        [1, "张三", "zhangsan@example.com", "2024-01-01 10:00:00"],
        [2, "李四", "lisi@example.com", "2024-01-02 11:00:00"]
    ],
    "count": 2,
    "total_count": 100,
    "page": 1,
    "page_size": 50,
    "total_page": 2,
    "query_id": "uuid-123-456"
}
```

#### 响应示例（执行成功）
```json
{
    "status": "success",
    "message": "SQL执行成功！影响行数：5"
}
```

#### 响应示例（批量执行）
```json
{
    "status": "success",
    "message": "共执行3条语句",
    "results": [
        {
            "status": "success",
            "statement_index": 1,
            "original_sql": "SELECT * FROM users LIMIT 10",
            "count": 10
        },
        {
            "status": "error",
            "statement_index": 2,
            "original_sql": "INVALID SQL",
            "message": "SQL语法错误"
        }
    ],
    "is_batch": true
}
```

### 分析查询计划

#### 接口信息
- **URL**: `/analyze_query_plan`
- **方法**: `POST`
- **认证**: 需要

#### 请求参数（表单数据）
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sql | string | 是 | SQL查询语句 |
| db_id | string | 否 | 数据库ID |

#### 响应示例
```json
{
    "status": "success",
    "data": [
        {
            "Step": 1,
            "Operation": "Seq Scan on users (cost=0.00..25.88 rows=6 width=148)"
        },
        {
            "Step": 2,
            "Operation": "Filter: (id > 100)"
        }
    ],
    "columns": ["Step", "Operation"],
    "db_type": "postgresql",
    "message": "查询计划分析完成！"
}
```

## 数据导出接口

### 导出Excel

#### 接口信息
- **URL**: `/export_excel`
- **方法**: `GET`
- **认证**: 需要

#### 请求参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| query_id | string | 是 | 查询结果ID |
| header_color | string | 否 | 表头颜色代码，默认"4472C4" |
| include_header | boolean | 否 | 是否包含表头，默认true |
| filename | string | 否 | 自定义文件名 |

#### 响应示例
```http
HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="SQL查询结果_20240101.xlsx"

[二进制Excel文件数据]
```

### 导出CSV

#### 接口信息
- **URL**: `/export_csv`
- **方法**: `GET`
- **认证**: 需要

#### 请求参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| query_id | string | 是 | 查询结果ID |
| separator | string | 否 | 分隔符类型，默认"comma" |
| include_header | boolean | 否 | 是否包含表头，默认true |
| filename | string | 否 | 自定义文件名 |

#### 响应示例
```http
HTTP/1.1 200 OK
Content-Type: text/csv; charset=utf-8-sig
Content-Disposition: attachment; filename="SQL查询结果_20240101.csv"

[CSV文件内容]
```

### 导出HTML

#### 接口信息
- **URL**: `/export_html`
- **方法**: `GET`
- **认证**: 需要

#### 请求参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| query_id | string | 是 | 查询结果ID |
| filename | string | 否 | 自定义文件名 |

#### 响应示例
```http
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Disposition: attachment; filename="SQL查询结果_20240101.html"

[HTML报表内容]
```

## 常用SQL管理接口

### 获取常用SQL列表

#### 接口信息
- **URL**: `/common_sqls`
- **方法**: `GET`
- **认证**: 需要

#### 请求参数
无

#### 响应示例
```json
{
    "status": "success",
    "data": [
        {
            "id": "uuid-123",
            "title": "查询版本信息",
            "sql": "SELECT version();"
        },
        {
            "id": "uuid-456",
            "title": "查询活跃连接",
            "sql": "SELECT count(*) as active_connections FROM pg_stat_activity;"
        }
    ]
}
```

### 保存常用SQL

#### 接口信息
- **URL**: `/common_sqls`
- **方法**: `POST`
- **认证**: 需要

#### 请求参数
```json
{
    "id": "",  // 为空表示新增，有值表示更新
    "title": "查询数据库大小",
    "sql": "SELECT pg_database_size(current_database()) / 1024 / 1024 AS size_mb;"
}
```

#### 响应示例
```json
{
    "status": "success",
    "message": "保存成功！"
}
```

### 删除常用SQL

#### 接口信息
- **URL**: `/common_sqls?id={sql_id}`
- **方法**: `DELETE`
- **认证**: 需要

#### 请求参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | SQL配置ID |

#### 响应示例
```json
{
    "status": "success",
    "message": "删除成功！"
}
```

### 导入常用SQL

#### 接口信息
- **URL**: `/import_common_sqls`
- **方法**: `POST`
- **认证**: 需要

#### 请求参数
```json
[
    {
        "title": "查询版本",
        "sql": "SELECT version();"
    },
    {
        "title": "查询连接数",
        "sql": "SELECT count(*) FROM pg_stat_activity;"
    }
]
```

#### 响应示例
```json
{
    "status": "success",
    "message": "成功导入 2 条常用SQL"
}
```

### 导出常用SQL

#### 接口信息
- **URL**: `/export_common_sqls`
- **方法**: `GET`
- **认证**: 需要

#### 请求参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| filename | string | 否 | 自定义文件名 |

#### 响应示例
```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Disposition: attachment; filename="common_sqls_20240101.json"

[常用SQL配置文件内容]
```

## 认证相关接口

### 检查应用密码

#### 接口信息
- **URL**: `/check_app_password`
- **方法**: `POST`
- **认证**: 不需要

#### 请求参数
```json
{
    "password": "user_input_password"
}
```

#### 响应示例
```json
{
    "status": "success",
    "message": "验证通过",
    "has_password": true,
    "session_token": "sha256_hash_token"
}
```

### 更改应用密码

#### 接口信息
- **URL**: `/change_app_password`
- **方法**: `POST`
- **认证**: 需要

#### 请求参数
```json
{
    "old_password": "current_password",
    "new_password": "new_password",
    "confirm_new_password": "new_password"
}
```

#### 响应示例
```json
{
    "status": "success",
    "message": "密码修改成功"
}
```

### 设置应用密码

#### 接口信息
- **URL**: `/set_app_password`
- **方法**: `POST`
- **认证**: 不需要

#### 请求参数
```json
{
    "password": "new_password",
    "confirm_password": "new_password"
}
```

#### 响应示例
```json
{
    "status": "success",
    "message": "密码设置成功"
}
```

### 检查是否设置密码

#### 接口信息
- **URL**: `/has_app_password`
- **方法**: `GET`
- **认证**: 不需要

#### 请求参数
无

#### 响应示例
```json
{
    "has_password": true
}
```

## 配置管理接口

### 获取应用配置

#### 接口信息
- **URL**: `/get_app_config`
- **方法**: `GET`
- **认证**: 需要

#### 请求参数
无

#### 响应示例
```json
{
    "status": "success",
    "config": {
        "app_auto_lock_timeout_minutes": 30,
        "app_auto_lock_reminder_minutes": 25,
        "app_title": "朝阳数据",
        "db_statement_timeout": 30,
        "db_connect_timeout": 10,
        "app_max_connections": 10,
        "app_theme_color": "default"
    }
}
```

### 保存应用配置

#### 接口信息
- **URL**: `/save_app_config`
- **方法**: `POST`
- **认证**: 需要

#### 请求参数
```json
{
    "app_auto_lock_timeout_minutes": 40,
    "app_auto_lock_reminder_minutes": 35,
    "app_title": "数据爆表工具",
    "db_statement_timeout": 45,
    "db_connect_timeout": 15,
    "app_max_connections": 15,
    "app_theme_color": "night"
}
```

#### 响应示例
```json
{
    "status": "success",
    "message": "配置保存成功"
}
```

## 错误处理

### 通用错误响应
```json
{
    "status": "error",
    "message": "错误描述信息",
    "error_code": "ERROR_CODE",
    "details": {}  // 可选的详细错误信息
}
```

### 常见错误码
| 错误码 | 说明 | 示例 |
|--------|------|------|
| INVALID_PARAMS | 参数错误 | 缺少必填参数 |
| AUTH_FAILED | 认证失败 | 密码错误 |
| DB_CONNECTION_FAILED | 数据库连接失败 | 连接超时 |
| SQL_EXECUTION_ERROR | SQL执行错误 | 语法错误 |
| EXPORT_FAILED | 导出失败 | 内存不足 |
| RATE_LIMIT_EXCEEDED | 频率超限 | 请求过于频繁 |

## 使用示例

### Python示例
```python
import requests
import json

# API基础配置
BASE_URL = "http://localhost:5000"
SESSION_TOKEN = "your_session_token"

# 设置请求头
headers = {
    "Content-Type": "application/json",
    "X-Session-Token": SESSION_TOKEN
}

# 1. 执行SQL查询
def execute_sql(sql, db_id=None):
    data = {
        "sql": sql,
        "page": 1,
        "page_size": 100
    }
    if db_id:
        data["db_id"] = db_id
    
    response = requests.post(f"{BASE_URL}/execute_sql", data=data, headers=headers)
    return response.json()

# 2. 导出Excel
def export_to_excel(query_id, filename=None):
    params = {"query_id": query_id}
    if filename:
        params["filename"] = filename
    
    response = requests.get(f"{BASE_URL}/export_excel", params=params, headers=headers)
    
    if response.status_code == 200:
        with open(f"{filename or 'export'}.xlsx", "wb") as f:
            f.write(response.content)
        return True
    return False

# 3. 管理数据库配置
def add_database(config):
    response = requests.post(f"{BASE_URL}/databases", json=config, headers=headers)
    return response.json()

# 使用示例
if __name__ == "__main__":
    # 执行查询
    result = execute_sql("SELECT * FROM users LIMIT 10")
    if result["status"] == "success":
        query_id = result["query_id"]
        
        # 导出Excel
        export_to_excel(query_id, "用户数据")
        print("导出成功")
```

### JavaScript示例
```javascript
// API基础配置
const API_BASE = "http://localhost:5000";
const SESSION_TOKEN = "your_session_token";

// 通用请求函数
async function apiRequest(endpoint, options = {}) {
    const config = {
        headers: {
            "Content-Type": "application/json",
            "X-Session-Token": SESSION_TOKEN,
            ...options.headers
        },
        ...options
    };
    
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
}

// 1. 执行SQL查询
async function executeSQL(sql, dbId = null) {
    const formData = new FormData();
    formData.append("sql", sql);
    formData.append("page", "1");
    formData.append("page_size", "100");
    if (dbId) formData.append("db_id", dbId);
    
    const response = await fetch(`${API_BASE}/execute_sql`, {
        method: "POST",
        headers: {
            "X-Session-Token": SESSION_TOKEN
        },
        body: formData
    });
    
    return await response.json();
}

// 2. 导出数据
function exportData(queryId, format = "excel", options = {}) {
    const params = new URLSearchParams({
        query_id: queryId,
        ...options
    });
    
    window.open(`${API_BASE}/export_${format}?${params.toString()}`, "_blank");
}

// 3. 管理数据库
async function manageDatabase(action, data = null) {
    const endpoints = {
        "list": "/databases",
        "add": "/databases",
        "update": "/databases",
        "delete": `/databases?id=${data.id}`
    };
    
    const methods = {
        "list": "GET",
        "add": "POST",
        "update": "PUT",
        "delete": "DELETE"
    };
    
    return await apiRequest(endpoints[action], {
        method: methods[action],
        body: data && action !== "delete" ? JSON.stringify(data) : null
    });
}

// 使用示例
async function main() {
    try {
        // 执行查询
        const result = await executeSQL("SELECT * FROM users LIMIT 10");
        
        if (result.status === "success") {
            console.log("查询结果:", result);
            
            // 导出Excel
            exportData(result.query_id, "excel", {
                header_color: "4472C4",
                filename: "用户数据"
            });
        }
    } catch (error) {
        console.error("操作失败:", error);
    }
}

main();
```

## 版本信息

### 当前版本
- **版本号**: v1.0.0
- **发布日期**: 2024-01-01
- **API版本**: v1

### 更新日志
#### v1.0.0 (2024-01-01)
- 初始版本发布
- 支持基本的数据库管理和SQL查询功能
- 支持Excel、CSV、HTML格式导出
- 实现基础的安全认证机制

### 即将发布
#### v1.1.0 (计划中)
- 增加批量导出功能
- 支持更多数据库类型
- 增强安全认证机制
- 优化性能和稳定性

## 支持与联系

### 技术支持
- **邮箱**: support@chaoyangdata.com
- **文档**: https://docs.chaoyangdata.com
- **社区**: https://community.chaoyangdata.com

### 反馈建议
欢迎通过以下方式提供反馈和建议：
- 提交Issue到项目仓库
- 发送邮件到产品团队
- 在社区论坛发帖讨论

---

**朝阳数据API** - 让数据查询更简单、更安全、更高效！