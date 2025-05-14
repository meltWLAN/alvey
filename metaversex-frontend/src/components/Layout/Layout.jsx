import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import NetworkAlert from '../UI/NetworkAlert';
import { useWeb3 } from '../../contexts/Web3Context';

const Layout = () => {
  const { isConnected, networkName } = useWeb3();
  
  // Check if on correct network (Alvey Chain)
  const isCorrectNetwork = networkName === 'alveychain' || networkName === 'localhost';
  
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <Navbar />
      
      {/* Network alert if connected but on wrong network */}
      {isConnected && !isCorrectNetwork && (
        <NetworkAlert 
          message="Please connect to Alvey Chain network to use all features"
          networkName={networkName}
        />
      )}
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Outlet />
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout; 