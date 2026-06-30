const express = require('express');
const router = express.Router();
const FollowRequest = require('../models/FollowRequest');
const Follow = require('../models/Follow');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

// Send follow request
router.post('/send/:id', auth, async (req, res) => {
  try {
    const receiverId = parseInt(req.params.id);
    if (receiverId === req.userId)
      return res.status(400).json({ error: "Can't follow yourself" });

    // Check if already requested
    const existing = await FollowRequest.findOne({
      where: { senderId: req.userId, receiverId }
    });

    if (existing) {
      if (existing.status === 'pending') {
        return res.status(400).json({ error: 'Request already sent', status: existing.status });
      }
      if (existing.status === 'rejected') {
        // allow re-requesting after rejection — reset to pending
        await existing.update({ status: 'pending' });
        return res.json({ message: '✅ Follow request sent!', request: existing });
      }
      if (existing.status === 'accepted') {
        return res.status(400).json({ error: 'Already following' });
      }
    }

    // Check if already following
    const alreadyFollowing = await Follow.findOne({
      where: { followerId: req.userId, followingId: receiverId }
    });
    if (alreadyFollowing)
      return res.status(400).json({ error: 'Already following' });

    const request = await FollowRequest.create({ senderId: req.userId, receiverId });
    res.json({ message: '✅ Follow request sent!', request });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Accept follow request
router.put('/accept/:id', auth, async (req, res) => {
  try {
    const request = await FollowRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.receiverId !== req.userId)
      return res.status(403).json({ error: 'Unauthorized' });

    await request.update({ status: 'accepted' });
    await Follow.create({ followerId: request.senderId, followingId: request.receiverId });
    res.json({ message: '✅ Follow request accepted!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reject follow request
router.put('/reject/:id', auth, async (req, res) => {
  try {
    const request = await FollowRequest.findByPk(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (request.receiverId !== req.userId)
      return res.status(403).json({ error: 'Unauthorized' });

    await request.update({ status: 'rejected' });
    res.json({ message: '✅ Request rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my pending requests (received)
router.get('/received', auth, async (req, res) => {
  try {
    const requests = await FollowRequest.findAll({
      where: { receiverId: req.userId, status: 'pending' },
      include: [{ model: User, as: 'sender', attributes: ['id', 'username', 'avatar'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get sent requests
router.get('/sent', auth, async (req, res) => {
  try {
    const requests = await FollowRequest.findAll({
      where: { senderId: req.userId },
      include: [{ model: User, as: 'receiver', attributes: ['id', 'username', 'avatar'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get pending count (for badge)
router.get('/count', auth, async (req, res) => {
  try {
    const count = await FollowRequest.count({
      where: { receiverId: req.userId, status: 'pending' }
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check request status
router.get('/status/:id', auth, async (req, res) => {
  try {
    const request = await FollowRequest.findOne({
      where: { senderId: req.userId, receiverId: req.params.id }
    });
    res.json({ status: request ? request.status : 'none', requestId: request?.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get my followers list
router.get('/followers', auth, async (req, res) => {
  try {
    const follows = await Follow.findAll({
      where: { followingId: req.userId },
      include: [{ model: User, foreignKey: 'followerId', as: 'followerUser', attributes: ['id', 'username', 'avatar', 'bio'] }]
    });
    res.json(follows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;