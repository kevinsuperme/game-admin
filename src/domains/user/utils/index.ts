// 用户域工具函数
import type { User, UserProfile, UserPreferences } from '../types';

// 获取用户显示名称
export function getUserDisplayName(user: User | UserProfile | null | undefined): string {
  if (!user) return '';
  
  // 优先级：昵称 > 真实姓名 > 用户名 > 邮箱
  return (
    (user as UserProfile).nickname ||
    (user as UserProfile).realName ||
    user.username ||
    user.email ||
    ''
  );
}

// 获取用户头像URL
export function getUserAvatar(user: User | UserProfile | null | undefined): string {
  if (!user) return '';
  
  return (user as UserProfile).avatar || '';
}

// 获取用户性别显示文本
export function getUserGenderText(gender?: 'male' | 'female' | 'other' | 'unknown'): string {
  switch (gender) {
    case 'male':
      return '男';
    case 'female':
      return '女';
    case 'other':
      return '其他';
    case 'unknown':
    default:
      return '未知';
  }
}

// 获取用户状态显示文本
export function getUserStatusText(status?: 'active' | 'inactive' | 'locked' | 'deleted'): string {
  switch (status) {
    case 'active':
      return '活跃';
    case 'inactive':
      return '未激活';
    case 'locked':
      return '已锁定';
    case 'deleted':
      return '已删除';
    default:
      return '未知';
  }
}

// 获取用户状态颜色
export function getUserStatusColor(status?: 'active' | 'inactive' | 'locked' | 'deleted'): string {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'warning';
    case 'locked':
      return 'error';
    case 'deleted':
      return 'info';
    default:
      return 'default';
  }
}

// 获取用户主题显示文本
export function getUserThemeText(theme?: 'light' | 'dark' | 'auto'): string {
  switch (theme) {
    case 'light':
      return '浅色';
    case 'dark':
      return '深色';
    case 'auto':
      return '跟随系统';
    default:
      return '浅色';
  }
}

// 获取用户活动类型显示文本
export function getUserActivityTypeText(type?: string): string {
  switch (type) {
    case 'login':
      return '登录';
    case 'logout':
      return '登出';
    case 'update_profile':
      return '更新资料';
    case 'change_password':
      return '修改密码';
    case 'update_preferences':
      return '更新偏好';
    default:
      return type || '未知';
  }
}

// 格式化用户创建时间
export function formatUserCreateTime(time?: string): string {
  if (!time) return '';
  
  try {
    const date = new Date(time);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return time;
  }
}

// 格式化用户最后登录时间
export function formatUserLastLoginTime(time?: string): string {
  if (!time) return '从未登录';
  
  try {
    const date = new Date(time);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // 小于1分钟
    if (diff < 60 * 1000) {
      return '刚刚';
    }
    
    // 小于1小时
    if (diff < 60 * 60 * 1000) {
      const minutes = Math.floor(diff / (60 * 1000));
      return `${minutes}分钟前`;
    }
    
    // 小于1天
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      return `${hours}小时前`;
    }
    
    // 小于7天
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.floor(diff / (24 * 60 * 60 * 1000));
      return `${days}天前`;
    }
    
    // 超过7天显示具体日期
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return time;
  }
}

// 检查用户是否在线
export function isUserOnline(lastLoginTime?: string): boolean {
  if (!lastLoginTime) return false;
  
  try {
    const date = new Date(lastLoginTime);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // 30分钟内活动视为在线
    return diff < 30 * 60 * 1000;
  } catch (error) {
    return false;
  }
}

// 获取用户在线状态文本
export function getUserOnlineStatusText(lastLoginTime?: string): string {
  return isUserOnline(lastLoginTime) ? '在线' : '离线';
}

// 获取用户在线状态颜色
export function getUserOnlineStatusColor(lastLoginTime?: string): string {
  return isUserOnline(lastLoginTime) ? 'success' : 'default';
}

