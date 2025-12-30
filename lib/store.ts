import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { GameStore, GameProgress, GameSettings, GameState, Level } from '@/types/game';

const defaultSettings: GameSettings = {
  language: 'en',
  soundEnabled: true,
  musicEnabled: true,
  vibrationEnabled: true,
  showTutorial: true,
};

const defaultProgress: GameProgress = {
  completedLevels: [],
  currentLevel: 1,
  totalHintsUsed: 0,
  stars: {},
  totalPlayTime: 0,
  achievements: [],
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Settings
      settings: defaultSettings,
      
      setLanguage: (lang) =>
        set((state) => ({
          settings: { ...state.settings, language: lang },
        })),
      
      toggleSound: () =>
        set((state) => ({
          settings: { ...state.settings, soundEnabled: !state.settings.soundEnabled },
        })),
      
      toggleMusic: () =>
        set((state) => ({
          settings: { ...state.settings, musicEnabled: !state.settings.musicEnabled },
        })),
      
      toggleVibration: () =>
        set((state) => ({
          settings: { ...state.settings, vibrationEnabled: !state.settings.vibrationEnabled },
        })),

      // Progress
      progress: defaultProgress,
      
      completeLevel: (levelId, stars, hintsUsed) =>
        set((state) => {
          const completedLevels = state.progress.completedLevels.includes(levelId)
            ? state.progress.completedLevels
            : [...state.progress.completedLevels, levelId];
          
          const existingStars = state.progress.stars[levelId] || 0;
          const newStars = Math.max(existingStars, stars);
          
          return {
            progress: {
              ...state.progress,
              completedLevels,
              currentLevel: Math.max(state.progress.currentLevel, levelId + 1),
              totalHintsUsed: state.progress.totalHintsUsed + hintsUsed,
              stars: { ...state.progress.stars, [levelId]: newStars },
            },
          };
        }),
      
      resetProgress: () =>
        set({ progress: defaultProgress }),

      // Runtime state
      gameState: null,
      
      initLevel: (level: Level) =>
        set({
          gameState: {
            currentLevel: level.id,
            items: JSON.parse(JSON.stringify(level.items)), // Deep clone
            completedSteps: 0,
            hintsUsedThisLevel: 0,
            startTime: Date.now(),
            isPaused: false,
            isComplete: false,
            showingDialogue: false,
            currentDialogue: null,
          },
        }),
      
      updateGameState: (updates) =>
        set((state) => ({
          gameState: state.gameState ? { ...state.gameState, ...updates } : null,
        })),
      
      resetGameState: () => set({ gameState: null }),
    }),
    {
      name: 'brain-puzzle-storage',
      partialize: (state) => ({
        settings: state.settings,
        progress: state.progress,
      }),
    }
  )
);

// Selector hooks for better performance
export const useSettings = () => useGameStore((state) => state.settings);
export const useProgress = () => useGameStore((state) => state.progress);
export const useGameState = () => useGameStore((state) => state.gameState);
