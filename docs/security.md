# 安全特性与认证系统文档

## 概述

朝阳数据SQL查询工具采用多层安全防护体系，从应用层、传输层到数据层提供全方位的安全保障。系统设计遵循最小权限原则、深度防御原则和安全即代码理念，确保数据查询操作的安全性和合规性。

## 安全架构

### 多层安全模型

```
┌─────────────────────────────────────────────────────────────────┐
│                    应用层安全 (Application Security)           │
├─────────────────────────────────────────────────────────────────┤
│  应用密码保护  │  会话管理  │  权限控制  │  审计日志  │  配置加密   │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    传输层安全 (Transport Security)              │
├─────────────────────────────────────────────────────────────────┤
│  HTTPS支持   │  请求加密  │  响应签名  │  CSRF防护  │  XSS防护   │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    数据层安全 (Data Security)                  │
├─────────────────────────────────────────────────────────────────┤
│  SQL注入防护  │  数据脱敏  │  访问日志  │  备份恢复  │  数据加密   │
└─────────────────────────────────────────────────────────────────┘
```

## 认证系统

### 应用级密码保护

#### 密码策略配置
```json
{
    "app_password": "enc:加密后的密码",
    "app_password_strength_required": true,
    "app_login_failures_limit": 5,
    "app_account_lockout_minutes": 30
}
```

#### 密码强度验证
```python
def is_strong_password(password):
    """
    验证密码强度
    要求：至少6位，包含大写字母、小写字母、数字和特殊字符
    """
    import re
    
    # 检查长度
    if len(password) < 6:
        return False, "密码长度至少6位"
    
    # 检查是否包含大写字母
    if not re.search(r'[A-Z]', password):
        return False, "必须包含大写字母"
    
    # 检查是否包含小写字母
    if not re.search(r'[a-z]', password):
        return False, "必须包含小写字母"
    
    # 检查是否包含数字
    if not re.search(r'\d', password):
        return False, "必须包含数字"
    
    # 检查是否包含特殊字符
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "必须包含特殊字符"
    
    return True, "密码强度符合要求"
```

#### 密码加密存储
```python
def encrypt_app_password(plain_password: str) -> str:
    """对应用访问密码进行加密存储（异或 + Base64）"""
    if not plain_password:
        return ""
    data = plain_password.encode('utf-8')
    xored = bytes([b ^ SECRET_KEY[i % len(SECRET_KEY)] for i, b in enumerate(data)])
    return "enc:" + base64.b64encode(xored).decode('ascii')

def decrypt_app_password(enc_password: str) -> str:
    """解密应用访问密码"""
    if not enc_password:
        return ""
    if not enc_password.startswith("enc:"):
        return enc_password  # 兼容旧版本
    enc = enc_password[4:]
    try:
        xored = base64.b64decode(enc.encode('ascii'))
        data = bytes([b ^ SECRET_KEY[i % len(SECRET_KEY)] for i, b in enumerate(xored)])
        return data.decode('utf-8')
    except Exception as e:
        logging.error(f"解密应用访问密码失败：{e}")
        return ""
```

### 会话管理系统

#### 会话令牌生成
```python
def generate_session_token(password):
    """生成会话令牌"""
    import hashlib
    import time
    
    # 基于密码和时间戳生成令牌
    timestamp = str(int(time.time()))
    token_data = f"{password}:{timestamp}"
    return hashlib.sha256(token_data.encode()).hexdigest()
```

#### 认证装饰器
```python
def require_auth(f):
    """装饰器：验证用户是否已通过身份验证"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # 检查请求频率限制
        ip_address = request.environ.get('REMOTE_ADDR')
        if rate_limit_exceeded(ip_address):
            return jsonify({"status": "error", "message": "请求过于频繁，请稍后再试"}), 429
        
        # 检查是否需要密码验证
        app_password = load_app_password()
        if app_password and app_password.strip():  # 如果设置了应用密码
            session_token = request.headers.get('X-Session-Token') or request.cookies.get('session_token')
            if not session_token:
                return jsonify({"status": "error", "message": "请先进行身份验证"}), 401
            
            # 验证会话令牌
            expected_token = hashlib.sha256(app_password.encode()).hexdigest()
            if session_token != expected_token:
                return jsonify({"status": "error", "message": "身份验证已过期或无效"}), 401
        
        return f(*args, **kwargs)
    return decorated_function
```

### 账户锁定机制

