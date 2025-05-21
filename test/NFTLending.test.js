import { expect } from "chai";
import pkg from 'hardhat';
const { ethers } = pkg;

describe("NFTLending Contract", function() {
  let nftLending;
  let nft;
  let token;
  let owner;
  let borrower;
  let lender;
  let tokenId;
  const tokenURI = "https://example.com/token/1";
  const loanAmount = ethers.parseUnits("100", 18); // 100 tokens
  const loanDuration = 7 * 24 * 60 * 60; // 7 days in seconds

  beforeEach(async function() {
    // Get signers
    [owner, borrower, lender] = await ethers.getSigners();
    
    // Deploy mock ERC20 token
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    token = await MockERC20.deploy("MARIO Token", "MARIO");
    await token.waitForDeployment();
    
    // Mint some tokens to lender
    await token.mint(lender.address, ethers.parseUnits("1000", 18));
    
    // Deploy NFT contract
    const NFT = await ethers.getContractFactory("AlveyNFT");
    nft = await NFT.deploy(await token.getAddress());
    await nft.waitForDeployment();
    
    // Mint NFT to borrower
    await token.mint(borrower.address, ethers.parseUnits("10", 18)); // Mint some tokens for the mint fee
    await token.connect(borrower).approve(await nft.getAddress(), await nft.mintPrice());
    await nft.connect(borrower).safeMint(borrower.address, tokenURI);
    tokenId = 0; // First NFT has ID 0
    
    // Deploy NFTLending contract
    const NFTLending = await ethers.getContractFactory("NFTLending");
    nftLending = await NFTLending.deploy();
    await nftLending.waitForDeployment();
  });
  
  describe("Loan Creation", function() {
    it("Should allow users to deposit NFTs as collateral", async function() {
      // Approve NFTLending contract to transfer NFT
      await nft.connect(borrower).approve(await nftLending.getAddress(), tokenId);
      
      // Create loan
      await nftLending.connect(borrower).createLoan(
        await nft.getAddress(),
        tokenId,
        loanAmount,
        loanDuration,
        await token.getAddress()
      );
      
      // Check loan was created
      const loan = await nftLending.getLoan(0); // First loan has ID 0
      expect(loan.nftContract).to.equal(await nft.getAddress());
      expect(loan.tokenId).to.equal(tokenId);
      expect(loan.amount).to.equal(loanAmount);
      expect(loan.duration).to.equal(loanDuration);
      expect(loan.paymentToken).to.equal(await token.getAddress());
      expect(loan.borrower).to.equal(borrower.address);
    });
    
    it("Should not allow creating loan with an NFT that is not owned", async function() {
      await expect(
        nftLending.connect(lender).createLoan(
          await nft.getAddress(),
          tokenId,
          loanAmount,
          loanDuration,
          await token.getAddress()
        )
      ).to.be.reverted;
    });
  });
  
  describe("Loan Funding", function() {
    let loanId;
    
    beforeEach(async function() {
      // Create a loan for testing funding
      await nft.connect(borrower).approve(await nftLending.getAddress(), tokenId);
      await nftLending.connect(borrower).createLoan(
        await nft.getAddress(),
        tokenId,
        loanAmount,
        loanDuration,
        await token.getAddress()
      );
      loanId = 0; // First loan
    });
    
    it("Should allow lenders to fund loans", async function() {
      // Approve and fund loan
      await token.connect(lender).approve(await nftLending.getAddress(), loanAmount);
      await nftLending.connect(lender).fundLoan(loanId);
      
      // Check loan status
      const loan = await nftLending.getLoan(loanId);
      expect(loan.lender).to.equal(lender.address);
      expect(loan.status).to.equal(1); // LoanStatus.Active
      
      // Check if borrower received funds
      const borrowerBalance = await token.balanceOf(borrower.address);
      expect(borrowerBalance).to.be.gte(loanAmount);
    });
    
    it("Should not allow funding loans that are already funded", async function() {
      // Fund the loan
      await token.connect(lender).approve(await nftLending.getAddress(), loanAmount);
      await nftLending.connect(lender).fundLoan(loanId);
      
      // Try to fund again
      await token.connect(lender).approve(await nftLending.getAddress(), loanAmount);
      await expect(
        nftLending.connect(lender).fundLoan(loanId)
      ).to.be.revertedWith("Loan is not available for funding");
    });
  });
  
  describe("Loan Repayment", function() {
    let loanId;
    
    beforeEach(async function() {
      // Create and fund a loan
      await nft.connect(borrower).approve(await nftLending.getAddress(), tokenId);
      await nftLending.connect(borrower).createLoan(
        await nft.getAddress(),
        tokenId,
        loanAmount,
        loanDuration,
        await token.getAddress()
      );
      loanId = 0;
      
      await token.connect(lender).approve(await nftLending.getAddress(), loanAmount);
      await nftLending.connect(lender).fundLoan(loanId);
      
      // Mint tokens to borrower for repayment
      await token.mint(borrower.address, loanAmount);
    });
    
    it("Should allow borrowers to repay loans and get NFTs back", async function() {
      // Approve and repay loan
      await token.connect(borrower).approve(await nftLending.getAddress(), loanAmount);
      await nftLending.connect(borrower).repayLoan(loanId);
      
      // Check loan status
      const loan = await nftLending.getLoan(loanId);
      expect(loan.status).to.equal(2); // LoanStatus.Repaid
      
      // Check NFT was returned to borrower
      expect(await nft.ownerOf(tokenId)).to.equal(borrower.address);
      
      // Check lender received funds
      const lenderBalance = await token.balanceOf(lender.address);
      expect(lenderBalance).to.be.gte(loanAmount);
    });
    
    it("Should not allow non-borrowers to repay loans", async function() {
      await token.mint(lender.address, loanAmount);
      await token.connect(lender).approve(await nftLending.getAddress(), loanAmount);
      
      await expect(
        nftLending.connect(lender).repayLoan(loanId)
      ).to.be.revertedWith("Only the borrower can repay the loan");
    });
  });
  
  describe("Loan Liquidation", function() {
    let loanId;
    
    beforeEach(async function() {
      // Create and fund a loan with very short duration
      await nft.connect(borrower).approve(await nftLending.getAddress(), tokenId);
      await nftLending.connect(borrower).createLoan(
        await nft.getAddress(),
        tokenId,
        loanAmount,
        60, // 1 minute duration
        await token.getAddress()
      );
      loanId = 0;
      
      await token.connect(lender).approve(await nftLending.getAddress(), loanAmount);
      await nftLending.connect(lender).fundLoan(loanId);
    });
    
    it("Should allow lenders to liquidate defaulted loans", async function() {
      // Advance time by more than the loan duration
      await ethers.provider.send("evm_increaseTime", [120]); // 2 minutes
      await ethers.provider.send("evm_mine");
      
      // Liquidate loan
      await nftLending.connect(lender).liquidateLoan(loanId);
      
      // Check loan status
      const loan = await nftLending.getLoan(loanId);
      expect(loan.status).to.equal(3); // LoanStatus.Liquidated
      
      // Check NFT was transferred to lender
      expect(await nft.ownerOf(tokenId)).to.equal(lender.address);
    });
    
    it("Should not allow liquidating loans that are not defaulted", async function() {
      await expect(
        nftLending.connect(lender).liquidateLoan(loanId)
      ).to.be.revertedWith("Loan is not eligible for liquidation");
    });
  });
});