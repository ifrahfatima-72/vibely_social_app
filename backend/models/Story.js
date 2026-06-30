const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Story = sequelize.define('Story', {
  image: {
    type: DataTypes.STRING,
    allowNull: false
  },
  caption: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
});

Story.belongsTo(User, { foreignKey: 'userId' });

module.exports = Story;