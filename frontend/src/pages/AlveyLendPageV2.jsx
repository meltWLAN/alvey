import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import '../styles/AlveyLendPageV2.css'; // 需要创建新的样式文件

function AlveyLendPageV2({ onExit, alveyLendContract, provider, account, mainNftContract }) {
  // 用户NFT相关状态
  const [userOwnedNFTs, setUserOwnedNFTs] = useState([]);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  
  // 借贷表单状态
  const [loanAmount, setLoanAmount] = useState('');
  const [loanDuration, setLoanDuration] = useState('');
  const [interestRate, setInterestRate] = useState(10); // 10% 默认利率
  const [expectedRepayment, setExpectedRepayment] = useState('0');
  
  // 用户借贷状态
  const [userActiveLoans, setUserActiveLoans] = useState([]);
  const [userAvailableLoans, setUserAvailableLoans] = useState([]);
  const [loadingLoans, setLoadingLoans] = useState(false);
  
  // 交易状态
  const [creatingLoan, setCreatingLoan] = useState(false);
  const [fundingLoan, setFundingLoan] = useState(false);
  const [repayingLoan, setRepayingLoan] = useState(false);
  const [error, setError] = useState('');
  const [txMessage, setTxMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // 系统信息
  const [loanToValueRatio, setLoanToValueRatio] = useState(75); // 默认75%
  const [platformFeeRate, setPlatformFeeRate] = useState(1); // 默认1%
  
  // 视图切换
  const [activeView, setActiveView] = useState('create'); // 'create', 'browse', 'my-loans'
  
  // 用户模式
  const [userMode, setUserMode] = useState('borrower'); // 'borrower' 或 'lender'
  
  // 获取用户NFT
  const fetchUserNFTs = useCallback(async () => {
    if (!account || !mainNftContract) {
      setUserOwnedNFTs([]);
      return;
    }
    
    setLoadingNFTs(true);
    setError('');
    
    try {
      const balanceBN = await mainNftContract.balanceOf(account);
      const balance = balanceBN.toNumber();
      
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
          
          // 构建NFT元数据
          let name = `NFT #${tokenId.toString()}`;
          let image = 'https://via.placeholder.com/150?text=No+Image';
          let nftValue = '0';
          
          // 尝试获取NFT估值
          try {
            if (alveyLendContract) {
              const nftContractAddress = await mainNftContract.getAddress();
              const valueRaw = await alveyLendContract.getNFTValuation(nftContractAddress, tokenId);
              nftValue = ethers.formatUnits(valueRaw, 18);
            }
          } catch (valError) {
            console.warn(`无法获取NFT #${tokenId.toString()}的估值:`, valError);
          }
          
          // 尝试获取元数据
          try {
            if (tokenURI) {
              // 处理IPFS URI
              if (tokenURI.startsWith('ipfs://')) {
                tokenURI = tokenURI.replace('ipfs://', 'https://ipfs.io/ipfs/');
              }
              
              // 处理相对路径
              if (tokenURI.startsWith('/')) {
                const response = await fetch(window.location.origin + tokenURI);
                if (response.ok) {
                  const metadata = await response.json();
                  name = metadata.name || name;
                  if (metadata.image) {
                    image = metadata.image.startsWith('ipfs://') 
                      ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') 
                      : metadata.image;
                  }
                }
              } else if (tokenURI.startsWith('http')) {
                const response = await fetch(tokenURI);
                if (response.ok) {
                  const metadata = await response.json();
                  name = metadata.name || name;
                  if (metadata.image) {
                    image = metadata.image.startsWith('ipfs://') 
                      ? metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') 
                      : metadata.image;
                  }
                }
              }
            }
          } catch (metadataError) {
            console.warn(`获取元数据失败 ${tokenURI}:`, metadataError);
          }
          
          nfts.push({ 
            id: tokenId.toString(), 
            uri: tokenURI || '', 
            name, 
            image,
            value: nftValue
          });
        } catch (individualNftError) {
          console.error(`获取NFT详情失败，索引 ${i}:`, individualNftError);
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
  }, [account, mainNftContract, alveyLendContract]);
  
  // 获取系统信息
  const fetchSystemInfo = useCallback(async () => {
    if (!alveyLendContract) return;
    
    try {
      const ltvRatio = await alveyLendContract.loanToValueRatio();
      setLoanToValueRatio(ltvRatio.toNumber() / 100); // 从基点转换为百分比
      
      const feeRate = await alveyLendContract.platformFeeRate();
      setPlatformFeeRate(feeRate.toNumber() / 100); // 从基点转换为百分比
    } catch (err) {
      console.error("获取系统信息失败:", err);
    }
  }, [alveyLendContract]);
  
  // 获取用户贷款
  const fetchUserLoans = useCallback(async () => {
    if (!account || !alveyLendContract) return;
    
    setLoadingLoans(true);
    
    try {
      const loanCount = await alveyLendContract.loanCounter();
      const activeLoans = [];
      const availableLoans = [];
      
      for (let i = 0; i < loanCount; i++) {
        const loan = await alveyLendContract.getLoan(i);
        
        // 为借款人获取激活的贷款
        if (userMode === 'borrower' && loan.borrower === account) {
          activeLoans.push({
            id: i,
            ...loan,
            amount: ethers.formatUnits(loan.amount, 18),
            interestRate: loan.interestRate.toNumber() / 100, // 从基点转为百分比
            startTime: loan.startTime.toNumber(),
            dueTime: loan.dueTime.toNumber(),
            collateralValue: ethers.formatUnits(loan.collateralValue, 18)
          });
        }
        
        // 为贷款人获取可用于融资的贷款
        if (userMode === 'lender' && loan.status === 0) { // CREATED状态
          availableLoans.push({
            id: i,
            ...loan,
            amount: ethers.formatUnits(loan.amount, 18),
            interestRate: loan.interestRate.toNumber() / 100, // 从基点转为百分比
            duration: loan.duration.toNumber(),
            collateralValue: ethers.formatUnits(loan.collateralValue, 18)
          });
        }
      }
      
      setUserActiveLoans(activeLoans);
      setUserAvailableLoans(availableLoans);
    } catch (err) {
      console.error("获取用户贷款失败:", err);
      setError("获取贷款列表失败，请稍后再试。");
    } finally {
      setLoadingLoans(false);
    }
  }, [account, alveyLendContract, userMode]);
  
  // 初始化
  useEffect(() => {
    fetchUserNFTs();
    fetchSystemInfo();
  }, [fetchUserNFTs, fetchSystemInfo]);
  
  // 当模式更改时重新获取贷款
  useEffect(() => {
    fetchUserLoans();
  }, [fetchUserLoans, userMode]);
  
  // 计算预期还款金额
  useEffect(() => {
    if (!loanAmount || !loanDuration) {
      setExpectedRepayment('0');
      return;
    }
    
    try {
      const principal = parseFloat(loanAmount);
      const days = parseFloat(loanDuration);
      const rate = interestRate / 100; // 转为小数
      
      // 简单计算 (本金 + 本金 * 年利率 * 天数 / 365)
      const interest = principal * rate * days / 365;
      const total = principal + interest;
      
      setExpectedRepayment(total.toFixed(4));
    } catch (err) {
      console.error("计算还款金额出错:", err);
      setExpectedRepayment('0');
    }
  }, [loanAmount, loanDuration, interestRate]);
  
  // 创建贷款
  const handleCreateLoan = async (e) => {
    e.preventDefault();
    
    if (!selectedNFT || !loanAmount || !loanDuration || !alveyLendContract || !provider || !mainNftContract) {
      setError("请选择一个NFT并填写所有借贷信息，并确保合约已正确加载。");
      return;
    }
    
    // 基本验证
    if (parseFloat(loanAmount) <= 0) {
      setError("借款金额必须大于0。");
      return;
    }
    
    if (parseInt(loanDuration) <= 0 || parseInt(loanDuration) > 365) {
      setError("借款期限必须在1到365天之间。");
      return;
    }
    
    setCreatingLoan(true);
    setError('');
    setTxMessage('');
    setSuccessMessage('');
    
    try {
      const signer = await provider.getSigner();
      const alveyLendWithSigner = alveyLendContract.connect(signer);
      const mainNftContractWithSigner = mainNftContract.connect(signer);
      
      const alveyLendContractAddress = await alveyLendContract.getAddress();
      
      setTxMessage(`正在授权NFT #${selectedNFT.id}给借贷合约...`);
      const approveTx = await mainNftContractWithSigner.approve(alveyLendContractAddress, selectedNFT.id);
      await approveTx.wait();
      setTxMessage("NFT授权成功！正在创建借贷订单...");
      
      const loanAmountInWei = ethers.parseUnits(loanAmount.toString(), 18);
      const durationInSeconds = parseInt(loanDuration) * 24 * 60 * 60;
      const mainNftContractActualAddress = await mainNftContract.getAddress();
      const paymentTokenAddress = "0xF88c032e746E3E701B316C8052bF271DB540871E"; // MARIO Token
      
      const createLoanTx = await alveyLendWithSigner.createLoan(
        mainNftContractActualAddress,
        selectedNFT.id,
        loanAmountInWei,
        durationInSeconds,
        paymentTokenAddress
      );
      
      setTxMessage(`借贷订单提交中... 交易哈希: ${createLoanTx.hash}`);
      await createLoanTx.wait();
      
      setSuccessMessage(`借贷订单创建成功！交易哈希: ${createLoanTx.hash}`);
      setTxMessage('');
      
      // 重置表单
      setSelectedNFT(null);
      setLoanAmount('');
      setLoanDuration('');
      
      // 刷新用户NFTs和贷款列表
      fetchUserNFTs();
      fetchUserLoans();
      
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
  
  // 贷款人资助贷款
  const handleFundLoan = async (loanId) => {
    if (!alveyLendContract || !provider) {
      setError("合约未正确加载。");
      return;
    }
    
    setFundingLoan(true);
    setError('');
    setTxMessage('');
    setSuccessMessage('');
    
    try {
      const loan = await alveyLendContract.getLoan(loanId);
      const loanAmount = loan.amount;
      
      const signer = await provider.getSigner();
      const alveyLendWithSigner = alveyLendContract.connect(signer);
      
      // 获取支付代币合约
      const tokenContract = new ethers.Contract(
        loan.paymentToken,
        ["function approve(address spender, uint256 amount) public returns (bool)"],
        signer
      );
      
      setTxMessage("正在授权支付代币...");
      const approveTx = await tokenContract.approve(await alveyLendContract.getAddress(), loanAmount);
      await approveTx.wait();
      
      setTxMessage("代币授权成功！正在资助贷款...");
      const fundTx = await alveyLendWithSigner.fundLoan(loanId);
      
      setTxMessage(`资助贷款交易提交中... 交易哈希: ${fundTx.hash}`);
      await fundTx.wait();
      
      setSuccessMessage(`贷款资助成功！交易哈希: ${fundTx.hash}`);
      setTxMessage('');
      
      // 刷新贷款列表
      fetchUserLoans();
      
    } catch (err) {
      console.error("资助贷款失败:", err);
      let specificError = err.message;
      if (err.data && err.data.message) {
        specificError = err.data.message;
      } else if (err.reason) {
        specificError = err.reason;
      }
      setError(`资助贷款失败: ${specificError}`);
      setTxMessage('');
    } finally {
      setFundingLoan(false);
    }
  };
  
  // 还款
  const handleRepayLoan = async (loanId) => {
    if (!alveyLendContract || !provider) {
      setError("合约未正确加载。");
      return;
    }
    
    setRepayingLoan(true);
    setError('');
    setTxMessage('');
    setSuccessMessage('');
    
    try {
      const loan = await alveyLendContract.getLoan(loanId);
      const interest = await alveyLendContract.calculateInterest(loanId);
      const totalRepayment = loan.amount.add(interest);
      
      const signer = await provider.getSigner();
      const alveyLendWithSigner = alveyLendContract.connect(signer);
      
      // 获取支付代币合约
      const tokenContract = new ethers.Contract(
        loan.paymentToken,
        ["function approve(address spender, uint256 amount) public returns (bool)"],
        signer
      );
      
      setTxMessage("正在授权支付代币进行还款...");
      const approveTx = await tokenContract.approve(await alveyLendContract.getAddress(), totalRepayment);
      await approveTx.wait();
      
      setTxMessage("代币授权成功！正在进行还款...");
      const repayTx = await alveyLendWithSigner.repayLoan(loanId);
      
      setTxMessage(`还款交易提交中... 交易哈希: ${repayTx.hash}`);
      await repayTx.wait();
      
      setSuccessMessage(`贷款已成功还清！交易哈希: ${repayTx.hash}`);
      setTxMessage('');
      
      // 刷新NFT和贷款列表
      fetchUserNFTs();
      fetchUserLoans();
      
    } catch (err) {
      console.error("贷款还款失败:", err);
      let specificError = err.message;
      if (err.data && err.data.message) {
        specificError = err.data.message;
      } else if (err.reason) {
        specificError = err.reason;
      }
      setError(`贷款还款失败: ${specificError}`);
      setTxMessage('');
    } finally {
      setRepayingLoan(false);
    }
  };
  
  // 渲染视图切换器
  const renderViewSelector = () => {
    return (
      <div className="view-selector">
        <button 
          className={`view-button ${activeView === 'create' ? 'active' : ''}`}
          onClick={() => setActiveView('create')}
        >
          创建借贷
        </button>
        <button 
          className={`view-button ${activeView === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveView('browse')}
        >
          浏览借贷
        </button>
        <button 
          className={`view-button ${activeView === 'my-loans' ? 'active' : ''}`}
          onClick={() => setActiveView('my-loans')}
        >
          我的借贷
        </button>
      </div>
    );
  };
  
  // 渲染用户模式切换器
  const renderUserModeSelector = () => {
    return (
      <div className="user-mode-selector">
        <label>您想要:</label>
        <div className="mode-buttons">
          <button 
            className={`mode-button ${userMode === 'borrower' ? 'active' : ''}`}
            onClick={() => setUserMode('borrower')}
          >
            抵押NFT借款
          </button>
          <button 
            className={`mode-button ${userMode === 'lender' ? 'active' : ''}`}
            onClick={() => setUserMode('lender')}
          >
            借出资金赚取利息
          </button>
        </div>
      </div>
    );
  };
  
  // 渲染创建借贷视图
  const renderCreateLoanView = () => {
    return (
      <div className="create-loan-view">
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
                <div className="nft-image-container">
                  <img src={nft.image} alt={nft.name} onError={(e) => e.target.src='https://via.placeholder.com/150?text=No+Image'} />
                </div>
                <div className="nft-details">
                  <h4>{nft.name}</h4>
                  <div className="nft-info">
                    <span>ID: {nft.id}</span>
                    <span>估值: {nft.value} MARIO</span>
                  </div>
                </div>
                <div className="nft-max-loan">
                  <span>最高可借: {(parseFloat(nft.value) * loanToValueRatio / 100).toFixed(2)} MARIO</span>
                </div>
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
                  min="0.000000000000000001"
                  step="any"
                />
                <div className="form-hint">
                  最大可借款金额: {(parseFloat(selectedNFT.value) * loanToValueRatio / 100).toFixed(2)} MARIO
                </div>
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
              <div className="form-group">
                <label htmlFor="interestRate">年利率 (%):</label>
                <input 
                  type="number" 
                  id="interestRate" 
                  value={interestRate} 
                  onChange={(e) => setInterestRate(e.target.value)} 
                  placeholder="例如: 10"
                  required 
                  min="1"
                  max="100"
                />
              </div>
              
              <div className="loan-summary">
                <h4>借贷摘要</h4>
                <div className="summary-item">
                  <span>借款金额:</span>
                  <span>{loanAmount || '0'} MARIO</span>
                </div>
                <div className="summary-item">
                  <span>利率:</span>
                  <span>{interestRate}% 年利率</span>
                </div>
                <div className="summary-item">
                  <span>期限:</span>
                  <span>{loanDuration || '0'} 天</span>
                </div>
                <div className="summary-item">
                  <span>预计还款总额:</span>
                  <span>{expectedRepayment} MARIO</span>
                </div>
                <div className="summary-item">
                  <span>平台手续费:</span>
                  <span>{platformFeeRate}%</span>
                </div>
              </div>
              
              <button type="submit" className="submit-loan-button" disabled={creatingLoan || !mainNftContract || !alveyLendContract || !account}>
                {creatingLoan ? '正在处理...' : '确认创建借贷'}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  };
  
  // 渲染浏览借贷视图
  const renderBrowseLoanView = () => {
    return (
      <div className="browse-loan-view">
        <h3>可用于资助的借贷</h3>
        {loadingLoans && <p className="loading-text">正在加载可用借贷...</p>}
        {!loadingLoans && userAvailableLoans.length === 0 && <p>目前没有可供资助的借贷。</p>}
        
        <div className="available-loans-grid">
          {userAvailableLoans.map(loan => (
            <div key={loan.id} className="loan-card">
              <div className="loan-header">
                <h4>借贷 #{loan.id}</h4>
                <span className="loan-status">等待资助</span>
              </div>
              <div className="loan-details">
                <div className="loan-info-item">
                  <span>借款金额:</span>
                  <span>{loan.amount} MARIO</span>
                </div>
                <div className="loan-info-item">
                  <span>期限:</span>
                  <span>{Math.floor(loan.duration / (24 * 60 * 60))} 天</span>
                </div>
                <div className="loan-info-item">
                  <span>年利率:</span>
                  <span>{loan.interestRate}%</span>
                </div>
                <div className="loan-info-item">
                  <span>抵押品估值:</span>
                  <span>{loan.collateralValue} MARIO</span>
                </div>
                <div className="loan-info-item">
                  <span>抵押率:</span>
                  <span>{(parseFloat(loan.amount) / parseFloat(loan.collateralValue) * 100).toFixed(2)}%</span>
                </div>
              </div>
              <button 
                className="fund-loan-button"
                onClick={() => handleFundLoan(loan.id)}
                disabled={fundingLoan}
              >
                {fundingLoan ? '处理中...' : '资助此借贷'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // 渲染我的借贷视图
  const renderMyLoansView = () => {
    return (
      <div className="my-loans-view">
        <h3>我的{userMode === 'borrower' ? '借入' : '借出'}</h3>
        {loadingLoans && <p className="loading-text">正在加载您的借贷记录...</p>}
        {!loadingLoans && userActiveLoans.length === 0 && <p>您暂时没有{userMode === 'borrower' ? '借入' : '借出'}记录。</p>}
        
        <div className="active-loans-grid">
          {userActiveLoans.map(loan => {
            const now = Math.floor(Date.now() / 1000);
            const isOverdue = now > loan.dueTime;
            const timeLeft = loan.dueTime - now;
            const daysLeft = Math.max(0, Math.floor(timeLeft / (24 * 60 * 60)));
            const hoursLeft = Math.max(0, Math.floor((timeLeft % (24 * 60 * 60)) / 3600));
            
            return (
              <div key={loan.id} className={`loan-card ${isOverdue ? 'overdue' : ''}`}>
                <div className="loan-header">
                  <h4>借贷 #{loan.id}</h4>
                  <span className={`loan-status ${isOverdue ? 'overdue' : ''}`}>
                    {isOverdue ? '已逾期' : '进行中'}
                  </span>
                </div>
                <div className="loan-details">
                  <div className="loan-info-item">
                    <span>借款金额:</span>
                    <span>{loan.amount} MARIO</span>
                  </div>
                  <div className="loan-info-item">
                    <span>年利率:</span>
                    <span>{loan.interestRate}%</span>
                  </div>
                  <div className="loan-info-item">
                    <span>到期时间:</span>
                    <span>{new Date(loan.dueTime * 1000).toLocaleString()}</span>
                  </div>
                  <div className="loan-info-item">
                    <span>剩余时间:</span>
                    <span className={isOverdue ? 'overdue' : ''}>
                      {isOverdue ? '已逾期' : `${daysLeft}天 ${hoursLeft}小时`}
                    </span>
                  </div>
                  {userMode === 'borrower' && (
                    <div className="loan-info-item">
                      <span>抵押品:</span>
                      <span>NFT #{loan.tokenId.toString()}</span>
                    </div>
                  )}
                </div>
                {userMode === 'borrower' && (
                  <button 
                    className="repay-loan-button"
                    onClick={() => handleRepayLoan(loan.id)}
                    disabled={repayingLoan}
                  >
                    {repayingLoan ? '处理中...' : '偿还贷款'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  // 主渲染函数
  return (
    <div className="alvey-lend-page-v2">
      <div className="alveylend-header">
        <button onClick={onExit} className="back-to-apphub-button">
          &larr; 返回应用中心
        </button>
        <h2>AlveyLend - NFT抵押借贷平台 <span className="version">V2</span></h2>
      </div>
      
      {renderUserModeSelector()}
      
      {error && <div className="error-message callout-danger">{error}</div>}
      {txMessage && <div className="tx-message callout-info">{txMessage}</div>}
      {successMessage && <div className="success-message callout-success">{successMessage}</div>}
      
      {renderViewSelector()}
      
      <div className="lend-content-wrapper">
        {activeView === 'create' && renderCreateLoanView()}
        {activeView === 'browse' && renderBrowseLoanView()}
        {activeView === 'my-loans' && renderMyLoansView()}
      </div>
      
      <div className="lend-footer">
        <div className="system-info">
          <div className="info-item">
            <span>抵押率:</span>
            <span>{loanToValueRatio}%</span>
          </div>
          <div className="info-item">
            <span>平台费率:</span>
            <span>{platformFeeRate}%</span>
          </div>
          <div className="info-item">
            <span>合约地址:</span>
            <a 
              href={`https://alveyscan.io/address/${alveyLendContract?.address || ''}`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              {alveyLendContract?.address ? 
                `${alveyLendContract.address.substring(0, 6)}...${alveyLendContract.address.substring(38)}` : 
                '未连接'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AlveyLendPageV2; 