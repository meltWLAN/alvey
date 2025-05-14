import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { walletConnect } from 'wagmi/connectors'

// Configure wagmi
const projectId = 'YOUR_WALLET_CONNECT_PROJECT_ID' // Get this from https://cloud.walletconnect.com

const metadata = {
  name: 'Alveychain dApp',
  description: 'A decentralized application on Alveychain',
  url: 'https://your-website.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http()
  },
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: false })
  ]
})

// Configure modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains: [mainnet, sepolia],
  themeMode: 'light'
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
) 