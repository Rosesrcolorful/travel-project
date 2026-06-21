const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  userRole: {
    type: DataTypes.ENUM('admin', 'manager', 'user'),
    allowNull: false,
    defaultValue: 'user'
  }
  ,
  theme: {
    type: DataTypes.ENUM('light', 'dark', 'travel'),
    allowNull: false,
    defaultValue: 'light'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'createDate',
  updatedAt: 'updateDate'
});

module.exports = User;