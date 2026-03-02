/**
 * app_signature签名生成模块
 * 用于获取app-token时的签名计算
 */

import { createHmac } from 'crypto';

/**
 * 生成app_signature签名
 * 
 * 用于获取app-token接口的app_signature参数
 * 
 * 签名规则：
 * 1. 使用appSecret作为密钥，对appKey进行HMAC-SHA256加密
 * 2. 将加密结果转换为16进制字符串
 * 3. 将16进制字符串进行Base64编码
 * 
 * @param appKey 应用Key（从授权信息中获取）
 * @param appSecret 应用密钥（从授权信息中获取，24小时刷新）
 * @returns Base64编码的app_signature签名
 * 
 * @example
 * const appSignature = getAppSignature('Wo5YeoLn', 'xxx');
 * // 返回类似：ZDljMTI3NGIyNTE1MTRkYzlkNjc1MDNhYjUzMzgzNWMyY2M4YTdjMzdmNmM3YTVlNDkxMTkzNjdiOTFjNzUyZQ==
 */
export function getAppSignature(appKey: string, appSecret: string): string {
  // 创建HMAC-SHA256实例
  const hmac = createHmac('sha256', appSecret);
  
  // 使用appKey作为待加密数据
  hmac.update(appKey);
  
  // 获取16进制摘要
  const hexDigest = hmac.digest('hex');
  
  // 将16进制字符串转换为Base64
  return Buffer.from(hexDigest, 'utf8').toString('base64');
}
