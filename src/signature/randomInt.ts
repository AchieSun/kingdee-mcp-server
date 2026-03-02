/**
 * 随机数生成工具
 * 用于生成金蝶API签名所需的随机数（X-Api-Nonce）
 */

/**
 * 生成16位随机正整数
 * 用于金蝶API请求的X-Api-Nonce参数
 * @returns 16位随机数（范围：1000000000000000 ~ 9999999999999999）
 */
export function randomInt(): number {
  const max = 9999999999999999;
  const min = 1000000000000000;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
