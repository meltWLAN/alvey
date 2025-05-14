// 合约ABI
const nftABI = [
    "function mint() public payable",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function approve(address to, uint256 tokenId) public",
    "function balanceOf(address owner) public view returns (uint256)",
    "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)"
];

const stakingABI = [
    "function stake(uint256 tokenId) public",
    "function unstake(uint256 tokenId) public",
    "function claimReward(uint256 tokenId) public",
    "function getStakes(address user) public view returns (uint256[])",
    "function getStakeInfo(uint256 tokenId) public view returns (tuple(uint256 tokenId, uint256 startTime, uint256 lastRewardTime, uint256 accumulatedRewards, address staker))",
    "function calculateReward(uint256 tokenId) public view returns (uint256)"
];

const rewardTokenABI = [
    "function balanceOf(address account) public view returns (uint256)",
    "function decimals() public view returns (uint8)"
];

// 合约地址（部署后需要更新）
let nftAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
let stakingAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
let rewardTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

let provider;
let signer;
let nftContract;
let stakingContract;
let rewardTokenContract;

// 连接钱包
async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            
            const address = await signer.getAddress();
            document.getElementById('walletAddress').textContent = `Connected: ${address}`;
            
            // 初始化合约
            nftContract = new ethers.Contract(nftAddress, nftABI, signer);
            stakingContract = new ethers.Contract(stakingAddress, stakingABI, signer);
            rewardTokenContract = new ethers.Contract(rewardTokenAddress, rewardTokenABI, signer);
            
            // 更新UI
            updateStakedNFTs();
            updateRewards();
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert("Error connecting wallet. Please try again.");
        }
    } else {
        alert("Please install MetaMask to use this dApp!");
    }
}

// 质押NFT
async function stakeNFT() {
    const tokenId = document.getElementById('nftId').value;
    if (!tokenId) {
        alert("Please enter an NFT ID");
        return;
    }

    try {
        const tx = await stakingContract.stake(tokenId);
        await tx.wait();
        alert("NFT staked successfully!");
        updateStakedNFTs();
    } catch (error) {
        console.error("Error staking NFT:", error);
        alert("Error staking NFT. Please try again.");
    }
}

// 解除质押
async function unstakeNFT() {
    const tokenId = document.getElementById('nftId').value;
    if (!tokenId) {
        alert("Please enter an NFT ID");
        return;
    }

    try {
        const tx = await stakingContract.unstake(tokenId);
        await tx.wait();
        alert("NFT unstaked successfully!");
        updateStakedNFTs();
    } catch (error) {
        console.error("Error unstaking NFT:", error);
        alert("Error unstaking NFT. Please try again.");
    }
}

// 领取奖励
async function claimRewards() {
    const tokenId = document.getElementById('nftId').value;
    if (!tokenId) {
        alert("Please enter an NFT ID");
        return;
    }

    try {
        const tx = await stakingContract.claimReward(tokenId);
        await tx.wait();
        alert("Rewards claimed successfully!");
        updateRewards();
    } catch (error) {
        console.error("Error claiming rewards:", error);
        alert("Error claiming rewards. Please try again.");
    }
}

// 更新质押的NFT列表
async function updateStakedNFTs() {
    const address = await signer.getAddress();
    const stakes = await stakingContract.getStakes(address);
    const stakedNFTsDiv = document.getElementById('stakedNFTs');
    stakedNFTsDiv.innerHTML = '';

    for (const tokenId of stakes) {
        const stakeInfo = await stakingContract.getStakeInfo(tokenId);
        const reward = await stakingContract.calculateReward(tokenId);
        
        const nftDiv = document.createElement('div');
        nftDiv.className = 'card mb-2';
        nftDiv.innerHTML = `
            <div class="card-body">
                <h6>NFT ID: ${tokenId}</h6>
                <p>Staked since: ${new Date(stakeInfo.startTime * 1000).toLocaleString()}</p>
                <p>Available rewards: ${ethers.utils.formatUnits(reward, 18)} RWD</p>
            </div>
        `;
        stakedNFTsDiv.appendChild(nftDiv);
    }
}

// 更新奖励信息
async function updateRewards() {
    const tokenId = document.getElementById('nftId').value;
    if (tokenId) {
        const reward = await stakingContract.calculateReward(tokenId);
        document.getElementById('availableRewards').textContent = 
            ethers.utils.formatUnits(reward, 18);
    }
}

// 事件监听器
document.getElementById('connectWallet').addEventListener('click', connectWallet);
document.getElementById('stakeNFT').addEventListener('click', stakeNFT);
document.getElementById('unstakeNFT').addEventListener('click', unstakeNFT);
document.getElementById('claimRewards').addEventListener('click', claimRewards);
document.getElementById('nftId').addEventListener('change', updateRewards); 