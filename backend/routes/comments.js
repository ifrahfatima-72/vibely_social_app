const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Get comments for a post
router.get('/:postId', async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { postId: req.params.postId },
      include: [{ model: User, attributes: ['username', 'avatar'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add comment
router.post('/:postId', auth, async (req, res) => {
  try {
    const comment = await Comment.create({
      text: req.body.text,
      postId: req.params.postId,
      userId: req.userId
    });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== req.userId)
      return res.status(403).json({ error: 'Unauthorized' });
    await comment.destroy();
    res.json({ message: '✅ Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;