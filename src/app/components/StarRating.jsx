"use client";
import { useState, useCallback, useMemo } from "react";

const StarRating = ({ rating, onRatingChange, readonly = false, size = "medium" }) => {
  const [hoverRating, setHoverRating] = useState(0)
  
  const handleStarClick = useCallback((starValue) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue)
    }
  }, [readonly, onRatingChange])
  
  const handleStarHover = useCallback((starValue) => {
    if (!readonly) {
      setHoverRating(starValue)
    }
  }, [readonly])
  
  const handleStarLeave = useCallback(() => {
    if (!readonly) {
      setHoverRating(0)
    }
  }, [readonly])
  
  const stars = useMemo(() => {
    return [1, 2, 3, 4, 5].map((starValue) => (
      <button
        key={starValue}
        type="button"
        className={`star-button ${
          starValue <= (hoverRating || rating) ? 'filled' : 'empty'
        }`}
        onClick={() => handleStarClick(starValue)}
        onMouseEnter={() => handleStarHover(starValue)}
        onMouseLeave={handleStarLeave}
        disabled={readonly}
        aria-label={`${starValue} ستاره`}
      >
        <svg viewBox="0 0 24 24" className="star-icon">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      </button>
    ))
  }, [hoverRating, rating, handleStarClick, handleStarHover, handleStarLeave, readonly])
  
  return (
    <div className={`star-rating ${size} ${readonly ? 'readonly' : 'interactive'}`}>
      {stars}
    </div>
  )
}

export default StarRating;
