import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import SignUpPage from '../pages/SignUpPage';
import ExtractPage from '../pages/ExtractPage';
import AnalysisPage from '../pages/AnalysisPage';
import TrackerPage from '../pages/TrackerPage';
import HomePage from '../pages/HomePage';
import '../styles/App.css';

function App() {
  return (
    <AuthProvider>
      <main className="container">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/upload" element={
            <ProtectedRoute>
              <ExtractPage />
            </ProtectedRoute>
          } />
          <Route path="/analysis" element={
            <ProtectedRoute>
              <AnalysisPage />
            </ProtectedRoute>
          } />
          <Route path="/tracker" element={
            <ProtectedRoute>
              <TrackerPage />
            </ProtectedRoute>
          } />
          <Route path="/home" element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
    </AuthProvider>
  );
}

export default App;
