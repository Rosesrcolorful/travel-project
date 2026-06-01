/**
 * Main server file
 * Initializes Express app, middleware, and routes.
 */

const express = require('express');
const app = express();

const logger = require('./middleware/logger');
const usersRoutes = require('./routes/usersRoutes');
const tripsRoutes = require('./routes/tripsRoutes');
const friendsRoutes = require('./routes/friendsRoutes');
const authRoutes = require('./routes/authRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const authController = require('./controllers/authController');

const PORT = 3000;

// Parse JSON request bodies
app.use(express.json());

// Log every incoming request
app.use(logger);
app.use('/api/auth', authRoutes);
app.use('/api/settings', settingsRoutes);
app.get('/api/users/me', authController.getMe);

// Basic test route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      message: 'Travel Backend API is running'
    },
    error: null
  });
});

// Main API routes
app.use('/users', usersRoutes);
app.use('/trips', tripsRoutes);
app.use('/friends', friendsRoutes);

// Route not found handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested route does not exist.',
      details: {
        method: req.method,
        path: req.originalUrl
      }
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});