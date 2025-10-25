// 表单相关组合式函数
import { ref, reactive, computed, watch, nextTick, onUnmounted } from 'vue';
import type { Ref, ComputedRef, Reactive } from 'vue';

// 表单验证规则
export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  validator?: (value: any) => boolean | string;
  message?: string;
  trigger?: 'change' | 'blur' | 'submit';
}

// 表单字段配置
export interface FormFieldConfig {
  value: any;
  rules?: ValidationRule[];
  defaultValue?: any;
  dirty?: boolean;
  touched?: boolean;
  validating?: boolean;
}

// 表单状态
export interface FormState {
  [key: string]: FormFieldConfig;
}

// 表单验证结果
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string[]>;
  fields: Record<string, boolean>;
}

// 表单组合式函数
export function useForm<T extends Record<string, any>>(initialValues: T, rules?: Record<keyof T, ValidationRule[]>) {
  // 表单状态
  const formState = reactive<FormState>(
    Object.keys(initialValues).reduce((acc, key) => {
      acc[key] = {
        value: initialValues[key],
        rules: rules?.[key] || [],
        defaultValue: initialValues[key],
        dirty: false,
        touched: false,
        validating: false,
      };
      return acc;
    }, {} as FormState)
  );
  
  // 表单是否被修改过
  const isDirty = computed(() => {
    return Object.values(formState).some(field => field.dirty);
  });
  
  // 表单是否被触碰过
  const isTouched = computed(() => {
    return Object.values(formState).some(field => field.touched);
  });
  
  // 表单是否正在验证
  const isValidating = computed(() => {
    return Object.values(formState).some(field => field.validating);
  });
  
  // 表单是否有效
  const isValid = computed(() => {
    return Object.values(formState).every(field => {
      if (!field.rules || field.rules.length === 0) {
        return true;
      }
      return validateField(field.value, field.rules).valid;
    });
  });
  
  // 表单错误信息
  const errors = computed(() => {
    const result: Record<string, string[]> = {};
    Object.entries(formState).forEach(([key, field]) => {
      const validationResult = validateField(field.value, field.rules);
      if (!validationResult.valid) {
        result[key] = validationResult.errors;
      }
    });
    return result;
  });
  
  // 获取字段错误
  const getFieldError = (field: keyof T): string[] => {
    return errors.value[field as string] || [];
  };
  
  // 获取字段是否有错误
  const hasFieldError = (field: keyof T): boolean => {
    return getFieldError(field).length > 0;
  };
  
  // 验证单个字段
  const validateField = (value: any, rules: ValidationRule[] = []): ValidationResult => {
    const fieldErrors: string[] = [];
    
    for (const rule of rules) {
      // 必填验证
      if (rule.required && (value === undefined || value === null || value === '')) {
        fieldErrors.push(rule.message || '此字段为必填项');
        continue;
      }
      
      // 如果值为空且不是必填，跳过其他验证
      if (value === undefined || value === null || value === '') {
        continue;
      }
      
      // 最小值验证
      if (rule.min !== undefined) {
        if (typeof value === 'string' && value.length < rule.min) {
          fieldErrors.push(rule.message || `最少需要 ${rule.min} 个字符`);
        } else if (typeof value === 'number' && value < rule.min) {
          fieldErrors.push(rule.message || `最小值为 ${rule.min}`);
        } else if (Array.isArray(value) && value.length < rule.min) {
          fieldErrors.push(rule.message || `最少选择 ${rule.min} 项`);
        }
      }
      
      // 最大值验证
      if (rule.max !== undefined) {
        if (typeof value === 'string' && value.length > rule.max) {
          fieldErrors.push(rule.message || `最多允许 ${rule.max} 个字符`);
        } else if (typeof value === 'number' && value > rule.max) {
          fieldErrors.push(rule.message || `最大值为 ${rule.max}`);
        } else if (Array.isArray(value) && value.length > rule.max) {
          fieldErrors.push(rule.message || `最多选择 ${rule.max} 项`);
        }
      }
      
      // 正则表达式验证
      if (rule.pattern && !rule.pattern.test(String(value))) {
        fieldErrors.push(rule.message || '格式不正确');
      }
      
      // 自定义验证器
      if (rule.validator) {
        const result = rule.validator(value);
        if (result === false) {
          fieldErrors.push(rule.message || '验证失败');
        } else if (typeof result === 'string') {
          fieldErrors.push(result);
        }
      }
    }
    
    return {
      valid: fieldErrors.length === 0,
      errors: fieldErrors,
      fields: {},
    };
  };
  
  // 验证整个表单
  const validate = async (): Promise<ValidationResult> => {
    const result: ValidationResult = {
      valid: true,
      errors: {},
      fields: {},
    };
    
    // 设置所有字段为验证中状态
    Object.keys(formState).forEach(key => {
      formState[key].validating = true;
    });
    
    // 等待下一个tick，确保UI更新
    await nextTick();
    
    // 验证每个字段
    for (const [key, field] of Object.entries(formState)) {
      const validationResult = validateField(field.value, field.rules);
      result.valid = result.valid && validationResult.valid;
      
      if (!validationResult.valid) {
        result.errors[key] = validationResult.errors;
      }
      
      result.fields[key] = validationResult.valid;
      field.validating = false;
    }
    
    return result;
  };
  
  // 设置字段值
  const setFieldValue = (field: keyof T, value: any) => {
    if (formState[field as string]) {
      formState[field as string].value = value;
      formState[field as string].dirty = value !== formState[field as string].defaultValue;
    }
  };
  
  // 获取字段值
  const getFieldValue = (field: keyof T): any => {
    return formState[field as string]?.value;
  };
  
  // 重置字段
  const resetField = (field: keyof T) => {
    if (formState[field as string]) {
      formState[field as string].value = formState[field as string].defaultValue;
      formState[field as string].dirty = false;
      formState[field as string].touched = false;
      formState[field as string].validating = false;
    }
  };
  
  // 重置整个表单
  const resetForm = () => {
    Object.keys(formState).forEach(key => {
      resetField(key as keyof T);
    });
  };
  
  // 标记字段为已触碰
  const touchField = (field: keyof T) => {
    if (formState[field as string]) {
      formState[field as string].touched = true;
    }
  };
  
  // 标记所有字段为已触碰
  const touchAllFields = () => {
    Object.keys(formState).forEach(key => {
      formState[key].touched = true;
    });
  };
  
  // 提交表单
  const submitForm = async (onSubmit: (values: T) => Promise<void> | void): Promise<boolean> => {
    try {
      // 标记所有字段为已触碰
      touchAllFields();
      
      // 验证表单
      const validationResult = await validate();
      
      if (validationResult.valid) {
        // 获取表单值
        const values = Object.keys(formState).reduce((acc, key) => {
          acc[key as keyof T] = formState[key].value;
          return acc;
        }, {} as T);
        
        // 调用提交回调
        await onSubmit(values);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('表单提交错误:', error);
      return false;
    }
  };
  
  // 获取表单值
  const getFormValues = (): T => {
    return Object.keys(formState).reduce((acc, key) => {
      acc[key as keyof T] = formState[key].value;
      return acc;
    }, {} as T);
  };
  
  // 设置表单值
  const setFormValues = (values: Partial<T>) => {
    Object.entries(values).forEach(([key, value]) => {
      setFieldValue(key as keyof T, value);
    });
  };
  
  return {
    // 响应式数据
    formState: formState as Reactive<FormState>,
    isDirty: isDirty as ComputedRef<boolean>,
    isTouched: isTouched as ComputedRef<boolean>,
    isValidating: isValidating as ComputedRef<boolean>,
    isValid: isValid as ComputedRef<boolean>,
    errors: errors as ComputedRef<Record<string, string[]>>,
    
    // 方法
    getFieldError,
    hasFieldError,
    validateField,
    validate,
    setFieldValue,
    getFieldValue,
    resetField,
    resetForm,
    touchField,
    touchAllFields,
    submitForm,
    getFormValues,
    setFormValues,
  };
}

// 表单字段组合式函数
export function useFormField<T = any>(initialValue: T, rules: ValidationRule[] = []) {
  // 字段值
  const value = ref<T>(initialValue);
  
  // 默认值
  const defaultValue = ref<T>(initialValue);
  
  // 是否被修改过
  const dirty = ref(false);
  
  // 是否被触碰过
  const touched = ref(false);
  
  // 是否正在验证
  const validating = ref(false);
  
  // 错误信息
  const error = ref<string>('');
  
  // 是否有效
  const isValid = computed(() => !error.value);
  
  // 验证字段
  const validateField = async (): Promise<boolean> => {
    validating.value = true;
    
    try {
      const result = validateField(value.value, rules);
      error.value = result.errors.length > 0 ? result.errors[0] : '';
      return result.valid;
    } finally {
      validating.value = false;
    }
  };
  
  // 设置字段值
  const setValue = (newValue: T) => {
    value.value = newValue;
    dirty.value = newValue !== defaultValue.value;
    
    // 如果字段已被触碰，立即验证
    if (touched.value && rules.some(rule => rule.trigger === 'change')) {
      validateField();
    }
  };
  
  // 重置字段
  const reset = () => {
    value.value = defaultValue.value;
    dirty.value = false;
    touched.value = false;
    error.value = '';
  };
  
  // 标记为已触碰
  const touch = () => {
    touched.value = true;
    
    // 如果有blur触发器的规则，立即验证
    if (rules.some(rule => !rule.trigger || rule.trigger === 'blur')) {
      validateField();
    }
  };
  
  // 监听值变化
  watch(value, () => {
    dirty.value = value.value !== defaultValue.value;
  });
  
  return {
    // 响应式数据
    value: value as Ref<T>,
    defaultValue: defaultValue as Ref<T>,
    dirty: dirty as Ref<boolean>,
    touched: touched as Ref<boolean>,
    validating: validating as Ref<boolean>,
    error: error as Ref<string>,
    isValid: isValid as ComputedRef<boolean>,
    
    // 方法
    setValue,
    reset,
    touch,
    validateField,
  };
}

// 导出类型
export type {
  ValidationRule,
  FormFieldConfig,
  FormState,
  ValidationResult,
};