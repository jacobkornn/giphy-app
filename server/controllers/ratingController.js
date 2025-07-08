const prisma = require('../prisma/client');

// Create a new rating
async function createRating(req, res) {
  try {
    const { userId, gifId, value } = req.body;
    if (!gifId || !value) {
      return res.status(400).json({ error: "gifId and value are required" });
    }
    // userId is optional in your schema, but ideally passed for user-linked ratings
    const rating = await prisma.rating.create({
      data: {
        gifId,
        value,
        userId: userId || null,
      },
    });
    res.status(201).json(rating);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Read ratings for a gifId
async function getRatings(req, res) {
  try {
    const { gifId } = req.query;
    if (!gifId) {
      return res.status(400).json({ error: "gifId query param required" });
    }
    const ratings = await prisma.rating.findMany({
      where: { gifId },
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
    if (!value) {
      return res.status(400).json({ error: "value is required" });
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
