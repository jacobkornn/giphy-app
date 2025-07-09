import React, { useState, useEffect } from 'react';
import { FaStar, FaRegCommentDots, FaTimes, FaArrowUp } from 'react-icons/fa';
import './GifCard.css';

const GifCard = ({ gif, currentUserId, token }) => {
  const [hovered, setHovered] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [rating, setRating] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);

  // Fetch user rating on component mount or when gif or user changes
  useEffect(() => {
    if (!currentUserId) return;

    async function fetchUserRating() {
      try {
        // Include userId as query param, no auth needed for GET
        const res = await fetch(`/ratings?gifId=${encodeURIComponent(gif.id)}&userId=${currentUserId}`);
        if (!res.ok) return;
        const ratings = await res.json();
        if (ratings.length > 0) {
          setRating(ratings[0].value);
        } else {
          setRating(0); // no rating found
        }
      } catch (error) {
        console.error('Failed to fetch user rating:', error);
      }
    }

    fetchUserRating();
  }, [gif.id, currentUserId]);

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showComments]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/comments?gifId=${encodeURIComponent(gif.id)}`);
      const data = await res.json();
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleStarClick = async (value) => {
    setRating(value);
    if (!token) {
      alert('You must be logged in to rate.');
      return;
    }

    try {
      const res = await fetch('/ratings', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // <-- send token here
        },
        body: JSON.stringify({
          gifId: gif.id,
          value,
          // userId no longer sent; backend uses token to get userId
        }),
      });

      if (!res.ok) {
        alert('Failed to submit rating');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to submit rating');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!token) {
      alert('You must be logged in to comment.');
      return;
    }

    try {
      const res = await fetch('/comments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // <-- send token here
        },
        body: JSON.stringify({
          gifId: gif.id,
          text: commentText.trim(),
          // userId no longer sent; backend uses token to get userId
        }),
      });
      if (res.ok) {
        setCommentText('');
        fetchComments();
      } else {
        alert('Failed to submit comment');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to submit comment');
    }
  };

  return (
    <div
      className="gif-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img src={gif.images.fixed_height.url} alt={gif.title} className="gif-image" />

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
              comments.map((c) => (
                <div key={c.id} className="comment">
                  <div className="comment-header">
                    <strong>{c.user?.username || 'Anonymous'}</strong>
                    <span className="comment-timestamp">
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div>{c.text}</div>
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
