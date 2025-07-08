import React, { useState } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    console.log('1: Searching for:', query);

    const res = await fetch(`/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    console.log('2: Searching for:', query);

    setGifs(data.data);
  };

  return (
    <div className="App">
      <h1>Search Giphy</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search GIFs..."
          required
        />
        <button type="submit">Search</button>
      </form>

      <div className="gif-grid">
        {gifs.map(gif => (
          <div key={gif.id} className="gif-card">
            <img src={gif.images.fixed_height.url} alt={gif.title} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
