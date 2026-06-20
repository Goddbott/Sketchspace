// A fixed palette of distinct, accessible colors that contrast well against typical white/light grid backgrounds
const CURSOR_COLORS = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow (Darker for contrast)
  '#4CD964', // Green
  '#5AC8FA', // Light Blue
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#FF2D55', // Pink
  '#A2845E', // Brown
  '#17B890'  // Teal
];

// Simple deterministic hash function for strings
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

export function generateUserIdentity(user = null) {
  const sessionId = Math.random().toString(36).substring(2, 10);
  
  // Base ID is either the authenticated Supabase user ID or the random session ID
  const id = user?.id || `guest-${sessionId}`;
  
  // Pick a deterministic color based on the ID
  const colorIndex = hashCode(id) % CURSOR_COLORS.length;
  const color = CURSOR_COLORS[colorIndex];
  
  let name = `Guest ${Math.floor(Math.random() * 1000)}`;
  
  let avatarUrl = null;
  
  if (user) {
    if (user.user_metadata?.avatar_url) {
      avatarUrl = user.user_metadata.avatar_url;
    }
    
    if (user.user_metadata?.full_name) {
      name = user.user_metadata.full_name;
    } else if (user.email) {
      name = user.email.split('@')[0];
    } else {
      name = 'Anonymous User';
    }
  }
  
  return { id, name, color, avatarUrl };
}
