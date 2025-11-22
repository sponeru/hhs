import React from 'react';

export const FloatingTexts = ({ floatingTexts }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {floatingTexts.map(ft => (
        <div key={ft.id} className="absolute flex flex-col items-center animate-[floatUp_0.8s_forwards]" style={{ left: `${ft.x}%`, top: `${ft.y}%` }}>
          <span className={`font-black ${ft.isCrit ? 'text-4xl' : 'text-2xl'} text-${ft.color === 'red' ? 'red-500' : ft.color === 'green' ? 'green-400' : ft.color === 'yellow' ? 'yellow-400' : 'white'} drop-shadow-md`}>{ft.text}{ft.isCrit && "!"}</span>
        </div>
      ))}
      <style>{`@keyframes floatUp { 0% { transform:translate(-50%,0) scale(0.8); opacity:1; } 100% { transform:translate(-50%,-100px) scale(1); opacity:0; } }`}</style>
    </div>
  );
};

