import { BaseBoxShapeUtil, HTMLContainer, T } from 'tldraw';
import React, { useRef, useEffect } from 'react';
import katex from 'katex';

// Shape type identifier
const EQUATION_SHAPE_TYPE = 'equation';

const KaTeXRenderer = ({ latex }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && latex) {
      try {
        katex.render(latex, containerRef.current, {
          displayMode: true,
          throwOnError: false,
          strict: false,
        });
      } catch (e) {
        containerRef.current.innerHTML = `<span style="color: red">${e.message}</span>`;
      }
    }
  }, [latex]);

  return <div ref={containerRef} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} />;
};

// Custom shape util for math equations rendered via KaTeX
export class EquationShapeUtil extends BaseBoxShapeUtil {
  static type = EQUATION_SHAPE_TYPE;

  static props = {
    w: T.number,
    h: T.number,
    latex: T.string,
    color: T.string,
  };

  getDefaultProps() {
    return {
      w: 260,
      h: 80,
      latex: '',
      color: '#1e293b',
    };
  }

  onDoubleClick = (shape) => {
    window.dispatchEvent(new CustomEvent('edit-equation', { detail: shape }));
  }

  component(shape) {
    const { latex, color, w, h } = shape.props;
    
    // Scale font size based on the shape's current size vs default size (260x80)
    const scale = Math.min(w / 260, h / 80);
    const fontSize = Math.max(12, 24 * scale);

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px 16px',
          color,
          pointerEvents: 'all',
          overflow: 'hidden',
          fontSize: `${fontSize}px`
        }}
      >
        {latex ? (
          <KaTeXRenderer latex={latex} />
        ) : (
          <span style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>
            Empty equation
          </span>
        )}
      </HTMLContainer>
    );
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    // Using rect() instead of roundRect() to prevent any potential Path2D browser compatibility crashes during resize
    path.rect(0, 0, shape.props.w, shape.props.h);
    return path;
  }
}
