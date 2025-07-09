import React, { useState, useEffect } from 'react';
import GifCard from './components/GifCard';
import './App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);
  const userId = 1; // Simulated logged-in user

  useEffect(() => {
    console.log(`Logged in user ID: ${userId}`);
  }, []);

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
          <GifCard key={gif.id} gif={gif} currentUserId={userId} />
        ))}
      </div>
    </div>
  );
}

export default App;
