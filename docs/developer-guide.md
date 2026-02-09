# 开发者文档与贡献指南

## 概述

欢迎参与朝阳数据SQL查询工具的开发！本文档为开发者提供详细的开发指南、代码规范和贡献流程。无论您是修复bug、添加新功能还是改进文档，我们都欢迎您的贡献。

## 开发环境搭建

### 1. 环境要求

#### 基础环境
- **Python**: 3.7+
- **Git**: 2.20+
- **IDE**: VS Code / PyCharm / 其他Python IDE
- **操作系统**: Windows 10+ / macOS 10.14+ / Linux (Ubuntu 18.04+)

#### 开发工具
```bash
# 推荐开发工具安装
pip install -r requirements-dev.txt

# 开发依赖包括
- black          # 代码格式化
- flake8         # 代码检查
- pytest         # 单元测试
- pytest-cov     # 测试覆盖率
- pre-commit     # Git钩子
- mypy           # 类型检查
```

### 2. 项目结构

```
朝阳数据/
├── app.py                    # 主应用文件
├── requirements.txt          # 生产依赖
├── requirements-dev.txt      # 开发依赖
├── setup.py                 # 项目安装配置
├── .gitignore               # Git忽略文件
├── .pre-commit-config.yaml  # 预提交钩子配置
├── conf/                    # 配置文件目录
│   ├── app_config.json      # 应用配置
│   ├── db_config.json       # 数据库配置
│   └── common_sql.json      # 常用SQL配置
├── html/                    # 前端模板
│   └── index.html          # 主界面
├── static/                  # 静态资源
│   ├── css/                # 样式文件
│   └── js/                 # JavaScript文件
├── docs/                    # 文档目录
│   ├── architecture.md     # 架构文档
│   ├── configuration.md  # 配置文档
│   ├── api-documentation.md # API文档
│   └── ...
├── tests/                   # 测试目录
│   ├── unit/               # 单元测试
│   ├── integration/        # 集成测试
│   └── fixtures/          # 测试数据
├── scripts/                 # 脚本目录
│   ├── setup.sh          # 环境设置脚本
│   ├── deploy.sh         # 部署脚本
│   └── backup.sh         # 备份脚本
└── log/                   # 日志目录（运行时生成）
    └── sql_query_logs.log # SQL查询日志
```

### 3. 开发环境配置

#### 虚拟环境设置
```bash
# 克隆项目
git clone https://github.com/your-org/chaoyang-data.git
cd chaoyang-data

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Linux/Mac
source venv/bin/activate

# Windows
venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt
pip install -r requirements-dev.txt

# 安装预提交钩子
pre-commit install
```

#### 开发配置
```json
// conf/app_config.json (开发环境)
{
    "app_auto_lock_timeout_minutes": 60,
    "app_auto_lock_reminder_minutes": 55,
    "app_title": "朝阳数据 - 开发环境",
    "db_statement_timeout": 60,
    "db_connect_timeout": 20,
    "app_log_level": "DEBUG",
    "app_audit_logging_enabled": true
}
```

## 代码规范

### 1. Python代码规范

#### 代码格式化
```python
# 使用Black进行代码格式化
black app.py
black tests/

# 配置Black（pyproject.toml）
[tool.black]
line-length = 88
target-version = ['py37', 'py38', 'py39']
include = '\.pyi?$'
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | build
  | dist
)/
'''
```

#### 代码检查
```bash
# 使用Flake8进行代码检查
flake8 app.py
flake8 tests/

# 配置Flake8（setup.cfg）
[flake8]
max-line-length = 88
extend-ignore = E203, E266, E501, W503
max-complexity = 18
select = B,C,E,F,W,T4,B9
```

#### 类型注解
```python
from typing import Dict, List, Optional, Union, Any
from contextlib import contextmanager

def get_db_connection(db_id: Optional[str] = None) -> tuple:
    """获取数据库连接上下文管理器
    
    Args:
        db_id: 数据库ID，如果为None则使用默认数据库
        
    Returns:
        tuple: (连接函数, 数据库配置)
        
    Raises:
        ValueError: 未找到有效的数据库配置
        ImportError: 缺少数据库驱动
    """
    # 函数实现
    pass

class DatabaseManager:
    """数据库连接管理器"""
    
    def __init__(self, config: Dict[str, Any]) -> None:
        """初始化数据库管理器
        
        Args:
            config: 数据库配置字典
        """
        self.config = config
        self.connections: List[Any] = []
    
    def create_connection(self) -> Any:
        """创建新的数据库连接"""
        # 实现代码
        pass
```

