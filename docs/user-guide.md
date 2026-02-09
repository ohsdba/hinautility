# 用户指南与故障排除

## 概述

本指南为朝阳数据SQL查询工具的终端用户提供详细的使用说明和故障排除方案。无论您是数据分析师、开发人员还是数据库管理员，都能通过本指南快速掌握工具的使用方法。

## 快速入门

### 首次访问

1. **打开浏览器** 访问应用地址（如：http://localhost:5000）
2. **系统检查** 系统会自动检查配置和连接状态
3. **身份验证** 如果设置了应用密码，需要输入密码登录
4. **开始使用** 验证通过后即可开始使用各项功能

### 界面概览

```
┌─────────────────────────────────────────────────────────────┐
│  朝阳数据 - 标题栏 (包含主题切换、退出等)                    │
├─────────────────────────────────────────────────────────────┤
│  【数据库连接】 【SQL编辑器】 【常用SQL】 【设置】           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐  │
│  │  数据库连接区域                                      │  │
│  │  - 数据库选择下拉框                                  │  │
│  │  - 连接测试按钮                                      │  │  │
├─┼─────────────────────────────────────────────────────┼──┤
│  │  SQL编辑器                                          │  │
│  │  - 语法高亮                                         │  │
│  │  - 代码美化                                         │  │
│  │  - 执行按钮                                         │  │
│  └─────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  查询结果区域                                               │
│  - 数据表格展示                                        │  │
│  - 分页控制                                            │  │
│  - 导出按钮 (Excel/CSV/HTML)                          │  │
└─────────────────────────────────────────────────────────────┘
```

## 功能使用指南

### 数据库连接管理

#### 添加数据库连接

1. **点击"数据库连接"标签页**
2. **填写连接信息**:
   - 连接名称：给连接起个有意义的名称
   - 数据库类型：选择目标数据库类型
   - 主机地址：数据库服务器地址
   - 端口：数据库服务端口
   - 用户名：数据库用户名
   - 密码：数据库密码
   - 数据库名：要连接的数据库名称

3. **测试连接** 点击"测试连接"按钮验证配置
4. **保存配置** 连接测试通过后点击"保存"

#### 数据库类型选择

| 数据库类型 | 连接参数 | 特殊说明 |
|-----------|----------|----------|
| PostgreSQL | 标准连接参数 | 完全支持 |
| MySQL | 标准连接参数 | 完全支持 |
| Oracle | 标准连接参数 | 需要安装客户端 |
| 人大金仓 | PostgreSQL参数 | 兼容PostgreSQL |
| TiDB | MySQL参数 | 兼容MySQL |
| OceanBase | MySQL参数 | 兼容MySQL |
| 达梦 | 专用参数 | 需要专用驱动 |
| 崖山 | 专用参数 | 需要专用驱动 |

#### 连接测试最佳实践

```sql
-- PostgreSQL测试查询
SELECT version();
SELECT current_database();
SELECT current_user;

-- MySQL测试查询  
SELECT VERSION();
SELECT DATABASE();
SELECT USER();

-- Oracle测试查询
SELECT * FROM v$version WHERE rownum = 1;
SELECT name FROM v$database;
SELECT user FROM dual;
```

### SQL查询功能

#### 基本查询操作

1. **选择数据库** 从下拉框选择目标数据库
2. **编写SQL语句** 在编辑器中输入SQL
3. **执行查询** 点击"执行"按钮或按Ctrl+Enter
4. **查看结果** 在结果区域查看查询结果

#### SQL编辑器功能

##### 语法高亮
```sql
-- 关键字高亮（蓝色）
SELECT * FROM users WHERE id > 100;

-- 字符串高亮（绿色）
SELECT name FROM users WHERE status = 'active';

-- 数字高亮（紫色）
SELECT price * 1.1 AS new_price FROM products;

-- 注释高亮（灰色）
-- 这是一个注释
SELECT * FROM users; /* 多行注释 */
```

##### 代码美化
```sql
-- 美化前
select u.name,u.email,count(o.id) from users u join orders o on u.id=o.user_id where u.status='active' group by u.name,u.email;

-- 美化后
SELECT 
    u.name,
    u.email,
    COUNT(o.id)
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE u.status = 'active'
GROUP BY u.name, u.email;
```

