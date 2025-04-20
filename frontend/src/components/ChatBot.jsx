import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { SendHorizonal } from 'lucide-react';

const ChatBot = () => {
  const [deviceId] = useState(() => {
    const id = localStorage.getItem('deviceId') || Math.random().toString(36).substring(2);
    localStorage.setItem('deviceId', id);
    return id;
  });

  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatWindowRef = useRef(null);

  //  Fetch initial chat options
  useEffect(() => {
    axios.post('http://localhost:3001/api/chat', { deviceId, message: '' })
      .then(response => addMessage('bot', response.data.response))
      .catch(error => {
        console.error(error);
        addMessage('bot', 'Error fetching chat options.');
      });
  }, [deviceId]);

  // Scroll chat to bottom on new messages
  useEffect(() => {
    chatWindowRef.current?.scrollTo(0, chatWindowRef.current.scrollHeight);
  }, [messages]);

  //  Handle Paystack redirect verification
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('reference');

    if (reference) {
      axios.get(`http://localhost:3001/payment/verify?reference=${reference}`)
        .then(() => {
          addMessage('bot', 'Payment successful! Thank you for your order.');
        })
        .catch(() => {
          addMessage('bot', 'Payment verification failed. Please contact support.');
        })
        .finally(() => {
          window.history.replaceState({}, document.title, window.location.pathname);
        });
    }
  }, []);

  // Add chat message
  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text }]);
  };

  // Handle message send
  const handleSend = async (optionValue = null) => {
    const message = optionValue ?? userInput.trim();
    if (!message) {
      return;
    }

    addMessage('user', message);
    setUserInput('');
    setIsTyping(true);

    const requestBody = {
      deviceId,
      option: Number(message),
      payload: {}
    };

    try {
      const response = await axios.post('http://localhost:3001/api/order', requestBody);
      addMessage('bot', response.data.response);
    } catch (error) {
      console.error(error);
      addMessage('bot', 'There was an error processing your request.');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  return (
    <div className="chatbot-container" style={{ fontFamily: 'Arial, sans-serif' }}>
      <div className="chatbot-window"
        style={{
          border: '1px solid #ddd',
          borderRadius: '12px',
          padding: '16px',
          width: '400px',
          height: '500px',
          overflowY: 'auto',
          background: '#f9f9f9'
        }}
        ref={chatWindowRef}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              justifyContent: msg.sender === 'bot' ? 'flex-start' : 'flex-end',
              margin: '8px 0'
            }}
          >
            <div
              style={{
                background: msg.sender === 'bot' ? '#fff' : '#007bff',
                color: msg.sender === 'bot' ? '#000' : '#fff',
                padding: '10px 14px',
                borderRadius: '18px',
                maxWidth: '75%'
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div style={{ fontStyle: 'italic', color: '#888', marginTop: '5px' }}>Chatbot is typing...</div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', marginTop: '10px', alignItems: 'center' }}>
        <input
          type="text"
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
          type="submit"
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
      </form>

      {/* Quick reply buttons */}
      <div style={{ marginTop: '10px' }}>
        {['Track my order', 'Order food', 'Check status'].map((option, index) => (
          <button
            key={index}
            onClick={() => handleSend(index + 1)}
            style={{
              margin: '5px 5px 0 0',
              background: '#007bff',
              color: '#fff',
              border: 'none',
              padding: '10px 14px',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatBot;


// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import { SendHorizonal } from 'lucide-react';

// const ChatBot = () => {
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
//     axios.post('http://localhost:3001/api/chat', { deviceId, message: '' })
//       .then(response => addMessage('bot', response.data.response))
//       .catch(error => {
//         console.error(error);
//         addMessage('bot', 'Error fetching chat options.');
//       });
//   }, [deviceId]);

//   useEffect(() => {
//     chatWindowRef.current?.scrollTo(0, chatWindowRef.current.scrollHeight);
//   }, [messages]);

//   const addMessage = (sender, text) => {
//     setMessages(prev => [...prev, { sender, text }]);
//   };

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
//       const response = await axios.post('http://localhost:3001/api/order', requestBody);
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


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ChatBot = () => {
//   // Persist a unique device ID in localStorage for session management.
//   const [deviceId] = useState(() => {
//     const id = localStorage.getItem('deviceId') || Math.random().toString(36).substring(2);
//     localStorage.setItem('deviceId', id);
//     return id;
//   });

//   const [messages, setMessages] = useState([]);
//   const [userInput, setUserInput] = useState('');

//   // Fetch initial chat options on component mount.
//   useEffect(() => {
//     axios.post('http://localhost:3001/api/chat', { deviceId, message: '' })
//       .then(response => addMessage('bot', response.data.response))
//       .catch(error => {
//         console.error(error);
//         addMessage('bot', 'Error fetching chat options.');
//       });
//   }, [deviceId]);

//   const addMessage = (sender, text) => {
//     setMessages(prev => [...prev, { sender, text }]);
//   };

//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!userInput.trim()) {
//       return;
//     }

//     // Display user's message.
//     addMessage('user', userInput);

//     // Construct request body:
//     const requestBody = {
//       deviceId,
//       option: Number(userInput.trim()),
//       payload: {} // For commands like payment or scheduling, include extra data here.
//     };

//     try {
//       const response = await axios.post('http://localhost:3001/api/order', requestBody);
//       addMessage('bot', response.data.response);
//     } catch (error) {
//       console.error(error);
//       addMessage('bot', 'There was an error processing your request.');
//     }
    
//     setUserInput('');
//   };

//   return (
//     <div className="chatbot-container">
//       <div className="chatbot-window" style={{ border: '1px solid #ccc', padding: '10px', width: '400px', height: '500px', overflowY: 'scroll' }}>
//         {messages.map((msg, index) => (
//           <div key={index} style={{ textAlign: msg.sender === 'bot' ? 'left' : 'right', margin: '10px 0' }}>
//             <strong>{msg.sender === 'bot' ? 'Chatbot' : 'You'}:</strong> {msg.text}
//           </div>
//         ))}
//       </div>
//       <form onSubmit={handleSendMessage} style={{ marginTop: '10px', display: 'flex' }}>
//         <input 
//           type="text"
//           value={userInput}
//           onChange={(e) => setUserInput(e.target.value)}
//           placeholder="Enter option..."
//           style={{ flex: 1, padding: '10px' }}
//         />
//         <button type="submit" style={{ padding: '10px 20px', marginLeft: '5px' }}>Send</button>
//       </form>
//     </div>
//   );
// };

// export default ChatBot;





// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ChatBot = () => {
//   // Persist a unique device ID in localStorage for session management.
//   const [deviceId] = useState(() => {
//     const id = localStorage.getItem('deviceId') || Math.random().toString(36).substring(2);
//     localStorage.setItem('deviceId', id);
//     return id;
//   });

//   const [messages, setMessages] = useState([]);
//   const [userInput, setUserInput] = useState('');

//   // Helper to add messages to the chat window
//   const addMessage = (sender, text) => {
//     setMessages(prev => [...prev, { sender, text }]);
//   };

//   // On mount: fetch initial chat options
//   useEffect(() => {
//     axios.post('http://localhost:3001/api/chat', { deviceId, message: '' })
//       .then(response => addMessage('bot', response.data.response))
//       .catch(error => {
//         console.error(error);
//         addMessage('bot', 'Error fetching chat options.');
//       });
//   }, [deviceId]);

//   // On mount: check for Paystack redirect reference in URL
//   useEffect(() => {
//     const params = new URLSearchParams(window.location.search);
//     const reference = params.get('reference');
//     if (reference) {
//       // Verify payment with the backend
//       axios.get(`https://a4ac-102-219-152-21.ngrok-free.app/payment/verify?reference=${reference}`)
//         .then(() => {
//           addMessage('bot', '✅ Payment successful! Thank you for your order.');
//         })
//         .catch(() => {
//           addMessage('bot', '⚠️ Payment verification failed. Please contact support.');
//         })
//         .finally(() => {
//           // Remove the query param so it doesn't re‑fire on refresh
//           window.history.replaceState({}, document.title, window.location.pathname);
//         });
//     }
//   }, []);

//   // Handle user sending a message
//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!userInput.trim()) {
//       return;
//     }

//     // Display user's message
//     addMessage('user', userInput);

//     // Construct request body for command
//     const requestBody = {
//       deviceId,
//       option: Number(userInput.trim()),
//       payload: {}
//     };

//     try {
//       const response = await axios.post('http://localhost:3001/api/order', requestBody);
//       addMessage('bot', response.data.response);
//     } catch (error) {
//       console.error(error);
//       addMessage('bot', 'There was an error processing your request.');
//     }

//     setUserInput('');
//   };

//   return (
//     <div className="chatbot-container">
//       <div
//         className="chatbot-window"
//         style={{
//           border: '1px solid #ccc',
//           padding: '10px',
//           width: '400px',
//           height: '500px',
//           overflowY: 'scroll'
//         }}
//       >
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             style={{
//               textAlign: msg.sender === 'bot' ? 'left' : 'right',
//               margin: '10px 0'
//             }}
//           >
//             <strong>{msg.sender === 'bot' ? 'Chatbot' : 'You'}:</strong> {msg.text}
//           </div>
//         ))}
//       </div>
//       <form onSubmit={handleSendMessage} style={{ marginTop: '10px', display: 'flex' }}>
//         <input
//           type="text"
//           value={userInput}
//           onChange={(e) => setUserInput(e.target.value)}
//           placeholder="Enter option..."
//           style={{ flex: 1, padding: '10px' }}
//         />
//         <button type="submit" style={{ padding: '10px 20px', marginLeft: '5px' }}>
//           Send
//         </button>
//       </form>
//     </div>
//   );
// };

// export default ChatBot;



