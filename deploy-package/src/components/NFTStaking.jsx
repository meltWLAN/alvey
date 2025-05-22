import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  Text,
  SimpleGrid,
  Flex,
  Divider,
  useToast,
  Spinner,
  Badge,
} from '@chakra-ui/react';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { useTranslation } from 'react-i18next';
import { alveychain } from '../config/chains';
import { formatEther, parseEther } from 'viem';

const NFTStaking = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { address, isConnected } = useAccount();
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [isApproving, setIsApproving] = useState(false);
  const [userNFTs, setUserNFTs] = useState([]);
  const [stakedNFTs, setStakedNFTs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 读取合约数据
  const { data: totalStaked, refetch: refetchTotalStaked } = useContractRead({
    address: alveychain.contracts.staking.address,
    abi: alveychain.contracts.staking.abi,
    functionName: 'totalStakedNFTs',
  });

  const { data: baseRewardRate } = useContractRead({
    address: alveychain.contracts.staking.address,
    abi: alveychain.contracts.staking.abi,
    functionName: 'baseRewardRate',
  });

  const { data: userStakesIds, refetch: refetchUserStakes } = useContractRead({
    address: alveychain.contracts.staking.address,
    abi: alveychain.contracts.staking.abi,
    functionName: 'getUserStakes',
    args: [address],
    enabled: isConnected,
  });

  const { data: isApprovedForAll } = useContractRead({
    address: alveychain.contracts.nft.address,
    abi: alveychain.contracts.nft.abi,
    functionName: 'isApprovedForAll',
    args: [address, alveychain.contracts.staking.address],
    enabled: isConnected,
  });

  // 获取用户拥有的NFT
  const { data: balanceOf } = useContractRead({
    address: alveychain.contracts.nft.address,
    abi: alveychain.contracts.nft.abi,
    functionName: 'balanceOf',
    args: [address],
    enabled: isConnected,
  });

  // 准备合约写入
  const { config: approveConfig } = usePrepareContractWrite({
    address: alveychain.contracts.nft.address,
    abi: alveychain.contracts.nft.abi,
    functionName: 'setApprovalForAll',
    args: [alveychain.contracts.staking.address, true],
    enabled: isConnected && !isApprovedForAll,
  });

  const { config: stakeConfig } = usePrepareContractWrite({
    address: alveychain.contracts.staking.address,
    abi: alveychain.contracts.staking.abi,
    functionName: 'stake',
    args: [selectedNFT],
    enabled: isConnected && selectedNFT !== null && isApprovedForAll,
  });

  const { config: unstakeConfig, refetch: refetchUnstakeConfig } = usePrepareContractWrite({
    address: alveychain.contracts.staking.address,
    abi: alveychain.contracts.staking.abi,
    functionName: 'unstake',
    args: [selectedNFT],
    enabled: isConnected && selectedNFT !== null && userStakesIds?.includes(selectedNFT),
  });

  const { config: claimConfig, refetch: refetchClaimConfig } = usePrepareContractWrite({
    address: alveychain.contracts.staking.address,
    abi: alveychain.contracts.staking.abi,
    functionName: 'claimReward',
    args: [selectedNFT],
    enabled: isConnected && selectedNFT !== null && userStakesIds?.includes(selectedNFT),
  });

  // 合约写入操作
  const { write: approve } = useContractWrite({
    ...approveConfig,
    onSuccess: () => {
      setIsApproving(true);
      toast({
        title: t('common.success'),
        description: t('staking.approveSuccess'),
        status: 'success',
      });
    },
  });

  const { write: stake } = useContractWrite({
    ...stakeConfig,
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('staking.stakeSuccess'),
        status: 'success',
      });
      refetchUserStakes();
      refetchTotalStaked();
      loadUserNFTs();
    },
  });

  const { write: unstake } = useContractWrite({
    ...unstakeConfig,
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('staking.unstakeSuccess'),
        status: 'success',
      });
      refetchUserStakes();
      refetchTotalStaked();
      loadUserNFTs();
    },
  });

  const { write: claimReward } = useContractWrite({
    ...claimConfig,
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('staking.claimSuccess'),
        status: 'success',
      });
    },
  });

  // 加载用户NFT
  const loadUserNFTs = async () => {
    if (!isConnected || !balanceOf) return;
    
    setIsLoading(true);
    try {
      const nfts = [];
      const balance = Number(balanceOf);
      
      for (let i = 0; i < balance; i++) {
        const tokenId = await alveychain.contracts.nft.contract.tokenOfOwnerByIndex(address, i);
        const tokenURI = await alveychain.contracts.nft.contract.tokenURI(tokenId);
        nfts.push({
          id: Number(tokenId),
          uri: tokenURI,
        });
      }
      
      setUserNFTs(nfts);
    } catch (error) {
      console.error("Error loading NFTs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 加载质押的NFT
  const loadStakedNFTs = async () => {
    if (!isConnected || !userStakesIds) return;
    
    setIsLoading(true);
    try {
      const nfts = [];
      
      for (const tokenId of userStakesIds) {
        const pendingReward = await alveychain.contracts.staking.contract.getPendingReward(tokenId);
        const stakeInfo = await alveychain.contracts.staking.contract.stakes(tokenId);
        const tokenURI = await alveychain.contracts.nft.contract.tokenURI(tokenId);
        
        nfts.push({
          id: Number(tokenId),
          uri: tokenURI,
          stakedAt: new Date(Number(stakeInfo.stakedAt) * 1000),
          pendingReward: formatEther(pendingReward),
        });
      }
      
      setStakedNFTs(nfts);
    } catch (error) {
      console.error("Error loading staked NFTs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 当选择NFT变化时，重新获取unstake和claim的配置
  useEffect(() => {
    if (selectedNFT !== null) {
      refetchUnstakeConfig();
      refetchClaimConfig();
    }
  }, [selectedNFT, refetchUnstakeConfig, refetchClaimConfig]);

  // 当用户连接状态或余额变化时，加载NFT
  useEffect(() => {
    loadUserNFTs();
  }, [isConnected, balanceOf, address]);

  // 当用户质押记录变化时，加载质押的NFT
  useEffect(() => {
    loadStakedNFTs();
  }, [isConnected, userStakesIds, address]);

  // NFT卡片组件
  const NFTCard = ({ nft, isStaked, onSelect, isSelected }) => (
    <Card 
      onClick={() => onSelect(nft.id)}
      cursor="pointer"
      borderWidth={isSelected ? "2px" : "1px"}
      borderColor={isSelected ? "purple.500" : "gray.200"}
      boxShadow={isSelected ? "md" : "sm"}
      _hover={{ boxShadow: "md" }}
    >
      <CardBody>
        <Flex direction="column" align="center">
          <Box mb={2} position="relative">
            {/* 这里可以放NFT图片，如果有的话 */}
            <Box 
              bg="gray.200" 
              borderRadius="md" 
              w="100px" 
              h="100px" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
            >
              #{nft.id}
            </Box>
            {isStaked && (
              <Badge 
                position="absolute" 
                top="0" 
                right="0" 
                colorScheme="green"
              >
                Staked
              </Badge>
            )}
          </Box>
          <Text fontWeight="bold">NFT #{nft.id}</Text>
          {isStaked && (
            <>
              <Text fontSize="sm">Staked: {nft.stakedAt.toLocaleDateString()}</Text>
              <Text fontSize="sm" fontWeight="bold">
                Reward: {Number(nft.pendingReward).toFixed(4)} MARIO
              </Text>
            </>
          )}
        </Flex>
      </CardBody>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <Heading size="md">{t('staking.title')}</Heading>
      </CardHeader>
      <CardBody>
        <Stack spacing={6}>
          <Flex justify="space-between" wrap="wrap" gap={4}>
            <Box>
              <Text>{t('staking.totalStaked')}</Text>
              <Text fontWeight="bold">
                {totalStaked?.toString() || '0'} NFTs
              </Text>
            </Box>
            <Box>
              <Text>{t('staking.rewardRate')}</Text>
              <Text fontWeight="bold">
                {baseRewardRate ? formatEther(baseRewardRate) : '0'} MARIO / day
              </Text>
            </Box>
            {isConnected && !isApprovedForAll && (
              <Button
                colorScheme="blue"
                onClick={() => approve?.()}
                isLoading={isApproving}
                isDisabled={!approve}
              >
                {t('staking.approveNFTs')}
              </Button>
            )}
          </Flex>

          <Divider />

          {isConnected ? (
            <>
              <Flex justify="space-between" align="center">
                <Heading size="sm">{t('staking.yourNFTs')}</Heading>
                <Button 
                  size="sm" 
                  onClick={loadUserNFTs}
                  colorScheme="gray"
                >
                  {t('common.refresh')}
                </Button>
              </Flex>
              
              {isLoading ? (
                <Flex justify="center" p={4}>
                  <Spinner />
                </Flex>
              ) : userNFTs.length > 0 ? (
                <>
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
                    {userNFTs.map(nft => (
                      <NFTCard 
                        key={nft.id} 
                        nft={nft} 
                        isStaked={false}
                        onSelect={setSelectedNFT}
                        isSelected={selectedNFT === nft.id}
                      />
                    ))}
                  </SimpleGrid>
                  
                  {selectedNFT && !userStakesIds?.includes(selectedNFT) && (
                    <Button
                      colorScheme="purple"
                      onClick={() => stake?.()}
                      isDisabled={!stake || !isApprovedForAll}
                      mt={4}
                    >
                      {t('staking.stakeSelected')} #{selectedNFT}
                    </Button>
                  )}
                </>
              ) : (
                <Text>{t('staking.noNFTs')}</Text>
              )}

              <Divider />

              <Flex justify="space-between" align="center">
                <Heading size="sm">{t('staking.stakedNFTs')}</Heading>
                <Button 
                  size="sm" 
                  onClick={loadStakedNFTs}
                  colorScheme="gray"
                >
                  {t('common.refresh')}
                </Button>
              </Flex>
              
              {isLoading ? (
                <Flex justify="center" p={4}>
                  <Spinner />
                </Flex>
              ) : stakedNFTs.length > 0 ? (
                <>
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={4}>
                    {stakedNFTs.map(nft => (
                      <NFTCard 
                        key={nft.id} 
                        nft={nft} 
                        isStaked={true}
                        onSelect={setSelectedNFT}
                        isSelected={selectedNFT === nft.id}
                      />
                    ))}
                  </SimpleGrid>
                  
                  {selectedNFT && userStakesIds?.includes(selectedNFT) && (
                    <Flex mt={4} gap={2} flexWrap="wrap">
                      <Button
                        colorScheme="red"
                        onClick={() => unstake?.()}
                        isDisabled={!unstake}
                      >
                        {t('staking.unstakeSelected')} #{selectedNFT}
                      </Button>
                      <Button
                        colorScheme="green"
                        onClick={() => claimReward?.()}
                        isDisabled={!claimReward}
                      >
                        {t('staking.claimReward')} #{selectedNFT}
                      </Button>
                    </Flex>
                  )}
                </>
              ) : (
                <Text>{t('staking.noStakedNFTs')}</Text>
              )}
            </>
          ) : (
            <Text>{t('common.pleaseConnect')}</Text>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
};

export default NFTStaking; 