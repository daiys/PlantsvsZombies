import { PlantStats, PlantType, ZombieType } from "./types";

export const GRID_ROWS = 5;
export const GRID_COLS = 9;
export const TICK_RATE_MS = 30; // ~30 FPS logic update

export const PLANT_STATS: Record<PlantType, PlantStats> = {
  [PlantType.SUNFLOWER]: {
    cost: 50,
    health: 300,
    damage: 0,
    attackRate: 10000, // Produces sun every 10s
    range: 0,
    name: 'Sunflower',
    icon: '🌻',
    cooldown: 5000,
    description: 'Produces sun'
  },
  [PlantType.PEASHOOTER]: {
    cost: 100,
    health: 300,
    damage: 20,
    attackRate: 1400,
    range: 100,
    name: 'Peashooter',
    icon: '🌱',
    cooldown: 5000,
    description: 'Shoots peas'
  },
  [PlantType.SNOWPEA]: {
    cost: 175,
    health: 300,
    damage: 20,
    attackRate: 1400,
    range: 100,
    name: 'Snow Pea',
    icon: '❄️',
    cooldown: 5000,
    description: 'Slows zombies'
  },
  [PlantType.WALLNUT]: {
    cost: 50,
    health: 4000,
    damage: 0,
    attackRate: 0,
    range: 0,
    name: 'Wall-nut',
    icon: '🌰',
    cooldown: 20000,
    description: 'Blocks zombies'
  }
};

export const ZOMBIE_STATS: Record<ZombieType, { health: number; speed: number; damage: number; icon: string }> = {
  [ZombieType.NORMAL]: { health: 200, speed: 1.5, damage: 0.5, icon: '🧟' }, // Speed is % per tick
  [ZombieType.CONEHEAD]: { health: 560, speed: 1.5, damage: 0.5, icon: '🧟‍♂️' },
  [ZombieType.BUCKETHEAD]: { health: 1300, speed: 1.5, damage: 0.5, icon: '🤖' }
};

export const INITIAL_SUN = 150;
export const SUN_VALUE = 25;
export const ZOMBIE_SPAWN_RATE_START = 5000;
