const express = require('express');
const apiRoutes = require('./routes/apiRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// API Routes (prefix /api)
app.use('/api', apiRoutes);

// Payment Routes (prefix /api/payment)
app.use('/api/payment', paymentRoutes);
app.use('/payment', paymentRoutes); 

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
