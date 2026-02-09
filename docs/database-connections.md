# 数据库连接与多数据库支持文档

## 概述

朝阳数据SQL查询工具提供了强大的多数据库支持能力，支持16种不同类型的数据库系统，包括主流的国际数据库和国产数据库。系统采用统一的连接管理架构，确保连接的安全性、稳定性和高性能。

## 支持的数据库类型

### 国际主流数据库

| 数据库 | 类型标识 | 驱动 | 协议兼容性 | 备注 |
|--------|----------|------|------------|------|
| PostgreSQL | postgresql | psycopg2 | 原生 | 完全支持 |
| MySQL | mysql | pymysql | 原生 | 完全支持 |
| Oracle | oracle | cx_Oracle | 原生 | 完全支持 |

### 国产数据库

| 数据库 | 类型标识 | 驱动 | 协议兼容性 | 备注 |
|--------|----------|------|------------|------|
| 人大金仓 | kingbase | psycopg2 | PostgreSQL | 完全兼容 |
| 瀚高 | highgo | psycopg2 | PostgreSQL | 完全兼容 |
| 华为高斯 | gauss | psycopg2 | PostgreSQL | 完全兼容 |
| 优图 | uxdb | psycopg2 | PostgreSQL | 完全兼容 |
| 海量 | vastbase | psycopg2 | PostgreSQL | 完全兼容 |
| 崖山 | yashandb | yasdb | 专用 | 专用驱动 |
| 南大通用 | gbase | psycopg2 | PostgreSQL | 完全兼容 |
| 万里 | vanward | psycopg2 | PostgreSQL | 完全兼容 |
| 达梦 | dm | dm_python | 专用 | 专用驱动 |
| 神通 | shentong | cx_Oracle | Oracle | 完全兼容 |
| 巨杉 | greatdb | pymysql | MySQL | 完全兼容 |

### 分布式数据库

| 数据库 | 类型标识 | 驱动 | 协议兼容性 | 备注 |
|--------|----------|------|------------|------|
| TiDB | tidb | pymysql | MySQL | 完全兼容 |
| OceanBase | oceanbase | pymysql | MySQL | 完全兼容 |

## 连接架构设计

### 统一连接管理器

```python
# 数据库驱动映射表
DRIVER_MAPPING = {
    # PostgreSQL系列（包括兼容PostgreSQL协议的国产数据库）
    'postgresql': ('PostgreSQL', get_postgresql_connection, 'psycopg2'),
    'highgo': ('瀚高数据库', get_postgresql_connection, 'psycopg2'),
    'gauss': ('华为高斯数据库', get_postgresql_connection, 'psycopg2'),
    'uxdb': ('优图数据库', get_postgresql_connection, 'psycopg2'),
    'vastbase': ('海量数据库', get_postgresql_connection, 'psycopg2'),
    'yashandb': ('崖山数据库', get_yashandb_connection, 'yasdb'),
    'gbase': ('南大通用数据库', get_postgresql_connection, 'psycopg2'),
    'vanward': ('万里数据库', get_postgresql_connection, 'psycopg2'),
    'kingbase': ('人大金仓数据库', get_kingbase_connection, 'psycopg2'),
    
    # MySQL系列（包括兼容MySQL协议的数据库）
    'mysql': ('MySQL', get_mysql_connection, 'pymysql'),
    'tidb': ('TiDB分布式数据库', get_tidb_connection, 'pymysql'),
    'oceanbase': ('OceanBase数据库', get_oceanbase_connection, 'pymysql'),
    'greatdb': ('巨杉数据库', get_mysql_connection, 'pymysql'),
    
    # Oracle系列（包括兼容Oracle协议的数据库）
    'oracle': ('Oracle数据库', get_oracle_connection, 'cx_Oracle'),
    'shentong': ('神通数据库', get_oracle_connection, 'cx_Oracle'),
    
    # 专用驱动数据库
    'dm': ('达梦数据库', get_dm_connection, 'dm_python')
}
```

