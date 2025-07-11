import React, { useState, useEffect, useRef } from 'react';
import { FaStar, FaRegCommentDots, FaTimes, FaArrowUp, FaEllipsisV, FaPencilAlt, FaTrash } from 'react-icons/fa';
import './GifCard.css';

const GifCard = ({ gif, currentUserId, token, comments = [], ratings = [] }) => {
  const [hovered, setHovered] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [rating, setRating] = useState(ratings.length > 0 ? ratings[0].value : 0);
  const [commentText, setCommentText] = useState('');
  const [localComments, setLocalComments] = useState(comments);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [menuOpenForCommentId, setMenuOpenForCommentId] = useState(null);

  const commentInputRef = useRef(null);
  const inactivityTimer = useRef(null);

  useEffect(() => {
    setLocalComments(comments);
  }, [comments]);

  useEffect(() => {
    if (ratings.length > 0) {
      setRating(ratings[0].value);
    } else {
      setRating(0);
    }
  }, [ratings]);

  useEffect(() => {
    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, []);

  const resetInactivityTimer = () => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      setShowComments(false);
      setEditingCommentId(null);
      setMenuOpenForCommentId(null);
      setCommentText('');
    }, 5000);
  };

  useEffect(() => {
    if (showComments) {
      resetInactivityTimer();
    } else {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    }
  }, [showComments]);

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

  const handleStarClick = (value) => {
    submitRating(value);
  };

  const handleStarRightClick = (e) => {
    e.preventDefault();
    submitRating(0);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!token) {
      alert('You must be logged in to comment.');
      return;
    }

    try {
      if (editingCommentId) {
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
        const res = await fetch('/comments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ gifId: gif.id, text: commentText.trim() }),
        });
        if (res.ok) {
          const newComment = await res.json();
          setLocalComments((prev) => [newComment, ...prev]); 
          setCommentText('');
        } else {
          alert('Failed to submit comment');
        }
      }
    } catch (error) {
      console.error(error);
      alert('Failed to submit comment');
    }
  };

  const startEditingComment = (comment) => {
    setEditingCommentId(comment.id);
    setCommentText(comment.text);
    setMenuOpenForCommentId(null);

    setTimeout(() => {
      const input = commentInputRef.current;
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length); // place cursor at end
      }
    }, 0);
  };

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
              onContextMenu={handleStarRightClick}
              title="Left-click to rate, right-click to reset"
            />
          ))}
        </div>
      )}

      {hovered && !showComments && (
        <button
          className="comment-icon"
          onClick={() => setShowComments(true)}
          aria-label="Show comments"
        >
          <FaRegCommentDots size={24} />
        </button>
      )}

      {showComments && (
        <div
          className="comment-section"
          onClick={resetInactivityTimer}
          onKeyDown={resetInactivityTimer}
          onMouseMove={resetInactivityTimer}
          onFocus={resetInactivityTimer}
          tabIndex={0}
        >
          <button
            className="close-comments"
            onClick={() => {
              setShowComments(false);
              setEditingCommentId(null);
              setMenuOpenForCommentId(null);
              setCommentText('');
              if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
            }}
            aria-label="Close comments"
          >
            <FaTimes size={20} />
          </button>

          <div className="comments-list">
            {localComments.length ? (
              localComments.map((c) => (
                <div key={c.id} className="comment" style={{ position: 'relative' }}>
                  <div
                    className="comment-header"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <strong>{c.user.username || 'Anonymous'}</strong>
                    <span className="comment-timestamp" style={{ flexShrink: 0 }}>
                      {new Date(c.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    {c.user.id === currentUserId && (
                      <button
                        className="comment-menu-toggle"
                        onClick={() => toggleMenu(c.id)}
                        aria-label="Comment options"
                        style={{
                          width: '3.2em',
                          color: '#374151',
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

                  {editingCommentId === c.id ? (
                    <em style={{ color: '#6b7280' }}>Editing comment...</em>
                  ) : (
                    <div>{c.text}</div>
                  )}

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
                          color: '#2563eb',
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
                          color: '#dc2626',
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

          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              ref={commentInputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={editingCommentId ? 'Edit your comment...' : 'Add a comment...'}
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
