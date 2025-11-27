import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  GameStatus, 
  Plant, 
  Zombie, 
  Projectile, 
  Sun, 
  PlantType, 
  ZombieType, 
  EntityType 
} from './types';
import { 
  GRID_ROWS, 
  GRID_COLS, 
  PLANT_STATS, 
  ZOMBIE_STATS, 
  TICK_RATE_MS, 
  INITIAL_SUN, 
  SUN_VALUE 
} from './constants';
import { PlantCard } from './components/PlantCard';
import { GameBoard } from './components/GameBoard';

// Utility for unique IDs
const generateId = () => Math.random().toString(36).slice(2, 9);

export default function App() {
  // Game State
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [sun, setSun] = useState(INITIAL_SUN);
  const [wave, setWave] = useState(1);
  const [score, setScore] = useState(0);
  
  // Entities
  const [plants, setPlants] = useState<Plant[]>([]);
  const [zombies, setZombies] = useState<Zombie[]>([]);
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [suns, setSuns] = useState<Sun[]>([]);
  
  // Interaction State
  const [selectedPlantType, setSelectedPlantType] = useState<PlantType | null>(null);

  // Refs for logic loop to avoid stale state in closures
  const stateRef = useRef({
    plants,
    zombies,
    projectiles,
    suns,
    status,
    lastSpawnTime: 0,
    wave
  });

  // Sync Refs
  useEffect(() => {
    stateRef.current = { plants, zombies, projectiles, suns, status, lastSpawnTime: stateRef.current.lastSpawnTime, wave };
  }, [plants, zombies, projectiles, suns, status, wave]);

  // Game Loop
  useEffect(() => {
    if (status !== GameStatus.PLAYING) return;

    const gameLoop = setInterval(() => {
      updateGame();
    }, TICK_RATE_MS);

    return () => clearInterval(gameLoop);
  }, [status]);

  // Core Game Logic
  const updateGame = () => {
    const now = Date.now();
    const currentState = stateRef.current;
    
    // 1. Spawn Zombies
    let newZombies = [...currentState.zombies];
    const spawnRate = Math.max(1000, 5000 - (currentState.wave * 200)); 
    
    if (now - currentState.lastSpawnTime > spawnRate) {
      stateRef.current.lastSpawnTime = now;
      const row = Math.floor(Math.random() * GRID_ROWS);
      
      // Basic wave logic
      let zType = ZombieType.NORMAL;
      const roll = Math.random();
      if (currentState.wave > 2 && roll > 0.7) zType = ZombieType.CONEHEAD;
      if (currentState.wave > 4 && roll > 0.9) zType = ZombieType.BUCKETHEAD;

      newZombies.push({
        id: generateId(),
        row,
        x: 100, // Starts at right edge
        type: zType,
        health: ZOMBIE_STATS[zType].health,
        maxHealth: ZOMBIE_STATS[zType].health,
        speed: ZOMBIE_STATS[zType].speed * 0.1, // Adjusted for tick rate
        isEating: false,
        damage: ZOMBIE_STATS[zType].damage,
        freezeEffect: 0
      });
      
      // Progress wave slightly
      if (Math.random() > 0.9) setWave(w => w + 0.1);
    }

    // 2. Plants Logic (Shooting & Production)
    let newProjectiles = [...currentState.projectiles];
    let newSuns = [...currentState.suns];
    
    const updatedPlants = currentState.plants.map(plant => {
      // Sunflower Logic
      if (plant.type === PlantType.SUNFLOWER) {
        if (now - plant.lastActionTime > PLANT_STATS[plant.type].attackRate) {
          // Spawn Sun
          newSuns.push({
            id: generateId(),
            x: (plant.col! * 10) + 2 + (Math.random() * 4), 
            y: (plant.row * 20) + 2 + (Math.random() * 4), // Approximate positions
            row: plant.row,
            value: SUN_VALUE,
            createdAt: now
          });
          return { ...plant, lastActionTime: now };
        }
      }
      
      // Shooter Logic
      if (plant.type === PlantType.PEASHOOTER || plant.type === PlantType.SNOWPEA) {
        // Check if zombie in row
        const hasZombieInRow = newZombies.some(z => z.row === plant.row && z.x > (plant.col! * 11) && z.x < 100);
        
        if (hasZombieInRow && now - plant.lastActionTime > PLANT_STATS[plant.type].attackRate) {
          newProjectiles.push({
            id: generateId(),
            row: plant.row,
            x: (plant.col! * 11) + 5,
            damage: PLANT_STATS[plant.type].damage,
            isFrozen: plant.type === PlantType.SNOWPEA,
          });
          return { ...plant, lastActionTime: now };
        }
      }
      return plant;
    });

    // 3. Move Projectiles
    const survivingProjectiles: Projectile[] = [];
    newProjectiles.forEach(proj => {
      proj.x += 1.5; // Projectile speed
      
      let hit = false;
      // Collision with Zombies
      for (const zombie of newZombies) {
        if (zombie.row === proj.row && Math.abs(zombie.x - proj.x) < 2 && zombie.health > 0) {
          zombie.health -= proj.damage;
          if (proj.isFrozen) {
            zombie.freezeEffect = 1.0; // Apply freeze
          }
          hit = true;
          break; // One projectile hits one zombie
        }
      }
      
      if (!hit && proj.x < 105) {
        survivingProjectiles.push(proj);
      }
    });

    // 4. Move Zombies & Eating
    let gameOver = false;
    const survivingZombies: Zombie[] = [];
    
    newZombies.forEach(zombie => {
      if (zombie.health <= 0) {
        setScore(s => s + 10);
        return; // Zombie dead
      }

      // Check collision with plants
      const plantInFront = updatedPlants.find(p => p.row === zombie.row && Math.abs((p.col! * 11 + 2) - zombie.x) < 5);
      
      if (plantInFront) {
        zombie.isEating = true;
        plantInFront.health -= zombie.damage;
      } else {
        zombie.isEating = false;
        // Move
        const currentSpeed = zombie.speed * (zombie.freezeEffect > 0 ? 0.5 : 1);
        zombie.x -= currentSpeed;
        
        // Decay freeze effect
        if (zombie.freezeEffect > 0) zombie.freezeEffect -= 0.01;
      }

      // Check Game Over
      if (zombie.x < -5) {
        gameOver = true;
      }

      survivingZombies.push(zombie);
    });

    // 5. Cleanup Dead Plants
    const livingPlants = updatedPlants.filter(p => p.health > 0);

    // 6. Random Sky Sun
    if (Math.random() < 0.005) {
      newSuns.push({
        id: generateId(),
        x: Math.random() * 90 + 5,
        y: Math.random() * 80 + 10,
        row: -1, // Sky sun doesn't belong to a row really
        value: SUN_VALUE,
        createdAt: now
      });
    }

    // 7. Update State
    if (gameOver) {
      setStatus(GameStatus.GAME_OVER);
    } else {
      setPlants(livingPlants);
      setZombies(survivingZombies);
      setProjectiles(survivingProjectiles);
      setSuns(newSuns);
    }
  };

  // User Actions
  const handleGridClick = (row: number, col: number) => {
    if (!selectedPlantType || status !== GameStatus.PLAYING) return;
    
    // Check if space occupied
    const isOccupied = plants.some(p => p.row === row && p.col === col);
    if (isOccupied) return;

    const stats = PLANT_STATS[selectedPlantType];
    if (sun >= stats.cost) {
      setSun(s => s - stats.cost);
      setPlants(prev => [
        ...prev,
        {
          id: generateId(),
          type: selectedPlantType,
          row,
          col,
          x: 0, // unused for plants
          health: stats.health,
          maxHealth: stats.health,
          lastActionTime: Date.now(),
          isReady: true
        }
      ]);
      setSelectedPlantType(null);
    }
  };

  const collectSun = (id: string, value: number) => {
    setSuns(prev => prev.filter(s => s.id !== id));
    setSun(s => s + value);
  };

  const startGame = () => {
    setPlants([]);
    setZombies([]);
    setProjectiles([]);
    setSuns([]);
    setSun(INITIAL_SUN);
    setScore(0);
    setWave(1);
    stateRef.current.lastSpawnTime = Date.now();
    setStatus(GameStatus.PLAYING);
  };

  return (
    // Outer container: Full viewport, Flex centered
    <div className="w-screen h-screen bg-gray-900 flex items-center justify-center overflow-hidden p-2 md:p-4">
      
      {/* Game Container: Constrained by max-height (vh) and max-width. Maintains 16/9 Aspect Ratio. */}
      {/* max-h-[85vh] leaves space for the bottom console or UI margins */}
      <div className="relative w-full max-w-6xl max-h-[85vh] aspect-[16/9] bg-green-800 border-8 border-green-900 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* HUD - Inside the relative game container so it scales with the game */}
        {status === GameStatus.PLAYING && (
          <div className="absolute top-0 left-0 right-0 z-20 p-2 flex justify-center items-start pointer-events-none">
            <div className="bg-amber-100/90 backdrop-blur-sm border-4 border-amber-800 rounded-lg p-2 flex gap-2 md:gap-4 pointer-events-auto shadow-xl scale-75 md:scale-100 origin-top">
              {/* Sun Counter */}
              <div className="flex flex-col items-center justify-center bg-amber-200 border-2 border-amber-600 rounded p-1 min-w-[60px] md:min-w-[80px]">
                <span className="text-2xl md:text-3xl">☀️</span>
                <span className="text-lg md:text-xl font-bold text-amber-900 font-game">{Math.floor(sun)}</span>
              </div>
              
              {/* Plant Selector */}
              <div className="flex gap-1 md:gap-2">
                {Object.values(PlantType).map((type) => (
                  <PlantCard 
                    key={type}
                    type={type}
                    stats={PLANT_STATS[type]}
                    canAfford={sun >= PLANT_STATS[type].cost}
                    isSelected={selectedPlantType === type}
                    onClick={() => setSelectedPlantType(type)}
                  />
                ))}
              </div>
              
               {/* Score / Wave */}
               <div className="flex flex-col items-center justify-center ml-2 md:ml-4 bg-gray-800 text-white border-2 border-gray-600 rounded p-1 min-w-[60px] md:min-w-[80px]">
                <span className="text-[10px] uppercase text-gray-400">Score</span>
                <span className="font-bold text-sm md:text-base">{score}</span>
                <span className="text-[10px] uppercase text-gray-400 mt-1">Level</span>
                <span className="font-bold text-sm md:text-base">{Math.floor(wave)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Game Board Area */}
        <div className="relative w-full h-full">
          {status === GameStatus.PLAYING ? (
            <GameBoard 
              plants={plants}
              zombies={zombies}
              projectiles={projectiles}
              suns={suns}
              onGridClick={handleGridClick}
              onCollectSun={collectSun}
            />
          ) : (
            /* Menus Overlay */
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-30 backdrop-blur-sm">
              {status === GameStatus.MENU && (
                <div className="text-center animate-bounce">
                  <h1 className="text-5xl md:text-8xl font-game text-green-500 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] mb-4">
                    React <span className="text-white">vs</span> Zombies
                  </h1>
                  <button 
                    onClick={startGame}
                    className="px-8 py-4 bg-green-600 hover:bg-green-500 text-white font-bold text-2xl rounded-xl shadow-lg border-b-8 border-green-800 transition-all active:translate-y-1 active:border-b-0"
                  >
                    Start Game
                  </button>
                </div>
              )}
              
              {status === GameStatus.GAME_OVER && (
                <div className="text-center bg-white p-8 rounded-xl shadow-2xl border-4 border-red-900 max-w-md mx-4">
                  <h2 className="text-4xl md:text-5xl font-game text-red-600 mb-2">THE ZOMBIES ATE YOUR BRAINS!</h2>
                  <p className="text-gray-600 text-xl mb-6">Final Score: {score}</p>
                  <button 
                    onClick={startGame}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xl rounded-lg shadow-md transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-2 right-2 text-gray-600 text-xs hidden md:block">
        React vs Zombies • No Canvas • Pure DOM
      </div>
    </div>
  );
}