#### 登录失败记录
```python
# 存储失败的登录尝试
FAILED_LOGIN_ATTEMPTS = {}  # 用户名 -> 失败时间戳列表
LOCKED_OUT_USERS = {}       # 用户名 -> 锁定时间戳

def record_failed_login_attempt(username):
    """记录失败的登录尝试"""
    now = time.time()
    if username not in FAILED_LOGIN_ATTEMPTS:
        FAILED_LOGIN_ATTEMPTS[username] = []
    
    # 清理5分钟前的尝试记录
    FAILED_LOGIN_ATTEMPTS[username] = [
        timestamp for timestamp in FAILED_LOGIN_ATTEMPTS[username]
        if now - timestamp < 300
    ]
    
    # 添加当前尝试
    FAILED_LOGIN_ATTEMPTS[username].append(now)
    
    # 检查是否达到最大尝试次数
    if len(FAILED_LOGIN_ATTEMPTS[username]) >= MAX_LOGIN_ATTEMPTS:
        LOCKED_OUT_USERS[username] = now  # 锁定用户
        logging.warning(f"用户 {username} 因多次登录失败被锁定")
```

#### 锁定状态检查
```python
def is_user_locked_out(username):
    """检查用户是否被锁定"""
    if username in LOCKED_OUT_USERS:
        if time.time() - LOCKED_OUT_USERS[username] < LOCKOUT_DURATION:
            return True, f"账户已锁定，请 {LOCKOUT_DURATION//60} 分钟后再试"
        else:
            # 锁定时间已过，清除锁定状态
            del LOCKED_OUT_USERS[username]
            if username in FAILED_LOGIN_ATTEMPTS:
                del FAILED_LOGIN_ATTEMPTS[username]
    return False, "账户正常"
```

## 请求频率限制

### IP级别频率控制
```python
# 请求频率限制配置
REQUEST_COUNTS = defaultdict(list)  # IP地址 -> 请求时间戳列表
MAX_REQUESTS_PER_MINUTE = 100       # 每分钟最大请求数
MAX_LOGIN_ATTEMPTS = 5             # 最大登录尝试次数
LOCKOUT_DURATION = 300             # 锁定持续时间（秒）

def rate_limit_exceeded(ip_address):
    """检查是否超过请求频率限制"""
    now = time.time()
    
    # 清理一分钟前的请求记录
    REQUEST_COUNTS[ip_address] = [
        timestamp for timestamp in REQUEST_COUNTS[ip_address] 
        if now - timestamp < 60
    ]
    
    # 检查是否超过限制
    if len(REQUEST_COUNTS[ip_address]) >= MAX_REQUESTS_PER_MINUTE:
        logging.warning(f"IP {ip_address} 超过请求频率限制")
        return True
    
    # 记录当前请求
    REQUEST_COUNTS[ip_address].append(now)
    return False
```

### 智能频率调节
```python
def adaptive_rate_limit(ip_address, user_agent, request_path):
    """智能频率限制，根据请求特征调整限制策略"""
    base_limit = MAX_REQUESTS_PER_MINUTE
    
    # 根据请求路径调整限制
    if request_path in ['/execute_sql', '/export_excel']:
        # 资源密集型操作，限制更严格
        limit = base_limit // 2
    elif request_path.startswith('/export_'):
        # 导出操作，限制更严格
        limit = base_limit // 3
    else:
        # 普通查询操作，标准限制
        limit = base_limit
    
    # 根据IP历史行为调整限制
    if is_suspicious_ip(ip_address):
        limit = limit // 2
    
    return limit

def is_suspicious_ip(ip_address):
    """判断IP是否为可疑IP"""
    # 检查短时间内的大量失败请求
    recent_failures = get_recent_failures(ip_address, time_window=300)
    if len(recent_failures) > 10:
        return True
    
    # 检查异常的请求模式
    request_pattern = analyze_request_pattern(ip_address)
    if request_pattern.get('suspicious_score', 0) > 0.8:
        return True
    
    return False
```

## SQL注入防护

### 多层SQL安全检查

