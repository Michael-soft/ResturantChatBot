import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { SendHorizonal } from 'lucide-react';

const ChatBot = () => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const navigate = useNavigate();

  const [deviceId] = useState(() => {
    const id = localStorage.getItem('deviceId') || Math.random().toString(36).substring(2);
    localStorage.setItem('deviceId', id);
    return id;
  });

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatWindowRef = useRef(null);

  useEffect(() => {
    axios.post(`${BACKEND_URL}/api/chat`, { deviceId, message: '' })
      .then(response => addMessage('bot', response.data.response))
      .catch(error => {
        console.error(error);
        addMessage('bot', 'Error fetching chat options.');
      });
  }, [deviceId, BACKEND_URL]);

  useEffect(() => {
    chatWindowRef.current?.scrollTo(0, chatWindowRef.current.scrollHeight);
  }, [messages]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
  
    if (paymentStatus === 'success') {
      addMessage('bot', ' Payment was successful! Your order is confirmed.');
    } else if (paymentStatus === 'failed') {
      addMessage('bot', ' Payment failed. Please try again.');
    } else if (paymentStatus === 'error') {
      addMessage('bot', ' An error occurred during payment verification.');
    }
  
    // Clean the URL to remove the query string
    const cleanURL = new URL(window.location.href);
    cleanURL.searchParams.delete('payment');
    window.history.replaceState({}, '', cleanURL.pathname);
  }, []);
  
  // useEffect(() => {
  //   const params = new URLSearchParams(window.location.search);
  //   const paymentStatus = params.get('payment');

  //   if (paymentStatus === 'success') {
  //     // const verifyPayment = async () => {
  //     //   try {
  //     //     const res = await axios.get(`${BACKEND_URL}/payment/verify?reference=${reference}`);
  //     //     if (res.data?.success) {
  //           addMessage('bot', ' Payment verified successfully! Redirecting to homepage...');
  //           // setTimeout(() => {
  //           //   navigate('/'); // Update this if your home route is different
  //           // }, 3000);
  //         } else if (paymentStatus === 'failed'){
  //           addMessage('bot', 'Payment verification failed. Please contact support.');
  //         } else if (paymentStatus === 'error') {
  //           addMessage('bot', ' Error verifying payment. Please try again later.');
  //         } 
  //         //clean the URL to remove the query string 
  //         const cleanURL = new URL(window.location.href);
  //         cleanURL.searchParams.delete('payment');
  //         window.history.replaceState({}, '', cleanURL.pathname);
  //       }
  //     }, []);

  //     verifyPayment();
  //   }
  // }, [BACKEND_URL, navigate]);

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  const handleSend = async () => {
    const message = userInput.trim();
    if (!message) {
      return;
    }

    addMessage('user', message);
    setUserInput('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/order`, { deviceId, message });
      addMessage('bot', response.data.response);
    } catch (error) {
      console.error(error);
      addMessage('bot', 'There was an error processing your request.');
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-window" ref={chatWindowRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {isTyping && <div className="typing-indicator">Chatbot is typing...</div>}
      </div>

      <div className="chatbot-input" style={{ display: 'flex', marginTop: '10px' }}>
        <input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Type a message..."
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: '20px',
            border: '1px solid #ccc'
          }}
        />
        <button
          onClick={handleSend}
          style={{
            background: 'transparent',
            border: 'none',
            marginLeft: '10px',
            cursor: 'pointer',
            color: '#007bff'
          }}
        >
          <SendHorizonal size={24} />
        </button>
      </div>
    </div>
  );
};

export default ChatBot;


// import { useNavigate } from 'react-router-dom';
// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { SendHorizonal } from 'lucide-react';

// const ChatBot = () => {
//   const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
//   const navigate = useNavigate();

//   const [deviceId] = useState(() => {
//     const id = localStorage.getItem('deviceId') || Math.random().toString(36).substring(2);
//     localStorage.setItem('deviceId', id);
//     return id;
//   });

//   const [messages, setMessages] = useState([]);
//   const [userInput, setUserInput] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const chatWindowRef = useRef(null);

//   useEffect(() => {
//     axios.post(`${BACKEND_URL}/api/chat`, { deviceId, message: '' })
//       .then(response => addMessage('bot', response.data.response))
//       .catch(error => {
//         console.error(error);
//         addMessage('bot', 'Error fetching chat options.');
//       });
//   }, [deviceId, BACKEND_URL]);

//   useEffect(() => {
//     chatWindowRef.current?.scrollTo(0, chatWindowRef.current.scrollHeight);
//   }, [messages]);

//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const reference = params.get('reference');

//     if (reference) {
//       axios.get(`${BACKEND_URL}/payment/verify?reference=${reference}`)
//         .then((res) => {
//           if (res.data.success) {
//             addMessage('bot', 'Payment verified successfully! Redirecting to homepage...');
//             setTimeout(() => navigate('/'), 3000); // Redirect after 3 seconds
//           }else{
//             addMessage('bot', 'Payment verification failed. Please contact support.');
//           }
//         })
//         .catch(() => {
//           // Display an error message in case of failure
//           addMessage('bot', 'Payment verification failed. Please contact support.');
//         })
//         .finally(() => {
//           // Clean URL by removing query parameters
//           window.history.replaceState({}, document.title, window.location.pathname);
//         });
//     }
//   }, [BACKEND_URL, navigate]);

//   const addMessage = (sender, text) => {
//     setMessages(prev => [...prev, { sender, text }]);
//   };

//   const handleSend = async () => {
//     const message = userInput.trim();
//     if (!message) {
//       return;
//     }
//     addMessage('user', message);
//     setUserInput('');
//     setIsTyping(true);

