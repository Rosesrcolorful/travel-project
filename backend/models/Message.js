const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Message = sequelize.define("Message", {
  messageId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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

  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },

  messageType: {
    type: DataTypes.ENUM("text", "trip_share"),
    allowNull: false,
    defaultValue: "text"
  },

  tripShareId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "trip_shares",
      key: "tripShareId"
    },
    onDelete: "SET NULL"
  }
}, {
  tableName: "messages",
  timestamps: true,
  createdAt: "createDate",
  updatedAt: "updateDate"
});

module.exports = Message;