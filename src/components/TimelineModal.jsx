import React, { useEffect, useState, useRef } from 'react';
import { Clock, X, ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { getHistorySnapshots } from '../lib/canvasApi';
import { Tldraw, createTLStore, defaultShapeUtils, loadSnapshot } from 'tldraw';
import { EquationShapeUtil } from '../shapes/EquationShapeUtil';
import { GraphShapeUtil } from '../shapes/GraphShapeUtil';

const customShapeUtils = [...defaultShapeUtils, EquationShapeUtil, GraphShapeUtil];

export default function TimelineModal({ isOpen, onClose, canvasId, darkMode }) {
  const [snapshots, setSnapshots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [historyStore] = useState(() => createTLStore({ shapeUtils: customShapeUtils }));
  const playIntervalRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setIsPlaying(false);
      return;
    }

    async function fetchHistory() {
      setIsLoading(true);
      try {
        const data = await getHistorySnapshots(canvasId);
        setSnapshots(data || []);
        setCurrentIndex(data?.length > 0 ? data.length - 1 : -1);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, [canvasId, isOpen]);

  // Handle rehydrating history store when scrubbing
  useEffect(() => {
    if (currentIndex >= 0 && currentIndex < snapshots.length) {
      const selectedSnapshot = snapshots[currentIndex].snapshot;
      if (selectedSnapshot) {
        loadSnapshot(historyStore, selectedSnapshot);
      }
    } else {
      // Clear store if needed, but usually we just stay on the last view
    }
  }, [currentIndex, snapshots, historyStore]);

  // Handle Playback
  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          if (prev >= snapshots.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000); // 1 second per step
    } else {
      clearInterval(playIntervalRef.current);
    }
    return () => clearInterval(playIntervalRef.current);
  }, [isPlaying, snapshots.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center pointer-events-auto">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white dark:bg-gray-950 w-[85vw] max-w-5xl h-[75vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800 m-4 animate-in fade-in zoom-in-95 duration-200 transition-colors duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 p-2 rounded-lg">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white leading-none">Canvas History</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">View past snapshots of your board</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {currentIndex >= 0 && snapshots[currentIndex] && (
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-4 py-1.5 rounded-full shadow-sm border border-gray-200 dark:border-gray-700">
                {new Date(snapshots[currentIndex].created_at).toLocaleString()}
              </div>
            )}
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body: Read-only Tldraw Viewer */}
        <div className="flex-1 w-full bg-gray-50 dark:bg-gray-950 relative overflow-hidden">
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
              <Clock size={32} className="animate-pulse" />
              <span className="font-medium">Loading history...</span>
            </div>
          ) : snapshots.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
              <Clock size={32} />
              <span className="font-medium">No history recorded yet</span>
            </div>
          ) : (
            <div className="absolute inset-0 z-0 pointer-events-auto">
              <Tldraw 
                colorScheme={darkMode ? 'dark' : 'light'}
                store={historyStore} 
                shapeUtils={customShapeUtils}
                onMount={(ed) => {
                  ed.updateInstanceState({ isReadonly: true });
                }}
                components={{ 
                  Minimap: null, MainMenu: null, PageMenu: null, ActionsMenu: null,
                  QuickActions: null, ContextMenu: null, Grid: null,
                  StylePanel: null, NavigationPanel: null
                }}
              />
            </div>
          )}
        </div>

        {/* Footer: Timeline Scrubber */}
        <div className="shrink-0 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-6 py-4 flex flex-col gap-2">
          <div className="flex items-center gap-4">
            {/* Playback Controls */}
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={isLoading || snapshots.length <= 1 || currentIndex >= snapshots.length - 1}
              className={`w-12 h-12 shrink-0 flex items-center justify-center rounded-full transition-all ${
                isPlaying ? 'bg-red-100 text-red-600 hover:bg-red-200 shadow-inner' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20'
              } ${isLoading || snapshots.length <= 1 || currentIndex >= snapshots.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" className="ml-1" />}
            </button>

            {/* Scrubber */}
            <div className="flex-1 relative flex items-center h-10 px-2">
              <input 
                type="range"
                min={0}
                max={Math.max(0, snapshots.length - 1)}
                value={Math.max(0, currentIndex)}
                disabled={isLoading || snapshots.length <= 1}
                onChange={(e) => {
                  setIsPlaying(false);
                  setCurrentIndex(parseInt(e.target.value));
                }}
                className="w-full h-2.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Step Controls */}
            <div className="flex items-center gap-2 shrink-0 border-l border-gray-200 dark:border-gray-800 pl-4">
              <button 
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={isLoading || currentIndex <= 0}
                className="p-3 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={24} />
              </button>
              <div className="w-16 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
                {snapshots.length > 0 ? `${currentIndex + 1} / ${snapshots.length}` : '0 / 0'}
              </div>
              <button 
                onClick={() => setCurrentIndex(Math.min(snapshots.length - 1, currentIndex + 1))}
                disabled={isLoading || currentIndex >= snapshots.length - 1}
                className="p-3 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
