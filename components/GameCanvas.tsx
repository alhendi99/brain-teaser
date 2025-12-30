'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Level, GameItem, GameState, InteractiveZone } from '@/types/game';
import { GameEngine } from '@/lib/gameEngine';
import { useGameStore, useSettings } from '@/lib/store';
import HintModal from './HintModal';
import LevelCompleteModal from './LevelCompleteModal';
import PauseMenu from './PauseMenu';

interface GameCanvasProps {
  level: Level;
  onComplete: (stars: number) => void;
  onExit: () => void;
}

// Optimized animation variants - reduced complexity for mobile
const itemVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

// Memoized Draggable Item Component for performance
const DraggableItem = memo(function DraggableItem({
  item,
  onClick,
}: {
  item: GameItem;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    disabled: !item.draggable,
  });

  if (!item.visible) return null;

  const style: React.CSSProperties = useMemo(() => ({
    position: 'absolute',
    left: `${item.position.x}%`,
    top: `${item.position.y}%`,
    zIndex: isDragging ? 100 : item.zIndex,
    transform: CSS.Transform.toString(transform),
    opacity: item.opacity ?? 1,
    touchAction: 'none',
    willChange: isDragging ? 'transform' : 'auto',
  }), [item.position.x, item.position.y, item.zIndex, item.opacity, transform, isDragging]);

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`cursor-pointer select-none game-item ${isDragging ? 'scale-110' : ''}`}
      style={style}
      onClick={(e) => {
        if (!isDragging && item.clickable) {
          e.stopPropagation();
          onClick();
        }
      }}
      variants={itemVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      whileTap={item.draggable ? { scale: 0.95 } : undefined}
    >
      <img
        src={item.image}
        alt={item.name}
        className="w-auto h-auto max-w-[80px] max-h-[80px] md:max-w-[100px] md:max-h-[100px] pointer-events-none"
        draggable={false}
        loading="eager"
      />
    </motion.div>
  );
});

// Memoized Droppable Zone Component
const DroppableZone = memo(function DroppableZone({
  zone,
  isActive,
}: {
  zone: InteractiveZone;
  isActive: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: zone.id });

  if (zone.hidden) return null;

  return (
    <div
      ref={setNodeRef}
      className={`absolute rounded-lg transition-colors duration-150 ${
        isOver
          ? 'bg-green-400/30 border-2 border-green-400 border-dashed'
          : isActive
          ? 'bg-yellow-400/20 border-2 border-yellow-400/50 border-dashed'
          : 'border-2 border-transparent'
      }`}
      style={{
        left: `${zone.bounds.x}%`,
        top: `${zone.bounds.y}%`,
        width: `${zone.bounds.width}%`,
        height: `${zone.bounds.height}%`,
        willChange: isActive ? 'background-color, border-color' : 'auto',
      }}
    />
  );
});

// Measuring strategy for better performance
const measuringConfig = {
  droppable: {
    strategy: MeasuringStrategy.WhileDragging,
  },
};

