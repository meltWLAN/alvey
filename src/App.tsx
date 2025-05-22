import { useState } from 'react'
import { Box, Container, Heading, VStack, Button, Text, Flex } from '@chakra-ui/react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useWeb3Modal } from '@web3modal/wagmi/react'
import { useTranslation } from 'react-i18next'
import NFTStaking from './components/NFTStaking'

function App() {
  const { t } = useTranslation()
  const { open } = useWeb3Modal()
  const { isConnected, address } = useAccount()
  const { disconnect } = useDisconnect()

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Flex justifyContent="space-between" alignItems="center">
          <Heading as="h1" size="xl">AlveyChain NFT Staking</Heading>
          
          {isConnected ? (
            <Button 
              colorScheme="red" 
              onClick={() => disconnect()}
            >
              {address?.slice(0, 6)}...{address?.slice(-4)} | {t('common.disconnect')}
            </Button>
          ) : (
            <Button 
              colorScheme="blue" 
              onClick={() => open()}
            >
              {t('common.connect')}
            </Button>
          )}
        </Flex>

        <Box>
          {isConnected ? (
            <NFTStaking />
          ) : (
            <Box p={8} borderWidth="1px" borderRadius="lg" textAlign="center">
              <Text fontSize="xl">{t('common.pleaseConnect')}</Text>
              <Button mt={4} colorScheme="blue" onClick={() => open()}>
                {t('common.connect')}
              </Button>
            </Box>
          )}
        </Box>
      </VStack>
    </Container>
  )
}

export default App
