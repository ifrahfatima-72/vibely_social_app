const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const Story = require('../models/Story');
const StoryView = require('../models/StoryView');
const User = require('../models/User');
const Follow = require('../models/Follow');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');

// Get active stories grouped by user (from people you follow + yourself)
router.get('/', auth, async (req, res) => {
  try {
    const following = await Follow.findAll({ where: { followerId: req.userId } });
    const followingIds = following.map(f => f.followingId);
    const userIds = [...new Set([req.userId, ...followingIds])];

    const stories = await Story.findAll({
      where: {
        userId: { [Op.in]: userIds },
        expiresAt: { [Op.gt]: new Date() }
      },
      include: [{ model: User, attributes: ['id', 'username', 'avatar'] }],
      order: [['createdAt', 'ASC']]
    });

    // group by user
    const grouped = {};
    for (const story of stories) {
      const uid = story.userId;
      if (!grouped[uid]) grouped[uid] = { user: story.User, stories: [] };
      grouped[uid].stories.push(story);
    }
    res.json(Object.values(grouped));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Post a story
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image required' });
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const story = await Story.create({
      image: `/uploads/${req.file.filename}`,
      caption: req.body.caption || '',
      userId: req.userId,
      expiresAt
    });
    const fullStory = await Story.findByPk(story.id, {
      include: [{ model: User, attributes: ['id', 'username', 'avatar'] }]
    });
    res.json(fullStory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark story as viewed
router.post('/:id/view', auth, async (req, res) => {
  try {
    const existing = await StoryView.findOne({
      where: { storyId: req.params.id, viewerId: req.userId }
    });
    if (!existing) {
      await StoryView.create({ storyId: req.params.id, viewerId: req.userId });
    }
    res.json({ message: 'viewed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get viewers of a story (only story owner can see this)
router.get('/:id/viewers', auth, async (req, res) => {
  try {
    const story = await Story.findByPk(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    if (story.userId !== req.userId)
      return res.status(403).json({ error: 'Unauthorized' });

    const views = await StoryView.findAll({
      where: { storyId: req.params.id },
      include: [{ model: User, as: 'viewer', attributes: ['id', 'username', 'avatar'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(views);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a story (manual delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const story = await Story.findByPk(req.params.id);
    if (!story) return res.status(404).json({ error: 'Story not found' });
    if (story.userId !== req.userId)
      return res.status(403).json({ error: 'Unauthorized' });

    // delete image file
    const filePath = path.join(__dirname, '..', story.image);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await StoryView.destroy({ where: { storyId: story.id } });
    await story.destroy();
    res.json({ message: '✅ Story deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;