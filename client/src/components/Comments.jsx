import React, { useState, useEffect } from 'react';

export function Comments({ gifId, token }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    fetch(`/comments?gifId=${gifId}`)
      .then(res => res.json())
      .then(setComments);
  }, [gifId]);

  const addComment = async () => {
    if (!text.trim()) return;

    const res = await fetch('/comments', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, // send token here
      },
      body: JSON.stringify({ gifId, text }), // remove userId from body
    });

    if (!res.ok) {
      alert('Failed to post comment');
      return;
    }

    const newComment = await res.json();
    setComments([newComment, ...comments]);
    setText('');
  };

  return (
    <div>
      <h4>Comments</h4>
      <textarea
        placeholder="Add a comment"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button onClick={addComment}>Post</button>
      <ul>
        {comments.map(c => (
          <li key={c.id}>{c.text}</li>
        ))}
      </ul>
    </div>
  );
}