### 2. 前端代码规范

#### HTML规范
```html
<!-- 使用语义化HTML -->
<main class="container">
    <header class="page-header">
        <h1 class="page-title">朝阳数据</h1>
    </header>
    
    <section class="query-section">
        <form class="query-form" id="sqlForm">
            <label for="sqlInput" class="form-label">SQL语句</label>
            <textarea id="sqlInput" class="form-control" rows="10"></textarea>
            
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">执行</button>
                <button type="button" class="btn btn-secondary">格式化</button>
            </div>
        </form>
    </section>
</main>
```

#### CSS规范
```css
/* 使用BEM命名规范 */
.query-section {
    margin-bottom: 2rem;
}

.query-section__title {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 1rem;
}

.query-section__form {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 0.5rem;
}

/* 变量定义 */
:root {
    --primary-color: #667eea;
    --secondary-color: #764ba2;
    --text-color: #333;
    --border-radius: 0.5rem;
    --transition-speed: 0.3s;
}
```

#### JavaScript规范
```javascript
// 使用ES6+语法
class QueryManager {
    constructor(config) {
        this.config = config;
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupEditor();
    }
    
    bindEvents() {
        document.getElementById('executeBtn').addEventListener('click', this.executeQuery.bind(this));
    }
    
    async executeQuery() {
        try {
            const sql = this.getSQL();
            const result = await this.sendQuery(sql);
            this.displayResults(result);
        } catch (error) {
            this.handleError(error);
        }
    }
    
    getSQL() {
        return this.editor.getValue().trim();
    }
    
    async sendQuery(sql) {
        const response = await fetch('/execute_sql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Session-Token': this.getSessionToken()
            },
            body: new URLSearchParams({ sql })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }
}
```

## 开发流程

### 1. 功能开发流程

#### 创建新功能分支
```bash
# 从主分支创建新分支
git checkout main
git pull origin main
git checkout -b feature/add-mongodb-support

# 或者从开发分支创建
git checkout develop
git pull origin develop
git checkout -b feature/improve-export-performance
```

#### 开发步骤

1. **需求分析**
   ```markdown
   ## 功能需求：添加MongoDB支持
   
   ### 目标
   - 支持MongoDB数据库连接
   - 支持基本查询操作
   - 支持数据导出功能
   
   ### 技术要求
   - 使用pymongo驱动
   - 兼容现有接口
   - 保持代码风格一致
   
   ### 验收标准
   - 能够连接MongoDB实例
   - 能够执行基本CRUD操作
   - 能够通过所有测试用例
   ```

2. **设计阶段**
   ```python
   # 设计新功能接口
   @contextmanager
   def get_mongodb_connection(db_config: Dict[str, Any]) -> Any:
       """MongoDB连接上下文管理器"""
       # 实现代码
       pass
   
   class MongoDBQueryEngine:
       """MongoDB查询引擎"""
       
       def __init__(self, connection: Any):
           self.connection = connection
       
       def execute_query(self, query: Dict[str, Any]) -> List[Dict[str, Any]]:
           """执行MongoDB查询"""
           # 实现代码
           pass
   ```