##### 智能提示
- **表名提示**: 输入表名前缀时自动提示
- **字段提示**: 输入表名后提示可用字段
- **关键字提示**: SQL关键字自动补全

#### 查询结果操作

##### 结果排序
- 点击列标题可按该列排序
- 支持升序/降序切换
- 多列排序支持

##### 结果筛选
- 在搜索框输入关键词筛选
- 支持正则表达式筛选
- 大小写敏感/不敏感选项

##### 分页浏览
- 支持自定义每页显示条数（10/25/50/100）
- 快速跳转到指定页码
- 显示总记录数和总页数

### 数据导出功能

#### Excel导出

1. **选择导出格式** 点击"导出Excel"按钮
2. **配置导出选项**:
   - 表头颜色：选择表格标题颜色
   - 包含表头：选择是否导出列名
   - 文件名：自定义导出文件名
3. **执行导出** 点击确认开始导出

##### Excel导出最佳实践
```javascript
// 导出销售数据报表
exportToExcel('sales-report', {
    headerColor: '4472C4',  // 蓝色表头
    includeHeader: true,
    filename: '2024年销售报表_第一季度'
});

// 导出用户数据分析
exportToExcel('user-analysis', {
    headerColor: '70AD47',  // 绿色表头
    includeHeader: true,
    filename: '用户行为分析报告'
});
```

#### CSV导出

1. **选择分隔符**:
   - 逗号（,）: 标准CSV格式
   - 分号（;）: 欧洲常用格式
   - 制表符（\t）: Excel友好格式
   - 竖线（|）: 管道分隔格式
   - 空格（ ）: 空格分隔格式

2. **配置导出选项**:
   - 包含表头：是否包含列名
   - 文件名：自定义导出文件名

##### CSV导出场景
```javascript
// 导出欧洲客户数据（使用分号分隔符）
exportToCSV('european-customers', {
    separator: 'semicolon',  // 分号分隔符
    includeHeader: true,
    filename: '欧洲客户数据_2024'
});

// 导出制表符分隔的数据（适合Excel导入）
exportToCSV('financial-data', {
    separator: 'tab',        // 制表符分隔
    includeHeader: true,
    filename: '财务数据_制表符分隔'
});
```

#### HTML导出

生成专业的HTML报表，具有以下特性：
- **Oracle AWR风格**: 专业的报表样式
- **响应式设计**: 适配各种设备
- **打印友好**: 优化的打印样式
- **完整信息**: 包含查询时间、记录数等统计

### 常用SQL管理

#### 添加常用SQL

1. **点击"常用SQL"标签页**
2. **点击"新增"按钮**
3. **填写信息**:
   - 标题：SQL语句的描述性标题
   - SQL语句：要保存的SQL代码
4. **保存** 点击"保存"按钮

#### 常用SQL示例

```sql
-- 1. 数据库基本信息
-- 标题：查询数据库版本
SELECT version();

-- 2. 连接状态监控
-- 标题：查询活跃连接数
SELECT count(*) as active_connections 
FROM pg_stat_activity 
WHERE state = 'active';

-- 3. 表空间使用情况
-- 标题：查询数据库大小
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) as size
FROM pg_database
ORDER BY pg_database_size(pg_database.datname) DESC;

-- 4. 慢查询分析
-- 标题：查询最慢的10个查询
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
ORDER BY total_time DESC
LIMIT 10;

-- 5. 锁信息查询
-- 标题：查询当前锁信息
SELECT 
    pl.pid,
    pl.mode,
    pl.locktype,
    pl.relation::regclass,
    pl.page,
    pl.tuple,
    pl.granted
FROM pg_locks pl
WHERE pl.granted = false;
```

#### 常用SQL分类管理

建议按以下分类管理常用SQL：

- **系统监控**: 数据库状态、连接数、性能指标
- **数据查询**: 常用业务数据查询
- **维护脚本**: 数据库维护相关SQL
- **分析报告**: 数据分析和报表SQL
- **故障排查**: 问题诊断和故障排除SQL

### 系统设置

