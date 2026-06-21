import React, { useEffect, useRef } from 'react';

export default function DesmosTest() {
  const calculatorRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Check if Desmos is already loaded
    if (window.Desmos) {
      initCalculator();
      return;
    }

    // Load the Desmos script
    const script = document.createElement('script');
    script.src = 'https://www.desmos.com/api/v1.10/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
    script.async = true;
    script.onload = () => {
      initCalculator();
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (calculatorRef.current) {
        calculatorRef.current.destroy();
      }
    };
  }, []);

  const initCalculator = () => {
    if (containerRef.current && window.Desmos && !calculatorRef.current) {
      calculatorRef.current = window.Desmos.GraphingCalculator(containerRef.current);
      
      // Add first expression (parabola)
      calculatorRef.current.setExpression({
        id: 'graph1',
        latex: 'y=x^2+3x-4',
        color: window.Desmos.Colors.BLUE
      });

      // Add second expression (line)
      calculatorRef.current.setExpression({
        id: 'graph2',
        latex: 'y=-2x+5',
        color: window.Desmos.Colors.RED
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 p-8 w-full h-full overflow-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Desmos Integration Test</h1>
      
      <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-200">
        <div 
          id="calculator" 
          ref={containerRef}
          style={{ width: '600px', height: '400px' }}
          className="rounded-lg overflow-hidden border border-gray-300"
        ></div>
      </div>
    </div>
  );
}
