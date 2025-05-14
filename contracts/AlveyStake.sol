// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AlveyStake
 * @dev 实现基本的质押功能，包括质押、解押和奖励分配
 */
contract AlveyStake is ReentrancyGuard, Ownable, Pausable {
    // 事件
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 newRate);
    event StakingPeriodUpdated(uint256 newPeriod);

    // 质押信息结构体
    struct StakingInfo {
        uint256 amount; // 质押数量
        uint256 timestamp; // 质押时间
        uint256 rewardDebt; // 已领取奖励债务
        uint256 pending; // 未领取奖励
    }

    // 状态变量
    IERC20 public stakingToken; // 质押代币
    IERC20 public rewardToken; // 奖励代币
    uint256 public rewardRate; // 奖励利率 (每秒每单位质押量的奖励)
    uint256 public stakingPeriod; // 质押周期 (秒)
    uint256 public totalStaked; // 总质押量
    mapping(address => StakingInfo) public userStakingInfo; // 用户质押信息

    // 构造函数
    constructor(
        address _stakingToken,
        address _rewardToken,
        uint256 _rewardRate,
        uint256 _stakingPeriod
    ) {
        require(_stakingToken != address(0), "Invalid staking token");
        require(_rewardToken != address(0), "Invalid reward token");
        require(_rewardRate > 0, "Invalid reward rate");
        require(_stakingPeriod > 0, "Invalid staking period");

        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
        rewardRate = _rewardRate;
        stakingPeriod = _stakingPeriod;
    }

    // 质押代币
    function stake(uint256 _amount) external nonReentrant whenNotPaused {
        require(_amount > 0, "Amount must be positive");
        
        // 更新奖励
        updateReward(msg.sender);
        
        // 转移代币到合约
        stakingToken.transferFrom(msg.sender, address(this), _amount);
        
        // 更新质押信息
        userStakingInfo[msg.sender].amount += _amount;
        totalStaked += _amount;
        
        emit Staked(msg.sender, _amount);
    }

    // 解除质押
    function unstake() external nonReentrant {
        StakingInfo storage stakingInfo = userStakingInfo[msg.sender];
        uint256 amount = stakingInfo.amount;
        require(amount > 0, "No staking found");
        require(block.timestamp >= stakingInfo.timestamp + stakingPeriod, "Staking period not ended");
        
        // 更新奖励
        updateReward(msg.sender);
        
        // 获取奖励
        uint256 reward = stakingInfo.pending;
        if (reward > 0) {
            stakingInfo.pending = 0;
            rewardToken.transfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
        
        // 更新质押信息
        stakingInfo.amount = 0;
        totalStaked -= amount;
        
        // 转移代币回用户
        stakingToken.transfer(msg.sender, amount);
        
        emit Unstaked(msg.sender, amount);
    }

    // 获取奖励
    function getReward() external nonReentrant {
        // 更新奖励
        updateReward(msg.sender);
        
        StakingInfo storage stakingInfo = userStakingInfo[msg.sender];
        uint256 reward = stakingInfo.pending;
        require(reward > 0, "No reward available");
        
        stakingInfo.pending = 0;
        rewardToken.transfer(msg.sender, reward);
        
        emit RewardPaid(msg.sender, reward);
    }

    // 更新奖励利率
    function updateRewardRate(uint256 _rewardRate) external onlyOwner {
        require(_rewardRate > 0, "Invalid reward rate");
        rewardRate = _rewardRate;
        emit RewardRateUpdated(_rewardRate);
    }

    // 更新质押周期
    function updateStakingPeriod(uint256 _stakingPeriod) external onlyOwner {
        require(_stakingPeriod > 0, "Invalid staking period");
        stakingPeriod = _stakingPeriod;
        emit StakingPeriodUpdated(_stakingPeriod);
    }

    // 暂停合约
    function pause() external onlyOwner {
        _pause();
    }

    // 恢复合约
    function unpause() external onlyOwner {
        _unpause();
    }

    // 计算待领取奖励
    function pendingReward(address _user) external view returns (uint256) {
        StakingInfo storage stakingInfo = userStakingInfo[_user];
        uint256 amount = stakingInfo.amount;
        if (amount == 0) {
            return stakingInfo.pending;
        }
        
        uint256 stakedTime = block.timestamp - stakingInfo.timestamp;
        uint256 reward = (amount * rewardRate * stakedTime) / 1e18 - stakingInfo.rewardDebt;
        return stakingInfo.pending + reward;
    }

    // 获取用户质押信息
    function getStakingInfo(address _user) external view returns (uint256 amount, uint256 timestamp, uint256 pending) {
        StakingInfo storage stakingInfo = userStakingInfo[_user];
        return (stakingInfo.amount, stakingInfo.timestamp, stakingInfo.pending);
    }

    // 获取总质押量
    function getTotalStaked() external view returns (uint256) {
        return totalStaked;
    }

    // 更新奖励（内部函数）
    function updateReward(address _user) internal {
        StakingInfo storage stakingInfo = userStakingInfo[_user];
        uint256 amount = stakingInfo.amount;
        
        if (amount > 0) {
            uint256 stakedTime = block.timestamp - stakingInfo.timestamp;
            uint256 reward = (amount * rewardRate * stakedTime) / 1e18 - stakingInfo.rewardDebt;
            stakingInfo.pending += reward;
        }
        
        stakingInfo.timestamp = block.timestamp;
        stakingInfo.rewardDebt = (amount * rewardRate * (block.timestamp - stakingInfo.timestamp)) / 1e18;
    }
}