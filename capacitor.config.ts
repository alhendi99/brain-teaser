import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.hendi.brainpuzzle',
  appName: 'Brain Puzzle',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    minSdkVersion: 24,
    compileSdkVersion: 34,
    targetSdkVersion: 34
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a2e",
      showSpinner: false
    },
    StatusBar: {
      style: 'light',
      backgroundColor: "#1a1a2e",
      overlay: false
    }
  }
};

export default config;
