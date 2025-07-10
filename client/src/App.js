import React, { useState } from 'react';
import GifCard from './components/GifCard';
import { FaUser } from 'react-icons/fa';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);
  const [isRegistering, setIsRegistering] = useState(false);

  // States for comments and ratings keyed by gifId
  const [commentsByGif, setCommentsByGif] = useState({});
  const [ratingsByGif, setRatingsByGif] = useState({});

  const handleAuth = async (e) => {
    e.preventDefault();
    const route = isRegistering ? '/auth/register' : '/auth/login';

    try {
      const res = await fetch(route, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errorMsg = isRegistering ? 'Sign up failed' : 'Login failed';
        alert(`${errorMsg}: Invalid credentials`);
        return;
      }

      const data = await res.json();
      setToken(data.token);
      setUserId(data.userId);
      setLoggedInUsername(username);
      setUsername('');
      setPassword('');
    } catch (error) {
      console.error(`${isRegistering ? 'Sign up' : 'Login'} error:`, error);
      alert(`${isRegistering ? 'Sign up' : 'Login'} failed`);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      const res = await fetch(`/search?q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      const gifsData = data.data;
      setGifs(gifsData);

      // Fetch comments and ratings for all gifs in parallel:
      const commentsPromises = gifsData.map((gif) =>
        fetch(`/comments?gifId=${gif.id}`).then((res) =>
          res.ok ? res.json() : []
        )
      );
      const ratingsPromises = gifsData.map((gif) =>
        fetch(`/ratings?gifId=${gif.id}&userId=${userId}`).then((res) =>
          res.ok ? res.json() : []
        )
      );

      const commentsResults = await Promise.all(commentsPromises);
      const ratingsResults = await Promise.all(ratingsPromises);

      // Build objects keyed by gif id
      const newCommentsByGif = {};
      const newRatingsByGif = {};

      gifsData.forEach((gif, i) => {
        newCommentsByGif[gif.id] = commentsResults[i];
        newRatingsByGif[gif.id] = ratingsResults[i];
      });

      setCommentsByGif(newCommentsByGif);
      setRatingsByGif(newRatingsByGif);
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    }
  };

  if (!token) {
    return (
      <div className="app-container">
        <h1>{isRegistering ? 'Create Account' : 'Please Log In'}</h1>
        <form onSubmit={handleAuth} className="login-form">
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
            {isRegistering ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="toggle-button"
        >
          {isRegistering ? 'Cancel' : 'Create Account'}
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="top-bar">
        <h1>Welcome back, {loggedInUsername}</h1>
        <button
          className="signout-button"
          onClick={() => {
            setToken(null);
            setUserId(null);
            setGifs([]);
            setSearchTerm('');
            setLoggedInUsername('');
            setCommentsByGif({});
            setRatingsByGif({});
          }}
        >
          <FaUser className="signout-icon" />
          <span>Sign Out</span>
        </button>
      </div>

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
          <GifCard
            key={gif.id}
            gif={gif}
            currentUserId={userId}
            token={token}
            comments={commentsByGif[gif.id] || []}
            ratings={ratingsByGif[gif.id] || []}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
