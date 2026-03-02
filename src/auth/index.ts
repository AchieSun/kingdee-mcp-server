/**
 * 授权管理模块入口
 * 提供统一的授权信息获取和管理接口
 * 
 * 主要功能：
 * - 自动管理授权信息缓存和过期刷新
 * - 自动管理app-token缓存和过期刷新
 * - 提供便捷的授权状态检查接口
 * 
 * 使用方式：
 * ```typescript
 * import { ensureValidToken } from './auth/index.js';
 * 
 * // 获取有效的token和授权信息
 * const { appToken, authInfo } = await ensureValidToken();
 * ```
 */

import 'dotenv/config';
import { fetchAuthorization } from './fetchAuthorization.js';
import { fetchAppToken } from './fetchAppToken.js';
import { 
  getCachedAuthorization, 
  setCachedAuthorization, 
  getCachedAppToken, 
  setCachedAppToken,
  clearAllCache 
} from './cache.js';
import { isAuthorizationExpired, isAppTokenExpired } from './expiration.js';
import type { AuthorizationInfo } from './types.js';

/**
 * 获取授权信息（带缓存和过期检查）
 * 
 * 优先返回缓存的授权信息，如果过期则自动刷新
 * 
 * @returns 授权信息对象
 * 
 * @example
 * const authInfo = await getAuthorization();
 * console.log(authInfo.appKey);    // 应用Key
 * console.log(authInfo.domain);    // IDC域名
 */
export async function getAuthorization(): Promise<AuthorizationInfo> {
  const cached = getCachedAuthorization();
  
  // 如果缓存存在且未过期，直接返回
  if (cached && !isAuthorizationExpired(cached)) {
    return cached.info;
  }
  
  // 否则重新获取
  return fetchAuthorization();
}

/**
 * 获取app-token（带缓存和过期检查）
 * 
 * 优先返回缓存的token，如果过期则自动刷新
 * 
 * @returns app-token字符串
 * 
 * @example
 * const token = await getAppToken();
 * // 返回类似：1643270xxxx
 */
export async function getAppToken(): Promise<string> {
  const cached = getCachedAppToken();
  
  // 如果缓存存在且未过期，直接返回
  if (cached && !isAppTokenExpired(cached)) {
    return cached.token;
  }
  
  // 否则重新获取
  return fetchAppToken();
}

/**
 * 确保获取有效的token和授权信息
 * 
 * 这是最常用的授权获取方法，会自动处理：
 * 1. 检查缓存是否存在
 * 2. 检查是否过期
 * 3. 自动刷新过期的凭证
 * 
 * @returns 包含appToken和authInfo的对象
 * 
 * @example
 * const { appToken, authInfo } = await ensureValidToken();
 * 
 * // 使用appToken调用业务API
 * // 使用authInfo.domain作为X-GW-Router-Addr
 */
export async function ensureValidToken(): Promise<{ appToken: string; authInfo: AuthorizationInfo }> {
  const authInfo = await getAuthorization();
  const appToken = await getAppToken();
  
  return { appToken, authInfo };
}

// 导出子模块功能
export {
  fetchAuthorization,
  fetchAppToken,
  getCachedAuthorization,
  setCachedAuthorization,
  getCachedAppToken,
  setCachedAppToken,
  clearAllCache,
  isAuthorizationExpired,
  isAppTokenExpired
};

// 导出类型
export type { AuthorizationInfo, AuthorizationResponse, AppTokenResponse } from './types.js';
