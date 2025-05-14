import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { VRProvider } from './contexts/VRContext';
import { Web3Provider } from './contexts/Web3Context';
import { NotificationProvider } from './contexts/NotificationContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import MarketplacePage from './pages/MarketplacePage';
import NFTDetailPage from './pages/NFTDetailPage';
import SpacesPage from './pages/SpacesPage';
import SpaceDetailPage from './pages/SpaceDetailPage';
import CreateNFTPage from './pages/CreateNFTPage';
import ProfilePage from './pages/ProfilePage';
import NFTLendingPage from './pages/NFTLendingPage';
import NFTStakingPage from './pages/NFTStakingPage';
import NotificationCenter from './components/NotificationCenter';

// Layout components
const Layout = lazy(() => import('./components/Layout/Layout'));
const LoadingScreen = lazy(() => import('./components/UI/LoadingScreen'));

// Pages
const HomePage = lazy(() => import('./pages/HomePage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const NFTDetailPage = lazy(() => import('./pages/NFTDetailPage'));
const SpacesPage = lazy(() => import('./pages/SpacesPage'));
const SpaceDetailPage = lazy(() => import('./pages/SpaceDetailPage'));
const CreateNFTPage = lazy(() => import('./pages/CreateNFTPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NFTLendingPage = lazy(() => import('./pages/NFTLendingPage'));

function App() {
  return (
    <Web3Provider>
      <VRProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            <NavBar />
            <main className="flex-grow container mx-auto px-4 pb-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/marketplace" element={<MarketplacePage />} />
                <Route path="/nft/:id" element={<NFTDetailPage />} />
                <Route path="/spaces" element={<SpacesPage />} />
                <Route path="/space/:id" element={<SpaceDetailPage />} />
                <Route path="/create" element={<CreateNFTPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/lending" element={<NFTLendingPage />} />
                <Route path="/staking" element={<NFTStakingPage />} />
              </Routes>
            </main>
            <Footer />
            <NotificationCenter />
          </div>
        </NotificationProvider>
      </VRProvider>
    </Web3Provider>
  );
}

export default App; 