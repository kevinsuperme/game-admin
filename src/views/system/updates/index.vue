<template>
  <div class="system-updates">
    <div class="page-header">
      <h1>系统更新</h1>
      <p>管理系统版本更新和补丁</p>
    </div>

    <div class="page-content">
      <!-- 系统信息 -->
      <el-card>
        <template #header>
          <span>系统信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="当前版本">{{ systemInfo.version }}</el-descriptions-item>
          <el-descriptions-item label="构建时间">{{ formatDate(systemInfo.buildTime) }}</el-descriptions-item>
          <el-descriptions-item label="上次更新">{{ formatDate(systemInfo.lastUpdateTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新渠道">{{ systemInfo.updateChannel }}</el-descriptions-item>
          <el-descriptions-item label="自动更新">
            <el-switch v-model="systemInfo.autoUpdate" @change="saveSystemSettings" />
          </el-descriptions-item>
          <el-descriptions-item label="更新状态">
            <el-tag :type="getUpdateStatusTag(systemInfo.updateStatus) as any">
              {{ getUpdateStatusName(systemInfo.updateStatus) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 更新列表 -->
      <el-card style="margin-top: 20px;">
        <template #header>
          <div class="card-header">
            <span>可用更新</span>
            <el-button type="primary" @click="checkUpdates">检查更新</el-button>
          </div>
        </template>

        <el-table :data="updates" v-loading="loading" style="width: 100%;">
          <el-table-column prop="version" label="版本" width="120" />
          <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getUpdateTypeTag(row.type) as any">{{ getUpdateTypeName(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getUpdateStatusTag(row.status) as any">{{ getUpdateStatusName(row.status) }}</el-tag>
          </template>
        </el-table-column>
          <el-table-column prop="releaseDate" label="发布时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.releaseDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="size" label="大小" width="120">
            <template #default="{ row }">
              {{ formatFileSize(row.size) }}
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" />
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button size="small" @click="viewUpdate(row)">查看</el-button>
              <el-button 
                size="small" 
                type="primary" 
                @click="downloadUpdate(row)"
                :disabled="row.status === 'downloading' || row.status === 'installed'"
              >下载</el-button>
              <el-button 
                size="small" 
                type="success" 
                @click="installUpdate(row)"
                :disabled="row.status !== 'downloaded'"
              >安装</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 更新设置 -->
      <el-card style="margin-top: 20px;">
        <template #header>
          <span>更新设置</span>
        </template>
        <el-form :model="updateSettings" label-width="120px">
          <el-form-item label="更新渠道">
            <el-select v-model="updateSettings.channel" placeholder="请选择更新渠道">
              <el-option label="稳定版" value="stable" />
              <el-option label="测试版" value="beta" />
              <el-option label="开发版" value="dev" />
            </el-select>
          </el-form-item>
          <el-form-item label="自动检查更新">
            <el-switch v-model="updateSettings.autoCheck" />
          </el-form-item>
          <el-form-item label="检查频率">
            <el-select v-model="updateSettings.checkFrequency" placeholder="请选择检查频率">
              <el-option label="每日" value="daily" />
              <el-option label="每周" value="weekly" />
              <el-option label="每月" value="monthly" />
            </el-select>
          </el-form-item>
          <el-form-item label="自动下载更新">
            <el-switch v-model="updateSettings.autoDownload" />
          </el-form-item>
          <el-form-item label="自动安装更新">
            <el-switch v-model="updateSettings.autoInstall" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveUpdateSettings">保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 更新详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="更新详情" width="700px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="版本">{{ selectedUpdate?.version }}</el-descriptions-item>
        <el-descriptions-item label="类型">
            <el-tag :type="getUpdateTypeTag(selectedUpdate?.type || 'patch') as any">{{ getUpdateTypeName(selectedUpdate?.type || 'patch') }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getUpdateStatusTag(selectedUpdate?.status || 'available') as any">{{ getUpdateStatusName(selectedUpdate?.status || 'available') }}</el-tag>
          </el-descriptions-item>
        <el-descriptions-item label="大小">{{ formatFileSize(selectedUpdate?.size || 0) }}</el-descriptions-item>
        <el-descriptions-item label="发布时间">{{ formatDate(selectedUpdate?.releaseDate || '') }}</el-descriptions-item>
        <el-descriptions-item label="下载时间">{{ formatDate(selectedUpdate?.downloadedAt || '') }}</el-descriptions-item>
        <el-descriptions-item label="安装时间">{{ formatDate(selectedUpdate?.installedAt || '') }}</el-descriptions-item>
        <el-descriptions-item label="下载路径">{{ selectedUpdate?.downloadUrl }}</el-descriptions-item>
        <el-descriptions-item label="校验和">{{ selectedUpdate?.checksum }}</el-descriptions-item>
      </el-descriptions>
      
      <div style="margin-top: 20px;">
        <h3>更新内容</h3>
        <div class="update-content" v-html="selectedUpdate?.changelog"></div>
      </div>
      
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button 
            type="primary" 
            @click="downloadUpdate(selectedUpdate)"
            :disabled="selectedUpdate?.status === 'downloading' || selectedUpdate?.status === 'completed'"
          >下载</el-button>
          <el-button 
            type="success" 
            @click="installUpdate(selectedUpdate)"
            :disabled="selectedUpdate?.status !== 'completed'"
          >安装</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { formatDate } from '@/utils/common';
import { ElMessage, ElMessageBox } from 'element-plus';
  import { useSystemStore } from '@/domains/system/stores';
  import { SystemUpdateType, SystemUpdateStatus, type SystemUpdate } from '@/domains/system';

const systemStore = useSystemStore();

// 数据
const loading = ref(false);
const updates = ref<any[]>([]);

// 对话框状态
const showDetailDialog = ref(false);
const selectedUpdate = ref<SystemUpdate | null>(null);

// 系统信息
const systemInfo = ref({
  version: '1.0.0',
  buildTime: new Date('2023-01-01T00:00:00Z'),
  lastUpdateTime: new Date('2023-01-01T00:00:00Z'),
  updateChannel: 'stable',
  autoUpdate: false,
  updateStatus: 'up-to-date',
});

// 更新设置
const updateSettings = ref({
  channel: 'stable',
  autoCheck: true,
  checkFrequency: 'weekly',
  autoDownload: false,
  autoInstall: false,
});

// 获取更新类型标签
const getUpdateTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    [SystemUpdateType.MAJOR]: 'danger',
    [SystemUpdateType.MINOR]: 'warning',
    [SystemUpdateType.PATCH]: 'primary',
  };
  return tagMap[type] || 'info';
};

// 获取更新类型名称
const getUpdateTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    [SystemUpdateType.MAJOR]: '主要版本',
    [SystemUpdateType.MINOR]: '次要版本',
    [SystemUpdateType.PATCH]: '补丁',
  };
  return nameMap[type] || '未知类型';
};

// 获取更新状态标签
const getUpdateStatusTag = (status: string) => {
  const tagMap: Record<string, string> = {
    [SystemUpdateStatus.AVAILABLE]: 'info',
    [SystemUpdateStatus.DOWNLOADING]: 'primary',
    [SystemUpdateStatus.INSTALLING]: 'warning',
    [SystemUpdateStatus.FAILED]: 'danger',
  };
  return tagMap[status] || 'info';
};

// 获取更新状态名称
const getUpdateStatusName = (status: string) => {
  const nameMap: Record<string, string> = {
    [SystemUpdateStatus.AVAILABLE]: '可用',
    [SystemUpdateStatus.DOWNLOADING]: '下载中',
    [SystemUpdateStatus.INSTALLING]: '安装中',
    [SystemUpdateStatus.FAILED]: '失败',
  };
  return nameMap[status] || '未知状态';
};

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 检查更新
const checkUpdates = async () => {
  try {
    loading.value = true;
    await systemStore.checkSystemUpdates();
    updates.value = systemStore.systemUpdates;
    ElMessage.success('更新检查完成');
  } catch (error) {
    console.error('检查更新失败:', error);
    ElMessage.error('检查更新失败');
  } finally {
    loading.value = false;
  }
};

// 查看更新
const viewUpdate = (update: any) => {
  selectedUpdate.value = { ...update };
  showDetailDialog.value = true;
};

// 下载更新
const downloadUpdate = async (update: any) => {
  try {
    await ElMessageBox.confirm('确定要下载此更新吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info',
    });
    
    await systemStore.downloadSystemUpdate(update.id);
    ElMessage.success('更新下载已开始');
    
    // 更新状态
    const index = updates.value.findIndex(u => u.id === update.id);
    if (index !== -1) {
      updates.value[index].status = 'downloading';
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('下载更新失败:', error);
      ElMessage.error('下载更新失败');
    }
  }
};

// 安装更新
const installUpdate = async (update: any) => {
  try {
    await ElMessageBox.confirm('确定要安装此更新吗？安装后系统将重启！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    await systemStore.installSystemUpdate(update.id);
    ElMessage.success('更新安装已开始，系统将在安装完成后重启');
    
    // 更新状态
    const index = updates.value.findIndex(u => u.id === update.id);
    if (index !== -1) {
      updates.value[index].status = 'installing';
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('安装更新失败:', error);
      ElMessage.error('安装更新失败');
    }
  }
};

// 保存系统设置
const saveSystemSettings = async () => {
  try {
    await systemStore.updateSystemSettings({
      autoUpdate: systemInfo.value.autoUpdate,
    });
    ElMessage.success('系统设置已保存');
  } catch (error) {
    console.error('保存系统设置失败:', error);
    ElMessage.error('保存系统设置失败');
  }
};

// 保存更新设置
const saveUpdateSettings = async () => {
  try {
    await systemStore.updateUpdateSettings(updateSettings.value);
    ElMessage.success('更新设置已保存');
  } catch (error) {
    console.error('保存更新设置失败:', error);
    ElMessage.error('保存更新设置失败');
  }
};

onMounted(() => {
  // 初始化数据
  checkUpdates();
});
</script>

<style scoped>
.system-updates {
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

.update-content {
  max-height: 300px;
  padding: 10px;
  overflow-y: auto;
  background-color: var(--el-fill-color-light);
  border-radius: 4px;
}

.update-content :deep(h3) {
  margin-top: 0;
  margin-bottom: 10px;
}

.update-content :deep(ul) {
  padding-left: 20px;
  margin: 0;
}

.update-content :deep(li) {
  margin-bottom: 5px;
}
</style>