<template>
  <div class="system-logs">
    <div class="page-header">
      <h2>系统日志</h2>
      <p>查看和管理系统日志</p>
    </div>
    
    <div class="log-filters">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="级别">
          <el-select v-model="filterForm.level" placeholder="选择日志级别" clearable>
            <el-option label="调试" value="debug" />
            <el-option label="信息" value="info" />
            <el-option label="警告" value="warn" />
            <el-option label="错误" value="error" />
            <el-option label="致命" value="fatal" />
          </el-select>
        </el-form-item>
        <el-form-item label="模块">
          <el-input v-model="filterForm.module" placeholder="输入模块名称" clearable />
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchLogs">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetFilter">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <el-table
      v-loading="systemStore.logsLoading"
      :data="systemStore.systemLogs"
      style="width: 100%;"
    >
      <el-table-column prop="level" label="级别" width="80">
        <template #default="{ row }">
          <el-tag :type="getLogLevelColor(row.level)" size="small">
            {{ getLogLevelName(row.level) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="timestamp" label="时间" width="180" />
      <el-table-column prop="module" label="模块" width="120" />
      <el-table-column prop="action" label="操作" width="120" />
      <el-table-column prop="message" label="消息" min-width="200" show-overflow-tooltip />
      <el-table-column prop="userId" label="用户ID" width="100" />
      <el-table-column prop="ip" label="IP地址" width="130" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button size="small" @click="showLogDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="systemStore.logsTotal"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    
    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="日志详情"
      width="60%"
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="级别">
          <el-tag :type="getLogLevelColor(selectedLog?.level)" size="small">
            {{ getLogLevelName(selectedLog?.level) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="时间">{{ selectedLog?.timestamp }}</el-descriptions-item>
        <el-descriptions-item label="模块">{{ selectedLog?.module }}</el-descriptions-item>
        <el-descriptions-item label="操作">{{ selectedLog?.action }}</el-descriptions-item>
        <el-descriptions-item label="用户ID">{{ selectedLog?.userId }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ selectedLog?.ip }}</el-descriptions-item>
        <el-descriptions-item label="用户代理" :span="2">{{ selectedLog?.userAgent }}</el-descriptions-item>
        <el-descriptions-item label="消息" :span="2">{{ selectedLog?.message }}</el-descriptions-item>
        <el-descriptions-item label="详情" :span="2">{{ selectedLog?.details }}</el-descriptions-item>
        <el-descriptions-item v-if="selectedLog?.stack" label="堆栈" :span="2">
          <pre>{{ selectedLog?.stack }}</pre>
        </el-descriptions-item>
        <el-descriptions-item v-if="selectedLog?.context" label="上下文" :span="2">
          <pre>{{ JSON.stringify(selectedLog?.context, null, 2) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { Search, Refresh } from '@element-plus/icons-vue';
import { useSystemStore } from '@/domains/system/stores';
import type { SystemLog } from '@/domains/system/types';

const systemStore = useSystemStore();

// 分页
const currentPage = ref(1);
const pageSize = ref(10);

// 对话框状态
const showDetailDialog = ref(false);
const selectedLog = ref<SystemLog | null>(null);

// 筛选表单
const filterForm = reactive({
  level: '',
  module: '',
  dateRange: [] as string[],
});

// 获取日志列表
const fetchLogs = async () => {
  try {
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value,
    };
    
    if (filterForm.level) {
      params.level = filterForm.level;
    }
    
    if (filterForm.module) {
      params.module = filterForm.module;
    }
    
    if (filterForm.dateRange && filterForm.dateRange.length === 2) {
      params.startTime = filterForm.dateRange[0];
      params.endTime = filterForm.dateRange[1];
    }
    
    await systemStore.fetchSystemLogs(params);
  } catch (error) {
    console.error('获取日志列表失败:', error);
  }
};

// 重置筛选条件
const resetFilter = () => {
  filterForm.level = '';
  filterForm.module = '';
  filterForm.dateRange = [];
  currentPage.value = 1;
  fetchLogs();
};

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchLogs();
};

// 处理当前页变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  fetchLogs();
};

// 显示日志详情
const showLogDetail = (log: SystemLog) => {
  selectedLog.value = log;
  showDetailDialog.value = true;
};

// 获取日志级别颜色
const getLogLevelColor = (level?: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const colorMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    debug: 'info',
    info: 'primary',
    warn: 'warning',
    error: 'danger',
    fatal: 'danger',
  };
  return colorMap[level || ''] || 'info';
};

// 获取日志级别名称
const getLogLevelName = (level?: string) => {
  const nameMap: Record<string, string> = {
    debug: '调试',
    info: '信息',
    warn: '警告',
    error: '错误',
    fatal: '致命',
  };
  return nameMap[level || ''] || level;
};

// 组件挂载时获取日志列表
onMounted(() => {
  fetchLogs();
});
</script>

<style scoped>
.system-logs {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0 0 5px;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  color: #666;
}

.log-filters {
  padding: 15px;
  margin-bottom: 20px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.filter-form .el-form-item {
  margin-bottom: 0;
}

.el-pagination {
  margin-top: 20px;
  text-align: right;
}

pre {
  max-height: 200px;
  padding: 10px;
  overflow-y: auto;
  font-size: 12px;
  overflow-wrap: break-word;
  white-space: pre-wrap;
  background-color: #f5f7fa;
  border-radius: 4px;
}
</style>