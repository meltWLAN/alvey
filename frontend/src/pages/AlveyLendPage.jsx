import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// 假设AlveyNFT ABI也需要在这里使用，或者从App.jsx传入contract实例
// import AlveyNFTABI from '../../../artifacts/contracts/AlveyNFT.sol/AlveyNFT.json';

function AlveyLendPage({ onExit, alveyLendContract, provider, account, mainNftContract }) {
  const [userOwnedNFTs, setUserOwnedNFTs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [loanAmount, setLoanAmount] = useState('');
  const [loanDuration, setLoanDuration] = useState('');
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [creatingLoan, setCreatingLoan] = useState(false);
  const [error, setError] = useState('');
  const [txMessage, setTxMessage] = useState('');

  useEffect(() => {
    const fetchUserNFTs = async () => {
      if (!account || !mainNftContract) {
        setUserOwnedNFTs([]);
        return;
      }
      setLoadingNFTs(true);
      setError('');
      try {
        const balanceBN = await mainNftContract.balanceOf(account);
        const balance = balanceBN.toNumber(); // Correctly convert BigNumber to number

        if (balance === 0) {
          setUserOwnedNFTs([]);
          setLoadingNFTs(false);
          return;
        }

        const nfts = [];
        for (let i = 0; i < balance; i++) {
          try {
            const tokenId = await mainNftContract.tokenOfOwnerByIndex(account, i);
            let tokenURI = await mainNftContract.tokenURI(tokenId);
            
            let name = `NFT #${tokenId.toString()}`;
            let image = 'https://via.placeholder.com/150?text=No+Image'; // Default image

            if (tokenURI) {
              if (tokenURI.startsWith('ipfs://')) {
                tokenURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
              }

              if (tokenURI.startsWith('/')) { // Relative path for local demo JSON
                const response = await fetch(window.location.origin + tokenURI);
                if (response.ok) {
                  const metadata = await response.json();
                  name = metadata.name || name;
                  if (metadata.image) {
                    image = metadata.image.startsWith('ipfs://') ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') : metadata.image;
                  }
                } else {
                  console.warn(`Failed to fetch metadata from local path: ${tokenURI}`);
                }
              } else if (tokenURI.startsWith('http')) { // Full HTTP(S) URL
                const response = await fetch(tokenURI);
                 if (response.ok) {
                  const metadata = await response.json();
                  name = metadata.name || name;
                  if (metadata.image) {
                    image = metadata.image.startsWith('ipfs://') ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') : metadata.image;
                  }
                } else {
                  console.warn(`Failed to fetch metadata from URL: ${tokenURI}`);
                }
              }
            }
            nfts.push({ 
              id: tokenId.toString(), 
              uri: tokenURI || '', 
              name: name, 
              image: image
            });
          } catch (individualNftError) {
            console.error(`Error fetching details for an NFT at index ${i}:`, individualNftError);
            // Optionally add a placeholder for this specific NFT if it fails
          }
        }
        setUserOwnedNFTs(nfts);
      } catch (err) {
        console.error("获取用户NFT失败:", err);
        setError("获取您的NFT列表失败，请稍后再试。");
        setUserOwnedNFTs([]);
      } finally {
        setLoadingNFTs(false);
      }
    };

    fetchUserNFTs();
  }, [account, mainNftContract]);

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    if (!selectedNFT || !loanAmount || !loanDuration || !alveyLendContract || !provider || !mainNftContract) {
      setError("请选择一个NFT并填写所有借贷信息，并确保合约已正确加载。");
      return;
    }
    // Basic validation
    if (parseFloat(loanAmount) <= 0) {
      setError("借款金额必须大于0。");
      return;
    }
    if (parseInt(loanDuration) <= 0 || parseInt(loanDuration) > 365) { // Example: Max 1 year duration
      setError("借款期限必须在1到365天之间。");
      return;
    }

    setCreatingLoan(true);
    setError('');
    setTxMessage('');

    try {
      const signer = await provider.getSigner();
      const alveyLendWithSigner = alveyLendContract.connect(signer);
      const mainNftContractWithSigner = mainNftContract.connect(signer);
      
      const alveyLendContractAddress = await alveyLendContract.getAddress(); // Get address dynamically

      setTxMessage(`正在授权NFT #${selectedNFT.id}给借贷合约 (${alveyLendContractAddress})...`);
      const approveTx = await mainNftContractWithSigner.approve(alveyLendContractAddress, selectedNFT.id);
      await approveTx.wait();
      setTxMessage("NFT授权成功！正在创建借贷订单...");

      const paymentTokenAddress = "0xF88c032e746E3E701B316C8052bF271DB540871E"; // MARIO Token
      const loanAmountInWei = ethers.utils.parseUnits(loanAmount.toString(), 18);
      const durationInSeconds = parseInt(loanDuration) * 24 * 60 * 60;
      const mainNftContractActualAddress = await mainNftContract.getAddress();

      const createLoanTx = await alveyLendWithSigner.createLoan(
        mainNftContractActualAddress,
        selectedNFT.id,
        loanAmountInWei,
        durationInSeconds,
        paymentTokenAddress
      );
      setTxMessage(`借贷订单提交中... TX: ${createLoanTx.hash}`);
      await createLoanTx.wait();

      setTxMessage(`借贷订单创建成功！交易哈希: ${createLoanTx.hash}`);
      setSelectedNFT(null);
      setLoanAmount('');
      setLoanDuration('');
      // TODO: Refresh user's active loans list here
      // fetchUserNFTs(); // Re-fetch NFTs as one might now be locked or state changed

    } catch (err) {
      console.error("创建借贷失败:", err);
      let specificError = err.message;
      if (err.data && err.data.message) {
        specificError = err.data.message;
      } else if (err.reason) {
        specificError = err.reason;
      }
      setError(`创建借贷失败: ${specificError}`);
      setTxMessage('');
    } finally {
      setCreatingLoan(false);
    }
  };

  return (
    <div className="alvey-lend-page">
      <button onClick={onExit} className="back-to-apphub-button">
        &larr; 返回应用中心
      </button>
      <h2>AlveyLend - NFT 抵押借贷</h2>

      {error && <div className="error-message callout-danger">{error}</div>}
      {txMessage && <div className="tx-message callout-info">{txMessage}</div>}

      <div className="lend-content-wrapper">
        <div className="nft-selection-section">
          <h3>1. 选择您要抵押的NFT</h3>
          {loadingNFTs && <p className="loading-text">正在加载您的NFT...</p>}
          {!loadingNFTs && userOwnedNFTs.length === 0 && <p>您当前没有可抵押的NFT。您可以先去铸造一些NFT。</p>}
          <div className="user-nfts-grid">
            {userOwnedNFTs.map(nft => (
              <div 
                key={nft.id} 
                className={`nft-lend-card ${selectedNFT?.id === nft.id ? 'selected' : ''}`}
                onClick={() => setSelectedNFT(nft)}
              >
                <img src={nft.image} alt={nft.name} onError={(e) => e.target.src='https://via.placeholder.com/150?text=No+Image'} />
                <h4>{nft.name}</h4>
                <small>ID: {nft.id}</small>
              </div>
            ))}
          </div>
        </div>

        {selectedNFT && (
          <div className="loan-creation-section card">
            <h3>2. 填写借贷信息 (抵押: {selectedNFT.name} - ID: {selectedNFT.id})</h3>
            <form onSubmit={handleCreateLoan} className="loan-form">
              <div className="form-group">
                <label htmlFor="loanAmount">借款金额 (MARIO):</label>
                <input 
                  type="number" 
                  id="loanAmount" 
                  value={loanAmount} 
                  onChange={(e) => setLoanAmount(e.target.value)} 
                  placeholder="例如: 100"
                  required 
                  min="0.000000000000000001" /* Smallets unit based on 18 decimals */
                  step="any"
                />
              </div>
              <div className="form-group">
                <label htmlFor="loanDuration">借款期限 (天):</label>
                <input 
                  type="number" 
                  id="loanDuration" 
                  value={loanDuration} 
                  onChange={(e) => setLoanDuration(e.target.value)} 
                  placeholder="例如: 7 (1-365)"
                  required 
                  min="1"
                  max="365"
                />
              </div>
              <button type="submit" className="submit-loan-button" disabled={creatingLoan || !mainNftContract || !alveyLendContract || !account}>
                {creatingLoan ? '正在处理...' : '确认创建借贷'}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="active-loans-section card">
        <h3>我创建的借贷</h3>
        {/* TODO: Fetch and display active loans from the alveyLendContract */}
        <p>借贷列表功能待开发。</p>
      </div>
    </div>
  );
}

export default AlveyLendPage; 