//     try {
//       const response = await axios.post(`${BACKEND_URL}/api/order`, { deviceId, message });
//       addMessage('bot', response.data.response);
//     } catch (error) {
//       console.error(error);
//       addMessage('bot', 'There was an error processing your request.');
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   return (
//     <div className="chatbot-container">
//       <div className="chatbot-window" ref={chatWindowRef}>
//         {messages.map((msg, index) => (
//           <div key={index} className={`message ${msg.sender}`}>
//             {msg.text}
//           </div>
//         ))}
//         {isTyping && <div className="typing-indicator">Chatbot is typing...</div>}
//       </div>
//       <input 
//         value={userInput} 
//         onChange={(e) => setUserInput(e.target.value)} 
//         placeholder="Type a message..." 
//       />
//       <button onClick={handleSend}>Send</button>
//     </div>
//   );
// };

// export default ChatBot;



// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { SendHorizonal } from 'lucide-react';

// const ChatBot = () => {
//   // Use the backend URL from environment variables
//   const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

//   const [deviceId] = useState(() => {
//     const id = localStorage.getItem('deviceId') || Math.random().toString(36).substring(2);
//     localStorage.setItem('deviceId', id);
//     return id;
//   });

//   const [messages, setMessages] = useState([]);
//   const [userInput, setUserInput] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const chatWindowRef = useRef(null);

//   // Fetch initial chat options
//   useEffect(() => {
//     axios.post(`${BACKEND_URL}/api/chat`, { deviceId, message: '' })
//       .then(response => addMessage('bot', response.data.response))
//       .catch(error => {
//         console.error(error);
//         addMessage('bot', 'Error fetching chat options.');
//       });
//   }, [deviceId, BACKEND_URL]);

//   // Scroll chat to bottom on new messages
//   useEffect(() => {
//     chatWindowRef.current?.scrollTo(0, chatWindowRef.current.scrollHeight);
//   }, [messages]);

//   // Handle Paystack redirect verification
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const reference = params.get('reference');

//     if (reference) {
//       axios.get(`${BACKEND_URL}/payment/verify?reference=${reference}`)
//         .then(() => {
//           addMessage('bot', 'Payment successful! Thank you for your order.');
//         })
//         .catch(() => {
//           addMessage('bot', 'Payment verification failed. Please contact support.');
//         })
//         .finally(() => {
//           window.history.replaceState({}, document.title, window.location.pathname);
//         });
//     }
//   }, [BACKEND_URL]);

//   // Add chat message
//   const addMessage = (sender, text) => {
//     setMessages(prev => [...prev, { sender, text }]);
//   };

//   // Handle message send
//   const handleSend = async (optionValue = null) => {
//     const message = optionValue ?? userInput.trim();
//     if (!message) {
//       return;
//     }

//     addMessage('user', message);
//     setUserInput('');
//     setIsTyping(true);

//     const requestBody = {
//       deviceId,
//       option: Number(message),
//       payload: {}
//     };

//     try {
//       const response = await axios.post(`${BACKEND_URL}/api/order`, requestBody);
//       addMessage('bot', response.data.response);
//     } catch (error) {
//       console.error(error);
//       addMessage('bot', 'There was an error processing your request.');
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     handleSend();
//   };

//   return (
//     <div className="chatbot-container" style={{ fontFamily: 'Arial, sans-serif' }}>
//       <div className="chatbot-window"
//         style={{
//           border: '1px solid #ddd',
//           borderRadius: '12px',
//           padding: '16px',
//           width: '400px',
//           height: '500px',
//           overflowY: 'auto',
//           background: '#f9f9f9'
//         }}
//         ref={chatWindowRef}
//       >
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             style={{
//               display: 'flex',
//               justifyContent: msg.sender === 'bot' ? 'flex-start' : 'flex-end',
//               margin: '8px 0'
//             }}
//           >
//             <div
//               style={{
//                 background: msg.sender === 'bot' ? '#fff' : '#007bff',
//                 color: msg.sender === 'bot' ? '#000' : '#fff',
//                 padding: '10px 14px',
//                 borderRadius: '18px',
//                 maxWidth: '75%'
//               }}
//             >
//               {msg.text}
//             </div>
//           </div>
//         ))}

//         {isTyping && (
//           <div style={{ fontStyle: 'italic', color: '#888', marginTop: '5px' }}>Chatbot is typing...</div>
//         )}
//       </div>

//       <form onSubmit={handleSubmit} style={{ display: 'flex', marginTop: '10px', alignItems: 'center' }}>
//         <input
//           type="text"
//           value={userInput}
//           onChange={(e) => setUserInput(e.target.value)}
//           placeholder="Type a message..."
//           style={{
//             flex: 1,
//             padding: '10px 12px',
//             borderRadius: '20px',
//             border: '1px solid #ccc'
//           }}
//         />
//         <button
//           type="submit"
//           style={{
//             background: 'transparent',
//             border: 'none',
//             marginLeft: '10px',
//             cursor: 'pointer',
//             color: '#007bff'
//           }}
//         >
//           <SendHorizonal size={24} />
//         </button>
//       </form>

//       {/* Quick reply buttons */}
//       <div style={{ marginTop: '10px' }}>
//         {['Track my order', 'Order food', 'Check status'].map((option, index) => (
//           <button
//             key={index}
//             onClick={() => handleSend(index + 1)}
//             style={{
//               margin: '5px 5px 0 0',
//               background: '#007bff',
//               color: '#fff',
//               border: 'none',
//               padding: '10px 14px',
//               borderRadius: '20px',
//               cursor: 'pointer',
//               fontSize: '14px'
//             }}
//           >
//             {option}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default ChatBot;


