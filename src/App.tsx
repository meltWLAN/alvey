import { ChakraProvider, Box, VStack, Heading, Text, Button } from '@chakra-ui/react'
import { useWeb3Modal } from '@web3modal/react'
import { useAccount, useDisconnect } from 'wagmi'

function App() {
  const { open } = useWeb3Modal()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()

  return (
    <ChakraProvider>
      <Box minH="100vh" bg="gray.100" py={10}>
        <VStack spacing={8} maxW="container.md" mx="auto" p={6} bg="white" borderRadius="xl" shadow="lg">
          <Heading>Alveychain dApp</Heading>
          
          {isConnected ? (
            <VStack spacing={4}>
              <Text>Connected to: {address}</Text>
              <Button colorScheme="red" onClick={() => disconnect()}>
                Disconnect Wallet
              </Button>
            </VStack>
          ) : (
            <Button colorScheme="blue" onClick={() => open()}>
              Connect Wallet
            </Button>
          )}
        </VStack>
      </Box>
    </ChakraProvider>
  )
}

export default App 