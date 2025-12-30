'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HintModalProps {
  isOpen: boolean;
  hint: string;
  hintNumber: number;
  totalHints: number;
  onClose: () => void;
  isRTL: boolean;
}

export default function HintModal({
  isOpen,
  hint,
  hintNumber,
  totalHints,
  onClose,
  isRTL,
}: HintModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4"
          >
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-1 shadow-2xl max-w-lg mx-auto">
              <div className="bg-white rounded-[22px] p-6">
                {/* Lightbulb icon */}
                <div className="flex justify-center -mt-12 mb-4">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-3xl shadow-lg animate-bounce-slow">
                    💡
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-center text-gray-800 mb-2">
                  {isRTL ? 'تلميح!' : 'Hint!'}
                </h3>

                {/* Hint counter */}
                <p className="text-sm text-center text-gray-500 mb-4">
                  {isRTL
                    ? `تلميح ${hintNumber} من ${totalHints}`
                    : `Hint ${hintNumber} of ${totalHints}`}
                </p>

                {/* Hint text */}
                <p className="text-lg text-center text-gray-700 mb-6 leading-relaxed">
                  {hint}
                </p>

                {/* Close button */}
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
                >
                  {isRTL ? 'فهمت!' : 'Got it!'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
