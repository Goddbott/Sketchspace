import React, { useState, useEffect } from 'react';
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
import { get, set } from 'idb-keyval';
import debounce from 'lodash.debounce';
import { fetchCanvasFromSupabase, saveCanvasToSupabase } from '../lib/canvasApi';
import ShareButton from '../components/ShareButton';
import SignupBanner from '../components/SignupBanner';

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

const BackgroundSwitcher = ({ editor }) => {
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

const debouncedSave = debounce((canvasId, data) => {
  saveCanvasToSupabase(canvasId, data);
}, 1500);

const MainCanvas = ({ page, setPage }) => {
  const { canvasId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = new URLSearchParams(location.search).get('new') === 'true';

  const [editor, setEditor] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let currentStore = createTLStore({ shapeUtils: defaultShapeUtils });
    let unlisten = null;

    async function initCanvas() {
      try {
        setLoading(true);
        setError(false);
        
        // 1. Load local data for instant offline-first display
        let localData = await get(`canvas-${canvasId}`);
        if (localData) {
          loadSnapshot(currentStore, localData);
        }
        
        // 2. ALWAYS fetch from Supabase to ensure we get the latest changes from others
        let remoteData = null;
        try {
          remoteData = await fetchCanvasFromSupabase(canvasId);
        } catch (e) {
          console.warn("Could not fetch from Supabase, relying on local cache.", e);
        }

        if (remoteData) {
          // Overwrite local store with the freshest cloud data
          loadSnapshot(currentStore, remoteData);
          // Update our local cache with the new cloud data
          set(`canvas-${canvasId}`, remoteData).catch(console.error);
        } else if (!localData && !isNew) {
          // If no local data, no remote data, and it's not a newly generated URL = dead link
          setError(true);
          setLoading(false);
          return;
        }

        setStore(currentStore);

        // Listen for changes to save
        unlisten = currentStore.listen(
          () => {
            const snapshot = getSnapshot(currentStore);
            
            // Instant local save
            set(`canvas-${canvasId}`, snapshot).catch(console.error);
            
            // Debounced remote save
            debouncedSave(canvasId, snapshot);
          },
          { source: 'user', scope: 'document' }
        );
      } catch (err) {
        console.error("Failed to load canvas:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    initCanvas();

    return () => {
      if (unlisten) unlisten();
    };
  }, [canvasId, isNew]);

  useEffect(() => {
    const handleLock = (e) => {
      if (editor) {
        editor.updateInstanceState({ isReadonly: e.detail });
      }
    };
    window.addEventListener('canvasLockToggled', handleLock);
    return () => window.removeEventListener('canvasLockToggled', handleLock);
  }, [editor]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 h-full w-full">
        <div className="text-gray-400 font-medium">Loading Canvas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 h-full w-full gap-4">
        <h2 className="text-xl font-bold text-gray-800">This canvas has expired or doesn't exist</h2>
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
          store={store} 
          onMount={(ed) => {
            setEditor(ed);
            ed.updateInstanceState({ 
              isGridMode: window.canvasIsSnapMode || false,
              isReadonly: window.canvasIsLocked || false
            });
          }}
          components={{ 
            Minimap: null,
            MainMenu: CustomMainMenu,
            ContextMenu: CustomContextMenu,
            Grid: null,
            Background: CustomBackground,
            StylePanel: CustomStylePanel
          }}
        />
        {/* Custom UI Overlays */}
        <BackgroundSwitcher editor={editor} />
        <FindWidget editor={editor} />
        
        {/* Top-Right Overlays */}
        <div className="absolute top-4 right-4 z-[250] flex flex-col items-end gap-2 pointer-events-auto">
          <ShareButton />
        </div>
        <SignupBanner />
      </div>
    </div>
  );
};

export default MainCanvas;