// 生成用户默认头像
export function generateUserDefaultAvatar(user?: User | UserProfile | null): string {
  if (!user) return '';
  
  const name = getUserDisplayName(user);
  const firstChar = name.charAt(0).toUpperCase();
  
  // 根据用户名生成颜色
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  const color = `hsl(${hue}, 70%, 60%)`;
  
  // 生成SVG头像
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <circle cx="50" cy="50" r="50" fill="${color}" />
      <text x="50" y="50" text-anchor="middle" dy=".3em" font-size="40" fill="white" font-family="Arial, sans-serif">
        ${firstChar}
      </text>
    </svg>
  `;
  
  // 转换为Base64
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// 验证用户名格式
export function validateUsername(username: string): { valid: boolean; message: string } {
  if (!username) {
    return { valid: false, message: '用户名不能为空' };
  }
  
  if (username.length < 3) {
    return { valid: false, message: '用户名长度不能少于3位' };
  }
  
  if (username.length > 20) {
    return { valid: false, message: '用户名长度不能超过20位' };
  }
  
  // 只允许字母、数字、下划线
  const pattern = /^[a-zA-Z0-9_]+$/;
  if (!pattern.test(username)) {
    return { valid: false, message: '用户名只能包含字母、数字和下划线' };
  }
  
  return { valid: true, message: '' };
}

// 验证邮箱格式
export function validateEmail(email: string): { valid: boolean; message: string } {
  if (!email) {
    return { valid: false, message: '邮箱不能为空' };
  }
  
  // 邮箱格式验证
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!pattern.test(email)) {
    return { valid: false, message: '邮箱格式不正确' };
  }
  
  return { valid: true, message: '' };
}

// 验证手机号格式
export function validatePhone(phone: string): { valid: boolean; message: string } {
  if (!phone) {
    return { valid: true, message: '' }; // 手机号可以为空
  }
  
  // 中国手机号格式验证
  const pattern = /^1[3-9]\d{9}$/;
  if (!pattern.test(phone)) {
    return { valid: false, message: '手机号格式不正确' };
  }
  
  return { valid: true, message: '' };
}

// 验证密码强度
export function validatePassword(password: string): { 
  valid: boolean; 
  message: string; 
  strength: 'weak' | 'medium' | 'strong';
} {
  if (!password) {
    return { valid: false, message: '密码不能为空', strength: 'weak' };
  }
  
  if (password.length < 6) {
    return { valid: false, message: '密码长度不能少于6位', strength: 'weak' };
  }
  
  if (password.length > 20) {
    return { valid: false, message: '密码长度不能超过20位', strength: 'weak' };
  }
  
  // 计算密码强度
  let score = 0;
  
  // 长度
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
  
  // 判断强度
  let strength: 'weak' | 'medium' | 'strong';
  let message: string;
  
  if (score <= 2) {
    strength = 'weak';
    message = '密码强度较弱';
  } else if (score <= 4) {
    strength = 'medium';
    message = '密码强度中等';
  } else {
    strength = 'strong';
    message = '密码强度较强';
  }
  
  return { valid: true, message, strength };
}

// 生成随机密码
export function generateRandomPassword(length = 12): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  // 确保包含各种类型的字符
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // 小写字母
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // 大写字母
  password += '0123456789'[Math.floor(Math.random() * 10)]; // 数字
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // 特殊字符
  
  // 填充剩余长度
  for (let i = 4; i < length; i++) {
    password += chars[Math.floor(Math.random() * chars.length)];
  }
  
  // 打乱顺序
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// 检查用户是否有指定权限
export function hasUserPermission(user: User | UserProfile | null | undefined, permission: string): boolean {
  if (!user) return false;
  
  const permissions = user.permissions || [];
  return permissions.includes(permission);
}

// 检查用户是否有指定角色
export function hasUserRole(user: User | UserProfile | null | undefined, role: string): boolean {
  if (!user) return false;
  
  const roles = user.roles || [];
  return roles.includes(role);
}

// 检查用户是否是管理员
export function isUserAdmin(user: User | UserProfile | null | undefined): boolean {
  return hasUserRole(user, 'admin');
}

// 过滤用户列表
export function filterUsers(users: User[], keyword: string): User[] {
  if (!keyword.trim()) return users;
  
  const lowerKeyword = keyword.toLowerCase();
  
  return users.filter(user => {
    return (
      (user.username && user.username.toLowerCase().includes(lowerKeyword)) ||
      (user.email && user.email.toLowerCase().includes(lowerKeyword)) ||
      (user as UserProfile).nickname?.toLowerCase().includes(lowerKeyword) ||
      (user as UserProfile).realName?.toLowerCase().includes(lowerKeyword) ||
      (user.phone && user.phone.toLowerCase().includes(lowerKeyword))
    );
  });
}

// 排序用户列表
export function sortUsers(users: User[], sortBy: string, sortOrder: 'asc' | 'desc' = 'asc'): User[] {
  return [...users].sort((a, b) => {
    let aValue: any;
    let bValue: any;
    
    switch (sortBy) {
      case 'username':
        aValue = a.username || '';
        bValue = b.username || '';
        break;
      case 'email':
        aValue = a.email || '';
        bValue = b.email || '';
        break;
      case 'createTime':
        aValue = a.createTime ? new Date(a.createTime).getTime() : 0;
        bValue = b.createTime ? new Date(b.createTime).getTime() : 0;
        break;
      case 'lastLoginTime':
        aValue = a.lastLoginTime ? new Date(a.lastLoginTime).getTime() : 0;
        bValue = b.lastLoginTime ? new Date(b.lastLoginTime).getTime() : 0;
        break;
      default:
        aValue = a.username || '';
        bValue = b.username || '';
    }
    
    if (aValue < bValue) {
      return sortOrder === 'asc' ? -1 : 1;
    }
    
    if (aValue > bValue) {
      return sortOrder === 'asc' ? 1 : -1;
    }
    
    return 0;
  });
}

// 格式化用户角色显示
export function formatUserRoles(roles: string[]): string {
  if (!roles || roles.length === 0) return '无';
  
  return roles.join(', ');
}

// 格式化用户权限显示
export function formatUserPermissions(permissions: string[]): string {
  if (!permissions || permissions.length === 0) return '无';
  
  return permissions.join(', ');
}

// 获取用户年龄
export function getUserAge(birthday?: string): number | null {
  if (!birthday) return null;
  
  try {
    const birthDate = new Date(birthday);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    return null;
  }
}

// 格式化用户生日显示
export function formatUserBirthday(birthday?: string): string {
  if (!birthday) return '';
  
  try {
    const date = new Date(birthday);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    return birthday;
  }
}