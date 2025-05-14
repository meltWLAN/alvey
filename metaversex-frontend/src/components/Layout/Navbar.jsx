import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useWeb3 } from '../../contexts/Web3Context';
import { useVR } from '../../contexts/VRContext';
import { FaWallet, FaBars, FaTimes, FaVrCardboard, FaCoins } from 'react-icons/fa';

const Navbar = () => {
  const { account, isConnected, connectWallet, disconnectWallet, balance } = useWeb3();
  const { isVRSupported, isVRActive, enterVR, exitVR } = useVR();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Format account address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Format token balance for display
  const formatBalance = (bal) => {
    return parseFloat(bal).toFixed(2);
  };

  // Toggle mobile menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  // Toggle VR mode
  const toggleVR = async () => {
    if (isVRActive) {
      await exitVR();
    } else {
      await enterVR();
    }
  };

  return (
    <nav className="bg-black bg-opacity-80 backdrop-blur-md sticky top-0 z-50 border-b border-indigo-900/30">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              MetaverseX
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <NavLink to="/" className={({isActive}) => 
              `hover:text-indigo-400 transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-300'}`
            }>
              Home
            </NavLink>
            <NavLink to="/marketplace" className={({isActive}) => 
              `hover:text-indigo-400 transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-300'}`
            }>
              Marketplace
            </NavLink>
            <NavLink to="/spaces" className={({isActive}) => 
              `hover:text-indigo-400 transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-300'}`
            }>
              Spaces
            </NavLink>
            <NavLink to="/lending" className={({isActive}) => 
              `hover:text-indigo-400 transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-300'}`
            }>
              <div className="flex items-center">
                <FaCoins className="mr-1" />
                NFT Lending
              </div>
            </NavLink>
            <NavLink to="/create" className={({isActive}) => 
              `hover:text-indigo-400 transition-colors ${isActive ? 'text-indigo-400' : 'text-gray-300'}`
            }>
              Create
            </NavLink>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* VR Mode Button - Show only if supported */}
            {isVRSupported && (
              <button 
                onClick={toggleVR}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
                  ${isVRActive 
                    ? 'bg-purple-700 hover:bg-purple-800 text-white' 
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
              >
                <FaVrCardboard className="text-lg" />
                {isVRActive ? 'Exit VR' : 'Enter VR'}
              </button>
            )}

            {/* Wallet Connection */}
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="hidden lg:block text-sm text-gray-400 font-medium">
                  <span className="mr-1">{formatBalance(balance.token)} AVT</span>
                </div>
                <div className="relative group">
                  <button 
                    className="flex items-center gap-1 bg-indigo-700 hover:bg-indigo-800 px-3 py-1.5 rounded-lg text-sm font-medium"
                    onClick={disconnectWallet}
                  >
                    <FaWallet className="text-lg" />
                    <span>{formatAddress(account)}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl p-2 hidden group-hover:block">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded">
                      My Profile
                    </Link>
                    <button 
                      onClick={disconnectWallet}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button 
                onClick={connectWallet} 
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-medium"
              >
                <FaWallet className="text-lg" />
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="text-gray-300 hover:text-white"
            >
              {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-indigo-900/30 py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <NavLink 
              to="/" 
              className={({isActive}) => 
                `px-4 py-2 rounded-lg ${isActive ? 'bg-indigo-900/30 text-indigo-400' : 'text-gray-300'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink 
              to="/marketplace" 
              className={({isActive}) => 
                `px-4 py-2 rounded-lg ${isActive ? 'bg-indigo-900/30 text-indigo-400' : 'text-gray-300'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Marketplace
            </NavLink>
            <NavLink 
              to="/spaces" 
              className={({isActive}) => 
                `px-4 py-2 rounded-lg ${isActive ? 'bg-indigo-900/30 text-indigo-400' : 'text-gray-300'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Spaces
            </NavLink>
            <NavLink 
              to="/lending" 
              className={({isActive}) => 
                `px-4 py-2 rounded-lg ${isActive ? 'bg-indigo-900/30 text-indigo-400' : 'text-gray-300'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <FaCoins className="mr-2" />
                NFT Lending
              </div>
            </NavLink>
            <NavLink 
              to="/create" 
              className={({isActive}) => 
                `px-4 py-2 rounded-lg ${isActive ? 'bg-indigo-900/30 text-indigo-400' : 'text-gray-300'}`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Create
            </NavLink>
            
            {/* Mobile VR Button */}
            {isVRSupported && (
              <button 
                onClick={() => {
                  toggleVR();
                  setIsMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                  ${isVRActive 
                    ? 'bg-purple-700' 
                    : 'bg-gray-800'}`}
              >
                <FaVrCardboard className="text-lg" />
                {isVRActive ? 'Exit VR' : 'Enter VR'}
              </button>
            )}
            
            {/* Mobile Connect Wallet Button */}
            {!isConnected ? (
              <button 
                onClick={() => {
                  connectWallet();
                  setIsMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium"
              >
                <FaWallet className="text-lg" />
                Connect Wallet
              </button>
            ) : (
              <div className="space-y-2">
                <div className="px-4 py-2 text-sm text-gray-400">
                  <span>{formatBalance(balance.token)} AVT</span>
                </div>
                <Link 
                  to="/profile"
                  className="flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Profile
                </Link>
                <button 
                  onClick={() => {
                    disconnectWallet();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-gray-800 rounded-lg"
                >
                  Disconnect Wallet
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 