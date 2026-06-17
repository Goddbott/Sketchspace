import React from 'react';
import { Layers, Users, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

export default function Home() {
  const navigate = useNavigate();

  const handleStartFree = () => {
    const newCanvasId = uuidv4();
    navigate(`/canvas/${newCanvasId}`);
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-y-auto">
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
          <span className="text-2xl">🥽</span> SketchSpace
        </div>
        <div className="flex items-center gap-8 text-sm font-medium text-gray-600">
          <button className="hover:text-blue-500">Features</button>
          <button className="hover:text-blue-500">Pricing</button>
          <button className="hover:text-blue-500">About</button>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-gray-600 hover:text-blue-500">Login</button>
          <button onClick={handleStartFree} className="bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-600">Start Free</button>
        </div>
      </nav>
      <div className="flex-1 flex flex-col items-center pt-16 px-8 text-center relative">
        <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tight">The whiteboard for everyone</h1>
        <p className="text-xl text-gray-500 mb-8 max-w-2xl">Teach, collaborate, and brainstorm in real time — free forever</p>
        <div className="flex gap-4 mb-8">
          <button onClick={handleStartFree} className="bg-blue-500 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-600 shadow-sm shadow-blue-500/30">Start Drawing Free</button>
          <button onClick={handleStartFree} className="bg-white border border-gray-200 text-gray-700 px-8 py-3 rounded-xl font-medium hover:bg-gray-50 shadow-sm">See How It Works</button>
        </div>
        <div className="flex items-center gap-3 mb-16">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs">👨‍🏫</div>
            <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-xs">👩‍🎓</div>
            <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-xs">🧑‍💻</div>
            <div className="w-8 h-8 rounded-full bg-yellow-100 border-2 border-white flex items-center justify-center text-xs">👩‍🎨</div>
          </div>
          <span className="text-sm text-gray-500 font-medium">10,000+ students and teachers</span>
        </div>
        
        {/* Hero Visual Preview */}
        <div className="w-full max-w-4xl h-64 bg-white rounded-t-3xl border-t border-l border-r border-gray-200 shadow-2xl relative overflow-hidden canvas-grid">
          <div className="absolute top-8 left-8 bg-[#EDE9FE] px-3 py-2 rounded-xl text-xs shadow-sm">Solve an Equation: 2x + 5</div>
          <div className="absolute top-20 left-12 bg-white border border-blue-400 p-3 rounded-xl shadow-sm text-center">
            <div className="font-bold text-sm">2X + 5 = 11</div>
          </div>
          <div className="absolute top-10 right-20 bg-[#FEF3C7] p-3 shadow-sm rotate-3 font-medium text-xs rounded-sm">Don't forget homework</div>
        </div>
      </div>
      <div className="bg-gray-50 py-16 px-8 border-t border-gray-100">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-xl flex items-center justify-center mb-4"><Layers /></div>
            <h3 className="font-bold text-gray-900 mb-2">∞ Infinite Canvas</h3>
            <p className="text-sm text-gray-500">Unlimited space for ideas</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-xl flex items-center justify-center mb-4"><Users /></div>
            <h3 className="font-bold text-gray-900 mb-2">👥 Real-time Collab</h3>
            <p className="text-sm text-gray-500">Draw together, instantly</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-xl flex items-center justify-center mb-4"><Zap /></div>
            <h3 className="font-bold text-gray-900 mb-2">🤖 AI Powered</h3>
            <p className="text-sm text-gray-500">Ask questions, get answers on canvas</p>
          </div>
        </div>
      </div>
    </div>
  );
}