3. **实现阶段**
   ```python
   # app.py - 添加MongoDB支持
   
   # 1. 添加驱动映射
   DRIVER_MAPPING = {
       # ... 现有映射
       'mongodb': ('MongoDB', get_mongodb_connection, 'pymongo'),
   }
   
   # 2. 实现连接函数
   @contextmanager
   def get_mongodb_connection(db_config: Dict[str, Any]) -> Any:
       """MongoDB连接上下文管理器"""
       try:
           from pymongo import MongoClient
           
           # 构建连接字符串
           host = db_config['host']
           port = int(db_config['port'])
           username = db_config['user']
           password = decrypt_password(db_config.get('password', ''))
           database = db_config['database']
           
           # 创建连接
           if username and password:
               connection_string = f"mongodb://{username}:{password}@{host}:{port}/{database}"
           else:
               connection_string = f"mongodb://{host}:{port}/{database}"
           
           client = MongoClient(connection_string, serverSelectionTimeoutMS=10000)
           
           # 测试连接
           client.admin.command('ping')
           
           # 返回数据库连接
           db = client[database]
           yield db
           
       except ImportError:
           raise ImportError("请安装PyMongo：pip install pymongo")
       except Exception as e:
           if 'client' in locals():
               client.close()
           raise Exception(f"MongoDB连接失败: {str(e)}")
       finally:
           if 'client' in locals():
               client.close()
   ```

4. **测试阶段**
   ```python
   # tests/unit/test_mongodb_connection.py
   
   import pytest
   from unittest.mock import Mock, patch
   from app import get_mongodb_connection
   
   class TestMongoDBConnection:
       
       def test_mongodb_connection_success(self):
           """测试MongoDB连接成功"""
           # Mock PyMongo
           with patch('app.MongoClient') as mock_client:
               mock_db = Mock()
               mock_client.return_value.__getitem__.return_value = mock_db
               mock_client.return_value.admin.command.return_value = {'ok': 1}
               
               db_config = {
                   'host': 'localhost',
                   'port': '27017',
                   'user': 'testuser',
                   'password': 'enc:testpass',
                   'database': 'testdb'
               }
               
               with get_mongodb_connection(db_config) as db:
                   assert db is not None
       
       def test_mongodb_connection_failure(self):
           """测试MongoDB连接失败"""
           with patch('app.MongoClient') as mock_client:
               mock_client.side_effect = Exception("Connection failed")
               
               db_config = {
                   'host': 'invalid',
                   'port': '27017',
                   'database': 'testdb'
               }
               
               with pytest.raises(Exception):
                   with get_mongodb_connection(db_config) as db:
                       pass
   ```

### 2. 代码审查流程

#### 提交前检查
```bash
# 运行代码格式化
black app.py tests/

# 运行代码检查
flake8 app.py tests/

# 运行类型检查
mypy app.py

# 运行测试
pytest tests/ -v --cov=app --cov-report=html

# 运行预提交钩子
pre-commit run --all-files
```

#### 提交信息规范
```bash
# 提交信息格式
git commit -m "feat: 添加MongoDB数据库支持

- 实现MongoDB连接管理器
- 添加MongoDB查询引擎
- 支持基本CRUD操作
- 添加完整测试用例

Closes #123"

# 提交类型
feat:     新功能
fix:      修复bug
docs:     文档更新
style:    代码格式调整
refactor: 代码重构
test:     测试相关
chore:    构建过程或辅助工具的变动
```

#### Pull Request模板
```markdown
## 变更说明
简要描述这次变更的内容和目的。

## 变更类型
- [ ] 新功能 (feat)
- [ ] 修复bug (fix)
- [ ] 文档更新 (docs)
- [ ] 代码重构 (refactor)
- [ ] 性能优化 (perf)
- [ ] 测试相关 (test)

## 测试说明
描述如何测试这些变更，包括测试用例和预期结果。

## 破坏性变更
- [ ] 这次变更包含破坏性变更
- [ ] 这次变更向后兼容

如果包含破坏性变更，请详细说明影响和迁移方案。

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 添加了适当的测试
- [ ] 更新了相关文档
- [ ] 通过了所有CI检查
- [ ] 进行了自测

## 相关Issue
Fixes #123
Relates to #456
```

## 测试策略

### 1. 单元测试

