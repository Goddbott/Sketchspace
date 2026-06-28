import React from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { ChevronDown, Github, Triangle, Box, Presentation, Star, User, Home as HomeIcon, PenTool, ArrowRight } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import logoLight from '../assets/SketchSpace Light Mode.svg';
import logoDark from '../assets/SketchSpace Dark Mode.svg';
import canvasMockup from '../assets/Canvas Mockup.png';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartDrawing = () => {
    const newId = uuidv4();
    navigate(`/canvas/${newId}?new=true`);
  };

  return (
    <div className="flex-1 w-full h-full relative overflow-y-auto bg-white dark:bg-gray-950 transition-colors duration-300 rounded-[30px]">
      
      {/* Background Dot Pattern */}
      <div 
        className="absolute inset-0 z-0 opacity-40 dark:opacity-20 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px'
        }}
      ></div>

      {/* Top Navigation */}
      <div className="relative z-20 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <img src={logoLight} alt="Sketchspace Logo" className="h-10 dark:hidden block" />
            <img src={logoDark} alt="Sketchspace Logo" className="h-10 hidden dark:block" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={user ? () => navigate('/dashboard') : () => navigate('/auth')}
            className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold rounded-full hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            {user ? 'Dashboard' : 'Get Started'}
          </button>
          <a 
            href="https://github.com/your-repo/sketchspace" 
            target="_blank" 
            rel="noreferrer"
            className="hidden sm:flex items-center gap-2 px-5 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-sm font-bold rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            <Github size={16} /> Stars on GitHub
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-24 pb-20 px-6 max-w-5xl mx-auto text-center">
        
        {/* Floating Graphics */}
        
        {/* Purple Sticky Note */}
        <div className="hidden lg:flex absolute left-8 top-16 w-24 h-24 bg-purple-300 dark:bg-purple-500 rounded-md transform -rotate-6 shadow-md animate-pulse-slow items-center justify-center border border-purple-200 dark:border-purple-400">
          <div className="absolute top-0 right-0 w-8 h-8 bg-black/5 rounded-bl-xl"></div>
        </div>
        
        {/* No Sign-Up Badge */}
        <div className="hidden lg:flex absolute left-16 bottom-32 px-4 py-2 bg-yellow-300 dark:bg-yellow-600 border-2 border-gray-900 dark:border-gray-100 rounded-xl transform rotate-3 shadow-[4px_4px_0_0_rgba(17,24,39,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)]">
          <span className="font-mono font-bold text-gray-900 dark:text-white">No Sign-Up</span>
        </div>

        {/* Real-Time Tag */}
        <div className="hidden lg:flex absolute right-16 top-16 px-4 py-2 bg-white dark:bg-gray-900 border-2 border-gray-900 dark:border-gray-100 rounded-xl transform 12 shadow-[4px_4px_0_0_rgba(17,24,39,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)]">
          <span className="font-mono font-bold text-gray-900 dark:text-white">Real-Time</span>
        </div>

        {/* Yellow Bounding Box (Moved right) */}
        <div className="hidden lg:flex absolute right-9 top-[60%] w-28 h-28 border-2 border-blue-500 flex items-center justify-center z-0 pointer-events-none">
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-2 border-blue-500 bg-white rounded-sm"></div>
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-2 border-blue-500 bg-white rounded-sm"></div>
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-2 border-blue-500 bg-white rounded-sm"></div>
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-2 border-blue-500 bg-white rounded-sm"></div>
          <div className="w-24 h-24 bg-yellow-400 rounded-full"></div>
        </div>

        {/* Blue Loopy Squiggle */}
        <div className="hidden lg:block absolute right-[-10%] top-[35%] z-20 pointer-events-none">
          <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M 10 90 C 50 30, 80 30, 60 60 C 50 70, 40 40, 110 20" stroke="#3b82f6" strokeWidth="4" strokeLinecap="round" fill="transparent" />
          </svg>
        </div>


        {/* Headlines */}
        <div className="relative mb-6 z-10 w-full flex justify-center">
          <h1 className="text-5xl sm:text-7xl md:text-[5rem] font-black tracking-tight leading-[1.15] relative whitespace-nowrap">
            
            {/* The Outer Stroke & Shadow Layer */}
            <span 
              className="absolute inset-0 text-transparent [-webkit-text-stroke:12px_white] dark:[-webkit-text-stroke:12px_#1f2937] z-[-1] drop-shadow-[0_12px_12px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_12px_12px_rgba(0,0,0,0.5)]"
              aria-hidden="true"
            >
              Sketch together, think clearer —<br/>ideas that build themselves
            </span>

            {/* The Foreground Text Layer */}
            <div className="relative z-10">
              <span className="text-blue-500">Sketch together,</span>
              <span className="text-gray-900 dark:text-white ml-4">think clearer —</span>
              <br />
              <span className="text-gray-900 dark:text-white">ideas that build themselves</span>
            </div>
            
          </h1>
        </div>
        
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl font-medium bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm px-4 py-2 rounded-full leading-relaxed mx-auto">
          A free infinite whiteboard with live collaboration, math tools, and a timeline that remembers every step.
        </p>

        <div className="flex flex-row items-center justify-center gap-4 relative z-30">
          <button
            onClick={handleStartDrawing}
            className="group flex items-center justify-center gap-2.5 px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-[0_0_0_4px_white,0_4px_10px_rgba(0,0,0,0.1)] dark:shadow-[0_0_0_4px_#1f2937,0_4px_10px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all"
          >
            <PenTool size={20} className="opacity-90" />
            Start Drawing
          </button>
          
          {!user && (
            <button
              onClick={() => navigate('/auth')}
              className="group flex items-center justify-center gap-2.5 px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:-translate-y-0.5 hover:shadow-sm transition-all"
            >
              Sign In
              <ArrowRight size={20} className="text-gray-500 dark:text-gray-400 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Feature Cards Grid */}
      <div className="relative z-10 px-6 max-w-6xl mx-auto mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-transform hover:-translate-y-1">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Solve equations live</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Type math, see it rendered cleanly with a built-in equation tool
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-transform hover:-translate-y-1">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Never lose a version</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Scrub back through your board's history and fork from any past moment
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-transform hover:-translate-y-1">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Plot any function</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              Graph equations instantly with an embedded Desmos calculator
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-transform hover:-translate-y-1">
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Work together, live</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              See cursors, names, and changes sync instantly with your collaborators
            </p>
          </div>

        </div>
      </div>

      {/* Window UI Mockup */}
      <div className="relative z-10 px-6 max-w-6xl mx-auto pb-20">
        <div className="rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200/60 dark:border-gray-800/60 ring-1 ring-black/5 dark:ring-white/5 transition-transform hover:-translate-y-1 duration-300">
          <img src={canvasMockup} alt="SketchSpace Canvas Interface" className="w-full h-auto object-cover" />
        </div>
      </div>

    </div>
  );
}
