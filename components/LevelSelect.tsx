'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';
import { levels } from '@/levels';

interface LevelSelectProps {
  onSelectLevel: (levelId: number) => void;
  onBack: () => void;
  isRTL: boolean;
}

export default function LevelSelect({ onSelectLevel, onBack, isRTL }: LevelSelectProps) {
  const { progress } = useGameStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-game-dark via-game-medium to-game-light p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl"
        >
          {isRTL ? '→' : '←'}
        </motion.button>

        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white"
        >
          {isRTL ? 'اختر المستوى' : 'Select Level'}
        </motion.h1>

        <div className="w-12" /> {/* Spacer for alignment */}
      </div>

      {/* Total Stars */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3">
          <span className="text-2xl">⭐</span>
          <span className="text-xl font-bold text-white">
            {Object.values(progress.stars).reduce((a, b) => a + b, 0)} / {levels.length * 3}
          </span>
        </div>
      </motion.div>

      {/* Level Grid */}
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        {levels.map((level, index) => {
          const isUnlocked =
            level.id === 1 || progress.completedLevels.includes(level.id - 1);
          const isCompleted = progress.completedLevels.includes(level.id);
          const stars = progress.stars[level.id] || 0;

          return (
            <motion.button
              key={level.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={isUnlocked ? { scale: 1.05 } : {}}
              whileTap={isUnlocked ? { scale: 0.95 } : {}}
              onClick={() => isUnlocked && onSelectLevel(level.id)}
              disabled={!isUnlocked}
              className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all ${
                isUnlocked
                  ? isCompleted
                    ? 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-lg shadow-green-500/30'
                    : 'bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/30'
                  : 'bg-gray-600/50 cursor-not-allowed'
              }`}
            >
              {/* Level number or lock */}
              {isUnlocked ? (
                <span className="text-3xl font-bold text-white">{level.id}</span>
              ) : (
                <span className="text-3xl">🔒</span>
              )}

              {/* Stars */}
              {isCompleted && (
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3].map((star) => (
                    <span
                      key={star}
                      className={`text-sm ${
                        star <= stars ? 'text-yellow-300' : 'text-white/30'
                      }`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              )}

              {/* Current level indicator */}
              {level.id === progress.currentLevel && !isCompleted && isUnlocked && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
                >
                  !
                </motion.div>
              )}
            </motion.button>
          );
        })}

        {/* Coming soon placeholders */}
        {[...Array(Math.max(0, 9 - levels.length))].map((_, i) => (
          <motion.div
            key={`placeholder-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: (levels.length + i) * 0.05 }}
            className="aspect-square rounded-2xl bg-gray-700/30 flex items-center justify-center"
          >
            <span className="text-2xl text-gray-500">?</span>
          </motion.div>
        ))}
      </div>

      {/* Progress info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-8 text-white/60"
      >
        {isRTL
          ? `أكملت ${progress.completedLevels.length} من ${levels.length} مستوى`
          : `Completed ${progress.completedLevels.length} of ${levels.length} levels`}
      </motion.div>
    </div>
  );
}
