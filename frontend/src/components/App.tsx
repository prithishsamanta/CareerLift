import React from 'react';
import { Routes, Route } from 'react-router-dom';
import UploadPage from '../pages/UploadPage';
import AnalysisPage from '../pages/AnalysisPage';
import TrackerPage from '../pages/TrackerPage';
import '../styles/App.css';

function App() {
  return (
    <>
      <main className="container">
        <Routes>
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/tracker" element={<TrackerPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
