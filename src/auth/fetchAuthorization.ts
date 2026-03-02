/**
 * 主动获取授权模块
 * 调用金蝶push_app_authorize接口获取授权信息
 * 
 * 接口说明：
 * - 接口地址：POST https://api.kingdee.com/jdyconnector/app_management/push_app_authorize
 * - 用途：主动获取授权信息，包括appKey、appSecret、domain等
 * - 返回数据：授权信息数组，通常包含一个元素
 */

import axios from 'axios';
import { getConfig } from '../config/index.js';
import { getSignature, buildSignatureHeaders, getQueryString } from '../signature/index.js';
import { setCachedAuthorization } from './cache.js';
import type { AuthorizationResponse, AuthorizationInfo } from './types.js';

/** 主动获取授权接口地址 */
const AUTH_API_URL = 'https://api.kingdee.com/jdyconnector/app_management/push_app_authorize';

/**
 * 主动获取授权信息
 * 
 * 调用金蝶push_app_authorize接口，获取appKey、appSecret、domain等授权信息
 * 获取成功后会自动缓存授权信息
 * 
 * @returns 授权信息对象
 * @throws 网络错误或接口返回错误时抛出异常
 * 
 * @example
 * const authInfo = await fetchAuthorization();
 * console.log(authInfo.appKey);     // 应用Key
 * console.log(authInfo.appSecret);  // 应用密钥（24小时刷新）
 * console.log(authInfo.domain);     // IDC域名
 */
export async function fetchAuthorization(): Promise<AuthorizationInfo> {
  const config = getConfig();
  
  // 构建请求参数
  const params = {
    outerInstanceId: config.outerInstanceId
  };
  
  // 生成查询字符串和签名
  const queryString = getQueryString(params);
  const headers = buildSignatureHeaders();
  const path = new URL(AUTH_API_URL).pathname;
  
  // 计算X-Api-Signature
  const signature = getSignature(
    path,
    'POST',
    headers,
    queryString,
    config.clientSecret
  );

  try {
    // 发送POST请求
    const response = await axios.post<AuthorizationResponse>(
      AUTH_API_URL,
      null,
      {
        params,
        headers: {
          'Content-Type': 'application/json',
          'X-Api-ClientID': config.clientId,
          'X-Api-Auth-Version': '2.0',
          'X-Api-TimeStamp': headers['X-Api-TimeStamp'],
          'X-Api-Nonce': headers['X-Api-Nonce'],
          'X-Api-SignHeaders': headers['X-Api-SignHeaders'],
          'X-Api-Signature': signature
        }
      }
    );

    // 检查响应状态
    if (response.data.code !== 200 || !response.data.data || response.data.data.length === 0) {
      throw new Error(`Authorization failed: ${response.data.msg || 'No data returned'}`);
    }

    // 获取第一个授权信息（通常只有一个）
    const authInfo = response.data.data[0];
    
    // 缓存授权信息
    setCachedAuthorization(authInfo);
    
    return authInfo;
  } catch (error) {
    // 处理Axios错误
    if (axios.isAxiosError(error)) {
      throw new Error(`Authorization request failed: ${error.message}`);
    }
    throw error;
  }
}
