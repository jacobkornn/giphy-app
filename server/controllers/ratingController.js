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

    const existingRating = await prisma.rating.findFirst({
      where: { userId, gifId }
    });

    if (existingRating) {
      const updated = await prisma.rating.update({
        where: { id: existingRating.id },
        data: { value },
        include: {
          user: {
            select: { id: true, username: true },
          },
        },
      });

      return res.json({
        ...updated,
        userId: updated.userId,
        user: updated.user,
      });
    }

    const rating = await prisma.rating.create({
      data: {
        gifId,
        value,
        userId,
      },
      include: {
        user: {
          select: { id: true, username: true },
        },
      },
    });

    res.status(201).json({
      ...rating,
      userId: rating.userId,
      user: rating.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Read ratings for a gifId or gifIds, optionally filtered by userId
async function getRatings(req, res) {
  try {
    const { gifId, gifIds, userId } = req.query;

    if (gifIds) {
      const gifIdArray = gifIds.split(',');

      const ratings = await prisma.rating.findMany({
        where: {
          gifId: { in: gifIdArray },
          ...(userId ? { userId: Number(userId) } : {}),
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, username: true },
          },
        },
      });

      const grouped = {};
      for (const r of ratings) {
        if (!grouped[r.gifId]) grouped[r.gifId] = [];
        grouped[r.gifId].push({
          ...r,
          userId: r.userId,
          user: r.user,
        });
      }

      return res.json(grouped);
    }

    if (!gifId) {
      return res.status(400).json({ error: "gifId or gifIds query param required" });
    }

    const where = { gifId };
    if (userId) where.userId = Number(userId);

    const ratings = await prisma.rating.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true },
        },
      },
    });

    const flattened = ratings.map(r => ({
      ...r,
      userId: r.userId,
      user: r.user,
    }));

    res.json(flattened);
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
      include: {
        user: {
          select: { id: true, username: true },
        },
      },
    });

    res.json({
      ...updated,
      userId: updated.userId,
      user: updated.user,
    });
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
