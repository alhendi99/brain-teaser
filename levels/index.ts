import { Level } from '@/types/game';
import { level1 } from './level-1';
import { level2 } from './level-2';
import { level3 } from './level-3';
import { level4 } from './level-4';
import { level5 } from './level-5';

// Export all levels
export const levels: Level[] = [
  level1,
  level2,
  level3,
  level4,
  level5,
];

// Get level by ID
export const getLevelById = (id: number): Level | undefined => {
  return levels.find((level) => level.id === id);
};

// Get total number of levels
export const getTotalLevels = (): number => {
  return levels.length;
};

// Check if level exists
export const levelExists = (id: number): boolean => {
  return levels.some((level) => level.id === id);
};

// Get next level
export const getNextLevel = (currentId: number): Level | undefined => {
  const currentIndex = levels.findIndex((level) => level.id === currentId);
  if (currentIndex !== -1 && currentIndex < levels.length - 1) {
    return levels[currentIndex + 1];
  }
  return undefined;
};

// Get previous level
export const getPreviousLevel = (currentId: number): Level | undefined => {
  const currentIndex = levels.findIndex((level) => level.id === currentId);
  if (currentIndex > 0) {
    return levels[currentIndex - 1];
  }
  return undefined;
};

export { level1, level2, level3, level4, level5 };
