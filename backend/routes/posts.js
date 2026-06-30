const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const Like = require('../models/Like');
// Get users who liked a post
router.get('/:id/likes', async (req, res) => {
  try {
    const likes = await Like.findAll({
      where: {
        postId: req.params.id
      },
      include: [{
        model: User,
        attributes: ['id', 'username', 'avatar']
      }]
    });

    res.json(likes);

  } catch (err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['id', 'username', 'avatar'] }]
    });
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create post with optional image
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';
    const post = await Post.create({
      content: req.body.content || '',
      image: imageUrl,
      userId: req.userId
    });
    const fullPost = await Post.findByPk(post.id, {
      include: [{ model: User, attributes: ['id', 'username', 'avatar'] }]
    });
    res.json(fullPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like / Unlike post
router.put('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);

    if (!post)
      return res.status(404).json({ error: 'Post not found' });

    // Check if this user already liked the post
    console.log("User ID:", req.userId);
console.log("Post ID:", post.id);

const existingLike = await Like.findOne({
  where: {
    userId: req.userId,
    postId: post.id
  }
});

console.log("Existing Like:", existingLike);

    let likedByMe = false;

    if (existingLike) {
      // Unlike
      await existingLike.destroy();

      if (post.likes > 0)
        post.likes -= 1;

      likedByMe = false;
    } else {
      // Like
      await Like.create({
        userId: req.userId,
        postId: post.id
      });

      post.likes += 1;
      likedByMe = true;
    }

    await post.save();

    res.json({
      likes: post.likes,
      likedByMe
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.userId !== req.userId)
      return res.status(403).json({ error: 'Unauthorized' });
    await post.destroy();
    res.json({ message: '✅ Post deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;