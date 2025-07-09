// TempLogin.jsx
import React, { useState } from 'react';

export default function TempLogin({ setCurrentUserId }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!username.trim()) return;

    // Try to create user (POST /users)
    try {
      const res = await fetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: 'tempPass' }),
      });
      if (res.status === 201) {
        const newUser = await res.json();
        setCurrentUserId(newUser.id);
        setError(null);
      } else if (res.status === 409) {
        // User exists - get users and find that user
        const usersRes = await fetch('/users');
        const users = await usersRes.json();
        const user = users.find(u => u.username === username.trim());
        if (user) {
          setCurrentUserId(user.id);
          setError(null);
        } else {
          setError('User not found');
        }
      } else {
        setError('Failed to create or login user');
      }
    } catch (err) {
      console.error(err);
      setError('Server error');
    }
  };

  return (
    <div style={{ marginBottom: 20 }}>
      <input
        type="text"
        placeholder="Enter username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <button onClick={handleLogin}>Login (Temp)</button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}
