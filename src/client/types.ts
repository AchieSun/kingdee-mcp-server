/**
 * API客户端类型定义
 * 定义金蝶API响应和错误处理的类型
 */

/**
 * 金蝶API标准响应格式
 * 大多数金蝶业务接口都返回此格式
 */
export interface ApiResponse<T> {
  /** 错误码：0表示成功 */
  errcode: number;
  /** 描述信息 */
  description: string;
  /** 业务数据 */
  data: T;
}

/**
 * 金蝶API错误对象
 * 封装API调用错误信息
 */
export interface KingdeeApiError {
  /** 错误码 */
  code: number;
  /** 错误信息 */
  message: string;
  /** 是否为授权相关错误 */
  isAuthError: boolean;
}

/**
 * API错误码常量
 */
export const API_ERROR_CODES = {
  /** 成功 */
  SUCCESS: 0,
  /** 系统错误 */
  SYSTEM_ERROR: 2000002000,
  /** 授权密钥过期 */
  AUTH_KEY_EXPIRED: 1030002006
} as const;

/**
 * 类型守卫：判断是否为API错误
 * 
 * @param error 待判断的错误对象
 * @returns 是否为KingdeeApiError类型
 */
export function isApiError(error: unknown): error is KingdeeApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

/**
 * 创建API错误对象
 * 
 * @param code 错误码
 * @param message 错误信息
 * @returns KingdeeApiError对象
 */
export function createApiError(code: number, message: string): KingdeeApiError {
  return {
    code,
    message,
    isAuthError: code === API_ERROR_CODES.AUTH_KEY_EXPIRED
  };
}
