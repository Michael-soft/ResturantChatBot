const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

/**
 * Initialize a Paystack transaction for the most recently placed order of this device.
 */
const initializePayment = async (req, res) => {
  try {
    const { amount, email } = req.body;
    // Get deviceId from headers (case-insensitive)
    const deviceId = req.headers['deviceid'] || req.headers['deviceId'];

    if (!amount || !email) {
      return res.status(400).json({ error: 'Missing required parameters: amount and email are required.' });
    }

    // Find the most recent order with status 'placed' for this device
    const order = await prisma.order.findFirst({
      where: {
        userDeviceId: deviceId,
        status: 'placed'
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!order) {
      return res.status(404).json({ error: 'No recently placed order found for this device.' });
    }

    // Construct reference using the internal order ID
    const reference = `ORDER_${order.id}`;

    // Initialize Paystack transaction
    const response = await axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        // Convert amount in Naira to kobo, ensure integer
        amount: Math.round(amount * 100),
        reference,
        // callback_url: `${process.env.FRONTEND_URL}/?reference=${reference}`,
        callback_url: process.env.PAYSTACK_CALLBACK_URL,
        metadata: { orderId: order.id, deviceId }
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.data.status) {
      throw new Error('Failed to initialize payment with Paystack');
    }

    return res.json({
      authorization_url: response.data.data.authorization_url,
      access_code: response.data.data.access_code,
      reference: response.data.data.reference
    });
  } catch (error) {
    console.error('Payment initialization error:', error);
    return res.status(500).json({
      error: 'Failed to initialize payment',
      details: error.response?.data?.message || error.message
    });
  }
};

/**
 * Verify a Paystack payment by reference query parameter.
 */
const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference) {
      return res.status(400).json({ error: 'Payment reference is required.' });
    }

    // Verify payment with Paystack
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (!response.data.status) {
      throw new Error('Failed to verify payment with Paystack');
    }

    const { status, amount, metadata } = response.data.data;

    if (status === 'success') {
      const { orderId } = metadata;

      // Update order status in database
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status: 'paid',
          paymentReference: reference,
          paidAmount: amount / 100,
          paidAt: new Date()
        }
      });

      // 👉 This part is useful if you're redirecting from the browser/chatbot:
      return res.status(200).json({
        message: '✅ Payment verified successfully',
        data: {
          orderId,
          amount: amount / 100,
          reference
        }
      });
    } else {
      return res.status(400).json({
        error: '⚠️ Payment not successful',
        details: response.data.message
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({
      error: '❌ Failed to verify payment',
      details: error.response?.data?.message || error.message
    });
  }
};
module.exports = {
  initializePayment,
  verifyPayment
};






// const axios = require('axios');
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
// const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// const initializePayment = async (req, res) => {
//   try {
//     const { orderId, amount, email } = req.body;
//     const { deviceId } = req.headers;

//     if (!orderId || !amount || !email) {
//       return res.status(400).json({ error: 'Missing required parameters' });
//     }

//     // Get the order from database
//     const order = await prisma.order.findFirst({
//       where: {
//         id: orderId,
//         userDeviceId: deviceId,
//         status: 'placed'
//       }
//     });

//     if (!order) {
//       return res.status(404).json({ error: 'Order not found' });
//     }

//     // Initialize Paystack payment
//     const response = await axios.post(
//       `${PAYSTACK_BASE_URL}/transaction/initialize`,
//       {
//         email,
//         amount: Math.round(amount), // Ensure amount is in kobo and is a whole number
//         reference: `ORDER_${orderId}`,
//         callback_url: process.env.PAYSTACK_CALLBACK_URL,
//         metadata: {
//           orderId,
//           deviceId
//         }
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
//           'Content-Type': 'application/json'
//         }
//       }
//     );

//     if (!response.data.status) {
//       throw new Error('Failed to initialize payment with Paystack');
//     }

//     return res.json({
//       authorization_url: response.data.data.authorization_url,
//       access_code: response.data.data.access_code,
//       reference: response.data.data.reference
//     });
//   } catch (error) {
//     console.error('Payment initialization error:', error);
//     return res.status(500).json({ 
//       error: 'Failed to initialize payment',
//       details: error.response?.data?.message || error.message
//     });
//   }
// };

// const verifyPayment = async (req, res) => {
//   try {
//     const { reference } = req.query;

//     if (!reference) {
//       return res.status(400).json({ error: 'Payment reference is required' });
//     }

//     // Verify payment with Paystack
//     const response = await axios.get(
//       `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
//       {
//         headers: {
//           Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
//         }
//       }
//     );

//     if (!response.data.status) {
//       throw new Error('Failed to verify payment with Paystack');
//     }

//     const { status, amount, metadata } = response.data.data;

//     if (status === 'success') {
//       // Extract order ID from metadata
//       const { orderId } = metadata;

//       // Update order status
//       await prisma.order.update({
//         where: { id: orderId },
//         data: { 
//           status: 'paid',
//           paymentReference: reference,
//           paidAmount: amount / 100, // Convert from kobo to naira
//           paidAt: new Date()
//         }
//       });

//       return res.json({ 
//         status: 'success', 
//         message: 'Payment verified successfully',
//         data: {
//           orderId,
//           amount: amount / 100,
//           reference
//         }
//       });
//     } else {
//       return res.status(400).json({ 
//         error: 'Payment verification failed',
//         details: response.data.message
//       });
//     }
//   } catch (error) {
//     console.error('Payment verification error:', error);
//     return res.status(500).json({ 
//       error: 'Failed to verify payment',
//       details: error.response?.data?.message || error.message
//     });
//   }
// };

// module.exports = {
//   initializePayment,
//   verifyPayment
// }; 