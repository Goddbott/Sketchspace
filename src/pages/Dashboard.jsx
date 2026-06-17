import React from 'react';
import { Search, Folder, Clock, FileText, Share2, Plus, LayoutGrid, LogOut, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex bg-white overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col p-4">
        <div className="flex items-center gap-2 font-bold text-xl text-gray-900 mb-8 px-2">
          <span className="text-2xl">🥽</span> SketchSpace
        </div>
        
        <button onClick={() => navigate('/canvas/new')} className="w-full bg-blue-500 text-white rounded-xl py-2.5 px-4 font-medium flex items-center justify-center gap-2 hover:bg-blue-600 shadow-sm shadow-blue-500/20 mb-6">
          <Plus size={18} /> New Canvas
        </button>

        <div className="flex-1 flex flex-col gap-1">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-4">Overview</div>
          <button className="flex items-center gap-3 px-3 py-2 bg-gray-200 text-gray-900 font-medium rounded-lg">
            <LayoutGrid size={18} className="text-gray-500" /> All Canvases
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100">
            <Clock size={18} className="text-gray-400" /> Recent
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100">
            <Share2 size={18} className="text-gray-400" /> Shared with me
          </button>

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-6 flex justify-between items-center">
            Folders <button className="hover:text-blue-500"><Plus size={14} /></button>
          </div>
          <button className="flex items-center gap-3 px-3 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100">
            <Folder size={18} className="text-blue-400" /> AP Calculus
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100">
            <Folder size={18} className="text-yellow-400" /> Group Project
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-gray-600 font-medium rounded-lg hover:bg-gray-100">
            <Folder size={18} className="text-green-400" /> Personal Notes
          </button>
        </div>

        <div className="mt-auto border-t border-gray-200 pt-4 flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm">JS</div>
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-semibold truncate text-gray-900">John Smith</div>
            <div className="text-xs text-gray-500 truncate">Free Plan</div>
          </div>
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-red-500"><LogOut size={16} /></button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Top Header */}
        <div className="h-16 border-b border-gray-100 flex items-center px-8 justify-between">
          <h2 className="font-bold text-xl text-gray-800">All Canvases</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" placeholder="Search canvases..." className="w-full bg-gray-50 border border-gray-200 rounded-xl py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
        </div>

        {/* Canvas Grid */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-3 gap-6">
            
            {/* Canvas Card 1 */}
            <div className="group border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/canvas/math-101')}>
              <div className="h-32 bg-gray-50 canvas-grid relative border-b border-gray-100 p-4">
                {/* Mock thumbnail contents */}
                <div className="absolute top-4 left-4 bg-white border border-blue-200 rounded p-1 text-[10px] text-blue-600">y = x^2</div>
                <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-yellow-100 opacity-50"></div>
                
                {/* Overlay actions on hover */}
                <div className="absolute inset-0 bg-gray-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-white text-gray-700 font-medium px-4 py-1.5 rounded-lg shadow-sm text-sm hover:text-blue-500">Open</button>
                </div>
              </div>
              <div className="p-4 bg-white">
                <h3 className="font-semibold text-gray-900 mb-1">Math 101 Notes</h3>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Edited 2 hrs ago</span>
                  <div className="flex items-center gap-1"><Users size={12}/> 3</div>
                </div>
              </div>
            </div>

            {/* Canvas Card 2 */}
            <div className="group border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/canvas/sprint-planning')}>
              <div className="h-32 bg-gray-50 canvas-grid relative border-b border-gray-100 p-4">
                <div className="flex gap-2">
                  <div className="w-12 h-16 bg-yellow-100 shadow-sm rounded-sm"></div>
                  <div className="w-12 h-16 bg-green-100 shadow-sm rounded-sm rotate-6"></div>
                </div>
              </div>
              <div className="p-4 bg-white">
                <h3 className="font-semibold text-gray-900 mb-1">Sprint Planning</h3>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Edited yesterday</span>
                  <div className="flex items-center gap-1"><Users size={12}/> 5</div>
                </div>
              </div>
            </div>

            {/* Canvas Card 3 */}
            <div className="group border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer">
              <div className="h-32 bg-gray-50 flex items-center justify-center text-gray-300 relative border-b border-gray-100">
                <FileText size={32} />
              </div>
              <div className="p-4 bg-white">
                <h3 className="font-semibold text-gray-900 mb-1">Untitled Canvas</h3>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Edited 3 days ago</span>
                  <div className="flex items-center gap-1"><Users size={12}/> 1</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
