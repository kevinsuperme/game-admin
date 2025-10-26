<template>
  <div class="system-maintenance">
    <div class="page-header">
      <h1>系统维护</h1>
      <p>管理系统维护任务和计划</p>
    </div>
    
    <div class="maintenance-status">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>维护状态</span>
            <el-button type="primary" size="small" @click="refreshStatus">刷新</el-button>
          </div>
        </template>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="status-item">
              <div class="status-label">系统状态</div>
              <div class="status-value" :class="systemStatusClass">
                {{ systemStatusText }}
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="status-item">
              <div class="status-label">上次维护时间</div>
              <div class="status-value">
                {{ formatDate(maintenanceData.lastMaintenanceTime) }}
              </div>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="status-item">
              <div class="status-label">下次计划维护</div>
              <div class="status-value">
                {{ formatDate(maintenanceData.nextMaintenanceTime) }}
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
    
    <div class="maintenance-tasks">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>维护任务</span>
            <el-button type="primary" @click="showCreateTaskDialog = true">创建任务</el-button>
          </div>
        </template>
        <el-table :data="maintenanceTasks" style="width: 100%;">
          <el-table-column prop="name" label="任务名称" />
          <el-table-column prop="type" label="类型" width="120">
            <template #default="{ row }">
              <el-tag>{{ getTaskTypeText(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="scheduledTime" label="计划时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.scheduledTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="progress" label="进度" width="150">
            <template #default="{ row }">
              <el-progress :percentage="row.progress" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button size="small" @click="viewTask(row)">查看</el-button>
              <el-button size="small" type="primary" @click="runTask(row)" :disabled="row.status === 'running'">执行</el-button>
              <el-button size="small" type="danger" @click="cancelTask(row)" :disabled="row.status !== 'running'">取消</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    
    <div class="maintenance-history">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>维护历史</span>
            <el-button type="primary" size="small" @click="refreshHistory">刷新</el-button>
          </div>
        </template>
        <el-table :data="maintenanceHistory" style="width: 100%;">
          <el-table-column prop="name" label="任务名称" />
          <el-table-column prop="type" label="类型" width="120">
            <template #default="{ row }">
              <el-tag>{{ getTaskTypeText(row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="开始时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.startTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="endTime" label="结束时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.endTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="duration" label="耗时" width="120">
            <template #default="{ row }">
              {{ formatDuration(row.startTime, row.endTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button size="small" @click="viewTaskDetail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    
    <!-- 创建任务对话框 -->
    <el-dialog v-model="showCreateTaskDialog" title="创建维护任务" width="600px">
      <el-form :model="newTask" label-width="100px">
        <el-form-item label="任务名称">
          <el-input v-model="newTask.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="任务类型">
          <el-select v-model="newTask.type" placeholder="请选择任务类型" style="width: 100%;">
            <el-option label="系统清理" value="cleanup" />
            <el-option label="系统优化" value="optimization" />
            <el-option label="系统修复" value="repair" />
            <el-option label="系统更新" value="update" />
          </el-select>
        </el-form-item>
        <el-form-item label="计划时间">
          <el-date-picker
            v-model="newTask.scheduledTime"
            type="datetime"
            placeholder="选择计划执行时间"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input
            v-model="newTask.description"
            type="textarea"
            placeholder="请输入任务描述"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateTaskDialog = false">取消</el-button>
        <el-button type="primary" @click="createTask">确定</el-button>
      </template>
    </el-dialog>
    
    <!-- 任务详情对话框 -->
    <el-dialog v-model="showTaskDetailDialog" title="任务详情" width="800px">
      <div v-if="selectedTask">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务名称">{{ selectedTask.name }}</el-descriptions-item>
          <el-descriptions-item label="任务类型">
            <el-tag>{{ getTaskTypeText(selectedTask.type) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="任务状态">
            <el-tag :type="getStatusType(selectedTask.status)">{{ getStatusText(selectedTask.status) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="进度">
            <el-progress :percentage="selectedTask.progress" />
          </el-descriptions-item>
          <el-descriptions-item label="计划时间">
            {{ formatDate(selectedTask.scheduledTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">
              {{ formatDate(selectedTask.startTime) }}
            </el-descriptions-item>
          <el-descriptions-item label="结束时间">
              {{ formatDate(selectedTask.endTime) }}
            </el-descriptions-item>
          <el-descriptions-item label="耗时">
            {{ formatDuration(selectedTask.startTime, selectedTask.endTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="任务描述" :span="2">
            {{ selectedTask.description }}
          </el-descriptions-item>
        </el-descriptions>
        
        <div v-if="selectedTask.logs && selectedTask.logs.length > 0" class="task-logs">
          <h4>执行日志</h4>
          <el-timeline>
            <el-timeline-item
              v-for="(log, index) in selectedTask.logs"
              :key="index"
              :timestamp="formatDate(log.timestamp)"
              :type="log.level === 'error' ? 'danger' : log.level === 'warning' ? 'warning' : 'primary'"
            >
              {{ log.message }}
            </el-timeline-item>
          </el-timeline>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useSystemStore } from '@/domains/system/stores';
import { formatDate } from '@/utils/common';
import { ElMessage, ElMessageBox } from 'element-plus';

const systemStore = useSystemStore();

// 维护数据
const maintenanceData = ref({
  status: 'normal',
  lastMaintenanceTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  nextMaintenanceTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
});

// 维护任务
const maintenanceTasks = ref<any[]>([]);

// 维护历史
const maintenanceHistory = ref<any[]>([]);

// 对话框状态
const showCreateTaskDialog = ref(false);
const showTaskDetailDialog = ref(false);

// 新任务表单
const newTask = ref({
  name: '',
  type: 'cleanup',
  scheduledTime: new Date(),
  description: '',
});

// 选中的任务
const selectedTask = ref<any>(null);

// 系统状态计算属性
const systemStatusClass = computed(() => {
  switch (maintenanceData.value.status) {
    case 'normal': return 'status-normal';
    case 'maintenance': return 'status-maintenance';
    case 'warning': return 'status-warning';
    case 'error': return 'status-error';
    default: return 'status-normal';
  }
});

const systemStatusText = computed(() => {
  switch (maintenanceData.value.status) {
    case 'normal': return '正常';
    case 'maintenance': return '维护中';
    case 'warning': return '警告';
    case 'error': return '错误';
    default: return '未知';
  }
});

// 获取任务类型文本
const getTaskTypeText = (type: string) => {
  switch (type) {
    case 'cleanup': return '系统清理';
    case 'optimization': return '系统优化';
    case 'repair': return '系统修复';
    case 'update': return '系统更新';
    default: return '未知类型';
  }
};

// 获取状态类型
const getStatusType = (status: string) => {
  switch (status) {
    case 'scheduled': return 'info';
    case 'running': return 'warning';
    case 'completed': return 'success';
    case 'failed': return 'danger';
    case 'cancelled': return 'info';
    default: return 'info';
  }
};

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'scheduled': return '已计划';
    case 'running': return '执行中';
    case 'completed': return '已完成';
    case 'failed': return '失败';
    case 'cancelled': return '已取消';
    default: return '未知状态';
  }
};

// 格式化持续时间
const formatDuration = (startTime: Date, endTime: Date) => {
  if (!startTime || !endTime) return '-';
  
  const duration = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}小时${minutes}分钟`;
};

// 刷新状态
const refreshStatus = async () => {
  try {
    await systemStore.fetchSystemMaintenance();
    
    if (systemStore.systemMaintenance) {
      maintenanceData.value = {
        status: systemStore.systemMaintenance.mode ? 'maintenance' : 'normal',
        lastMaintenanceTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        nextMaintenanceTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      };
    }
  } catch (error) {
    console.error('刷新维护状态失败:', error);
    ElMessage.error('刷新维护状态失败');
  }
};

// 刷新历史
const refreshHistory = () => {
  // 模拟数据
  maintenanceHistory.value = [
    {
      id: 1,
      name: '系统清理任务',
      type: 'cleanup',
      status: 'completed',
      startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      description: '清理系统临时文件和日志',
    },
    {
      id: 2,
      name: '数据库优化',
      type: 'optimization',
      status: 'completed',
      startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      description: '优化数据库表结构和索引',
    },
  ];
};

// 查看任务
const viewTask = (task: any) => {
  selectedTask.value = { ...task };
  showTaskDetailDialog.value = true;
};

// 执行任务
const runTask = async (task: any) => {
  try {
    await ElMessageBox.confirm('确定要执行此任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    // 更新任务状态
    task.status = 'running';
    task.progress = 0;
    
    // 模拟任务执行
    const interval = setInterval(() => {
      task.progress += 10;
      if (task.progress >= 100) {
        clearInterval(interval);
        task.status = 'completed';
        task.endTime = new Date();
        ElMessage.success('任务执行完成');
      }
    }, 1000);
  } catch {
    // 用户取消
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
    
    task.status = 'cancelled';
    ElMessage.success('任务已取消');
  } catch {
    // 用户取消
  }
};

// 创建任务
const createTask = () => {
  if (!newTask.value.name) {
    ElMessage.warning('请输入任务名称');
    return;
  }
  
  const task = {
    id: Date.now(),
    name: newTask.value.name,
    type: newTask.value.type,
    status: 'scheduled',
    scheduledTime: newTask.value.scheduledTime,
    progress: 0,
    description: newTask.value.description,
  };
  
  maintenanceTasks.value.push(task);
  
  // 重置表单
  newTask.value = {
    name: '',
    type: 'cleanup',
    scheduledTime: new Date(),
    description: '',
  };
  
  showCreateTaskDialog.value = false;
  ElMessage.success('任务创建成功');
};

// 查看任务详情
const viewTaskDetail = (task: any) => {
  // 添加模拟日志
  selectedTask.value = {
    ...task,
    logs: [
      {
        timestamp: new Date(task.startTime),
        level: 'info',
        message: '任务开始执行',
      },
      {
        timestamp: new Date(task.startTime.getTime() + 5 * 60 * 1000),
        level: 'info',
        message: '正在执行任务步骤1',
      },
      {
        timestamp: new Date(task.startTime.getTime() + 10 * 60 * 1000),
        level: 'warning',
        message: '发现警告信息，但任务继续执行',
      },
      {
        timestamp: new Date(task.endTime),
        level: 'info',
        message: '任务执行完成',
      },
    ],
  };
  
  showTaskDetailDialog.value = true;
};

// 初始化数据
const initData = () => {
  // 模拟维护任务数据
  maintenanceTasks.value = [
    {
      id: 1,
      name: '系统清理任务',
      type: 'cleanup',
      status: 'scheduled',
      scheduledTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      progress: 0,
      description: '清理系统临时文件和日志',
    },
    {
      id: 2,
      name: '数据库优化',
      type: 'optimization',
      status: 'running',
      scheduledTime: new Date(Date.now() - 30 * 60 * 1000),
      startTime: new Date(Date.now() - 30 * 60 * 1000),
      progress: 60,
      description: '优化数据库表结构和索引',
    },
  ];
  
  refreshHistory();
};

onMounted(() => {
  refreshStatus();
  initData();
});
</script>

<style scoped>
.system-maintenance {
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

.maintenance-status,
.maintenance-tasks,
.maintenance-history {
  margin-bottom: 20px;
}

.status-item {
  padding: 10px 0;
  text-align: center;
}

.status-label {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.status-value {
  font-size: 18px;
  font-weight: 600;
}

.status-normal {
  color: var(--el-color-success);
}

.status-maintenance {
  color: var(--el-color-warning);
}

.status-warning {
  color: var(--el-color-warning);
}

.status-error {
  color: var(--el-color-danger);
}

.task-logs {
  margin-top: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>