#### 第一层：输入验证
```python
def validate_input(data, field_name, max_length=None, allowed_patterns=None):
    """验证输入数据"""
    if data is None:
        return False, f"{field_name} 不能为空"
    
    if not isinstance(data, str):
        data = str(data)
    
    # 检查长度
    if max_length and len(data) > max_length:
        return False, f"{field_name} 长度不能超过 {max_length} 个字符"
    
    # 根据字段名称决定验证策略
    if field_name.lower() == 'sql语句':
        # 对SQL语句使用较宽松的验证
        dangerous_patterns = [
            r"(?i)\b(shutdown|backup\s+database|restore\s+database)\b",
            r"(?i)(exec\s*\(|execute\s+\(|sp_|xp_)\s*[^']*;",
        ]
    else:
        # 对其他字段使用更严格的验证
        dangerous_patterns = [
            r"(?i)(drop\s+database|create\s+database|alter\s+database)",
            r"(?i)(exec\s*\(|execute\s+\(|sp_|xp_)",
            r"(?i)(;--|;|\*\/|--|#|/\*)",
            r"(?i)(grant\s+\w+\s+to|revoke\s+\w+\s+from)",
            r"(?i)(shutdown|backup\s+database)"
        ]
    
    for pattern in dangerous_patterns:
        if re.search(pattern, data):
            return False, f"{field_name} 包含非法字符或SQL注入尝试"
    
    return True, "验证通过"
```

#### 第二层：SQL安全校验
```python
def check_sql_safety(sql):
    """增强版SQL安全校验：禁止危险操作，但允许合法的数据操作"""
    # 移除注释和空格，避免绕过检测
    clean_sql = re.sub(r'/\*.*?\*/|--.*?$', '', sql, flags=re.DOTALL | re.MULTILINE).strip().upper()
    clean_sql = re.sub(r'\s+', ' ', clean_sql)
    
    # 危险操作关键词（更全面）
    dangerous_keywords = [
        'DROP', 'TRUNCATE', 'ALTER', 'CREATE', 'RENAME', 'GRANT', 'REVOKE', 'LOCK', 'SHUTDOWN'
    ]
    
    # 检查危险关键词（独立单词匹配，避免误判）
    for keyword in dangerous_keywords:
        if re.search(rf'\b{keyword}\b', clean_sql):
            return False, f"禁止执行包含「{keyword}」的危险SQL！"
    
    # 检查可能的SQL注入模式
    injection_patterns = [
        r"(?i)(\bUNION\b.*\bSELECT\b)",  # UNION注入
        r"(?i)(\bOR\b\s+\d+\s*=\s*\d+)",  # 永真式注入
        r"(?i)(exec\s*\(|execute\s+\(|sp_|xp_)\s*[^']*;",  # 存储过程执行
    ]
    
    for pattern in injection_patterns:
        if re.search(pattern, sql):
            return False, "检测到潜在的SQL注入攻击模式！"
    
    return True, ""
```

#### 第三层：数据库级安全
```python
def setup_database_security(conn, db_type):
    """设置数据库级安全参数"""
    try:
        cursor = conn.cursor()
        
        if db_type in ['postgresql', 'kingbase', 'highgo']:
            # PostgreSQL安全设置
            cursor.execute("SET session_replication_role = 'replica'")  # 禁止复制相关操作
            cursor.execute("SET statement_timeout = 30000")  # 30秒超时
            
        elif db_type in ['mysql', 'tidb', 'oceanbase']:
            # MySQL安全设置
            cursor.execute("SET SESSION sql_mode = 'STRICT_ALL_TABLES'")
            cursor.execute("SET SESSION MAX_EXECUTION_TIME = 30000")  # 30秒超时
            
        elif db_type in ['oracle', 'shentong']:
            # Oracle安全设置
            cursor.execute("ALTER SESSION SET SQL_TRACE = FALSE")  # 禁用SQL跟踪
            
    except Exception as e:
        logging.warning(f"数据库安全设置失败: {e}")
```

## 数据加密与脱敏

### 配置加密
```python
def encrypt_sensitive_config(config_value, key=SECRET_KEY):
    """加密敏感配置"""
    if not config_value:
        return ""
    
    # 使用异或 + Base64的简单加密
    data = config_value.encode('utf-8')
    xored = bytes([b ^ key[i % len(key)] for i, b in enumerate(data)])
    return "enc:" + base64.b64encode(xored).decode('ascii')

def decrypt_sensitive_config(encrypted_value, key=SECRET_KEY):
    """解密敏感配置"""
    if not encrypted_value or not encrypted_value.startswith("enc:"):
        return encrypted_value
    
    try:
        enc = encrypted_value[4:]
        xored = base64.b64decode(enc.encode('ascii'))
        data = bytes([b ^ key[i % len(key)] for i, b in enumerate(xored)])
        return data.decode('utf-8')
    except Exception as e:
        logging.error(f"配置解密失败: {e}")
        return ""
```

