const sequelize = require('../config/database');
const User = require('./User');
const Trip = require('./Trip');
const TripParticipant = require('./TripParticipant');
const Admin = require('./Admin');
const Friendship = require('./Friendship');
const TripShare = require("./TripShare");
const Message = require("./Message");

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

// Friend requests / friendships.
// userId = the user who sent the request.
// friendId = the user who received the request.
User.hasMany(Friendship, {
  foreignKey: 'userId',
  as: 'sentFriendRequests'
});

User.hasMany(Friendship, {
  foreignKey: 'friendId',
  as: 'receivedFriendRequests'
});

Friendship.belongsTo(User, {
  foreignKey: 'userId',
  as: 'requester'
});

Friendship.belongsTo(User, {
  foreignKey: 'friendId',
  as: 'addressee'
});

// Trip sharing invitations.
// A user can share a trip with another user.
// If the receiver accepts, they are added to TripParticipant.
Trip.hasMany(TripShare, {
  foreignKey: "tripId",
  as: "shares"
});

TripShare.belongsTo(Trip, {
  foreignKey: "tripId",
  as: "trip"
});

User.hasMany(TripShare, {
  foreignKey: "senderId",
  as: "sentTripShares"
});

User.hasMany(TripShare, {
  foreignKey: "receiverId",
  as: "receivedTripShares"
});

TripShare.belongsTo(User, {
  foreignKey: "senderId",
  as: "sender"
});

TripShare.belongsTo(User, {
  foreignKey: "receiverId",
  as: "receiver"
});

// Chat messages between users.
// A message can be a regular text message or a trip-share message.
User.hasMany(Message, {
  foreignKey: "senderId",
  as: "sentMessages"
});

User.hasMany(Message, {
  foreignKey: "receiverId",
  as: "receivedMessages"
});

Message.belongsTo(User, {
  foreignKey: "senderId",
  as: "sender"
});

Message.belongsTo(User, {
  foreignKey: "receiverId",
  as: "receiver"
});

TripShare.hasMany(Message, {
  foreignKey: "tripShareId",
  as: "messages"
});

Message.belongsTo(TripShare, {
  foreignKey: "tripShareId",
  as: "tripShare"
});
module.exports = {
  sequelize,
  User,
  Trip,
  TripParticipant,
  Admin,
  Friendship,
  TripShare,
  Message
};