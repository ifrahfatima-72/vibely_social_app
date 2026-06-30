const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Follow = sequelize.define('Follow', {
  followerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  followingId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

Follow.belongsTo(User, { foreignKey: 'followerId', as: 'followerUser' });
Follow.belongsTo(User, { foreignKey: 'followingId', as: 'followingUser' });

module.exports = Follow;