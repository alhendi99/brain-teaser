// Cordova/Android specific optimizations
(function() {
  'use strict';

  // Wait for device ready
  document.addEventListener('deviceready', onDeviceReady, false);

  function onDeviceReady() {
    console.log('Cordova device ready');

    // Android-specific optimizations
    if (window.cordova && window.cordova.platformId === 'android') {
      applyAndroidOptimizations();
    }

    // iOS-specific optimizations
    if (window.cordova && window.cordova.platformId === 'ios') {
      applyIOSOptimizations();
    }

    // Hide splash screen after a delay
    if (navigator.splashscreen) {
      setTimeout(function() {
        navigator.splashscreen.hide();
      }, 500);
    }

    // Lock orientation to portrait
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('portrait').catch(function() {
        console.log('Orientation lock not supported');
      });
    }
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
      e.preventDefault();
      return false;
    });

    // Status bar configuration
    if (window.StatusBar) {
      StatusBar.styleBlackTranslucent();
      StatusBar.backgroundColorByHexString('#1a1a2e');
    }

    // Back button handling
    document.addEventListener('backbutton', function(e) {
      e.preventDefault();
      // Dispatch custom event for React to handle
      window.dispatchEvent(new CustomEvent('androidBackButton'));
    }, false);

    // Optimize WebView settings via Android
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

    // Status bar
    if (window.StatusBar) {
      StatusBar.styleBlackTranslucent();
    }

    console.log('iOS optimizations applied');
  }

  // Performance monitoring (dev only)
  if (process.env.NODE_ENV === 'development') {
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

  // Preload critical assets
  function preloadAssets() {
    var criticalImages = [
      './assets/backgrounds/bedroom.svg',
      './assets/characters/sleeping-man.svg',
      './assets/items/bucket.svg',
      './assets/items/alarm-clock.svg',
    ];

    criticalImages.forEach(function(src) {
      var img = new Image();
      img.src = src;
    });
  }

  // Start preloading on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadAssets);
  } else {
    preloadAssets();
  }
})();
