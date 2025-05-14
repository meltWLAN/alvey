import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useVR } from '../contexts/VRContext';
import { useNotification } from '../contexts/NotificationContext';
import ReviewForm from '../components/Review/ReviewForm';
import ReviewList from '../components/Review/ReviewList';
import { formatEther } from '../utils/web3';
import { FaEthereum, FaCalendarAlt, FaVrCardboard, FaMapMarkerAlt, FaUsers, FaInfoCircle } from 'react-icons/fa';

// Mock Space data
const MOCK_SPACE = {
  id: '1',
  name: 'Crystal Palace Gallery',
  description: 'An elegant virtual gallery space with stunning architecture and perfect lighting for displaying your 3D NFT collection. Host events and invite visitors to explore your curated exhibits.',
  image: 'https://via.placeholder.com/1200x600/0A1128/FFFFFF?text=Crystal+Palace+Gallery',
  model3dUrl: 'https://example.com/models/crystal-palace.glb',
  price: '1.5',
  rentPrice: '0.1',
  owner: '0x1234567890abcdef1234567890abcdef12345678',
  creator: '0x9876543210abcdef1234567890abcdef12345678',
  tokenId: 12,
  capacity: 100,
  size: '2500 sq m',
  type: 'gallery',
  features: ['Custom Lighting', 'Interactive Displays', 'Voice Chat', 'Event Hosting'],
  createdAt: Date.now() - 1000000
};

// Mock reviews data
const MOCK_REVIEWS = [
  {
    author: '0xabcdef1234567890abcdef1234567890abcdef12',
    rating: 5,
    content: 'I hosted an art exhibition in this space and it was perfect! The lighting is exceptional and guests loved the ambiance.',
    timestamp: Date.now() - 86400000 * 3 // 3 days ago
  },
  {
    author: '0x7890abcdef1234567890abcdef1234567890abcd',
    rating: 4,
    content: 'Beautiful space with great acoustics. The only minor issue was navigating between levels, but overall a fantastic venue.',
    timestamp: Date.now() - 86400000 * 10 // 10 days ago
  }
];

const SpaceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, contracts, isConnected } = useWeb3();
  const { isVRSupported, enterVR } = useVR();
  const { showSuccess, showError } = useNotification();
  
  const [space, setSpace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRenting, setIsRenting] = useState(false);
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'reviews', 'events'
  const [rentalPeriod, setRentalPeriod] = useState(1); // days
  
  // Fetch Space data
  useEffect(() => {
    const fetchSpace = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would fetch from the blockchain
        // For the demo, we'll use the mock data
        setTimeout(() => {
          setSpace(MOCK_SPACE);
          setReviews(MOCK_REVIEWS);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching space:', error);
        showError('Failed to load space details');
        setIsLoading(false);
      }
    };
    
    fetchSpace();
  }, [id]);
  
  // Handle Space purchase
  const handlePurchase = async () => {
    if (!isConnected) {
      showError('Please connect your wallet to purchase this space');
      return;
    }
    
    try {
      setIsPurchasing(true);
      
      // In a real app, we would call the marketplace contract
      // For the demo, we'll simulate a delay
      setTimeout(() => {
        showSuccess('Space purchased successfully!');
        setIsPurchasing(false);
        // Update the owner
        setSpace(prev => ({ ...prev, owner: account }));
      }, 2000);
    } catch (error) {
      console.error('Error purchasing space:', error);
      showError('Failed to purchase space');
      setIsPurchasing(false);
    }
  };
  
  // Handle Space rental
  const handleRent = async () => {
    if (!isConnected) {
      showError('Please connect your wallet to rent this space');
      return;
    }
    
    if (rentalPeriod < 1) {
      showError('Rental period must be at least 1 day');
      return;
    }
    
    try {
      setIsRenting(true);
      
      // In a real app, we would call the rental contract
      // For the demo, we'll simulate a delay
      setTimeout(() => {
        showSuccess(`Space rented successfully for ${rentalPeriod} day${rentalPeriod > 1 ? 's' : ''}!`);
        setIsRenting(false);
      }, 2000);
    } catch (error) {
      console.error('Error renting space:', error);
      showError('Failed to rent space');
      setIsRenting(false);
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
  
  // Enter VR mode for this space
  const handleEnterVR = async () => {
    if (!isVRSupported) {
      showError('Your device does not support VR');
      return;
    }
    
    try {
      await enterVR();
      showSuccess('Entering VR mode...');
    } catch (error) {
      console.error('Error entering VR:', error);
      showError(`Failed to enter VR mode: ${error.message || 'Unknown error'}`);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-indigo-600/20 rounded-full"></div>
            <div className="absolute inset-0 border-t-4 border-indigo-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-400">Loading space details...</p>
        </div>
      </div>
    );
  }
  
  if (!space) {
    return (
      <div className="text-center my-16">
        <FaInfoCircle className="text-4xl text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Space Not Found</h2>
        <p className="text-gray-400 mb-6">The virtual space you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/spaces')}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
        >
          Browse Spaces
        </button>
      </div>
    );
  }
  
  const isOwner = account && space.owner.toLowerCase() === account.toLowerCase();
  
  return (
    <div className="py-8">
      {/* Space Images/Preview */}
      <div className="relative rounded-xl overflow-hidden mb-8 h-[40vh] bg-gray-800">
        <img 
          src={space.image} 
          alt={space.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-4xl font-bold mb-2 text-white">{space.name}</h1>
          <div className="flex flex-wrap items-center text-gray-300 gap-4">
            <div className="flex items-center">
              <FaMapMarkerAlt className="mr-1" />
              <span className="capitalize">{space.type}</span>
            </div>
            <div className="flex items-center">
              <FaUsers className="mr-1" />
              <span>Capacity: {space.capacity}</span>
            </div>
            <div className="flex items-center">
              <span>Size: {space.size}</span>
            </div>
          </div>
        </div>
        {isVRSupported && (
          <button
            onClick={handleEnterVR}
            className="absolute top-4 right-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-lg flex items-center"
          >
            <FaVrCardboard className="mr-2" />
            Explore in VR
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Space Details */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="mb-6">
            <div className="border-b border-gray-700">
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
                  onClick={() => setActiveTab('events')}
                  className={`px-4 py-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === 'events'
                      ? 'text-indigo-400 border-b-2 border-indigo-400'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Upcoming Events
                </button>
              </div>
            </div>
          </div>
          
          {/* Tab Content */}
          <div>
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">About This Space</h2>
                  <p className="text-gray-300">{space.description}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Features</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {space.features.map((feature, index) => (
                      <div 
                        key={index}
                        className="bg-gray-800 bg-opacity-50 px-4 py-3 rounded-lg text-center"
                      >
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Technical Specifications</h3>
                  <div className="bg-gray-800 bg-opacity-50 p-4 rounded-lg">
                    <ul className="space-y-3">
                      <li className="flex justify-between">
                        <span className="text-gray-400">Space Type:</span>
                        <span className="capitalize">{space.type}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-400">Size:</span>
                        <span>{space.size}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-400">Max Visitors:</span>
                        <span>{space.capacity}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-400">VR Compatible:</span>
                        <span>Yes</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-400">Mobile Compatible:</span>
                        <span>Yes (Limited Features)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <ReviewList reviews={reviews} emptyMessage="No reviews for this space yet" />
                
                <div className="mt-8">
                  <h3 className="text-xl font-bold mb-4">Add Your Review</h3>
                  <ReviewForm 
                    onSubmit={handleReviewSubmit}
                    itemType="space"
                    itemId={space.id}
                  />
                </div>
              </div>
            )}
            
            {/* Events Tab */}
            {activeTab === 'events' && (
              <div className="bg-gray-800 bg-opacity-50 p-6 rounded-xl">
                <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
                
                {isOwner ? (
                  <div className="mb-6">
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">
                      Schedule New Event
                    </button>
                  </div>
                ) : null}
                
                <div className="text-center py-8 text-gray-400">
                  <FaCalendarAlt className="text-4xl mx-auto mb-4 opacity-50" />
                  <p>No upcoming events scheduled for this space.</p>
                  {isOwner && (
                    <p className="mt-2">Create your first event to attract visitors!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Purchase/Rent Panel */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-sm p-6 rounded-xl border border-gray-700 sticky top-20">
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Purchase Options</h3>
              
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
                <div>
                  <p className="text-sm text-gray-400">Buy This Space</p>
                  <div className="flex items-center">
                    <FaEthereum className="text-indigo-400 mr-1" />
                    <span className="text-2xl font-bold">{space.price}</span>
                    <span className="text-gray-400 ml-1">AVT</span>
                  </div>
                </div>
                
                {!isOwner ? (
                  <button
                    onClick={handlePurchase}
                    disabled={isPurchasing}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPurchasing ? 'Processing...' : 'Buy Now'}
                  </button>
                ) : (
                  <div className="px-4 py-2 bg-gray-700 rounded-lg text-sm">
                    You own this
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-3">Rent This Space</p>
                <div className="flex items-center mb-4">
                  <FaEthereum className="text-indigo-400 mr-1" />
                  <span className="text-xl font-bold">{space.rentPrice}</span>
                  <span className="text-gray-400 ml-1">AVT / day</span>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">Rental Period (days)</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={rentalPeriod}
                    onChange={(e) => setRentalPeriod(parseInt(e.target.value) || 1)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                
                <div className="flex justify-between items-center mb-4 py-3 border-t border-b border-gray-700">
                  <span>Total Cost</span>
                  <div className="flex items-center">
                    <FaEthereum className="text-indigo-400 mr-1" />
                    <span className="font-bold">{(parseFloat(space.rentPrice) * rentalPeriod).toFixed(2)}</span>
                    <span className="text-gray-400 ml-1">AVT</span>
                  </div>
                </div>
                
                <button
                  onClick={handleRent}
                  disabled={isRenting || isOwner}
                  className="w-full py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRenting ? 'Processing...' : isOwner ? 'You Own This Space' : 'Rent Now'}
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Owner</h3>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center text-white font-bold mr-3">
                  {space.owner.slice(2, 4).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{space.owner.substring(0, 6)}...{space.owner.substring(space.owner.length - 4)}</p>
                  <p className="text-xs text-gray-400">Owner since 2 weeks ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpaceDetailPage; 