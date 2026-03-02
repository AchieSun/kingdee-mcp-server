/**
 * 金蝶API HTTP客户端
 * 提供统一的HTTP请求封装，自动处理签名和授权
 * 
 * 主要功能：
 * - 自动添加X-Api-Signature签名
 * - 自动添加app-token和X-GW-Router-Addr
 * - 统一的错误处理
 */

import axios, { AxiosRequestConfig } from 'axios';
import { getConfig } from '../config/index.js';
import { getSignature, buildSignatureHeaders, getQueryString } from '../signature/index.js';
import { ensureValidToken } from '../auth/index.js';
import { createApiError, API_ERROR_CODES, type ApiResponse } from './types.js';
import { handleApiError } from './errorHandler.js';

/**
 * 请求选项接口
 */
export interface RequestOptions {
  /** HTTP方法 */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  /** 请求路径（如：/jdy/v2/fi/balancesheet） */
  path: string;
  /** URL查询参数 */
  params?: Record<string, string>;
  /** 请求体数据 */
  data?: unknown;
  /** 是否需要授权（默认true） */
  requireAuth?: boolean;
}

/**
 * 金蝶API HTTP客户端类
 * 
 * 封装了金蝶API的请求逻辑，包括：
 * - 签名生成
 * - 授权token管理
 * - 错误处理
 * 
 * @example
 * const client = getHttpClient();
 * const data = await client.get('/jdy/v2/fi/balancesheet', { period: '202401' });
 */
export class KingdeeHttpClient {
  /** 应用ID */
  private clientId: string;
  /** 应用密钥 */
  private clientSecret: string;
  /** API网关地址 */
  private apiGateway: string;

  constructor() {
    const config = getConfig();
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.apiGateway = config.apiGateway || 'https://api.kingdee.com';
  }

  /**
   * 构建请求Headers
   * 包括签名、授权token等
   * 
   * @param method HTTP方法
   * @param path 请求路径
   * @param params 查询参数
   * @param appToken app-token（可选）
   * @param domain IDC域名（可选）
   * @returns Headers对象
   */
  private async buildHeaders(
    method: string,
    path: string,
    params: Record<string, string> = {},
    appToken?: string,
    domain?: string
  ): Promise<Record<string, string | number>> {
    // 生成查询字符串
    const queryString = getQueryString(params);
    
    // 构建签名Headers
    const signatureHeaders = buildSignatureHeaders();
    
    // 计算签名
    const signature = getSignature(
      path,
      method,
      signatureHeaders,
      queryString,
      this.clientSecret
    );

    // 组装完整Headers
    const headers: Record<string, string | number> = {
      'Content-Type': 'application/json',
      'X-Api-ClientID': this.clientId,
      'X-Api-Auth-Version': '2.0',
      'X-Api-TimeStamp': signatureHeaders['X-Api-TimeStamp'],
      'X-Api-Nonce': signatureHeaders['X-Api-Nonce'],
      'X-Api-SignHeaders': signatureHeaders['X-Api-SignHeaders'],
      'X-Api-Signature': signature
    };

    // 添加app-token（业务接口需要）
    if (appToken) {
      headers['app-token'] = appToken;
    }

    // 添加IDC域名（业务接口需要）
    if (domain) {
      headers['X-GW-Router-Addr'] = domain;
    }

    return headers;
  }

  /**
   * 发送API请求
   * 
   * @param options 请求选项
   * @returns 响应数据
   * @throws API错误
   * 
   * @example
   * const data = await client.request({
   *   method: 'GET',
   *   path: '/jdy/v2/fi/balancesheet',
   *   params: { period: '202401' }
   * });
   */
  async request<T>(options: RequestOptions): Promise<T> {
    const { method, path, params = {}, data, requireAuth = true } = options;
    
    let appToken: string | undefined;
    let domain: string | undefined;

    // 如果需要授权，获取有效的token
    if (requireAuth) {
      const auth = await ensureValidToken();
      appToken = auth.appToken;
      domain = auth.authInfo.domain;
    }

    // 构建Headers
    const headers = await this.buildHeaders(method, path, params, appToken, domain);
    const url = `${this.apiGateway}${path}`;

    try {
      // 构建Axios配置
      const axiosConfig: AxiosRequestConfig = {
        method,
        url,
        params,
        headers: headers as Record<string, string>,
        data
      };

      // 发送请求
      const response = await axios.request<ApiResponse<T>>(axiosConfig);

      // 检查业务错误码
      if (response.data.errcode !== API_ERROR_CODES.SUCCESS) {
        throw createApiError(response.data.errcode, response.data.description);
      }

      return response.data.data;
    } catch (error) {
      // 处理Axios错误
      if (axios.isAxiosError(error)) {
        const apiError = handleApiError(error);
        throw apiError;
      }
      throw error;
    }
  }

  /**
   * 发送GET请求
   * 
   * @param path 请求路径
   * @param params 查询参数
   * @returns 响应数据
   */
  async get<T>(path: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'GET', path, params });
  }

  /**
   * 发送POST请求
   * 
   * @param path 请求路径
   * @param data 请求体
   * @param params 查询参数
   * @returns 响应数据
   */
  async post<T>(path: string, data?: unknown, params?: Record<string, string>): Promise<T> {
    return this.request<T>({ method: 'POST', path, params, data });
  }
}

/** HTTP客户端单例 */
let httpClientInstance: KingdeeHttpClient | null = null;

/**
 * 获取HTTP客户端实例（单例模式）
 * 
 * @returns KingdeeHttpClient实例
 */
export function getHttpClient(): KingdeeHttpClient {
  if (!httpClientInstance) {
    httpClientInstance = new KingdeeHttpClient();
  }
  return httpClientInstance;
}
