import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [connectionError, setConnectionError] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [currentOrderAmount, setCurrentOrderAmount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Generate a random device ID when component mounts
  useEffect(() => {
    const newDeviceId = 'device_' + Math.random().toString(36).substring(2, 15);
    setDeviceId(newDeviceId);
    
    // Get initial options from the backend
    fetchInitialOptions(newDeviceId);
  }, []);

  // Check for payment status in URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('payment');
    const orderId = params.get('orderId');
    const reference = params.get('reference');

    if (paymentStatus && orderId) {
      let message = '';
      
      switch (paymentStatus) {
        case 'success':
          message = 'Payment successful! Your order has been confirmed. Thank you for your purchase!';
          break;
        case 'cancelled':
          message = 'Payment was cancelled. Would you like to try again?\n\n1 - Try payment again\n0 - Cancel payment';
          break;
        case 'failed':
          message = 'Payment failed. Please try again or contact support.\n\n1 - Try payment again\n0 - Cancel payment';
          break;
        case 'error':
          message = 'There was an error processing your payment. Please try again or contact support.\n\n1 - Try payment again\n0 - Cancel payment';
          break;
        default:
          return;
      }
      
      setMessages(prev => [...prev, { text: message, sender: 'bot' }]);
    } else if (reference) {
      // This is a Paystack callback
      // Verify the payment with the backend
      const verifyPayment = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/payment/verify?reference=${reference}`);
          
          if (response.data.status === 'success') {
            setMessages(prev => [...prev, { 
              text: 'Payment successful! Your order has been confirmed. Thank you for your purchase!', 
              sender: 'bot' 
            }]);
          } else {
            setMessages(prev => [...prev, { 
              text: 'Payment verification failed. Please contact support.', 
              sender: 'bot' 
            }]);
          }
        } catch (error) {
          console.error('Error verifying payment:', error);
          setMessages(prev => [...prev, { 
            text: 'There was an error verifying your payment. Please contact support.', 
            sender: 'bot' 
          }]);
        }
      };
      
      verifyPayment();
    }
  }, [location]);

  const fetchInitialOptions = async (id) => {
    setIsLoading(true);
    setConnectionError(false);
    try {
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/chat`, {
        deviceId: id,
        message: 'start'
      });
      
      setMessages([
        { text: response.data.response, sender: 'bot' }
      ]);
    } catch (error) {
      console.error('Error fetching options:', error);
      setConnectionError(true);
      setMessages([
        { text: 'Welcome to Our Restaurant Chatbot! Please select an option:', sender: 'bot' },
        { text: '1 - Place an Order (or add items if order is active)\n99 - Checkout Order\n98 - See Order History\n97 - See Current Order\n0 - Cancel Order\n96 - Schedule Order (optional)', sender: 'bot' },
        { text: '⚠️ Note: Backend connection failed. This is a demo mode with simulated responses.', sender: 'bot' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = (orderId, amount) => {
    // Redirect to payment page
    navigate(`/payment?orderId=${orderId}&amount=${amount}`);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) {
      return;
    }

    const newMessages = [...messages, { text: inputText, sender: 'user' }];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      // Check if this is a payment selection
      const lastBotMessage = messages.filter(m => m.sender === 'bot').pop();
      const isPaymentPrompt = lastBotMessage && 
        (lastBotMessage.text.includes('Would you like to pay now?') || 
         lastBotMessage.text.includes('Pay with Paystack'));

      // Check if this is a scheduling prompt
      const isSchedulingPrompt = lastBotMessage && 
        lastBotMessage.text.includes('Please enter the date and time');

      if (isSchedulingPrompt) {
        // Validate date format (YYYY-MM-DD HH:mm)
        const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
        if (!dateRegex.test(inputText.trim())) {
          setMessages([...newMessages, { 
            text: 'Invalid date format. Please use YYYY-MM-DD HH:mm format (e.g., 2024-03-25 18:00)', 
            sender: 'bot' 
          }]);
          setIsLoading(false);
          return;
        }

        // Send scheduling request to backend
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/chat`, {
          deviceId: deviceId,
          message: `schedule ${inputText.trim()}`
        });

        setMessages([...newMessages, { text: response.data.response, sender: 'bot' }]);
        setIsLoading(false);
        return;
      }

      if (isPaymentPrompt && (inputText.trim() === '1' || inputText.trim().toLowerCase() === 'pay')) {
        // Extract order ID and amount from the last bot message
        const orderIdMatch = lastBotMessage.text.match(/Order #(\d+)/);
        const amountMatch = lastBotMessage.text.match(/Total: ₦(\d+(\.\d{2})?)/);
        
        if (orderIdMatch && orderIdMatch[1] && amountMatch && amountMatch[1]) {
          const orderId = orderIdMatch[1];
          const amount = parseFloat(amountMatch[1]);
          
          // Add a message about initiating payment
          setMessages([...newMessages, { 
            text: `Initiating payment for Order #${orderId} - ₦${amount.toFixed(2)}...`, 
            sender: 'bot' 
          }]);
          
          // Redirect to payment page
          navigate(`/payment?orderId=${orderId}&amount=${amount}`);
          return;
        } else {
          setMessages([...newMessages, { 
            text: 'Sorry, there was an error processing your payment. Please try again.', 
            sender: 'bot' 
          }]);
          return;
        }
      }

      // If not a payment selection or scheduling, proceed with normal chat flow
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/chat`, {
        deviceId: deviceId,
        message: inputText
      });

      setMessages([...newMessages, { text: response.data.response, sender: 'bot' }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setConnectionError(true);
      
      // Simulated response for demo mode
      let simulatedResponse = '';
      
      switch(inputText.trim()) {
        case '1':
          // Check if we're in payment mode
          const lastBotMessage = messages.filter(m => m.sender === 'bot').pop();
          const isPaymentPrompt = lastBotMessage && 
            (lastBotMessage.text.includes('Would you like to pay now?') || 
             lastBotMessage.text.includes('Pay with Paystack'));
          
          if (isPaymentPrompt) {
            simulatedResponse = 'Order #12345 placed successfully! Total: ₦2500.00\n\nWould you like to pay now?\n\n1 - Pay with Paystack\n0 - Cancel payment';
          } else {
            simulatedResponse = 'Great! What would you like to order?\n\nAvailable items:\n1. Pizza - ₦1000\n2. Burger - ₦800\n3. Salad - ₦600\n4. Pasta - ₦900\n\nPlease enter the number of the item you want to order.';
          }
          break;
        case '99':
          simulatedResponse = 'Order #12345 placed successfully! Total: ₦2500.00\n\nWould you like to pay now?\n\n1 - Pay with Paystack\n0 - Cancel payment\n\nOr would you like to place a new order?\n\n2 - Place a new order';
          break;
        case '98':
          simulatedResponse = 'Your order history:\n\nNo previous orders found.';
          break;
        case '97':
          simulatedResponse = 'Your current order:\n\nNo active order.';
          break;
        case '0':
          simulatedResponse = 'Your order has been cancelled.';
          break;
        case '96':
          simulatedResponse = 'Please enter the date and time you would like to schedule your order for (e.g., "2024-03-25 18:00").';
          break;
        default:
          // Check if this is a scheduling attempt
          const dateRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/;
          if (dateRegex.test(inputText.trim())) {
            simulatedResponse = `Order scheduled for ${inputText.trim()}. You will receive a confirmation when the order is ready.`;
          } else {
            simulatedResponse = 'I didn\'t understand that. Please select a valid option:\n\n1 - Place an Order (or add items if order is active)\n99 - Checkout Order\n98 - See Order History\n97 - See Current Order\n0 - Cancel Order\n96 - Schedule Order (optional)';
          }
      }
      
      // Add simulated response
      setMessages([...newMessages, { 
        text: simulatedResponse + '\n\n Note: Backend connection failed. This is a simulated response.', 
        sender: 'bot' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container" style={{ 
      maxWidth: '600px', 
      margin: '0 auto', 
      border: '1px solid #ddd', 
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      {connectionError && (
        <div style={{ 
          backgroundColor: '#fff3cd', 
          color: '#856404', 
          padding: '10px', 
          textAlign: 'center',
          borderBottom: '1px solid #ddd'
        }}>
          ⚠️ Backend connection failed. Running in demo mode with simulated responses.
        </div>
      )}
      <div className="chat-messages" style={{ 
        height: '400px', 
        overflowY: 'auto', 
        padding: '20px',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.map((message, index) => (
          <div 
            key={index} 
            style={{ 
              marginBottom: '10px',
              textAlign: message.sender === 'user' ? 'right' : 'left'
            }}
          >
            <div style={{ 
              display: 'inline-block',
              padding: '10px 15px',
              borderRadius: '18px',
              backgroundColor: message.sender === 'user' ? '#007bff' : '#e9ecef',
              color: message.sender === 'user' ? 'white' : 'black',
              maxWidth: '70%',
              whiteSpace: 'pre-line'
            }}>
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ textAlign: 'left', marginBottom: '10px' }}>
            <div style={{ 
              display: 'inline-block',
              padding: '10px 15px',
              borderRadius: '18px',
              backgroundColor: '#e9ecef',
              color: 'black',
              maxWidth: '70%'
            }}>
              Typing...
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSendMessage} style={{ 
        display: 'flex', 
        padding: '10px',
        borderTop: '1px solid #ddd'
      }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message..."
          style={{ 
            flex: 1, 
            padding: '10px', 
            borderRadius: '4px',
            border: '1px solid #ddd',
            marginRight: '10px'
          }}
        />
        <button 
          type="submit"
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </form>
      
      {/* Payment Button - Only show when there's a payment prompt */}
      {messages.length > 0 && 
       messages.filter(m => m.sender === 'bot').pop()?.text.includes('Would you like to pay now?') && (
        <div style={{
          padding: '10px',
          borderTop: '1px solid #ddd',
          textAlign: 'center'
        }}>
          <button
            onClick={() => {
              const lastBotMessage = messages.filter(m => m.sender === 'bot').pop();
              console.log('Last bot message:', lastBotMessage.text);
              
              // Extract order ID and amount using the current format
              const orderIdMatch = lastBotMessage.text.match(/Order #(\d+)/);
              const amountMatch = lastBotMessage.text.match(/Total: ₦(\d+(\.\d{2})?)/);
              
              console.log('Order ID match:', orderIdMatch);
              console.log('Amount match:', amountMatch);
              
              if (orderIdMatch && orderIdMatch[1] && amountMatch && amountMatch[1]) {
                const orderId = orderIdMatch[1];
                const amount = parseFloat(amountMatch[1]);
                console.log('Extracted order ID:', orderId);
                console.log('Extracted amount:', amount);
                handlePayment(orderId, amount);
                
                // Add user message and bot response
                setMessages(prev => [
                  ...prev, 
                  { text: '1', sender: 'user' }, // Send '1' to select Paystack payment
                  { text: `Initiating payment for Order #${orderId} - ₦${amount.toFixed(2)}...`, sender: 'bot' }
                ]);
              } else {
                console.error('Failed to extract order details:', {
                  orderIdMatch,
                  amountMatch,
                  message: lastBotMessage.text
                });
                setMessages(prev => [...prev, { 
                  text: 'Sorry, there was an error processing your payment. Please try again.', 
                  sender: 'bot' 
                }]);
              }
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold'
            }}
          >
            Pay with Paystack
          </button>
        </div>
      )}
    </div>
  );
}

export default ChatBot; 