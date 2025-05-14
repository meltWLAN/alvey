# MetaverseX 系列合约部署指南

这个指南将帮助您部署 MetaverseX 系列合约，包括 MetaverseXNFT、NFTLending 和 MetaverseXFactory。

## 前提条件

1. 确保您的环境中已安装 Node.js (v14 或更高版本)
2. 确保已安装所有依赖：`npm install`
3. 在 `.env` 文件中配置了正确的私钥和网络信息（如果需要部署到特定网络）

## 部署步骤

### 本地开发网络部署

1. 在一个终端窗口中启动本地区块链：

```bash
npx hardhat node
```

2. 在另一个终端窗口中执行部署脚本：

```bash
npx hardhat run scripts/deploy-metaversex-new.js --network localhost
```

### 部署到 AlveyChain 网络

```bash
npx hardhat run scripts/deploy-metaversex-new.js --network alveychain
```

## 部署过程

部署脚本会执行以下操作：

1. 部署 MockERC20 作为支付代币
2. 部署 MetaverseXNFT 合约
3. 部署 NFTLending 合约
4. 部署 MetaverseXFactory 合约
5. 为 NFTLending 添加支持的抵押代币
6. 铸造示例 NFT
7. 通过工厂创建一个新的 NFT 集合

## 部署后的操作

部署完成后，您将看到所有合约的地址列表。请记录这些地址以供前端应用程序使用。

你还可以进行以下操作：

1. 使用 `MetaverseXFactory` 创建更多 NFT 集合
2. 使用 `MetaverseXNFT` 铸造更多 NFT 资产
3. 使用 `NFTLending` 设置贷款参数和支持的代币

## 验证合约（可选）

如果您想要在区块链浏览器上验证合约代码，可以使用以下命令：

```bash
npx hardhat verify --network alveychain <合约地址> [构造函数参数，如果有的话]
```

例如，验证 MetaverseXNFT 合约：

```bash
npx hardhat verify --network alveychain <MetaverseXNFT地址> <支付代币地址>
```

## 故障排除

如果您在部署过程中遇到问题，请检查：

1. 部署账户是否有足够的原生代币（用于支付Gas费用）
2. 合约导入路径是否正确
3. 构造函数参数是否正确
4. 网络连接是否稳定 