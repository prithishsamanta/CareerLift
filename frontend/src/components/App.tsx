import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AnalysisPage from '../pages/AnalysisPage';
import '../styles/App.css';

function App() {
  return (
    <>
      <main className="container">
        <Routes>
          <Route path="/analysis" element={<AnalysisPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
