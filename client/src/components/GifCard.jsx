import React, { useState } from 'react';
import { FaStar, FaRegCommentDots, FaTimes, FaArrowUp } from 'react-icons/fa';
import './GifCard.css';

const GifCard = ({ gif }) => {
  const [hovered, setHovered] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [rating, setRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);

  const handleStarClick = (value) => {
    setRating(value);
    // TODO: send rating to backend
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setComments([...comments, commentText.trim()]);
    setCommentText('');
    // TODO: send comment to backend
  };

  return (
    <div
      className="gif-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={gif.images.fixed_height.url}
        alt={gif.title}
        className="gif-image"
      />

      {/* Stars bottom-left, show on hover and when comment section not visible */}
      {hovered && !showComments && (
        <div className="stars-container">
          {[1, 2, 3, 4, 5].map((num) => (
            <FaStar
              key={num}
              size={20}
              style={{ cursor: 'pointer', color: num <= rating ? '#fbbf24' : '#d1d5db' }}
              onClick={() => handleStarClick(num)}
            />
          ))}
        </div>
      )}

      {/* Comment icon bottom-right, only when hovered and comment section hidden */}
      {hovered && !showComments && (
        <button
          className="comment-icon"
          onClick={() => setShowComments(true)}
          aria-label="Show comments"
        >
          <FaRegCommentDots size={24} />
        </button>
      )}

      {/* Comment section overlay */}
      {showComments && (
        <div className="comment-section">
          <button
            className="close-comments"
            onClick={() => setShowComments(false)}
            aria-label="Close comments"
          >
            <FaTimes size={20} />
          </button>

          <div className="comments-list">
            {comments.length ? (
              comments.map((c, i) => (
                <div key={i} className="comment">
                  {c}
                </div>
              ))
            ) : (
              <div className="no-comments">No comments yet.</div>
            )}
          </div>

          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              className="comment-input"
            />
            <button type="submit" className="comment-submit-btn" aria-label="Submit comment">
              <FaArrowUp />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default GifCard;
