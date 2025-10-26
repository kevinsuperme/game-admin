<template>
  <div class="system-monitoring">
    <div class="page-header">
      <h1>系统监控</h1>
      <p>监控系统运行状态和性能指标</p>
    </div>
    
    <div class="monitoring-overview">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-title">CPU使用率</div>
            <div class="metric-value">{{ monitoringData.cpuUsage }}%</div>
            <el-progress :percentage="monitoringData.cpuUsage" :color="getProgressColor(monitoringData.cpuUsage)" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-title">内存使用率</div>
            <div class="metric-value">{{ monitoringData.memoryUsage }}%</div>
            <el-progress :percentage="monitoringData.memoryUsage" :color="getProgressColor(monitoringData.memoryUsage)" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-title">磁盘使用率</div>
            <div class="metric-value">{{ monitoringData.diskUsage }}%</div>
            <el-progress :percentage="monitoringData.diskUsage" :color="getProgressColor(monitoringData.diskUsage)" />
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="metric-card">
            <div class="metric-title">响应时间</div>
            <div class="metric-value">{{ monitoringData.responseTime }}ms</div>
            <div class="metric-status" :class="getResponseTimeClass(monitoringData.responseTime)">
              {{ getResponseTimeStatus(monitoringData.responseTime) }}
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <div class="monitoring-charts">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>系统资源使用趋势</span>
                <el-radio-group v-model="timeRange" size="small">
                  <el-radio-button label="1h">1小时</el-radio-button>
                  <el-radio-button label="6h">6小时</el-radio-button>
                  <el-radio-button label="24h">24小时</el-radio-button>
                  <el-radio-button label="7d">7天</el-radio-button>
                </el-radio-group>
              </div>
            </template>
            <div ref="resourceChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card>
            <template #header>
              <span>请求量与错误率</span>
            </template>
            <div ref="requestChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
    
    <div class="monitoring-alerts">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>系统告警</span>
            <el-button type="primary" size="small" @click="refreshAlerts">刷新</el-button>
          </div>
        </template>
        <el-table :data="alerts" style="width: 100%;">
          <el-table-column prop="level" label="级别" width="80">
            <template #default="{ row }">
              <el-tag :type="getAlertType(row.level)">{{ row.level }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="message" label="消息" />
          <el-table-column prop="source" label="来源" width="120" />
          <el-table-column prop="timestamp" label="时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.timestamp) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button size="small" @click="handleAlert(row)">处理</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useSystemStore } from '@/domains/system/stores';
import { formatDate } from '@/utils/common';
import * as echarts from 'echarts';

const systemStore = useSystemStore();

// 监控数据
const monitoringData = ref({
  cpuUsage: 0,
  memoryUsage: 0,
  diskUsage: 0,
  responseTime: 0,
});

// 告警数据
const alerts = ref<any[]>([]);

const maintenanceTasks = ref<any[]>([]);

// 时间范围
const timeRange = ref('1h');

// 图表引用
const resourceChartRef = ref();
const requestChartRef = ref();

// 资源图表实例
let resourceChart: echarts.ECharts | null = null;
// 请求图表实例
let requestChart: echarts.ECharts | null = null;

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage < 50) return '#67c23a';
  if (percentage < 80) return '#e6a23c';
  return '#f56c6c';
};

// 获取响应时间状态类
const getResponseTimeClass = (responseTime: number) => {
  if (responseTime < 200) return 'status-good';
  if (responseTime < 500) return 'status-warning';
  return 'status-error';
};

// 获取响应时间状态文本
const getResponseTimeStatus = (responseTime: number) => {
  if (responseTime < 200) return '正常';
  if (responseTime < 500) return '较慢';
  return '很慢';
};

// 获取告警类型
const getAlertType = (level: string) => {
  switch (level) {
    case 'low': return 'info';
    case 'medium': return 'warning';
    case 'high': return 'danger';
    case 'critical': return 'danger';
    default: return 'info';
  }
};

// 初始化资源图表
const initResourceChart = () => {
  if (!resourceChartRef.value) return;
  
  resourceChart = echarts.init(resourceChartRef.value);
  
  const option = {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['CPU使用率', '内存使用率', '磁盘使用率'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        formatter: '{value}%',
      },
    },
    series: [
      {
        name: 'CPU使用率',
        type: 'line',
        smooth: true,
        data: [],
      },
      {
        name: '内存使用率',
        type: 'line',
        smooth: true,
        data: [],
      },
      {
        name: '磁盘使用率',
        type: 'line',
        smooth: true,
        data: [],
      },
    ],
  };
  
  resourceChart.setOption(option);
};

