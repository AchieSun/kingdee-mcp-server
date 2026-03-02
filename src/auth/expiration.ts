/**
 * 授权过期检查模块
 * 提供授权信息和app-token的过期判定功能
 * 
 * 过期策略：
 * - appSecret有效期：24小时
 * - app-token有效期：24小时
 * - 提前5分钟判定过期，留出刷新时间
 */

import { EXPIRATION_CONFIG } from './types.js';
import type { CachedAuthorization, CachedAppToken } from './types.js';

/**
 * 检查授权信息是否过期
 * 提前5分钟判定过期，确保有足够时间刷新
 * 
 * @param cached 缓存的授权信息
 * @returns true表示已过期或即将过期，需要刷新
 */
export function isAuthorizationExpired(cached: CachedAuthorization): boolean {
  const now = Date.now();
  const expiresAt = cached.obtainedAt + EXPIRATION_CONFIG.APP_SECRET_EXPIRY_MS;
  // 提前REFRESH_BUFFER_MS判定过期
  return now >= expiresAt - EXPIRATION_CONFIG.REFRESH_BUFFER_MS;
}

/**
 * 检查app-token是否过期
 * 提前5分钟判定过期，确保有足够时间刷新
 * 
 * @param cached 缓存的app-token
 * @returns true表示已过期或即将过期，需要刷新
 */
export function isAppTokenExpired(cached: CachedAppToken): boolean {
  const now = Date.now();
  const expiresAt = cached.obtainedAt + EXPIRATION_CONFIG.APP_TOKEN_EXPIRY_MS;
  // 提前REFRESH_BUFFER_MS判定过期
  return now >= expiresAt - EXPIRATION_CONFIG.REFRESH_BUFFER_MS;
}

/**
 * 计算距离过期还有多少时间
 * 
 * @param obtainedAt 获取时间（毫秒时间戳）
 * @param expiryMs 有效期（毫秒）
 * @returns 距离过期的毫秒数，如果已过期返回0
 */
export function getTimeUntilExpiry(obtainedAt: number, expiryMs: number): number {
  const now = Date.now();
  const expiresAt = obtainedAt + expiryMs;
  return Math.max(0, expiresAt - now);
}

/**
 * 格式化过期时间为可读字符串
 * 
 * @param ms 毫秒数
 * @returns 格式化的时间字符串（如：23h 45m）
 */
export function formatExpiryTime(ms: number): string {
  const hours = Math.floor(ms / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  return `${hours}h ${minutes}m`;
}
