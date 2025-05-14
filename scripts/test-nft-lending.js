const hre = require("hardhat");

async function main() {
  console.log("测试 NFTLending 借贷功能...");

  try {
    // 合约地址配置 - 使用实际部署的地址
    // 注意：每次重新部署时这些地址会变化，需要从部署输出获取
    const paymentTokenAddress = "0x36C02dA8a0983159322a80FFE9F24b1acfF8B570";
    const nftAddress = "0x4c5859f0F772848b2D91F1D83E2Fe57935348029";
    const lendingAddress = "0x1291Be112d480055DaFd8a610b7d1e203891C274";
    
    // 获取账户
    const [deployer, lender, borrower] = await hre.ethers.getSigners();
    console.log(`部署者地址: ${deployer.address}`);
    console.log(`出借人地址: ${lender.address}`);
    console.log(`借款人地址: ${borrower.address}`);
    
    // 获取合约实例
    const paymentToken = await hre.ethers.getContractAt("contracts/MockERC20.sol:MockERC20", paymentTokenAddress);
    const nft = await hre.ethers.getContractAt("MetaverseXNFT", nftAddress);
    const lending = await hre.ethers.getContractAt("NFTLending", lendingAddress);
    
    // 为测试账户铸造代币
    console.log("为测试账户铸造代币...");
    const mintAmount = hre.ethers.parseUnits("10000", 18);
    await paymentToken.mint(lender.address, mintAmount);
    await paymentToken.mint(borrower.address, mintAmount);
    console.log(`为出借人铸造了 ${hre.ethers.formatUnits(mintAmount, 18)} MVX 代币`);
    console.log(`为借款人铸造了 ${hre.ethers.formatUnits(mintAmount, 18)} MVX 代币`);
    
    // 出借人铸造NFT
    console.log("\n出借人铸造NFT...");
    await paymentToken.connect(lender).approve(nftAddress, hre.ethers.parseUnits("1000", 18));
    const mintTx = await nft.connect(lender).mintAsset(
      "https://metaversex.example/nfts/lending-test.json",
      "land",
      5 // 最高稀有度
    );
    const receipt = await mintTx.wait();
    
    // 获取新铸造的NFT ID
    const totalSupply = await nft.totalSupply();
    const tokenId = totalSupply;
    console.log(`出借人铸造的NFT ID: ${tokenId}`);
    
    // 确认NFT所有权
    const owner = await nft.ownerOf(tokenId);
    console.log(`NFT #${tokenId} 所有者: ${owner}`);
    console.log(`与出借人地址匹配: ${owner === lender.address}`);
    
    // 出借人授权借贷合约操作NFT
    console.log("\n出借人授权借贷合约操作NFT...");
    await nft.connect(lender).approve(lendingAddress, tokenId);
    
    // 创建贷款
    console.log("\n创建贷款...");
    const loanAmount = hre.ethers.parseUnits("100", 18); // 100 MVX
    const feePercent = 50; // 5% 利息 (基于1000)
    const duration = 60 * 60 * 24 * 7; // 7天
    
    const createLoanTx = await lending.connect(lender).createLoan(
      nftAddress,
      tokenId,
      paymentTokenAddress,
      loanAmount,
      feePercent,
      duration
    );
    await createLoanTx.wait();
    
    // 获取贷款ID
    const loanId = 1; // 假设这是第一笔贷款
    console.log(`贷款已创建，ID: ${loanId}`);
    
    // 获取贷款详情
    console.log("\n贷款详情:");
    const loanDetails = await lending.getLoanDetails(loanId);
    console.log(`- 出借人: ${loanDetails[0]}`);
    console.log(`- 借款人: ${loanDetails[1]}`);
    console.log(`- NFT合约: ${loanDetails[2]}`);
    console.log(`- NFT ID: ${loanDetails[3]}`);
    console.log(`- 抵押代币: ${loanDetails[4]}`);
    console.log(`- 贷款金额: ${hre.ethers.formatUnits(loanDetails[5], 18)} MVX`);
    console.log(`- 费率: ${Number(loanDetails[6]) / 10}%`);
    console.log(`- 期限: ${Number(loanDetails[7]) / (60 * 60 * 24)} 天`);
    console.log(`- 状态: ${loanDetails[9]}`); // 0=Created, 1=Active, 2=Repaid, 3=Liquidated, 4=Cancelled
    
    // 借款人接受贷款
    console.log("\n借款人接受贷款...");
    // 先授权借贷合约使用代币，使用一个足够大的数额确保覆盖抵押品金额
    await paymentToken.connect(borrower).approve(
      lendingAddress, 
      hre.ethers.parseUnits("200", 18) // 200 MVX, 远超所需
    );
    
    // 接受贷款
    const acceptLoanTx = await lending.connect(borrower).acceptLoan(loanId);
    await acceptLoanTx.wait();
    
    // 再次查看贷款详情
    console.log("\n贷款被接受后的详情:");
    const updatedLoanDetails = await lending.getLoanDetails(loanId);
    console.log(`- 借款人: ${updatedLoanDetails[1]}`);
    console.log(`- 开始时间: ${new Date(Number(updatedLoanDetails[8]) * 1000).toLocaleString()}`);
    console.log(`- 状态: ${updatedLoanDetails[9]}`); // 应为1 (Active)
    
    // 确认NFT所有权已转移
    const newOwner = await nft.ownerOf(tokenId);
    console.log(`\nNFT #${tokenId} 当前所有者: ${newOwner}`);
    console.log(`与借款人地址匹配: ${newOwner === borrower.address}`);
    
    // 借款人偿还贷款
    console.log("\n借款人准备偿还贷款...");
    // 首先授权NFT回转
    await nft.connect(borrower).approve(lendingAddress, tokenId);
    
    // 偿还贷款
    const repayLoanTx = await lending.connect(borrower).repayLoan(loanId);
    await repayLoanTx.wait();
    
    // 最终查看贷款详情
    console.log("\n贷款偿还后的详情:");
    const finalLoanDetails = await lending.getLoanDetails(loanId);
    console.log(`- 状态: ${finalLoanDetails[9]}`); // 应为2 (Repaid)
    
    // 确认NFT所有权已转回
    const finalOwner = await nft.ownerOf(tokenId);
    console.log(`\nNFT #${tokenId} 最终所有者: ${finalOwner}`);
    console.log(`与出借人地址匹配: ${finalOwner === lender.address}`);
    
    console.log("\nNFTLending 借贷功能测试完成!");
  } catch (error) {
    console.error("测试过程中发生错误:", error);
    console.error(error.stack);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 