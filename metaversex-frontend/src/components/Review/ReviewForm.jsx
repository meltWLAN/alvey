import React, { useState } from 'react';
import RatingStars from './RatingStars';
import { useNotification } from '../../contexts/NotificationContext';
import { useWeb3 } from '../../contexts/Web3Context';

const ReviewForm = ({ onSubmit, itemType = 'nft', itemId }) => {
  const { showSuccess, showError } = useNotification();
  const { account } = useWeb3();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!account) {
      showError('Please connect your wallet to submit a review');
      return;
    }
    
    if (rating === 0) {
      showError('Please select a rating');
      return;
    }
    
    if (review.trim().length < 10) {
      showError('Review content must be at least 10 characters');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Build review data
      const reviewData = {
        itemType,
        itemId,
        rating,
        content: review,
        author: account,
        timestamp: Date.now()
      };
      
      // Call the submit callback
      await onSubmit(reviewData);
      
      // Success
      showSuccess('Review submitted successfully!');
      
      // Reset form
      setRating(0);
      setReview('');
    } catch (error) {
      showError(`Failed to submit review: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-sm p-6 rounded-xl border border-gray-700">
      <h3 className="text-xl font-bold mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Your Rating</label>
          <RatingStars rating={rating} setRating={setRating} size="lg" />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Your Review</label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Share your experience..."
            rows={4}
          />
          <div className="text-xs text-gray-400 mt-1">
            {review.length < 10 
              ? `At least 10 characters required, currently: ${review.length}` 
              : `Character count: ${review.length}`}
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full flex justify-center items-center py-2 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting || !account}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : !account ? (
            'Connect Wallet to Review'
          ) : (
            'Submit Review'
          )}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm; 