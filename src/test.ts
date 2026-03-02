/**
 * 集成测试脚本
 * 测试金蝶MCP核心模块功能
 */

import 'dotenv/config';
import { getConfig } from './config/index.js';
import { getSignature, buildSignatureHeaders, getAppSignature, getQueryString } from './signature/index.js';
import { fetchAuthorization, fetchAppToken, ensureValidToken, clearAllCache, isAuthorizationExpired, isAppTokenExpired, getCachedAuthorization, getCachedAppToken } from './auth/index.js';
import { getBalanceSheet } from './client/index.js';

async function testConfig() {
  console.log('\n=== 测试配置加载 ===');
  try {
    const config = getConfig();
    console.log('✓ 配置加载成功');
    console.log(`  - Client ID: ${config.clientId}`);
    console.log(`  - Client Secret: ${config.clientSecret.substring(0, 8)}...`);
    console.log(`  - Outer Instance ID: ${config.outerInstanceId}`);
    console.log(`  - API Gateway: ${config.apiGateway}`);
    return true;
  } catch (error) {
    console.error('✗ 配置加载失败:', error);
    return false;
  }
}

async function testSignature() {
  console.log('\n=== 测试签名生成 ===');
  try {
    const config = getConfig();
    const headers = buildSignatureHeaders();
    const path = '/jdyconnector/app_management/push_app_authorize';
    const params = { outerInstanceId: config.outerInstanceId };
    const queryString = getQueryString(params);
    const signature = getSignature(path, 'POST', headers, queryString, config.clientSecret);
    
    console.log('✓ X-Api-Signature生成成功');
    console.log(`  - Path: ${path}`);
    console.log(`  - Timestamp: ${headers['X-Api-TimeStamp']}`);
    console.log(`  - Nonce: ${headers['X-Api-Nonce']}`);
    console.log(`  - Signature: ${signature.substring(0, 20)}...`);
    
    const testAppKey = 'Wo5YeoLn';
    const testAppSecret = 'test_secret';
    const appSignature = getAppSignature(testAppKey, testAppSecret);
    
    console.log('✓ app_signature生成成功');
    console.log(`  - App Signature: ${appSignature.substring(0, 20)}...`);
    
    return true;
  } catch (error) {
    console.error('✗ 签名生成失败:', error);
    return false;
  }
}

async function testFetchAuthorization() {
  console.log('\n=== 测试主动获取授权 ===');
  try {
    const authInfo = await fetchAuthorization();
    console.log('✓ 授权获取成功');
    console.log(`  - App Key: ${authInfo.appKey}`);
    console.log(`  - App Secret: ${authInfo.appSecret.substring(0, 8)}...`);
    console.log(`  - Domain: ${authInfo.domain}`);
    console.log(`  - Account Name: ${authInfo.accountName}`);
    console.log(`  - Company: ${authInfo.agreementCompanyName}`);
    return true;
  } catch (error) {
    console.error('✗ 授权获取失败:', error);
    return false;
  }
}

async function testFetchAppToken() {
  console.log('\n=== 测试获取app-token ===');
  try {
    const appToken = await fetchAppToken();
    console.log('✓ app-token获取成功');
    console.log(`  - Token: ${appToken.substring(0, 10)}...`);
    return true;
  } catch (error) {
    console.error('✗ app-token获取失败:', error);
    return false;
  }
}

async function testExpiration() {
  console.log('\n=== 测试过期检查机制 ===');
  try {
    const cachedAuth = getCachedAuthorization();
    const cachedToken = getCachedAppToken();
    
    if (cachedAuth) {
      const isExpired = isAuthorizationExpired(cachedAuth);
      console.log(`✓ 授权信息过期检查: ${isExpired ? '已过期' : '未过期'}`);
    }
    
    if (cachedToken) {
      const isExpired = isAppTokenExpired(cachedToken);
      console.log(`✓ app-token过期检查: ${isExpired ? '已过期' : '未过期'}`);
    }
    
    return true;
  } catch (error) {
    console.error('✗ 过期检查失败:', error);
    return false;
  }
}

async function testBalanceSheet() {
  console.log('\n=== 测试资产负债表API ===');
  try {
    const now = new Date();
    const period = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const data = await getBalanceSheet(period);
    
    console.log('✓ 资产负债表API调用成功');
    console.log(`  - 期间: ${period}`);
    console.log(`  - 数据行数: ${data.rows.length}`);
    
    if (data.rows.length > 0) {
      console.log(`  - 第一行: ${data.rows[0].name} = ${data.rows[0].year_end_value}`);
    }
    
    return true;
  } catch (error) {
    console.error('✗ 资产负债表API调用失败:', error);
    return false;
  }
}

async function testEnsureValidToken() {
  console.log('\n=== 测试ensureValidToken ===');
  try {
    const { appToken, authInfo } = await ensureValidToken();
    console.log('✓ ensureValidToken成功');
    console.log(`  - App Token: ${appToken.substring(0, 10)}...`);
    console.log(`  - Domain: ${authInfo.domain}`);
    return true;
  } catch (error) {
    console.error('✗ ensureValidToken失败:', error);
    return false;
  }
}

async function main() {
  console.log('========================================');
  console.log('金蝶MCP核心模块集成测试');
  console.log('========================================');
  
  const results: { name: string; success: boolean }[] = [];
  
  clearAllCache();
  
  results.push({ name: '配置加载', success: await testConfig() });
  results.push({ name: '签名生成', success: await testSignature() });
  results.push({ name: '主动获取授权', success: await testFetchAuthorization() });
  results.push({ name: '获取app-token', success: await testFetchAppToken() });
  results.push({ name: '过期检查机制', success: await testExpiration() });
  results.push({ name: 'ensureValidToken', success: await testEnsureValidToken() });
  results.push({ name: '资产负债表API', success: await testBalanceSheet() });
  
  console.log('\n========================================');
  console.log('测试结果汇总');
  console.log('========================================');
  
  let passed = 0;
  let failed = 0;
  
  for (const result of results) {
    const status = result.success ? '✓ 通过' : '✗ 失败';
    console.log(`  ${result.name}: ${status}`);
    if (result.success) passed++;
    else failed++;
  }
  
  console.log(`\n总计: ${passed} 通过, ${failed} 失败`);
  console.log('========================================');
  
  return failed === 0;
}

main()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('测试执行出错:', error);
    process.exit(1);
  });