#### 测试结构
```python
# tests/unit/test_database_connections.py

import pytest
from unittest.mock import Mock, patch, MagicMock
from app import get_db_connection, execute_single_statement

class TestDatabaseConnections:
    """数据库连接测试"""
    
    @pytest.fixture
    def mock_db_config(self):
        """数据库配置fixture"""
        return {
            'host': 'localhost',
            'port': '5432',
            'user': 'testuser',
            'password': 'testpass',
            'database': 'testdb',
            'type': 'postgresql'
        }
    
    def test_postgresql_connection_success(self, mock_db_config):
        """测试PostgreSQL连接成功"""
        with patch('app.psycopg2.connect') as mock_connect:
            mock_conn = Mock()
            mock_connect.return_value = mock_conn
            
            connection_func, config = get_db_connection('test_db')
            
            assert connection_func is not None
            assert config == mock_db_config
    
    def test_database_connection_failure(self, mock_db_config):
        """测试数据库连接失败"""
        with patch('app.psycopg2.connect') as mock_connect:
            mock_connect.side_effect = Exception("Connection failed")
            
            with pytest.raises(Exception):
                with get_db_connection('test_db') as (connection_func, config):
                    with connection_func(mock_db_config) as conn:
                        pass

class TestSQLExecution:
    """SQL执行测试"""
    
    def test_valid_sql_execution(self):
        """测试有效SQL执行"""
        sql = "SELECT * FROM users WHERE id = 1"
        
        with patch('app.check_sql_safety') as mock_safety:
            mock_safety.return_value = (True, "")
            
            with patch('app.get_db_connection') as mock_conn:
                mock_cursor = Mock()
                mock_cursor.description = [('id',), ('name',)]
                mock_cursor.fetchall.return_value = [(1, 'John')]
                mock_cursor.rowcount = 1
                
                mock_conn.return_value.__enter__.return_value = (Mock(), {})
                
                result = execute_single_statement(sql, 1, 50, None)
                
                assert result['status'] == 'success'
                assert len(result['results']) == 1
    
    def test_invalid_sql_rejection(self):
        """测试无效SQL被拒绝"""
        sql = "DROP TABLE users"
        
        with patch('app.check_sql_safety') as mock_safety:
            mock_safety.return_value = (False, "Dangerous SQL detected")
            
            result = execute_single_statement(sql, 1, 50, None)
            
            assert result['status'] == 'error'
            assert 'Dangerous SQL' in result['message']
```

#### 测试覆盖率
```bash
# 运行测试并生成覆盖率报告
pytest tests/ -v --cov=app --cov-report=html --cov-report=term

# 覆盖率要求
- 整体覆盖率 > 80%
- 核心模块覆盖率 > 90%
- 新增代码覆盖率 > 95%
```

### 2. 集成测试

#### API接口测试
```python
# tests/integration/test_api_endpoints.py

import pytest
from app import app
import json

@pytest.fixture
def client():
    """测试客户端fixture"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

class TestAPIEndpoints:
    """API接口测试"""
    
    def test_index_page(self, client):
        """测试首页访问"""
        response = client.get('/')
        assert response.status_code == 200
        assert b'朝阳数据' in response.data
    
    def test_database_connection_endpoint(self, client):
        """测试数据库连接端点"""
        # Mock数据库配置
        test_config = {
            'host': 'localhost',
            'port': '5432',
            'user': 'testuser',
            'password': 'testpass',
            'database': 'testdb',
            'type': 'postgresql'
        }
        
        with patch('app.test_db_connection') as mock_test:
            mock_test.return_value = {
                'status': 'success',
                'message': '连接成功'
            }
            
            response = client.post('/test_db_connection',
                                 data=json.dumps(test_config),
                                 content_type='application/json',
                                 headers={'X-Session-Token': 'test-token'})
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['status'] == 'success'
    
    def test_sql_execution_endpoint(self, client):
        """测试SQL执行端点"""
        sql_data = {
            'sql': 'SELECT * FROM users LIMIT 10',
            'page': '1',
            'page_size': '50'
        }
        
        with patch('app.execute_sql') as mock_execute:
            mock_execute.return_value = {
                'status': 'success',
                'columns': ['id', 'name'],
                'results': [[1, 'John'], [2, 'Jane']],
                'count': 2
            }
            
            response = client.post('/execute_sql',
                                 data=sql_data,
                                 headers={'X-Session-Token': 'test-token'})
            
            assert response.status_code == 200
            data = json.loads(response.data)
            assert data['status'] == 'success'
            assert len(data['results']) == 2
```

### 3. 性能测试