### 数据脱敏策略
```python
def mask_sensitive_data(data, data_type='general'):
    """数据脱敏处理"""
    if not data:
        return data
    
    masking_rules = {
        'email': lambda x: f"{x[:3]}***{x[x.find('@'):]}" if '@' in x else x,
        'phone': lambda x: f"{x[:3]}****{x[-4:]}" if len(x) >= 11 else x,
        'id_card': lambda x: f"{x[:4]}********{x[-4:]}" if len(x) >= 18 else x,
        'bank_card': lambda x: f"**** **** **** {x[-4:]}" if len(x) >= 16 else x,
        'password': lambda x: '*' * len(x),
        'general': lambda x: f"{x[:2]}***{x[-2:]}" if len(x) >= 4 else x
    }
    
    rule = masking_rules.get(data_type, masking_rules['general'])
    return rule(data)

def apply_data_masking(result_data, masking_config=None):
    """应用数据脱敏配置"""
    if not masking_config:
        return result_data
    
    masked_data = []
    for row in result_data:
        masked_row = []
        for i, cell in enumerate(row):
            column_name = masking_config.get(f'column_{i}', 'general')
            if column_name in masking_config.get('sensitive_columns', []):
                masked_row.append(mask_sensitive_data(str(cell), column_name))
            else:
                masked_row.append(cell)
        masked_data.append(masked_row)
    
    return masked_data
```

## 审计与日志

### 安全事件审计
```python
def log_security_event(event_type, details, severity='INFO'):
    """记录安全事件"""
    event_data = {
        'timestamp': datetime.now().isoformat(),
        'event_type': event_type,
        'ip_address': request.environ.get('REMOTE_ADDR', 'unknown'),
        'user_agent': request.headers.get('User-Agent', 'unknown'),
        'details': details,
        'severity': severity
    }
    
    # 根据严重程度选择日志级别
    if severity == 'CRITICAL':
        logging.critical(f"安全事件: {event_data}")
    elif severity == 'ERROR':
        logging.error(f"安全事件: {event_data}")
    elif severity == 'WARNING':
        logging.warning(f"安全事件: {event_data}")
    else:
        logging.info(f"安全事件: {event_data}")
    
    # 严重安全事件额外处理
    if severity in ['CRITICAL', 'ERROR']:
        send_security_alert(event_data)

def send_security_alert(event_data):
    """发送安全告警"""
    # 这里可以集成邮件、短信、企业微信等告警渠道
    alert_message = f"""
    安全告警
    时间: {event_data['timestamp']}
    类型: {event_data['event_type']}
    IP: {event_data['ip_address']}
    详情: {json.dumps(event_data['details'], ensure_ascii=False)}
    """
    
    # 记录到专门的告警日志
    logging.critical(f"SECURITY_ALERT: {alert_message}")
```

### 查询审计日志
```python
def log_query_execution(username, sql, db_config, execution_time, result_count, status):
    """记录查询执行日志"""
    audit_log = {
        'timestamp': datetime.now().isoformat(),
        'username': username,
        'sql': sql[:500],  # 只记录前500字符，避免日志过大
        'db_type': db_config.get('type', 'unknown'),
        'db_host': db_config.get('host', 'unknown'),
        'execution_time': execution_time,
        'result_count': result_count,
        'status': status,
        'ip_address': request.environ.get('REMOTE_ADDR', 'unknown')
    }
    
    # 记录到专门的审计日志文件
    audit_logger.info(json.dumps(audit_log, ensure_ascii=False))
```

## 安全配置最佳实践

### 1. 密码安全策略
```json
{
    "app_password_strength_required": true,
    "app_login_failures_limit": 3,
    "app_account_lockout_minutes": 60,
    "app_auto_lock_timeout_minutes": 30,
    "app_auto_lock_reminder_minutes": 25
}
```

### 2. 网络安全配置
```json
{
    "enable_https": true,
    "max_requests_per_minute": 50,
    "enable_cors": false,
    "allowed_origins": ["https://yourdomain.com"]
}
```

### 3. 数据库安全配置
```json
{
    "db_statement_timeout": 30,
    "db_connect_timeout": 10,
    "app_max_result_size": 5000,
    "enable_query_logging": true,
    "enable_sql_audit": true
}
```

## 安全事件响应

### 安全事件分类

| 事件类型 | 严重程度 | 响应措施 |
|----------|----------|----------|
| 密码暴力破解 | CRITICAL | 立即锁定账户，发送告警 |
| SQL注入尝试 | HIGH | 记录日志，阻止请求 |
| 异常查询模式 | MEDIUM | 记录日志，增加监控 |
| 配置变更 | LOW | 记录审计日志 |
| 正常访问 | INFO | 常规日志记录 |

