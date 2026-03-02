/**
 * 签名管理模块
 * 提供金蝶API签名相关的所有功能
 * 
 * 包含：
 * - 随机数生成（randomInt）
 * - HMAC-SHA256加密（sha256AndBase64）
 * - 查询字符串处理（getQueryString, encodeQueryStringForSignature）
 * - X-Api-Signature签名生成（getSignature, buildSignatureHeaders）
 * - app_signature签名生成（getAppSignature）
 */

export { randomInt } from './randomInt.js';
export { sha256AndBase64 } from './sha256AndBase64.js';
export { getQueryString, encodeQueryStringForSignature } from './getQueryString.js';
export { getSignature, buildSignatureHeaders, type SignatureHeaders } from './getSignature.js';
export { getAppSignature } from './getAppSignature.js';
