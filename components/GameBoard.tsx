import React from 'react';
import { Plant, Zombie, Projectile, Sun, ZombieType } from '../types';
import { GRID_ROWS, GRID_COLS } from '../constants';

interface GameBoardProps {
  plants: Plant[];
  zombies: Zombie[];
  projectiles: Projectile[];
  suns: Sun[];
  onGridClick: (row: number, col: number) => void;
  onCollectSun: (id: string, val: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  plants,
  zombies,
  projectiles,
  suns,
  onGridClick,
  onCollectSun
}) => {
  
  // Render Background Grid
  const renderGrid = () => {
    const grid = [];
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        const isDark = (r + c) % 2 === 1;
        grid.push(
          <div
            key={`${r}-${c}`}
            onClick={() => onGridClick(r, c)}
            className={`
              w-full h-full relative border-black/5 hover:bg-white/10 transition-colors
              ${isDark ? 'bg-green-600' : 'bg-green-500'}
            `}
          />
        );
      }
    }
    return grid;
  };

  return (
    <div className="relative w-full h-full bg-green-800 overflow-hidden select-none">
      
      {/* Lawn Grid */}
      <div 
        className="absolute top-[10%] left-[10%] right-[2%] bottom-[5%] grid"
        style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`
        }}
      >
        {renderGrid()}
      </div>

      {/* Entities Layer - Using absolute positioning based on percentages relative to grid area */}
      <div className="absolute top-[10%] left-[10%] right-[2%] bottom-[5%] pointer-events-none">
        
        {/* Plants */}
        {plants.map(plant => (
          <div
            key={plant.id}
            className="absolute flex items-center justify-center w-[11.11%] h-[20%] transition-transform duration-300"
            style={{
              top: `${plant.row * 20}%`,
              left: `${plant.col! * 11.11}%`,
            }}
          >
            <div className="relative text-5xl md:text-6xl animate-pulse">
              {/* Health overlay opacity */}
              <div style={{opacity: plant.health / plant.maxHealth}} className="drop-shadow-lg filter">
                {plant.type === 'SUNFLOWER' && '🌻'}
                {plant.type === 'PEASHOOTER' && '🌱'}
                {plant.type === 'SNOWPEA' && '❄️'}
                {plant.type === 'WALLNUT' && '🌰'}
              </div>
              
              {/* Health bar for wallnuts only if damaged */}
              {plant.type === 'WALLNUT' && plant.health < plant.maxHealth && (
                 <div className="absolute -top-2 left-0 w-full h-1 bg-red-500 rounded-full overflow-hidden">
                   <div className="h-full bg-green-500" style={{width: `${(plant.health / plant.maxHealth) * 100}%`}} />
                 </div>
              )}
            </div>
          </div>
        ))}

        {/* Zombies */}
        {zombies.map(zombie => (
          <div
            key={zombie.id}
            className="absolute flex flex-col items-center justify-center w-[11.11%] h-[20%] transition-transform"
            style={{
              top: `${zombie.row * 20 - 5}%`, // Offset slightly up
              left: `${zombie.x}%`,
              transform: `translateX(-50%) ${zombie.freezeEffect > 0 ? 'brightness(150%) hue-rotate(180deg)' : ''}`, // Center anchor, blue tint if frozen
              transition: 'left 30ms linear' // Smooth movement between ticks
            }}
          >
             {/* Health Bar */}
            <div className="w-10 h-1 bg-red-900 mb-1 rounded overflow-hidden opacity-80">
              <div 
                className="h-full bg-red-500 transition-all duration-300" 
                style={{width: `${(zombie.health / zombie.maxHealth) * 100}%`}} 
              />
            </div>
            
            <div className={`text-6xl md:text-7xl filter drop-shadow-2xl ${zombie.isEating ? 'animate-bounce' : ''}`}>
               {zombie.type === ZombieType.NORMAL && '🧟'}
               {zombie.type === ZombieType.CONEHEAD && '🧟‍♂️'}
               {zombie.type === ZombieType.BUCKETHEAD && '🤖'}
            </div>
          </div>
        ))}

        {/* Projectiles */}
        {projectiles.map(proj => (
          <div
            key={proj.id}
            className="absolute flex items-center justify-center w-6 h-6"
            style={{
              top: `${proj.row * 20 + 8}%`,
              left: `${proj.x}%`,
              transition: 'left 30ms linear'
            }}
          >
            <div className={`rounded-full shadow-md ${proj.isFrozen ? 'bg-blue-300 w-4 h-4 shadow-blue-500' : 'bg-green-400 w-5 h-5 shadow-green-600'}`} />
          </div>
        ))}
        
      </div>

      {/* Sun Layer (Needs pointer events) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {suns.map(sun => (
          <div
            key={sun.id}
            onClick={(e) => {
              e.stopPropagation();
              onCollectSun(sun.id, sun.value);
            }}
            className="absolute cursor-pointer pointer-events-auto transform hover:scale-110 active:scale-90 transition-transform duration-200"
            style={{
              // If it has a row (from flower), map to grid, else absolute % (from sky)
              top: sun.row !== -1 ? `${10 + sun.y}%` : `${sun.y}%`, 
              left: sun.row !== -1 ? `${10 + sun.x}%` : `${sun.x}%`,
              transition: 'top 5s ease-in' // Slow falling for sky suns (handled by initial pos in this simple version)
            }}
          >
            <div className="text-5xl drop-shadow-lg sun-animate">☀️</div>
          </div>
        ))}
      </div>
    </div>
  );
};
