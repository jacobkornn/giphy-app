require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

// Import routes
const usersRouter = require('./routes/users');
const ratingsRouter = require('./routes/ratings');
const commentsRouter = require('./routes/comments');

// Middleware to parse JSON bodies
app.use(express.json());

// Route mounts
app.use('/users', usersRouter);
app.use('/ratings', ratingsRouter);
app.use('/comments', commentsRouter);

// Giphy search proxy endpoint
app.get('/search', async (req, res) => {
  const { q, limit = 25, offset = 0 } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter q is required' });
  }

  try {
    const apiKey = process.env.GIPHY_API_KEY;
    const response = await axios.get('https://api.giphy.com/v1/gifs/search', {
      params: {
        api_key: apiKey,
        q,
        limit,
        offset,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Giphy API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch data from Giphy' });
  }
});

// Root health check
app.get('/', (req, res) => {
  res.send('Coschedule App Backend is running!');
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
