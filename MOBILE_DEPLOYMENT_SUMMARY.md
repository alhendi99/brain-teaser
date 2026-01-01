# Complete Mobile App Deployment Guide
*Summary of all changes made during the deployment process*

## Overview
This guide documents the complete process of converting a Next.js web app to a mobile app using Capacitor and preparing it for Google Play Store deployment.

## Project Configuration Changes

### 1. Capacitor Installation and Setup

#### Install Dependencies
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
```

#### Initialize Capacitor
```bash
npx cap init "Fakker" "com.fakker.app" --web-dir=out
```

#### Capacitor Configuration (`capacitor.config.ts`)
```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fakker.app',
  appName: 'Fakker',
  webDir: 'out',
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false
  }
};

export default config;
```

### 2. Next.js Configuration Changes

#### Updated `next.config.mjs`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // Enable static export
  trailingSlash: true,        // Required for mobile
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,        // Required for static export
  },
}

export default nextConfig
```

### 3. Package.json Script Updates

#### Added Mobile Build Scripts
```json
{
  "scripts": {
    "build": "next build",
    "build:mobile": "next build && npx cap copy android",
    "build:mobile:android": "npm run build:mobile && npx cap copy android && npx cap open android",
    "build:apk": "cd android && ./gradlew assembleRelease",
    "build:release": "cd android && ./gradlew bundleRelease",
    "mobile:android": "npx cap open android",
    "dev": "next dev",
    "lint": "eslint .",
    "start": "next start"
  }
}
```

### 4. Android Platform Setup

#### Add Android Platform
```bash
npx cap add android
```

#### Key Android Files Created:
- `android/` - Complete Android project structure
- `android/app/build.gradle` - Main build configuration
- `android/variables.gradle` - SDK versions and dependencies
- `android/gradle.properties` - Gradle settings

## Production Build Configuration

### 1. Release Keystore Creation

#### Generate Production Keystore
```bash
keytool -genkey -v \
  -keystore android/app/fakker-release.keystore \
  -alias fakker \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass fakker123 \
  -keypass fakker123 \
  -dname "CN=Fakker, OU=Dev, O=Fakker Ltd, L=City, ST=State, C=US"
```

**⚠️ Security Notes:**
- Never commit keystore files to version control
- Use strong passwords in production
- Store keystore file securely - you'll need it for all future updates
- Consider using environment variables for passwords

### 2. Build.gradle Configuration

#### Main App Build Configuration (`android/app/build.gradle`)
```gradle
apply plugin: 'com.android.application'

android {
    namespace "com.fakker.app"
    compileSdk rootProject.ext.compileSdkVersion
    
    // Java compatibility (important for Capacitor)
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    
    defaultConfig {
        applicationId "com.fakker.app"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
        aaptOptions {
            ignoreAssetsPattern '!.svn:!.git:!.ds_store:!*.scc:.*:!CVS:!thumbs.db:!picasa.ini:!*~'
        }
    }
    
    // Production signing configuration
    signingConfigs {
        release {
            storeFile file('fakker-release.keystore')
            keyAlias 'fakker'
            keyPassword 'fakker123'
            storePassword 'fakker123'
        }
    }
    
    buildTypes {
        release {
            minifyEnabled true              // Enable code minification
            shrinkResources true            // Remove unused resources
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
            debuggable false
        }
    }
}

repositories {
    flatDir{
        dirs '../capacitor-cordova-android-plugins/src/main/libs', 'libs'
    }
}

// Resolve Kotlin stdlib conflicts (important for build success)
configurations.all {
    resolutionStrategy {
        force 'org.jetbrains.kotlin:kotlin-stdlib:1.8.22'
        force 'org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.8.22'
        force 'org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.8.22'
    }
}

dependencies {
    implementation fileTree(include: ['*.jar'], dir: 'libs')
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    implementation project(':capacitor-android')
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
    implementation project(':capacitor-cordova-android-plugins')
}

apply from: 'capacitor.build.gradle'
```

#### Gradle Properties Configuration (`android/gradle.properties`)
```properties
# Project-wide Gradle settings
org.gradle.jvmargs=-Xmx1536m
android.useAndroidX=true

# Java version compatibility (adjust path as needed)
org.gradle.java.home=/opt/homebrew/opt/openjdk@17
```

### 3. Java Version Compatibility Fixes

#### Files That Need Java Version Updates:
1. **`android/app/capacitor.build.gradle`** (auto-generated, may reset)
2. **`android/capacitor-cordova-android-plugins/build.gradle`**
3. **`node_modules/@capacitor/android/capacitor/build.gradle`** (if needed)

#### Update Java Version in Each File:
```gradle
compileOptions {
    sourceCompatibility JavaVersion.VERSION_17
    targetCompatibility JavaVersion.VERSION_17
}
```

## Build Process

