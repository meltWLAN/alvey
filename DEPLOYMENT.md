# AlveyNFT 部署指南

本指南详细介绍了如何将 AlveyNFT 项目部署到 AlveyChain 并使其全球可用。

## 1. 准备部署环境

### 设置环境变量

复制 `.env.example` 文件并重命名为 `.env`，然后填入以下信息：

```bash
# 用于部署的私钥（不带0x前缀）
PRIVATE_KEY=your_private_key_here_without_0x_prefix

# Alvey Chain RPC URL (可选，如果你想使用自定义RPC)
ALVEY_RPC_URL=https://elves-core1.alvey.io/

# 生产环境标志
NODE_ENV=production
```

请确保您的部署钱包中有足够的 ALV 代币用于支付部署费用。

### 安装依赖

```bash
npm install
```

## 2. 部署智能合约

### 部署到测试网

在部署到主网之前，建议先在测试网上测试：

```bash
npx hardhat run scripts/deploy-alveychain.js --network alveychain-testnet
```

### 部署到主网

确认测试网部署无误后，部署到主网：

```bash
npx hardhat run scripts/deploy-alveychain.js --network alveychain
```

部署脚本将输出合约地址，请记录这些地址以便后续使用。

### 验证合约

部署后，使用以下命令验证合约，以便在区块浏览器上显示合约代码：

```bash
npx hardhat verify --network alveychain <NFT_CONTRACT_ADDRESS> <PAYMENT_TOKEN_ADDRESS>
npx hardhat verify --network alveychain <STAKING_CONTRACT_ADDRESS> <NFT_CONTRACT_ADDRESS> <PAYMENT_TOKEN_ADDRESS>
```

## 3. 前端部署

### 配置前端

1. 进入前端目录：
   ```bash
   cd frontend
   ```

2. 更新合约地址：
   在 `src/config.js` 中填入部署的合约地址。

3. 安装依赖并构建：
   ```bash
   npm install
   npm run build
   ```

### 选择一个托管服务

您可以选择以下任一服务托管前端：

1. **Vercel**：
   - 注册 [Vercel](https://vercel.com)
   - 连接您的 GitHub 仓库
   - 导入项目并部署

2. **Netlify**：
   - 注册 [Netlify](https://netlify.com)
   - 连接您的 GitHub 仓库或直接上传构建文件夹
   - 配置域名

3. **AWS Amplify**：
   - 配置 AWS 账户
   - 使用 Amplify 托管服务
   - 连接代码仓库并部署

4. **传统虚拟主机**：
   - 将构建文件夹上传到您的虚拟主机

## 4. 域名与SSL配置

1. 购买域名（GoDaddy、Namecheap、Google Domains等）
2. 将域名指向您的托管服务
3. 配置 SSL 证书（大多数现代托管服务会自动处理）

## 5. 推广与用户获取

### 市场推广

1. 创建社交媒体账户：Twitter、Discord、Telegram
2. 在 NFT 市场平台上列出您的系列（如果适用）
3. 联系加密媒体进行报道
4. 考虑与有影响力的人合作进行推广

### 社区建设

1. 设立透明的路线图
2. 定期更新进度
3. 举办抽奖或空投活动
4. 与其他项目合作

## 6. 持续运营与维护

1. 监控合约活动
2. 定期更新前端
3. 收集用户反馈并迭代改进
4. 增加新功能

## 7. 法律合规性

确保您的项目符合相关司法管辖区的法律法规：

1. 考虑获取法律咨询
2. 制定明确的服务条款和隐私政策
3. 考虑地域限制（如有必要）

---

完成以上步骤后，您的 AlveyNFT 项目将可以全球访问，让世界各地的用户都能参与其中。 