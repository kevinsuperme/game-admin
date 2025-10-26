<template>
  <div class="system-services">
    <div class="page-header">
      <h1>系统服务</h1>
      <p>管理系统服务和守护进程</p>
    </div>

    <div class="page-content">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>服务列表</span>
            <el-button type="primary" @click="refreshServices">刷新</el-button>
          </div>
        </template>

        <el-table :data="services" v-loading="loading" style="width: 100%;">
          <el-table-column prop="name" label="服务名称" width="200" />
          <el-table-column prop="displayName" label="显示名称" width="200" />
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusTag(row.status)">{{ getStatusName(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="startupType" label="启动类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getStartupTypeTag(row.startupType)">{{ getStartupTypeName(row.startupType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="pid" label="进程ID" width="100" />
          <el-table-column prop="cpuUsage" label="CPU使用率" width="120">
            <template #default="{ row }">
              <el-progress :percentage="row.cpuUsage || 0" />
            </template>
          </el-table-column>
          <el-table-column prop="memoryUsage" label="内存使用" width="120">
            <template #default="{ row }">
              {{ formatMemorySize(row.memoryUsage) }}
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="启动时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.startTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button size="small" @click="viewService(row)">查看</el-button>
              <el-button 
                size="small" 
                type="success" 
                @click="startService(row)"
                :disabled="row.status === 'running'"
              >启动</el-button>
              <el-button 
                size="small" 
                type="warning" 
                @click="stopService(row)"
                :disabled="row.status !== 'running'"
              >停止</el-button>
              <el-button 
                size="small" 
                type="primary" 
                @click="restartService(row)"
              >重启</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 服务依赖关系 -->
      <el-card style="margin-top: 20px;">
        <template #header>
          <span>服务依赖关系</span>
        </template>
        <div class="dependency-graph" v-loading="dependencyLoading">
          <!-- 这里可以放置一个依赖关系图，暂时用简单的列表代替 -->
          <el-table :data="serviceDependencies" style="width: 100%;">
            <el-table-column prop="serviceName" label="服务名称" width="200" />
            <el-table-column prop="dependsOn" label="依赖服务" width="200">
              <template #default="{ row }">
                <el-tag v-for="service in row.dependsOn" :key="service" style="margin-right: 5px;">
                  {{ service }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="dependentBy" label="被依赖服务" width="200">
              <template #default="{ row }">
                <el-tag v-for="service in row.dependentBy" :key="service" style="margin-right: 5px;">
                  {{ service }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>
    </div>

    <!-- 服务详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="服务详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="服务名称">{{ selectedService?.name }}</el-descriptions-item>
        <el-descriptions-item label="显示名称">{{ selectedService?.displayName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTag(selectedService?.status)">{{ getStatusName(selectedService?.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="启动类型">
          <el-tag :type="getStartupTypeTag(selectedService?.startupType)">{{ getStartupTypeName(selectedService?.startupType) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="进程ID">{{ selectedService?.pid }}</el-descriptions-item>
        <el-descriptions-item label="CPU使用率">{{ selectedService?.cpuUsage }}%</el-descriptions-item>
        <el-descriptions-item label="内存使用">{{ formatMemorySize(selectedService?.memoryUsage) }}</el-descriptions-item>
        <el-descriptions-item label="启动时间">{{ formatDate(selectedService?.startTime) }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ selectedService?.description }}</el-descriptions-item>
        <el-descriptions-item label="可执行路径" :span="2">{{ selectedService?.executablePath }}</el-descriptions-item>
        <el-descriptions-item label="工作目录" :span="2">{{ selectedService?.workingDirectory }}</el-descriptions-item>
        <el-descriptions-item label="命令行参数" :span="2">{{ selectedService?.commandLine }}</el-descriptions-item>
      </el-descriptions>
      
      <div style="margin-top: 20px;">
        <h3>服务日志</h3>
        <div class="service-logs">
          <el-table :data="selectedServiceLogs" style="width: 100%;" max-height="300">
            <el-table-column prop="timestamp" label="时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.timestamp) }}
              </template>
            </el-table-column>
            <el-table-column prop="level" label="级别" width="100">
              <template #default="{ row }">
                <el-tag :type="getLogLevelTag(row.level)">{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="消息" />
          </el-table>
        </div>
      </div>
      
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button 
          type="success" 
          @click="startService(selectedService)"
          :disabled="selectedService?.status === 'running'"
        >启动</el-button>
        <el-button 
          type="warning" 
          @click="stopService(selectedService)"
          :disabled="selectedService?.status !== 'running'"
        >停止</el-button>
        <el-button 
          type="primary" 
          @click="restartService(selectedService)"
        >重启</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { formatDate } from '@/utils/common';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useSystemStore } from '@/domains/system/stores';
import { SystemServiceStatus } from '@/domains/system';

const systemStore = useSystemStore();

// 数据
const loading = ref(false);
const dependencyLoading = ref(false);
const services = ref<any[]>([]);
const serviceDependencies = ref<any[]>([]);

// 对话框状态
const showDetailDialog = ref(false);
const selectedService = ref<any>(null);
const selectedServiceLogs = ref<any[]>([]);

// 获取状态标签
const getStatusTag = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
  const tagMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    [SystemServiceStatus.RUNNING]: 'success',
    [SystemServiceStatus.STOPPED]: 'danger',
    [SystemServiceStatus.ERROR]: 'danger',
    [SystemServiceStatus.MAINTENANCE]: 'warning',
    'starting': 'primary',
    'stopping': 'warning',
    'paused': 'warning',
  };
  return tagMap[status] || 'info';
};

// 获取状态名称
const getStatusName = (status: string) => {
  const nameMap: Record<string, string> = {
    [SystemServiceStatus.RUNNING]: '运行中',
    [SystemServiceStatus.STOPPED]: '已停止',
    [SystemServiceStatus.ERROR]: '错误',
    [SystemServiceStatus.MAINTENANCE]: '维护中',
    'starting': '启动中',
    'stopping': '停止中',
    'paused': '已暂停',
  };
  return nameMap[status] || '未知状态';
};

// 获取启动类型标签
const getStartupTypeTag = (type: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
  const tagMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    'auto': 'success',
    'manual': 'info',
    'disabled': 'danger',
  };
  return tagMap[type] || 'info';
};

// 获取启动类型名称
const getStartupTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    'auto': '自动',
    'manual': '手动',
    'disabled': '禁用',
  };
  return nameMap[type] || '未知类型';
};