#### 应用配置

1. **点击"设置"标签页**
2. **修改配置参数**:
   - 自动锁定时间：设置会话超时时间
   - 提醒时间：设置锁定前提醒时间
   - 应用标题：自定义应用名称
   - 主题色彩：选择界面主题
   - 日志级别：设置日志详细程度

#### 安全配置

- **应用密码**: 设置应用级访问密码
- **密码强度**: 启用强密码要求
- **登录限制**: 设置失败次数限制
- **审计日志**: 启用操作审计记录

#### 性能配置

- **连接池大小**: 调整数据库连接池参数
- **查询超时**: 设置SQL执行超时时间
- **结果缓存**: 启用查询结果缓存
- **内存限制**: 设置最大内存使用量

## 高级功能

### 批量SQL执行

支持一次执行多条SQL语句：

```sql
-- 批量执行示例
SELECT COUNT(*) FROM users;
SELECT * FROM users LIMIT 10;
UPDATE users SET status = 'active' WHERE id > 100;
SELECT COUNT(*) FROM orders WHERE created_at > '2024-01-01';
```

执行结果会显示每条语句的执行情况：
- ✅ 成功的语句显示结果
- ❌ 失败的语句显示错误信息
- 📊 显示总执行时间和影响行数

### 查询计划分析

支持查看SQL查询的执行计划：

```sql
-- PostgreSQL执行计划
EXPLAIN ANALYZE SELECT * FROM users WHERE id > 1000;

-- MySQL执行计划
EXPLAIN FORMAT=JSON SELECT * FROM users WHERE id > 1000;

-- Oracle执行计划
EXPLAIN PLAN FOR SELECT * FROM users WHERE id > 1000;
```

执行计划包含：
- **执行步骤**: 详细的执行过程
- **成本估算**: 预估的执行成本
- **实际时间**: 真实的执行时间
- **数据扫描**: 表扫描和索引使用情况

### 多数据库切换

支持同时管理多个数据库连接：

1. **添加多个数据库连接**
2. **设置默认数据库**
3. **查询时选择数据库**
4. **快速切换数据库**

### 数据导出高级选项

#### Excel高级选项
- **自定义样式**: 设置字体、颜色、边框
- **条件格式**: 根据数据值设置格式
- **数据验证**: 添加数据验证规则
- **公式计算**: 包含Excel公式

#### CSV高级选项
- **编码选择**: UTF-8、GBK等编码
- **文本限定符**: 双引号、单引号
- **行结束符**: Windows/Unix格式
- **数字格式**: 小数点、千分位符号

#### HTML高级选项
- **自定义模板**: 使用自定义HTML模板
- **CSS样式**: 添加自定义CSS样式
- **JavaScript**: 添加交互功能
- **图表集成**: 集成数据可视化图表

## 故障排除

### 连接问题

#### 数据库连接失败

**症状**: 连接测试失败，显示错误信息

**可能原因和解决方案**:

1. **网络连接问题**
   ```bash
   # 测试网络连通性
   ping database_server_ip
   telnet database_server_ip port
   
   # 检查防火墙
   sudo ufw status
   sudo iptables -L
   ```

2. **认证失败**
   ```sql
   -- 检查用户名密码
   -- PostgreSQL
   psql -h host -U username -d database
   
   -- MySQL
   mysql -h host -u username -p database
   
   -- 检查用户权限
   -- PostgreSQL
   SELECT * FROM pg_user WHERE usename = 'username';
   
   -- MySQL
   SELECT User, Host FROM mysql.user WHERE User = 'username';
   ```

3. **数据库服务未运行**
   ```bash
   # 检查服务状态
   # PostgreSQL
   sudo systemctl status postgresql
   
   # MySQL
   sudo systemctl status mysql
   
   # 启动服务
   sudo systemctl start postgresql
   sudo systemctl start mysql
   ```

4. **配置错误**
   ```json
   {
     "host": "正确的主机地址",
     "port": "正确的端口号",
     "user": "正确的用户名",
     "password": "正确的密码",
     "database": "正确的数据库名"
   }
   ```

#### 连接超时

**症状**: 连接长时间无响应后超时

