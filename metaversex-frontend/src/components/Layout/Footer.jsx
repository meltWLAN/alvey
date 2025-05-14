import React from 'react';
import { Link } from 'react-router-dom';
import { FaDiscord, FaTwitter, FaGithub, FaMedium } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black bg-opacity-70 border-t border-indigo-900/30 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex flex-col items-start">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                MetaverseX
              </span>
              <p className="mt-2 text-gray-400 text-sm">
                The premier 3D NFT marketplace on AlveyChain
              </p>
            </Link>
            
            {/* Social Links */}
            <div className="flex mt-4 space-x-4">
              <a 
                href="https://discord.gg/alveychain" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <FaDiscord size={20} />
              </a>
              <a 
                href="https://twitter.com/alveychain" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <FaTwitter size={20} />
              </a>
              <a 
                href="https://github.com/alveychain" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <FaGithub size={20} />
              </a>
              <a 
                href="https://medium.com/@alveychain" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <FaMedium size={20} />
              </a>
            </div>
          </div>
          
          {/* Nav Links */}
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-white">Marketplace</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/marketplace" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  All NFTs
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=art" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Art
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=game" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Game Assets
                </Link>
              </li>
              <li>
                <Link to="/marketplace?category=collectibles" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Collectibles
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-white">Spaces</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/spaces" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  All Spaces
                </Link>
              </li>
              <li>
                <Link to="/spaces?type=gallery" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Galleries
                </Link>
              </li>
              <li>
                <Link to="/spaces?type=venue" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Venues
                </Link>
              </li>
              <li>
                <Link to="/spaces?type=land" className="text-gray-400 hover:text-indigo-400 transition-colors">
                  Land Parcels
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-white">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://alveychain.com/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a 
                  href="https://alveychain.com/roadmap" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  Roadmap
                </a>
              </li>
              <li>
                <a 
                  href="https://alveychain.com/faq" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a 
                  href="https://alveychain.com/contact" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-indigo-400 transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>&copy; {currentYear} MetaverseX on AlveyChain. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 