const { exec } = require('child_process');

// 定义要运行的测试文件
const testFiles = [
  'test/SimpleTest.test.js',
  'test/NFTOnly.test.js',
  'test/SimpleNFT.test.js',
  'test/StakingContract.test.js',
  'test/AlveyNFT.security.basic.test.js',
  'test/StakingContract.security.basic.test.js'
];

// 依次运行测试
async function runTests() {
  for (const testFile of testFiles) {
    console.log(`\n=== 运行测试: ${testFile} ===\n`);
    
    await new Promise((resolve, reject) => {
      exec(`npx hardhat test ${testFile}`, (error, stdout, stderr) => {
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
        resolve();
      });
    });
  }
}

// 执行测试
runTests().then(() => {
  console.log('\n=== 所有测试完成 ===\n');
}); 