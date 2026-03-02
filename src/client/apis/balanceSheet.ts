/**
 * 资产负债表API
 * 查询金蝶云星辰的资产负债表数据
 * 
 * 接口说明：
 * - 接口地址：GET https://api.kingdee.com/jdy/v2/fi/balancesheet
 * - 用途：查询资产负债表
 * - 参数：period（结束年度期间，如：202401）
 */

import { getHttpClient } from '../httpClient.js';

/**
 * 资产负债表行项目
 * 表示资产负债表中的一行数据
 */
export interface BalanceSheetItem {
  /** 行ID */
  id: string;
  /** 行次（文本） */
  index: string;
  /** 资产名称 */
  name: string;
  /** 父级ID */
  parent_id: string;
  /** 项目类别：1-资产，2-负债，3-所有者权益 */
  type: string;
  /** 年初余额 */
  year_begin_value: string;
  /** 期末余额 */
  year_end_value: string;
}

/**
 * 资产负债表数据
 */
export interface BalanceSheetData {
  /** 数据行列表 */
  rows: BalanceSheetItem[];
}

/**
 * 查询资产负债表
 * 
 * @param period 结束年度期间（格式：YYYYMM，如：202401）
 * @returns 资产负债表数据
 * @throws API错误
 * 
 * @example
 * // 查询2024年1月的资产负债表
 * const data = await getBalanceSheet('202401');
 * 
 * // 遍历数据
 * for (const row of data.rows) {
 *   console.log(row.name, row.year_end_value);
 * }
 */
export async function getBalanceSheet(period: string): Promise<BalanceSheetData> {
  const client = getHttpClient();
  return client.get<BalanceSheetData>('/jdy/v2/fi/balancesheet', { period });
}

// 类型别名导出
export type { BalanceSheetItem as BalanceSheetRow };
