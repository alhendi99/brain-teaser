# 🧩 Brain Puzzle: Tricky Quest

A creative puzzle game built with Next.js and Cordova for deployment on Google Play Store. Challenge your mind with tricky solutions that require thinking outside the box!

## 📱 Features

- **150+ Levels** (expandable) with creative "think outside the box" solutions
- **Drag & Drop** mechanics with smooth touch support
- **Bilingual Support** - English and Arabic (RTL)
- **Hint System** - Progressive hints for stuck players
- **Star Rating** - 1-3 stars based on hints used
- **Progress Saving** - Local storage persistence
- **Sound Effects** - Immersive audio feedback
- **Animations** - Smooth Framer Motion animations
- **Mobile First** - Optimized for touch devices
- **PWA Support** - Installable on devices
- **Cordova Ready** - Build for Android/iOS

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Android Studio (for Cordova builds)
- Java JDK 11+

### Installation

```bash
# Clone or extract the project
cd brain-puzzle-game

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
brain-puzzle-game/
├── app/                    # Next.js App Router
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main game page
├── components/             # React components
│   ├── GameCanvas.tsx      # Main game renderer
│   ├── HintModal.tsx       # Hint display
│   ├── LevelCompleteModal.tsx
│   ├── LevelSelect.tsx     # Level selection grid
│   ├── MainMenu.tsx        # Home screen
│   ├── PauseMenu.tsx       # In-game pause
│   └── SettingsScreen.tsx  # Game settings
├── levels/                 # Level definitions
│   ├── level-1.ts          # Wake Up puzzle
│   ├── level-2.ts          # Hungry Cat puzzle
│   ├── level-3.ts          # Cross the River
│   ├── level-4.ts          # Stop the Thief
│   ├── level-5.ts          # Baby Blues
│   └── index.ts            # Level exports
├── lib/                    # Utilities
│   ├── gameEngine.ts       # Core game logic
│   ├── soundManager.ts     # Audio handling
│   └── store.ts            # Zustand state
├── types/                  # TypeScript types
│   └── game.ts             # Game type definitions
├── public/                 # Static assets
│   ├── assets/
│   │   ├── backgrounds/    # Level backgrounds
│   │   ├── characters/     # Character sprites
│   │   └── items/          # Interactive items
│   ├── sounds/             # Audio files
│   └── manifest.json       # PWA manifest
├── cordova/                # Cordova wrapper
│   ├── config.xml          # Cordova config
│   ├── www/                # Build output
│   └── res/                # Icons & splashes
└── package.json
```

## 🎮 Creating New Levels

### Level Structure

```typescript
const newLevel: Level = {
  id: 6,
  title: "Level Title",
  titleAr: "عنوان المستوى",
  description: "What the player needs to do",
  descriptionAr: "الوصف بالعربية",
  background: "./assets/backgrounds/scene.svg",
  items: [
    {
      id: "item_id",
      name: "Item Name",
      nameAr: "اسم العنصر",
      image: "./assets/items/item.svg",
      position: { x: 50, y: 50 }, // Percentage
      draggable: true,
      visible: true,
      zIndex: 1,
    },
  ],
  zones: [
    {
      id: "drop_zone",
      bounds: { x: 20, y: 40, width: 30, height: 30 },
      acceptsItems: ["item_id"],
    },
  ],
  solution: [
    {
      action: 'drag',
      target: 'item_id',
      destination: 'drop_zone',
      effects: [
        { type: 'hide', target: 'item_id' },
        { type: 'sound', target: 'correct', value: null },
      ],
    },
  ],
  hints: [
    "First hint...",
    "Second hint...",
    "Final hint revealing the trick!",
  ],
  hintsAr: ["تلميح أول...", "تلميح ثاني...", "تلميح أخير!"],
  successMessage: "You did it! 🎉",
  successMessageAr: "أحسنت! 🎉",
};
```

### Action Types

- `click` - Tap an item or zone
- `drag` - Drag item to destination
- `combine` - Merge two items together
- `sequence` - Complete actions in order
- `swipe` - Swipe gesture on item

### Effect Types

- `show` / `hide` - Toggle visibility
- `move` - Change position
- `transform` - Modify properties
- `changeState` - Switch item state
- `sound` - Play sound effect

## 🔨 Building for Android

### 1. Build Next.js Static Export

```bash
npm run build
```

### 2. Setup Cordova (First Time)

```bash
# Install Cordova globally
npm install -g cordova

# Navigate to cordova folder
cd cordova

# Add Android platform
cordova platform add android

# Install required plugins
cordova plugin add cordova-plugin-statusbar
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-device
cordova plugin add cordova-plugin-screen-orientation
```

### 3. Build APK

```bash
# From project root
npm run build:cordova

# Or for release build
npm run build:cordova:release
```

The APK will be at: `cordova/platforms/android/app/build/outputs/apk/`

### 4. Sign Release APK

```bash
# Generate keystore (first time only)
keytool -genkey -v -keystore brain-puzzle.keystore -alias brainpuzzle -keyalg RSA -keysize 2048 -validity 10000

# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore brain-puzzle.keystore app-release-unsigned.apk brainpuzzle

# Optimize with zipalign
zipalign -v 4 app-release-unsigned.apk brain-puzzle.apk
```

## 🎨 Adding Assets

### SVG Guidelines

- Use viewBox for scalability
- Keep file sizes small
- Use simple shapes when possible
- Test on different screen sizes

### Character States

Characters can have multiple states:
```typescript
states: {
  default: {},
  happy: { image: "./character-happy.svg" },
  sad: { image: "./character-sad.svg" },
}
```

### Sound Files

Add MP3 files to `public/sounds/`:
- `click.mp3` - UI clicks
- `correct.mp3` - Correct action
- `wrong.mp3` - Wrong action
- `complete.mp3` - Level complete
- `hint.mp3` - Hint reveal
- `background-music.mp3` - BGM loop

## 🌐 Localization

The game supports English and Arabic:

1. All user-facing strings have `Ar` variants
2. RTL layout automatically applied for Arabic
3. Font families switch based on language
4. Add translations in level definitions

## 📊 AdMob Integration

1. Update `cordova/config.xml` with your AdMob App ID
2. Install AdMob plugin:
   ```bash
   cordova plugin add cordova-plugin-admob-free
   ```
3. Initialize ads in your app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add new levels or features
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational purposes. Game concept inspired by "Brain Puzzle: Tricky Quest".

## 🙏 Credits

- Built with [Next.js](https://nextjs.org/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Drag & Drop by [@dnd-kit](https://dndkit.com/)
- State Management by [Zustand](https://zustand-demo.pmnd.rs/)
- Audio by [Howler.js](https://howlerjs.com/)
- Mobile wrapper by [Apache Cordova](https://cordova.apache.org/)

---

Made with ❤️ by Hendi
