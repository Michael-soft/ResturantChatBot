import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const reference = query.get('reference');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const res = await fetch(`https://chatbotbackend-d5sx.onrender.com/api/payment/verify?reference=${reference}`);
        const data = await res.json();

        if (res.ok) {
          //  Notify the user 
          alert('Payment Successful!');

          //  Redirect back to ChatBot
          navigate('/', { state: { paymentSuccess: true } });
        } else {
          console.error('Verification failed:', data);
          alert('Payment verification failed.');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        alert('Something went wrong. Try again.');
      } finally {
        setLoading(false);
      }
    };

    if (reference) {
      verifyPayment();
    }
  }, [reference, navigate]);

  return loading ? <p>Verifying payment...</p> : null;
};

export default PaymentSuccess;

