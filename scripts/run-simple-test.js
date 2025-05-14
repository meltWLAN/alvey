const { exec } = require('child_process');

// Execute the Hardhat test command for SimpleTest.test.js
exec('npx hardhat test test/SimpleTest.test.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(stdout);
}); 