### 应急响应流程
```python
def handle_security_incident(incident_data):
    """处理安全事件"""
    incident_type = incident_data['type']
    severity = incident_data['severity']
    
    # 立即响应措施
    if severity == 'CRITICAL':
        # 1. 立即阻止攻击源
        block_ip_address(incident_data['source_ip'])
        
        # 2. 锁定相关账户
        if incident_data.get('username'):
            lock_user_account(incident_data['username'])
        
        # 3. 发送紧急告警
        send_emergency_alert(incident_data)
        
    elif severity == 'HIGH':
        # 1. 记录详细日志
        log_security_event(incident_type, incident_data, 'ERROR')
        
        # 2. 增加监控频率
        increase_monitoring_frequency(incident_data['source_ip'])
        
    # 后续分析和改进
    analyze_security_incident(incident_data)
    update_security_rules(incident_data)
```

## 安全测试与验证

### 安全测试用例
```python
class SecurityTestCases:
    """安全测试用例集"""
    
    def test_password_strength(self):
        """测试密码强度验证"""
        weak_passwords = ['123456', 'password', 'abcdef']
        strong_passwords = ['Abc123!@#', 'MyP@ssw0rd', 'C0mpl3x!Pass']
        
        for password in weak_passwords:
            result, _ = is_strong_password(password)
            assert result == False, f"弱密码 {password} 应该被拒绝"
        
        for password in strong_passwords:
            result, _ = is_strong_password(password)
            assert result == True, f"强密码 {password} 应该被接受"
    
    def test_sql_injection_protection(self):
        """测试SQL注入防护"""
        injection_attempts = [
            "SELECT * FROM users WHERE id = 1 OR 1=1",
            "SELECT * FROM users UNION SELECT * FROM passwords",
            "'; DROP TABLE users; --",
            "EXECUTE('DROP DATABASE test')"
        ]
        
        for sql in injection_attempts:
            result, _ = check_sql_safety(sql)
            assert result == False, f"SQL注入 {sql} 应该被阻止"
    
    def test_rate_limiting(self):
        """测试频率限制"""
        test_ip = "192.168.1.100"
        
        # 模拟大量请求
        for i in range(MAX_REQUESTS_PER_MINUTE + 10):
            result = rate_limit_exceeded(test_ip)
            if i >= MAX_REQUESTS_PER_MINUTE:
                assert result == True, "超过频率限制后应该返回True"
```

### 渗透测试检查清单

#### 认证安全测试
- [ ] 密码暴力破解测试
- [ ] 会话劫持测试
- [ ] 会话固定测试
- [ ] 记住密码功能测试
- [ ] 密码重置功能测试

#### 输入验证测试
- [ ] SQL注入测试
- [ ] XSS攻击测试
- [ ] 命令注入测试
- [ ] 路径遍历测试
- [ ] 文件上传测试

#### 业务逻辑测试
- [ ] 权限绕过测试
- [ ] 数据越权测试
- [ ] 业务流程绕过测试
- [ ] 并发操作测试
- [ ] 异常处理测试

#### 配置安全测试
- [ ] 敏感信息泄露测试
- [ ] 错误信息泄露测试
- [ ] 目录遍历测试
- [ ] 默认配置测试
- [ ] 备份文件测试

## 合规性要求

### 数据保护合规
- **GDPR合规**: 用户数据保护、数据删除权利
- **等保2.0合规**: 等级保护基本要求
- **SOX合规**: 财务数据审计要求
- **HIPAA合规**: 医疗数据保护要求

### 审计合规
- **操作审计**: 所有操作完整记录
- **数据审计**: 数据访问和变更记录
- **安全审计**: 安全事件完整记录
- **合规报告**: 定期生成合规报告

## 总结

朝阳数据SQL查询工具的安全体系具有以下特点：

1. **多层防护**: 从应用到数据的全方位安全防护
2. **智能检测**: 基于行为的异常检测和响应
3. **审计追踪**: 完整的安全事件记录和追踪
4. **合规支持**: 支持多种合规性要求
5. **灵活配置**: 可根据需求调整安全策略
6. **持续改进**: 基于安全事件持续优化防护策略

该安全架构设计充分考虑了企业级应用的安全需求，能够有效防护各类安全威胁，确保数据查询操作的安全性和合规性。