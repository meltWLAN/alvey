const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("开始简单验证 AlveyNFT 合约...");
  
  try {
    // 检查合约文件
    const contractPath = path.join(__dirname, "../contracts/AlveyNFT.sol");
    if (fs.existsSync(contractPath)) {
      const stats = fs.statSync(contractPath);
      console.log(`✓ 合约文件存在，大小: ${stats.size} 字节`);
      
      // 读取合约内容
      const content = fs.readFileSync(contractPath, 'utf8');
      
      // 验证合约基本结构
      const results = {
        imports: content.includes('@openzeppelin/contracts'),
        name: content.includes('contract AlveyNFT'),
        functions: {
          safeMint: content.includes('function safeMint'),
          tokenURI: content.includes('function tokenURI'),
          withdrawTokens: content.includes('function withdrawTokens'),
          setMintPrice: content.includes('function setMintPrice'),
        }
      };
      
      console.log("✓ ERC721 导入:", results.imports);
      console.log("✓ AlveyNFT 合约名称:", results.name);
      
      for (const [func, exists] of Object.entries(results.functions)) {
        console.log(`${exists ? '✓' : '✗'} 函数 ${func} ${exists ? '存在' : '不存在'}`);
      }
      
    } else {
      console.log("✗ 合约文件不存在");
    }
    
    // 检查编译
    await hre.run("compile");
    console.log("✓ 合约可以编译");
    
    console.log("\n验证总结: AlveyNFT 合约基本验证完成");
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