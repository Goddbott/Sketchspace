import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit2, Copy, Trash2, Share2, Users, FolderInput, ArrowLeft, Tag } from 'lucide-react';
import TagSelector from './TagSelector';

export default function CanvasCard({ canvas, folders = [], tags = [], onAddTag, onRemoveTag, onClick, onRename, onDuplicate, onDelete, onMoveToFolder }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFolderMenuOpen, setIsFolderMenuOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [nameVal, setNameVal] = useState(canvas?.name || 'Untitled Canvas');
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  if (!canvas) return null;

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const handleRenameSubmit = () => {
    if (nameVal.trim() !== '' && nameVal !== canvas.name) {
      onRename(canvas.id, nameVal.trim());
    } else {
      setNameVal(canvas.name || 'Untitled Canvas'); // reset if empty
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleRenameSubmit();
    if (e.key === 'Escape') {
      setNameVal(canvas.name || 'Untitled Canvas');
      setIsEditingName(false);
    }
  };

  const handleCopyLink = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    const link = `${window.location.origin}/canvas/${canvas.id}`;
    navigator.clipboard.writeText(link);
    // Could add a toast notification here
  };

  const handleDuplicate = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onDuplicate(canvas.id);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    onDelete(canvas.id);
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setIsFolderMenuOpen(false);
    setIsMenuOpen(!isMenuOpen);
  };

  const handleDragStart = (e) => {
    e.dataTransfer.setData('canvasId', canvas.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Removed gradient placeholder logic to use clean white background

  // Relative time formatter
  const getRelativeTime = (dateString) => {
    if (!dateString) return 'Just now';
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const diff = new Date(dateString) - new Date();
    const diffDays = Math.round(diff / (1000 * 60 * 60 * 24));
    const diffHours = Math.round(diff / (1000 * 60 * 60));
    const diffMinutes = Math.round(diff / (1000 * 60));

    if (Math.abs(diffDays) > 0) return rtf.format(diffDays, 'day');
    if (Math.abs(diffHours) > 0) return rtf.format(diffHours, 'hour');
    if (Math.abs(diffMinutes) > 0) return rtf.format(diffMinutes, 'minute');
    return 'Just now';
  };

  return (
    <div 
      className="group border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-blue-300 dark:hover:border-gray-600 hover:shadow-lg transition-all cursor-pointer bg-white dark:bg-gray-900 relative flex flex-col h-full"
      onClick={onClick}
      draggable={true}
      onDragStart={handleDragStart}
    >
      {/* Thumbnail Area */}
      <div className="h-36 relative border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center rounded-t-2xl">
        
        {canvas.thumbnail_url ? (
          <img 
            src={canvas.thumbnail_url.startsWith('data:') ? canvas.thumbnail_url : `${canvas.thumbnail_url}?t=${new Date(canvas.updated_at || Date.now()).getTime()}`} 
            alt={canvas.name || 'Canvas Preview'} 
            className="w-full h-full object-cover object-center bg-white rounded-t-2xl dark:invert dark:hue-rotate-180 transition-all duration-300"
          />
        ) : (
          <div className="text-gray-300 dark:text-gray-600 font-medium text-sm flex items-center justify-center h-full w-full bg-white dark:bg-gray-900 rounded-t-2xl">
            Empty Canvas
          </div>
        )}
        
        {/* Menu Button (Visible on hover) */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div ref={menuRef} className="relative">
            <button 
              onClick={handleMenuToggle}
              className="p-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur text-gray-700 dark:text-gray-300 rounded-lg shadow-sm hover:bg-white dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-white transition-colors"
            >
              <MoreVertical size={16} />
            </button>
            
            {/* Dropdown Menu */}
            {isMenuOpen && !isFolderMenuOpen ? (
              <div className="absolute top-full right-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-xl py-1 z-10 text-sm font-medium">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsEditingName(true); setIsMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  <Edit2 size={14} /> Rename
                </button>
                <button 
                  onClick={handleDuplicate}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  <Copy size={14} /> Duplicate
                </button>
                <button 
                  onClick={handleCopyLink}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  <Share2 size={14} /> Share Link
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsFolderMenuOpen(true); }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  <FolderInput size={14} /> Move to folder
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsAddingTag(true); setIsMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                >
                  <Tag size={14} /> Add tag
                </button>
                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                <button 
                  onClick={handleDelete}
                  className="w-full text-left px-3 py-2 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 text-red-600 dark:text-red-400"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            ) : isMenuOpen && isFolderMenuOpen ? (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 z-10">
                <button 
                  onClick={(e) => { e.stopPropagation(); setIsFolderMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-900 dark:text-white font-medium border-b border-gray-100 dark:border-gray-700"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <div className="max-h-48 overflow-y-auto">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onMoveToFolder(canvas.id, null); }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-gray-300"></span> Uncategorized
                  </button>
                  {folders.map(folder => (
                    <button 
                      key={folder.id}
                      onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onMoveToFolder(canvas.id, folder.id); }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm truncate"
                    >
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span> {folder.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Details Area */}
      <div className="p-4 flex-1 flex flex-col justify-between bg-white dark:bg-gray-900 rounded-b-2xl">
        <div className="mb-2">
          {isEditingName ? (
            <input
              ref={inputRef}
              type="text"
              value={nameVal}
              onChange={(e) => setNameVal(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="w-full font-semibold text-gray-900 dark:text-white border-b-2 border-blue-500 focus:outline-none bg-transparent px-0 py-0 m-0 mb-2"
            />
          ) : (
            <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-2" title={canvas.name || 'Untitled Canvas'}>
              {canvas.name || 'Untitled Canvas'}
            </h3>
          )}
          
          <div onClick={e => e.stopPropagation()}>
            <TagSelector 
              assignedTags={canvas.tags || []}
              availableTags={tags}
              onAddTag={onAddTag}
              onRemoveTag={onRemoveTag}
              isAdding={isAddingTag}
              setIsAdding={setIsAddingTag}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto">
          <span>Edited {getRelativeTime(canvas.updated_at)}</span>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-md">
            <Users size={12}/> 1
          </div>
        </div>
      </div>
    </div>
  );
}