### 连接上下文管理器

所有数据库连接都使用Python的上下文管理器模式，确保连接的正确关闭和异常处理：

```python
@contextmanager
def get_connection(db_config):
    """统一连接管理器"""
    conn = None
    try:
        # 建立连接
        conn = create_connection(db_config)
        # 设置连接参数
        setup_connection(conn, db_config)
        yield conn
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()
```

## 数据库连接详解

### PostgreSQL系列数据库

#### PostgreSQL原生连接
```python
@contextmanager
def get_postgresql_connection(db_config):
    """PostgreSQL数据库连接上下文管理器"""
    conn = None
    try:
        import psycopg2
        # 解密密码
        decrypted_password = decrypt_password(db_config.get('password', ''))
        conn = psycopg2.connect(
            host=db_config['host'],
            port=int(db_config['port']),
            user=db_config['user'],
            password=decrypted_password,
            database=db_config['database'],
            connect_timeout=10  # 连接超时时间
        )
        yield conn
    except Exception as e:
        if conn:
            conn.rollback()
        raise e
    finally:
        if conn:
            conn.close()
```

#### 兼容数据库连接
人大金仓、瀚高、华为高斯等国产数据库完全兼容PostgreSQL协议，使用相同的连接方式：

```python
# 人大金仓连接（与PostgreSQL相同）
@contextmanager
def get_kingbase_connection(db_config):
    """人大金仓数据库连接上下文管理器"""
    return get_postgresql_connection(db_config)
```

### MySQL系列数据库

#### MySQL原生连接
```python
@contextmanager
def get_mysql_connection(db_config):
    """MySQL数据库连接上下文管理器"""
    try:
        import pymysql
        # 解密密码
        decrypted_password = decrypt_password(db_config.get('password', ''))
        conn = pymysql.connect(
            host=db_config['host'],
            port=int(db_config['port']),
            user=db_config['user'],
            password=decrypted_password,
            database=db_config['database'],
            charset='utf8mb4',
            connect_timeout=10
        )
        yield conn
    except ImportError:
        raise ImportError("请安装PyMySQL：pip install PyMySQL")
    except Exception as e:
        raise e
    finally:
        if 'conn' in locals() and conn:
            conn.close()
```

#### TiDB和OceanBase连接
TiDB和OceanBase完全兼容MySQL协议：

```python
@contextmanager
def get_tidb_connection(db_config):
    """TiDB数据库连接上下文管理器"""
    return get_mysql_connection(db_config)

@contextmanager
def get_oceanbase_connection(db_config):
    """OceanBase数据库连接上下文管理器"""
    return get_mysql_connection(db_config)
```

### Oracle系列数据库

#### Oracle原生连接
```python
@contextmanager
def get_oracle_connection(db_config):
    """Oracle数据库连接上下文管理器"""
    try:
        import cx_Oracle
        # 解密密码
        decrypted_password = decrypt_password(db_config.get('password', ''))
        dsn = cx_Oracle.makedsn(
            db_config['host'], 
            int(db_config['port']), 
            service_name=db_config['database']
        )
        conn = cx_Oracle.connect(
            user=db_config['user'],
            password=decrypted_password,
            dsn=dsn,
            encoding="UTF-8"
        )
        yield conn
    except ImportError:
        raise ImportError("请安装cx_Oracle：pip install cx_Oracle")
    except Exception as e:
        raise e
    finally:
        if 'conn' in locals() and conn:
            conn.close()
```

### 专用驱动数据库

#### 崖山数据库连接
```python
@contextmanager
def get_yashandb_connection(db_config):
    """崖山数据库连接上下文管理器（使用专用yasdb驱动）"""
    conn = None
    try:
        import yasdb
        # 解密密码
        decrypted_password = decrypt_password(db_config.get('password', ''))
        
        # 构造DSN连接字符串
        dsn = f"{db_config['host']}:{db_config['port']}"
        
        # 使用DSN方式连接
        conn = yasdb.connect(
            dsn=dsn,
            user=db_config['user'],
            password=decrypted_password,
        )
        yield conn
    except ImportError:
        raise Exception("未找到崖山数据库驱动(yasdb)，请安装yasdb包")
    except Exception as e:
        if conn:
            conn.rollback()
        raise Exception(f"崖山数据库连接失败: {str(e)}")
    finally:
        if conn:
            conn.close()
```

