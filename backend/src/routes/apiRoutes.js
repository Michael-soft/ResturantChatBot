const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const orderController = require('../controllers/orderController');
const paymentController = require('../controllers/paymentController');

// Chat initialization and messaging endpoint
router.post('/chat', chatController.handleChat);

// Order and action endpoints (including item selection, checkout, etc.)
router.post('/order', orderController.handleOrderAction);

// Get order details by ID
router.get('/orders/:orderId', orderController.getOrderById);

// Payment endpoints
router.post('/payment/initialize', paymentController.initializePayment);
router.get('/payment/verify', paymentController.verifyPayment);

module.exports = router;
