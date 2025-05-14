#!/bin/bash

# 修复所有测试文件中的ethers导入
for file in $(grep -l "ethers" test/*.js | grep -v hardhat-ethers-helpers.js); do
  # 只替换导入行
  sed -i '' 's/const { ethers } = require("hardhat");/const { ethers } = require(".\/hardhat-ethers-helpers");/' "$file"
  
  # 如果文件包含解构导入
  sed -i '' 's/const { loadFixture, ethers } = require("hardhat");/const { loadFixture } = require("hardhat");\nconst { ethers } = require(".\/hardhat-ethers-helpers");/' "$file"
  
  # 处理不同格式的导入
  sed -i '' 's/const ethers = require("hardhat").ethers;/const { ethers } = require(".\/hardhat-ethers-helpers");/' "$file"
done

echo "修复完成！" 