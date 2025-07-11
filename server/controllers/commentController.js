const prisma = require('../prisma/client');

async function createComment(req, res) {
  try {
    const tokenUserId = req.user?.userId;
    const { userId: bodyUserId, gifId, text } = req.body;

    if (!gifId || !text) {
      return res.status(400).json({ error: "gifId and text are required" });
    }

    const userId = tokenUserId || bodyUserId || null;

    const comment = await prisma.comment.create({
      data: {
        gifId,
        text,
        userId,
      },
      include: {
        user: {
          select: { id: true, username: true },
        },
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
    const { gifId, gifIds } = req.query;

    const baseQuery = {
      orderBy: { createdAt: 'desc' },
      where: { userId: { not: null } }, // ✅ exclude orphaned comments
      include: {
        user: {
          select: { id: true, username: true },
        },
      },
    };

    if (gifIds) {
      const gifIdArray = gifIds.split(',');
      const comments = await prisma.comment.findMany({
        ...baseQuery,
        where: {
          ...baseQuery.where,
          gifId: { in: gifIdArray },
        },
      });

      const grouped = {};
      for (const comment of comments) {
        const id = comment.gifId;
        if (!grouped[id]) grouped[id] = [];
        grouped[id].push({ ...comment, userId: comment.userId });
      }

      return res.json(grouped);
    }

    if (!gifId) {
      return res.status(400).json({ error: "gifId or gifIds query param required" });
    }

    const comments = await prisma.comment.findMany({
      ...baseQuery,
      where: {
        ...baseQuery.where,
        gifId,
      },
    });

    const withUserIds = comments.map(c => ({
      ...c,
      userId: c.userId,
    }));

    res.json(withUserIds);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function updateComment(req, res) {
  try {
    const userId = req.user.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

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
      include: {
        user: {
          select: { id: true, username: true },
        },
      },
    });

    res.json({
      ...updated,
      userId: updated.userId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function deleteComment(req, res) {
  try {
    const userId = req.user.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

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
}

module.exports = {
  createComment,
  getComments,
  updateComment,
  deleteComment,
};
