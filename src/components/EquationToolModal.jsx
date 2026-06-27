import React, { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import katex from 'katex';
import { BlockMath } from 'react-katex';
import '../lib/jquerySetup';

const TABS = ['Basic', 'Greek', 'Operations', 'Relations', 'Arrows', 'Delimiter', 'Misc'];

const SYMBOL_TABS = {
  Basic: [
    { label: 'x^2', cmd: '^', latex: '^{}', type: 'cmd' },
    { label: 'x_2', cmd: '_', latex: '_{}', type: 'cmd' },
    { label: 'a/b', cmd: '\\frac', latex: '\\frac{}{}', type: 'cmd' },
    { label: '√x', cmd: '\\sqrt', latex: '\\sqrt{}', type: 'cmd' },
    { label: 'n√x', cmd: '\\nthroot', latex: '\\sqrt[]{}', type: 'cmd' },
    { label: '( )', cmd: '(', latex: '\\left( \\right)', type: 'cmd' },
    { label: '+', cmd: '+', latex: '+', type: 'write' },
    { label: '-', cmd: '-', latex: '-', type: 'write' },
    { label: '±', cmd: '\\pm', latex: '\\pm ', type: 'cmd' },
    { label: '×', cmd: '\\times', latex: '\\times ', type: 'cmd' },
    { label: '÷', cmd: '\\div', latex: '\\div ', type: 'cmd' },
    { label: '=', cmd: '=', latex: '=', type: 'write' },
    { label: '·', cmd: '\\cdot', latex: '\\cdot ', type: 'cmd' },
    { label: 'Σ', cmd: '\\sum', latex: '\\sum ', type: 'cmd' },
    { label: 'lim', cmd: '\\lim', latex: '\\lim_{x \\to \\infty} ', type: 'cmd' },
    { label: 'Π', cmd: '\\prod', latex: '\\prod ', type: 'cmd' },
    { label: 'ℕ', cmd: 'ℕ', latex: '\\mathbb{N} ', type: 'write' },
    { label: 'ℙ', cmd: 'ℙ', latex: '\\mathbb{P} ', type: 'write' },
    { label: 'ℤ', cmd: 'ℤ', latex: '\\mathbb{Z} ', type: 'write' },
    { label: 'ℚ', cmd: 'ℚ', latex: '\\mathbb{Q} ', type: 'write' },
    { label: 'ℝ', cmd: 'ℝ', latex: '\\mathbb{R} ', type: 'write' },
    { label: 'ℂ', cmd: 'ℂ', latex: '\\mathbb{C} ', type: 'write' },
    { label: 'ℍ', cmd: 'ℍ', latex: '\\mathbb{H} ', type: 'write' },
  ],
  Greek: [
    { label: 'α', cmd: '\\alpha', latex: '\\alpha ', type: 'cmd' },
    { label: 'β', cmd: '\\beta', latex: '\\beta ', type: 'cmd' },
    { label: 'γ', cmd: '\\gamma', latex: '\\gamma ', type: 'cmd' },
    { label: 'δ', cmd: '\\delta', latex: '\\delta ', type: 'cmd' },
    { label: 'ε', cmd: '\\epsilon', latex: '\\epsilon ', type: 'cmd' },
    { label: 'ζ', cmd: '\\zeta', latex: '\\zeta ', type: 'cmd' },
    { label: 'η', cmd: '\\eta', latex: '\\eta ', type: 'cmd' },
    { label: 'θ', cmd: '\\theta', latex: '\\theta ', type: 'cmd' },
    { label: 'ι', cmd: '\\iota', latex: '\\iota ', type: 'cmd' },
    { label: 'κ', cmd: '\\kappa', latex: '\\kappa ', type: 'cmd' },
    { label: 'λ', cmd: '\\lambda', latex: '\\lambda ', type: 'cmd' },
    { label: 'μ', cmd: '\\mu', latex: '\\mu ', type: 'cmd' },
    { label: 'ν', cmd: '\\nu', latex: '\\nu ', type: 'cmd' },
    { label: 'ξ', cmd: '\\xi', latex: '\\xi ', type: 'cmd' },
    { label: 'π', cmd: '\\pi', latex: '\\pi ', type: 'cmd' },
    { label: 'ρ', cmd: '\\rho', latex: '\\rho ', type: 'cmd' },
    { label: 'σ', cmd: '\\sigma', latex: '\\sigma ', type: 'cmd' },
    { label: 'τ', cmd: '\\tau', latex: '\\tau ', type: 'cmd' },
    { label: 'υ', cmd: '\\upsilon', latex: '\\upsilon ', type: 'cmd' },
    { label: 'φ', cmd: '\\phi', latex: '\\phi ', type: 'cmd' },
    { label: 'χ', cmd: '\\chi', latex: '\\chi ', type: 'cmd' },
    { label: 'ψ', cmd: '\\psi', latex: '\\psi ', type: 'cmd' },
    { label: 'ω', cmd: '\\omega', latex: '\\omega ', type: 'cmd' },
    { label: 'Γ', cmd: '\\Gamma', latex: '\\Gamma ', type: 'cmd' },
    { label: 'Δ', cmd: '\\Delta', latex: '\\Delta ', type: 'cmd' },
    { label: 'Θ', cmd: '\\Theta', latex: '\\Theta ', type: 'cmd' },
    { label: 'Λ', cmd: '\\Lambda', latex: '\\Lambda ', type: 'cmd' },
    { label: 'Ξ', cmd: '\\Xi', latex: '\\Xi ', type: 'cmd' },
    { label: 'Π', cmd: '\\Pi', latex: '\\Pi ', type: 'cmd' },
    { label: 'Σ', cmd: '\\Sigma', latex: '\\Sigma ', type: 'cmd' },
    { label: 'Φ', cmd: '\\Phi', latex: '\\Phi ', type: 'cmd' },
    { label: 'Ψ', cmd: '\\Psi', latex: '\\Psi ', type: 'cmd' },
    { label: 'Ω', cmd: '\\Omega', latex: '\\Omega ', type: 'cmd' },
  ],
  Operations: [
    { label: '∫', cmd: '\\int', latex: '\\int ', type: 'cmd' },
    { label: '∬', cmd: '\\int \\int ', latex: '\\iint ', type: 'write' },
    { label: '∭', cmd: '\\int \\int \\int ', latex: '\\iiint ', type: 'write' },
    { label: '∮', cmd: '\\oint', latex: '\\oint ', type: 'cmd' },
    { label: '∂', cmd: '\\partial', latex: '\\partial ', type: 'cmd' },
    { label: '∇', cmd: '\\nabla', latex: '\\nabla ', type: 'cmd' },
    { label: '∪', cmd: '\\cup', latex: '\\cup ', type: 'cmd' },
    { label: '∩', cmd: '\\cap', latex: '\\cap ', type: 'cmd' },
    { label: '∨', cmd: '\\vee', latex: '\\vee ', type: 'cmd' },
    { label: '∧', cmd: '\\wedge', latex: '\\wedge ', type: 'cmd' },
    { label: '⊕', cmd: '\\oplus', latex: '\\oplus ', type: 'cmd' },
    { label: '⊗', cmd: '\\otimes', latex: '\\otimes ', type: 'cmd' },
    { label: '∘', cmd: '\\circ', latex: '\\circ ', type: 'cmd' },
    { label: '⋆', cmd: '\\star', latex: '\\star ', type: 'cmd' },
  ],
  Relations: [
    { label: '<', cmd: '<', latex: '<', type: 'write' },
    { label: '>', cmd: '>', latex: '>', type: 'write' },
    { label: '≤', cmd: '\\le', latex: '\\le ', type: 'cmd' },
    { label: '≥', cmd: '\\ge', latex: '\\ge ', type: 'cmd' },
    { label: '≠', cmd: '\\neq', latex: '\\neq ', type: 'cmd' },
    { label: '≈', cmd: '\\approx', latex: '\\approx ', type: 'cmd' },
    { label: '≡', cmd: '\\equiv', latex: '\\equiv ', type: 'cmd' },
    { label: '∼', cmd: '\\sim', latex: '\\sim ', type: 'cmd' },
    { label: '∝', cmd: '\\propto', latex: '\\propto ', type: 'cmd' },
    { label: '∈', cmd: '\\in', latex: '\\in ', type: 'cmd' },
    { label: '∉', cmd: '\\notin', latex: '\\notin ', type: 'cmd' },
    { label: '⊂', cmd: '\\subset', latex: '\\subset ', type: 'cmd' },
    { label: '⊃', cmd: '\\supset', latex: '\\supset ', type: 'cmd' },
    { label: '⊆', cmd: '\\subseteq', latex: '\\subseteq ', type: 'cmd' },
    { label: '⊇', cmd: '\\supseteq', latex: '\\supseteq ', type: 'cmd' },
    { label: '∴', cmd: '\\therefore', latex: '\\therefore ', type: 'cmd' },
    { label: '∵', cmd: '\\because', latex: '\\because ', type: 'cmd' },
  ],
  Arrows: [
    { label: '→', cmd: '\\rightarrow', latex: '\\rightarrow ', type: 'cmd' },
    { label: '←', cmd: '\\leftarrow', latex: '\\leftarrow ', type: 'cmd' },
    { label: '↔', cmd: '\\leftrightarrow', latex: '\\leftrightarrow ', type: 'cmd' },
    { label: '⇒', cmd: '\\Rightarrow', latex: '\\Rightarrow ', type: 'cmd' },
    { label: '⇐', cmd: '\\Leftarrow', latex: '\\Leftarrow ', type: 'cmd' },
    { label: '⇔', cmd: '\\Leftrightarrow', latex: '\\Leftrightarrow ', type: 'cmd' },
    { label: '↑', cmd: '\\uparrow', latex: '\\uparrow ', type: 'cmd' },
    { label: '↓', cmd: '\\downarrow', latex: '\\downarrow ', type: 'cmd' },
    { label: '↕', cmd: '\\updownarrow', latex: '\\updownarrow ', type: 'cmd' },
    { label: '↦', cmd: '\\mapsto', latex: '\\mapsto ', type: 'cmd' },
  ],
  Delimiter: [
    { label: '( )', cmd: '(', latex: '\\left( \\right)', type: 'cmd' },
    { label: '[ ]', cmd: '[', latex: '\\left[ \\right]', type: 'cmd' },
    { label: '{ }', cmd: '\\{', latex: '\\left\\{ \\right\\}', type: 'cmd' },
    { label: '| |', cmd: '|', latex: '\\left| \\right|', type: 'cmd' },
    { label: '‖ ‖', cmd: '\\|', latex: '\\left\\| \\right\\|', type: 'cmd' },
    { label: '⟨ ⟩', cmd: '\\langle', latex: '\\left\\langle \\right\\rangle', type: 'cmd' },
    { label: '⌊ ⌋', cmd: '\\lfloor', latex: '\\left\\lfloor \\right\\rfloor', type: 'cmd' },
    { label: '⌈ ⌉', cmd: '\\lceil', latex: '\\left\\lceil \\right\\rceil', type: 'cmd' },
  ],
  Misc: [
    { label: '∞', cmd: '\\infty', latex: '\\infty ', type: 'cmd' },
    { label: '°', cmd: '^\\circ', latex: '^\\circ ', type: 'cmd' },
    { label: '%', cmd: '\\%', latex: '\\% ', type: 'cmd' },
    { label: '!', cmd: '!', latex: '!', type: 'write' },
    { label: '∅', cmd: '\\emptyset', latex: '\\emptyset ', type: 'cmd' },
    { label: '∃', cmd: '\\exists', latex: '\\exists ', type: 'cmd' },
    { label: '∄', cmd: '\\nexists', latex: '\\nexists ', type: 'cmd' },
    { label: '∀', cmd: '\\forall', latex: '\\forall ', type: 'cmd' },
    { label: '∠', cmd: '\\angle', latex: '\\angle ', type: 'cmd' },
    { label: '△', cmd: '\\triangle', latex: '\\triangle ', type: 'cmd' },
    { label: '□', cmd: '\\square', latex: '\\square ', type: 'cmd' },
    { label: 'ℓ', cmd: '\\ell', latex: '\\ell ', type: 'cmd' },
    { label: 'ℏ', cmd: '\\hbar', latex: '\\hbar ', type: 'cmd' },
  ]
};

export default function EquationToolModal({ isOpen, onClose, editor, editingEquationId, initialLatex }) {
  const [activeTab, setActiveTab] = useState('Basic');
  const [mode, setMode] = useState('Smart Mode'); // 'Smart Mode' or 'Raw LaTeX'
  const [inputValue, setInputValue] = useState('');
  const previewRef = useRef(null);
  const mathFieldRef = useRef(null);
  const mqRef = useRef(null);
  const textareaRef = useRef(null);

  // Pre-populate input when modal opens
  useEffect(() => {
    if (isOpen) {
      setInputValue(initialLatex || '');
    }
  }, [isOpen, initialLatex]);

  const handleSymbolClick = (symbol) => {
    if (mode === 'Smart Mode') {
      if (mqRef.current) {
        if (symbol.type === 'cmd') {
          mqRef.current.cmd(symbol.cmd);
        } else {
          mqRef.current.write(symbol.cmd);
        }
        mqRef.current.focus();
      }
    } else {
      // Raw LaTeX Mode
      if (textareaRef.current) {
        const start = textareaRef.current.selectionStart;
        const end = textareaRef.current.selectionEnd;
        const insertText = symbol.latex || symbol.cmd;
        
        const newText = inputValue.substring(0, start) + insertText + inputValue.substring(end);
        setInputValue(newText);
        
        // Restore focus and cursor
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            const newCursorPos = start + insertText.length;
            // For brackets/commands, we usually want cursor inside.
            // A simple approximation: if it ends with '}', put cursor before it.
            let offset = newCursorPos;
            if (insertText.endsWith('}')) offset -= 1;
            else if (insertText.endsWith('\\right)')) offset -= 7;
            
            textareaRef.current.setSelectionRange(offset, offset);
          }
        }, 0);
      } else {
        setInputValue(prev => prev + (symbol.latex || symbol.cmd));
      }
    }
  };

  // MathQuill Initialization for Smart Mode
  useEffect(() => {
    if (mode === 'Smart Mode' && isOpen && mathFieldRef.current) {
      let active = true;
      const loadMathQuill = async () => {
        await import('mathquill/build/mathquill.css');
        await import('mathquill/build/mathquill.js');
        if (!active) return;

        const MQ = window.MathQuill.getInterface(2);
        if (!mqRef.current) {
          // Store the current input value so we don't overwrite it immediately on edit
          const initialValue = inputValue;
          let isInitializing = true;

          mqRef.current = MQ.MathField(mathFieldRef.current, {
            spaceBehavesLikeTab: true,
            handlers: {
              edit: (mathField) => {
                if (!isInitializing) {
                  setInputValue(mathField.latex());
                }
              }
            }
          });
          
          mqRef.current.latex(initialValue);
          isInitializing = false;
        }
      };

      loadMathQuill().catch(err => console.error('MathQuill load error:', err));

      return () => {
        active = false;
        mqRef.current = null;
      };
    }
  }, [mode, isOpen]); // re-init when switching to Smart Mode

  // KaTeX Live Preview for Raw LaTeX
  useEffect(() => {
    if (previewRef.current) {
      if (inputValue.trim()) {
        try {
          katex.render(inputValue, previewRef.current, {
            displayMode: true,
            throwOnError: false,
            strict: false
          });
        } catch (e) {
          // Fallback if fatal error
          previewRef.current.innerHTML = `<span class="text-red-500">${e.message}</span>`;
        }
      } else {
        previewRef.current.innerHTML = '';
      }
    }
  }, [inputValue, mode]); // run when inputValue changes or mode switches

  const handleAddToWhiteboard = () => {
    const finalLatex = inputValue.trim();
    if (!finalLatex) return;

    if (editor) {
      if (editingEquationId) {
        // Update existing shape
        editor.updateShape({
          id: editingEquationId,
          type: 'equation',
          props: {
            latex: finalLatex
          }
        });
      } else {
        // Create new shape
        const center = editor.getViewportPageBounds().center;
        
        editor.createShape({
          type: 'equation',
          x: center.x - 150, // rough horizontal centering
          y: center.y - 45,  // rough vertical centering
          props: {
            w: 300,
            h: 90,
            latex: finalLatex,
            color: '#1e293b',
          },
        });
      }
      
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-auto">
      <div 
        className="bg-white dark:bg-gray-950 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[calc(100vh-160px)] flex flex-col border border-gray-200 dark:border-gray-800 transition-colors duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white tracking-tight">Equation Tool</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Row */}
        <div className="px-6 border-b border-gray-100 dark:border-gray-800 overflow-x-auto custom-scrollbar">
          <div className="flex gap-6 min-w-max">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Body (Side-by-side) */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-gray-50/50 dark:bg-gray-900/50">
          
          {/* Left: Symbol Grid Area */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar border-r border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
              {activeTab} Symbols
            </h3>
            {/* Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {(SYMBOL_TABS[activeTab] || []).map((symbol, i) => (
                <button
                  key={i}
                  onClick={() => handleSymbolClick(symbol)}
                  className="aspect-square bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-center text-gray-700 dark:text-gray-200 font-medium hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-sm transition-all"
                  title={symbol.label}
                >
                  {symbol.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Input & Mode Area */}
          <div className="w-full md:w-80 flex flex-col p-6 bg-white dark:bg-gray-950 shrink-0 overflow-y-auto custom-scrollbar">
            {/* Mode Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
              {['Smart Mode', 'Raw LaTeX'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    mode === m
                      ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Input Area */}
            <div className="flex flex-col shrink-0">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Equation Input
              </label>
              
              {mode === 'Smart Mode' ? (
                <div 
                  className="w-full h-32 shrink-0 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-100 text-lg focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all flex items-center overflow-auto"
                >
                  <div 
                    ref={mathFieldRef} 
                    className="w-full min-h-[40px] border-none shadow-none outline-none flex items-center" 
                    style={{ border: 'none', boxShadow: 'none' }} 
                  />
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="\\frac{x^2}{y}"
                  className="w-full h-32 shrink-0 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              )}
              
              <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                {mode === 'Smart Mode' 
                  ? 'Smart mode auto-formats standard math notations.' 
                  : 'Enter raw LaTeX code directly.'}
              </div>
            </div>

            {/* Live Preview Area (Only in Raw LaTeX mode) */}
            {mode === 'Raw LaTeX' && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col min-h-[120px] shrink-0">
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  Live Preview
                </label>
                <div className="flex-1 relative bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl flex items-center justify-center p-4 overflow-hidden shadow-sm">
                  <div ref={previewRef} className="w-full overflow-auto flex justify-center text-gray-900 dark:text-gray-100" />
                  {!inputValue.trim() && (
                    <span className="text-gray-400 dark:text-gray-500 text-sm italic absolute">Preview will appear here</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 flex justify-end items-center rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all mr-3"
          >
            Cancel
          </button>
          <button
            onClick={handleAddToWhiteboard}
            disabled={!inputValue.trim()}
            className={`px-5 py-2.5 text-sm font-semibold text-white rounded-xl shadow-sm transition-all flex items-center gap-2 ${
              inputValue.trim() 
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' 
                : 'bg-blue-300 cursor-not-allowed'
            }`}
          >
            {editingEquationId ? 'Update Whiteboard' : 'Add to Whiteboard'}
          </button>
        </div>
      </div>
    </div>
  );
}
