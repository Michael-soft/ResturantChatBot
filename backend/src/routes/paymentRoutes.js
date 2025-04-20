const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment } = require('../controllers/paymentController');

// Initialize payment
router.post('/initialize', initializePayment);

// Verify payment
router.get('/verify', verifyPayment);

module.exports = router; 