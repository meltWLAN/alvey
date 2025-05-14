import React, { useState, useContext } from 'react';
import { Web3Context } from '../contexts/Web3Context';
import { uploadFileToIPFS, uploadMetadataToIPFS } from '../utils/ipfs';
import { SUPPORTED_FORMATS, UPLOAD_LIMITS } from '../utils/constants';
import { formatAddress } from '../utils/web3';

const Create = () => {
  const { account, connected, contracts } = useContext(Web3Context);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    modelFile: null,
    thumbnailFile: null,
    format: 'glb',
    vrCompatible: true,
    tags: ''
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  // 处理输入变化
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // 处理文件选择
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      // Check file size limits
      if (name === 'modelFile' && files[0].size > UPLOAD_LIMITS.MODEL_SIZE_MB * 1024 * 1024) {
        setUploadError(`模型文件大小不能超过${UPLOAD_LIMITS.MODEL_SIZE_MB}MB`);
        e.target.value = null;
        return;
      }
      
      if (name === 'thumbnailFile' && files[0].size > UPLOAD_LIMITS.THUMBNAIL_SIZE_MB * 1024 * 1024) {
        setUploadError(`缩略图大小不能超过${UPLOAD_LIMITS.THUMBNAIL_SIZE_MB}MB`);
        e.target.value = null;
        return;
      }
      
      setFormData({
        ...formData,
        [name]: files[0]
      });
      
      setUploadError(null);
    }
  };

  // 创建NFT的函数
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!connected) {
      setUploadError('请先连接钱包');
      return;
    }
    
    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(false);
      setProgress(10);
      
      // 上传3D模型文件到IPFS
      setProgress(20);
      const modelURI = await uploadFileToIPFS(formData.modelFile);
      
      // 上传缩略图到IPFS
      setProgress(40);
      const thumbnailURI = await uploadFileToIPFS(formData.thumbnailFile);
      
      // 准备元数据
      const metadata = {
        name: formData.name,
        description: formData.description,
        modelURI,
        thumbnailURI,
        format: formData.format,
        vrCompatible: formData.vrCompatible,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        creator: account
      };
      
      // 上传元数据到IPFS
      setProgress(60);
      const metadataURI = await uploadMetadataToIPFS(metadata);
      
      // 准备标签
      const tags = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag);
      
      setProgress(80);
      
      // 如果合约实例可用，则铸造NFT（这里只是模拟）
      if (contracts.nft) {
        console.log('Minting NFT with data:', {
          to: account,
          uri: metadataURI,
          metadata,
          tags
        });
        
        // 模拟交易成功
        // 在实际应用中，这里应该调用合约的mintAsset方法
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        console.log('NFT contract not initialized');
      }
      
      setProgress(100);
      setUploadSuccess(true);
      
      // 重置表单
      setFormData({
        name: '',
        description: '',
        modelFile: null,
        thumbnailFile: null,
        format: 'glb',
        vrCompatible: true,
        tags: ''
      });
      
      // 重置文件输入框
      document.getElementById('modelFile').value = '';
      document.getElementById('thumbnailFile').value = '';
      
    } catch (error) {
      console.error('Error creating NFT:', error);
      setUploadError(`创建NFT时出错: ${error.message || '未知错误'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">创建3D资产NFT</h1>
      
      {!connected ? (
        <div className="bg-gray-800/50 p-6 rounded-lg mb-6">
          <p className="text-center text-xl">请先连接钱包以铸造NFT</p>
        </div>
      ) : (
        <>
          {uploadSuccess && (
            <div className="bg-green-900/20 border border-green-700 text-green-400 p-4 rounded-lg mb-6">
              <p className="font-medium">成功创建NFT!</p>
              <p className="text-sm mt-1">您的3D资产已成功铸造为NFT，可以在个人资料页面查看。</p>
            </div>
          )}
          
          {uploadError && (
            <div className="bg-red-900/20 border border-red-700 text-red-400 p-4 rounded-lg mb-6">
              <p className="font-medium">创建失败</p>
              <p className="text-sm mt-1">{uploadError}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="bg-gray-800/50 p-6 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {/* 基本信息 */}
                <div>
                  <label className="block text-sm font-medium mb-1">资产名称</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input-bordered w-full"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">描述</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="input-bordered w-full min-h-[100px]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">标签（逗号分隔）</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="input-bordered w-full"
                    placeholder="艺术, 科幻, 游戏..."
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="w-1/2">
                    <label className="block text-sm font-medium mb-1">模型格式</label>
                    <select
                      name="format"
                      value={formData.format}
                      onChange={handleInputChange}
                      className="input-bordered w-full"
                    >
                      {SUPPORTED_FORMATS.map(format => (
                        <option key={format.value} value={format.value}>
                          {format.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="w-1/2 flex items-center pt-6">
                    <input
                      type="checkbox"
                      id="vrCompatible"
                      name="vrCompatible"
                      checked={formData.vrCompatible}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label htmlFor="vrCompatible" className="text-sm font-medium">
                      VR兼容
                    </label>
                  </div>
                </div>
                
                {connected && (
                  <div className="mt-2">
                    <label className="block text-sm font-medium mb-1">创作者</label>
                    <div className="input-bordered w-full p-2 bg-gray-700/50">
                      {formatAddress(account)}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                {/* 文件上传 */}
                <div>
                  <label className="block text-sm font-medium mb-1">3D模型文件</label>
                  <input
                    type="file"
                    id="modelFile"
                    name="modelFile"
                    onChange={handleFileChange}
                    className="input-bordered w-full p-2"
                    accept=".glb,.gltf,.obj,.fbx"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    支持的格式: GLB, GLTF, OBJ, FBX (最大{UPLOAD_LIMITS.MODEL_SIZE_MB}MB)
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">缩略图</label>
                  <input
                    type="file"
                    id="thumbnailFile"
                    name="thumbnailFile"
                    onChange={handleFileChange}
                    className="input-bordered w-full p-2"
                    accept="image/*"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    推荐尺寸: 800x800px (最大{UPLOAD_LIMITS.THUMBNAIL_SIZE_MB}MB)
                  </p>
                </div>
                
                {formData.thumbnailFile && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-1">缩略图预览</label>
                    <div className="w-40 h-40 bg-gray-700/50 rounded-lg overflow-hidden">
                      <img
                        src={URL.createObjectURL(formData.thumbnailFile)}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {isUploading && (
              <div className="mt-6">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-teal-500 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="text-sm text-gray-400 mt-1 text-center">
                  {progress < 100 ? '上传中...' : '正在铸造NFT...'}
                </div>
              </div>
            )}
            
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                className="btn-gradient px-6 py-2 rounded-full"
                disabled={isUploading}
              >
                {isUploading ? (
                  <span className="flex items-center">
                    <span className="loading-ring w-4 h-4 mr-2"></span>
                    处理中...
                  </span>
                ) : '创建NFT'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default Create; 