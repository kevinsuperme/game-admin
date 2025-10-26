<template>
  <div class="system-notifications">
    <div class="page-header">
      <h2>系统通知</h2>
      <p>管理系统通知和消息</p>
    </div>
    
    <div class="notification-actions">
      <el-button type="primary" @click="showCreateDialog = true">
        <el-icon><Plus /></el-icon>
        创建通知
      </el-button>
      <el-button @click="fetchNotifications">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
    </div>
    
    <el-table
      v-loading="systemStore.notificationsLoading"
      :data="systemStore.systemNotifications"
      style="width: 100%;"
    >
      <el-table-column prop="title" label="标题" />
      <el-table-column prop="type" label="类型">
        <template #default="{ row }">
          <el-tag :type="getNotificationTypeColor(row.type) as any">
            {{ getNotificationTypeName(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="level" label="级别">
        <template #default="{ row }">
          <el-tag :type="getNotificationLevelColor(row.level) as any">
            {{ getNotificationLevelName(row.level) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="getNotificationStatusColor(row.status) as any">
            {{ getNotificationStatusName(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" @click="editNotification(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteNotification(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="systemStore.notificationsTotal"
      layout="total, sizes, prev, pager, next, jumper"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    
    <!-- 创建/编辑通知对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingNotification ? '编辑通知' : '创建通知'"
      width="50%"
    >
      <el-form
        ref="notificationForm"
        :model="notificationForm"
        :rules="notificationRules"
        label-width="80px"
      >
        <el-form-item label="标题" prop="title">
          <el-input v-model="notificationForm.title" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input
            v-model="notificationForm.content"
            type="textarea"
            :rows="4"
          />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="notificationForm.type" placeholder="请选择类型">
            <el-option label="信息" value="info" />
            <el-option label="成功" value="success" />
            <el-option label="警告" value="warning" />
            <el-option label="错误" value="error" />
          </el-select>
        </el-form-item>
        <el-form-item label="级别" prop="level">
          <el-select v-model="notificationForm.level" placeholder="请选择级别">
            <el-option label="低" value="low" />
            <el-option label="中" value="medium" />
            <el-option label="高" value="high" />
            <el-option label="紧急" value="urgent" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标" prop="target">
          <el-select v-model="notificationForm.target" placeholder="请选择目标">
            <el-option label="所有用户" value="all" />
            <el-option label="管理员" value="admin" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="notificationForm.status" placeholder="请选择状态">
            <el-option label="草稿" value="draft" />
            <el-option label="已发布" value="published" />
            <el-option label="已过期" value="expired" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="saveNotification">
            {{ editingNotification ? '更新' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Refresh } from '@element-plus/icons-vue';
import { useSystemStore } from '@/domains/system/stores';
import type { SystemNotification } from '@/domains/system/types';

const systemStore = useSystemStore();

// 分页
const currentPage = ref(1);
const pageSize = ref(10);

// 对话框状态
const showCreateDialog = ref(false);
const editingNotification = ref<SystemNotification | null>(null);

// 表单数据
const notificationForm = reactive({
  title: '',
  content: '',
  type: 'info' as 'info' | 'success' | 'warning' | 'error',
  level: 'low' as 'low' | 'medium' | 'high' | 'urgent',
  target: 'all' as 'all' | 'admin' | 'user' | string[],
  status: 'draft' as 'draft' | 'published' | 'expired',
});

// 表单规则
const notificationRules = {
  title: [{ required: true, message: '请输入通知标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入通知内容', trigger: 'blur' }],
  type: [{ required: true, message: '请选择通知类型', trigger: 'change' }],
  level: [{ required: true, message: '请选择通知级别', trigger: 'change' }],
  target: [{ required: true, message: '请选择通知目标', trigger: 'change' }],
  status: [{ required: true, message: '请选择通知状态', trigger: 'change' }],
};

// 获取通知列表
const fetchNotifications = async () => {
  try {
    await systemStore.fetchSystemNotifications({
      page: currentPage.value,
      limit: pageSize.value,
    });
  } catch (error) {
    ElMessage.error('获取通知列表失败');
  }
};

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  pageSize.value = size;
  fetchNotifications();
};

// 处理当前页变化
const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  fetchNotifications();
};

// 重置表单
const resetForm = () => {
  Object.assign(notificationForm, {
    title: '',
    content: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    level: 'low' as 'low' | 'medium' | 'high' | 'urgent',
    target: 'all' as 'all' | 'admin' | 'user' | string[],
    status: 'draft' as 'draft' | 'published' | 'expired',
  });
  editingNotification.value = null;
};

// 编辑通知
const editNotification = (notification: SystemNotification) => {
  editingNotification.value = notification;
  Object.assign(notificationForm, {
    title: notification.title,
    content: notification.content,
    type: notification.type,
    level: notification.level,
    target: notification.target,
    status: notification.status,
  });
  showCreateDialog.value = true;
};

// 保存通知
const saveNotification = async () => {
  try {
    if (editingNotification.value) {
      await systemStore.updateSystemNotification(editingNotification.value.id, notificationForm);
      ElMessage.success('通知更新成功');
    } else {
      await systemStore.createSystemNotification(notificationForm);
      ElMessage.success('通知创建成功');
    }
    showCreateDialog.value = false;
    resetForm();
    fetchNotifications();
  } catch (error) {
    ElMessage.error(editingNotification.value ? '通知更新失败' : '通知创建失败');
  }
};

// 删除通知
const deleteNotification = async (notification: SystemNotification) => {
  try {
    await ElMessageBox.confirm('确定要删除此通知吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    await systemStore.deleteSystemNotification(notification.id);
    ElMessage.success('通知删除成功');
    fetchNotifications();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('通知删除失败');
    }
  }
};

// 获取通知类型颜色
const getNotificationTypeColor = (type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
  const colorMap: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
    info: 'info',
    success: 'success',
    warning: 'warning',
    error: 'danger',
  };
  return colorMap[type] || 'info';
};

// 获取通知类型名称
const getNotificationTypeName = (type: string) => {
  const nameMap: Record<string, string> = {
    info: '信息',
    success: '成功',
    warning: '警告',
    error: '错误',
  };
  return nameMap[type] || type;
};

// 获取通知级别颜色
const getNotificationLevelColor = (level: string) => {
  const colorMap: Record<string, string> = {
    low: 'info',
    medium: 'warning',
    high: 'danger',
    urgent: 'danger',
  };
  return colorMap[level] || 'info';
};

// 获取通知级别名称
const getNotificationLevelName = (level: string) => {
  const nameMap: Record<string, string> = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急',
  };
  return nameMap[level] || level;
};

// 获取通知状态颜色
const getNotificationStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    draft: 'info',
    published: 'success',
    expired: 'warning',
  };
  return colorMap[status] || 'info';
};

// 获取通知状态名称
const getNotificationStatusName = (status: string) => {
  const nameMap: Record<string, string> = {
    draft: '草稿',
    published: '已发布',
    expired: '已过期',
  };
  return nameMap[status] || status;
};

// 组件挂载时获取通知列表
onMounted(() => {
  fetchNotifications();
});
</script>

<style scoped>
.system-notifications {
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

.notification-actions {
  margin-bottom: 20px;
}

.el-pagination {
  margin-top: 20px;
  text-align: right;
}
</style>