// Position on the game canvas (percentage-based for responsive design)
export interface Position {
  x: number; // 0-100 percentage
  y: number; // 0-100 percentage
}

// Bounds for interactive zones
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Game item (draggable objects, characters, etc.)
export interface GameItem {
  id: string;
  name: string;
  nameAr?: string;
  image: string;
  position: Position;
  draggable: boolean;
  clickable?: boolean;
  visible: boolean;
  zIndex: number;
  scale?: number;
  rotation?: number;
  opacity?: number;
  // Combination mechanics
  combinableWith?: string[];
  combineResult?: string;
  // State changes
  states?: Record<string, Partial<GameItem>>;
  currentState?: string;
}

// Interactive zones for dropping items or clicking
export interface InteractiveZone {
  id: string;
  bounds: Bounds;
  acceptsItems?: string[];
  onClick?: string; // Action ID to trigger
  onDrop?: string; // Action ID to trigger when item dropped
  hidden?: boolean;
  highlight?: boolean;
}

// Solution step types
export type ActionType = 'click' | 'drag' | 'combine' | 'sequence' | 'swipe' | 'hold' | 'shake';

export interface SolutionStep {
  action: ActionType;
  target?: string; // Item or zone ID
  destination?: string; // Zone ID for drag
  items?: string[]; // For combine action
  order?: string[]; // For sequence action
  direction?: 'left' | 'right' | 'up' | 'down'; // For swipe
  duration?: number; // For hold action (ms)
  // Effects when step is completed
  effects?: StepEffect[];
}

export interface StepEffect {
  type: 'show' | 'hide' | 'move' | 'transform' | 'sound' | 'dialogue' | 'changeState';
  target: string;
  value?: any;
}

// Dialogue for story elements
export interface Dialogue {
  character: string;
  characterAr?: string;
  text: string;
  textAr?: string;
  image?: string;
  position?: 'left' | 'right' | 'center';
}

// Complete level definition
export interface Level {
  id: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  background: string;
  items: GameItem[];
  zones: InteractiveZone[];
  solution: SolutionStep[];
  hints: string[];
  hintsAr: string[];
  dialogueIntro?: Dialogue[];
  dialogueSuccess?: Dialogue[];
  successMessage?: string;
  successMessageAr?: string;
  // Optional special mechanics
  timeLimit?: number; // Seconds
  allowShake?: boolean; // Device shake detection
  allowTilt?: boolean; // Device tilt detection
}

// Game progress and state
export interface GameProgress {
  completedLevels: number[];
  currentLevel: number;
  totalHintsUsed: number;
  stars: Record<number, number>; // levelId -> stars (1-3)
  totalPlayTime: number; // Seconds
  achievements: string[];
}

// Runtime game state
export interface GameState {
  currentLevel: number;
  items: GameItem[];
  completedSteps: number;
  hintsUsedThisLevel: number;
  startTime: number;
  isPaused: boolean;
  isComplete: boolean;
  showingDialogue: boolean;
  currentDialogue: Dialogue | null;
}

// Settings
export interface GameSettings {
  language: 'en' | 'ar';
  soundEnabled: boolean;
  musicEnabled: boolean;
  vibrationEnabled: boolean;
  showTutorial: boolean;
}

// Store state (Zustand)
export interface GameStore {
  // Settings
  settings: GameSettings;
  setLanguage: (lang: 'en' | 'ar') => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  toggleVibration: () => void;
  
  // Progress
  progress: GameProgress;
  completeLevel: (levelId: number, stars: number, hintsUsed: number) => void;
  resetProgress: () => void;
  
  // Runtime state
  gameState: GameState | null;
  initLevel: (level: Level) => void;
  updateGameState: (updates: Partial<GameState>) => void;
  resetGameState: () => void;
}
