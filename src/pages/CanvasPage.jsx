import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Tldraw, 
  DefaultContextMenu, 
  DefaultStylePanel,
  DefaultMainMenu,
  DefaultMainMenuContent,
  TldrawUiMenuGroup, 
  TldrawUiMenuItem,
  TldrawUiMenuActionItem,
  useEditor,
  useValue,
  createTLStore,
  defaultShapeUtils,
  getSnapshot,
  loadSnapshot
} from 'tldraw';
import { Lock, Unlock, Search, ChevronUp, ChevronDown, X, Magnet } from 'lucide-react';
import 'tldraw/tldraw.css';

import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { get, set, del } from 'idb-keyval';
import debounce from 'lodash.debounce';
import { fetchCanvasFromSupabase, saveCanvasToSupabase, uploadThumbnail, updateCanvas, createTag, assignTagToCanvas, removeTagFromCanvas } from '../lib/canvasApi';
import { supabase } from '../lib/supabase';
import ShareButton from '../components/ShareButton';
import SignupBanner from '../components/SignupBanner';
import TagSelector from '../components/TagSelector';
import { useAuth } from '../lib/AuthContext';

function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
}

// Global state for background pattern
if (!window.canvasBgPattern) {
  window.canvasBgPattern = 'dots';
}

const CustomMainMenu = () => {
  return (
    <DefaultMainMenu>
      <DefaultMainMenuContent />
      <TldrawUiMenuGroup id="find">
        <TldrawUiMenuItem 
          id="find-on-canvas" 
          label="Find on Canvas" 
          icon="search" 
          readonlyOk 
          onSelect={() => window.dispatchEvent(new Event('toggleSearchUI'))} 
        />
      </TldrawUiMenuGroup>
    </DefaultMainMenu>
  );
};

