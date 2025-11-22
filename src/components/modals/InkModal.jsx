import React from 'react';
import { ItemSlot } from '../ItemSlot';

export const InkModal = ({ inkModeItem, inventory, onAttachInk, onClose }) => {
  if (!inkModeItem) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-8">
      <div className="bg-gray-800 w-full max-w-2xl rounded-xl border-2 border-purple-500 p-8 shadow-2xl">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-purple-400 mb-2">インクを選択</h3>
          <p className="text-sm text-gray-400">装着するインクを選んでください</p>
        </div>
        <div className="grid grid-cols-8 gap-3 mb-6">
          {inventory.filter(i => i.type === 'ink').map(item => (
            <ItemSlot key={item.id} item={item} onClick={() => onAttachInk(inkModeItem, item)} />
          ))}
          {inventory.filter(i => i.type === 'ink').length === 0 && (
            <div className="col-span-8 text-center text-gray-500 py-8">インクを持っていません</div>
          )}
        </div>
        <button onClick={onClose} className="w-full py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors font-bold">キャンセル</button>
      </div>
    </div>
  );
};

