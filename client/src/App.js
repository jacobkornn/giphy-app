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

      const gifIds = gifsData.map((gif) => gif.id).join(',');

      // Fetch comments and ratings in parallel using bulk endpoints
      const [commentsRes, ratingsRes] = await Promise.all([
        fetch(`/comments?gifIds=${gifIds}`),
        fetch(`/ratings?gifIds=${gifIds}&userId=${userId}`)
      ]);

      if (!commentsRes.ok || !ratingsRes.ok) {
        console.error('Failed to fetch comments or ratings');
        return;
      }

      const commentsData = await commentsRes.json();
      //console.log('commentsData:', commentsData); 
      const ratingsData = await ratingsRes.json();
     //console.log('ratingsData:', ratingsData); 


      const groupedComments = commentsData || {};
      const groupedRatings = {};

      ratingsData.forEach(rating => {
        if (!groupedRatings[rating.gifId]) {
          groupedRatings[rating.gifId] = [];
        }
        groupedRatings[rating.gifId].push(rating);
      });

      setCommentsByGif(groupedComments);
      setRatingsByGif(groupedRatings);

      
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    }
  };

  if (!token) { 
    return (
      <div className="app-container">
        <div className="top-bar">
          <h1 style={{ flex: 1, textAlign: 'center' }}>
            {isRegistering ? 'Create Account' : 'Welcome to GIPHY Search'}
          </h1>
        </div>

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
          style={{ display: 'block', margin: '10px auto' }}
        >
          {isRegistering ? 'Cancel' : 'Create Account'}
        </button>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="top-bar">
        <h1 style={{ textAlign: 'center', flex: 1 }}>
          Welcome back, {loggedInUsername}!
        </h1>
        <button
          className="search-button signout-button"
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
          <FaUser className="signout-icon" style={{ marginRight: '6px' }} />
          <span>Sign Out</span>
        </button>
      </div>

      <div className="search-wrapper">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search GIFs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">
            Search
          </button>
        </div>
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
