import React, { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { ethers } from 'ethers';
import axios from 'axios';

/**
 * DynamicNFT组件 - 实现根据外部数据和用户交互而变化的NFT
 * 支持根据市场数据、用户交互和时间进行视觉演变
 */
const DynamicNFT = ({ 
  modelUrl, 
  nftData, 
  contractAddress, 
  tokenId, 
  initialPhase = 1,
  autoRotate = true,
  enableVR = false,
  onPhaseChange,
  marketDataSource = null,
  timeBasedEvolution = true,
  interactionEvolution = true,
  evolutionStages = 5,
  ownerAddress
}) => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const animationMixerRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(initialPhase);
  const [isVRMode, setIsVRMode] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [marketData, setMarketData] = useState(null);
  const [evolutionProgress, setEvolutionProgress] = useState(0);
  const [timeBasedTrigger, setTimeBasedTrigger] = useState(Date.now());
  
  // 初始化3D场景
  useEffect(() => {
    if (!containerRef.current) return;
    
    // 创建场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);
    sceneRef.current = scene;
    
    // 添加环境光和方向光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // 添加后面的光源提高模型可见度
    const backLight = new THREE.DirectionalLight(0xffffff, 0.5);
    backLight.position.set(-1, 0.5, -1);
    scene.add(backLight);
    
    // 创建相机
    const camera = new THREE.PerspectiveCamera(
      50, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // 添加轨道控制
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1;
    controlsRef.current = controls;
    
    // 窗口大小调整处理
    const handleResize = () => {
      if (containerRef.current && cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // 添加VR支持
    if (enableVR && renderer.xr) {
      renderer.xr.enabled = true;
      // 需要使用额外的VR Button组件来进入VR模式
    }
    
    // 渲染循环
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      // 更新动画
      if (animationMixerRef.current) {
        const delta = clockRef.current.getDelta();
        animationMixerRef.current.update(delta);
      }
      
      // 动态效果更新
      if (modelRef.current) {
        // 这里可以添加模型的动态效果
        updateModelEvolutionEffects();
      }
      
      if (rendererRef.current && cameraRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      // 清理场景中的对象
      if (sceneRef.current) {
        while(sceneRef.current.children.length > 0){ 
          const object = sceneRef.current.children[0];
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
          sceneRef.current.remove(object);
        }
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [autoRotate, enableVR]);
  
  // 加载3D模型
  useEffect(() => {
    if (!sceneRef.current || !modelUrl) return;
    
    setIsLoading(true);
    setError(null);
    
    const loader = new GLTFLoader();
    
    // 动态调整模型URL以反映当前阶段
    let phaseAdjustedUrl = modelUrl;
    if (modelUrl.includes('.glb') || modelUrl.includes('.gltf')) {
      const urlParts = modelUrl.split('.');
      const extension = urlParts.pop();
      phaseAdjustedUrl = `${urlParts.join('.')}_phase_${currentPhase}.${extension}`;
    }
    
    // 首先尝试加载阶段特定的模型，如果失败则回退到原始模型
    loader.load(
      phaseAdjustedUrl,
      (gltf) => {
        handleModelLoad(gltf);
      },
      (xhr) => {
        // 加载进度
        console.log(`${Math.round((xhr.loaded / xhr.total) * 100)}% loaded`);
      },
      (error) => {
        console.warn(`Failed to load phase-specific model: ${error.message}`);
        console.log('Trying to load original model...');
        // 如果阶段特定模型加载失败，尝试加载原始模型
        loader.load(
          modelUrl,
          (gltf) => {
            handleModelLoad(gltf);
          },
          undefined,
          (fallbackError) => {
            setError(`${t('dynamicNFT.error')}: ${fallbackError.message}`);
            setIsLoading(false);
          }
        );
      }
    );
  }, [modelUrl, currentPhase, t]);
  
  // 处理模型加载成功
  const handleModelLoad = (gltf) => {
    if (!sceneRef.current) return;
    
    // 清除之前的模型
    if (modelRef.current) {
      sceneRef.current.remove(modelRef.current);
    }
    
    const model = gltf.scene;
    
    // 调整模型比例和位置
    model.scale.set(1.5, 1.5, 1.5);
    model.position.set(0, 0, 0);
    
    // 根据当前阶段调整模型材质
    applyPhaseSpecificMaterials(model, currentPhase);
    
    // 添加模型到场景
    sceneRef.current.add(model);
    modelRef.current = model;
    
    // 处理动画
    if (gltf.animations && gltf.animations.length) {
      const mixer = new THREE.AnimationMixer(model);
      gltf.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });
      animationMixerRef.current = mixer;
    }
    
    // 使相机对准模型
    if (controlsRef.current) {
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
    
    setIsLoading(false);
  };
  
  // 根据当前阶段更新模型材质
  const applyPhaseSpecificMaterials = (model, phase) => {
    // 为不同阶段定义颜色主题
    const phaseColors = {
      1: new THREE.Color(0x4287f5), // 蓝色
      2: new THREE.Color(0x42f54e), // 绿色
      3: new THREE.Color(0xf5d442), // 黄色
      4: new THREE.Color(0xf54242), // 红色
      5: new THREE.Color(0xa742f5)  // 紫色
    };
    
    // 应用颜色主题到模型材质
    model.traverse((object) => {
      if (object.isMesh) {
        // 保留原始材质的大部分特性，只调整发光颜色
        if (phase in phaseColors) {
          if (object.material.emissive) {
            object.material.emissive.set(phaseColors[phase]);
            object.material.emissiveIntensity = 0.3;
          }
          
          // 对金属材质添加阶段对应的光泽
          if (object.material.metalness) {
            object.material.metalness = 0.5 + (phase * 0.1);  // 随阶段增加金属感
            object.material.roughness = Math.max(0.1, 0.7 - (phase * 0.1)); // 随阶段减少粗糙度
          }
        }
      }
    });
  };
  
  // 更新模型的进化效果
  const updateModelEvolutionEffects = () => {
    if (!modelRef.current) return;
    
    // 根据进化进度调整模型
    const normalizedProgress = evolutionProgress / 100;
    
    modelRef.current.traverse((object) => {
      if (object.isMesh) {
        // 添加动态发光效果
        if (object.material.emissiveIntensity !== undefined) {
          // 呼吸效果 - 明暗交替
          const pulseIntensity = 0.2 + 0.1 * Math.sin(Date.now() * 0.001);  
          object.material.emissiveIntensity = pulseIntensity + (normalizedProgress * 0.3);
        }
        
        // 添加颜色变化效果
        if (object.material.color) {
          // 根据进度在不同颜色之间插值
          const baseHue = (currentPhase - 1) / evolutionStages;
          const targetHue = currentPhase / evolutionStages;
          const currentHue = baseHue + (targetHue - baseHue) * normalizedProgress;
          
          // 使用HSL颜色模型进行平滑过渡
          const color = new THREE.Color();
          color.setHSL(currentHue, 0.7, 0.5); // 饱和度和亮度保持固定
          
          // 只对非核心材质修改颜色，避免破坏模型的基本外观
          if (!object.name.includes('main') && !object.name.includes('body')) {
            object.material.color.copy(color);
          }
        }
        
        // 根据进化阶段添加不同的特效
        if (currentPhase === 5 && normalizedProgress > 0.8) {
          // 最终阶段的额外特效 - 如强化金属质感
          if (object.material.metalness !== undefined) {
            object.material.metalness = 0.9;
            object.material.roughness = 0.1;
          }
        }
      }
    });
  };
  
  // 处理用户交互
  const handleInteraction = () => {
    if (!interactionEvolution) return;
    
    setInteractionCount(prev => {
      const newCount = prev + 1;
      // 每10次交互，检查是否需要进化
      if (newCount % 10 === 0) {
        checkForEvolution();
      }
      return newCount;
    });
  };
  
  // 根据市场数据更新NFT
  useEffect(() => {
    if (!marketDataSource) return;
    
    const fetchMarketData = async () => {
      try {
        const response = await axios.get(marketDataSource);
        setMarketData(response.data);
        
        // 根据市场数据计算进化因子
        let evolutionFactor = 0;
        
        if (response.data.priceChange) {
          // 价格上涨推动进化
          evolutionFactor += Math.min(response.data.priceChange * 10, 20);
        }
        
        if (response.data.tradingVolume) {
          // 交易量增加推动进化
          evolutionFactor += Math.min((response.data.tradingVolume / 100), 15);
        }
        
        if (response.data.popularity) {
          // 受欢迎程度推动进化
          evolutionFactor += response.data.popularity * 5;
        }
        
        // 更新进化进度
        setEvolutionProgress(prev => Math.min(100, prev + evolutionFactor));
        
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      }
    };
    
    fetchMarketData();
    
    // 每小时更新一次市场数据
    const marketDataInterval = setInterval(fetchMarketData, 3600000);
    
    return () => clearInterval(marketDataInterval);
  }, [marketDataSource]);
  
  // 基于时间的进化
  useEffect(() => {
    if (!timeBasedEvolution) return;
    
    // 使用NFT创建时间计算年龄
    let nftAge = 0;
    if (nftData && nftData.createdAt) {
      nftAge = (Date.now() - new Date(nftData.createdAt).getTime()) / (1000 * 60 * 60 * 24); // 天数
    }
    
    // 每天增加一定的进化进度
    const dailyProgress = 2 + Math.min(nftAge / 30, 3); // 最多每天增加5点
    
    // 更新进化进度
    setEvolutionProgress(prev => Math.min(100, prev + dailyProgress));
    
    // 每24小时更新一次时间因子
    const timeInterval = setInterval(() => {
      setTimeBasedTrigger(Date.now());
    }, 86400000); // 24小时
    
    return () => clearInterval(timeInterval);
  }, [timeBasedEvolution, nftData, timeBasedTrigger]);
  
  // 检查进化条件是否满足
  const checkForEvolution = async () => {
    if (currentPhase >= evolutionStages) return; // 已达到最终阶段
    
    // 进化阈值随阶段增加
    const evolutionThreshold = 20 + (currentPhase * 20); // 阶段1: 40%, 阶段2: 60%, 阶段3: 80%, 阶段4: 100%
    
    if (evolutionProgress >= evolutionThreshold) {
      // 进化到下一阶段
      const nextPhase = currentPhase + 1;
      
      // 如果有合约地址和令牌ID，则在链上更新NFT数据
      if (contractAddress && tokenId && ownerAddress && window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          
          // ABI片段，仅包含updateNFTPhase函数
          const abi = [
            "function updateNFTPhase(uint256 tokenId, uint8 newPhase) external"
          ];
          
          const contract = new ethers.Contract(contractAddress, abi, signer);
          
          // 检查是否是NFT拥有者
          const signerAddress = await signer.getAddress();
          if (signerAddress.toLowerCase() === ownerAddress.toLowerCase()) {
            // 更新链上数据
            const tx = await contract.updateNFTPhase(tokenId, nextPhase);
            await tx.wait();
            console.log('NFT phase updated on-chain.');
          }
        } catch (error) {
          console.error('Failed to update NFT phase on-chain:', error);
          // 即使链上更新失败，UI仍然会显示新阶段
        }
      }
      
      // 更新阶段状态
      setCurrentPhase(nextPhase);
      setEvolutionProgress(0); // 重置进化进度
      
      // 调用回调通知父组件
      if (onPhaseChange) {
        onPhaseChange(nextPhase);
      }
    }
  };
  
  // 当进化进度更新时，检查是否需要进化
  useEffect(() => {
    checkForEvolution();
  }, [evolutionProgress]);
  
  // 计算进化进度百分比
  const calculateProgressPercentage = () => {
    // 进化阈值随阶段增加
    const evolutionThreshold = 20 + (currentPhase * 20);
    return Math.min(100, (evolutionProgress / evolutionThreshold) * 100);
  };
  
  // 渲染组件
  return (
    <div className="dynamic-nft-container relative" style={{ width: '100%', height: '100%', minHeight: '300px' }}>
      {/* 3D模型容器 */}
      <div 
        ref={containerRef} 
        className="dynamic-nft-model-viewer" 
        style={{ width: '100%', height: '100%', cursor: 'grab' }}
        onClick={handleInteraction}
        onTouchStart={handleInteraction}
      ></div>
      
      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-sm text-gray-200">{t('dynamicNFT.loading')}</p>
          </div>
        </div>
      )}
      
      {/* 错误信息 */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/30 backdrop-blur-sm">
          <div className="text-center p-4 bg-red-900/80 rounded-lg max-w-xs">
            <p className="text-sm text-white">{error}</p>
          </div>
        </div>
      )}
      
      {/* 阶段和进化信息 */}
      <div className="absolute bottom-3 left-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white text-xs">
        <div className="flex justify-between items-center mb-1">
          <span>{t('dynamicNFT.evolution')}</span>
          <span>{t('dynamicNFT.phase')} {currentPhase}/{evolutionStages}</span>
        </div>
        
        {/* 进化进度条 */}
        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{ 
              width: `${calculateProgressPercentage()}%`,
              background: 'linear-gradient(90deg, #3b82f6, #10b981)'
            }}
          ></div>
        </div>
        
        {/* VR兼容标记 */}
        {enableVR && (
          <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs px-2 py-1 rounded-md">
            {t('dynamicNFT.vrCompatible')}
          </div>
        )}
      </div>
    </div>
  );
};

DynamicNFT.propTypes = {
  modelUrl: PropTypes.string.isRequired,
  nftData: PropTypes.object,
  contractAddress: PropTypes.string,
  tokenId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  initialPhase: PropTypes.number,
  autoRotate: PropTypes.bool,
  enableVR: PropTypes.bool,
  onPhaseChange: PropTypes.func,
  marketDataSource: PropTypes.string,
  timeBasedEvolution: PropTypes.bool,
  interactionEvolution: PropTypes.bool,
  evolutionStages: PropTypes.number,
  ownerAddress: PropTypes.string
};

export default DynamicNFT; 