#### 达梦数据库连接
```python
@contextmanager
def get_dm_connection(db_config):
    """达梦数据库连接上下文管理器"""
    try:
        import dm_python as dm
        # 解密密码
        decrypted_password = decrypt_password(db_config.get('password', ''))
        conn = dm.connect(
            host=db_config['host'],
            port=int(db_config['port']),
            user=db_config['user'],
            password=decrypted_password,
            database=db_config['database'],
            connect_timeout=10
        )
        yield conn
    except ImportError:
        raise ImportError("请安装达梦数据库驱动：pip install dm-python")
    except Exception as e:
        raise e
    finally:
        if 'conn' in locals() and conn:
            conn.close()
```

## 连接池管理

### 连接池配置

```python
# 连接池参数配置
DB_POOL_CONFIG = {
    'max_connections': APP_CONFIG.get('app_max_connections', 10),
    'min_connections': APP_CONFIG.get('app_min_connections', 1),
    'connection_timeout': APP_CONFIG.get('app_connection_pool_timeout', 30),
    'retry_count': APP_CONFIG.get('app_connection_retry_count', 3)
}
```

### 连接生命周期管理

```python
def manage_connection_lifecycle():
    """连接生命周期管理"""
    # 1. 连接创建
    conn = create_connection()
    
    # 2. 连接验证
    if not validate_connection(conn):
        raise ConnectionError("连接验证失败")
    
    # 3. 连接使用
    try:
        yield conn
    finally:
        # 4. 连接清理
        cleanup_connection(conn)
        # 5. 连接关闭
        close_connection(conn)
```

## 多数据库管理

### 数据库配置结构

```json
{
    "databases": [
        {
            "id": "production_db",
            "name": "生产环境数据库",
            "type": "postgresql",
            "host": "prod-db.example.com",
            "port": "5432",
            "user": "prod_user",
            "password": "enc:加密后的密码",
            "database": "production",
            "is_default": true
        },
        {
            "id": "test_db",
            "name": "测试环境数据库",
            "type": "mysql",
            "host": "test-db.example.com",
            "port": "3306",
            "user": "test_user",
            "password": "enc:加密后的密码",
            "database": "test",
            "is_default": false
        }
    ]
}
```

### 数据库选择机制

```python
def get_database_by_id(db_id):
    """根据ID获取数据库配置"""
    config = load_multi_db_config()
    databases = config.get('databases', [])
    
    for db in databases:
        if db['id'] == db_id:
            return db
    
    return None

def get_default_database():
    """获取默认数据库配置"""
    config = load_multi_db_config()
    databases = config.get('databases', [])
    
    # 查找标记为默认的数据库
    for db in databases:
        if db.get('is_default', False):
            return db
    
    # 如果没有默认数据库，返回第一个
    if databases:
        return databases[0]
    
    return None
```

### 动态数据库切换

```python
def execute_sql_with_db_selection(sql, db_id=None):
    """根据数据库ID执行SQL"""
    # 获取数据库配置
    if db_id:
        db_config = get_database_by_id(db_id)
    else:
        db_config = get_default_database()
    
    if not db_config:
        raise ValueError("未找到有效的数据库配置")
    
    # 获取连接函数
    connection_func, _ = get_db_connection(db_id)
    
    # 执行SQL
    with connection_func(db_config) as conn:
        cursor = conn.cursor()
        cursor.execute(sql)
        return cursor.fetchall()
```

## 连接安全

### 密码加密存储