const FindWidget = ({ editor }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleToggle = () => setIsOpen(prev => !prev);
    
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(true);
      }
    };

    window.addEventListener('toggleSearchUI', handleToggle);
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    
    return () => {
      window.removeEventListener('toggleSearchUI', handleToggle);
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setMatches([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!editor || !query.trim() || !isOpen) {
      setMatches([]);
      return;
    }

    const extractText = (obj) => {
      if (!obj) return '';
      if (typeof obj === 'string') return obj;
      if (Array.isArray(obj)) return obj.map(extractText).join(' ');
      if (typeof obj === 'object') {
        if (obj.type === 'text' && typeof obj.text === 'string') return obj.text;
        if (obj.content) return extractText(obj.content);
      }
      return '';
    };

    const timer = setTimeout(() => {
      const q = query.toLowerCase();
      const shapes = editor.getCurrentPageShapes();
      const matched = shapes.filter(s => {
        if (!s.props) return false;
        const textContent = extractText(s.props.text) + ' ' + extractText(s.props.richText);
        return textContent.toLowerCase().includes(q);
      });
      setMatches(matched);
      setCurrentIndex(0);
      
      if (matched.length > 0) {
        editor.setSelectedShapes([matched[0].id]);
        editor.zoomToSelection({ animation: { duration: 200 } });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, editor, isOpen]);

  const jumpTo = (index) => {
    if (!editor || matches.length === 0) return;
    let newIndex = index;
    if (newIndex < 0) newIndex = matches.length - 1;
    if (newIndex >= matches.length) newIndex = 0;
    
    setCurrentIndex(newIndex);
    editor.setSelectedShapes([matches[newIndex].id]);
    editor.zoomToSelection({ animation: { duration: 200 } });
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-4 right-16 z-[300] bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex items-center gap-2 pointer-events-auto">
      <Search size={16} className="text-gray-400 ml-1" />
      <input 
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Find on canvas..."
        className="outline-none text-sm w-40 bg-transparent"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            jumpTo(e.shiftKey ? currentIndex - 1 : currentIndex + 1);
          } else if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
      />
      {query.trim() && (
        <span className="text-xs text-gray-400 w-12 text-center">
          {matches.length > 0 ? `${currentIndex + 1}/${matches.length}` : '0/0'}
        </span>
      )}
      <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
        <button onClick={() => jumpTo(currentIndex - 1)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-md">
          <ChevronUp size={16} />
        </button>
        <button onClick={() => jumpTo(currentIndex + 1)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-md">
          <ChevronDown size={16} />
        </button>
        <button onClick={() => setIsOpen(false)} className="p-1 text-gray-500 hover:bg-gray-100 rounded-md ml-1">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const CustomBackground = () => {
  const editor = useEditor();
  const camera = useValue('camera', () => editor?.getCamera(), [editor]);
  const [pattern, setPattern] = useState(window.canvasBgPattern);
  
  useEffect(() => {
    const handlePatternChange = () => setPattern(window.canvasBgPattern);
    window.addEventListener('bgPatternChanged', handlePatternChange);
    return () => window.removeEventListener('bgPatternChanged', handlePatternChange);
  }, []);

  if (!camera || pattern === 'none') return null;

  const size = 24; // Default Tldraw grid size
  const s = size * camera.z;
  const xo = camera.x * camera.z;
  const yo = camera.y * camera.z;

  if (pattern === 'lines') {
    return (
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="bg_grid_lines" width={s} height={s} patternUnits="userSpaceOnUse" patternTransform={`translate(${xo}, ${yo})`}>
              <line x1="0" y1="0" x2={s} y2="0" stroke="#e2e8f0" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg_grid_lines)" />
        </svg>
      </div>
    );
  }

  if (pattern === 'grid') {
    return (
      <div className="absolute inset-0 pointer-events-none z-0">
        <svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="bg_grid_cross" width={s} height={s} patternUnits="userSpaceOnUse" patternTransform={`translate(${xo}, ${yo})`}>
              <path d={`M ${s} 0 L 0 0 0 ${s}`} fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg_grid_cross)" />
        </svg>
      </div>
    );
  }

  // dots
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="bg_grid_dots" width={s} height={s} patternUnits="userSpaceOnUse" patternTransform={`translate(${xo}, ${yo})`}>
            <circle cx="1" cy="1" r={1.5} fill="#cbd5e1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg_grid_dots)" />
      </svg>
    </div>
  );
};

const CustomStylePanel = () => {
  const editor = useEditor();
  
  const shouldShow = useValue(
    'shouldShowStylePanel',
    () => {
      // If any shapes are selected, show the panel
      if (editor.getSelectedShapeIds().length > 0) return true;
      
      // If a drawing tool is active, show the panel (so user can pick styles before drawing)
      const currentToolId = editor.getCurrentToolId();
      const drawingTools = ['draw', 'geo', 'arrow', 'line', 'text', 'note', 'frame', 'highlight'];
      if (drawingTools.includes(currentToolId)) return true;
      
      // Otherwise, hide the panel (e.g., when clicking the background with 'select' tool)
      return false;
    },
    [editor]
  );

  if (!shouldShow) return null;

  return <DefaultStylePanel />;
};

const CustomContextMenu = () => {
  const editor = useEditor();
  const selectToolActive = useValue(
    "isSelectToolActive",
    () => editor.getCurrentToolId() === "select",
    [editor]
  );

  if (!selectToolActive) return <DefaultContextMenu />;

  return (
    <DefaultContextMenu>
      <TldrawUiMenuGroup id="clipboard">
        <TldrawUiMenuActionItem actionId="cut" />
        <TldrawUiMenuActionItem actionId="copy" />
        <TldrawUiMenuActionItem actionId="paste" />
      </TldrawUiMenuGroup>

      <TldrawUiMenuGroup id="conversions">
        <TldrawUiMenuActionItem actionId="copy-as-png" />
        <TldrawUiMenuActionItem actionId="copy-as-svg" />
      </TldrawUiMenuGroup>

      <TldrawUiMenuGroup id="arrange">
        <TldrawUiMenuActionItem actionId="send-backward" />
        <TldrawUiMenuActionItem actionId="bring-forward" />
        <TldrawUiMenuActionItem actionId="send-to-back" />
        <TldrawUiMenuActionItem actionId="bring-to-front" />
      </TldrawUiMenuGroup>

      <TldrawUiMenuGroup id="flip">
        <TldrawUiMenuActionItem actionId="flip-horizontal" />
        <TldrawUiMenuActionItem actionId="flip-vertical" />
      </TldrawUiMenuGroup>
      
      <TldrawUiMenuGroup id="modify">
        <TldrawUiMenuActionItem actionId="group" />
        <TldrawUiMenuActionItem actionId="ungroup" />
        <TldrawUiMenuActionItem actionId="edit-link" />
      </TldrawUiMenuGroup>

      <TldrawUiMenuGroup id="misc">
        <TldrawUiMenuActionItem actionId="duplicate" />
        <TldrawUiMenuActionItem actionId="toggle-lock" />
      </TldrawUiMenuGroup>
    </DefaultContextMenu>
  );
};

const CustomZoomMenu = () => {
  const editor = useEditor();
  const zoomLevel = useValue('zoom', () => editor.getZoomLevel(), [editor]);

  return (
    <div className="absolute bottom-4 left-4 z-[300] bg-white rounded-xl shadow-sm border border-gray-200 flex items-center p-1 gap-1 pointer-events-auto h-10">
      <button
        onClick={() => editor.zoomOut()}
        className="w-8 h-8 flex flex-shrink-0 items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-[8px] transition-colors"
        title="Zoom Out"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>
      
      <button 
        onClick={() => editor.resetZoom()}
        className="px-1 text-[13px] font-semibold text-gray-800 min-w-[3rem] text-center hover:bg-gray-100 rounded-[8px] h-8 transition-colors flex-shrink-0"
        title="Reset Zoom"
      >
        {Math.round(zoomLevel * 100)}%
      </button>

      <button
        onClick={() => editor.zoomIn()}
        className="w-8 h-8 flex flex-shrink-0 items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-[8px] transition-colors"
        title="Zoom In"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      </button>
    </div>
  );
};

const BackgroundSwitcher = ({ editor, canvasMeta, setCanvasMeta, user }) => {
  const [pattern, setPattern] = useState(window.canvasBgPattern);
  const [isLocked, setIsLocked] = useState(window.canvasIsLocked || false);
  const [isSnapMode, setIsSnapMode] = useState(window.canvasIsSnapMode || false);

  useEffect(() => {
    if (editor) {
      editor.updateInstanceState({ isGridMode: window.canvasIsSnapMode || false });
    }
  }, [editor]);

  const changePattern = (newPattern) => {
    window.canvasBgPattern = newPattern;
    setPattern(newPattern);
    window.dispatchEvent(new Event('bgPatternChanged'));
  };

  const toggleLock = () => {
    const newLocked = !isLocked;
    setIsLocked(newLocked);
    window.canvasIsLocked = newLocked;
    window.dispatchEvent(new CustomEvent('canvasLockToggled', { detail: newLocked }));
  };

  const toggleSnapMode = () => {
    const newSnapMode = !isSnapMode;
    setIsSnapMode(newSnapMode);
    window.canvasIsSnapMode = newSnapMode;
    if (editor) {
      editor.updateInstanceState({ isGridMode: newSnapMode });
    }
  };

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[250] bg-white p-1 rounded-2xl shadow-sm border border-gray-200 flex gap-1 pointer-events-auto items-center">
      {['none', 'dots', 'lines', 'grid'].map((p) => (
        <button
          key={p}
          onClick={() => changePattern(p)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-colors ${
            pattern === p ? 'bg-gray-100 text-gray-900 shadow-sm' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          {p}
        </button>
      ))}
      <div className="w-px h-4 bg-gray-300 mx-1"></div>
      <button 
         onClick={toggleSnapMode} 
         className={`p-1.5 rounded-xl transition-colors ${isSnapMode ? 'text-blue-500 bg-blue-50 hover:bg-blue-100' : 'text-gray-500 hover:bg-gray-50'}`} 
         title="Snap to Grid"
      >
        <Magnet size={14} />
      </button>
      <div className="w-px h-4 bg-gray-300 mx-1"></div>
      <ShareButton canvasMeta={canvasMeta} setCanvasMeta={setCanvasMeta} user={user} />
      <button 
         onClick={toggleLock} 
         className={`p-1.5 rounded-xl transition-colors ${isLocked ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-500 hover:bg-gray-50'}`} 
         title="Lock Canvas"
      >
        {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
      </button>
    </div>
  );
};

const CanvasMetadataUI = ({ canvasMeta, setCanvasMeta, allTags, setAllTags, user }) => {
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameVal, setNameVal] = useState(canvasMeta?.name || 'Untitled Canvas');

  if (!canvasMeta) return null;

  const handleRename = async () => {
    if (nameVal.trim() !== '' && nameVal !== canvasMeta.name) {
      setCanvasMeta(prev => ({ ...prev, name: nameVal.trim() }));
      await updateCanvas(canvasMeta.id, { name: nameVal.trim() });
    } else {
      setNameVal(canvasMeta.name || 'Untitled Canvas');
    }
    setIsEditingName(false);
  };

  const handleAddTag = async (tagName) => {
    if (!user) return; // Anonymous can't tag
    
    let tag = allTags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
    if (!tag) {
      try {
        const color = stringToColor(tagName);
        tag = await createTag(user.id, tagName, color);
        setAllTags(prev => [...prev, tag]);
      } catch (e) {
        console.error(e);
        return;
      }
    }

    if (canvasMeta.tags.some(t => t.id === tag.id)) return;

    setCanvasMeta(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    await assignTagToCanvas(canvasMeta.id, tag.id);
  };

  const handleRemoveTag = async (tagId) => {
    setCanvasMeta(prev => ({ ...prev, tags: prev.tags.filter(t => t.id !== tagId) }));
    await removeTagFromCanvas(canvasMeta.id, tagId);
  };

  return (
    <div className="absolute top-20 left-4 z-[250] bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-sm border border-gray-200 pointer-events-auto flex flex-col gap-2 max-w-[250px]">
      {isEditingName ? (
        <input 
          autoFocus
          value={nameVal}
          onChange={e => setNameVal(e.target.value)}
          onBlur={handleRename}
          onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setIsEditingName(false); setNameVal(canvasMeta.name || 'Untitled Canvas'); } }}
          className="font-bold text-gray-900 bg-transparent outline-none border-b border-blue-500 pb-0.5"
        />
      ) : (
        <div 
          onClick={() => setIsEditingName(true)}
          className="font-bold text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors"
          title="Click to rename"
        >
          {canvasMeta.name || 'Untitled Canvas'}
        </div>
      )}
      
      <div className="flex flex-wrap gap-1 items-center">
        <TagSelector 
          assignedTags={canvasMeta.tags || []}
          availableTags={allTags}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          isAdding={isAddingTag}
          setIsAdding={setIsAddingTag}
        />
        {user && !isAddingTag && (
          <button 
            onClick={() => setIsAddingTag(true)}
            className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Add tag"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        )}
      </div>
    </div>
  );
};

import { useYjsStore } from '../hooks/useYjsStore';
import { generateUserIdentity } from '../utils/identity';
import { Cursors } from '../components/Cursors';
import { PresenceBar } from '../components/PresenceBar';

const MainCanvas = ({ page, setPage }) => {
  const { canvasId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = new URLSearchParams(location.search).get('new') === 'true';
  const { user } = useAuth();
  
  const [editor, setEditor] = useState(null);
  const editorRef = useRef(null);

  const [error, setError] = useState(false);

  const [canvasMeta, setCanvasMeta] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [accessLevel, setAccessLevel] = useState('loading'); // 'owner', 'editor', 'viewer', 'denied'
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    async function fetchMeta() {
      const { data, error: fetchErr } = await supabase
        .from('canvases')
        .select('*, canvas_tags(tags(*)), canvas_collaborators(*)')
        .eq('id', canvasId)
        .single();

      if (data) {
        // Automatically claim canvas if it was accidentally saved as anonymous
        if (!data.owner_id && user?.id) {
          const { data: updatedRows, error: claimErr } = await supabase
            .from('canvases')
            .update({ owner_id: user.id, is_anonymous: false })
            .eq('id', canvasId)
            .select();
            
          if (claimErr) {
            console.error("Failed to claim canvas:", claimErr);
          } else if (updatedRows && updatedRows.length > 0) {
            data.owner_id = user.id;
            data.is_anonymous = false;
          }
        }

        // Evaluate access
        let currentAccess = 'denied';
        if (!data.owner_id) {
          currentAccess = 'editor';
        } else if (user?.id === data.owner_id) {
          currentAccess = 'owner';
        } else {
          const collab = (data.canvas_collaborators || []).find(c => c.email?.toLowerCase() === user?.email?.toLowerCase());
          if (collab) {
            currentAccess = collab.role;
          } else if (data.canvas_access === 'edit') {
            currentAccess = 'editor';
          } else if (data.canvas_access === 'view') {
            currentAccess = 'viewer';
          }
        }

        setAccessLevel(currentAccess);
        if (currentAccess === 'denied') {
          setAccessDenied(true);
          setError(true);
          return;
        }

        const tags = data.canvas_tags ? data.canvas_tags.map(ct => ct.tags).filter(Boolean) : [];
        setCanvasMeta({ ...data, tags, canvas_collaborators: data.canvas_collaborators || [] });
      } else {
        if (!isNew) {
          setError(true);
        } else {
          setAccessLevel(user?.id ? 'owner' : 'editor');
          setCanvasMeta({
            id: canvasId,
            owner_id: user?.id || null,
            canvas_access: 'edit',
            canvas_collaborators: [],
            name: 'Untitled Canvas',
            is_anonymous: !user?.id
          });
        }
      }
      
      if (user?.id) {
        const { data: userTags } = await supabase
          .from('tags')
          .select('*')
          .eq('owner_id', user.id);
        if (userTags) setAllTags(userTags);
      }
    }
    fetchMeta();
  }, [canvasId, user?.id]);

  // Debounced save with thumbnail generation
  const debouncedSave = useCallback(
    debounce(async (id, snapshot, ownerIdFallback) => {
      let thumbnailUrl = null;
      const currentEditor = editorRef.current;
      
      // GUARANTEE we have the absolute latest auth state right before network request
      const { data: { session } } = await supabase.auth.getSession();
      const currentOwnerId = session?.user?.id || ownerIdFallback || null;

      if (currentEditor) {
        const shapeIds = Array.from(currentEditor.getCurrentPageShapeIds());
        if (shapeIds.length > 0) {
          try {
            // Generate SVG thumbnail silently in the background
            const svgResult = await currentEditor.getSvgString(shapeIds, { background: true, padding: 32 });
            
            if (svgResult?.svg) {
              // Encode SVG directly as a data URI to bypass Supabase Storage issues
              thumbnailUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgResult.svg)}`;
            }
          } catch (e) {
            console.error("Failed to generate thumbnail:", e);
            // Non-fatal, continue with save
          }
        }
      }

      // Save canvas data and thumbnail URL
      saveCanvasToSupabase(id, snapshot, currentOwnerId, thumbnailUrl);
    }, 1500),
    []
  );

  const fetchCanvasFallback = useCallback(async () => {
    // Return null if access is denied, otherwise fetch from Supabase
    if (accessDenied || accessLevel === 'loading') return null;
    return await fetchCanvasFromSupabase(canvasId);
  }, [canvasId, accessDenied, accessLevel]);

  // STEP 1: Assign identity to each connected user
  const [identity] = useState(() => generateUserIdentity(user));

  // STEP 2, 3, 4, 6: Connect to Yjs, load IndexedDB, fallback to Supabase if empty
  const storeWithStatus = useYjsStore(canvasId, fetchCanvasFallback, identity);

  const userIdRef = useRef(user?.id);
  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  
  
  // We no longer need local `loading` or `error` state for the canvas data,
  // we rely on `storeWithStatus.status` and `accessLevel`.

  const checkIsLeader = useCallback(() => {
    const provider = storeWithStatus.provider;
    if (!provider || !provider.awareness) return true; // Default to true if no multiplayer
    const states = Array.from(provider.awareness.getStates().keys());
    if (states.length === 0) return true;
    states.sort(); // Sort by clientID
    return states[0] === provider.awareness.clientID;
  }, [storeWithStatus.provider]);

  useEffect(() => {
    if (accessLevel === 'loading' || accessDenied) return;
    if (storeWithStatus.status === 'loading') return;

    let unlisten = null;

    // STEP 5: Leader-based periodic saving
    if (accessLevel === 'owner' || accessLevel === 'editor') {
      unlisten = storeWithStatus.store.listen(
        () => {
          if (!checkIsLeader()) return;
          const snapshot = getSnapshot(storeWithStatus.store);
          debouncedSave(canvasId, snapshot, userIdRef.current);
        },
        { source: 'user', scope: 'document' }
      );
    }

    return () => {
      if (unlisten) unlisten();
      debouncedSave.cancel();
    };
  }, [canvasId, accessLevel, accessDenied, storeWithStatus.status, storeWithStatus.store, checkIsLeader, debouncedSave]);

  useEffect(() => {
    if (editor && accessLevel !== 'loading') {
      editor.updateInstanceState({ isReadonly: accessLevel === 'viewer' || window.canvasIsLocked || false });
    }
  }, [editor, accessLevel]);

  useEffect(() => {
    const handleLock = (e) => {
      if (editor) {
        editor.updateInstanceState({ isReadonly: e.detail });
      }
    };
    window.addEventListener('canvasLockToggled', handleLock);
    return () => window.removeEventListener('canvasLockToggled', handleLock);
  }, [editor]);

  if (accessLevel === 'loading' || storeWithStatus.status === 'loading') {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 h-full w-full">
        <div className="text-gray-400 font-medium">Loading Canvas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-full w-full gap-4">
        <h2 className="text-xl font-bold text-gray-800">
          {accessDenied ? "This canvas is private" : "This canvas has expired or doesn't exist"}
        </h2>
        <p className="text-gray-500 text-sm max-w-sm text-center">
          {accessDenied 
            ? "You don't have permission to view this canvas. Request access from the owner or make sure you are logged in with the invited email." 
            : ""}
        </p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-blue-500 text-white px-5 py-2.5 rounded-xl font-medium shadow-sm hover:bg-blue-600 transition-colors"
        >
          Start a new canvas
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative w-full h-full">
      {/* Tldraw Infinite Canvas Component */}
      <div className="absolute inset-0 z-0">
        <Tldraw 
          store={storeWithStatus.store} 
          onMount={(ed) => {
            setEditor(ed);
            editorRef.current = ed;
            ed.updateInstanceState({ 
              isGridMode: window.canvasIsSnapMode || false,
              isReadonly: accessLevel === 'viewer' || window.canvasIsLocked || false
            });
          }}
          components={{ 
            Minimap: null,
            MainMenu: CustomMainMenu,
            ContextMenu: CustomContextMenu,
            Grid: null,
            Background: CustomBackground,
            StylePanel: CustomStylePanel,
            NavigationPanel: CustomZoomMenu
          }}
        />
        {/* Custom UI Overlays */}
        <BackgroundSwitcher editor={editor} canvasMeta={canvasMeta} setCanvasMeta={setCanvasMeta} user={user} />
        <FindWidget editor={editor} />
        <CanvasMetadataUI 
          canvasMeta={canvasMeta} 
          setCanvasMeta={setCanvasMeta} 
          allTags={allTags} 
          setAllTags={setAllTags} 
          user={user} 
        />
        
        {/* STEP 3, 4, 5, 6: Multiplayer Cursors Overlay */}
        <Cursors editor={editor} awareness={storeWithStatus.provider?.awareness} />

        {/* Presence Bar Overlay - Pulled out of Tldraw to prevent overflow clipping */}
        <div className="absolute top-3 right-4 z-[300] pointer-events-auto">
          <PresenceBar awareness={storeWithStatus.provider?.awareness} />
        </div>

        <SignupBanner canvasId={canvasId} />
      </div>
    </div>
  );
};

export default MainCanvas;
