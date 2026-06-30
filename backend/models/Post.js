const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Like = require('./Like');
const Post = sequelize.define('Post', {
  content: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});
Post.hasMany(Like, {
    foreignKey: 'postId'
});
Post.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Post, { foreignKey: 'userId' });

module.exports = Post;