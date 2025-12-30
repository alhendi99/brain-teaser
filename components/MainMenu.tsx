'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';

interface MainMenuProps {
  onPlay: () => void;
  onSettings: () => void;
}

export default function MainMenu({ onPlay, onSettings }: MainMenuProps) {
  const { settings, setLanguage, progress } = useGameStore();
  const isRTL = settings.language === 'ar';

  const totalStars = Object.values(progress.stars).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-game-dark via-game-medium to-game-light flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-white/10 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Language toggle */}
      <motion.button
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 right-4 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white font-medium"
        onClick={() => setLanguage(settings.language === 'en' ? 'ar' : 'en')}
      >
        {settings.language === 'en' ? 'عربي' : 'English'}
      </motion.button>

      {/* Logo/Title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center mb-8"
      >
        {/* Game icon */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-8xl mb-4"
        >
          🧩
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
          {isRTL ? 'ألغاز ذكية' : 'Brain Puzzle'}
        </h1>
        <p className="text-xl text-white/80">
          {isRTL ? 'مغامرة الألغاز' : 'Tricky Quest'}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-6 mb-8"
      >
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
          <span className="text-xl">⭐</span>
          <span className="text-white font-bold">{totalStars}</span>
        </div>
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
          <span className="text-xl">🏆</span>
          <span className="text-white font-bold">{progress.completedLevels.length}</span>
        </div>
      </motion.div>

      {/* Menu buttons */}
      <div className="space-y-4 w-full max-w-xs">
        <motion.button
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPlay}
          className="w-full py-4 bg-gradient-to-r from-primary-400 to-primary-600 text-white text-xl font-bold rounded-2xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all flex items-center justify-center gap-3"
        >
          <span>▶️</span>
          {isRTL ? 'ابدأ اللعب' : 'Play'}
        </motion.button>

        <motion.button
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSettings}
          className="w-full py-4 bg-white/10 backdrop-blur-sm text-white text-xl font-bold rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center gap-3"
        >
          <span>⚙️</span>
          {isRTL ? 'الإعدادات' : 'Settings'}
        </motion.button>
      </div>

      {/* Version info */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.6 }}
        className="absolute bottom-4 text-white/50 text-sm"
      >
        v1.0.0
      </motion.p>
    </div>
  );
}
