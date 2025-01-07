import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import CodeViewPage from "./pages/CodeViewPage";

function App() { 
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/code/:query" element={<CodeViewPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
