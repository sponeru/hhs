import React, { useState, useRef, useEffect } from 'react';
import { 
  Coins, Flame, Backpack, Hammer, Save, Upload, 
  Trophy, Sparkles, LogOut, User, UserPlus, Trash2, ChevronDown
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
  currentCharacterId,
  characters = [],
  switchCharacter = () => {},
  createNewCharacter = () => {},
  deleteCharacterById = () => {},
}) => {
  const [showCharacterMenu, setShowCharacterMenu] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newCharacterName, setNewCharacterName] = useState('');
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuButtonRef = useRef(null);
  
  const currentCharacter = characters?.find(c => c.id === currentCharacterId);
  
  // メニューボタンの位置を取得
  useEffect(() => {
    if (showCharacterMenu && menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.left
      });
    }
  }, [showCharacterMenu]);
  
  const handleCreateCharacter = () => {
    const trimmedName = newCharacterName.trim();
    if (trimmedName) {
      if (!createNewCharacter) {
        console.error("createNewCharacter function is not defined");
        return;
      }
      createNewCharacter(trimmedName);
      setNewCharacterName('');
      setShowCreateDialog(false);
    } else {
      // 名前が入力されていない場合は警告を表示
      alert("キャラクター名を入力してください");
    }
  };
  return (
    <>
      <header className="bg-gray-900 px-6 py-4 flex justify-between items-center shadow-md z-10 border-b border-gray-800">
        <div className="flex items-center gap-4">
          {/* キャラクター選択UI */}
          <div className="relative">
            <button
              ref={menuButtonRef}
              onClick={() => {
                console.log("Character menu button clicked");
                setShowCharacterMenu(!showCharacterMenu);
              }}
              className="bg-gray-800 px-4 py-2 rounded-lg text-white hover:bg-gray-700 transition-all flex items-center gap-2 min-w-[180px]"
            >
              <User size={18} />
              <span className="text-sm font-medium flex-1 text-left">
                {currentCharacter ? currentCharacter.name : 'キャラクター未選択'}
              </span>
              <ChevronDown size={16} className={`transition-transform ${showCharacterMenu ? 'rotate-180' : ''}`} />
            </button>
          </div>
          
          {showCharacterMenu && (
            <>
              {/* メニューを閉じるためのオーバーレイ - 最初にレンダリング */}
              <div
                className="fixed inset-0 z-[95]"
                onClick={() => {
                  console.log("Menu overlay clicked, closing menu");
                  setShowCharacterMenu(false);
                }}
              />
              
              {/* メニューコンテナ - オーバーレイの上に配置 */}
              <div 
                className="fixed bg-gray-800 rounded-lg shadow-xl border border-gray-700 min-w-[240px] z-[100]"
                style={{
                  top: `${menuPosition.top}px`,
                  left: `${menuPosition.left}px`
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  console.log("Menu container clicked");
                }}
              >
                <div className="p-2 max-h-[400px] overflow-y-auto">
                  {!characters || characters.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-400 text-center">
                      キャラクターがありません
                    </div>
                  ) : (
                    characters.map(char => (
                      <div
                        key={char.id}
                        className={`px-3 py-2 rounded hover:bg-gray-700 cursor-pointer flex items-center justify-between group ${
                          char.id === currentCharacterId ? 'bg-gray-700' : ''
                        }`}
                        onClick={() => {
                          if (char.id !== currentCharacterId) {
                            switchCharacter(char.id);
                          }
                          setShowCharacterMenu(false);
                        }}
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <User size={14} className="text-gray-400" />
                          <span className="text-sm text-white">{char.name}</span>
                        </div>
                        {characters && characters.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (deleteCharacterById) {
                                deleteCharacterById(char.id);
                              }
                              if (char.id === currentCharacterId) {
                                setShowCharacterMenu(false);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-900 rounded"
                            title="削除"
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                  <div className="border-t border-gray-700 mt-2 pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Create button clicked, setting showCreateDialog to true");
                        setShowCreateDialog(true);
                        setShowCharacterMenu(false);
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="w-full px-3 py-2 rounded hover:bg-gray-700 flex items-center gap-2 text-sm text-green-400 cursor-pointer"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <UserPlus size={14} />
                      <span>新規キャラクター作成</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
          
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
    
    {/* キャラクター作成ダイアログ */}
    {showCreateDialog && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[110]" onClick={(e) => {
        console.log("Dialog overlay clicked");
        setShowCreateDialog(false);
      }}>
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700" onClick={(e) => e.stopPropagation()}>
          <h3 className="text-xl font-bold mb-4 text-white">新規キャラクター作成</h3>
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">キャラクター名</label>
            <input
              type="text"
              value={newCharacterName}
              onChange={(e) => setNewCharacterName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateCharacter();
                }
                if (e.key === 'Escape') {
                  setShowCreateDialog(false);
                  setNewCharacterName('');
                }
              }}
              placeholder="キャラクター名を入力"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => {
                setShowCreateDialog(false);
                setNewCharacterName('');
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all"
            >
              キャンセル
            </button>
            <button
              onClick={handleCreateCharacter}
              disabled={!newCharacterName.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              作成
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