**解决方案**:

1. **增加超时时间**
   ```json
   {
     "db_connect_timeout": 30,
     "db_statement_timeout": 60
   }
   ```

2. **检查网络延迟**
   ```bash
   ping -c 10 database_server
   traceroute database_server
   ```

3. **优化数据库配置**
   ```sql
   -- PostgreSQL
   ALTER SYSTEM SET statement_timeout = '60s';
   SELECT pg_reload_conf();
   
   -- MySQL
   SET GLOBAL max_execution_time = 60000;
   ```

### 查询问题

#### SQL语法错误

**症状**: 查询执行失败，显示语法错误

**常见错误和解决方案**:

1. **缺少分号**
   ```sql
   -- 错误
   SELECT * FROM users
   
   -- 正确
   SELECT * FROM users;
   ```

2. **引号不匹配**
   ```sql
   -- 错误
   SELECT * FROM users WHERE name = "John's"
   
   -- 正确
   SELECT * FROM users WHERE name = 'John''s'
   ```

3. **保留字冲突**
   ```sql
   -- 错误
   SELECT * FROM order WHERE id = 1
   
   -- 正确
   SELECT * FROM "order" WHERE id = 1
   ```

#### 查询性能问题

**症状**: 查询执行缓慢，响应时间长

**优化建议**:

1. **添加索引**
   ```sql
   -- 检查索引
   -- PostgreSQL
   SELECT * FROM pg_indexes WHERE tablename = 'users';
   
   -- MySQL
   SHOW INDEX FROM users;
   
   -- 创建索引
   CREATE INDEX idx_users_status ON users(status);
   CREATE INDEX idx_users_created_at ON users(created_at);
   ```

2. **优化查询语句**
   ```sql
   -- 避免SELECT *
   SELECT name, email FROM users WHERE status = 'active';
   
   -- 使用LIMIT限制结果
   SELECT * FROM large_table LIMIT 1000;
   
   -- 避免子查询，使用JOIN
   SELECT u.name, COUNT(o.id) 
   FROM users u 
   LEFT JOIN orders o ON u.id = o.user_id 
   GROUP BY u.name;
   ```

3. **分析执行计划**
   ```sql
   -- PostgreSQL
   EXPLAIN ANALYZE SELECT * FROM users WHERE status = 'active';
   
   -- MySQL
   EXPLAIN FORMAT=JSON SELECT * FROM users WHERE status = 'active';
   ```

#### 结果集过大

**症状**: 查询返回大量数据，导致内存不足或超时

**解决方案**:

1. **使用分页**
   ```sql
   SELECT * FROM large_table 
   ORDER BY id 
   LIMIT 1000 OFFSET 0;
   
   SELECT * FROM large_table 
   ORDER BY id 
   LIMIT 1000 OFFSET 1000;
   ```

2. **添加过滤条件**
   ```sql
   SELECT * FROM orders 
   WHERE created_at >= '2024-01-01' 
   AND created_at < '2024-02-01';
   ```

3. **分批导出**
   ```javascript
   // 分批导出大数据集
   async function exportLargeDataset(queryId, batchSize = 5000) {
       let offset = 0;
       let batchNum = 1;
       
       while (true) {
           const batchQuery = `
               ${originalQuery} 
               LIMIT ${batchSize} OFFSET ${offset}
           `;
           
           const result = await executeSQL(batchQuery);
           if (result.data.length === 0) break;
           
           await exportToExcel(result.query_id, `批次${batchNum}`);
           
           offset += batchSize;
           batchNum++;
       }
   }
   ```

### 导出问题

#### Excel导出失败

**症状**: 点击导出Excel后无响应或报错

**解决方案**:

1. **检查文件大小**
   ```javascript
   // 限制导出数据量
   if (result.total_count > 100000) {
       alert('数据量过大，建议分批导出或使用CSV格式');
       return;
   }
   ```

2. **检查内存使用**
   ```bash
   # 检查服务器内存
   free -h
   top -o %MEM
   
   # 增加内存限制
   {
     "app_memory_limit_mb": 1024
   }
   ```

