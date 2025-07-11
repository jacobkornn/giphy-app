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
app.use('/comments', commentsRouter);

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

// GET RATINGS - accept gifId or gifIds (comma-separated)
app.get('/ratings', async (req, res) => {
  const { gifId, gifIds, userId } = req.query;

  if (!gifId && !gifIds) {
    return res.status(400).json({ error: 'gifId or gifIds query param required' });
  }

  let where = {};

  if (gifIds) {
    const idsArray = gifIds.split(',').map(id => id.trim());
    where.gifId = { in: idsArray };
  } else {
    where.gifId = gifId;
  }

  if (userId) {
    const numericUserId = Number(userId);
    if (isNaN(numericUserId)) {
      return res.status(400).json({ error: 'userId must be a valid number' });
    }
    where.userId = numericUserId;
  }

  try {
    const ratings = await prisma.rating.findMany({
      where,
      include: {
        user: {
          select: { id: true, username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(ratings);
  } catch (err) {
    console.error('Error fetching ratings:', err);
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

// GET COMMENTS - accept gifId or gifIds (comma-separated)
app.get('/comments', async (req, res) => {
  const { gifId, gifIds } = req.query;

  if (!gifId && !gifIds) {
    return res.status(400).json({ error: 'gifId or gifIds query param required' });
  }

  let where;

  if (gifIds) {
    const idsArray = gifIds.split(',').map(id => id.trim());
    where = { gifId: { in: idsArray } };
  } else {
    where = { gifId };
  }

  try {
    const comments = await prisma.comment.findMany({
      where,
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

// PUT update comment (protected)
app.put('/comments/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "text is required" });
    }

    const existing = await prisma.comment.findUnique({ where: { id: Number(id) } });
    if (!existing) return res.status(404).json({ error: "Comment not found" });
    if (existing.userId !== userId) return res.status(403).json({ error: "Forbidden" });

    const updated = await prisma.comment.update({
      where: { id: Number(id) },
      data: { text },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE comment (protected)
app.delete('/comments/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const existing = await prisma.comment.findUnique({ where: { id: Number(id) } });
    if (!existing) return res.status(404).json({ error: "Comment not found" });
    if (existing.userId !== userId) return res.status(403).json({ error: "Forbidden" });

    await prisma.comment.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
