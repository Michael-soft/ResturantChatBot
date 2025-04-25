import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ChatBot from './components/ChatBot';
import PaymentPage from './components/PaymentPage';
import PaymentSuccess from './components/PaymentSuccess';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <>
              <h2>Restaurant Chatbot</h2>
              <ChatBot />
            </>
          } />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import './App.css';
// import ChatBot from './components/ChatBot';
// import PaymentPage from './components/PaymentPage';
// import PaymentSuccess  from './components/PaymentSuccess';

// function App() {
//   return (
//     <Router>
//       <div className="App" style={{ padding: '20px' }}>
//         <Routes>
//           <Route path="/" element={
//             <>
//               <h2>Restaurant Chatbot</h2>
//               <ChatBot />
//             </>
//           } />
//           <Route path="/payment" element={<PaymentPage />} />
//           <Route path="/payment/verify" element={<ChatBot />} />
//           <Route path="/payment-success" element={<PaymentSuccess/>} />
//         </Routes>
//       </div>
//     </Router>
//   );
// }

// export default App;
