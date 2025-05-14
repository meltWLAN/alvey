# MetaverseX 测试和上线准备指南

本文档指导您如何在本地测试 MetaverseX 合约并准备上线到 AlveyChain 主网。

## 合约地址（本地测试环境）

- 支付代币地址: 0x5FC8d32690cc91D4c39d9d3abcBD16989F875707
- MetaverseXNFT 合约地址: 0xa513E6E4b8f2a923D98304ec87F64353C4D5C853
- NFTLending 合约地址: 0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6
- MetaverseXFactory 合约地址: 0x8A791620dd6260079BF849Dc5567aDC3F2FdC318

## 测试流程

### 预备步骤

1. 确保您的环境中已安装 Node.js (v14 或更高版本)
2. 确保已安装所有依赖：`npm install`

### 自动化测试

我们提供了一个一键测试脚本，它将按顺序执行所有测试：

```bash
./test-metaversex.sh
```

该脚本会：
1. 询问您是否需要启动新的本地节点
2. 如果需要，将部署 MetaverseX 合约
3. 执行以下测试：
   - NFT 铸造功能测试
   - NFT 借贷功能测试
   - 工厂功能测试

### 手动测试

如果您想单独运行某个测试，可使用以下命令：

```bash
# 测试 NFT 铸造功能
npx hardhat run scripts/test-nft-mint.js --network localhost

# 测试 NFT 借贷功能
npx hardhat run scripts/test-nft-lending.js --network localhost

# 测试工厂功能
npx hardhat run scripts/test-factory.js --network localhost
```

## 上线准备

### 1. 主网部署

主网部署使用以下命令：

```bash
./deploy-metaversex.sh
```

选择 "AlveyChain 主网" 选项进行部署。

### 2. 合约验证

部署后可选择验证合约。如果您在部署脚本中选择了不验证，可在日后使用以下命令进行验证：

```bash
npx hardhat verify --network alveychain <合约地址> [构造函数参数，如果有的话]
```

例如，验证 MetaverseXNFT 合约：

```bash
npx hardhat verify --network alveychain <MetaverseXNFT地址> <支付代币地址>
```

### 3. 前端集成

上线后，应当将主网合约地址配置到前端应用中：

```javascript
// 前端配置示例
const CONTRACT_ADDRESSES = {
  PAYMENT_TOKEN: "0x...", // 支付代币地址
  NFT_CONTRACT: "0x...",  // MetaverseXNFT 地址
  LENDING_CONTRACT: "0x...", // NFTLending 地址
  FACTORY_CONTRACT: "0x..."  // MetaverseXFactory 地址
};
```

### 4. 安全考虑

上线前请确保：

1. 合约已经过审计或者内部全面测试
2. 管理员地址已安全保存（多签钱包更佳）
3. 设置了合理的费率和限制
4. 准备了应急方案，例如暂停功能的使用策略

## 潜在问题排查

### 本地测试问题

1. **节点连接问题**：确保本地节点已启动，并且运行在 http://localhost:8545
2. **合约地址错误**：确保使用正确的合约地址（每次重新部署后地址会变化）
3. **账户权限问题**：部分函数受限于特定角色（如 owner），确保使用正确的账户

### 主网问题

1. **Gas 费用过高**：在高网络负载时调整 Gas 价格
2. **交易失败**：检查报错信息，常见原因包括：
   - 权限不足
   - 参数错误
   - 合约状态限制
3. **交易延迟**：网络拥堵时可能需要等待较长时间

## 后续扩展

MetaverseX 系统可进一步扩展，比如：

1. 添加更多 NFT 元数据和属性
2. 实现高级借贷功能（如分期还款、自动清算）
3. 添加交易市场功能
4. 整合 DeFi 特性（如流动性挖矿）

## 结论

按照本指南的流程进行测试，确保所有功能正常工作后再上线到主网。上线后持续监控合约运行情况，及时处理可能出现的问题。 