import React, { useState, useEffect } from 'react';
import { 
  FaTrophy, FaCoins, FaChartLine, FaTasks, FaLevelUpAlt, 
  FaUsers, FaRegCalendarAlt, FaGift, FaLock, FaCrown 
} from 'react-icons/fa';

/**
 * EnhancedGameCenter组件 - 集成平台的游戏化功能
 * 包括任务系统、成就、排行榜和NFT相关挑战
 */
const EnhancedGameCenter = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('任务');
  const [userStats, setUserStats] = useState({
    level: 3,
    experience: 1240,
    experienceToNextLevel: 2000,
    points: 850,
    completedTasks: 18,
    achievements: 7,
    rank: 245
  });
  
  // 模拟加载用户数据
  useEffect(() => {
    // 实际应用中，这里会从API获取用户数据
    console.log(`加载用户 ${userId} 的游戏化数据`);
  }, [userId]);
  
  // 任务列表
  const tasks = [
    {
      id: 'task-1',
      title: '创建您的第一个3D NFT',
      description: '使用创作工具创建一个3D模型并铸造为NFT',
      reward: 100,
      isCompleted: true,
      category: '创作'
    },
    {
      id: 'task-2',
      title: '完成社区指南阅读',
      description: '阅读平台基本使用指南',
      reward: 50,
      isCompleted: true,
      category: '新手'
    },
    {
      id: 'task-3',
      title: '连接您的社交媒体账号',
      description: '将您的Twitter、Discord或Instagram账号与平台连接',
      reward: 75,
      isCompleted: true,
      category: '社交'
    },
    {
      id: 'task-4',
      title: '购买您的第一个NFT',
      description: '在市场上购买一个NFT',
      reward: 100,
      isCompleted: false,
      category: '交易'
    },
    {
      id: 'task-5',
      title: '获得5次NFT查看',
      description: '您的NFT被其他用户查看5次',
      reward: 75,
      progress: 3,
      maxProgress: 5,
      isCompleted: false,
      category: '社交'
    },
    {
      id: 'task-6',
      title: '自定义您的元宇宙空间',
      description: '为您的个人空间添加至少3个对象',
      reward: 150,
      progress: 1,
      maxProgress: 3,
      isCompleted: false,
      category: '创作'
    },
    {
      id: 'task-7',
      title: '与AI助手进行5次交互',
      description: '使用AI助手获取建议或生成内容',
      reward: 60,
      progress: 2,
      maxProgress: 5,
      isCompleted: false,
      category: '新手'
    }
  ];
  
  // 成就列表
  const achievements = [
    {
      id: 'achievement-1',
      title: '内容创作者',
      description: '创建您的第一个NFT',
      icon: <FaTrophy className="text-yellow-400" />,
      isUnlocked: true,
      rewardPoints: 100
    },
    {
      id: 'achievement-2',
      title: '社交明星',
      description: '获得20个NFT点赞',
      icon: <FaTrophy className="text-yellow-400" />,
      isUnlocked: true,
      rewardPoints: 150
    },
    {
      id: 'achievement-3',
      title: '收藏家',
      description: '拥有5个不同类别的NFT',
      icon: <FaTrophy className="text-yellow-400" />,
      isUnlocked: true,
      rewardPoints: 200
    },
    {
      id: 'achievement-4',
      title: '交易达人',
      description: '完成10次NFT交易',
      icon: <FaTrophy className="text-gray-400" />,
      isUnlocked: false,
      progress: 4,
      maxProgress: 10,
      rewardPoints: 250
    },
    {
      id: 'achievement-5',
      title: '空间设计师',
      description: '创建一个收到50次访问的虚拟空间',
      icon: <FaTrophy className="text-gray-400" />,
      isUnlocked: false,
      progress: 12,
      maxProgress: 50,
      rewardPoints: 300
    },
    {
      id: 'achievement-6',
      title: 'VR探险家',
      description: '以VR模式探索10个不同的空间',
      icon: <FaTrophy className="text-gray-400" />,
      isUnlocked: false,
      progress: 3,
      maxProgress: 10,
      rewardPoints: 200
    },
    {
      id: 'achievement-7',
      title: '社区贡献者',
      description: '对10个不同用户的NFT发表评论',
      icon: <FaTrophy className="text-yellow-400" />,
      isUnlocked: true,
      rewardPoints: 150
    },
    {
      id: 'achievement-8',
      title: '艺术鉴赏家',
      description: '查看100个不同的NFT',
      icon: <FaTrophy className="text-gray-400" />,
      isUnlocked: false,
      progress: 57,
      maxProgress: 100,
      rewardPoints: 300
    }
  ];
  
  // 排行榜数据
  const leaderboard = [
    { id: 'user1', name: 'NFT大师', avatar: '/avatars/user1.jpg', points: 4350, rank: 1 },
    { id: 'user2', name: '创意天才', avatar: '/avatars/user2.jpg', points: 3890, rank: 2 },
    { id: 'user3', name: '数字艺术家', avatar: '/avatars/user3.jpg', points: 3720, rank: 3 },
    { id: 'user4', name: '收藏狂人', avatar: '/avatars/user4.jpg', points: 3650, rank: 4 },
    { id: 'user5', name: '交易之王', avatar: '/avatars/user5.jpg', points: 3520, rank: 5 },
    { id: 'user6', name: '元宇宙先锋', avatar: '/avatars/user6.jpg', points: 3380, rank: 6 },
    { id: 'user7', name: '艺术鉴赏家', avatar: '/avatars/user7.jpg', points: 3250, rank: 7 },
    { id: 'user8', name: '虚拟建筑师', avatar: '/avatars/user8.jpg', points: 3120, rank: 8 },
    { id: 'user9', name: '3D模型专家', avatar: '/avatars/user9.jpg', points: 2980, rank: 9 },
    { id: 'user10', name: 'NFT投资者', avatar: '/avatars/user10.jpg', points: 2850, rank: 10 }
  ];
  
  // 每周挑战
  const weeklyChallenge = {
    title: "虚拟展览挑战",
    description: "本周参与"未来城市"主题的虚拟展览，创建或收集与主题相关的NFT",
    reward: 500,
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5天后
    participants: 187
  };
  
  // 奖励商店
  const rewards = [
    {
      id: 'reward1',
      title: '独家3D模型模板',
      description: '解锁高级3D模型模板供您创作使用',
      cost: 500,
      category: '创作工具',
      image: '/rewards/model-template.jpg'
    },
    {
      id: 'reward2',
      title: '交易手续费折扣',
      description: '为期7天的交易手续费50%折扣',
      cost: 300,
      category: '交易特权',
      image: '/rewards/discount.jpg'
    },
    {
      id: 'reward3',
      title: '稀有虚拟空间皮肤',
      description: '限量版空间装饰主题',
      cost: 800,
      category: '装饰',
      image: '/rewards/space-skin.jpg'
    },
    {
      id: 'reward4',
      title: '市场首页推荐位',
      description: '您的NFT将在市场首页展示24小时',
      cost: 1000,
      category: '推广',
      image: '/rewards/featured-spot.jpg'
    },
    {
      id: 'reward5',
      title: '限量版头像框',
      description: '独特的个人资料头像装饰框',
      cost: 250,
      category: '装饰',
      image: '/rewards/avatar-frame.jpg'
    },
    {
      id: 'reward6',
      title: 'AI模型生成额度',
      description: '10次高级AI模型生成次数',
      cost: 450,
      category: '创作工具',
      image: '/rewards/ai-credits.jpg'
    }
  ];

  // 格式化日期
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // 进度条组件
  const ProgressBar = ({ current, max, color = 'blue' }) => {
    const percent = Math.min(Math.round((current / max) * 100), 100);
    
    return (
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full bg-${color}-500`} 
          style={{ width: `${percent}%` }}
        >
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-2">游戏中心</h2>
      <p className="text-gray-300 text-sm mb-6">完成任务和挑战，获取奖励和成就</p>
      
      {/* 用户等级和积分信息 */}
      <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center mb-3 md:mb-0">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg mr-3 text-xl font-bold">
              {userStats.level}
            </div>
            <div>
              <h3 className="text-lg font-semibold">等级 {userStats.level}</h3>
              <div className="flex items-center text-sm text-gray-300">
                <FaCoins className="mr-1 text-yellow-400" /> 
                <span>{userStats.points} 点数</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col w-full md:w-auto md:max-w-xs">
            <div className="flex justify-between text-xs mb-1">
              <span>经验值: {userStats.experience}/{userStats.experienceToNextLevel}</span>
              <span>{Math.round((userStats.experience / userStats.experienceToNextLevel) * 100)}%</span>
            </div>
            <ProgressBar current={userStats.experience} max={userStats.experienceToNextLevel} color="purple" />
          </div>
        </div>
      </div>
      
      {/* 标签页导航 */}
      <div className="flex mb-6 border-b border-gray-700">
        {['任务', '成就', '排行榜', '每周挑战', '奖励商店'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab 
                ? 'text-white border-b-2 border-primary-500' 
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* 任务面板 */}
      {activeTab === '任务' && (
        <div>
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">每日任务</h3>
            <div className="text-sm text-gray-400">
              已完成: {tasks.filter(t => t.isCompleted).length}/{tasks.length}
            </div>
          </div>
          
          <div className="space-y-3">
            {tasks.map(task => (
              <div 
                key={task.id}
                className={`p-4 rounded-lg ${
                  task.isCompleted 
                    ? 'bg-gray-700/30 border border-green-500/20' 
                    : 'bg-gray-700/50 hover:bg-gray-700/70'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className={`font-medium ${task.isCompleted ? 'text-green-400' : 'text-white'}`}>
                      {task.title}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1">{task.description}</p>
                    
                    {/* 任务进度 */}
                    {!task.isCompleted && task.progress !== undefined && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{task.progress}/{task.maxProgress}</span>
                          <span>{Math.round((task.progress / task.maxProgress) * 100)}%</span>
                        </div>
                        <ProgressBar current={task.progress} max={task.maxProgress} />
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex flex-col items-end">
                    <div className="flex items-center text-amber-400 mb-2">
                      <FaCoins className="mr-1" /> {task.reward}
                    </div>
                    <span className="text-xs bg-gray-600 px-2 py-1 rounded">{task.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 成就面板 */}
      {activeTab === '成就' && (
        <div>
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">成就</h3>
            <div className="text-sm text-gray-400">
              已解锁: {achievements.filter(a => a.isUnlocked).length}/{achievements.length}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {achievements.map(achievement => (
              <div 
                key={achievement.id}
                className={`p-4 rounded-lg ${
                  achievement.isUnlocked 
                    ? 'bg-gradient-to-r from-gray-700/70 to-gray-800/70 border border-yellow-500/20' 
                    : 'bg-gray-700/30'
                }`}
              >
                <div className="flex items-center">
                  <div className={`p-3 rounded-full ${
                    achievement.isUnlocked 
                      ? 'bg-yellow-500/20' 
                      : 'bg-gray-600/20'
                  }`}>
                    {achievement.icon}
                  </div>
                  
                  <div className="ml-3 flex-1">
                    <h4 className={`font-medium ${
                      achievement.isUnlocked ? 'text-yellow-400' : 'text-gray-400'
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className="text-xs text-gray-400 mt-1">{achievement.description}</p>
                    
                    {/* 成就进度 */}
                    {!achievement.isUnlocked && achievement.progress !== undefined && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span>{achievement.progress}/{achievement.maxProgress}</span>
                          <span>{Math.round((achievement.progress / achievement.maxProgress) * 100)}%</span>
                        </div>
                        <ProgressBar current={achievement.progress} max={achievement.maxProgress} color="yellow" />
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-2 flex items-center text-amber-400 text-sm">
                    <FaCoins className="mr-1" /> {achievement.rewardPoints}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 排行榜面板 */}
      {activeTab === '排行榜' && (
        <div>
          <div className="flex justify-between mb-4">
            <h3 className="text-lg font-semibold">每月排行榜</h3>
            <div className="text-sm text-gray-400">
              您的排名: {userStats.rank}
            </div>
          </div>
          
          <div className="space-y-2">
            {leaderboard.map((user, index) => (
              <div 
                key={user.id}
                className={`p-3 rounded-lg flex items-center ${
                  index < 3 
                    ? 'bg-gradient-to-r from-gray-700/70 to-gray-800/70 border border-yellow-500/20' 
                    : 'bg-gray-700/30'
                }`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded-full ${
                  index === 0 ? 'bg-yellow-500' :
                  index === 1 ? 'bg-gray-300' :
                  index === 2 ? 'bg-amber-600' : 'bg-gray-600'
                } mr-3 font-bold text-gray-900`}>
                  {index < 3 ? <FaCrown /> : user.rank}
                </div>
                
                <div className="w-8 h-8 bg-gray-600 rounded-full overflow-hidden mr-3">
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                    }}
                  />
                </div>
                
                <div className="flex-1">
                  <span className="font-medium">{user.name}</span>
                </div>
                
                <div className="flex items-center text-amber-400">
                  <FaCoins className="mr-1" /> {user.points.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 每周挑战面板 */}
      {activeTab === '每周挑战' && (
        <div>
          <div className="bg-gradient-to-r from-indigo-800/50 to-purple-800/50 rounded-lg p-5 mb-6 border border-indigo-500/30">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-white">{weeklyChallenge.title}</h3>
              <div className="bg-indigo-900/60 text-indigo-300 text-xs px-3 py-1 rounded-full flex items-center">
                <FaRegCalendarAlt className="mr-1" />
                结束于: {formatDate(weeklyChallenge.endDate)}
              </div>
            </div>
            
            <p className="text-gray-300 mb-4">{weeklyChallenge.description}</p>
            
            <div className="flex flex-wrap justify-between items-center">
              <div className="flex items-center text-amber-400 font-bold">
                <FaCoins className="mr-2 text-xl" /> {weeklyChallenge.reward} 点数奖励
              </div>
              
              <div className="mt-3 sm:mt-0 text-sm text-indigo-300">
                <FaUsers className="inline mr-1" /> {weeklyChallenge.participants} 位参与者
              </div>
            </div>
          </div>
          
          <div className="text-center p-6 bg-gray-700/30 rounded-lg">
            <h4 className="font-medium mb-2">历史挑战</h4>
            <p className="text-sm text-gray-400">
              您可以查看过去的挑战记录和获奖情况
            </p>
            <button className="mt-3 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded text-sm">
              查看历史挑战
            </button>
          </div>
        </div>
      )}
      
      {/* 奖励商店面板 */}
      {activeTab === '奖励商店' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">奖励商店</h3>
            <div className="bg-gray-700 px-3 py-1 rounded-full flex items-center">
              <FaCoins className="text-yellow-400 mr-1" /> 
              <span>{userStats.points} 可用点数</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map(reward => (
              <div 
                key={reward.id}
                className="bg-gray-700/50 rounded-lg overflow-hidden"
              >
                <div className="h-32 bg-gray-600 relative">
                  <img 
                    src={reward.image} 
                    alt={reward.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x150?text=' + reward.title;
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-gray-900/80 text-xs px-2 py-1 rounded">
                    {reward.category}
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="font-medium mb-1">{reward.title}</h4>
                  <p className="text-xs text-gray-400 mb-3">{reward.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-amber-400">
                      <FaCoins className="mr-1" /> {reward.cost}
                    </div>
                    
                    <button 
                      className={`px-3 py-1 rounded text-sm ${
                        userStats.points >= reward.cost 
                          ? 'bg-primary-600 hover:bg-primary-500 text-white' 
                          : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      }`}
                      disabled={userStats.points < reward.cost}
                    >
                      {userStats.points >= reward.cost ? '兑换' : <FaLock />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedGameCenter; 