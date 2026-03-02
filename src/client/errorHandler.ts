/**
 * API错误处理模块
 * 提供统一的错误处理和重试机制
 * 
 * 主要功能：
 * - 将Axios错误转换为KingdeeApiError
 * - 判断错误是否可重试
 * - 提供带重试的请求执行器
 */

import axios from 'axios';
import { createApiError, API_ERROR_CODES, type KingdeeApiError } from './types.js';

/**
 * 处理API错误
 * 将各种类型的错误统一转换为KingdeeApiError
 * 
 * @param error 原始错误对象
 * @returns 标准化的KingdeeApiError对象
 * 
 * @example
 * try {
 *   await client.request(...);
 * } catch (error) {
 *   const apiError = handleApiError(error);
 *   console.log(apiError.code, apiError.message);
 * }
 */
export function handleApiError(error: unknown): KingdeeApiError {
  // 处理Axios错误
  if (axios.isAxiosError(error)) {
    // 有响应但业务逻辑错误
    if (error.response) {
      const { status, data } = error.response;
      
      // 如果响应包含金蝶错误码
      if (data && typeof data.errcode !== 'undefined') {
        return createApiError(data.errcode, data.description || error.message);
      }
      
      // HTTP状态码错误
      return createApiError(status, error.message);
    }
    
    // 请求已发送但无响应（网络问题）
    if (error.request) {
      return createApiError(-1, 'Network error: No response received');
    }
    
    // 请求配置错误
    return createApiError(-1, error.message);
  }
  
  // 处理标准Error对象
  if (error instanceof Error) {
    return createApiError(-1, error.message);
  }
  
  // 未知错误类型
  return createApiError(-1, 'Unknown error occurred');
}

/**
 * 判断错误是否可以重试
 * 
 * 可重试的错误包括：
 * - 系统错误（2000002000）
 * - 网络错误（-1）
 * 
 * @param error API错误对象
 * @returns 是否可以重试
 */
export function shouldRetry(error: KingdeeApiError): boolean {
  const retryableCodes = [
    API_ERROR_CODES.SYSTEM_ERROR,
    -1  // 网络错误
  ];
  
  return retryableCodes.includes(error.code);
}

/**
 * 带重试机制的请求执行器
 * 
 * 当请求失败且错误可重试时，自动重试
 * 重试间隔采用递增策略
 * 
 * @param fn 要执行的异步函数
 * @param maxRetries 最大重试次数（默认3次）
 * @param delayMs 初始重试间隔（默认1000毫秒）
 * @returns 函数执行结果
 * @throws 重试耗尽后抛出最后一次错误
 * 
 * @example
 * const data = await withRetry(
 *   () => client.get('/api/data'),
 *   3,  // 最多重试3次
 *   1000  // 初始间隔1秒
 * );
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: KingdeeApiError | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const apiError = handleApiError(error);
      
      // 如果错误不可重试，直接抛出
      if (!shouldRetry(apiError)) {
        throw apiError;
      }
      
      lastError = apiError;
      
      // 如果还有重试机会，等待后重试
      if (attempt < maxRetries - 1) {
        // 递增等待时间：第一次1秒，第二次2秒，第三次3秒...
        await new Promise(resolve => setTimeout(resolve, delayMs * (attempt + 1)));
      }
    }
  }
  
  // 重试耗尽，抛出最后一次错误
  throw lastError;
}
