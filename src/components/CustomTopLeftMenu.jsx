import React, { useState, useEffect, useRef } from 'react';
import { useEditor, DefaultMainMenu, DefaultPageMenu, DefaultActionsMenu } from 'tldraw';
import { Undo, Redo, Trash2, Copy, Grid, Magnet, Sigma } from 'lucide-react';
import * as Toolbar from '@radix-ui/react-toolbar';

export const CustomTopLeftMenu = ({ onOpenEquationModal }) => {
  const editor = useEditor();
  const [bgMenuOpen, setBgMenuOpen] = useState(false);
  const [currentPattern, setCurrentPattern] = useState(window.canvasBgPattern || 'dots');
  const bgMenuRef = useRef(null);
  const [isSnapMode, setIsSnapMode] = useState(window.canvasIsSnapMode || false);

  useEffect(() => {
    if (editor) {
      editor.updateInstanceState({ isGridMode: window.canvasIsSnapMode || false });
    }
  }, [editor]);

  // Copy aria-label → title on actions menu buttons so native tooltips work
  useEffect(() => {
    const copyLabelsToTitles = () => {
      document.querySelectorAll('.tlui-actions-menu .tlui-button').forEach(btn => {
        const label = btn.getAttribute('aria-label');
        if (label && !btn.getAttribute('title')) {
          btn.setAttribute('title', label);
        }
      });
    };

    // Watch for the actions menu popup appearing in the DOM
    const observer = new MutationObserver(copyLabelsToTitles);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handlePatternChange = () => setCurrentPattern(window.canvasBgPattern);
    window.addEventListener('bgPatternChanged', handlePatternChange);
    return () => window.removeEventListener('bgPatternChanged', handlePatternChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bgMenuRef.current && !bgMenuRef.current.contains(event.target)) {
        setBgMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changePattern = (newPattern) => {
    window.canvasBgPattern = newPattern;
    setCurrentPattern(newPattern);
    window.dispatchEvent(new Event('bgPatternChanged'));
    setBgMenuOpen(false);
  };

  const handleUndo = () => editor.undo();
  const handleRedo = () => editor.redo();
  const handleDelete = () => editor.deleteShapes(editor.getSelectedShapeIds());
  const handleDuplicate = () => {
    const ids = editor.getSelectedShapeIds();
    if (ids.length > 0) editor.duplicateShapes(ids);
  };

  const toggleSnapMode = () => {
    const newSnapMode = !isSnapMode;
    setIsSnapMode(newSnapMode);
    window.canvasIsSnapMode = newSnapMode;
    if (editor) {
      editor.updateInstanceState({ isGridMode: newSnapMode });
    }
  };

  // Thin vertical divider
  const Divider = () => <div className="w-px h-5 bg-gray-200 mx-1" />;

  return (
    <Toolbar.Root asChild>
      <div className="absolute top-3 left-4 z-[300] bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-gray-200 flex items-center p-1 h-10 pointer-events-auto">
        
        {/* Group A: Menu & Pages */}
        <div className="flex items-center gap-1 px-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors">
            <DefaultMainMenu />
          </div>
          <div className="flex items-center justify-center h-8 rounded-lg hover:bg-gray-100 transition-colors px-1">
            <DefaultPageMenu />
          </div>
        </div>
        
        <Divider />
        
        {/* Group B: Undo/Redo */}
        <div className="flex items-center gap-1 px-1">
          <button onClick={handleUndo} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Undo">
            <Undo size={16} />
          </button>
          <button onClick={handleRedo} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Redo">
            <Redo size={16} />
          </button>
        </div>

        <Divider />

        {/* Group C: Delete/Duplicate */}
        <div className="flex items-center gap-1 px-1">
          <button onClick={handleDelete} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Selected">
            <Trash2 size={16} />
          </button>
          <button onClick={handleDuplicate} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors" title="Duplicate Selected">
            <Copy size={16} />
          </button>
        </div>

        <Divider />

        {/* Group D: Actions, Snap & Background */}
        <div className="relative flex items-center px-1" ref={bgMenuRef}>
          
          {/* Tldraw's native ActionsMenu (icon grid popover) */}
          <div className="flex items-center justify-center w-8 h-8 mr-1 rounded-lg hover:bg-gray-100 transition-colors">
            <DefaultActionsMenu />
          </div>

          <button 
            onClick={toggleSnapMode} 
            className={`w-8 h-8 mr-1 flex items-center justify-center rounded-lg transition-colors ${isSnapMode ? 'text-blue-500 bg-blue-50 hover:bg-blue-100' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`} 
            title="Snap to Grid"
          >
            <Magnet size={16} />
          </button>

          <button 
            onClick={() => setBgMenuOpen(!bgMenuOpen)} 
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${bgMenuOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
            title="Background Pattern"
          >
            <Grid size={16} />
          </button>

          {/* Equation Tool Button */}
          <button 
            onClick={onOpenEquationModal} 
            className="w-8 h-8 ml-1 flex items-center justify-center rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
            title="Equation Tool"
          >
            <Sigma size={16} />
          </button>

          {bgMenuOpen && (
            <div className="absolute top-full left-0 mt-2 py-1.5 w-32 bg-white rounded-xl shadow-lg border border-gray-100 z-[350] flex flex-col">
              {['none', 'dots', 'lines', 'grid'].map(p => (
                <button
                  key={p}
                  onClick={() => changePattern(p)}
                  className={`px-3 py-2 text-sm text-left capitalize transition-colors ${currentPattern === p ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>
    </Toolbar.Root>
  );
};
