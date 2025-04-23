import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function PaymentPage() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const navigate = useNavigate();
  const location = useLocation();

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const orderId = params.get('orderId');
        const amount = params.get('amount');

        if (!orderId || !amount) {
          setError('Missing order details');
          setLoading(false);
          return;
        }

        setOrderDetails({ orderId, totalAmount: parseFloat(amount) });
        setLoading(false);
      } catch (err) {
        console.error('Error processing order details:', err);
        setError('Failed to process order details');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [location]);

  const handlePayment = async () => {
    try {
      setLoading(true);

      const response = await axios.post(`${BACKEND_URL}/api/payment/initialize`, {
        orderId: orderDetails.orderId,
        amount: orderDetails.totalAmount,
        email: 'customer@example.com',
        callbackUrl: `${window.location.origin}/?payment=success&orderId=${orderDetails.orderId}`
      });

      if (response.data && response.data.authorization_url) {
        window.location.href = response.data.authorization_url;
      } else {
        throw new Error('Invalid payment initialization response');
      }
    } catch (err) {
      console.error('Error initializing payment:', err);
      setError('Payment could not be processed. Please try again later.');
      setLoading(false);
    }
  };

  if (loading) {
    return <h2>Loading payment details...</h2>;
  }

  if (error) {
    return (
      <div>
        <h2>{error}</h2>
        <button onClick={() => navigate('/')}>Return to Chat</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Order Payment</h2>
      {orderDetails && (
        <div>
          <p>Order ID: {orderDetails.orderId}</p>
          <p>Total Amount: ₦{orderDetails.totalAmount.toFixed(2)}</p>
          <button onClick={handlePayment}>Pay Now</button>
        </div>
      )}
      <button onClick={() => navigate('/')}>Cancel and Return</button>
    </div>
  );
}

export default PaymentPage;

// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import axios from 'axios';

// function PaymentPage() {
//   const BACKEND_URL = process.env.REACT_APP_BACKEND_URL; // Use environment variable for backend URL

//   const [orderDetails, setOrderDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const fetchOrderDetails = async () => {
//       try {
//         // Get order ID and amount from URL parameters
//         const params = new URLSearchParams(location.search);
//         const orderId = params.get('orderId');
//         const amount = params.get('amount');
        
//         if (!orderId || !amount) {
//           setError('Missing order details');
//           setLoading(false);
//           return;
//         }

//         // Set order details from URL parameters
//         setOrderDetails({
//           orderId,
//           totalAmount: parseFloat(amount)
//         });
//         setLoading(false);
//       } catch (err) {
//         console.error('Error processing order details:', err);
//         setError('Failed to process order details');
//         setLoading(false);
//       }
//     };

//     fetchOrderDetails();
//   }, [location]);

//   const handlePayment = async () => {
//     try {
//       setLoading(true);
      
//       // Format amount to the smallest currency unit (kobo for NGN)
//       const amount = orderDetails.totalAmount;
//       amount
//       // Initialize payment with Paystack
//       const response = await axios.post(`${BACKEND_URL}/api/payment/initialize`, {
//         orderId: orderDetails.orderId,
//         amount: amount, // Amount in kobo
//         email: 'Customers@gmail.com', 
//         callbackUrl: `${window.location.origin}/chat?payment=success&orderId=${orderDetails.orderId}`
//       });

//       if (response.data && response.data.authorization_url) {
//         // Redirect to Paystack payment page
//         window.location.href = response.data.authorization_url;
//       } else {
//         console.error('Payment initialization response:', response.data);
//         throw new Error('Invalid payment initialization response');
//       }
//     } catch (err) {
//       console.error('Error initializing payment:', err);
//       // More detailed error message
//       const errorMessage = err.response?.data?.message || 
//                            err.response?.data?.error || 
//                            'Payment could not be processed. Please try again later.';
//       setError(errorMessage);
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div style={{ textAlign: 'center', padding: '20px' }}>
//         <h2>Loading payment details...</h2>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={{ textAlign: 'center', padding: '20px' }}>
//         <h2 style={{ color: 'red' }}>{error}</h2>
//         <button 
//           onClick={() => navigate('/')}
//           style={{
//             padding: '10px 20px',
//             backgroundColor: '#007bff',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer',
//             marginTop: '20px'
//           }}
//         >
//           Return to Chat
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
//       <h2>Order Payment</h2>
      
//       {orderDetails && (
//         <div style={{ 
//           border: '1px solid #ddd', 
//           borderRadius: '8px', 
//           padding: '20px',
//           marginTop: '20px'
//         }}>
//           <h3>Order Details</h3>
//           <p><strong>Order ID:</strong> {orderDetails.orderId}</p>
//           <p><strong>Total Amount:</strong> ₦{orderDetails.totalAmount.toFixed(2)}</p>
          
