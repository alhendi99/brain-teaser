'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/lib/store';

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const {
    settings,
    setLanguage,
    toggleSound,
    toggleMusic,
    toggleVibration,
    resetProgress,
  } = useGameStore();

  const isRTL = settings.language === 'ar';

  const settingItems = [
    {
      label: isRTL ? 'اللغة' : 'Language',
      icon: '🌐',
      type: 'select' as const,
      value: settings.language,
      options: [
        { value: 'en', label: 'English' },
        { value: 'ar', label: 'العربية' },
      ],
      onChange: (value: string) => setLanguage(value as 'en' | 'ar'),
    },
    {
      label: isRTL ? 'المؤثرات الصوتية' : 'Sound Effects',
      icon: settings.soundEnabled ? '🔊' : '🔇',
      type: 'toggle' as const,
      value: settings.soundEnabled,
      onToggle: toggleSound,
    },
    {
      label: isRTL ? 'الموسيقى' : 'Music',
      icon: '🎵',
      type: 'toggle' as const,
      value: settings.musicEnabled,
      onToggle: toggleMusic,
    },
    {
      label: isRTL ? 'الاهتزاز' : 'Vibration',
      icon: '📳',
      type: 'toggle' as const,
      value: settings.vibrationEnabled,
      onToggle: toggleVibration,
    },
  ];

  const handleResetProgress = () => {
    if (
      confirm(
        isRTL
          ? 'هل أنت متأكد؟ سيتم حذف كل تقدمك!'
          : 'Are you sure? All your progress will be lost!'
      )
    ) {
      resetProgress();
    }
  };

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
          {isRTL ? 'الإعدادات' : 'Settings'}
        </motion.h1>

        <div className="w-12" />
      </div>

      {/* Settings list */}
      <div className="max-w-md mx-auto space-y-4">
        {settingItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-white font-medium">{item.label}</span>
              </div>

              {item.type === 'toggle' && (
                <button
                  onClick={item.onToggle}
                  className={`w-14 h-8 rounded-full transition-colors relative ${
                    item.value ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform shadow ${
                      item.value ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              )}

              {item.type === 'select' && (
                <select
                  value={item.value}
                  onChange={(e) => item.onChange?.(e.target.value)}
                  className="bg-white/20 text-white rounded-lg px-3 py-2 outline-none"
                >
                  {item.options?.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      className="bg-gray-800 text-white"
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </motion.div>
        ))}

        {/* Danger zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-8 border-t border-white/10"
        >
          <h3 className="text-red-400 font-medium mb-4">
            {isRTL ? 'منطقة الخطر' : 'Danger Zone'}
          </h3>
          <button
            onClick={handleResetProgress}
            className="w-full py-3 bg-red-500/20 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition-colors"
          >
            {isRTL ? 'إعادة تعيين التقدم' : 'Reset Progress'}
          </button>
        </motion.div>

        {/* Credits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.6 }}
          className="text-center text-white/60 text-sm mt-8"
        >
          <p>{isRTL ? 'صُنع بـ ❤️' : 'Made with ❤️'}</p>
          <p className="mt-1">Brain Puzzle: Tricky Quest</p>
        </motion.div>
      </div>
    </div>
  );
}
