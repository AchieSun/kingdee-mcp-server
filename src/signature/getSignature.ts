/**
 * X-Api-Signature签名生成模块
 * 实现金蝶API请求签名算法
 */

import { sha256AndBase64 } from './sha256AndBase64.js';
import { encodeQueryStringForSignature } from './getQueryString.js';
import { randomInt } from './randomInt.js';

/**
 * 签名所需的Headers结构
 */
export interface SignatureHeaders {
  /** 时间戳（毫秒） */
  'X-Api-TimeStamp': number;
  /** 随机数 */
  'X-Api-Nonce': number;
  /** 参与签名的Headers列表 */
  'X-Api-SignHeaders': string;
}

/**
 * 构建签名所需的Headers
 * 生成时间戳和随机数
 * 
 * @returns 签名Headers对象
 */
export function buildSignatureHeaders(): SignatureHeaders {
  const timestamp = Date.now();
  const nonce = randomInt();

  return {
    'X-Api-TimeStamp': timestamp,
    'X-Api-Nonce': nonce,
    'X-Api-SignHeaders': 'X-Api-TimeStamp,X-Api-Nonce'
  };
}

/**
 * 生成X-Api-Signature签名
 * 
 * 签名规则：
 * 1. 拼接签名原文：
 *    METHOD + \n + encodeURIComponent(path) + \n + queryString + \n + headersString
 * 2. 使用clientSecret进行HMAC-SHA256加密，输出16进制
 * 3. 对16进制结果进行Base64编码
 * 
 * @param path 请求路径（如：/jdyconnector/app_management/push_app_authorize）
 * @param method 请求方法（GET、POST等）
 * @param headers 签名Headers
 * @param queryString 查询字符串
 * @param clientSecret 客户端密钥
 * @returns X-Api-Signature签名字符串
 */
export function getSignature(
  path: string,
  method: string,
  headers: SignatureHeaders,
  queryString: string,
  clientSecret: string
): string {
  // 对路径进行URL编码
  const encodedPath = encodeURIComponent(path);
  
  // 对查询字符串进行二次编码
  const encodedQueryString = encodeQueryStringForSignature(queryString);

  // 构建Headers字符串
  // 按X-Api-SignHeaders指定的顺序，小写形式，每行一个
  const signHeaders = headers['X-Api-SignHeaders'].split(',').sort();
  let headersString = '';
  for (const header of signHeaders) {
    const lowerHeader = header.toLowerCase().trim();
    headersString += `${lowerHeader}:${headers[header as keyof SignatureHeaders]}\n`;
  }

  // 拼接签名原文
  const signString = [
    method.toUpperCase(),
    encodedPath,
    encodedQueryString,
    headersString
  ].join('\n');

  // 生成签名
  return sha256AndBase64(signString, clientSecret);
}
