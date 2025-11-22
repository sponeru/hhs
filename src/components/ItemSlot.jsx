import React, { useState, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { ItemIcon } from './ItemIcon';
import { RARITIES } from '../constants.jsx';

export const ItemSlot = React.memo(({ 
  item, 
  onClick, 
  isEquipped = false, 
  isSelected = false, 
  iconSize,
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
  isDropTarget = false,
  dragSource = null,
}) => {
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipTimeoutRef = useRef(null);

  if (!item) return (
      <div 
        className={`aspect-square bg-gray-800 rounded-lg border-2 ${isDropTarget ? 'border-blue-500 bg-blue-900/30' : 'border-gray-700'} flex items-center justify-center opacity-50 ${onDrop ? 'cursor-pointer' : ''}`}
        onDragOver={onDragOver}
        onDrop={onDrop}
      >
          <div className="w-3 h-3 rounded-full bg-gray-700" />
      </div>
  );

  const isStone = item.type === 'stone';
  const isSkill = item.type === 'skill';
  const isInk = item.type === 'ink';
  const rarity = RARITIES[item.rarity] || RARITIES.common;
  const hasSpecial = item.options?.some(o => o.isSpecial) || (isStone && item.rarity === 'legendary') || (isInk && item.mod.isRare);

  const equipmentItemTypes = ['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'];
  const isEquipmentItem = equipmentItemTypes.includes(item.type);
  
  let label = `Lv.${Math.floor(item.power)}`;
  if (isStone) label = `Lv.${item.tier}`;
  if (isSkill) label = 'Scroll';
  if (isInk) label = 'Ink';
  if (isEquipmentItem && item.count && item.count > 1) {
    label = `x${item.count}`;
  } else if (isEquipmentItem) {
    label = '';
  }

  // コンテナサイズに応じてアイコンサイズを調整（デフォルトは28）
  const defaultIconSize = 28;
  const calculatedIconSize = iconSize || defaultIconSize;

  const handleMouseEnter = (e) => {
    if (!item) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setShowTooltip(false);
  };

  const handleMouseMove = (e) => {
    if (!item || !showTooltip) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  };

  const handleDragStart = (e) => {
    if (!onDragStart || !item) return;
    onDragStart(e, item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({ itemId: item.id, item }));
  };

  const handleDragEnd = (e) => {
    if (onDragEnd) {
      onDragEnd(e, item);
    }
  };

  const isDragging = dragSource?.id === item.id;

  return (
      <>
      <button 
          draggable={!!onDragStart && !!item}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onClick={() => item && onClick(item)}
          onMouseEnter={item ? handleMouseEnter : undefined}
          onMouseLeave={item ? handleMouseLeave : undefined}
          onMouseMove={item ? handleMouseMove : undefined}
          className={`item-slot-button aspect-square relative rounded-lg p-2 flex flex-col items-center justify-center transition-all ${item ? 'hover:scale-110 hover:shadow-lg active:scale-95 cursor-pointer' : 'cursor-default'} ${item ? rarity.bg : 'bg-gray-800'} ${item ? rarity.border : 'border-gray-700'} ${isSelected ? 'shadow-[0_0_15px_currentColor] ring-2 ring-white' : ''} ${isDragging ? 'opacity-50' : ''} ${isDropTarget ? 'ring-4 ring-blue-500' : ''}`}
      >
          <div className={`${rarity.color} relative`}>
              <ItemIcon item={item} size={calculatedIconSize} />
              {hasSpecial && <Sparkles size={Math.max(12, calculatedIconSize * 0.5)} className="absolute -top-1 -right-2 text-yellow-200 animate-pulse" />}
              {isSkill && item.inks && item.inks.length > 0 && (
                 <div className="absolute -bottom-1 -right-2 flex gap-0.5">
                    {item.inks.map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-purple-500 border border-black" />)}
                 </div>
              )}
          </div>
          {item.isNew && !isEquipped && (
              <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-gray-900" />
          )}
          {isEquipped && (
              <div className="absolute -top-2 -left-2 bg-yellow-600 text-[10px] px-1.5 py-0.5 rounded text-white font-bold border-2 border-gray-900">E</div>
          )}
          {isEquipmentItem && item.count && item.count > 1 && (
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-[10px] px-1.5 py-0.5 rounded text-white font-bold border-2 border-gray-900">
                {item.count}
              </div>
          )}
          {label && (
            <div className="text-[10px] text-gray-300 truncate w-full text-center mt-1.5 px-1 leading-tight font-medium">
              {label}
            </div>
          )}
      </button>
      {showTooltip && (
        <div
          className="fixed z-[9999] pointer-events-none bg-gray-900 border-2 border-gray-700 rounded-lg p-3 shadow-2xl min-w-[270px] max-w-[375px]"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%) translateY(-8px)',
          }}
        >
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-700">
            <div className={`w-9 h-9 rounded flex items-center justify-center border ${rarity.bg} ${rarity.border}`}>
              <div className={rarity.color}>
                <ItemIcon item={item} size={24} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-xs font-bold uppercase ${rarity.color} truncate`}>
                {rarity.label}
              </div>
              <div className="text-sm font-bold truncate">{item.name || '無名のアイテム'}</div>
            </div>
          </div>
          <div className="text-sm space-y-1">
            {item.type === 'ink' && (
              <div className="text-purple-300">
                <div>効果: {item.mod.label} {item.mod.val > 0 ? '+' : ''}{item.mod.val}{item.mod.unit || ''}</div>
                {item.mod.penalty && (
                  <div className="text-red-400 text-xs mt-1">
                    デメリット: {item.mod.penalty.type === 'power_down' ? '威力低下' : 'CD増加'} {item.mod.penalty.val * 100}%
                  </div>
                )}
              </div>
            )}
            {item.type === 'enhancement_stone' && (
              <div className="text-yellow-300">
                <div>基本ステータス +{(item.mult * 100).toFixed(0)}%</div>
              </div>
            )}
            {item.type === 'enchant_scroll' && (
              <div className="text-blue-300">
                <div>オプション +1</div>
              </div>
            )}
            {item.baseStats && Object.entries(item.baseStats).map(([k, v]) => (
              <div key={k} className="text-sm">
                <span className="text-gray-400 uppercase">{k}: </span>
                <span className="font-bold">{v}</span>
              </div>
            ))}
            {item.skillData && (
              <>
                {item.skillData.level && (
                  <div className="text-yellow-400 font-bold">Lv.{item.skillData.level}</div>
                )}
                <div className="text-sm">
                  <span className="text-gray-400">タイプ: </span>
                  <span className="font-bold">{item.skillData.type === 'buff' ? 'BUFF' : item.skillData.type === 'heal' ? 'HEAL' : 'ATTACK'}</span>
                </div>
                {item.skillData.power !== undefined && (
                  <div className="text-sm">
                    <span className="text-gray-400">威力: </span>
                    <span className="font-bold">x{typeof item.skillData.power === 'number' ? item.skillData.power.toFixed(1) : item.skillData.power}</span>
                  </div>
                )}
                {item.skillData.cd !== undefined && (
                  <div className="text-sm">
                    <span className="text-gray-400">CD: </span>
                    <span className="font-bold">{item.skillData.cd}s</span>
                  </div>
                )}
              </>
            )}
            {item.options && item.options.length > 0 && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <div className="text-sm text-gray-500 mb-1 font-bold">オプション:</div>
                {item.options.map((opt, idx) => (
                  <div key={idx} className={`text-sm ${opt.isSpecial ? 'text-yellow-400' : 'text-gray-300'}`}>
                    {opt.isSpecial && <span className="text-yellow-400">★ </span>}
                    {opt.label} +{opt.val}{opt.unit || ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      </>
  );
});

