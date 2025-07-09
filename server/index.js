const express = require('express');
const dotenv = require('dotenv');
const prisma = require('./prisma/client');

const authRouter = require('./routes/auth');
const authenticateToken = require('./middleware/authenticateToken');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// AUTH ROUTES
app.use('/auth', authRouter);

// GET RATINGS
app.get('/ratings', async (req, res) => {
  const { gifId, userId } = req.query;
  if (!gifId || !userId) {
    return res.status(400).json({ error: 'gifId and userId query params required' });
  }

  const ratings = await prisma.rating.findMany({
    where: { gifId, userId },
  });

  res.json(ratings);
});

// POST RATING (protected)
app.post('/ratings', authenticateToken, async (req, res) => {
  const { gifId, value } = req.body;
  const userId = req.user.userId;

  if (!gifId || typeof value !== 'number') {
    return res.status(400).json({ error: 'gifId and numeric value required' });
  }

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
});

// GET COMMENTS
app.get('/comments', async (req, res) => {
  const { gifId } = req.query;
  if (!gifId) {
    return res.status(400).json({ error: 'gifId query param required' });
  }

  const comments = await prisma.comment.findMany({
    where: { gifId },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json(comments);
});

// POST COMMENT (protected)
app.post('/comments', authenticateToken, async (req, res) => {
  const { gifId, text } = req.body;
  const userId = req.user.userId;

  if (!gifId || !text) {
    return res.status(400).json({ error: 'gifId and text are required' });
  }

  const comment = await prisma.comment.create({
    data: {
      gifId,
      text,
      userId,
    },
  });

  res.status(201).json(comment);
});

// SERVER LISTEN
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
