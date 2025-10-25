# 游戏管理系统

基于Vue 3和TypeScript的游戏管理系统，采用领域驱动设计，支持多主题和响应式布局。

## 📋 项目概述

这是一个现代化的游戏管理后台系统，采用前后端分离架构，前端使用Vue 3 + TypeScript技术栈，实现了基于领域驱动设计的模块化架构。系统支持多主题切换、响应式布局、权限管理等功能，为游戏运营提供全面的管理支持。

## 🚀 技术栈

### 前端技术
- **框架**: Vue 3.5.22 + TypeScript 5.9.3
- **构建工具**: Vite 7.1.9
- **UI框架**: Element Plus 2.11.4 + VxeUI
- **状态管理**: Pinia 3.0.3
- **路由**: Vue Router 4.5.1
- **HTTP请求**: Axios 1.7.7
- **样式**: UnoCSS + CSS Variables
- **图标**: Iconify

### 架构设计
- **设计模式**: 领域驱动设计(DDD)
- **模块化**: 按业务域划分模块
- **组件化**: 高度组件化的UI架构
- **主题系统**: 支持亮色/暗色主题切换
- **权限系统**: 基于角色和权限点的权限控制

## 📁 项目结构

```
src/
├── api/              # API接口
├── assets/           # 静态资源
├── components/       # 公共组件
├── domains/          # 业务域
│   ├── auth/         # 认证域
│   ├── content/      # 内容域
│   ├── infrastructure/ # 基础设施域
│   ├── layout/       # 布局域
│   ├── shared/       # 共享域
│   ├── system/       # 系统域
│   └── user/         # 用户域
├── layouts/          # 布局组件
├── router/           # 路由配置
├── store/            # 状态管理
├── utils/            # 工具函数
└── views/            # 页面视图
```

## 🛠️ 安装与运行

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装依赖
```bash
# 克隆项目
git clone https://github.com/kevinsuperme/game-admin.git

# 进入项目目录
cd game-admin

# 安装依赖
pnpm install
```

### 开发环境运行
```bash
# 启动开发服务器
pnpm dev
```

### 生产环境构建
```bash
# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

## 📖 功能特性

### 核心功能
- ✅ 用户认证与授权
- ✅ 多主题切换（亮色/暗色）
- ✅ 响应式布局
- ✅ 动态路由
- ✅ 权限管理
- ✅ 组件库封装
- ✅ 国际化支持（预留）

### 业务功能
- 🚧 用户管理
- 🚧 内容管理
- 🚧 系统配置
- 🚧 日志监控
- 🚧 数据统计

> ✅ 已实现  🚧 开发中  📋 计划中

## 🏗️ 架构设计

### 领域驱动设计
项目采用领域驱动设计思想，按业务域划分模块：
- **认证域(auth)**: 处理用户认证、授权相关功能
- **用户域(user)**: 管理用户信息和相关操作
- **内容域(content)**: 处理内容管理、分类、标签等
- **系统域(system)**: 系统配置、日志、通知、任务等
- **基础设施域(infrastructure)**: HTTP、日志、存储等基础服务
- **布局域(layout)**: 页面布局相关组件
- **共享域(shared)**: 跨领域共享的组件和工具

### 分层架构
- **表现层**: Vue组件、页面视图
- **业务逻辑层**: Composables、Services
- **数据访问层**: API接口、Mock数据
- **状态管理层**: Pinia Store

## 📊 项目状态

当前项目处于前端开发阶段，已完成：
- 前端架构搭建
- 基础组件开发
- 路由和权限系统
- 主题系统
- Mock数据接口

待完成：
- 后端API开发
- 数据库设计
- 业务功能实现
- 系统测试

## 🤝 贡献指南

欢迎提交Issue和Pull Request来帮助改进项目。

### 开发流程
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 代码规范
- 使用ESLint和Prettier进行代码格式化
- 遵循TypeScript严格模式
- 组件命名采用PascalCase
- 文件命名采用kebab-case

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

- 项目链接: [https://github.com/kevinsuperme/game-admin](https://github.com/kevinsuperme/game-admin)
- 问题反馈: [Issues](https://github.com/kevinsuperme/game-admin/issues)

## 🙏 致谢

感谢以下开源项目：
- [Vue.js](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [UnoCSS](https://unocss.dev/)