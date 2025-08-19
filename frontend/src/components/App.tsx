import React, { useState, useEffect } from 'react';
import '../styles/App.css';

function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Test connection to backend (runs on port 3000)
    fetch('http://localhost:3000')
      .then(res => res.json())
      .then(data => {
        setMessage(data.message);
        setLoading(false);
      })
      .catch(err => {
        setMessage('Backend not connected - make sure backend is running on port 3000');
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>TiDB Hackathon Project</h1>
        <p>
          {loading ? 'Connecting to backend...' : message}
        </p>
        <div style={{ marginTop: '20px' }}>
          <p>Frontend: ✅ React with TypeScript (port 3001)</p>
          <p>Backend: {loading ? '⏳' : message.includes('TiDB') ? '✅' : '❌'} Express.js API (port 3000)</p>
        </div>
      </header>
    </div>
  );
}

export default App;
