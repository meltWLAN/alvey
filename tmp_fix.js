const fs = require('fs');

// 读取原文件
const filePath = 'contracts/AlveyIndex.sol';
let content = fs.readFileSync(filePath, 'utf8');

// 添加缺失的Rebalanced事件触发
content = content.replace(
  'emit WeightUpdated(token, newWeight);',
  'emit WeightUpdated(token, newWeight);\n        emit Rebalanced(token, oldWeight, newWeight);'
);

// 写回文件
fs.writeFileSync(filePath, content);

console.log('AlveyIndex.sol 已修复'); 