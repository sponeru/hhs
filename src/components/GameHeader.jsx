import React from 'react';
import { 
  Coins, Flame, Backpack, Hammer, Save, Upload, 
  Trophy, Sparkles, LogOut 
} from 'lucide-react';
import { MAX_INVENTORY, MAX_WAREHOUSE } from '../constants.jsx';

export const GameHeader = ({
  phase,
  player,
  activeDungeon,
  getStats,
  tab,
  setTab,
  inventory,
  warehouse,
  manualSave,
  manualLoad,
  returnToTown,
}) => {
  return (
    <header className="bg-gray-900 px-6 py-4 flex justify-between items-center shadow-md z-10 border-b border-gray-800">
      <div className="flex items-center gap-4">
        <div className="bg-gray-800 px-4 py-2 rounded-lg text-yellow-500 font-bold text-base flex items-center gap-2">
          <Coins size={18} /> {player.gold.toLocaleString()}
        </div>
        <div className="text-sm text-gray-400">
          {phase === 'town' ? 'Town' : `F${activeDungeon?.floor} (${activeDungeon?.floor - activeDungeon?.startFloor + 1}/${activeDungeon?.maxFloor})`}
        </div>
        {phase === 'dungeon' && (
          <div className="flex items-center gap-2 text-sm">
            <div className="text-blue-400 font-bold">Lv.{player.level}</div>
            <div className="text-green-400 font-bold">{player.hp} / {getStats.maxHp}</div>
            <div className="text-cyan-400 font-bold">{player.mp} / {player.maxMp || 50}</div>
          </div>
        )}
      </div>
      {phase === 'town' ? (
        <div className="flex gap-3">
          <button onClick={() => setTab('portal')} className={`px-4 py-2 rounded-lg transition-all ${tab === 'portal' ? 'bg-orange-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            <Flame size={20} className="inline mr-2" />
            <span className="hidden md:inline">冒険</span>
          </button>
          <button onClick={() => setTab('inventory')} className={`px-4 py-2 rounded-lg transition-all relative ${tab === 'inventory' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            <Backpack size={20} className="inline mr-2" />
            <span className="hidden md:inline">インベントリ・倉庫</span>
            {(inventory.length >= MAX_INVENTORY || warehouse.length >= MAX_WAREHOUSE) && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-900" />}
          </button>
          <button onClick={() => setTab('equipment')} className={`px-4 py-2 rounded-lg transition-all relative ${tab === 'equipment' ? 'bg-green-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            <Hammer size={20} className="inline mr-2" />
            <span className="hidden md:inline">装備強化</span>
            {inventory.filter(i => ['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'].includes(i.type)).length > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
            )}
          </button>
          <button onClick={manualSave} className="px-4 py-2 rounded-lg transition-all bg-green-700 text-white hover:bg-green-600" title="手動セーブ">
            <Save size={20} className="inline mr-2" />
            <span className="hidden md:inline">セーブ</span>
          </button>
          <button onClick={manualLoad} className="px-4 py-2 rounded-lg transition-all bg-blue-700 text-white hover:bg-blue-600" title="手動ロード">
            <Upload size={20} className="inline mr-2" />
            <span className="hidden md:inline">ロード</span>
          </button>
          <button onClick={() => setTab('stats')} className={`px-4 py-2 rounded-lg transition-all relative ${tab === 'stats' ? 'bg-yellow-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            <Trophy size={20} className="inline mr-2" />
            <span className="hidden md:inline">ステータス</span>
          </button>
          <button onClick={() => setTab('skills')} className={`px-4 py-2 rounded-lg transition-all relative ${tab === 'skills' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            <Sparkles size={20} className="inline mr-2" />
            <span className="hidden md:inline">スキル</span>
            {(player.skillPoints || 0) > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-900" />}
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <button onClick={returnToTown} className="bg-red-900/50 text-red-200 px-4 py-2 rounded-lg border border-red-800 flex items-center gap-2 hover:bg-red-900 transition-all">
            <LogOut size={16} /> 
            <span className="hidden md:inline">帰還</span>
          </button>
          <button onClick={manualSave} className="px-4 py-2 rounded-lg transition-all bg-green-700 text-white hover:bg-green-600" title="手動セーブ">
            <Save size={20} className="inline mr-2" />
            <span className="hidden md:inline">セーブ</span>
          </button>
          <button onClick={manualLoad} className="px-4 py-2 rounded-lg transition-all bg-blue-700 text-white hover:bg-blue-600" title="手動ロード">
            <Upload size={20} className="inline mr-2" />
            <span className="hidden md:inline">ロード</span>
          </button>
        </div>
      )}
    </header>
  );
};

