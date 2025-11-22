import React from 'react';

export const PortalModal = ({ onClose, onStartDungeon }) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-8" onClick={onClose}>
      <div className="bg-gray-800 w-full max-w-md rounded-xl border-2 border-gray-700 p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4">始まりの平原</h3>
        <p className="text-base text-gray-400 mb-8">全5階層。コストなしで何度でも挑戦できます。</p>
        <button onClick={() => { onStartDungeon(null); onClose(); }} className="w-full py-4 bg-blue-600 rounded-lg font-bold text-lg hover:bg-blue-500 transition-colors">出発</button>
      </div>
    </div>
  );
};

