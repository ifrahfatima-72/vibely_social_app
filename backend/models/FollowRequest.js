const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const FollowRequest = sequelize.define('FollowRequest', {
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending'
  }
});

FollowRequest.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
FollowRequest.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

module.exports = FollowRequest;