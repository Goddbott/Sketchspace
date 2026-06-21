import { BaseBoxShapeUtil, HTMLContainer, T } from 'tldraw';
import React, { useRef, useEffect } from 'react';

// Shape type identifier
export const GRAPH_SHAPE_TYPE = 'graph';

const DesmosRenderer = ({ shape, editor }) => {
  const { expressions, w, h } = shape.props;
  const containerRef = useRef(null);
  const calculatorRef = useRef(null);

  useEffect(() => {
    let active = true;

    const initCalculator = () => {
      if (!active || !containerRef.current || !window.Desmos) return;
      
      if (!calculatorRef.current) {
        calculatorRef.current = window.Desmos.GraphingCalculator(containerRef.current, {
          keypad: false,
          expressions: false,
          settingsMenu: false,
          zoomButtons: false,
          lockViewport: true, // Prevents panning/zooming inside the canvas shape
        });
      }

      calculatorRef.current.setBlank();
      if (expressions && Array.isArray(expressions)) {
        expressions.forEach((latex, index) => {
          calculatorRef.current.setExpression({
            id: `expr-${index}`,
            latex: latex
          });
        });
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
  }, [expressions]);

  useEffect(() => {
    if (calculatorRef.current) {
      calculatorRef.current.resize();
    }
  }, [w, h]);

  return (
    <div 
      ref={containerRef} 
      style={{ width: '100%', height: '100%', pointerEvents: 'all' }} 
      className="rounded-lg overflow-hidden border border-gray-200 shadow-sm"
    />
  );
};

export class GraphShapeUtil extends BaseBoxShapeUtil {
  static type = GRAPH_SHAPE_TYPE;

  static props = {
    w: T.number,
    h: T.number,
    expressions: T.arrayOf(T.string),
  };

  getDefaultProps() {
    return {
      w: 400,
      h: 300,
      expressions: [],
    };
  }

  onDoubleClick = (shape) => {
    window.dispatchEvent(new CustomEvent('edit-graph', { detail: shape }));
  }

  async toSvg(shape) {
    const { w, h, expressions } = shape.props;
    
    if (!window.Desmos) return null;

    // Create a temporary off-screen container for headless rendering
    const container = document.createElement('div');
    container.style.width = `${w}px`;
    container.style.height = `${h}px`;
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    const calc = window.Desmos.GraphingCalculator(container, {
      keypad: false,
      expressions: false,
      settingsMenu: false,
      zoomButtons: false,
    });
    
    calc.setBlank();
    if (expressions && Array.isArray(expressions)) {
      expressions.forEach((latex, index) => {
        calc.setExpression({ id: `expr-${index}`, latex });
      });
    }

    return new Promise((resolve) => {
      // Give Desmos a moment to plot the functions before screenshotting
      setTimeout(() => {
        calc.asyncScreenshot({ width: w, height: h, preserveAxisLabels: true }, (dataUrl) => {
          calc.destroy();
          document.body.removeChild(container);
          
          resolve(
            <image href={dataUrl} width={w} height={h} />
          );
        });
      }, 500); 
    });
  }

  component(shape) {
    const { expressions, w, h } = shape.props;
    
    return (
      <HTMLContainer
        id={shape.id}
        style={{
          width: '100%',
          height: '100%',
          pointerEvents: 'all',
          overflow: 'hidden',
          backgroundColor: 'white',
          borderRadius: '8px',
        }}
      >
        <DesmosRenderer shape={shape} editor={this.editor} />
      </HTMLContainer>
    );
  }

  getIndicatorPath(shape) {
    const path = new Path2D();
    path.rect(0, 0, shape.props.w, shape.props.h);
    return path;
  }
}