3. **优化导出配置**
   ```javascript
   // 减少样式复杂度
   exportToExcel(queryId, {
       headerColor: '4472C4',  // 使用默认颜色
       includeHeader: true,
       filename: '简化报表'
   });
   ```

#### CSV中文乱码

**症状**: 导出的CSV文件中文显示为乱码

**解决方案**:

1. **使用正确的编码**
   ```javascript
   // 确保使用UTF-8编码
   exportToCSV(queryId, {
       encoding: 'utf-8',
       includeBOM: true,  // 包含BOM头
       filename: '中文数据'
   });
   ```

2. **Excel导入设置**
   - 在Excel中选择"数据" → "从文本/CSV"
   - 选择文件编码为"65001: Unicode (UTF-8)"
   - 选择正确的分隔符

3. **使用文本编辑器**
   - 使用Notepad++、VS Code等支持UTF-8的编辑器
   - 避免使用Windows记事本直接打开

#### HTML导出样式异常

**症状**: 导出的HTML报表样式显示异常

**解决方案**:

1. **检查浏览器兼容性**
   - 使用现代浏览器（Chrome、Firefox、Edge）
   - 避免使用IE浏览器

2. **自定义CSS样式**
   ```css
   /* 添加自定义样式 */
   .custom-report {
       font-family: 'Microsoft YaHei', Arial, sans-serif;
       font-size: 12px;
   }
   
   .report-table {
       border-collapse: collapse;
       width: 100%;
   }
   
   .report-table th {
       background-color: #4472C4;
       color: white;
       padding: 8px;
   }
   ```

### 性能问题

#### 应用响应缓慢

**症状**: 界面操作响应慢，查询执行时间长

**诊断步骤**:

1. **检查服务器资源**
   ```bash
   # CPU使用率
   top -o %CPU
   
   # 内存使用率
   free -h
   
   # 磁盘使用率
   df -h
   
   # 网络连接
   netstat -an | grep :5000
   ```

2. **检查数据库性能**
   ```sql
   -- PostgreSQL
   SELECT * FROM pg_stat_activity WHERE state = 'active';
   SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
   
   -- MySQL
   SHOW PROCESSLIST;
   SELECT * FROM performance_schema.events_waits_summary_global_by_event_name 
   ORDER BY SUM_TIMER_WAIT DESC LIMIT 10;
   ```

3. **优化应用配置**
   ```json
   {
     "app_max_connections": 20,
     "app_result_cache_time": 1800,
     "db_statement_timeout": 60,
     "app_concurrent_queries": 3
   }
   ```

#### 内存泄漏

**症状**: 应用运行时间越长，内存使用越高

**解决方案**:

1. **定期重启**
   ```bash
   # 设置定时重启
   0 2 * * * systemctl restart chaoyang-data
   ```

2. **内存监控**
   ```python
   import psutil
   import gc
   
   def monitor_memory():
       memory = psutil.virtual_memory()
       if memory.percent > 90:
           gc.collect()
           logging.warning(f"High memory usage: {memory.percent}%")
   ```

3. **优化代码**
   ```python
   # 及时释放大对象
   large_data = None
   gc.collect()
   
   # 使用生成器处理大数据
   def process_large_dataset():
       for chunk in get_data_chunks():
           yield process_chunk(chunk)
   ```

### 安全问题

#### 密码泄露

**症状**: 发现异常登录或数据访问

**应急处理**:

1. **立即修改密码**
   ```bash
   # 修改应用密码
   curl -X POST http://localhost:5000/change_app_password \
     -H "Content-Type: application/json" \
     -d '{
       "old_password": "old_pass",
       "new_password": "new_strong_pass",
       "confirm_new_password": "new_strong_pass"
     }'
   ```

2. **检查访问日志**
   ```bash
   # 查看访问日志
   tail -f /app/log/sql_query_logs.log
   
   # 检查异常IP
   grep "Failed" /app/log/sql_query_logs.log
   ```

3. **加强安全措施**
   ```json
   {
     "app_password_strength_required": true,
     "app_login_failures_limit": 3,
     "app_account_lockout_minutes": 60,
     "app_audit_logging_enabled": true
   }
   ```

#### SQL注入攻击

**症状**: 发现异常的SQL查询或数据操作

