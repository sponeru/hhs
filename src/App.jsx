import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sword, Shield, Zap, Heart, Skull, Coins, ShoppingBag, 
  RefreshCw, Star, Trophy, Trash2, Backpack, Gem, X, Hammer, Sparkles,
  Map as MapIcon, ArrowRight, LogOut, Flame, Flag, Scroll, Snowflake, Sun, Moon, Wind, 
  Droplet, PlayCircle, Layers, Clock, ChevronsUp, AlertTriangle
} from 'lucide-react';

// ==========================================
// Section 1: Constants & Data Definitions
// ==========================================

const INITIAL_PLAYER = {
  level: 1,
  exp: 0,
  expToNext: 50,
  gold: 0,
  hp: 100,
  maxHp: 100,
  stats: { str: 5, vit: 5, dex: 5 },
  statPoints: 0,
  buffs: [], // Active buffs
};

const INITIAL_EQUIPMENT = {
  weapon: { id: 'init_w', name: "木の棒", type: "weapon", baseStats: { atk: 2 }, options: [], rarity: "common", power: 1 },
  armor: { id: 'init_a', name: "ボロボロの服", type: "armor", baseStats: { def: 1 }, options: [], rarity: "common", power: 1 },
  accessory: null,
  skill1: null, 
  skill2: null,
  skill3: null,
};

const MAX_INVENTORY = 25;
const MAX_STONES = 10;
const ELEMENTS = ['fire', 'ice', 'thunder', 'light', 'dark'];

