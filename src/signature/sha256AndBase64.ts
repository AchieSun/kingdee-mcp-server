/**
 * HMAC-SHA256加密工具
 * 用于生成金蝶API签名
 */

import { createHmac } from 'crypto';

/**
 * 使用HMAC-SHA256算法加密数据，并转换为Base64格式
 * 
 * 加密流程：
 * 1. 使用secret作为密钥，对data进行HMAC-SHA256加密
 * 2. 将加密结果转换为16进制字符串
 * 3. 将16进制字符串进行Base64编码
 * 
 * @param data 待加密的数据
 * @param secret 加密密钥（clientSecret或appSecret）
 * @returns Base64编码的签名字符串
 */
export function sha256AndBase64(data: string, secret: string): string {
  // 创建HMAC-SHA256实例
  const hmac = createHmac('sha256', secret);
  
  // 更新待加密数据
  hmac.update(data);
  
  // 获取16进制摘要
  const hexDigest = hmac.digest('hex');
  
  // 将16进制字符串转换为Base64
  return Buffer.from(hexDigest, 'utf8').toString('base64');
}
