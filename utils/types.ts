/**
 * Type definitions for Dinkum save file structure
 */

export interface PlayerInfo {
  playerName: string;
  islandName: string;
  money: number;
  bankBalance: number;
  bankBalanceOverflow: number;
  accountOverflow: number;
  stamina: number;
  staminaMax: number;
  health: number;
  healthMax: number;
  hair: number;
  hairColour: number;
  eyeStyle: number;
  eyeColour: number;
  nose: number;
  mouth: number;
  face: number;
  head: number;
  body: number;
  pants: number;
  shoes: number;
  skinTone: number;
  itemsInInvSlots: number[];
  stacksInSlots: number[];
  catalogue: boolean[];
  savedTime: number;
  snagsEaten: number;
  faceStack: number;
  headStack: number;
  bodyStack: number;
  pantsStack: number;
  shoesStack: number;
  isCreative: boolean;
  hasBeenCreative: boolean;
}

export interface LicenceInfo {
  type: number;
  maxLevel: number;
  currentLevel: number;
  levelCostMuliplier: number;
  levelCost: number;
  isUnlocked: boolean;
  unlockedWithLevel: boolean;
  unlockedBySkill: number;
  unlockedEveryLevel: number;
  hasBeenSeenBefore: boolean;
  sortingNumber: number;
}

export interface MilestoneInfo {
  myTaskType: number;
  pointsPerLevel: number[];
  rewardPerLevel: number;
  points: number;
  currentLevel: number;
}

export interface LicencesData {
  permitPoints: number;
  licenceSave: (LicenceInfo | null)[];
  milestoneSave: MilestoneInfo[];
  tiredDistance: number;
}

export interface LevelData {
  todaysXp: number[];
  currentXp: number[];
  currentLevels: number[];
}

export interface DateData {
  day: number;
  week: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  todaysMineSeed: number;
  tomorrowsMineSeed: number;
}

export interface ChestSave {
  itemId: number[];
  itemStack: number[];
  xPos: number;
  yPos: number;
  houseX: number;
  houseY: number;
}

export interface PermissionEntry {
  playerName: string;
  islandId: number;
  isHost: boolean;
  canTerraform: boolean;
  canDamageTiles: boolean;
  canOpenChests: boolean;
  canPickup: boolean;
  canInteractWithVehicles: boolean;
  canEditHouse: boolean;
  canFarmAnimal: boolean;
  canCreative: boolean;
}

export interface PermissionsData {
  allPermissions: PermissionEntry[];
}

/**
 * Root save file structure
 */
export interface DinkumSaveData {
  playerInfo: {
    __type: string;
    value: PlayerInfo;
  };
  licences: {
    __type: string;
    value: LicencesData;
  };
  recipes: {
    __type: string;
    value: unknown;
  };
  levels: {
    __type: string;
    value: LevelData;
  };
  pedia: {
    __type: string;
    value: unknown;
  };
  npc: {
    __type: string;
    value: unknown;
  };
  mail: {
    __type: string;
    value: unknown;
  };
  quests: {
    __type: string;
    value: unknown;
  };
  date: {
    __type: string;
    value: DateData;
  };
  townSave: {
    __type: string;
    value: unknown;
  };
  houseSave: {
    __type: string;
    value: unknown;
  };
  townStatus: {
    __type: string;
    value: unknown;
  };
  bboard: {
    __type: string;
    value: unknown;
  };
  museumSave: {
    __type: string;
    value: unknown;
  };
  vehicleInfo: {
    __type: string;
    value: unknown;
  };
  deeds: {
    __type: string;
    value: unknown;
  };
  mapIcons: {
    __type: string;
    value: unknown;
  };
  carry: {
    __type: string;
    value: unknown;
  };
  itemsOnTop: {
    __type: string;
    value: unknown;
  };
  weather: {
    __type: string;
    value: unknown;
  };
  animalDetails: {
    __type: string;
    value: unknown;
  };
  changers: {
    __type: string;
    value: unknown;
  };
  animalHouseSave: {
    __type: string;
    value: unknown;
  };
  farmAnimalSave: {
    __type: string;
    value: unknown;
  };
  photos: {
    __type: string;
    value: unknown;
  };
  drops: {
    __type: string;
    value: unknown;
  };
  buried: {
    __type: string;
    value: unknown;
  };
  signs: {
    __type: string;
    value: unknown;
  };
  permissions: {
    __type: string;
    value: PermissionsData;
  };
  // Dynamic stash properties (stash_0, stash_1, stash_2, etc.)
  [key: `stash_${number}`]: {
    __type: string;
    value: ChestSave;
  };
}

/**
 * Container save file structure
 */
export interface ContainerSaveData {
  chests: {
    __type: string;
    value: {
      allChests: ChestSave[];
    };
  };
}

/**
 * Common fields that users typically want to edit
 */
export interface QuickEditFields {
  playerName: string;
  islandName: string;
  money: number;
  bankBalance: number;
  health: number;
  healthMax: number;
  stamina: number;
  staminaMax: number;
  permitPoints: number;
  isCreative: boolean;
  hasBeenCreative: boolean;
}
