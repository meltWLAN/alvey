import { expect } from "chai";
import { ethers } from "hardhat";

describe("NFTLending Contract Tests", function () {
  let NFTLending;
  let nftLending;
  let MockERC20;
  let mockToken;
  let AlveyNFT;
  let alveyNFT;
  let owner;
  let user1;
  let user2;
  let addrs;

  // NFT相关数据
  const tokenId = 1;
  const nftValue = ethers.parseEther("10"); // 10 ETH
  const S_RATING = 0;
  const A_RATING = 1;
  const B_RATING = 2;
  const C_RATING = 3;
  const D_RATING = 4;

  // 贷款相关数据
  const loanAmount = ethers.parseEther("5"); // 5 tokens
  const loanDuration = 30 * 24 * 60 * 60; // 30 days

  beforeEach(async function () {
    // 获取合约工厂
    NFTLending = await ethers.getContractFactory("NFTLending");
    MockERC20 = await ethers.getContractFactory("MockERC20");
    AlveyNFT = await ethers.getContractFactory("AlveyNFT");

    // 获取测试账户
    [owner, user1, user2, ...addrs] = await ethers.getSigners();

    // 部署合约
    mockToken = await MockERC20.deploy("Mock Token", "MTK", 18);
    alveyNFT = await AlveyNFT.deploy("AlveyNFT", "ANFT");
    nftLending = await NFTLending.deploy();

    // 初始化配置
    await nftLending.setSupportedNFTContract(alveyNFT.address, true);
    await nftLending.setSupportedPaymentToken(mockToken.address, true, 18);

    // 为NFT设置估值和评级
    await nftLending.setNFTValuation(alveyNFT.address, tokenId, nftValue, A_RATING);

    // 为用户铸造NFT
    await alveyNFT.mint(user1.address, tokenId);

    // 为合约转入代币
    await mockToken.mint(nftLending.address, ethers.parseEther("100"));

    // 为用户转入代币用于后续还款
    await mockToken.mint(user1.address, ethers.parseEther("20"));
    await mockToken.mint(user2.address, ethers.parseEther("20"));

    // 用户批准合约操作NFT和代币
    await alveyNFT.connect(user1).approve(nftLending.address, tokenId);
    await mockToken.connect(user1).approve(nftLending.address, ethers.parseEther("100"));
    await mockToken.connect(user2).approve(nftLending.address, ethers.parseEther("100"));
  });

  describe("基础功能测试", function () {
    it("应该正确设置NFT估值和评级", async function () {
      const [value, rating] = await nftLending.getNFTValuationAndRating(alveyNFT.address, tokenId);
      expect(value).to.equal(nftValue);
      expect(rating).to.equal(A_RATING);
    });

    it("应该允许批量设置NFT估值", async function () {
      const tokenIds = [2, 3, 4];
      const values = [
        ethers.parseEther("5"),
        ethers.parseEther("15"),
        ethers.parseEther("20")
      ];
      const ratings = [S_RATING, B_RATING, C_RATING];

      await nftLending.batchSetNFTValuations(alveyNFT.address, tokenIds, values, ratings);

      // 验证第一个NFT
      const [value2, rating2] = await nftLending.getNFTValuationAndRating(alveyNFT.address, tokenIds[0]);
      expect(value2).to.equal(values[0]);
      expect(rating2).to.equal(ratings[0]);

      // 验证最后一个NFT
      const [value4, rating4] = await nftLending.getNFTValuationAndRating(alveyNFT.address, tokenIds[2]);
      expect(value4).to.equal(values[2]);
      expect(rating4).to.equal(ratings[2]);
    });

    it("应该正确设置和获取集合底价", async function () {
      const floorPrice = ethers.parseEther("8");
      await nftLending.setCollectionFloorPrice(alveyNFT.address, floorPrice);
      
      // 无法直接访问映射，所以通过事件验证
      const filter = nftLending.filters.CollectionFloorPriceUpdated(alveyNFT.address);
      const events = await nftLending.queryFilter(filter);
      
      expect(events[0].args.floorPrice).to.equal(floorPrice);
    });
  });

  describe("贷款创建测试", function () {
    it("用户应该能创建贷款", async function () {
      await expect(
        nftLending.connect(user1).createLoan(
          alveyNFT.address,
          tokenId,
          loanAmount,
          loanDuration,
          mockToken.address
        )
      ).to.emit(nftLending, "LoanCreated")
       .withArgs(1, user1.address, loanAmount, A_RATING);

      // 验证NFT已转入合约
      expect(await alveyNFT.ownerOf(tokenId)).to.equal(nftLending.address);

      // 验证贷款信息
      const loan = await nftLending.getLoan(1);
      expect(loan.borrower).to.equal(user1.address);
      expect(loan.nftContract).to.equal(alveyNFT.address);
      expect(loan.tokenId).to.equal(tokenId);
      expect(loan.loanAmount).to.equal(loanAmount);
      expect(loan.status).to.equal(0); // ACTIVE
      expect(loan.rating).to.equal(A_RATING);
    });

    it("高评级NFT应该能获得更高贷款额度", async function () {
      // 设置一个S评级的NFT
      const tokenId2 = 2;
      await alveyNFT.mint(user1.address, tokenId2);
      await alveyNFT.connect(user1).approve(nftLending.address, tokenId2);
      
      await nftLending.setNFTValuation(alveyNFT.address, tokenId2, nftValue, S_RATING);
      
      // S评级的LTV应该比A评级高10%
      const higherLoanAmount = ethers.parseEther("5.5"); // loanAmount + 10%
      
      await expect(
        nftLending.connect(user1).createLoan(
          alveyNFT.address,
          tokenId2,
          higherLoanAmount,
          loanDuration,
          mockToken.address
        )
      ).to.emit(nftLending, "LoanCreated");
    });

    it("低评级NFT应该有更低的贷款额度", async function () {
      // 设置一个D评级的NFT
      const tokenId3 = 3;
      await alveyNFT.mint(user1.address, tokenId3);
      await alveyNFT.connect(user1).approve(nftLending.address, tokenId3);
      
      await nftLending.setNFTValuation(alveyNFT.address, tokenId3, nftValue, D_RATING);
      
      // D评级的LTV应该比基础低10%
      const lowerLoanAmount = loanAmount;
      const tooHighLoanAmount = ethers.parseEther("4.75"); // 95% of loan amount
      
      // 尝试借款过高金额应该失败
      await expect(
        nftLending.connect(user1).createLoan(
          alveyNFT.address,
          tokenId3,
          tooHighLoanAmount,
          loanDuration,
          mockToken.address
        )
      ).to.be.revertedWith("Loan amount exceeds maximum");
      
      // 适当金额应该成功
      await expect(
        nftLending.connect(user1).createLoan(
          alveyNFT.address,
          tokenId3,
          ethers.parseEther("4"), // 80% of loanAmount
          loanDuration,
          mockToken.address
        )
      ).to.emit(nftLending, "LoanCreated");
    });
  });
  
  describe("贷款偿还测试", function () {
    let loanId;

    beforeEach(async function () {
      // 创建一个贷款
      const tx = await nftLending.connect(user1).createLoan(
        alveyNFT.address,
        tokenId,
        loanAmount,
        loanDuration,
        mockToken.address
      );
      const receipt = await tx.wait();
      loanId = 1; // 第一个贷款ID为1
    });

    it("借款人应该能够偿还贷款", async function () {
      // 偿还贷款
      await expect(
        nftLending.connect(user1).repayLoan(loanId)
      ).to.emit(nftLending, "LoanRepaid");

      // 验证NFT已返还
      expect(await alveyNFT.ownerOf(tokenId)).to.equal(user1.address);

      // 验证贷款状态
      const loan = await nftLending.getLoan(loanId);
      expect(loan.status).to.equal(1); // REPAID
    });

    it("成功偿还贷款应该增加用户历史记录", async function () {
      // 偿还前检查历史
      expect(await nftLending.getUserLoanHistory(user1.address)).to.equal(0);
      
      // 偿还贷款
      await nftLending.connect(user1).repayLoan(loanId);
      
      // 验证历史已更新
      expect(await nftLending.getUserLoanHistory(user1.address)).to.equal(1);
    });

    it("非借款人不应该能偿还贷款", async function () {
      await expect(
        nftLending.connect(user2).repayLoan(loanId)
      ).to.be.revertedWith("Not borrower");
    });
  });
  
  describe("清算贷款测试", function () {
    let loanId;
    
    beforeEach(async function () {
      // 创建一个即将到期的贷款
      const shortDuration = 60; // 60秒
      const tx = await nftLending.connect(user1).createLoan(
        alveyNFT.address,
        tokenId,
        loanAmount,
        shortDuration,
        mockToken.address
      );
      const receipt = await tx.wait();
      loanId = 1; // 第一个贷款ID为1
    });

    it("过期的贷款应该可被清算", async function () {
      // 等待贷款过期
      await ethers.provider.send("evm_increaseTime", [120]);
      await ethers.provider.send("evm_mine");
      
      // 清算贷款
      await expect(
        nftLending.connect(user2).liquidateLoan(loanId)
      ).to.emit(nftLending, "LoanLiquidated");
      
      // 验证NFT转移给清算人
      expect(await alveyNFT.ownerOf(tokenId)).to.equal(user2.address);
      
      // 验证贷款状态
      const loan = await nftLending.getLoan(loanId);
      expect(loan.status).to.equal(2); // LIQUIDATED
    });

    it("价值下跌的贷款应该可被清算", async function () {
      // 降低NFT的估值，导致贷款不足额抵押
      await nftLending.setNFTValuation(alveyNFT.address, tokenId, ethers.parseEther("5"), A_RATING);
      
      // 清算贷款
      await expect(
        nftLending.connect(user2).liquidateLoan(loanId)
      ).to.emit(nftLending, "LoanLiquidated");
    });

    it("正常的贷款不应该可被清算", async function () {
      // 尝试清算未过期且足额抵押的贷款
      await expect(
        nftLending.connect(user2).liquidateLoan(loanId)
      ).to.be.revertedWith("Loan cannot be liquidated");
    });
  });
  
  describe("再融资测试", function () {
    let loanId;

    beforeEach(async function () {
      // 创建一个贷款
      const tx = await nftLending.connect(user1).createLoan(
        alveyNFT.address,
          tokenId,
          loanAmount,
          loanDuration,
        mockToken.address
      );
      const receipt = await tx.wait();
      loanId = 1; // 第一个贷款ID为1
    });

    it("借款人应该能够再融资贷款", async function () {
      // 新贷款金额和期限
      const newLoanAmount = ethers.parseEther("5.5"); // 增加10%
      const newDuration = loanDuration * 2; // 两倍时间
      
      // 再融资
      await expect(
        nftLending.connect(user1).refinanceLoan(
          loanId,
          newLoanAmount,
          newDuration,
          mockToken.address
        )
      ).to.emit(nftLending, "RefinanceLoan");
      
      // 验证原贷款状态
      const oldLoan = await nftLending.getLoan(loanId);
      expect(oldLoan.status).to.equal(1); // REPAID
      
      // 验证新贷款
      const newLoanId = 2; // 第二个贷款ID为2
      const newLoan = await nftLending.getLoan(newLoanId);
      expect(newLoan.borrower).to.equal(user1.address);
      expect(newLoan.loanAmount).to.equal(newLoanAmount);
      expect(newLoan.duration).to.equal(newDuration);
      expect(newLoan.status).to.equal(0); // ACTIVE
    });

    it("非借款人不应该能再融资", async function () {
      await expect(
        nftLending.connect(user2).refinanceLoan(
          loanId,
          loanAmount,
          loanDuration,
          mockToken.address
        )
      ).to.be.revertedWith("Not borrower of old loan");
    });
  });

  describe("紧急功能测试", function () {
    let loanId;

    beforeEach(async function () {
      // 创建一个贷款
      const tx = await nftLending.connect(user1).createLoan(
        alveyNFT.address,
        tokenId,
        loanAmount,
        loanDuration,
        mockToken.address
      );
      const receipt = await tx.wait();
      loanId = 1; // 第一个贷款ID为1
    });

    it("管理员应该能暂停合约", async function () {
      await nftLending.pause();
      expect(await nftLending.paused()).to.equal(true);
      
      // 验证暂停后不能创建新贷款
      await expect(
        nftLending.connect(user1).createLoan(
          alveyNFT.address,
          tokenId + 1,
          loanAmount,
          loanDuration,
          mockToken.address
        )
      ).to.be.revertedWith("Pausable: paused");
    });

    it("合约暂停时应允许紧急提取NFT", async function () {
      // 暂停合约
      await nftLending.pause();
      
      // 紧急提取NFT
      await expect(
        nftLending.connect(user1).emergencyWithdrawNFT(loanId)
      ).to.emit(nftLending, "EmergencyWithdrawNFT");
      
      // 验证NFT已返还
      expect(await alveyNFT.ownerOf(tokenId)).to.equal(user1.address);
      
      // 验证贷款状态
      const loan = await nftLending.getLoan(loanId);
      expect(loan.status).to.equal(1); // REPAID
    });

    it("合约运行时不应允许紧急提取", async function () {
      // 尝试在合约没有暂停时紧急提取
      await expect(
        nftLending.connect(user1).emergencyWithdrawNFT(loanId)
      ).to.be.revertedWith("Pausable: not paused");
    });
  });
  
  describe("安全性测试", function () {
    it("不支持的NFT不能创建贷款", async function () {
      // 部署一个新的NFT合约
      const UnsupportedNFT = await ethers.getContractFactory("AlveyNFT");
      const unsupportedNFT = await UnsupportedNFT.deploy("UnsupportedNFT", "UNFT");
      
      // 为用户铸造NFT
      await unsupportedNFT.mint(user1.address, tokenId);
      await unsupportedNFT.connect(user1).approve(nftLending.address, tokenId);
      
      // 尝试创建贷款
      await expect(
        nftLending.connect(user1).createLoan(
          unsupportedNFT.address,
        tokenId,
        loanAmount,
          loanDuration,
          mockToken.address
        )
      ).to.be.revertedWith("NFT contract not supported");
    });

    it("未估值的NFT不能创建贷款", async function () {
      // 铸造一个未估值的NFT
      const newTokenId = 99;
      await alveyNFT.mint(user1.address, newTokenId);
      await alveyNFT.connect(user1).approve(nftLending.address, newTokenId);
      
      // 尝试创建贷款
      await expect(
        nftLending.connect(user1).createLoan(
          alveyNFT.address,
          newTokenId,
          loanAmount,
          loanDuration,
          mockToken.address
        )
      ).to.be.revertedWith("NFT not valued");
    });

    it("超出限额的贷款应被拒绝", async function () {
      // 尝试创建超出限额的贷款
      const excessiveLoanAmount = nftValue; // 100% LTV，超过允许的最大值
      
      await expect(
        nftLending.connect(user1).createLoan(
          alveyNFT.address,
          tokenId,
          excessiveLoanAmount,
          loanDuration,
          mockToken.address
        )
      ).to.be.revertedWith("Loan amount exceeds maximum");
    });
  });
}); 