### 1. Development Workflow

#### Build and Test
```bash
# Build web assets and sync with Android
npm run build:mobile

# Open in Android Studio for testing
npm run mobile:android
```

#### Development Testing
```bash
# Build debug APK for testing
cd android && ./gradlew assembleDebug
```

### 2. Production Build

#### Build Release AAB (Recommended for Play Store)
```bash
npm run build:release
```
- Output: `android/app/build/outputs/bundle/release/app-release.aab`
- Size: ~1.9MB (optimized)

#### Build Release APK (For Testing/Sideloading)
```bash
npm run build:apk
```
- Output: `android/app/build/outputs/apk/release/app-release.apk`
- Size: ~1.5MB (optimized)

### 3. Build Verification

#### Verify APK Signature
```bash
jarsigner -verify -verbose -certs android/app/build/outputs/apk/release/app-release.apk
```

#### Check Build Output
```bash
# Check AAB file
ls -la android/app/build/outputs/bundle/release/

# Check APK file
ls -la android/app/build/outputs/apk/release/
```

## Common Issues and Solutions

### 1. Java Version Conflicts
**Problem:** `error: invalid source release: 21`

**Solution:**
- Ensure Java 17 is installed and set in `JAVA_HOME`
- Update all gradle files to use `JavaVersion.VERSION_17`
- Set `org.gradle.java.home` in `gradle.properties`

### 2. Kotlin Dependency Conflicts
**Problem:** Duplicate Kotlin classes during build

**Solution:** Add resolution strategy in `build.gradle`:
```gradle
configurations.all {
    resolutionStrategy {
        force 'org.jetbrains.kotlin:kotlin-stdlib:1.8.22'
        force 'org.jetbrains.kotlin:kotlin-stdlib-jdk7:1.8.22'
        force 'org.jetbrains.kotlin:kotlin-stdlib-jdk8:1.8.22'
    }
}
```

### 3. Capacitor Platform Issues
**Problem:** Platform needs to be re-added after configuration changes

**Solution:**
```bash
# Remove and re-add Android platform
rm -rf android
npx cap add android
```

### 4. Build Failures
**Problem:** General build issues

**Solution:**
```bash
# Clean and rebuild
cd android && ./gradlew clean
cd android && ./gradlew assembleRelease
```

## Google Play Store Preparation

### 1. Required Assets
- **App Icon**: 512x512px high-resolution PNG
- **Feature Graphic**: 1024x500px PNG
- **Screenshots**: Minimum 2, various device sizes
- **Privacy Policy**: Required for all apps
- **App Description**: Short and full descriptions

### 2. App Store Listing Requirements
- Minimum SDK version compliance
- Target latest stable Android API
- Content rating completion
- Privacy policy URL
- App category selection

### 3. Upload Process
1. Create Google Play Console account ($25 one-time fee)
2. Create new app entry
3. Upload AAB file (preferred) or APK
4. Complete all required sections
5. Submit for review

## Version Management

### 1. Updating App Version
Update in `android/app/build.gradle`:
```gradle
defaultConfig {
    versionCode 2        // Increment for each release
    versionName "1.1"    // User-facing version
}
```

### 2. Update Workflow
1. Make app changes
2. Update version numbers
3. Build new release
4. Sign with same keystore
5. Upload to Play Console

## Security Best Practices

### 1. Keystore Management
- ✅ Store keystore file securely
- ✅ Use strong passwords
- ✅ Never commit to version control
- ✅ Create backups in multiple secure locations
- ✅ Use environment variables in CI/CD

### 2. Build Security
- ✅ Enable ProGuard for obfuscation
- ✅ Remove debug flags in production
- ✅ Verify signatures before distribution
- ✅ Test on real devices

## Quick Reference Commands

```bash
# Initial setup
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Your App" "com.yourapp.id" --web-dir=out
npx cap add android

# Development
npm run build:mobile
npm run mobile:android

# Production builds
npm run build:release  # AAB for Play Store
npm run build:apk     # APK for testing

# Maintenance
npx cap sync android   # Sync after config changes
cd android && ./gradlew clean  # Clean build cache
```

## Checklist for New Apps

- [ ] Install Capacitor dependencies
- [ ] Configure `capacitor.config.ts` with correct app ID
- [ ] Update `next.config.mjs` for static export
- [ ] Add build scripts to `package.json`
- [ ] Add Android platform
- [ ] Create production keystore
- [ ] Configure signing in `build.gradle`
- [ ] Fix Java version compatibility
- [ ] Add Kotlin dependency resolution
- [ ] Test debug build
- [ ] Build release AAB/APK
- [ ] Verify signing
- [ ] Prepare Play Store assets
- [ ] Create Play Console account
- [ ] Upload and submit

---

*This guide covers the complete mobile deployment process. Keep this document updated as you refine your deployment workflow.*