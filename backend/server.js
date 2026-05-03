
/**
 * @file Main server file
 * @description Initializes Express app, middleware and routes
 */


const express = require('express');
const app = express();

// middleware - parsing JSON
app.use(express.json());

// logger middleware
const logger = require('./middleware/logger');
app.use(logger);

// test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    data: 'Server is running',
    error: null
  });
});

// users routes 
const usersRoutes = require('./routes/usersRoutes');
app.use('/users', usersRoutes);

// start server
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});