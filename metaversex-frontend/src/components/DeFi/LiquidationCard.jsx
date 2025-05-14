import React, { useState, useEffect } from 'react';
import { FaSearch, FaExclamationTriangle, FaCoins } from 'react-icons/fa';
import { ethers } from 'ethers';
import { useWeb3 } from '../../contexts/Web3Context';
import { useNotification } from '../../contexts/NotificationContext';

const LiquidationCard = ({ onSuccess }) => {
  const { account, contracts, isConnected } = useWeb3();
  const { showSuccess, showError } = useNotification();
  
  const [loading, setLoading] = useState(false);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [liquidableLoans, setLiquidableLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  
  // Fetch liquidable loans
  useEffect(() => {
    const fetchLiquidableLoans = async () => {
      if (!isConnected) return;
      
      try {
        setLoadingLoans(true);
        
        // In a real app, we would fetch data from the contract
        // For demo purposes, we'll use mock data
        
        // Simulate API delay
        setTimeout(() => {
          // These are loans that are either past due or undercollateralized
          const mockLiquidableLoans = [
            {
              id: '1002',
              borrower: '0x8765432109abcdef1234567890abcdef12345678',
              nftName: 'Digital Realm',
              nftImage: 'https://via.placeholder.com/500x500/E74C3C/FFFFFF?text=Digital+Realm',
              contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
              tokenId: 43,
              amount: '0.35',
              interestRate: 15,
              duration: 1209600, // 14 days in seconds
              startTime: Math.floor(Date.now() / 1000) - 1209600, // 14 days ago
              dueTime: Math.floor(Date.now() / 1000), // due now
              status: 'active',
              healthFactor: 0.8,
              totalDebt: '0.38',
              liquidationPrice: '0.42',
              nftValue: '0.45',
              reason: 'Overdue'
            },
            {
              id: '1003',
              borrower: '0x5678901234abcdef1234567890abcdef12345678',
              nftName: 'Cyber Guardian',
              nftImage: 'https://via.placeholder.com/500x500/3498DB/FFFFFF?text=Cyber+Guardian',
              contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
              tokenId: 44,
              amount: '0.2',
              interestRate: 20,
              duration: 2592000, // 30 days in seconds
              startTime: Math.floor(Date.now() / 1000) - 1296000, // 15 days ago
              dueTime: Math.floor(Date.now() / 1000) + 1296000, // 15 days left
              status: 'active',
              healthFactor: 0.7,
              totalDebt: '0.22',
              liquidationPrice: '0.24',
              nftValue: '0.25',
              reason: 'Undercollateralized'
            }
          ];
          
          setLiquidableLoans(mockLiquidableLoans);
          setFilteredLoans(mockLiquidableLoans);
          setLoadingLoans(false);
        }, 1500);
        
      } catch (error) {
        console.error('Error fetching liquidable loans:', error);
        showError('Failed to load liquidable loans');
        setLoadingLoans(false);
      }
    };
    
    fetchLiquidableLoans();
  }, [isConnected]);
  
  // Filter loans when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredLoans(liquidableLoans);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = liquidableLoans.filter(loan => 
      loan.nftName.toLowerCase().includes(query) ||
      loan.id.includes(query) ||
      loan.borrower.toLowerCase().includes(query) ||
      loan.tokenId.toString().includes(query)
    );
    
    setFilteredLoans(filtered);
  }, [searchQuery, liquidableLoans]);
  
  // Handle loan liquidation
  const handleLiquidate = async (loan) => {
    if (!isConnected) {
      showError('Please connect your wallet first');
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real app, we would call the contract to liquidate the loan
      // For demo purposes, we'll simulate success
      
      setTimeout(() => {
        showSuccess('Loan liquidated successfully! The NFT has been transferred to your wallet.');
        setLoading(false);
        
        // Remove liquidated loan from the list
        setLiquidableLoans(prev => prev.filter(l => l.id !== loan.id));
        setFilteredLoans(prev => prev.filter(l => l.id !== loan.id));
        
        if (onSuccess) {
          onSuccess(loan);
        }
      }, 2000);
      
      // TODO: Implement actual contract call in production
      /*
      const nftLendingContract = contracts.NFTLending;
      const paymentToken = contracts.PaymentToken;
      
      // Approve payment token for spending
      const approveTx = await paymentToken.approve(
        nftLendingContract.address,
        ethers.utils.parseEther(loan.liquidationPrice)
      );
      await approveTx.wait();
      
      // Liquidate loan
      const liquidateTx = await nftLendingContract.liquidateLoan(loan.id);
      await liquidateTx.wait();
      
      showSuccess('Loan liquidated successfully! The NFT has been transferred to your wallet.');
      setLoading(false);
      
      // Remove liquidated loan from the list
      setLiquidableLoans(prev => prev.filter(l => l.id !== loan.id));
      setFilteredLoans(prev => prev.filter(l => l.id !== loan.id));
      
      if (onSuccess) {
        onSuccess(loan);
      }
      */
    } catch (error) {
      console.error('Error liquidating loan:', error);
      showError('Failed to liquidate loan: ' + error.message);
      setLoading(false);
    }
  };
  
  if (!isConnected) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-400">Please connect your wallet to view liquidable loans.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, NFT name, or borrower address..."
              className="w-full bg-gray-700 bg-opacity-50 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
          </div>
        </div>
      </div>
      
      {loadingLoans ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-indigo-500 border-r-2 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading liquidable loans...</p>
        </div>
      ) : filteredLoans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLoans.map(loan => (
            <div key={loan.id} className="bg-gray-800 bg-opacity-50 rounded-xl overflow-hidden border border-gray-700">
              <div className="aspect-video relative">
                <img 
                  src={loan.nftImage} 
                  alt={loan.nftName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-between p-4">
                  <div className="self-end">
                    <span className="bg-red-500 bg-opacity-70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                      {loan.reason}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{loan.nftName}</h3>
                    <p className="text-sm text-gray-300">ID: {loan.tokenId}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Borrower</span>
                    <span className="text-gray-300">
                      {loan.borrower.substring(0, 6)}...{loan.borrower.substring(loan.borrower.length - 4)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Total Debt</span>
                    <span className="text-gray-300">{loan.totalDebt} AVT</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Liquidation Price</span>
                    <span className="font-medium text-indigo-400">{loan.liquidationPrice} AVT</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">NFT Value</span>
                    <span className="text-green-400">{loan.nftValue} AVT</span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400 text-sm">Health Factor</span>
                      <span className="text-red-400 font-medium">{loan.healthFactor.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="h-2.5 rounded-full bg-red-500"
                        style={{ width: `${Math.min(100, loan.healthFactor * 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center mt-2 text-red-400 text-sm">
                      <FaExclamationTriangle className="mr-1" />
                      <span>Position is ready for liquidation</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleLiquidate(loan)}
                  disabled={loading}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaCoins className="text-lg" />
                  {loading ? 'Processing...' : 'Liquidate Position'}
                </button>
                
                <p className="text-xs text-gray-500 text-center mt-2">
                  Buy this NFT at a discount by repaying the loan
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800 bg-opacity-30 rounded-xl">
          <FaSearch className="text-4xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">No Liquidable Loans Found</h3>
          <p className="text-gray-400">
            {searchQuery ? 'No loans match your search criteria.' : 'There are no loans available for liquidation at the moment.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default LiquidationCard; 