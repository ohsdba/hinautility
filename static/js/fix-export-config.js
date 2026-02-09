// 修复数据库配置导出功能
document.addEventListener('DOMContentLoaded', function() {
    console.log('开始修复数据库配置导出功能...');
    
    // 重定义 exportSelectedConfigs 函数
    window.exportSelectedConfigs = function() {
        // 获取选中的配置
        const checkboxes = document.querySelectorAll('#configSelectionList input[type="checkbox"]:checked');
        if (checkboxes.length === 0) {
            if (typeof showAlertModal !== 'undefined') {
                showAlertModal('提示', '请至少选择一个数据库配置进行导出。', 'info');
            } else {
                alert('请至少选择一个数据库配置进行导出。');
            }
            return;
        }
        
        console.log('找到选中的复选框数量:', checkboxes.length);
        console.log('window.currentDbConfigsWithPassword 存在:', !!window.currentDbConfigsWithPassword);
        console.log('window.currentDbConfigsWithPassword 长度:', window.currentDbConfigsWithPassword ? window.currentDbConfigsWithPassword.length : 0);
        
        // 使用存储在全局变量中的配置（包含密码）
        const selectedConfigs = [];
        checkboxes.forEach((checkbox, i) => {
            console.log(`处理第 ${i} 个选中的复选框:`, checkbox);
            console.log('复选框值:', checkbox.value);
            
            const index = parseInt(checkbox.value);
            console.log('解析后的索引:', index);
            
            if (window.currentDbConfigsWithPassword && window.currentDbConfigsWithPassword[index]) {
                console.log(`找到配置项 ${index}:`, window.currentDbConfigsWithPassword[index]);
                // 确保复制整个配置对象（包含密码）
                selectedConfigs.push(JSON.parse(JSON.stringify(window.currentDbConfigsWithPassword[index])));
                console.log(`已添加配置项 ${index} 到 selectedConfigs`);
            } else {
                console.log(`配置项 ${index} 不存在或 window.currentDbConfigsWithPassword 为空`);
            }
        });
        
        console.log(`准备导出 ${selectedConfigs.length} 个配置:`, selectedConfigs);
        
        if (selectedConfigs.length === 0) {
            if (typeof showAlertModal !== 'undefined') {
                showAlertModal('错误', '未能获取到任何配置数据，请刷新页面后重试。', 'danger');
            } else {
                alert('未能获取到任何配置数据，请刷新页面后重试。');
            }
            return;
        }
        
        // 创建并下载JSON文件
        const blob = new Blob([JSON.stringify(selectedConfigs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'selected_db_configs.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // 关闭模态框
        const modalElement = document.getElementById('dbConfigSelectionModal');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        }
        
        if (typeof showAlertModal !== 'undefined') {
            showAlertModal('成功', `成功导出 ${selectedConfigs.length} 个数据库配置！`, 'success');
        } else {
            alert(`成功导出 ${selectedConfigs.length} 个数据库配置！`);
        }
    };
    
    // 重定义 openDbConfigSelectionModal 函数以使用带密码的接口
    window.openDbConfigSelectionModal = function() {
        // 从服务器获取本地保存的所有数据库配置（包含密码）
        fetch('/get_saved_db_config_with_password')
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('获取本地配置失败');
                }
            })
            .then(configs => {
                showDbConfigSelectionModal(configs);
            })
            .catch(error => {
                console.error('获取本地配置失败:', error);
                
                // 如果获取服务器配置失败，提示用户本地配置文件不存在
                showAlertModal('提示', '本地配置文件不存在或无法访问，请先保存配置后再导出。', 'info');
            });
    };
    
    // 重定义 showDbConfigSelectionModal 函数
    window.showDbConfigSelectionModal = function(configs) {
        // 存储配置到全局变量以便后续访问（包含密码）
        window.currentDbConfigsWithPassword = configs;
        
        // 调试输出
        console.log('showDbConfigSelectionModal 被调用，configs 长度:', configs ? configs.length : 0);
        console.log('configs 内容:', configs);
        
        if (!configs || configs.length === 0) {
            if (typeof showAlertModal !== 'undefined') {
                showAlertModal('提示', '没有找到任何已保存的数据库配置。', 'info');
            } else {
                alert('没有找到任何已保存的数据库配置。');
            }
            return;
        }
        
        // 创建模态框HTML
        let configItems = '';
        configs.forEach((config, index) => {
            const displayName = config.alias || config.name || `数据库 ${index + 1}`;
            configItems += `
            <div class="form-check mb-2">
                <input class="form-check-input" type="checkbox" value="${index}" id="configCheck${index}">
                <label class="form-check-label" for="configCheck${index}">
                    ${displayName} (${config.type || 'unknown'}) - ${config.host}:${config.port} (${config.database || 'default'})
                </label>
            </div>`;
        });
        
        const modalHtml = `
        <div class="modal fade" id="dbConfigSelectionModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">选择要导出的数据库配置</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p>请选择一个或多个数据库配置进行导出：</p>
                        <div id="configSelectionList">
                            ${configItems}
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" onclick="exportSelectedConfigs()">导出选中配置</button>
                    </div>
                </div>
            </div>
        </div>`;
        
        // 添加模态框到页面
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // 显示模态框
        const modalElement = document.getElementById('dbConfigSelectionModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        
        // 模态框关闭时清理DOM
        modalElement.addEventListener('hidden.bs.modal', function () {
            this.remove();
        });
    };
    
    console.log('数据库配置导出功能修复完成');
});