/**
 * API客户端模块入口
 * 提供统一的金蝶API调用接口
 * 
 * 主要导出：
 * - KingdeeHttpClient: HTTP客户端类
 * - getHttpClient: 获取HTTP客户端实例
 * - getBalanceSheet: 资产负债表API
 * - 错误处理相关函数和类型
 */

// HTTP客户端
export { KingdeeHttpClient, getHttpClient } from './httpClient.js';

// 业务API
export { getBalanceSheet, type BalanceSheetData, type BalanceSheetItem } from './apis/balanceSheet.js';

// 类型和错误处理
export { 
  createApiError, 
  API_ERROR_CODES, 
  type ApiResponse, 
  type KingdeeApiError 
} from './types.js';

export { handleApiError, shouldRetry, withRetry } from './errorHandler.js';
