import React, { useState, useEffect } from 'react';

export function Comments({ gifId, userId }) {
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, gifId, text }),
    });

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
