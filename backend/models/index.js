const sequelize = require('../config/database');

const User = require('./User');
const Trip = require('./Trip');
const TripParticipant = require('./TripParticipant');
const Admin = require('./Admin');

// One-to-Many: User -> Trips
User.hasMany(Trip, {
  foreignKey: 'createdBy',
  as: 'createdTrips'
});

Trip.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

// Many-to-Many: Users <-> Trips
User.belongsToMany(Trip, {
  through: TripParticipant,
  foreignKey: 'userId',
  otherKey: 'tripId',
  as: 'joinedTrips'
});

Trip.belongsToMany(User, {
  through: TripParticipant,
  foreignKey: 'tripId',
  otherKey: 'userId',
  as: 'participants'
});

// One-to-One: User -> Admin
User.hasOne(Admin, {
  foreignKey: 'userId',
  as: 'adminProfile'
});

Admin.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

module.exports = {
  sequelize,
  User,
  Trip,
  TripParticipant,
  Admin
};