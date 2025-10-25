// 认证域工具函数

import type { User } from '../types';

/**
 * 获取用户显示名称
 * @param user 用户对象
 * @returns 显示名称
 */
export const getUserDisplayName = (user: User): string => {
  if (!user) return '';
  
  // 优先使用 account 字段
  if (user.account) {
    return user.account;
  }
  
  // 如果有其他字段，可以在这里添加逻辑
  return user.id || '';
};

/**
 * 获取用户头像URL
 * @param user 用户对象
 * @param defaultAvatar 默认头像
 * @returns 头像URL
 */
export const getUserAvatar = (user: User, defaultAvatar?: string): string => {
  if (!user) return defaultAvatar || '';
  
  return user.avatar || defaultAvatar || '';
};

/**
 * 检查用户是否为管理员
 * @param user 用户对象
 * @returns 是否为管理员
 */
export const isAdmin = (user: User): boolean => {
  if (!user || !user.roles) return false;
  
  return user.roles.includes('admin') || user.roles.includes('administrator');
};

/**
 * 检查用户是否为超级管理员
 * @param user 用户对象
 * @returns 是否为超级管理员
 */
export const isSuperAdmin = (user: User): boolean => {
  if (!user || !user.roles) return false;
  
  return user.roles.includes('super_admin') || user.roles.includes('superadmin');
};

/**
 * 生成用户权限树
 * @param permissions 权限列表
 * @returns 权限树
 */
export const generatePermissionTree = (permissions: string[]): Array<{
  key: string;
  title: string;
  children?: Array<{
    key: string;
    title: string;
  }>;
}> => {
  const tree: Array<{
    key: string;
    title: string;
    children?: Array<{
      key: string;
      title: string;
    }>;
  }> = [];
  
  // 按模块分组权限
  const moduleMap = new Map<string, string[]>();
  
  permissions.forEach(permission => {
    // 假设权限格式为 module:action 或 module:resource:action
    const parts = permission.split(':');
    const module = parts[0];
    
    if (!moduleMap.has(module)) {
      moduleMap.set(module, []);
    }
    
    moduleMap.get(module)!.push(permission);
  });
  
  // 构建树结构
  moduleMap.forEach((perms, module) => {
    const moduleNode: any = {
      key: module,
      title: getModuleTitle(module),
      children: []
    };
    
    perms.forEach(permission => {
      const action = permission.split(':').pop();
      moduleNode.children.push({
        key: permission,
        title: getActionTitle(action || '')
      });
    });
    
    tree.push(moduleNode);
  });
  
  return tree;
};

/**
 * 获取模块标题
 * @param module 模块名
 * @returns 模块标题
 */
const getModuleTitle = (module: string): string => {
  const moduleTitles: Record<string, string> = {
    'user': '用户管理',
    'role': '角色管理',
    'permission': '权限管理',
    'system': '系统管理',
    'dashboard': '仪表盘',
    'content': '内容管理',
    'file': '文件管理',
    'log': '日志管理',
    'setting': '设置管理',
  };
  
  return moduleTitles[module] || module;
};

/**
 * 获取操作标题
 * @param action 操作名
 * @returns 操作标题
 */
const getActionTitle = (action: string): string => {
  const actionTitles: Record<string, string> = {
    'create': '创建',
    'read': '查看',
    'update': '更新',
    'delete': '删除',
    'list': '列表',
    'detail': '详情',
    'edit': '编辑',
    'add': '添加',
    'remove': '移除',
    'export': '导出',
    'import': '导入',
    'download': '下载',
    'upload': '上传',
    'approve': '审批',
    'reject': '拒绝',
    'enable': '启用',
    'disable': '禁用',
  };
  
  return actionTitles[action] || action;
};

/**
 * 格式化用户角色显示
 * @param roles 角色列表
 * @returns 格式化后的角色字符串
 */
export const formatUserRoles = (roles: string[]): string => {
  if (!roles || roles.length === 0) return '无角色';
  
  // 将角色代码转换为显示名称
  const roleNames = roles.map(role => {
    const roleMap: Record<string, string> = {
      'admin': '管理员',
      'administrator': '管理员',
      'super_admin': '超级管理员',
      'superadmin': '超级管理员',
      'user': '普通用户',
      'guest': '访客',
      'developer': '开发者',
      'editor': '编辑',
      'viewer': '查看者',
    };
    
    return roleMap[role] || role;
  });
  
  return roleNames.join('、');
};

/**
 * 检查密码强度
 * @param password 密码
 * @returns 密码强度等级 (weak: 弱, medium: 中, strong: 强)
 */
export const checkPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (!password) return 'weak';
  
  let score = 0;
  
  // 长度检查
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  
  // 包含数字
  if (/\d/.test(password)) score += 1;
  
  // 包含小写字母
  if (/[a-z]/.test(password)) score += 1;
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) score += 1;
  
  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  
  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  return 'strong';
};

/**
 * 生成密码强度提示
 * @param password 密码
 * @returns 密码强度提示
 */
export const getPasswordStrengthTip = (password: string): string => {
  const strength = checkPasswordStrength(password);
  
  const tips = {
    weak: '密码强度：弱，建议使用8位以上包含数字、大小写字母和特殊字符的密码',
    medium: '密码强度：中，建议使用12位以上包含数字、大小写字母和特殊字符的密码',
    strong: '密码强度：强，密码安全性高'
  };
  
  return tips[strength];
};

/**
 * 检查用户名是否符合规范
 * @param username 用户名
 * @returns 检查结果
 */
export const validateUsername = (username: string): {
  isValid: boolean;
  message: string;
} => {
  if (!username) {
    return { isValid: false, message: '用户名不能为空' };
  }
  
  if (username.length < 3) {
    return { isValid: false, message: '用户名长度不能少于3位' };
  }
  
  if (username.length > 20) {
    return { isValid: false, message: '用户名长度不能超过20位' };
  }
  
  // 只允许字母、数字、下划线和中文
  const usernameRegex = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, message: '用户名只能包含字母、数字、下划线和中文' };
  }
  
  // 不能以下划线开头或结尾
  if (username.startsWith('_') || username.endsWith('_')) {
    return { isValid: false, message: '用户名不能以下划线开头或结尾' };
  }
  
  return { isValid: true, message: '用户名格式正确' };
};

/**
 * 检查密码是否符合规范
 * @param password 密码
 * @param confirmPassword 确认密码
 * @returns 检查结果
 */
export const validatePassword = (password: string, confirmPassword?: string): {
  isValid: boolean;
  message: string;
} => {
  if (!password) {
    return { isValid: false, message: '密码不能为空' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: '密码长度不能少于6位' };
  }
  
  if (password.length > 20) {
    return { isValid: false, message: '密码长度不能超过20位' };
  }
  
  // 检查确认密码
  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { isValid: false, message: '两次输入的密码不一致' };
  }
  
  return { isValid: true, message: '密码格式正确' };
};