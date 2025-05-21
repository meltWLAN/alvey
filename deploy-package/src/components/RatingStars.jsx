import React, { useState } from 'react';

/**
 * 星级评分组件
 * @param {Object} props 组件属性
 * @param {number} props.rating 当前评分 (1-5)
 * @param {function} props.onRatingChange 评分变化时的回调函数
 * @param {boolean} props.readOnly 是否只读
 * @param {number} props.size 星星大小 ('small', 'medium', 'large')
 * @param {string} props.activeColor 激活状态的颜色
 * @param {string} props.inactiveColor 未激活状态的颜色
 */
const RatingStars = ({ 
  rating = 0, 
  onRatingChange = () => {}, 
  readOnly = false,
  size = 'medium',
  activeColor = 'text-yellow-400',
  inactiveColor = 'text-gray-500'
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  
  // 星星大小类
  const sizeClass = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-3xl'
  };
  
  // 处理点击事件
  const handleClick = (newRating) => {
    if (readOnly) return;
    onRatingChange(newRating);
  };
  
  // 处理鼠标悬停事件
  const handleMouseEnter = (rating) => {
    if (readOnly) return;
    setHoverRating(rating);
  };
  
  // 处理鼠标离开事件
  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };
  
  // 渲染星星
  const renderStar = (index) => {
    const currentRating = hoverRating || rating;
    const isFilled = index <= currentRating;
    
    return (
      <span
        key={index}
        className={`${isFilled ? activeColor : inactiveColor} ${sizeClass[size]} cursor-${readOnly ? 'default' : 'pointer'} transition-colors duration-200`}
        onClick={() => handleClick(index)}
        onMouseEnter={() => handleMouseEnter(index)}
        onMouseLeave={handleMouseLeave}
      >
        ★
      </span>
    );
  };
  
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map(renderStar)}
      
      {!readOnly && (
        <span className="ml-2 text-sm text-gray-400">
          {hoverRating > 0 ? `${hoverRating}/5` : rating > 0 ? `${rating}/5` : '点击评分'}
        </span>
      )}
    </div>
  );
};

export default RatingStars; 