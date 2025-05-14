import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useAccount, useContractRead, useContractWrite, usePrepareContractWrite } from 'wagmi';
import { useTranslation } from 'react-i18next';
import { alveychain } from '../config/chains';
import { formatEther, parseEther } from 'viem';

const NFTMint = () => {
  const { t } = useTranslation();
  const toast = useToast();
  const { address, isConnected } = useAccount();
  const [isApproving, setIsApproving] = useState(false);

  // 读取合约数据
  const { data: mintPrice } = useContractRead({
    address: alveychain.contracts.nft.address,
    abi: alveychain.contracts.nft.abi,
    functionName: 'mintPrice',
  });

  const { data: maxSupply } = useContractRead({
    address: alveychain.contracts.nft.address,
    abi: alveychain.contracts.nft.abi,
    functionName: 'maxTotalSupply',
  });

  const { data: totalSupply } = useContractRead({
    address: alveychain.contracts.nft.address,
    abi: alveychain.contracts.nft.abi,
    functionName: 'totalSupply',
  });

  const { data: marioBalance } = useContractRead({
    address: alveychain.contracts.mario.address,
    abi: alveychain.contracts.mario.abi,
    functionName: 'balanceOf',
    args: [address],
    enabled: isConnected,
  });

  const { data: allowance } = useContractRead({
    address: alveychain.contracts.mario.address,
    abi: alveychain.contracts.mario.abi,
    functionName: 'allowance',
    args: [address, alveychain.contracts.nft.address],
    enabled: isConnected,
  });

  // 准备合约写入
  const { config: approveConfig } = usePrepareContractWrite({
    address: alveychain.contracts.mario.address,
    abi: alveychain.contracts.mario.abi,
    functionName: 'approve',
    args: [alveychain.contracts.nft.address, mintPrice],
    enabled: isConnected && mintPrice,
  });

  const { config: mintConfig } = usePrepareContractWrite({
    address: alveychain.contracts.nft.address,
    abi: alveychain.contracts.nft.abi,
    functionName: 'safeMint',
    enabled: isConnected && allowance >= mintPrice,
  });

  // 合约写入操作
  const { write: approve } = useContractWrite({
    ...approveConfig,
    onSuccess: () => {
      setIsApproving(true);
      toast({
        title: t('common.success'),
        description: t('mint.approveSuccess'),
        status: 'success',
      });
    },
  });

  const { write: mint } = useContractWrite({
    ...mintConfig,
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('mint.mintSuccess'),
        status: 'success',
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <Heading size="md">{t('mint.title')}</Heading>
      </CardHeader>
      <CardBody>
        <Stack spacing={4}>
          <Box>
            <Text>{t('mint.price')}</Text>
            <Text fontWeight="bold">
              {mintPrice ? formatEther(mintPrice) : '0'} MARIO
            </Text>
          </Box>
          <Box>
            <Text>{t('mint.balance')}</Text>
            <Text fontWeight="bold">
              {marioBalance ? formatEther(marioBalance) : '0'} MARIO
            </Text>
          </Box>
          <Box>
            <Text>{t('mint.max')}</Text>
            <Text fontWeight="bold">
              {totalSupply?.toString() || '0'} / {maxSupply?.toString() || '0'}
            </Text>
          </Box>
          {isConnected ? (
            allowance >= mintPrice ? (
              <Button
                colorScheme="purple"
                onClick={() => mint?.()}
                isDisabled={!mint || totalSupply >= maxSupply}
              >
                {t('mint.mint')}
              </Button>
            ) : (
              <Button
                colorScheme="blue"
                onClick={() => approve?.()}
                isLoading={isApproving}
                isDisabled={!approve}
              >
                {t('mint.approve')}
              </Button>
            )
          ) : null}
        </Stack>
      </CardBody>
    </Card>
  );
};

export default NFTMint; 