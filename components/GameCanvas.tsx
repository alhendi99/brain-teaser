'use client';

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
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
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Level, GameItem, InteractiveZone } from '@/types/game';
import { GameEngine } from '@/lib/gameEngine';
import { useGameStore } from '@/lib/store';
import HintModal from './HintModal';
import LevelCompleteModal from './LevelCompleteModal';
import PauseMenu from './PauseMenu';

interface GameCanvasProps {
  level: Level;
  onComplete: (stars: number) => void;
  onExit: () => void;
}

// Draggable Item Component
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

  const [imageError, setImageError] = useState(false);

  if (!item.visible) return null;

  // Calculate the combined transform
  let transformValue = 'translate(-50%, -50%)'; // Center on position point
  
  if (transform) {
    transformValue += ` translate(${transform.x}px, ${transform.y}px)`;
  }
  
  if (isDragging) {
    transformValue += ' scale(1.1)';
  } else if (item.scale && item.scale !== 1) {
    transformValue += ` scale(${item.scale})`;
  }
  
  if (item.rotation) {
    transformValue += ` rotate(${item.rotation}deg)`;
  }

  return (
    <motion.div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: item.opacity ?? 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={(e) => {
        if (!isDragging && (item.clickable || !item.draggable)) {
          e.stopPropagation();
          onClick();
        }
      }}
      style={{
        position: 'absolute',
        left: `${item.position.x}%`,
        top: `${item.position.y}%`,
        zIndex: isDragging ? 1000 : (item.zIndex || 1),
        transform: transformValue,
        cursor: item.draggable ? (isDragging ? 'grabbing' : 'grab') : (item.clickable ? 'pointer' : 'default'),
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    >
      {imageError ? (
        <div 
          className="bg-red-500/80 text-white p-2 rounded text-xs whitespace-nowrap"
          style={{ fontSize: '10px' }}
        >
          ❌ {item.id}
        </div>
      ) : (
        <img
          src={item.image}
          alt={item.name}
          onError={() => {
            console.error(`Failed to load: ${item.image}`);
            setImageError(true);
          }}
          draggable={false}
          style={{
            display: 'block',
            // Set explicit dimensions for SVG - use min to ensure visibility
            minWidth: '40px',
            minHeight: '40px',
            // Responsive sizing using clamp for max
            width: 'clamp(60px, 15vw, 120px)',
            height: 'auto',
            maxWidth: 'clamp(60px, 18vw, 140px)',
            maxHeight: 'clamp(60px, 18vh, 140px)',
            // Maintain natural aspect ratio
            objectFit: 'contain',
            // Disable pointer events on image
            pointerEvents: 'none',
          } as React.CSSProperties}
        />
      )}
    </motion.div>
  );
});

// Droppable Zone Component  
const DroppableZone = memo(function DroppableZone({
  zone,
  isActive,
  debug,
}: {
  zone: InteractiveZone;
  isActive: boolean;
  debug?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: zone.id });

  if (zone.hidden && !debug) return null;

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'absolute',
        left: `${zone.bounds.x}%`,
        top: `${zone.bounds.y}%`,
        width: `${zone.bounds.width}%`,
        height: `${zone.bounds.height}%`,
        borderRadius: '8px',
        transition: 'all 0.2s ease',
        // backgroundColor: isOver 
        //   ? 'rgba(74, 222, 128, 0.4)' 
        //   : isActive 
        //   ? 'rgba(250, 204, 21, 0.2)' 
        //   : 'transparent',
        // border: isOver 
        //   ? '2px solid rgba(74, 222, 128, 0.8)' 
        //   : isActive 
        //   ? '2px dashed rgba(250, 204, 21, 0.5)' 
        //   : debug 
        //   ? '1px dashed rgba(100, 100, 255, 0.5)'
        //   : 'none',
      }}
    >
      {debug && (
        <span className="absolute top-0 left-0 text-[10px] text-blue-400 bg-black/50 px-1 rounded">
          {zone.id}
        </span>
      )}
    </div>
  );
});

