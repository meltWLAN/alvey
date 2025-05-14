import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useNotification } from '../contexts/NotificationContext';
import ReviewForm from '../components/Review/ReviewForm';
import ReviewList from '../components/Review/ReviewList';
import NFTLendingCard from '../components/DeFi/NFTLendingCard';
import { formatEther } from '../utils/web3';
import { FaEthereum, FaGlobe, FaCube, FaHistory, FaInfoCircle, FaLock, FaCoins } from 'react-icons/fa';

// Mock NFT data - in a real app this would come from the blockchain
const MOCK_NFT = {
  id: '1',
  name: 'Cosmic Explorer',
  description: 'A stunning 3D spacecraft designed for the metaverse. Explore virtual worlds with this unique vessel that combines futuristic aesthetics with practical functionality.',
  image: 'https://via.placeholder.com/800x800/5D3FD3/FFFFFF?text=Cosmic+Explorer',
  model3dUrl: 'https://example.com/models/cosmic-explorer.glb',
  price: '0.25',
  creator: '0x1234567890abcdef1234567890abcdef12345678',
  owner: '0x9876543210abcdef1234567890abcdef12345678',
  tokenId: 42,
  contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
  category: 'space',
  createdAt: Date.now() - 1000000,
  attributes: [
    { trait_type: 'Rarity', value: 'Legendary' },
    { trait_type: 'Level', value: '5' },
    { trait_type: 'Speed', value: '95' },
    { trait_type: 'Durability', value: '80' }
  ]
};

// Mock reviews data
const MOCK_REVIEWS = [
  {
    author: '0xabcdef1234567890abcdef1234567890abcdef12',
    rating: 5,
    content: 'This is an amazing 3D NFT asset! The detail is incredible and it works perfectly in my virtual space.',
    timestamp: Date.now() - 86400000 * 2 // 2 days ago
  },
  {
    author: '0x7890abcdef1234567890abcdef1234567890abcd',
    rating: 4,
    content: 'Great model, just a little issue with the textures in certain lighting conditions. Otherwise perfect!',
    timestamp: Date.now() - 86400000 * 7 // 7 days ago
  }
];

const NFTDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, contracts, isConnected } = useWeb3();
  const { showSuccess, showError } = useNotification();
  
  const [nft, setNft] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'reviews', 'history', 'lending'
  
  // Fetch NFT data
  useEffect(() => {
    const fetchNFT = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would fetch from the blockchain
        // For the demo, we'll use the mock data
        setTimeout(() => {
          setNft(MOCK_NFT);
          setReviews(MOCK_REVIEWS);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching NFT:', error);
        showError('Failed to load NFT details');
        setIsLoading(false);
      }
    };
    
    fetchNFT();
  }, [id]);
  
  // Handle NFT purchase
  const handlePurchase = async () => {
    if (!isConnected) {
      showError('Please connect your wallet to purchase this NFT');
      return;
    }
    
    try {
      setIsPurchasing(true);
      
      // In a real app, we would call the marketplace contract
      // For the demo, we'll simulate a delay
      setTimeout(() => {
        showSuccess('NFT purchased successfully!');
        setIsPurchasing(false);
        // Update the owner
        setNft(prev => ({ ...prev, owner: account }));
      }, 2000);
    } catch (error) {
      console.error('Error purchasing NFT:', error);
      showError('Failed to purchase NFT');
      setIsPurchasing(false);
    }
  };
  
  // Handle review submission
  const handleReviewSubmit = async (reviewData) => {
    try {
      // In a real app, we would store the review on a backend or blockchain
      // For the demo, we'll just update the local state
      const newReview = {
        ...reviewData,
        id: Date.now().toString()
      };
      
      setReviews(prev => [newReview, ...prev]);
      return true;
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };
  
  // Handle successful loan creation
  const handleLoanCreated = () => {
    showSuccess('Loan created successfully! Navigate to the Lending page to manage your loans.');
    // In a real app we might redirect to the lending page or update UI
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-indigo-600/20 rounded-full"></div>
            <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400">Loading NFT details...</p>
        </div>
      </div>
    );
  }
  
  if (!nft) {
    return (
      <div className="text-center my-16">
        <FaInfoCircle className="text-4xl text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">NFT Not Found</h2>
        <p className="text-gray-400 mb-6">The NFT you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/marketplace')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }
  
  const isOwner = account && nft.owner.toLowerCase() === account.toLowerCase();
  
  return (
    <div className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* NFT Image/3D Model */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 bg-opacity-50 rounded-xl overflow-hidden shadow-xl aspect-square relative">
            <img 
              src={nft.image} 
              alt={nft.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 right-4">
              <button
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-lg flex items-center"
              >
                <FaCube className="mr-2" />
                View in 3D
              </button>
            </div>
          </div>
        </div>
        
        {/* NFT Details */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-sm p-6 rounded-xl border border-gray-700">
            <h1 className="text-3xl font-bold mb-2">{nft.name}</h1>
            <div className="flex items-center mb-4">
              <span className="text-gray-400 text-sm">Token ID: {nft.tokenId}</span>
              <span className="mx-2 text-gray-600">•</span>
              <span className="text-gray-400 text-sm capitalize">{nft.category}</span>
            </div>
            
            <p className="text-gray-300 mb-6">{nft.description}</p>
            
            {/* Price and Purchase */}
            <div className="bg-gray-700 bg-opacity-50 p-4 rounded-lg mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400">Current Price</p>
                  <div className="flex items-center">
                    <FaEthereum className="text-indigo-400 mr-1" />
                    <span className="text-2xl font-bold">{nft.price}</span>
                    <span className="text-gray-400 ml-1">AVT</span>
                  </div>
                </div>
                
                {!isOwner ? (
                  <button
                    onClick={handlePurchase}
                    disabled={isPurchasing}
                    className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPurchasing ? 'Processing...' : 'Purchase'}
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <div className="px-4 py-2 bg-gray-700 rounded-lg text-sm">
                      You own this NFT
                    </div>
                    <button
                      onClick={() => setActiveTab('lending')}
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm flex items-center"
                    >
                      <FaLock className="mr-1" />
                      Use as Collateral
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Attributes */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Attributes</h2>
              <div className="grid grid-cols-2 gap-2">
                {nft.attributes.map((attr, index) => (
                  <div 
                    key={index}
                    className="bg-gray-700 bg-opacity-50 p-3 rounded-lg"
                  >
                    <p className="text-xs text-gray-400">{attr.trait_type}</p>
                    <p className="font-medium">{attr.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mt-8">
        <div className="border-b border-gray-700 mb-6">
          <div className="flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'details'
                  ? 'text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'reviews'
                  ? 'text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              Reviews ({reviews.length})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'history'
                  ? 'text-indigo-400 border-b-2 border-indigo-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              History
            </button>
            {isOwner && (
              <button
                onClick={() => setActiveTab('lending')}
                className={`px-4 py-2 font-medium text-sm whitespace-nowrap flex items-center ${
                  activeTab === 'lending'
                    ? 'text-indigo-400 border-b-2 border-indigo-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <FaCoins className="mr-1" />
                Lending
              </button>
            )}
          </div>
        </div>
        
        {/* Tab Content */}
        <div>
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold mb-4">About This NFT</h2>
                <p className="text-gray-300 mb-4">
                  {nft.description}
                </p>
                <p className="text-gray-300">
                  This 3D model is compatible with most VR/AR platforms and can be imported into
                  various metaverse environments.
                </p>
              </div>
              <div>
                <h2 className="text-xl font-bold mb-4">Technical Details</h2>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <span className="font-medium w-32">Format:</span>
                    <span>glTF 2.0</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium w-32">Polygon Count:</span>
                    <span>15,000</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium w-32">Textures:</span>
                    <span>4K PBR (Diffuse, Normal, Metallic, Roughness)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium w-32">Animations:</span>
                    <span>Yes (Idle, Moving, Special)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-medium w-32">VR Compatible:</span>
                    <span>Yes</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
          
          {activeTab === 'reviews' && (
            <div className="space-y-8">
              <ReviewList reviews={reviews} />
              
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4">Add Your Review</h3>
                <ReviewForm 
                  onSubmit={handleReviewSubmit}
                  itemType="nft"
                  itemId={nft.id}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'history' && (
            <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-sm p-6 rounded-xl border border-gray-700">
              <h2 className="text-xl font-bold mb-4">Transaction History</h2>
              <div className="space-y-4">
                <div className="border-b border-gray-700 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Minted</p>
                      <p className="text-sm text-gray-400">By {nft.creator.substring(0, 6)}...{nft.creator.substring(nft.creator.length - 4)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">1 week ago</p>
                      <div className="flex items-center text-indigo-400">
                        <FaGlobe className="mr-1" />
                        <span className="text-sm">View on Explorer</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="border-b border-gray-700 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Listed for Sale</p>
                      <p className="text-sm text-gray-400">By {nft.creator.substring(0, 6)}...{nft.creator.substring(nft.creator.length - 4)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">5 days ago</p>
                      <div className="flex items-center">
                        <FaEthereum className="text-indigo-400 mr-1" />
                        <span>{nft.price}</span>
                        <span className="text-gray-400 ml-1">AVT</span>
                      </div>
                    </div>
                  </div>
                </div>
                {isOwner && (
                  <div className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Purchased</p>
                        <p className="text-sm text-gray-400">By You</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">Just now</p>
                        <div className="flex items-center">
                          <FaEthereum className="text-indigo-400 mr-1" />
                          <span>{nft.price}</span>
                          <span className="text-gray-400 ml-1">AVT</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'lending' && isOwner && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-sm p-6 rounded-xl border border-gray-700 mb-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <FaCoins className="mr-2 text-indigo-400" />
                    NFT Lending
                  </h2>
                  <p className="text-gray-300 mb-4">
                    Use your NFT as collateral to borrow AVT tokens. The platform will lock your NFT in a smart 
                    contract until you repay the loan with interest.
                  </p>
                  <div className="bg-indigo-900/20 border border-indigo-800/30 rounded-lg p-4 mb-4">
                    <h3 className="font-medium mb-2 text-indigo-300">Benefits of NFT-backed Loans</h3>
                    <ul className="text-gray-300 space-y-1 text-sm">
                      <li>• Keep ownership of your NFT while accessing liquidity</li>
                      <li>• No credit checks or KYC required</li>
                      <li>• Competitive interest rates based on NFT value</li>
                      <li>• Loan terms from 7 to 365 days</li>
                    </ul>
                  </div>
                  <Link 
                    to="/lending" 
                    className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center"
                  >
                    <FaHistory className="mr-1" />
                    View all your lending activity
                  </Link>
                </div>
              </div>
              
              <div>
                <NFTLendingCard nft={nft} onSuccess={handleLoanCreated} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NFTDetailPage; 