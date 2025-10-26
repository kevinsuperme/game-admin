<template>
  <div class="system-tasks">
    <div class="page-header">
      <h1>系统任务</h1>
      <p>管理系统定时任务和后台任务</p>
    </div>

    <div class="page-content">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>任务列表</span>
            <el-button type="primary" @click="showCreateDialog = true">创建任务</el-button>
          </div>
        </template>

        <el-table :data="tasks" v-loading="loading" style="width: 100%;">
          <el-table-column prop="name" label="任务名称" width="200" />
          <el-table-column prop="type" label="任务类型" width="120">
            <template #default="{ row }">
              <el-tag :type="getTaskTypeTag(row.type) as any">{{ getTaskTypeName(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusTag(row.status) as any">{{ getStatusName(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="priority" label="优先级" width="120">
            <template #default="{ row }">
              <el-tag :type="getPriorityTag(row.priority) as any">{{ getPriorityName(row.priority) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="scheduledTime" label="计划时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.scheduledTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="progress" label="进度" width="120">
            <template #default="{ row }">
              <el-progress :percentage="row.progress || 0" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button size="small" @click="viewTask(row)">查看</el-button>
              <el-button 
                size="small" 
                type="primary" 
                @click="runTask(row)"
                :disabled="row.status === 'running'"
              >运行</el-button>
              <el-button 
                size="small" 
                type="danger" 
                @click="cancelTask(row)"
                :disabled="row.status !== 'running'"
              >取消</el-button>
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
    </div>

    <!-- 创建任务对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建任务" width="500px">
      <el-form :model="newTask" label-width="80px">
        <el-form-item label="任务名称">
          <el-input v-model="newTask.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务类型">
          <el-select v-model="newTask.type" placeholder="请选择任务类型">
            <el-option label="清理任务" value="cleanup" />
            <el-option label="备份任务" value="backup" />
            <el-option label="报告任务" value="report" />
            <el-option label="通知任务" value="notification" />
            <el-option label="维护任务" value="maintenance" />
            <el-option label="自定义任务" value="custom" />
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="newTask.priority" placeholder="请选择优先级">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划时间">
          <el-date-picker
            v-model="newTask.scheduledTime"
            type="datetime"
            placeholder="选择计划时间"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="newTask.description"
            type="textarea"
            placeholder="请输入任务描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createTask">创建</el-button>
      </template>
    </el-dialog>

    <!-- 任务详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="任务详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="任务名称">{{ selectedTask?.name }}</el-descriptions-item>
        <el-descriptions-item label="任务类型">
          <el-tag :type="getTaskTypeTag(selectedTask?.type) as any">{{ getTaskTypeName(selectedTask?.type) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTag(selectedTask?.status) as any">{{ getStatusName(selectedTask?.status) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="getPriorityTag(selectedTask?.priority) as any">{{ getPriorityName(selectedTask?.priority) }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="计划时间">{{ formatDate(selectedTask?.scheduledTime) }}</el-descriptions-item>
        <el-descriptions-item label="开始时间">{{ formatDate(selectedTask?.startTime) }}</el-descriptions-item>
        <el-descriptions-item label="结束时间">{{ formatDate(selectedTask?.endTime) }}</el-descriptions-item>
        <el-descriptions-item label="进度">
          <el-progress :percentage="selectedTask?.progress || 0" />
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">{{ selectedTask?.description }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { formatDate } from '@/utils/common';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useSystemStore } from '@/domains/system/stores';
import { SystemTaskType, SystemTaskStatus, SystemTaskPriority } from '@/domains/system';

const systemStore = useSystemStore();

// 数据
const loading = ref(false);
const tasks = ref<any[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);

// 对话框状态
const showCreateDialog = ref(false);
const showDetailDialog = ref(false);
const selectedTask = ref<any>(null);

// 新任务表单
const newTask = ref({
  name: '',
  type: 'cleanup',
  priority: 'medium',
  scheduledTime: new Date(),
  description: '',
});

// 获取任务类型标签
const getTaskTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    [SystemTaskType.CLEANUP]: 'info',
    [SystemTaskType.BACKUP]: 'success',
    [SystemTaskType.REPORT]: 'warning',
    [SystemTaskType.NOTIFICATION]: 'primary',
    [SystemTaskType.MAINTENANCE]: 'danger',
    [SystemTaskType.CUSTOM]: 'info',
  };
  return tagMap[type] || 'info';
};

// 获取任务类型名称
const getTaskTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    [SystemTaskType.CLEANUP]: '清理任务',
    [SystemTaskType.BACKUP]: '备份任务',
    [SystemTaskType.REPORT]: '报告任务',
    [SystemTaskType.NOTIFICATION]: '通知任务',
    [SystemTaskType.MAINTENANCE]: '维护任务',
    [SystemTaskType.CUSTOM]: '自定义任务',
  };
  return nameMap[type] || '未知类型';
};

// 获取状态标签
const getStatusTag = (status: string) => {
  const tagMap: Record<string, string> = {
    [SystemTaskStatus.PENDING]: 'info',
    [SystemTaskStatus.RUNNING]: 'primary',
    [SystemTaskStatus.COMPLETED]: 'success',
    [SystemTaskStatus.FAILED]: 'danger',
    [SystemTaskStatus.CANCELLED]: 'warning',
  };
  return tagMap[status] || 'info';
};

// 获取状态名称
const getStatusName = (status: string) => {
  const nameMap: Record<string, string> = {
    [SystemTaskStatus.PENDING]: '等待中',
    [SystemTaskStatus.RUNNING]: '运行中',
    [SystemTaskStatus.COMPLETED]: '已完成',
    [SystemTaskStatus.FAILED]: '失败',
    [SystemTaskStatus.CANCELLED]: '已取消',
  };
  return nameMap[status] || '未知状态';
};

// 获取优先级标签
const getPriorityTag = (priority: string) => {
  const tagMap: Record<string, string> = {
    [SystemTaskPriority.LOW]: 'info',
    [SystemTaskPriority.MEDIUM]: 'primary',
    [SystemTaskPriority.HIGH]: 'warning',
    [SystemTaskPriority.URGENT]: 'danger',
  };
  return tagMap[priority] || 'info';
};

// 获取优先级名称
const getPriorityName = (priority: string) => {
  const nameMap: Record<string, string> = {
    [SystemTaskPriority.LOW]: '低',
    [SystemTaskPriority.MEDIUM]: '中',
    [SystemTaskPriority.HIGH]: '高',
    [SystemTaskPriority.URGENT]: '紧急',
  };
  return nameMap[priority] || '未知优先级';
};

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchTasks();
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  fetchTasks();
};

// 获取任务列表
const fetchTasks = async () => {
  try {
    loading.value = true;
    await systemStore.fetchSystemTasks({
      page: currentPage.value,
      limit: pageSize.value,
    });
    tasks.value = systemStore.systemTasks;
    total.value = systemStore.tasksTotal;
  } catch (error) {
    console.error('获取任务列表失败:', error);
    ElMessage.error('获取任务列表失败');
  } finally {
    loading.value = false;
  }
};

// 查看任务
const viewTask = (task: any) => {
  selectedTask.value = { ...task };
  showDetailDialog.value = true;
};

// 运行任务
const runTask = async (task: any) => {
  try {
    await ElMessageBox.confirm('确定要运行此任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    await systemStore.runSystemTask(task.id);
    ElMessage.success('任务已开始运行');
    fetchTasks();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('运行任务失败:', error);
      ElMessage.error('运行任务失败');
    }
  }
};

// 取消任务
const cancelTask = async (task: any) => {
  try {
    await ElMessageBox.confirm('确定要取消此任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    await systemStore.cancelSystemTask(task.id);
    ElMessage.success('任务已取消');
    fetchTasks();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消任务失败:', error);
      ElMessage.error('取消任务失败');
    }
  }
};

// 创建任务
const createTask = async () => {
  if (!newTask.value.name) {
    ElMessage.warning('请输入任务名称');
    return;
  }
  
  try {
    await systemStore.createSystemTask({
      name: newTask.value.name,
      type: newTask.value.type as any,
      priority: newTask.value.priority as any,
      status: 'pending',
      progress: 0,
      schedule: {
        type: 'once',
        value: newTask.value.scheduledTime.toISOString(),
      },
      description: newTask.value.description,
    });
    
    ElMessage.success('任务创建成功');
    showCreateDialog.value = false;
    
    // 重置表单
    newTask.value = {
      name: '',
      type: 'cleanup',
      priority: 'medium',
      scheduledTime: new Date(),
      description: '',
    };
    
    fetchTasks();
  } catch (error) {
    console.error('创建任务失败:', error);
    ElMessage.error('创建任务失败');
  }
};

onMounted(() => {
  fetchTasks();
});
</script>

<style scoped>
.system-tasks {
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