export default function GameCanvas({ level, onComplete, onExit }: GameCanvasProps) {
  const { settings, initLevel, updateGameState, gameState } = useGameStore();
  
  const [showHint, setShowHint] = useState(false);
  const [currentHintText, setCurrentHintText] = useState('');
  const [showComplete, setShowComplete] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [wrongAction, setWrongAction] = useState(false);
  const [correctAction, setCorrectAction] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [earnedStars, setEarnedStars] = useState(3);
  const [debug, setDebug] = useState(false);
  
  const engineRef = useRef<GameEngine | null>(null);

  // Touch-optimized sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 8 },
    })
  );

  // Initialize level
  useEffect(() => {
    console.log('[GameCanvas] Initializing level:', level.id, level.title);
    console.log('[GameCanvas] Items count:', level.items.length);
    level.items.forEach(item => {
      console.log(`  - ${item.id}: visible=${item.visible}, image=${item.image}`);
    });
    initLevel(level);
  }, [level, initLevel]);

  // Initialize game engine
  useEffect(() => {
    if (gameState && gameState.currentLevel === level.id) {
      console.log('[GameCanvas] Game state ready');
      console.log('[GameCanvas] State items:', gameState.items.length);
      
      engineRef.current = new GameEngine(level, gameState, {
        onStateChange: (newState) => updateGameState(newState),
        onLevelComplete: (hintsUsed) => {
          const stars = Math.max(1, 3 - hintsUsed);
          setEarnedStars(stars);
          setTimeout(() => setShowComplete(true), 2000);
        },
        onWrongAction: () => {
          setWrongAction(true);
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
  }, [gameState?.currentLevel, level.id]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setIsDragging(false);
    const { active, over } = event;
    if (over && engineRef.current) {
      engineRef.current.handleItemDrop(active.id as string, over.id as string);
    }
  }, []);

  const handleItemClick = useCallback((itemId: string) => {
    if (!isDragging && engineRef.current) {
      engineRef.current.handleItemClick(itemId);
    }
  }, [isDragging]);

  const handleHint = useCallback(() => {
    if (engineRef.current) {
      const hint = engineRef.current.getHint(settings.language);
      if (hint) {
        setCurrentHintText(hint);
        setShowHint(true);
      }
    }
  }, [settings.language]);

  const handleCompleteClose = useCallback(() => {
    setShowComplete(false);
    onComplete(earnedStars);
  }, [earnedStars, onComplete]);

  // Loading state
  if (!gameState || gameState.currentLevel !== level.id) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-game-dark to-game-medium">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-white/60">Loading level {level.id}...</p>
        </div>
      </div>
    );
  }

  const isRTL = settings.language === 'ar';
  const visibleItems = gameState.items.filter(item => item.visible);
  
  // Debug log
  console.log('[GameCanvas] Rendering with', visibleItems.length, 'visible items');
  visibleItems.forEach(i => console.log(`  ${i.id}: pos(${i.position.x}, ${i.position.y}) img=${i.image}`));

  return (
    <div 
      className={`fixed inset-0 overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}
      style={{ touchAction: 'none' }}
    >
      {/* Background - Responsive full screen */}
      <div
        style={{ 
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${level.background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      
      {/* Overlay gradient */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.3) 100%)',
          pointerEvents: 'none',
        }}
      />

      {/* Action flashes */}
      <AnimatePresence>
        {wrongAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#ef4444',
              pointerEvents: 'none',
              zIndex: 100,
            }}
          />
        )}
        {correctAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: '#4ade80',
              pointerEvents: 'none',
              zIndex: 100,
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Game Area - This div establishes the positioning context */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: 'hidden',
        }}
      >
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* Drop zones - positioned relative to this container */}
          {level.zones.map((zone) => (
            <DroppableZone
              key={zone.id}
              zone={zone}
              isActive={isDragging}
              debug={debug}
            />
          ))}

          {/* Game items - positioned relative to this container */}
          <AnimatePresence mode="sync">
            {visibleItems.map((item) => (
              <DraggableItem
                key={item.id}
                item={item}
                onClick={() => handleItemClick(item.id)}
              />
            ))}
          </AnimatePresence>
        </DndContext>
      </div>

      {/* Top UI */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '12px',
          paddingTop: 'max(12px, env(safe-area-inset-top))',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        {/* Level info */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            borderRadius: '12px',
            padding: '8px 12px',
            maxWidth: '60%',
            pointerEvents: 'auto',
          }}
        >
          <h2 style={{ 
            fontSize: 'clamp(14px, 4vw, 18px)', 
            fontWeight: 'bold', 
            color: 'white',
            margin: 0,
          }}>
            {isRTL ? `المستوى ${level.id}` : `Level ${level.id}`}
          </h2>
          <p style={{ 
            fontSize: 'clamp(11px, 3vw, 14px)', 
            color: 'rgba(255,255,255,0.8)',
            margin: '4px 0 0 0',
          }}>
            {isRTL ? level.descriptionAr : level.description}
          </p>
        </motion.div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
          {/* Debug button (dev only) */}
          {typeof window !== 'undefined' && (
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDebug(!debug)}
              style={{
                width: 'clamp(36px, 10vw, 48px)',
                height: 'clamp(36px, 10vw, 48px)',
                background: debug ? 'rgba(168,85,247,0.8)' : 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(8px)',
                borderRadius: '50%',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'clamp(14px, 4vw, 20px)',
                cursor: 'pointer',
              }}
            >
              🐛
            </motion.button>
          )}
          
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowPause(true)}
            style={{
              width: 'clamp(36px, 10vw, 48px)',
              height: 'clamp(36px, 10vw, 48px)',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: '50%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(14px, 4vw, 20px)',
              cursor: 'pointer',
            }}
          >
            ⏸️
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleHint}
            style={{
              width: 'clamp(36px, 10vw, 48px)',
              height: 'clamp(36px, 10vw, 48px)',
              background: '#eab308',
              borderRadius: '50%',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'clamp(14px, 4vw, 20px)',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(234,179,8,0.4)',
            }}
          >
            💡
          </motion.button>
        </div>
      </div>

      {/* Bottom progress bar */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          zIndex: 50,
        }}
      >
        <div style={{
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          borderRadius: '999px',
          height: '8px',
          overflow: 'hidden',
        }}>
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(to right, #fb923c, #ea580c)',
              borderRadius: '999px',
            }}
            initial={{ width: 0 }}
            animate={{
              width: `${(gameState.completedSteps / level.solution.length) * 100}%`,
            }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
        
        {/* Debug panel */}
        {debug && (
          <div style={{
            marginTop: '8px',
            background: 'rgba(0,0,0,0.85)',
            borderRadius: '8px',
            padding: '8px',
            fontSize: '11px',
            color: 'white',
            fontFamily: 'monospace',
          }}>
            <div>Level: {level.id} | Items: {gameState.items.length} | Visible: {visibleItems.length}</div>
            <div>Steps: {gameState.completedSteps}/{level.solution.length} | Hints: {gameState.hintsUsedThisLevel}</div>
            <div style={{ marginTop: '4px', fontSize: '10px', color: '#9ca3af' }}>
              {visibleItems.map(i => `${i.id}(${i.position.x},${i.position.y})`).join(' | ')}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <HintModal
        isOpen={showHint}
        hint={currentHintText}
        hintNumber={gameState.hintsUsedThisLevel}
        totalHints={level.hints.length}
        onClose={() => setShowHint(false)}
        isRTL={isRTL}
      />

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