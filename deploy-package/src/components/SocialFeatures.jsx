import React, { useState } from 'react';
import { FaHeart, FaComment, FaShareAlt, FaUserFriends, FaTrophy, FaCalendarAlt } from 'react-icons/fa';

/**
 * SocialFeatures组件 - 为NFT添加社交互动功能
 * 包括点赞、评论、分享、社区互动等功能
 */
const SocialFeatures = ({ nftId, initialLikes = 0, initialComments = [] }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    title: '',
    description: '',
    date: '',
    time: ''
  });

  // 处理点赞
  const handleLike = () => {
    if (isLiked) {
      setLikes(prev => prev - 1);
    } else {
      setLikes(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  // 处理评论提交
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: Date.now(),
      text: commentText,
      user: '我',
      timestamp: new Date().toISOString()
    };

    setComments([...comments, newComment]);
    setCommentText('');
  };

  // 处理分享NFT
  const handleShare = () => {
    // 在真实环境中，这里会弹出社交媒体分享选项
    // 简化版仅复制链接
    const url = `${window.location.origin}/marketplace/${nftId}`;
    navigator.clipboard.writeText(url);
    alert('链接已复制到剪贴板！');
  };

  // 处理创建活动表单提交
  const handleEventSubmit = (e) => {
    e.preventDefault();
    // 这里通常会与后端API交互来创建活动
    console.log('创建活动:', eventDetails);
    alert('活动创建成功！参与者将收到通知。');
    setShowEventForm(false);
    setEventDetails({ title: '', description: '', date: '', time: '' });
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">社区互动</h2>
      
      {/* 互动按钮 */}
      <div className="flex space-x-4 mb-6">
        <button 
          className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
            isLiked ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
          onClick={handleLike}
        >
          <FaHeart className={isLiked ? 'text-red-400' : ''} />
          <span>{likes}</span>
        </button>
        
        <button 
          className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600"
          onClick={() => setShowComments(!showComments)}
        >
          <FaComment />
          <span>{comments.length}</span>
        </button>
        
        <button 
          className="flex items-center space-x-2 px-4 py-2 rounded-full bg-gray-700 text-gray-300 hover:bg-gray-600"
          onClick={handleShare}
        >
          <FaShareAlt />
          <span>分享</span>
        </button>
      </div>
      
      {/* 评论区 */}
      {showComments && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">评论</h3>
          
          <form onSubmit={handleCommentSubmit} className="mb-4">
            <div className="flex">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="写下你的评论..."
                className="flex-grow bg-gray-700 text-white px-4 py-2 rounded-l focus:outline-none"
              />
              <button 
                type="submit"
                className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-r"
              >
                发送
              </button>
            </div>
          </form>
          
          <div className="space-y-3">
            {comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="bg-gray-700/50 p-3 rounded">
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold">{comment.user}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(comment.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.text}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center">暂无评论，成为第一个评论的人吧！</p>
            )}
          </div>
        </div>
      )}
      
      {/* 社交功能 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <FaUserFriends className="text-blue-400 text-xl mr-2" />
            <h3 className="font-semibold">邀请好友</h3>
          </div>
          <p className="text-sm text-gray-300 mb-3">邀请好友一起欣赏和探索这个NFT。</p>
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded">
            邀请好友
          </button>
        </div>
        
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <FaTrophy className="text-yellow-400 text-xl mr-2" />
            <h3 className="font-semibold">收藏夹</h3>
          </div>
          <p className="text-sm text-gray-300 mb-3">将此NFT添加到您的个人收藏夹中。</p>
          <button className="w-full bg-yellow-600 hover:bg-yellow-500 text-white py-2 rounded">
            加入收藏
          </button>
        </div>
        
        <div className="bg-gray-700/50 p-4 rounded-lg">
          <div className="flex items-center mb-3">
            <FaCalendarAlt className="text-green-400 text-xl mr-2" />
            <h3 className="font-semibold">创建活动</h3>
          </div>
          <p className="text-sm text-gray-300 mb-3">基于此NFT创建虚拟活动。</p>
          <button 
            className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded"
            onClick={() => setShowEventForm(!showEventForm)}
          >
            创建活动
          </button>
        </div>
      </div>
      
      {/* 活动创建表单 */}
      {showEventForm && (
        <div className="mt-6 bg-gray-700/50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">创建NFT活动</h3>
          <form onSubmit={handleEventSubmit}>
            <div className="mb-3">
              <label className="block text-sm text-gray-400 mb-1">活动标题</label>
              <input
                type="text"
                value={eventDetails.title}
                onChange={(e) => setEventDetails({...eventDetails, title: e.target.value})}
                className="w-full bg-gray-600 text-white px-3 py-2 rounded focus:outline-none"
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm text-gray-400 mb-1">活动描述</label>
              <textarea
                value={eventDetails.description}
                onChange={(e) => setEventDetails({...eventDetails, description: e.target.value})}
                className="w-full bg-gray-600 text-white px-3 py-2 rounded focus:outline-none"
                rows="3"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">日期</label>
                <input
                  type="date"
                  value={eventDetails.date}
                  onChange={(e) => setEventDetails({...eventDetails, date: e.target.value})}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded focus:outline-none"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">时间</label>
                <input
                  type="time"
                  value={eventDetails.time}
                  onChange={(e) => setEventDetails({...eventDetails, time: e.target.value})}
                  className="w-full bg-gray-600 text-white px-3 py-2 rounded focus:outline-none"
                  required
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded"
              >
                创建活动
              </button>
              
              <button
                type="button"
                onClick={() => setShowEventForm(false)}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                取消
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default SocialFeatures; 