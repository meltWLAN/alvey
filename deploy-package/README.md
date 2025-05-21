# MetaverseX 多元宇宙交易平台

MetaverseX是基于AlveyChain的多元宇宙交易平台，支持3D资产NFT交易和VR沉浸式体验。本项目提供完整的前端实现，用于连接已部署到AlveyChain的智能合约。

## 功能特性

- 使用React、Vite构建的现代前端应用
- 支持以太坊钱包连接（MetaMask）
- 基于Web3.js的区块链交互
- 3D资产NFT创建和展示
- 虚拟空间交易和租赁
- WebXR支持的VR沉浸式体验
- 响应式设计适配多种设备

## 安装指南

### 前置条件

- Node.js 16+ 
- npm 7+
- MetaMask浏览器插件

### 安装步骤

1. 克隆项目代码
```bash
git clone <repository-url>
cd metaversex-frontend
```

2. 安装依赖
```bash
npm install
```

3. 安装TailwindCSS相关依赖（如果在第2步中未成功安装）
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

4. 启动开发服务器
```bash
npm run dev
```

5. 构建生产版本
```bash
npm run build
```

## 项目结构

```
src/
├── assets/       # 静态资源和3D模型
├── components/   # 可复用的UI组件
├── contexts/     # React上下文（Web3和VR）
├── contracts/    # 合约ABI和地址
├── pages/        # 主要页面组件
└── utils/        # 工具函数和常量
```

## 合约地址

MetaverseX平台使用以下智能合约（已部署到AlveyChain）：

- 支付代币: `0xF88c032e746E3E701B316C8052bF271DB540871E`
- NFT合约: `0xA3FD15143C6d59b12D8A3ec6aBc4aFbFc9717783`
- 空间合约: `0x1E14dA01C70845AEA03b2AC8D582538Ff48239af`
- 市场合约: `0x1A36D5019fc61cc9628ABabBBed137b2b4BD6f11`

## VR支持

本应用使用WebXR API实现VR功能，需要：

- 支持WebXR的浏览器（如最新版Chrome或Edge）
- 兼容的VR设备（如Oculus Quest、HTC Vive等）

## 技术栈

- React 18
- Vite
- ethers.js
- TailwindCSS
- Three.js / React Three Fiber
- WebXR
