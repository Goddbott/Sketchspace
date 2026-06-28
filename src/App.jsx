import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Moon, Menu, ChevronRight } from 'lucide-react';

import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CanvasPage from './pages/CanvasPage';
import AuthPage from './pages/AuthPage';
import { AuthProvider, useAuth } from './lib/AuthContext';

function AppLayout() {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className={`w-screen h-screen overflow-hidden flex relative font-sans transition-colors duration-300 ${darkMode ? 'dark bg-gray-800' : 'bg-gray-900'} p-3 sm:p-2`}>
      
      {/* Global Navigation Tab Bar (Moved to bottom right to avoid conflicts) */}

      <div className="absolute bottom-6 right-6 z-50 flex bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-800 p-1 pointer-events-auto transition-all duration-300">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>


      <div className="flex-1 flex overflow-hidden rounded-[30px] shadow-2xl bg-white dark:bg-gray-950 relative transition-colors duration-300">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/canvas/:canvasId" element={<CanvasPage darkMode={darkMode} />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout />
      </Router>
    </AuthProvider>
  );
}
