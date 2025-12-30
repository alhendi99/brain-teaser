'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MainMenu, LevelSelect, GameCanvas, SettingsScreen } from '@/components';
import { getLevelById, levels } from '@/levels';
import { useGameStore } from '@/lib/store';
import { Level } from '@/types/game';

type Screen = 'menu' | 'levels' | 'game' | 'settings';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('menu');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { settings, completeLevel } = useGameStore();
  const isRTL = settings.language === 'ar';

  // Initial loading
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Android back button handler
  useEffect(() => {
    const handleBackButton = () => {
      if (currentScreen === 'game') {
        // Show pause menu or go back to levels
        setCurrentScreen('levels');
        setSelectedLevel(null);
      } else if (currentScreen === 'levels' || currentScreen === 'settings') {
        setCurrentScreen('menu');
      }
      // On menu screen, let the system handle it (exit app)
    };

    window.addEventListener('androidBackButton', handleBackButton);
    return () => window.removeEventListener('androidBackButton', handleBackButton);
  }, [currentScreen]);

  // Handle level selection
  const handleSelectLevel = (levelId: number) => {
    const level = getLevelById(levelId);
    if (level) {
      setSelectedLevel(level);
      setCurrentScreen('game');
    }
  };

  // Handle level completion
  const handleLevelComplete = (stars: number) => {
    if (selectedLevel) {
      completeLevel(selectedLevel.id, stars, 3 - stars);
      
      // Auto-advance to next level if available
      const nextLevelId = selectedLevel.id + 1;
      const nextLevel = getLevelById(nextLevelId);
      
      if (nextLevel) {
        setSelectedLevel(nextLevel);
      } else {
        // No more levels, go back to level select
        setCurrentScreen('levels');
      }
    }
  };

  // Handle exit from game
  const handleExit = () => {
    setCurrentScreen('levels');
    setSelectedLevel(null);
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-game-dark via-game-medium to-game-light flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-8xl mb-8"
        >
          🧩
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-primary-500 rounded-full"
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <div className={isRTL ? 'rtl' : 'ltr'} dir={isRTL ? 'rtl' : 'ltr'}>
      <AnimatePresence mode="wait">
        {currentScreen === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MainMenu
              onPlay={() => setCurrentScreen('levels')}
              onSettings={() => setCurrentScreen('settings')}
            />
          </motion.div>
        )}

        {currentScreen === 'levels' && (
          <motion.div
            key="levels"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <LevelSelect
              onSelectLevel={handleSelectLevel}
              onBack={() => setCurrentScreen('menu')}
              isRTL={isRTL}
            />
          </motion.div>
        )}

        {currentScreen === 'game' && selectedLevel && (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GameCanvas
              level={selectedLevel}
              onComplete={handleLevelComplete}
              onExit={handleExit}
            />
          </motion.div>
        )}

        {currentScreen === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <SettingsScreen onBack={() => setCurrentScreen('menu')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
