/**
 * 授权信息缓存管理模块
 * 提供授权信息和app-token的内存缓存功能
 * 
 * 缓存策略：
 * - 授权信息（appSecret等）：缓存24小时
 * - app-token：缓存24小时
 * - 提前5分钟判定过期，自动刷新
 */

import type { CachedAuthorization, CachedAppToken, AuthorizationInfo } from './types.js';

/** 缓存的授权信息 */
let cachedAuth: CachedAuthorization | null = null;

/** 缓存的app-token */
let cachedAppToken: CachedAppToken | null = null;

/**
 * 获取缓存的授权信息
 * @returns 缓存的授权信息，如果不存在则返回null
 */
export function getCachedAuthorization(): CachedAuthorization | null {
  return cachedAuth;
}

/**
 * 设置授权信息缓存
 * 同时记录获取时间，用于过期检查
 * 
 * @param info 授权信息
 */
export function setCachedAuthorization(info: AuthorizationInfo): void {
  cachedAuth = {
    info,
    obtainedAt: Date.now()
  };
}

/**
 * 清除授权信息缓存
 * 用于强制刷新授权信息
 */
export function clearCachedAuthorization(): void {
  cachedAuth = null;
}

/**
 * 获取缓存的app-token
 * @returns 缓存的app-token，如果不存在则返回null
 */
export function getCachedAppToken(): CachedAppToken | null {
  return cachedAppToken;
}

/**
 * 设置app-token缓存
 * 同时记录获取时间，用于过期检查
 * 
 * @param token app-token值
 */
export function setCachedAppToken(token: string): void {
  cachedAppToken = {
    token,
    obtainedAt: Date.now()
  };
}

/**
 * 清除app-token缓存
 * 用于强制刷新token
 */
export function clearCachedAppToken(): void {
  cachedAppToken = null;
}

/**
 * 清除所有缓存
 * 包括授权信息和app-token
 */
export function clearAllCache(): void {
  cachedAuth = null;
  cachedAppToken = null;
}
