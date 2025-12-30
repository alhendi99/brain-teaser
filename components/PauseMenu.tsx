'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/lib/store';

interface PauseMenuProps {
  isOpen: boolean;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
  isRTL: boolean;
}

export default function PauseMenu({
  isOpen,
  onResume,
  onRestart,
  onExit,
  isRTL,
}: PauseMenuProps) {
  const { settings, toggleSound, toggleMusic, toggleVibration } = useGameStore();

  const menuItems = [
    {
      label: isRTL ? 'استمرار' : 'Resume',
      icon: '▶️',
      onClick: onResume,
      primary: true,
    },
    {
      label: isRTL ? 'إعادة' : 'Restart',
      icon: '🔄',
      onClick: onRestart,
    },
    {
      label: isRTL ? 'خروج' : 'Exit',
      icon: '🚪',
      onClick: onExit,
      danger: true,
    },
  ];

  const toggleItems = [
    {
      label: isRTL ? 'الصوت' : 'Sound',
      icon: settings.soundEnabled ? '🔊' : '🔇',
      enabled: settings.soundEnabled,
      onToggle: toggleSound,
    },
    {
      label: isRTL ? 'الموسيقى' : 'Music',
      icon: settings.musicEnabled ? '🎵' : '🎵',
      enabled: settings.musicEnabled,
      onToggle: toggleMusic,
    },
    {
      label: isRTL ? 'الاهتزاز' : 'Vibration',
      icon: '📳',
      enabled: settings.vibrationEnabled,
      onToggle: toggleVibration,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50"
            onClick={onResume}
          />

          {/* Menu */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl">
              {/* Title */}
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                {isRTL ? 'إيقاف مؤقت' : 'Paused'}
              </h2>

              {/* Settings toggles */}
              <div className="space-y-3 mb-6">
                {toggleItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={item.onToggle}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                      item.enabled
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </span>
                    <span
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        item.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          item.enabled ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </span>
                  </button>
                ))}
              </div>

              {/* Menu buttons */}
              <div className="space-y-3">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={item.onClick}
                    className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                      item.primary
                        ? 'bg-gradient-to-r from-primary-400 to-primary-600 text-white shadow-lg hover:shadow-xl'
                        : item.danger
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
