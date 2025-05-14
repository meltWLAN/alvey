import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  const parallaxRef = useRef(null);
  
  // 处理视差效果
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!parallaxRef.current) return;
      
      const layers = parallaxRef.current.querySelectorAll('.parallax-layer');
      const container = parallaxRef.current;
      const containerRect = container.getBoundingClientRect();
      
      // 计算鼠标在容器内的相对位置（中心为0,0）
      const centerX = (e.clientX - containerRect.left - containerRect.width / 2) / (containerRect.width / 2);
      const centerY = (e.clientY - containerRect.top - containerRect.height / 2) / (containerRect.height / 2);
      
      // 应用不同的视差移动到每个层
      layers.forEach((layer, index) => {
        const depth = index + 1;
        const moveX = centerX * depth * 15; // 水平移动
        const moveY = centerY * depth * 15; // 垂直移动
        layer.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // 特色区块组件
  const FeatureBlock = ({ title, description, icon, link }) => (
    <div className="interactive-card shine-effect p-6">
      <div className="text-4xl text-primary-500 mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-300 mb-4">{description}</p>
      <Link to={link} className="text-primary-400 hover:text-primary-300 flex items-center">
        了解更多 <span className="ml-1">→</span>
      </Link>
    </div>
  );

  return (
    <div>
      {/* 英雄区块 */}
      <section className="py-20 px-4 dynamic-gradient text-center relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute h-20 w-20 rounded-full bg-teal-500/30 top-1/4 left-1/4 floating-slow"></div>
          <div className="absolute h-32 w-32 rounded-full bg-blue-500/20 top-1/3 right-1/3 floating"></div>
          <div className="absolute h-16 w-16 rounded-full bg-purple-500/30 bottom-1/4 right-1/4 floating-fast"></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-5xl font-bold mb-6 gradient-text">
            MetaverseX 多元宇宙交易平台
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            在AlveyChain上铸造、展示和交易3D资产NFT，并通过VR获得沉浸式体验
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/marketplace" className="btn-gradient px-8 py-3 rounded-full font-medium shine-effect">
              探索市场
            </Link>
            <Link to="/create" className="bg-gray-800 border border-primary-500 px-8 py-3 rounded-full font-medium hover:bg-gray-700 transition-colors">
              创建NFT
            </Link>
          </div>
        </div>
      </section>

      {/* 特色功能 */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">平台特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureBlock
              title="3D资产NFT"
              description="铸造和交易3D模型NFT，支持多种格式和VR兼容性"
              icon="🖼️"
              link="/marketplace"
            />
            <FeatureBlock
              title="虚拟空间"
              description="购买或租赁虚拟空间，展示您的3D资产收藏"
              icon="🏙️"
              link="/spaces"
            />
            <FeatureBlock
              title="VR体验"
              description="通过VR设备获得沉浸式体验，与您的资产互动"
              icon="🥽"
              link="/spaces"
            />
          </div>
        </div>
      </section>

      {/* 如何使用 */}
      <section className="py-16 px-4 bg-gray-800/50">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 gradient-text">开始使用</h2>
          <div className="max-w-4xl mx-auto" ref={parallaxRef}>
            <div className="flex flex-col md:flex-row items-center mb-12 relative">
              <div className="md:w-1/2 md:pr-8 mb-6 md:mb-0 z-10">
                <div className="text-4xl font-bold gradient-text mb-2">01</div>
                <h3 className="text-2xl font-bold mb-2">连接钱包</h3>
                <p className="text-gray-300">
                  使用MetaMask连接到AlveyChain，获取MVX代币以进行交易和铸造
                </p>
              </div>
              <div className="md:w-1/2 parallax-container h-64 bg-gray-700/30 rounded-lg border border-gray-700">
                <div className="parallax-layer-0 flex items-center justify-center h-full">
                  <div className="text-6xl floating">👛</div>
                </div>
                <div className="parallax-layer-1 absolute inset-0">
                  <div className="absolute h-12 w-12 rounded-full bg-teal-500/10 top-1/4 left-1/4"></div>
                  <div className="absolute h-8 w-8 rounded-full bg-blue-500/10 bottom-1/4 right-1/4"></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse items-center mb-12 relative">
              <div className="md:w-1/2 md:pl-8 mb-6 md:mb-0 z-10">
                <div className="text-4xl font-bold gradient-text mb-2">02</div>
                <h3 className="text-2xl font-bold mb-2">创建或购买NFT</h3>
                <p className="text-gray-300">
                  上传3D模型铸造为NFT，或在市场上购买其他创作者的资产
                </p>
              </div>
              <div className="md:w-1/2 parallax-container h-64 bg-gray-700/30 rounded-lg border border-gray-700">
                <div className="parallax-layer-0 flex items-center justify-center h-full">
                  <div className="text-6xl floating">🛒</div>
                </div>
                <div className="parallax-layer-1 absolute inset-0">
                  <div className="absolute h-10 w-10 rounded-full bg-green-500/10 top-1/3 right-1/4"></div>
                  <div className="absolute h-6 w-6 rounded-full bg-purple-500/10 bottom-1/3 left-1/3"></div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center relative">
              <div className="md:w-1/2 md:pr-8 mb-6 md:mb-0 z-10">
                <div className="text-4xl font-bold gradient-text mb-2">03</div>
                <h3 className="text-2xl font-bold mb-2">体验虚拟空间</h3>
                <p className="text-gray-300">
                  购买或租赁虚拟空间，展示您的NFT，并通过VR沉浸式体验它们
                </p>
              </div>
              <div className="md:w-1/2 parallax-container h-64 bg-gray-700/30 rounded-lg border border-gray-700">
                <div className="parallax-layer-0 flex items-center justify-center h-full">
                  <div className="text-6xl floating">🥽</div>
                </div>
                <div className="parallax-layer-1 absolute inset-0">
                  <div className="absolute h-14 w-14 rounded-full bg-yellow-500/10 bottom-1/4 right-1/3"></div>
                  <div className="absolute h-9 w-9 rounded-full bg-red-500/10 top-1/3 left-1/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 行动召唤 */}
      <section className="py-20 px-4 text-center dynamic-gradient relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute h-24 w-24 rounded-full bg-teal-500/30 top-1/3 left-1/5 floating-slow"></div>
          <div className="absolute h-20 w-20 rounded-full bg-blue-500/20 bottom-1/3 right-1/5 floating"></div>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-3xl font-bold mb-6 gradient-text">准备好加入多元宇宙了吗？</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            开始探索无限可能的虚拟世界，创建、收集和体验独特的3D资产
          </p>
          <Link to="/marketplace" className="btn-gradient px-8 py-3 rounded-full font-medium inline-block shine-effect">
            立即探索
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 