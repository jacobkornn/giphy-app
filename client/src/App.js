import React, { useState } from 'react';
import GifCard from './components/GifCard';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        alert('Login failed: Invalid credentials');
        return;
      }

      const data = await res.json();
      setToken(data.token);
      setUserId(data.userId);
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const res = await fetch(`/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setGifs(data.data);
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    }
  };

  if (!token) {
    return (
      <div className="app-container">
        <h1>Please Log In</h1>
        <form onSubmit={handleLogin} className="login-form">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="login-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="login-input"
          />
          <button type="submit" className="search-button login-button">
            Log In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-container">
      <h1>GIPHY Search</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search GIFs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="search-input"
        />
        <button onClick={handleSearch} className="search-button">
          Search
        </button>
      </div>

      <div className="gif-grid">
        {gifs.map((gif) => (
          <GifCard key={gif.id} gif={gif} currentUserId={userId} token={token} />
        ))}
      </div>
    </div>
  );
}

export default App;
