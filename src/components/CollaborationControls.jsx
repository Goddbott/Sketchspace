import React, { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { PresenceBar } from './PresenceBar';
import ShareButton from './ShareButton';

export const CollaborationControls = ({ canvasMeta, setCanvasMeta, user, awareness }) => {
  const [isLocked, setIsLocked] = useState(window.canvasIsLocked || false);

  const toggleLock = () => {
    const newLocked = !isLocked;
    window.canvasIsLocked = newLocked;
    setIsLocked(newLocked);
    // Tldraw read-only state is updated via editor.updateInstanceState({ isReadonly: newLocked })
    // which happens inside CanvasPage's useEffect listening to this state if needed,
    // or we can dispatch an event just like the background pattern.
    window.dispatchEvent(new CustomEvent('canvasLockChanged', { detail: newLocked }));
  };

  const Divider = () => <div className="w-px h-5 bg-gray-200 mx-1" />;

  return (
    <div className="absolute top-3 right-4 z-[300] bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 flex items-center p-1 h-10 pointer-events-auto">
      
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

      {/* Lock Toggle */}
      <div className="flex items-center px-1">
        <button 
          onClick={toggleLock} 
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${isLocked ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`} 
          title={isLocked ? "Unlock Canvas" : "Lock Canvas"}
        >
          {isLocked ? <Lock size={16} /> : <Unlock size={16} />}
        </button>
      </div>

    </div>
  );
};
