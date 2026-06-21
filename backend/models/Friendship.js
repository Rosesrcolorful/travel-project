const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Friendship = sequelize.define('Friendship', {
  friendshipId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'userId'
    },
    onDelete: 'CASCADE'
  },
  friendId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'userId'
    },
    onDelete: 'CASCADE'
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined'),
    allowNull: false,
    defaultValue: 'pending'
  }
}, {
  tableName: 'friendships',
  timestamps: true,
  createdAt: 'createDate',
  updatedAt: 'updateDate',
  indexes: [
    {
      unique: true,
      fields: ['userId', 'friendId']
    }
  ]
});

module.exports = Friendship;