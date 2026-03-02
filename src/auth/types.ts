/**
 * 授权管理模块 - 类型定义
 * 定义金蝶授权相关的所有接口和类型
 */

/**
 * 授权信息
 * 从主动获取授权接口返回的完整授权数据
 */
export interface AuthorizationInfo {
  /** 服务ID */
  serviceId: string;
  /** 账套ID */
  accountId: string;
  /** 账套名称（仅授权金蝶云星辰时返回） */
  accountName?: string;
  /** 服务账套所在IDC域名（调用业务接口时作为X-GW-Router-Addr） */
  domain: string;
  /** 授权客户的公司名称 */
  agreementCompanyName: string;
  /** 账套分组名称 */
  groupName: string;
  /** 授权状态：1-授权生效，0-授权失效 */
  status: number;
  /** 第三方实例ID */
  outerInstanceId: string;
  /** 应用ID */
  clientId: string;
  /** 授权Key（应用禁用后再启用会刷新） */
  appKey: string;
  /** 授权密钥（24小时动态刷新） */
  appSecret: string;
  /** 实例过期时间（毫秒时间戳） */
  instanceExpiresTime: number;
}

/**
 * 主动获取授权接口响应
 */
export interface AuthorizationResponse {
  /** 响应码：200表示成功 */
  code: number;
  /** 响应消息 */
  msg: string;
  /** 授权信息数组 */
  data: AuthorizationInfo[];
}

/**
 * 获取app-token接口响应
 */
export interface AppTokenResponse {
  /** 错误码：0表示成功 */
  errcode: number;
  /** 描述信息 */
  description: string;
  /** 返回数据 */
  data: {
    /** 用户ID */
    uid: number;
    /** app-token（用于调用业务接口，有效期24小时） */
    'app-token': string;
    /** access_token（用于KIS私有云接口调用，星辰API无需关注） */
    access_token?: string;
  };
}

/**
 * 缓存的授权信息
 * 包含授权信息和获取时间
 */
export interface CachedAuthorization {
  /** 授权信息 */
  info: AuthorizationInfo;
  /** 获取时间（毫秒时间戳） */
  obtainedAt: number;
}

/**
 * 缓存的app-token
 * 包含token和获取时间
 */
export interface CachedAppToken {
  /** app-token值 */
  token: string;
  /** 获取时间（毫秒时间戳） */
  obtainedAt: number;
}

/**
 * 过期时间配置
 */
export const EXPIRATION_CONFIG = {
  /** appSecret有效期：24小时 */
  APP_SECRET_EXPIRY_MS: 24 * 60 * 60 * 1000,
  /** app-token有效期：24小时 */
  APP_TOKEN_EXPIRY_MS: 24 * 60 * 60 * 1000,
  /** 刷新缓冲时间：提前5分钟判定过期 */
  REFRESH_BUFFER_MS: 5 * 60 * 1000
} as const;
