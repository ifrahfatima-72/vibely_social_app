const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Comment = sequelize.define('Comment', {
  text: {
    type: DataTypes.TEXT,
    allowNull: false
  }
});

Comment.belongsTo(User, { foreignKey: 'userId' });

module.exports = Comment;

// Associate with Post after both modules are loaded, to avoid circular require
const Post = require('./Post');
Comment.belongsTo(Post, { foreignKey: 'postId' });
Post.hasMany(Comment, { foreignKey: 'postId' });