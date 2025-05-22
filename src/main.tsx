import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { mainnet } from 'wagmi/chains'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { walletConnect } from 'wagmi/connectors'
import { alveychain } from './config/chains'
import { ChakraProvider } from '@chakra-ui/react'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n' // 确保有这个文件

// Configure wagmi
const projectId = '3ccc0d7f2477030661604c162d13b959' // 使用一个示例ID

const metadata = {
  name: 'AlveyChain NFT Staking',
  description: 'A decentralized NFT staking application on AlveyChain',
  url: 'https://meltwlan.github.io/alvey/',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

const config = createConfig({
  chains: [alveychain, mainnet],
  transports: {
    [alveychain.id]: http(alveychain.rpcUrls.default.http[0]),
    [mainnet.id]: http()
  },
  connectors: [
    walletConnect({ projectId, metadata, showQrModal: false })
  ]
})

// Configure modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  chains: [alveychain, mainnet],
  themeMode: 'light'
})

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <I18nextProvider i18n={i18n}>
            <App />
          </I18nextProvider>
        </ChakraProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
)
