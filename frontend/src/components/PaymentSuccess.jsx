import { useEffect } from "react";

const PaymentSuccess = () => {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "/";
    }, 3000); // Redirect after 3 seconds

    return () => clearTimeout(timer); // Clean up if component unmounts
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-600">🎉 Payment Successful!</h1>
        <p className="mt-4 text-gray-700">Redirecting you back to the chatbot...</p>
      </div>
    </div>
  );
};

export default PaymentSuccess;




// import { useEffect } from 'react';
// import { useLocation } from 'react-router-dom';

// const PaymentSuccess = () => {
//   const location = useLocation();
//   const query = new URLSearchParams(location.search);
//   const orderId = query.get('orderId');
//   const amount = query.get('amount');
//   const reference = query.get('reference');

//   useEffect(() => {
//     console.log('Payment success', { orderId, amount, reference });
//   }, [orderId, amount, reference]);
//   return (
//     <div style={{ padding: 20, textAlign: 'center' }}>
//       <h1> Payment Successful!</h1>
//       <p>Order ID: <strong>{orderId}</strong></p>
//       <p>Amount Paid: <strong>₦{amount}</strong></p>
//       <p>Reference: <strong>{reference}</strong></p>
//     </div>
//   );
// };

// export default PaymentSuccess;
