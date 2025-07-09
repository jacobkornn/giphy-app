import React from 'react';

export function StarRating({ rating, onRate }) {
  return (
    <div>
      {[1, 2, 3, 4, 5].map(star => (
        <span
          key={star}
          style={{
            cursor: 'pointer',
            color: star <= rating ? 'gold' : 'gray',
            fontSize: 20,
          }}
          onClick={() => onRate(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
}
