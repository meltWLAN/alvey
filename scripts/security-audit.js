const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 定义安全检查项
const securityChecks = [
  {
    name: "重入攻击",
    description: "检查可能导致重入攻击的函数",
    pattern: /\.call\{value:/g,
    mitigation: "确保使用ReentrancyGuard并遵循检查-效果-交互模式"
  },
  {
    name: "未检查的外部调用返回值",
    description: "检查未检查返回值的外部调用",
    pattern: /\.(call|transfer|send)\(/g,
    mitigation: "总是检查外部调用的返回值"
  },
  {
    name: "未保护的自毁函数",
    description: "检查未受保护的自毁函数",
    pattern: /selfdestruct\(/g,
    mitigation: "使用访问控制保护自毁函数或考虑移除"
  },
  {
    name: "使用tx.origin进行身份验证",
    description: "检查使用tx.origin进行身份验证",
    pattern: /tx\.origin/g,
    mitigation: "使用msg.sender代替tx.origin进行身份验证"
  },
  {
    name: "整数溢出",
    description: "检查可能导致整数溢出的操作",
    pattern: /\+\+|\+=/g,
    mitigation: "使用SafeMath库或Solidity 0.8+内置溢出检查"
  },
  {
    name: "时间依赖",
    description: "检查依赖于区块时间戳的逻辑",
    pattern: /block\.timestamp|now/g,
    mitigation: "注意区块时间戳可能被矿工在一定范围内操纵"
  },
  {
    name: "可疑的Gas限制",
    description: "检查可能导致Gas限制问题的循环",
    pattern: /for\s*\([^\)]+\)/g,
    mitigation: "避免无界循环，考虑分页或Gas优化"
  },
  {
    name: "硬编码的地址",
    description: "检查硬编码的合约地址",
    pattern: /0x[a-fA-F0-9]{40}/g,
    mitigation: "使用可配置的地址并通过构造函数或setter函数设置"
  },
  {
    name: "访问控制缺失",
    description: "检查可能缺少访问控制的敏感函数",
    pattern: /function\s+[^\)]+\)\s*(public|external)(?!\s+view|\s+pure|\s+onlyOwner|\s+only)/g,
    mitigation: "对敏感函数添加适当的访问控制修饰符"
  },
  {
    name: "随机数生成不安全",
    description: "检查不安全的随机数生成",
    pattern: /keccak256\(\s*abi\.encodePacked\(\s*block\./g,
    mitigation: "使用链下预言机(如Chainlink VRF)获取随机数"
  }
];

// 主函数
async function auditContract() {
  console.log("========== AlveyChain NFT系统安全审计 ==========\n");
  
  // 读取NFTLending合约
  const contractPath = path.resolve(__dirname, '../contracts/metaversex/NFTLending.sol');
  try {
    const contractCode = fs.readFileSync(contractPath, 'utf8');
    console.log(`正在审计: ${contractPath}\n`);
    
    // 运行安全检查
    const findings = [];
    
    securityChecks.forEach(check => {
      const matches = (contractCode.match(check.pattern) || []).length;
      if (matches > 0) {
        findings.push({
          ...check,
          occurrences: matches
        });
      }
    });
    
    // 打印发现的问题
    if (findings.length > 0) {
      console.log("发现潜在安全问题:\n");
      findings.forEach((finding, index) => {
        console.log(`${index + 1}. ${finding.name} (${finding.occurrences}处)`);
        console.log(`   描述: ${finding.description}`);
        console.log(`   缓解措施: ${finding.mitigation}\n`);
      });
    } else {
      console.log("未发现常见安全问题。\n");
    }
    
    // 执行Solidity编译器的静态分析
    console.log("执行Solidity编译器静态分析...");
    try {
      const output = execSync('npx hardhat compile --show-stack-traces', { encoding: 'utf8' });
      console.log("编译成功，未发现编译错误。");
    } catch (error) {
      console.log("编译过程中发现问题:");
      console.log(error.stdout);
    }
    
    // 建议进一步安全措施
    console.log("\n建议的安全增强措施:");
    console.log("1. 进行正式的安全审计");
    console.log("2. 添加综合的测试覆盖率");
    console.log("3. 实施紧急暂停机制");
    console.log("4. 考虑使用多重签名钱包进行管理");
    console.log("5. 进行形式化验证");
    
  } catch (error) {
    console.error(`无法读取合约文件: ${contractPath}`);
    console.error(error);
  }
}

// 运行审计
auditContract().catch(console.error); 