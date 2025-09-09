import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import SignUpPage from '../pages/SignUpPage';
import ExtractPage from '../pages/ExtractPage';
import AnalysisPage from '../pages/AnalysisPage';
import TrackerPage from '../pages/TrackerPage';
import HomePage from '../pages/HomePage';
import '../styles/App.css';

function App() {
  return (
    <>
      <main className="container">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/upload" element={<ExtractPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/tracker" element={<TrackerPage />} />
          <Route path="/home" element={<HomePage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
