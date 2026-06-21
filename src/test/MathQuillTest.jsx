import React, { useRef, useEffect, useState } from 'react';

// jQuery global MUST be set before mathquill is imported
import '../lib/jquerySetup';
import { BlockMath } from 'react-katex';

const MathQuillTest = () => {
  const mathFieldRef = useRef(null);
  const mqRef = useRef(null);
  const [latex, setLatex] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Dynamically import mathquill after jQuery is on window
    const loadMathQuill = async () => {
      // Import mathquill CSS
      await import('mathquill/build/mathquill.css');
      // Import mathquill JS (it attaches to window.jQuery)
      await import('mathquill/build/mathquill.js');

      const MQ = window.MathQuill.getInterface(2);
      if (mathFieldRef.current && !mqRef.current) {
        mqRef.current = MQ.MathField(mathFieldRef.current, {
          spaceBehavesLikeTab: true,
          handlers: {
            edit: (mathField) => {
              setLatex(mathField.latex());
            }
          }
        });
        setLoaded(true);
      }
    };

    loadMathQuill().catch(err => console.error('MathQuill load error:', err));

    return () => {
      mqRef.current = null;
    };
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
      fontFamily: 'Inter, system-ui, sans-serif',
      gap: '24px',
      padding: '40px'
    }}>
      <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1e293b' }}>
        MathQuill Test
      </h1>
      <p style={{ fontSize: '14px', color: '#64748b', marginTop: '-12px' }}>
        Type <code style={{ background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>x^2/y</code> to test fraction rendering
      </p>

      <div style={{
        background: '#fff',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        padding: '16px 24px',
        minWidth: '400px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div 
          ref={mathFieldRef}
          style={{
            fontSize: '24px',
            minHeight: '48px',
          }}
        />
      </div>

      {!loaded && (
        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Loading MathQuill...</p>
      )}

      <div style={{
        marginTop: '16px',
        padding: '12px 20px',
        background: '#f1f5f9',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#475569'
      }}>
        <strong>Raw LaTeX:</strong> <code>{latex || '(empty)'}</code>
      </div>

      {/* Static KaTeX render test */}
      <div style={{
        marginTop: '8px',
        padding: '20px 28px',
        background: '#fff',
        border: '2px solid #e2e8f0',
        borderRadius: '12px',
        minWidth: '400px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
          KaTeX Live Preview
        </p>
        <BlockMath math={latex || '\\text{Type above to see live preview}'} />
      </div>
    </div>
  );
};

export default MathQuillTest;