// 初始化请求图表
const initRequestChart = () => {
  if (!requestChartRef.value) return;
  
  requestChart = echarts.init(requestChartRef.value);
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['请求量', '错误率'],
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: [],
    },
    yAxis: [
      {
        type: 'value',
        name: '请求量',
        min: 0,
        axisLabel: {
          formatter: '{value}',
        },
      },
      {
        type: 'value',
        name: '错误率',
        min: 0,
        max: 100,
        axisLabel: {
          formatter: '{value}%',
        },
      },
    ],
    series: [
      {
        name: '请求量',
        type: 'line',
        smooth: true,
        data: [],
      },
      {
        name: '错误率',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: [],
      },
    ],
  };
  
  requestChart.setOption(option);
};

// 更新图表数据
const updateCharts = () => {
  // 这里应该从API获取实际数据
  // 现在使用模拟数据
  const times = Array.from({ length: 20 }, (_, i) => {
    const date = new Date();
    date.setMinutes(date.getMinutes() - (19 - i) * 5);
    return date.toLocaleTimeString();
  });
  
  const cpuData = Array.from({ length: 20 }, () => Math.floor(Math.random() * 30) + 40);
  const memoryData = Array.from({ length: 20 }, () => Math.floor(Math.random() * 20) + 50);
  const diskData = Array.from({ length: 20 }, () => Math.floor(Math.random() * 10) + 60);
  const requestData = Array.from({ length: 20 }, () => Math.floor(Math.random() * 500) + 200);
  const errorData = Array.from({ length: 20 }, () => Math.random() * 2);
  
  if (resourceChart) {
    resourceChart.setOption({
      xAxis: { data: times },
      series: [
        { data: cpuData },
        { data: memoryData },
        { data: diskData },
      ],
    });
  }
  
  if (requestChart) {
    requestChart.setOption({
      xAxis: { data: times },
      series: [
        { data: requestData },
        { data: errorData },
      ],
    });
  }
};

// 刷新告警
const refreshAlerts = () => {
  // 这里应该从API获取实际数据
  alerts.value = [
    {
      id: 1,
      level: 'medium',
      message: 'CPU使用率超过80%',
      source: '系统监控',
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: 2,
      level: 'low',
      message: '磁盘空间不足，剩余20%',
      source: '系统监控',
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
    },
  ];
};

// 处理告警
const handleAlert = (alert: any) => {
  // 处理告警逻辑
  console.log('处理告警:', alert);
};

// 加载监控数据
const loadMonitoringData = async () => {
  try {
    await systemStore.fetchSystemMonitoring();
    
    if (systemStore.systemMonitoring) {
      // 从metrics中提取CPU、内存、磁盘使用率
      const metrics = systemStore.systemMonitoring.metrics || [];
      const cpuMetric = metrics.find(m => m.name === 'cpuUsage') || { value: 0 };
      const memoryMetric = metrics.find(m => m.name === 'memoryUsage') || { value: 0 };
      const diskMetric = metrics.find(m => m.name === 'diskUsage') || { value: 0 };
      const responseMetric = metrics.find(m => m.name === 'responseTime') || { value: 0 };
      
      monitoringData.value = {
        cpuUsage: cpuMetric.value,
        memoryUsage: memoryMetric.value,
        diskUsage: diskMetric.value,
        responseTime: responseMetric.value,
      };
      
      // 更新告警
      alerts.value = systemStore.systemMonitoring.alerts.map(alert => ({
        id: alert.id,
        level: alert.severity === 'critical' ? 'high' : 
              alert.severity === 'high' ? 'medium' : 'low',
        message: alert.description,
        source: '系统监控',
        timestamp: new Date(alert.createdAt),
      }));
    }
  } catch (error) {
    console.error('加载监控数据失败:', error);
  }
};

// 窗口大小变化时重新调整图表
const resizeCharts = () => {
  if (resourceChart) resourceChart.resize();
  if (requestChart) requestChart.resize();
};

onMounted(async () => {
  await loadMonitoringData();
  refreshAlerts();
  
  nextTick(() => {
    initResourceChart();
    initRequestChart();
    updateCharts();
  });
  
  window.addEventListener('resize', resizeCharts);
  
  // 定时刷新数据
  const interval = setInterval(() => {
    loadMonitoringData();
    updateCharts();
  }, 60000);
  
  // 组件卸载时清理
  onUnmounted(() => {
    clearInterval(interval);
    window.removeEventListener('resize', resizeCharts);
    if (resourceChart) resourceChart.dispose();
    if (requestChart) requestChart.dispose();
  });
});
</script>

<style scoped>
.system-monitoring {
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

.monitoring-overview {
  margin-bottom: 20px;
}

.metric-card {
  text-align: center;
}

.metric-title {
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.metric-value {
  margin-bottom: 12px;
  font-size: 24px;
  font-weight: 600;
}

.metric-status {
  margin-top: 8px;
  font-size: 14px;
}

.status-good {
  color: var(--el-color-success);
}

.status-warning {
  color: var(--el-color-warning);
}

.status-error {
  color: var(--el-color-danger);
}

.monitoring-charts {
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>