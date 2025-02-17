import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// NFT合约ABI
const contractABI = [
  "function safeMint(address to, string memory uri) public",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function mintPrice() public view returns (uint256)"
];

// ERC20代币ABI
const tokenABI = [
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)"
];

const contractAddress = "YOUR_CONTRACT_ADDRESS"; // NFT合约地址
const tokenAddress = "0x0D8318C1C2C36a1f614Ca17af77Cb3D5c0cC7e10"; // Mario代币地址

function App() {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [tokenURI, setTokenURI] = useState('');
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState('');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [mintPrice, setMintPrice] = useState('0');
  const [notification, setNotification] = useState('');

  useEffect(() => {
    initializeEthers();
    checkMobileWallet();
  }, []);

  useEffect(() => {
    if (account && tokenContract && contract) {
      updateBalanceAndPrice();
    }
  }, [account, tokenContract, contract]);

  const checkMobileWallet = () => {
    if (window.ethereum) {
      if (window.ethereum.isMetaMask) {
        setNotification('');
      } else {
        setNotification('推荐使用MetaMask移动端钱包');
      }
    } else {
      setNotification('请安装移动端加密钱包');
    }
  };

  const updateBalanceAndPrice = async () => {
    try {
      const balance = await tokenContract.balanceOf(account);
      setTokenBalance(ethers.formatUnits(balance, 18));
      
      const price = await contract.mintPrice();
      setMintPrice(ethers.formatUnits(price, 18));
    } catch (err) {
      console.error("获取余额和价格失败:", err);
    }
  };

  const initializeEthers = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);

        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          provider
        );
        setContract(contract);

        const tokenContract = new ethers.Contract(
          tokenAddress,
          tokenABI,
          provider
        );
        setTokenContract(tokenContract);
      } catch (err) {
        console.error("初始化错误:", err);
        setError("初始化Web3失败");
      }
    } else {
      setError("请安装移动端加密钱包!");
    }
  };

  const connectWallet = async () => {
    try {
      if (!provider) {
        setError("Web3未初始化");
        return;
      }
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      setAccount(accounts[0]);
      setError('');
    } catch (err) {
      console.error("连接钱包错误:", err);
      setError("连接钱包失败");
    }
  };

  const mintNFT = async (e) => {
    e.preventDefault();
    if (!tokenURI) {
      setError("请输入NFT的URI");
      return;
    }

    setMinting(true);
    setError('');

    try {
      const signer = await provider.getSigner();
      const contractWithSigner = contract.connect(signer);
      const tokenContractWithSigner = tokenContract.connect(signer);

      // 获取铸造价格
      const price = await contract.mintPrice();

      // 检查代币授权
      const allowance = await tokenContract.allowance(account, contractAddress);
      if (allowance < price) {
        const approveTx = await tokenContractWithSigner.approve(contractAddress, price);
        await approveTx.wait();
      }

      // 铸造NFT
      const tx = await contractWithSigner.safeMint(account, tokenURI);
      await tx.wait();

      setTokenURI('');
      setError('');
      alert('NFT铸造成功！');
    } catch (err) {
      console.error("铸造错误:", err);
      setError("铸造NFT失败");
    } finally {
      setMinting(false);
    }
  };

  return (
    <div className="app">
      <h1>Alvey NFT铸造</h1>
      {notification && <div className="notification">{notification}</div>}
      
      {!account ? (
        <button className="connect-button" onClick={connectWallet}>
          连接钱包
        </button>
      ) : (
        <div className="account">
          <p>当前账户: {account}</p>
          <div className="balance">代币余额: {tokenBalance}</div>
          <div className="price">铸造价格: {mintPrice}</div>
          
          <form className="mint-form" onSubmit={mintNFT}>
            <input
              type="text"
              className="uri-input"
              placeholder="输入NFT的URI"
              value={tokenURI}
              onChange={(e) => setTokenURI(e.target.value)}
            />
            <button
              className="mint-button"
              type="submit"
              disabled={minting}
            >
              {minting ? "铸造中..." : "铸造NFT"}
            </button>
          </form>
        </div>
      )}
      
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default App;
