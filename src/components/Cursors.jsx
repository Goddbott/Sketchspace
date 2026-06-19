import React, { useEffect, useState, useRef } from 'react';
import throttle from 'lodash.throttle';

const CURSOR_SVG = (
  <svg
    width="24"
    height="36"
    viewBox="0 0 24 36"
    fill="none"
    stroke="white"
    strokeWidth="2"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
      fill="currentColor"
    />
  </svg>
);

export const Cursors = ({ editor, awareness }) => {
  const [states, setStates] = useState([]);
  const containerRef = useRef(null);

  // STEP 3: Track and broadcast cursor position
  useEffect(() => {
    if (!editor || !awareness) return;

    const handlePointerMove = throttle(() => {
      const pagePoint = editor.inputs.currentPagePoint;
      if (pagePoint) {
        awareness.setLocalStateField('cursor', {
          x: pagePoint.x,
          y: pagePoint.y,
          lastUpdated: Date.now()
        });
      }
    }, 30); // 30ms throttle for smooth but efficient broadcast

    const handleEvent = (info) => {
      if (info.type === 'pointer' && info.name === 'pointer_move') {
        handlePointerMove();
      }
    };

    // Tldraw v2 triggers events on the editor instance
    editor.on('event', handleEvent);

    return () => {
      editor.off('event', handleEvent);
      handlePointerMove.cancel();
    };
  }, [editor, awareness]);

  // STEP 4: Render other users' cursors (Subscribe to awareness changes)
  // We also subscribe to editor camera changes so we can re-render when the user pans/zooms
  useEffect(() => {
    if (!awareness || !editor) return;

    const handleAwarenessChange = () => {
      setStates(Array.from(awareness.getStates().entries()));
    };

    const handleCameraChange = () => {
      // Force a re-render to update screen coordinates when panning/zooming
      setStates(Array.from(awareness.getStates().entries()));
    };

    awareness.on('change', handleAwarenessChange);
    editor.store.listen(
      (update) => {
        if (update.changes.updated) {
          const hasCameraUpdate = Object.keys(update.changes.updated).some(id => id.startsWith('camera:'));
          if (hasCameraUpdate) handleCameraChange();
        }
      },
      { scope: 'session' }
    );

    // Initial fetch
    handleAwarenessChange();

    return () => {
      awareness.off('change', handleAwarenessChange);
      // tldraw store listen cleanup is handled if we stored the unlisten fn, but we'll ignore it here for simplicity or we can cleanly unlisten
    };
  }, [awareness, editor]);

  if (!editor || !awareness) return null;

  const myClientId = awareness.clientID;
  const now = Date.now();

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {states.map(([clientId, state]) => {
        // Filter out ourselves and anyone without a cursor or user identity
        if (clientId === myClientId || !state.cursor || !state.user) return null;

        // STEP 6: Handle idle states
        const isIdle = now - (state.cursor.lastUpdated || now) > 3000;
        
        // Convert world coordinates to screen coordinates based on current zoom/pan
        // tldraw v2 uses pageToViewport
        const screenPoint = editor.pageToViewport({ x: state.cursor.x, y: state.cursor.y });

        return (
          <div
            key={clientId}
            className="absolute top-0 left-0 flex flex-col items-start drop-shadow-md"
            style={{
              // STEP 5: Smooth cursor movement
              transform: `translate(${screenPoint.x}px, ${screenPoint.y}px)`,
              transition: 'transform 100ms linear, opacity 300ms ease',
              opacity: isIdle ? 0.4 : 1,
            }}
          >
            {/* SVG Pointer */}
            <div 
              style={{ color: state.user.color }} 
              className="w-6 h-9 -ml-[6px] -mt-[2px]"
            >
              {CURSOR_SVG}
            </div>
            
            {/* Name Label Pill */}
            <div
              className="px-2 py-1 rounded-full text-white text-xs font-semibold whitespace-nowrap shadow-sm"
              style={{ 
                backgroundColor: state.user.color,
                marginTop: '-4px',
                marginLeft: '12px'
              }}
            >
              {state.user.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};
