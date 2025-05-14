import React, { useState } from 'react';
import RatingStars from './RatingStars';
import { formatAddress } from '../utils/web3';

/**
 * 单个评价组件
 */
const ReviewItem = ({ review }) => {
  const { author, rating, content, timestamp } = review;
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleDateString('zh-CN');
  
  return (
    <div className="border-b border-gray-700 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 flex items-center justify-center text-white font-bold mr-2">
            {author.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{formatAddress(author)}</div>
            <div className="text-xs text-gray-400">{formattedDate}</div>
          </div>
        </div>
        <RatingStars rating={rating} readOnly size="small" />
      </div>
      <p className="text-gray-300">{content}</p>
    </div>
  );
};

/**
 * 评价列表组件
 * @param {Object} props 组件属性
 * @param {Array} props.reviews 评价数组
 * @param {string} props.emptyMessage 无评价时显示的消息
 */
const ReviewList = ({ reviews = [], emptyMessage = '暂无评价' }) => {
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'highest', 'lowest'
  
  // 排序评价
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'newest':
      default:
        return b.timestamp - a.timestamp;
    }
  });
  
  // 计算平均评分
  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;
  
  if (!reviews.length) {
    return (
      <div className="bg-gray-800/30 p-4 rounded-lg text-center">
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold">用户评价</h3>
          <div className="flex items-center mt-1">
            <span className="text-3xl font-bold text-yellow-400 mr-2">{averageRating}</span>
            <RatingStars rating={Math.round(averageRating)} readOnly size="small" />
            <span className="text-sm text-gray-400 ml-2">({reviews.length} 条评价)</span>
          </div>
        </div>
        
        <div>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-bordered px-2 py-1 text-sm"
          >
            <option value="newest">最新</option>
            <option value="highest">评分从高到低</option>
            <option value="lowest">评分从低到高</option>
          </select>
        </div>
      </div>
      
      <div>
        {sortedReviews.map((review, index) => (
          <ReviewItem key={index} review={review} />
        ))}
      </div>
    </div>
  );
};

export default ReviewList; 