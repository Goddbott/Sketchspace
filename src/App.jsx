import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CanvasPage from './pages/CanvasPage';

function AppLayout() {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Parse path to simulate "activePage" from mockup for the top tab bar
  let activePage = 'Landing';
  if (location.pathname.startsWith('/dashboard')) activePage = 'Dashboard';
  if (location.pathname.startsWith('/canvas')) activePage = 'Canvas';

  const tabs = ['Landing', 'Canvas', 'Dashboard'];

  const handleTabClick = (tab) => {
    if (tab === 'Landing') navigate('/');
    if (tab === 'Dashboard') navigate('/dashboard');
    if (tab === 'Canvas') navigate('/canvas/new');
  };

  return (
    <div className={`w-screen h-screen overflow-hidden flex relative font-sans transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-900'} p-3 sm:p-2`}>
      
      {/* Global Navigation Tab Bar (Moved to bottom right to avoid conflicts) */}
      <div className="absolute bottom-8 right-8 flex items-center gap-1 bg-white p-1.5 rounded-2xl shadow-md border border-gray-200 z-[60]">
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => handleTabClick(tab)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-colors ${activePage === tab ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            {tab}
          </button>
        ))}
        <div className="w-px h-4 bg-gray-300 mx-2"></div>
        <button onClick={() => setDarkMode(!darkMode)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-xl mr-1">
          {darkMode ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      {/* App Container Frame (Full Screen with curved inner bezel) */}
      <div className={`w-full h-full flex relative overflow-hidden rounded-3xl bg-white shadow-2xl`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/canvas/:id" element={<CanvasPage page="Canvas" setPage={() => {}} />} />
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
