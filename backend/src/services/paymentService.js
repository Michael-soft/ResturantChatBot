const axios = require('axios');

exports.processPayment = async (paymentDetails) => {
  // Expected paymentDetails: { amount, email, reference }
  const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
  try {
    // Initialize transaction with Paystack
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        amount: paymentDetails.amount,
        email: paymentDetails.email,
        reference: paymentDetails.reference
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    if (response.data.status) {
      return { success: true, data: response.data.data };
    }
    return { success: false };
  } catch (error) {
    console.error('Payment Processing Error:', error.response?.data || error.message);
    return { success: false };
  }
};
