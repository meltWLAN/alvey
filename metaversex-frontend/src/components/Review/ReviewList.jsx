import React, { useState } from 'react';
import RatingStars from './RatingStars';
import { formatAddress } from '../../utils/web3';

/**
 * Individual review item component
 */
const ReviewItem = ({ review }) => {
  const { author, rating, content, timestamp } = review;
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleDateString();
  
  return (
    <div className="border-b border-gray-700 pb-4 mb-4 last:border-0 last:mb-0 last:pb-0">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold mr-2">
            {author.slice(2, 4).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{formatAddress(author)}</div>
            <div className="text-xs text-gray-400">{formattedDate}</div>
          </div>
        </div>
        <RatingStars rating={rating} readOnly size="sm" />
      </div>
      <p className="text-gray-300">{content}</p>
    </div>
  );
};

/**
 * Review list component that displays a collection of reviews
 */
const ReviewList = ({ reviews = [], emptyMessage = 'No reviews yet' }) => {
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'highest', 'lowest'
  
  // Sort reviews based on selected method
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
  
  // Calculate average rating
  const averageRating = reviews.length
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;
  
  // Show message if no reviews
  if (!reviews.length) {
    return (
      <div className="bg-gray-800 bg-opacity-30 p-6 rounded-xl text-center">
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-sm p-6 rounded-xl border border-gray-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-xl font-bold">User Reviews</h3>
          <div className="flex items-center mt-1">
            <span className="text-3xl font-bold text-yellow-400 mr-2">{averageRating}</span>
            <RatingStars rating={parseFloat(averageRating)} readOnly size="sm" />
            <span className="text-sm text-gray-400 ml-2">
              ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
        
        <div className="mt-4 md:mt-0">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4">
        {sortedReviews.map((review, index) => (
          <ReviewItem key={`${review.author}-${index}`} review={review} />
        ))}
      </div>
    </div>
  );
};

export default ReviewList; 