export default function GameCanvas({ level, onComplete, onExit }: GameCanvasProps) {
  const { settings } = useGameStore();
  const { initLevel, updateGameState, gameState } = useGameStore();
  
  const [showHint, setShowHint] = useState(false);
  const [currentHintText, setCurrentHintText] = useState('');
  const [showComplete, setShowComplete] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [wrongAction, setWrongAction] = useState(false);
  const [correctAction, setCorrectAction] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [earnedStars, setEarnedStars] = useState(3);
  
  const engineRef = useRef<GameEngine | null>(null);

  // Optimized sensors for mobile - reduced activation delay
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced for faster response
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 50, // Reduced delay for snappier feel
        tolerance: 5,
      },
    })
  );

  // Initialize level
  useEffect(() => {
    initLevel(level);
  }, [level, initLevel]);

  // Initialize game engine when state is ready
  useEffect(() => {
    if (gameState) {
      engineRef.current = new GameEngine(level, gameState, {
        onStateChange: (newState) => updateGameState(newState),
        onLevelComplete: (hintsUsed) => {
          const stars = Math.max(1, 3 - hintsUsed);
          setEarnedStars(stars);
          setTimeout(() => setShowComplete(true), 500);
        },
        onWrongAction: () => {
          setWrongAction(true);
          // Vibrate on wrong action
          if (settings.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate([50, 30, 50]);
          }
          setTimeout(() => setWrongAction(false), 400);
        },
        onCorrectAction: () => {
          setCorrectAction(true);
          if (settings.vibrationEnabled && navigator.vibrate) {
            navigator.vibrate(30);
          }
          setTimeout(() => setCorrectAction(false), 300);
        },
      });
    }
  }, [gameState?.currentLevel]);

  // Handle drag start
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setIsDragging(true);
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;
    
    if (over && engineRef.current) {
      engineRef.current.handleItemDrop(active.id as string, over.id as string);
    }
  }, []);

  // Handle item click
  const handleItemClick = useCallback((itemId: string) => {
    if (!isDragging && engineRef.current) {
      engineRef.current.handleItemClick(itemId);
    }
  }, [isDragging]);

  // Handle hint request
  const handleHint = useCallback(() => {
    if (engineRef.current) {
      const hint = engineRef.current.getHint(settings.language);
      if (hint) {
        setCurrentHintText(hint);
        setShowHint(true);
      }
    }
  }, [settings.language]);

  // Handle level complete
  const handleCompleteClose = useCallback(() => {
    setShowComplete(false);
    onComplete(earnedStars);
  }, [earnedStars, onComplete]);

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-screen bg-game-dark">
        <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const isRTL = settings.language === 'ar';

  return (
    <div className={`relative w-full h-screen overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${level.background})` }}
      />
      
      {/* Gradient overlay for better visibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />

      {/* Wrong action flash */}
      <AnimatePresence>
        {wrongAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-500 pointer-events-none z-50"
          />
        )}
      </AnimatePresence>

      {/* Correct action flash */}
      <AnimatePresence>
        {correctAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-green-400 pointer-events-none z-50"
          />
        )}
      </AnimatePresence>

      {/* Game Area */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        measuring={measuringConfig}
      >
        {/* Droppable Zones */}
        {level.zones.map((zone) => (
          <DroppableZone
            key={zone.id}
            zone={zone}
            isActive={isDragging}
          />
        ))}

        {/* Items */}
        <AnimatePresence>
          {gameState.items.map((item) => (
            <DraggableItem
              key={item.id}
              item={item}
              onClick={() => handleItemClick(item.id)}
            />
          ))}
        </AnimatePresence>
      </DndContext>

      {/* Top UI Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-40">
        {/* Level Info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/60 backdrop-blur-sm rounded-2xl px-4 py-3 max-w-[60%]"
        >
          <h2 className="text-lg font-bold text-white">
            {isRTL ? `المستوى ${level.id}` : `Level ${level.id}`}
          </h2>
          <p className="text-sm text-white/80">
            {isRTL ? level.descriptionAr : level.description}
          </p>
        </motion.div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Pause Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowPause(true)}
            className="w-12 h-12 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl"
          >
            ⏸️
          </motion.button>

          {/* Hint Button */}
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleHint}
            className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-2xl shadow-lg animate-pulse-glow"
          >
            💡
          </motion.button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-4 left-4 right-4 z-40">
        <div className="bg-black/60 backdrop-blur-sm rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600"
            initial={{ width: 0 }}
            animate={{
              width: `${(gameState.completedSteps / level.solution.length) * 100}%`,
            }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
      </div>

      {/* Hint Modal */}
      <HintModal
        isOpen={showHint}
        hint={currentHintText}
        hintNumber={gameState.hintsUsedThisLevel}
        totalHints={level.hints.length}
        onClose={() => setShowHint(false)}
        isRTL={isRTL}
      />

      {/* Level Complete Modal */}
      <LevelCompleteModal
        isOpen={showComplete}
        stars={earnedStars}
        message={isRTL ? level.successMessageAr : level.successMessage}
        onNext={handleCompleteClose}
        onReplay={() => {
          setShowComplete(false);
          initLevel(level);
        }}
        isRTL={isRTL}
      />

      {/* Pause Menu */}
      <PauseMenu
        isOpen={showPause}
        onResume={() => setShowPause(false)}
        onRestart={() => {
          setShowPause(false);
          initLevel(level);
        }}
        onExit={onExit}
        isRTL={isRTL}
      />
    </div>
  );
}
