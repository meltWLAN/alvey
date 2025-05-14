import React, { useState } from 'react';
import { FaGamepad, FaTrophy, FaMedal, FaGift, FaChartLine } from 'react-icons/fa';

/**
 * GameElements组件 - 为平台添加游戏化元素
 * 包括积分系统、排行榜、挑战任务等
 */
const GameElements = ({ userId }) => {
  const [userStats, setUserStats] = useState({
    points: 1250,
    level: 3,
    rank: 42,
    completed: 7,
    badges: ['收藏家', '早期用户', 'VR探索者']
  });
  
  const [challenges, setChallenges] = useState([
    {
      id: 1,
      title: '创建首个3D空间',
      description: '创建并发布您的第一个虚拟展示空间',
      reward: 200,
      completed: false
    },
    {
      id: 2,
      title: '组织虚拟活动',
      description: '在您的空间中成功举办一场有至少5人参与的活动',
      reward: 300,
      completed: false
    },
    {
      id: 3,
      title: 'NFT交易大师',
      description: '完成至少3次NFT的买卖交易',
      reward: 250,
      completed: true
    },
    {
      id: 4,
      title: 'VR深度体验',
      description: '在VR模式下探索至少10个不同的NFT',
      reward: 200,
      completed: true
    }
  ]);

  // 排行榜数据
  const leaderboard = [
    { id: 1, username: 'NFT创新者', points: 5840, badges: 12 },
    { id: 2, username: '元宇宙先锋', points: 4920, badges: 9 },
    { id: 3, username: '3D艺术家', points: 4350, badges: 11 },
    { id: 4, username: '收藏达人', points: 3820, badges: 8 },
    { id: 5, username: '虚拟建筑师', points: 3640, badges: 7 }
  ];

  // 完成挑战
  const completeChallenge = (challengeId) => {
    setChallenges(challenges.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, completed: true } 
        : challenge
    ));
    
    // 找到对应挑战以更新积分
    const challenge = challenges.find(c => c.id === challengeId);
    if (challenge && !challenge.completed) {
      setUserStats({
        ...userStats,
        points: userStats.points + challenge.reward,
        completed: userStats.completed + 1
      });
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <div className="flex items-center mb-6">
        <FaGamepad className="text-2xl text-purple-400 mr-3" />
        <h2 className="text-2xl font-bold">游戏化中心</h2>
      </div>
      
      {/* 用户状态卡片 */}
      <div className="bg-gradient-to-r from-purple-900/60 to-blue-900/60 rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-xl">Lv.{userStats.level} 探索者</h3>
            <p className="text-gray-300 text-sm">排名: #{userStats.rank}</p>
          </div>
          <div className="text-right">
            <div className="text-yellow-400 font-bold text-xl">{userStats.points} 点</div>
            <p className="text-gray-300 text-sm">下一级还需: {1000 - (userStats.points % 1000)} 点</p>
          </div>
        </div>
        
        {/* 进度条 */}
        <div className="h-2 bg-gray-700 rounded-full mb-4 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500" 
            style={{ width: `${(userStats.points % 1000) / 10}%` }}
          ></div>
        </div>
        
        {/* 徽章展示 */}
        <div>
          <p className="text-sm font-medium mb-2">已获得徽章: {userStats.badges.length}</p>
          <div className="flex space-x-2">
            {userStats.badges.map((badge, index) => (
              <div key={index} className="bg-gray-700/70 text-xs px-2 py-1 rounded-full">
                {badge}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 主要内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 挑战任务 */}
        <div className="bg-gray-700/30 rounded-xl p-4">
          <div className="flex items-center mb-4">
            <FaMedal className="text-xl text-yellow-400 mr-2" />
            <h3 className="font-bold text-lg">挑战任务</h3>
          </div>
          
          <div className="space-y-3">
            {challenges.map(challenge => (
              <div 
                key={challenge.id} 
                className={`border ${challenge.completed ? 'border-green-500/50 bg-green-900/10' : 'border-gray-600 bg-gray-800/30'} rounded-lg p-3`}
              >
                <div className="flex justify-between mb-1">
                  <h4 className="font-medium">{challenge.title}</h4>
                  <span className="text-yellow-400 text-sm">{challenge.reward} 点</span>
                </div>
                <p className="text-sm text-gray-300 mb-2">{challenge.description}</p>
                
                <button
                  onClick={() => !challenge.completed && completeChallenge(challenge.id)}
                  className={`w-full py-1 rounded text-sm ${
                    challenge.completed 
                      ? 'bg-green-600 text-white cursor-default' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                  disabled={challenge.completed}
                >
                  {challenge.completed ? '已完成' : '标记完成'}
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* 排行榜 */}
        <div className="bg-gray-700/30 rounded-xl p-4">
          <div className="flex items-center mb-4">
            <FaTrophy className="text-xl text-yellow-400 mr-2" />
            <h3 className="font-bold text-lg">用户排行榜</h3>
          </div>
          
          <div className="space-y-2">
            {leaderboard.map((user, index) => (
              <div 
                key={user.id} 
                className={`flex items-center p-2 rounded ${index < 3 ? 'bg-yellow-900/20 border border-yellow-700/30' : 'bg-gray-800/30'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                  index === 0 ? 'bg-yellow-500' : 
                  index === 1 ? 'bg-gray-400' : 
                  index === 2 ? 'bg-amber-700' : 'bg-gray-700'
                }`}>
                  {index + 1}
                </div>
                
                <div className="flex-grow">
                  <div className="font-medium">{user.username}</div>
                  <div className="text-xs text-gray-400">{user.badges} 徽章</div>
                </div>
                
                <div className="text-yellow-400 font-bold">{user.points}</div>
              </div>
            ))}
          </div>
          
          <button className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded">
            查看完整排行榜
          </button>
        </div>
      </div>
      
      {/* 每日奖励和统计 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="bg-gray-700/30 rounded-xl p-4">
          <div className="flex items-center mb-4">
            <FaGift className="text-xl text-red-400 mr-2" />
            <h3 className="font-bold text-lg">每日奖励</h3>
          </div>
          
          <div className="text-center py-4">
            <p className="text-lg mb-3">今日登录奖励已经准备好了！</p>
            <button className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg font-bold hover:from-red-600 hover:to-pink-600 transition-all">
              领取100积分
            </button>
            <p className="text-sm text-gray-400 mt-3">连续登录: 3天 (再4天可获得额外奖励)</p>
          </div>
        </div>
        
        <div className="bg-gray-700/30 rounded-xl p-4">
          <div className="flex items-center mb-4">
            <FaChartLine className="text-xl text-blue-400 mr-2" />
            <h3 className="font-bold text-lg">活动统计</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">创建的NFT</span>
              <span className="font-bold">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">交易次数</span>
              <span className="font-bold">7</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">参与活动</span>
              <span className="font-bold">4</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">收藏作品</span>
              <span className="font-bold">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">VR体验时长</span>
              <span className="font-bold">5.2小时</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameElements; 