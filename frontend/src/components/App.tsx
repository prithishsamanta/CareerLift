import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "./Header";
import HomePage from "../pages/HomePage";
import AnalysisPage from "../pages/AnalysisPage";
import TrackerPage from "../pages/TrackerPage";
import "../styles/App.css";

function App() {
  return (
    <>
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/tracker" element={<TrackerPage />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
