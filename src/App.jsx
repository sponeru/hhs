import React, { useState, useEffect, useMemo } from 'react';
import { 
  Heart, Coins, Trophy, Backpack, Sword, Map as MapIcon, 
  ArrowRight, LogOut, Flame, ChevronsUp, Sparkles, Warehouse,
  Save, Upload, Hammer
} from 'lucide-react';

import {
  INITIAL_PLAYER,
  INITIAL_EQUIPMENT,
  MAX_INVENTORY,
  MAX_STONES,
  MAX_WAREHOUSE,
  RARITIES,
  RARITY_ORDER,
  getElementConfig,
  BASIC_OPTIONS,
  SPECIAL_OPTIONS,
} from './constants.jsx';

import {
  generateEnemy,
  generateLoot,
  generateMagicStone,
  generateOptions,
  generateEquipmentItem,
} from './utils/gameLogic';

import { ItemSlot } from './components/ItemSlot';
import { ItemIcon } from './components/ItemIcon';
import { SkillTree } from './components/SkillTree';
import { SKILL_TREE } from './constants.jsx';

// ==========================================
// Section 4: Main Component
// ==========================================

export default function HackSlashGame() {
  const [phase, setPhase] = useState('town'); 
  const [player, setPlayer] = useState(INITIAL_PLAYER);
  const [equipment, setEquipment] = useState(INITIAL_EQUIPMENT);
  const [inventory, setInventory] = useState([]);
  const [warehouse, setWarehouse] = useState([]); // 倉庫
  const [stones, setStones] = useState([]); 
  
  const [activeDungeon, setActiveDungeon] = useState(null); 
  const [enemy, setEnemy] = useState(null);
  const [skillCds, setSkillCds] = useState([0, 0, 0]);
  
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState('portal');
  const [warehouseTab, setWarehouseTab] = useState(false); // 倉庫タブの表示状態
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inkModeItem, setInkModeItem] = useState(null);
  const [equipmentItemMode, setEquipmentItemMode] = useState(null); // 装備品用アイテム使用モード（後方互換性のため残す）
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 初期ロード完了フラグ
  const [draggedItem, setDraggedItem] = useState(null); // ドラッグ中のアイテム
  const [dragOverTarget, setDragOverTarget] = useState(null); // ドラッグオーバー中のターゲット
  
  // 初期ロード: 初回のみ実行
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
        // 初期ロード後、addLogが利用可能になったらログを追加
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

  // 自動セーブ: 初期ロード完了後のみ実行
  useEffect(() => {
    if (isInitialLoad) return; // 初期ロード中は自動セーブしない
    
    try {
      const data = { player, equipment, inventory, warehouse, stones };
      localStorage.setItem('hackslash_save_v7', JSON.stringify(data));
    } catch (e) {
      console.error("Auto-save failed", e);
    }
  }, [player, equipment, inventory, warehouse, stones, isInitialLoad]);

  // --- Core Logic ---

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
          else if (effect === 'all_stats') {
            stats.str = Math.floor(stats.str * (1 + value));
            stats.vit = Math.floor(stats.vit * (1 + value));
            stats.dex = Math.floor(stats.dex * (1 + value));
          }
          
          // ボーナス効果
          if (levelData.bonus) {
            const bonusEffect = levelData.bonus.effect;
            const bonusValue = levelData.bonus.value;
            if (bonusEffect === 'res_fire') stats.res_fire += bonusValue;
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
            else if (bonusEffect === 'hp_mult') stats.hp = Math.floor(stats.hp * (1 + bonusValue));
            else if (bonusEffect === 'expMult') stats.expMult += bonusValue;
            else if (bonusEffect === 'critDmg') stats.critDmg += bonusValue;
          }
          
          // ペナルティ効果
          if (levelData.penalty) {
            const penaltyEffect = levelData.penalty.effect;
            const penaltyValue = levelData.penalty.value;
            if (penaltyEffect === 'def_mult') stats.def = Math.floor(stats.def * (1 + penaltyValue));
          }
        }
      });
    }

    const finalAtk = stats.atk + (stats.str * 2);
    const finalDef = stats.def + Math.floor(stats.vit / 2);
    const finalMaxHp = 100 + (stats.vit * 10) + stats.hp;
    const finalCrit = Math.min(75, stats.dex * 0.5);

    return { atk: finalAtk, def: finalDef, maxHp: finalMaxHp, crit: finalCrit, ...stats };
  }, [player.stats, equipment, player.buffs, player.learnedSkills]);

  // --- Dungeon Logic ---

  const startDungeon = (stone = null) => {
    let floor = 1;
    let maxFloor = 5; 
    let mods = {};
    let stoneName = "始まりの平原";

    if (stone) {
        floor = stone.tier; 
        maxFloor = stone.maxFloor;
        stoneName = stone.name;
        stone.mods.forEach(m => {
            mods[m.type] = (mods[m.type] || 0) + (m.val || 1);
        });
        setStones(prev => prev.filter(s => s.id !== stone.id));
    }

    setActiveDungeon({ floor, startFloor: floor, maxFloor, mods, stoneName });
    setEnemy(generateEnemy(floor, mods, floor === maxFloor));
    setPhase('dungeon');
    setTab('battle');
    setSkillCds([0,0,0]);
    setPlayer(p => {
      const maxMp = p.maxMp || 50 + (p.level - 1) * 5;
      return {...p, buffs: [], mp: maxMp, maxMp: maxMp};
    }); 
    addLog(`${stoneName} (F${floor}〜F${floor+maxFloor})に入場`, 'yellow');
  };

  const returnToTown = () => {
    setPhase('town');
    setTab('portal');
    setActiveDungeon(null);
    setEnemy(null);
    setPlayer(p => {
      const maxMp = p.maxMp || 50 + (p.level - 1) * 5;
      return {...p, hp: getStats.maxHp, mp: maxMp, buffs: []};
    }); 
    addLog("街に帰還しました", 'blue');
  };

  // Battle Loop
  useEffect(() => {
    if (phase !== 'dungeon' || !enemy) return;

    const timer = setInterval(() => {
      setPlayer(p => {
          if (p.buffs.length === 0) return p;
          const nextBuffs = p.buffs.map(b => ({...b, duration: b.duration - 0.05})).filter(b => b.duration > 0);
          return { ...p, buffs: nextBuffs };
      });

      setSkillCds(prev => prev.map(cd => Math.max(0, cd - 0.05 * (1 + getStats.cdSpeed))));

      [1, 2, 3].forEach((slotNum, idx) => {
          const slotKey = `skill${slotNum}`;
          const skillItem = equipment[slotKey];
          if (skillItem && skillCds[idx] <= 0) {
              const hasAutoCast = skillItem.inks?.some(ink => ink.mod.type === 'auto_cast');
              if (hasAutoCast) {
                  handleUseSkill(slotNum); 
              }
          }
      });

      if (enemy.hp > 0 && player.hp > 0) {
        setEnemy(prev => {
          if (prev.wait >= prev.maxWait) {
            const rawDmg = Math.max(1, Math.floor(prev.atk - getStats.def));
            let mitigation = 0;
            if (prev.element !== 'none') {
                mitigation = (getStats[`res_${prev.element}`] || 0) / 100;
                mitigation = Math.min(0.8, mitigation); 
            }
            const dmgMod = 1 + ((activeDungeon.mods.risk_dmg || 0) / 100);
            const finalDmg = Math.max(1, Math.floor(rawDmg * dmgMod * (1 - mitigation)));

            setPlayer(p => ({ ...p, hp: Math.max(0, p.hp - finalDmg) }));
            addLog(`被弾! ${finalDmg} dmg`, 'red');
            spawnFloatingText(finalDmg, 'red');
            
            if (player.hp - finalDmg <= 0) {
                addLog("力尽きた...", 'red');
                setTimeout(returnToTown, 2000);
            }
            return { ...prev, wait: 0 };
          }
          return { ...prev, wait: prev.wait + 1 };
        });
      }
    }, 50);
    return () => clearInterval(timer);
  }, [phase, enemy, getStats, activeDungeon, player.hp, skillCds, equipment]);

  const applySkillEffects = (skillItem, idx) => {
      const base = skillItem.skillData;
      const inks = skillItem.inks || [];
      
      let powerMult = 1;
      let durMult = 1;
      let cdMult = 1;
      let multiCast = 1;
      
      inks.forEach(ink => {
          if (ink.mod.stat === 'power') powerMult += ink.mod.val;
          if (ink.mod.stat === 'cd') cdMult += ink.mod.val;
          if (ink.mod.stat === 'duration') durMult += ink.mod.val;
          if (ink.mod.type === 'multi_cast') multiCast += ink.mod.val;
          
          if (ink.mod.penalty) {
              if (ink.mod.penalty.type === 'power_down') powerMult += ink.mod.penalty.val;
              if (ink.mod.penalty.type === 'cd_up') cdMult += ink.mod.penalty.val;
          }
      });

      const finalPower = base.power * powerMult;
      const finalDuration = (base.duration || 0) * durMult;
      const finalCd = base.cd * cdMult;

      for(let i=0; i<multiCast; i++) {
          if (base.type === 'attack') {
              let dmg = Math.floor(getStats.atk * finalPower);
              setEnemy(prev => {
                  const newHp = Math.max(0, prev.hp - dmg);
                  spawnFloatingText(dmg, getElementConfig(base.element).color.replace('text-',''), false);
                  if (newHp <= 0) winBattle(prev); 
                  return { ...prev, hp: newHp };
              });
          } else if (base.type === 'heal') {
              const heal = Math.floor(finalPower);
              setPlayer(p => ({ ...p, hp: Math.min(getStats.maxHp, p.hp + heal) }));
              spawnFloatingText(heal, 'green');
          } else if (base.type === 'buff') {
              const buffId = Date.now() + Math.random();
              setPlayer(p => ({
                  ...p,
                  buffs: [...p.buffs, { id: buffId, name: base.name, buffType: base.buffType, val: base.val * powerMult, duration: finalDuration }]
              }));
              addLog(`${base.name}!`, 'blue');
          }
      }
      
      setSkillCds(prev => {
          const next = [...prev];
          next[idx] = finalCd;
          return next;
      });
      
      if (base.type !== 'buff') addLog(`${base.name}!`, getElementConfig(base.element).color.split('-')[1]);
  };

  const handleUseSkill = (slotNum) => {
      if (player.hp <= 0 || (enemy && enemy.hp <= 0)) return;
      const idx = slotNum - 1;
      if (skillCds[idx] > 0) return;

      const skillItem = equipment[`skill${slotNum}`];
      if (!skillItem) return;
      
      // MPコストをチェック（攻撃スキルの場合）
      const base = skillItem.skillData;
      if (base && base.mpCost && base.type === 'attack') {
        if (player.mp < base.mpCost) {
          addLog(`MPが足りません（必要: ${base.mpCost}、現在: ${player.mp}）`, 'red');
          return;
        }
        // MPを消費
        setPlayer(p => ({ ...p, mp: Math.max(0, p.mp - base.mpCost) }));
      }

      applySkillEffects(skillItem, idx);
  };

  const handleAttack = () => {
    if (player.hp <= 0 || enemy.hp <= 0) return;

    const isCrit = Math.random() * 100 < getStats.crit;
    let dmg = Math.floor(getStats.atk * (Math.random() * 0.4 + 0.8));
    if (isCrit) dmg = Math.floor(dmg * (1.5 + (getStats.critDmg / 100)));

    spawnFloatingText(dmg, isCrit ? 'yellow' : 'white', isCrit);
    
    if (getStats.vamp > 0) {
      const heal = Math.ceil(dmg * (getStats.vamp / 100));
      if (heal > 0 && player.hp < getStats.maxHp) {
        setPlayer(p => ({ ...p, hp: Math.min(getStats.maxHp, p.hp + heal) }));
      }
    }

    const newEnemyHp = enemy.hp - dmg;
    if (newEnemyHp <= 0) {
      setEnemy(prev => ({ ...prev, hp: 0 }));
      winBattle(enemy); 
    } else {
      setEnemy(prev => ({ ...prev, hp: newEnemyHp }));
    }
  };

  const winBattle = (defeatedEnemy) => {
    const dMods = activeDungeon.mods;
    const expMult = 1 + (getStats.expMult / 100) + ((dMods.reward_exp || 0) / 100);
    const goldMult = 1 + (getStats.goldMult / 100) + ((dMods.reward_gold || 0) / 100);
    
    const expGain = Math.floor(defeatedEnemy.exp * expMult);
    const goldGain = Math.floor(defeatedEnemy.gold * goldMult);

    let newPlayer = { ...player, exp: player.exp + expGain, gold: player.gold + goldGain };
    addLog(`勝利! +${expGain}EXP`, 'green');

    if (newPlayer.exp >= newPlayer.expToNext) {
      newPlayer.level += 1;
      newPlayer.exp -= newPlayer.expToNext;
      newPlayer.expToNext = Math.floor(newPlayer.expToNext * 1.2);
      newPlayer.statPoints += 3;
      newPlayer.skillPoints = (newPlayer.skillPoints || 0) + 1;
      newPlayer.hp = getStats.maxHp;
      // MPも回復
      newPlayer.maxMp = 50 + (newPlayer.level - 1) * 5;
      newPlayer.mp = newPlayer.maxMp;
      addLog(`Level Up! ${newPlayer.level} (+1スキルポイント)`, 'yellow');
    }
    setPlayer(newPlayer);

    const relativeFloor = activeDungeon.floor - activeDungeon.startFloor + 1;
    
    if (relativeFloor >= activeDungeon.maxFloor && defeatedEnemy.isBoss) {
        addLog("ダンジョン制覇！", 'yellow');
        setTimeout(returnToTown, 2000);
        distributeLoot(activeDungeon.floor, dMods, true);
        return;
    }

    distributeLoot(activeDungeon.floor, dMods, false);

    const nextFloor = activeDungeon.floor + 1;
    const nextRelative = nextFloor - activeDungeon.startFloor + 1;
    setActiveDungeon(prev => ({ ...prev, floor: nextFloor }));
    
    setTimeout(() => {
        if(phase === 'dungeon') {
            const isNextBoss = (nextRelative === activeDungeon.maxFloor) || (nextFloor % 10 === 0);
            setEnemy(generateEnemy(nextFloor, activeDungeon.mods, isNextBoss));
        }
    }, 600);
  };

  // 装備品用アイテムがスタック可能かチェック
  const canStackEquipmentItem = (item1, item2) => {
    if (!item1 || !item2) return false;
    if (item1.type !== item2.type) return false;
    if (item1.rarity !== item2.rarity) return false;
    
    // タイプごとに効果値を比較
    if (item1.type === 'enhancement_stone') {
      return item1.mult === item2.mult;
    } else if (item1.type === 'enchant_scroll' || item1.type === 'reroll_scroll') {
      return item1.powerMult === item2.powerMult;
    } else if (item1.type === 'element_stone') {
      return item1.element === item2.element && item1.value === item2.value;
    } else if (item1.type === 'special_stone') {
      return item1.specialType === item2.specialType && item1.value === item2.value;
    } else if (item1.type === 'option_slot_stone') {
      return item1.slots === item2.slots;
    } else if (item1.type === 'rarity_upgrade_stone') {
      return item1.upgrades === item2.upgrades;
    }
    
    return false;
  };

  // 装備品用アイテムをスタック可能なアイテムに追加
  const addEquipmentItemToStack = (itemList, newItem) => {
    const equipmentItemTypes = ['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'];
    
    // 装備品用アイテムでない場合はそのまま追加
    if (!equipmentItemTypes.includes(newItem.type)) {
      return [...itemList, newItem];
    }
    
    // スタック可能なアイテムを探す
    const stackIndex = itemList.findIndex(existingItem => canStackEquipmentItem(existingItem, newItem));
    
    if (stackIndex >= 0) {
      // スタックする
      const updatedList = [...itemList];
      updatedList[stackIndex] = {
        ...updatedList[stackIndex],
        count: (updatedList[stackIndex].count || 1) + 1,
        isNew: newItem.isNew || updatedList[stackIndex].isNew // 新しいアイテムが来た場合はisNewを維持
      };
      return updatedList;
    } else {
      // スタックできない場合は新規追加
      return [...itemList, { ...newItem, count: newItem.count || 1 }];
    }
  };

  const distributeLoot = (floor, dMods, isBoss) => {
      const dropRate = isBoss ? 1.0 : 0.35;
      const dropCount = isBoss ? (1 + (dMods.reward_drop || 0)) : 1;

      for(let i=0; i<dropCount; i++) {
          if (Math.random() < dropRate) {
              // インベントリまたは倉庫に空きがあるかチェック
              const hasInventorySpace = inventory.length < MAX_INVENTORY;
              const hasWarehouseSpace = warehouse.length < MAX_WAREHOUSE;
              
              if (hasInventorySpace || hasWarehouseSpace) {
                  const loot = generateLoot(floor, dMods);
                  if (hasInventorySpace) {
                      setInventory(prev => addEquipmentItemToStack(prev, loot));
                  } else {
                      setWarehouse(prev => addEquipmentItemToStack(prev, loot));
                  }
                  addLog(`${loot.name}を拾った`, 'blue');
              } else {
                  addLog('インベントリと倉庫が一杯です', 'red');
              }
          }
      }
      
      // 装備品用アイテムの追加ドロップ（ボス戦では確実に1つ、通常敵では低確率）
      const equipmentItemRate = isBoss ? 0.8 : 0.15;
      if (Math.random() < equipmentItemRate) {
          const hasInventorySpace = inventory.length < MAX_INVENTORY;
          const hasWarehouseSpace = warehouse.length < MAX_WAREHOUSE;
          
          if (hasInventorySpace || hasWarehouseSpace) {
              const equipItem = generateEquipmentItem(floor);
              if (equipItem) {
                  if (hasInventorySpace) {
                      setInventory(prev => addEquipmentItemToStack(prev, equipItem));
                  } else {
                      setWarehouse(prev => addEquipmentItemToStack(prev, equipItem));
                  }
                  addLog(`${equipItem.name}を拾った`, 'green');
              }
          }
      }
      
      const stoneRate = isBoss ? 0.4 : 0.05;
      if (Math.random() < stoneRate && stones.length < MAX_STONES) {
          const stone = generateMagicStone(floor + (isBoss ? 1 : 0));
          setStones(prev => [...prev, stone]);
          addLog(`魔法石: ${stone.name}`, 'purple');
      }
  };

  // --- Utility ---
  const healPlayer = () => {
    const cost = player.level * 5;
    if (player.gold >= cost && player.hp < getStats.maxHp) {
      setPlayer(p => ({ ...p, gold: p.gold - cost, hp: getStats.maxHp }));
      spawnFloatingText("HEAL", "green");
    }
  };
  const increaseStat = (key) => {
    if (player.statPoints > 0) {
      setPlayer(p => ({ ...p, statPoints: p.statPoints - 1, stats: { ...p.stats, [key]: p.stats[key] + 1 } }));
    }
  };
  
  const learnSkill = (skillId) => {
    const skill = SKILL_TREE.find(s => s.id === skillId);
    if (!skill) return;
    
    const currentLevel = player.learnedSkills[skillId] || 0;
    if (currentLevel >= 1) return; // maxLevelは常に1
    if ((player.skillPoints || 0) <= 0) return;
    
    // 前提条件チェック
    if (skill.requirements.length > 0) {
      for (const reqId of skill.requirements) {
        if ((player.learnedSkills[reqId] || 0) < 1) {
          addLog('前提スキルが未習得です', 'red');
          return;
        }
      }
    }
    
    setPlayer(p => ({
      ...p,
      skillPoints: (p.skillPoints || 0) - 1,
      learnedSkills: {
        ...p.learnedSkills,
        [skillId]: 1
      }
    }));
    addLog(`${skill.name} を習得しました`, 'green');
  };
  
  const equipItem = (item, slotIndex = null) => { 
    // 巻物の場合、必要能力値をチェック
    if (item.type === 'skill' && item.skillData && item.skillData.requiredStat) {
      const requiredStat = item.skillData.requiredStat;
      const totalStats = getStats.str + getStats.vit + getStats.dex;
      if (totalStats < requiredStat) {
        addLog(`装備できません。必要能力値: ${requiredStat}（現在: ${totalStats}）`, 'red');
        return;
      }
    }
    
    let slot = item.type;
    if (item.type === 'skill') {
        if (!slotIndex) {
            if (!equipment.skill1) slot = 'skill1';
            else if (!equipment.skill2) slot = 'skill2';
            else if (!equipment.skill3) slot = 'skill3';
            else slot = 'skill1'; 
        } else {
            slot = `skill${slotIndex}`;
        }
    }
    
    const oldItem = equipment[slot];
    setEquipment(prev => ({ ...prev, [slot]: item }));
    setInventory(prev => {
        const filtered = prev.filter(i => i.id !== item.id);
        return oldItem ? [...filtered, oldItem] : filtered;
    });
    setSelectedItem(null);
  };

  const unequipItem = (slot) => {
      const item = equipment[slot];
      if (!item) return;
      if (inventory.length >= MAX_INVENTORY) {
          alert("インベントリが一杯です");
          return;
      }
      setEquipment(prev => ({ ...prev, [slot]: null }));
      setInventory(prev => [...prev, item]);
      setSelectedItem(null);
  };

  const sellItem = (item) => {
    const equipmentItemTypes = ['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'];
    const isEquipmentItem = equipmentItemTypes.includes(item.type);
    
    const value = item.type === 'stone' ? item.tier * 10 : Math.floor((item.power || 1) * 2);
    const sellCount = item.count || 1;
    const totalValue = value * sellCount;
    
    setPlayer(p => ({ ...p, gold: p.gold + totalValue }));
    
    if (item.type === 'stone') {
      setStones(prev => prev.filter(i => i.id !== item.id));
    } else if (warehouseTab) {
      setWarehouse(prev => {
        const itemIndex = prev.findIndex(i => i.id === item.id);
        if (itemIndex >= 0 && isEquipmentItem && prev[itemIndex].count && prev[itemIndex].count > 1) {
          const newList = [...prev];
          newList[itemIndex] = { ...prev[itemIndex], count: prev[itemIndex].count - sellCount };
          if (newList[itemIndex].count <= 0) {
            return prev.filter(i => i.id !== item.id);
          }
          return newList;
        }
        return prev.filter(i => i.id !== item.id);
      });
    } else {
      setInventory(prev => {
        const itemIndex = prev.findIndex(i => i.id === item.id);
        if (itemIndex >= 0 && isEquipmentItem && prev[itemIndex].count && prev[itemIndex].count > 1) {
          const newList = [...prev];
          newList[itemIndex] = { ...prev[itemIndex], count: prev[itemIndex].count - sellCount };
          if (newList[itemIndex].count <= 0) {
            return prev.filter(i => i.id !== item.id);
          }
          return newList;
        }
        return prev.filter(i => i.id !== item.id);
      });
    }
    setSelectedItem(null);
    addLog(`売却 (+${totalValue}G${sellCount > 1 ? ` x${sellCount}` : ''})`, 'gray');
  };

  // 倉庫機能: インベントリから倉庫へ移動
  const moveToWarehouse = (item) => {
    const equipmentItemTypes = ['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'];
    const isEquipmentItem = equipmentItemTypes.includes(item.type);
    
    if (isEquipmentItem) {
      // 装備品用アイテムの場合はスタック処理
      // 現在のインベントリからアイテムを探す
      const itemIndex = inventory.findIndex(i => i.id === item.id);
      if (itemIndex >= 0) {
        const updatedItem = inventory[itemIndex];
        let itemToMove = null;
        let newInventory = null;
        
        if (updatedItem.count && updatedItem.count > 1) {
          // スタック数を減らす
          newInventory = [...inventory];
          newInventory[itemIndex] = { ...updatedItem, count: updatedItem.count - 1 };
          itemToMove = { ...item, count: 1 };
        } else {
          // スタックが1つだけの場合は移動
          newInventory = inventory.filter(i => i.id !== item.id);
          itemToMove = item;
        }
        
        // 両方の状態を更新
        setInventory(newInventory);
        setWarehouse(prevWarehouse => addEquipmentItemToStack(prevWarehouse, itemToMove));
      }
    } else {
      // 通常のアイテムはそのまま移動
      if (warehouse.length >= MAX_WAREHOUSE) {
        alert("倉庫が一杯です");
        return;
      }
      setInventory(prev => prev.filter(i => i.id !== item.id));
      setWarehouse(prev => [...prev, item]);
    }
    setSelectedItem(null);
    addLog(`${item.name}を倉庫に移動`, 'blue');
  };

  // 倉庫機能: 倉庫からインベントリへ移動
  const moveToInventory = (item) => {
    const equipmentItemTypes = ['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'];
    const isEquipmentItem = equipmentItemTypes.includes(item.type);
    
    if (isEquipmentItem) {
      // 装備品用アイテムの場合はスタック処理
      // 現在の倉庫からアイテムを探す
      const itemIndex = warehouse.findIndex(i => i.id === item.id);
      if (itemIndex >= 0) {
        const updatedItem = warehouse[itemIndex];
        let itemToMove = null;
        let newWarehouse = null;
        
        if (updatedItem.count && updatedItem.count > 1) {
          // スタック数を減らす
          newWarehouse = [...warehouse];
          newWarehouse[itemIndex] = { ...updatedItem, count: updatedItem.count - 1 };
          itemToMove = { ...item, count: 1 };
        } else {
          // スタックが1つだけの場合は移動
          newWarehouse = warehouse.filter(i => i.id !== item.id);
          itemToMove = item;
        }
        
        // 両方の状態を更新
        setWarehouse(newWarehouse);
        setInventory(prevInventory => addEquipmentItemToStack(prevInventory, itemToMove));
      }
    } else {
      // 通常のアイテムはそのまま移動
      if (inventory.length >= MAX_INVENTORY) {
        alert("インベントリが一杯です");
        return;
      }
      setWarehouse(prev => prev.filter(i => i.id !== item.id));
      setInventory(prev => [...prev, item]);
    }
    setSelectedItem(null);
    addLog(`${item.name}をインベントリに移動`, 'blue');
  };

  // ドラッグアンドドロップ: ドラッグ開始
  const handleDragStart = (e, item, source) => {
    setDraggedItem({ item, source }); // source: 'inventory' | 'warehouse' | 'equipment'
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify({ itemId: item.id, source }));
  };

  // ドラッグアンドドロップ: ドラッグ終了
  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverTarget(null);
  };

  // ドラッグアンドドロップ: ドラッグオーバー
  const handleDragOver = (e, target) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverTarget(target);
  };

  // ドラッグアンドドロップ: ドロップ
  const handleDrop = (e, target) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { item, source } = draggedItem;

    // 同じ場所へのドロップは無視
    if (source === target) {
      setDraggedItem(null);
      setDragOverTarget(null);
      return;
    }

    // 装備スロットへのドロップ
    if (target.startsWith('equipment_')) {
      const slot = target.replace('equipment_', '');
      let canEquip = false;
      
      if (slot === 'skill1' || slot === 'skill2' || slot === 'skill3') {
        if (item.type === 'skill') {
          canEquip = true;
          const slotNum = parseInt(slot.replace('skill', ''));
          
          // 倉庫からの場合はインベントリに移動
          if (source === 'warehouse') {
            if (inventory.length >= MAX_INVENTORY && !equipment[slot]) {
              addLog('インベントリが一杯です', 'red');
              setDraggedItem(null);
              setDragOverTarget(null);
              return;
            }
            setWarehouse(prev => prev.filter(i => i.id !== item.id));
          }
          
          // 装備処理
          const oldItem = equipment[slot];
          setEquipment(prev => ({ ...prev, [slot]: item }));
          
          // 古い装備をインベントリに戻す
          if (oldItem && oldItem.id !== item.id) {
            if (source === 'inventory') {
              setInventory(prev => {
                const filtered = prev.filter(i => i.id !== item.id);
                return [...filtered, oldItem];
              });
            } else {
              // 倉庫からの場合、古い装備をインベントリに追加
              if (inventory.length < MAX_INVENTORY) {
                setInventory(prev => [...prev, oldItem]);
              } else if (warehouse.length < MAX_WAREHOUSE) {
                setWarehouse(prev => [...prev, oldItem]);
              }
            }
          } else if (source === 'inventory') {
            setInventory(prev => prev.filter(i => i.id !== item.id));
          }
          
          addLog(`${item.name}を装備しました`, 'green');
        } else {
          addLog('スキルスロットにはスキルのみ装備できます', 'red');
        }
      } else if (slot === 'weapon' || slot === 'armor' || slot === 'accessory') {
        if (item.type === slot) {
          canEquip = true;
          
          // 倉庫からの場合はインベントリに移動
          if (source === 'warehouse') {
            if (inventory.length >= MAX_INVENTORY && !equipment[slot]) {
              addLog('インベントリが一杯です', 'red');
              setDraggedItem(null);
              setDragOverTarget(null);
              return;
            }
            setWarehouse(prev => prev.filter(i => i.id !== item.id));
          }
          
          // 装備処理
          const oldItem = equipment[slot];
          setEquipment(prev => ({ ...prev, [slot]: item }));
          
          // 古い装備をインベントリに戻す
          if (oldItem && oldItem.id !== item.id) {
            if (source === 'inventory') {
              setInventory(prev => {
                const filtered = prev.filter(i => i.id !== item.id);
                return [...filtered, oldItem];
              });
            } else {
              // 倉庫からの場合、古い装備をインベントリに追加
              if (inventory.length < MAX_INVENTORY) {
                setInventory(prev => [...prev, oldItem]);
              } else if (warehouse.length < MAX_WAREHOUSE) {
                setWarehouse(prev => [...prev, oldItem]);
              }
            }
          } else if (source === 'inventory') {
            setInventory(prev => prev.filter(i => i.id !== item.id));
          }
          
          addLog(`${item.name}を装備しました`, 'green');
        } else {
          addLog(`このスロットには${slot === 'weapon' ? '武器' : slot === 'armor' ? '防具' : 'アクセサリ'}のみ装備できます`, 'red');
        }
      }
      
      if (!canEquip) {
        setDraggedItem(null);
        setDragOverTarget(null);
        return;
      }
    }
    // インベントリ ↔ 倉庫
    else if ((source === 'inventory' && target === 'warehouse')) {
      moveToWarehouse(item);
    } else if (source === 'warehouse' && target === 'inventory') {
      moveToInventory(item);
    }
    // 装備スロットからのドロップ（インベントリへ）
    else if (source.startsWith('equipment_') && target === 'inventory') {
      const slot = source.replace('equipment_', '');
      unequipItem(slot);
    }
    // 装備スロットからのドロップ（倉庫へ）
    else if (source.startsWith('equipment_') && target === 'warehouse') {
      const slot = source.replace('equipment_', '');
      const eqItem = equipment[slot];
      if (eqItem) {
        unequipItem(slot);
        moveToWarehouse(eqItem);
      }
    }

    setDraggedItem(null);
    setDragOverTarget(null);
  };

  // 手動セーブ機能
  const manualSave = () => {
    try {
      const data = { 
        player, 
        equipment, 
        inventory, 
        warehouse, 
        stones,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('hackslash_save_v7', JSON.stringify(data));
      addLog("セーブしました", 'green');
      
      // トースト的な通知（視覚的フィードバック）
      const saveToast = document.createElement('div');
      saveToast.textContent = 'セーブ完了！';
      saveToast.style.cssText = 'position:fixed;top:20px;right:20px;background:green;color:white;padding:10px 20px;border-radius:5px;z-index:10000;';
      document.body.appendChild(saveToast);
      setTimeout(() => document.body.removeChild(saveToast), 2000);
    } catch (e) {
      console.error("Manual save failed", e);
      addLog("セーブに失敗しました: " + e.message, 'red');
    }
  };

  // 手動ロード機能
  const manualLoad = () => {
    const saved = localStorage.getItem('hackslash_save_v7');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        
        // ダンジョン中なら警告を表示
        if (phase === 'dungeon') {
          if (!confirm('ダンジョン中にロードすると、現在の進行状況が失われます。続行しますか？')) {
            return;
          }
        }
        
        setPlayer({
          ...INITIAL_PLAYER,
          ...data.player,
          skillPoints: data.player.skillPoints || 0,
          learnedSkills: data.player.learnedSkills || {},
          mp: data.player.mp !== undefined ? data.player.mp : (50 + ((data.player.level || 1) - 1) * 5),
          maxMp: data.player.maxMp !== undefined ? data.player.maxMp : (50 + ((data.player.level || 1) - 1) * 5),
          buffs: [], // ロード時はバフをリセット
        });
        setEquipment({...INITIAL_EQUIPMENT, ...data.equipment}); 
        setInventory(data.inventory || []);
        setWarehouse(data.warehouse || []);
        setStones(data.stones || []);
        setPhase('town');
        setActiveDungeon(null);
        setEnemy(null);
        addLog("ロードしました", 'green');
        
        // ロード通知
        const loadToast = document.createElement('div');
        loadToast.textContent = 'ロード完了！';
        loadToast.style.cssText = 'position:fixed;top:20px;right:20px;background:blue;color:white;padding:10px 20px;border-radius:5px;z-index:10000;';
        document.body.appendChild(loadToast);
        setTimeout(() => document.body.removeChild(loadToast), 2000);
      } catch (e) {
        console.error("Manual load failed", e);
        addLog("ロードに失敗しました: " + e.message, 'red');
      }
    } else {
      addLog("セーブデータが見つかりません", 'red');
    }
  };

  const attachInk = (scroll, ink) => {
      if (!scroll || !ink) return;
      if ((scroll.inks?.length || 0) >= scroll.inkSlots) return;
      
      const updatedScroll = { ...scroll, inks: [...(scroll.inks || []), ink] };
      setInventory(prev => prev.map(i => i.id === scroll.id ? updatedScroll : i).filter(i => i.id !== ink.id));
      
      setInkModeItem(updatedScroll);
      setSelectedItem(null);
  };

  // 装備品用アイテムを使用
  const useItemOnEquipment = (item, targetEquipment, isFromWarehouse = false) => {
    if (!item || !targetEquipment) return;
    
    // 装備品用アイテムでない場合はスキップ
    const equipmentItemTypes = ['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'];
    if (!equipmentItemTypes.includes(item.type)) return;

    // 倉庫からの装備品を使用する場合、一時的にインベントリに移動する必要がある
    if (isFromWarehouse) {
      const warehouseItem = warehouse.find(i => i.id === targetEquipment.id);
      if (warehouseItem) {
        // インベントリに空きがない場合はエラー
        if (inventory.length >= MAX_INVENTORY) {
          addLog('インベントリが一杯です。倉庫の装備品を使用するにはインベントリに空きが必要です', 'red');
          return;
        }
        // 倉庫からインベントリに一時的に移動
        setWarehouse(prev => prev.filter(i => i.id !== targetEquipment.id));
        setInventory(prev => [...prev, targetEquipment]);
      }
    }

    let updatedEquipment = { ...targetEquipment };
    let success = false;
    let message = '';

    if (item.type === 'enhancement_stone') {
      // 強化石: 基本ステータスを強化
      const mult = item.mult || 0.1;
      const newBaseStats = { ...updatedEquipment.baseStats };
      Object.keys(newBaseStats).forEach(key => {
        newBaseStats[key] = Math.floor(newBaseStats[key] * (1 + mult));
      });
      updatedEquipment.baseStats = newBaseStats;
      success = true;
      message = `基本ステータスが${(mult * 100).toFixed(0)}%強化されました`;
    }
    else if (item.type === 'enchant_scroll') {
      // エンチャントスクロール: オプションを追加
      const maxOptions = RARITIES[updatedEquipment.rarity].optCount;
      if ((updatedEquipment.options?.length || 0) >= maxOptions) {
        addLog('オプション枠が満杯です', 'red');
        return;
      }
      const power = updatedEquipment.power || 1;
      const powerMult = item.powerMult || 1.0;
      const pool = [...BASIC_OPTIONS];
      const optType = pool[Math.floor(Math.random() * pool.length)];
      let val = Math.max(1, Math.floor(power * (Math.random() * 10 + 5) / 100 * powerMult));
      
      if (optType.type === 'maxHp') val *= 5;
      if (['str','vit','dex'].includes(optType.type)) val = Math.max(1, Math.floor(val / 2));
      if (optType.isRes) val = Math.floor(5 + Math.random() * 15 * powerMult);
      
      updatedEquipment.options = [...(updatedEquipment.options || []), { ...optType, val, isSpecial: false }];
      success = true;
      message = `オプション「${optType.label} +${val}${optType.unit || ''}」が追加されました`;
    }
    else if (item.type === 'element_stone') {
      // 属性付与石: 属性耐性を付与
      const maxOptions = RARITIES[updatedEquipment.rarity].optCount;
      if ((updatedEquipment.options?.length || 0) >= maxOptions) {
        addLog('オプション枠が満杯です', 'red');
        return;
      }
      const resType = `res_${item.element}`;
      const resOption = BASIC_OPTIONS.find(o => o.type === resType);
      if (resOption) {
        updatedEquipment.options = [...(updatedEquipment.options || []), { ...resOption, val: item.value || 10, isSpecial: false }];
        success = true;
        message = `${getElementConfig(item.element).label}耐性 +${item.value}%が追加されました`;
      }
    }
    else if (item.type === 'special_stone') {
      // 特殊強化アイテム: 特殊オプションを付与
      const maxOptions = RARITIES[updatedEquipment.rarity].optCount;
      if ((updatedEquipment.options?.length || 0) >= maxOptions) {
        addLog('オプション枠が満杯です', 'red');
        return;
      }
      const specialOption = SPECIAL_OPTIONS.find(o => o.type === item.specialType);
      if (specialOption) {
        updatedEquipment.options = [...(updatedEquipment.options || []), { ...specialOption, val: item.value || 10, isSpecial: true }];
        success = true;
        message = `特殊オプション「${specialOption.label} +${item.value}${specialOption.unit || ''}」が追加されました`;
      }
    }
    else if (item.type === 'reroll_scroll') {
      // リロールスクロール: オプションを変更
      if (!updatedEquipment.options || updatedEquipment.options.length === 0) {
        addLog('変更できるオプションがありません', 'red');
        return;
      }
      const optionIndex = Math.floor(Math.random() * updatedEquipment.options.length);
      const power = updatedEquipment.power || 1;
      const powerMult = item.powerMult || 1.0;
      const pool = [...BASIC_OPTIONS, ...SPECIAL_OPTIONS];
      const optType = pool[Math.floor(Math.random() * pool.length)];
      let val = Math.max(1, Math.floor(power * (Math.random() * 10 + 5) / 100 * powerMult));
      
      if (optType.type === 'maxHp') val *= 5;
      if (['str','vit','dex'].includes(optType.type)) val = Math.max(1, Math.floor(val / 2));
      if (optType.isRes) val = Math.floor(5 + Math.random() * 15 * powerMult);
      if (optType.min && optType.max) val = Math.floor(optType.min + Math.random() * (optType.max - optType.min) * powerMult);
      
      const newOptions = [...updatedEquipment.options];
      newOptions[optionIndex] = { ...optType, val, isSpecial: optType.min !== undefined };
      updatedEquipment.options = newOptions;
      success = true;
      message = `オプションが「${optType.label} +${val}${optType.unit || ''}」に変更されました`;
    }
    else if (item.type === 'option_slot_stone') {
      // オプション枠拡張石: オプション枠を増やす
      const currentMax = RARITIES[updatedEquipment.rarity].optCount;
      const newMax = currentMax + (item.slots || 1);
      if (newMax > 5) {
        addLog('オプション枠は最大5までです', 'red');
        return;
      }
      // レアリティを上げる必要がある場合
      const currentRarityIndex = RARITY_ORDER.indexOf(updatedEquipment.rarity);
      let targetRarity = updatedEquipment.rarity;
      for (let i = currentRarityIndex + 1; i < RARITY_ORDER.length; i++) {
        if (RARITIES[RARITY_ORDER[i]].optCount >= newMax) {
          targetRarity = RARITY_ORDER[i];
          break;
        }
      }
      if (targetRarity !== updatedEquipment.rarity) {
        updatedEquipment.rarity = targetRarity;
      }
      success = true;
      message = `オプション枠が${item.slots || 1}つ増えました`;
    }
    else if (item.type === 'rarity_upgrade_stone') {
      // レアリティアップグレード石: レアリティを上げる
      const currentRarityIndex = RARITY_ORDER.indexOf(updatedEquipment.rarity);
      if (currentRarityIndex >= RARITY_ORDER.length - 1) {
        addLog('既に最高レアリティです', 'red');
        return;
      }
      const upgrades = item.upgrades || 1;
      const newIndex = Math.min(currentRarityIndex + upgrades, RARITY_ORDER.length - 1);
      const newRarity = RARITY_ORDER[newIndex];
      
      // レアリティが上がった場合、オプション枠が増える可能性がある
      const oldMaxOptions = RARITIES[updatedEquipment.rarity].optCount;
      const newMaxOptions = RARITIES[newRarity].optCount;
      
      updatedEquipment.rarity = newRarity;
      
      // オプション枠が増えた場合、新しいオプションを生成
      if (newMaxOptions > oldMaxOptions) {
        const currentOptions = updatedEquipment.options || [];
        const additionalSlots = newMaxOptions - oldMaxOptions;
        const power = updatedEquipment.power || 1;
        
        // 追加分のオプションを生成
        const pool = [...BASIC_OPTIONS];
        const newOptions = [];
        for (let i = 0; i < additionalSlots; i++) {
          const optType = pool[Math.floor(Math.random() * pool.length)];
          let val = Math.max(1, Math.floor(power * (Math.random() * 10 + 5) / 100));
          
          if (optType.type === 'maxHp') val *= 5;
          if (['str','vit','dex'].includes(optType.type)) val = Math.max(1, Math.floor(val / 2));
          if (optType.isRes) val = Math.floor(5 + Math.random() * 15);
          
          newOptions.push({ ...optType, val, isSpecial: false });
        }
        
        updatedEquipment.options = [...currentOptions, ...newOptions];
      }
      
      success = true;
      message = `レアリティが${RARITIES[newRarity].label}に上がりました`;
    }

    if (success) {
      // 装備中のアイテムを更新
      const slotKey = Object.keys(equipment).find(key => equipment[key]?.id === targetEquipment.id);
      if (slotKey) {
        setEquipment(prev => ({ ...prev, [slotKey]: updatedEquipment }));
      } else {
        // インベントリ内のアイテムを更新（倉庫から移動した場合も含む）
        // 倉庫から移動した場合は既にインベントリに追加されているので、そのまま更新
        setInventory(prev => prev.map(i => i.id === targetEquipment.id ? updatedEquipment : i));
      }
      
      // 使用したアイテムを削除またはスタック数を減らす
      setInventory(prev => {
        const itemIndex = prev.findIndex(i => i.id === item.id);
        if (itemIndex >= 0) {
          const updatedItem = prev[itemIndex];
          if (updatedItem.count && updatedItem.count > 1) {
            // スタック数を減らす
            const newList = [...prev];
            newList[itemIndex] = { ...updatedItem, count: updatedItem.count - 1 };
            return newList;
          } else {
            // スタックが1つだけの場合は削除
            return prev.filter(i => i.id !== item.id);
          }
        }
        return prev;
      });
      
      // 倉庫から使用した場合も同様に処理
      setWarehouse(prev => {
        const itemIndex = prev.findIndex(i => i.id === item.id);
        if (itemIndex >= 0) {
          const updatedItem = prev[itemIndex];
          if (updatedItem.count && updatedItem.count > 1) {
            const newList = [...prev];
            newList[itemIndex] = { ...updatedItem, count: updatedItem.count - 1 };
            return newList;
          } else {
            return prev.filter(i => i.id !== item.id);
          }
        }
        return prev;
      });
      
      setEquipmentItemMode(null);
      setSelectedItem(null);
      addLog(message, 'green');
    }
  };

  const addLog = (msg, color) => setLogs(p => [{id: Date.now()+Math.random(), msg, color}, ...p].slice(0, 10));
  const spawnFloatingText = (text, color, isCrit = false) => {
    const id = Date.now() + Math.random();
    setFloatingTexts(prev => [...prev, { id, text, color, isCrit, x: 50 + (Math.random() * 40 - 20), y: 40 }]);
    setTimeout(() => setFloatingTexts(prev => prev.filter(ft => ft.id !== id)), 800);
  };

  const renderMergedOptions = (options) => {
    if (!options || options.length === 0) return null;
    const merged = options.reduce((acc, opt) => {
        if (!acc[opt.label]) acc[opt.label] = { ...opt, val: 0 };
        acc[opt.label].val += opt.val;
        if (opt.isSpecial) acc[opt.label].isSpecial = true;
        return acc;
    }, {});
    return Object.values(merged).map((opt, idx) => (
        <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0 last:mb-0">
            <span className={`text-sm ${opt.isSpecial ? 'text-yellow-400 font-bold' : 'text-blue-200'}`}>{opt.label}</span>
            <span className={`text-base font-bold ${opt.isSpecial ? 'text-yellow-400' : 'text-blue-200'}`}>+{opt.val}{opt.unit || ''}</span>
        </div>
    ));
  };

  const renderStoneDetail = (stone) => (
    <div className="bg-slate-900 p-3 rounded border border-slate-700 mb-4 text-sm">
        <div className={`font-bold mb-2 flex items-center gap-2 ${RARITIES[stone.rarity]?.color || 'text-cyan-400'}`}>
            <MapIcon size={16} /> {stone.name}
        </div>
        <div className="flex justify-between items-center bg-slate-800 px-2 py-1 rounded mb-2 text-xs">
             <span className="text-slate-400">探索深度</span>
             <span className="text-white font-bold">{stone.maxFloor}階層</span>
        </div>
        <div className="space-y-1">
            {stone.mods.map((mod, idx) => (
                <div key={idx} className="flex justify-between items-center">
                    <span className={mod.isRisk ? 'text-red-400' : mod.isReward ? 'text-yellow-400' : 'text-blue-300'}>{mod.label}</span>
                    {mod.val && <span className="text-white">{mod.isRisk ? '+' : '+'}{mod.val}{mod.unit}</span>}
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="h-screen w-screen bg-gray-950 text-white font-sans select-none overflow-hidden flex flex-col relative">
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
                    {player.statPoints > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-gray-900" />}
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

      <main className="flex-1 relative flex overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-50">
            {floatingTexts.map(ft => (
                <div key={ft.id} className="absolute flex flex-col items-center animate-[floatUp_0.8s_forwards]" style={{ left: `${ft.x}%`, top: `${ft.y}%` }}>
                    <span className={`font-black ${ft.isCrit ? 'text-4xl' : 'text-2xl'} text-${ft.color === 'red' ? 'red-500' : ft.color === 'green' ? 'green-400' : ft.color === 'yellow' ? 'yellow-400' : 'white'} drop-shadow-md`}>{ft.text}{ft.isCrit && "!"}</span>
                </div>
            ))}
            <style>{`@keyframes floatUp { 0% { transform:translate(-50%,0) scale(0.8); opacity:1; } 100% { transform:translate(-50%,-100px) scale(1); opacity:0; } }`}</style>
        </div>

        {phase === 'town' && (
            <div className="flex-1 flex overflow-hidden">
                {/* サイドバー */}
                <aside className="w-80 bg-gray-900 border-r border-gray-800 overflow-y-auto flex-shrink-0">
                    <div className="p-6">
                        <h3 className="text-lg font-bold text-yellow-500 mb-4 flex items-center gap-2">
                            <Trophy size={20}/> ステータス
                        </h3>
                        <div className="bg-gray-800 p-4 rounded-xl mb-4 border border-gray-700">
                            <div className="flex justify-between items-center mb-2">
                                <div className="text-sm text-gray-400">未割り当てポイント</div>
                                {player.statPoints > 0 && <div className="text-xs text-yellow-500 animate-pulse">未割り当て</div>}
                            </div>
                            <div className="text-4xl font-bold text-white">{player.statPoints}</div>
                        </div>
                        {['str','vit','dex'].map(k => (
                            <div key={k} className="flex justify-between items-center bg-gray-800 p-4 rounded-lg mb-2 hover:bg-gray-750 transition-colors">
                                <span className="text-gray-300 uppercase font-bold text-sm">{k === 'str' ? '筋力' : k === 'vit' ? '体力' : '幸運'}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl font-mono">{player.stats[k]}</span>
                                    {player.statPoints > 0 && (
                                        <button onClick={() => increaseStat(k)} className="w-10 h-10 bg-yellow-600 rounded-lg text-white font-bold hover:bg-yellow-500 transition-colors">
                                            +
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <h4 className="text-sm font-bold text-gray-400 mb-3">戦闘ステータス</h4>
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
                                    <span className="text-gray-400">攻撃力</span>
                                    <span className="text-red-400 font-bold">{getStats.atk}</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
                                    <span className="text-gray-400">防御力</span>
                                    <span className="text-blue-400 font-bold">{getStats.def}</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
                                    <span className="text-gray-400">最大HP</span>
                                    <span className="text-green-400 font-bold">{getStats.maxHp}</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
                                    <span className="text-gray-400">最大MP</span>
                                    <span className="text-cyan-400 font-bold">{player.maxMp || 50}</span>
                                </div>
                                <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
                                    <span className="text-gray-400">会心率</span>
                                    <span className="text-yellow-400 font-bold">{getStats.crit.toFixed(1)}%</span>
                                </div>
                                {getStats.critDmg > 0 && (
                                    <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
                                        <span className="text-gray-400">会心ダメージ</span>
                                        <span className="text-yellow-400 font-bold">+{getStats.critDmg}%</span>
                                    </div>
                                )}
                                {getStats.vamp > 0 && (
                                    <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
                                        <span className="text-gray-400">HP吸収</span>
                                        <span className="text-red-400 font-bold">{getStats.vamp}%</span>
                                    </div>
                                )}
                                {getStats.cdSpeed > 0 && (
                                    <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
                                        <span className="text-gray-400">CD速度</span>
                                        <span className="text-cyan-400 font-bold">+{getStats.cdSpeed * 100}%</span>
                                    </div>
                                )}
                                {(getStats.goldMult > 0 || getStats.expMult > 0) && (
                                    <>
                                        {getStats.goldMult > 0 && (
                                            <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
                                                <span className="text-gray-400">G獲得</span>
                                                <span className="text-yellow-400 font-bold">+{getStats.goldMult}%</span>
                                            </div>
                                        )}
                                        {getStats.expMult > 0 && (
                                            <div className="flex justify-between items-center bg-gray-800 p-2 rounded text-xs">
                                                <span className="text-gray-400">EXP獲得</span>
                                                <span className="text-green-400 font-bold">+{getStats.expMult}%</span>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                            {(getStats.res_fire > 0 || getStats.res_ice > 0 || getStats.res_thunder > 0 || getStats.res_light > 0 || getStats.res_dark > 0) && (
                                <div className="mb-4">
                                    <h5 className="text-xs font-bold text-gray-500 mb-2">属性耐性</h5>
                                    <div className="grid grid-cols-2 gap-1 text-xs">
                                        {getStats.res_fire > 0 && (
                                            <div className="flex justify-between items-center bg-gray-800 p-1.5 rounded">
                                                <span className="text-red-400">火</span>
                                                <span className="text-white font-bold">{getStats.res_fire}%</span>
                                            </div>
                                        )}
                                        {getStats.res_ice > 0 && (
                                            <div className="flex justify-between items-center bg-gray-800 p-1.5 rounded">
                                                <span className="text-cyan-400">氷</span>
                                                <span className="text-white font-bold">{getStats.res_ice}%</span>
                                            </div>
                                        )}
                                        {getStats.res_thunder > 0 && (
                                            <div className="flex justify-between items-center bg-gray-800 p-1.5 rounded">
                                                <span className="text-yellow-400">雷</span>
                                                <span className="text-white font-bold">{getStats.res_thunder}%</span>
                                            </div>
                                        )}
                                        {getStats.res_light > 0 && (
                                            <div className="flex justify-between items-center bg-gray-800 p-1.5 rounded">
                                                <span className="text-orange-300">光</span>
                                                <span className="text-white font-bold">{getStats.res_light}%</span>
                                            </div>
                                        )}
                                        {getStats.res_dark > 0 && (
                                            <div className="flex justify-between items-center bg-gray-800 p-1.5 rounded">
                                                <span className="text-purple-400">闇</span>
                                                <span className="text-white font-bold">{getStats.res_dark}%</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-700">
                            <h4 className="text-sm font-bold text-gray-400 mb-3">装備中</h4>
                            <div className="space-y-3">
                                {['weapon', 'armor', 'accessory'].map(slot => (
                                    <div key={slot} className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg border border-gray-700">
                                        <div className="w-16 h-16 flex-shrink-0">
                                            <ItemSlot item={equipment[slot]} onClick={() => setSelectedItem({...equipment[slot], isEquipped: true})} isEquipped={true} iconSize={32} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs text-gray-500 uppercase mb-1">{slot === 'weapon' ? '武器' : slot === 'armor' ? '防具' : 'アクセサリ'}</div>
                                            <div className="text-sm font-bold text-white truncate">
                                                {equipment[slot]?.name || '未装備'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-700">
                                <h4 className="text-sm font-bold text-gray-400 mb-3">スキル</h4>
                                <div className="space-y-2">
                                    {[1, 2, 3].map(num => (
                                        <div key={`skill${num}`} className="flex items-center gap-3 bg-gray-800 p-2 rounded-lg border border-gray-700">
                                            <div className="w-14 h-14 flex-shrink-0">
                                                <ItemSlot item={equipment[`skill${num}`]} onClick={() => setSelectedItem({...equipment[`skill${num}`], isEquipped: true})} isEquipped={true} iconSize={28} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs text-gray-500 mb-1">スキル {num}</div>
                                                <div className="text-sm font-bold text-white truncate">
                                                    {equipment[`skill${num}`]?.name || '未装備'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* メインコンテンツ */}
                <div className="flex-1 overflow-y-auto">
                    {tab === 'portal' && (
                        <div className="p-8 bg-slate-900 min-h-full">
                            <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                                <Flame className="text-orange-500" size={28} /> 冒険に出る
                            </h2>
                            <div onClick={() => setSelectedItem({ type: 'portal_basic' })} className="bg-gray-800 p-6 rounded-xl border-2 border-gray-700 mb-8 cursor-pointer hover:bg-gray-750 hover:border-gray-500 transition-all">
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
                                        <div key={stone.id} onClick={() => setSelectedItem(stone)} className={`bg-slate-800 p-4 rounded-lg border-2 ${rarity.border} cursor-pointer hover:brightness-110 hover:scale-105 transition-all relative overflow-hidden`}>
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
                    )}

                    {tab === 'inventory' && (
                        <div className="p-8 bg-gray-900 min-h-full">
                            {/* 装備スロット */}
                            <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 mb-6">
                                <div className="text-sm text-gray-400 mb-4">装備スロット</div>
                                <div className="flex justify-center gap-6 mb-6">
                                    {['weapon', 'armor', 'accessory'].map(slot => (
                                        <div 
                                            key={slot} 
                                            className="flex flex-col items-center gap-2"
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                handleDragOver(e, `equipment_${slot}`);
                                            }}
                                            onDrop={(e) => handleDrop(e, `equipment_${slot}`)}
                                            onDragLeave={() => {
                                                if (dragOverTarget === `equipment_${slot}`) {
                                                    setDragOverTarget(null);
                                                }
                                            }}
                                        >
                                            <div className={`w-20 h-20 ${dragOverTarget === `equipment_${slot}` ? 'ring-4 ring-blue-500 rounded-lg' : ''}`}>
                                                <ItemSlot 
                                                    item={equipment[slot]} 
                                                    onClick={() => equipment[slot] && setSelectedItem({...equipment[slot], isEquipped: true})} 
                                                    isEquipped={true} 
                                                    iconSize={40}
                                                    onDragStart={equipment[slot] ? (e) => handleDragStart(e, equipment[slot], `equipment_${slot}`) : undefined}
                                                    onDragEnd={handleDragEnd}
                                                    isDropTarget={dragOverTarget === `equipment_${slot}`}
                                                    dragSource={draggedItem}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500 uppercase">{slot === 'weapon' ? '武器' : slot === 'armor' ? '防具' : 'アクセサリ'}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-center gap-4 pt-4 border-t border-gray-700">
                                    {[1, 2, 3].map(num => (
                                        <div 
                                            key={`skill${num}`} 
                                            className="flex flex-col items-center gap-2"
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                handleDragOver(e, `equipment_skill${num}`);
                                            }}
                                            onDrop={(e) => handleDrop(e, `equipment_skill${num}`)}
                                            onDragLeave={() => {
                                                if (dragOverTarget === `equipment_skill${num}`) {
                                                    setDragOverTarget(null);
                                                }
                                            }}
                                        >
                                            <div className={`w-16 h-16 ${dragOverTarget === `equipment_skill${num}` ? 'ring-4 ring-blue-500 rounded-lg' : ''}`}>
                                                <ItemSlot 
                                                    item={equipment[`skill${num}`]} 
                                                    onClick={() => equipment[`skill${num}`] && setSelectedItem({...equipment[`skill${num}`], isEquipped: true})} 
                                                    isEquipped={true} 
                                                    iconSize={32}
                                                    onDragStart={equipment[`skill${num}`] ? (e) => handleDragStart(e, equipment[`skill${num}`], `equipment_skill${num}`) : undefined}
                                                    onDragEnd={handleDragEnd}
                                                    isDropTarget={dragOverTarget === `equipment_skill${num}`}
                                                    dragSource={draggedItem}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500 uppercase">スキル {num}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* インベントリと倉庫を並べて表示 */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* インベントリ */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                            <Backpack size={24} className="text-blue-500" /> インベントリ ({inventory.length}/{MAX_INVENTORY})
                                        </h3>
                                    </div>
                                    <div 
                                        className={`grid grid-cols-6 md:grid-cols-8 gap-3 p-4 rounded-lg border-2 ${dragOverTarget === 'inventory' && draggedItem?.source === 'warehouse' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-800/50'}`}
                                        onDragOver={(e) => handleDragOver(e, 'inventory')}
                                        onDrop={(e) => handleDrop(e, 'inventory')}
                                        onDragLeave={() => {
                                            if (dragOverTarget === 'inventory') {
                                                setDragOverTarget(null);
                                            }
                                        }}
                                    >
                                        {inventory.map(item => (
                                            <ItemSlot 
                                                key={item.id} 
                                                item={item} 
                                                onClick={() => {
                                                    if (inkModeItem) attachInk(inkModeItem, item); 
                                                    else setSelectedItem(item);
                                                }}
                                                isSelected={selectedItem?.id === item.id}
                                                onDragStart={(e) => handleDragStart(e, item, 'inventory')}
                                                onDragEnd={handleDragEnd}
                                                isDropTarget={dragOverTarget === 'inventory' && draggedItem?.source === 'warehouse'}
                                                dragSource={draggedItem}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* 倉庫 */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                            <Warehouse size={24} className="text-indigo-500" /> 倉庫 ({warehouse.length}/{MAX_WAREHOUSE})
                                        </h3>
                                    </div>
                                    <div 
                                        className={`grid grid-cols-6 md:grid-cols-8 gap-3 p-4 rounded-lg border-2 ${dragOverTarget === 'warehouse' && draggedItem?.source === 'inventory' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-700 bg-gray-800/50'}`}
                                        onDragOver={(e) => handleDragOver(e, 'warehouse')}
                                        onDrop={(e) => handleDrop(e, 'warehouse')}
                                        onDragLeave={() => {
                                            if (dragOverTarget === 'warehouse') {
                                                setDragOverTarget(null);
                                            }
                                        }}
                                    >
                                        {warehouse.map(item => (
                                            <ItemSlot 
                                                key={item.id} 
                                                item={item} 
                                                onClick={() => setSelectedItem(item)}
                                                isSelected={selectedItem?.id === item.id}
                                                onDragStart={(e) => handleDragStart(e, item, 'warehouse')}
                                                onDragEnd={handleDragEnd}
                                                isDropTarget={dragOverTarget === 'warehouse' && draggedItem?.source === 'inventory'}
                                                dragSource={draggedItem}
                                            />
                                        ))}
                                        {warehouse.length === 0 && (
                                            <div className="col-span-full text-center text-gray-500 py-12">
                                                倉庫は空です
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {tab === 'stats' && (
                        <div className="p-8 bg-gray-900 min-h-full">
                            <h2 className="text-2xl font-bold text-yellow-500 mb-8 flex items-center gap-3">
                                <Trophy size={28}/> ステータス詳細
                            </h2>
                            
                            {/* 基本ステータス */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-300 mb-4">基本ステータス</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                                        <div className="text-sm text-gray-400 mb-2">未割り当てポイント</div>
                                        <div className="text-5xl font-bold text-white mb-2">{player.statPoints}</div>
                                        {player.statPoints > 0 && <div className="text-sm text-yellow-500 animate-pulse">未割り当て</div>}
                                    </div>
                                    {['str','vit','dex'].map(k => (
                                        <div key={k} className="bg-gray-800 p-6 rounded-xl border border-gray-700 hover:bg-gray-750 transition-colors">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-gray-300 uppercase font-bold text-lg">
                                                    {k === 'str' ? '筋力' : k === 'vit' ? '体力' : '幸運'}
                                                </span>
                                                {player.statPoints > 0 && (
                                                    <button onClick={() => increaseStat(k)} className="w-10 h-10 bg-yellow-600 rounded-lg text-white font-bold hover:bg-yellow-500 transition-colors">
                                                        +
                                                    </button>
                                                )}
                                            </div>
                                            <div className="text-4xl font-mono text-white">{player.stats[k]}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 戦闘ステータス */}
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-300 mb-4">戦闘ステータス</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                        <div className="text-xs text-gray-400 mb-1">攻撃力</div>
                                        <div className="text-3xl font-bold text-red-400">{getStats.atk}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            基本: {getStats.atk - (getStats.str * 2)} + 筋力×2
                                        </div>
                                    </div>
                                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                        <div className="text-xs text-gray-400 mb-1">防御力</div>
                                        <div className="text-3xl font-bold text-blue-400">{getStats.def}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            基本: {getStats.def - Math.floor(getStats.vit / 2)} + 体力÷2
                                        </div>
                                    </div>
                                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                        <div className="text-xs text-gray-400 mb-1">最大HP</div>
                                        <div className="text-3xl font-bold text-green-400">{getStats.maxHp}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            基本: 100 + 体力×10 + 装備
                                        </div>
                                    </div>
                                    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                        <div className="text-xs text-gray-400 mb-1">会心率</div>
                                        <div className="text-3xl font-bold text-yellow-400">{getStats.crit.toFixed(1)}%</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            幸運×0.5 (最大75%)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 特殊オプション */}
                            {(getStats.vamp > 0 || getStats.critDmg > 0 || getStats.cdSpeed > 0 || getStats.goldMult > 0 || getStats.expMult > 0) && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-gray-300 mb-4">特殊オプション</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {getStats.vamp > 0 && (
                                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                                <div className="text-xs text-gray-400 mb-1">HP吸収</div>
                                                <div className="text-2xl font-bold text-red-400">{getStats.vamp}%</div>
                                            </div>
                                        )}
                                        {getStats.critDmg > 0 && (
                                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                                <div className="text-xs text-gray-400 mb-1">会心ダメージ</div>
                                                <div className="text-2xl font-bold text-yellow-400">+{getStats.critDmg}%</div>
                                            </div>
                                        )}
                                        {getStats.cdSpeed > 0 && (
                                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                                <div className="text-xs text-gray-400 mb-1">CD速度</div>
                                                <div className="text-2xl font-bold text-cyan-400">+{(getStats.cdSpeed * 100).toFixed(0)}%</div>
                                            </div>
                                        )}
                                        {getStats.goldMult > 0 && (
                                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                                <div className="text-xs text-gray-400 mb-1">G獲得</div>
                                                <div className="text-2xl font-bold text-yellow-400">+{getStats.goldMult}%</div>
                                            </div>
                                        )}
                                        {getStats.expMult > 0 && (
                                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                                <div className="text-xs text-gray-400 mb-1">EXP獲得</div>
                                                <div className="text-2xl font-bold text-green-400">+{getStats.expMult}%</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 属性耐性 */}
                            {(getStats.res_fire > 0 || getStats.res_ice > 0 || getStats.res_thunder > 0 || getStats.res_light > 0 || getStats.res_dark > 0) && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-bold text-gray-300 mb-4">属性耐性</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        {getStats.res_fire > 0 && (
                                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                                <div className="text-xs text-red-400 mb-1">火耐性</div>
                                                <div className="text-2xl font-bold text-white">{getStats.res_fire}%</div>
                                            </div>
                                        )}
                                        {getStats.res_ice > 0 && (
                                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                                <div className="text-xs text-cyan-400 mb-1">氷耐性</div>
                                                <div className="text-2xl font-bold text-white">{getStats.res_ice}%</div>
                                            </div>
                                        )}
                                        {getStats.res_thunder > 0 && (
                                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                                <div className="text-xs text-yellow-400 mb-1">雷耐性</div>
                                                <div className="text-2xl font-bold text-white">{getStats.res_thunder}%</div>
                                            </div>
                                        )}
                                        {getStats.res_light > 0 && (
                                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                                <div className="text-xs text-orange-300 mb-1">光耐性</div>
                                                <div className="text-2xl font-bold text-white">{getStats.res_light}%</div>
                                            </div>
                                        )}
                                        {getStats.res_dark > 0 && (
                                            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                                                <div className="text-xs text-purple-400 mb-1">闇耐性</div>
                                                <div className="text-2xl font-bold text-white">{getStats.res_dark}%</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'skills' && (
                        <SkillTree 
                            learnedSkills={player.learnedSkills || {}}
                            skillPoints={player.skillPoints || 0}
                            onLearnSkill={learnSkill}
                            playerLevel={player.level}
                        />
                    )}

                    {tab === 'equipment' && (
                        <div className="p-8 bg-gray-900 min-h-full">
                            <h2 className="text-2xl font-bold text-green-500 mb-8 flex items-center gap-3">
                                <Hammer size={28} /> 装備強化
                            </h2>
                            
                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-300 mb-4">装備中</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    {['weapon', 'armor', 'accessory'].map(slot => {
                                        const item = equipment[slot];
                                        return (
                                            <div key={slot} className="flex flex-col items-center gap-3">
                                                <div className="w-24 h-24">
                                                    <ItemSlot 
                                                        item={item} 
                                                        onClick={() => item && setSelectedItem({...item, isEquipped: true})} 
                                                        isEquipped={true} 
                                                        iconSize={48}
                                                        onDragStart={item ? (e) => handleDragStart(e, item, 'equipment') : undefined}
                                                        onDragEnd={handleDragEnd}
                                                        dragSource={draggedItem}
                                                    />
                                                </div>
                                                <span className="text-sm text-gray-400 uppercase">{slot === 'weapon' ? '武器' : slot === 'armor' ? '防具' : 'アクセサリ'}</span>
                                                {item && (
                                                    <div className="text-xs text-gray-500 text-center">
                                                        {item.name}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-gray-300 mb-4">
                                    装備用アイテム ({inventory.filter(i => ['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'].includes(i.type)).length})
                                </h3>
                                <div className="grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-3">
                                    {inventory.filter(i => ['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'].includes(i.type)).map(item => (
                                        <ItemSlot 
                                            key={item.id} 
                                            item={item} 
                                            onClick={() => {
                                                setSelectedItem(null);
                                                setEquipmentItemMode(item);
                                            }}
                                            isSelected={selectedItem?.id === item.id}
                                            onDragStart={(e) => handleDragStart(e, item, 'inventory')}
                                            onDragEnd={handleDragEnd}
                                            dragSource={draggedItem}
                                        />
                                    ))}
                                    {inventory.filter(i => ['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'].includes(i.type)).length === 0 && (
                                        <div className="col-span-full text-center text-gray-500 py-12">
                                            装備用アイテムがありません
                                        </div>
                                    )}
                                </div>
                            </div>

                            {equipmentItemMode && (
                                <div className="bg-gray-800 p-6 rounded-xl border-2 border-green-500">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-16 h-16 rounded-lg flex items-center justify-center border-2 border-green-500 bg-gray-900">
                                            <ItemIcon item={equipmentItemMode} size={32} />
                                        </div>
                                        <div>
                                            <div className="text-lg font-bold text-green-400">{equipmentItemMode.name}</div>
                                            <div className="text-sm text-gray-400">使用する装備品を選択してください</div>
                                        </div>
                                        <button 
                                            onClick={() => setEquipmentItemMode(null)} 
                                            className="ml-auto px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                                        >
                                            キャンセル
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        {['weapon', 'armor', 'accessory'].map(slot => {
                                            const item = equipment[slot];
                                            if (!item) return null;
                                            return (
                                                <div key={slot} className="flex flex-col items-center gap-2">
                                                    <div className="w-20 h-20">
                                                        <ItemSlot 
                                                            item={item} 
                                                            onClick={() => {
                                                                useItemOnEquipment(equipmentItemMode, item);
                                                                setEquipmentItemMode(null);
                                                            }}
                                                            iconSize={40}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-400">{slot === 'weapon' ? '武器' : slot === 'armor' ? '防具' : 'アクセサリ'}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                                                <Backpack size={16} /> インベントリの装備品
                                            </h4>
                                            <div className="grid grid-cols-6 md:grid-cols-8 gap-3 max-h-48 overflow-y-auto p-2 bg-gray-900/50 rounded-lg">
                                                {inventory.filter(i => ['weapon', 'armor', 'accessory'].includes(i.type)).map(item => (
                                                    <ItemSlot 
                                                        key={item.id} 
                                                        item={item} 
                                                        onClick={() => {
                                                            useItemOnEquipment(equipmentItemMode, item);
                                                            setEquipmentItemMode(null);
                                                        }}
                                                        isSelected={selectedItem?.id === item.id}
                                                    />
                                                ))}
                                                {inventory.filter(i => ['weapon', 'armor', 'accessory'].includes(i.type)).length === 0 && (
                                                    <div className="col-span-full text-center text-gray-500 py-4 text-sm">
                                                        なし
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
                                                <Warehouse size={16} /> 倉庫の装備品
                                            </h4>
                                            <div className="grid grid-cols-6 md:grid-cols-8 gap-3 max-h-48 overflow-y-auto p-2 bg-gray-900/50 rounded-lg">
                                                {warehouse.filter(i => ['weapon', 'armor', 'accessory'].includes(i.type)).map(item => (
                                                    <ItemSlot 
                                                        key={item.id} 
                                                        item={item} 
                                                        onClick={() => {
                                                            useItemOnEquipment(equipmentItemMode, item, true);
                                                            setEquipmentItemMode(null);
                                                        }}
                                                    />
                                                ))}
                                                {warehouse.filter(i => ['weapon', 'armor', 'accessory'].includes(i.type)).length === 0 && (
                                                    <div className="col-span-full text-center text-gray-500 py-4 text-sm">
                                                        なし
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}

        {phase === 'dungeon' && (
            <div className="flex-1 flex overflow-hidden">
                {/* 左サイドバー: ステータスとログ */}
                <aside className="w-80 bg-gray-900 border-r border-gray-800 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-gray-800">
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <div className="text-sm text-blue-400 font-bold">Lv.{player.level}</div>
                                <div className="text-lg font-bold text-green-400">{player.hp} <span className="text-sm text-gray-600">/ {getStats.maxHp}</span></div>
                            </div>
                            <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                                <div className="h-full bg-green-500 transition-all" style={{ width: `${(player.hp / getStats.maxHp) * 100}%` }} />
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <div className="text-sm text-cyan-400 font-bold">MP</div>
                                <div className="text-sm text-cyan-400 font-bold">{player.mp} / {player.maxMp || 50}</div>
                            </div>
                            <div className="h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                                <div className="h-full bg-cyan-500 transition-all" style={{ width: `${((player.mp || 0) / (player.maxMp || 50)) * 100}%` }} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-xs text-gray-400 mb-2">バフ</div>
                            {player.buffs.length > 0 ? (
                                player.buffs.map(buff => (
                                    <div key={buff.id} className="flex items-center gap-2 bg-black/50 px-3 py-2 rounded-lg text-sm text-cyan-300 border border-cyan-900">
                                        <ChevronsUp size={14} />
                                        <span className="flex-1">{buff.name}</span>
                                        <span className="text-xs">({buff.duration.toFixed(0)}s)</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-xs text-gray-600 text-center py-2">バフなし</div>
                            )}
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="text-sm font-bold text-gray-400 mb-3">バトルログ</div>
                        <div className="space-y-1 flex flex-col-reverse">
                            {logs.slice(0, 20).map(l => (
                                <div key={l.id} style={{color:l.color}} className="text-sm font-mono py-1 px-2 rounded hover:bg-gray-800 transition-colors">
                                    {l.msg}
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* 中央: バトル画面 */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950">
                    {enemy && (
                        <>
                            <div className={`text-9xl mb-6 transition-transform ${enemy.wait > enemy.maxWait - 5 ? 'scale-110' : 'scale-100'} ${enemy.hp===0 ? 'opacity-0' : ''}`}>
                                {enemy.icon}
                            </div>
                            <div className="w-full max-w-md text-center">
                                <h2 className={`text-2xl font-bold flex items-center justify-center gap-2 mb-4 ${enemy.isBoss ? 'text-red-400' : 'text-gray-300'}`}>
                                    {enemy.element !== 'none' && getElementConfig(enemy.element).icon}
                                    {enemy.name}
                                </h2>
                                <div className="h-4 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-700 mb-2">
                                    <div className="h-full bg-red-600 transition-all" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} />
                                </div>
                                <div className="text-sm text-gray-400 font-mono">{enemy.hp.toLocaleString()} / {enemy.maxHp.toLocaleString()}</div>
                            </div>
                        </>
                    )}
                </div>

                {/* 右サイドバー: スキルとアクション */}
                <aside className="w-80 bg-gray-900 border-l border-gray-800 p-6 flex flex-col gap-4">
                    <div>
                        <div className="text-sm font-bold text-gray-400 mb-3">スキル</div>
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            {[1, 2, 3].map(num => {
                                const skill = equipment[`skill${num}`];
                                const cd = skillCds[num-1];
                                return (
                                    <button 
                                        key={num} 
                                        onClick={() => handleUseSkill(num)} 
                                        disabled={player.hp <= 0 || cd > 0 || !skill || (skill.skillData?.mpCost && player.mp < skill.skillData.mpCost)} 
                                        className={`aspect-square rounded-lg flex flex-col items-center justify-center relative overflow-hidden border-2 transition-all
                                            ${skill ? 'bg-slate-800 border-gray-700' : 'bg-gray-900 border-gray-800 opacity-50'} 
                                            ${cd > 0 ? 'grayscale cursor-not-allowed' : skill ? 'hover:border-white hover:scale-105 active:scale-95' : ''}
                                        `}
                                    >
                                        {skill ? (
                                            <>
                                                <div className="text-2xl mb-1">{getElementConfig(skill.skillData.element).icon}</div>
                                                <span className="text-xs leading-none text-center px-1">{skill.skillData.name}</span>
                                                {cd > 0 && (
                                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                                        <span className="text-2xl font-bold text-white">{Math.ceil(cd)}</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-xs text-gray-600">Empty</span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-end gap-3">
                        <button 
                            onClick={handleAttack} 
                            disabled={player.hp <= 0} 
                            className="w-full py-4 bg-gradient-to-b from-red-700 to-red-900 rounded-lg flex items-center justify-center gap-2 text-white font-bold text-lg shadow-lg hover:from-red-600 hover:to-red-800 active:scale-[0.98] transition-all"
                        >
                            <Sword size={24}/> 攻撃
                        </button>
                        <button 
                            onClick={healPlayer} 
                            className="w-full py-3 bg-gray-800 rounded-lg flex items-center justify-center gap-2 text-green-400 hover:bg-gray-700 active:scale-95 transition-all border border-gray-700"
                        >
                            <Heart size={18} /> 回復 (-{player.level*5}G)
                        </button>
                    </div>
                </aside>
            </div>
        )}

        {/* --- Modals --- */}

        {inkModeItem && (
             <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-8">
                <div className="bg-gray-800 w-full max-w-2xl rounded-xl border-2 border-purple-500 p-8 shadow-2xl">
                    <div className="text-center mb-6">
                        <h3 className="text-2xl font-bold text-purple-400 mb-2">インクを選択</h3>
                        <p className="text-sm text-gray-400">装着するインクを選んでください</p>
                    </div>
                    <div className="grid grid-cols-8 gap-3 mb-6">
                        {inventory.filter(i => i.type === 'ink').map(item => (
                             <ItemSlot key={item.id} item={item} onClick={() => attachInk(inkModeItem, item)} />
                        ))}
                        {inventory.filter(i => i.type === 'ink').length === 0 && (
                            <div className="col-span-8 text-center text-gray-500 py-8">インクを持っていません</div>
                        )}
                    </div>
                    <button onClick={() => setInkModeItem(null)} className="w-full py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors font-bold">キャンセル</button>
                </div>
             </div>
        )}


        {selectedItem?.type === 'portal_basic' && (
            <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-8" onClick={() => setSelectedItem(null)}>
                <div className="bg-gray-800 w-full max-w-md rounded-xl border-2 border-gray-700 p-8 shadow-2xl" onClick={e => e.stopPropagation()}>
                    <h3 className="text-2xl font-bold mb-4">始まりの平原</h3>
                    <p className="text-base text-gray-400 mb-8">全5階層。コストなしで何度でも挑戦できます。</p>
                    <button onClick={() => { startDungeon(null); setSelectedItem(null); }} className="w-full py-4 bg-blue-600 rounded-lg font-bold text-lg hover:bg-blue-500 transition-colors">出発</button>
                </div>
            </div>
        )}

        {selectedItem && selectedItem.type !== 'portal_basic' && (
            <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-8" onClick={() => setSelectedItem(null)}>
                <div className="bg-gray-800 w-full max-w-2xl rounded-xl border-2 border-gray-700 p-8 shadow-2xl animate-[slideUp_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
                    
                    {selectedItem.name && (
                        <div className="flex gap-6 mb-6">
                            <div className={`w-20 h-20 rounded-lg flex items-center justify-center border-2 ${RARITIES[selectedItem.rarity]?.bg || 'bg-gray-800'} ${RARITIES[selectedItem.rarity]?.border || 'border-gray-600'}`}>
                                <ItemIcon item={selectedItem} size={40} />
                            </div>
                            <div className="flex-1">
                                <div className={`text-sm font-bold uppercase mb-2 ${RARITIES[selectedItem.rarity]?.color || 'text-gray-400'}`}>
                                    {RARITIES[selectedItem.rarity]?.label || 'Item'}
                                </div>
                                <div className="text-2xl font-bold">{selectedItem.name || '無名のアイテム'}</div>
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-900 p-6 rounded-lg border border-gray-700 mb-6 text-base max-h-96 overflow-y-auto">
                        {selectedItem.type === 'ink' && (
                            <div className="text-purple-300 mb-4">
                                <div className="text-lg mb-2">効果: {selectedItem.mod.label} {selectedItem.mod.val > 0 ? '+' : ''}{selectedItem.mod.val}{selectedItem.mod.unit || ''}</div>
                                {selectedItem.mod.penalty && (
                                    <div className="text-red-400 text-sm">
                                        デメリット: {selectedItem.mod.penalty.type === 'power_down' ? '威力低下' : 'CD増加'} {selectedItem.mod.penalty.val * 100}%
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedItem.type === 'enhancement_stone' && (
                            <div className="text-yellow-300 mb-4">
                                <div className="text-lg mb-2">効果: 装備品の基本ステータスを{(selectedItem.mult * 100).toFixed(0)}%強化</div>
                                {selectedItem.count && selectedItem.count > 1 && (
                                    <div className="text-sm text-blue-400 mb-2">所持数: {selectedItem.count}</div>
                                )}
                                <div className="text-sm text-gray-400">武器、防具、アクセサリに使用できます</div>
                            </div>
                        )}

                        {selectedItem.type === 'enchant_scroll' && (
                            <div className="text-blue-300 mb-4">
                                <div className="text-lg mb-2">効果: 装備品にランダムオプションを1つ追加</div>
                                {selectedItem.count && selectedItem.count > 1 && (
                                    <div className="text-sm text-blue-400 mb-2">所持数: {selectedItem.count}</div>
                                )}
                                <div className="text-sm text-gray-400">オプション枠に空きがある装備品に使用できます</div>
                            </div>
                        )}

                        {selectedItem.type === 'element_stone' && (
                            <div className="text-cyan-300 mb-4">
                                <div className="text-lg mb-2">効果: {getElementConfig(selectedItem.element).label}耐性 +{selectedItem.value}%を付与</div>
                                {selectedItem.count && selectedItem.count > 1 && (
                                    <div className="text-sm text-blue-400 mb-2">所持数: {selectedItem.count}</div>
                                )}
                                <div className="text-sm text-gray-400">オプション枠に空きがある装備品に使用できます</div>
                            </div>
                        )}

                        {selectedItem.type === 'special_stone' && (
                            <div className="text-purple-300 mb-4">
                                <div className="text-lg mb-2">効果: 特殊オプション「{SPECIAL_OPTIONS.find(o => o.type === selectedItem.specialType)?.label || ''} +{selectedItem.value}{SPECIAL_OPTIONS.find(o => o.type === selectedItem.specialType)?.unit || ''}」を付与</div>
                                {selectedItem.count && selectedItem.count > 1 && (
                                    <div className="text-sm text-blue-400 mb-2">所持数: {selectedItem.count}</div>
                                )}
                                <div className="text-sm text-gray-400">オプション枠に空きがある装備品に使用できます</div>
                            </div>
                        )}

                        {selectedItem.type === 'reroll_scroll' && (
                            <div className="text-green-300 mb-4">
                                <div className="text-lg mb-2">効果: 装備品のランダムなオプションを1つ変更</div>
                                {selectedItem.count && selectedItem.count > 1 && (
                                    <div className="text-sm text-blue-400 mb-2">所持数: {selectedItem.count}</div>
                                )}
                                <div className="text-sm text-gray-400">オプションが存在する装備品に使用できます</div>
                            </div>
                        )}

                        {selectedItem.type === 'option_slot_stone' && (
                            <div className="text-cyan-300 mb-4">
                                <div className="text-lg mb-2">効果: 装備品のオプション枠を{selectedItem.slots || 1}つ増やす</div>
                                {selectedItem.count && selectedItem.count > 1 && (
                                    <div className="text-sm text-blue-400 mb-2">所持数: {selectedItem.count}</div>
                                )}
                                <div className="text-sm text-gray-400">最大5枠まで増やすことができます</div>
                            </div>
                        )}

                        {selectedItem.type === 'rarity_upgrade_stone' && (
                            <div className="text-orange-300 mb-4">
                                <div className="text-lg mb-2">効果: 装備品のレアリティを{selectedItem.upgrades || 1}段階上げる</div>
                                {selectedItem.count && selectedItem.count > 1 && (
                                    <div className="text-sm text-blue-400 mb-2">所持数: {selectedItem.count}</div>
                                )}
                                <div className="text-sm text-gray-400">レジェンダリーまで上げることができます</div>
                            </div>
                        )}

                        {selectedItem.type === 'skill' && selectedItem.skillData && (
                            <div className="mb-4">
                                {selectedItem.skillData.level && (
                                    <div className="text-yellow-400 text-lg font-bold mb-3">Lv.{selectedItem.skillData.level}</div>
                                )}
                                {selectedItem.skillData.requiredStat && (
                                    <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-4">
                                        <div className="text-red-400 text-sm font-bold mb-1">必要能力値: {selectedItem.skillData.requiredStat}</div>
                                        <div className="text-xs text-gray-400">現在: {getStats.str + getStats.vit + getStats.dex}</div>
                                        {(getStats.str + getStats.vit + getStats.dex) < selectedItem.skillData.requiredStat && (
                                            <div className="text-red-500 text-xs mt-1">※装備できません</div>
                                        )}
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="text-cyan-300 flex justify-between items-center">
                                        <span className="text-gray-400">タイプ</span>
                                        <span className="font-bold">{selectedItem.skillData.type === 'buff' ? 'BUFF' : selectedItem.skillData.type === 'heal' ? 'HEAL' : 'ATTACK'}</span>
                                    </div>
                                    <div className="text-cyan-300 flex justify-between items-center">
                                        <span className="text-gray-400">属性</span>
                                        <span className="font-bold">{getElementConfig(selectedItem.skillData.element || 'none').label}</span>
                                    </div>
                                    {selectedItem.skillData.power !== undefined && (
                                        <div className="text-cyan-300 flex justify-between items-center">
                                            <span className="text-gray-400">威力</span>
                                            <span className="font-bold">x{typeof selectedItem.skillData.power === 'number' ? selectedItem.skillData.power.toFixed(1) : selectedItem.skillData.power}</span>
                                        </div>
                                    )}
                                    {selectedItem.skillData.cd !== undefined && (
                                        <div className="text-cyan-300 flex justify-between items-center">
                                            <span className="text-gray-400">CD</span>
                                            <span className="font-bold">{selectedItem.skillData.cd}s</span>
                                        </div>
                                    )}
                                    {selectedItem.skillData.mpCost !== undefined && (
                                        <div className="text-cyan-300 flex justify-between items-center">
                                            <span className="text-gray-400">MPコスト</span>
                                            <span className="font-bold text-cyan-400">{selectedItem.skillData.mpCost}</span>
                                        </div>
                                    )}
                                    {selectedItem.skillData.duration !== undefined && (
                                        <div className="text-cyan-300 flex justify-between items-center">
                                            <span className="text-gray-400">持続時間</span>
                                            <span className="font-bold">{selectedItem.skillData.duration}s</span>
                                        </div>
                                    )}
                                </div>
                                
                                {selectedItem.inkSlots !== undefined && (
                                    <div className="mt-4 pt-4 border-t border-gray-800">
                                        <div className="text-sm text-gray-500 mb-3">インクスロット ({(selectedItem.inks?.length || 0)}/{selectedItem.inkSlots})</div>
                                        <div className="flex gap-2 flex-wrap">
                                            {(selectedItem.inks || []).map((ink, i) => (
                                                <div key={i} className="bg-purple-900/40 border border-purple-500 px-3 py-2 rounded-lg text-sm text-purple-200">
                                                    {ink.name || ink.mod?.label || `インク ${i + 1}`}
                                                </div>
                                            ))}
                                            {(selectedItem.inks?.length || 0) < (selectedItem.inkSlots || 0) && !selectedItem.isEquipped && (
                                                <button onClick={() => { setInkModeItem(selectedItem); setSelectedItem(null); }} className="bg-gray-800 border-2 border-dashed border-gray-600 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white transition-colors">
                                                    + インク装着
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {(selectedItem.baseStats || selectedItem.stats) && Object.keys(selectedItem.baseStats || selectedItem.stats || {}).length > 0 && (
                            <>
                                {Object.entries(selectedItem.baseStats || selectedItem.stats || {}).map(([k, v]) => (
                                    <div key={k} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                                        <span className="text-gray-400 uppercase text-sm">{k}</span>
                                        <span className="font-bold text-lg">{v}</span>
                                    </div>
                                ))}
                            </>
                        )}
                        {selectedItem.options && selectedItem.options.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-800">
                                {renderMergedOptions(selectedItem.options)}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         {selectedItem.type !== 'stone' && !selectedItem.isEquipped && !['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'].includes(selectedItem.type) ? (
                             <>
                                <button onClick={() => sellItem(selectedItem)} className="py-4 rounded-lg border-2 border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors font-bold">
                                    売却
                                </button>
                                {warehouseTab ? (
                                    <button onClick={() => moveToInventory(selectedItem)} className="py-4 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-500 transition-colors">
                                        インベントリへ移動
                                    </button>
                                ) : (
                                    <button onClick={() => moveToWarehouse(selectedItem)} className="py-4 rounded-lg bg-indigo-600 text-white font-bold text-lg hover:bg-indigo-500 transition-colors">
                                        倉庫へ移動
                                    </button>
                                )}
                                {selectedItem.type === 'skill' ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => equipItem(selectedItem, 1)} className="flex-1 py-3 bg-blue-900 text-white text-sm rounded-lg hover:bg-blue-800 transition-colors font-bold">S1</button>
                                        <button onClick={() => equipItem(selectedItem, 2)} className="flex-1 py-3 bg-blue-900 text-white text-sm rounded-lg hover:bg-blue-800 transition-colors font-bold">S2</button>
                                        <button onClick={() => equipItem(selectedItem, 3)} className="flex-1 py-3 bg-blue-900 text-white text-sm rounded-lg hover:bg-blue-800 transition-colors font-bold">S3</button>
                                    </div>
                                ) : selectedItem.type !== 'ink' ? (
                                    <div className="flex gap-2">
                                        <button onClick={() => equipItem(selectedItem)} className="flex-1 py-4 rounded-lg bg-blue-600 text-white font-bold text-lg hover:bg-blue-500 transition-colors">
                                            装備
                                        </button>
                                        {!warehouseTab && (
                                            <button onClick={() => moveToWarehouse(selectedItem)} className="px-4 py-4 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-colors" title="倉庫へ移動">
                                                <Warehouse size={20} />
                                            </button>
                                        )}
                                    </div>
                                ) : null}
                             </>
                         ) : selectedItem.isEquipped ? (
                             <div className="col-span-2 space-y-3">
                                <div className="text-center text-sm text-gray-500 py-2 bg-gray-900 rounded-lg">装備中</div>
                                <div className="flex gap-2">
                                    <button onClick={() => unequipItem(selectedItem.type === 'skill' ? Object.keys(equipment).find(key => equipment[key]?.id === selectedItem.id) : selectedItem.type)} className="flex-1 py-4 bg-red-900/50 text-red-200 border-2 border-red-800 rounded-lg text-base font-bold hover:bg-red-900/70 transition-colors">
                                        外す
                                    </button>
                                    {!warehouseTab && (
                                        <button onClick={() => { unequipItem(selectedItem.type === 'skill' ? Object.keys(equipment).find(key => equipment[key]?.id === selectedItem.id) : selectedItem.type); moveToWarehouse(selectedItem); }} className="px-4 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors" title="外して倉庫へ移動">
                                            <Warehouse size={20} />
                                        </button>
                                    )}
                                </div>
                             </div>
                         ) : null}
                         
                         {selectedItem.type === 'stone' && (
                            <>
                                <button onClick={() => sellItem(selectedItem)} className="py-4 rounded-lg border-2 border-slate-600 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors font-bold">
                                    売却
                                </button>
                                <div className="flex gap-2">
                                    <button onClick={() => { startDungeon(selectedItem); setSelectedItem(null); }} className="flex-1 py-4 rounded-lg bg-cyan-700 text-white font-bold text-lg hover:bg-cyan-600 transition-colors">
                                        使用
                                    </button>
                                    {warehouseTab && (
                                        <button onClick={() => moveToInventory(selectedItem)} className="px-4 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors" title="インベントリへ移動">
                                            <Backpack size={20} />
                                        </button>
                                    )}
                                </div>
                            </>
                         )}

                         {['enhancement_stone', 'enchant_scroll', 'element_stone', 'special_stone', 'reroll_scroll', 'option_slot_stone', 'rarity_upgrade_stone'].includes(selectedItem.type) && (
                            <>
                                <button onClick={() => sellItem(selectedItem)} className="py-4 rounded-lg border-2 border-gray-600 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors font-bold">
                                    売却
                                </button>
                                <div className="flex gap-2">
                                    <button onClick={() => { setTab('equipment'); setEquipmentItemMode(selectedItem); setSelectedItem(null); }} className="flex-1 py-4 rounded-lg bg-green-600 text-white font-bold text-lg hover:bg-green-500 transition-colors">
                                        装備強化タブで使用
                                    </button>
                                    {warehouseTab ? (
                                        <button onClick={() => moveToInventory(selectedItem)} className="px-4 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors" title="インベントリへ移動">
                                            <Backpack size={20} />
                                        </button>
                                    ) : (
                                        <button onClick={() => moveToWarehouse(selectedItem)} className="px-4 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors" title="倉庫へ移動">
                                            <Warehouse size={20} />
                                        </button>
                                    )}
                                </div>
                            </>
                         )}
                    </div>
                </div>
            </div>
        )}
        
        <style>{`
            @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
            .mask-linear-fade { mask-image: linear-gradient(to bottom, transparent, black 20%); }
        `}</style>
      </main>
    </div>
  );
}