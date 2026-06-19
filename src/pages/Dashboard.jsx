import React, { useEffect, useState, useRef } from 'react';
import { Search, Folder, Clock, FileText, Share2, Plus, LayoutGrid, LogOut, Loader2, ArrowRight, ChevronRight, ChevronDown, Check, X, MoreVertical, Edit2, Trash2, Tag as TagIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { 
  listCanvasesByOwner, updateCanvas, deleteCanvas, duplicateCanvas, 
  listFolders, createFolder, renameFolder, deleteFolder, updateCanvasFolder,
  listTags, createTag, deleteTag, assignTagToCanvas, removeTagFromCanvas 
} from '../lib/canvasApi';
import CanvasCard from '../components/CanvasCard';

// Utility to generate a consistent color from a string
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
}


export default function Dashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const [canvases, setCanvases] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState('all'); // 'all', 'uncategorized', or folder_id
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingFolderName, setEditingFolderName] = useState('');
  const [activeFolderMenu, setActiveFolderMenu] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState({});
  const folderInputRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);

  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      navigate('/auth');
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        const [canvasesData, foldersData, tagsData] = await Promise.all([
          listCanvasesByOwner(userId),
          listFolders(userId),
          listTags(userId)
        ]);
        setCanvases(canvasesData);
        setFolders(foldersData);
        setTags(tagsData);
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [userId, navigate]);

  // Handle clicking outside of folder menus
  useEffect(() => {
    const handleClickOutside = () => setActiveFolderMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isCreatingFolder && folderInputRef.current) {
      folderInputRef.current.focus();
    }
  }, [isCreatingFolder]);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleNewCanvas = () => {
    const newId = uuidv4();
    navigate(`/canvas/${newId}?new=true`);
  };

  const handleRename = async (id, newName) => {
    try {
      // Optimistic update
      setCanvases(prev => prev.map(c => c.id === id ? { ...c, name: newName } : c));
      await updateCanvas(id, { name: newName });
    } catch (e) {
      console.error("Rename failed", e);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this canvas? This cannot be undone.")) {
      try {
        setCanvases(prev => prev.filter(c => c.id !== id));
        await deleteCanvas(id);
      } catch (e) {
        console.error("Delete failed", e);
      }
    }
  };

  const handleDuplicate = async (sourceId) => {
    try {
      const newId = uuidv4();
      const clonedCanvas = await duplicateCanvas(sourceId, newId, user.id);
      if (clonedCanvas) {
        // Insert at the beginning
        setCanvases(prev => [clonedCanvas, ...(prev || [])]);
      }
    } catch (e) {
      console.error("Duplicate failed", e);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const folder = await createFolder(userId, newFolderName.trim());
      setFolders(prev => [...prev, folder]);
      setIsCreatingFolder(false);
      setNewFolderName('');
    } catch (e) {
      console.error("Create folder failed", e);
    }
  };

  const handleRenameFolderSubmit = async (folderId) => {
    if (!editingFolderName.trim()) {
      setEditingFolderId(null);
      return;
    }
    try {
      setFolders(prev => prev.map(f => f.id === folderId ? { ...f, name: editingFolderName.trim() } : f));
      await renameFolder(folderId, editingFolderName.trim());
      setEditingFolderId(null);
    } catch (e) {
      console.error("Rename folder failed", e);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (window.confirm("Are you sure you want to delete this folder? Your canvases will be moved to Uncategorized.")) {
      try {
        setFolders(prev => prev.filter(f => f.id !== folderId));
        if (activeFolder === folderId) setActiveFolder('all');
        
        // Optimistically move canvases to uncategorized
        setCanvases(prev => prev.map(c => c.folder_id === folderId ? { ...c, folder_id: null } : c));
        
        await deleteFolder(folderId);
      } catch (e) {
        console.error("Delete folder failed", e);
      }
    }
  };

  const handleMoveToFolder = async (canvasId, folderId) => {
    try {
      setCanvases(prev => prev.map(c => c.id === canvasId ? { ...c, folder_id: folderId } : c));
      await updateCanvasFolder(canvasId, folderId);
    } catch (e) {
      console.error("Move to folder failed", e);
    }
  };

  const handleAddTagToCanvas = async (canvasId, tagName) => {
    // Find existing tag by name (case-insensitive)
    let tag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
    
    // Create if it doesn't exist
    if (!tag) {
      try {
        const color = stringToColor(tagName);
        tag = await createTag(userId, tagName, color);
        setTags(prev => [...prev, tag]);
      } catch (e) {
        console.error("Failed to create tag", e);
        return;
      }
    }

    // Check if already assigned
    const canvas = canvases.find(c => c.id === canvasId);
    if (canvas && (canvas.tags || []).some(t => t.id === tag.id)) return;

    // Optimistic update
    setCanvases(prev => prev.map(c => {
      if (c.id === canvasId) {
        return { ...c, tags: [...(c.tags || []), tag] };
      }
      return c;
    }));

    try {
      await assignTagToCanvas(canvasId, tag.id);
    } catch (e) {
      console.error("Failed to assign tag", e);
    }
  };

  const handleRemoveTagFromCanvas = async (canvasId, tagId) => {
    // Optimistic update
    setCanvases(prev => prev.map(c => {
      if (c.id === canvasId) {
        return { ...c, tags: (c.tags || []).filter(t => t.id !== tagId) };
      }
      return c;
    }));

    try {
      await removeTagFromCanvas(canvasId, tagId);
    } catch (e) {
      console.error("Failed to remove tag", e);
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (window.confirm("Are you sure you want to delete this tag? It will be removed from all canvases.")) {
      // Remove from selected filters
      setSelectedTags(prev => prev.filter(id => id !== tagId));
      
      // Optimistically remove from all canvases
      setCanvases(prev => prev.map(c => ({
        ...c,
        tags: (c.tags || []).filter(t => t.id !== tagId)
      })));
      
      // Remove from global tags
      setTags(prev => prev.filter(t => t.id !== tagId));
      
      try {
        await deleteTag(tagId);
      } catch (e) {
        console.error("Failed to delete tag", e);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDropOnFolder = async (folderId, e) => {
    e.preventDefault();
    const canvasId = e.dataTransfer.getData('canvasId');
    if (canvasId) {
      handleMoveToFolder(canvasId, folderId);
    }
  };

  const safeCanvases = Array.isArray(canvases) ? canvases : [];
  
  // First filter by active folder
  const folderFilteredCanvases = safeCanvases.filter(c => {
    if (activeFolder === 'all') return true;
    if (activeFolder === 'uncategorized') return !c.folder_id;
    return c.folder_id === activeFolder;
  });

  // Filter by tags (Any logic)
  const tagFilteredCanvases = folderFilteredCanvases.filter(c => {
    if (selectedTags.length === 0) return true;
    const canvasTagIds = (c.tags || []).map(t => t.id);
    return selectedTags.some(tagId => canvasTagIds.includes(tagId));
  });

  // Then filter by search query
  const filteredCanvases = tagFilteredCanvases.filter(c => {
    const q = searchQuery.toLowerCase();
    const name = c?.name || 'Untitled Canvas';
    const nameMatch = name.toLowerCase().includes(q);
    const tagMatch = (c.tags || []).some(t => t.name.toLowerCase().includes(q));
    return nameMatch || tagMatch;
  });

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user.email?.split('@')[0] || 'there';

  return (
    <div className="flex-1 flex bg-white overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col p-4 shrink-0">
        <div className="flex items-center gap-2 font-bold text-xl text-gray-900 mb-8 px-2">
          <span className="text-2xl">🥽</span> SketchSpace
        </div>
        
        <button onClick={handleNewCanvas} className="w-full bg-blue-600 text-white rounded-xl py-2.5 px-4 font-bold flex items-center justify-center gap-2 hover:bg-blue-700 shadow-sm shadow-blue-600/20 mb-6 transition-colors">
          <Plus size={18} /> New Canvas
        </button>

        <div className="flex-1 flex flex-col gap-1 overflow-y-auto overflow-x-hidden pr-2">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-2">Overview</div>
          
          <button 
            onClick={() => setActiveFolder('all')}
            className={`flex items-center gap-3 px-3 py-2 font-medium rounded-lg transition-colors ${activeFolder === 'all' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <LayoutGrid size={18} className={activeFolder === 'all' ? 'text-blue-600' : 'text-gray-400'} /> All Canvases
          </button>
          
          <button 
            onClick={() => setActiveFolder('uncategorized')}
            className={`flex items-center gap-3 px-3 py-2 font-medium rounded-lg transition-colors ${activeFolder === 'uncategorized' ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDropOnFolder(null, e)}
          >
            <FileText size={18} className={activeFolder === 'uncategorized' ? 'text-blue-600' : 'text-gray-400'} /> Uncategorized
          </button>

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-6 flex justify-between items-center group">
            Folders 
            <button 
              onClick={() => setIsCreatingFolder(true)}
              className="text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              title="New Folder"
            >
              <Plus size={16} />
            </button>
          </div>

          {isCreatingFolder && (
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50/50 rounded-lg border border-blue-200">
              <Folder size={18} className="text-blue-400" />
              <input
                ref={folderInputRef}
                type="text"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleCreateFolder();
                  if (e.key === 'Escape') { setIsCreatingFolder(false); setNewFolderName(''); }
                }}
                onBlur={handleCreateFolder}
                placeholder="Folder name"
                className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 w-full"
              />
            </div>
          )}

          {folders.map(folder => {
            const isEditing = editingFolderId === folder.id;
            const isActive = activeFolder === folder.id;
            const count = safeCanvases.filter(c => c.folder_id === folder.id).length;

            if (isEditing) {
              return (
                <div key={folder.id} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <Folder size={18} className="text-gray-500" />
                  <input
                    autoFocus
                    type="text"
                    value={editingFolderName}
                    onChange={e => setEditingFolderName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRenameFolderSubmit(folder.id);
                      if (e.key === 'Escape') setEditingFolderId(null);
                    }}
                    onBlur={() => handleRenameFolderSubmit(folder.id)}
                    className="bg-transparent border-none outline-none text-sm font-medium text-gray-900 w-full"
                  />
                </div>
              );
            }

            return (
              <div 
                key={folder.id}
                className="relative group/folder"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnFolder(folder.id, e)}
              >
                <button 
                  onClick={() => setActiveFolder(folder.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 font-medium rounded-lg transition-colors ${isActive ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Folder size={18} className={isActive ? 'text-blue-600' : 'text-blue-500'} /> 
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{count}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveFolderMenu(activeFolderMenu === folder.id ? null : folder.id); }}
                      className={`p-0.5 rounded-md hover:bg-gray-300 text-gray-500 ${activeFolderMenu === folder.id ? 'opacity-100 bg-gray-300' : 'opacity-0 group-hover/folder:opacity-100'}`}
                    >
                      <MoreVertical size={14} />
                    </button>
                  </div>
                </button>

                {activeFolderMenu === folder.id && (
                  <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 overflow-hidden">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFolderId(folder.id);
                        setEditingFolderName(folder.name);
                        setActiveFolderMenu(null);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm flex items-center gap-2 text-gray-700"
                    >
                      <Edit2 size={14} /> Rename
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder.id);
                        setActiveFolderMenu(null);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 text-sm flex items-center gap-2 text-red-600"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2 mt-6">
            Tags
          </div>
          {tags.length === 0 ? (
            <div className="px-3 text-xs text-gray-500 italic mb-4">No tags yet</div>
          ) : (
            <div className="px-3 flex flex-wrap gap-1.5 mt-2 mb-4">
              {tags.map(tag => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <div
                    key={tag.id}
                    className={`group relative flex items-center px-2 py-1 rounded-md text-[11px] font-semibold tracking-wide transition-all cursor-pointer ${isSelected ? 'ring-2 ring-offset-1' : 'opacity-80 hover:opacity-100'}`}
                    style={{ 
                      backgroundColor: `${tag.color}20`, 
                      color: tag.color,
                      borderColor: `${tag.color}40`,
                      borderWidth: '1px',
                      ringColor: tag.color
                    }}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedTags(prev => prev.filter(id => id !== tag.id));
                      } else {
                        setSelectedTags(prev => [...prev, tag.id]);
                      }
                    }}
                  >
                    <span className="truncate max-w-[120px]">{tag.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTag(tag.id);
                      }}
                      className="ml-1.5 opacity-0 group-hover:opacity-100 p-0.5 rounded-sm hover:bg-black/10 transition-all flex-shrink-0"
                      title="Delete tag globally"
                    >
                      <X size={10} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-auto border-t border-gray-200 pt-4 flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-700 shrink-0">
            {user.email ? user.email.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-semibold truncate text-gray-900">{displayName}</div>
            <div className="text-xs text-gray-500 truncate">Free Plan</div>
          </div>
          <button onClick={handleSignOut} className="text-gray-400 hover:text-red-600 transition-colors" title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
        {/* Top Header */}
        <div className="h-20 border-b border-gray-100 flex items-center px-8 justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="font-extrabold text-2xl text-gray-900 tracking-tight">{getTimeGreeting()}, {displayName}</h1>
            <div className="h-6 w-px bg-gray-300 rounded-full"></div>
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              {activeFolder !== 'all' ? (
                <>
                  <button onClick={() => setActiveFolder('all')} className="hover:text-blue-600 transition-colors">All Canvases</button>
                  <ChevronRight size={16} />
                  <span className="text-gray-900">{activeFolder === 'uncategorized' ? 'Uncategorized' : folders.find(f => f.id === activeFolder)?.name || 'Folder'}</span>
                </>
              ) : (
                <span className="text-gray-900">All Canvases</span>
              )}
            </div>
          </div>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search canvases..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium" 
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center h-full text-gray-400 gap-3">
              <Loader2 size={32} className="animate-spin text-blue-500" />
              <p className="font-medium">Loading canvases...</p>
            </div>
          ) : safeCanvases.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center px-4">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                <FileText size={40} className="text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No canvases yet</h2>
              <p className="text-gray-500 mb-8 font-medium">Create your first canvas to start jotting down ideas, drawing diagrams, or collaborating with others.</p>
              <button 
                onClick={handleNewCanvas}
                className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg flex items-center gap-2"
              >
                <Plus size={18} /> Create your first canvas
              </button>
            </div>
          ) : (
            // Canvas Grid
            <div className="p-8">
              {filteredCanvases.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500 font-medium">No canvases found in this view.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCanvases.map(canvas => (
                    <CanvasCard 
                      key={canvas.id}
                      canvas={canvas}
                      folders={folders}
                      tags={tags}
                      onAddTag={(tagName) => handleAddTagToCanvas(canvas.id, tagName)}
                      onRemoveTag={(tagId) => handleRemoveTagFromCanvas(canvas.id, tagId)}
                      onClick={() => navigate(`/canvas/${canvas.id}`)}
                      onRename={handleRename}
                      onDuplicate={handleDuplicate}
                      onDelete={handleDelete}
                      onMoveToFolder={handleMoveToFolder}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
