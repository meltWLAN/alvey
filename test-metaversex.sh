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

# MetaverseX 合约测试脚本
print_info "AlveyChain MetaverseX 合约测试脚本"
echo "========================================"

# 检查 node 和 npm 是否安装
if ! command -v node &> /dev/null || ! command -v npm &> /dev/null; then
    print_error "请先安装 Node.js 和 npm"
    exit 1
fi

# 询问是否需要启动本地节点
echo ""
print_warning "是否需要启动新的本地 Hardhat 节点？(y/n)"
read -p "请输入选择 (y/n): " start_node

if [ "$start_node" = "y" ] || [ "$start_node" = "Y" ]; then
    print_info "启动新的本地 Hardhat 节点..."
    # 在后台启动节点
    gnome-terminal -- bash -c "npx hardhat node; exec bash" 2>/dev/null || \
    xterm -e "npx hardhat node" 2>/dev/null || \
    open -a Terminal.app "npx hardhat node" 2>/dev/null || \
    npx hardhat node > hardhat_node.log 2>&1 &
    
    # 等待节点启动
    print_info "等待节点启动 (5秒)..."
    sleep 5
    
    # 部署合约
    print_info "部署 MetaverseX 合约..."
    npx hardhat run scripts/deploy-metaversex-new.js --network localhost
    
    # 检查部署是否成功
    if [ $? -ne 0 ]; then
        print_error "部署失败，请检查错误信息"
        exit 1
    fi
fi

# 运行各个测试
print_info "开始运行测试..."

print_info "1. 测试 NFT 铸造功能..."
npx hardhat run scripts/test-nft-mint.js --network localhost
echo ""

print_info "2. 测试 NFT 借贷功能..."
npx hardhat run scripts/test-nft-lending.js --network localhost
echo ""

print_info "3. 测试工厂功能..."
npx hardhat run scripts/test-factory.js --network localhost
echo ""

print_success "MetaverseX 合约测试完成！"
echo "========================================" 