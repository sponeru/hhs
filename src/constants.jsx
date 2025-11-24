import React from 'react';
import { 
  Sword, Shield, Flame, Snowflake, Zap, Sun, Moon,
  Sparkles, Target, Heart, Zap as ZapIcon, Shield as ShieldIcon
} from 'lucide-react';

export const INITIAL_PLAYER = {
  level: 1,
  exp: 0,
  expToNext: 50,
  gold: 0,
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  stats: { str: 5, dex: 5, int: 5 },
  skillPoints: 0,
  learnedSkills: {}, // { skillId: level }
  buffs: [],
};

export const INITIAL_EQUIPMENT = {
  weapon: { id: 'init_w', name: "木の棒", type: "weapon", baseStats: { atk: 2 }, options: [], rarity: "common", power: 1 },
  armor: { id: 'init_a', name: "ボロボロの服", type: "armor", baseStats: { def: 1 }, options: [], rarity: "common", power: 1 },
  amulet: null,
  ring1: null,
  ring2: null,
  belt: null,
  feet: null,
  skill1: null, 
  skill2: null,
  skill3: null,
};

export const MAX_INVENTORY = 25;
export const MAX_STONES = 10;
export const MAX_WAREHOUSE = 100; // 倉庫の最大容量
export const ELEMENTS = ['fire', 'ice', 'thunder', 'light', 'dark'];

export const getElementConfig = (element) => {
  const configs = {
    fire: { label: '火', icon: <Flame size={18} />, color: 'text-red-500', bg: 'bg-red-900/30' },
    ice: { label: '氷', icon: <Snowflake size={18} />, color: 'text-cyan-400', bg: 'bg-cyan-900/30' },
    thunder: { label: '雷', icon: <Zap size={18} />, color: 'text-yellow-400', bg: 'bg-yellow-900/30' },
    light: { label: '光', icon: <Sun size={18} />, color: 'text-orange-300', bg: 'bg-orange-900/30' },
    dark: { label: '闇', icon: <Moon size={18} />, color: 'text-purple-400', bg: 'bg-purple-900/30' },
    none: { label: '無', icon: <Sword size={18} />, color: 'text-gray-400', bg: 'bg-gray-800' }
  };
  return configs[element] || configs.none;
};

export const RARITIES = {
  common: { color: "text-gray-400", border: "border-gray-200", bg: "bg-gray-800", label: "コモン", mult: 1, optCount: 0, inkSlots: 1 },
  uncommon: { color: "text-green-400", border: "border-green-300", bg: "bg-green-900/30", label: "アンコモン", mult: 1.5, optCount: 2, inkSlots: 2 },
  rare: { color: "text-blue-400", border: "border-blue-300", bg: "bg-blue-900/30", label: "レア", mult: 2.5, optCount: 3, inkSlots: 3 },
  epic: { color: "text-purple-400", border: "border-purple-300", bg: "bg-purple-900/30", label: "エピック", mult: 4, optCount: 4, inkSlots: 4 },
  legendary: { color: "text-yellow-400", border: "border-yellow-300", bg: "bg-yellow-900/30", label: "レジェンダリー", mult: 7, optCount: 5, inkSlots: 5 },
};

export const SKILL_TEMPLATES = [
  { name: "ファイアボール", type: 'attack', element: 'fire', power: 2.5, cd: 1.5, mpCost: 10 },
  { name: "アイスニードル", type: 'attack', element: 'ice', power: 2.2, cd: 1.5, mpCost: 10 },
  { name: "サンダーボルト", type: 'attack', element: 'thunder', power: 2.8, cd: 2.0, mpCost: 12 },
  { name: "ホーリーレイ", type: 'attack', element: 'light', power: 3.0, cd: 2.5, mpCost: 15 },
  { name: "ダークマター", type: 'attack', element: 'dark', power: 3.5, cd: 3.0, mpCost: 18 },
  { name: "メテオストライク", type: 'attack', element: 'fire', power: 5.0, cd: 5.0, mpCost: 30, rarity: 'legendary' },
  { name: "ヒールライト", type: 'heal', element: 'light', power: 50, cd: 10, label: "HP回復", mpCost: 20 },
  { name: "バーサーク", type: 'buff', element: 'fire', buffType: 'atk', val: 0.5, duration: 10, cd: 20, label: "攻撃UP" },
  { name: "アイアンガード", type: 'buff', element: 'none', buffType: 'def', val: 20, duration: 15, cd: 20, label: "防御UP" },
  { name: "クイックステップ", type: 'buff', element: 'thunder', buffType: 'cdSpeed', val: 0.5, duration: 10, cd: 25, label: "CD加速" },
];

export const INK_MODS = [
  { type: 'power_up', label: '威力強化', stat: 'power', val: 0.2, unit: 'x' },
  { type: 'cd_down', label: 'CD短縮', stat: 'cd', val: -0.15, unit: '%' },
  { type: 'dur_up', label: '時間延長', stat: 'duration', val: 0.3, unit: '%' },
];

export const INK_RARE_MODS = [
  { type: 'auto_cast', label: '自動発動', isRare: true, penalty: { type: 'power_down', val: -0.3 } },
  { type: 'multi_cast', label: '2回発動', isRare: true, val: 1, penalty: { type: 'cd_up', val: 0.5 } },
];

export const BASIC_OPTIONS = [
  { type: 'str', label: '筋力', weight: 10 },
  { type: 'dex', label: '器用さ', weight: 10 },
  { type: 'int', label: '知恵', weight: 10 },
  { type: 'atk', label: '攻撃力', weight: 5 },
  { type: 'def', label: '防御力', weight: 5 },
  { type: 'maxHp', label: '最大HP', weight: 8 },
  { type: 'maxMp', label: '最大MP', weight: 5 },
  { type: 'res_fire', label: '火耐性', unit: '%', weight: 5, isRes: true },
  { type: 'res_ice', label: '氷耐性', unit: '%', weight: 5, isRes: true },
  { type: 'res_thunder', label: '雷耐性', unit: '%', weight: 5, isRes: true },
  { type: 'res_light', label: '光耐性', unit: '%', weight: 5, isRes: true },
  { type: 'res_dark', label: '闇耐性', unit: '%', weight: 5, isRes: true },
  // 装備タイプ別の特殊オプション
  { type: 'atk_mult', label: '装備ATK上昇', unit: '%', weight: 3, isPercent: true },
  { type: 'def_mult', label: '装備防御力上昇', unit: '%', weight: 3, isPercent: true },
  { type: 'hp_mult', label: '装備HP上昇', unit: '%', weight: 3, isPercent: true },
  { type: 'dmg_mult', label: 'ダメージ増加', unit: '%', weight: 3, isPercent: true },
  { type: 'crit_mult', label: '会心率上昇', unit: '%', weight: 3, isPercent: true },
  { type: 'critDmg_mult', label: '会心ダメージ上昇', unit: '%', weight: 3, isPercent: true },
  { type: 'global_hp_mult', label: 'HP上昇(グローバル)', unit: '%', weight: 3, isPercent: true },
  { type: 'global_maxMp_mult', label: '最大MP上昇(グローバル)', unit: '%', weight: 3, isPercent: true },
  { type: 'hp_regen', label: 'HP自動回復', unit: '/秒', weight: 2 },
  { type: 'skill_level_fire', label: '火属性スキルLv', weight: 2, isSkillLevel: true, element: 'fire' },
  { type: 'skill_level_ice', label: '氷属性スキルLv', weight: 2, isSkillLevel: true, element: 'ice' },
  { type: 'skill_level_thunder', label: '雷属性スキルLv', weight: 2, isSkillLevel: true, element: 'thunder' },
  { type: 'skill_level_light', label: '光属性スキルLv', weight: 2, isSkillLevel: true, element: 'light' },
  { type: 'skill_level_dark', label: '闇属性スキルLv', weight: 2, isSkillLevel: true, element: 'dark' },
];

