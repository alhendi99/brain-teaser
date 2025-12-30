'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LevelCompleteModalProps {
  isOpen: boolean;
  stars: number;
  message?: string;
  onNext: () => void;
  onReplay: () => void;
  isRTL: boolean;
}

export default function LevelCompleteModal({
  isOpen,
  stars,
  message,
  onNext,
  onReplay,
  isRTL,
}: LevelCompleteModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* Confetti effect */}
          <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'][
                    Math.floor(Math.random() * 5)
                  ],
                }}
                initial={{ y: -20, opacity: 1, rotate: 0 }}
                animate={{
                  y: window?.innerHeight || 800,
                  opacity: 0,
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 0.5,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl p-1 shadow-2xl max-w-sm w-full">
              <div className="bg-white rounded-[22px] p-8 text-center">
                {/* Trophy icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="text-6xl mb-4"
                >
                  🏆
                </motion.div>

                {/* Title */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-gray-800 mb-2"
                >
                  {isRTL ? 'أحسنت!' : 'Well Done!'}
                </motion.h2>

                {/* Stars */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex justify-center gap-2 mb-4"
                >
                  {[1, 2, 3].map((star) => (
                    <motion.span
                      key={star}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{
                        scale: star <= stars ? 1 : 0.5,
                        rotate: 0,
                      }}
                      transition={{
                        delay: 0.5 + star * 0.15,
                        type: 'spring',
                        stiffness: 200,
                      }}
                      className={`text-4xl ${
                        star <= stars ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </motion.span>
                  ))}
                </motion.div>

                {/* Message */}
                {message && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-gray-600 mb-6"
                  >
                    {message}
                  </motion.p>
                )}

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="flex gap-3"
                >
                  <button
                    onClick={onReplay}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🔄</span>
                    {isRTL ? 'إعادة' : 'Replay'}
                  </button>
                  <button
                    onClick={onNext}
                    className="flex-1 py-3 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                  >
                    {isRTL ? 'التالي' : 'Next'}
                    <span>▶️</span>
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
