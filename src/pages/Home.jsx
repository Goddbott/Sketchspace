import React from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { ArrowRight, PenTool } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartDrawing = () => {
    const newId = uuidv4();
    navigate(`/canvas/${newId}?new=true`);
  };

  return (
    <div className="flex-1 w-full h-full relative flex flex-col items-center justify-center overflow-hidden bg-gray-50">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-400/20 blur-[120px] pointer-events-none"></div>

      {/* Main Content */}
      <div className="relative z-10 text-center max-w-2xl px-6 flex flex-col items-center">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-3xl flex items-center justify-center shadow-xl shadow-blue-500/20 mb-8 transform hover:scale-105 transition-transform">
          <span className="text-4xl text-white drop-shadow-md">🥽</span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
          Think, draw, and <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">collaborate.</span>
        </h1>
        
        <p className="text-lg sm:text-xl text-gray-500 mb-10 max-w-xl mx-auto font-medium">
          The infinitely expanding whiteboard for your ideas. Start drawing instantly, no sign-up required.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button
            onClick={handleStartDrawing}
            className="group relative flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold text-lg shadow-xl transition-all hover:-translate-y-1 w-full sm:w-auto overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <PenTool size={20} className="relative z-10" />
            <span className="relative z-10">Start Drawing</span>
          </button>
          
          {!user && (
            <button
              onClick={() => navigate('/auth')}
              className="group flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-2xl font-bold text-lg shadow-sm transition-all w-full sm:w-auto"
            >
              Sign In <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
