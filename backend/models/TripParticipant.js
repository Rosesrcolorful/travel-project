const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TripParticipant = sequelize.define('TripParticipant', {
  userId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  tripId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false
  },
  participantRole: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'member'
  }
}, {
  tableName: 'trip_participants',
  timestamps: true
});

module.exports = TripParticipant;