import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AlveyLendPage from '../pages/AlveyLendPage';
import { ethers } from 'ethers';

// 模拟ethers库
jest.mock('ethers', () => {
  const originalModule = jest.requireActual('ethers');
  return {
    ...originalModule,
    ethers: {
      ...originalModule.ethers,
      Contract: jest.fn(),
      BrowserProvider: jest.fn()
    }
  };
});

// 创建测试NFT数据
const mockNFTs = [
  { id: '1', name: 'NFT #1', image: 'https://example.com/nft1.png', uri: 'ipfs://Qm123' },
  { id: '2', name: 'NFT #2', image: 'https://example.com/nft2.png', uri: 'ipfs://Qm456' }
];

// 模拟智能合约
const mockMainNftContract = {
  balanceOf: jest.fn().mockResolvedValue(ethers.BigNumber.from(2)),
  tokenOfOwnerByIndex: jest.fn().mockImplementation((owner, index) => {
    return Promise.resolve(ethers.BigNumber.from(mockNFTs[index].id));
  }),
  tokenURI: jest.fn().mockImplementation((tokenId) => {
    const nft = mockNFTs.find(n => n.id === tokenId.toString());
    return Promise.resolve(nft ? nft.uri : '');
  }),
  approve: jest.fn().mockResolvedValue({
    wait: jest.fn().mockResolvedValue(true)
  }),
  getAddress: jest.fn().mockResolvedValue('0xNFTContractAddress')
};

const mockAlveyLendContract = {
  createLoan: jest.fn().mockResolvedValue({
    hash: '0xmocktxhash',
    wait: jest.fn().mockResolvedValue(true)
  }),
  getAddress: jest.fn().mockResolvedValue('0xLendContractAddress'),
  connect: jest.fn().mockReturnValue({
    createLoan: jest.fn().mockResolvedValue({
      hash: '0xmocktxhash',
      wait: jest.fn().mockResolvedValue(true)
    })
  })
};

// 模拟provider和signer
const mockProvider = {
  getSigner: jest.fn().mockResolvedValue({
    getAddress: jest.fn().mockResolvedValue('0xUserAddress')
  })
};

describe('AlveyLendPage Component', () => {
  // 基本渲染测试
  test('renders AlveyLendPage component correctly', () => {
    render(
      <AlveyLendPage 
        onExit={jest.fn()} 
        alveyLendContract={mockAlveyLendContract}
        provider={mockProvider}
        account="0xUserAddress"
        mainNftContract={mockMainNftContract}
      />
    );
    
    expect(screen.getByText(/AlveyLend - NFT 抵押借贷/i)).toBeInTheDocument();
    expect(screen.getByText(/1. 选择您要抵押的NFT/i)).toBeInTheDocument();
  });
  
  // 测试NFT加载
  test('loads user NFTs correctly', async () => {
    render(
      <AlveyLendPage 
        onExit={jest.fn()} 
        alveyLendContract={mockAlveyLendContract}
        provider={mockProvider}
        account="0xUserAddress"
        mainNftContract={mockMainNftContract}
      />
    );
    
    await waitFor(() => {
      // 应该显示用户的两个NFT
      expect(mockMainNftContract.balanceOf).toHaveBeenCalledWith('0xUserAddress');
      expect(mockMainNftContract.tokenOfOwnerByIndex).toHaveBeenCalledTimes(2);
      expect(mockMainNftContract.tokenURI).toHaveBeenCalledTimes(2);
    });
  });
  
  // 测试选择NFT
  test('selects an NFT correctly', async () => {
    render(
      <AlveyLendPage 
        onExit={jest.fn()} 
        alveyLendContract={mockAlveyLendContract}
        provider={mockProvider}
        account="0xUserAddress"
        mainNftContract={mockMainNftContract}
      />
    );
    
    // 等待NFT加载
    await waitFor(() => {
      expect(screen.getByText('NFT #1')).toBeInTheDocument();
    });
    
    // 点击选择第一个NFT
    fireEvent.click(screen.getByText('NFT #1'));
    
    // 应该显示借贷表单
    expect(screen.getByText(/2. 填写借贷信息/i)).toBeInTheDocument();
  });
  
  // 测试创建借贷
  test('creates loan successfully', async () => {
    render(
      <AlveyLendPage 
        onExit={jest.fn()} 
        alveyLendContract={mockAlveyLendContract}
        provider={mockProvider}
        account="0xUserAddress"
        mainNftContract={mockMainNftContract}
      />
    );
    
    // 等待NFT加载并选择
    await waitFor(() => {
      expect(screen.getByText('NFT #1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('NFT #1'));
    
    // 填写借贷表单
    fireEvent.change(screen.getByLabelText(/借款金额/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/借款期限/i), { target: { value: '7' } });
    
    // 提交表单
    fireEvent.click(screen.getByText(/确认创建借贷/i));
    
    // 验证合约调用
    await waitFor(() => {
      expect(mockMainNftContract.approve).toHaveBeenCalled();
      // 检查是否显示了交易消息
      expect(screen.getByText(/NFT授权成功/i)).toBeInTheDocument();
    });
  });
  
  // 测试错误处理
  test('handles errors correctly', async () => {
    // 修改模拟以模拟错误
    mockMainNftContract.approve.mockRejectedValueOnce(new Error('测试错误'));
    
    render(
      <AlveyLendPage 
        onExit={jest.fn()} 
        alveyLendContract={mockAlveyLendContract}
        provider={mockProvider}
        account="0xUserAddress"
        mainNftContract={mockMainNftContract}
      />
    );
    
    // 等待NFT加载并选择
    await waitFor(() => {
      expect(screen.getByText('NFT #1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('NFT #1'));
    
    // 填写借贷表单
    fireEvent.change(screen.getByLabelText(/借款金额/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/借款期限/i), { target: { value: '7' } });
    
    // 提交表单
    fireEvent.click(screen.getByText(/确认创建借贷/i));
    
    // 验证错误处理
    await waitFor(() => {
      expect(screen.getByText(/创建借贷失败/i)).toBeInTheDocument();
    });
  });
  
  // 测试验证逻辑
  test('validates input correctly', async () => {
    render(
      <AlveyLendPage 
        onExit={jest.fn()} 
        alveyLendContract={mockAlveyLendContract}
        provider={mockProvider}
        account="0xUserAddress"
        mainNftContract={mockMainNftContract}
      />
    );
    
    // 等待NFT加载并选择
    await waitFor(() => {
      expect(screen.getByText('NFT #1')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('NFT #1'));
    
    // 提交空表单
    fireEvent.click(screen.getByText(/确认创建借贷/i));
    
    // 验证表单验证
    expect(screen.getByText(/请选择一个NFT并填写所有借贷信息/i)).toBeInTheDocument();
    
    // 输入无效值
    fireEvent.change(screen.getByLabelText(/借款金额/i), { target: { value: '-10' } });
    fireEvent.change(screen.getByLabelText(/借款期限/i), { target: { value: '400' } });
    
    // 提交表单
    fireEvent.click(screen.getByText(/确认创建借贷/i));
    
    // 验证验证逻辑
    expect(screen.getByText(/借款金额必须大于0/i)).toBeInTheDocument();
  });
}); 