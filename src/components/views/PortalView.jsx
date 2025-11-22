import React from 'react';
import { Flame, Map as MapIcon, ArrowRight } from 'lucide-react';
import { RARITIES, MAX_STONES } from '../../constants.jsx';

export const PortalView = ({ stones, onSelectStone, onSelectPortal }) => {
  return (
    <div className="p-8 bg-slate-900 min-h-full">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <Flame className="text-orange-500" size={28} /> 冒険に出る
      </h2>
      <div onClick={() => onSelectPortal({ type: 'portal_basic' })} className="bg-gray-800 p-6 rounded-xl border-2 border-gray-700 mb-8 cursor-pointer hover:bg-gray-750 hover:border-gray-500 transition-all">
        <div className="flex items-center gap-6">
          <div className="bg-gray-700 p-4 rounded-full"><MapIcon size={32} className="text-gray-400" /></div>
          <div className="flex-1">
            <div className="font-bold text-white text-xl mb-1">始まりの平原</div>
            <div className="text-sm text-gray-400">5階層 | コストなし</div>
          </div>
          <ArrowRight className="text-gray-600" size={24} />
        </div>
      </div>
      <h3 className="text-base font-bold text-gray-400 mb-4 uppercase">魔法石 ({stones.length}/{MAX_STONES})</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {stones.map(stone => {
          const rarity = RARITIES[stone.rarity];
          return (
            <div key={stone.id} onClick={() => onSelectStone(stone)} className={`bg-slate-800 p-4 rounded-lg border-2 ${rarity.border} cursor-pointer hover:brightness-110 hover:scale-105 transition-all relative overflow-hidden`}>
              <div className={`absolute top-0 left-0 w-1.5 h-full ${rarity.bg.replace('bg-', 'bg-')}`}></div>
              <div className="flex items-center gap-4 pl-3">
                <div className={`bg-slate-900 p-3 rounded-lg ${rarity.color}`}><MapIcon size={24} /></div>
                <div className="flex-1">
                  <div className={`${rarity.color} font-bold text-base mb-1`}>{stone.name}</div>
                  <div className="text-xs text-slate-400">Tier {stone.tier} / 深度:{stone.maxFloor}F</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

