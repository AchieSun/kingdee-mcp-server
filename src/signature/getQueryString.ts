/**
 * 查询字符串处理工具
 * 用于金蝶API签名中的参数排序和URL编码
 */

/**
 * 将参数对象转换为排序后的查询字符串
 * 参数按ASCII码升序排序，并进行URL编码
 * 
 * @param params 参数对象
 * @returns 排序并编码后的查询字符串（如：app_key=xxx&app_signature=yyy）
 */
export function getQueryString(params: Record<string, string>): string {
  if (!params || Object.keys(params).length === 0) {
    return '';
  }

  // 按键名ASCII码升序排序
  const sortedKeys = Object.keys(params).sort();
  const encodedParts: string[] = [];

  for (const key of sortedKeys) {
    const encodedKey = encodeURIComponent(key);
    const encodedValue = encodeURIComponent(params[key]);
    encodedParts.push(`${encodedKey}=${encodedValue}`);
  }

  return encodedParts.join('&');
}

/**
 * 对查询字符串进行二次URL编码（用于签名计算）
 * 金蝶签名规范要求对查询参数进行两次URL编码
 * 
 * @param queryString 原始查询字符串
 * @returns 二次编码后的查询字符串
 */
export function encodeQueryStringForSignature(queryString: string): string {
  if (!queryString || queryString.length === 0) {
    return '';
  }

  // 分割参数对
  const pairs = queryString.split('&');
  
  // 按参数名排序
  const sortedPairs = pairs.sort();

  // 对每个参数进行二次编码
  const encodedParts: string[] = [];
  for (const pair of sortedPairs) {
    const [key, value] = pair.split('=');
    const doubleEncodedKey = encodeURIComponent(key);
    const doubleEncodedValue = encodeURIComponent(value);
    encodedParts.push(`${doubleEncodedKey}=${doubleEncodedValue}`);
  }

  return encodedParts.join('&');
}
