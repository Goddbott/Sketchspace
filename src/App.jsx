import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CanvasPage from './pages/CanvasPage';

function AppLayout() {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  let activePage = 'Landing';
  if (location.pathname.startsWith('/dashboard')) activePage = 'Dashboard';
  if (location.pathname.startsWith('/canvas')) activePage = 'Canvas';

  const tabs = ['Landing', 'Canvas', 'Dashboard'];

  const handleTabClick = (tab) => {
    if (tab === 'Landing') navigate('/');
    if (tab === 'Dashboard') navigate('/dashboard');
    // If clicking canvas directly from tabs without ID, it will redirect to / which redirects to a new canvas
    if (tab === 'Canvas') navigate('/');
  };

  return (
    <div className={`w-screen h-screen overflow-hidden flex relative font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-900'} p-3 sm:p-2`}>
      
      {/* Global Navigation Tab Bar (Moved to bottom right to avoid conflicts) */}
      <div className="absolute bottom-6 right-6 z-50 flex bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 p-1 pointer-events-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activePage === tab
                ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
          >
            {tab}
          </button>
        ))}
        <div className="w-px h-6 bg-gray-200 my-auto mx-2"></div>
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl text-gray-500 hover:bg-gray-100/50 transition-colors"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden rounded-2xl shadow-xl shadow-black/5 bg-white border border-gray-200/50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/canvas/:canvasId" element={<CanvasPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}