export const SPECIAL_OPTIONS = [
  { type: 'vamp', label: 'HP吸収', unit: '%', min: 1, max: 5 },
  { type: 'gold', label: 'G獲得', unit: '%', min: 10, max: 50 },
  { type: 'exp', label: 'EXP獲得', unit: '%', min: 10, max: 50 },
  { type: 'critDmg', label: '会心ダメ', unit: '%', min: 20, max: 100 },
];

// 複合オプション定義
// 複合オプションは2つのオプションタイプを組み合わせたもの
export const COMPOSITE_OPTIONS = [
  // 属性耐性の複合
  { 
    type: 'composite_res_fire_ice', 
    label: '火+氷耐性', 
    compositeTypes: ['res_fire', 'res_ice'],
    weight: 2,
    isComposite: true 
  },
  { 
    type: 'composite_res_fire_thunder', 
    label: '火+雷耐性', 
    compositeTypes: ['res_fire', 'res_thunder'],
    weight: 2,
    isComposite: true 
  },
  { 
    type: 'composite_res_ice_thunder', 
    label: '氷+雷耐性', 
    compositeTypes: ['res_ice', 'res_thunder'],
    weight: 2,
    isComposite: true 
  },
  { 
    type: 'composite_res_light_dark', 
    label: '光+闇耐性', 
    compositeTypes: ['res_light', 'res_dark'],
    weight: 2,
    isComposite: true 
  },
  // HP関連の複合
  { 
    type: 'composite_maxHp_hpRegen', 
    label: '最大HP+HP自動回復', 
    compositeTypes: ['maxHp', 'hp_regen'],
    weight: 2,
    isComposite: true 
  },
  // 能力値の複合
  { 
    type: 'composite_str_int', 
    label: '筋力+知恵', 
    compositeTypes: ['str', 'int'],
    weight: 2,
    isComposite: true 
  },
  { 
    type: 'composite_str_dex', 
    label: '筋力+器用さ', 
    compositeTypes: ['str', 'dex'],
    weight: 2,
    isComposite: true 
  },
  { 
    type: 'composite_dex_int', 
    label: '器用さ+知恵', 
    compositeTypes: ['dex', 'int'],
    weight: 2,
    isComposite: true 
  },
  // 会心関連の複合
  { 
    type: 'composite_crit_critDmg', 
    label: '会心率+会心ダメージ', 
    compositeTypes: ['crit_mult', 'critDmg_mult'],
    weight: 1,
    isComposite: true 
  },
];

// 装備タイプごとのオプションプール
export const EQUIPMENT_TYPE_OPTIONS = {
  weapon: [
    { type: 'atk_mult', label: '装備ATK上昇', unit: '%', isPercent: true },
    { type: 'str', label: '筋力' },
    { type: 'dex', label: '器用さ' },
    { type: 'int', label: '知恵' },
    { type: 'skill_level_fire', label: '火属性スキルLv', isSkillLevel: true, element: 'fire' },
    { type: 'skill_level_ice', label: '氷属性スキルLv', isSkillLevel: true, element: 'ice' },
    { type: 'skill_level_thunder', label: '雷属性スキルLv', isSkillLevel: true, element: 'thunder' },
    { type: 'skill_level_light', label: '光属性スキルLv', isSkillLevel: true, element: 'light' },
    { type: 'skill_level_dark', label: '闇属性スキルLv', isSkillLevel: true, element: 'dark' },
    { type: 'dmg_mult', label: 'ダメージ増加', unit: '%', isPercent: true },
    { type: 'crit_mult', label: '会心率上昇', unit: '%', isPercent: true },
    { type: 'critDmg_mult', label: '会心ダメージ上昇', unit: '%', isPercent: true },
    { type: 'maxMp', label: '最大MP' },
  ],
  armor: [
    { type: 'res_fire', label: '火耐性', unit: '%', isRes: true },
    { type: 'res_ice', label: '氷耐性', unit: '%', isRes: true },
    { type: 'res_thunder', label: '雷耐性', unit: '%', isRes: true },
    { type: 'res_light', label: '光耐性', unit: '%', isRes: true },
    { type: 'res_dark', label: '闇耐性', unit: '%', isRes: true },
    { type: 'def_mult', label: '装備防御力上昇', unit: '%', isPercent: true },
    { type: 'hp_mult', label: '装備HP上昇', unit: '%', isPercent: true },
    { type: 'maxHp', label: '最大HP' },
  ],
  amulet: [
    { type: 'res_fire', label: '火耐性', unit: '%', isRes: true },
    { type: 'res_ice', label: '氷耐性', unit: '%', isRes: true },
    { type: 'res_thunder', label: '雷耐性', unit: '%', isRes: true },
    { type: 'res_light', label: '光耐性', unit: '%', isRes: true },
    { type: 'res_dark', label: '闇耐性', unit: '%', isRes: true },
    { type: 'global_hp_mult', label: 'HP上昇(グローバル)', unit: '%', isPercent: true },
    { type: 'global_maxMp_mult', label: '最大MP上昇(グローバル)', unit: '%', isPercent: true },
    { type: 'str', label: '筋力' },
    { type: 'dex', label: '器用さ' },
    { type: 'int', label: '知恵' },
    { type: 'crit_mult', label: '会心率上昇', unit: '%', isPercent: true },
    { type: 'critDmg_mult', label: '会心ダメージ上昇', unit: '%', isPercent: true },
  ],
  ring: [
    { type: 'res_fire', label: '火耐性', unit: '%', isRes: true },
    { type: 'res_ice', label: '氷耐性', unit: '%', isRes: true },
    { type: 'res_thunder', label: '雷耐性', unit: '%', isRes: true },
    { type: 'res_light', label: '光耐性', unit: '%', isRes: true },
    { type: 'res_dark', label: '闇耐性', unit: '%', isRes: true },
    { type: 'maxHp', label: '最大HP' },
    { type: 'def', label: '防御力' },
    { type: 'maxMp', label: '最大MP' },
  ],
  belt: [
    { type: 'res_fire', label: '火耐性', unit: '%', isRes: true },
    { type: 'res_ice', label: '氷耐性', unit: '%', isRes: true },
    { type: 'res_thunder', label: '雷耐性', unit: '%', isRes: true },
    { type: 'res_light', label: '光耐性', unit: '%', isRes: true },
    { type: 'res_dark', label: '闇耐性', unit: '%', isRes: true },
    { type: 'maxHp', label: '最大HP' },
    { type: 'def', label: '防御力' },
    { type: 'maxMp', label: '最大MP' },
    { type: 'hp_regen', label: 'HP自動回復', unit: '/秒' },
  ],
  feet: [
    { type: 'res_fire', label: '火耐性', unit: '%', isRes: true },
    { type: 'res_ice', label: '氷耐性', unit: '%', isRes: true },
    { type: 'res_thunder', label: '雷耐性', unit: '%', isRes: true },
    { type: 'res_light', label: '光耐性', unit: '%', isRes: true },
    { type: 'res_dark', label: '闇耐性', unit: '%', isRes: true },
    { type: 'def_mult', label: '装備防御力上昇', unit: '%', isPercent: true },
    { type: 'hp_mult', label: '装備HP上昇', unit: '%', isPercent: true },
    { type: 'maxHp', label: '最大HP' },
    { type: 'maxMp', label: '最大MP' },
  ],
};