#### 负载测试
```python
# tests/performance/test_load.py

import asyncio
import aiohttp
import time
from concurrent.futures import ThreadPoolExecutor

class LoadTester:
    """负载测试器"""
    
    def __init__(self, base_url, concurrent_users=10, requests_per_user=100):
        self.base_url = base_url
        self.concurrent_users = concurrent_users
        self.requests_per_user = requests_per_user
        self.results = []
    
    async def single_user_test(self, user_id):
        """单个用户测试"""
        async with aiohttp.ClientSession() as session:
            user_results = []
            
            for i in range(self.requests_per_user):
                start_time = time.time()
                
                try:
                    async with session.post(
                        f"{self.base_url}/execute_sql",
                        data={'sql': 'SELECT * FROM users LIMIT 10'},
                        headers={'X-Session-Token': f'token-{user_id}'}
                    ) as response:
                        await response.json()
                        
                        end_time = time.time()
                        user_results.append({
                            'request_id': i,
                            'response_time': end_time - start_time,
                            'status': 'success'
                        })
                        
                except Exception as e:
                    user_results.append({
                        'request_id': i,
                        'response_time': time.time() - start_time,
                        'status': 'error',
                        'error': str(e)
                    })
            
            return user_results
    
    async def run_load_test(self):
        """运行负载测试"""
        tasks = []
        
        for user_id in range(self.concurrent_users):
            task = asyncio.create_task(self.single_user_test(user_id))
            tasks.append(task)
        
        self.results = await asyncio.gather(*tasks)
        return self.analyze_results()
    
    def analyze_results(self):
        """分析测试结果"""
        all_requests = []
        for user_results in self.results:
            all_requests.extend(user_results)
        
        successful_requests = [r for r in all_requests if r['status'] == 'success']
        failed_requests = [r for r in all_requests if r['status'] == 'error']
        
        response_times = [r['response_time'] for r in successful_requests]
        
        return {
            'total_requests': len(all_requests),
            'successful_requests': len(successful_requests),
            'failed_requests': len(failed_requests),
            'success_rate': len(successful_requests) / len(all_requests) * 100,
            'avg_response_time': sum(response_times) / len(response_times),
            'min_response_time': min(response_times),
            'max_response_time': max(response_times),
            'requests_per_second': len(successful_requests) / sum(response_times)
        }

# 使用示例
async def main():
    tester = LoadTester('http://localhost:5000', concurrent_users=50, requests_per_user=20)
    results = await tester.run_load_test()
    print(json.dumps(results, indent=2))

if __name__ == '__main__':
    asyncio.run(main())
```

## 文档编写

### 1. 代码文档

#### 函数文档
```python
def execute_sql_with_retry(sql: str, max_retries: int = 3, retry_delay: float = 1.0) -> Dict[str, Any]:
    """执行SQL语句，失败时自动重试
    
    该函数会在SQL执行失败时自动重试，适用于网络不稳定或数据库
    临时不可用的情况。重试策略采用指数退避算法。
    
    Args:
        sql: 要执行的SQL语句
        max_retries: 最大重试次数，默认为3次
        retry_delay: 重试延迟时间（秒），默认为1.0秒
        
    Returns:
        Dict[str, Any]: 执行结果，包含状态和数据
        {
            'status': 'success' | 'error',
            'data': 查询结果或错误信息,
            'attempts': 尝试次数,
            'total_time': 总耗时（秒）
        }
        
    Raises:
        ValueError: SQL语句为空或无效
        ConnectionError: 数据库连接失败
        TimeoutError: 执行超时
        
    Example:
        >>> result = execute_sql_with_retry("SELECT * FROM users LIMIT 10")
        >>> if result['status'] == 'success':
        ...     print(f"查询成功，耗时：{result['total_time']}秒")
        ...     print(f"返回{len(result['data'])}条记录")
        ... else:
        ...     print(f"查询失败：{result['data']}")
    """
    # 实现代码
    pass
```