//           <div style={{ marginTop: '20px' }}>
//             <button
//               onClick={handlePayment}
//               disabled={loading}
//               style={{
//                 padding: '10px 20px',
//                 backgroundColor: '#28a745',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 cursor: loading ? 'not-allowed' : 'pointer',
//                 fontSize: '16px',
//                 fontWeight: 'bold',
//                 opacity: loading ? 0.7 : 1
//               }}
//             >
//               {loading ? 'Processing...' : 'Pay with Paystack'}
//             </button>
//           </div>
//         </div>
//       )}
      
//       <button 
//         onClick={() => navigate('/')}
//         style={{
//           padding: '10px 20px',
//           backgroundColor: '#6c757d',
//           color: 'white',
//           border: 'none',
//           borderRadius: '4px',
//           cursor: 'pointer',
//           marginTop: '20px'
//         }}
//       >
//         Cancel Payment
//       </button>
//     </div>
//   );
// }

// export default PaymentPage;


// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import axios from 'axios';

// function PaymentPage() {
//   const [orderDetails, setOrderDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();
//   const location = useLocation();

//   useEffect(() => {
//     const fetchOrderDetails = async () => {
//       try {
//         // Get order ID and amount from URL parameters
//         const params = new URLSearchParams(location.search);
//         const orderId = params.get('orderId');
//         const amount = params.get('amount');
        
//         if (!orderId || !amount) {
//           setError('Missing order details');
//           setLoading(false);
//           return;
//         }

//         // Set order details from URL parameters
//         setOrderDetails({
//           orderId,
//           totalAmount: parseFloat(amount)
//         });
//         setLoading(false);
//       } catch (err) {
//         console.error('Error processing order details:', err);
//         setError('Failed to process order details');
//         setLoading(false);
//       }
//     };

//     fetchOrderDetails();
//   }, [location]);

//   const handlePayment = async () => {
//     try {
//       setLoading(true);
      
//       // Format amount to the smallest currency unit (kobo for NGN)
//       // Paystack expects amount in kobo (1 Naira = 100 kobo)
//       const amount = orderDetails.totalAmount;
//        amount      
//       // Initialize payment with Paystack
//       const response = await axios.post('https://chatbotbackend-d5sx.onrender.com/api/payment/initialize', {
//         orderId: orderDetails.orderId,
//         amount: amount,
//         email: 'Customers@gmail.com', 
//         callbackUrl: `${window.location.origin}/chat?payment=success&orderId=${orderDetails.orderId}`
//       });

//       if (response.data && response.data.authorization_url) {
//         // Redirect to Paystack payment page
//         window.location.href = response.data.authorization_url;
//       } else {
//         console.error('Payment initialization response:', response.data);
//         throw new Error('Invalid payment initialization response');
//       }
//     } catch (err) {
//       console.error('Error initializing payment:', err);
//       // More detailed error message
//       const errorMessage = err.response?.data?.message || 
//                            err.response?.data?.error || 
//                            'Payment could not be processed. Please try again later.';
//       setError(errorMessage);
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div style={{ textAlign: 'center', padding: '20px' }}>
//         <h2>Loading payment details...</h2>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={{ textAlign: 'center', padding: '20px' }}>
//         <h2 style={{ color: 'red' }}>{error}</h2>
//         <button 
//           onClick={() => navigate('/')}
//           style={{
//             padding: '10px 20px',
//             backgroundColor: '#007bff',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer',
//             marginTop: '20px'
//           }}
//         >
//           Return to Chat
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
//       <h2>Order Payment</h2>
      
//       {orderDetails && (
//         <div style={{ 
//           border: '1px solid #ddd', 
//           borderRadius: '8px', 
//           padding: '20px',
//           marginTop: '20px'
//         }}>
//           <h3>Order Details</h3>
//           <p><strong>Order ID:</strong> {orderDetails.orderId}</p>
//           <p><strong>Total Amount:</strong> ₦{orderDetails.totalAmount.toFixed(2)}</p>
          
//           <div style={{ marginTop: '20px' }}>
//             <button
//               onClick={handlePayment}
//               disabled={loading}
//               style={{
//                 padding: '10px 20px',
//                 backgroundColor: '#28a745',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 cursor: loading ? 'not-allowed' : 'pointer',
//                 fontSize: '16px',
//                 fontWeight: 'bold',
//                 opacity: loading ? 0.7 : 1
//               }}
//             >
//               {loading ? 'Processing...' : 'Pay with Paystack'}
//             </button>
//           </div>
//         </div>
//       )}
      
//       <button 
//         onClick={() => navigate('/')}
//         style={{
//           padding: '10px 20px',
//           backgroundColor: '#6c757d',
//           color: 'white',
//           border: 'none',
//           borderRadius: '4px',
//           cursor: 'pointer',
//           marginTop: '20px'
//         }}
//       >
//         Cancel Payment
//       </button>
//     </div>
//   );
// }

// export default PaymentPage; 