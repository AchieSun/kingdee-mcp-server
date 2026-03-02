/**
 * 金蝶云星辰配置管理模块
 * 负责加载、验证和管理API配置信息
 */

import dotenv from 'dotenv';

// 在模块加载时自动加载.env文件
dotenv.config();

/**
 * 金蝶配置接口
 */
export interface KingdeeConfig {
  /** 应用ID（从开发者后台获取） */
  clientId: string;
  /** 应用密钥（用于签名生成） */
  clientSecret: string;
  /** 第三方实例ID（企业内部应用自动生成） */
  outerInstanceId: string;
  /** API网关地址（可选，默认为金蝶官方地址） */
  apiGateway?: string;
}

/**
 * 配置验证结果
 */
export interface ConfigValidationResult {
  /** 是否验证通过 */
  valid: boolean;
  /** 错误信息列表 */
  errors: string[];
}

/** 必需的配置项 */
const REQUIRED_CONFIG_KEYS: (keyof KingdeeConfig)[] = [
  'clientId',
  'clientSecret',
  'outerInstanceId'
];

/**
 * 验证配置项是否完整和正确
 * @param config 待验证的配置对象
 * @returns 验证结果，包含是否通过和错误信息
 */
export function validateConfig(config: Partial<KingdeeConfig>): ConfigValidationResult {
  const errors: string[] = [];

  // 检查必需字段是否存在
  for (const key of REQUIRED_CONFIG_KEYS) {
    if (!config[key] || config[key]!.trim() === '') {
      errors.push(`Missing required configuration: ${key}`);
    }
  }

  // 验证clientId格式（应为数字字符串）
  if (config.clientId && !/^\d+$/.test(config.clientId)) {
    errors.push('clientId should be a numeric string');
  }

  // 验证clientSecret长度（应大于32字符）
  if (config.clientSecret && config.clientSecret.length < 32) {
    errors.push('clientSecret appears to be invalid (too short)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 从环境变量加载配置
 * @returns 完整的金蝶配置对象
 * @throws 配置验证失败时抛出错误
 */
export function loadConfigFromEnv(): KingdeeConfig {
  const config: KingdeeConfig = {
    clientId: process.env.KINGDEE_CLIENT_ID || '',
    clientSecret: process.env.KINGDEE_CLIENT_SECRET || '',
    outerInstanceId: process.env.KINGDEE_OUTER_INSTANCE_ID || '',
    apiGateway: process.env.KINGDEE_API_GATEWAY || 'https://api.kingdee.com'
  };

  const validation = validateConfig(config);
  if (!validation.valid) {
    throw new Error(`Configuration validation failed:\n${validation.errors.join('\n')}`);
  }

  return config;
}

/** 缓存的配置对象 */
let cachedConfig: KingdeeConfig | null = null;

/**
 * 获取配置（带缓存）
 * 首次调用时从环境变量加载，后续调用返回缓存
 * @returns 金蝶配置对象
 */
export function getConfig(): KingdeeConfig {
  if (!cachedConfig) {
    cachedConfig = loadConfigFromEnv();
  }
  return cachedConfig;
}

/**
 * 重置配置缓存
 * 用于测试或需要重新加载配置的场景
 */
export function resetConfig(): void {
  cachedConfig = null;
}
