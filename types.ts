export enum EntityType {
  PLANT = 'PLANT',
  ZOMBIE = 'ZOMBIE',
  PROJECTILE = 'PROJECTILE',
  SUN = 'SUN'
}

export enum PlantType {
  SUNFLOWER = 'SUNFLOWER',
  PEASHOOTER = 'PEASHOOTER',
  WALLNUT = 'WALLNUT',
  SNOWPEA = 'SNOWPEA'
}

export enum ZombieType {
  NORMAL = 'NORMAL',
  CONEHEAD = 'CONEHEAD',
  BUCKETHEAD = 'BUCKETHEAD'
}

export interface PlantStats {
  cost: number;
  health: number;
  damage: number;
  attackRate: number; // ms
  range: number;
  name: string;
  icon: string;
  cooldown: number;
  description: string;
}

export interface GameEntity {
  id: string;
  row: number;
  col?: number; // Integer column for grid placement
  x: number; // Percentage 0-100 for smooth movement
  y?: number; // Percentage for suns
}

export interface Plant extends GameEntity {
  type: PlantType;
  health: number;
  maxHealth: number;
  lastActionTime: number;
  isReady: boolean;
}

export interface Zombie extends GameEntity {
  type: ZombieType;
  health: number;
  maxHealth: number;
  speed: number;
  isEating: boolean;
  damage: number;
  freezeEffect: number; // 0 to 1, where 1 is frozen solid (0 speed), 0.5 is half speed
}

export interface Projectile extends GameEntity {
  damage: number;
  isFrozen: boolean;
}

export interface Sun extends GameEntity {
  value: number;
  toRow?: number; // Target animation position
  toCol?: number;
  createdAt: number;
}

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY'
}