// 获取日志级别标签
const getLogLevelTag = (level: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
  const tagMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    'DEBUG': 'info',
    'INFO': 'primary',
    'WARNING': 'warning',
    'ERROR': 'danger',
    'CRITICAL': 'danger',
  };
  return tagMap[level] || 'info';
};

// 格式化内存大小
const formatMemorySize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 刷新服务列表
const refreshServices = async () => {
  try {
    loading.value = true;
    await systemStore.fetchSystemServices();
    services.value = systemStore.systemServices;
    ElMessage.success('服务列表已刷新');
  } catch (error) {
    console.error('刷新服务列表失败:', error);
    ElMessage.error('刷新服务列表失败');
  } finally {
    loading.value = false;
  }
};

// 获取服务依赖关系
const fetchServiceDependencies = async () => {
  try {
    dependencyLoading.value = true;
    // 暂时使用模拟数据，因为系统存储中缺少 fetchServiceDependencies 方法
    serviceDependencies.value = [
      {
        serviceName: 'database-service',
        dependsOn: ['redis-service', 'filesystem-service'],
        dependentBy: ['api-service', 'auth-service']
      },
      {
        serviceName: 'redis-service',
        dependsOn: [],
        dependentBy: ['database-service', 'cache-service']
      },
      {
        serviceName: 'api-service',
        dependsOn: ['database-service', 'auth-service'],
        dependentBy: ['frontend-service']
      }
    ];
  } catch (error) {
    console.error('获取服务依赖关系失败:', error);
    ElMessage.error('获取服务依赖关系失败');
  } finally {
    dependencyLoading.value = false;
  }
};

// 查看服务
const viewService = async (service: any) => {
  try {
    selectedService.value = { ...service };
    
    // 暂时使用模拟数据，因为系统存储中缺少 fetchServiceLogs 方法
    selectedServiceLogs.value = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        level: 'info',
        message: `服务 ${service.name} 启动成功`,
        details: `服务在端口 ${service.port} 上启动，进程ID: ${service.pid || 'unknown'}`
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        level: 'warning',
        message: `服务 ${service.name} 内存使用率较高`,
        details: `当前内存使用: ${service.memoryUsage || '未知'}，建议检查内存泄漏`
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        level: 'info',
        message: `服务 ${service.name} 配置更新`,
        details: '配置文件已重新加载，新配置已生效'
      }
    ];
    
    showDetailDialog.value = true;
  } catch (error) {
    console.error('获取服务详情失败:', error);
    ElMessage.error('获取服务详情失败');
  }
};

// 启动服务
const startService = async (service: any) => {
  try {
    await ElMessageBox.confirm('确定要启动此服务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    });
    
    await systemStore.startSystemService(service.id);
    ElMessage.success('服务启动成功');
    
    // 更新状态
    const index = services.value.findIndex(s => s.id === service.id);
    if (index !== -1) {
      services.value[index].status = 'starting';
      // 模拟状态变化
      setTimeout(() => {
        services.value[index].status = 'running';
      }, 2000);
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('启动服务失败:', error);
      ElMessage.error('启动服务失败');
    }
  }
};

// 停止服务
const stopService = async (service: any) => {
  try {
    await ElMessageBox.confirm('确定要停止此服务吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    await systemStore.stopSystemService(service.id);
    ElMessage.success('服务停止成功');
    
    // 更新状态
    const index = services.value.findIndex(s => s.id === service.id);
    if (index !== -1) {
      services.value[index].status = 'stopping';
      // 模拟状态变化
      setTimeout(() => {
        services.value[index].status = 'stopped';
      }, 2000);
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('停止服务失败:', error);
      ElMessage.error('停止服务失败');
    }
  }
};

// 重启服务
const restartService = async (service: any) => {
  try {
    await ElMessageBox.confirm('确定要重启此服务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    });
    
    await systemStore.restartSystemService(service.id);
    ElMessage.success('服务重启成功');
    
    // 更新状态
    const index = services.value.findIndex(s => s.id === service.id);
    if (index !== -1) {
      services.value[index].status = 'stopping';
      // 模拟状态变化
      setTimeout(() => {
        services.value[index].status = 'starting';
        setTimeout(() => {
          services.value[index].status = 'running';
        }, 2000);
      }, 2000);
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('重启服务失败:', error);
      ElMessage.error('重启服务失败');
    }
  }
};

onMounted(() => {
  refreshServices();
  fetchServiceDependencies();
});
</script>

<style scoped>
.system-services {
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

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dependency-graph {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}

.service-logs {
  max-height: 300px;
  overflow-y: auto;
}
</style>