#### 类文档
```python
class DatabaseConnectionPool:
    """数据库连接池管理器
    
    该类实现了线程安全的数据库连接池，支持多种数据库类型，
    提供了连接复用、超时管理、健康检查等功能。
    
    Attributes:
        max_connections: 最大连接数
        min_connections: 最小连接数
        connection_timeout: 连接超时时间（秒）
        idle_timeout: 空闲连接超时时间（秒）
        health_check_interval: 健康检查间隔（秒）
        
    Example:
        >>> pool = DatabaseConnectionPool(
        ...     max_connections=10,
        ...     min_connections=2,
        ...     connection_timeout=30
        ... )
        >>> with pool.get_connection() as conn:
        ...     cursor = conn.cursor()
        ...     cursor.execute("SELECT * FROM users")
        ...     results = cursor.fetchall()
    """
    
    def __init__(self, max_connections: int = 10, min_connections: int = 2, 
                 connection_timeout: float = 30.0, **kwargs) -> None:
        """初始化连接池
        
        Args:
            max_connections: 最大连接数
            min_connections: 最小连接数
            connection_timeout: 连接超时时间
            **kwargs: 其他连接参数
        """
        # 初始化代码
        pass
```

### 2. API文档

#### 接口文档模板
```markdown
# 数据库连接测试API

## 接口信息
- **URL**: `/test_db_connection`
- **方法**: `POST`
- **认证**: 需要
- **版本**: v1.0.0

## 功能描述
测试数据库连接是否可用，返回连接状态和数据库版本信息。

## 请求参数

### 请求头
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| X-Session-Token | string | 是 | 会话令牌 |
| Content-Type | string | 是 | application/json |

### 请求体
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

### 参数说明
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| host | string | 是 | 数据库主机地址 |
| port | string | 是 | 数据库端口 |
| user | string | 是 | 数据库用户名 |
| password | string | 是 | 数据库密码 |
| database | string | 是 | 数据库名称 |
| type | string | 是 | 数据库类型 |

## 响应参数

### 成功响应
```json
{
    "status": "success",
    "message": "数据库连接成功！使用驱动: PostgreSQL (psycopg2)",
    "version": "PostgreSQL 13.0 on x86_64-pc-linux-gnu..."
}
```

### 错误响应
```json
{
    "status": "error",
    "message": "连接失败：could not connect to server: Connection refused"
}
```

## 状态码
| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 认证失败 |
| 500 | 服务器内部错误 |

## 使用示例

### Python示例
```python
import requests
import json

url = "http://localhost:5000/test_db_connection"
headers = {
    "Content-Type": "application/json",
    "X-Session-Token": "your-session-token"
}

data = {
    "host": "localhost",
    "port": "5432",
    "user": "postgres",
    "password": "password123",
    "database": "testdb",
    "type": "postgresql"
}

response = requests.post(url, headers=headers, data=json.dumps(data))
result = response.json()

if result["status"] == "success":
    print(f"连接成功: {result['message']}")
    print(f"数据库版本: {result['version']}")
else:
    print(f"连接失败: {result['message']}")
```

### JavaScript示例
```javascript
const testConnection = async (dbConfig) => {
    try {
        const response = await fetch('/test_db_connection', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': sessionToken
            },
            body: JSON.stringify(dbConfig)
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            console.log(`连接成功: ${result.message}`);
            console.log(`数据库版本: ${result.version}`);
        } else {
            console.error(`连接失败: ${result.message}`);
        }
    } catch (error) {
        console.error('请求失败:', error);
    }
};
```

## 贡献指南

### 1. 如何贡献

#### 报告Bug
1. **搜索现有Issue**: 在提交前搜索是否已有类似问题
2. **创建新Issue**: 使用Bug报告模板创建详细的问题描述
3. **提供复现步骤**: 详细描述如何复现该问题
4. **环境信息**: 提供操作系统、Python版本、数据库类型等信息

#### 提交功能请求
1. **检查现有功能**: 确认该功能是否已存在或正在开发
2. **创建Feature Request**: 使用功能请求模板描述需求
3. **说明使用场景**: 详细描述该功能的使用场景和预期效果
4. **提供实现建议**: 如果有想法，可以提供实现思路

#### 代码贡献
1. **Fork项目**: Fork项目到您的GitHub账户
2. **创建分支**: 从main分支创建功能分支
3. **开发功能**: 按照开发流程进行开发
4. **编写测试**: 为新功能编写完整的测试用例
5. **更新文档**: 更新相关文档和API说明
6. **提交PR**: 提交Pull Request并填写详细信息

### 2. 代码审查标准

#### 功能正确性
- [ ] 代码实现了预期的功能
- [ ] 处理了边界情况和错误场景
- [ ] 通过了所有测试用例
- [ ] 没有引入新的bug

#### 代码质量
- [ ] 代码结构清晰，易于理解
- [ ] 遵循了项目的编码规范
- [ ] 有适当的注释和文档
- [ ] 没有重复代码和死代码

#### 性能考虑
- [ ] 代码性能满足要求
- [ ] 没有明显的性能瓶颈
- [ ] 资源使用合理
- [ ] 考虑了扩展性

#### 安全性
- [ ] 处理了安全问题
- [ ] 没有引入安全漏洞
- [ ] 输入验证充分
- [ ] 敏感信息处理正确

### 3. 发布流程

#### 版本管理
```bash
# 创建发布分支
git checkout -b release/v1.2.0

