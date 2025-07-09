const prisma = require('../prisma/client');

// Create or update a rating
async function createRating(req, res) {
  try {
    const { userId, gifId, value } = req.body;

    if (!gifId || value === undefined) {
      return res.status(400).json({ error: "gifId and value are required" });
    }

    if (typeof value !== 'number' || value < 1 || value > 5) {
      return res.status(400).json({ error: "value must be a number between 1 and 5" });
    }

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Check if user already rated this gif
    const existingRating = await prisma.rating.findFirst({
      where: { userId, gifId }
    });

    if (existingRating) {
      // Update existing rating
      const updated = await prisma.rating.update({
        where: { id: existingRating.id },
        data: { value },
      });
      return res.json(updated);
    }

    // Create new rating
    const rating = await prisma.rating.create({
      data: {
        gifId,
        value,
        userId,
      },
    });

    res.status(201).json(rating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Read ratings for a gifId, optionally filtered by userId
async function getRatings(req, res) {
  try {
    const { gifId, userId } = req.query;

    if (!gifId) {
      return res.status(400).json({ error: "gifId query param required" });
    }

    const where = { gifId };
    if (userId) {
      where.userId = Number(userId);
    }

    const ratings = await prisma.rating.findMany({
      where,
    });

    res.json(ratings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Update rating by id
async function updateRating(req, res) {
  try {
    const { id } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: "value is required" });
    }

    if (typeof value !== 'number' || value < 1 || value > 5) {
      return res.status(400).json({ error: "value must be a number between 1 and 5" });
    }

    const updated = await prisma.rating.update({
      where: { id: Number(id) },
      data: { value },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Delete rating by id
async function deleteRating(req, res) {
  try {
    const { id } = req.params;

    await prisma.rating.delete({
      where: { id: Number(id) },
    });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createRating,
  getRatings,
  updateRating,
  deleteRating,
};
