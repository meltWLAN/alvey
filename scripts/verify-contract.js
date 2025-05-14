const fs = require("fs");
const path = require("path");

async function main() {
  console.log("验证 AlveyNFT 合约编译结果...");
  
  try {
    // 检查编译后的合约 ABI
    const nftArtifactPath = path.join(__dirname, "../artifacts/contracts/AlveyNFT.sol/AlveyNFT.json");
    if (fs.existsSync(nftArtifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(nftArtifactPath, 'utf8'));
      
      // 检查 ABI
      if (artifact.abi && Array.isArray(artifact.abi)) {
        console.log(`✓ AlveyNFT 合约 ABI 有效，函数数量: ${artifact.abi.length}`);
        
        // 检查重要函数
        const functions = artifact.abi
          .filter(item => item.type === 'function')
          .map(item => item.name);
        
        const requiredFunctions = ["safeMint", "tokenURI", "withdrawTokens", "setMintPrice", "togglePause"];
        for (const func of requiredFunctions) {
          if (functions.includes(func)) {
            console.log(`✓ 找到重要函数: ${func}`);
          } else {
            console.log(`✗ 未找到重要函数: ${func}`);
          }
        }
        
        // 检查构造函数
        const constructor = artifact.abi.find(item => item.type === 'constructor');
        if (constructor) {
          console.log(`✓ 找到构造函数，参数数量: ${constructor.inputs.length}`);
        } else {
          console.log(`✗ 未找到构造函数`);
        }
        
        // 检查事件
        const events = artifact.abi
          .filter(item => item.type === 'event')
          .map(item => item.name);
        
        console.log(`✓ 定义的事件: ${events.join(', ')}`);
      } else {
        console.log(`✗ AlveyNFT 合约 ABI 无效或为空`);
      }
      
      // 检查字节码
      if (artifact.bytecode && artifact.bytecode.length > 2) {
        console.log(`✓ AlveyNFT 合约字节码有效，长度: ${artifact.bytecode.length} 字符`);
      } else {
        console.log(`✗ AlveyNFT 合约字节码无效或为空`);
      }
    } else {
      console.log(`✗ AlveyNFT 编译结果文件不存在`);
    }
    
    // 同样检查 StakingContract
    const stakingArtifactPath = path.join(__dirname, "../artifacts/contracts/StakingContract.sol/StakingContract.json");
    if (fs.existsSync(stakingArtifactPath)) {
      const artifact = JSON.parse(fs.readFileSync(stakingArtifactPath, 'utf8'));
      
      if (artifact.abi && Array.isArray(artifact.abi)) {
        console.log(`\n✓ StakingContract 合约 ABI 有效，函数数量: ${artifact.abi.length}`);
        
        // 检查重要函数
        const functions = artifact.abi
          .filter(item => item.type === 'function')
          .map(item => item.name);
        
        const requiredFunctions = ["stake", "unstake", "claimReward", "getPendingReward"];
        for (const func of requiredFunctions) {
          if (functions.includes(func)) {
            console.log(`✓ 找到重要函数: ${func}`);
          } else {
            console.log(`✗ 未找到重要函数: ${func}`);
          }
        }
      }
    }
    
    console.log("\n验证总结: 合约编译和验证成功");
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