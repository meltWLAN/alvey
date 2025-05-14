import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaLock, FaUnlock, FaInfoCircle, FaHistory, FaExclamationTriangle, FaCoins } from 'react-icons/fa';
import { useWeb3 } from '../contexts/Web3Context';
import { useNotification } from '../contexts/NotificationContext';
import NFTLendingCard from '../components/DeFi/NFTLendingCard';
import LoanRepaymentCard from '../components/DeFi/LoanRepaymentCard';
import LiquidationCard from '../components/DeFi/LiquidationCard';
import LoadingState from '../components/LoadingState';

// Mock data for demonstration
const MOCK_NFTS = [
  {
    id: '1',
    name: 'Cosmic Explorer',
    description: 'A stunning 3D spacecraft designed for the metaverse.',
    image: 'https://via.placeholder.com/500x500/5D3FD3/FFFFFF?text=Cosmic+Explorer',
    price: '0.25',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenId: 42,
    owner: '0x9876543210abcdef1234567890abcdef12345678'
  },
  {
    id: '2',
    name: 'Digital Realm',
    description: 'A virtual space with custom architecture and interactive elements.',
    image: 'https://via.placeholder.com/500x500/E74C3C/FFFFFF?text=Digital+Realm',
    price: '0.75',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenId: 43,
    owner: '0x9876543210abcdef1234567890abcdef12345678'
  },
  {
    id: '3',
    name: 'Cyber Guardian',
    description: 'A futuristic character model with customizable attributes.',
    image: 'https://via.placeholder.com/500x500/3498DB/FFFFFF?text=Cyber+Guardian',
    price: '0.4',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenId: 44,
    owner: '0x9876543210abcdef1234567890abcdef12345678'
  }
];

// Mock loans data
const MOCK_LOANS = [
  {
    id: '1001',
    nftId: '1',
    nftName: 'Cosmic Explorer',
    nftImage: 'https://via.placeholder.com/500x500/5D3FD3/FFFFFF?text=Cosmic+Explorer',
    amount: '0.12',
    interestRate: 8,
    duration: 2592000, // 30 days in seconds
    startTime: Math.floor(Date.now() / 1000) - 604800, // 7 days ago
    status: 'active'
  }
];

