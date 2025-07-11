const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authenticateToken = require('../middleware/authenticateToken');

// GET all comments for a gif (public)
router.get('/', commentController.getComments);

// POST new comment (protected)
router.post('/', authenticateToken, commentController.createComment);

// PUT update a comment by id (protected)
router.put('/:id', authenticateToken, commentController.updateComment);

// DELETE a comment by id (protected)
router.delete('/:id', authenticateToken, commentController.deleteComment);

module.exports = router;