# 更新版本号
# 修改 setup.py 中的版本号
# 修改 docs/changelog.md

# 提交版本更新
git add .
git commit -m "chore: bump version to 1.2.0"

# 创建标签
git tag -a v1.2.0 -m "Release version 1.2.0"

# 推送标签
git push origin v1.2.0
```

#### 变更日志
```markdown
# Changelog

## [1.2.0] - 2024-01-15

### 新增
- 添加MongoDB数据库支持
- 实现查询结果缓存功能
- 增加数据导出进度显示

### 改进
- 优化大数据集导出性能
- 改进错误提示信息
- 增强SQL注入防护

### 修复
- 修复连接池泄漏问题
- 修复Excel导出中文乱码问题
- 修复并发查询时的竞态条件

### 安全
- 增强密码强度验证
- 添加请求频率限制
- 改进审计日志记录
```

## 开发资源

### 1. 开发工具推荐

#### IDE和编辑器
- **VS Code**: 免费、轻量级、插件丰富
- **PyCharm**: 专业Python IDE，功能强大
- **Vim/Neovim**: 高度可定制的文本编辑器

#### 调试工具
- **pdb**: Python内置调试器
- **ipdb**: 增强版Python调试器
- **PyCharm Debugger**: 图形化调试工具

#### 性能分析
- **cProfile**: Python内置性能分析器
- **line_profiler**: 逐行性能分析
- **memory_profiler**: 内存使用分析

### 2. 学习资源

#### Python开发
- [Python官方文档](https://docs.python.org/3/)
- [Flask文档](https://flask.palletsprojects.com/)
- [SQLAlchemy文档](https://docs.sqlalchemy.org/)

#### 前端开发
- [Bootstrap文档](https://getbootstrap.com/docs/)
- [JavaScript MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [CSS Tricks](https://css-tricks.com/)

#### 数据库
- [PostgreSQL文档](https://www.postgresql.org/docs/)
- [MySQL文档](https://dev.mysql.com/doc/)
- [MongoDB文档](https://docs.mongodb.com/)

### 3. 社区和支持

#### 项目社区
- **GitHub Issues**: 报告问题和功能请求
- **GitHub Discussions**: 讨论项目相关话题
- **邮件列表**: chaoyang-data@googlegroups.com

#### 即时通讯
- **Discord**: [邀请链接](https://discord.gg/chaoyang-data)
- **微信群**: 扫描二维码加入
- **QQ群**: 123456789

#### 技术支持
- **文档**: https://docs.chaoyangdata.com
- **FAQ**: https://faq.chaoyangdata.com
- **Stack Overflow**: 使用标签 `chaoyang-data`

## 致谢

感谢所有为朝阳数据SQL查询工具做出贡献的开发者！

### 贡献者列表
- **核心开发者**: [开发者列表]
- **代码贡献者**: [贡献者列表]
- **文档贡献者**: [文档贡献者]
- **测试贡献者**: [测试贡献者]

### 特别感谢
- 感谢所有提交Issue和PR的用户
- 感谢社区成员的帮助和支持
- 感谢开源项目提供的优秀工具和库

---

**让我们一起构建更好的数据查询工具！** 🚀

如有任何问题，请随时联系我们或提交Issue。