**防护措施**:

1. **启用SQL安全检查**
   ```json
   {
     "enable_sql_injection_check": true,
     "sql_blacklist_keywords": ["DROP", "TRUNCATE", "DELETE"],
     "max_sql_length": 10000
   }
   ```

2. **使用参数化查询**
   ```python
   # 安全的参数化查询
   cursor.execute(
       "SELECT * FROM users WHERE name = %s AND status = %s",
       (username, status)
   )
   ```

3. **输入验证**
   ```python
   def validate_input(user_input):
       # 移除危险字符
       safe_input = re.sub(r'[;\'"\\]', '', user_input)
       
       # 检查长度
       if len(safe_input) > 1000:
           raise ValueError("Input too long")
       
       return safe_input
   ```

## 最佳实践

### 查询优化

1. **使用索引**
   ```sql
   -- 创建复合索引
   CREATE INDEX idx_users_status_created 
   ON users(status, created_at);
   
   -- 使用索引字段查询
   SELECT * FROM users 
   WHERE status = 'active' 
   AND created_at >= '2024-01-01';
   ```

2. **避免全表扫描**
   ```sql
   -- 避免
   SELECT * FROM users WHERE name LIKE '%john%';
   
   -- 优化
   SELECT * FROM users WHERE name LIKE 'john%';
   ```

3. **合理使用JOIN**
   ```sql
   -- 使用INNER JOIN而不是子查询
   SELECT u.name, COUNT(o.id) as order_count
   FROM users u
   INNER JOIN orders o ON u.id = o.user_id
   GROUP BY u.name;
   ```

### 数据导出优化

1. **分批导出大数据集**
   ```javascript
   async function exportLargeDataset(queryId, batchSize = 10000) {
       const totalRows = await getTotalRowCount(queryId);
       const batches = Math.ceil(totalRows / batchSize);
       
       for (let i = 0; i < batches; i++) {
           const offset = i * batchSize;
           const batchQuery = `${originalQuery} LIMIT ${batchSize} OFFSET ${offset}`;
           
           const result = await executeSQL(batchQuery);
           await exportToFormat(result.query_id, `批次${i + 1}`);
       }
   }
   ```

2. **选择合适的导出格式**
   - **Excel**: 适合数据分析、报表制作
   - **CSV**: 适合数据交换、程序处理
   - **HTML**: 适合展示、打印、分享

3. **优化导出性能**
   ```javascript
   // 使用流式导出
   exportConfig = {
       streaming: true,
       chunkSize: 5000,
       compression: true
   };
   ```

### 安全配置

1. **强密码策略**
   ```json
   {
     "app_password_strength_required": true,
     "app_login_failures_limit": 5,
     "app_account_lockout_minutes": 30
   }
   ```

2. **定期审计**
   ```bash
   # 定期查看审计日志
   grep "AUDIT" /app/log/sql_query_logs.log
   
   # 检查异常访问
   grep "Failed" /app/log/sql_query_logs.log
   
   # 分析查询模式
   awk '{print $5}' /app/log/sql_query_logs.log | sort | uniq -c | sort -nr
   ```

3. **数据脱敏**
   ```python
   def mask_sensitive_data(data):
       # 手机号脱敏
       if is_phone_number(data):
           return data[:3] + '****' + data[-4:]
       
       # 邮箱脱敏
       if is_email(data):
           parts = data.split('@')
           return parts[0][:3] + '***@' + parts[1]
       
       # 身份证号脱敏
       if is_id_card(data):
           return data[:4] + '********' + data[-4:]
       
       return data
   ```

## 总结

通过本指南，您应该能够：

1. **熟练使用** 朝阳数据SQL查询工具的各项功能
2. **快速解决** 常见的使用问题和故障
3. **优化性能** 提高查询和数据导出效率
4. **保障安全** 实施最佳的安全实践
5. **提升效率** 使用高级功能和最佳实践

记住这些关键要点：
- 定期备份重要配置和数据
- 监控应用性能和资源使用
- 实施适当的安全措施
- 遵循查询优化最佳实践
- 及时更新和维护系统

如有其他问题，请参考技术文档或联系技术支持团队。