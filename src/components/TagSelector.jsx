import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Tag } from 'lucide-react';

export default function TagSelector({ 
  assignedTags = [], 
  availableTags = [], 
  onAddTag, 
  onRemoveTag,
  isAdding,
  setIsAdding
}) {
  const [inputValue, setInputValue] = useState('');
  const [filteredTags, setFilteredTags] = useState([]);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  useEffect(() => {
    // Filter available tags that are not already assigned and match input
    const assignedIds = new Set(assignedTags.map(t => t.id));
    const unassigned = availableTags.filter(t => !assignedIds.has(t.id));
    
    if (inputValue.trim() === '') {
      setFilteredTags(unassigned);
    } else {
      const q = inputValue.toLowerCase();
      setFilteredTags(unassigned.filter(t => t.name.toLowerCase().includes(q)));
    }
  }, [inputValue, availableTags, assignedTags]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsAdding(false);
      }
    }
    if (isAdding) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isAdding, setIsAdding]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      onAddTag(inputValue.trim());
      setInputValue('');
      setIsAdding(false);
    } else if (e.key === 'Escape') {
      setIsAdding(false);
      setInputValue('');
    }
  };

  const handleSelectExisting = (tag) => {
    onAddTag(tag.name); // passing name, parent logic can handle finding ID or creating new
    setInputValue('');
    setIsAdding(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5" ref={containerRef}>
      {assignedTags.map(tag => (
        <div 
          key={tag.id} 
          className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border"
          style={{ 
            backgroundColor: `${tag.color}20`, 
            color: tag.color,
            borderColor: `${tag.color}40`
          }}
        >
          <span className="truncate max-w-[80px]">{tag.name}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); onRemoveTag(tag.id); }}
            className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
          >
            <X size={10} />
          </button>
        </div>
      ))}

      {isAdding && (
        <div className="relative">
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-md px-2 py-0.5 border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <Tag size={10} className="text-gray-400 dark:text-gray-500 mr-1" />
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tag name..."
              className="bg-transparent text-[11px] font-medium outline-none w-20 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
          
          {/* Autocomplete Dropdown */}
          <div className="absolute top-full left-0 mt-1 w-40 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg py-1 z-50 max-h-40 overflow-y-auto transition-colors duration-300">
            {filteredTags.length > 0 ? (
              filteredTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={(e) => { e.stopPropagation(); handleSelectExisting(tag); }}
                  className="w-full text-left px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-[12px] font-medium text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tag.color }}></span>
                  {tag.name}
                </button>
              ))
            ) : inputValue.trim() ? (
              <button
                onClick={(e) => { e.stopPropagation(); handleKeyDown({ key: 'Enter', preventDefault: () => {} }); }}
                className="w-full text-left px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-[12px] font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1 transition-colors"
              >
                <Plus size={12} /> Create "{inputValue}"
              </button>
            ) : (
              <div className="px-3 py-2 text-[11px] text-gray-500 dark:text-gray-400 italic">
                Type to search or create
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