const NFTLendingPage = () => {
  const { account, isConnected } = useWeb3();
  const { showSuccess, showError } = useNotification();
  
  const [activeTab, setActiveTab] = useState('borrow'); // 'borrow', 'loans', 'history', 'liquidate'
  const [loading, setLoading] = useState(true);
  const [myNFTs, setMyNFTs] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [loanHistory, setLoanHistory] = useState([]);
  const [acquiredNFTs, setAcquiredNFTs] = useState([]);
  
  // Fetch NFTs and loans
  useEffect(() => {
    const fetchData = async () => {
      if (!isConnected) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // In a real app, we would fetch data from the contracts
        // For demo purposes, we'll use mock data
        
        // Simulate API delay
        setTimeout(() => {
          // Filter NFTs owned by the current user
          const userNFTs = MOCK_NFTS.filter(nft => 
            account && nft.owner.toLowerCase() === account.toLowerCase()
          );
          
          // Filter loans belonging to the current user
          const userLoans = MOCK_LOANS;
          
          // Mock loan history
          const pastLoans = [
            {
              id: '1000',
              nftId: '3',
              nftName: 'Cyber Guardian',
              nftImage: 'https://via.placeholder.com/500x500/3498DB/FFFFFF?text=Cyber+Guardian',
              amount: '0.2',
              interestRate: 7,
              duration: 1209600, // 14 days in seconds
              startTime: Math.floor(Date.now() / 1000) - 1814400, // 21 days ago
              endTime: Math.floor(Date.now() / 1000) - 604800, // 7 days ago
              status: 'repaid',
              totalPaid: '0.21'
            }
          ];
          
          setMyNFTs(userNFTs);
          setActiveLoans(userLoans);
          setLoanHistory(pastLoans);
          setLoading(false);
        }, 1500);
        
      } catch (error) {
        console.error('Error fetching NFT lending data:', error);
        showError('Failed to load NFT lending data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [account, isConnected]);
  
  // Handle loan repayment success
  const handleLoanRepaid = (loanId) => {
    // Update active loans list
    setActiveLoans(prev => prev.filter(loan => loan.id !== loanId));
    
    // Add to loan history with repaid status
    const repaidLoan = activeLoans.find(loan => loan.id === loanId);
    if (repaidLoan) {
      const historyItem = {
        ...repaidLoan,
        status: 'repaid',
        endTime: Math.floor(Date.now() / 1000),
        totalPaid: (parseFloat(repaidLoan.amount) * 1.08).toFixed(2) // Simple interest calculation
      };
      setLoanHistory(prev => [historyItem, ...prev]);
    }
  };
  
  // Handle loan creation success
  const handleLoanCreated = () => {
    // In a real app, we would refresh the loans from the contract
    // For demo purposes, we'll switch to the loans tab
    setActiveTab('loans');
  };
  
  // Handle loan liquidation success
  const handleLoanLiquidated = (loan) => {
    // Add the NFT to the user's acquired NFTs
    const newNFT = {
      id: `acquired-${loan.id}`,
      name: loan.nftName,
      image: loan.nftImage,
      acquiredAt: Date.now(),
      originalValue: loan.nftValue,
      paidAmount: loan.liquidationPrice,
      savings: (parseFloat(loan.nftValue) - parseFloat(loan.liquidationPrice)).toFixed(4)
    };
    
    setAcquiredNFTs(prev => [newNFT, ...prev]);
    
    // Add to loan history with liquidated status
    const historyItem = {
      id: loan.id,
      nftId: loan.tokenId,
      nftName: loan.nftName,
      nftImage: loan.nftImage,
      amount: loan.amount,
      interestRate: loan.interestRate,
      duration: loan.duration,
      startTime: loan.startTime,
      endTime: Math.floor(Date.now() / 1000),
      status: 'liquidated',
      liquidator: account,
      totalPaid: loan.liquidationPrice
    };
    
    setLoanHistory(prev => [historyItem, ...prev]);
    
    // Show success message
    showSuccess(`Successfully liquidated loan and acquired ${loan.nftName}`);
  };
  
  if (!isConnected) {
    return (
      <div className="text-center py-16">
        <FaLock className="text-5xl text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
        <p className="text-gray-400 mb-6">Please connect your wallet to access NFT lending features.</p>
      </div>
    );
  }
  
  if (loading) {
    return <LoadingState message="Loading NFT lending data..." />;
  }
  
  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">NFT Lending</h1>
        <p className="text-gray-400">Use your NFTs as collateral to borrow tokens or earn by liquidating risky positions.</p>
      </div>
      
      {/* Tabs */}
      <div className="flex flex-wrap border-b border-gray-700 mb-8">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'borrow' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('borrow')}
        >
          Borrow with NFTs
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'loans' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('loans')}
        >
          Active Loans
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'liquidate' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('liquidate')}
        >
          <div className="flex items-center">
            <FaCoins className="mr-1" />
            Liquidate Loans
          </div>
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'history' ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setActiveTab('history')}
        >
          Loan History
        </button>
      </div>
      
      {/* Borrow Tab */}
      {activeTab === 'borrow' && (
        <div>
          <h2 className="text-xl font-bold mb-4">My NFTs</h2>
          
          {myNFTs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myNFTs.map(nft => (
                <div key={nft.id} className="bg-gray-800 bg-opacity-50 rounded-xl overflow-hidden">
                  <div className="aspect-square relative">
                    <img 
                      src={nft.image} 
                      alt={nft.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold mb-1">{nft.name}</h3>
                    <div className="flex justify-between mb-4">
                      <span className="text-gray-400 text-sm">Token ID: {nft.tokenId}</span>
                      <span className="text-gray-400 text-sm">{nft.price} AVT</span>
                    </div>
                    
                    <NFTLendingCard nft={nft} onSuccess={handleLoanCreated} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-800 bg-opacity-30 rounded-xl">
              <FaInfoCircle className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No NFTs Found</h3>
              <p className="text-gray-400 mb-4">You don't have any NFTs in your wallet that can be used for lending.</p>
              <Link 
                to="/marketplace" 
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors inline-block"
              >
                Browse Marketplace
              </Link>
            </div>
          )}
        </div>
      )}
      
      {/* Active Loans Tab */}
      {activeTab === 'loans' && (
        <div>
          <h2 className="text-xl font-bold mb-4">My Active Loans</h2>
          
          {activeLoans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeLoans.map(loan => (
                <div key={loan.id} className="bg-gray-800 bg-opacity-50 rounded-xl overflow-hidden">
                  <div className="aspect-video relative">
                    <img 
                      src={loan.nftImage} 
                      alt={loan.nftName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                      <div>
                        <h3 className="text-lg font-bold">{loan.nftName}</h3>
                        <p className="text-sm text-gray-300">Collateral for Loan #{loan.id.substring(0, 6)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <LoanRepaymentCard loan={loan} onSuccess={handleLoanRepaid} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-800 bg-opacity-30 rounded-xl">
              <FaUnlock className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Active Loans</h3>
              <p className="text-gray-400 mb-4">You don't have any active loans at the moment.</p>
              <button 
                onClick={() => setActiveTab('borrow')}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors inline-block"
              >
                Create a Loan
              </button>
            </div>
          )}
          
          {/* Acquired NFTs section */}
          {acquiredNFTs.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xl font-bold mb-4">NFTs Acquired Through Liquidation</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {acquiredNFTs.map(nft => (
                  <div key={nft.id} className="bg-gray-800 bg-opacity-50 rounded-lg overflow-hidden">
                    <div className="aspect-square relative">
                      <img 
                        src={nft.image} 
                        alt={nft.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className="bg-green-500 bg-opacity-70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                          {nft.savings} AVT saved
                        </span>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm">{nft.name}</h3>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Acquired {new Date(nft.acquiredAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Liquidation Tab */}
      {activeTab === 'liquidate' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Liquidate Risky Loans</h2>
            <div>
              <button 
                className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm flex items-center"
                onClick={() => setActiveTab('history')}
              >
                <FaHistory className="mr-1" />
                View Liquidation History
              </button>
            </div>
          </div>
          
          <div className="bg-gray-800 bg-opacity-30 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold mb-3 flex items-center">
              <FaInfoCircle className="mr-2 text-indigo-400" />
              How Liquidation Works
            </h3>
            <p className="text-gray-300 mb-4">
              When a loan becomes risky (health factor &lt; 1) or overdue, it can be liquidated by any user. 
              By repaying the loan, you receive the collateralized NFT at a discount from its current market value.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
                <h4 className="font-medium mb-1">1. Find Risky Loans</h4>
                <p className="text-gray-400">Browse loans with low health factors or that have passed their due date.</p>
              </div>
              <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
                <h4 className="font-medium mb-1">2. Pay Liquidation Price</h4>
                <p className="text-gray-400">Pay the loan amount plus accrued interest and a small liquidation penalty.</p>
              </div>
              <div className="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
                <h4 className="font-medium mb-1">3. Receive the NFT</h4>
                <p className="text-gray-400">The NFT is transferred to your wallet, often at a discount from market value.</p>
              </div>
            </div>
          </div>
          
          <LiquidationCard onSuccess={handleLoanLiquidated} />
        </div>
      )}
      
      {/* Loan History Tab */}
      {activeTab === 'history' && (
        <div>
          <h2 className="text-xl font-bold mb-4">Loan History</h2>
          
          {loanHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800 bg-opacity-50">
                    <th className="px-4 py-3 text-left">NFT</th>
                    <th className="px-4 py-3 text-left">Loan Amount</th>
                    <th className="px-4 py-3 text-left">Interest Rate</th>
                    <th className="px-4 py-3 text-left">Total Paid</th>
                    <th className="px-4 py-3 text-left">Duration</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {loanHistory.map(loan => (
                    <tr key={loan.id} className="hover:bg-gray-800 hover:bg-opacity-30">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <img 
                            src={loan.nftImage} 
                            alt={loan.nftName}
                            className="w-10 h-10 rounded object-cover mr-3"
                          />
                          <span>{loan.nftName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">{loan.amount} AVT</td>
                      <td className="px-4 py-3">{loan.interestRate}% APR</td>
                      <td className="px-4 py-3">{loan.totalPaid} AVT</td>
                      <td className="px-4 py-3">{Math.floor(loan.duration / 86400)} days</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          loan.status === 'repaid' 
                            ? 'bg-green-500 bg-opacity-20 text-green-400' 
                            : loan.status === 'liquidated'
                            ? 'bg-red-500 bg-opacity-20 text-red-400'
                            : 'bg-gray-500 bg-opacity-20 text-gray-400'
                        }`}>
                          {loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-800 bg-opacity-30 rounded-xl">
              <FaHistory className="text-4xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No Loan History</h3>
              <p className="text-gray-400">Your previous loans will appear here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NFTLendingPage; 