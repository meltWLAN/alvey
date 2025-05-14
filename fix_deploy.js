const fs = require('fs');

// 读取原文件
const filePath = 'scripts/deploy-metaversex-new.js';
let content = fs.readFileSync(filePath, 'utf8');

// 修改MockERC20部署调用，添加decimals参数
content = content.replace(
  `const paymentToken = await MockERC20.deploy("MetaverseX Token", "MVX");`,
  `const paymentToken = await MockERC20.deploy("MetaverseX Token", "MVX", 18); // 添加decimals参数`
);

// 写回文件
fs.writeFileSync(filePath, content);

console.log('部署脚本已修复'); 