# AlveyChain NFT 平台

AlveyChain NFT是一个基于AlveyChain的多功能NFT平台，提供一站式NFT解决方案，包括动态NFT、NFT借贷、元宇宙空间等功能。

## 项目核心功能

### 1. 动态NFT
- 支持NFT随时间和事件演变
- 基于等级、经验值和属性的NFT进化系统
- 可自定义进化路径和属性

### 2. NFT借贷平台
- 允许用户抵押NFT获取代币贷款
- 动态利率和贷款条件，基于NFT评级
- 再融资、清算和紧急安全功能
- 用户借贷历史记录和信用评级

### 3. 元宇宙空间集成
- 支持3D资产和VR内容
- 元宇宙空间管理
- 资产互操作性

## 技术架构

项目使用以下技术栈：

- Solidity智能合约
- Hardhat开发环境
- OpenZeppelin合约库
- ERC721和ERC721Enumerable标准

## 开发和部署指南

### 开发环境设置

1. 安装依赖项：
```bash
npm install
```

2. 编译合约：
```bash
npx hardhat compile
```

3. 运行测试：
```bash
npx hardhat test
```

### 部署合约

#### 动态NFT系统
```bash
npx hardhat run scripts/deploy-dynamic-nft.js --network <网络名称>
```

#### NFT借贷平台
```bash
npx hardhat run scripts/deploy-nft-lending.js --network <网络名称>
```

## 已实现的功能

1. 动态NFT系统
   - NFT进化机制
   - 经验值系统
   - 属性系统
   - 随机性和多样化

2. NFT借贷平台
   - NFT评级和风险评估
   - 动态利率
   - 再融资功能
   - 紧急安全系统

## 路线图

### 第一阶段：基础设施增强
- ✅ 优化现有合约
- ✅ 升级NFT市场UI
- ✅ 实现基础动态NFT功能
- ⬜ 开发基本元宇宙空间系统

### 第二阶段：产品扩展
- ✅ 推出增强版NFT借贷
- ⬜ 实现NFT碎片化交易
- ⬜ 推出创作者经济系统
- ⬜ 发布基础GameFi功能

### 第三阶段：互操作性和创新
- ⬜ 实现跨元宇宙互操作
- ⬜ 完善社交功能
- ⬜ 推出高级动态NFT系统
- ⬜ 开发NFT衍生品市场

## 贡献指南

欢迎对本项目进行贡献！请参阅我们的贡献指南了解如何参与项目开发。

## 许可证

本项目采用MIT许可证。有关详细信息，请参阅LICENSE文件。

## 安全信息

This project has undergone a thorough security review with numerous improvements:

- Environment variable configuration for sensitive data
- Protection against reentrancy attacks
- Input validation and sanitization
- Reward caps to prevent economic attacks
- Pausable functionality for emergency situations
- Token recovery mechanisms

See [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) for the full security audit and [SECURITY_FIXES.md](./SECURITY_FIXES.md) for the implemented fixes.
