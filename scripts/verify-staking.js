const fs = require("fs");
const path = require("path");

async function main() {
  console.log("开始验证 StakingContract 合约...");
  
  try {
    // 检查合约文件
    const contractPath = path.join(__dirname, "../contracts/StakingContract.sol");
    if (fs.existsSync(contractPath)) {
      const stats = fs.statSync(contractPath);
      console.log(`✓ 合约文件存在，大小: ${stats.size} 字节`);
      
      // 读取合约内容
      const content = fs.readFileSync(contractPath, 'utf8');
      
      // 验证合约基本结构
      const results = {
        imports: {
          nft: content.includes('@openzeppelin/contracts/token/ERC721/IERC721.sol'),
          token: content.includes('@openzeppelin/contracts/token/ERC20/IERC20.sol'),
          reentrancy: content.includes('@openzeppelin/contracts/security/ReentrancyGuard.sol'),
          ownable: content.includes('@openzeppelin/contracts/access/Ownable.sol')
        },
        contract: content.includes('contract StakingContract is ReentrancyGuard, Ownable'),
        functions: {
          stake: content.includes('function stake'),
          unstake: content.includes('function unstake'),
          getReward: content.includes('function _getReward'),
          claimReward: content.includes('function claimReward')
        },
        struct: content.includes('struct StakeInfo')
      };
      
      for (const [type, exists] of Object.entries(results.imports)) {
        console.log(`${exists ? '✓' : '✗'} 导入 ${type} ${exists ? '存在' : '不存在'}`);
      }
      
      console.log(`${results.contract ? '✓' : '✗'} StakingContract 声明 ${results.contract ? '正确' : '不正确'}`);
      console.log(`${results.struct ? '✓' : '✗'} StakeInfo 结构体 ${results.struct ? '存在' : '不存在'}`);
      
      for (const [func, exists] of Object.entries(results.functions)) {
        console.log(`${exists ? '✓' : '✗'} 函数 ${func} ${exists ? '存在' : '不存在'}`);
      }
      
    } else {
      console.log("✗ 合约文件不存在");
    }
    
    console.log("\n验证总结: StakingContract 合约验证完成");
    
    // 检查缺少的依赖
    const nodeModulesPath = path.join(__dirname, "../node_modules/@openzeppelin/contracts/security");
    const hasSecurityFolder = fs.existsSync(nodeModulesPath);
    console.log(`${hasSecurityFolder ? '✓' : '✗'} OpenZeppelin security 文件夹 ${hasSecurityFolder ? '存在' : '不存在'}`);
    
    if (!hasSecurityFolder) {
      console.log("\n缺少 ReentrancyGuard 依赖，需要安装正确版本的 OpenZeppelin 合约");
      console.log("尝试: npm install @openzeppelin/contracts@4.8.0");
    }
  } catch (error) {
    console.error("验证过程中发生错误:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 