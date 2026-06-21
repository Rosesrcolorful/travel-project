require("dotenv").config();

const http = require("http");
const express = require("express");
const { Server } = require("socket.io");

const db = require("./models");
const logger = require("./middleware/logger");

const usersRoutes = require("./routes/usersRoutes");
const tripsRoutes = require("./routes/tripsRoutes");
const friendsRoutes = require("./routes/friendsRoutes");
const authRoutes = require("./routes/authRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const messagesRoutes = require("./routes/messagesRoutes");
const tripSharesRoutes = require("./routes/tripSharesRoutes");
const aiRoutes = require("./routes/aiRoutes");

const authController = require("./controllers/authController");
const setupSocket = require("./socket");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  }
});

app.set("io", io);
setupSocket(io);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, x-user-id, x-user-role");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());
app.use(logger);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: "Travel Backend API is running"
    },
    error: null
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/settings", settingsRoutes);
app.get("/api/users/me", authController.getMe);

app.use("/users", usersRoutes);
app.use("/trips", tripsRoutes);
app.use("/friends", friendsRoutes);
app.use("/messages", messagesRoutes);
app.use("/trip-shares", tripSharesRoutes);
app.use("/api/ai", aiRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: "The requested route does not exist.",
      details: {
        method: req.method,
        path: req.originalUrl
      }
    }
  });
});

db.sequelize.authenticate()
  .then(() => {
    console.log("MySQL connected successfully");
    return db.sequelize.sync({ alter: true });
  })
  .then(() => {
    console.log("Database tables synced successfully");

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log("Socket.IO is ready");
    });
  })
  .catch((error) => {
    console.error("Unable to connect to MySQL:", error);
  });