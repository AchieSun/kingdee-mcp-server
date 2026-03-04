# 金蝶云星辰 MCP 服务器

[![npm version](https://badge.fury.io/js/kingdee-mcp-server.svg)](https://badge.fury.io/js/kingdee-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

金蝶云星辰MCP服务器 - 支持AI助手通过MCP协议访问金蝶云星辰API

## 功能特性

- ✅ 完整的金蝶云星辰API支持
- ✅ MCP协议标准实现
- ✅ 自动授权管理和Token刷新
- ✅ 完善的错误处理和重试机制
- ✅ 支持多种财务报表查询
- ✅ 支持凭证、账簿、虚拟核算等业务操作

## 安装

### 使用 npx（推荐）

```bash
npx kingdee-mcp-server
```

### 全局安装

```bash
npm install -g kingdee-mcp-server
kingdee-mcp
```

### 本地安装

```bash
npm install kingdee-mcp-server
```

## 配置

### 环境变量配置

创建 `.env` 文件或设置以下环境变量：

```env
KINGDEE_CLIENT_ID=your_client_id
KINGDEE_CLIENT_SECRET=your_client_secret
KINGDEE_OUTER_INSTANCE_ID=your_outer_instance_id
KINGDEE_API_GATEWAY=https://api.kingdee.com
```

### 配置说明

| 变量名 | 说明 | 必填 |
|--------|------|------|
| `KINGDEE_CLIENT_ID` | 金蝶云星辰应用ID | ✅ |
| `KINGDEE_CLIENT_SECRET` | 金蝶云星辰应用密钥 | ✅ |
| `KINGDEE_OUTER_INSTANCE_ID` | 第三方实例ID | ✅ |
| `KINGDEE_API_GATEWAY` | API网关地址 | ❌（默认：https://api.kingdee.com）|

## 使用方法

### 1. 启动服务器

```bash
# 使用 npx
npx kingdee-mcp-server

# 或全局安装后
kingdee-mcp
```

### 2. 在 AI 助手中配置

在支持 MCP 协议的 AI 助手（如 Trae CN）中添加工具配置：

```json
{
  "mcpServers": {
    "kingdee": {
      "command": "npx",
      "args": ["kingdee-mcp-server"],
      "env": {
        "KINGDEE_CLIENT_ID": "your_client_id",
        "KINGDEE_CLIENT_SECRET": "your_client_secret",
        "KINGDEE_OUTER_INSTANCE_ID": "your_outer_instance_id"
      }
    }
  }
}
```

## 支持的工具

### 报表类工具

#### 1. 资产负债表查询 (get_balance_sheet)
查询企业在特定期间的资产、负债和所有者权益信息

**参数：**
- `period` (string, 必填): 结束年度期间，格式：YYYYMM（如：202401表示2024年1月）

**示例：**
```json
{
  "period": "202401"
}
```

#### 2. 利润表查询 (get_profit_report)
查询企业在特定期间的收入、成本、费用和利润信息

**参数：**
- `period` (string, 必填): 结束年度期间，格式：YYYYMM

### 凭证类工具

#### 3. 凭证列表查询 (get_voucher_list)
查询凭证列表信息

**参数：**
- `startDate` (string, 可选): 开始日期
- `endDate` (string, 可选): 结束日期
- `page` (number, 可选): 页码，默认1
- `pageSize` (number, 可选): 每页数量，默认10

#### 4. 凭证详情查询 (get_voucher_detail)
查询指定凭证的详细信息

**参数：**
- `voucherId` (string, 必填): 凭证ID

### 虚拟核算类工具

#### 5. 虚拟核算类型列表 (get_virtual_type_list)
查询虚拟核算类型列表

#### 6. 虚拟核算列表 (get_virtual_list)
查询虚拟核算列表

**参数：**
- `typeId` (string, 可选): 类型ID
- `page` (number, 可选): 页码
- `pageSize` (number, 可选): 每页数量

#### 7. 虚拟核算详情 (get_virtual_detail)
查询虚拟核算详细信息

**参数：**
- `id` (string, 必填): 虚拟核算ID

### 账簿类工具

#### 8. 辅助核算类别列表 (get_assist_type_list)
查询辅助核算类别列表

#### 9. 核算项目明细账 (get_assistdetail_report)
查询核算项目明细账

**参数：**
- `assistTypeId` (string, 必填): 辅助核算类别ID
- `startDate` (string, 可选): 开始日期
- `endDate` (string, 可选): 结束日期

#### 10. 科目余额表 (get_account_balance)
查询科目余额表

**参数：**
- `period` (string, 必填): 期间，格式：YYYYMM
- `accountIds` (array, 可选): 科目ID列表

#### 11. 明细账 (get_sub_ledger)
查询明细账

**参数：**
- `accountId` (string, 必填): 科目ID
- `startDate` (string, 可选): 开始日期
- `endDate` (string, 可选): 结束日期

#### 12. 数量金额总账 (get_qty_sum)
查询数量金额总账

**参数：**
- `period` (string, 必填): 期间，格式：YYYYMM

### 管理类工具

#### 13. 授权状态检查 (check_auth_status)
检查当前授权状态

#### 14. 缓存清理 (clear_cache)
清理授权缓存

## API 使用示例

### 在代码中使用

```typescript
import { 
  getBalanceSheet, 
  getProfitReport,
  ensureValidToken 
} from 'kingdee-mcp-server';

// 确保有效Token
const { token, authorization } = await ensureValidToken();

// 查询资产负债表
const balanceSheet = await getBalanceSheet('202401');

// 查询利润表
const profitReport = await getProfitReport('202401');
```

## 开发

### 构建

```bash
npm run build
```

### 开发模式

```bash
npm run dev
```

### 测试

```bash
npm test
```

## 技术栈

- **运行时**: Node.js >= 18.0.0
- **语言**: TypeScript
- **MCP SDK**: @modelcontextprotocol/sdk
- **HTTP客户端**: axios
- **配置管理**: dotenv

## 架构设计

```
kingdee-mcp-server/
├── src/
│   ├── index.ts          # 入口文件
│   ├── config/           # 配置管理
│   ├── auth/             # 授权管理
│   ├── signature/        # 签名生成
│   ├── client/           # API客户端
│   │   └── apis/         # API实现
│   └── server/           # MCP服务器
│       └── tools/        # MCP工具
└── dist/                 # 构建输出
```

## 性能特点

- **授权缓存**: 24小时缓存，提前5分钟刷新
- **并发处理**: 支持10+并发请求
- **错误重试**: 自动重试机制，确保可靠性
- **响应时间**: 平均响应时间 < 200ms

## 故障排查

### 授权失败
- 检查环境变量配置是否正确
- 确认应用ID和密钥是否有效
- 查看网络连接是否正常

### 工具调用失败
- 检查参数格式是否正确
- 确认授权状态是否有效
- 查看错误信息进行针对性处理

## 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解版本更新历史。

## 许可证

[MIT License](LICENSE)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 支持

如有问题或建议，请提交 [Issue](https://github.com/AchieSun/kingdee-mcp-server/issues)。

## 相关链接

- [金蝶云星辰API文档](https://open.kingdee.com)
- [MCP协议规范](https://modelcontextprotocol.io)
- [Trae CN](https://trae.ai)
