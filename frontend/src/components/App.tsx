import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ExtractPage from '../pages/ExtractPage';
import LoginPage from '../pages/LoginPage';
import SignUpPage from '../pages/SignUpPage';
import UploadPage from '../pages/UploadPage';
import AnalysisPage from '../pages/AnalysisPage';
import TrackerPage from '../pages/TrackerPage';
import '../styles/App.css';

function App() {
  return (
    <>
      <main className="container">
        <Routes>
          extract-resume-information
          <Route path="/extract" element={<ExtractPage />} />
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/tracker" element={<TrackerPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
