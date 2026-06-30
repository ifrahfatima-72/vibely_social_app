const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');
const Story = require('../models/Story');
const StoryView = require('../models/StoryView');

async function cleanupExpiredStories() {
  try {
    const expired = await Story.findAll({
      where: { expiresAt: { [Op.lte]: new Date() } }
    });
    for (const story of expired) {
      const filePath = path.join(__dirname, '..', story.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      await StoryView.destroy({ where: { storyId: story.id } });
      await story.destroy();
    }
    if (expired.length > 0) {
      console.log(`🧹 Cleaned up ${expired.length} expired stories`);
    }
  } catch (err) {
    console.error('Story cleanup error:', err.message);
  }
}

module.exports = cleanupExpiredStories;