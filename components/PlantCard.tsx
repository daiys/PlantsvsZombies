import React from 'react';
import { PlantType, PlantStats } from '../types';

interface PlantCardProps {
  type: PlantType;
  stats: PlantStats;
  canAfford: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({ stats, canAfford, isSelected, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        relative w-16 h-20 md:w-20 md:h-24 rounded cursor-pointer transition-all select-none
        border-2 flex flex-col items-center justify-between p-1 bg-white
        ${isSelected ? 'border-blue-500 ring-2 ring-blue-400 scale-105 z-10' : 'border-amber-700 hover:brightness-110'}
        ${!canAfford ? 'opacity-50 grayscale cursor-not-allowed' : ''}
      `}
    >
      <div className="text-xs bg-amber-800 text-white w-full text-center rounded-sm font-bold shadow-sm">
        {stats.cost}
      </div>
      <div className="text-3xl md:text-4xl filter drop-shadow-md">
        {stats.icon}
      </div>
      <div className="text-[0.6rem] text-center leading-tight font-semibold text-gray-700 w-full overflow-hidden text-ellipsis whitespace-nowrap">
        {stats.name}
      </div>
    </div>
  );
};
