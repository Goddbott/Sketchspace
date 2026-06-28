import React, { useState } from 'react';
import { Lock, Unlock, Clock, Hexagon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PresenceBar } from './PresenceBar';
import ShareButton from './ShareButton';
import logoLight from '../assets/SketchSpace Light Mode.svg';
import logoDark from '../assets/SketchSpace Dark Mode.svg';

export const CollaborationControls = ({ canvasMeta, setCanvasMeta, user, awareness, isTimelineOpen, onToggleTimeline }) => {
  const [isLocked, setIsLocked] = useState(window.canvasIsLocked || false);
  const navigate = useNavigate();

  const toggleLock = () => {
    const newLocked = !isLocked;
    window.canvasIsLocked = newLocked;
    setIsLocked(newLocked);
    // Tldraw read-only state is updated via editor.updateInstanceState({ isReadonly: newLocked })
    // which happens inside CanvasPage's useEffect listening to this state if needed,
    // or we can dispatch an event just like the background pattern.
    window.dispatchEvent(new CustomEvent('canvasLockChanged', { detail: newLocked }));
  };

  const Divider = () => <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />;

  return (
    <div className="absolute top-3 right-4 z-[300] bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 flex items-center p-1 h-10 pointer-events-auto transition-colors duration-300">
      
      {/* Presence Bar (Avatars) */}
      <div className="flex items-center px-2">
        <PresenceBar awareness={awareness} />
      </div>

      <Divider />

      {/* Share Button */}
      <div className="flex items-center px-1">
        <ShareButton canvasMeta={canvasMeta} setCanvasMeta={setCanvasMeta} user={user} />
      </div>

      <Divider />

      {/* Timeline Toggle */}
      <div className="flex items-center px-1">
        <button 
          onClick={onToggleTimeline} 
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isTimelineOpen ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'}`} 
          title="Board Timeline"
        >
          <Clock size={16} />
        </button>
      </div>

      <Divider />

      {/* Lock Toggle */}
      <div className="flex items-center px-1">
        <button 
          onClick={toggleLock} 
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isLocked ? 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'}`} 
          title={isLocked ? "Unlock Canvas" : "Lock Canvas"}
        >
          {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
        </button>
      </div>

      <Divider />

      {/* Home / Logo */}
      <div className="flex items-center px-1">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex items-center justify-center gap-1.5 px-3 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Back to Dashboard"
        >
          <img src={logoLight} alt="SketchSpace" className="h-5 w-auto dark:hidden block" />
          <img src={logoDark} alt="SketchSpace" className="h-5 w-auto hidden dark:block" />
        </button>
      </div>

    </div>
  );
};
