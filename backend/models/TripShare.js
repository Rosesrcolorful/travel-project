const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TripShare = sequelize.define("TripShare", {
  tripShareId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tripId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "trips",
      key: "tripId"
    },
    onDelete: "CASCADE"
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "userId"
    },
    onDelete: "CASCADE"
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "userId"
    },
    onDelete: "CASCADE"
  },
  status: {
    type: DataTypes.ENUM("pending", "accepted", "declined"),
    allowNull: false,
    defaultValue: "pending"
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "trip_shares",
  timestamps: true,
  createdAt: "createDate",
  updatedAt: "updateDate",
  indexes: [
    {
      unique: true,
      fields: ["tripId", "senderId", "receiverId"]
    }
  ]
});

module.exports = TripShare;