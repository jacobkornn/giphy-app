import React, { useState, useEffect, useRef } from 'react';
import { FaStar, FaRegCommentDots, FaTimes, FaArrowUp, FaEllipsisV, FaPencilAlt, FaTrash } from 'react-icons/fa';
import './GifCard.css';

const GifCard = ({ gif, currentUserId, token, comments = [], ratings = [] }) => {
  const [hovered, setHovered] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [rating, setRating] = useState(ratings.length > 0 ? ratings[0].value : 0);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState(comments);

  // New state for editing comment:
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [menuOpenForCommentId, setMenuOpenForCommentId] = useState(null);

  const commentInputRef = useRef(null);

  // Sync comments prop
  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  // Update rating when ratings prop changes
  useEffect(() => {
    if (ratings.length > 0) {
      setRating(ratings[0].value);
    } else {
      setRating(0);
    }
  }, [ratings]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/comments?gifId=${encodeURIComponent(gif.id)}`);
      const data = await res.json();
      setLocalComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const submitRating = async (value) => {
    if (!token) {
      alert('You must be logged in to rate.');
      return;
    }
    try {
      const res = await fetch('/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gifId: gif.id, value }),
      });
      if (!res.ok) {
        alert('Failed to submit rating');
      } else {
        setRating(value);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to submit rating');
    }
  };

  // Handle left-click to set rating
  const handleStarClick = (value) => {
    submitRating(value);
  };

  // Handle right-click to reset rating to zero
  const handleStarRightClick = (e) => {
    e.preventDefault(); // Prevent the context menu from showing
    submitRating(0);
  };

  // Comment submit (add or update depending on editing state)
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!token) {
      alert('You must be logged in to comment.');
      return;
    }

    try {
      if (editingCommentId) {
        // Update existing comment
        const res = await fetch(`/comments/${editingCommentId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: commentText.trim() }),
        });
        if (res.ok) {
          setCommentText('');
          setEditingCommentId(null);
          setMenuOpenForCommentId(null);
          fetchComments();
        } else {
          alert('Failed to update comment');
        }
      } else {
        // Create new comment
        const res = await fetch('/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ gifId: gif.id, text: commentText.trim() }),
        });
        if (res.ok) {
          setCommentText('');
          fetchComments();
        } else {
          alert('Failed to submit comment');
        }
      }
    } catch (error) {
      console.error(error);
      alert('Failed to submit comment');
    }
  };

  // Start editing a comment - fills the input box and sets editingCommentId
  const startEditingComment = (comment) => {
    setEditingCommentId(comment.id);
    setCommentText(comment.text);
    setMenuOpenForCommentId(null);
    // Focus input after setting text
    setTimeout(() => commentInputRef.current?.focus(), 0);
  };

  // Delete a comment
  const deleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      const res = await fetch(`/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        if (editingCommentId === commentId) {
          setEditingCommentId(null);
          setCommentText('');
        }
        fetchComments();
      } else {
        alert('Failed to delete comment');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to delete comment');
    }
  };

  // Toggle popup menu for comment
  const toggleMenu = (commentId) => {
    setMenuOpenForCommentId(menuOpenForCommentId === commentId ? null : commentId);
  };

  return (
    <div
      className="gif-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img src={gif.images.fixed_height.url} alt={gif.title} className="gif-image" />

      {/* Stars bottom-left */}
      {hovered && !showComments && (
        <div className="stars-container">
          {[1, 2, 3, 4, 5].map((num) => (
            <FaStar
              key={num}
              size={20}
              style={{
                cursor: 'pointer',
                color: num <= rating ? '#fbbf24' : '#d1d5db',
              }}
              onClick={() => handleStarClick(num)}
              onContextMenu={handleStarRightClick} // Right-click resets rating
              title="Left-click to rate, right-click to reset"
            />
          ))}
        </div>
      )}

      {/* Comment icon */}
      {hovered && !showComments && (
        <button
          className="comment-icon"
          onClick={() => setShowComments(true)}
          aria-label="Show comments"
        >
          <FaRegCommentDots size={24} />
        </button>
      )}

      {/* Comment section */}
      {showComments && (
        <div className="comment-section">
          <button
            className="close-comments"
            onClick={() => {
              setShowComments(false);
              setEditingCommentId(null);
              setMenuOpenForCommentId(null);
              setCommentText('');
            }}
            aria-label="Close comments"
          >
            <FaTimes size={20} />
          </button>

          <div className="comments-list">
            {localComments.length ? (
              localComments.map((c) => (
                <div key={c.id} className="comment" style={{ position: 'relative' }}>
                  <div className="comment-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <strong>{c.user.username || 'Anonymous'}</strong>
                    <span className="comment-timestamp" style={{ flexShrink: 0 }}>
                      {new Date(c.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {/* The ... button, same width as timestamp, dark text color */}
                    {c.user.id === currentUserId && (
                      <button
                        className="comment-menu-toggle"
                        onClick={() => toggleMenu(c.id)}
                        aria-label="Comment options"
                        style={{
                          width: '3.2em', // roughly same as timestamp width
                          color: '#374151', // dark text color (gray-700)
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          position: 'relative',
                          padding: 0,
                          fontSize: '1.1em',
                        }}
                      >
                        <FaEllipsisV />
                      </button>
                    )}
                  </div>

                  {/* Show editing text if this comment is being edited */}
                  {editingCommentId === c.id ? (
                    <em style={{ color: '#6b7280' }}>Editing comment...</em>
                  ) : (
                    <div>{c.text}</div>
                  )}

                  {/* Popup menu */}
                  {menuOpenForCommentId === c.id && (
                    <div
                      className="comment-popup-menu"
                      style={{
                        position: 'absolute',
                        top: '1.8em',
                        right: 0,
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        zIndex: 1000,
                        display: 'flex',
                        gap: '8px',
                        padding: '4px 8px',
                      }}
                    >
                      <button
                        onClick={() => startEditingComment(c)}
                        title="Edit"
                        aria-label="Edit comment"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#2563eb', // blue-600
                          fontSize: '1.1em',
                        }}
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        onClick={() => deleteComment(c.id)}
                        title="Delete"
                        aria-label="Delete comment"
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#dc2626', // red-600
                          fontSize: '1.1em',
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-comments">No comments yet.</div>
            )}
          </div>

          {/* Comment input and submit button used for both new and editing */}
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              ref={commentInputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={editingCommentId ? "Edit your comment..." : "Add a comment..."}
              className="comment-input"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setEditingCommentId(null);
                  setCommentText('');
                  setMenuOpenForCommentId(null);
                  e.target.blur();
                }
              }}
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
