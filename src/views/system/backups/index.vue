<template>
  <div class="system-backups">
    <div class="page-header">
      <h1>系统备份</h1>
      <p>管理系统数据备份和恢复</p>
    </div>

    <div class="page-content">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>备份列表</span>
            <el-button type="primary" @click="showCreateDialog = true">创建备份</el-button>
          </div>
        </template>

        <el-table :data="backups" v-loading="loading" style="width: 100%;">
          <el-table-column prop="name" label="备份名称" width="200" />
          <el-table-column prop="type" label="备份类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getBackupTypeTag(row.type)">{{ getBackupTypeName(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusTag(row.status)">{{ getStatusName(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="size" label="大小" width="120">
            <template #default="{ row }">
              {{ formatFileSize(row.size) }}
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="expiresAt" label="过期时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.expiresAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button size="small" @click="viewBackup(row)">查看</el-button>
              <el-button 
                size="small" 
                type="success" 
                @click="restoreBackup(row)"
                :disabled="row.status !== 'completed'"
              >恢复</el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="deleteBackup(row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="total"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </el-card>

      <!-- 备份设置 -->
      <el-card style="margin-top: 20px;">
        <template #header>
          <span>备份设置</span>
        </template>
        <el-form :model="backupSettings" label-width="120px">
          <el-form-item label="自动备份">
            <el-switch v-model="backupSettings.autoBackup" />
          </el-form-item>
          <el-form-item label="备份频率">
            <el-select v-model="backupSettings.frequency" placeholder="请选择备份频率">
              <el-option label="每日" value="daily" />
              <el-option label="每周" value="weekly" />
              <el-option label="每月" value="monthly" />
            </el-select>
          </el-form-item>
          <el-form-item label="备份时间">
            <el-time-picker
              v-model="backupSettings.time"
              placeholder="选择备份时间"
              format="HH:mm"
            />
          </el-form-item>
          <el-form-item label="保留天数">
            <el-input-number v-model="backupSettings.retentionDays" :min="1" :max="365" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="saveBackupSettings">保存设置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 创建备份对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建备份" width="500px">
      <el-form :model="newBackup" label-width="80px">
        <el-form-item label="备份名称">
          <el-input v-model="newBackup.name" placeholder="请输入备份名称" />
        </el-form-item>
        <el-form-item label="备份类型">
          <el-select v-model="newBackup.type" placeholder="请选择备份类型">
            <el-option label="完整备份" :value="SystemBackupType.FULL" />
            <el-option label="增量备份" :value="SystemBackupType.INCREMENTAL" />
            <el-option label="差异备份" :value="SystemBackupType.DIFFERENTIAL" />
          </el-select>
        </el-form-item>
        <el-form-item label="备份内容">
          <el-checkbox-group v-model="newBackup.includes">
            <el-checkbox label="database">数据库</el-checkbox>
            <el-checkbox label="files">文件</el-checkbox>
            <el-checkbox label="config">配置</el-checkbox>
            <el-checkbox label="logs">日志</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="newBackup.description"
            type="textarea"
            placeholder="请输入备份描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createBackup">创建</el-button>
      </template>
    </el-dialog>

    <!-- 备份详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="备份详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="备份名称">{{ selectedBackup?.name }}</el-descriptions-item>
        <el-descriptions-item label="备份类型">
          <el-tag :type="getBackupTypeTag(selectedBackup?.type)">{{ getBackupTypeName(selectedBackup?.type) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTag(selectedBackup?.status)">{{ getStatusName(selectedBackup?.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="大小">{{ formatFileSize(selectedBackup?.size) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDate(selectedBackup?.createdAt) }}</el-descriptions-item>
        <el-descriptions-item label="过期时间">{{ formatDate(selectedBackup?.expiresAt) }}</el-descriptions-item>
        <el-descriptions-item label="创建者">{{ selectedBackup?.creator }}</el-descriptions-item>
        <el-descriptions-item label="路径">{{ selectedBackup?.path }}</el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ selectedBackup?.description }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
        <el-button 
          type="success" 
          @click="restoreBackup(selectedBackup)"
          :disabled="selectedBackup?.status !== 'completed'"
        >恢复</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { formatDate } from '@/utils/common';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useSystemStore } from '@/domains/system/stores';
import { SystemBackupType, SystemBackupStatus } from '@/domains/system';

const systemStore = useSystemStore();

// 数据
const loading = ref(false);
const backups = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);

// 对话框状态
const showCreateDialog = ref(false);
const showDetailDialog = ref(false);
const selectedBackup = ref<any>(null);

// 备份设置
const backupSettings = ref({
  autoBackup: false,
  frequency: 'daily',
  time: new Date(2023, 1, 1, 2, 0), // 默认凌晨2点
  retentionDays: 30,
});

// 新备份表单
const newBackup = ref({
  name: '',
  type: SystemBackupType.FULL,
  includes: ['database', 'files'],
  description: '',
});

// 获取备份类型标签
const getBackupTypeTag = (type: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
  const tagMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    [SystemBackupType.FULL]: 'primary',
    [SystemBackupType.INCREMENTAL]: 'success',
    [SystemBackupType.DIFFERENTIAL]: 'warning',
  };
  return tagMap[type] || 'info';
};

// 获取备份类型名称
const getBackupTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    [SystemBackupType.FULL]: '完整备份',
    [SystemBackupType.INCREMENTAL]: '增量备份',
    [SystemBackupType.DIFFERENTIAL]: '差异备份',
  };
  return nameMap[type] || '未知类型';
};

