<template>
  <div class="system-config">
    <div class="page-header">
      <h1>系统配置</h1>
      <p>管理系统全局配置参数</p>
    </div>

    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>基本配置</span>
        </div>
      </template>
      <el-form :model="systemConfig" label-width="120px">
        <el-form-item label="网站名称">
          <el-input v-model="systemConfig.siteName" placeholder="请输入网站名称" />
        </el-form-item>
        <el-form-item label="网站描述">
          <el-input
            v-model="systemConfig.siteDescription"
            type="textarea"
            placeholder="请输入网站描述"
          />
        </el-form-item>
        <el-form-item label="网站关键词">
          <el-input v-model="systemConfig.siteKeywords" placeholder="请输入网站关键词" />
        </el-form-item>
        <el-form-item label="网站作者">
          <el-input v-model="systemConfig.siteAuthor" placeholder="请输入网站作者" />
        </el-form-item>
        <el-form-item label="网站URL">
          <el-input v-model="systemConfig.siteUrl" placeholder="请输入网站URL" />
        </el-form-item>
        <el-form-item label="Logo">
          <el-input v-model="systemConfig.logo" placeholder="请输入Logo地址" />
        </el-form-item>
        <el-form-item label="Favicon">
          <el-input v-model="systemConfig.favicon" placeholder="请输入Favicon地址" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveConfig">保存配置</el-button>
          <el-button @click="resetConfig">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>主题配置</span>
        </div>
      </template>
      <el-form :model="systemConfig.theme" label-width="120px">
        <el-form-item label="主题模式">
          <el-select v-model="systemConfig.theme.mode" placeholder="请选择主题模式">
            <el-option label="浅色模式" value="light" />
            <el-option label="深色模式" value="dark" />
            <el-option label="跟随系统" value="auto" />
          </el-select>
        </el-form-item>
        <el-form-item label="主色调">
          <el-color-picker v-model="systemConfig.theme.primaryColor" />
        </el-form-item>
        <el-form-item label="强调色">
          <el-color-picker v-model="systemConfig.theme.accentColor" />
        </el-form-item>
        <el-form-item label="背景色">
          <el-color-picker v-model="systemConfig.theme.backgroundColor" />
        </el-form-item>
        <el-form-item label="文字颜色">
          <el-color-picker v-model="systemConfig.theme.textColor" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveConfig">保存主题配置</el-button>
          <el-button @click="resetConfig">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>功能配置</span>
        </div>
      </template>
      <el-form :model="systemConfig.features" label-width="120px">
        <el-form-item label="用户注册">
          <el-switch v-model="systemConfig.features.registration" />
        </el-form-item>
        <el-form-item label="邮箱验证">
          <el-switch v-model="systemConfig.features.emailVerification" />
        </el-form-item>
        <el-form-item label="双因素认证">
          <el-switch v-model="systemConfig.features.twoFactorAuth" />
        </el-form-item>
        <el-form-item label="社交登录">
          <el-switch v-model="systemConfig.features.socialLogin" />
        </el-form-item>
        <el-form-item label="文件上传">
          <el-switch v-model="systemConfig.features.fileUpload" />
        </el-form-item>
        <el-form-item label="系统通知">
          <el-switch v-model="systemConfig.features.notifications" />
        </el-form-item>
        <el-form-item label="数据分析">
          <el-switch v-model="systemConfig.features.analytics" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveConfig">保存功能配置</el-button>
          <el-button @click="resetConfig">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>限制配置</span>
        </div>
      </template>
      <el-form :model="systemConfig.limits" label-width="120px">
        <el-form-item label="最大文件大小(字节)">
          <el-input-number v-model="systemConfig.limits.maxFileSize" :min="1024" :max="1073741824" />
        </el-form-item>
        <el-form-item label="最大文件数量">
          <el-input-number v-model="systemConfig.limits.maxFileCount" :min="1" :max="1000" />
        </el-form-item>
        <el-form-item label="最大登录尝试次数">
          <el-input-number v-model="systemConfig.limits.maxLoginAttempts" :min="1" :max="10" />
        </el-form-item>
        <el-form-item label="密码最小长度">
          <el-input-number v-model="systemConfig.limits.passwordMinLength" :min="6" :max="20" />
        </el-form-item>
        <el-form-item label="会话超时(分钟)">
          <el-input-number v-model="systemConfig.limits.sessionTimeout" :min="5" :max="1440" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveConfig">保存限制配置</el-button>
          <el-button @click="resetConfig">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>邮件配置</span>
        </div>
      </template>
      <el-form :model="systemConfig.email" label-width="120px">
        <el-form-item label="SMTP服务器">
          <el-input v-model="systemConfig.email.host" placeholder="请输入SMTP服务器地址" />
        </el-form-item>
        <el-form-item label="SMTP端口">
          <el-input-number v-model="systemConfig.email.port" :min="1" :max="65535" />
        </el-form-item>
        <el-form-item label="安全连接">
          <el-switch v-model="systemConfig.email.secure" />
        </el-form-item>
        <el-form-item label="用户名">
          <el-input v-model="systemConfig.email.auth.user" placeholder="请输入SMTP用户名" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="systemConfig.email.auth.pass" type="password" placeholder="请输入SMTP密码" />
        </el-form-item>
        <el-form-item label="发件人邮箱">
          <el-input v-model="systemConfig.email.from" placeholder="请输入发件人邮箱" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveConfig">保存邮件配置</el-button>
          <el-button @click="resetConfig">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="config-card">
      <template #header>
        <div class="card-header">
          <span>存储配置</span>
        </div>
      </template>
      <el-form :model="systemConfig.storage" label-width="120px">
        <el-form-item label="存储类型">
          <el-select v-model="systemConfig.storage.type" placeholder="请选择存储类型">
            <el-option label="本地存储" value="local" />
            <el-option label="阿里云OSS" value="oss" />
            <el-option label="AWS S3" value="s3" />
          </el-select>
        </el-form-item>
        <el-form-item label="存储路径">
          <el-input v-model="systemConfig.storage.path" placeholder="请输入存储路径" />
        </el-form-item>
        <el-form-item label="存储桶" v-if="systemConfig.storage.type !== 'local'">
          <el-input v-model="systemConfig.storage.bucket" placeholder="请输入存储桶名称" />
        </el-form-item>
        <el-form-item label="区域" v-if="systemConfig.storage.type !== 'local'">
          <el-input v-model="systemConfig.storage.region" placeholder="请输入区域" />
        </el-form-item>
        <el-form-item label="访问密钥" v-if="systemConfig.storage.type !== 'local'">
          <el-input v-model="systemConfig.storage.accessKey" placeholder="请输入访问密钥" />
        </el-form-item>
        <el-form-item label="密钥" v-if="systemConfig.storage.type !== 'local'">
          <el-input v-model="systemConfig.storage.secretKey" type="password" placeholder="请输入密钥" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="saveConfig">保存存储配置</el-button>
          <el-button @click="resetConfig">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useSystemStore } from '@/domains/system/stores';
