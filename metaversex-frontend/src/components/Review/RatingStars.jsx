import React from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt } from 'react-icons/fa';

const RatingStars = ({ rating, setRating, size = 'md', readOnly = false, count = 5 }) => {
  // Determine the star size based on the size prop
  const getStarSize = () => {
    switch (size) {
      case 'sm': return 'text-lg';
      case 'md': return 'text-xl';
      case 'lg': return 'text-2xl';
      case 'xl': return 'text-3xl';
      default: return 'text-xl';
    }
  };

  // Generate array of numbers from 1 to count
  const stars = Array.from({ length: count }, (_, i) => i + 1);

  // For read-only display with half stars
  const renderReadOnlyStars = () => {
    return stars.map((star) => {
      if (rating >= star) {
        // Full star
        return <FaStar key={star} className={`${getStarSize()} text-yellow-400`} />;
      } else if (rating + 0.5 >= star) {
        // Half star
        return <FaStarHalfAlt key={star} className={`${getStarSize()} text-yellow-400`} />;
      } else {
        // Empty star
        return <FaRegStar key={star} className={`${getStarSize()} text-gray-400`} />;
      }
    });
  };

  // For interactive rating input
  const renderInteractiveStars = () => {
    return stars.map((star) => {
      const filled = star <= rating;
      
      return (
        <button 
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setRating(star)}
          className={`focus:outline-none transition-colors duration-200 ${getStarSize()}`}
          aria-label={`Rate ${star} stars out of ${count}`}
        >
          {filled ? (
            <FaStar className="text-yellow-400 hover:text-yellow-500" />
          ) : (
            <FaRegStar className="text-gray-400 hover:text-yellow-500" />
          )}
        </button>
      );
    });
  };

  return (
    <div className="flex items-center">
      {readOnly ? renderReadOnlyStars() : renderInteractiveStars()}
      
      {/* Optional: Display the numeric rating */}
      {readOnly && rating > 0 && (
        <span className="ml-2 text-gray-400 text-sm font-medium">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars; 