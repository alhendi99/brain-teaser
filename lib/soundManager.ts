import { Howl, Howler } from 'howler';

class SoundManager {
  private sounds: Map<string, Howl> = new Map();
  private musicEnabled: boolean = true;
  private soundEnabled: boolean = true;
  private backgroundMusic: Howl | null = null;

  constructor() {
    this.preloadSounds();
  }

  private preloadSounds() {
    // Define all game sounds
    const soundDefinitions: Record<string, { src: string; volume?: number; loop?: boolean }> = {
      click: { src: './sounds/click.mp3', volume: 0.5 },
      correct: { src: './sounds/correct.mp3', volume: 0.7 },
      wrong: { src: './sounds/wrong.mp3', volume: 0.5 },
      complete: { src: './sounds/complete.mp3', volume: 0.8 },
      hint: { src: './sounds/hint.mp3', volume: 0.5 },
      drop: { src: './sounds/drop.mp3', volume: 0.6 },
      pickup: { src: './sounds/pickup.mp3', volume: 0.5 },
      swoosh: { src: './sounds/swoosh.mp3', volume: 0.4 },
      pop: { src: './sounds/pop.mp3', volume: 0.5 },
      star: { src: './sounds/star.mp3', volume: 0.6 },
      button: { src: './sounds/button.mp3', volume: 0.4 },
      bgMusic: { src: './sounds/background-music.mp3', volume: 0.3, loop: true },
    };

    // Create Howl instances for each sound
    Object.entries(soundDefinitions).forEach(([key, config]) => {
      const howl = new Howl({
        src: [config.src],
        volume: config.volume || 0.5,
        loop: config.loop || false,
        preload: true,
        html5: true, // Better for mobile
        onloaderror: () => {
          console.warn(`Failed to load sound: ${key}`);
        },
      });
      this.sounds.set(key, howl);
    });
  }

  play(soundName: string): void {
    if (!this.soundEnabled && soundName !== 'bgMusic') return;
    if (!this.musicEnabled && soundName === 'bgMusic') return;

    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.play();
    }
  }

  stop(soundName: string): void {
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.stop();
    }
  }

  playBackgroundMusic(): void {
    if (!this.musicEnabled) return;
    
    const bgMusic = this.sounds.get('bgMusic');
    if (bgMusic && !bgMusic.playing()) {
      bgMusic.play();
      this.backgroundMusic = bgMusic;
    }
  }

  stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.stop();
    }
  }

  pauseBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
    }
  }

  resumeBackgroundMusic(): void {
    if (this.backgroundMusic && this.musicEnabled) {
      this.backgroundMusic.play();
    }
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (!enabled) {
      this.stopBackgroundMusic();
    } else {
      this.playBackgroundMusic();
    }
  }

  setSoundEnabled(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  setMasterVolume(volume: number): void {
    Howler.volume(volume);
  }

  // Play a sequence of sounds
  playSequence(sounds: string[], delay: number = 200): void {
    sounds.forEach((sound, index) => {
      setTimeout(() => {
        this.play(sound);
      }, index * delay);
    });
  }

  // Vibrate device (if supported)
  vibrate(pattern: number | number[] = 50): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }
}

// Singleton instance
let soundManagerInstance: SoundManager | null = null;

export const getSoundManager = (): SoundManager => {
  if (!soundManagerInstance) {
    soundManagerInstance = new SoundManager();
  }
  return soundManagerInstance;
};

export default SoundManager;
