/**
 * app-token获取模块
 * 调用金蝶kingdee_auth_token接口获取账套级别的token
 * 
 * 接口说明：
 * - 接口地址：GET https://api.kingdee.com/jdyconnector/app_management/kingdee_auth_token
 * - 用途：获取账套级别的token，用于调用业务接口
 * - 有效期：24小时
 * - 频率限制：每分钟2次
 */

import axios from 'axios';
import { getConfig } from '../config/index.js';
import { getSignature, buildSignatureHeaders, getQueryString, getAppSignature } from '../signature/index.js';
import { setCachedAppToken, getCachedAuthorization } from './cache.js';
import { isAuthorizationExpired } from './expiration.js';
import { fetchAuthorization } from './fetchAuthorization.js';
import type { AppTokenResponse } from './types.js';

/** 获取app-token接口地址 */
const APP_TOKEN_API_URL = 'https://api.kingdee.com/jdyconnector/app_management/kingdee_auth_token';

/** 授权密钥过期错误码 */
const AUTH_KEY_EXPIRED_ERROR = 1030002006;

/**
 * 获取app-token
 * 
 * 调用金蝶kingdee_auth_token接口，获取用于调用业务接口的token
 * 
 * 流程：
 * 1. 检查缓存的授权信息是否过期，过期则重新获取
 * 2. 使用appSecret对appKey签名生成app_signature
 * 3. 调用接口获取app-token
 * 4. 缓存app-token
 * 
 * @returns app-token字符串
 * @throws 网络错误或接口返回错误时抛出异常
 * 
 * @example
 * const appToken = await fetchAppToken();
 * // 返回类似：1643270xxxx
 */
export async function fetchAppToken(): Promise<string> {
  const config = getConfig();
  
  // 获取授权信息，如果过期则刷新
  let authInfo = getCachedAuthorization()?.info;
  
  if (!authInfo || isAuthorizationExpired(getCachedAuthorization()!)) {
    authInfo = await fetchAuthorization();
  }

  // 生成app_signature（使用appSecret对appKey进行HMAC-SHA256签名）
  const appSignature = getAppSignature(authInfo.appKey, authInfo.appSecret);
  
  // 构建请求参数
  const params = {
    app_key: authInfo.appKey,
    app_signature: appSignature
  };
  
  // 生成查询字符串和签名
  const queryString = getQueryString(params);
  const headers = buildSignatureHeaders();
  const path = new URL(APP_TOKEN_API_URL).pathname;
  
  // 计算X-Api-Signature
  const signature = getSignature(
    path,
    'GET',
    headers,
    queryString,
    config.clientSecret
  );

  try {
    // 发送GET请求
    const response = await axios.get<AppTokenResponse>(
      APP_TOKEN_API_URL,
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
    if (response.data.errcode !== 0) {
      // 特殊处理：授权密钥过期错误
      if (response.data.errcode === AUTH_KEY_EXPIRED_ERROR) {
        throw new Error('Authorization key expired, please refresh authorization');
      }
      throw new Error(`App token request failed: ${response.data.description}`);
    }

    // 获取app-token
    const appToken = response.data.data['app-token'];
    
    // 缓存app-token
    setCachedAppToken(appToken);
    
    return appToken;
  } catch (error) {
    // 处理Axios错误
    if (axios.isAxiosError(error)) {
      throw new Error(`App token request failed: ${error.message}`);
    }
    throw error;
  }
}
