import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import ChatBot from './components/ChatBot';
import PaymentPage from './components/PaymentPage';

function App() {
  return (
    <Router>
      <div className="App" style={{ padding: '20px' }}>
        <Routes>
          <Route path="/" element={
            <>
              <h2>Restaurant Chatbot</h2>
              <ChatBot />
            </>
          } />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment/verify" element={<ChatBot />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
