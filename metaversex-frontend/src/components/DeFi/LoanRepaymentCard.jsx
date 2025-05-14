import React, { useState, useEffect } from 'react';
import { FaUnlock, FaExclamationTriangle } from 'react-icons/fa';
import { ethers } from 'ethers';
import { useWeb3 } from '../../contexts/Web3Context';
import { useNotification } from '../../contexts/NotificationContext';

const LoanRepaymentCard = ({ loan, onSuccess }) => {
  const { account, contracts, isConnected } = useWeb3();
  const { showSuccess, showError } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [totalRepayment, setTotalRepayment] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [healthFactor, setHealthFactor] = useState(1);
  const [isRisky, setIsRisky] = useState(false);
  
  // Calculate loan details
  useEffect(() => {
    if (!loan) return;
    
    // Calculate health factor, total repayment, and time remaining
    const calculateLoanMetrics = () => {
      try {
        // Calculate time remaining
        const now = Math.floor(Date.now() / 1000);
        const dueTime = loan.startTime + loan.duration;
        const remainingSeconds = Math.max(0, dueTime - now);
        
        const days = Math.floor(remainingSeconds / 86400);
        const hours = Math.floor((remainingSeconds % 86400) / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        
        let timeString = '';
        if (days > 0) timeString += `${days}d `;
        if (hours > 0 || days > 0) timeString += `${hours}h `;
        timeString += `${minutes}m`;
        
        if (remainingSeconds <= 0) {
          timeString = 'Overdue';
        }
        
        setTimeRemaining(timeString);
        
        // Calculate total repayment with accrued interest
        const timeElapsed = now - loan.startTime;
        const interestRate = loan.interestRate / 100; // Convert from percentage
        const yearInSeconds = 365 * 24 * 60 * 60;
        const interestAccrued = loan.amount * interestRate * (timeElapsed / yearInSeconds);
        const totalAmount = parseFloat(loan.amount) + interestAccrued;
        
        setTotalRepayment(totalAmount);
        
        // Calculate health factor (in a real app this would come from the contract)
        // For demo purposes we'll simulate it
        let health = 1.2; // Default healthy value
        
        // Make it riskier as we approach due date
        if (remainingSeconds < 86400 * 3) { // Less than 3 days
          health = 0.9; // Approaching risky territory
        } else if (remainingSeconds < 86400 * 7) { // Less than 7 days
          health = 1.05; // Getting closer to risky
        }
        
        setHealthFactor(health);
        setIsRisky(health < 1);
      } catch (error) {
        console.error('Error calculating loan metrics:', error);
      }
    };
    
    calculateLoanMetrics();
    const intervalId = setInterval(calculateLoanMetrics, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, [loan]);
  
  // Handle loan repayment
  const handleRepay = async () => {
    if (!isConnected) {
      showError('Please connect your wallet first');
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, we would call the contract to repay the loan
      // For demo purposes, we'll simulate success
      
      setTimeout(() => {
        showSuccess('Loan repaid successfully! Your NFT has been returned to your wallet.');
        setLoading(false);
        
        if (onSuccess) {
          onSuccess(loan.id);
        }
      }, 2000);
      
      // TODO: Implement actual contract call in production
      /*
      const nftLendingContract = contracts.NFTLending;
      const paymentToken = contracts.PaymentToken;
      
      // Approve payment token for spending
      const approveTx = await paymentToken.approve(
        nftLendingContract.address,
        ethers.utils.parseEther(totalRepayment.toString())
      );
      await approveTx.wait();
      
      // Repay loan
      const repayTx = await nftLendingContract.repayLoan(loan.id);
      await repayTx.wait();
      
      showSuccess('Loan repaid successfully! Your NFT has been returned to your wallet.');
      setLoading(false);
      
      if (onSuccess) {
        onSuccess(loan.id);
      }
      */
    } catch (error) {
      console.error('Error repaying loan:', error);
      showError('Failed to repay loan: ' + error.message);
      setLoading(false);
    }
  };
  
  if (!loan) return null;
  
  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-sm p-6 rounded-xl border border-gray-700">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FaUnlock className="mr-2 text-indigo-400" />
        Loan #{loan.id.substring(0, 8)}
      </h2>
      
      <div className="space-y-2 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-400">Original Amount</span>
          <span>{loan.amount} AVT</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Interest Rate</span>
          <span>{loan.interestRate}% APR</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Total Repayment</span>
          <span className="font-medium">{totalRepayment.toFixed(4)} AVT</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Time Remaining</span>
          <span className={timeRemaining === 'Overdue' ? 'text-red-400' : ''}>
            {timeRemaining}
          </span>
        </div>
        
        {/* Health Factor */}
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400">Health Factor</span>
            <span className={`font-medium ${isRisky ? 'text-red-400' : 'text-green-400'}`}>
              {healthFactor.toFixed(2)}
            </span>
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                healthFactor > 1.5 ? 'bg-green-500' : 
                healthFactor > 1 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, healthFactor * 50)}%` }}
            ></div>
          </div>
          
          {isRisky && (
            <div className="flex items-center mt-2 text-red-400 text-sm">
              <FaExclamationTriangle className="mr-1" />
              <span>Your position is at risk of liquidation</span>
            </div>
          )}
        </div>
      </div>
      
      <button
        onClick={handleRepay}
        disabled={loading}
        className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Processing...' : 'Repay Loan'}
      </button>
    </div>
  );
};

export default LoanRepaymentCard; 