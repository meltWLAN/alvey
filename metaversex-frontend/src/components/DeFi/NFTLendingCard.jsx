import React, { useState, useEffect } from 'react';
import { FaEthereum, FaLock, FaUnlock, FaInfoCircle } from 'react-icons/fa';
import { ethers } from 'ethers';
import { useWeb3 } from '../../contexts/Web3Context';
import { useNotification } from '../../contexts/NotificationContext';

const NFTLendingCard = ({ nft, onSuccess }) => {
  const { account, contracts, isConnected } = useWeb3();
  const { showSuccess, showError } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [lendingEnabled, setLendingEnabled] = useState(false);
  const [loanAmount, setLoanAmount] = useState('');
  const [duration, setDuration] = useState(30); // days
  const [nftValuation, setNftValuation] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  const [maxLoanAmount, setMaxLoanAmount] = useState(0);
  const [activeLoans, setActiveLoans] = useState([]);
  
  // Check if NFT is supported and fetch valuation
  useEffect(() => {
    const checkLendingEligibility = async () => {
      if (!isConnected || !nft) return;
      
      try {
        // In a real app, we would check with the contract if this NFT is supported
        // and fetch its current valuation
        
        // For demo purposes, we'll simulate this
        const mockValuation = nft.price * 2 * 1e18; // Just an example value
        const mockMaxLoan = mockValuation * 0.5; // 50% LTV
        const mockSupported = true;
        
        setNftValuation(mockValuation);
        setMaxLoanAmount(mockMaxLoan);
        setLendingEnabled(mockSupported);
        
        // TODO: Connect to actual contract in production
        /*
        const nftLendingContract = contracts.NFTLending;
        const isSupported = await nftLendingContract.supportedNFTContracts(nft.contractAddress);
        const valuation = await nftLendingContract.getNFTValuation(nft.contractAddress, nft.tokenId);
        const ltv = await nftLendingContract.loanToValueRatio();
        const maxLoanAmount = (valuation * ltv) / 10000;
        
        setNftValuation(valuation);
        setMaxLoanAmount(maxLoanAmount);
        setLendingEnabled(isSupported);
        */
      } catch (error) {
        console.error('Error checking lending eligibility:', error);
        setLendingEnabled(false);
      }
    };
    
    checkLendingEligibility();
  }, [nft, isConnected, contracts]);
  
  // Calculate interest rate when loan amount changes
  useEffect(() => {
    if (!loanAmount || !nftValuation) return;
    
    try {
      const loanAmountBN = ethers.utils.parseEther(loanAmount);
      const ltv = (loanAmountBN * 10000) / nftValuation;
      
      // Basic interest rate calculation based on LTV
      let rate = 5; // Base rate 5%
      
      if (ltv > 6000) {       // >60% - high risk
        rate += 15;           // +15%
      } else if (ltv > 4000) { // >40% - medium risk
        rate += 10;           // +10%
      } else if (ltv > 2000) { // >20% - low risk
        rate += 5;            // +5%
      }
      
      setInterestRate(rate);
    } catch (error) {
      console.error('Error calculating interest rate:', error);
    }
  }, [loanAmount, nftValuation]);
  
  // Handle creating a loan with the NFT as collateral
  const handleCreateLoan = async () => {
    if (!isConnected) {
      showError('Please connect your wallet first');
      return;
    }
    
    if (!loanAmount || parseFloat(loanAmount) <= 0) {
      showError('Please enter a valid loan amount');
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, we would call the contract
      // For demo purposes, we'll simulate success
      
      setTimeout(() => {
        const mockLoan = {
          id: Date.now().toString(),
          amount: loanAmount,
          interestRate: interestRate,
          duration: duration * 86400, // days to seconds
          startTime: Date.now() / 1000,
          status: 'active'
        };
        
        setActiveLoans([...activeLoans, mockLoan]);
        showSuccess('Loan created successfully!');
        setLoading(false);
        
        if (onSuccess) {
          onSuccess();
        }
      }, 2000);
      
      // TODO: Call the actual contract in production
      /*
      const nftLendingContract = contracts.NFTLending;
      const loanAmountWei = ethers.utils.parseEther(loanAmount);
      const durationSeconds = duration * 86400; // days to seconds
      
      const tx = await nftLendingContract.createLoan(
        nft.contractAddress,
        nft.tokenId,
        loanAmountWei,
        durationSeconds,
        contracts.PaymentToken.address
      );
      
      await tx.wait();
      
      showSuccess('Loan created successfully!');
      setLoading(false);
      
      if (onSuccess) {
        onSuccess();
      }
      */
    } catch (error) {
      console.error('Error creating loan:', error);
      showError('Failed to create loan: ' + error.message);
      setLoading(false);
    }
  };
  
  // Format ETH with 4 decimal places max
  const formatEth = (value) => {
    if (!value) return '0';
    return parseFloat(ethers.utils.formatEther(value.toString())).toFixed(4);
  };
  
  if (!nft) return null;
  
  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-sm p-6 rounded-xl border border-gray-700">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FaLock className="mr-2 text-indigo-400" />
        Use as Collateral
      </h2>
      
      {lendingEnabled ? (
        <>
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>NFT Valuation</span>
              <span>{formatEth(nftValuation)} AVT</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mb-1">
              <span>Maximum Loan</span>
              <span>{formatEth(maxLoanAmount)} AVT</span>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Loan Amount (AVT)</label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full bg-gray-700 bg-opacity-50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {interestRate > 0 && (
                <div className="text-sm text-gray-400 mt-1">
                  Interest Rate: {interestRate}% APR
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">Duration (days)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full bg-gray-700 bg-opacity-50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
                <option value={90}>90 days</option>
                <option value={180}>180 days</option>
                <option value={365}>365 days</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={handleCreateLoan}
            disabled={loading || !loanAmount || parseFloat(loanAmount) <= 0}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Get Loan'}
          </button>
          
          {activeLoans.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Active Loans</h3>
              {activeLoans.map(loan => (
                <div key={loan.id} className="bg-gray-700 bg-opacity-50 rounded-lg p-4 mb-2">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Loan Amount</span>
                    <span className="font-medium">{loan.amount} AVT</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-300">Interest Rate</span>
                    <span>{loan.interestRate}% APR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Due Date</span>
                    <span>{new Date((loan.startTime + loan.duration) * 1000).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8">
          <FaInfoCircle className="text-4xl text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">This NFT is not eligible for lending yet.</p>
          <p className="text-sm text-gray-500">Only certain NFT collections are supported for lending.</p>
        </div>
      )}
    </div>
  );
};

export default NFTLendingCard; 