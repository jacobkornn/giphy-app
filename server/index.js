require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const prisma = require('./prisma/client');

const usersRouter = require('./routes/users');
const ratingsRouter = require('./routes/ratings');
const commentsRouter = require('./routes/comments');
const authRouter = require('./routes/auth');
const authenticateToken = require('./middleware/authenticateToken');

const app = express();
const PORT = process.env.PORT || 4000;

// CORS Setup
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.options('/:any', cors());

app.use(express.json());

// app.use('/users', usersRouter);
// app.use('/ratings', ratingsRouter);
// app.use('/comments', commentsRouter);

app.use('/auth', authRouter);

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
        limit: 100,
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

// Ratings and comments endpoints

// GET RATINGS
app.get('/ratings', async (req, res) => {
  const { gifId, userId } = req.query;
  if (!gifId || !userId) {
    return res.status(400).json({ error: 'gifId and userId query params required' });
  }

  try {
    const ratings = await prisma.rating.findMany({
      where: { gifId, userId },
    });
    res.json(ratings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch ratings' });
  }
});

// POST RATING (protected)
app.post('/ratings', authenticateToken, async (req, res) => {
  const { gifId, value } = req.body;
  const userId = req.user.userId;

  if (!gifId || typeof value !== 'number') {
    return res.status(400).json({ error: 'gifId and numeric value required' });
  }

  try {
    const existing = await prisma.rating.findFirst({
      where: { gifId, userId },
    });

    let rating;
    if (existing) {
      rating = await prisma.rating.update({
        where: { id: existing.id },
        data: { value },
      });
    } else {
      rating = await prisma.rating.create({
        data: { gifId, userId, value },
      });
    }

    res.json(rating);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save rating' });
  }
});

// GET COMMENTS
app.get('/comments', async (req, res) => {
  const { gifId } = req.query;
  if (!gifId) {
    return res.status(400).json({ error: 'gifId query param required' });
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { gifId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// POST COMMENT (protected)
app.post('/comments', authenticateToken, async (req, res) => {
  const { gifId, text } = req.body;
  const userId = req.user.userId;

  if (!gifId || !text) {
    return res.status(400).json({ error: 'gifId and text are required' });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        gifId,
        text,
        userId,
      },
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