const ELEMENT_CONFIG = {
  fire: { label: '火', icon: <Flame size={14} />, color: 'text-red-500', bg: 'bg-red-900/30' },
  ice: { label: '氷', icon: <Snowflake size={14} />, color: 'text-cyan-400', bg: 'bg-cyan-900/30' },
  thunder: { label: '雷', icon: <Zap size={14} />, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
  light: { label: '光', icon: <Sun size={14} />, color: 'text-orange-300', bg: 'bg-orange-900/30' },
  dark: { label: '闇', icon: <Moon size={14} />, color: 'text-purple-400', bg: 'bg-purple-900/30' },
  none: { label: '無', icon: <Sword size={14} />, color: 'text-gray-400', bg: 'bg-gray-800' }
};

const RARITIES = {
  common: { color: "text-gray-400", border: "border-gray-600", bg: "bg-gray-800", label: "コモン", mult: 1, optCount: 0, inkSlots: 1 },
  uncommon: { color: "text-green-400", border: "border-green-600", bg: "bg-green-900/30", label: "アンコモン", mult: 1.5, optCount: 2, inkSlots: 2 },
  rare: { color: "text-blue-400", border: "border-blue-600", bg: "bg-blue-900/30", label: "レア", mult: 2.5, optCount: 3, inkSlots: 3 },
  epic: { color: "text-purple-400", border: "border-purple-600", bg: "bg-purple-900/30", label: "エピック", mult: 4, optCount: 4, inkSlots: 4 },
  legendary: { color: "text-yellow-400", border: "border-yellow-600", bg: "bg-yellow-900/30", label: "レジェンダリー", mult: 7, optCount: 5, inkSlots: 5 },
};

const SKILL_TEMPLATES = [
  // Attacks
  { name: "ファイアボール", type: 'attack', element: 'fire', power: 2.5, cd: 3 },
  { name: "アイスニードル", type: 'attack', element: 'ice', power: 2.2, cd: 3 },
  { name: "サンダーボルト", type: 'attack', element: 'thunder', power: 2.8, cd: 4 },
  { name: "ホーリーレイ", type: 'attack', element: 'light', power: 3.0, cd: 5 },
  { name: "ダークマター", type: 'attack', element: 'dark', power: 3.5, cd: 6 },
  { name: "メテオストライク", type: 'attack', element: 'fire', power: 5.0, cd: 10, rarity: 'legendary' },
  // Buffs
  { name: "ヒールライト", type: 'heal', element: 'light', power: 50, cd: 10, label: "HP回復" },
  { name: "バーサーク", type: 'buff', element: 'fire', buffType: 'atk', val: 0.5, duration: 10, cd: 20, label: "攻撃UP" },
  { name: "アイアンガード", type: 'buff', element: 'none', buffType: 'def', val: 20, duration: 15, cd: 20, label: "防御UP" },
  { name: "クイックステップ", type: 'buff', element: 'thunder', buffType: 'cdSpeed', val: 0.5, duration: 10, cd: 25, label: "CD加速" },
];

const INK_MODS = [
  { type: 'power_up', label: '威力強化', stat: 'power', val: 0.2, unit: 'x' },
  { type: 'cd_down', label: 'CD短縮', stat: 'cd', val: -0.15, unit: '%' },
  { type: 'dur_up', label: '時間延長', stat: 'duration', val: 0.3, unit: '%' },
];

const INK_RARE_MODS = [
  { type: 'auto_cast', label: '自動発動', isRare: true, penalty: { type: 'power_down', val: -0.3 } },
  { type: 'multi_cast', label: '2回発動', isRare: true, val: 1, penalty: { type: 'cd_up', val: 0.5 } },
];

// Item Options
const BASIC_OPTIONS = [
  { type: 'str', label: '筋力', weight: 10 },
  { type: 'vit', label: '体力', weight: 10 },
  { type: 'dex', label: '幸運', weight: 10 },
  { type: 'atk', label: '攻撃力', weight: 5 },
  { type: 'def', label: '防御力', weight: 5 },
  { type: 'maxHp', label: '最大HP', weight: 8 },
  { type: 'res_fire', label: '火耐性', unit: '%', weight: 5, isRes: true },
  { type: 'res_ice', label: '氷耐性', unit: '%', weight: 5, isRes: true },
  { type: 'res_thunder', label: '雷耐性', unit: '%', weight: 5, isRes: true },
  { type: 'res_light', label: '光耐性', unit: '%', weight: 5, isRes: true },
  { type: 'res_dark', label: '闇耐性', unit: '%', weight: 5, isRes: true },
];

const SPECIAL_OPTIONS = [
  { type: 'vamp', label: 'HP吸収', unit: '%', min: 1, max: 5 },
  { type: 'gold', label: 'G獲得', unit: '%', min: 10, max: 50 },
  { type: 'exp', label: 'EXP獲得', unit: '%', min: 10, max: 50 },
  { type: 'critDmg', label: '会心ダメ', unit: '%', min: 20, max: 100 },
];

const STONE_MODS = [
  { type: 'risk_hp', label: '敵HP', valMin: 20, valMax: 100, unit: '%', isRisk: true },
  { type: 'risk_atk', label: '敵攻撃力', valMin: 20, valMax: 80, unit: '%', isRisk: true },
  { type: 'risk_dmg', label: '被ダメ', valMin: 10, valMax: 50, unit: '%', isRisk: true },
  { type: 'reward_exp', label: '獲得EXP', valMin: 20, valMax: 100, unit: '%', isReward: true },
  { type: 'reward_gold', label: '獲得Gold', valMin: 20, valMax: 100, unit: '%', isReward: true },
  { type: 'reward_drop', label: '装備数', valMin: 1, valMax: 3, unit: '個増', isReward: true },
  { type: 'qual_rarity', label: 'レア度', valMin: 10, valMax: 50, unit: '%向上', isReward: true },
  { type: 'mod_floor_add', label: '階層', valMin: 1, valMax: 5, unit: '階増', isRisk: true }, 
  { type: 'mod_floor_sub', label: '階層', valMin: 1, valMax: 3, unit: '階減', isReward: true }, 
];

const MONSTER_NAMES = [
  { name: "スライム", icon: "💧", baseHp: 20, baseExp: 10, baseGold: 2 },
  { name: "コウモリ", icon: "🦇", baseHp: 35, baseExp: 15, baseGold: 5 },
  { name: "ゴブリン", icon: "👺", baseHp: 60, baseExp: 25, baseGold: 10 },
  { name: "スケルトン", icon: "💀", baseHp: 90, baseExp: 40, baseGold: 15 },
  { name: "オーク", icon: "👹", baseHp: 150, baseExp: 70, baseGold: 30 },
  { name: "ゴーレム", icon: "🗿", baseHp: 300, baseExp: 120, baseGold: 60 },
  { name: "ドラゴン", icon: "🐉", baseHp: 1000, baseExp: 500, baseGold: 300 },
];

const ITEM_PREFIXES = ["錆びた", "普通の", "鋭い", "重厚な", "疾風の", "達人の", "勇者の", "魔王の", "神々の"];
const WEAPON_NAMES = ["ダガー", "ソード", "アックス", "メイス", "カタナ", "グレートソード"];
const ARMOR_NAMES = ["ローブ", "レザー", "メイル", "プレート", "フルプレート"];
const ACC_NAMES = ["リング", "アミュレット", "タリスマン", "オーブ"];

// ==========================================
// Section 2: Game Logic Helpers
// ==========================================

const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateEnemy = (floor, dungeonMods = {}, isFinalBoss = false) => {
  const scaling = Math.pow(1.15, floor - 1);
  const typeIndex = Math.min(Math.floor((floor - 1) / 5), MONSTER_NAMES.length - 1);
  const type = MONSTER_NAMES[typeIndex];
  
  const isBoss = isFinalBoss || (floor % 10 === 0);
  const finalScaling = isBoss ? scaling * 3 : scaling;

  const hpMod = 1 + ((dungeonMods.risk_hp || 0) / 100);
  const atkMod = 1 + ((dungeonMods.risk_atk || 0) / 100);
  
  let element = 'none';
  if (isBoss || Math.random() < 0.4) {
      element = ELEMENTS[randomInt(0, ELEMENTS.length - 1)];
  }

  return {
    name: isBoss ? `BOSS: ${type.name}ロード` : type.name,
    icon: isBoss ? "👑" : type.icon,
    maxHp: Math.floor(type.baseHp * finalScaling * hpMod),
    hp: Math.floor(type.baseHp * finalScaling * hpMod),
    atk: Math.floor((floor * 2 + 5) * (isBoss ? 1.5 : 1) * atkMod),
    exp: Math.floor(type.baseExp * scaling), 
    gold: Math.floor(type.baseGold * scaling),
    element,
    isBoss,
    wait: 0,
    maxWait: Math.max(20, 100 - floor), 
  };
};

const generateOptions = (rarityKey, power, dungeonMods = {}) => {
  const options = [];
  const config = RARITIES[rarityKey];
  let pool = [...BASIC_OPTIONS];
  let specialPool = [...SPECIAL_OPTIONS];

  for (let i = 0; i < config.optCount; i++) {
    const optType = pool[randomInt(0, pool.length - 1)];
    let val = Math.max(1, Math.floor(power * (randomInt(5, 15) / 100)));
    
    if (optType.type === 'maxHp') val *= 5;
    if (['str','vit','dex'].includes(optType.type)) val = Math.max(1, Math.floor(val / 2));
    if (optType.isRes) val = randomInt(5, 20); 

    options.push({ ...optType, val, isSpecial: false });
  }

  if (rarityKey === 'legendary') {
    const special = specialPool[randomInt(0, specialPool.length - 1)];
    const val = randomInt(special.min, special.max);
    options.push({ ...special, val, isSpecial: true });
  }
  return options;
};

const generateInk = (floor) => {
  const rarityRoll = Math.random();
  let rarityKey = 'common';
  if (rarityRoll > 0.9) rarityKey = 'rare'; // High rarity ink has powerful effects
  
  const isRareMod = rarityKey === 'rare' || Math.random() > 0.8;
  let modTemplate;
  
  if (isRareMod) {
      modTemplate = INK_RARE_MODS[randomInt(0, INK_RARE_MODS.length - 1)];
      rarityKey = 'rare';
  } else {
      modTemplate = INK_MODS[randomInt(0, INK_MODS.length - 1)];
  }
  
  return {
      id: Date.now() + Math.random(),
      type: 'ink',
      name: `${modTemplate.label}インク`,
      mod: { ...modTemplate },
      rarity: rarityKey,
      isNew: true
  };
};

const generateLoot = (floor, dungeonMods = {}) => {
  const rand = Math.random();
  const rarityBoost = (dungeonMods.qual_rarity || 0) / 100;
  
  let rarityKey = "common";
  if (rand > (0.98 - rarityBoost * 0.1)) rarityKey = "legendary";
  else if (rand > (0.90 - rarityBoost * 0.2)) rarityKey = "epic";
  else if (rand > (0.75 - rarityBoost * 0.3)) rarityKey = "rare";
  else if (rand > (0.50 - rarityBoost * 0.3)) rarityKey = "uncommon";

  const rarity = RARITIES[rarityKey];
  
  const typeRoll = Math.random();
  let type = "weapon";
  let baseName = "";
  let baseStats = {};
  let skillData = null;
  let inks = [];
  let inkSlots = 0;

  const tierMult = floor * 1.5;
  const power = tierMult * rarity.mult;

  if (typeRoll < 0.3) {
    type = "weapon";
    baseName = WEAPON_NAMES[randomInt(0, WEAPON_NAMES.length - 1)];
    baseStats.atk = Math.floor(power * randomInt(8, 12) / 10) + 1;
  } else if (typeRoll < 0.55) {
    type = "armor";
    baseName = ARMOR_NAMES[randomInt(0, ARMOR_NAMES.length - 1)];
    baseStats.def = Math.floor(power * randomInt(8, 12) / 20) + 1;
    baseStats.hp = Math.floor(power * 2);
  } else if (typeRoll < 0.75) {
    type = "accessory";
    baseName = ACC_NAMES[randomInt(0, ACC_NAMES.length - 1)];
    baseStats.str = Math.floor(power / 15);
    baseStats.vit = Math.floor(power / 15);
  } else if (typeRoll < 0.90) {
    type = "skill";
    const templates = SKILL_TEMPLATES.filter(s => !s.rarity || s.rarity === rarityKey);
    const template = templates.length > 0 ? templates[randomInt(0, templates.length - 1)] : SKILL_TEMPLATES[0];
    baseName = `${template.name}の巻物`;
    skillData = { ...template };
    skillData.power = template.type === 'attack' ? template.power + (power * 0.01) : template.power + Math.floor(power/2);
    inkSlots = RARITIES[rarityKey].inkSlots;
  } else {
    // Ink Drop
    return generateInk(floor);
  }

  const options = type === 'skill' ? [] : generateOptions(rarityKey, power, dungeonMods);
  const prefix = type === 'skill' ? '' : ITEM_PREFIXES[Math.min(Math.floor(floor / 10), ITEM_PREFIXES.length - 1)];
  
  return {
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    name: `${prefix}${baseName}`,
    type,
    baseStats,
    options,
    skillData,
    inkSlots,
    inks,
    rarity: rarityKey,
    power: Math.floor(power),
    isNew: true
  };
};

const generateMagicStone = (floor) => {
  const tier = Math.floor(floor);
  const rand = Math.random();
  let rarityKey = "common";
  if (rand > 0.95) rarityKey = "legendary";
  else if (rand > 0.85) rarityKey = "epic";
  else if (rand > 0.65) rarityKey = "rare";
  else if (rand > 0.40) rarityKey = "uncommon";
  
  const rarityConfig = RARITIES[rarityKey];
  const modCount = randomInt(1, rarityConfig.optCount);
  const mods = [];
  
  const risks = STONE_MODS.filter(m => m.isRisk);
  const rewards = STONE_MODS.filter(m => m.isReward);

  mods.push({ ...risks[randomInt(0, risks.length - 1)], val: randomInt(20, 50) }); 

  for(let i=0; i<modCount; i++) {
     const pool = Math.random() > 0.5 ? risks : rewards;
     const mod = pool[randomInt(0, pool.length - 1)];
     if (mod.valMin) mods.push({ ...mod, val: randomInt(mod.valMin, mod.valMax) });
     else mods.push({ ...mod }); 
  }

  let baseFloor = 5 + randomInt(0, 5);
  mods.forEach(m => {
      if(m.type === 'mod_floor_add') baseFloor += m.val;
      if(m.type === 'mod_floor_sub') baseFloor -= m.val;
  });
  const maxFloor = Math.max(3, baseFloor);

  return {
    id: 'stone_' + Date.now() + Math.random(),
    name: `魔法石 Lv.${tier}`,
    tier,
    mods,
    type: 'stone',
    rarity: rarityKey,
    maxFloor
  };
};

// ==========================================
// Section 3: Sub Components
// ==========================================

const ItemIcon = ({ item, size = 24 }) => {
  if (item.type === 'weapon') return <Sword size={size} />;
  if (item.type === 'armor') return <Shield size={size} />;
  if (item.type === 'stone') return <MapIcon size={size} />;
  if (item.type === 'ink') return <Droplet size={size} className="text-purple-400" />;
  if (item.type === 'skill') {
      const el = item.skillData?.element || 'none';
      return ELEMENT_CONFIG[el].icon;
  }
  return <Gem size={size} />;
};

const ItemSlot = React.memo(({ item, onClick, isEquipped = false, isSelected = false }) => {
  if (!item) return (
      <div className="aspect-square bg-gray-800 rounded border border-gray-700 flex items-center justify-center opacity-50">
          <div className="w-2 h-2 rounded-full bg-gray-700" />
      </div>
  );

  const isStone = item.type === 'stone';
  const isSkill = item.type === 'skill';
  const isInk = item.type === 'ink';
  const rarity = RARITIES[item.rarity] || RARITIES.common;
  const hasSpecial = item.options?.some(o => o.isSpecial) || (isStone && item.rarity === 'legendary') || (isInk && item.mod.isRare);

  let label = `Lv.${Math.floor(item.power)}`;
  if (isStone) label = `Lv.${item.tier}`;
  if (isSkill) label = 'Scroll';
  if (isInk) label = 'Ink';

  return (
      <button 
          onClick={() => onClick(item)}
          className={`aspect-square relative rounded p-1 flex flex-col items-center justify-center border-2 transition-all hover:scale-105 active:scale-95 
            ${rarity.bg} ${isSelected ? 'border-white shadow-[0_0_10px_white]' : rarity.border}`}
      >
          <div className={`${rarity.color} relative`}>
              <ItemIcon item={item} size={24} />
              {hasSpecial && <Sparkles size={12} className="absolute -top-1 -right-2 text-yellow-200 animate-pulse" />}
              {isSkill && item.inks && item.inks.length > 0 && (
                 <div className="absolute -bottom-1 -right-2 flex">
                    {item.inks.map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-purple-500 border border-black" />)}
                 </div>
              )}
          </div>
          {item.isNew && !isEquipped && (
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
          {isEquipped && (
              <div className="absolute -top-1 -left-1 bg-yellow-600 text-[8px] px-1 rounded text-white font-bold">E</div>
          )}
          <div className="text-[9px] text-gray-300 truncate w-full text-center mt-1 px-1 leading-none">
            {label}
          </div>
      </button>
  );
});

// ==========================================
// Section 4: Main Component
// ==========================================

export default function HackSlashGame() {
  const [phase, setPhase] = useState('town'); 
  const [player, setPlayer] = useState(INITIAL_PLAYER);
  const [equipment, setEquipment] = useState(INITIAL_EQUIPMENT);
  const [inventory, setInventory] = useState([]);
  const [stones, setStones] = useState([]); 
  
  const [activeDungeon, setActiveDungeon] = useState(null); 
  const [enemy, setEnemy] = useState(null);
  const [skillCds, setSkillCds] = useState([0, 0, 0]);
  
  const [logs, setLogs] = useState([]);
  const [tab, setTab] = useState('portal'); 
  const [floatingTexts, setFloatingTexts] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inkModeItem, setInkModeItem] = useState(null);
  
  useEffect(() => {
    const saved = localStorage.getItem('hackslash_save_v7');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setPlayer(data.player);
        setEquipment({...INITIAL_EQUIPMENT, ...data.equipment}); 
        setInventory(data.inventory || []);
        setStones(data.stones || []);
        setPhase('town'); 
      } catch (e) { console.error("Save corrupted"); }
    }
  }, []);

  useEffect(() => {
    const data = { player, equipment, inventory, stones };
    localStorage.setItem('hackslash_save_v7', JSON.stringify(data));
  }, [player, equipment, inventory, stones]);

  // --- Core Logic ---

  const getStats = useMemo(() => {
    let stats = {
      str: player.stats.str, vit: player.stats.vit, dex: player.stats.dex,
      atk: 0, def: 0, hp: 0,
      vamp: 0, goldMult: 0, expMult: 0, critDmg: 0,
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

    const finalAtk = stats.atk + (stats.str * 2);
    const finalDef = stats.def + Math.floor(stats.vit / 2);
    const finalMaxHp = 100 + (stats.vit * 10) + stats.hp;
    const finalCrit = Math.min(75, stats.dex * 0.5);

    return { atk: finalAtk, def: finalDef, maxHp: finalMaxHp, crit: finalCrit, ...stats };
  }, [player.stats, equipment, player.buffs]);

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
    setPlayer(p => ({...p, buffs: []})); 
    addLog(`${stoneName} (F${floor}〜F${floor+maxFloor})に入場`, 'yellow');
  };

  const returnToTown = () => {
    setPhase('town');
    setTab('portal');
    setActiveDungeon(null);
    setEnemy(null);
    setPlayer(p => ({...p, hp: getStats.maxHp, buffs: []})); 
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
                  spawnFloatingText(dmg, ELEMENT_CONFIG[base.element].color.replace('text-',''), false);
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
      
      if (base.type !== 'buff') addLog(`${base.name}!`, ELEMENT_CONFIG[base.element].color.split('-')[1]);
  };

  const handleUseSkill = (slotNum) => {
      if (player.hp <= 0 || (enemy && enemy.hp <= 0)) return;
      const idx = slotNum - 1;
      if (skillCds[idx] > 0) return;

      const skillItem = equipment[`skill${slotNum}`];
      if (!skillItem) return;

      applySkillEffects(skillItem, idx);
  };

  const handleAttack = () => {
    if (player.hp <= 0 || enemy.hp <= 0) return;

    const isCrit = Math.random() * 100 < getStats.crit;
    let dmg = Math.floor(getStats.atk * (Math.random() * 0.4 + 0.8));
    if (isCrit) dmg = Math.floor(dmg * (1.5 + (getStats.critDmg / 100)));

    setSkillCds(prev => prev.map(cd => Math.max(0, cd - 0.5)));

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
      newPlayer.hp = getStats.maxHp;
      addLog(`Level Up! ${newPlayer.level}`, 'yellow');
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

  const distributeLoot = (floor, dMods, isBoss) => {
      const dropRate = isBoss ? 1.0 : 0.35;
      const dropCount = isBoss ? (1 + (dMods.reward_drop || 0)) : 1;

      for(let i=0; i<dropCount; i++) {
          if (Math.random() < dropRate && inventory.length < MAX_INVENTORY) {
              const loot = generateLoot(floor, dMods);
              setInventory(prev => [...prev, loot]);
              addLog(`${loot.name}を拾った`, 'blue');
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
  
  const equipItem = (item, slotIndex = null) => { 
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
    const value = item.type === 'stone' ? item.tier * 10 : Math.floor(item.power * 2);
    setPlayer(p => ({ ...p, gold: p.gold + value }));
    if (item.type === 'stone') setStones(prev => prev.filter(i => i.id !== item.id));
    else setInventory(prev => prev.filter(i => i.id !== item.id));
    setSelectedItem(null);
    addLog(`売却 (+${value}G)`, 'gray');
  };

  const attachInk = (scroll, ink) => {
      if (!scroll || !ink) return;
      if ((scroll.inks?.length || 0) >= scroll.inkSlots) return;
      
      const updatedScroll = { ...scroll, inks: [...(scroll.inks || []), ink] };
      setInventory(prev => prev.map(i => i.id === scroll.id ? updatedScroll : i).filter(i => i.id !== ink.id));
      
      setInkModeItem(updatedScroll);
      setSelectedItem(null);
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
        <div key={idx} className="flex justify-between items-center mb-1 last:mb-0">
            <span className={`text-xs ${opt.isSpecial ? 'text-yellow-400 font-bold' : 'text-blue-200'}`}>{opt.label}</span>
            <span className={`${opt.isSpecial ? 'text-yellow-400' : 'text-blue-200'}`}>+{opt.val}{opt.unit || ''}</span>
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
    <div className="min-h-screen bg-gray-950 text-white font-sans select-none overflow-hidden flex flex-col max-w-md mx-auto shadow-2xl border-x border-gray-800 relative">
      <header className="bg-gray-900 p-3 flex justify-between items-center shadow-md z-10 border-b border-gray-800">
        <div className="flex items-center gap-2">
            <div className="bg-gray-800 p-1.5 rounded text-yellow-500 font-bold text-sm flex items-center gap-1 min-w-[80px]">
                <Coins size={14} /> {player.gold.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">
                {phase === 'town' ? 'Town' : `F${activeDungeon?.floor} (${activeDungeon?.floor - activeDungeon?.startFloor + 1}/${activeDungeon?.maxFloor})`}
            </div>
        </div>
        {phase === 'town' ? (
             <div className="flex gap-2">
                <button onClick={() => setTab('portal')} className={`p-2 rounded ${tab === 'portal' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-400'}`}><Flame size={20} /></button>
                <button onClick={() => setTab('inventory')} className={`p-2 rounded relative ${tab === 'inventory' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}><Backpack size={20} />{inventory.length >= MAX_INVENTORY && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />}</button>
                <button onClick={() => setTab('stats')} className={`p-2 rounded relative ${tab === 'stats' ? 'bg-yellow-600 text-white' : 'bg-gray-800 text-gray-400'}`}><Trophy size={20} />{player.statPoints > 0 && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full" />}</button>
            </div>
        ) : (
            <button onClick={returnToTown} className="bg-red-900/50 text-red-200 text-xs px-3 py-1.5 rounded border border-red-800 flex items-center gap-1 hover:bg-red-900"><LogOut size={14} /> 帰還</button>
        )}
      </header>

      <main className="flex-1 relative flex flex-col overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-50">
            {floatingTexts.map(ft => (
                <div key={ft.id} className="absolute flex flex-col items-center animate-[floatUp_0.8s_forwards]" style={{ left: `${ft.x}%`, top: `${ft.y}%` }}>
                    <span className={`font-black ${ft.isCrit ? 'text-3xl' : 'text-xl'} text-${ft.color === 'red' ? 'red-500' : ft.color === 'green' ? 'green-400' : ft.color === 'yellow' ? 'yellow-400' : 'white'} drop-shadow-md`}>{ft.text}{ft.isCrit && "!"}</span>
                </div>
            ))}
            <style>{`@keyframes floatUp { 0% { transform:translate(-50%,0) scale(0.8); opacity:1; } 100% { transform:translate(-50%,-80px) scale(1); opacity:0; } }`}</style>
        </div>

        {phase === 'town' && tab === 'portal' && (
            <div className="p-4 h-full overflow-y-auto bg-slate-900">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Flame className="text-orange-500" /> 冒険に出る</h2>
                <div onClick={() => setSelectedItem({ type: 'portal_basic' })} className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6 cursor-pointer hover:bg-gray-750 hover:border-gray-500 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="bg-gray-700 p-3 rounded-full"><MapIcon size={24} className="text-gray-400" /></div>
                        <div><div className="font-bold text-white">始まりの平原</div><div className="text-xs text-gray-400">5階層 | コストなし</div></div>
                        <ArrowRight className="ml-auto text-gray-600" />
                    </div>
                </div>
                <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase">魔法石 ({stones.length}/{MAX_STONES})</h3>
                <div className="grid grid-cols-1 gap-3">
                    {stones.map(stone => {
                        const rarity = RARITIES[stone.rarity];
                        return (
                            <div key={stone.id} onClick={() => setSelectedItem(stone)} className={`bg-slate-800 p-3 rounded-lg border ${rarity.border} cursor-pointer hover:brightness-110 transition-all relative overflow-hidden`}>
                                <div className={`absolute top-0 left-0 w-1 h-full ${rarity.bg.replace('bg-', 'bg-')}`}></div>
                                <div className="flex items-center gap-3 pl-2">
                                     <div className={`bg-slate-900 p-2 rounded ${rarity.color}`}><MapIcon size={18} /></div>
                                     <div>
                                         <div className={`${rarity.color} font-bold text-sm`}>{stone.name}</div>
                                         <div className="text-[10px] text-slate-400">Tier {stone.tier} / 深度:{stone.maxFloor}F</div>
                                     </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )}

        {phase === 'town' && tab === 'stats' && (
             <div className="p-6 bg-gray-900 h-full overflow-y-auto">
                <h2 className="text-xl font-bold text-yellow-500 mb-6 flex items-center gap-2"><Trophy size={24}/> ステータス</h2>
                <div className="bg-gray-800 p-4 rounded-xl mb-6 flex justify-between items-center border border-gray-700">
                    <div><div className="text-xs text-gray-400">Points</div><div className="text-3xl font-bold text-white">{player.statPoints}</div></div>
                    {player.statPoints > 0 && <div className="text-xs text-yellow-500 animate-pulse">未割り当て</div>}
                </div>
                {['str','vit','dex'].map(k => (
                     <div key={k} className="flex justify-between items-center bg-gray-800 p-3 rounded mb-2">
                         <span className="text-gray-300 uppercase font-bold">{k}</span>
                         <div className="flex items-center gap-3">
                             <span className="text-xl font-mono">{player.stats[k]}</span>
                             {player.statPoints > 0 && <button onClick={() => increaseStat(k)} className="w-8 h-8 bg-yellow-600 rounded text-white font-bold">+</button>}
                         </div>
                     </div>
                ))}
             </div>
        )}

        {phase === 'town' && tab === 'inventory' && (
            <div className="flex-1 bg-gray-900 overflow-y-auto">
                <div className="p-6 bg-gray-800 rounded-b-3xl shadow-lg border-b border-gray-700 z-10 relative mb-4">
                     <div className="flex justify-center gap-4">
                        {['weapon', 'armor', 'accessory'].map(slot => (
                            <div key={slot} className="flex flex-col items-center gap-1">
                                <div className="w-14 h-14"><ItemSlot item={equipment[slot]} onClick={() => setSelectedItem({...equipment[slot], isEquipped: true})} isEquipped={true} /></div>
                                <span className="text-[9px] text-gray-500 uppercase">{slot}</span>
                            </div>
                        ))}
                     </div>
                     <div className="flex justify-center gap-4 mt-4 pt-4 border-t border-gray-700">
                        {[1, 2, 3].map(num => (
                            <div key={`skill${num}`} className="flex flex-col items-center gap-1">
                                <div className="w-12 h-12"><ItemSlot item={equipment[`skill${num}`]} onClick={() => setSelectedItem({...equipment[`skill${num}`], isEquipped: true})} isEquipped={true} /></div>
                                <span className="text-[9px] text-gray-500 uppercase">Skill {num}</span>
                            </div>
                        ))}
                     </div>
                </div>
                <div className="p-4">
                    <div className="grid grid-cols-5 gap-2">
                        {inventory.map(item => <ItemSlot key={item.id} item={item} onClick={() => {
                            if (inkModeItem) attachInk(inkModeItem, item); 
                            else setSelectedItem(item);
                        }} />)}
                    </div>
                </div>
            </div>
        )}

        {phase === 'dungeon' && (
            <>
                <div className="flex-1 flex flex-col items-center justify-center p-4 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 to-slate-950">
                    <div className="absolute top-4 left-4 flex flex-col gap-1">
                        {player.buffs.map(buff => (
                            <div key={buff.id} className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded text-[10px] text-cyan-300 border border-cyan-900">
                                <ChevronsUp size={12} />
                                {buff.name} ({buff.duration.toFixed(0)}s)
                            </div>
                        ))}
                    </div>

                    {enemy && (
                        <>
                            <div className={`text-7xl mb-4 transition-transform ${enemy.wait > enemy.maxWait - 5 ? 'scale-110' : 'scale-100'} ${enemy.hp===0 ? 'opacity-0' : ''}`}>{enemy.icon}</div>
                            <div className="w-full max-w-[200px] text-center">
                                <h2 className={`text-lg font-bold flex items-center justify-center gap-1 ${enemy.isBoss ? 'text-red-400' : 'text-gray-300'}`}>
                                    {enemy.element !== 'none' && ELEMENT_CONFIG[enemy.element].icon}
                                    {enemy.name}
                                </h2>
                                <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700 mt-1"><div className="h-full bg-red-600 transition-all" style={{ width: `${(enemy.hp / enemy.maxHp) * 100}%` }} /></div>
                                <div className="text-xs text-gray-500 mt-1">{enemy.hp} / {enemy.maxHp}</div>
                            </div>
                        </>
                    )}
                </div>
                
                <div className="bg-gray-900 p-4 pb-32 rounded-t-2xl border-t border-gray-800 shadow-xl z-10 relative">
                     <div className="flex justify-between items-center mb-2">
                         <div className="text-xs text-blue-400 font-bold">Lv.{player.level}</div>
                         <div className="text-xl font-bold text-green-400">{player.hp} <span className="text-sm text-gray-600">/ {getStats.maxHp}</span></div>
                     </div>
                     <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700 mb-3"><div className="h-full bg-green-500 transition-all" style={{ width: `${(player.hp / getStats.maxHp) * 100}%` }} /></div>
                     <div className="h-32 overflow-hidden flex flex-col-reverse text-xs font-mono opacity-90 mask-linear-fade">
                         {logs.slice(0,10).map(l => <div key={l.id} style={{color:l.color}} className="truncate py-0.5">{l.msg}</div>)}
                     </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full bg-gray-900 p-2 border-t border-gray-800 z-20">
                    <div className="grid grid-cols-5 gap-2 mb-2">
                         {[1, 2, 3].map(num => {
                             const skill = equipment[`skill${num}`];
                             const cd = skillCds[num-1];
                             return (
                                <button 
                                    key={num} 
                                    onClick={() => handleUseSkill(num)} 
                                    disabled={player.hp <= 0 || cd > 0 || !skill} 
                                    className={`col-span-1 aspect-square rounded flex flex-col items-center justify-center relative overflow-hidden border border-gray-700
                                        ${skill ? 'bg-slate-800' : 'bg-gray-900 opacity-50'} 
                                        ${cd > 0 ? 'grayscale cursor-not-allowed' : 'active:scale-95 hover:border-white'}
                                    `}
                                >
                                    {skill ? (
                                        <>
                                            {ELEMENT_CONFIG[skill.skillData.element].icon}
                                            <span className="text-[9px] leading-none mt-1">{skill.skillData.name.slice(0,4)}</span>
                                            {cd > 0 && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-lg font-bold text-white">{Math.ceil(cd)}</div>}
                                        </>
                                    ) : <span className="text-[8px] text-gray-600">Empty</span>}
                                </button>
                             )
                         })}
                         
                         <button onClick={handleAttack} disabled={player.hp <= 0} className="col-span-2 h-full bg-gradient-to-b from-red-700 to-red-900 rounded flex items-center justify-center gap-1 text-white font-bold shadow-lg active:scale-[0.98]">
                             <Sword size={20}/> 攻撃
                         </button>
                    </div>
                    <button onClick={healPlayer} className="w-full py-2 bg-gray-800 rounded flex items-center justify-center text-green-400 hover:bg-gray-700 active:scale-95 text-xs">
                        <Heart size={14} className="mr-1" /> 回復 (-{player.level*5}G)
                    </button>
                </div>
            </>
        )}

        {/* --- Modals --- */}

        {inkModeItem && (
             <div className="absolute inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center sm:p-4">
                <div className="bg-gray-800 w-full max-w-sm sm:rounded-xl rounded-t-xl border border-purple-500 p-5">
                    <div className="text-center mb-4">
                        <h3 className="text-lg font-bold text-purple-400">インクを選択</h3>
                        <p className="text-xs text-gray-400">装着するインクを選んでください</p>
                    </div>
                    <div className="grid grid-cols-5 gap-2 mb-4">
                        {inventory.filter(i => i.type === 'ink').map(item => (
                             <ItemSlot key={item.id} item={item} onClick={() => attachInk(inkModeItem, item)} />
                        ))}
                        {inventory.filter(i => i.type === 'ink').length === 0 && (
                            <div className="col-span-5 text-center text-gray-500 text-sm py-4">インクを持っていません</div>
                        )}
                    </div>
                    <button onClick={() => setInkModeItem(null)} className="w-full py-3 bg-gray-700 rounded">キャンセル</button>
                </div>
             </div>
        )}

        {selectedItem?.type === 'portal_basic' && (
            <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-6" onClick={() => setSelectedItem(null)}>
                <div className="bg-gray-800 w-full rounded-xl border border-gray-700 p-6" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold mb-4">始まりの平原</h3>
                    <p className="text-sm text-gray-400 mb-6">全5階層。コストなしで何度でも挑戦できます。</p>
                    <button onClick={() => { startDungeon(null); setSelectedItem(null); }} className="w-full py-3 bg-blue-600 rounded font-bold hover:bg-blue-500">出発</button>
                </div>
            </div>
        )}

        {selectedItem && selectedItem.type !== 'portal_basic' && (
            <div className="absolute inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center sm:p-4" onClick={() => setSelectedItem(null)}>
                <div className="bg-gray-800 w-full max-w-sm sm:rounded-xl rounded-t-xl border border-gray-700 p-5 animate-[slideUp_0.2s_ease-out]" onClick={e => e.stopPropagation()}>
                    
                    <div className="flex gap-3 mb-4">
                        <div className={`w-12 h-12 rounded flex items-center justify-center border-2 ${RARITIES[selectedItem.rarity]?.bg || 'bg-gray-800'} ${RARITIES[selectedItem.rarity]?.border || 'border-gray-600'}`}>
                            <ItemIcon item={selectedItem} size={28} />
                        </div>
                        <div>
                            <div className={`text-xs font-bold uppercase ${RARITIES[selectedItem.rarity]?.color || 'text-gray-400'}`}>{RARITIES[selectedItem.rarity]?.label || 'Item'}</div>
                            <div className="text-lg font-bold">{selectedItem.name}</div>
                        </div>
                    </div>

                    <div className="bg-gray-900 p-3 rounded border border-gray-700 mb-4 text-sm max-h-60 overflow-y-auto">
                        {selectedItem.type === 'ink' && (
                            <div className="text-purple-300 mb-2">
                                <div>効果: {selectedItem.mod.label} {selectedItem.mod.val > 0 ? '+' : ''}{selectedItem.mod.val}{selectedItem.mod.unit || ''}</div>
                                {selectedItem.mod.penalty && (
                                    <div className="text-red-400 text-xs">
                                        デメリット: {selectedItem.mod.penalty.type === 'power_down' ? '威力低下' : 'CD増加'} {selectedItem.mod.penalty.val * 100}%
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedItem.type === 'skill' && selectedItem.skillData && (
                            <div className="mb-2">
                                <div className="text-cyan-300 flex justify-between"><span>Type</span><span>{selectedItem.skillData.type === 'buff' ? 'BUFF' : 'ATTACK'}</span></div>
                                <div className="text-cyan-300 flex justify-between"><span>Element</span><span>{ELEMENT_CONFIG[selectedItem.skillData.element].label}</span></div>
                                <div className="text-cyan-300 flex justify-between"><span>Power</span><span>x{selectedItem.skillData.power.toFixed(1)}</span></div>
                                <div className="text-cyan-300 flex justify-between"><span>CD</span><span>{selectedItem.skillData.cd}s</span></div>
                                
                                <div className="mt-3 pt-2 border-t border-gray-800">
                                    <div className="text-xs text-gray-500 mb-1">インクスロット ({selectedItem.inks?.length || 0}/{selectedItem.inkSlots})</div>
                                    <div className="flex gap-1 flex-wrap">
                                        {(selectedItem.inks || []).map((ink, i) => (
                                            <div key={i} className="bg-purple-900/40 border border-purple-500 px-2 py-1 rounded text-[10px] text-purple-200">
                                                {ink.name}
                                            </div>
                                        ))}
                                        {(selectedItem.inks?.length || 0) < selectedItem.inkSlots && !selectedItem.isEquipped && (
                                            <button onClick={() => { setInkModeItem(selectedItem); setSelectedItem(null); }} className="bg-gray-800 border border-dashed border-gray-600 px-2 py-1 rounded text-[10px] text-gray-400 hover:text-white hover:border-white">
                                                + インク装着
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {Object.entries(selectedItem.baseStats||selectedItem.stats||{}).map(([k,v]) => (
                            <div key={k} className="flex justify-between"><span className="text-gray-400 uppercase">{k}</span><span>{v}</span></div>
                        ))}
                        <div className="mt-2 pt-2 border-t border-gray-800">
                            {renderMergedOptions(selectedItem.options)}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                         {selectedItem.type !== 'stone' && !selectedItem.isEquipped ? (
                             <>
                                <button onClick={() => sellItem(selectedItem)} className="py-3 rounded border border-gray-600 text-gray-400">売却</button>
                                {selectedItem.type === 'skill' ? (
                                    <div className="flex gap-1">
                                        <button onClick={() => equipItem(selectedItem, 1)} className="flex-1 py-2 bg-blue-900 text-white text-xs rounded">S1</button>
                                        <button onClick={() => equipItem(selectedItem, 2)} className="flex-1 py-2 bg-blue-900 text-white text-xs rounded">S2</button>
                                        <button onClick={() => equipItem(selectedItem, 3)} className="flex-1 py-2 bg-blue-900 text-white text-xs rounded">S3</button>
                                    </div>
                                ) : selectedItem.type !== 'ink' ? (
                                    <button onClick={() => equipItem(selectedItem)} className="py-3 rounded bg-blue-600 text-white font-bold">装備</button>
                                ) : null}
                             </>
                         ) : selectedItem.isEquipped ? (
                             <div className="col-span-2 grid grid-cols-2 gap-2">
                                <div className="col-span-2 text-center text-xs text-gray-500 py-1">装備中</div>
                                <button onClick={() => unequipItem(selectedItem.type === 'skill' ? Object.keys(equipment).find(key => equipment[key]?.id === selectedItem.id) : selectedItem.type)} className="col-span-2 py-2 bg-red-900/50 text-red-200 border border-red-800 rounded text-sm">外す</button>
                             </div>
                         ) : null}
                         
                         {selectedItem.type === 'stone' && (
                            <>
                                <button onClick={() => sellItem(selectedItem)} className="py-3 rounded border border-slate-600 text-slate-400">売却</button>
                                <button onClick={() => { startDungeon(selectedItem); setSelectedItem(null); }} className="py-3 rounded bg-cyan-700 text-white font-bold">使用</button>
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