import type { SystemConfig } from '@/domains/system/types';

const systemStore = useSystemStore();

// 系统配置
const systemConfig = ref<SystemConfig>({
  siteName: '',
  siteDescription: '',
  siteKeywords: '',
  siteAuthor: '',
  siteUrl: '',
  logo: '',
  favicon: '',
  theme: {
    mode: 'light',
    primaryColor: '#409EFF',
    accentColor: '#67C23A',
    backgroundColor: '#F5F7FA',
    textColor: '#303133'
  },
  features: {
    registration: true,
    emailVerification: false,
    twoFactorAuth: false,
    socialLogin: false,
    fileUpload: true,
    notifications: true,
    analytics: false
  },
  limits: {
    maxFileSize: 10485760,
    maxFileCount: 10,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    sessionTimeout: 120
  },
  email: {
    host: '',
    port: 587,
    secure: false,
    auth: {
      user: '',
      pass: ''
    },
    from: ''
  },
  storage: {
    type: 'local',
    path: '/uploads',
    // 明确指定可选字段为undefined
    bucket: undefined,
    region: undefined,
    accessKey: undefined,
    secretKey: undefined
  }
});



// 获取系统配置
const fetchConfig = async () => {
  try {
    await systemStore.fetchSystemConfig();
    const config = systemStore.systemConfig;
    
    if (config) {
      // 确保storage.bucket等可选字段正确处理
      const storageConfig = config.storage || {}
      systemConfig.value = {
        ...systemConfig.value,
        ...config,
        storage: {
          ...systemConfig.value.storage,
          ...storageConfig,
          // 确保可选字段有默认值或undefined
          bucket: storageConfig.bucket !== undefined ? storageConfig.bucket : undefined,
          region: storageConfig.region !== undefined ? storageConfig.region : undefined,
          accessKey: storageConfig.accessKey !== undefined ? storageConfig.accessKey : undefined,
          secretKey: storageConfig.secretKey !== undefined ? storageConfig.secretKey : undefined
        }
      }
    }
  } catch (error) {
    console.error('获取系统配置失败:', error);
    ElMessage.error('获取系统配置失败');
  }
};

// 保存系统配置
const saveConfig = async () => {
  try {
    await systemStore.updateSystemConfig(systemConfig.value);
    ElMessage.success('系统配置已保存');
  } catch (error) {
    console.error('保存系统配置失败:', error);
    ElMessage.error('保存系统配置失败');
  }
};

// 重置系统配置
const resetConfig = () => {
  systemConfig.value = {
    siteName: 'Fantastic Admin',
    siteDescription: '基于Vue3和Element Plus的后台管理系统',
    siteKeywords: 'admin,vue3,element-plus',
    siteAuthor: 'Fantastic Team',
    siteUrl: 'https://fantastic-admin.github.io',
    logo: '',
    favicon: '',
    theme: {
      mode: 'light',
      primaryColor: '#409EFF',
      accentColor: '#67C23A',
      backgroundColor: '#F5F7FA',
      textColor: '#303133'
    },
    features: {
      registration: true,
      emailVerification: false,
      twoFactorAuth: false,
      socialLogin: false,
      fileUpload: true,
      notifications: true,
      analytics: false
    },
    limits: {
      maxFileSize: 10485760,
      maxFileCount: 10,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
      sessionTimeout: 120
    },
    email: {
      host: '',
      port: 587,
      secure: false,
      auth: {
        user: '',
        pass: ''
      },
      from: ''
    },
    storage: {
      type: 'local',
      path: '/uploads',
      // 明确指定可选字段为undefined
      bucket: undefined,
      region: undefined,
      accessKey: undefined,
      secretKey: undefined
    }
  };
  ElMessage.success('配置已重置');
};



onMounted(() => {
  fetchConfig();
});
</script>

<style scoped>
.system-config {
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

.config-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>