// 获取状态标签
const getStatusTag = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'primary' => {
  const tagMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'primary'> = {
    [SystemBackupStatus.PENDING]: 'info',
    [SystemBackupStatus.RUNNING]: 'primary',
    [SystemBackupStatus.COMPLETED]: 'success',
    [SystemBackupStatus.FAILED]: 'danger',
  };
  return tagMap[status] || 'info';
};

// 获取状态名称
const getStatusName = (status: string) => {
  const nameMap: Record<string, string> = {
    [SystemBackupStatus.PENDING]: '等待中',
    [SystemBackupStatus.RUNNING]: '备份中',
    [SystemBackupStatus.COMPLETED]: '已完成',
    [SystemBackupStatus.FAILED]: '失败',
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

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchBackups();
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  fetchBackups();
};

// 获取备份列表
const fetchBackups = async () => {
  try {
    loading.value = true;
    await systemStore.fetchSystemBackups({
      page: currentPage.value,
      limit: pageSize.value,
    });
    backups.value = systemStore.systemBackups;
    total.value = systemStore.backupsTotal;
  } catch (error) {
    console.error('获取备份列表失败:', error);
    ElMessage.error('获取备份列表失败');
  } finally {
    loading.value = false;
  }
};

// 查看备份
const viewBackup = (backup: any) => {
  selectedBackup.value = { ...backup };
  showDetailDialog.value = true;
};

// 恢复备份
const restoreBackup = async (backup: any) => {
  try {
    await ElMessageBox.confirm('确定要恢复此备份吗？此操作将覆盖当前数据！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    await systemStore.restoreSystemBackup(backup.id);
    ElMessage.success('备份恢复已开始');
    showDetailDialog.value = false;
  } catch (error) {
    if (error !== 'cancel') {
      console.error('恢复备份失败:', error);
      ElMessage.error('恢复备份失败');
    }
  }
};

// 删除备份
const deleteBackup = async (backup: any) => {
  try {
    await ElMessageBox.confirm('确定要删除此备份吗？此操作不可恢复！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    await systemStore.deleteSystemBackup(backup.id);
    ElMessage.success('备份已删除');
    fetchBackups();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除备份失败:', error);
      ElMessage.error('删除备份失败');
    }
  }
};

// 创建备份
const createBackup = async () => {
  if (!newBackup.value.name) {
    ElMessage.warning('请输入备份名称');
    return;
  }
  
  if (newBackup.value.includes.length === 0) {
    ElMessage.warning('请选择至少一个备份内容');
    return;
  }
  
  try {
    await systemStore.createSystemBackup({
      name: newBackup.value.name,
      type: newBackup.value.type,
      includes: newBackup.value.includes,
      description: newBackup.value.description,
    });
    
    ElMessage.success('备份创建成功');
    showCreateDialog.value = false;
    
    // 重置表单
    resetForm();
    fetchBackups();
  } catch (error) {
    console.error('创建备份失败:', error);
    ElMessage.error('创建备份失败');
  }
};

// 重置表单
const resetForm = () => {
  newBackup.value = {
    name: '',
    type: SystemBackupType.FULL,
    includes: ['database', 'files'],
    description: '',
  };
};

// 保存备份设置
const saveBackupSettings = async () => {
  try {
    // 使用updateSystemSettings方法更新备份设置
    await systemStore.updateSystemSettings({
      backup: backupSettings.value
    });
    ElMessage.success('备份设置已保存');
  } catch (error) {
    console.error('保存备份设置失败:', error);
    ElMessage.error('保存备份设置失败');
  }
};

onMounted(() => {
  fetchBackups();
});
</script>

<style scoped>
.system-backups {
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

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>