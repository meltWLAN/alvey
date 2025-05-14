// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title NFTLending
 * @dev 实现NFT借贷市场，允许用户将其NFT借出获取收益，或借入他人的NFT
 */
contract NFTLending is ERC721Holder, ReentrancyGuard, Ownable, Pausable {
    // 事件
    event LoanCreated(
        uint256 indexed loanId, 
        address indexed lender, 
        address indexed nftContract, 
        uint256 tokenId,
        uint256 loanAmount,
        uint256 feePercent,
        uint256 duration
    );
    event LoanAccepted(uint256 indexed loanId, address indexed borrower);
    event LoanRepaid(uint256 indexed loanId, address indexed borrower);
    event LoanLiquidated(uint256 indexed loanId, address indexed lender);
    event LoanCancelled(uint256 indexed loanId, address indexed lender);
    event PlatformFeeUpdated(uint256 newFee);
    event CollateralTokenAdded(address token);
    event CollateralTokenRemoved(address token);

    // 贷款状态
    enum LoanStatus {
        Created,    // 贷款已创建，但尚未被借入
        Active,     // 贷款已被借入，处于活跃状态
        Repaid,     // 贷款已偿还
        Liquidated, // 贷款已清算（逾期未还）
        Cancelled   // 贷款已取消
    }

    // 贷款结构体
    struct Loan {
        address lender;           // 出借人
        address borrower;         // 借入人
        address nftContract;      // NFT合约地址
        uint256 tokenId;          // NFT token ID
        address collateralToken;  // 抵押代币地址
        uint256 loanAmount;       // 贷款金额
        uint256 feePercent;       // 费率百分比 (基于1000，例如30=3%)
        uint256 duration;         // 贷款期限（秒）
        uint256 startTime;        // 贷款开始时间
        LoanStatus status;        // 贷款状态
    }

    // 状态变量
    uint256 public nextLoanId = 1;
    mapping(uint256 => Loan) public loans;
    mapping(address => bool) public supportedCollateralTokens;
    uint256 public platformFeePercent = 10; // 1% (based on 1000)
    
    // 构造函数
    constructor() {
        // 初始化
    }
    
    /**
     * @dev 创建贷款
     * @param nftContract NFT合约地址
     * @param tokenId NFT的tokenId
     * @param collateralToken 抵押代币地址
     * @param loanAmount 贷款金额
     * @param feePercent 贷款费率 (base 1000)
     * @param duration 贷款期限（秒）
     */
    function createLoan(
        address nftContract,
        uint256 tokenId,
        address collateralToken,
        uint256 loanAmount,
        uint256 feePercent,
        uint256 duration
    ) external whenNotPaused nonReentrant returns (uint256) {
        require(nftContract != address(0), "Invalid NFT contract");
        require(collateralToken != address(0), "Invalid collateral token");
        require(supportedCollateralTokens[collateralToken], "Unsupported collateral token");
        require(loanAmount > 0, "Loan amount must be greater than 0");
        require(feePercent > 0, "Fee percent must be greater than 0");
        require(duration > 0, "Duration must be greater than 0");
        
        // 检查调用者是否是NFT的拥有者
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not owner of NFT");
        
        // 检查合约是否有NFT转移权限
        require(
            nft.isApprovedForAll(msg.sender, address(this)) || 
            nft.getApproved(tokenId) == address(this),
            "Contract not approved to transfer NFT"
        );
        
        // 将NFT转移到合约
        nft.safeTransferFrom(msg.sender, address(this), tokenId);
        
        // 创建贷款
        uint256 loanId = nextLoanId++;
        loans[loanId] = Loan({
            lender: msg.sender,
            borrower: address(0),
            nftContract: nftContract,
            tokenId: tokenId,
            collateralToken: collateralToken,
            loanAmount: loanAmount,
            feePercent: feePercent,
            duration: duration,
            startTime: 0,
            status: LoanStatus.Created
        });
        
        emit LoanCreated(
            loanId,
            msg.sender,
            nftContract,
            tokenId,
            loanAmount,
            feePercent,
            duration
        );
        
        return loanId;
    }
    
    /**
     * @dev 接受贷款
     * @param loanId 贷款ID
     */
    function acceptLoan(uint256 loanId) external whenNotPaused nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Created, "Loan is not available");
        require(loan.lender != msg.sender, "Lender cannot borrow their own loan");
        
        // 检查并转移借款抵押品
        IERC20 collateralToken = IERC20(loan.collateralToken);
        
        // 计算抵押金额（贷款金额 + 费用）
        uint256 collateralAmount = loan.loanAmount + (loan.loanAmount * loan.feePercent) / 1000;
        
        // 转移抵押品到合约
        bool success = collateralToken.transferFrom(msg.sender, address(this), collateralAmount);
        require(success, "Collateral transfer failed");
        
        // 将贷款金额转移给借款人
        success = collateralToken.transferFrom(address(this), msg.sender, loan.loanAmount);
        require(success, "Loan amount transfer failed");
        
        // 更新贷款信息
        loan.borrower = msg.sender;
        loan.startTime = block.timestamp;
        loan.status = LoanStatus.Active;
        
        // 将NFT转移给借款人
        IERC721(loan.nftContract).safeTransferFrom(address(this), msg.sender, loan.tokenId);
        
        emit LoanAccepted(loanId, msg.sender);
    }
    
    /**
     * @dev 偿还贷款
     * @param loanId 贷款ID
     */
    function repayLoan(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Active, "Loan is not active");
        require(loan.borrower == msg.sender, "Only borrower can repay");
        require(block.timestamp <= loan.startTime + loan.duration, "Loan is overdue");
        
        // 检查NFT是否有权限转移
        IERC721 nft = IERC721(loan.nftContract);
        require(
            nft.isApprovedForAll(msg.sender, address(this)) || 
            nft.getApproved(loan.tokenId) == address(this),
            "Contract not approved to transfer NFT"
        );
        
        // 将NFT转回贷款人
        nft.safeTransferFrom(msg.sender, loan.lender, loan.tokenId);
        
        // 计算还款金额（包含利息）
        uint256 repayAmount = loan.loanAmount + (loan.loanAmount * loan.feePercent) / 1000;
        
        // 计算平台费用
        uint256 platformFee = (repayAmount * platformFeePercent) / 1000;
        uint256 lenderAmount = repayAmount - platformFee;
        
        // 转移费用给贷款人
        IERC20 collateralToken = IERC20(loan.collateralToken);
        bool success = collateralToken.transfer(loan.lender, lenderAmount);
        require(success, "Repayment to lender failed");
        
        // 转移平台费用
        if (platformFee > 0) {
            success = collateralToken.transfer(owner(), platformFee);
            require(success, "Platform fee transfer failed");
        }
        
        // 更新贷款状态
        loan.status = LoanStatus.Repaid;
        
        emit LoanRepaid(loanId, msg.sender);
    }
    
    /**
     * @dev 清算逾期贷款
     * @param loanId 贷款ID
     */
    function liquidateLoan(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Active, "Loan is not active");
        require(block.timestamp > loan.startTime + loan.duration, "Loan is not overdue");
        
        // 只有贷款人可以清算
        require(loan.lender == msg.sender, "Only lender can liquidate");
        
        // 检查NFT是否有权限转移
        IERC721 nft = IERC721(loan.nftContract);
        
        // 检查NFT当前所有者并确保合约有权限转移
        address currentOwner = nft.ownerOf(loan.tokenId);
        require(
            (currentOwner == loan.borrower && 
            (nft.isApprovedForAll(currentOwner, address(this)) || 
             nft.getApproved(loan.tokenId) == address(this))) || 
            currentOwner == address(this),
            "Cannot liquidate: NFT not accessible"
        );
        
        // 如果NFT在借款人手中，则转回贷款人
        if (currentOwner == loan.borrower) {
            nft.safeTransferFrom(currentOwner, loan.lender, loan.tokenId);
        } else if (currentOwner == address(this)) {
            nft.safeTransferFrom(address(this), loan.lender, loan.tokenId);
        }
        
        // 计算抵押品金额（包含利息）
        uint256 collateralAmount = loan.loanAmount + (loan.loanAmount * loan.feePercent) / 1000;
        
        // 计算平台费用
        uint256 platformFee = (collateralAmount * platformFeePercent) / 1000;
        uint256 lenderAmount = collateralAmount - platformFee;
        
        // 转移抵押品给贷款人
        IERC20 collateralToken = IERC20(loan.collateralToken);
        bool success = collateralToken.transfer(loan.lender, lenderAmount);
        require(success, "Collateral transfer to lender failed");
        
        // 转移平台费用
        if (platformFee > 0) {
            success = collateralToken.transfer(owner(), platformFee);
            require(success, "Platform fee transfer failed");
        }
        
        // 更新贷款状态
        loan.status = LoanStatus.Liquidated;
        
        emit LoanLiquidated(loanId, loan.lender);
    }
    
    /**
     * @dev 取消未被接受的贷款
     * @param loanId 贷款ID
     */
    function cancelLoan(uint256 loanId) external nonReentrant {
        Loan storage loan = loans[loanId];
        require(loan.status == LoanStatus.Created, "Loan is not in created state");
        require(loan.lender == msg.sender, "Only lender can cancel");
        
        // 将NFT返回给贷款人
        IERC721(loan.nftContract).safeTransferFrom(address(this), loan.lender, loan.tokenId);
        
        // 更新贷款状态
        loan.status = LoanStatus.Cancelled;
        
        emit LoanCancelled(loanId, msg.sender);
    }
    
    /**
     * @dev 添加支持的抵押代币
     * @param token 代币地址
     */
    function addCollateralToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        supportedCollateralTokens[token] = true;
        emit CollateralTokenAdded(token);
    }
    
    /**
     * @dev 移除支持的抵押代币
     * @param token 代币地址
     */
    function removeCollateralToken(address token) external onlyOwner {
        supportedCollateralTokens[token] = false;
        emit CollateralTokenRemoved(token);
    }
    
    /**
     * @dev 设置平台费率
     * @param newFeePercent 新费率 (base 1000)
     */
    function setPlatformFee(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 100, "Fee too high"); // 最高10%
        platformFeePercent = newFeePercent;
        emit PlatformFeeUpdated(newFeePercent);
    }
    
    /**
     * @dev 获取贷款详情
     * @param loanId 贷款ID
     */
    function getLoanDetails(uint256 loanId) external view returns (
        address lender,
        address borrower,
        address nftContract,
        uint256 tokenId,
        address collateralToken,
        uint256 loanAmount,
        uint256 feePercent,
        uint256 duration,
        uint256 startTime,
        LoanStatus status
    ) {
        Loan storage loan = loans[loanId];
        return (
            loan.lender,
            loan.borrower,
            loan.nftContract,
            loan.tokenId,
            loan.collateralToken,
            loan.loanAmount,
            loan.feePercent,
            loan.duration,
            loan.startTime,
            loan.status
        );
    }
    
    /**
     * @dev 检查贷款是否逾期
     * @param loanId 贷款ID
     */
    function isLoanOverdue(uint256 loanId) external view returns (bool) {
        Loan storage loan = loans[loanId];
        if (loan.status != LoanStatus.Active) {
            return false;
        }
        return block.timestamp > loan.startTime + loan.duration;
    }
    
    /**
     * @dev 暂停合约
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev 恢复合约
     */
    function unpause() external onlyOwner {
        _unpause();
    }
} 