```python
def encrypt_password(plain_password: str) -> str:
    """对数据库密码进行简单加密存储（异或 + Base64）"""
    if not plain_password:
        return ""
    data = plain_password.encode('utf-8')
    xored = bytes([b ^ SECRET_KEY[i % len(SECRET_KEY)] for i, b in enumerate(data)])
    return "enc:" + base64.b64encode(xored).decode('ascii')

def decrypt_password(enc_password: str) -> str:
    """解密数据库密码，兼容未加密的旧数据"""
    if not enc_password:
        return ""
    if not enc_password.startswith("enc:"):
        # 旧版本明文存储，直接返回
        return enc_password
    enc = enc_password[4:]
    try:
        xored = base64.b64decode(enc.encode('ascii'))
        data = bytes([b ^ SECRET_KEY[i % len(SECRET_KEY)] for i, b in enumerate(xored)])
        return data.decode('utf-8')
    except Exception as e:
        logging.error(f"解密数据库密码失败：{e}")
        return ""
```

### 连接超时控制

```python
# 数据库超时配置
DB_TIMEOUT_CONFIG = {
    "statement_timeout": APP_CONFIG.get('db_statement_timeout', 30),
    "connect_timeout": APP_CONFIG.get('db_connect_timeout', 10)
}

def setup_connection_timeout(conn, db_type):
    """设置连接超时参数"""
    if db_type in ['postgresql', 'kingbase', 'highgo', 'gauss', 'uxdb', 'vastbase']:
        with conn.cursor() as cur:
            cur.execute(f"SET statement_timeout = {DB_TIMEOUT_CONFIG['statement_timeout']}000")
    elif db_type in ['mysql', 'tidb', 'oceanbase', 'greatdb']:
        with conn.cursor() as cur:
            cur.execute(f"SET SESSION MAX_EXECUTION_TIME = {DB_TIMEOUT_CONFIG['statement_timeout']}000")
    elif db_type == 'oracle':
        # Oracle的超时设置在连接级别
        pass
```

## 连接测试与验证

### 连接测试功能

```python
def test_db_connection(config):
    """测试数据库连接"""
    try:
        db_type = config.get('type', 'postgresql').lower()
        
        # 获取驱动信息
        driver_info = DRIVER_MAPPING.get(db_type)
        if not driver_info:
            return {
                "status": "error",
                "message": f"不支持的数据库类型：{db_type}"
            }
        
        # 测试连接
        connection_func = globals()[driver_info[1].__name__]
        with connection_func(config) as conn:
            # 执行简单查询验证连接
            cursor = conn.cursor()
            
            # 根据数据库类型选择测试查询
            if db_type in ['postgresql', 'kingbase', 'highgo', 'gauss', 'uxdb', 'vastbase']:
                cursor.execute("SELECT version()")
            elif db_type in ['mysql', 'tidb', 'oceanbase', 'greatdb']:
                cursor.execute("SELECT VERSION()")
            elif db_type in ['oracle', 'shentong']:
                cursor.execute("SELECT * FROM v$version WHERE rownum = 1")
            elif db_type == 'yashandb':
                cursor.execute("SELECT version()")
            elif db_type == 'dm':
                cursor.execute("SELECT * FROM v$version")
            
            result = cursor.fetchone()
            
            return {
                "status": "success",
                "message": f"数据库连接成功！使用驱动: {driver_info[0]} ({driver_info[2]})",
                "version": str(result[0]) if result else "Unknown"
            }
            
    except ImportError as e:
        return {
            "status": "error",
            "message": f"缺少数据库驱动，请安装：{str(e).split()[-1]}"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"连接失败：{str(e)}"
        }
```

### 连接状态监控

