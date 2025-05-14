import React, { useState } from 'react';
import RatingStars from './RatingStars';
import { useNotification } from '../contexts/NotificationContext';

/**
 * 评价表单组件
 * @param {Object} props 组件属性
 * @param {Function} props.onSubmit 提交评价的回调函数
 * @param {string} props.itemType 评价对象类型 ('nft' 或 'space')
 * @param {string} props.itemId 评价对象ID
 */
const ReviewForm = ({ onSubmit, itemType = 'nft', itemId }) => {
  const { showSuccess, showError } = useNotification();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      showError('请选择评分');
      return;
    }
    
    if (review.trim().length < 10) {
      showError('评价内容至少需要10个字符');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // 构建评价数据
      const reviewData = {
        itemType,
        itemId,
        rating,
        content: review,
        timestamp: Date.now()
      };
      
      // 调用提交回调
      await onSubmit(reviewData);
      
      // 成功提交
      showSuccess('评价提交成功！');
      
      // 重置表单
      setRating(0);
      setReview('');
    } catch (error) {
      showError(`提交评价失败: ${error.message || '未知错误'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/50 p-4 rounded-lg backdrop-blur-sm">
      <h3 className="text-xl font-bold mb-4">写下您的评价</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">您的评分</label>
        <RatingStars rating={rating} onRatingChange={setRating} />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">评价内容</label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          className="input-bordered w-full min-h-[100px]"
          placeholder="分享您的使用体验..."
        />
        <div className="text-xs text-gray-400 mt-1">
          {review.length < 10 ? `至少需要10个字符，当前: ${review.length}` : `字符数: ${review.length}`}
        </div>
      </div>
      
      <button
        type="submit"
        className="btn-gradient px-4 py-2 rounded-full w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            提交中...
          </span>
        ) : '提交评价'}
      </button>
    </form>
  );
};

export default ReviewForm; 