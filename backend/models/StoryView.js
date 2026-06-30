const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const StoryView = sequelize.define('StoryView', {
  storyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: 'story_view_unique'
  },
  viewerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: 'story_view_unique'
  }
});

StoryView.belongsTo(User, {
  foreignKey: 'viewerId',
  as: 'viewer'
});

module.exports = StoryView;