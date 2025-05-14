const hre = require("hardhat");

async function main() {
  console.log("开始验证 AlveyNFT 合约...");
  
  try {
    // 编译合约
    await hre.run("compile");
    console.log("✓ 合约编译成功");
    
    // 获取合约工厂
    const AlveyNFT = await hre.ethers.getContractFactory("AlveyNFT");
    console.log("✓ 成功获取合约工厂");
    
    // 检查合约字节码
    const bytecode = AlveyNFT.bytecode;
    if (bytecode && bytecode.length > 2) { // 2 表示 "0x"
      console.log("✓ 合约字节码有效，长度:", bytecode.length);
    } else {
      console.log("✗ 合约字节码无效或为空");
    }
    
    // 检查合约 ABI
    const abi = AlveyNFT.interface.format();
    if (abi && abi.length > 0) {
      console.log("✓ 合约 ABI 有效，函数数量:", abi.length);
      
      // 检查关键函数是否存在
      const functions = abi.map(item => typeof item === 'string' ? item : item.name).filter(Boolean);
      const requiredFunctions = ["safeMint", "tokenURI", "withdrawTokens", "setMintPrice"];
      
      for (const func of requiredFunctions) {
        if (functions.includes(func)) {
          console.log(`✓ 找到关键函数: ${func}`);
        } else {
          console.log(`✗ 未找到关键函数: ${func}`);
        }
      }
    } else {
      console.log("✗ 合约 ABI 无效或为空");
    }
    
    console.log("\n验证总结: AlveyNFT 合约验证完成");
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