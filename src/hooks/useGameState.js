import { useState, useEffect, useMemo } from 'react';
import { INITIAL_PLAYER, INITIAL_EQUIPMENT, SKILL_TREE } from '../constants.jsx';

export const useGameState = () => {
  const [phase, setPhase] = useState('town'); 
  const [player, setPlayer] = useState(INITIAL_PLAYER);
  const [equipment, setEquipment] = useState(INITIAL_EQUIPMENT);
  const [inventory, setInventory] = useState([]);
  const [warehouse, setWarehouse] = useState([]);
  const [stones, setStones] = useState([]); 
  const [activeDungeon, setActiveDungeon] = useState(null); 
  const [enemy, setEnemy] = useState(null);
  const [skillCds, setSkillCds] = useState([0, 0, 0]);
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState('portal');
  const [warehouseTab, setWarehouseTab] = useState(false);
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inkModeItem, setInkModeItem] = useState(null);
  const [equipmentItemMode, setEquipmentItemMode] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverTarget, setDragOverTarget] = useState(null);

  // 初期ロード
  useEffect(() => {
    const saved = localStorage.getItem('hackslash_save_v7');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPlayer({
          ...INITIAL_PLAYER,
          ...data.player,
          skillPoints: data.player.skillPoints || 0,
          learnedSkills: data.player.learnedSkills || {},
          mp: data.player.mp !== undefined ? data.player.mp : (50 + ((data.player.level || 1) - 1) * 5),
          maxMp: data.player.maxMp !== undefined ? data.player.maxMp : (50 + ((data.player.level || 1) - 1) * 5),
        });
        setEquipment({...INITIAL_EQUIPMENT, ...data.equipment}); 
        setInventory(data.inventory || []);
        setWarehouse(data.warehouse || []);
        setStones(data.stones || []);
        setPhase('town');
        setTimeout(() => {
          setLogs(p => [{id: Date.now()+Math.random(), msg: "セーブデータをロードしました", color: 'green'}, ...p].slice(0, 10));
        }, 100);
      } catch (e) { 
        console.error("Save corrupted", e);
        setTimeout(() => {
          setLogs(p => [{id: Date.now()+Math.random(), msg: "セーブデータの読み込みに失敗しました", color: 'red'}, ...p].slice(0, 10));
        }, 100);
      }
    } else {
      setTimeout(() => {
        setLogs(p => [{id: Date.now()+Math.random(), msg: "新規ゲームを開始しました", color: 'blue'}, ...p].slice(0, 10));
      }, 100);
    }
    setIsInitialLoad(false);
  }, []);

  // 自動セーブ
  useEffect(() => {
    if (isInitialLoad) return;
    
    try {
      const data = { player, equipment, inventory, warehouse, stones };
      localStorage.setItem('hackslash_save_v7', JSON.stringify(data));
    } catch (e) {
      console.error("Auto-save failed", e);
    }
  }, [player, equipment, inventory, warehouse, stones, isInitialLoad]);

  // ステータス計算
  const getStats = useMemo(() => {
    let stats = {
      str: player.stats.str, vit: player.stats.vit, dex: player.stats.dex,
      atk: 0, def: 0, hp: 0,
      vamp: 0, goldMult: 0, expMult: 0, critDmg: 0, crit: 0,
      res_fire: 0, res_ice: 0, res_thunder: 0, res_light: 0, res_dark: 0,
      cdSpeed: 0
    };

    Object.values(equipment).forEach(item => {
      if (!item) return;
      const base = item.baseStats || item.stats || {};
      if (base.atk) stats.atk += base.atk;
      if (base.def) stats.def += base.def;
      if (base.hp) stats.hp += base.hp;
      if (base.str) stats.str += base.str;
      if (base.vit) stats.vit += base.vit;
      if (base.dex) stats.dex += base.dex;

      if (item.options) {
        item.options.forEach(opt => {
          if (stats[opt.type] !== undefined) stats[opt.type] += opt.val;
          else if (opt.type === 'maxHp') stats.hp += opt.val;
        });
      }
    });

    if (player.buffs) {
        player.buffs.forEach(b => {
            if (b.buffType === 'atk') stats.atk = Math.floor(stats.atk * (1 + b.val));
            if (b.buffType === 'def') stats.def += b.val;
            if (b.buffType === 'cdSpeed') stats.cdSpeed += b.val;
        });
    }

    // 習得済みスキルの効果を適用
    if (player.learnedSkills) {
      SKILL_TREE.forEach(skill => {
        const level = player.learnedSkills[skill.id] || 0;
        if (level > 0 && skill.levelData) {
          const levelData = skill.levelData;
          const effect = levelData.effect;
          const value = levelData.value;
          
          if (effect === 'str') stats.str += value;
          else if (effect === 'vit') stats.vit += value;
          else if (effect === 'dex') stats.dex += value;
          else if (effect === 'atk_mult') stats.atk = Math.floor(stats.atk * (1 + value));
          else if (effect === 'def_mult') stats.def = Math.floor(stats.def * (1 + value));
          else if (effect === 'hp_mult') stats.hp = Math.floor(stats.hp * (1 + value));
          else if (effect === 'crit') stats.crit = Math.min(100, (stats.crit || 0) + value);
          else if (effect === 'vamp') stats.vamp += value;
          else if (effect === 'cdSpeed') stats.cdSpeed += value;
          else if (effect === 'goldMult') stats.goldMult += value;
          else if (effect === 'expMult') stats.expMult += value;
          else if (effect === 'critDmg') stats.critDmg += value;
          else if (effect === 'res_fire') stats.res_fire += value;
          else if (effect === 'res_ice') stats.res_ice += value;
          else if (effect === 'res_thunder') stats.res_thunder += value;
          else if (effect === 'res_light') stats.res_light += value;
          else if (effect === 'res_dark') stats.res_dark += value;
          else if (effect === 'res_all') {
            stats.res_fire += value;
            stats.res_ice += value;
            stats.res_thunder += value;
            stats.res_light += value;
            stats.res_dark += value;
          }
          
          if (levelData.bonus) {
            const bonusEffect = levelData.bonus.effect;
            const bonusValue = levelData.bonus.value;
            
            if (bonusEffect === 'str') stats.str += bonusValue;
            else if (bonusEffect === 'vit') stats.vit += bonusValue;
            else if (bonusEffect === 'dex') stats.dex += bonusValue;
            else if (bonusEffect === 'atk_mult') stats.atk = Math.floor(stats.atk * (1 + bonusValue));
            else if (bonusEffect === 'def_mult') stats.def = Math.floor(stats.def * (1 + bonusValue));
            else if (bonusEffect === 'hp_mult') stats.hp = Math.floor(stats.hp * (1 + bonusValue));
            else if (bonusEffect === 'crit') stats.crit = Math.min(100, (stats.crit || 0) + bonusValue);
            else if (bonusEffect === 'vamp') stats.vamp += bonusValue;
            else if (bonusEffect === 'cdSpeed') stats.cdSpeed += bonusValue;
            else if (bonusEffect === 'goldMult') stats.goldMult += bonusValue;
            else if (bonusEffect === 'expMult') stats.expMult += bonusValue;
            else if (bonusEffect === 'critDmg') stats.critDmg += bonusValue;
            else if (bonusEffect === 'res_fire') stats.res_fire += bonusValue;
            else if (bonusEffect === 'res_ice') stats.res_ice += bonusValue;
            else if (bonusEffect === 'res_thunder') stats.res_thunder += bonusValue;
            else if (bonusEffect === 'res_light') stats.res_light += bonusValue;
            else if (bonusEffect === 'res_dark') stats.res_dark += bonusValue;
            else if (bonusEffect === 'res_all') {
              stats.res_fire += bonusValue;
              stats.res_ice += bonusValue;
              stats.res_thunder += bonusValue;
              stats.res_light += bonusValue;
              stats.res_dark += bonusValue;
            }
          }
          
          if (levelData.penalty) {
            const penaltyEffect = levelData.penalty.effect;
            const penaltyValue = levelData.penalty.value;
            
            if (penaltyEffect === 'str') stats.str += penaltyValue;
            else if (penaltyEffect === 'vit') stats.vit += penaltyValue;
            else if (penaltyEffect === 'dex') stats.dex += penaltyValue;
            else if (penaltyEffect === 'atk_mult') stats.atk = Math.floor(stats.atk * (1 + penaltyValue));
            else if (penaltyEffect === 'def_mult') stats.def = Math.floor(stats.def * (1 + penaltyValue));
            else if (penaltyEffect === 'hp_mult') stats.hp = Math.floor(stats.hp * (1 + penaltyValue));
            else if (penaltyEffect === 'crit') stats.crit = Math.max(0, (stats.crit || 0) + penaltyValue);
            else if (penaltyEffect === 'vamp') stats.vamp += penaltyValue;
            else if (penaltyEffect === 'cdSpeed') stats.cdSpeed += penaltyValue;
          }
        }
      });
    }

    const finalAtk = stats.atk + (stats.str * 2);
    const finalDef = stats.def + Math.floor(stats.vit / 2);
    const finalMaxHp = 100 + (stats.vit * 10) + stats.hp;
    const finalCrit = Math.min(75, stats.dex * 0.5);

    return { ...stats, atk: finalAtk, def: finalDef, maxHp: finalMaxHp, crit: finalCrit + stats.crit };
  }, [player, equipment]);

  const addLog = (msg, color = 'white') => {
    setLogs(prev => [{id: Date.now() + Math.random(), msg, color}, ...prev].slice(0, 20));
  };

  const spawnFloatingText = (text, color = 'white', isCrit = false) => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text: String(text), color, isCrit }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(f => f.id !== id));
    }, 1500);
  };

  return {
    // ステート
    phase, setPhase,
    player, setPlayer,
    equipment, setEquipment,
    inventory, setInventory,
    warehouse, setWarehouse,
    stones, setStones,
    activeDungeon, setActiveDungeon,
    enemy, setEnemy,
    skillCds, setSkillCds,
    logs, setLogs,
    tab, setTab,
    warehouseTab, setWarehouseTab,
    floatingTexts, setFloatingTexts,
    selectedItem, setSelectedItem,
    inkModeItem, setInkModeItem,
    equipmentItemMode, setEquipmentItemMode,
    isInitialLoad,
    draggedItem, setDraggedItem,
    dragOverTarget, setDragOverTarget,
    // 計算済み値
    getStats,
    // ユーティリティ
    addLog,
    spawnFloatingText,
  };
};

