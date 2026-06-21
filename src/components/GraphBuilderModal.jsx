import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function GraphBuilderModal({ isOpen, onClose, editor, editingGraphId, initialExpressions }) {
  const containerRef = useRef(null);
  const calculatorRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;

    const initCalculator = () => {
      if (!active || !containerRef.current || !window.Desmos) return;
      
      if (!calculatorRef.current) {
        calculatorRef.current = window.Desmos.GraphingCalculator(containerRef.current, {
          keypad: true,
          expressions: true,
          settingsMenu: true,
          zoomButtons: true,
        });
      }

      // Pre-populate expressions
      calculatorRef.current.setBlank();
      if (initialExpressions && Array.isArray(initialExpressions) && initialExpressions.length > 0) {
        initialExpressions.forEach((latex, index) => {
          calculatorRef.current.setExpression({
            id: `expr-${index}`,
            latex: latex
          });
        });
      } else {
        // Create an empty first expression so it's ready to type
        calculatorRef.current.setExpression({ id: 'expr-0', latex: '' });
      }
    };

    if (window.Desmos) {
      initCalculator();
    } else {
      const existingScript = document.querySelector('script[src*="calculator.js"]');
      if (existingScript) {
        existingScript.addEventListener('load', initCalculator);
      } else {
        const script = document.createElement('script');
        script.src = 'https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
        script.async = true;
        script.onload = initCalculator;
        document.head.appendChild(script);
      }
    }

    return () => {
      active = false;
      if (calculatorRef.current) {
        calculatorRef.current.destroy();
        calculatorRef.current = null;
      }
    };
  }, [isOpen, initialExpressions]);

  const handleAddToWhiteboard = () => {
    if (!calculatorRef.current || !editor) return;

    const state = calculatorRef.current.getState();
    const currentExpressions = state.expressions.list
      .filter(e => e.type === 'expression')
      .map(e => e.latex || '')
      .filter(latex => latex.trim() !== '');

    if (currentExpressions.length === 0) {
      onClose();
      return;
    }

    if (editingGraphId) {
      // Update existing shape
      editor.updateShape({
        id: editingGraphId,
        type: 'graph',
        props: {
          expressions: currentExpressions
        }
      });
    } else {
      // Create new shape
      const center = editor.getViewportPageBounds().center;
      
      editor.createShape({
        type: 'graph',
        x: center.x - 200,
        y: center.y - 150,
        props: {
          w: 400,
          h: 300,
          expressions: currentExpressions,
        },
      });
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center pointer-events-auto">
      <div 
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white w-full max-w-4xl h-[600px] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-gray-200 m-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-800">Graph Builder</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body: Desmos Instance */}
        <div className="flex-1 w-full bg-white relative">
          <div 
            ref={containerRef} 
            className="absolute inset-0"
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleAddToWhiteboard}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 rounded-xl transition-all flex items-center gap-2"
          >
            {editingGraphId ? 'Update Whiteboard' : 'Add to Whiteboard'}
          </button>
        </div>

      </div>
    </div>
  );
}
