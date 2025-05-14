#!/bin/bash

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# MetaverseX 合约部署脚本
print_info "AlveyChain MetaverseX 合约部署脚本"
echo "========================================"

# 检查 node 和 npm 是否安装
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    print_error "请先安装 Node.js 和 npm"
    exit 1
fi

# 安装依赖
print_info "检查并安装依赖..."
npm install

# 询问部署网络
echo ""
print_info "请选择部署网络:"
echo "1) 本地开发网络 (localhost)"
echo "2) AlveyChain 主网"
read -p "请输入选择 (1/2): " network_choice

if [ "$network_choice" = "1" ]; then
    NETWORK="localhost"
    
    # 检查是否需要启动本地节点
    print_warning "是否需要启动本地 Hardhat 节点？(y/n)"
    read -p "请输入选择 (y/n): " start_node
    
    if [ "$start_node" = "y" ] || [ "$start_node" = "Y" ]; then
        print_info "启动本地 Hardhat 节点..."
        # 在后台启动节点
        gnome-terminal -- bash -c "npx hardhat node; exec bash" 2>/dev/null || \
        xterm -e "npx hardhat node" 2>/dev/null || \
        open -a Terminal.app "npx hardhat node" 2>/dev/null || \
        npx hardhat node &
        
        # 等待节点启动
        print_info "等待节点启动 (5秒)..."
        sleep 5
    fi
elif [ "$network_choice" = "2" ]; then
    NETWORK="alveychain"
else
    print_error "无效选择，退出脚本"
    exit 1
fi

# 询问是否部署后验证合约
print_info "部署后是否要验证合约? (y/n)"
read -p "请输入选择 (y/n): " verify_choice

# 执行部署
print_info "开始部署 MetaverseX 合约到 $NETWORK 网络..."
npx hardhat run scripts/deploy-metaversex-new.js --network $NETWORK

# 检查部署是否成功
if [ $? -ne 0 ]; then
    print_error "部署失败，请检查错误信息"
    exit 1
fi

print_success "MetaverseX 合约部署成功！"

# 如果用户选择验证合约
if [ "$verify_choice" = "y" ] || [ "$verify_choice" = "Y" ]; then
    if [ "$NETWORK" = "localhost" ]; then
        print_warning "本地网络不支持合约验证"
    else
        print_info "请输入部署的合约地址进行验证"
        
        read -p "支付代币地址: " payment_token
        read -p "MetaverseXNFT 地址: " nft_address
        read -p "NFTLending 地址: " lending_address
        read -p "MetaverseXFactory 地址: " factory_address
        
        print_info "开始验证合约..."
        
        # 验证支付代币
        print_info "验证支付代币..."
        npx hardhat verify --network $NETWORK $payment_token "MetaverseX Token" "MVX"
        
        # 验证 NFT 合约
        print_info "验证 MetaverseXNFT 合约..."
        npx hardhat verify --network $NETWORK $nft_address $payment_token
        
        # 验证 Lending 合约
        print_info "验证 NFTLending 合约..."
        npx hardhat verify --network $NETWORK $lending_address
        
        # 验证 Factory 合约
        print_info "验证 MetaverseXFactory 合约..."
        npx hardhat verify --network $NETWORK $factory_address $payment_token
        
        print_success "合约验证完成"
    fi
fi

echo ""
print_success "MetaverseX 部署流程完成！"
print_info "查看 METAVERSEX-DEPLOY.md 获取更多信息"
echo "========================================" 