```python
class ConnectionMonitor:
    """连接状态监控器"""
    
    def __init__(self):
        self.active_connections = {}
        self.connection_stats = {}
    
    def record_connection(self, db_id, conn_info):
        """记录连接信息"""
        self.active_connections[db_id] = {
            'created_at': time.time(),
            'last_used': time.time(),
            'conn_info': conn_info
        }
    
    def update_connection_usage(self, db_id):
        """更新连接使用时间"""
        if db_id in self.active_connections:
            self.active_connections[db_id]['last_used'] = time.time()
    
    def get_connection_stats(self):
        """获取连接统计信息"""
        current_time = time.time()
        stats = {
            'total_connections': len(self.active_connections),
            'active_connections': 0,
            'idle_connections': 0,
            'long_running_connections': 0
        }
        
        for db_id, conn_info in self.active_connections.items():
            idle_time = current_time - conn_info['last_used']
            if idle_time < 60:  # 1分钟内使用过
                stats['active_connections'] += 1
            else:
                stats['idle_connections'] += 1
            
            if idle_time > 3600:  # 超过1小时
                stats['long_running_connections'] += 1
        
        return stats

# 全局连接监控器
connection_monitor = ConnectionMonitor()
```

## 性能优化

### 连接池优化

```python
# 连接池配置优化
OPTIMIZED_POOL_CONFIG = {
    'postgresql': {
        'max_overflow': 10,
        'pool_size': 5,
        'pool_timeout': 30,
        'pool_recycle': 3600
    },
    'mysql': {
        'max_overflow': 15,
        'pool_size': 8,
        'pool_timeout': 30,
        'pool_recycle': 1800
    },
    'oracle': {
        'max_overflow': 5,
        'pool_size': 3,
        'pool_timeout': 60,
        'pool_recycle': 7200
    }
}
```

### 查询优化策略

```python
def optimize_query_execution(sql, db_type):
    """查询执行优化"""
    optimizations = []
    
    # 根据数据库类型添加优化提示
    if db_type in ['postgresql', 'kingbase', 'highgo']:
        # PostgreSQL优化
        if 'SELECT' in sql.upper() and 'LIMIT' not in sql.upper():
            optimizations.append("考虑添加LIMIT限制结果集大小")
    
    elif db_type in ['mysql', 'tidb', 'oceanbase']:
        # MySQL优化
        if 'SELECT' in sql.upper() and 'LIMIT' not in sql.upper():
            optimizations.append("考虑添加LIMIT限制结果集大小")
    
    elif db_type in ['oracle', 'shentong']:
        # Oracle优化
        if 'SELECT' in sql.upper() and 'ROWNUM' not in sql.upper():
            optimizations.append("考虑使用ROWNUM限制结果集大小")
    
    return optimizations
```

## 故障排除

### 常见连接问题

#### 1. 驱动安装问题
```
问题: ImportError: No module named 'psycopg2'
解决: pip install psycopg2-binary

问题: ImportError: No module named 'cx_Oracle'
解决: pip install cx_Oracle

问题: ImportError: No module named 'yasdb'
解决: 安装崖山数据库提供的专用驱动
```

#### 2. 连接超时问题
```
问题: 连接超时或连接被拒绝
解决:
- 检查网络连接
- 确认数据库服务运行状态
- 检查防火墙设置
- 验证连接参数（主机、端口、用户名、密码）
```

#### 3. 认证失败问题
```
问题: 认证失败或权限不足
解决:
- 验证用户名和密码
- 检查数据库用户权限
- 确认数据库允许远程连接
- 检查密码加密和解密是否正确
```

#### 4. 字符编码问题
```
问题: 中文显示乱码
解决:
- 设置正确的字符编码（UTF-8）
- 检查数据库字符集配置
- 确认客户端字符集设置
```

### 连接调试工具

