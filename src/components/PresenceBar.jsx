import React, { useEffect, useState } from 'react';

// Extract initials for the fallback avatar (e.g. "John Doe" -> "JD")
function getInitials(name) {
  if (!name) return '?';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export const PresenceBar = ({ awareness }) => {
  const [users, setUsers] = useState([]);

  // STEP 2: Subscribe to the full list of connected users
  useEffect(() => {
    if (!awareness) return;

    const handleAwarenessChange = () => {
      // Get all states, deduplicated inherently by clientID in the awareness map
      const states = Array.from(awareness.getStates().entries());
      
      const connectedUsers = states
        .filter(([_, state]) => state.user) // Only those with user identity set
        .map(([clientId, state]) => ({
          clientId,
          ...state.user
        }))
        // Sort by clientID for consistent deterministic ordering
        .sort((a, b) => a.clientId - b.clientId);

      setUsers(connectedUsers);
    };

    awareness.on('change', handleAwarenessChange);
    
    // Initial fetch
    handleAwarenessChange();

    return () => {
      awareness.off('change', handleAwarenessChange);
    };
  }, [awareness]);

  if (!users.length) return null;

  // STEP 4: Cap the number of avatars shown directly
  const MAX_VISIBLE = 4;
  const visibleUsers = users.slice(0, MAX_VISIBLE);
  const overflowCount = users.length - MAX_VISIBLE;
  const hiddenUsers = overflowCount > 0 ? users.slice(MAX_VISIBLE) : [];

  return (
    // STEP 4: Overlapping stack layout using flex-row-reverse
    <div className="flex flex-row-reverse items-center justify-end">
      
      {/* Overflow Indicator (+N) */}
      {overflowCount > 0 && (
        <div className="relative group flex-shrink-0 -ml-2 z-0">
          <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm transition-all duration-200">
            +{overflowCount}
          </div>
          
          {/* STEP 5: Hover behavior dropdown for hidden users */}
          <div className="absolute top-full right-0 mt-2 py-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999]">
            <div className="text-xs font-semibold text-gray-500 px-3 mb-1 uppercase tracking-wider">Other Collaborators</div>
            {hiddenUsers.map(u => (
              <div key={u.clientId} className="px-3 py-1.5 flex items-center gap-2 hover:bg-gray-50">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: u.color }} />
                <span className="text-sm font-medium text-gray-700 truncate">{u.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visible Avatars */}
      {/* Reverse the visible array so the first user ends up rightmost (highest z-index visually due to row-reverse + absolute layout order semantics) */}
      {[...visibleUsers].reverse().map((user, index) => {
        // Z-index trick to make sure left items overlap right items in the DOM
        const zIndex = visibleUsers.length - index;
        
        return (
          // STEP 7: Join/leave transition via CSS transition classes
          <div 
            key={user.clientId} 
            className="relative group flex-shrink-0 -ml-2 transition-all duration-300 ease-out"
            style={{ zIndex }}
          >
            {/* STEP 3: Build the Avatar component */}
            <div 
              className="w-8 h-8 rounded-full border-2 border-white overflow-hidden flex items-center justify-center text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: user.color }} // STEP 6: Sync with cursor colors
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{getInitials(user.name)}</span>
              )}
            </div>
            {/* Custom Tooltip */}
            <div className="absolute top-full right-1/2 translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs font-medium rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] whitespace-nowrap pointer-events-none">
              {user.name}
            </div>
          </div>
        );
      })}
    </div>
  );
};
