# EliteStocks TV Android

Tauri 2 + React + TypeScript IPTV player for authorized Xtream Codes subscriptions.

## Stack

- React + TypeScript + Vite
- Tauri 2 / Rust
- `tauri-plugin-http` for provider API calls without browser CORS
- Air Video / `tauri-plugin-video` with Android Media3/MediaCodec for native playback
- GitHub Actions on Ubuntu for APK builds

## Features

- Xtream Codes username/password login
- Live TV categories and channel grid
- Movies and categories
- Search
- Favorites / My List
- Short EPG for selected live channels
- Native Android playback
- Responsive Netflix-style dark UI
- APK artifact generated from the GitHub Actions tab

## Build from GitHub Actions

Open **Actions → Build EliteStocks TV Android APK → Run workflow**.

The workflow installs Java 17, Node.js 22, Android SDK/NDK, Rust Android targets, Tauri CLI, initializes the Android project, enables HTTP providers for Android, builds an installable debug APK, and uploads it as a workflow artifact.

## Local build

```bash
npm install
npx tauri icon src-tauri/icons/icon.svg
npx tauri android init
npm run android:build
```

The APK is emitted under `src-tauri/gen/android/app/build/outputs/apk/`.

## Xtream stream formats

Live playback uses the standard Xtream `/live/{username}/{password}/{stream_id}.ts` URL. Movies use `/movie/{username}/{password}/{stream_id}.{container_extension}`.

Only connect to IPTV services and streams you are legally authorized to access.
