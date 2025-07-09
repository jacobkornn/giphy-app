const prisma = require('../prisma/client');

async function createComment(req, res) {
  try {
    const { userId, gifId, text } = req.body;
    if (!gifId || !text) {
      return res.status(400).json({ error: "gifId and text are required" });
    }
    const comment = await prisma.comment.create({
      data: {
        gifId,
        text,
        userId: userId || null,
      },
    });
    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getComments(req, res) {
  try {
    const { gifId } = req.query;
    if (!gifId) {
      return res.status(400).json({ error: "gifId query param required" });
    }
    const comments = await prisma.comment.findMany({
      where: { gifId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { username: true },
        },
      },
    });
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function updateComment(req, res) {
  try {
    const { id } = req.params;
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: "text is required" });
    }
    const updated = await prisma.comment.update({
      where: { id: Number(id) },
      data: { text },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    await prisma.comment.delete({
      where: { id: Number(id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
