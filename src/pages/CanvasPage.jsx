import React, { useState } from 'react';
import { Tldraw } from 'tldraw';
import 'tldraw/tldraw.css';
import {
  Home, File, Folder, Plus, Table, LineChart, Shapes, Grid, SquareFunction,
  Hand, Mic, ArrowUp, RefreshCw, Trash2, X, ChevronDown, Check, MousePointer2,
  Pen, Type, Sigma, Image as ImageIcon, Code, FileText, MessageSquare, Eraser,
  Users, Clock, ThumbsUp, ThumbsDown, Star, MoreVertical, LogOut, Sun, Moon,
  MonitorPlay, Lock, Zap, FileSpreadsheet, Layers
} from 'lucide-react';



const MainCanvas = ({ page, setPage }) => {
  const [zoom, setZoom] = useState(100);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: 'ai', text: 'Hey Alex! What would you like to work on today?', avatar: '🤖' },
    { id: 2, sender: 'user', text: 'Solve an Equation: 2x + 5', avatar: '🧑' }
  ]);
  const [equationValue, setEquationValue] = useState('2x + 5');
  const [isSolved, setIsSolved] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(page === 'Canvas');
  const [activeTab, setActiveTab] = useState('Chat');
  const [activeTool, setActiveTool] = useState('Select');
  const [pollResults, setPollResults] = useState({ yes: 70, no: 30 });
  const [teachingToggles, setTeachingToggles] = useState({ lock: false, spotlight: false, broadcast: false });

  const isTeaching = page === 'Teaching Mode';
  const isComments = page === 'Comments';
  const isExport = page === 'Export';

  // Open right panel appropriately based on page
  React.useEffect(() => {
    if (isComments) {
      setRightPanelOpen(true);
      setActiveTab('Comments');
    }
  }, [isComments]);

  const handleSolve = () => {
    setIsSolved(true);
  };

  const handleSend = () => {
    if (!chatInput.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'user', text: chatInput, avatar: '🧑' }]);
    setChatInput('');
  };

  const handleVote = (type) => {
    if (type === 'yes') setPollResults({ yes: 75, no: 25 });
    else setPollResults({ yes: 65, no: 35 });
  };

  const tools = [
    { id: 'Select', icon: MousePointer2 }, { id: 'Pen', icon: Pen },
    { id: 'Shapes', icon: Shapes }, { id: 'Text', icon: Type },
    { id: 'Equation', icon: Sigma }, { id: 'Graph', icon: LineChart },
    { id: 'Sticky', icon: FileText }, { id: 'Image', icon: ImageIcon },
    { id: 'Code', icon: Code }, { id: 'Doc', icon: FileSpreadsheet },
    { id: 'Comment', icon: MessageSquare }, { id: 'Eraser', icon: Eraser }
  ];

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
      {/* Left Sidebar (Icon only) */}
      <div className="absolute top-0 left-0 w-14 h-full border-r border-gray-200 bg-white z-40 flex flex-col items-center py-4">
        <div className="text-xl mb-6">🥽</div>
        <div className="flex flex-col gap-6 w-full items-center text-gray-400">
          <button onClick={() => setPage('Dashboard')} className="hover:text-blue-500"><Home size={20} /></button>
          <button className="hover:text-blue-500"><File size={20} /></button>
          <button className="hover:text-blue-500"><Folder size={20} /></button>
        </div>
        <div className="mt-auto relative">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold text-xs">AL</div>
          <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#4CAF7D] rounded-full border-2 border-white"></div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 ml-14 relative bg-white overflow-hidden">
        
        {/* Tldraw Infinite Canvas Component */}
        <div className="absolute inset-0 z-0">
          <Tldraw hideUi={true} />
        </div>
        
        {/* Heatmap Overlay */}
        {isTeaching && teachingToggles.spotlight && (
          <div className="absolute inset-0 bg-red-500/5 pointer-events-none z-10 mix-blend-multiply"></div>
        )}

        {/* Top Bar (Floating) */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-sm border border-gray-200 px-4 py-2 flex items-center gap-4 z-30">
          <div className="text-lg">🥽</div>
          {isTeaching && <div className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Teaching Mode</div>}
          <input type="text" defaultValue="Untitled Canvas" className="font-semibold text-gray-800 outline-none w-32 bg-transparent text-sm" />
          <div className="w-px h-6 bg-gray-200"></div>
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-purple-100 border border-white flex items-center justify-center text-[10px]">PR</div>
            <div className="w-6 h-6 rounded-full bg-green-100 border border-white flex items-center justify-center text-[10px]">JS</div>
            <div className="w-6 h-6 rounded-full bg-orange-100 border border-white flex items-center justify-center text-[10px]">+3</div>
          </div>
          <button className="bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-blue-600 shadow-sm">Share</button>
          <button className="border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 shadow-sm">Sign up to save</button>
          <button onClick={() => setPage('Export')} className="text-gray-400 hover:text-gray-600 p-1"><ArrowUp size={16} /></button>
        </div>

        {/* Left Toolbar */}
        <div className="absolute top-24 left-4 bg-white border border-gray-200 rounded-2xl shadow-sm p-2 flex flex-col gap-1 z-30">
          {tools.map(tool => (
            <button 
              key={tool.id} 
              onClick={() => {
                setActiveTool(tool.id);
                if (tool.id === 'Equation') setRightPanelOpen(true);
              }}
              className={`p-2 rounded-xl transition-colors ${activeTool === tool.id ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
              title={tool.id}
            >
              <tool.icon size={18} />
            </button>
          ))}
        </div>

        {/* AI Chat Bubbles (Canvas Element) */}
        <div className="absolute top-24 left-24 flex flex-col gap-3 max-w-sm z-20">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-2 items-start">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg shrink-0 border border-gray-200 shadow-sm">{msg.avatar}</div>
              <div className={`px-4 py-2.5 rounded-2xl text-gray-800 text-sm shadow-sm ${msg.sender === 'ai' ? 'bg-[#EDE9FE]' : 'bg-[#DDD6FE]'}`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Sticky Note */}
        <div className="absolute top-32 right-80 bg-[#FEF3C7] w-48 h-48 p-4 shadow-md rotate-2 rounded-sm border border-[#FDE68A] text-gray-800 font-medium text-sm z-20" style={{fontFamily: "'Inter', sans-serif"}}>
          Remember: check homework
        </div>

        {/* Code Editor Panel */}
        <div className="absolute bottom-32 left-24 bg-[#1E1E1E] w-64 rounded-xl shadow-lg border border-gray-700 overflow-hidden z-20">
          <div className="bg-[#2D2D2D] px-3 py-1.5 text-xs text-gray-400 font-medium border-b border-gray-700 flex items-center gap-2">
            <Code size={12} /> script.js
          </div>
          <div className="p-4 text-xs font-mono text-gray-300">
            <div><span className="text-purple-400">const</span> <span className="text-blue-400">x</span> <span className="text-white">=</span> <span className="text-orange-400">3</span>;</div>
            <div><span className="text-purple-400">function</span> <span className="text-blue-400">solve</span>() {'{'}</div>
            <div className="ml-4"><span className="text-purple-400">return</span> <span className="text-orange-400">2</span> <span className="text-white">*</span> x <span className="text-white">+</span> <span className="text-orange-400">5</span>;</div>
            <div>{'}'}</div>
          </div>
        </div>

        {/* Collaborator Cursors */}
        <div className="absolute top-1/2 left-1/3 z-30 pointer-events-none">
          <MousePointer2 className="text-blue-500 fill-blue-500 drop-shadow-md" size={16} />
          <div className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full ml-3 mt-1 shadow-sm border border-white">Alex 🔵</div>
        </div>
        <div className="absolute bottom-1/3 right-1/3 z-30 pointer-events-none">
          <MousePointer2 className="text-orange-500 fill-orange-500 drop-shadow-md" size={16} />
          <div className="bg-[#E07B39] text-white text-[10px] px-2 py-0.5 rounded-full ml-3 mt-1 shadow-sm border border-white">Priya 🟠</div>
        </div>

        {/* Comment Pins */}
        <div className={`absolute top-48 left-1/2 w-6 h-6 rounded-full border-2 bg-white flex items-center justify-center text-[10px] font-bold cursor-pointer shadow-sm z-30 ${isComments ? 'border-blue-500 text-blue-500 bg-blue-50' : 'border-gray-400 text-gray-500'}`}>①</div>
        {isComments && (
          <>
            <div className="absolute top-64 left-1/3 w-6 h-6 rounded-full border-2 border-gray-400 bg-white text-gray-500 flex items-center justify-center text-[10px] font-bold cursor-pointer shadow-sm z-30">②</div>
            <div className="absolute bottom-48 right-1/2 w-6 h-6 rounded-full border-2 border-gray-400 bg-white text-gray-500 flex items-center justify-center text-[10px] font-bold cursor-pointer shadow-sm z-30">③</div>
            
            {/* Active Comment Thread Panel */}
            <div className="absolute top-48 left-[calc(50%+30px)] bg-white rounded-2xl shadow-lg border border-gray-200 w-[300px] z-40 overflow-hidden">
              <div className="p-3 border-b border-gray-100 flex justify-between items-start">
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">AL</div>
                  <div>
                    <div className="text-xs font-bold text-gray-800">Alex <span className="font-normal text-gray-400">2 min ago</span></div>
                    <div className="text-sm text-gray-700 mt-1">I don't understand this equation</div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-green-500"><Check size={14} /></button>
              </div>
              <div className="p-3 bg-gray-50 flex gap-2 pl-8 border-b border-gray-100">
                <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-[8px]">TC</div>
                <div>
                  <div className="text-[10px] font-bold text-gray-800">Teacher <span className="font-normal text-gray-400">1 min ago</span></div>
                  <div className="text-xs text-gray-700 mt-0.5">Great question! The key is to isolate X first.</div>
                </div>
              </div>
              <div className="p-3 bg-gray-50 flex gap-2 pl-8 border-b border-gray-100">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[8px]">AL</div>
                <div className="text-xs text-gray-700 mt-0.5">Does this make sense now?</div>
              </div>
              <div className="p-2 bg-white flex flex-col gap-2">
                <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50">
                  <input type="text" placeholder="Reply..." className="flex-1 text-xs bg-transparent outline-none" />
                  <button className="text-blue-500"><ArrowUp size={14} /></button>
                </div>
                <button className="text-[10px] text-gray-500 font-medium hover:text-gray-800 self-start px-2">Mark as resolved</button>
              </div>
            </div>
          </>
        )}

        {/* Equation Result Card */}
        {isSolved && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80%] bg-white border-2 border-blue-400 rounded-2xl p-5 shadow-lg min-w-[200px] text-center z-20">
            <div className="absolute top-2 right-2 flex gap-1.5 text-gray-400">
              <button className="hover:text-gray-600"><RefreshCw size={12} /></button>
              <button className="hover:text-red-500"><Trash2 size={12} /></button>
            </div>
            <div className="text-xl font-bold tracking-wide text-gray-800 mt-2">2X + 5 = 11</div>
            <div className="text-lg font-bold text-blue-500 mt-1">X = 3</div>
          </div>
        )}

        {/* Equation Input Card */}
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-white rounded-2xl p-3 shadow-md border-2 border-dashed border-gray-300 w-56 z-20">
          <div className="text-[10px] text-gray-500 uppercase font-semibold mb-1 tracking-wider">Equation</div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-2 mb-3 text-center text-base text-gray-800 font-medium">
            {equationValue}
          </div>
          <button 
            onClick={handleSolve}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-1.5 text-sm font-medium transition-colors"
          >
            Solve
          </button>
        </div>

        {/* Bottom Chat Input Bar */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[55%] bg-white rounded-full shadow-lg border border-gray-200 flex flex-col overflow-hidden z-30">
          <div className="flex items-center px-4 py-2 border-b border-gray-100">
            <button className="text-gray-400 hover:text-gray-600 p-1.5"><Plus size={18} /></button>
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your question.." 
              className="flex-1 bg-transparent outline-none px-3 text-gray-700 text-sm"
            />
            <button className="text-gray-400 hover:text-gray-600 p-1.5"><Mic size={18} /></button>
            <button 
              onClick={handleSend}
              className="bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600 transition-colors ml-1"
            >
              <ArrowUp size={16} />
            </button>
          </div>
          <div className="flex items-center justify-center gap-6 py-1.5 bg-gray-50 text-gray-500">
            <button className="hover:text-blue-500"><Table size={16} /></button>
            <button className="hover:text-blue-500"><LineChart size={16} /></button>
            <button className="hover:text-blue-500"><Shapes size={16} /></button>
            <button className="hover:text-blue-500"><Grid size={16} /></button>
            <button 
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className={rightPanelOpen ? 'text-blue-500' : 'hover:text-blue-500'}
            >
              <SquareFunction size={16} />
            </button>
            <button className="hover:text-blue-500"><Hand size={16} /></button>
          </div>
        </div>

        {/* Bottom Formatting Toolbar */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-sm border border-gray-200 px-4 py-1.5 flex items-center gap-4 z-30">
          <div className="flex gap-1.5">
            {['#111827', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'].map(c => (
              <button key={c} className={`w-4 h-4 rounded-full ${c === '#3B82F6' ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`} style={{backgroundColor: c}}></button>
            ))}
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <div className="flex gap-2 items-center">
            <div className="w-1 h-1 bg-gray-800 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-800 rounded-full"></div>
            <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
          </div>
          <div className="w-px h-4 bg-gray-200"></div>
          <button className="text-gray-600 text-xs font-medium">None</button>
        </div>

        {/* Video Chat Panel */}
        <div className="absolute bottom-20 right-6 flex flex-col gap-2 z-30">
          <div className="relative w-32 h-24 bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700">
            <div className="absolute inset-0 flex items-center justify-center text-white/20 text-3xl">👩‍🏫</div>
            <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">Teacher <Mic size={8} className="text-red-400" /></div>
          </div>
          <div className="relative w-32 h-24 bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700">
            <div className="absolute inset-0 flex items-center justify-center text-white/20 text-3xl">🧑‍💻</div>
            <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">You <Mic size={8} /></div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-6 right-6 bg-white border border-gray-200 rounded-full flex items-center px-2 py-1 shadow-sm text-xs text-gray-600 font-medium z-30">
          <button onClick={() => setZoom(Math.max(10, zoom - 10))} className="p-1 hover:text-blue-500">—</button>
          <span className="mx-1 w-8 text-center">{zoom}%</span>
          <button onClick={() => setZoom(Math.min(200, zoom + 10))} className="p-1 hover:text-blue-500">+</button>
        </div>

        {/* ---------------- TEACHING MODE OVERLAYS ---------------- */}
        {isTeaching && (
          <>
            {/* Teacher Controls Panel */}
            <div className="absolute top-20 right-6 bg-white w-56 rounded-2xl shadow-lg border border-gray-200 p-4 z-40">
              <h3 className="font-bold text-gray-800 text-sm mb-3">Teaching Controls</h3>
              <div className="flex flex-col gap-3 mb-4">
                <label className="flex items-center justify-between text-xs font-medium text-gray-700 cursor-pointer">
                  Lock Students
                  <input type="checkbox" className="toggle-checkbox" checked={teachingToggles.lock} onChange={e => setTeachingToggles({...teachingToggles, lock: e.target.checked})} />
                </label>
                <label className="flex items-center justify-between text-xs font-medium text-gray-700 cursor-pointer">
                  Spotlight Mode
                  <input type="checkbox" className="toggle-checkbox" checked={teachingToggles.spotlight} onChange={e => setTeachingToggles({...teachingToggles, spotlight: e.target.checked})} />
                </label>
                <label className="flex items-center justify-between text-xs font-medium text-gray-700 cursor-pointer">
                  Confusion Heatmap
                  <input type="checkbox" className="toggle-checkbox" />
                </label>
              </div>
              <button className="w-full bg-red-50 text-red-600 border border-red-200 rounded-xl py-1.5 text-xs font-bold mb-4">Mute All</button>
              
              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Raise Hand Queue</h4>
                <div className="flex items-center justify-between text-xs text-gray-700 mb-1">
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center text-[8px]">JS</div> John</div>
                  <span>✋</span>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-700">
                  <div className="flex items-center gap-1.5"><div className="w-4 h-4 bg-pink-100 rounded-full flex items-center justify-center text-[8px]">SM</div> Sarah</div>
                  <span>✋</span>
                </div>
              </div>
            </div>

            {/* Active Poll Overlay */}
            <div className="absolute top-1/2 left-[30%] -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 w-64 z-40">
              <div className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">Quick Poll</div>
              <h3 className="font-bold text-gray-800 text-sm mb-4">Did you understand this?</h3>
              <div className="flex gap-2 mb-4">
                <button onClick={() => handleVote('yes')} className="flex-1 border border-green-500 text-green-600 rounded-xl py-2 flex justify-center hover:bg-green-50 shadow-sm"><ThumbsUp size={16} /></button>
                <button onClick={() => handleVote('no')} className="flex-1 border border-red-500 text-red-600 rounded-xl py-2 flex justify-center hover:bg-red-50 shadow-sm"><ThumbsDown size={16} /></button>
              </div>
              <div>
                <div className="flex justify-between text-[10px] text-gray-500 mb-1"><span>Yes: {pollResults.yes}%</span><span>No: {pollResults.no}%</span></div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full flex overflow-hidden">
                  <div className="bg-blue-500 h-full transition-all" style={{width: `${pollResults.yes}%`}}></div>
                  <div className="bg-red-500 h-full transition-all" style={{width: `${pollResults.no}%`}}></div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button className="text-[10px] text-gray-500 hover:text-gray-800 font-medium bg-gray-50 px-2 py-1 rounded">End Poll</button>
              </div>
            </div>

            {/* Student Video Strip (bottom) */}
            <div className="absolute bottom-4 left-4 flex gap-2 z-30">
              {[1, 2, 3].map(i => (
                <div key={i} className="relative w-20 h-16 bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700">
                  <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[8px] px-1 py-0.5 rounded flex items-center gap-1">Std {i} <Mic size={6} className="text-red-400" /></div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ---------------- RIGHT COLLAPSIBLE PANEL ---------------- */}
        <div className={`absolute top-0 right-0 h-full w-[280px] bg-white border-l border-gray-200 shadow-xl transition-transform duration-300 ease-in-out z-40 flex flex-col ${rightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          {isComments ? (
            // Comments Tab Content
            <>
              <div className="flex border-b border-gray-200">
                <button className="flex-1 py-3 text-xs font-medium text-gray-500 hover:text-gray-800">Chat</button>
                <button className="flex-1 py-3 text-xs font-medium text-gray-500 hover:text-gray-800">People</button>
                <button className="flex-1 py-3 text-xs font-medium text-gray-500 hover:text-gray-800">Timeline</button>
                <button className="flex-1 py-3 text-xs font-bold text-blue-600 border-b-2 border-blue-600">Comments</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                <div className="p-3 border border-blue-200 bg-blue-50 rounded-xl cursor-pointer">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-1"><span className="w-4 h-4 bg-white border border-blue-400 text-blue-500 rounded-full flex justify-center items-center text-[8px] font-bold">1</span> <span className="text-[10px] font-bold">Alex</span></div>
                    <span className="text-[10px] text-gray-400">2 min ago</span>
                  </div>
                  <p className="text-xs text-gray-700">I don't understand this equation</p>
                </div>
                <div className="p-3 border border-gray-200 bg-white rounded-xl cursor-pointer hover:border-gray-300">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-1"><span className="w-4 h-4 border border-gray-300 text-gray-500 rounded-full flex justify-center items-center text-[8px] font-bold">2</span> <span className="text-[10px] font-bold">Priya</span></div>
                    <span className="text-[10px] text-gray-400">10 min ago</span>
                  </div>
                  <p className="text-xs text-gray-700">Let's move this to the left</p>
                </div>
                <div className="p-3 border border-gray-200 bg-gray-50 opacity-60 rounded-xl">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-1"><span className="w-4 h-4 border border-gray-300 text-gray-500 rounded-full flex justify-center items-center text-[8px] font-bold">3</span> <span className="text-[10px] font-bold line-through">John</span></div>
                    <Check size={10} className="text-green-500" />
                  </div>
                  <p className="text-xs text-gray-500 line-through">Is the background color right?</p>
                </div>
              </div>
            </>
          ) : (
            // Equation Panel Content
            <>
              <div className="p-4 flex justify-between items-center border-b border-gray-100">
                <h2 className="font-bold text-gray-800 tracking-wider text-sm">EQUATION</h2>
                <button onClick={() => setRightPanelOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
              </div>
              <div className="p-4 flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Mode</label>
                  <div className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs text-gray-700 cursor-pointer hover:bg-gray-100 font-medium">
                    Single Variable <ChevronDown size={14} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Equation</label>
                  <input 
                    type="text" 
                    value={equationValue}
                    onChange={(e) => setEquationValue(e.target.value)}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs text-gray-700 outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <div className="flex flex-col gap-2.5 mt-2">
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" defaultChecked />
                    Insert solution as text on canvas
                  </label>
                  <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input type="checkbox" className="rounded text-blue-500 focus:ring-blue-500" />
                    Plot solution on existing graph
                  </label>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ---------------- EXPORT MODAL OVERLAY ---------------- */}
        {isExport && (
          <div className="absolute inset-0 bg-gray-900/40 z-50 flex items-center justify-center backdrop-blur-[1px]">
            <div className="bg-white rounded-3xl shadow-2xl p-8 w-[600px] border border-gray-100">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Export Canvas</h2>
                <p className="text-sm text-gray-500">Choose your export format</p>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { id: 'png', icon: ImageIcon, title: 'PNG/JPG', desc: 'Quick screenshot' },
                  { id: 'pdf', icon: File, title: 'PDF', desc: 'Full canvas document', active: true },
                  { id: 'ppt', icon: MonitorPlay, title: 'PPT', desc: 'Presentation slides' },
                  { id: 'cards', icon: Layers, title: 'Flashcards', desc: 'Auto-generated study cards' },
                  { id: 'quiz', icon: FileText, title: 'Quiz Sheet', desc: 'Printable quiz from your content' },
                  { id: 'notes', icon: FileSpreadsheet, title: 'Revision Sheet', desc: 'Summarized notes' }
                ].map(opt => (
                  <div key={opt.id} className={`border rounded-2xl p-4 cursor-pointer flex flex-col gap-2 relative ${opt.active ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-gray-300'}`}>
                    {opt.active && <div className="absolute top-3 right-3 text-blue-500"><Check size={16} /></div>}
                    <opt.icon size={24} className={opt.active ? 'text-blue-500' : 'text-gray-400'} />
                    <div>
                      <div className="font-bold text-sm text-gray-900">{opt.title}</div>
                      <div className="text-[10px] text-gray-500">{opt.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <button className="w-full bg-blue-500 text-white font-medium py-3 rounded-xl hover:bg-blue-600 transition-colors shadow-sm shadow-blue-500/30">Export as PDF</button>
                <button onClick={() => setPage('Canvas')} className="w-full text-gray-500 font-medium py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm">Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MainCanvas;
