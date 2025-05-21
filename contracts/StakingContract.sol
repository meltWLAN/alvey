// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract StakingContract is ReentrancyGuard, Ownable, Pausable {
    IERC721 public nftContract;
    IERC20 public rewardToken;

    struct StakeInfo {
        uint256 tokenId;
        uint256 stakedAt;
        uint256 lastClaimed;
        uint256 accumulated;
        address staker; // 记录原持有者
    }

    mapping(uint256 => StakeInfo) public stakes;
    mapping(address => uint256[]) public userStakes;

    uint256 public baseRewardRate = 1 ether;
    uint256 public timeWeightFactor = 1; // 时间加权系数
    mapping(uint256 => uint256) public stakeWeights;
    
    // 新增: 最大奖励上限配置
    uint256 public maxDailyReward = 100 ether; // 每日最大奖励
    uint256 public maxRewardCap = 10000 ether; // 总奖励上限
    
    uint256 public totalStakedNFTs;
    
    event Staked(address indexed user, uint256 tokenId);
    event Unstaked(address indexed user, uint256 tokenId, uint256 reward);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardParamsUpdated(uint256 newBaseRate, uint256 newWeightFactor);
    event RewardCapUpdated(uint256 newDailyMax, uint256 newTotalMax);
    event EmergencyRecovery(address indexed token, address indexed recipient, uint256 amount);
    
    // 新增: 合约暂停相关事件
    event ContractPaused(address operator);
    event ContractUnpaused(address operator);

    constructor(address _nftContract, address _rewardToken) {
        nftContract = IERC721(_nftContract);
        rewardToken = IERC20(_rewardToken);
        
        // 验证合约地址
        require(_nftContract != address(0), "Invalid NFT contract address");
        require(_rewardToken != address(0), "Invalid reward token address");
    }

    // 基础质押函数框架
    function stake(uint256 tokenId) external nonReentrant whenNotPaused {
        require(nftContract.ownerOf(tokenId) == msg.sender, "Not NFT owner");
        
        nftContract.transferFrom(msg.sender, address(this), tokenId);
        
        stakes[tokenId] = StakeInfo({
            tokenId: tokenId,
            stakedAt: block.timestamp,
            lastClaimed: block.timestamp,
            accumulated: 0,
            staker: msg.sender // 记录原持有者
        });
        
        userStakes[msg.sender].push(tokenId);
        totalStakedNFTs += 1;
        emit Staked(msg.sender, tokenId);
    }

    function unstake(uint256 tokenId) external nonReentrant whenNotPaused {
        require(stakes[tokenId].stakedAt > 0, "NFT not staked");
        StakeInfo storage info = stakes[tokenId];
        require(nftContract.ownerOf(tokenId) == address(this), "NFT not staked");
        require(msg.sender == info.staker, "Not staker"); // 只允许原持有者操作

        uint256 reward = _getReward(tokenId);
        info.accumulated = 0;
        
        // 转移奖励代币
        require(rewardToken.transfer(msg.sender, reward), "Reward transfer failed");
        // 返还NFT
        nftContract.safeTransferFrom(address(this), msg.sender, tokenId);

        delete stakes[tokenId];
        _removeStake(msg.sender, tokenId);
        totalStakedNFTs -= 1;
        
        emit Unstaked(msg.sender, tokenId, reward);
    }

    function _getReward(uint256 tokenId) internal returns (uint256) {
        StakeInfo storage info = stakes[tokenId];
        uint256 elapsed = block.timestamp - info.lastClaimed;
        
        // 应用每日奖励上限
        uint256 elapsedDays = elapsed / 1 days;
        uint256 remainder = elapsed % 1 days;
        
        // 计算时间加权奖励
        uint256 timeWeight = 1 + (elapsed * timeWeightFactor) / 1 days;
        uint256 dailyReward = baseRewardRate * timeWeight;
        
        // 应用每日奖励上限
        dailyReward = dailyReward > maxDailyReward ? maxDailyReward : dailyReward;
        
        // 计算总奖励
        uint256 pending = elapsedDays * dailyReward + (remainder * dailyReward / 1 days);
        
        // 更新质押权重
        stakeWeights[tokenId] += timeWeight;
        info.accumulated += pending;
        
        // 应用总奖励上限
        if (info.accumulated > maxRewardCap) {
            info.accumulated = maxRewardCap;
        }
        
        info.lastClaimed = block.timestamp;
        return info.accumulated;
    }

    function getPendingReward(uint256 tokenId) public view returns (uint256) {
        StakeInfo memory info = stakes[tokenId];
        if(info.stakedAt == 0) return 0;
        
        uint256 elapsed = block.timestamp - info.lastClaimed;
        uint256 elapsedDays = elapsed / 1 days;
        uint256 remainder = elapsed % 1 days;
        
        // 计算时间加权奖励
        uint256 timeWeight = 1 + (elapsed * timeWeightFactor) / 1 days;
        uint256 dailyReward = baseRewardRate * timeWeight;
        
        // 应用每日奖励上限
        dailyReward = dailyReward > maxDailyReward ? maxDailyReward : dailyReward;
        
        // 计算总奖励
        uint256 pending = elapsedDays * dailyReward + (remainder * dailyReward / 1 days);
        uint256 total = info.accumulated + pending;
        
        // 应用总奖励上限
        return total > maxRewardCap ? maxRewardCap : total;
    }

    function _removeStake(address user, uint256 tokenId) internal {
        uint256[] storage userStakeList = userStakes[user];
        for (uint256 i = 0; i < userStakeList.length; i++) {
            if (userStakeList[i] == tokenId) {
                userStakeList[i] = userStakeList[userStakeList.length - 1];
                userStakeList.pop();
                break;
            }
        }
    }

    // 管理员功能
    function updateRewardParams(uint256 newBaseRate, uint256 newWeightFactor) external onlyOwner {
        baseRewardRate = newBaseRate;
        timeWeightFactor = newWeightFactor;
        
        // 更新所有现有质押记录的权重
        for (uint256 i = 0; i < userStakes[msg.sender].length; i++) {
            uint256 tokenId = userStakes[msg.sender][i];
            StakeInfo storage info = stakes[tokenId];
            uint256 elapsed = block.timestamp - info.lastClaimed;
            stakeWeights[tokenId] += (elapsed * timeWeightFactor) / 1 days;
            info.lastClaimed = block.timestamp;
        }
        emit RewardParamsUpdated(newBaseRate, newWeightFactor);
    }
    
    // 新增: 更新奖励上限
    function updateRewardCaps(uint256 newDailyMax, uint256 newTotalMax) external onlyOwner {
        maxDailyReward = newDailyMax;
        maxRewardCap = newTotalMax;
        emit RewardCapUpdated(newDailyMax, newTotalMax);
    }

    function emergencyWithdraw() external onlyOwner {
        uint256 balance = rewardToken.balanceOf(address(this));
        require(rewardToken.transfer(owner(), balance), "Emergency withdraw failed");
    }
    
    // 新增: 紧急ERC721恢复
    function recoverERC721(address tokenAddress, uint256 tokenId, address recipient) external onlyOwner {
        // 确保不影响质押的NFT
        require(tokenAddress != address(nftContract) || stakes[tokenId].stakedAt == 0, 
                "Cannot recover staked NFT");
        
        IERC721(tokenAddress).safeTransferFrom(address(this), recipient, tokenId);
        emit EmergencyRecovery(tokenAddress, recipient, tokenId);
    }

    function getUserStakes(address user) public view returns (uint256[] memory) {
        return userStakes[user];
    }

    function getUserStakesInfo(address user) public view returns (StakeInfo[] memory) {
        uint256[] memory stakeIds = userStakes[user];
        StakeInfo[] memory infos = new StakeInfo[](stakeIds.length);
        for (uint256 i = 0; i < stakeIds.length; i++) {
            infos[i] = stakes[stakeIds[i]];
        }
        return infos;
    }

    function claimReward(uint256 tokenId) external nonReentrant whenNotPaused {
        require(stakes[tokenId].stakedAt > 0, "NFT not staked");
        StakeInfo storage info = stakes[tokenId];
        require(nftContract.ownerOf(tokenId) == address(this), "NFT not staked");
        require(msg.sender == info.staker, "Not staker"); // 只允许原持有者操作
        
        uint256 reward = _getReward(tokenId);
        info.accumulated = 0;
        require(rewardToken.transfer(msg.sender, reward), "Reward transfer failed");
        emit RewardClaimed(msg.sender, reward);
    }
    
    // 新增: 暂停和恢复合约功能
    function pause() external onlyOwner {
        _pause();
        emit ContractPaused(msg.sender);
    }
    
    function unpause() external onlyOwner {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }
}