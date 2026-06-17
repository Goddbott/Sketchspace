import React, { useState, useEffect } from 'react';
import { 
  Tldraw, 
  DefaultContextMenu, 
  DefaultStylePanel,
  DefaultMainMenu,
  DefaultMainMenuContent,
  TldrawUiMenuGroup, 
  TldrawUiMenuActionItem,
  TldrawUiMenuItem,
  useEditor,
  useValue
} from 'tldraw';
import { Lock, Unlock, Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import 'tldraw/tldraw.css';
import { useYjsStore } from '../hooks/useYjsStore';

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

const CustomGrid = ({ x, y, z, size }) => {
  const [pattern, setPattern] = useState(window.canvasBgPattern);
  
  useEffect(() => {
    const handlePatternChange = () => setPattern(window.canvasBgPattern);
    window.addEventListener('bgPatternChanged', handlePatternChange);
    return () => window.removeEventListener('bgPatternChanged', handlePatternChange);
  }, []);

  const s = size * z;
  const xo = x * z;
  const yo = y * z;

  if (pattern === 'lines') {
    return (
      <svg className="tl-grid" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid_lines" width={s} height={s} patternUnits="userSpaceOnUse" patternTransform={`translate(${xo}, ${yo})`}>
            <line x1="0" y1="0" x2={s} y2="0" stroke="#e2e8f0" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid_lines)" />
      </svg>
    );
  }

  if (pattern === 'grid') {
    return (
      <svg className="tl-grid" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid_cross" width={s} height={s} patternUnits="userSpaceOnUse" patternTransform={`translate(${xo}, ${yo})`}>
            <path d={`M ${s} 0 L 0 0 0 ${s}`} fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid_cross)" />
      </svg>
    );
  }

  // dots
  return (
    <svg className="tl-grid" version="1.1" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="grid_dots" width={s} height={s} patternUnits="userSpaceOnUse" patternTransform={`translate(${xo}, ${yo})`}>
          <circle cx="1" cy="1" r={1.5} fill="#cbd5e1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid_dots)" />
    </svg>
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

  const changePattern = (newPattern) => {
    window.canvasBgPattern = newPattern;
    setPattern(newPattern);
    window.dispatchEvent(new Event('bgPatternChanged'));
    if (editor) {
      editor.updateInstanceState({ isGridMode: newPattern !== 'none' });
    }
  };

  const toggleLock = () => {
    const newLocked = !isLocked;
    setIsLocked(newLocked);
    window.canvasIsLocked = newLocked;
    window.dispatchEvent(new CustomEvent('canvasLockToggled', { detail: newLocked }));
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
         onClick={toggleLock} 
         className={`p-1.5 rounded-xl transition-colors ${isLocked ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-500 hover:bg-gray-50'}`} 
         title="Lock Canvas"
      >
        {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
      </button>
    </div>
  );
};

const MainCanvas = ({ page, setPage }) => {
  const storeWithStatus = useYjsStore('global-room');
  const [editor, setEditor] = useState(null);

  useEffect(() => {
    const handleLock = (e) => {
      if (editor) {
        editor.updateInstanceState({ isReadonly: e.detail });
      }
    };
    window.addEventListener('canvasLockToggled', handleLock);
    return () => window.removeEventListener('canvasLockToggled', handleLock);
  }, [editor]);

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden relative w-full h-full">
      {/* Tldraw Infinite Canvas Component */}
      <div className="absolute inset-0 z-0">
        <Tldraw 
          store={storeWithStatus.store} 
          onMount={(ed) => {
            setEditor(ed);
            ed.updateInstanceState({ 
              isGridMode: window.canvasBgPattern !== 'none',
              isReadonly: window.canvasIsLocked || false
            });
          }}
          components={{ 
            Minimap: null,
            MainMenu: CustomMainMenu,
            ContextMenu: CustomContextMenu,
            Grid: CustomGrid,
            StylePanel: CustomStylePanel
          }}
        />
        {/* Custom UI Overlays */}
        <BackgroundSwitcher editor={editor} />
        <FindWidget editor={editor} />
      </div>
    </div>
  );
};

export default MainCanvas;