export const STONE_MODS = [
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

// リスクに対応する報酬のマッピング
export const RISK_REWARD_MAPPING = {
  'risk_hp': ['reward_exp', 'reward_gold'], // 敵HP増加 → EXP/Gold増加
  'risk_atk': ['reward_exp', 'reward_gold'], // 敵攻撃力増加 → EXP/Gold増加
  'risk_dmg': ['reward_drop', 'qual_rarity'], // 被ダメ増加 → 装備数/レア度向上
  'mod_floor_add': ['mod_floor_sub', 'reward_exp', 'reward_gold'], // 階層増加 → 階層減少/EXP/Gold増加
};

export const MONSTER_NAMES = [
  { name: "スライム", icon: "💧", baseHp: 20, baseExp: 10, baseGold: 2 },
  { name: "コウモリ", icon: "🦇", baseHp: 35, baseExp: 15, baseGold: 5 },
  { name: "ゴブリン", icon: "👺", baseHp: 60, baseExp: 25, baseGold: 10 },
  { name: "スケルトン", icon: "💀", baseHp: 90, baseExp: 40, baseGold: 15 },
  { name: "オーク", icon: "👹", baseHp: 150, baseExp: 70, baseGold: 30 },
  { name: "ゴーレム", icon: "🗿", baseHp: 300, baseExp: 120, baseGold: 60 },
  { name: "ドラゴン", icon: "🐉", baseHp: 1000, baseExp: 500, baseGold: 300 },
];

export const ITEM_PREFIXES = ["錆びた", "普通の", "鋭い", "重厚な", "疾風の", "達人の", "勇者の", "魔王の", "神々の"];
export const WEAPON_NAMES = ["ダガー", "ソード", "アックス", "メイス", "カタナ", "グレートソード"];
export const ARMOR_NAMES = ["ローブ", "レザー", "メイル", "プレート", "フルプレート"];
export const AMULET_NAMES = ["アミュレット", "ペンダント", "首飾り", "護符"];
export const STAT_LABELS = {
  str: "筋力",
  dex: "器用さ",
  int: "知恵",
};
export const RING_NAMES = ["リング", "指輪", "シグネット", "結婚指輪"];
export const BELT_NAMES = ["ベルト", "帯", "サッシュ", "ウエストバッグ"];
export const FEET_NAMES = ["ブーツ", "シューズ", "サンダル", "グリーブ"];

// ==========================================
// 装備品用アイテム定義
// ==========================================

// レアリティの順序
export const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

// 強化石テンプレート
export const ENHANCEMENT_STONE_TEMPLATES = [
  { name: "小さな強化石", rarity: 'common', mult: 0.05 },
  { name: "強化石", rarity: 'uncommon', mult: 0.10 },
  { name: "大強化石", rarity: 'rare', mult: 0.15 },
  { name: "極強化石", rarity: 'epic', mult: 0.20 },
];

// エンチャントスクロールテンプレート
export const ENCHANT_SCROLL_TEMPLATES = [
  { name: "エンチャントスクロール", rarity: 'uncommon', powerMult: 1.0 },
  { name: "上級エンチャントスクロール", rarity: 'rare', powerMult: 1.2 },
  { name: "極エンチャントスクロール", rarity: 'epic', powerMult: 1.5 },
];

// 属性付与石テンプレート
export const ELEMENT_STONE_TEMPLATES = [
  { name: "火の石", element: 'fire', rarity: 'rare', value: 10 },
  { name: "氷の石", element: 'ice', rarity: 'rare', value: 10 },
  { name: "雷の石", element: 'thunder', rarity: 'rare', value: 10 },
  { name: "光の石", element: 'light', rarity: 'epic', value: 15 },
  { name: "闇の石", element: 'dark', rarity: 'epic', value: 15 },
];

// 特殊強化アイテムテンプレート
export const SPECIAL_STONE_TEMPLATES = [
  { name: "吸血の石", type: 'vamp', rarity: 'epic', value: 2 },
  { name: "黄金の石", type: 'gold', rarity: 'epic', value: 20 },
  { name: "経験の石", type: 'exp', rarity: 'epic', value: 20 },
  { name: "会心の石", type: 'critDmg', rarity: 'legendary', value: 30 },
];

// リロールスクロールテンプレート
export const REROLL_SCROLL_TEMPLATES = [
  { name: "リロールスクロール", rarity: 'uncommon', powerMult: 1.0 },
  { name: "上級リロールスクロール", rarity: 'rare', powerMult: 1.2 },
  { name: "極リロールスクロール", rarity: 'epic', powerMult: 1.5 },
];

// オプション枠拡張石テンプレート
export const OPTION_SLOT_STONE_TEMPLATES = [
  { name: "オプション枠拡張石", rarity: 'rare', slots: 1 },
  { name: "上級オプション枠拡張石", rarity: 'epic', slots: 1 },
  { name: "極オプション枠拡張石", rarity: 'legendary', slots: 1 },
];

// レアリティアップグレード石テンプレート
export const RARITY_UPGRADE_STONE_TEMPLATES = [
  { name: "レアリティアップグレード石", rarity: 'epic', upgrades: 1 },
  { name: "上級レアリティアップグレード石", rarity: 'legendary', upgrades: 1 },
];

// ==========================================
// スキルツリー定義
// ==========================================

// スキルタイプ
export const SKILL_TYPES = {
  PASSIVE: 'passive',
  ACTIVE: 'active',
};

// スキルカテゴリ
export const SKILL_CATEGORIES = {
  OFFENSE: 'offense',      // 攻撃系
  DEFENSE: 'defense',      // 防御系
  UTILITY: 'utility',      // ユーティリティ系
  ELEMENTAL: 'elemental',  // 属性系
};

// スキルツリーのグリッド定義
// 各スキルは { id, name, description, category, type, row, col, maxLevel: 1, requirements, levelData }
// row, col: グリッド上の位置 (0から始まる)
// requirements: 前提スキルIDの配列（前のレベルのスキルID）
// levelData: このレベルの効果 { effect, value, bonus?, penalty? }
// 各レベルは別々のノードとして配置される

// ヘルパー関数: スキルノードを生成
const createSkillNode = (baseId, baseName, baseDesc, category, icon, row, startCol, levels, baseRequirements = []) => {
  const nodes = [];
  levels.forEach((levelData, index) => {
    const level = index + 1;
    const requirements = level === 1 ? baseRequirements : [`${baseId}_${level - 1}`];
    nodes.push({
      id: `${baseId}_${level}`,
      name: `${baseName} Lv.${level}`,
      description: baseDesc,
      category,
      type: SKILL_TYPES.PASSIVE,
      row,
      col: startCol + index,
      maxLevel: 1,
      requirements,
      levelData,
      icon,
    });
  });
  return nodes;
};

export const SKILL_TREE = [
  // 第1行: 基本スキル（筋力強化 Lv1-5）
  ...createSkillNode('base_str', '筋力強化', '筋力が+5', SKILL_CATEGORIES.OFFENSE, <Sword size={20} />, 0, 0, [
    { effect: 'str', value: 5 },
    { effect: 'str', value: 5 },
    { effect: 'str', value: 5 },
    { effect: 'str', value: 5 },
    { effect: 'str', value: 5 },
  ]),
  
  // 第2行: 基本スキル（器用さ強化 Lv1-5）
  ...createSkillNode('base_dex', '器用さ強化', '器用さが+5', SKILL_CATEGORIES.UTILITY, <Sparkles size={20} />, 1, 0, [
    { effect: 'dex', value: 5 },
    { effect: 'dex', value: 5 },
    { effect: 'dex', value: 5 },
    { effect: 'dex', value: 5 },
    { effect: 'dex', value: 5 },
  ]),
  
  // 第3行: 基本スキル（知恵強化 Lv1-5）
  ...createSkillNode('base_int', '知恵強化', '知恵が+5', SKILL_CATEGORIES.UTILITY, <ZapIcon size={20} />, 2, 0, [
    { effect: 'int', value: 5 },
    { effect: 'int', value: 5 },
    { effect: 'int', value: 5 },
    { effect: 'int', value: 5 },
    { effect: 'int', value: 5 },
  ]),
  
  // 第4行: 攻撃力強化 Lv1-3（前提: base_str_5）
  ...createSkillNode('atk_boost', '攻撃力強化', '攻撃力が+5%', SKILL_CATEGORIES.OFFENSE, <Sword size={20} />, 3, 0, [
    { effect: 'atk_mult', value: 0.05 },
    { effect: 'atk_mult', value: 0.05 },
    { effect: 'atk_mult', value: 0.05 },
  ], ['base_str_5']),
  
  // 第5行: 会心の極み Lv1-3（前提: base_dex_5）
  ...createSkillNode('crit_master', '会心の極み', '会心率が+5%', SKILL_CATEGORIES.OFFENSE, <Target size={20} />, 4, 0, [
    { effect: 'crit', value: 5 },
    { effect: 'crit', value: 5 },
    { effect: 'crit', value: 5 },
  ], ['base_dex_5']),
  
  // 第6行: 吸血 Lv1-3（前提: base_str_5）
  ...createSkillNode('vampiric', '吸血', 'HP吸収が+2%', SKILL_CATEGORIES.OFFENSE, <Heart size={20} />, 5, 0, [
    { effect: 'vamp', value: 2 },
    { effect: 'vamp', value: 2 },
    { effect: 'vamp', value: 2 },
  ], ['base_str_5']),
  
  // 第7行: 防御力強化 Lv1-3（前提: base_str_5）
  ...createSkillNode('def_boost', '防御力強化', '防御力が+5%', SKILL_CATEGORIES.DEFENSE, <ShieldIcon size={20} />, 6, 0, [
    { effect: 'def_mult', value: 0.05 },
    { effect: 'def_mult', value: 0.05 },
    { effect: 'def_mult', value: 0.05 },
  ], ['base_str_5']),
  
  // 第8行: 最大HP強化 Lv1-3（前提: base_str_5）
  ...createSkillNode('hp_boost', '最大HP強化', '最大HPが+10%', SKILL_CATEGORIES.DEFENSE, <Heart size={20} />, 7, 0, [
    { effect: 'hp_mult', value: 0.10 },
    { effect: 'hp_mult', value: 0.10 },
    { effect: 'hp_mult', value: 0.10 },
  ], ['base_str_5']),
  
  // 第9行: 全属性耐性 Lv1-3（前提: base_str_5）
  ...createSkillNode('res_all', '全属性耐性', '全属性耐性が+5%', SKILL_CATEGORIES.DEFENSE, <ShieldIcon size={20} />, 8, 0, [
    { effect: 'res_all', value: 5 },
    { effect: 'res_all', value: 5 },
    { effect: 'res_all', value: 5 },
  ], ['base_str_5']),
  
  // 第10行: クールダウン短縮 Lv1-3（前提: base_dex_5）
  ...createSkillNode('cd_reduction', 'クールダウン短縮', 'CD速度が+10%', SKILL_CATEGORIES.UTILITY, <ZapIcon size={20} />, 9, 0, [
    { effect: 'cdSpeed', value: 0.10 },
    { effect: 'cdSpeed', value: 0.10 },
    { effect: 'cdSpeed', value: 0.10 },
  ], ['base_dex_5']),
  
  // 第11行: ゴールドハンター Lv1-3（前提: base_dex_5）
  ...createSkillNode('gold_finder', 'ゴールドハンター', 'G獲得が+10%', SKILL_CATEGORIES.UTILITY, <Sparkles size={20} />, 10, 0, [
    { effect: 'goldMult', value: 10 },
    { effect: 'goldMult', value: 10 },
    { effect: 'goldMult', value: 10 },
  ], ['base_dex_5']),
  
  // 第12行: 経験値強化 Lv1-3（前提: base_dex_5）
  ...createSkillNode('exp_boost', '経験値強化', 'EXP獲得が+10%', SKILL_CATEGORIES.UTILITY, <Sparkles size={20} />, 11, 0, [
    { effect: 'expMult', value: 10 },
    { effect: 'expMult', value: 10 },
    { effect: 'expMult', value: 10 },
  ], ['base_dex_5']),
  
  // 第13行: 筋力強化 Lv6-8（前提: base_str_5, atk_boost_3）
  ...createSkillNode('base_str_adv', '筋力強化', '筋力が+5', SKILL_CATEGORIES.OFFENSE, <Sword size={20} />, 12, 0, [
    { effect: 'str', value: 5 },
    { effect: 'str', value: 5 },
    { effect: 'str', value: 5 },
  ], ['base_str_5', 'atk_boost_3']),
  
  // 第14行: バーサーカー（前提: atk_boost_3, vampiric_3）
  {
    id: 'berserker',
    name: 'バーサーカー',
    description: '攻撃力が+15%、防御力が-10%',
    category: SKILL_CATEGORIES.OFFENSE,
    type: SKILL_TYPES.PASSIVE,
    row: 13,
    col: 0,
    maxLevel: 1,
    requirements: ['atk_boost_3', 'vampiric_3'],
    levelData: { effect: 'atk_mult', value: 0.15, penalty: { effect: 'def_mult', value: -0.10 } },
    icon: <Sword size={20} />,
    isPowerful: true,
  },
  
  // 第15行: 筋力強化 Lv6-8（前提: base_str_5, def_boost_3）
  ...createSkillNode('base_str_def', '筋力強化', '筋力が+5', SKILL_CATEGORIES.DEFENSE, <Sword size={20} />, 14, 0, [
    { effect: 'str', value: 5 },
    { effect: 'str', value: 5 },
    { effect: 'str', value: 5 },
  ], ['base_str_5', 'def_boost_3']),
  
  // 第16行: タンク（前提: def_boost_3, hp_boost_3）
  {
    id: 'tank',
    name: 'タンク',
    description: '防御力が+20%、最大HPが+25%',
    category: SKILL_CATEGORIES.DEFENSE,
    type: SKILL_TYPES.PASSIVE,
    row: 15,
    col: 0,
    maxLevel: 1,
    requirements: ['def_boost_3', 'hp_boost_3'],
    levelData: { effect: 'def_mult', value: 0.20, bonus: { effect: 'hp_mult', value: 0.25 } },
    icon: <ShieldIcon size={20} />,
    isPowerful: true,
  },
  
  // 第17行: 器用さ強化 Lv6-8（前提: base_dex_5, gold_finder_3）
  ...createSkillNode('base_dex_adv', '器用さ強化', '器用さが+5', SKILL_CATEGORIES.UTILITY, <Sparkles size={20} />, 16, 0, [
    { effect: 'dex', value: 5 },
    { effect: 'dex', value: 5 },
    { effect: 'dex', value: 5 },
  ], ['base_dex_5', 'gold_finder_3']),
  
  // 第18行: 宝の達人（前提: gold_finder_3, exp_boost_3）
  {
    id: 'master_treasure',
    name: '宝の達人',
    description: 'G獲得が+30%、EXP獲得が+30%',
    category: SKILL_CATEGORIES.UTILITY,
    type: SKILL_TYPES.PASSIVE,
    row: 17,
    col: 0,
    maxLevel: 1,
    requirements: ['gold_finder_3', 'exp_boost_3'],
    levelData: { effect: 'goldMult', value: 30, bonus: { effect: 'expMult', value: 30 } },
    icon: <Sparkles size={20} />,
    isPowerful: true,
  },
  
  // 第16行: MPマスタリー（前提: base_int_5）
  ...createSkillNode('mp_mastery', 'MPマスタリー', '最大MPが+10%', SKILL_CATEGORIES.UTILITY, <ZapIcon size={20} />, 15, 0, [
    { effect: 'maxMp_mult', value: 0.10 },
    { effect: 'maxMp_mult', value: 0.10 },
    { effect: 'maxMp_mult', value: 0.10 },
  ], ['base_int_5']),
  
  // 第16行: 火属性マスタリー（前提: atk_boost_3）
  {
    id: 'fire_mastery',
    name: '火属性マスタリー',
    description: '火属性ダメージが+20%、火耐性が+15%',
    category: SKILL_CATEGORIES.ELEMENTAL,
    type: SKILL_TYPES.PASSIVE,
    row: 15,
    col: 0,
    maxLevel: 1,
    requirements: ['atk_boost_3'],
    levelData: { effect: 'fire_dmg', value: 0.20, bonus: { effect: 'res_fire', value: 15 } },
    icon: <Flame size={20} />,
  },
  
  // 第17行: 氷属性マスタリー（前提: atk_boost_3）
  {
    id: 'ice_mastery',
    name: '氷属性マスタリー',
    description: '氷属性ダメージが+20%、氷耐性が+15%',
    category: SKILL_CATEGORIES.ELEMENTAL,
    type: SKILL_TYPES.PASSIVE,
    row: 16,
    col: 0,
    maxLevel: 1,
    requirements: ['atk_boost_3'],
    levelData: { effect: 'ice_dmg', value: 0.20, bonus: { effect: 'res_ice', value: 15 } },
    icon: <Snowflake size={20} />,
  },
  
  // 第18行: 雷属性マスタリー（前提: atk_boost_3）
  {
    id: 'thunder_mastery',
    name: '雷属性マスタリー',
    description: '雷属性ダメージが+20%、雷耐性が+15%',
    category: SKILL_CATEGORIES.ELEMENTAL,
    type: SKILL_TYPES.PASSIVE,
    row: 17,
    col: 0,
    maxLevel: 1,
    requirements: ['atk_boost_3'],
    levelData: { effect: 'thunder_dmg', value: 0.20, bonus: { effect: 'res_thunder', value: 15 } },
    icon: <Zap size={20} />,
  },
  
  // 第19行: 全能力値強化 Lv1-3（前提: base_str_5, base_dex_5, base_int_5）
  ...createSkillNode('all_stats_boost', '全能力値強化', '全能力値が+3', SKILL_CATEGORIES.UTILITY, <Sparkles size={20} />, 18, 0, [
    { effect: 'str', value: 3, bonus: { effect: 'dex', value: 3 }, bonus2: { effect: 'int', value: 3 } },
    { effect: 'str', value: 3, bonus: { effect: 'dex', value: 3 }, bonus2: { effect: 'int', value: 3 } },
    { effect: 'str', value: 3, bonus: { effect: 'dex', value: 3 }, bonus2: { effect: 'int', value: 3 } },
  ], ['base_str_5', 'base_dex_5', 'base_int_5']),
  
  // 第20行: 究極の戦士（前提: berserker, crit_master_3）
  {
    id: 'ultimate_warrior',
    name: '究極の戦士',
    description: '全ステータスが+10%、会心ダメージが+50%',
    category: SKILL_CATEGORIES.OFFENSE,
    type: SKILL_TYPES.PASSIVE,
    row: 19,
    col: 0,
    maxLevel: 1,
    requirements: ['berserker', 'crit_master_3'],
    levelData: { 
      effect: 'all_stats', value: 0.10, 
      bonus: { effect: 'critDmg', value: 50 } 
    },
    icon: <Sword size={20} />,
    isPowerful: true,
  },
  
  // 第21行: 不死身（前提: tank, res_all_3）
  {
    id: 'immortal',
    name: '不死身',
    description: '最大HPが+50%、全属性耐性が+25%',
    category: SKILL_CATEGORIES.DEFENSE,
    type: SKILL_TYPES.PASSIVE,
    row: 20,
    col: 0,
    maxLevel: 1,
    requirements: ['tank', 'res_all_3'],
    levelData: { 
      effect: 'hp_mult', value: 0.50, 
      bonus: { effect: 'res_all', value: 25 } 
    },
    icon: <ShieldIcon size={20} />,
    isPowerful: true,
  },
  
  // 第22行: 知恵強化 Lv6-8（前提: base_int_5, mp_mastery_3）
  ...createSkillNode('base_int_adv', '知恵強化', '知恵が+5', SKILL_CATEGORIES.UTILITY, <ZapIcon size={20} />, 21, 0, [
    { effect: 'int', value: 5 },
    { effect: 'int', value: 5 },
    { effect: 'int', value: 5 },
  ], ['base_int_5', 'mp_mastery_3']),
  
  // 第23行: 元素の支配者（前提: fire_mastery, ice_mastery, thunder_mastery）
  {
    id: 'elemental_lord',
    name: '元素の支配者',
    description: '全属性ダメージが+30%、全属性耐性が+20%',
    category: SKILL_CATEGORIES.ELEMENTAL,
    type: SKILL_TYPES.PASSIVE,
    row: 22,
    col: 0,
    maxLevel: 1,
    requirements: ['fire_mastery', 'ice_mastery', 'thunder_mastery'],
    levelData: { 
      effect: 'all_element_dmg', value: 0.30, 
      bonus: { effect: 'res_all', value: 20 } 
    },
    icon: <Sparkles size={20} />,
    isPowerful: true,
  },
  
  // 第24行: 会心ダメージ強化 Lv1-3（前提: crit_master_3）
  ...createSkillNode('crit_dmg_boost', '会心ダメージ強化', '会心ダメージが+10%', SKILL_CATEGORIES.OFFENSE, <Target size={20} />, 23, 0, [
    { effect: 'critDmg_mult', value: 0.10 },
    { effect: 'critDmg_mult', value: 0.10 },
    { effect: 'critDmg_mult', value: 0.10 },
  ], ['crit_master_3']),
  
  // 第25行: HP自動回復 Lv1-3（前提: hp_boost_3）
  ...createSkillNode('hp_regen_skill', 'HP自動回復', 'HP自動回復が+1/秒', SKILL_CATEGORIES.DEFENSE, <Heart size={20} />, 24, 0, [
    { effect: 'hp_regen', value: 1 },
    { effect: 'hp_regen', value: 1 },
    { effect: 'hp_regen', value: 1 },
  ], ['hp_boost_3']),
  
  // 第26行: ダメージ増加 Lv1-3（前提: atk_boost_3）
  ...createSkillNode('dmg_boost', 'ダメージ増加', 'ダメージが+5%', SKILL_CATEGORIES.OFFENSE, <Sword size={20} />, 25, 0, [
    { effect: 'dmg_mult', value: 0.05 },
    { effect: 'dmg_mult', value: 0.05 },
    { effect: 'dmg_mult', value: 0.05 },
  ], ['atk_boost_3']),
  
  // 第27行: 光属性マスタリー（前提: atk_boost_3）
  {
    id: 'light_mastery',
    name: '光属性マスタリー',
    description: '光属性ダメージが+20%、光耐性が+15%',
    category: SKILL_CATEGORIES.ELEMENTAL,
    type: SKILL_TYPES.PASSIVE,
    row: 26,
    col: 0,
    maxLevel: 1,
    requirements: ['atk_boost_3'],
    levelData: { effect: 'light_dmg', value: 0.20, bonus: { effect: 'res_light', value: 15 } },
    icon: <Sun size={20} />,
  },
  
  // 第28行: 闇属性マスタリー（前提: atk_boost_3）
  {
    id: 'dark_mastery',
    name: '闇属性マスタリー',
    description: '闇属性ダメージが+20%、闇耐性が+15%',
    category: SKILL_CATEGORIES.ELEMENTAL,
    type: SKILL_TYPES.PASSIVE,
    row: 27,
    col: 0,
    maxLevel: 1,
    requirements: ['atk_boost_3'],
    levelData: { effect: 'dark_dmg', value: 0.20, bonus: { effect: 'res_dark', value: 15 } },
    icon: <Moon size={20} />,
  },
  
  // 第29行: MP回復速度 Lv1-3（前提: mp_mastery_3）
  ...createSkillNode('mp_regen', 'MP回復速度', 'MP回復速度が+20%', SKILL_CATEGORIES.UTILITY, <ZapIcon size={20} />, 28, 0, [
    { effect: 'mpRegen', value: 0.20 },
    { effect: 'mpRegen', value: 0.20 },
    { effect: 'mpRegen', value: 0.20 },
  ], ['mp_mastery_3']),
  
  // 第30行: 装備強化 Lv1-3（前提: base_str_5, base_dex_5）
  ...createSkillNode('equip_power', '装備強化', '装備パワーが+5%', SKILL_CATEGORIES.UTILITY, <Sparkles size={20} />, 29, 0, [
    { effect: 'equip_power', value: 0.05 },
    { effect: 'equip_power', value: 0.05 },
    { effect: 'equip_power', value: 0.05 },
  ], ['base_str_5', 'base_dex_5']),
  
  // 第31行: スキル威力強化 Lv1-3（前提: base_int_5）
  ...createSkillNode('skill_power', 'スキル威力強化', 'スキル威力が+5%', SKILL_CATEGORIES.OFFENSE, <ZapIcon size={20} />, 30, 0, [
    { effect: 'skill_power', value: 0.05 },
    { effect: 'skill_power', value: 0.05 },
    { effect: 'skill_power', value: 0.05 },
  ], ['base_int_5']),
  
  // 第32行: 頑強な体 Lv1-3（前提: def_boost_3）
  ...createSkillNode('tough_body', '頑強な体', '最大HPが+5%、防御力が+3%', SKILL_CATEGORIES.DEFENSE, <ShieldIcon size={20} />, 31, 0, [
    { effect: 'hp_mult', value: 0.05, bonus: { effect: 'def_mult', value: 0.03 } },
    { effect: 'hp_mult', value: 0.05, bonus: { effect: 'def_mult', value: 0.03 } },
    { effect: 'hp_mult', value: 0.05, bonus: { effect: 'def_mult', value: 0.03 } },
  ], ['def_boost_3']),
  
  // 第33行: 連撃の達人（前提: crit_master_3, dmg_boost_3）
  {
    id: 'combo_master',
    name: '連撃の達人',
    description: '会心率が+10%、ダメージが+15%',
    category: SKILL_CATEGORIES.OFFENSE,
    type: SKILL_TYPES.PASSIVE,
    row: 32,
    col: 0,
    maxLevel: 1,
    requirements: ['crit_master_3', 'dmg_boost_3'],
    levelData: { 
      effect: 'crit', value: 10, 
      bonus: { effect: 'dmg_mult', value: 0.15 } 
    },
    icon: <Target size={20} />,
    isPowerful: true,
  },
  
  // 第34行: 魔法の達人（前提: skill_power_3, mp_mastery_3）
  {
    id: 'magic_master',
    name: '魔法の達人',
    description: 'スキル威力が+25%、最大MPが+20%',
    category: SKILL_CATEGORIES.UTILITY,
    type: SKILL_TYPES.PASSIVE,
    row: 33,
    col: 0,
    maxLevel: 1,
    requirements: ['skill_power_3', 'mp_mastery_3'],
    levelData: { 
      effect: 'skill_power', value: 0.25, 
      bonus: { effect: 'maxMp_mult', value: 0.20 } 
    },
    icon: <ZapIcon size={20} />,
    isPowerful: true,
  },
  
  // 第35行: 再生の力（前提: hp_regen_skill_3, tough_body_3）
  {
    id: 'regeneration',
    name: '再生の力',
    description: 'HP自動回復が+5/秒、最大HPが+30%',
    category: SKILL_CATEGORIES.DEFENSE,
    type: SKILL_TYPES.PASSIVE,
    row: 34,
    col: 0,
    maxLevel: 1,
    requirements: ['hp_regen_skill_3', 'tough_body_3'],
    levelData: { 
      effect: 'hp_regen', value: 5, 
      bonus: { effect: 'hp_mult', value: 0.30 } 
    },
    icon: <Heart size={20} />,
    isPowerful: true,
  },
  
  // 第36行: 会心の神（前提: crit_master_3, crit_dmg_boost_3）
  {
    id: 'crit_god',
    name: '会心の神',
    description: '会心率が+15%、会心ダメージが+50%',
    category: SKILL_CATEGORIES.OFFENSE,
    type: SKILL_TYPES.PASSIVE,
    row: 35,
    col: 0,
    maxLevel: 1,
    requirements: ['crit_master_3', 'crit_dmg_boost_3'],
    levelData: { 
      effect: 'crit', value: 15, 
      bonus: { effect: 'critDmg_mult', value: 0.50 } 
    },
    icon: <Target size={20} />,
    isPowerful: true,
  },
  
  // 第37行: 聖なる光（前提: light_mastery, mp_mastery_3）
  {
    id: 'holy_light',
    name: '聖なる光',
    description: '光属性ダメージが+30%、全属性耐性が+10%',
    category: SKILL_CATEGORIES.ELEMENTAL,
    type: SKILL_TYPES.PASSIVE,
    row: 36,
    col: 0,
    maxLevel: 1,
    requirements: ['light_mastery', 'mp_mastery_3'],
    levelData: { 
      effect: 'light_dmg', value: 0.30, 
      bonus: { effect: 'res_all', value: 10 } 
    },
    icon: <Sun size={20} />,
    isPowerful: true,
  },
  
  // 第38行: 闇の支配者（前提: dark_mastery, skill_power_3）
  {
    id: 'dark_lord',
    name: '闇の支配者',
    description: '闇属性ダメージが+30%、スキル威力が+15%',
    category: SKILL_CATEGORIES.ELEMENTAL,
    type: SKILL_TYPES.PASSIVE,
    row: 37,
    col: 0,
    maxLevel: 1,
    requirements: ['dark_mastery', 'skill_power_3'],
    levelData: { 
      effect: 'dark_dmg', value: 0.30, 
      bonus: { effect: 'skill_power', value: 0.15 } 
    },
    icon: <Moon size={20} />,
    isPowerful: true,
  },
  
  // 第39行: 完全なる防御（前提: tank, res_all_3, tough_body_3）
  {
    id: 'perfect_defense',
    name: '完全なる防御',
    description: '防御力が+30%、全属性耐性が+30%、最大HPが+20%',
    category: SKILL_CATEGORIES.DEFENSE,
    type: SKILL_TYPES.PASSIVE,
    row: 38,
    col: 0,
    maxLevel: 1,
    requirements: ['tank', 'res_all_3', 'tough_body_3'],
    levelData: { 
      effect: 'def_mult', value: 0.30, 
      bonus: { effect: 'res_all', value: 30 },
      bonus2: { effect: 'hp_mult', value: 0.20 }
    },
    icon: <ShieldIcon size={20} />,
    isPowerful: true,
  },
  
  // 第40行: 究極の破壊者（前提: ultimate_warrior, combo_master, crit_god）
  {
    id: 'ultimate_destroyer',
    name: '究極の破壊者',
    description: '全ステータスが+20%、会心率が+20%、会心ダメージが+100%',
    category: SKILL_CATEGORIES.OFFENSE,
    type: SKILL_TYPES.PASSIVE,
    row: 39,
    col: 0,
    maxLevel: 1,
    requirements: ['ultimate_warrior', 'combo_master', 'crit_god'],
    levelData: { 
      effect: 'all_stats', value: 0.20, 
      bonus: { effect: 'crit', value: 20 },
      bonus2: { effect: 'critDmg_mult', value: 1.00 }
    },
    icon: <Sword size={20} />,
    isPowerful: true,
  },
  
  // 第41行: 元素の王（前提: elemental_lord, holy_light, dark_lord）
  {
    id: 'elemental_king',
    name: '元素の王',
    description: '全属性ダメージが+50%、全属性耐性が+40%',
    category: SKILL_CATEGORIES.ELEMENTAL,
    type: SKILL_TYPES.PASSIVE,
    row: 40,
    col: 0,
    maxLevel: 1,
    requirements: ['elemental_lord', 'holy_light', 'dark_lord'],
    levelData: { 
      effect: 'all_element_dmg', value: 0.50, 
      bonus: { effect: 'res_all', value: 40 } 
    },
    icon: <Sparkles size={20} />,
    isPowerful: true,
  },
  
  // 第42行: 真の不死身（前提: immortal, regeneration, perfect_defense）
  {
    id: 'true_immortal',
    name: '真の不死身',
    description: '最大HPが+100%、全属性耐性が+50%、HP自動回復が+10/秒',
    category: SKILL_CATEGORIES.DEFENSE,
    type: SKILL_TYPES.PASSIVE,
    row: 41,
    col: 0,
    maxLevel: 1,
    requirements: ['immortal', 'regeneration', 'perfect_defense'],
    levelData: { 
      effect: 'hp_mult', value: 1.00, 
      bonus: { effect: 'res_all', value: 50 },
      bonus2: { effect: 'hp_regen', value: 10 }
    },
    icon: <ShieldIcon size={20} />,
    isPowerful: true,
  },
  
  // 第43行: 攻撃速度強化 Lv1-3（前提: base_dex_5）
  ...createSkillNode('atk_speed', '攻撃速度強化', '攻撃速度が+5%', SKILL_CATEGORIES.OFFENSE, <Sword size={20} />, 42, 0, [
    { effect: 'atk_speed', value: 0.05 },
    { effect: 'atk_speed', value: 0.05 },
    { effect: 'atk_speed', value: 0.05 },
  ], ['base_dex_5']),
  
  // 第44行: 回避率強化 Lv1-3（前提: base_dex_5）
  ...createSkillNode('evade_boost', '回避率強化', '回避率が+2%', SKILL_CATEGORIES.DEFENSE, <ShieldIcon size={20} />, 43, 0, [
    { effect: 'evade', value: 2 },
    { effect: 'evade', value: 2 },
    { effect: 'evade', value: 2 },
  ], ['base_dex_5']),
  
  // 第45行: 移動速度強化 Lv1-3（前提: base_dex_5）
  ...createSkillNode('move_speed', '移動速度強化', '移動速度が+5%', SKILL_CATEGORIES.UTILITY, <Sparkles size={20} />, 44, 0, [
    { effect: 'move_speed', value: 0.05 },
    { effect: 'move_speed', value: 0.05 },
    { effect: 'move_speed', value: 0.05 },
  ], ['base_dex_5']),
  
  // 第46行: クリティカル強化 Lv1-3（前提: crit_master_3）
  ...createSkillNode('crit_boost', 'クリティカル強化', '会心率が+3%', SKILL_CATEGORIES.OFFENSE, <Target size={20} />, 45, 0, [
    { effect: 'crit', value: 3 },
    { effect: 'crit', value: 3 },
    { effect: 'crit', value: 3 },
  ], ['crit_master_3']),
  
  // 第47行: 防御貫通 Lv1-3（前提: atk_boost_3）
  ...createSkillNode('def_pen', '防御貫通', '防御貫通が+5%', SKILL_CATEGORIES.OFFENSE, <Sword size={20} />, 46, 0, [
    { effect: 'def_pen', value: 5 },
    { effect: 'def_pen', value: 5 },
    { effect: 'def_pen', value: 5 },
  ], ['atk_boost_3']),
  
  // 第48行: 魔法防御強化 Lv1-3（前提: base_int_5）
  ...createSkillNode('magic_def', '魔法防御強化', '魔法防御が+5%', SKILL_CATEGORIES.DEFENSE, <ShieldIcon size={20} />, 47, 0, [
    { effect: 'magic_def', value: 0.05 },
    { effect: 'magic_def', value: 0.05 },
    { effect: 'magic_def', value: 0.05 },
  ], ['base_int_5']),
  
  // 第49行: スキル範囲拡大 Lv1-3（前提: skill_power_3）
  ...createSkillNode('skill_range', 'スキル範囲拡大', 'スキル範囲が+10%', SKILL_CATEGORIES.UTILITY, <ZapIcon size={20} />, 48, 0, [
    { effect: 'skill_range', value: 0.10 },
    { effect: 'skill_range', value: 0.10 },
    { effect: 'skill_range', value: 0.10 },
  ], ['skill_power_3']),
  
  // 第50行: スタミナ強化 Lv1-3（前提: base_str_5）
  ...createSkillNode('stamina', 'スタミナ強化', 'スタミナが+10%', SKILL_CATEGORIES.UTILITY, <Heart size={20} />, 49, 0, [
    { effect: 'stamina', value: 0.10 },
    { effect: 'stamina', value: 0.10 },
    { effect: 'stamina', value: 0.10 },
  ], ['base_str_5']),
  
  // 第51行: ダメージ軽減 Lv1-3（前提: def_boost_3）
  ...createSkillNode('dmg_reduction', 'ダメージ軽減', '受けるダメージが-3%', SKILL_CATEGORIES.DEFENSE, <ShieldIcon size={20} />, 50, 0, [
    { effect: 'dmg_reduction', value: -0.03 },
    { effect: 'dmg_reduction', value: -0.03 },
    { effect: 'dmg_reduction', value: -0.03 },
  ], ['def_boost_3']),
  
  // 第52行: 経験値ボーナス Lv1-3（前提: exp_boost_3）
  ...createSkillNode('exp_bonus', '経験値ボーナス', 'EXP獲得が+5%', SKILL_CATEGORIES.UTILITY, <Sparkles size={20} />, 51, 0, [
    { effect: 'expMult', value: 5 },
    { effect: 'expMult', value: 5 },
    { effect: 'expMult', value: 5 },
  ], ['exp_boost_3']),
  
  // 第53行: ゴールドボーナス Lv1-3（前提: gold_finder_3）
  ...createSkillNode('gold_bonus', 'ゴールドボーナス', 'G獲得が+5%', SKILL_CATEGORIES.UTILITY, <Sparkles size={20} />, 52, 0, [
    { effect: 'goldMult', value: 5 },
    { effect: 'goldMult', value: 5 },
    { effect: 'goldMult', value: 5 },
  ], ['gold_finder_3']),
  
  // 第54行: 装備ドロップ率 Lv1-3（前提: base_dex_5）
  ...createSkillNode('drop_rate', '装備ドロップ率', '装備ドロップ率が+5%', SKILL_CATEGORIES.UTILITY, <Sparkles size={20} />, 53, 0, [
    { effect: 'drop_rate', value: 5 },
    { effect: 'drop_rate', value: 5 },
    { effect: 'drop_rate', value: 5 },
  ], ['base_dex_5']),
  
  // 第55行: 属性強化 Lv1-3（前提: atk_boost_3）
  ...createSkillNode('element_boost', '属性強化', '属性ダメージが+5%', SKILL_CATEGORIES.ELEMENTAL, <Flame size={20} />, 54, 0, [
    { effect: 'all_element_dmg', value: 0.05 },
    { effect: 'all_element_dmg', value: 0.05 },
    { effect: 'all_element_dmg', value: 0.05 },
  ], ['atk_boost_3']),
  
  // 第56行: 属性耐性強化 Lv1-3（前提: res_all_3）
  ...createSkillNode('element_res', '属性耐性強化', '全属性耐性が+3%', SKILL_CATEGORIES.DEFENSE, <ShieldIcon size={20} />, 55, 0, [
    { effect: 'res_all', value: 3 },
    { effect: 'res_all', value: 3 },
    { effect: 'res_all', value: 3 },
  ], ['res_all_3']),
  
  // 第57行: 連続攻撃 Lv1-3（前提: atk_speed_3）
  ...createSkillNode('combo_attack', '連続攻撃', '連続攻撃確率が+5%', SKILL_CATEGORIES.OFFENSE, <Sword size={20} />, 56, 0, [
    { effect: 'combo_chance', value: 5 },
    { effect: 'combo_chance', value: 5 },
    { effect: 'combo_chance', value: 5 },
  ], ['atk_speed_3']),
  
  // 第58行: バフ時間延長 Lv1-3（前提: base_int_5）
  ...createSkillNode('buff_duration', 'バフ時間延長', 'バフ時間が+10%', SKILL_CATEGORIES.UTILITY, <ZapIcon size={20} />, 57, 0, [
    { effect: 'buff_duration', value: 0.10 },
    { effect: 'buff_duration', value: 0.10 },
    { effect: 'buff_duration', value: 0.10 },
  ], ['base_int_5']),
  
  // 第59行: デバフ時間短縮 Lv1-3（前提: base_int_5）
  ...createSkillNode('debuff_reduction', 'デバフ時間短縮', 'デバフ時間が-10%', SKILL_CATEGORIES.DEFENSE, <ShieldIcon size={20} />, 58, 0, [
    { effect: 'debuff_reduction', value: -0.10 },
    { effect: 'debuff_reduction', value: -0.10 },
    { effect: 'debuff_reduction', value: -0.10 },
  ], ['base_int_5']),
  
  // 第60行: リジェネ強化 Lv1-3（前提: hp_regen_skill_3）
  ...createSkillNode('regen_boost', 'リジェネ強化', 'HP自動回復が+1/秒', SKILL_CATEGORIES.DEFENSE, <Heart size={20} />, 59, 0, [
    { effect: 'hp_regen', value: 1 },
    { effect: 'hp_regen', value: 1 },
    { effect: 'hp_regen', value: 1 },
  ], ['hp_regen_skill_3']),
  
  // 第61行: MP消費削減 Lv1-3（前提: mp_mastery_3）
  ...createSkillNode('mp_cost_reduction', 'MP消費削減', 'MP消費が-5%', SKILL_CATEGORIES.UTILITY, <ZapIcon size={20} />, 60, 0, [
    { effect: 'mp_cost_reduction', value: -0.05 },
    { effect: 'mp_cost_reduction', value: -0.05 },
    { effect: 'mp_cost_reduction', value: -0.05 },
  ], ['mp_mastery_3']),
  
  // 第62行: スキルチャージ速度 Lv1-3（前提: cd_reduction_3）
  ...createSkillNode('charge_speed', 'スキルチャージ速度', 'チャージ速度が+10%', SKILL_CATEGORIES.UTILITY, <ZapIcon size={20} />, 61, 0, [
    { effect: 'charge_speed', value: 0.10 },
    { effect: 'charge_speed', value: 0.10 },
    { effect: 'charge_speed', value: 0.10 },
  ], ['cd_reduction_3']),
  
  // 第63行: 最終強化（前提: ultimate_destroyer, elemental_king, true_immortal）
  {
    id: 'final_enhancement',
    name: '最終強化',
    description: '全ステータスが+30%、全効果が+20%',
    category: SKILL_CATEGORIES.UTILITY,
    type: SKILL_TYPES.PASSIVE,
    row: 62,
    col: 0,
    maxLevel: 1,
    requirements: ['ultimate_destroyer', 'elemental_king', 'true_immortal'],
    levelData: { 
      effect: 'all_stats', value: 0.30, 
      bonus: { effect: 'all_effects', value: 0.20 }
    },
    icon: <Sparkles size={20} />,
    isPowerful: true,
  },
];

// スキルツリーのグリッドサイズ（動的に計算）
const maxRow = Math.max(...SKILL_TREE.map(s => s.row));
const maxCol = Math.max(...SKILL_TREE.map(s => s.col));
export const SKILL_TREE_GRID = {
  rows: maxRow + 1,
  cols: maxCol + 1,
  cellSize: 90, // ピクセル
  spacing: 15,  // ピクセル
};

