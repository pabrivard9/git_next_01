import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nextdev01.app',
  appName: 'dev_next_01',
  webDir: 'public'
};

# Android
npx cap add android

# iOS (seulement sur macOS)
npx cap add ios

export default config;
