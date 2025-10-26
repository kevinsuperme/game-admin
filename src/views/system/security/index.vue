<template>
  <div class="system-security">
    <div class="page-header">
      <h1>系统安全</h1>
      <p>管理系统安全设置和策略</p>
    </div>
    
    <div class="security-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="security-card">
            <div class="security-icon">
              <el-icon><Lock /></el-icon>
            </div>
            <div class="security-title">登录安全</div>
            <div class="security-status" :class="getSecurityStatusClass(securityData.loginSecurity)">
              {{ getSecurityStatusText(securityData.loginSecurity) }}
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="security-card">
            <div class="security-icon">
              <el-icon><Key /></el-icon>
            </div>
            <div class="security-title">密码策略</div>
            <div class="security-status" :class="getSecurityStatusClass(securityData.passwordPolicy)">
              {{ getSecurityStatusText(securityData.passwordPolicy) }}
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="security-card">
            <div class="security-icon">
              <el-icon><Lock /></el-icon>
            </div>
            <div class="security-title">访问控制</div>
            <div class="security-status" :class="getSecurityStatusClass(securityData.accessControl)">
              {{ getSecurityStatusText(securityData.accessControl) }}
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="security-card">
            <div class="security-icon">
              <el-icon><Monitor /></el-icon>
            </div>
            <div class="security-title">审计日志</div>
            <div class="security-status" :class="getSecurityStatusClass(securityData.auditLog)">
              {{ getSecurityStatusText(securityData.auditLog) }}
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <div class="security-settings">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="登录安全" name="login">
          <el-card>
            <el-form :model="loginSettings" label-width="150px">
              <el-form-item label="会话超时时间">
                <el-input-number
                  v-model="loginSettings.sessionTimeout"
                  :min="5"
                  :max="1440"
                  :step="5"
                  controls-position="right"
                />
                <span class="unit">分钟</span>
              </el-form-item>
              <el-form-item label="最大登录尝试次数">
                <el-input-number
                  v-model="loginSettings.maxLoginAttempts"
                  :min="1"
                  :max="10"
                  controls-position="right"
                />
              </el-form-item>
              <el-form-item label="锁定时间">
                <el-input-number
                  v-model="loginSettings.lockoutDuration"
                  :min="1"
                  :max="60"
                  controls-position="right"
                />
                <span class="unit">分钟</span>
              </el-form-item>
              <el-form-item label="启用双因素认证">
                <el-switch v-model="loginSettings.enableTwoFactorAuth" />
              </el-form-item>
              <el-form-item label="记住登录设备">
                <el-switch v-model="loginSettings.rememberDevices" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveLoginSettings">保存设置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>
        
        <el-tab-pane label="密码策略" name="password">
          <el-card>
            <el-form :model="passwordSettings" label-width="150px">
              <el-form-item label="最小密码长度">
                <el-input-number
                  v-model="passwordSettings.minLength"
                  :min="6"
                  :max="20"
                  controls-position="right"
                />
              </el-form-item>
              <el-form-item label="包含大写字母">
                <el-switch v-model="passwordSettings.requireUppercase" />
              </el-form-item>
              <el-form-item label="包含小写字母">
                <el-switch v-model="passwordSettings.requireLowercase" />
              </el-form-item>
              <el-form-item label="包含数字">
                <el-switch v-model="passwordSettings.requireNumbers" />
              </el-form-item>
              <el-form-item label="包含特殊字符">
                <el-switch v-model="passwordSettings.requireSpecialChars" />
              </el-form-item>
              <el-form-item label="密码历史记录">
                <el-input-number
                  v-model="passwordSettings.passwordHistory"
                  :min="0"
                  :max="12"
                  controls-position="right"
                />
                <span class="unit">个</span>
              </el-form-item>
              <el-form-item label="密码过期时间">
                <el-input-number
                  v-model="passwordSettings.passwordExpiry"
                  :min="0"
                  :max="365"
                  controls-position="right"
                />
                <span class="unit">天 (0表示永不过期)</span>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="savePasswordSettings">保存设置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>
        
        <el-tab-pane label="访问控制" name="access">
          <el-card>
            <el-form :model="accessSettings" label-width="150px">
              <el-form-item label="IP白名单">
                <el-switch v-model="accessSettings.enableIpWhitelist" />
              </el-form-item>
              <el-form-item v-if="accessSettings.enableIpWhitelist" label="允许的IP地址">
                <el-input
                  v-model="accessSettings.ipWhitelist"
                  type="textarea"
                  :rows="4"
                  placeholder="每行一个IP地址或IP段，例如：192.168.1.1 或 192.168.1.0/24"
                />
              </el-form-item>
              <el-form-item label="允许访问时间">
                <el-switch v-model="accessSettings.enableTimeRestriction" />
              </el-form-item>
              <el-form-item v-if="accessSettings.enableTimeRestriction" label="访问时间范围">
                <el-time-picker
                  v-model="accessSettings.accessStartTime"
                  placeholder="开始时间"
                  format="HH:mm"
                />
                <span class="time-separator">至</span>
                <el-time-picker
                  v-model="accessSettings.accessEndTime"
                  placeholder="结束时间"
                  format="HH:mm"
                />
              </el-form-item>
              <el-form-item label="允许访问星期">
                <el-checkbox-group v-model="accessSettings.accessDays">
                  <el-checkbox :label="1">周一</el-checkbox>
                  <el-checkbox :label="2">周二</el-checkbox>
                  <el-checkbox :label="3">周三</el-checkbox>
                  <el-checkbox :label="4">周四</el-checkbox>
                  <el-checkbox :label="5">周五</el-checkbox>
                  <el-checkbox :label="6">周六</el-checkbox>
                  <el-checkbox :label="0">周日</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="saveAccessSettings">保存设置</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>
        
        <el-tab-pane label="审计日志" name="audit">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>审计日志</span>
                <div>
                  <el-button type="primary" size="small" @click="exportLogs">导出日志</el-button>
                  <el-button type="primary" size="small" @click="refreshLogs">刷新</el-button>
                </div>
              </div>
            </template>
            
            <div class="log-filters">
              <el-form :inline="true" :model="logFilters">
                <el-form-item label="日志级别">
                  <el-select v-model="logFilters.level" placeholder="选择级别" clearable>
                    <el-option label="全部" value="" />
                    <el-option label="信息" value="info" />
                    <el-option label="警告" value="warning" />
                    <el-option label="错误" value="error" />
                    <el-option label="严重" value="critical" />
                  </el-select>
                </el-form-item>
                <el-form-item label="操作类型">
                  <el-select v-model="logFilters.action" placeholder="选择操作类型" clearable>
                    <el-option label="全部" value="" />
                    <el-option label="登录" value="login" />
                    <el-option label="登出" value="logout" />
                    <el-option label="创建" value="create" />
                    <el-option label="更新" value="update" />
                    <el-option label="删除" value="delete" />
                  </el-select>
                </el-form-item>
                <el-form-item label="时间范围">
                  <el-date-picker
                    v-model="logFilters.dateRange"
                    type="datetimerange"
                    range-separator="至"
                    start-placeholder="开始时间"
                    end-placeholder="结束时间"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button type="primary" @click="filterLogs">查询</el-button>
                </el-form-item>
              </el-form>
            </div>
            
            <el-table :data="auditLogs" style="width: 100%;">
              <el-table-column prop="timestamp" label="时间" width="180">
                <template #default="{ row }">
                  {{ formatDate(row.timestamp) }}
                </template>
              </el-table-column>
              <el-table-column prop="level" label="级别" width="80">
                <template #default="{ row }">
                  <el-tag :type="getLogLevelType(row.level)">{{ row.level }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="action" label="操作类型" width="100" />
              <el-table-column prop="user" label="用户" width="120" />
              <el-table-column prop="ip" label="IP地址" width="130" />
              <el-table-column prop="resource" label="资源" width="150" />
              <el-table-column prop="message" label="消息" />
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-button size="small" @click="viewLogDetail(row)">详情</el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination">
              <el-pagination
                v-model:current-page="logPagination.currentPage"
                v-model:page-size="logPagination.pageSize"
                :page-sizes="[10, 20, 50, 100]"
                layout="total, sizes, prev, pager, next, jumper"
                :total="logPagination.total"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
              />
            </div>
          </el-card>
        </el-tab-pane>
      </el-tabs>
    </div>
    
    <!-- 日志详情对话框 -->
    <el-dialog v-model="showLogDetailDialog" title="日志详情" width="600px">
      <div v-if="selectedLog">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="时间">
            {{ formatDate(selectedLog.timestamp) }}
          </el-descriptions-item>
          <el-descriptions-item label="级别">
            <el-tag :type="getLogLevelType(selectedLog.level)">{{ selectedLog.level }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="操作类型">{{ selectedLog.action }}</el-descriptions-item>
          <el-descriptions-item label="用户">{{ selectedLog.user }}</el-descriptions-item>
          <el-descriptions-item label="IP地址">{{ selectedLog.ip }}</el-descriptions-item>
          <el-descriptions-item label="资源">{{ selectedLog.resource }}</el-descriptions-item>
          <el-descriptions-item label="消息">{{ selectedLog.message }}</el-descriptions-item>
          <el-descriptions-item label="用户代理">{{ selectedLog.userAgent }}</el-descriptions-item>
          <el-descriptions-item label="会话ID">{{ selectedLog.sessionId }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSystemStore } from '@/domains/system/stores';
import { formatDate } from '@/utils/common';
import { ElMessage } from 'element-plus';
import { Lock, Key, Monitor } from '@element-plus/icons-vue';

const systemStore = useSystemStore();

// 当前标签页
const activeTab = ref('login');

// 安全数据
const securityData = ref({
  loginSecurity: 'good',
  passwordPolicy: 'medium',
  accessControl: 'good',
  auditLog: 'good',
});

// 登录安全设置
const loginSettings = ref({
  sessionTimeout: 60,
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  enableTwoFactorAuth: false,
  rememberDevices: true,
});

// 密码策略设置
const passwordSettings = ref({
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  passwordHistory: 5,
  passwordExpiry: 90,
});

// 访问控制设置
const accessSettings = ref({
  enableIpWhitelist: false,
  ipWhitelist: '',
  enableTimeRestriction: false,
  accessStartTime: new Date(2023, 0, 1, 9, 0),
  accessEndTime: new Date(2023, 0, 1, 18, 0),
  accessDays: [1, 2, 3, 4, 5],
});

// 日志过滤器
const logFilters = ref({
  level: '',
  action: '',
  dateRange: [],
});

// 审计日志
const auditLogs = ref<any[]>([]);

// 日志分页
const logPagination = ref({
  currentPage: 1,
  pageSize: 20,
  total: 0,
});

// 日志详情对话框
const showLogDetailDialog = ref(false);
const selectedLog = ref<any>(null);

// 获取安全状态类
const getSecurityStatusClass = (status: string) => {
  switch (status) {
    case 'good': return 'status-good';
    case 'medium': return 'status-medium';
    case 'poor': return 'status-poor';
    default: return 'status-medium';
  }
};

// 获取安全状态文本
const getSecurityStatusText = (status: string) => {
  switch (status) {
    case 'good': return '良好';
    case 'medium': return '中等';
    case 'poor': return '较差';
    default: return '未知';
  }
};

// 获取日志级别类型
const getLogLevelType = (level: string) => {
  switch (level) {
    case 'info': return 'info';
    case 'warning': return 'warning';
    case 'error': return 'danger';
    case 'critical': return 'danger';
    default: return 'info';
  }
};

// 保存登录设置
const saveLoginSettings = async () => {
  try {
    await systemStore.updateSystemSecurity({
      authentication: {
        methods: ['password'],
        twoFactorAuth: loginSettings.value.enableTwoFactorAuth,
        passwordPolicy: systemStore.systemSecurity?.authentication?.passwordPolicy || {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: true,
        },
      },
    });
    ElMessage.success('登录安全设置保存成功');
  } catch (error) {
    console.error('保存登录安全设置失败:', error);
    ElMessage.error('保存登录安全设置失败');
  }
};

// 保存密码策略设置
const savePasswordSettings = async () => {
  try {
    await systemStore.updateSystemSecurity({
      authentication: {
        methods: systemStore.systemSecurity?.authentication?.methods || ['password'],
        twoFactorAuth: systemStore.systemSecurity?.authentication?.twoFactorAuth || false,
        passwordPolicy: {
          minLength: passwordSettings.value.minLength,
          requireUppercase: passwordSettings.value.requireUppercase,
          requireLowercase: passwordSettings.value.requireLowercase,
          requireNumbers: passwordSettings.value.requireNumbers,
          requireSymbols: passwordSettings.value.requireSpecialChars,
        },
      },
    });
    ElMessage.success('密码策略设置保存成功');
  } catch (error) {
    console.error('保存密码策略设置失败:', error);
    ElMessage.error('保存密码策略设置失败');
  }
};

// 保存访问控制设置
const saveAccessSettings = async () => {
  try {
    const ipWhitelist = accessSettings.value.enableIpWhitelist 
      ? accessSettings.value.ipWhitelist.split('\n').filter(ip => ip.trim())
      : [];
    
    await systemStore.updateSystemSecurity({
      access: {
        ipWhitelist,
        ipBlacklist: systemStore.systemSecurity?.access?.ipBlacklist || [],
        rateLimit: systemStore.systemSecurity?.access?.rateLimit || {
          enabled: false,
          windowMs: 900000,
          maxRequests: 100,
        },
      },
    });
    ElMessage.success('访问控制设置保存成功');
  } catch (error) {
    console.error('保存访问控制设置失败:', error);
    ElMessage.error('保存访问控制设置失败');
  }
};

// 刷新日志
const refreshLogs = () => {
  loadAuditLogs();
};

// 过滤日志
const filterLogs = () => {
  loadAuditLogs();
};

// 导出日志
const exportLogs = () => {
  ElMessage.info('日志导出功能开发中');
};

// 查看日志详情
const viewLogDetail = (log: any) => {
  selectedLog.value = { ...log };
  showLogDetailDialog.value = true;
};

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  logPagination.value.pageSize = size;
  loadAuditLogs();
};

// 处理当前页变化
const handleCurrentChange = (page: number) => {
  logPagination.value.currentPage = page;
  loadAuditLogs();
};

// 加载审计日志
const loadAuditLogs = () => {
  // 模拟数据
  const mockLogs = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      level: 'info',
      action: 'login',
      user: 'admin',
      ip: '192.168.1.100',
      resource: '/login',
      message: '用户登录成功',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_1234567890',
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 1000 * 60 * 10),
      level: 'warning',
      action: 'login',
      user: 'user1',
      ip: '192.168.1.101',
      resource: '/login',
      message: '用户登录失败：密码错误',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_1234567891',
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      level: 'info',
      action: 'update',
      user: 'admin',
      ip: '192.168.1.100',
      resource: '/system/security',
      message: '更新系统安全设置',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_1234567890',
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 1000 * 60 * 20),
      level: 'error',
      action: 'delete',
      user: 'admin',
      ip: '192.168.1.100',
      resource: '/users/123',
      message: '删除用户失败：权限不足',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_1234567890',
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 1000 * 60 * 25),
      level: 'critical',
      action: 'login',
      user: 'unknown',
      ip: '192.168.1.200',
      resource: '/login',
      message: '检测到暴力破解尝试',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      sessionId: 'sess_1234567892',
    },
  ];
  
  // 应用过滤器
  let filteredLogs = mockLogs;
  
  if (logFilters.value.level) {
    filteredLogs = filteredLogs.filter(log => log.level === logFilters.value.level);
  }
  
  if (logFilters.value.action) {
    filteredLogs = filteredLogs.filter(log => log.action === logFilters.value.action);
  }
  
  if (logFilters.value.dateRange && logFilters.value.dateRange.length === 2) {
    const [startDate, endDate] = logFilters.value.dateRange;
    filteredLogs = filteredLogs.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= new Date(startDate) && logDate <= new Date(endDate);
    });
  }
  
  // 分页
  logPagination.value.total = filteredLogs.length;
  const start = (logPagination.value.currentPage - 1) * logPagination.value.pageSize;
  const end = start + logPagination.value.pageSize;
  auditLogs.value = filteredLogs.slice(start, end);
};