```python
def debug_connection(db_config):
    """连接调试工具"""
    debug_info = {
        'config_validation': validate_db_config(db_config),
        'network_test': test_network_connectivity(db_config),
        'driver_check': check_driver_availability(db_config['type']),
        'connection_test': None,
        'error_details': None
    }
    
    try:
        # 尝试建立连接
        connection_func = get_connection_function(db_config['type'])
        with connection_func(db_config) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
            result = cursor.fetchone()
            debug_info['connection_test'] = {
                'status': 'success',
                'result': result
            }
    except Exception as e:
        debug_info['connection_test'] = {
            'status': 'failed',
            'error': str(e)
        }
        debug_info['error_details'] = traceback.format_exc()
    
    return debug_info

def validate_db_config(db_config):
    """验证数据库配置"""
    required_fields = ['host', 'port', 'user', 'database', 'type']
    missing_fields = []
    
    for field in required_fields:
        if field not in db_config or not db_config[field]:
            missing_fields.append(field)
    
    return {
        'is_valid': len(missing_fields) == 0,
        'missing_fields': missing_fields,
        'config_summary': {
            'host': db_config.get('host'),
            'port': db_config.get('port'),
            'user': db_config.get('user'),
            'database': db_config.get('database'),
            'type': db_config.get('type')
        }
    }

def test_network_connectivity(db_config):
    """测试网络连通性"""
    import socket
    
    try:
        host = db_config['host']
        port = int(db_config['port'])
        
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)  # 5秒超时
        result = sock.connect_ex((host, port))
        sock.close()
        
        return {
            'reachable': result == 0,
            'host': host,
            'port': port,
            'error_code': result if result != 0 else None
        }
    except Exception as e:
        return {
            'reachable': False,
            'error': str(e)
        }

def check_driver_availability(db_type):
    """检查驱动可用性"""
    driver_mapping = {
        'postgresql': 'psycopg2',
        'mysql': 'pymysql',
        'oracle': 'cx_Oracle',
        'yashandb': 'yasdb',
        'dm': 'dm_python'
    }
    
    required_driver = driver_mapping.get(db_type)
    if not required_driver:
        return {
            'available': False,
            'error': f"不支持的数据库类型: {db_type}"
        }
    
    try:
        __import__(required_driver)
        return {
            'available': True,
            'driver': required_driver,
            'install_command': f"pip install {required_driver}"
        }
    except ImportError:
        return {
            'available': False,
            'driver': required_driver,
            'install_command': f"pip install {required_driver}"
        }
```

## 最佳实践

### 1. 连接配置最佳实践

```json
{
    "databases": [
        {
            "id": "production_pg",
            "name": "生产PostgreSQL",
            "type": "postgresql",
            "host": "prod-db.company.com",
            "port": "5432",
            "user": "app_user",
            "password": "enc:加密后的强密码",
            "database": "production_db",
            "is_default": true
        },
        {
            "id": "analytics_mysql",
            "name": "分析MySQL",
            "type": "mysql",
            "host": "analytics-db.company.com",
            "port": "3306",
            "user": "readonly_user",
            "password": "enc:加密后的密码",
            "database": "analytics_db",
            "is_default": false
        }
    ]
}
```

### 2. 性能优化建议

1. **连接池配置**: 根据数据库负载调整连接池大小
2. **超时设置**: 设置合理的连接和查询超时时间
3. **只读用户**: 为查询操作使用只读数据库用户
4. **网络优化**: 确保应用服务器与数据库服务器的网络质量
5. **监控告警**: 建立连接状态监控和告警机制

### 3. 安全配置建议

1. **密码复杂度**: 使用强密码并定期更换
2. **网络隔离**: 数据库服务器应部署在安全的网络区域
3. **访问控制**: 限制数据库用户的权限，遵循最小权限原则
4. **加密传输**: 启用数据库连接的SSL/TLS加密
5. **审计日志**: 启用数据库审计功能，记录所有查询操作

## 总结

朝阳数据SQL查询工具的多数据库支持架构具有以下特点：

1. **统一接口**: 所有数据库类型使用统一的连接和使用接口
2. **协议兼容**: 充分利用数据库协议的兼容性，减少驱动依赖
3. **安全可靠**: 完善的密码加密、连接超时和异常处理机制
4. **性能优异**: 连接池管理和查询优化策略
5. **易于扩展**: 标准化的数据库类型添加流程
6. **运维友好**: 完善的连接测试、监控和故障排除工具

该架构设计充分考虑了企业级应用的需求，能够支撑复杂的多数据库环境下的查询和分析需求。