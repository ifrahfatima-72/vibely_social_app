const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Search users
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    const users = await User.findAll({
      where: { username: { [Op.like]: `%${q}%` } },
      attributes: ['id', 'username', 'avatar', 'bio'],
      limit: 10
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const followers = await Follow.count({ where: { followingId: req.params.id } });
    const following = await Follow.count({ where: { followerId: req.params.id } });
    const posts = await Post.count({ where: { userId: req.params.id } });
    res.json({ ...user.toJSON(), followers, following, postsCount: posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get followers list of a user
router.get('/:id/followers', async (req, res) => {
  try {
    const follows = await Follow.findAll({
      where: { followingId: req.params.id },
      include: [{ model: User, foreignKey: 'followerId', as: 'followerUser', attributes: ['id', 'username', 'avatar', 'bio'] }]
    });
    res.json(follows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get following list of a user
router.get('/:id/following', async (req, res) => {
  try {
    const follows = await Follow.findAll({
      where: { followerId: req.params.id },
      include: [{ model: User, foreignKey: 'followingId', as: 'followingUser', attributes: ['id', 'username', 'avatar', 'bio'] }]
    });
    res.json(follows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile + avatar
router.put('/profile/update', auth, upload.single('avatar'), async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const avatarUrl = req.file ? `/uploads/${req.file.filename}` : user.avatar;
    await user.update({
      bio: req.body.bio !== undefined ? req.body.bio : user.bio,
      website: req.body.website !== undefined ? req.body.website : user.website,
      avatar: avatarUrl
    });
    const { password: _, ...userData } = user.toJSON();
    res.json(userData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Explicit unfollow
router.delete('/:id/unfollow', auth, async (req, res) => {
  try {
    const existing = await Follow.findOne({
      where: { followerId: req.userId, followingId: req.params.id }
    });
    if (!existing) return res.status(404).json({ error: 'Not following this user' });
    await existing.destroy();
    res.json({ message: '✅ Unfollowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if following
router.get('/:id/isfollowing', auth, async (req, res) => {
  try {
    const existing = await Follow.findOne({
      where: { followerId: req.userId, followingId: req.params.id }
    });
    res.json({ following: !!existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;