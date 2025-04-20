import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PaymentSuccess = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const orderId = query.get('orderId');
  const amount = query.get('amount');
  const reference = query.get('reference');

  useEffect(() => {
    console.log('Payment success', { orderId, amount, reference });
  }, [orderId, amount, reference]);

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h1> Payment Successful!</h1>
      <p>Order ID: <strong>{orderId}</strong></p>
      <p>Amount Paid: <strong>₦{amount}</strong></p>
      <p>Reference: <strong>{reference}</strong></p>
    </div>
  );
};

export default PaymentSuccess;