// 加载安全设置
const loadSecuritySettings = async () => {
  try {
    await systemStore.fetchSystemSecurity();
    
    if (systemStore.systemSecurity) {
      // 加载认证设置
      if (systemStore.systemSecurity.authentication) {
        loginSettings.value = {
          sessionTimeout: 60,
          maxLoginAttempts: 5,
          lockoutDuration: 15,
          enableTwoFactorAuth: systemStore.systemSecurity.authentication.twoFactorAuth,
          rememberDevices: true,
        };
      }
      
      // 加载密码策略设置
      if (systemStore.systemSecurity.authentication && systemStore.systemSecurity.authentication.passwordPolicy) {
        passwordSettings.value = {
          minLength: systemStore.systemSecurity.authentication.passwordPolicy.minLength,
          requireUppercase: systemStore.systemSecurity.authentication.passwordPolicy.requireUppercase,
          requireLowercase: systemStore.systemSecurity.authentication.passwordPolicy.requireLowercase,
          requireNumbers: systemStore.systemSecurity.authentication.passwordPolicy.requireNumbers,
          requireSpecialChars: systemStore.systemSecurity.authentication.passwordPolicy.requireSymbols,
          passwordHistory: 5,
          passwordExpiry: 90,
        };
      }
      
      // 加载访问控制设置
      if (systemStore.systemSecurity.access) {
        accessSettings.value = {
          enableIpWhitelist: systemStore.systemSecurity.access.ipWhitelist.length > 0,
          ipWhitelist: systemStore.systemSecurity.access.ipWhitelist.join('\n'),
          enableTimeRestriction: false,
          accessStartTime: new Date(2023, 0, 1, 9, 0),
          accessEndTime: new Date(2023, 0, 1, 18, 0),
          accessDays: [1, 2, 3, 4, 5],
        };
      }
    }
  } catch (error) {
    console.error('加载安全设置失败:', error);
  }
};

onMounted(() => {
  loadSecuritySettings();
  loadAuditLogs();
});
</script>

<style scoped>
.system-security {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: var(--el-text-color-secondary);
}

.security-overview {
  margin-bottom: 20px;
}

.security-card {
  padding: 20px 0;
  text-align: center;
}

.security-icon {
  margin-bottom: 10px;
  font-size: 40px;
  color: var(--el-color-primary);
}

.security-title {
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
}

.security-status {
  font-size: 14px;
}

.status-good {
  color: var(--el-color-success);
}

.status-medium {
  color: var(--el-color-warning);
}

.status-poor {
  color: var(--el-color-danger);
}

.security-settings {
  margin-bottom: 20px;
}

.unit {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
}

.time-separator {
  margin: 0 10px;
}

.log-filters {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>