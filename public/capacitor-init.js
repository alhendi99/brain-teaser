// Capacitor initialization for Brain Puzzle Game
// This file should be loaded after Capacitor core script

(function() {
  'use strict';

  // Wait for Capacitor to be ready
  document.addEventListener('DOMContentLoaded', onCapacitorReady, false);
  
  async function onCapacitorReady() {
    console.log('Capacitor initialization starting...');

    // Check if we're in a native app
    if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
      
      // Platform-specific setup
      if (window.Capacitor.getPlatform() === 'android') {
        console.log('Initializing Android-specific features');
        await initializeAndroidFeatures();
      }
      
      if (window.Capacitor.getPlatform() === 'ios') {
        console.log('Initializing iOS-specific features');
        await initializeiOSFeatures();
      }
      
      // Common mobile features
      await initializeMobileFeatures();
    } else {
      console.log('Running in browser mode');
      initializeBrowserFeatures();
    }
  }

  async function initializeMobileFeatures() {
    try {
      // Lock screen orientation to portrait
      if (window.CapacitorScreenOrientation) {
        await window.CapacitorScreenOrientation.lock({ orientation: 'portrait' });
        console.log('Screen orientation locked to portrait');
      }
    } catch (error) {
      console.log('Could not lock screen orientation:', error);
    }

    try {
      // Configure status bar
      if (window.CapacitorStatusBar) {
        await window.CapacitorStatusBar.setStyle({ style: 'LIGHT' });
        await window.CapacitorStatusBar.setBackgroundColor({ color: '#1a1a2e' });
        await window.CapacitorStatusBar.hide();
        console.log('Status bar configured');
      }
    } catch (error) {
      console.log('Could not configure status bar:', error);
    }

    // Setup app optimizations
    setupAppOptimizations();
    
    // Hide splash screen after initialization
    try {
      if (window.CapacitorSplashScreen) {
        setTimeout(async () => {
          await window.CapacitorSplashScreen.hide();
          console.log('Splash screen hidden');
        }, 1000);
      }
    } catch (error) {
      console.log('Could not hide splash screen:', error);
    }
  }

  async function initializeAndroidFeatures() {
    try {
      // Android-specific optimizations
      applyAndroidOptimizations();
      
      // Back button handling
      document.addEventListener('backbutton', function(e) {
        e.preventDefault();
        // Dispatch custom event for React to handle
        window.dispatchEvent(new CustomEvent('androidBackButton'));
      }, false);
      
      console.log('Android features initialized');
    } catch (error) {
      console.log('Android initialization error:', error);
    }
  }

  async function initializeiOSFeatures() {
    try {
      // iOS-specific optimizations
      applyIOSOptimizations();
      console.log('iOS features initialized');
    } catch (error) {
      console.log('iOS initialization error:', error);
    }
  }

  function initializeBrowserFeatures() {
    // Browser-specific features for development
    console.log('Browser features initialized for development');
    
    // Apply basic optimizations for development
    applyAndroidOptimizations();
  }

  function applyAndroidOptimizations() {
    // Enable hardware acceleration hints
    document.body.style.transform = 'translateZ(0)';
    document.body.style.webkitTransform = 'translateZ(0)';

    // Disable overscroll glow effect
    document.body.style.overscrollBehavior = 'none';

    // Improve touch responsiveness
    document.addEventListener('touchstart', function() {}, { passive: true });
    document.addEventListener('touchmove', function() {}, { passive: true });

    // Prevent context menu on long press
    document.addEventListener('contextmenu', function(e) {
      if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
        e.preventDefault();
        return false;
      }
    });

    // Prevent selection on mobile
    document.addEventListener('selectstart', function(e) {
      if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
        e.preventDefault();
      }
    });

    console.log('Android optimizations applied');
  }

  function applyIOSOptimizations() {
    // Prevent bounce scroll
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';

    // Safe area handling
    document.body.style.paddingTop = 'env(safe-area-inset-top)';
    document.body.style.paddingBottom = 'env(safe-area-inset-bottom)';

    console.log('iOS optimizations applied');
  }

  function setupAppOptimizations() {
    // App lifecycle event listeners
    document.addEventListener('pause', function() {
      console.log('App paused');
    });
    
    document.addEventListener('resume', function() {
      console.log('App resumed');
    });

    // Preload critical assets
    preloadAssets();
  }

  function preloadAssets() {
    var criticalImages = [
      './assets/backgrounds/bedroom.svg',
      './assets/characters/sleeping-man.svg', 
      './assets/items/bucket.svg',
      './assets/items/alarm-clock.svg'
    ];

    criticalImages.forEach(function(src) {
      var img = new Image();
      img.src = src;
    });
  }

  // Performance monitoring (dev only)
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
    var frameCount = 0;
    var lastTime = performance.now();

    function measureFPS() {
      frameCount++;
      var currentTime = performance.now();
      if (currentTime - lastTime >= 1000) {
        console.log('FPS:', frameCount);
        frameCount = 0;
        lastTime = currentTime;
      }
      requestAnimationFrame(measureFPS);
    }
    // Uncomment to enable FPS monitoring
    // requestAnimationFrame(measureFPS);
  }

  // Export for global access
  window.CapacitorInit = {
    initializeMobileFeatures: initializeMobileFeatures,
    setupAppOptimizations: setupAppOptimizations
  };

})();